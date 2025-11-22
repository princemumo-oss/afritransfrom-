"use client";

import { useChatBubbles } from "@/hooks/use-chat-bubbles";
import { ChatBubble } from "./chat-bubble";
import { useEffect } from "react";
import { users } from "@/lib/data";


const sampleMessages = [
    "Hey, check out this new feature! It's awesome.",
    "Anyone seen the new movie? I'm dying to talk about it.",
    "Just got back from a hike. So refreshing!",
    "What's everyone having for dinner tonight?",
];

export function ChatBubbleManager() {
  const { bubbles, addBubble, removeBubble } = useChatBubbles();

  // Demo effect to show some bubbles on load
  useEffect(() => {
    let bubbleCount = 0;
    const interval = setInterval(() => {
        if(bubbleCount >= 3) {
            clearInterval(interval);
            return;
        }

        const randomUser = users[Math.floor(Math.random() * (users.length - 1))];
        const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];

        addBubble({
            user: randomUser,
            text: randomMessage
        });
        bubbleCount++;
    }, 5000); // Add a new bubble every 5 seconds

    return () => clearInterval(interval);
  }, [addBubble]);


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
