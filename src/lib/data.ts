

export type Badge = {
  name: string;
  description: string;
  icon: string;
};

export type Question = {
  id: string;
  questionerId: string;
  questioner?: User; // Will be populated on the client
  questionText: string;
  answerText?: string;
  timestamp: string;
};

export type User = {
  id:string;
  firstName: string;
  lastName: string;
  email: string;
  handle: string;
  verified?: boolean;
  avatarUrl?: string;
  coverPhotoUrl?: string;
  bio?: string;
  pronouns?: string;
  followers?: number;
  following?: number;
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
  friends?: string[]; // Array of user IDs
};

export type Post = {
  id: string;
  authorId: string;
  author: User;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  imageHint?: string;
  createdAt: any; // Firestore timestamp
  timestamp: string; // Client-side formatted string
  likes: number;
  likeIds?: string[];
  comments: {
    user: User;
    comment: string;
  }[];
};

export type Message = {
    id: string;
    sender: User;
    senderId: string;
    content: string;
    createdAt: any; // Firestore timestamp
    timestamp: string;
    reaction?: string;
    audioUrl?: string;
    audioDuration?: number; // duration in seconds
}

export type Conversation = {
    id:string;
    participant: User;
    messages: Message[];
    lastMessage: string;
    lastMessageTimestamp: any;
    streak?: {
      count: number;
      lastMessageTimestamp: any;
    }
}

export type Notification = {
  id: string;
  user: User;
  type: 'like' | 'comment' | 'friend_request';
  post?: Post; // optional, for like/comment notifications
  timestamp: string;
  read: boolean;
};

export type Reel = {
  id: string;
  author: User;
  videoUrl: string;
  caption: string;
  likes: number;
  comments: number;
};

export type InitiativeEvent = {
    title: string;
    description: string;
    url: string;
    type: 'image' | 'video';
}

export type ShowcaseInitiative = {
    id: string;
    name: string;
    description: string;
    logoUrl: string;
    href: string;
    cta: string;
    events: {
        past: InitiativeEvent[];
        upcoming: InitiativeEvent[];
    }
}

export const showcasedInitiatives: ShowcaseInitiative[] = [
  {
    id: 'arise-africa',
    name: 'Arise Africa Initiative',
    description: 'Follow the President of Arise Africa, Bishop John Munyasya Kimanzi, for updates, teachings, and guidance on how to join the movement.',
    logoUrl: '/arise-africa-logo.png',
    href: 'https://www.facebook.com/johnmunyasyakimanzi',
    cta: 'Follow on Facebook',
    events: {
        past: [
            {
                title: "Launch Event 2017",
                description: "The official launch of the Arise Africa Movement with 118 attendees.",
                url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjcm93ZCUyMGV2ZW50fGVufDB8fHx8MTc2Mzc4ODQ0N3ww&ixlib=rb-4.1.0&q=80&w=1080",
                type: 'image'
            },
            {
                title: "Nigeria Conference 2019",
                description: "A powerful conference held in Lagos, Nigeria, uniting leaders from across West Africa.",
                url: "https://storage.googleapis.com/static.afritransform.com/pexels-gabby-k-7095643.mp4",
                type: 'video'
            },
            {
                title: "Leadership Training in Kenya",
                description: "Intensive training session for the next generation of leaders in Nairobi.",
                url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxsZWFkZXJzaGlwJTIwY29uZmVyZW5jZXxlbnwwfHx8fDE3NjM3ODg1MjR8MA&ixlib=rb-4.1.0&q=80&w=1080",
                type: 'image'
            },
        ],
        upcoming: [
             {
                title: "Global Summit 2024",
                description: "Join us for our first global summit, bringing together leaders from Africa and beyond.",
                url: "https://images.unsplash.com/photo-1561489396-888724a1543d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxnbG9iYWwlMjBzdW1taXR8ZW58MHx8fHwxNzYzNzg4NTgxfDA&ixlib=rb-4.1.0&q=80&w=1080",
                type: 'image'
            }
        ]
    }
  },
];


export const sampleReels: Reel[] = [
  {
    id: '1',
    author: { id: '1', firstName: 'Video', lastName: 'Creator', handle: 'videocreator', avatarUrl: 'https://i.pravatar.cc/150?u=videocreator' } as User,
    videoUrl: 'https://storage.googleapis.com/static.afritransform.com/pexels-pressmaster-3141208-3840x2160-25fps.mp4',
    caption: 'This is a cool video!',
    likes: 123,
    comments: 45,
  },
    {
    id: '2',
    author: { id: '2', firstName: 'Another', lastName: 'Creator', handle: 'anothercreator', avatarUrl: 'https://i.pravatar.cc/150?u=anothercreator' } as User,
    videoUrl: 'https://storage.googleapis.com/static.afritransform.com/pexels-kelly-2947239-3840x2160-25fps.mp4',
    caption: 'Look at this amazing sunset!',
    likes: 456,
    comments: 78,
  },
    {
    id: '3',
    author: { id: '3', firstName: 'Nature', lastName: 'Lover', handle: 'naturelover', avatarUrl: 'https://i.pravatar.cc/150?u=naturelover' } as User,
    videoUrl: 'https://storage.googleapis.com/static.afritransform.com/pexels-thirdman-5326840-3840x2160-25fps.mp4',
    caption: 'So peaceful out here.',
    likes: 789,
    comments: 101,
  },
];
