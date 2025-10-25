// User types
export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Poll types
export interface PollOption {
  id: number;
  text: string;
  votes_count: number;
}

export interface Poll {
  id: number;
  title: string;
  description: string;
  options: PollOption[];
  total_votes: number;
  created_at: string;
  owner_id: number;
  hasVoted?: boolean;
  userVote?: number; // optionId that user voted for
}

export interface CreatePollRequest {
  title: string;
  description: string;
  options: string[];
}

export interface VoteRequest {
  option_id: number;
}

export interface PollsResponse {
  polls: Poll[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PollsQuery {
  search?: string;
  page?: number;
  limit?: number;
}

// WebSocket types
export interface PollUpdateMessage {
  option_id: number;
  votes_count: number;
  total_votes: number;
  poll_id: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CreatePollFormData {
  title: string;
  description: string;
  options: string[];
}
