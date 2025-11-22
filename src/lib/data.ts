
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
  verificationStatus?: 'not_requested' | 'pending_review' | 'pending_payment' | 'verified';
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
  subscriptions?: string[]; // Array of initiative IDs
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

export type Product = {
    id: string;
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    purchaseUrl: string;
}

export type Initiative = {
    id: string;
    name: string;
    description: string;
    logoUrl: string;
    websiteUrl?: string;
    paymentLinks?: {
      paypal?: string;
      stripe?: string;
      paystack?: string;
      flutterwave?: string;
    };
    cta?: string;
    events: {
        past: InitiativeEvent[];
        upcoming: InitiativeEvent[];
    },
    products?: Product[];
    status?: 'pending' | 'approved' | 'rejected' | 'pending_payment';
    submittedBy?: string;
    subscribers?: string[]; // Array of user IDs
}

export type InitiativeMessage = {
    senderId: string;
    senderName: string;
    senderAvatarUrl?: string;
    content: string;
    createdAt: any; // Firestore timestamp
};
