import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TeamMember } from '../types';

interface TeamStore {
  members: TeamMember[];
  addMember: (member: TeamMember) => void;
  updateMember: (id: string, member: TeamMember) => void;
  deleteMember: (id: string) => void;
  setMembers: (members: TeamMember[]) => void;
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      members: [],
      addMember: (member) =>
        set((state) => ({ members: [...state.members, member] })),
      updateMember: (id, updatedMember) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? updatedMember : m
          ),
        })),
      deleteMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        })),
      setMembers: (members) => set({ members }),
    }),
    {
      name: 'team-members-storage',
    }
  )
);