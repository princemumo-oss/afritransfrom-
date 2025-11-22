
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, HardHat, PlusCircle, Trash2, Upload, Image as ImageIcon, Video, Hourglass, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, arrayUnion } from 'firebase/firestore';
import type { Initiative, InitiativeEvent, Product } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const eventSchema = z.object({
    title: z.string().min(1, "Title is required."),
    description: z.string().min(1, "Description is required."),
    url: z.string().url("A valid media URL is required."),
    type: z.enum(['image', 'video']),
});

const productSchema = z.object({
    name: z.string().min(1, "Product name is required."),
    description: z.string().min(1, "Description is required."),
    price: z.string().min(1, "Price is required."),
    imageUrl: z.string().url("A valid image URL is required."),
    purchaseUrl: z.string().url("A valid purchase link is required."),
});

// A placeholder for your actual PayPal payment link
const PAYPAL_PAYMENT_LINK = "https://paypal.me/afritransform";

export default function ManageWebsitesPage() {
    const { user: authUser } = useUser();
    const firestore = useFirestore();

    const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);

    const userWebsitesQuery = useMemoFirebase(() =>
        authUser ? query(collection(firestore, 'initiatives'), where('submittedBy', '==', authUser.uid)) : null
    , [firestore, authUser]);

    const { data: userWebsites, isLoading } = useCollection<Initiative>(userWebsitesQuery);
    
    // Set initial selected website
    useEffect(() => {
        if (userWebsites && userWebsites.length > 0 && !selectedWebsiteId) {
            setSelectedWebsiteId(userWebsites[0].id);
        }
    }, [userWebsites, selectedWebsiteId]);

    const selectedWebsite = userWebsites?.find(w => w.id === selectedWebsiteId);
    
    if (isLoading) {
        return <MainLayout><div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div></MainLayout>
    }
    
    if (!userWebsites || userWebsites.length === 0) {
        return (
             <MainLayout>
                <div className="mx-auto grid w-full max-w-4xl gap-6">
                     <Card className="flex flex-col items-center justify-center p-12 text-center">
                        <HardHat className="h-16 w-16 text-muted-foreground mb-4" />
                        <CardHeader>
                            <CardTitle>No Websites Submitted</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                            You have not submitted any websites yet. Once you submit a website, you can manage it here after it's been reviewed.
                            </CardDescription>
                             <Button asChild className="mt-4">
                                <Link href="/websites/submit">Submit Your First Website</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="mx-auto grid w-full max-w-4xl gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Manage Your Websites</h1>
                    <p className="text-muted-foreground">Update your website's content, events, and products.</p>
                </div>
                
                {userWebsites.length > 1 && (
                    <Select onValueChange={setSelectedWebsiteId} value={selectedWebsiteId || ''}>
                        <SelectTrigger className="w-full md:w-[300px]">
                            <SelectValue placeholder="Select a website to manage..." />
                        </SelectTrigger>
                        <SelectContent>
                            {userWebsites.map(site => (
                                <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {selectedWebsite && <WebsiteDashboard website={selectedWebsite} />}
            </div>
        </MainLayout>
    );
}

function WebsiteDashboard({ website }: { website: Initiative }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileUpload = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
             if (file.size > 5 * 1024 * 1024) { // 5MB limit
                reject('File is too large. Max 5MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                // In a real app, this would be an upload to Firebase Storage.
                // Using a data URL is not scalable for production.
                resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleUpdate = async (field: string, data: any) => {
        setIsSubmitting(true);
        try {
            const websiteRef = doc(firestore, 'initiatives', website.id);
            await updateDocumentNonBlocking(websiteRef, { [field]: data });
            toast({ title: 'Success!', description: `Website ${field} has been updated.` });
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
            toast({ variant: 'destructive', title: 'Error', description: `Failed to update ${field}.` });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const handleArrayUpdate = async (field: 'events.upcoming' | 'products', data: any, type: 'past' | 'upcoming' = 'upcoming') => {
        setIsSubmitting(true);
        const updateData = field === 'events.upcoming' 
            ? { [`events.${type}`]: arrayUnion(data) }
            : { [field]: arrayUnion(data) };

        try {
            const websiteRef = doc(firestore, 'initiatives', website.id);
            await updateDocumentNonBlocking(websiteRef, updateData);
            toast({ title: 'Success!', description: `${field.split('.')[0]} has been added.` });
        } catch (error) {
            console.error(`Error adding to ${field}:`, error);
            toast({ variant: 'destructive', title: 'Error', description: `Failed to add item.` });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    switch (website.status) {
        case 'approved':
            return (
                <div className="space-y-6">
                    <EditDescriptionCard website={website} onUpdate={handleUpdate} isSubmitting={isSubmitting} />
                    <AddEventCard onAdd={(data) => handleArrayUpdate('events.upcoming', data, 'upcoming')} isSubmitting={isSubmitting} handleFileUpload={handleFileUpload} />
                    <AddProductCard onAdd={(data) => handleArrayUpdate('products', data)} isSubmitting={isSubmitting} handleFileUpload={handleFileUpload} />
                </div>
            );
        case 'pending_payment':
            return (
                 <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle className='font-bold'>Congratulations! Your Website is Approved!</AlertTitle>
                    <AlertDescription>
                        Your website, **{website.name}**, has been approved by our team. The final step is to complete the one-time registration and hosting fee of **$30**.
                        <br /><br />
                        Click the button below to complete your payment via PayPal. Your website will be published automatically once the payment is confirmed.
                    </AlertDescription>
                     <div className='mt-4'>
                        <Button asChild>
                            <a href={PAYPAL_PAYMENT_LINK} target="_blank" rel="noopener noreferrer">
                               <DollarSign className='mr-2 h-4 w-4' /> Proceed to Payment ($30)
                            </a>
                        </Button>
                    </div>
                </Alert>
            );
         case 'rejected':
            return (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Submission Update</AlertTitle>
                    <AlertDescription>
                        Thank you for your submission. After careful review, your website, **{website.name}**, was not approved at this time.
                    </AlertDescription>
                </Alert>
            );
        case 'pending':
        default:
            return (
                <Alert>
                    <Hourglass className="h-4 w-4" />
                    <AlertTitle>Your Submission is Under Review</AlertTitle>
                    <AlertDescription>
                        Your website, **{website.name}**, is currently being reviewed by our team. This process can take up to 24 hours. You will be notified once the review is complete.
                    </AlertDescription>
                </Alert>
            );
    }
}

// Sub-component for editing the description
function EditDescriptionCard({ website, onUpdate, isSubmitting }: { website: Initiative; onUpdate: (field: string, data: any) => void; isSubmitting: boolean }) {
    const [description, setDescription] = useState(website.description);
    return (
        <Card>
            <CardHeader><CardTitle>Edit Website Description</CardTitle></CardHeader>
            <CardContent>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-32" />
            </CardContent>
            <CardFooter>
                <Button onClick={() => onUpdate('description', description)} disabled={isSubmitting || description === website.description}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Description
                </Button>
            </CardFooter>
        </Card>
    );
}

// Sub-component for adding an event
function AddEventCard({ onAdd, isSubmitting, handleFileUpload }: { onAdd: (data: any) => void; isSubmitting: boolean; handleFileUpload: (file: File) => Promise<string> }) {
    const eventForm = useForm({ resolver: zodResolver(eventSchema) });
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const onEventSubmit = async (data: z.infer<typeof eventSchema>) => {
        onAdd(data);
        eventForm.reset({ title: '', description: '', url: '', type: 'image' });
    };

    const handleFileTrigger = () => fileInputRef.current?.click();

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
        if (!fileType) {
            eventForm.setError('url', { type: 'manual', message: 'Invalid file type.' });
            return;
        }

        try {
            const dataUrl = await handleFileUpload(file);
            eventForm.setValue('url', dataUrl);
            eventForm.setValue('type', fileType);
            eventForm.clearErrors('url');
        } catch (error) {
             eventForm.setError('url', { type: 'manual', message: typeof error === 'string' ? error : 'Upload failed' });
        }
    };
    
    return (
        <Card>
            <CardHeader><CardTitle>Add a New Event (Upcoming)</CardTitle></CardHeader>
            <CardContent>
                <Form {...eventForm}>
                    <form onSubmit={eventForm.handleSubmit(onEventSubmit)} className="space-y-4">
                        <FormField control={eventForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Event Title</FormLabel><FormControl><Input placeholder="e.g., Annual Conference 2024" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={eventForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Event Description</FormLabel><FormControl><Textarea placeholder="Details about the event..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={eventForm.control} name="url" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Event Media (Photo or Video)</FormLabel>
                                <FormControl>
                                    <Button type="button" variant="outline" onClick={handleFileTrigger}><Upload className="mr-2 h-4 w-4"/> Upload Media</Button>
                                </FormControl>
                                <input type="file" ref={fileInputRef} onChange={onFileChange} accept="image/*,video/*" className="hidden" />
                                {field.value && <Image src={field.value} alt="preview" width={80} height={80} className="rounded-md object-cover mt-2" />}
                                <FormMessage />
                            </FormItem>
                        )} />
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Add Event</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

// Sub-component for adding a product
function AddProductCard({ onAdd, isSubmitting, handleFileUpload }: { onAdd: (data: any) => void; isSubmitting: boolean; handleFileUpload: (file: File) => Promise<string> }) {
    const productForm = useForm({ resolver: zodResolver(productSchema) });
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const onProductSubmit = (data: z.infer<typeof productSchema>) => {
        // We're missing `id` here, Firestore will generate it.
        onAdd(data);
        productForm.reset({ name: '', description: '', price: '', imageUrl: '', purchaseUrl: '' });
    };

    const handleFileTrigger = () => fileInputRef.current?.click();
    
    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const dataUrl = await handleFileUpload(file);
            productForm.setValue('imageUrl', dataUrl);
            productForm.clearErrors('imageUrl');
        } catch (error) {
             productForm.setError('imageUrl', { type: 'manual', message: typeof error === 'string' ? error : 'Upload failed' });
        }
    };
    
    return (
        <Card>
            <CardHeader><CardTitle>Add a New Product</CardTitle></CardHeader>
            <CardContent>
                <Form {...productForm}>
                    <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
                        <FormField control={productForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., Branded T-Shirt" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={productForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Product Description</FormLabel><FormControl><Textarea placeholder="Details about the product..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={productForm.control} name="price" render={({ field }) => (<FormItem><FormLabel>Price</FormLabel><FormControl><Input placeholder="e.g., $19.99" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={productForm.control} name="purchaseUrl" render={({ field }) => (<FormItem><FormLabel>Purchase Link</FormLabel><FormControl><Input placeholder="https://your-store.com/product" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={productForm.control} name="imageUrl" render={({ field }) => (
                             <FormItem>
                                <FormLabel>Product Image</FormLabel>
                                <FormControl>
                                    <Button type="button" variant="outline" onClick={handleFileTrigger}><Upload className="mr-2 h-4 w-4"/> Upload Image</Button>
                                </FormControl>
                                <input type="file" ref={fileInputRef} onChange={onFileChange} accept="image/*" className="hidden" />
                                {field.value && <Image src={field.value} alt="preview" width={80} height={80} className="rounded-md object-cover mt-2" />}
                                <FormMessage />
                            </FormItem>
                        )} />
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Add Product</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

    
