import { useState } from 'react';
import toast from 'react-hot-toast';
import type { UseFormSetError } from 'react-hook-form';
import { apiClient } from '@/libs/api-client';
import { handleFormError } from '@/libs/error-handler';
import type { InterviewerResponseDto } from '@/types/interviewer';

import type { InterviewerCategory } from '@/types/interviewer';

export type InterviewerRegistrationFormData = {
  userId: string;
  category: InterviewerCategory;
};

export const useInterviewerRegistration = ({
  fetchUsers,
  setError,
}: {
  fetchUsers: () => Promise<void>;
  setError: (error: string | null) => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (
    data: InterviewerRegistrationFormData,
    setFormError: UseFormSetError<InterviewerRegistrationFormData>,
  ) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await apiClient<InterviewerResponseDto>('/interviewers', {
        method: 'POST',
        body: data,
      });

      await fetchUsers();
      setIsCreating(false);
      toast.success('面接官を登録しました');
    } catch (err) {
      handleFormError(err, setFormError, setError, '登録に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    isCreating,
    setIsCreating,
    handleCreate,
  };
};
