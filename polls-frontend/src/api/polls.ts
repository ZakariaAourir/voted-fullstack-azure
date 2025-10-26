import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './config';
import { 
  Poll, 
  CreatePollRequest, 
  VoteRequest, 
  PollsQuery 
} from '../types';

// Polls API functions
export const pollsApi = {
  getPolls: async (query: PollsQuery = {}): Promise<Poll[]> => {
    const params = new URLSearchParams();
    if (query.search) params.append('search', query.search);
    if (query.page) params.append('skip', (((query.page || 1) - 1) * (query.limit || 10)).toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const response = await api.get(`/polls/?${params.toString()}`);
    return response.data;
  },

  getPoll: async (id: string): Promise<Poll> => {
    const response = await api.get(`/polls/${id}`);
    return response.data;
  },

  createPoll: async (data: CreatePollRequest): Promise<Poll> => {
    const response = await api.post('/polls/', data);
    return response.data;
  },

  vote: async (pollId: string, data: VoteRequest): Promise<any> => {
    const response = await api.post(`/polls/${pollId}/vote`, data);
    return response.data;
  },

  getPollResults: async (id: string): Promise<any> => {
    const response = await api.get(`/polls/${id}/results`);
    return response.data;
  },

  getMyPolls: async (query: PollsQuery = {}): Promise<Poll[]> => {
    const params = new URLSearchParams();
    if (query.search) params.append('search', query.search);
    if (query.page) params.append('skip', (((query.page || 1) - 1) * (query.limit || 10)).toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const response = await api.get(`/polls/me?${params.toString()}`);
    return response.data;
  },
};

// React Query hooks for polls
export const usePolls = (query: PollsQuery = {}) => {
  return useQuery({
    queryKey: ['polls', query],
    queryFn: () => pollsApi.getPolls(query),
  });
};

export const usePoll = (id: string) => {
  return useQuery({
    queryKey: ['poll', id],
    queryFn: () => pollsApi.getPoll(id),
    enabled: !!id,
  });
};

export const useCreatePoll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pollsApi.createPoll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['my-polls'] });
    },
  });
};

export const useVote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pollId, data }: { pollId: string; data: VoteRequest }) =>
      pollsApi.vote(pollId, data),
    onSuccess: (_, { pollId }) => {
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['my-polls'] });
    },
  });
};

export const usePollResults = (id: string) => {
  return useQuery({
    queryKey: ['poll-results', id],
    queryFn: () => pollsApi.getPollResults(id),
    enabled: !!id,
    refetchInterval: 5000, // Poll every 5 seconds as fallback
  });
};

export const useMyPolls = (query: PollsQuery = {}) => {
  return useQuery({
    queryKey: ['my-polls', query],
    queryFn: () => pollsApi.getMyPolls(query),
  });
};
