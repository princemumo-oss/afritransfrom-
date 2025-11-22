'use server';

import { firestore } from '@/firebase/admin';
import { arrayUnion } from 'firebase/firestore/lite';

export async function addFriend(requesterId: string, receiverId: string) {
  try {
    const requesterRef = firestore.collection('users').doc(requesterId);
    const receiverRef = firestore.collection('users').doc(receiverId);

    const batch = firestore.batch();

    batch.update(requesterRef, { friends: arrayUnion(receiverId) });
    batch.update(receiverRef, { friends: arrayUnion(requesterId) });

    await batch.commit();

  } catch (error) {
    console.error('Error adding friend:', error);
    throw new Error('Could not complete friend request.');
  }
}
