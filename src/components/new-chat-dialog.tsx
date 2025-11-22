'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquare } from 'lucide-react';
import { Input } from './ui/input';

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationSelect: (conversation: any) => void;
}

export function NewChatDialog({ open, onOpenChange, onConversationSelect }: NewChatDialogProps) {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState<string | null>(null);

  const usersQuery = useMemoFirebase(() => {
    if (!currentUser) return null;
    // Query for all users except the current one
    return query(collection(firestore, 'users'), where('id', '!=', currentUser.uid));
  }, [firestore, currentUser]);

  const { data: users, isLoading } = useCollection<User>(usersQuery);

  const filteredUsers = users?.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartChat = async (targetUser: User) => {
    if (!currentUser) return;
    setIsCreatingChat(targetUser.id);
    
    try {
        // Check if a conversation already exists
        const chatsRef = collection(firestore, 'chats');
        const q = query(chatsRef, where('members', 'array-contains', currentUser.uid));
        const querySnapshot = await getDocs(q);

        let existingConversation = null;
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.members.includes(targetUser.id)) {
                existingConversation = { id: doc.id, ...data };
            }
        });

        if (existingConversation) {
            const userSnap = await getDoc(doc(firestore, 'users', targetUser.id));
            onConversationSelect({ ...existingConversation, participant: userSnap.data() });
        } else {
            // Create a new conversation
            const newChatRef = await addDoc(chatsRef, {
                members: [currentUser.uid, targetUser.id],
                createdAt: serverTimestamp(),
                lastMessage: '',
                lastMessageTimestamp: null,
            });
            const userSnap = await getDoc(doc(firestore, 'users', targetUser.id));

            onConversationSelect({
                id: newChatRef.id,
                members: [currentUser.uid, targetUser.id],
                participant: userSnap.data(),
            });
        }
        
        onOpenChange(false);
    } catch(error) {
        console.error("Error starting chat:", error);
        toast({
            variant: 'destructive',
            title: 'Could not start chat',
            description: 'There was an error creating the conversation. Please try again.'
        });
    } finally {
        setIsCreatingChat(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>Select a user to start a conversation with.</DialogDescription>
        </DialogHeader>
        
        <Input 
            placeholder="Search for users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="max-h-[50vh] overflow-y-auto space-y-2 p-1">
            {isLoading && <div className="text-center p-4 text-muted-foreground">Loading users...</div>}
            {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                    <div key={user.id} className="flex items-center gap-4 rounded-md p-2 hover:bg-accent">
                        <Avatar>
                            <AvatarImage src={user.avatarUrl} alt={user.firstName}/>
                            <AvatarFallback>{user.firstName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-semibold">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-muted-foreground">@{user.handle}</p>
                        </div>
                        <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStartChat(user)}
                            disabled={isCreatingChat === user.id}
                        >
                            {isCreatingChat === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <MessageSquare className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                ))
            ) : !isLoading && (
                 <div className="text-center p-4 text-muted-foreground">No users found.</div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
