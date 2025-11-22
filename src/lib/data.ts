import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

const imageMap = new Map<string, ImagePlaceholder>(
  PlaceHolderImages.map((img) => [img.id, img])
);

export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
};

export type Post = {
  id: string;
  author: User;
  content: string;
  imageUrl?: string;
  imageHint?: string;
  timestamp: string;
  likes: number;
  comments: {
    user: User;
    comment: string;
  }[];
};

export type Message = {
    id: string;
    sender: User;
    content: string;
    timestamp: string;
}

export type Conversation = {
    id: string;
    participant: User;
    messages: Message[];
    lastMessage: string;
    lastMessageTimestamp: string;
}

export const users: User[] = [
  { id: '1', name: 'Alice', avatarUrl: imageMap.get('avatar-1')!.imageUrl, bio: 'Software Engineer and cat lover.' },
  { id: '2', name: 'Bob', avatarUrl: imageMap.get('avatar-2')!.imageUrl, bio: 'Designer, photographer, and coffee enthusiast.' },
  { id: '3', name: 'Charlie', avatarUrl: imageMap.get('avatar-3')!.imageUrl, bio: 'Just a dude who loves hiking.' },
  { id: '4', name: 'Diana', avatarUrl: imageMap.get('avatar-4')!.imageUrl, bio: 'Exploring the world one city at a time.' },
  { id: '5', name: 'You', avatarUrl: imageMap.get('avatar-5')!.imageUrl, bio: 'This is your bio. You can edit it!' },
];

export const posts: Post[] = [
  {
    id: 'p1',
    author: users[0],
    content: 'Just deployed a new feature! Feeling accomplished. #coding #webdev',
    timestamp: '2h ago',
    likes: 42,
    comments: [
        { user: users[1], comment: 'Congrats! Looks great.' },
        { user: users[2], comment: 'Awesome work Alice!' },
    ],
  },
  {
    id: 'p2',
    author: users[1],
    content: 'Enjoying this beautiful sunset from my balcony. Life is good.',
    imageUrl: imageMap.get('post-1')!.imageUrl,
    imageHint: imageMap.get('post-1')!.imageHint,
    timestamp: '5h ago',
    likes: 128,
    comments: [],
  },
  {
    id: 'p3',
    author: users[2],
    content: 'I made pasta for dinner tonight! It was delicious.',
    imageUrl: imageMap.get('post-3')!.imageUrl,
    imageHint: imageMap.get('post-3')!.imageHint,
    timestamp: '1d ago',
    likes: 89,
    comments: [],
  },
  {
    id: 'p4',
    author: users[3],
    content: 'Found this cute little guy on my walk today! 🐶',
    imageUrl: imageMap.get('post-4')!.imageUrl,
    imageHint: imageMap.get('post-4')!.imageHint,
    timestamp: '2d ago',
    likes: 256,
    comments: [],
  }
];

export const friendRequests = [
    { user: users[3] },
];

export const friends = [users[0], users[1], users[2]];

export const conversations: Conversation[] = [
    {
        id: 'c1',
        participant: users[0],
        lastMessage: "Hey, how's it going?",
        lastMessageTimestamp: "10:30 AM",
        messages: [
            { id: 'm1', sender: users[4], content: "Hey, how's it going?", timestamp: "10:30 AM"},
            { id: 'm2', sender: users[0], content: "Good, you? Ready for the meeting later?", timestamp: "10:31 AM"},
        ]
    },
    {
        id: 'c2',
        participant: users[1],
        lastMessage: "See you tomorrow!",
        lastMessageTimestamp: "Yesterday",
        messages: [
            { id: 'm3', sender: users[4], content: "Great work on the new design!", timestamp: "Yesterday"},
            { id: 'm4', sender: users[1], content: "Thanks! See you tomorrow!", timestamp: "Yesterday"},
        ]
    }
]
