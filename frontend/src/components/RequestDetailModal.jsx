import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Calendar, 
  FileText, 
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Download
} from 'lucide-react';
import { processRequest } from '../api/coordinator';
import { useAuth } from '../context/AuthContext';
import { getFileUrl } from '../utils/fileUrl';

const RequestDetailModal = ({ request, isOpen, onOpenChange }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [showReasonBox, setShowReasonBox] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);

  const mutation = useMutation({
    mutationFn: ({ action, data }) => processRequest(user.role, request.id, action, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingRequests']);
      onOpenChange(false);
    },
    onError: (err) => {
      alert(err.response?.data?.error || "Action failed");
    }
  });

  const handleAction = (action) => {
    if (action === 'approve') {
      const isSpecialOD = request.leaveType === 'SPECIAL_OD';
      const isYearCoord = user?.role === 'YEAR_COORD';
      
      let confirmMsg = "Are you sure you want to approve this request?";
      
      if (isYearCoord) {
        if (isSpecialOD) {
          confirmMsg = "You are about to Approve & Forward this Special OD request to the Chairperson for final review. Continue?";
        } else {
          confirmMsg = "You are about to give FINAL APPROVAL for this request. This will update the student's leave balance and sync the record to Google Drive. Continue?";
        }
      }

      if (window.confirm(confirmMsg)) {
        mutation.mutate({ action: 'approve' });
      }
    } else {
      setShowReasonBox(true);
      setCurrentAction(action);
    }
  };

  const submitReasonAction = () => {
    if (!reason.trim()) return alert("Reason/Note is mandatory for this action.");
    mutation.mutate({ 
      action: currentAction, 
      data: { reason: reason, note: reason, requestResubmission: currentAction === 'resubmit' } 
    });
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="fixed inset-0 bg-primary/60 backdrop-blur-sm" onClick={() => onOpenChange(false)}></div>
      
      <div className="relative bg-background border border-primary/15 shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-primary/10 flex justify-between items-center bg-surface">
          <div>
            <h2 className="font-headline text-xl font-black text-primary leading-none">{request.student.name}</h2>
            <p className="text-[9px] text-secondary uppercase tracking-[0.25em] mt-1.5 font-bold">
              {request.student.division} · Year {request.student.year} · {request.leaveType.replace(/_/g, ' ')}
            </p>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-primary/5 transition-colors text-secondary hover:text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Left: Metadata & Actions */}
          <div className="w-full lg:w-72 flex-shrink-0 p-6 border-r border-primary/10 overflow-y-auto space-y-6 bg-surface">
            {/* Audit Context (for Year Coord) */}
            {user?.role === 'YEAR_COORD' && request.classCoordApproval && (
              <div className="bg-green-50 border border-green-200 p-3 mb-2 rounded-sm shadow-sm space-y-1.5">
                <div className="flex items-center gap-1.5 text-green-800">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-600" />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
                    Level 1 Approved
                  </p>
                </div>
                <div className="text-[10px] text-green-900 border-l-2 border-green-300 pl-2 ml-2">
                  <p className="font-bold">{request.classCoordApproval.name}</p>
                  <p className="text-[8px] opacity-70">{new Date(request.classCoordApproval.at).toLocaleString('en-GB')}</p>
                </div>
              </div>
            )}

            {/* Resubmission Context */}
            {request.parentRequest && (
              <div className="bg-amber-50 border border-amber-200 p-3 mb-2 rounded-sm shadow-sm space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
                    Resubmission Context
                  </p>
                </div>
                <p className="text-xs text-amber-900 border-l-2 border-amber-300 pl-2 ml-2 italic">
                  "{request.parentRequest.resubmissionNote || request.parentRequest.rejectionReason || 'Previous request needed updates.'}"
                </p>
              </div>
            )}

            {/* Absence Duration */}
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] mb-1">Absence Duration</p>
                <p className="text-sm font-bold text-primary font-mono">
                  {new Date(request.fromDate).toLocaleDateString('en-GB')} – {new Date(request.toDate).toLocaleDateString('en-GB')}
                </p>
                <p className="text-[9px] text-accent font-black mt-0.5 uppercase tracking-wider">{request.daysCount} Day(s)</p>
              </div>
            </div>

            {/* Reason */}
            <div className="flex items-start gap-3">
              <MessageSquare className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] mb-2">Reason Provided</p>
                <p className="text-sm text-secondary leading-relaxed italic border-l-2 border-accent/30 pl-3 py-1 font-light">
                  "{request.reason}"
                </p>
              </div>
            </div>

            {/* Balance Summary */}
            <div className="bg-background border border-primary/10 p-4">
              <h4 className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] mb-3">Leave Balances</h4>
              <div className="flex gap-3">
                <div className="flex-1 text-center py-3 border border-primary/10 bg-surface">
                  <p className="text-[9px] text-secondary font-bold uppercase tracking-wide mb-1">OD</p>
                  <p className="text-lg font-black text-primary font-headline">{request.student?.odUsed || '?'}<span className="text-primary/20 text-sm">/5</span></p>
                </div>
                <div className="flex-1 text-center py-3 border border-primary/10 bg-surface">
                  <p className="text-[9px] text-secondary font-bold uppercase tracking-wide mb-1">MED</p>
                  <p className="text-lg font-black text-primary font-headline">{request.student?.medicalUsed || '?'}<span className="text-primary/20 text-sm">/5</span></p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-primary/10">
              {!showReasonBox ? (
                <>
                  <button 
                    onClick={() => handleAction('approve')}
                    className={`w-full flex items-center justify-center gap-2 py-3 text-background text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                      user?.role === 'YEAR_COORD' && request.leaveType === 'SPECIAL_OD' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-primary hover:bg-accent'
                    }`}
                  >
                    {user?.role === 'YEAR_COORD' ? (
                      request.leaveType === 'SPECIAL_OD' ? (
                        <><ArrowRightLeft className="w-4 h-4" /> Approve & Forward</>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4" /> Final Approve Request</>
                      )
                    ) : (
                      <><CheckCircle2 className="w-4 h-4" /> Approve Request</>
                    )}
                  </button>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction('reject')}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-background text-red-600 border border-red-200 text-[10px] font-black uppercase tracking-wide hover:bg-red-50 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button 
                      onClick={() => handleAction('resubmit')}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-background text-amber-600 border border-amber-200 text-[10px] font-black uppercase tracking-wide hover:bg-amber-50 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Resubmit
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[9px] font-black text-secondary uppercase tracking-[0.2em]">
                      Reason for {currentAction === 'reject' ? 'Rejection' : 'Resubmission'}
                    </h4>
                    <button onClick={() => setShowReasonBox(false)} className="text-[9px] font-black text-accent uppercase tracking-wide hover:text-primary transition-colors">Cancel</button>
                  </div>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-3 bg-surface border border-primary/15 text-sm text-primary focus:border-primary outline-none h-28 font-body resize-none"
                    placeholder={`Explain why this is being ${currentAction}ed...`}
                  ></textarea>
                  <button 
                    onClick={submitReasonAction}
                    disabled={mutation.isLoading}
                    className={`w-full py-3 text-background text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                      currentAction === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
                    } disabled:opacity-50`}
                  >
                    {mutation.isLoading ? 'Processing...' : `Confirm ${currentAction === 'reject' ? 'Rejection' : 'Resubmission Request'}`}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Document Viewer */}
          <div className="flex-1 bg-primary/5 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2 text-[9px] font-black text-secondary uppercase tracking-[0.2em]">
                <FileText className="w-3.5 h-3.5" /> 
                {request.letterType} Application Letter
              </div>
              <div className="flex items-center gap-4">
                {(() => {
                  try {
                    const lc = typeof request.letterContent === 'string' ? JSON.parse(request.letterContent) : (request.letterContent || {});
                    
                    const links = [];
                    if (lc.attachedProofUrl) {
                      links.push(
                        <a key="legacy" href={getFileUrl(lc.attachedProofUrl)} target="_blank" rel="noreferrer" className="text-[9px] font-black text-amber-600 hover:text-amber-700 flex items-center gap-1.5 uppercase tracking-wider transition-colors mr-2">
                          View Proof <ExternalLink className="w-3 h-3" />
                        </a>
                      );
                    }
                    if (lc.attachedProofUrls && Array.isArray(lc.attachedProofUrls)) {
                      lc.attachedProofUrls.forEach((url, idx) => {
                        links.push(
                          <a key={idx} href={getFileUrl(url)} target="_blank" rel="noreferrer" className="text-[9px] font-black text-amber-600 hover:text-amber-700 flex items-center gap-1.5 uppercase tracking-wider transition-colors mr-2">
                            Proof {idx + 1} <ExternalLink className="w-3 h-3" />
                          </a>
                        );
                      });
                    }
                    return links;
                  } catch (e) {}
                  return null;
                })()}
                {(() => {
                  if (!request.proofFileUrl) return null;
                  let urls = [request.proofFileUrl];
                  if (request.proofFileUrl.startsWith('[') && request.proofFileUrl.endsWith(']')) {
                    try { urls = JSON.parse(request.proofFileUrl); } catch(e){}
                  }
                  return urls.map((u, i) => (
                    <a 
                      key={i}
                      href={getFileUrl(u)} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[9px] font-black text-secondary hover:text-primary flex items-center gap-1.5 uppercase tracking-wider transition-colors"
                    >
                      {urls.length > 1 ? `Full View ${i+1}` : 'Full View'} <ExternalLink className="w-3 h-3" />
                    </a>
                  ));
                })()}
              </div>
            </div>
            
            <div className="flex-1 border border-primary/15 bg-background overflow-hidden flex items-center justify-center">
              {(() => {
                if (!request.proofFileUrl) {
                  return (
                    <div className="text-secondary flex flex-col items-center gap-4">
                      <AlertCircle className="w-10 h-10 opacity-10" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No document available</p>
                    </div>
                  );
                }
                
                let urls = [request.proofFileUrl];
                if (request.proofFileUrl.startsWith('[') && request.proofFileUrl.endsWith(']')) {
                  try {
                    urls = JSON.parse(request.proofFileUrl);
                  } catch (e) {}
                }

                return (
                  <div className="w-full h-full overflow-auto flex flex-col gap-4 p-4 bg-primary/[0.02]">
                    {urls.map((url, i) => {
                      const isPdf = request.proofFileType === 'PDF' || url.toLowerCase().endsWith('.pdf');
                      const fullUrl = getFileUrl(url);
                      return isPdf ? (
                        <iframe 
                          key={i}
                          src={`${fullUrl}#view=FitH&toolbar=0`} 
                          className="w-full h-[80vh] border border-primary/20 bg-white shadow-xl"
                          title={`Document View ${i+1}`}
                        ></iframe>
                      ) : (
                        <div key={i} className="flex justify-center">
                          <img 
                            src={fullUrl} 
                            className="max-w-full h-auto shadow-xl border border-primary/20 bg-white" 
                            alt={`Proof ${i+1}`} 
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailModal;
