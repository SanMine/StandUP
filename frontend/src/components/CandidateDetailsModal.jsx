import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
    CheckCircle2,
    ArrowUpRight,
    Lightbulb,
    Mail,
    MapPin,
    Calendar,
    TrendingUp,
    Briefcase
} from 'lucide-react';

const CandidateDetailsModal = ({ open, onClose, candidate }) => {
    if (!candidate) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Candidate Match Analysis</DialogTitle>
                    <DialogDescription>
                        AI-powered analysis of {candidate.name}'s profile
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-6">
                    {/* Candidate Header */}
                    <div className="flex items-start gap-4">
                        <Avatar className="w-20 h-20 border-4 border-[#FFE4CC]">
                            <AvatarImage src={candidate.avatar} alt={candidate.name} />
                            <AvatarFallback className="bg-[#E8F0FF] text-[#284688] text-2xl">
                                {candidate.name?.charAt(0) || 'C'}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-[#0F151D] mb-1">
                                {candidate.name}
                            </h3>
                            <p className="text-[#4B5563] mb-2 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {candidate.email}
                            </p>

                            <div className="flex items-center gap-4">
                                {candidate.desired_positions && candidate.desired_positions.length > 0 && (
                                    <div className="flex items-center gap-1 text-sm text-[#4B5563]">
                                        <Briefcase className="w-4 h-4" />
                                        {candidate.desired_positions[0]}
                                    </div>
                                )}
                                {candidate.graduation && (
                                    <div className="flex items-center gap-1 text-sm text-[#4B5563]">
                                        <Calendar className="w-4 h-4" />
                                        Graduates {new Date(candidate.graduation).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    {candidate.bio && (
                        <div>
                            <h4 className="font-semibold text-[#0F151D] mb-2">About</h4>
                            <p className="text-[#4B5563] text-sm leading-relaxed">{candidate.bio}</p>
                        </div>
                    )}

                    {/* Skills */}
                    {candidate.skills && candidate.skills.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-[#0F151D] mb-3">Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {candidate.skills.map((skill, idx) => (
                                    <Badge key={idx} className="bg-[#E8F0FF] text-[#284688] hover:bg-[#E8F0FF]">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Matched Jobs */}
                    {candidate.matched_jobs && candidate.matched_jobs.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-[#0F151D] mb-3 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-[#FF7000]" />
                                Matched Positions
                            </h4>
                            <div className="space-y-2">
                                {candidate.matched_jobs.map((job, idx) => (
                                    <div key={idx} className="bg-[#FFFDFA] p-3 rounded-lg border border-[#FFE4CC]">
                                        <p className="text-sm font-medium text-[#0F151D]">{job}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Analysis */}
                    <div className="bg-gradient-to-br from-[#FFFDFA] to-[#FFF7ED] rounded-lg p-5 border border-orange-100">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-[#FF7000]" />
                            <h3 className="font-semibold text-[#0F151D]">AI Match Analysis</h3>
                        </div>

                        <div className="space-y-5">
                            {/* Strong Match Reasons */}
                            {candidate.strong_match_reasons && candidate.strong_match_reasons.length > 0 && (
                                <div>
                                    <p className="flex items-center gap-2 mb-3 text-sm font-medium text-green-700">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Why This Candidate is a Great Fit
                                    </p>
                                    <ul className="space-y-2">
                                        {candidate.strong_match_reasons.map((reason, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-[#1F2937]">
                                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="leading-relaxed">{reason}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Areas to Improve */}
                            {candidate.areas_to_improve && candidate.areas_to_improve.length > 0 && (
                                <div>
                                    <p className="mb-3 text-sm font-medium text-[#FF7000] flex items-center gap-2">
                                        <ArrowUpRight className="w-4 h-4" />
                                        Areas for Development
                                    </p>
                                    <ul className="space-y-2">
                                        {candidate.areas_to_improve.map((area, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-[#1F2937]">
                                                <ArrowUpRight className="h-4 w-4 text-[#FF7000] mt-0.5 flex-shrink-0" />
                                                <span className="leading-relaxed">{area}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Key Considerations */}
                            {candidate.key_considerations && candidate.key_considerations.length > 0 && (
                                <div>
                                    <p className="flex items-center gap-2 mb-3 text-sm font-medium text-blue-700">
                                        <Lightbulb className="w-4 h-4" />
                                        Key Considerations
                                    </p>
                                    <ul className="space-y-2">
                                        {candidate.key_considerations.map((consideration, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-[#1F2937]">
                                                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <span className="leading-relaxed">{consideration}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Strength */}
                    {candidate.profile_strength && (
                        <div>
                            <h4 className="font-semibold text-[#0F151D] mb-2">Profile Strength</h4>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-3 bg-gray-200 rounded-full">
                                    <div
                                        className="bg-gradient-to-r from-[#FF7000] to-[#FF9500] h-3 rounded-full transition-all"
                                        style={{ width: `${candidate.profile_strength}%` }}
                                    />
                                </div>
                                <span className="text-sm font-semibold text-[#0F151D] min-w-[45px]">
                                    {candidate.profile_strength}%
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            className="flex-1  bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white hover: bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white/90 text-white"
                            onClick={() => window.location.href = `mailto:${candidate.email}`}
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            Contact Candidate
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CandidateDetailsModal;