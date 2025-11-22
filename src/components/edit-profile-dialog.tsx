
'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Trash, Camera, CheckCircle, HelpCircle, DollarSign, Hourglass } from 'lucide-react';
import { Separator } from './ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

// Placeholder for your actual PayPal payment link
const VERIFICATION_PAYMENT_LINK = "https://www.paypal.com/paypalme/your-business-name";

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  handle: z.string().min(3, 'Handle must be at least 3 characters.').regex(/^[a-zA-Z0-9_]+$/, 'Handle can only contain letters, numbers, and underscores.'),
  bio: z.string().max(160, 'Bio must be 160 characters or less').optional(),
  pronouns: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url('Please enter a valid URL').or(z.literal('')).optional(),
  avatarUrl: z.string().optional(),
  coverPhotoUrl: z.string().optional(),
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
  onProfileUpdate: (updatedUser: Partial<User>) => void;
}

export function EditProfileDialog({
  user,
  open,
  onOpenChange,
  onProfileUpdate,
}: EditProfileDialogProps) {
  const { toast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
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
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'coverPhotoUrl') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue(field, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  function onSubmit(data: ProfileFormValues) {
    const updatedUser = { ...user, ...data };
    onProfileUpdate(updatedUser);
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been successfully saved.',
    });
    onOpenChange(false);
  }
  
  const requestVerification = () => {
    onProfileUpdate({ verificationStatus: 'pending_review' });
    toast({
      title: 'Verification Request Submitted',
      description: 'Your request for a verified badge is under review.',
    });
  }

  const avatarUrl = form.watch('avatarUrl');
  const coverPhotoUrl = form.watch('coverPhotoUrl');

  const VerificationSection = () => {
    switch (user.verificationStatus) {
        case 'verified':
            return (
                <Alert variant="default">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>You are verified!</AlertTitle>
                    <AlertDescription>Your profile has a verified badge.</AlertDescription>
                </Alert>
            );
        case 'pending_review':
             return (
                <Alert variant="outline">
                    <Hourglass className="h-4 w-4" />
                    <AlertTitle>Verification Pending</AlertTitle>
                    <AlertDescription>Your verification request is currently under review by our team.</AlertDescription>
                </Alert>
             );
        case 'pending_payment':
            return (
                <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle className='font-bold'>Your Request is Approved!</AlertTitle>
                    <AlertDescription>
                        Complete the final step by paying the one-time verification fee of **$5**. Your badge will appear after payment confirmation.
                    </AlertDescription>
                     <div className='mt-4'>
                        <Button asChild type="button">
                            <a href={VERIFICATION_PAYMENT_LINK} target="_blank" rel="noopener noreferrer">
                               <DollarSign className='mr-2 h-4 w-4' /> Proceed to Payment ($5)
                            </a>
                        </Button>
                    </div>
                </Alert>
            );
        case 'not_requested':
        default:
            return (
                <Alert variant="outline">
                    <HelpCircle className="h-4 w-4" />
                    <AlertTitle>Request Verification</AlertTitle>
                    <AlertDescription>
                        Get a verified badge to show that your profile is authentic.
                        <Button type="button" size="sm" className="mt-2" onClick={requestVerification}>Request Badge</Button>
                    </AlertDescription>
                </Alert>
            );
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <div className="space-y-4">
                <FormLabel>Profile and Cover Photo</FormLabel>
                <div className="relative h-36 rounded-lg bg-muted">
                    {coverPhotoUrl && (
                        <Image src={coverPhotoUrl} alt="Cover photo" layout="fill" objectFit="cover" className="rounded-lg" />
                    )}
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="absolute top-2 right-2 rounded-full"
                        onClick={() => coverInputRef.current?.click()}
                    >
                        <Camera className="h-4 w-4" />
                    </Button>
                    <input type="file" ref={coverInputRef} onChange={(e) => handleFileChange(e, 'coverPhotoUrl')} accept="image/*" className="hidden" />
                </div>
                <div className="relative -mt-16 ml-6 h-24 w-24">
                    <Avatar className="h-24 w-24 border-4 border-background">
                        <AvatarImage src={avatarUrl} alt={user.name} />
                        <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                     <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                        onClick={() => avatarInputRef.current?.click()}
                    >
                        <Camera className="h-4 w-4" />
                    </Button>
                    <input type="file" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatarUrl')} accept="image/*" className="hidden" />
                </div>
            </div>

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
              name="pronouns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pronouns</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. she/her, they/them" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

            <Separator />

            <div>
                <FormLabel>Verification</FormLabel>
                <div className="mt-2">
                  <VerificationSection />
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

    