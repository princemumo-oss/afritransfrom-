

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
