import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

const imageMap = new Map<string, ImagePlaceholder>(
  PlaceHolderImages.map((img) => [img.id, img])
);

export type Badge = {
  name: string;
  description: string;
  icon: string;
};

export type Question = {
  id: string;
  questioner: User;
  questionText: string;
  answerText?: string;
  timestamp: string;
};

export type User = {
  id: string;
  name: string;
  handle: string;
  verified?: boolean;
  avatarUrl: string;
  bio: string;
  followers: number;
  following: number;
  onlineStatus?: 'online' | 'offline';
  badges?: Badge[];
  mood?: {
    emoji: string;
    text: string;
    expiresAt: number;
  };
  location?: string;
  work?: {
    company: string;
    position: string;
  };
  education?: {
    school: string;
    degree: string;
  };
  website?: string;
  relationshipStatus?: 'Single' | 'In a relationship' | 'Engaged' | 'Married' | 'Complicated';
  hobbies?: string[];
  family?: {
    relation: string;
    name: string;
  }[];
  questions?: Question[];
};

export type Post = {
  id: string;
  author: User;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
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
    id:string;
    participant: User;
    messages: Message[];
    lastMessage: string;
    lastMessageTimestamp: string;
}

export type Notification = {
  id: string;
  user: User;
  type: 'like' | 'comment' | 'friend_request';
  post?: Post; // optional, for like/comment notifications
  timestamp: string;
  read: boolean;
};

export const badges: { [key: string]: Badge } = {
  'pioneer': { name: 'Pioneer', description: 'Joined in the first month.', icon: 'Rocket' },
  'first-post': { name: 'First Post', description: 'Made your first post.', icon: 'Feather' },
  'community-builder': { name: 'Community Builder', description: 'Reached 100 followers.', icon: 'Users' },
};

const usersData: Omit<User, 'questions'>[] = [
  {
    id: '1',
    name: 'Alice',
    handle: 'alice',
    verified: true,
    avatarUrl: imageMap.get('avatar-1')!.imageUrl,
    bio: 'Software Engineer and cat lover. 🐈 #DevLife',
    followers: 1500,
    following: 250,
    onlineStatus: 'online',
    badges: [badges['pioneer'], badges['community-builder']],
    location: 'Nairobi, Kenya',
    work: { company: 'TechNova', position: 'Senior Developer' },
    education: { school: 'University of Cape Town', degree: 'Computer Science' },
    website: 'https://alice.dev',
    relationshipStatus: 'In a relationship',
    hobbies: ['Coding', 'Reading', 'Cats'],
    family: [{ relation: 'Brother', name: 'Alex' }],
  },
  {
    id: '2',
    name: 'Bob',
    handle: 'bob',
    avatarUrl: imageMap.get('avatar-2')!.imageUrl,
    bio: 'Designer, photographer, and coffee enthusiast. ☕',
    followers: 780,
    following: 500,
    onlineStatus: 'offline',
    badges: [badges['first-post']],
    location: 'Lagos, Nigeria',
    work: { company: 'Creative Minds', position: 'Lead Designer' },
    education: { school: 'Yaba College of Technology', degree: 'Graphic Design' },
    relationshipStatus: 'Single',
    hobbies: ['Photography', 'Latte Art', 'Traveling'],
  },
  {
    id: '3',
    name: 'Charlie',
    handle: 'charlie',
    avatarUrl: imageMap.get('avatar-3')!.imageUrl,
    bio: 'Just a dude who loves hiking. ⛰️',
    followers: 320,
    following: 180,
    onlineStatus: 'online',
    badges: [],
    location: 'Cape Town, South Africa',
    work: { company: 'Adventure Co.', position: 'Tour Guide' },
    education: { school: 'Stellenbosch University', degree: 'Environmental Science' },
    relationshipStatus: 'Married',
    hobbies: ['Hiking', 'Camping', 'Kayaking'],
  },
  {
    id: '4',
    name: 'Diana',
    handle: 'diana',
    avatarUrl: imageMap.get('avatar-4')!.imageUrl,
    bio: 'Exploring the world one city at a time. 🌍',
    followers: 2100,
    following: 50,
    onlineStatus: 'offline',
    badges: [badges['pioneer']],
    location: 'Accra, Ghana',
    work: { company: 'Globe Trotters', position: 'Travel Blogger' },
    education: { school: 'University of Ghana', degree: 'Journalism' },
    website: 'https://dianatravels.com',
    relationshipStatus: 'Single',
    hobbies: ['Blogging', 'Photography', 'Trying new foods'],
  },
  {
    id: '5',
    name: 'You',
    handle: 'you',
    avatarUrl: imageMap.get('avatar-5')!.imageUrl,
    bio: 'This is your bio. You can edit it!',
    followers: 42,
    following: 84,
    onlineStatus: 'online',
    badges: [badges['first-post']],
    location: 'Cairo, Egypt',
    work: { company: 'My Company', position: 'My Role' },
    education: { school: 'My University', degree: 'My Degree' },
    website: 'https://my-website.com',
    relationshipStatus: 'Single',
    hobbies: ['Next.js', 'React', 'Tailwind CSS'],
    family: [{ relation: 'Mother', name: 'Sarah' }],
  },
];

export const users: User[] = usersData.map(u => ({...u, questions: []}));

users[0].questions = [
  { id: 'q1', questioner: users[2], questionText: "What's your favorite programming language and why?", answerText: "Tough question! I love TypeScript for its safety and tooling, but Python will always have a special place in my heart for its simplicity.", timestamp: '3d ago'},
  { id: 'q2', questioner: users[1], questionText: "Any tips for getting into software engineering?", timestamp: '5d ago'},
];

users[4].questions = [
  { id: 'q3', questioner: users[0], questionText: "What are you working on right now?", timestamp: '1d ago'}
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
    mediaUrl: imageMap.get('post-1')!.imageUrl,
    mediaType: 'image',
    imageHint: imageMap.get('post-1')!.imageHint,
    timestamp: '5h ago',
    likes: 128,
    comments: [],
  },
  {
    id: 'p3',
    author: users[2],
    content: 'I made pasta for dinner tonight! It was delicious.',
    mediaUrl: imageMap.get('post-3')!.imageUrl,
    mediaType: 'image',
    imageHint: imageMap.get('post-3')!.imageHint,
    timestamp: '1d ago',
    likes: 89,
    comments: [],
  },
  {
    id: 'p4',
    author: users[3],
    content: 'Found this cute little guy on my walk today! 🐶',
    mediaUrl: imageMap.get('post-4')!.imageUrl,
    mediaType: 'image',
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

export const notifications: Notification[] = [
  {
    id: 'n1',
    user: users[3],
    type: 'friend_request',
    timestamp: '1h ago',
    read: false,
  },
  {
    id: 'n2',
    user: users[1],
    type: 'like',
    post: posts[3],
    timestamp: '3h ago',
    read: false,
  },
  {
    id: 'n3',
    user: users[0],
    type: 'comment',
    post: posts[3],
    timestamp: '6h ago',
    read: true,
  },
  {
    id: 'n4',
    user: users[2],
    type: 'like',
    post: posts[1],
    timestamp: '1d ago',
    read: true,
  },
];
