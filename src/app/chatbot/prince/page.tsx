
import { ChatbotInterface } from "@/components/chatbot-interface";

export default function PrinceChatPage() {
    return (
        <ChatbotInterface
            persona="prince"
            personaName="Prince"
            personaAvatarUrl="/prince-avatar.png" 
            welcomeMessage="Hello! I am Prince, your AI assistant. How can I help you today?"
            title="Chat with Prince"
            description="Your helpful and knowledgeable AI assistant."
        />
    )
}
