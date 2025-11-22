"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { ChatBubbleMessage } from "@/hooks/use-chat-bubbles";

type ChatBubbleProps = {
  message: ChatBubbleMessage;
  onClose: (id: number) => void;
  duration?: number;
};

export function ChatBubble({ message, onClose, duration = 10000 }: ChatBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    // Set timer to animate out
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
  };
  
  // After animation out, call the main close handler
  const onAnimationComplete = () => {
      if (!isVisible) {
          onClose(message.id);
      }
  }

  return (
      <AnimatePresence onExitComplete={onAnimationComplete}>
        {isVisible && (
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ ease: "easeInOut", duration: 0.4 }}
                layout
            >
                <Card className="w-80 overflow-hidden shadow-2xl">
                    <CardContent className="relative p-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-6 w-6"
                            onClick={handleClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 border">
                                <AvatarImage src={message.user.avatarUrl} alt={message.user.name} />
                                <AvatarFallback>{message.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold">{message.user.name}</p>
                                <p className="text-sm text-muted-foreground">{message.text}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        )}
     </AnimatePresence>
  );
}
