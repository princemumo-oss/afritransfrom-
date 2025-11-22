
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, ArrowLeft } from 'lucide-react';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

const initiativeSchema = z.object({
  name: z.string().min(3, 'Initiative name must be at least 3 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.').max(200, 'Description cannot exceed 200 characters.'),
  logoUrl: z.string().url('Please upload a logo.'),
});

type InitiativeFormValues = z.infer<typeof initiativeSchema>;

export default function SubmitInitiativePage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<InitiativeFormValues>({
    resolver: zodResolver(initiativeSchema),
    defaultValues: {
      name: '',
      description: '',
      logoUrl: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload a logo smaller than 2MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // In a real app, you'd upload this to Firebase Storage and get a URL.
        // For this demo, we'll use the data URL and assume a function will handle it.
        // This is not scalable and will fail if the data URL is too long for Firestore.
        form.setValue('logoUrl', result);
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: InitiativeFormValues) => {
    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to submit an initiative.',
      });
      return;
    }
    setIsSubmitting(true);
    
    try {
      const initiativesCollection = collection(firestore, 'initiatives');
      await addDocumentNonBlocking(initiativesCollection, {
        ...data,
        submittedBy: currentUser.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
        // These are empty for now as we don't have a form for them
        events: { past: [], upcoming: [] }, 
        products: []
      });

      toast({
        title: 'Submission Successful!',
        description: "Your submission has been sent for review. Please allow up to 24 hours for approval.",
      });

      router.push('/websites');

    } catch (error) {
      console.error('Error submitting initiative:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'There was an error submitting your initiative. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto grid w-full max-w-2xl gap-6">
         <Button asChild variant="outline" size="sm" className="w-fit">
            <Link href="/websites">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Websites
            </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Website</CardTitle>
            <CardDescription>
              Fill out the form below to have your website, ministry, or project featured. All submissions are subject to review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website/Initiative Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Arise Africa Initiative" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Briefly describe your initiative's mission and goals." {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo</FormLabel>
                       <FormControl>
                        <div className="flex items-center gap-4">
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting}>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Logo
                            </Button>
                            {logoPreview && (
                                <Image src={logoPreview} alt="Logo preview" width={40} height={40} className="rounded-full object-cover" />
                            )}
                        </div>
                       </FormControl>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit for Review'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
