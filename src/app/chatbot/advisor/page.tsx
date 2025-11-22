
import { ChatbotInterface } from "@/components/chatbot-interface";

export default function AdvisorChatPage() {
    return (
        <ChatbotInterface
            persona="advisor"
            personaName="AI Advisor"
            personaAvatarUrl="/advisor-avatar.png" // You might want to create a different avatar for the advisor
            welcomeMessage="Hello! I am your AI Advisor. How can I assist you today?"
            title="AI Advisor"
            description="Your helpful and knowledgeable AI assistant."
        />
    )
}
