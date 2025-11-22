
import { ChatbotInterface } from "@/components/chatbot-interface";

export default function JanetChatPage() {
    return (
        <ChatbotInterface
            persona="janet"
            personaName="JANET"
            personaAvatarUrl="/bot-avatar.png"
            welcomeMessage="Oh, look. A new user. I'm JANET, which stands for Just Another Needless Electronic Thing. What do you want?"
            title="Chat with JANET"
            description="Your sarcastic and self-aware AI companion."
        />
    )
}
