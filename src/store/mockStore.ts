import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CandidateInfo {
  name: string;
  email: string;
  role: string;
}

export interface Session {
  id: string;
  roomId: string;
  candidateName: string;
  status: 'idle' | 'running' | 'done';
  alerts: string[];
  compiled: boolean;
}

export interface Room {
  roomId: string;
  createdAt: number;
  candidate?: CandidateInfo;
  interviewer?: { name: string };
  sessions: Session[];
}

export interface Report {
  roomId: string;
  persona: { name: string; role: string };
  timeline: Array<{ t: string; event: string }>;
  warnings: string[];
}

interface MockStoreState {
  rooms: Record<string, Room>;
  reports: Record<string, Report>;
  settings: {
    aiThreshold: number;
    webhookUrl: string;
    micEnabled: boolean;
    cameraEnabled: boolean;
  };
  
  createRoom: () => string;
  updateCandidate: (roomId: string, candidate: CandidateInfo) => void;
  updateSettings: (settings: Partial<MockStoreState['settings']>) => void;
  updateSessionStatus: (roomId: string, sessionId: string, status: Session['status']) => void;
}

export const useMockStore = create<MockStoreState>()(
  persist(
    (set, get) => ({
      rooms: {},
      reports: {},
      settings: {
        aiThreshold: 75,
        webhookUrl: '',
        micEnabled: true,
        cameraEnabled: true,
      },
      
      createRoom: () => {
        const roomId = `SH-${Math.floor(1000 + Math.random() * 9000)}`;
        
        const newRoom: Room = {
          roomId,
          createdAt: Date.now(),
          sessions: [
            {
              id: `sess-${Date.now()}`,
              roomId,
              candidateName: 'Pending...',
              status: 'idle',
              alerts: [],
              compiled: false
            }
          ]
        };

        set((state) => ({
          rooms: { ...state.rooms, [roomId]: newRoom }
        }));
        
        return roomId;
      },
      
      updateCandidate: (roomId, candidate) => {
        set((state) => {
          const room = state.rooms[roomId];
          if (!room) return state;
          
          return {
            rooms: {
              ...state.rooms,
              [roomId]: {
                ...room,
                candidate,
                sessions: room.sessions.map((s, i) => i === 0 ? { ...s, candidateName: candidate.name } : s)
              }
            }
          };
        });
      },
      
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },
      
      updateSessionStatus: (roomId, sessionId, status) => {
        set((state) => {
          const room = state.rooms[roomId];
          if (!room) return state;
          
          return {
            rooms: {
              ...state.rooms,
              [roomId]: {
                ...room,
                sessions: room.sessions.map(s => s.id === sessionId ? { ...s, status, compiled: status === 'done' } : s)
              }
            }
          };
        });
      }
    }),
    {
      name: 'getaway-mock-storage',
    }
  )
);
