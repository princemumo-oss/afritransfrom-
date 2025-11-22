
'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type User } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Trash } from 'lucide-react';
import { Separator } from './ui/separator';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  handle: z.string().min(3, 'Handle must be at least 3 characters.').regex(/^[a-zA-Z0-9_]+$/, 'Handle can only contain letters, numbers, and underscores.'),
  bio: z.string().max(160, 'Bio must be 160 characters or less').optional(),
  location: z.string().optional(),
  website: z.string().url('Please enter a valid URL').or(z.literal('')).optional(),
  work: z.object({
    company: z.string().optional(),
    position: z.string().optional(),
  }).optional(),
  education: z.object({
    school: z.string().optional(),
    degree: z.string().optional(),
  }).optional(),
  relationshipStatus: z.enum(['Single', 'In a relationship', 'Engaged', 'Married', 'Complicated', '']).optional(),
  hobbies: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  family: z.array(z.object({
    relation: z.string().min(1, 'Relation is required'),
    name: z.string().min(1, 'Name is required'),
  })).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate: (updatedUser: User) => void;
}

export function EditProfileDialog({
  user,
  open,
  onOpenChange,
  onProfileUpdate,
}: EditProfileDialogProps) {
  const { toast } = useToast();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      ...user,
      hobbies: user.hobbies?.join(', '),
      relationshipStatus: user.relationshipStatus || '',
      family: user.family || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "family",
  });

  function onSubmit(data: ProfileFormValues) {
    const updatedUser = { ...user, ...data };
    onProfileUpdate(updatedUser);
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been successfully saved.',
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="handle"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Handle</FormLabel>
                    <FormControl>
                        <Input placeholder="your_handle" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us a little bit about yourself" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <Separator />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                            <Input placeholder="City, Country" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                            <Input placeholder="https://your-website.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="work.position"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                            <Input placeholder="Your job title" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="work.company"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                            <Input placeholder="Company name" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="education.degree"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Degree</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Computer Science" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="education.school"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>School</FormLabel>
                        <FormControl>
                            <Input placeholder="Name of your university" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="relationshipStatus"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Relationship Status</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your status" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Single">Single</SelectItem>
                                <SelectItem value="In a relationship">In a relationship</SelectItem>
                                <SelectItem value="Engaged">Engaged</SelectItem>
                                <SelectItem value="Married">Married</SelectItem>
                                <SelectItem value="Complicated">Complicated</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="hobbies"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Hobbies</FormLabel>
                        <FormControl>
                            <Input placeholder="Reading, coding, hiking" {...field} />
                        </FormControl>
                        <FormDescription>
                            Enter a comma-separated list of your hobbies.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
             </div>
            
            <Separator />

            <div>
                <FormLabel>Family Members</FormLabel>
                <div className="space-y-4 mt-2">
                    {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <FormField
                            control={form.control}
                            name={`family.${index}.relation`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder="Relation (e.g., Brother)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`family.${index}.name`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder="Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => remove(index)}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ relation: '', name: '' })}
                    >
                        Add Family Member
                    </Button>
                </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
