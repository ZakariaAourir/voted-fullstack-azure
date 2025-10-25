import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePoll, useVote, usePollResults } from '../api/polls';
import { VoteOptions } from '../components/VoteOptions';
import { ResultsChart } from '../components/ResultsChart';
import { usePollWebSocket } from '../utils/websocket';
import { PollUpdateMessage } from '../types';

export const PollDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isRealTime, setIsRealTime] = useState(false);
  const [showVoteSuccess, setShowVoteSuccess] = useState(false);
  
  const { data: poll, isLoading, error } = usePoll(id!);
  const { data: results, refetch: refetchResults } = usePollResults(id!);
  const voteMutation = useVote();

  // WebSocket for real-time updates
  const handleWebSocketUpdate = (_message: PollUpdateMessage) => {
    setIsRealTime(true);
    refetchResults();
  };

  const { isConnected } = usePollWebSocket(id!, handleWebSocketUpdate);

  const handleVote = async (optionId: number) => {
    if (!id) return;
    
    try {
      await voteMutation.mutateAsync({ pollId: id, data: { option_id: optionId } });
      setShowVoteSuccess(true);
      setTimeout(() => setShowVoteSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const currentPoll = results || poll;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600 text-sm">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error || !currentPoll) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Poll not found</h3>
          <p className="mt-2 text-sm text-gray-500">
            The poll you're looking for doesn't exist or has been removed.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Go back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-gray-900 hover:text-gray-700">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </Link>
            {isConnected && (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">Live</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        {showVoteSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-green-900">Vote submitted successfully!</p>
                <p className="text-xs text-green-700 mt-0.5">Your vote has been recorded and results have been updated.</p>
              </div>
            </div>
          </div>
        )}

        {/* Poll Title & Description */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">
            {currentPoll.title}
          </h1>
          <p className="text-sm text-gray-500">
            Asked by <span className="text-gray-700 font-medium">User #{currentPoll.owner_id}</span> · {new Date(currentPoll.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Voting or Results */}
        {!currentPoll.hasVoted ? (
          <div className="mb-8">
            <VoteOptions
              poll={currentPoll}
              onVote={handleVote}
              isLoading={voteMutation.isPending}
            />
          </div>
        ) : (
          <div className="mb-8">
            <ResultsChart 
              poll={currentPoll} 
              isRealTime={isRealTime}
            />
          </div>
        )}

        {/* Vote Count Card */}
        <div className="mt-12 bg-gray-50 rounded-xl p-6 text-center">
          <div className="text-sm font-medium text-gray-500 mb-1">Votes</div>
          <div className="text-4xl font-bold text-gray-900">
            {currentPoll.total_votes?.toLocaleString() || 0}
          </div>
        </div>

        {/* Share Section */}
        <div className="mt-8">
          <div className="text-sm font-medium text-gray-500 mb-3">Share</div>
          <div className="space-y-2">
            <button className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Share on X
            </button>
            <button className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Share on Facebook
            </button>
            <button className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 mr-3 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Share on WhatsApp
            </button>
            <button className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Share Link
            </button>
          </div>
        </div>

        {/* Report */}
        <div className="mt-8 text-center">
          <button className="text-sm text-gray-400 hover:text-gray-600">
            Report Poll
          </button>
        </div>
      </main>
    </div>
  );
};
