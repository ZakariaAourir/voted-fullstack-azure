import React, { useState, useEffect } from 'react';
import { Poll } from '../types';

interface VoteOptionsProps {
  poll: Poll;
  onVote: (optionId: number) => void;
  isLoading?: boolean;
}

export const VoteOptions: React.FC<VoteOptionsProps> = ({
  poll,
  onVote,
  isLoading = false
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // Pre-select the user's previous vote when the component mounts or poll changes
  useEffect(() => {
    if (poll.userVote) {
      setSelectedOption(poll.userVote);
    }
  }, [poll.userVote]);

  const handleOptionClick = (optionId: number) => {
    if (!poll.hasVoted && !isLoading) {
      setSelectedOption(optionId);
    }
  };

  const handleSubmit = () => {
    if (selectedOption !== null && !poll.hasVoted && !isLoading) {
      onVote(selectedOption);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {poll.options && poll.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            disabled={poll.hasVoted || isLoading}
            className={`
              w-full text-left px-5 py-4 rounded-xl border-2 font-medium text-gray-900 transition-all
              ${poll.hasVoted || isLoading
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                : selectedOption === option.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
              }
              ${poll.userVote === option.id ? 'border-green-500 bg-green-50' : ''}
            `}
          >
            <div className="flex items-center justify-between">
              <span className="text-base">{option.text}</span>
              {selectedOption === option.id && !poll.hasVoted && (
                <div className="w-5 h-5 rounded-full border-2 border-blue-600 bg-blue-600 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {poll.userVote === option.id && (
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>

      {!poll.hasVoted && (
        <button
          onClick={handleSubmit}
          disabled={isLoading || selectedOption === null}
          className="w-full mt-6 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-base"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : selectedOption === null ? (
            'Select an option to vote'
          ) : (
            'Submit your vote'
          )}
        </button>
      )}

      {poll.hasVoted && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-green-800">You've already voted on this poll</span>
          </div>
        </div>
      )}
    </div>
  );
};
