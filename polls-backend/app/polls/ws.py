from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
from app.schemas import PollUpdateMessage


class ConnectionManager:
    def __init__(self):
        # Dictionary to store connections by poll_id
        self.active_connections: Dict[int, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, poll_id: int):
        await websocket.accept()
        if poll_id not in self.active_connections:
            self.active_connections[poll_id] = []
        self.active_connections[poll_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, poll_id: int):
        if poll_id in self.active_connections:
            self.active_connections[poll_id].remove(websocket)
            if not self.active_connections[poll_id]:
                del self.active_connections[poll_id]
    
    async def broadcast_to_poll(self, poll_id: int, message: PollUpdateMessage):
        if poll_id in self.active_connections:
            # Create a copy of the list to avoid modification during iteration
            connections = self.active_connections[poll_id].copy()
            for connection in connections:
                try:
                    await connection.send_text(json.dumps(message.dict()))
                except:
                    # Remove disconnected connections
                    if connection in self.active_connections[poll_id]:
                        self.active_connections[poll_id].remove(connection)


manager = ConnectionManager()


async def websocket_endpoint(websocket: WebSocket, poll_id: int):
    await manager.connect(websocket, poll_id)
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            # Echo back or handle any client messages if needed
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, poll_id)

