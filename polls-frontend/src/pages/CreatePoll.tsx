import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePoll } from '../api/polls';
import { PollForm } from '../components/PollForm';
import { CreatePollFormData } from '../utils/validators';

export const CreatePoll: React.FC = () => {
  const navigate = useNavigate();
  const createPollMutation = useCreatePoll();

  const handleSubmit = async (data: CreatePollFormData) => {
    try {
      // Transform form data to API format
      const apiData = {
        ...data,
        options: data.options.map(option => option.text)
      };
      const poll = await createPollMutation.mutateAsync(apiData);
      navigate(`/polls/${poll.id}`, {
        state: { message: 'Poll created successfully!' }
      });
    } catch (error) {
      console.error('Failed to create poll:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <h1 className="text-3xl font-bold text-gray-900">Create a new poll</h1>
            <p className="mt-2 text-sm text-gray-600">
              Design a poll and share it with your audience
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PollForm
          onSubmit={handleSubmit}
          isLoading={createPollMutation.isPending}
        />
      </main>
    </div>
  );
};
