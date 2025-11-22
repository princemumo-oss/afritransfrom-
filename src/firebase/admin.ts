import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        admin.initializeApp();
    } catch (e) {
        console.error('Firebase admin initialization error', e);
    }
}


export const firestore = admin.firestore();
export const auth = admin.auth();
