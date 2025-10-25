import React from 'react';
import { PollUpdateMessage } from '../types';
import { config } from '../config/env';

const WS_BASE = config.wsBase;

export class PollWebSocket {
  private ws: WebSocket | null = null;
  private pollId: string;
  private onUpdate: (message: PollUpdateMessage) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(pollId: string, onUpdate: (message: PollUpdateMessage) => void) {
    this.pollId = pollId;
    this.onUpdate = onUpdate;
  }

  connect(): void {
    try {
      const wsUrl = `${WS_BASE}/ws/polls/${this.pollId}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: PollUpdateMessage = JSON.parse(event.data);
          this.onUpdate(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Hook for using WebSocket in components
export const usePollWebSocket = (
  pollId: string,
  onUpdate: (message: PollUpdateMessage) => void
) => {
  const wsRef = React.useRef<PollWebSocket | null>(null);

  React.useEffect(() => {
    if (pollId) {
      wsRef.current = new PollWebSocket(pollId, onUpdate);
      wsRef.current.connect();

      return () => {
        wsRef.current?.disconnect();
      };
    }
  }, [pollId, onUpdate]);

  return {
    isConnected: wsRef.current?.isConnected() || false,
    disconnect: () => wsRef.current?.disconnect(),
  };
};
