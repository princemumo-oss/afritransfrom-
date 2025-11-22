
'use client';

import { useState } from 'react';
import { type User, type Question } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, CornerDownRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

interface QnaSectionProps {
    user: User;
    isCurrentUserProfile: boolean;
    onQuestionSubmit: (questionText: string) => void;
    onAnswerSubmit: (questionId: string, answerText: string) => void;
}

function QuestionCard({ question, user, isCurrentUserProfile, onAnswerSubmit }: { question: Question, user: User, isCurrentUserProfile: boolean, onAnswerSubmit: (questionId: string, answerText: string) => void }) {
    const [answer, setAnswer] = useState('');
    const [isAnswering, setIsAnswering] = useState(false);
    const { toast } = useToast();

    const handleAnswer = () => {
        if (!answer.trim()) {
            toast({
                variant: 'destructive',
                title: "Answer can't be empty",
                description: 'Please write an answer before submitting.',
            });
            return;
        }
        onAnswerSubmit(question.id, answer);
        setIsAnswering(false);
        setAnswer('');
        toast({ title: 'Answer submitted!' });
    };

    return (
        <div className="flex gap-4">
            <Avatar className="h-10 w-10">
                <AvatarImage src={question.questioner.avatarUrl} alt={question.questioner.name} />
                <AvatarFallback>{question.questioner.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold">{question.questioner.name}</p>
                        <p className="text-xs text-muted-foreground">@{question.questioner.handle}</p>
                        <p className="text-xs text-muted-foreground">&middot; {question.timestamp}</p>
                    </div>
                    <p>{question.questionText}</p>
                </div>
                {question.answerText ? (
                    <div className="flex gap-4 rounded-md bg-accent/50 p-3">
                         <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm">{question.answerText}</p>
                        </div>
                    </div>
                ) : isCurrentUserProfile && !isAnswering ? (
                    <Button variant="ghost" size="sm" onClick={() => setIsAnswering(true)}>
                        <CornerDownRight className="mr-2 h-4 w-4" />
                        Answer
                    </Button>
                ) : null}

                {isCurrentUserProfile && isAnswering && (
                    <div className="space-y-2">
                        <Textarea
                            placeholder={`Answer ${question.questioner.name}'s question...`}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsAnswering(false)}>Cancel</Button>
                            <Button onClick={handleAnswer}>Submit Answer</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export function QnaSection({ user, isCurrentUserProfile, onQuestionSubmit, onAnswerSubmit }: QnaSectionProps) {
    const [question, setQuestion] = useState('');
    const { toast } = useToast();

    const handleAskQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) {
            toast({
                variant: 'destructive',
                title: "Question can't be empty",
                description: 'Please write a question before submitting.',
            });
            return;
        }
        onQuestionSubmit(question);
        setQuestion('');
        toast({ title: 'Question submitted!' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ask Me Anything</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {!isCurrentUserProfile && (
                    <form onSubmit={handleAskQuestion}>
                        <div className="flex gap-4">
                            <Textarea
                                placeholder={`Ask ${user.name} a question...`}
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                className="min-h-12"
                            />
                            <Button type="submit" size="icon">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                )}
                {user.questions && user.questions.length > 0 ? (
                    user.questions
                        .slice().reverse() // Show newest first
                        .map((q, index) => (
                            <div key={q.id}>
                                <QuestionCard 
                                    question={q} 
                                    user={user}
                                    isCurrentUserProfile={isCurrentUserProfile}
                                    onAnswerSubmit={onAnswerSubmit}
                                />
                                {index < user.questions!.length - 1 && <Separator className="my-6" />}
                            </div>
                        ))
                ) : (
                    <div className="p-6 text-center text-muted-foreground">
                        {isCurrentUserProfile ? "You haven't been asked any questions yet." : `Be the first to ask ${user.name} a question!`}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
