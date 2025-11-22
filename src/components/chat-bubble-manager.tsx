"use client";

import { useChatBubbles } from "@/hooks/use-chat-bubbles";
import { ChatBubble } from "./chat-bubble";

export function ChatBubbleManager() {
  const { bubbles, removeBubble } = useChatBubbles();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {bubbles.map((bubble) => (
        <ChatBubble
          key={bubble.id}
          message={bubble}
          onClose={removeBubble}
        />
      ))}
    </div>
  );
}
