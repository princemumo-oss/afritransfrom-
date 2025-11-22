
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { type User } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Smile } from 'lucide-react';

const moodSchema = z.object({
  emoji: z.string().min(1, 'Emoji is required.'),
  text: z.string().max(80, 'Status must be 80 characters or less.').optional(),
});

type MoodFormValues = z.infer<typeof moodSchema>;

interface SetMoodDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMoodUpdate: (mood: User['mood']) => void;
}

export function SetMoodDialog({
  user,
  open,
  onOpenChange,
  onMoodUpdate,
}: SetMoodDialogProps) {
  const { toast } = useToast();
  const form = useForm<MoodFormValues>({
    resolver: zodResolver(moodSchema),
    defaultValues: {
      emoji: user.mood?.emoji || '',
      text: user.mood?.text || '',
    },
  });

  function onSubmit(data: MoodFormValues) {
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
    onMoodUpdate({ ...data, expiresAt });
    toast({
      title: 'Mood Updated!',
      description: 'Your new mood has been set for 24 hours.',
    });
    onOpenChange(false);
  }
  
  function onClearMood() {
      onMoodUpdate(undefined);
      toast({
        title: 'Mood Cleared',
        description: 'Your mood has been removed.',
      });
      onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Your Mood</DialogTitle>
          <DialogDescription>
            Choose an emoji and a short status. Your mood will be visible for 24 hours.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emoji</FormLabel>
                  <FormControl>
                    <Input placeholder="✨" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Feeling great today!" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className='pt-4'>
                <Button type="button" variant="outline" onClick={onClearMood}>Clear Mood</Button>
                <Button type="submit">
                    <Smile className="mr-2 h-4 w-4" />
                    Set Mood
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
