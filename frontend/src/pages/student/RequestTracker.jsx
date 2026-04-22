import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRequestDetails } from '../../api/student';
import {
  CheckCircle2,
  Clock,
  Circle,
  ArrowLeft,
  Calendar,
  Info,
  History,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  Minus,
  ExternalLink
} from 'lucide-react';
import { getFileUrl } from '../../utils/fileUrl';

const RequestTracker = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: request, isLoading, error } = useQuery({
    queryKey: ['requestDetails', id],
    queryFn: () => getRequestDetails(id),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Fetching Tracking Data</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-20 text-center">
        <AlertCircle className="w-10 h-10 mx-auto mb-4 text-red-400" />
        <p className="text-sm text-red-600 font-bold">Error loading request details</p>
      </div>
    );
  }

  const isSpecial = request.leaveType === 'SPECIAL_OD';
  const isRejected = ['REJECTED', 'RESUBMISSION_REQUESTED', 'CANCELLED'].includes(request.status);
  const isFinalApproved = (request.status === 'CHAIRPERSON_APPROVED') ||
    (request.status === 'YEAR_COORD_APPROVED' && !isSpecial);

  // ── Stepper Steps ──
  const steps = [
    { id: 'SUBMITTED', label: 'Submitted' },
    { id: 'CLASS_COORD_APPROVED', label: 'Class Coordinator' },
    { id: 'YEAR_COORD_APPROVED', label: 'Year Coordinator' },
    { id: 'CHAIRPERSON_APPROVED', label: 'Chairperson', na: !isSpecial },
    { id: 'DONE', label: 'Done' },
  ];

  const statusOrder = ['SUBMITTED', 'CLASS_COORD_APPROVED', 'YEAR_COORD_APPROVED', 'CHAIRPERSON_APPROVED', 'DONE'];
  const currentIndex = (() => {
    if (isFinalApproved) return 4; // DONE
    const i = statusOrder.indexOf(request.status);
    return i >= 0 ? i : 0;
  })();

  // ── Audit Trail helpers ──
  const getWaitingStep = () => {
    if (isRejected || isFinalApproved) return null;
    if (request.status === 'SUBMITTED') return 'Class Coordinator';
    if (request.status === 'CLASS_COORD_APPROVED') return 'Year Coordinator';
    if (request.status === 'YEAR_COORD_APPROVED' && isSpecial) return 'Chairperson';
    return null;
  };

  const waitingStep = getWaitingStep();

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* ── Header ── */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link to="/student/dashboard"
            className="flex items-center gap-2 text-secondary hover:text-primary transition-colors text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="font-headline text-3xl font-black text-primary tracking-tight">Request Tracking</h1>
          <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.25em] mt-2">
            ID: #{request.id} · {request.leaveType.replace(/_/g, ' ')} Leave
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(isRejected) && (
            <button
              onClick={() => navigate(`/student/submit?resubmit=${request.id}`)}
              className="group flex items-center gap-2 px-5 py-2.5 bg-primary text-background text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Resubmit
            </button>
          )}
          <div className={`px-4 py-2 border text-[10px] font-black uppercase tracking-[0.15em]
            ${isRejected ? 'bg-red-50 text-red-700 border-red-200'
              : isFinalApproved ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {request.status.replace(/_/g, ' ')}
          </div>
        </div>
      </div>

      {/* ── Horizontal Stepper ── */}
      <div className="bg-surface border border-primary/10 p-8 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => {
            const isDone = currentIndex > i;
            const isCurrent = currentIndex === i && !isRejected;
            const isNA = s.na;
            const isPending = !isDone && !isCurrent;

            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center gap-2 min-w-0">
                  {/* Circle */}
                  <div className={`w-10 h-10 flex items-center justify-center transition-all
                    ${isDone ? 'bg-accent text-background' :
                      isCurrent ? 'bg-primary text-background animate-pulse' :
                      isNA ? 'bg-primary/5 text-secondary/30 border border-dashed border-primary/15' :
                      'bg-primary/5 text-secondary/30 border border-primary/10'}`}>
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> :
                     isNA ? <Minus className="w-4 h-4" /> :
                     isCurrent ? <Clock className="w-4 h-4" /> :
                     <Circle className="w-4 h-4" />}
                  </div>
                  {/* Label */}
                  <span className={`text-[9px] font-bold uppercase tracking-wider text-center leading-tight
                    ${isDone ? 'text-accent' : isCurrent ? 'text-primary' : isNA ? 'text-secondary/30' : 'text-secondary/40'}`}>
                    {isNA ? 'N/A' : s.label}
                  </span>
                </div>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-3 ${isDone ? 'bg-accent' : 'bg-primary/10'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Summary Card ── */}
      <div className="bg-surface border border-primary/10 p-6 grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div>
          <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1">From — To</p>
          <p className="text-sm font-bold text-primary font-mono">
            {new Date(request.fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – {new Date(request.toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1">Absence Days</p>
          <p className="text-sm font-bold text-primary">{request.daysCount} Day{request.daysCount > 1 ? 's' : ''}</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1">Letter Path</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-accent">{request.letterType}</p>
            {request.proofFileUrl && (
              <a 
                href={getFileUrl(request.proofFileUrl)} 
                target="_blank" 
                rel="noreferrer"
                className="p-1 hover:bg-accent/10 rounded-full transition-colors"
                title="View Letter"
              >
                <ExternalLink className="w-3.5 h-3.5 text-accent" />
              </a>
            )}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1">Semester</p>
          <p className="text-sm font-bold text-primary">{request.semester}</p>
        </div>
      </div>

      {/* ── Rejection Banner ── */}
      {isRejected && request.rejectionReason && (
        <div className="bg-red-50 border border-red-200 p-5 mb-6 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black text-red-700 uppercase tracking-[0.2em] mb-1">Rejection Reason</p>
            <p className="text-sm text-red-800 leading-relaxed">{request.rejectionReason}</p>
          </div>
        </div>
      )}

      {isRejected && request.resubmissionNote && (
        <div className="bg-orange-50 border border-orange-200 p-5 mb-6 flex items-start gap-4">
          <Info className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black text-orange-700 uppercase tracking-[0.2em] mb-1">Resubmission Note</p>
            <p className="text-sm text-orange-800 leading-relaxed">{request.resubmissionNote}</p>
          </div>
        </div>
      )}

      {/* ── Audit Trail ── */}
      <div className="bg-surface border border-primary/10 overflow-hidden">
        <div className="p-6 border-b border-primary/10 flex items-center gap-3">
          <History className="w-4 h-4 text-secondary" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Audit Trail</h3>
        </div>
        <div className="p-6">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-primary/10" />

            {request.auditLogs?.map((log, index) => {
              const isApproval = log.action.includes('APPROVED');
              const isRej = log.action.includes('REJECTED') || log.action.includes('RESUBMISSION');
              const isSub = log.action === 'SUBMITTED' || log.action === 'RESUBMITTED';

              return (
                <div key={log.id} className="relative pb-8 last:pb-0 pl-10">
                  {/* Dot */}
                  <div className={`absolute left-0 top-1 w-[23px] h-[23px] flex items-center justify-center z-10
                    ${isApproval ? 'bg-green-100' : isRej ? 'bg-red-100' : 'bg-primary/5'}`}>
                    {isApproval ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> :
                     isRej ? <AlertCircle className="w-3.5 h-3.5 text-red-600" /> :
                     <Circle className="w-3.5 h-3.5 text-secondary" />}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1">
                    <div>
                      <p className="text-sm font-bold text-primary">
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-tight mr-2
                          ${isApproval ? 'bg-green-50 text-green-700 border border-green-200' :
                            isRej ? 'bg-red-50 text-red-700 border border-red-200' :
                            'bg-primary/5 text-secondary border border-primary/10'}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        {log.performedAs || 'SYSTEM'}
                        {log.user && <span className="text-secondary font-normal ml-1">({log.user.name})</span>}
                      </p>
                      {log.note && (
                        <div className={`mt-2 p-3 text-[11px] leading-relaxed border-l-2
                          ${isRej ? 'border-red-300 bg-red-50/50 text-red-800' : 'border-primary/10 bg-primary/[0.02] text-secondary'}`}>
                          {log.note}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-wider flex-shrink-0">
                      {new Date(log.createdAt).toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Waiting entry */}
            {waitingStep && (
              <div className="relative pl-10 pt-2">
                <div className="absolute left-0 top-3 w-[23px] h-[23px] flex items-center justify-center z-10 bg-amber-50 animate-pulse">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Waiting</span>
                  <span className="text-[10px] text-secondary/60">— Pending {waitingStep} review</span>
                </div>
              </div>
            )}

            {/* Final "Done" entry */}
            {isFinalApproved && (
              <div className="relative pl-10 pt-2">
                <div className="absolute left-0 top-3 w-[23px] h-[23px] flex items-center justify-center z-10 bg-accent/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                </div>
                <p className="text-sm font-bold text-accent">
                  Approved — Excel records updated.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestTracker;
