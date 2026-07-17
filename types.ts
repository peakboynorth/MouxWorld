export type Rank = 'Wanderer' | 'Scholar' | 'Knight' | 'Lord' | 'GOD' | 'Young Adventurer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  rank: Rank;
  location: string;
  mouxBalance: number;
  isBanned: boolean;
  ageVerified: boolean | null; // null for not yet asked, false for minor, true for 18+
  isAdmin: boolean;
  nameChangePasses: number;
  createdAt: number;
  bio?: string;
  profileColor?: string;
  photoURL?: string;
  username?: string;
  last_username_update?: number;
  blockedUsers?: string[];
  mutedUsers?: string[];
  isGuest?: boolean;
  badges?: string[];
  is_verified?: boolean;
  is_pro?: boolean;
  is_pro_plus?: boolean;
  is_veteran?: boolean;
  avatar_base64?: string;
  isOnline?: boolean;
  lastSeen?: string;
  followingCount?: number;
  followersCount?: number;
  worldCountry?: string;
  worldCity?: string;
  inventory?: string[];
  expiryDate?: number;
  is_new_user?: boolean;
  // Wealth & Social system
  mouxCrypto?: number;
  mouxAssetValue?: number;
  primaryWeaponId?: string;
  primaryWeaponName?: string;
  updatedAt?: number;
  dungeonStats?: {
    health: number;
    maxHealth: number;
    lastDungeonAt: number;
    dungeonLevel: number;
  };
  favoriteMarketItems?: string[];
  muteGlobalPopups?: boolean;
  recentPosts?: number[];
  shadowMutedUntil?: number;
  loginStreak?: number;
  lastLoginDate?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  twoFactorRecoveryCodes?: string[];
}

export interface WorldCountry {
  id: string;
  name: string;
  presidentId: string | null;
  isPublic: boolean;
  cityOwnerTitle: 'Prime Minister' | 'Governor' | 'King';
}

export interface WorldCity {
  id: string;
  countryId: string;
  name: string;
  ownerId: string | null;
}

export interface DistrictChannel {
  district_id: string;
  channel_name: string;
  is_private: boolean;
  allowed_roles: string[];
}

export interface CommunityServer {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  iconURL?: string;
  isPublic: boolean;
  createdAt: any;
  membersCount: number;
  server_id?: string;
  server_name?: string;
  server_avatar?: string;
  district_channels?: DistrictChannel[];
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetId?: string;
  targetName?: string;
  details: string;
  createdAt: number;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: number;
  likes?: string[];
  image?: string;
  replies?: PostComment[];
}

export interface StatusUpdate {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: number;
  isMature?: boolean;
  isEdited?: boolean;
  isSystem?: boolean;
  moderationStatus?: 'pending' | 'approved' | 'rejected' | 'shadow_muted';
  likes?: string[]; // Array of user IDs who liked the post
  reactions?: { [emoji: string]: string[] };
  repliesCount?: number;
  views?: number;
  image?: string;
  mediaType?: 'image' | 'video';
  poll?: {
    question: string;
    options: { text: string; votes: string[] }[];
  };
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetType: 'feed' | 'chat';
  targetContent: string;
  authorId: string;
  reason: string;
  createdAt: number;
  status: 'pending' | 'resolved';
}

export type ThemeMode = 'dark' | 'light' | 'low-power';

export interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
  isEdited?: boolean;
}

export interface UserAsset {
  id: string;
  ownerId: string;
  type: 'real_estate' | 'car' | 'collectible' | 'banner' | 'passes' | 'financials' | 'weapon' | 'ammunition';
  name: string;
  value: number;
  purchaseDate: number;
  imageUrl?: string;
}

export interface PrivateMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  text: string;
  createdAt: number;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'dm' | 'mention' | 'system';
  title: string;
  message: string;
  link?: string;
  createdAt: number;
  read: boolean;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}
