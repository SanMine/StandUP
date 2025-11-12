import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, Plus, Loader2 } from 'lucide-react';

// Zod validation schema
const jobSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  logo: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  location: z.string().min(2, 'Location is required'),
  type: z.enum(['Internship', 'Full-time', 'Part-time', 'Contract'], {
    required_error: 'Please select a job type',
  }),
  mode: z.enum(['Onsite', 'Hybrid', 'Remote'], {
    required_error: 'Please select a work mode',
  }),
  salary: z.string().optional(),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requirements: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  culture: z.array(z.string()).optional(),
  status: z.enum(['active', 'closed', 'draft']).optional(),
});

const JobModal = ({ open, onClose, onSubmit, initialData = null, isLoading = false }) => {
  const isEditMode = !!initialData;
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      company: '',
      logo: '',
      location: '',
      type: 'Full-time',
      mode: 'Onsite',
      salary: '',
      description: '',
      requirements: [],
      skills: [],
      culture: [],
      status: 'active',
    },
  });

  // Local state for dynamic fields
  const [requirementInput, setRequirementInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [cultureInput, setCultureInput] = useState('');
  
  const requirements = watch('requirements') || [];
  const skills = watch('skills') || [];
  const culture = watch('culture') || [];

  // Reset form when modal opens with initial data
  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          title: initialData.title || '',
          company: initialData.company || '',
          logo: initialData.logo || '',
          location: initialData.location || '',
          type: initialData.type || 'Full-time',
          mode: initialData.mode || 'Onsite',
          salary: initialData.salary || '',
          description: initialData.description || '',
          requirements: initialData.requirements || [],
          skills: initialData.skills?.map(s => typeof s === 'string' ? s : s.skill_name) || [],
          culture: initialData.culture || [],
          status: initialData.status || 'active',
        });
      } else {
        reset({
          title: '',
          company: '',
          logo: '',
          location: '',
          type: 'Full-time',
          mode: 'Onsite',
          salary: '',
          description: '',
          requirements: [],
          skills: [],
          culture: [],
          status: 'active',
        });
      }
    }
  }, [open, initialData, reset]);

  // Add requirement
  const addRequirement = () => {
    if (requirementInput.trim()) {
      setValue('requirements', [...requirements, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  // Remove requirement
  const removeRequirement = (index) => {
    setValue('requirements', requirements.filter((_, i) => i !== index));
  };

  // Add skill
  const addSkill = () => {
    if (skillInput.trim()) {
      setValue('skills', [...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  // Remove skill
  const removeSkill = (index) => {
    setValue('skills', skills.filter((_, i) => i !== index));
  };

  // Add culture
  const addCulture = () => {
    if (cultureInput.trim()) {
      setValue('culture', [...culture, cultureInput.trim()]);
      setCultureInput('');
    }
  };

  // Remove culture
  const removeCulture = (index) => {
    setValue('culture', culture.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="job-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {isEditMode ? 'Edit Job Posting' : 'Create New Job Posting'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the job details below' : 'Fill in the details to post a new job opportunity'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                data-testid="job-title-input"
                placeholder="e.g. Senior Frontend Developer"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                data-testid="job-company-input"
                placeholder="e.g. Tech Innovations Ltd."
                {...register('company')}
              />
              {errors.company && (
                <p className="text-sm text-red-500">{errors.company.message}</p>
              )}
            </div>
          </div>

          {/* Logo URL */}
          <div className="space-y-2">
            <Label htmlFor="logo">Company Logo URL</Label>
            <Input
              id="logo"
              data-testid="job-logo-input"
              type="url"
              placeholder="https://example.com/logo.png"
              {...register('logo')}
            />
            {errors.logo && (
              <p className="text-sm text-red-500">{errors.logo.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                data-testid="job-location-input"
                placeholder="e.g. Bangkok, Thailand"
                {...register('location')}
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location.message}</p>
              )}
            </div>

            {/* Job Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Job Type *</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger data-testid="job-type-select">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            {/* Work Mode */}
            <div className="space-y-2">
              <Label htmlFor="mode">Work Mode *</Label>
              <Controller
                name="mode"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger data-testid="job-mode-select">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Onsite">Onsite</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.mode && (
                <p className="text-sm text-red-500">{errors.mode.message}</p>
              )}
            </div>
          </div>

          {/* Salary */}
          <div className="space-y-2">
            <Label htmlFor="salary">Salary Range</Label>
            <Input
              id="salary"
              data-testid="job-salary-input"
              placeholder="e.g. $80,000 - $120,000 per year"
              {...register('salary')}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              data-testid="job-description-input"
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              rows={5}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label>Requirements</Label>
            <div className="flex gap-2">
              <Input
                data-testid="job-requirement-input"
                placeholder="Add a requirement"
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button
                type="button"
                onClick={addRequirement}
                size="sm"
                data-testid="add-requirement-btn"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {requirements.map((req, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {req}
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="ml-2 hover:text-red-500"
                    data-testid={`remove-requirement-${index}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Required Skills</Label>
            <div className="flex gap-2">
              <Input
                data-testid="job-skill-input"
                placeholder="Add a skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button
                type="button"
                onClick={addSkill}
                size="sm"
                data-testid="add-skill-btn"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1 bg-[#E8F0FF] text-[#284688]">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="ml-2 hover:text-red-500"
                    data-testid={`remove-skill-${index}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Culture */}
          <div className="space-y-2">
            <Label>Company Culture Tags</Label>
            <div className="flex gap-2">
              <Input
                data-testid="job-culture-input"
                placeholder="Add a culture tag"
                value={cultureInput}
                onChange={(e) => setCultureInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCulture())}
              />
              <Button
                type="button"
                onClick={addCulture}
                size="sm"
                data-testid="add-culture-btn"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {culture.map((cult, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1 bg-[#FFE4CC] text-[#FF7000]">
                  {cult}
                  <button
                    type="button"
                    onClick={() => removeCulture(index)}
                    className="ml-2 hover:text-red-500"
                    data-testid={`remove-culture-${index}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Status (only in edit mode) */}
          {isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger data-testid="job-status-select">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              data-testid="cancel-job-btn"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
              disabled={isLoading}
              data-testid="submit-job-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{isEditMode ? 'Update Job' : 'Create Job'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobModal;
