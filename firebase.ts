import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  linkWithCredential,
  EmailAuthProvider,
  sendEmailVerification
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, orderBy, limit, limitToLast, onSnapshot, addDoc, serverTimestamp, getDocs, where, or, Timestamp, deleteDoc, arrayUnion, writeBatch } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import config from '../firebase-applet-config.json';
import { UserProfile, Rank, OperationType, FirestoreErrorInfo, PrivateMessage, Notification, Report, StatusUpdate as StatusUpdateType, AdminLog, CommunityServer, UserAsset, PostComment, DistrictChannel } from './types';

const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app, config.firestoreDatabaseId);
export const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };

  const isOffline = errMsg.toLowerCase().includes('offline') || errMsg.toLowerCase().includes('failed to get document because the client is offline');
  if (isOffline) {
    console.warn('Firestore offline event (gracefully bypassed):', JSON.stringify(errInfo));
    return;
  }

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Notifications ---
export async function notifyUser(userId: string, type: 'dm' | 'mention' | 'system', title: string, message: string, link?: string) {
  const path = 'notifications';
  try {
    await addDoc(collection(db, path), {
      userId,
      type,
      title,
      message,
      link: link || null,
      createdAt: Date.now(),
      read: false
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, path);
  }
}

export async function mouxBotSignal(userId: string, title: string, message: string, link?: string) {
  await notifyUser(userId, 'system', title, message, link);
}

export async function mouxBotFeedPost(content: string) {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'mouxbot'));
    const isEnabled = settingsDoc.exists() ? settingsDoc.data().enabled : false;
    
    if (!isEnabled) {
      console.log('MouxBot feed posting is disabled.');
      return;
    }

    await addDoc(collection(db, 'world_feed'), {
      authorId: 'MOUXBOT',
      authorName: 'MouxBot',
      authorIsVerified: true,
      authorBadges: ['SYSTEM', 'VOID_CORE'],
      content,
      isMature: false,
      isSystem: true,
      moderationStatus: 'approved',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('MouxBot feed post failed:', error);
  }
}

export function subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
  const q = query(
    collection(db, 'notifications'), 
    where('userId', '==', userId), 
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    callback(notifications);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'notifications');
  });
}

export async function markNotificationAsRead(notifId: string) {
  try {
    await updateDoc(doc(db, 'notifications', notifId), { read: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, `notifications/${notifId}`);
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      limit(100)
    );
    const snap = await getDocs(q);
    if (snap.empty) return;
    
    const batch = writeBatch(db);
    snap.docs.forEach(d => {
      batch.update(d.ref, { read: true });
    });
    await batch.commit();
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, 'notifications');
  }
}

// --- DM logic ---
export async function sendPrivateMessage(sender: UserProfile, receiver: UserProfile, text: string) {
  const path = 'private_messages';
  try {
    await addDoc(collection(db, path), {
      senderId: sender.uid,
      senderName: sender.displayName,
      receiverId: receiver.uid,
      receiverName: receiver.displayName,
      text,
      createdAt: serverTimestamp(),
      read: false
    });
    // Send background notification
    await notifyUser(receiver.uid, 'dm', `Signal from ${sender.displayName}`, text.slice(0, 50));
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, path);
  }
}

export function subscribeToDMs(userId: string, callback: (messages: PrivateMessage[]) => void) {
  const q = query(
    collection(db, 'private_messages'),
    or(
      where('receiverId', '==', userId),
      where('senderId', '==', userId)
    ),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PrivateMessage));
    callback(messages);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'private_messages');
  });
}

export async function markPrivateMessagesAsRead(senderId: string, receiverId: string) {
  const path = 'private_messages';
  try {
    const q = query(
      collection(db, path),
      where('senderId', '==', senderId),
      where('receiverId', '==', receiverId),
      where('read', '==', false)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });
      await batch.commit();
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, path);
  }
}

// Follow System
export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) return;
  const followDocId = `${followerId}_${followingId}`;
  const followRef = doc(db, 'follows', followDocId);
  
  try {
    const snap = await getDoc(followRef);
    if (snap.exists()) return;

    await setDoc(followRef, {
      followerId,
      followingId,
      createdAt: serverTimestamp()
    });

    // Update counts
    const follower = await getUserProfile(followerId);
    const following = await getUserProfile(followingId);
    
    if (follower) await updateProfile(followerId, { followingCount: (follower.followingCount || 0) + 1 });
    if (following) await updateProfile(followingId, { followersCount: (following.followersCount || 0) + 1 });
    
    if (follower) {
      await notifyUser(followingId, 'system', 'New Signal Link', `${follower.displayName} started following you`);
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, `follows/${followDocId}`);
  }
}

export async function unfollowUser(followerId: string, followingId: string) {
  const followDocId = `${followerId}_${followingId}`;
  const followRef = doc(db, 'follows', followDocId);
  
  try {
    const snap = await getDoc(followRef);
    if (!snap.exists()) return;

    await deleteDoc(followRef);

    // Update counts
    const follower = await getUserProfile(followerId);
    const following = await getUserProfile(followingId);
    
    if (follower) await updateProfile(followerId, { followingCount: Math.max(0, (follower.followingCount || 0) - 1) });
    if (following) await updateProfile(followingId, { followersCount: Math.max(0, (following.followersCount || 0) - 1) });
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `follows/${followDocId}`);
  }
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const followDocId = `${followerId}_${followingId}`;
  try {
    const snap = await getDoc(doc(db, 'follows', followDocId));
    return snap.exists();
  } catch (e) {
    return false;
  }
}

export async function getFollowedIds(userId: string): Promise<string[]> {
  try {
    const q = query(collection(db, 'follows'), where('followerId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data().followingId);
  } catch (e) {
    return [];
  }
}

export async function getFollowers(uid: string, limitCount = 50) {
  try {
    const q = query(collection(db, 'follows'), where('followingId', '==', uid), limit(limitCount));
    const snap = await getDocs(q);
    const userIds = snap.docs.map(doc => doc.data().followerId);
    
    const profiles = [];
    for (const id of userIds) {
      const p = await getUserProfile(id);
      if (p) profiles.push(p);
    }
    return profiles;
  } catch(e) { return []; }
}

export async function getFollowing(uid: string, limitCount = 50) {
  try {
    const q = query(collection(db, 'follows'), where('followerId', '==', uid), limit(limitCount));
    const snap = await getDocs(q);
    const userIds = snap.docs.map(doc => doc.data().followingId);
    
    const profiles = [];
    for (const id of userIds) {
      const p = await getUserProfile(id);
      if (p) profiles.push(p);
    }
    return profiles;
  } catch(e) { return []; }
}

export function subscribeToFollowingFeed(followedIds: string[], callback: (updates: StatusUpdateType[]) => void) {
  if (followedIds.length === 0) {
    callback([]);
    return () => {};
  }

  // Firestore "in" query limited to 30 items
  const limitedIds = followedIds.slice(0, 30);
  const q = query(
    collection(db, 'world_feed'), 
    where('authorId', 'in', limitedIds),
    where('moderationStatus', '==', 'approved'),
    orderBy('createdAt', 'desc'), 
    limit(50)
  ); 
  
  return onSnapshot(q, (snapshot) => {
    const updates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StatusUpdateType));
    callback(updates);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'world_feed_following');
  });
}

// Prefix Search for search/admin discovery
export async function searchUsers(searchTerm: string, limitCount: number = 20) {
  if (searchTerm.length < 1) return [];
  const path = 'users';
  try {
    // Try UID match first if it looks like a UID
    if (searchTerm.length > 15 && !searchTerm.includes(' ')) {
      const user = await getUserProfile(searchTerm);
      if (user) return [user];
    }

    const q = query(
      collection(db, path), 
      where('displayName', '>=', searchTerm),
      where('displayName', '<=', searchTerm + '\uf8ff'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const users = snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
    // Sort verified/admin/badges first
    return users.sort((a, b) => {
      const scoreA = (a.is_verified ? 1 : 0) + (a.isAdmin ? 2 : 0) + ((a.badges || []).length > 0 ? 0.5 : 0);
      const scoreB = (b.is_verified ? 1 : 0) + (b.isAdmin ? 2 : 0) + ((b.badges || []).length > 0 ? 0.5 : 0);
      return scoreB - scoreA;
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, path);
    return [];
  }
}

// Mention Detection
async function checkMentions(text: string, authorName: string) {
  const mentions = text.match(/@(\w+)/g);
  if (mentions) {
    for (const m of mentions) {
      const username = m.substring(1);
      const q = query(collection(db, 'users'), where('displayName', '==', username), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const target = snap.docs[0];
        if (target.id !== auth.currentUser?.uid) {
          await notifyUser(target.id, 'mention', `@${authorName} mentioned you`, text.slice(0, 60));
        }
      }
    }
  }
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function loginEmail(email: string, pass: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error: any) {
    console.error('Email login error:', error);
    const code = error.code || '';
    const message = error.message || '';
    
    if (code === 'auth/invalid-credential' || message.includes('auth/invalid-credential')) {
      throw new Error('Access Denied: Incorrect email or password. If you are new or a guest, please use the "Join" option to create an account.');
    }
    if (code === 'auth/user-not-found' || message.includes('auth/user-not-found')) {
      throw new Error('Identity not found in the VOID. Please "Join" first.');
    }
    if (code === 'auth/wrong-password' || message.includes('auth/wrong-password')) {
      throw new Error('Access Key mismatch. Please verify your password or use the "Join" option if you were a guest.');
    }
    if (code === 'auth/operation-not-allowed') {
      throw new Error('Email/Password authentication is not yet enabled in the Command Center. Please notify the Administrator.');
    }
    throw new Error(message || 'Authentication sequence failed.');
  }
}

export async function registerEmail(email: string, pass: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await sendEmailVerification(result.user);
    return result.user;
  } catch (error: any) {
    console.error('Email registration error:', error);
    const code = error.code || '';
    const message = error.message || '';

    if (code === 'auth/email-already-in-use') {
      throw new Error('This identity email is already active in our universe. Try logging in instead.');
    }
    if (code === 'auth/weak-password') {
      throw new Error('Signal too weak: Password must be at least 6 characters.');
    }
    if (code === 'auth/invalid-email') {
      throw new Error('Malformed signal: Invalid email format.');
    }
    if (code === 'auth/operation-not-allowed') {
      throw new Error('Identity registration via Email is not yet enabled in the Command Center. Contact an Administrator.');
    }
    throw new Error(message || 'Identity initialization failed.');
  }
}

export async function loginGuest() {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Guest login error:', error);
    throw error;
  }
}

export async function linkGuestWithEmail(email: string, pass: string) {
  if (!auth.currentUser) throw new Error('No identity detected');
  const credential = EmailAuthProvider.credential(email, pass);
  try {
    const result = await linkWithCredential(auth.currentUser, credential);
    await sendEmailVerification(result.user);
    // Update profile to mark as no longer guest
    await updateProfile(auth.currentUser.uid, { isGuest: false, email: result.user.email || email });
    return result.user;
  } catch (error: any) {
    console.error('Conversion error:', error);
    const code = error.code || '';
    const message = error.message || '';
    
    if (code === 'auth/email-already-in-use') {
      throw new Error('This identity email is already taken. Try logging in with a different account.');
    }
    if (code === 'auth/credential-already-in-use') {
      throw new Error('This credential is already linked to another identity.');
    }
    if (code === 'auth/invalid-email') {
      throw new Error('Invalid email format provided.');
    }
    if (code === 'auth/weak-password') {
      throw new Error('Signal too weak: Password must be at least 6 characters.');
    }
    throw new Error(message || 'Identity conversion failed.');
  }
}

function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error('FileReader conversion failed'));
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadProfilePhoto(uid: string, file: File) {
  const path = `profiles/${uid}/photo`;
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateProfile(uid, { photoURL: url });
    return url;
  } catch (error) {
    console.warn('Firebase Storage upload failed, attempting auto-healing fallback to compressed inline Base64 rendering:', error);
    try {
      let base64Photo = '';
      if (file.type && file.type.startsWith('image/')) {
        const { compressImage } = await import('./lib/imageUtils');
        base64Photo = await compressImage(file, 400, 0.6);
      } else {
        base64Photo = await fileToBase64(file);
      }
      await updateProfile(uid, { photoURL: base64Photo });
      return base64Photo;
    } catch (fallbackError) {
      console.error('Profile photo fallback failed:', fallbackError);
      throw error;
    }
  }
}

export async function uploadFeedMedia(uid: string, file: File | Blob) {
  const fileExt = (file as File).name ? (file as File).name.split('.').pop() : 'jpg';
  const path = `feed/${uid}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.warn('Firebase Storage upload failed, attempting auto-healing fallback to compressed inline Base64 rendering:', error);
    try {
      if (file.type && file.type.startsWith('image/') && file.type !== 'image/gif') {
        try {
          const { compressImage } = await import('./lib/imageUtils');
          const compressedBase64 = await compressImage(file as File, 800, 0.6);
          return compressedBase64;
        } catch (compressErr) {
          console.warn('Fallback inline compressor failed, reading raw data:', compressErr);
        }
      }
      return await fileToBase64(file);
    } catch (fallbackError) {
      console.error('Feed media fallback failed:', fallbackError);
      throw error;
    }
  }
}

// Post Management
export async function deletePost(postId: string, collectionName: string, currentUserId: string, isAdmin: boolean = false) {
  const path = `${collectionName}/${postId}`;
  try {
    const postDoc = await getDoc(doc(db, collectionName, postId));
    if (!postDoc.exists()) return;
    const postData = postDoc.data();
    if (postData.authorId !== currentUserId && !(isAdmin && postData.authorId === "MOUXBOT")) {
      throw new Error('Signal termination denied: Ownership mismatch.');
    }
    await deleteDoc(doc(db, collectionName, postId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function likeComment(commentId: string, userId: string) {
  const commentRef = doc(db, 'post_comments', commentId);
  try {
    const docSnap = await getDoc(commentRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const likes = data.likes || [];
      if (likes.includes(userId)) {
        await updateDoc(commentRef, {
          likes: likes.filter((id: string) => id !== userId)
        });
      } else {
        await updateDoc(commentRef, {
          likes: [...likes, userId]
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `post_comments/${commentId}`);
  }
}

export async function deleteComment(commentId: string, currentUserId: string) {
  const path = `post_comments/${commentId}`;
  try {
    const commentDoc = await getDoc(doc(db, 'post_comments', commentId));
    if (!commentDoc.exists()) return;
    const commentData = commentDoc.data();
    if (commentData.authorId !== currentUserId) {
      throw new Error('Signal termination denied: Ownership mismatch.');
    }
    await deleteDoc(doc(db, 'post_comments', commentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateComment(commentId: string, newContent: string, currentUserId: string) {
    const path = `post_comments/${commentId}`;
    try {
        const commentDoc = await getDoc(doc(db, 'post_comments', commentId));
        if (!commentDoc.exists()) throw new Error('Comment not found');
        const commentData = commentDoc.data();
        if (commentData.authorId !== currentUserId) {
            throw new Error('Signal modification denied: Ownership mismatch.');
        }
        await updateDoc(doc(db, 'post_comments', commentId), { content: newContent });
    } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
    }
}

export async function purgeOldPosts() {
  const postsRef = collection(db, 'posts');
  const querySnapshot = await getDocs(postsRef);
  const deletePromises: Promise<void>[] = [];
  querySnapshot.forEach((doc) => {
    if (doc.data().authorId !== "MOUXBOT") {
      deletePromises.push(deleteDoc(doc.ref));
    }
  });
  await Promise.all(deletePromises);
}

export async function updatePost(postId: string, collectionName: string, newContent: string, currentUserId: string) {
  const path = `${collectionName}/${postId}`;
  try {
    const postDoc = await getDoc(doc(db, collectionName, postId));
    if (!postDoc.exists()) return;
    const postData = postDoc.data();
    if (postData.authorId !== currentUserId) {
      throw new Error('Signal modification denied: Ownership mismatch.');
    }
    const field = collectionName.startsWith('world_chat_') || collectionName === 'world_chat' ? 'text' : 'content';
    await updateDoc(doc(db, collectionName, postId), {
      [field]: newContent,
      isEdited: true
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleVerification(uid: string) {
  const path = `users/${uid}`;
  try {
    const user = await getUserProfile(uid);
    if (!user) return;
    await updateDoc(doc(db, 'users', uid), { is_verified: !user.is_verified });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleFavoriteMarketItem(uid: string, itemId: string) {
  const path = `users/${uid}`;
  try {
    const user = await getUserProfile(uid);
    if (!user) return;
    const favorites = user.favoriteMarketItems || [];
    const newFavorites = favorites.includes(itemId)
      ? favorites.filter(id => id !== itemId)
      : [...favorites, itemId];
    await updateDoc(doc(db, 'users', uid), { favoriteMarketItems: newFavorites });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = { uid, ...docSnap.data() } as UserProfile;
      if (data.email === 'pervercy23@gmail.com') {
        const needsUpdate = !data.isAdmin || !data.is_verified || !data.is_pro || !data.is_veteran || data.rank !== 'GOD';
        if (needsUpdate) {
            data.isAdmin = true;
            data.is_verified = true;
            data.is_pro = true;
            data.is_veteran = true;
            data.rank = 'GOD';
            try {
                updateDoc(docRef, { isAdmin: true, is_verified: true, is_pro: true, is_veteran: true, rank: 'GOD' }).catch(() => {});
            } catch(e) {}
        }
      }

      // Save to localStorage for robust offline fallback caching
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(`user_profile_${uid}`, JSON.stringify(data));
        } catch (e) {}
      }

      return data;
    }
    
    // Check local fallback if not found or empty (optional fallback)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const cachedStr = window.localStorage.getItem(`user_profile_${uid}`);
        if (cachedStr) {
          return JSON.parse(cachedStr);
        }
      } catch (e) {}
    }

    return null;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const isOffline = errMsg.toLowerCase().includes('offline') || errMsg.toLowerCase().includes('failed to get document because the client is offline');
    
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const cachedStr = window.localStorage.getItem(`user_profile_${uid}`);
        if (cachedStr) {
          console.warn("Retrieved user profile from offline localStorage fallback cache for uid " + uid);
          const parsed = JSON.parse(cachedStr);
          return parsed;
        }
      } catch (e) {}
    }

    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export function subscribeToUserProfile(uid: string, callback: (profile: UserProfile | null) => void) {
  const path = `users/${uid}`;
  return onSnapshot(doc(db, 'users', uid), (snapshot) => {
    if (snapshot.exists()) {
      callback({ uid, ...snapshot.data() } as UserProfile);
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

const ADJECTIVES = ['Void', 'Ghost', 'Neon', 'Abyssal', 'Cosmic', 'Shadow', 'Azure', 'Crimson'];
const NOUNS = ['Stalker', 'Echo', 'Drifter', 'Blade', 'Wraith', 'Spark', 'Citizen', 'Outcast'];

function generateRandomName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj} ${noun} ${num}`;
}

export async function isUsernameUnique(username: string): Promise<boolean> {
  const normalized = username.toLowerCase();
  if (normalized.includes('moux') || normalized === 'admin') {
    // Only master email can use 'Moux' or 'Admin' in name
    if (auth.currentUser?.email !== 'pervercy23@gmail.com') return false;
  }
  const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
  const snap = await getDocs(q);
  return snap.empty;
}

export async function createUserProfile(user: User): Promise<UserProfile> {
  const path = `users/${user.uid}`;
  const isAdmin = user.email === 'pervercy23@gmail.com';
  const profile: Omit<UserProfile, 'uid'> = {
    email: user.email || '',
    displayName: isAdmin ? 'admin' : (user.isAnonymous ? `Guest` : generateRandomName()),
    username: isAdmin ? 'admin' : (user.isAnonymous ? `guest_${Math.floor(Math.random() * 9000) + 1000}` : generateRandomName().replace(/\s+/g, '_').toLowerCase()),
    location: 'Gate of Beginnings',
    mouxBalance: user.isAnonymous ? 500 : 5000, // Guests get less starter credit
    mouxAssetValue: 0,
    isBanned: false,
    ageVerified: null,
    isAdmin: user.email === 'pervercy23@gmail.com',
    isGuest: user.isAnonymous,
    nameChangePasses: user.isAnonymous ? 0 : 1,
    createdAt: Date.now(),
    badges: [],
    is_verified: user.email === 'pervercy23@gmail.com',
    is_pro: user.email === 'pervercy23@gmail.com',
    is_veteran: user.email === 'pervercy23@gmail.com',
    rank: user.email === 'pervercy23@gmail.com' ? 'GOD' as const : 'Wanderer' as const,
    followingCount: 0,
    followersCount: 0,
    is_new_user: true,
    avatar_base64: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23ffffff'/></svg>"
  };

  try {
    // Check for Early Bird (first 1000)
    const usersCountSnap = await getDocs(query(collection(db, 'users'), limit(1001)));
    if (usersCountSnap.size < 1000) {
      profile.badges?.push('Early Bird');
    }
    
    // Admin check for Founder
    if (profile.isAdmin) {
      profile.badges?.push('Founder');
    }

    await setDoc(doc(db, 'users', user.uid), profile);
    return { uid: user.uid, ...profile };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function updateProfile(uid: string, data: Partial<UserProfile>) {
  const path = `users/${uid}`;
  try {
    const oldUser = await getUserProfile(uid);
    await updateDoc(doc(db, 'users', uid), data);
    
    if (data.rank && oldUser && oldUser.rank !== data.rank) {
      await mouxBotSignal(uid, 'Rank Transcended', `Your community has shifted. New Rank: ${data.rank}`, '/#settings');
      await mouxBotFeedPost(`[RANK_LOG] Transmutation complete: ${oldUser.displayName} has transitioned to ${data.rank} status.`);
    }

    // Sync localStorage cache
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const cachedStr = window.localStorage.getItem(`user_profile_${uid}`);
        if (cachedStr) {
          const parsed = JSON.parse(cachedStr);
          const updated = { ...parsed, ...data };
          window.localStorage.setItem(`user_profile_${uid}`, JSON.stringify(updated));
        } else if (oldUser) {
          const updated = { ...oldUser, ...data };
          window.localStorage.setItem(`user_profile_${uid}`, JSON.stringify(updated));
        }
      } catch (e) {}
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function banUser(uid: string) {
  try {
    const user = await getUserProfile(uid);
    if (!user) return;
    
    // First, update Profile to clear properties and set isBanned
    await updateProfile(uid, {
        isBanned: true
    });
    
    // Create record in banned_users collection
    await setDoc(doc(db, 'banned_users', uid), {
        email: user.email || '',
        displayName: user.displayName || 'Target',
        bannedAt: Date.now(),
        appealStatus: 'none'
    });
    
    // Then we literally delete the profile document from users collection to comply with "their profile should be deleted"
    await deleteDoc(doc(db, 'users', uid));

    // Update their feed posts to show they are banned
    const feedRef = collection(db, 'world_feed');
    const q = query(feedRef, where('authorId', '==', uid));
    const snapshot = await getDocs(q);
    snapshot.forEach(async (docSnap) => {
        await updateDoc(doc(db, 'world_feed', docSnap.id), {
            isBannedAuthor: true
        });
    });
    
  } catch (error) {
    console.error('Ban user failed:', error);
  }
}

export async function submitAppeal(uid: string, text: string) {
  try {
    await updateDoc(doc(db, 'banned_users', uid), {
        appealText: text,
        appealStatus: 'pending',
        updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Submit appeal failed:', error);
    throw error;
  }
}

export async function testConnection() {
  try {
    await getDoc(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore is offline, connection will be established once online.");
    } else if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      // Permission denied means server is reachable
    } else {
      console.error("Firebase connection test failed:", error);
    }
  }
}

export async function getBannedUser(uid: string) {
  try {
    const docRef = await getDoc(doc(db, 'banned_users', uid));
    if (docRef.exists()) {
      return docRef.data();
    }
    return null;
  } catch (error) {
    if (error instanceof Error && error.message.includes('client is offline')) {
       return null;
    }
    console.error('Could not fetch banned user', error);
    return null;
  }
}

// User Blocking
export async function blockUser(currentUserId: string, targetId: string) {
  const user = await getUserProfile(currentUserId);
  if (!user) return;
  const blocked = user.blockedUsers || [];
  if (!blocked.includes(targetId)) {
    await updateProfile(currentUserId, { blockedUsers: [...blocked, targetId] });
  }
}

export async function unblockUser(currentUserId: string, targetId: string) {
  const user = await getUserProfile(currentUserId);
  if (!user) return;
  const blocked = user.blockedUsers || [];
  await updateProfile(currentUserId, { blockedUsers: blocked.filter(id => id !== targetId) });
}

// User Muting
export async function muteUser(currentUserId: string, targetId: string) {
  const user = await getUserProfile(currentUserId);
  if (!user) return;
  const muted = user.mutedUsers || [];
  if (!muted.includes(targetId)) {
    await updateProfile(currentUserId, { mutedUsers: [...muted, targetId] });
  }
}

export async function unmuteUser(currentUserId: string, targetId: string) {
  const user = await getUserProfile(currentUserId);
  if (!user) return;
  const muted = user.mutedUsers || [];
  await updateProfile(currentUserId, { mutedUsers: muted.filter(id => id !== targetId) });
}

// Admin Logging
export async function logAdminAction(admin: UserProfile, action: string, details: string, target?: { id: string, name: string }) {
  try {
    await addDoc(collection(db, 'admin_logs'), {
      adminId: admin.uid,
      adminName: admin.displayName,
      action,
      details,
      targetId: target?.id || null,
      targetName: target?.name || null,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.error('Logging failed:', e);
  }
}

export function subscribeToAdminLogs(callback: (logs: AdminLog[]) => void) {
  const q = query(collection(db, 'admin_logs'), orderBy('createdAt', 'desc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminLog));
    callback(logs);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'admin_logs');
  });
}

export async function toggleLikePost(postId: string, userId: string) {
  const postRef = doc(db, 'world_feed', postId);
  try {
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return;
    const postData = postSnap.data();
    const likes = postData.likes || [];
    const isLiked = likes.includes(userId);
    
    if (isLiked) {
      await updateDoc(postRef, {
        likes: likes.filter((id: string) => id !== userId)
      });
    } else {
      await updateDoc(postRef, {
        likes: [...likes, userId]
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `world_feed/${postId}`);
  }
}

export async function toggleReaction(postId: string, userId: string, emoji: string) {
  const postRef = doc(db, 'world_feed', postId);
  try {
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return;
    const postData = postSnap.data();
    const reactions = postData.reactions || {};
    
    let newReactions = { ...reactions };
    
    // First, check if the user already has THIS reaction
    const alreadyHasThis = reactions[emoji]?.includes(userId);

    // Remove user ID from ALL existing reactions to enforce "one reaction per post"
    Object.keys(newReactions).forEach(key => {
      newReactions[key] = (newReactions[key] as string[]).filter(id => id !== userId);
      if (newReactions[key].length === 0) {
        delete newReactions[key];
      }
    });

    // If they didn't have this one before, add it now
    if (!alreadyHasThis) {
      const currentEmojiReactions = newReactions[emoji] || [];
      newReactions[emoji] = [...currentEmojiReactions, userId];
    }
    
    await updateDoc(postRef, { reactions: newReactions });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `world_feed/${postId}`);
  }
}

export function subscribeToComments(postId: string, callback: (comments: PostComment[]) => void, limitCount?: number) {
  let q = query(
    collection(db, 'post_comments'),
    where('postId', '==', postId),
    orderBy('createdAt', 'asc')
  );

  if (limitCount) {
    q = query(q, limitToLast(limitCount));
  }
  
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostComment));
    callback(comments);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `post_comments/${postId}`);
  });
}

export async function addComment(postId: string, userId: string, userName: string, text: string, image?: string) {
  const path = 'post_comments';
  try {
    const commentData: any = {
      postId,
      authorId: userId,
      authorName: userName,
      content: text,
      createdAt: Date.now(),
      likes: []
    };
    if (image) commentData.image = image;
    
    await addDoc(collection(db, path), commentData);
    
    // Increment repliesCount
    const postRef = doc(db, 'world_feed', postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const postData = postSnap.data();
      await updateDoc(postRef, {
        repliesCount: (postData.repliesCount || 0) + 1
      });
      
      // MouxBot Alert: If someone comments on a user's post, MouxBot should send a private notification to the post owner
      const postOwnerId = postData.authorId;
      if (postOwnerId && postOwnerId !== userId && postOwnerId !== 'MOUXBOT') {
        await mouxBotSignal(
          postOwnerId, 
          'Signal Interference', 
          `${userName} has sent a response to your feed transmission.`, 
          '/#feed'
        );
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// World Feed
export function subscribeToFeed(callback: (updates: StatusUpdateType[]) => void) {
  const q = query(
    collection(db, 'world_feed'), 
    where('moderationStatus', '==', 'approved'),
    orderBy('createdAt', 'desc'), 
    limit(25)
  ); 
  
  return onSnapshot(q, (snapshot) => {
    const updates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StatusUpdateType));
    callback(updates);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'world_feed');
  });
}

// Moderation Queue
export function subscribeToModerationQueue(callback: (updates: StatusUpdateType[]) => void) {
  const q = query(
    collection(db, 'world_feed'),
    where('moderationStatus', '==', 'pending'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  return onSnapshot(q, (snapshot) => {
    const updates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StatusUpdateType));
    callback(updates);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'world_feed');
  });
}

export async function updateModerationStatus(postId: string, status: 'approved' | 'rejected') {
  try {
    await updateDoc(doc(db, 'world_feed', postId), { moderationStatus: status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `world_feed/${postId}`);
  }
}

// Reporting
export async function reportContent(report: Omit<Report, 'id'>) {
  try {
    await addDoc(collection(db, 'reports'), {
      ...report,
      createdAt: serverTimestamp()
    });
    // Notify admins (mocking admin list for now as just a broad signal)
    // In real app, you'd fetch admins and notify theme.
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'reports');
  }
}

export function subscribeToAppeals(callback: (appeals: any[]) => void) {
  const q = query(collection(db, 'banned_users'), where('appealStatus', '==', 'pending'), orderBy('updatedAt', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const appeals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(appeals);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'banned_users');
  });
}

export async function resolveAppeal(uid: string, result: 'approved' | 'rejected') {
  try {
    if (result === 'approved') {
        // Find them in banned_users, recreate their empty profile
        const appealDoc = await getDoc(doc(db, 'banned_users', uid));
        let displayName = "Target";
        let email = "";
        if (appealDoc.exists()) {
            displayName = appealDoc.data().displayName || "Target";
            email = appealDoc.data().email || "";
        }
        
        await deleteDoc(doc(db, 'banned_users', uid));
        
        // recreate user
        await setDoc(doc(db, 'users', uid), {
            displayName: displayName,
            rank: 'Wanderer',
            location: 'Void',
            mouxBalance: 2500, // Or whatever startup balance is appropriate
            isBanned: false,
            ageVerified: null,
            isAdmin: false,
            nameChangePasses: 0,
            inventory: [],
            isOnline: true,
            email: email,
            isGuest: false,
            createdAt: Date.now()
        });

        // Restore posts
        const feedRef = collection(db, 'world_feed');
        const q = query(feedRef, where('authorId', '==', uid));
        const snapshot = await getDocs(q);
        snapshot.forEach(async (docSnap) => {
            await updateDoc(doc(db, 'world_feed', docSnap.id), {
                isBannedAuthor: false
            });
        });
    } else {
        await updateDoc(doc(db, 'banned_users', uid), {
            appealStatus: 'rejected',
            updatedAt: Date.now()
        });
    }
  } catch (error) {
    console.error('Resolve appeal failed', error);
  }
}
export function subscribeToReports(callback: (reports: Report[]) => void) {
  const q = query(collection(db, 'reports'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
    callback(reports);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'reports');
  });
}

export async function resolveReport(reportId: string) {
  try {
    await updateDoc(doc(db, 'reports', reportId), { status: 'resolved' });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `reports/${reportId}`);
  }
}

export async function postToFeed(content: string, user: UserProfile, isMature: boolean = false, image?: string, poll?: any, mediaType?: 'image' | 'video') {
  try {
    let isCurrentlyShadowMuted = false;

    if (user.uid !== 'MOUXBOT') {
      const now = Date.now();
      let recentPosts = user.recentPosts || [];
      recentPosts = recentPosts.filter(t => now - t < 60000);
      recentPosts.push(now);

      let shadowMutedUntil = user.shadowMutedUntil || 0;
      if (recentPosts.length > 3) {
        shadowMutedUntil = now + 10 * 60 * 1000;
      }

      // Update user profile with new timestamps
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          recentPosts,
          shadowMutedUntil
        });
      } catch (e) {
        console.warn("Could not update user profile for shadow mute:", e);
      }
      isCurrentlyShadowMuted = shadowMutedUntil > now;
    }

    const status = isCurrentlyShadowMuted ? 'shadow_muted' : (isMature ? 'pending' : 'approved');

    const postData: any = {
      authorId: user.uid,
      authorName: user.displayName,
      authorIsVerified: !!user.is_verified,
      authorBadges: user.badges || [],
      content,
      isMature,
      moderationStatus: status,
      createdAt: serverTimestamp()
    };
    if (image) postData.image = image;
    if (mediaType) postData.mediaType = mediaType;
    if (poll) postData.poll = poll;
    await addDoc(collection(db, 'world_feed'), postData);
    checkMentions(content, user.displayName);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'world_feed');
  }
}

// World Chat
export function subscribeToChat(worldId: string, callback: (messages: any[]) => void) {
  if (!worldId) {
    console.error("subscribeToChat called with empty worldId. Subscribing aborted to avoid permission leak.");
    callback([]);
    return () => {}; // return empty unsubscribe
  }
  
  const collectionName = `world_chat_${worldId}`;
  const q = query(
    collection(db, collectionName), 
    where("worldId", "==", worldId),
    orderBy('createdAt', 'desc'), 
    limit(25)
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
    callback(messages);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, collectionName);
  });
}

export async function sendChatMessage(worldId: string, text: string, user: UserProfile) {
  const collectionName = `world_chat_${worldId}`;
  try {
    await addDoc(collection(db, collectionName), {
      worldId,
      authorId: user.uid,
      authorName: user.displayName,
      authorIsVerified: !!user.is_verified,
      authorBadges: user.badges || [],
      text,
      createdAt: serverTimestamp()
    });
    checkMentions(text, user.displayName);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionName);
  }
}

// Admin Operations
export async function grantCurrency(uid: string, amount: number) {
  const path = `users/${uid}`;
  try {
    const user = await getUserProfile(uid);
    if (!user) return;
    await updateDoc(doc(db, 'users', uid), {
      mouxBalance: (user.mouxBalance || 0) + amount
    });
    await mouxBotSignal(uid, 'Capital Injection', `MouxBot has allocated ${amount} M1 to your account.`, '/#identity');
    await mouxBotFeedPost(`[ECONOMY] Supply expansion: ${user.displayName} has received a ${amount} M1 credit allocation.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleBadge(uid: string, badgeName: string) {
  const path = `users/${uid}`;
  try {
    const user = await getUserProfile(uid);
    if (!user) return;
    const badges = user.badges || [];
    const isAdding = !badges.includes(badgeName);
    const newBadges = isAdding 
      ? [...badges, badgeName]
      : badges.filter(b => b !== badgeName);
    await updateDoc(doc(db, 'users', uid), { badges: newBadges });
    
    if (isAdding) {
      await mouxBotSignal(uid, 'Role/Badge Granted', `MouxBot has acknowledged your new status: ${badgeName}`, '/#settings');
      await mouxBotFeedPost(`[SYSTEM_LOG] Identity recognized: ${user.displayName} has been granted the ${badgeName} badge.`);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function purchaseItem(uid: string, itemName: string, cost: number) {
  const user = await getUserProfile(uid);
  if (!user || (user.mouxBalance || 0) < cost) throw new Error('Insufficient balance');
  
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      mouxBalance: (user.mouxBalance || 0) - cost,
      inventory: arrayUnion(itemName)
    });
    await mouxBotSignal(uid, 'Inventory Update', `Physical item acquired: ${itemName}. Stored in your VOID storage.`, '/#market');
    await mouxBotFeedPost(`[ECONOMY] Asset acquisition: ${user.displayName} has acquired [${itemName}] from the market.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function handleSpecialItemPurchase(uid: string, itemName: string) {
  const user = await getUserProfile(uid);
  if (!user) return;

  const updates: Partial<UserProfile> = {};

  if (itemName === 'Name Change Pass') {
    updates.nameChangePasses = (user.nameChangePasses || 0) + 1;
  } else if (itemName === 'Verification Application') {
    updates.is_verified = false; // "Pending" state
    updates.expiryDate = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  }

  if (Object.keys(updates).length > 0) {
    await updateProfile(uid, updates);
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
} catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    return [];
  }
}

export async function getWorldCountry(countryName: string): Promise<any> {
  const id = countryName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!id) return null;
  try {
    const d = await getDoc(doc(db, 'world_countries', id));
    if (d.exists()) {
      return { id, ...d.data() };
    }
    // Create default
    const newData = { name: countryName, presidentId: null, isPublic: false, cityOwnerTitle: 'Prime Minister' };
    await setDoc(doc(db, 'world_countries', id), newData);
    return { id, ...newData };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'world_countries');
    return null;
  }
}

// --- Asset System ---
export async function purchaseAsset(uid: string, asset: Omit<UserAsset, 'id' | 'ownerId' | 'purchaseDate'>, cost: number) {
  const user = await getUserProfile(uid);
  if (!user || user.mouxBalance < cost) throw new Error('Insufficient funds to acquire asset.');

  const path = `user_assets`;
  try {
    // 1. Transaction: Deduct balance
    const totalAssetVal = (user.mouxAssetValue || 0) + asset.value;
    await updateProfile(uid, { 
      mouxBalance: user.mouxBalance - cost,
      mouxAssetValue: totalAssetVal
    });

    // 2. Create Asset record
    await addDoc(collection(db, path), {
      ...asset,
      ownerId: uid,
      purchaseDate: Date.now()
    });

    await mouxBotSignal(uid, 'Asset Acquired', `Successfully purchased ${asset.name}. Net value increased by ${asset.value}.`, '/#market');
    await mouxBotFeedPost(`[WEALTH_LOG] Asset acquired: ${user.displayName} has processed a ${asset.value} M1 acquisition: ${asset.name}.`);
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, path);
    throw e;
  }
}

export async function sellAsset(uid: string, assetId: string, assetValue: number) {
  const user = await getUserProfile(uid);
  if (!user) throw new Error('User not found.');

  const assetRef = doc(db, 'user_assets', assetId);
  const assetDoc = await getDoc(assetRef);
  if (!assetDoc.exists() || assetDoc.data().ownerId !== uid) {
    throw new Error('Asset not found or not owned by user.');
  }

  const tax = assetValue * 0.02;
  const netProceeds = assetValue - tax;

  function formatMoux(val: number) {
    return 'M ' + val.toLocaleString();
  }

  try {
    await updateProfile(uid, {
      mouxBalance: user.mouxBalance + netProceeds,
      mouxAssetValue: Math.max(0, (user.mouxAssetValue || 0) - assetValue)
    });

    await deleteDoc(assetRef);
    
    await mouxBotSignal(uid, 'Asset Sold', `Successfully sold ${assetDoc.data().name}. Tax applied: ${formatMoux(tax)}.`, '/#market');
    await mouxBotFeedPost(`[WEALTH_LOG] Asset liquidated: ${user.displayName} has processed a ${netProceeds} M1 liquidation.`);
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, 'user_assets');
    throw e;
  }
}

export function subscribeToUserAssets(uid: string, callback: (assets: UserAsset[]) => void) {
  const q = query(collection(db, 'user_assets'), where('ownerId', '==', uid), orderBy('purchaseDate', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const assets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserAsset));
    callback(assets);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'user_assets');
  });
}

// --- MouxBot & Wealth Logic ---
const WEALTH_CAP = 100000000; // 100M

export async function checkMouxBotWealth(user: UserProfile) {
  if (user.mouxBalance <= WEALTH_CAP) return;

  const excess = user.mouxBalance - WEALTH_CAP;
  const fee = Math.floor(excess * 0.15);
  const netContribution = excess - fee;
  
  // Auto-convert to MOUX Crypto (mocked as asset/balance update)
  const cryptoAmount = netContribution; // M1 per coin
  
  try {
    // 1. Send Bot DM
    await addDoc(collection(db, 'private_messages'), {
      senderId: 'MouxBot',
      senderName: 'MouxBot [SYSTEM]',
      receiverId: user.uid,
      receiverName: user.displayName,
      text: `WEALTH LIMIT REACHED. Excess funds (${excess}) detected. 15% conversion fee applied. ${netContribution} converted to MOUX Crypto Assets.`,
      createdAt: serverTimestamp(),
      read: false
    });

    // 2. Update User
    await updateProfile(user.uid, {
      mouxBalance: WEALTH_CAP,
      mouxCrypto: (user.mouxCrypto || 0) + cryptoAmount,
      mouxAssetValue: (user.mouxAssetValue || 0) + netContribution
    });

    // 3. Create entry in assets as 'Financials'
    await addDoc(collection(db, 'user_assets'), {
      ownerId: user.uid,
      type: 'collectible',
      name: 'MOUX Crypto Ingot',
      value: netContribution,
      purchaseDate: Date.now(),
      imageUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=crypto'
    });

  } catch (e) {
    console.error('Wealth check failure:', e);
  }
}

// --- Dungeon System ---
export async function enterDungeon(uid: string) {
  const user = await getUserProfile(uid);
  if (!user) return null;

  const stats = user.dungeonStats || {
    health: 100,
    maxHealth: 100,
    lastDungeonAt: 0,
    dungeonLevel: 1
  };

  // Cooldown check (5 mins)
  if (Date.now() - stats.lastDungeonAt < 300000) {
    throw new Error('Player fatigue detected. Wait for recovery.');
  }

  // Update status for cooldown
  await updateProfile(uid, {
    dungeonStats: { ...stats, lastDungeonAt: Date.now(), health: stats.maxHealth }
  });

  return stats;
}

export async function completeDungeon(uid: string, result: { success: boolean, loot?: number, damage?: number }) {
  const user = await getUserProfile(uid);
  if (!user) return;

  const stats = user.dungeonStats!;
  const newHealth = Math.max(0, stats.health - (result.damage || 0));
  
  const updates: Partial<UserProfile> = {
    dungeonStats: {
      ...stats,
      health: newHealth,
      dungeonLevel: result.success ? stats.dungeonLevel + 1 : stats.dungeonLevel
    }
  };

  if (result.success && result.loot) {
    updates.mouxBalance = (user.mouxBalance || 0) + result.loot;
  }

  await updateProfile(uid, updates);
  return updates;
}

export async function getWorldCity(countryId: string, cityName: string): Promise<any> {
  const id = `${countryId}_${cityName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  try {
    const d = await getDoc(doc(db, 'world_cities', id));
    if (d.exists()) {
      return { id, ...d.data() };
    }
    const newData = { countryId, name: cityName, ownerId: null };
    await setDoc(doc(db, 'world_cities', id), newData);
    return { id, ...newData };
  } catch(error) {
    handleFirestoreError(error, OperationType.GET, 'world_cities');
    return null;
  }
}

export async function updateWorldCountry(id: string, data: Partial<any>) {
  try {
    await updateDoc(doc(db, 'world_countries', id), data);
  } catch(error) {
    handleFirestoreError(error, OperationType.UPDATE, `world_countries/${id}`);
  }
}

export async function updateWorldCity(id: string, data: Partial<any>) {
  try {
    await updateDoc(doc(db, 'world_cities', id), data);
  } catch(error) {
    handleFirestoreError(error, OperationType.UPDATE, `world_cities/${id}`);
  }
}

// --- Community Servers ---
export async function createCommunityServer(server: Omit<CommunityServer, 'id' | 'createdAt' | 'membersCount'>) {
  const path = 'community_servers';
  try {
    const defaultChannels = [
      {
        district_id: "general",
        channel_name: "# general",
        is_private: false,
        allowed_roles: []
      }
    ];

    const docRef = await addDoc(collection(db, path), {
      ...server,
      server_id: "",
      server_name: server.name,
      server_avatar: server.iconURL || "",
      district_channels: defaultChannels,
      createdAt: serverTimestamp(),
      membersCount: 1
    });

    const serverId = docRef.id;

    // Set the server_id in the doc
    await updateDoc(docRef, { server_id: serverId });

    // Add initial channel to districts sub-collection
    try {
      const generalChanRef = doc(db, 'community_servers', serverId, 'districts', 'general');
      await setDoc(generalChanRef, {
        district_id: "general",
        channel_name: "# general",
        is_private: false,
        allowed_roles: []
      });
    } catch (errSub) {
      console.warn("Could not write sub-collection general channel:", errSub);
    }

    return serverId;
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, path);
  }
}

export async function getCommunityServers(userId?: string): Promise<CommunityServer[]> {
  try {
    const q = userId 
      ? query(collection(db, 'community_servers'), or(where('isPublic', '==', true), where('ownerId', '==', userId)), orderBy('createdAt', 'desc'))
      : query(collection(db, 'community_servers'), where('isPublic', '==', true), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityServer));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'community_servers');
    return [];
  }
}

export function subscribeToCommunityServers(userId: string | null, callback: (servers: CommunityServer[]) => void) {
  const q = userId 
    ? query(collection(db, 'community_servers'), or(where('isPublic', '==', true), where('ownerId', '==', userId)), orderBy('createdAt', 'desc'))
    : query(collection(db, 'community_servers'), where('isPublic', '==', true), orderBy('createdAt', 'desc'));
    
  return onSnapshot(q, (snapshot) => {
    const servers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityServer));
    callback(servers);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'community_servers');
  });
}

export async function createDistrictChannel(
  serverId: string,
  channelName: string,
  isPrivate: boolean,
  allowedRoles: string[]
): Promise<DistrictChannel | undefined> {
  const path = `community_servers/${serverId}/districts`;
  try {
    const district_id = "dist_" + Math.random().toString(36).substring(2, 10);
    const district: DistrictChannel = {
      district_id,
      channel_name: channelName.startsWith("#") ? channelName : `# ${channelName}`,
      is_private: isPrivate,
      allowed_roles: allowedRoles
    };

    // 1. Write to nested /districts sub-collection doc
    const channelRef = doc(db, 'community_servers', serverId, 'districts', district_id);
    await setDoc(channelRef, district);

    // 2. Synchronize by updating the array field on the parent server document
    const serverRef = doc(db, 'community_servers', serverId);
    const serverSnap = await getDoc(serverRef);
    if (serverSnap.exists()) {
      const serverData = serverSnap.data();
      const currentChans = serverData.district_channels || [];
      await updateDoc(serverRef, {
        district_channels: [...currentChans, district]
      });
    }

    return district;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

