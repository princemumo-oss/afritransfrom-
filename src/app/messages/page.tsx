import { MainLayout } from '@/components/main-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { conversations, users } from '@/lib/data';
import { Send, Smile } from 'lucide-react';

export default function MessagesPage() {
    const currentUser = users.find(u => u.name === 'You');
    const selectedConversation = conversations[0]; // mock selected conversation

    return (
        <MainLayout>
            <div className="grid h-[calc(100vh-8rem)] w-full grid-cols-1 gap-4 md:grid-cols-[300px_1fr]">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Messages</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <ScrollArea className="h-full">
                            <div className="flex flex-col gap-1 p-2">
                                {conversations.map(convo => (
                                    <button
                                        key={convo.id}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:bg-accent hover:text-accent-foreground ${convo.id === selectedConversation.id ? 'bg-accent text-accent-foreground' : ''}`}
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={convo.participant.avatarUrl} alt={convo.participant.name} />
                                            <AvatarFallback>{convo.participant.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 truncate">
                                            <div className="font-medium">{convo.participant.name}</div>
                                            <div className="text-sm text-muted-foreground">{convo.lastMessage}</div>
                                        </div>
                                        <div className="text-xs text-muted-foreground">{convo.lastMessageTimestamp}</div>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader className="flex flex-row items-center border-b">
                         <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={selectedConversation.participant.avatarUrl} alt={selectedConversation.participant.name} />
                                <AvatarFallback>{selectedConversation.participant.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{selectedConversation.participant.name}</div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-4">
                            {selectedConversation.messages.map(message => (
                                <div key={message.id} className={`flex items-end gap-2 ${message.sender.id === currentUser?.id ? 'justify-end' : ''}`}>
                                    {message.sender.id !== currentUser?.id && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={message.sender.avatarUrl} alt={message.sender.name} />
                                            <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`max-w-xs rounded-lg p-3 lg:max-w-md ${message.sender.id === currentUser?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        <p>{message.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <div className="border-t p-4">
                        <form className="relative">
                            <Input placeholder="Type a message..." className="pr-20" />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-10 top-1/2 -translate-y-1/2">
                                <Smile className="h-5 w-5" />
                            </Button>
                            <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2">
                                <Send className="h-5 w-5" />
                            </Button>
                        </form>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
