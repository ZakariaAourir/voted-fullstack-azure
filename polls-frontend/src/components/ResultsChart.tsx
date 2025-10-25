import React from 'react';
import { Poll } from '../types';

interface ResultsChartProps {
  poll: Poll;
  isRealTime?: boolean;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4'];

export const ResultsChart: React.FC<ResultsChartProps> = ({
  poll,
  isRealTime = false
}) => {
  const totalVotes = poll.total_votes || 0;

  if (!poll.options || poll.options.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No options available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isRealTime && (
        <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Live results updating</span>
        </div>
      )}

      {totalVotes === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="mt-4 text-gray-500 font-medium">No votes yet</p>
          <p className="mt-1 text-sm text-gray-400">Be the first to vote!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {poll.options.map((option, index) => {
            const percentage = totalVotes > 0 
              ? Math.round((option.votes_count / totalVotes) * 100) 
              : 0;
            const color = COLORS[index % COLORS.length];

            return (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{option.text}</span>
                  <span className="font-semibold text-gray-700">{percentage}%</span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color
                      }}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {option.votes_count} {option.votes_count === 1 ? 'vote' : 'votes'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
