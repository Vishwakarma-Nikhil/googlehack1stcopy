import { create } from "zustand";

type ChatAIStore = {
  isOpen: boolean;
  isTranscriptOpen: boolean;
  drawerOpen: boolean;
  selectedSession: string | null;

  openAssistant: () => void;
  closeAssistant: () => void;
  openTranscript: () => void;
  closeTranscript: () => void;
  setDrawerOpen: (state: boolean) => void;
  setSelectedSession: (id: string) => void;
};

export const useChatAIStore = create<ChatAIStore>((set) => ({
  isOpen: false,
  isTranscriptOpen: false,
  drawerOpen: true,
  selectedSession: "default", // You can change this to null if you want to start without a session

  openAssistant: () => set({ isOpen: true }),
  closeAssistant: () => set({ isOpen: false }),
  openTranscript: () => set({ isTranscriptOpen: true }),
  closeTranscript: () => set({ isTranscriptOpen: false }),
  setDrawerOpen: (state) => set({ drawerOpen: state }),
  setSelectedSession: (id) => set({ selectedSession: id }),
}));
