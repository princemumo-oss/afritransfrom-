import { create } from 'zustand';
import type { User } from '@/lib/data';

export type ChatBubbleMessage = {
    id: number;
    user: User;
    text: string;
};

type ChatBubbleStore = {
    bubbles: ChatBubbleMessage[];
    addBubble: (message: { user: User; text: string }) => void;
    removeBubble: (id: number) => void;
};

let nextId = 0;

export const useChatBubbles = create<ChatBubbleStore>((set) => ({
    bubbles: [],
    addBubble: (message) => {
        const newBubble: ChatBubbleMessage = {
            ...message,
            id: nextId++,
        };
        set((state) => ({ bubbles: [...state.bubbles, newBubble] }));
    },
    removeBubble: (id) => {
        set((state) => ({
            bubbles: state.bubbles.filter((bubble) => bubble.id !== id),
        }));
    },
}));
