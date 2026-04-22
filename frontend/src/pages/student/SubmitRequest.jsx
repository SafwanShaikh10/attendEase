import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  FileText,
  Calendar,
  Upload,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Download,
  CheckCircle2,
  FileCheck,
  Stethoscope,
  Briefcase,
  Award,
  Image
} from 'lucide-react';
import { submitLeaveRequest, uploadProof, getRequestDetails, getStudentDashboard } from '../../api/student';
import { getFileUrl } from '../../utils/fileUrl';

/* ── Step Indicator ── */
const StepIndicator = ({ currentStep, steps }) => (
  <div className="flex items-center justify-between mb-10">
    {steps.map((label, i) => {
      const stepNum = i + 1;
      const isActive = stepNum === currentStep;
      const isDone = stepNum < currentStep;
      return (
        <div key={i} className="flex items-center flex-1 last:flex-initial">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 flex items-center justify-center text-[11px] font-black transition-all
              ${isDone ? 'bg-accent text-background' : isActive ? 'bg-primary text-background' : 'bg-primary/5 text-secondary border border-primary/10'}`}>
              {isDone ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] hidden md:block
              ${isActive ? 'text-primary' : isDone ? 'text-accent' : 'text-secondary/40'}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px mx-4 ${isDone ? 'bg-accent' : 'bg-primary/10'}`} />
          )}
        </div>
      );
    })}
  </div>
);

/* ── Leave Type Card ── */
const leaveTypeInfo = {
  OD: {
    icon: Briefcase,
    title: 'OD Leave',
    desc: 'On-duty leave for academic events, hackathons, conferences, and workshops.',
  },
  MEDICAL: {
    icon: Stethoscope,
    title: 'Medical Leave',
    desc: 'Leave for medical emergencies, illness, or hospital visits with valid proof.',
  },
  SPECIAL_OD: {
    icon: Award,
    title: 'Special OD',
    desc: 'Leave for inter-college competitions, national events, or university representation.',
  },
};

const SubmitRequest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resubmitId = searchParams.get('resubmit');

  const [step, setStep] = useState(1);
  const [isDigital, setIsDigital] = useState(true);
  const [limitWarning, setLimitWarning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [charCount, setCharCount] = useState(0);

  const { data: dashboardData } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: getStudentDashboard,
  });
  const currentBalance = dashboardData?.balances?.[0] || { odUsed: 0, medicalUsed: 0 };

  const { register, handleSubmit, control, setValue, watch, formState: { errors }, getValues } = useForm({
    defaultValues: {
      leaveType: '',
      semester: '6th sem',
      letterType: 'DIGITAL',
      daysCount: 0,
      reason: '',
    }
  });

  const fromDate = watch('fromDate');
  const toDate = watch('toDate');
  const leaveType = watch('leaveType');
  const reason = watch('reason');

  // Track character count for reason
  useEffect(() => {
    setCharCount(reason?.length || 0);
  }, [reason]);

  // Load original request if resubmit
  const { data: originalRequest } = useQuery({
    queryKey: ['requestDetails', resubmitId],
    queryFn: () => getRequestDetails(resubmitId),
    enabled: !!resubmitId
  });

  useEffect(() => {
    if (originalRequest) {
      setValue('leaveType', originalRequest.leaveType);
      setValue('reason', originalRequest.reason);
      setValue('semester', originalRequest.semester);
      if (originalRequest.fromDate) setValue('fromDate', originalRequest.fromDate.split('T')[0]);
      if (originalRequest.toDate) setValue('toDate', originalRequest.toDate.split('T')[0]);
      if (originalRequest.letterType) {
        setValue('letterType', originalRequest.letterType);
        setIsDigital(originalRequest.letterType === 'DIGITAL');
      }
      // Pre-fill digital letter fields
      if (originalRequest.letterContent) {
        const c = typeof originalRequest.letterContent === 'string'
          ? JSON.parse(originalRequest.letterContent) : originalRequest.letterContent;
        Object.entries(c).forEach(([key, val]) => setValue(key, val));
      }
    }
  }, [originalRequest, setValue]);

  // Date Calculation & Limit Check
  useEffect(() => {
    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setValue('daysCount', diffDays);

      // Semester limit check
      if (leaveType === 'OD' && (currentBalance.odUsed + diffDays) > 5) {
        setLimitWarning(true);
      } else if (leaveType === 'MEDICAL' && (currentBalance.medicalUsed + diffDays) > 5) {
        setLimitWarning(true);
      } else {
        setLimitWarning(false);
      }
    }
  }, [fromDate, toDate, leaveType, currentBalance, setValue]);

  const submitMutation = useMutation({
    mutationFn: submitLeaveRequest,
    onSuccess: (data) => {
      setSubmitted(true);
      setSubmittedId(data?.id || data?.request?.id || '—');
    }
  });

  const uploadMutation = useMutation({
    mutationFn: uploadProof
  });

  const onSubmit = async (data) => {
    try {
      let finalData = { ...data };

      if (!isDigital) {
        if (!data.proofFile?.length && !originalRequest?.proofFileUrl) {
          alert("Please upload the signed letter.");
          return;
        }
        if (data.proofFile?.length > 0) {
          const urls = [];
          for(let i=0; i<data.proofFile.length; i++) {
            const res = await uploadMutation.mutateAsync(data.proofFile[i]);
            urls.push(res.fileUrl);
          }
          finalData.proofFileUrl = JSON.stringify(urls);
          finalData.proofFileType = data.proofFile[0].type.includes('pdf') ? 'PDF' : 'JPG';
        }
      } else {
        const content = {};
        if (data.proofFile?.length > 0) {
          const urls = [];
          for(let i=0; i<data.proofFile.length; i++) {
            const res = await uploadMutation.mutateAsync(data.proofFile[i]);
            urls.push(res.fileUrl);
          }
          content.attachedProofUrls = urls;
        }
        if (leaveType === 'OD') {
          content.eventName = data.eventName;
          content.organisingBody = data.organisingBody;
          content.role = data.role;
          content.location = data.location;
        } else if (leaveType === 'MEDICAL') {
          content.illness = data.illness;
          content.doctor = data.doctor;
          content.underTreatment = data.underTreatment;
          content.certificateAttached = data.certificateAttached;
        } else if (leaveType === 'SPECIAL_OD') {
          content.externalEvent = data.externalEvent;
          content.organisingBody = data.organisingBody;
          content.role = data.role;
          content.location = data.location;
          content.selectionLetterAttached = data.selectionLetterAttached;
        }
        finalData.letterContent = content;
      }

      await submitMutation.mutateAsync({
        ...finalData,
        parentRequestId: resubmitId ? parseInt(resubmitId) : null
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to submit request");
    }
  };

  const canProceedStep2 = fromDate && toDate && reason?.trim().length > 0 && !limitWarning;

  // ── Success Screen ──
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="w-20 h-20 mx-auto mb-8 bg-accent/10 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-accent" />
        </div>
        <h1 className="font-headline text-3xl font-black text-primary mb-3">Request Submitted</h1>
        <p className="text-secondary text-sm mb-2">Your leave application has been received and is now being processed.</p>
        <p className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] mb-10">
          Request ID: #{submittedId}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-secondary hover:text-primary border border-primary/10 hover:border-primary/30 transition-all"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate(`/student/track/${submittedId}`)}
            className="group px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-background bg-primary hover:bg-accent transition-all flex items-center gap-2"
          >
            Track This Request
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-2">
        <h1 className="font-headline text-3xl font-black text-primary tracking-tight">
          {resubmitId ? 'Resubmit Request' : 'New Leave Application'}
        </h1>
        <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.25em] mt-2">
          Complete all steps to submit your request
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={step} steps={['Leave Type', 'Details', 'Letter', 'Review']} />

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* ═══════════ STEP 1 — Choose Leave Type ═══════════ */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-primary mb-1">Choose Leave Type</h2>
              <p className="text-[10px] text-secondary uppercase tracking-[0.2em] font-bold">Select the category that best describes your absence</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(leaveTypeInfo).map(([type, info]) => {
                const Icon = info.icon;
                const isSelected = leaveType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue('leaveType', type)}
                    className={`p-6 text-left border-2 transition-all group
                      ${isSelected
                        ? 'border-primary bg-primary text-background'
                        : 'border-primary/10 bg-surface hover:border-primary/30 text-primary'}`}
                  >
                    <Icon className={`w-6 h-6 mb-4 ${isSelected ? 'text-background/60' : 'text-secondary'}`} />
                    <h3 className="font-black text-sm mb-2">{info.title}</h3>
                    <p className={`text-[10px] leading-relaxed ${isSelected ? 'text-background/60' : 'text-secondary'}`}>
                      {info.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => leaveType && setStep(2)}
                disabled={!leaveType}
                className="group flex items-center gap-3 px-8 py-3 bg-primary text-background text-[10px] font-black uppercase tracking-[0.3em] hover:bg-accent transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 2 — Dates & Details ═══════════ */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-primary mb-1">Dates & Details</h2>
              <p className="text-[10px] text-secondary uppercase tracking-[0.2em] font-bold">Specify the absence period and provide a reason</p>
            </div>

            {limitWarning && (
              <div className="bg-red-50 border border-red-200 p-4 flex items-center gap-3">
                <AlertTriangle className="text-red-600 w-5 h-5 flex-shrink-0" />
                <p className="text-sm text-red-800 font-medium">
                  This request will exceed your semester limit. Please adjust the dates.
                </p>
              </div>
            )}

            <div className="bg-surface border border-primary/10 p-8 space-y-6">
              {/* Date row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">From Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40" />
                    <input
                      type="date"
                      {...register('fromDate', { required: true })}
                      className="w-full pl-10 pr-4 py-3 bg-background border border-primary/10 text-sm text-primary focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">To Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40" />
                    <input
                      type="date"
                      {...register('toDate', { required: true })}
                      className="w-full pl-10 pr-4 py-3 bg-background border border-primary/10 text-sm text-primary focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="bg-primary/5 border border-primary/10 p-4 flex items-center justify-between">
                  <span className="text-[10px] font-black text-secondary uppercase tracking-wider">Total Days</span>
                  <span className="text-2xl font-black text-primary font-headline">{watch('daysCount') || 0}</span>
                </div>
              </div>

              {/* Semester */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Semester</label>
                <input
                  type="text"
                  {...register('semester', { required: true })}
                  placeholder="e.g. 6th sem"
                  className="w-full bg-background border border-primary/10 px-4 py-3 text-sm text-primary placeholder-secondary/40 focus:border-primary transition-all outline-none"
                />
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Reason for Absence</label>
                  <span className={`text-[10px] font-bold ${charCount > 500 ? 'text-red-500' : 'text-secondary/40'}`}>
                    {charCount}/500
                  </span>
                </div>
                <textarea
                  {...register('reason', { required: 'Reason is required', maxLength: 500 })}
                  placeholder="Briefly explain why you were absent or will be absent..."
                  rows="4"
                  className="w-full bg-background border border-primary/10 px-4 py-3 text-sm text-primary placeholder-secondary/40 focus:border-primary transition-all outline-none resize-none"
                />
                {errors.reason && <span className="text-xs text-red-500 font-medium">{errors.reason.message}</span>}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(1)}
                className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-secondary hover:text-primary transition-all">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button type="button" onClick={() => canProceedStep2 && setStep(3)}
                disabled={!canProceedStep2}
                className="group flex items-center gap-3 px-8 py-3 bg-primary text-background text-[10px] font-black uppercase tracking-[0.3em] hover:bg-accent transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                Next <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 3 — The Letter ═══════════ */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-primary mb-1">Verification Document</h2>
              <p className="text-[10px] text-secondary uppercase tracking-[0.2em] font-bold">Choose how to provide your application letter</p>
            </div>

            {/* Path selector */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button type="button"
                onClick={() => { setIsDigital(true); setValue('letterType', 'DIGITAL'); }}
                className={`p-6 text-left border-2 transition-all
                  ${isDigital ? 'border-primary bg-primary text-background' : 'border-primary/10 bg-surface text-primary hover:border-primary/30'}`}>
                <FileText className={`w-6 h-6 mb-3 ${isDigital ? 'text-background/60' : 'text-secondary'}`} />
                <h3 className="font-black text-sm mb-1">Fill Digitally</h3>
                <p className={`text-[10px] ${isDigital ? 'text-background/60' : 'text-secondary'}`}>
                  Type your details online. A formal PDF letter is generated automatically.
                </p>
              </button>
              <button type="button"
                onClick={() => { setIsDigital(false); setValue('letterType', 'PHYSICAL'); }}
                className={`p-6 text-left border-2 transition-all
                  ${!isDigital ? 'border-primary bg-primary text-background' : 'border-primary/10 bg-surface text-primary hover:border-primary/30'}`}>
                <Upload className={`w-6 h-6 mb-3 ${!isDigital ? 'text-background/60' : 'text-secondary'}`} />
                <h3 className="font-black text-sm mb-1">Write Physically</h3>
                <p className={`text-[10px] ${!isDigital ? 'text-background/60' : 'text-secondary'}`}>
                  Download a template, write by hand, scan, and upload.
                </p>
              </button>
            </div>

            {/* Digital Form */}
            {isDigital ? (
              <div className="bg-surface border border-primary/10 p-8 space-y-6">
                <p className="text-[10px] font-black text-secondary uppercase tracking-[0.25em]">
                  {leaveType.replace(/_/g, ' ')} — Digital Letter Form
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {leaveType === 'OD' && (<>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Event Name</label>
                      <input {...register('eventName')} placeholder="e.g. Hackout 2024"
                        className="w-full bg-background border border-primary/10 px-4 py-3 text-sm outline-none focus:border-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Organising Body</label>
                      <input {...register('organisingBody')} placeholder="e.g. Headspace Lab"
                        className="w-full bg-background border border-primary/10 px-4 py-3 text-sm outline-none focus:border-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Your Role</label>
                      <input {...register('role')} placeholder="e.g. Lead Developer"
                        className="w-full bg-background border border-primary/10 px-4 py-3 text-sm outline-none focus:border-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Event Venue</label>
                      <input {...register('location')} placeholder="e.g. IIT Kharagpur"
                        className="w-full bg-background border border-primary/10 px-4 py-3 text-sm outline-none focus:border-primary transition-all" />
                    </div>
                    <div className="col-span-1 md:col-span-2 mt-2">
                      <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 block">Upload Proof (Invite/Brochure)</label>
                      <label className="flex items-center gap-4 p-4 border border-primary/10 bg-background cursor-pointer hover:border-primary/40 transition-all">
                        <Upload className="w-5 h-5 text-accent" />
                        <span className="text-sm font-medium text-primary flex-1">{previewFiles.length > 0 ? `${previewFiles.length} files selected` : 'Click here to upload documents'}</span>
                        <input type="file" multiple className="hidden" {...register('proofFile')}
                          onChange={e => {
                            if (e.target.files.length) {
                              setPreviewFiles(Array.from(e.target.files).map(f => f.name));
                            }
                          }} />
                      </label>
                    </div>
                  </>)}
                  {leaveType === 'MEDICAL' && (<>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Nature of Illness</label>
                      <input {...register('illness')} placeholder="e.g. Severe Viral Fever"
                        className="w-full bg-background border border-primary/10 px-4 py-3 text-sm outline-none focus:border-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Doctor / Hospital</label>
                      <input {...register('doctor')} placeholder="e.g. Apollo Hospital"
                        className="w-full bg-background border border-primary/10 px-4 py-3 text-sm outline-none focus:border-primary transition-all" />
                    </div>
                    <div className="col-span-1 md:col-span-2 flex items-center gap-6 py-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" {...register('underTreatment')} className="accent-primary w-4 h-4" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Ongoing Treatment</span>
                      </label>
                    </div>
                    <div className="col-span-1 md:col-span-2 mt-2">
                      <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 block">Upload Medical Certificate</label>
                      <label className="flex items-center gap-4 p-4 border border-primary/10 bg-background cursor-pointer hover:border-primary/40 transition-all">
                        <Upload className="w-5 h-5 text-accent" />
                        <span className="text-sm font-medium text-primary flex-1">{previewFiles.length > 0 ? `${previewFiles.length} files selected` : 'Click here to upload documents'}</span>
                        <input type="file" multiple className="hidden" {...register('proofFile')} 
                          onChange={e => {
                            if (e.target.files.length) {
                              setPreviewFiles(Array.from(e.target.files).map(f => f.name));
                              setValue('certificateAttached', true);
                            }
                          }} />
                      </label>
                    </div>
                  </>)}
                  {leaveType === 'SPECIAL_OD' && (<>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">External Event</label>
                      <input {...register('externalEvent')} placeholder="e.g. Inter-College Sports Meet"
                        className="w-full bg-background border border-primary/10 px-4 py-3 text-sm outline-none focus:border-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Institution Name</label>
                      <input {...register('organisingBody')} placeholder="e.g. VTU Belgaum"
                        className="w-full bg-background border border-primary/10 px-4 py-3 text-sm outline-none focus:border-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Your Role</label>
                      <input {...register('role')} placeholder="e.g. University Delegate"
                        className="w-full bg-background border border-primary/10 px-4 py-3 text-sm outline-none focus:border-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">City & Venue</label>
                      <input {...register('location')} placeholder="e.g. Kanteerava Stadium, Bangalore"
                        className="w-full bg-background border border-primary/10 px-4 py-3 text-sm outline-none focus:border-primary transition-all" />
                    </div>
                    <div className="col-span-1 md:col-span-2 flex items-center gap-6 py-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" {...register('selectionLetterAttached')} className="accent-primary w-4 h-4" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Official Selection Letter Attached</span>
                      </label>
                    </div>
                    <div className="col-span-1 md:col-span-2 mt-2">
                      <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 block">Upload Official Selection Letter</label>
                      <label className="flex items-center gap-4 p-4 border border-primary/10 bg-background cursor-pointer hover:border-primary/40 transition-all">
                        <Upload className="w-5 h-5 text-accent" />
                        <span className="text-sm font-medium text-primary flex-1">{previewFiles.length > 0 ? `${previewFiles.length} files selected` : 'Click here to upload documents'}</span>
                        <input type="file" multiple className="hidden" {...register('proofFile')} 
                          onChange={e => {
                            if (e.target.files.length) {
                              setPreviewFiles(Array.from(e.target.files).map(f => f.name));
                              setValue('selectionLetterAttached', true);
                            }
                          }} />
                      </label>
                    </div>
                  </>)}
                </div>
              </div>
            ) : (
              /* Physical Upload */
              <div className="bg-surface border border-primary/10 p-8 space-y-6">
                <div className="flex items-start gap-4 p-5 bg-background border border-primary/10">
                  <Download className="text-accent w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="text-sm font-black text-primary">Download Template First</h5>
                    <p className="text-[10px] text-secondary mt-1">Use the university-standard format. Download, sign manually, scan, and upload.</p>
                    <a
                      href={getFileUrl(`/requests/letter-template/${leaveType}`)}
                      target="_blank" rel="noreferrer"
                      className="inline-block mt-3 text-[10px] font-black text-accent uppercase tracking-wider hover:underline"
                    >
                      Download {leaveType.replace(/_/g, ' ')} template →
                    </a>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Upload Signed Letter & Proofs</label>
                  <input type="file" multiple {...register('proofFile')} className="hidden" id="proof-upload" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files.length) {
                        setPreviewFiles(Array.from(e.target.files).map(f => f.name));
                      }
                    }}
                  />
                  <label htmlFor="proof-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-primary/15 py-10 cursor-pointer hover:border-primary/40 hover:bg-primary/[0.02] transition-all">
                    {previewFiles.length > 0 ? (
                      <>
                        <FileCheck className="w-8 h-8 text-accent mb-2" />
                        <span className="text-sm font-bold text-primary">{previewFiles.length} files selected</span>
                        <span className="text-[10px] text-secondary mt-1">Click to replace all files</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-secondary/30 mb-2" />
                        <span className="text-sm font-medium text-secondary">Upload your signed letter (and any proofs)</span>
                        <span className="text-[10px] text-secondary/60 mt-1">PDF, JPG, or PNG — Select multiple if needed</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-secondary hover:text-primary transition-all">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button type="button" onClick={() => setStep(4)}
                className="group flex items-center gap-3 px-8 py-3 bg-primary text-background text-[10px] font-black uppercase tracking-[0.3em] hover:bg-accent transition-all">
                Next <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 4 — Review & Submit ═══════════ */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-primary mb-1">Review & Submit</h2>
              <p className="text-[10px] text-secondary uppercase tracking-[0.2em] font-bold">Confirm all details before submitting your application</p>
            </div>

            <div className="bg-surface border border-primary/10 p-8 space-y-6">
              {/* Summary grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1">Leave Type</p>
                  <p className="text-sm font-bold text-primary">{leaveType?.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1">Dates</p>
                  <p className="text-sm font-bold text-primary font-mono">
                    {fromDate && new Date(fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – {toDate && new Date(toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1">Total Days</p>
                  <p className="text-sm font-bold text-primary">{watch('daysCount')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1">Letter Path</p>
                  <p className="text-sm font-bold text-primary">{isDigital ? 'Digital' : 'Physical'}</p>
                </div>
              </div>

              <div className="h-px bg-primary/10" />

              {/* Reason */}
              <div>
                <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2">Reason</p>
                <p className="text-sm text-primary leading-relaxed">{reason}</p>
              </div>

              {previewFiles.length > 0 && !isDigital && (
                <>
                  <div className="h-px bg-primary/10" />
                  <div>
                    <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2">Uploaded Documents</p>
                    <div className="space-y-1">
                      {previewFiles.map((file, i) => (
                        <p key={i} className="text-sm text-primary font-mono">• {file}</p>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Balance indicator */}
            <div className="bg-accent/5 border border-accent/20 p-5 flex items-center justify-between">
              <div>
                {leaveType === 'SPECIAL_OD' ? (
                  <>
                    <p className="text-[10px] font-black text-accent uppercase tracking-[0.25em]">Special Approval Required</p>
                    <p className="text-sm text-primary mt-1">Special OD is exempt from the standard 5-day limit but requires Chairperson approval.</p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-black text-accent uppercase tracking-[0.25em]">After this request</p>
                    <p className="text-sm text-primary mt-1">
                      {leaveType === 'OD'
                        ? `OD days remaining this semester: ${5 - currentBalance.odUsed - (watch('daysCount') || 0)}`
                        : `Medical days remaining this semester: ${5 - currentBalance.medicalUsed - (watch('daysCount') || 0)}`}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-secondary hover:text-primary transition-all">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button type="submit"
                disabled={submitMutation.isPending || uploadMutation.isPending}
                className="group flex items-center gap-3 px-10 py-3 bg-primary text-background text-[10px] font-black uppercase tracking-[0.3em] hover:bg-accent transition-all disabled:opacity-30">
                {(submitMutation.isPending || uploadMutation.isPending) ? 'Processing...' : (
                  <>
                    Submit Request
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SubmitRequest;
