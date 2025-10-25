import React from 'react';
import { Link } from 'react-router-dom';
import { Poll } from '../types';

interface PollCardProps {
  poll: Poll;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

export const PollCard: React.FC<PollCardProps> = ({ poll }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getVotePercentage = (option: any) => {
    if (poll.total_votes === 0) return 0;
    return Math.round((option.votes_count / poll.total_votes) * 100);
  };

  return (
    <Link 
      to={`/polls/${poll.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {poll.title}
        </h3>
        <p className="text-xs text-gray-500">
          {formatDate(poll.created_at)} · User #{poll.owner_id}
        </p>
      </div>

      {/* Vote Distribution Chart */}
      {poll.options && poll.options.length > 0 ? (
        <div className="mb-4 space-y-3">
          {poll.options.slice(0, 3).map((option, index) => {
            const percentage = getVotePercentage(option);
            const color = COLORS[index % COLORS.length];
            
            return (
              <div key={option.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium truncate mr-2">{option.text}</span>
                  <span className="text-gray-600 font-semibold text-xs">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
              </div>
            );
          })}
          
          {poll.options.length > 3 && (
            <p className="text-xs text-gray-500 pt-1">
              +{poll.options.length - 3} more {poll.options.length - 3 === 1 ? 'option' : 'options'}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic mb-4">No options available</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{poll.total_votes || 0}</span>
            <span className="ml-1">{poll.total_votes === 1 ? 'vote' : 'votes'}</span>
          </div>
          {poll.options && poll.options.length > 0 && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-medium">{poll.options.length}</span>
              <span className="ml-1">{poll.options.length === 1 ? 'option' : 'options'}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {poll.hasVoted && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
              ✓ Voted
            </span>
          )}
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};
