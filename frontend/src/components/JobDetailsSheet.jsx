import React, { useEffect, useState } from 'react';
import {
    MapPin,
    Briefcase,
    Building,
    DollarSign,
    TrendingUp,
    CheckCircle2,
    ArrowUpRight,
    Lock as LockIcon,
    Bookmark,
    Share2,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { getMatchColor, getMatchBgColor } from '../lib/utils';
import { toast } from 'sonner';

const JobDetailsSheet = ({
    job,
    open,
    onOpenChange = () => { },
    onApply = null,
    onToggleSave = () => { },
    savedJobIds = [],
    isPremium = false,
}) => {
    // If there's no job passed in, render nothing
    if (!job) return null;

    const [applying, setApplying] = useState(false);
    const [localJob, setLocalJob] = useState(() => ({ ...job }));
    const [isSaved, setIsSaved] = useState(() => Array.isArray(savedJobIds) && savedJobIds.includes(job?.id));
    const score = localJob?.matchPercentage ?? localJob?.matchScore ?? localJob?.match_score ?? 0;

    // Sync props -> local state
    useEffect(() => {
        setLocalJob(prev => ({ ...(prev || {}), ...(job || {}) }));
        setIsSaved(Array.isArray(savedJobIds) && savedJobIds.includes(job?.id));
    }, [job, savedJobIds]);

    // When sheet opens, fetch user's applications to mark applied state (best-effort)
    useEffect(() => {
        let canceled = false;
        const checkIfApplied = async () => {
            if (!open || !job) return;
            try {
                const res = await fetch('http://localhost:8000/api/applications', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!res.ok) return;
                const json = await res.json();
                if (!json?.success) return;

                const apps = Array.isArray(json.data) ? json.data : [];
                const found = apps.find(a => {
                    const jid =
                        (a.job && (a.job._id || a.job.id || a.job._id)) ||
                        a.job_id ||
                        a.jobId ||
                        a.job?.id;
                    return String(jid) === String(job.id);
                });

                if (found && !canceled) {
                    setLocalJob(prev => ({ ...(prev || {}), applicationStatus: found.status || 'applied' }));
                }
            } catch (err) {
                // non-blocking
                console.warn('Could not fetch user applications', err);
            }
        };

        checkIfApplied();
        return () => { canceled = true; };
    }, [open, job]);

    const handleApply = async (notes = '') => {
        if (applying) return;
        setApplying(true);

        try {
            const payload = { jobId: job.id };
            if (notes) payload.notes = notes;

            const res = await fetch('http://localhost:8000/api/applications', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const json = await res.json();

            if (!res.ok) {
                const message = json?.error?.message || json?.message || 'Failed to apply';
                toast.error(message);
                setApplying(false);
                return;
            }

            // Success -> update local UI & notify parent
            setLocalJob(prev => ({ ...(prev || {}), applicationStatus: 'applied' }));
            toast.success(json.message || 'Application submitted');

            if (typeof onApply === 'function') {
                try { onApply(json.data); } catch (e) { console.warn('onApply callback error', e); }
            }
        } catch (err) {
            console.error('Apply error', err);
            toast.error(err?.message || 'Failed to apply');
        } finally {
            setApplying(false);
        }
    };

    const handleToggleSave = async () => {
        const next = !isSaved;
        setIsSaved(next);
        try {
            const maybe = onToggleSave(job.id);
            if (maybe && typeof maybe.then === 'function') await maybe;
            toast(next ? 'Saved job' : 'Removed from saved');
        } catch (err) {
            setIsSaved(!next);
            toast.error(err?.message || 'Failed to update saved state');
        }
    };

    // helpers for company/title fallbacks (handle employer.company_name shape)
    const companyName = localJob?.company || localJob?.employer?.company_name || localJob?.employer?.name || '';
    const title = localJob?.title || localJob?.role || 'Untitled Role';

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                    <SheetHeader>
                        <div className="flex items-start gap-4 mb-4">
                            <img
                                src={localJob?.logo || localJob?.company_logo || '/images/company-placeholder.png'}
                                alt={`${companyName || 'Company'} logo`}
                                onError={(e) => { e.currentTarget.src = '/images/company-placeholder.png'; }}
                                className="object-cover w-16 h-16 rounded-lg"
                            />
                            <div className="flex-1">
                                <SheetTitle className="mb-1 text-2xl" >
                                    {title}
                                </SheetTitle>
                                <SheetDescription className="text-base">{companyName}</SheetDescription>
                            </div>

                            {isPremium ? (
                                <div className={`${getMatchBgColor(score)} ${getMatchColor(score)} px-4 py-2 rounded-full text-base font-semibold`}>
                                    {score}% Match
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 px-4 py-2 text-base font-semibold text-gray-400 bg-gray-100 rounded-full">
                                    <LockIcon className="w-4 h-4" />
                                    Premium
                                </div>
                            )}
                        </div>
                    </SheetHeader>

                    <div className="pb-8 mt-6 space-y-6">
                        {/* Quick info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-[#4B5563]" />
                                <span className="text-[#4B5563]">{localJob?.location || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Briefcase className="h-4 w-4 text-[#4B5563]" />
                                <span className="text-[#4B5563]">{localJob?.type || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Building className="h-4 w-4 text-[#4B5563]" />
                                <span className="text-[#4B5563]">{localJob?.mode || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="h-4 w-4 text-[#4B5563]" />
                                <span className="text-[#4B5563]">{localJob?.salary || '—'}</span>
                            </div>
                        </div>

                        {/* Skills */}
                        <div>
                            <h3 className="font-semibold text-[#0F151D] mb-3">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {(localJob?.skills || []).map((skill, idx) => {
                                    const name = skill && (skill.skill_name || skill.name || skill);
                                    return (
                                        <Badge key={`${name || idx}-${idx}`} className="bg-[#E8F0FF] text-[#284688] hover:bg-[#E8F0FF]">
                                            {name || '—'}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>

                        {/* AI analysis (keeps same behavior) */}
                        {isPremium ? (
                            (localJob?.strongMatchFacts || localJob?.areasToImprove) && (
                                <div className="bg-gradient-to-br from-[#FFFDFA] to-[#FFF7ED] rounded-lg p-5 border border-orange-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <TrendingUp className="w-5 h-5 text-[#FF7000]" />
                                        {<h3 className="font-semibold text-[#0F151D]">AI Match Analysis</h3>}
                                    </div>
                                    <div className="space-y-4">
                                        {Array.isArray(localJob?.strongMatchFacts) && localJob.strongMatchFacts.length > 0 && (
                                            <div>
                                                <p className="flex items-center gap-1 mb-2 text-sm font-medium text-green-700">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Why You're a Great Fit
                                                </p>
                                                <ul className="space-y-2">
                                                    {localJob.strongMatchFacts.map((reason, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-[#1F2937]">
                                                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                            <span className="leading-relaxed">{reason}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {Array.isArray(localJob?.areasToImprove) && localJob.areasToImprove.length > 0 && (
                                            <div>
                                                <p className="mb-2 text-sm font-medium text-[#FF7000] flex items-center gap-1">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                    Skills to Develop
                                                </p>
                                                <ul className="space-y-2">
                                                    {localJob.areasToImprove.map((reason, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-[#1F2937]">
                                                            <ArrowUpRight className="h-4 w-4 text-[#FF7000] mt-0.5 flex-shrink-0" />
                                                            <span className="leading-relaxed">{reason}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="relative bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] rounded-lg border-2 border-dashed border-gray-300 overflow-hidden min-h-[180px]">
                                <div className="absolute inset-0 flex items-center justify-center p-4 rounded-lg backdrop-blur-sm bg-white/60">
                                    <div className="max-w-md text-center">
                                        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#FF7000] rounded-full mb-3">
                                            <LockIcon className="text-white w-7 h-7" />
                                        </div>
                                        <h3 className="text-base font-semibold text-[#0F151D] mb-2">AI Match Analysis Locked</h3>
                                        <p className="text-xs text-[#4B5563] mb-3 px-4">
                                            Upgrade to Premium to unlock personalized AI insights, match scores, and skill recommendations for every job.
                                        </p>
                                    </div>
                                </div>
                                <div className="p-5 pointer-events-none filter blur-[7px]">
                                    <div className="flex items-center gap-2 mb-4">
                                        <TrendingUp className="w-5 h-5 text-gray-400" />
                                        <h3 className="font-semibold text-gray-400">AI Match Analysis</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-400">Why You're a Great Fit</p>
                                        <ul className="space-y-2">
                                            <li className="flex items-start gap-2 text-sm text-[#1F2937]">
                                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="leading-relaxed">If you want this CTA to open an in-app modal or to surface a trial offer</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-sm text-[#1F2937]">
                                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="leading-relaxed">If you want this CTA to open an in-app modal or to surface a trial offer</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-sm text-[#1F2937]">
                                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="leading-relaxed">If you want this CTA to open an in-app modal or to surface a trial offer</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <h3 className="font-semibold text-[#0F151D] mb-3">Job Description</h3>
                            <p className="text-sm text-[#4B5563] leading-relaxed">{localJob?.description || localJob?.summary || ''}</p>
                        </div>

                        {/* Requirements */}
                        {Array.isArray(localJob?.requirements) && localJob.requirements.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-[#0F151D] mb-3">Requirements</h3>
                                <ul className="space-y-2">
                                    {localJob.requirements.map((req, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-[#4B5563]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#FF7000] mt-2 flex-shrink-0" />
                                            <span>{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Culture */}
                        {Array.isArray(localJob?.culture) && localJob.culture.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-[#0F151D] mb-3">Company Culture</h3>
                                <div className="flex flex-wrap gap-2">
                                    {localJob.culture.map((tag, idx) => (
                                        <Badge key={`${tag}-${idx}`} variant="outline">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t">
                            <Button
                                className="flex-1 bg-[#FF7000] hover:bg-[#FF7000]/90 text-white h-12 text-base"
                                onClick={() => handleApply('')}
                                disabled={applying || localJob?.applicationStatus === 'applied'}
                            >
                                {localJob?.applicationStatus === 'applied' ? 'Applied' : (applying ? 'Applying...' : 'Apply Now')}
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                className="w-12 h-12"
                                onClick={handleToggleSave}
                                aria-label={isSaved ? 'Unsave job' : 'Save job'}
                            >
                                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-[#FF7000]' : ''}`} />
                            </Button>

                            <Button variant="outline" size="icon" className="w-12 h-12" aria-label="Share job" onClick={() => {
                                try {
                                    const url = `${window.location.origin}/jobs?id=${job.id}`;
                                    navigator.clipboard.writeText(url);
                                    toast.success('Success', {
                                        description: "Job link copied to clipboard"
                                    });
                                } catch (e) {
                                    toast.error("Error", {
                                        description: 'Failed to copy link'
                                    });
                                }
                            }}>
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
};

export default JobDetailsSheet;