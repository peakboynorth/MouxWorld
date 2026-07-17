/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { TraderBotInterface } from "./components/TraderBotInterface";
import { CryptoChart } from "./components/CryptoChart";
import { CustomMediaPicker } from "./components/CustomMediaPicker";
import {
  Users,
  MessageSquare,
  Globe,
  ShieldAlert,
  Menu,
  User,
  MapPin,
  Coins,
  Loader2,
  CornerDownRight,
  Send,
  LogOut,
  X,
  Plus,
  Minus,
  Ban,
  ShieldCheck,
  Search,
  CheckCheck,
  Hash,
  AtSign,
  Palette,
  FileText,
  UserPlus,
  Upload,
  MessageCircle,
  Flag,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Zap,
  Filter,
  Eye,
  EyeOff,
  History,
  ArrowUpDown,
  Lock,
  PieChart,
  Radio,
  BellOff,
  Bell,
  ChevronRight,
  ArrowRight,
  Unlock,
  Quote,
  Mail,
  Settings,
  BadgeCheck,
  ImagePlus,
  Trash2,
  MoreVertical,
  UserCheck,
  UserX,
  Server,
  ShoppingBag,
  Info,
  Edit2,
  Check,
  CreditCard,
  Heart,
  Home,
  Wallet,
  Sparkles,
  Package,
  Box,
  TrendingUp,
  Skull,
  Crosshair,
  Target,
  Flame,
  Activity,
  BrainCircuit,
  Cpu,
  Monitor,
  Building,
  Truck,
  Droplets,
  Dna,
  Smile,
  Battery,
  BatteryLow,
  AlertCircle,
  ChevronDown,
  Scale,
  Copy,
  Terminal,
  Ghost,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn, formatMoux } from "./lib/utils";
import { generateTOTP, generateSecret, generateRecoveryCodes, verifyTOTP } from "./lib/totp";
import { compressImage } from "./lib/imageUtils";
import { ServerDebateMode } from "./components/ServerDebateMode";
import { ImageCropperModal } from "./components/ImageCropperModal";
import { FeedComposer } from "./components/FeedComposer";
import {
  UserProfile,
  ChatMessage,
  StatusUpdate,
  Rank,
  PrivateMessage,
  Notification as MouxNotification,
  ThemeMode,
  Report,
  AdminLog,
  CommunityServer,
  DistrictChannel,
  UserAsset,
  PostComment,
} from "./types";
import { 
  getFirestore, 
  doc, 
  updateDoc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  deleteDoc,
  increment,
  where
} from "firebase/firestore";
import {
  auth,
  db,
  loginWithGoogle,
  loginEmail,
  registerEmail,
  loginGuest,
  linkGuestWithEmail,
  getUserProfile,
  createUserProfile,
  subscribeToChat,
  subscribeToFeed,
  sendChatMessage,
  postToFeed,
  updateProfile,
  getAllUsers,
  isUsernameUnique,
  getWorldCountry,
  getWorldCity,
  updateWorldCountry,
  updateWorldCity,
  subscribeToNotifications,
  markNotificationAsRead,
  sendPrivateMessage,
  subscribeToDMs,
  markPrivateMessagesAsRead,
  searchUsers,
  subscribeToModerationQueue,
  updateModerationStatus,
  subscribeToReports,
  resolveReport,
  reportContent,
  muteUser,
  unmuteUser,
  blockUser,
  unblockUser,
  toggleReaction,
  logAdminAction,
  grantCurrency,
  toggleBadge,
  purchaseItem,
  handleSpecialItemPurchase,
  subscribeToUserProfile,
  deletePost,
  deleteComment,
  updateComment,
  likeComment,
  updatePost,
  sellAsset,
  toggleVerification,
  followUser,
  unfollowUser,
  isFollowing,
  getFollowedIds,
  subscribeToFollowingFeed,
  createCommunityServer,
  subscribeToCommunityServers,
  createDistrictChannel,
  purchaseAsset,
  subscribeToUserAssets,
  toggleFavoriteMarketItem,
  enterDungeon,
  completeDungeon,
  checkMouxBotWealth,
  toggleLikePost,
  subscribeToComments,
  addComment,
  markAllNotificationsAsRead,
  banUser,
  getBannedUser,
  submitAppeal,
  subscribeToAppeals,
  resolveAppeal,
  testConnection,
  getFollowers,
  getFollowing
} from "./firebase";
import { onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { MouxLoader } from "./components/MouxLoader";
// import { Tooltip } from "./components/Tooltip";
import { LazyGifImage } from "./components/LazyGifImage";
import { LazyVideo } from "./components/LazyVideo";
import { MediaLightbox } from "./components/MediaLightbox";
import { SelarCheckoutModal } from "./components/SelarCheckoutModal";

const PROFANITY_LIST = ["damn", "hell", "crap", "shit", "fuck", "ass", "bitch"];

const FUNNY_REPLACEMENTS = [
  "Baka!",
  "Meow",
  "Low-level energy",
  "Nyan~",
  "*Confused Anime Noise*",
  "Pika Pika!",
  "[REDACTED]",
];

function MarketDetailModal({
  item,
  onClose,
  onBuy,
  volatility,
  isFavorite,
  onFavorite,
}: {
  item: any;
  onClose: () => void;
  onBuy: (item: any, qty?: number) => void;
  volatility?: number;
  isFavorite?: boolean;
  onFavorite?: () => void;
}) {
  const [qty, setQty] = useState(1);
  const totalCost = item.price * qty;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-4xl bg-black border-gray-200 dark:border-gray-800 flex flex-col md:flex-row relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
          {onFavorite && (
            <button
              onClick={onFavorite}
              className={cn(
                "p-2 rounded-full transition-colors",
                isFavorite
                  ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  : "bg-black/40 text-gray-400 hover:text-white hover:bg-black/60",
              )}
            >
              <Heart className={cn("w-6 h-6", isFavorite && "fill-current")} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="w-full md:w-1/2 h-64 md:h-auto bg-black relative group overflow-hidden">
          {item.image ? (
            <img
              src={item.image || undefined}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-moux-cyan/20">
              {React.cloneElement(item.icon, { className: "w-48 h-48" })}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-discord-dark via-transparent to-transparent" />
          <div className="absolute top-8 left-8">
            <div className="p-4 bg-[#121212] border-gray-200 dark:border-gray-800 text-white">
              {item.icon}
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 md:p-12 flex flex-col max-h-[80vh] overflow-y-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-moux-cyan/10 text-moux-cyan text-[10px] font-semibold tracking-wide rounded-full border border-moux-cyan/20">
                {item.type.replace("_", " ")}
              </span>
              {item.ticker && (
                <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-semibold tracking-wide rounded-full border border-green-500/20">
                  {item.ticker}
                </span>
              )}
            </div>
            <h2 className="text-4xl font-semibold text-white font-semibold tracking-tight mb-4">
              {item.name}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 ">
              {item.description} Access the digital sovereignty of this asset.
              Authenticated by Moux Protocols.
            </p>

            {item.type === "financials" && (
                <div className="mb-8">
                  <CryptoChart data={Array.from({length: 100}, (_, i) => ({time: i.toString(), value: Math.random() * 100}))} />
                </div>
            )}
            {item.stats && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {Object.entries(item.stats).map(([k, v]) => (
                  <div
                    key={k}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <p className="text-[10px] font-bold text-gray-500 mb-1">
                      {k.replace("_", " ")}
                    </p>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        k === "Damage" ? "text-red-500" : "text-white",
                      )}
                    >
                      {v as string}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-auto space-y-6 pt-8 border-t border-white/5">
            {item.type === "financials" && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 tracking-widest">
                  Investment Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-mono text-sm focus:outline-none focus:border-moux-cyan/50"
                />
              </div>
            )}

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-500 mb-1 opacity-50">
                  Settlement Total
                </p>
                <h3 className="text-4xl font-semibold text-white tracking-tight">
                  {formatMoux(totalCost)}
                </h3>
              </div>
              <button
                onClick={() =>
                  onBuy(item, item.type === "financials" ? qty : undefined)
                }
                className="px-10 py-4 bg-white text-black font-bold text-xs tracking-[0.2em] hover:brightness-110 transition-all active:scale-95"
              >
                BUY ASSET
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const isAdminEmail = (email?: string | null) =>
  email === "pervercy23@gmail.com";
const isSpecialUser = (uid: string, name: string) =>
  name === "Moux" || name.toLowerCase() === "admin";

const userCache: Record<string, UserProfile> = {};

const useUserBadges = (
  uid?: string,
  initialName?: string,
  initialEmail?: string | null,
  initialIsVerified?: boolean,
  initialBadges?: string[],
) => {
  const [data, setData] = useState({
    name: initialName,
    email: initialEmail,
    is_verified: initialIsVerified,
    is_pro: false,
    is_pro_plus: false,
    is_veteran: false,
    badges: initialBadges,
    isGuest: false,
  });

  useEffect(() => {
    if (!uid) return;
    if (userCache[uid]) {
      const cached = userCache[uid];
      setData({
        name: cached.displayName,
        email: cached.email,
        is_verified: cached.is_verified,
        is_pro: cached.is_pro,
        is_pro_plus: cached.is_pro_plus || false,
        is_veteran: cached.is_veteran,
        badges: cached.badges,
        isGuest: !!cached.isGuest,
      });
      return;
    }

    // Fetch if not in cache (background)
    getUserProfile(uid).then((profile) => {
      if (profile) {
        userCache[uid] = profile;
        setData({
          name: profile.displayName,
          email: profile.email,
          is_verified: profile.is_verified,
          is_pro: profile.is_pro,
          is_pro_plus: profile.is_pro_plus || false,
          is_veteran: profile.is_veteran,
          badges: profile.badges,
          isGuest: !!profile.isGuest,
        });
      }
    }).catch((err) => {
      console.warn("Silent bypass of getUserProfile inside useUserBadges (offline):", err);
    });
  }, [uid]);

  return data;
};

const VerifiedBadge = ({
  className,
  isAdmin: propIsAdmin,
  uid,
  name: initialName,
  email: initialEmail,
  badges: initialBadges,
  isVerified: initialIsVerified,
}: {
  className?: string;
  isAdmin?: boolean;
  uid?: string;
  name?: string;
  email?: string | null;
  badges?: string[];
  isVerified?: boolean;
}) => {
  const { name, email, is_verified, is_pro, is_pro_plus, is_veteran, badges, isGuest } = useUserBadges(
    uid,
    initialName,
    initialEmail,
    initialIsVerified,
    initialBadges,
  );

  const isAdmin =
    propIsAdmin ||
    (name && isSpecialUser(uid || "", name)) ||
    isAdminEmail(email);

  const showFounder = ((badges || []).includes("Founder") || isAdmin) && !is_veteran && !is_pro_plus;
  const showEarlyBird = ((badges || []).includes("Early Bird") && !isGuest) && !is_veteran && !is_pro_plus;

  // Admin Bypass Lock: email or name matching Master Admin is locked permanently and displays the System Radar priority badge
  const isMasterAdmin = 
    email === "pervercy23@gmail.com" || 
    email?.toLowerCase() === "pervercy23@gmail.com" || 
    initialEmail === "pervercy23@gmail.com" || 
    initialEmail?.toLowerCase() === "pervercy23@gmail.com" || 
    (uid && uid === "MOUXBOT_ADMIN_BYPASS_ID") ||
    (name && name.toLowerCase().includes("pervercy")) ||
    (initialName && initialName.toLowerCase().includes("pervercy"));

  if (isMasterAdmin) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width="20" 
          height="20" 
          fill="none"
          className={className}
        >
          <defs>
            <linearGradient id="systemRadarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF1493" />
              <stop offset="50%" stopColor="#00FFFF" />
              <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>
            <style>
              {`
                @keyframes radarPulse {
                  0% { transform: scale(1); filter: drop-shadow(0 0 1px #00FFFF); }
                  50% { transform: scale(1.1); filter: drop-shadow(0 0 4px #FF1493); }
                  100% { transform: scale(1); filter: drop-shadow(0 0 1px #00FFFF); }
                }
                .system-radar-pulse {
                  transform-origin: center;
                  animation: radarPulse 1.5s infinite ease-in-out;
                }
              `}
            </style>
          </defs>
          <g className="system-radar-pulse">
            <path d="M12 2L14.8 5.7L19.2 4.8L18.8 9.3L22 12L18.8 14.7L19.2 19.2L14.8 18.3L12 22L9.2 18.3L4.8 19.2L5.2 14.7L2 12L5.2 9.3L4.8 4.8L9.2 5.7L12 2Z" fill="url(#systemRadarGrad)"/>
            <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
        </svg>
      </div>
    );
  }

  let highestTier: "veteran" | "pro_plus" | "pro" | "verified" | null = null;
  if (is_veteran) highestTier = "veteran";
  else if (is_pro_plus) highestTier = "pro_plus";
  else if (is_pro) highestTier = "pro";
  else if (is_verified) highestTier = "verified";

  if (!highestTier && !showFounder && !showEarlyBird) return null;

  return (
    <div
      className={
        "flex items-center gap-1 " +
        (className && className.includes("w-6") ? "scale-110 origin-left" : "")
      }
    >
      {highestTier === "veteran" && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" className={className}>
          <defs>
            <linearGradient id="shimmerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>
            <style>
              {`
                @keyframes goldSweep {
                  0% { opacity: 0.85; filter: drop-shadow(0 0 1px #FFD700); }
                  50% { opacity: 1; filter: drop-shadow(0 0 4px #FFFFFF); }
                  100% { opacity: 0.85; filter: drop-shadow(0 0 1px #FFD700); }
                }
                .moux-shimmer {
                  animation: goldSweep 2.5s infinite linear;
                  background-size: 200% 100%;
                }
              `}
            </style>
          </defs>
          <g className="moux-shimmer">
            <path d="M12 2L14.8 5.7L19.2 4.8L18.8 9.3L22 12L18.8 14.7L19.2 19.2L14.8 18.3L12 22L9.2 18.3L4.8 19.2L5.2 14.7L2 12L5.2 9.3L4.8 4.8L9.2 5.7L12 2Z" fill="url(#shimmerGrad)"/>
            <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
        </svg>
      )}
      {highestTier === "pro_plus" && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" className={className}>
          <style>
            {`
              @keyframes mouxBreathing {
                0% { transform: scale(1); }
                50% { transform: scale(1.08); }
                100% { transform: scale(1); }
              }
              .moux-pulse {
                transform-origin: center;
                animation: mouxBreathing 2s infinite ease-in-out;
              }
            `}
          </style>
          <g className="moux-pulse">
            <path d="M12 2L14.8 5.7L19.2 4.8L18.8 9.3L22 12L18.8 14.7L19.2 19.2L14.8 18.3L12 22L9.2 18.3L4.8 19.2L5.2 14.7L2 12L5.2 9.3L4.8 4.8L9.2 5.7L12 2Z" fill="#7C4DFF"/>
            <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
        </svg>
      )}
      {highestTier === "pro" && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" className={className}>
          <path d="M12 2L14.8 5.7L19.2 4.8L18.8 9.3L22 12L18.8 14.7L19.2 19.2L14.8 18.3L12 22L9.2 18.3L4.8 19.2L5.2 14.7L2 12L5.2 9.3L4.8 4.8L9.2 5.7L12 2Z" fill="#1DA1F2"/>
          <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {highestTier === "verified" && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M16 8C16 9.87034 15.3905 11.6917 14.269 13.1974C13.1475 14.703 11.5744 15.8131 9.78007 16.357C7.98577 16.9009 6.06456 16.8491 4.30453 16.2114C2.54449 15.5738 1.04018 14.3855 0 12.8306L1.87974 11.558C2.65863 12.7225 3.78546 13.6124 5.10398 14.0899C6.42249 14.5674 7.86175 14.6063 9.20603 14.1988C10.5503 13.7912 11.7289 12.9598 12.5689 11.8318C13.4088 10.7039 13.8653 9.33923 13.8653 7.9448H16Z" fill="#007FFF"/>
          <path d="M4.5 8L7 10.5L11.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {showFounder && (
        <ShieldCheck
          className={cn("text-yellow-400 fill-yellow-400/10", className)}
        />
      )}
      {showEarlyBird && (
        <Check className={cn("text-green-500", className)} strokeWidth={4} />
      )}
    </div>
  );
};

interface PostViewTrackerProps {
  postId: string;
  currentViews: number;
  onIncrement: (postId: string, currentViews: number) => void;
}

const PostViewTracker = ({ postId, currentViews, onIncrement }: PostViewTrackerProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onIncrement(postId, currentViews);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [postId, currentViews, onIncrement]);

  return <div ref={elementRef} className="absolute inset-0 pointer-events-none opacity-0" />;
};

const isUserOnline = (user: UserProfile) => {
  if (user.displayName === "Moux" || user.displayName.toLowerCase() === "admin")
    return true;
  if (!user.lastSeen) return user.isOnline || false;
  const lastSeenDate = new Date(user.lastSeen);
  const now = new Date();
  return now.getTime() - lastSeenDate.getTime() < 300000; // 5 minutes
};

const UserAvatar = ({ 
  uid, 
  className, 
  isMouxBot, 
  isBannedAuthor,
  size = "w-10 h-10"
}: { 
  uid: string; 
  className?: string; 
  isMouxBot?: boolean; 
  isBannedAuthor?: boolean;
  size?: string;
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(userCache[uid] || null);

  useEffect(() => {
    if (!uid || isMouxBot || isBannedAuthor) return;
    return subscribeToUserProfile(uid, (newProfile) => {
      if (newProfile) {
        userCache[uid] = newProfile;
        setProfile((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(newProfile)) {
            return newProfile;
          }
          return prev;
        });
      }
    });
  }, [uid, isMouxBot, isBannedAuthor]);

  if (isBannedAuthor) {
    return <div className={cn("bg-white opacity-80", size, className)} />;
  }

  if (isMouxBot) {
    return (
      <img
        src="https://api.dicebear.com/9.x/bottts-neutral/svg?seed=MouxBot&backgroundColor=ef4444"
        alt="MouxBot"
        className={cn("object-cover", size, className)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <img
      src={getAvatarUrl(profile || (uid ? { uid } as UserProfile : null)) || undefined}
      alt=""
      className={cn("object-cover", size, className)}
      referrerPolicy="no-referrer"
    />
  );
};

const getAvatarUrl = (profile: UserProfile | null) => {
  if (profile?.isBanned) return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23ffffff"/></svg>';
  if (profile?.avatar_base64) return profile.avatar_base64;
  if (profile?.photoURL) return profile.photoURL;
  return `https://api.dicebear.com/9.x/lorelei/svg?seed=${profile?.uid || "guest"}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
};

function filterProfanity(text: string): string {
  let filtered = text;
  PROFANITY_LIST.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    filtered = filtered.replace(regex, () => {
      const randomWord =
        FUNNY_REPLACEMENTS[
          Math.floor(Math.random() * FUNNY_REPLACEMENTS.length)
        ];
      return randomWord;
    });
  });
  return filtered;
}

const BalanceTicker = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000;
    const initialValue = displayValue;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.floor(
        progress * (value - initialValue) + initialValue,
      );
      setDisplayValue(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm md:text-xl font-semibold text-green-500 font-sans tracking-tight drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]">
        M̶ {displayValue.toLocaleString()}
      </span>
    </div>
  );
};

const DungeonMiniGame = ({
  user,
  onClose,
  onComplete,
  theme,
}: {
  user: UserProfile;
  onClose: () => void;
  onComplete: (result: any) => void;
  theme: ThemeMode;
}) => {
  const isLowPower = theme === "low-power";
  const animationsEnabled = !isLowPower;
  const blurEnabled = !isLowPower;
  const [status, setStatus] = useState<"IDLE" | "FIGHTING" | "WON" | "LOST">(
    "IDLE",
  );
  const [enemyHP, setEnemyHP] = useState(100);
  const [playerHP, setPlayerHP] = useState(user.dungeonStats?.health || 100);
  const [feedback, setFeedback] = useState("CHATTING...");
  const [loot, setLoot] = useState(0);

  const startFight = async () => {
    try {
      await enterDungeon(user.uid);
      setStatus("FIGHTING");
      setFeedback("REFLEX PATTERN DETECTED. TAP TO STRIKE!");
    } catch (e: any) {
      setFeedback(e.message);
    }
  };

  const handleTap = () => {
    if (status !== "FIGHTING") return;

    const crit = Math.random() > 0.8;
    const damage = crit ? 15 : 8;
    const newEnemyHP = Math.max(0, enemyHP - damage);
    setEnemyHP(newEnemyHP);
    setFeedback(crit ? "CRITICAL STRIKE!" : "HIT!");

    if (newEnemyHP <= 0) {
      const reward = Math.floor(Math.random() * 5000) + 1000;
      setLoot(reward);
      setStatus("WON");
      onComplete({ success: true, loot: reward });
    } else {
      // Enemy counter
      if (Math.random() > 0.6) {
        const pDamage = Math.floor(Math.random() * 5) + 2;
        const newPHP = Math.max(0, playerHP - pDamage);
        setPlayerHP(newPHP);
        if (newPHP <= 0) {
          setStatus("LOST");
          onComplete({ success: false, damage: 10 });
        }
      }
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 z-[110] bg-black/95 flex flex-col items-center justify-center p-6 overflow-hidden font-mono",
      blurEnabled && "backdrop-blur-3xl"
    )}>
      <div className="absolute top-0 left-0 w-full h-1 bg-white/10" />

      {status === "IDLE" ? (
        <div className="text-center space-y-8">
          <div className="w-24 h-24 rounded-full border-4 border-white/5 mx-auto flex items-center justify-center animate-pulse">
            <Skull className="w-12 h-12 text-gray-500" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold  text-white tracking-tighter mb-2">
              The Dungeons
            </h2>
            <p className="text-xs text-moux-cyan tracking-wide leading-relaxed max-w-xs mx-auto">
              Combat Protocol. Success yields Moux. Failure drains Essence.
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onClose}
              className="px-8 py-3 border border-white/10 rounded-xl text-gray-500 font-bold tracking-wide text-[10px] hover:bg-white/5 transition-all"
            >
              Retreat
            </button>
            <button
              onClick={startFight}
              className="px-8 py-3 bg-red-500 text-white rounded-xl font-semibold tracking-wide text-[10px] hover:brightness-110 transition-all"
            >
              Initiate
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-12 text-center">
          <header className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="text-left">
              <p className="text-[8px] text-gray-500 tracking-wide mb-1">
                Player Health
              </p>
              <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-moux-cyan transition-all"
                  style={{ width: `${playerHP}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-gray-500 tracking-wide mb-1">
                Target Structural Integrity
              </p>
              <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all underline"
                  style={{ width: `${enemyHP}%` }}
                />
              </div>
            </div>
          </header>

          <motion.div
            animate={status === "FIGHTING" ? { y: [0, -10, 0] } : {}}
            transition={animationsEnabled ? { repeat: Infinity, duration: 2 } : { duration: 0 }}
            className="relative"
          >
            <div
              className="w-48 h-48 rounded-full border border-white/10 mx-auto flex items-center justify-center bg-white/5 group active:scale-95 transition-transform cursor-crosshair"
              onClick={handleTap}
            >
              {status === "FIGHTING" && (
                <Crosshair className="w-20 h-20 text-red-500 animate-spin-slow" />
              )}
              {status === "WON" && (
                <TrendingUp className="w-24 h-24 text-green-500" />
              )}
              {status === "LOST" && (
                <Skull className="w-24 h-24 text-gray-700" />
              )}
            </div>
          </motion.div>

          <div className="space-y-4">
            <p
              className={cn(
                "font-semibold tracking-wide text-sm",
                status === "WON"
                  ? "text-green-500"
                  : status === "LOST"
                    ? "text-red-500"
                    : "text-white",
              )}
            >
              {feedback}
            </p>
            {status === "WON" && (
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                <p className="text-green-500 text-2xl font-semibold">
                  Loot: + {formatMoux(loot)}
                </p>
              </div>
            )}
          </div>

          {(status === "WON" || status === "LOST") && (
            <button
              onClick={onClose}
              className="w-full p-4 bg-white text-black font-semibold tracking-wide text-[10px] rounded-xl"
            >
              Return to Surface
            </button>
          )}
        </div>
      )}
    </div>
  );
};
const MyStuffTab = ({
  user,
  assets,
  showToast,
  setConfirmDialog,
}: {
  user: UserProfile;
  assets: UserAsset[];
  showToast: (msg: string, type: "success" | "error" | "info") => void;
  setConfirmDialog: (dialog: {message: string, onConfirm: () => void} | null) => void;
}) => {
  const categories = [
    {
      id: "arsenal",
      label: "Weapons",
      types: ["weapon", "ammunition"],
      icon: <Crosshair className="w-4 h-4" />,
    },
    {
      id: "financials",
      label: "Financials",
      types: ["financials", "passes"],
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      id: "collectibles",
      label: "Collectibles",
      types: ["collectible"],
      icon: <Sparkles className="w-4 h-4" />,
    },
  ];

  const [activeCategory, setActiveCategory] = useState("arsenal");

  const filteredAssets = assets.filter((a) => {
    const cat = categories.find((c) => c.id === activeCategory);
    return cat?.types.includes(a.type);
  });

  const handleEquipPrimary = async (asset: UserAsset) => {
    if (asset.type !== "weapon") return;
    try {
      await updateProfile(user.uid, {
        primaryWeaponId: asset.id,
        primaryWeaponName: asset.name,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Failed to equip weapon:", error);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold  tracking-tighter text-white">
            My Stuff
          </h3>
          <p className="text-[10px] text-gray-500 font-mono tracking-wide">
            Digital Asset Management
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 font-mono tracking-wide">
            Total Asset Value
          </p>
          <p className="text-lg font-semibold text-moux-cyan tracking-tight">
            M {(user.mouxAssetValue || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex-shrink-0 px-6 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all font-bold text-[10px] tracking-widest",
              activeCategory === cat.id
                ? "bg-moux-cyan/10 border-moux-cyan/50 text-moux-cyan"
                : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10",
            )}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl opacity-30 grayscale">
            <Package className="w-10 h-10 mb-4" />
            <p className="font-mono text-[10px] tracking-wide">
              No assets in this category.
            </p>
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 group hover:border-moux-cyan/30 transition-all relative"
            >
              <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
                {asset.type === "weapon" ? (
                  <Crosshair className="w-6 h-6 text-moux-cyan" />
                ) : (
                  <Package className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white  truncate tracking-tight">
                  {asset.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500 text-moux-cyan">
                    M {asset.value.toLocaleString()}
                  </p>
                  <span className="w-1 h-1 bg-gray-700 rounded-full" />
                  <p className="text-xs text-gray-500 text-gray-500 ">
                    {asset.type.replace("_", " ")}
                  </p>
                </div>
              </div>

              {asset.type === "weapon" && (
                <button
                  onClick={() => handleEquipPrimary(asset)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[8px] font-semibold tracking-wide transition-all",
                    user.primaryWeaponId === asset.id
                      ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                      : "bg-white/10 text-white hover:bg-white/20",
                  )}
                >
                  {user.primaryWeaponId === asset.id ? "Equipped" : "Equip"}
                </button>
              )}
              <button
                onClick={() => {
                  const tax = asset.value * 0.02;
                  setConfirmDialog({
                    message: "Sell " + asset.name + " for " + formatMoux(asset.value - tax) + " (2% City Tax included)?",
                    onConfirm: async () => {
                      try {
                        await sellAsset(user.uid, asset.id, asset.value);
                        showToast("ASSET SOLD.", "success");
                      } catch (e: any) {
                        showToast(e.message, "error");
                      }
                    }
                  });
                }}
                className="px-3 py-1.5 rounded-lg text-[8px] font-semibold tracking-wide bg-red-900/40 text-red-500 hover:bg-red-900/60 transition-all"
              >
                SELL
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const MARKET_ITEMS = [
  // Passes
  {
    id: "verification_pass",
    name: "Identity Verification",
    price: 890000,
    type: "passes",
    description: "Official authenticated persona status. Permanent validity.",
    icon: <BadgeCheck className="w-6 h-6 text-moux-cyan" />,
  },
  {
    id: "name_change",
    name: "Identity Redone",
    price: 15000,
    type: "passes",
    description: "Modify your digital handle without trace.",
    icon: <Edit2 className="w-6 h-6 text-purple-400" />,
  },
  {
    id: "prez_pass",
    name: "Presidential Pass",
    price: 10000000,
    type: "passes",
    description: "Elite access to national governance protocols.",
    icon: <ShieldCheck className="w-6 h-6 text-yellow-400" />,
  },

  // Weapons - Pistols
  {
    id: "enforcer_9mm",
    name: "9mm Enforcer",
    price: 4500,
    type: "weapon",
    subType: "Pistol",
    description:
      "Standard issue urban deterrent. Reliable, compact, and untraceable.",
    icon: <Crosshair className="w-6 h-6 text-moux-cyan" />,
    stats: { Damage: "24", FireRate: "Semi", Range: "Short" },
    image:
      "https://images.unsplash.com/photo-1595079676339-1534802ad6cf?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "desert_eagle",
    name: "Desert Eagle .50",
    price: 12000,
    type: "weapon",
    subType: "Pistol",
    description:
      "High-caliber hand-cannon. Massive stopping power in a elegant frame.",
    icon: <Crosshair className="w-6 h-6 text-moux-cyan" />,
    stats: { Damage: "85", FireRate: "Low", Range: "Medium" },
    image:
      "https://images.unsplash.com/photo-1584281722572-ca3f707f1896?auto=format&fit=crop&q=80&w=800",
  },

  // Weapons - Shotguns
  {
    id: "m1887",
    name: "M1887 Lever Action",
    price: 18000,
    type: "weapon",
    subType: "Shotgun",
    description:
      "Classic devastating spread. Re-engineered for the modern combat.",
    icon: <ShieldAlert className="w-6 h-6 text-moux-cyan" />,
    stats: { Damage: "120", FireRate: "Action", Range: "Point Blank" },
    image:
      "https://images.unsplash.com/photo-1590422516440-60b6916fa48f?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "saiga_12",
    name: "Saiga-12 Auto",
    price: 35000,
    type: "weapon",
    subType: "Shotgun",
    description: "Mag-fed total area denial. Clear rooms in seconds.",
    icon: <ShieldAlert className="w-6 h-6 text-moux-cyan" />,
    stats: { Damage: "95", FireRate: "Auto", Range: "Short" },
    image:
      "https://images.unsplash.com/photo-1599812411674-672537233fc3?auto=format&fit=crop&q=80&w=800",
  },

  // Weapons - Assault Rifles
  {
    id: "ak47_neo",
    name: "AK-47 Custom",
    price: 45000,
    type: "weapon",
    subType: "Assault Rifle",
    description: "The timeless icon, updated with carbon-steel data plating.",
    icon: <Zap className="w-6 h-6 text-moux-cyan" />,
    stats: { Damage: "42", FireRate: "High", Range: "All" },
    image:
      "https://images.unsplash.com/photo-1584226162391-44709d73d9e4?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "m4a1_neural",
    name: "M4A1-Laser",
    price: 58000,
    type: "weapon",
    subType: "Assault Rifle",
    description: "Laser-accurate stabilization with biological message modules.",
    icon: <Zap className="w-6 h-6 text-moux-cyan" />,
    stats: { Damage: "36", FireRate: "Very High", Range: "Medium-Long" },
    image:
      "https://images.unsplash.com/photo-1582230678254-8e360982362b?auto=format&fit=crop&q=80&w=800",
  },

  // Weapons - Snipers
  {
    id: "eraser_sniper",
    name: "The Eraser",
    price: 150000,
    type: "weapon",
    subType: "Sniper",
    description:
      "Precision tool for those who prefer to remain unseen. Guaranteed results from 1000m.",
    icon: <Target className="w-6 h-6 text-moux-cyan" />,
    stats: { Damage: "250", FireRate: "Bolt", Range: "Ultimate" },
    image:
      "https://images.unsplash.com/photo-1595590424514-0e3181827429?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "awp_zenith",
    name: "AWP Zenith Apex",
    price: 280000,
    type: "weapon",
    subType: "Sniper",
    description:
      "The definitive one-shot solution. Heavily armored for executive protection.",
    icon: <Target className="w-6 h-6 text-moux-cyan" />,
    stats: { Damage: "400", FireRate: "Slow", Range: "Infinite" },
    image:
      "https://images.unsplash.com/photo-1595155919656-78cc9441f71a?auto=format&fit=crop&q=80&w=800",
  },

  // Weapons - Explosives
  {
    id: "plasma_grenade",
    name: "Plasma Grenade",
    price: 2500,
    type: "weapon",
    subType: "Explosive",
    description: "Localized explosion in a 5m radius.",
    icon: <Flame className="w-6 h-6 text-orange-500" />,
    stats: { Damage: "∞", AOE: "Large", Trigger: "Timer" },
    image:
      "https://images.unsplash.com/photo-1584281723501-c8ef63406ca5?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "rpg_7_void",
    name: "RPG-7 Heavy",
    price: 75000,
    type: "weapon",
    subType: "Explosive",
    description: "Transversal propellant for structural asset demolition.",
    icon: <Flame className="w-6 h-6 text-orange-500" />,
    stats: { Damage: "Colossal", AOE: "Extreme", Range: "Long" },
    image:
      "https://images.unsplash.com/photo-1490604801530-2bbda2e8ccba?auto=format&fit=crop&q=80&w=800",
  },

  // Ammunition
  {
    id: "ammo_9mm",
    name: "9mm Ammo Pack",
    price: 250,
    type: "ammunition",
    description: "30 rounds of precision 9mm rounds. Required for Enforcer.",
    icon: <Package className="w-6 h-6 text-gray-400" />,
  },
  {
    id: "ammo_slugs",
    name: "12-Gauge Slugs",
    price: 600,
    type: "ammunition",
    description: "10 heavy-impact slugs for Saiga/M1887.",
    icon: <Package className="w-6 h-6 text-gray-400" />,
  },
  {
    id: "ammo_ar",
    name: "5.56 Nato Mag",
    price: 1200,
    type: "ammunition",
    description: "High-velocity 30-round mag for assault platforms.",
    icon: <Package className="w-6 h-6 text-gray-400" />,
  },
  {
    id: "ammo_sniper",
    name: "Armor-Piercing .338",
    price: 2500,
    type: "ammunition",
    description: "5 rounds of heavy sniper caliber.",
    icon: <Package className="w-6 h-6 text-gray-400" />,
  },
  {
    id: "ammo_rocket",
    name: "Rocket Shell",
    price: 15000,
    type: "ammunition",
    description: "Single-use heavy ordinance shell.",
    icon: <Package className="w-6 h-6 text-gray-400" />,
  },

  // Financials - Crypto (6)
  {
    id: "moux_ingot",
    name: "MOUX Crypto Ingot",
    price: 1,
    type: "financials",
    subType: "Crypto",
    description: "Liquid currency compressed into a financial asset.",
    icon: <Coins className="w-6 h-6 text-moux-cyan" />,
    ticker: "MOUX",
  },
  {
    id: "void_token",
    name: "Action Token",
    price: 450,
    type: "financials",
    subType: "Crypto",
    description: "Decentralized utility token for marketplace fees.",
    icon: <Zap className="w-6 h-6 text-gray-500" />,
    ticker: "VOID",
  },
  {
    id: "ether_pulse",
    name: "Ether Pulse",
    price: 3200,
    type: "financials",
    subType: "Crypto",
    description: "Vitality-indexed decentralized backbone coin.",
    icon: <Activity className="w-6 h-6 text-blue-400" />,
    ticker: "ETHER",
  },
  {
    id: "solar_coin",
    name: "Solaris Coin",
    price: 85,
    type: "financials",
    subType: "Crypto",
    description: "Energy-backed currency for habitat sectors.",
    icon: <Sun className="w-6 h-6 text-yellow-500" />,
    ticker: "SOL",
  },
  {
    id: "neural_bit",
    name: "GoldBit",
    price: 61000,
    type: "financials",
    subType: "Crypto",
    description: "The gold standard of the encrypted meta-economy.",
    icon: <BrainCircuit className="w-6 h-6 text-orange-400" />,
    ticker: "NBIT",
  },
  {
    id: "luna_cre",
    name: "Lunar Credit",
    price: 12,
    type: "financials",
    subType: "Crypto",
    description: "Official currency for off-world mining outposts.",
    icon: <Moon className="w-6 h-6 text-gray-300" />,
    ticker: "LUNA",
  },

  // Financials - Stocks (6)
  {
    id: "corp_x_stock",
    name: "Neo-Corp X",
    price: 1500,
    type: "financials",
    subType: "Stocks",
    description: "Equity in the largest computer hardware manufacturer.",
    icon: <Cpu className="w-6 h-6 text-purple-400" />,
    ticker: "NCX",
  },
  {
    id: "moux_media",
    name: "Moux Media Group",
    price: 450,
    type: "financials",
    subType: "Stocks",
    description: "Dominant player in global data streaming and data feeds.",
    icon: <Monitor className="w-6 h-6 text-blue-500" />,
    ticker: "MOX-M",
  },
  {
    id: "zenith_real",
    name: "Zenith Holdings",
    price: 2800,
    type: "financials",
    subType: "Stocks",
    description: "The conglomerate owning 60% of Zenith District real estate.",
    icon: <Building className="w-6 h-6 text-white" />,
    ticker: "ZEN-H",
  },
  {
    id: "void_logistics",
    name: "Global Logistics",
    price: 780,
    type: "financials",
    subType: "Stocks",
    description: "Trans-sector transport and infrastructure specialists.",
    icon: <Truck className="w-6 h-6 text-gray-400" />,
    ticker: "VLOG",
  },
  {
    id: "aqua_pure",
    name: "PureAqua Tech",
    price: 120,
    type: "financials",
    subType: "Stocks",
    description: "Patented water filtration for lower habitats.",
    icon: <Droplets className="w-6 h-6 text-cyan-400" />,
    ticker: "AQUA",
  },
  {
    id: "gen_alpha",
    name: "Gen-Alpha Bio",
    price: 3400,
    type: "financials",
    subType: "Stocks",
    description: "Frontier genetics and biological augmentation systems.",
    icon: <Dna className="w-6 h-6 text-green-400" />,
    ticker: "GAB",
  },

  // Financials - Bonds (4 Gov, 4 Corp)
  {
    id: "gov_u_bond",
    name: "United Treasury",
    price: 10000,
    type: "financials",
    subType: "Government Bonds",
    description: "Backed by the central governance union. Zero risk.",
    icon: <FileText className="w-6 h-6 text-yellow-400" />,
    ticker: "GOV-U",
  },
  {
    id: "sector_7_bond",
    name: "Sector 7 Municipal",
    price: 5000,
    type: "financials",
    subType: "Government Bonds",
    description: "Development bond for reconstruction of Sector 7.",
    icon: <FileText className="w-6 h-6 text-orange-400" />,
    ticker: "S7-MUNI",
  },
  {
    id: "arctic_gov",
    name: "Arctic Perimeter Bond",
    price: 25000,
    type: "financials",
    subType: "Government Bonds",
    description: "Security infrastructure funding for northern gates.",
    icon: <FileText className="w-6 h-6 text-blue-400" />,
    ticker: "ARC-P",
  },
  {
    id: "offworld_gov",
    name: "Lunar Accord Note",
    price: 50000,
    type: "financials",
    subType: "Government Bonds",
    description: "Joint-government treaty backing for lunar assets.",
    icon: <FileText className="w-6 h-6 text-gray-400" />,
    ticker: "LUN-A",
  },

  {
    id: "corp_bond_1",
    name: "Meta-Dynamics Bond",
    price: 12000,
    type: "financials",
    subType: "Corporate Bonds",
    description: "High-yield debt from the Meta-Dynamics corp.",
    icon: <FileText className="w-6 h-6 text-purple-500" />,
    ticker: "MD-BOND",
  },
  {
    id: "energy_bond",
    name: "Volt-Core Senior Note",
    price: 8000,
    type: "financials",
    subType: "Corporate Bonds",
    description: "Debt issuance for the next-gen reactor build-out.",
    icon: <FileText className="w-6 h-6 text-green-500" />,
    ticker: "VC-SEN",
  },
  {
    id: "security_bond",
    name: "Shield-Tech Warrant",
    price: 15000,
    type: "financials",
    subType: "Corporate Bonds",
    description: "Security-oriented convertible debt instrument.",
    icon: <FileText className="w-6 h-6 text-red-500" />,
    ticker: "SHT-W",
  },
  {
    id: "index_pulse",
    name: "MOA Index Bond",
    price: 1000,
    type: "financials",
    subType: "Corporate Bonds",
    description: "Bundled corporate debt indexed to market performance.",
    icon: <FileText className="w-6 h-6 text-moux-cyan" />,
    ticker: "MOA-INDEX",
  },

  // Collectibles
  {
    id: "luxury_banner",
    name: "Luxury Banner",
    price: 8000,
    type: "collectible",
    description: "Visual status augmentation for your digital presence.",
    icon: <Package className="w-6 h-6 text-purple-500" />,
  },
  {
    id: "server_boost",
    name: "Server Boost",
    price: 10000,
    type: "collectible",
    description: "Amplify a community server's resonance community.",
    icon: <Sparkles className="w-6 h-6 text-moux-cyan" />,
  },
];

const REACTION_EMOJIS = ["🔥", "💯", "💸", "🔫", "💀", "������"];

const NonIntrusivePopup = ({
  post,
  onClose,
  onView,
}: {
  post: StatusUpdate;
  onClose: () => void;
  onView: (id: string) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className="fixed bottom-6 right-6 z-[100] w-80 bg-black border-gray-200 dark:border-gray-800 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-moux-cyan" />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <UserAvatar uid={post.authorId} size="w-6 h-6" className="rounded-full" isMouxBot={post.authorId === "MOUXBOT"} />
            <span className="text-[10px] font-semibold text-moux-cyan tracking-wide  flex items-center gap-1">
              {post.authorId === "MOUXBOT" ? <Zap className="w-3 h-3" /> : <Users className="w-3 h-3" />}
              {post.authorId === "MOUXBOT" ? "OFFICIAL" : "FOLLOW_PRIORITY"}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-300 font-mono  line-clamp-2 mb-4 leading-relaxed">
          "{post.content}"
        </p>
        <button
          onClick={() => onView(post.id)}
          className="w-full py-2 bg-moux-cyan text-black text-[10px] font-bold tracking-tight rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
        >
          Access Data Stream <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};

export default function App() {
  useEffect(() => {
    testConnection();
  }, []);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [onboardingPhase, setOnboardingPhase] = useState<'avatar' | 'username'>('avatar');
  const [onboardingAvatar, setOnboardingAvatar] = useState<string>("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23ffffff'/></svg>");
  const [onboardingUsername, setOnboardingUsername] = useState<string>("");
  const [usernameAvailabilityError, setUsernameAvailabilityError] = useState<string>("");
  const [checkingUsername, setCheckingUsername] = useState<boolean>(false);
  const [isSavingOnboarding, setIsSavingOnboarding] = useState<boolean>(false);

  const [isServerMember, setIsServerMember] = useState<boolean | null>(null);
  const [serverHistory, setServerHistory] = useState<any[]>([]);
  const [serverMembers, setServerMembers] = useState<any[]>([]);
  const [showMemberHistory, setShowMemberHistory] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser?.is_new_user) {
      if (currentUser.avatar_base64) {
        setOnboardingAvatar(currentUser.avatar_base64);
      }
      if (currentUser.username && !currentUser.username.startsWith("guest_")) {
        setOnboardingUsername(currentUser.username);
      }
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser || !currentUser.is_new_user || onboardingPhase !== 'username') return;

    if (onboardingUsername.length < 3) {
      setUsernameAvailabilityError("");
      return;
    }

    setCheckingUsername(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const unique = await isUsernameUnique(onboardingUsername);
        if (unique) {
          setUsernameAvailabilityError("");
        } else {
          setUsernameAvailabilityError("Username is already taken");
        }
      } catch (err) {
        console.error("Failed to check username uniqueness:", err);
      } finally {
        setCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [onboardingUsername, onboardingPhase, currentUser?.uid]);

  const handleUsernameChange = (val: string) => {
    const clean = val.replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
    setOnboardingUsername(clean);
  };
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [bannedUserRecord, setBannedUserRecord] = useState<any>(null);
  const [appealInput, setAppealInput] = useState("");
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [minLoading, setMinLoading] = useState(true);
  // Chat room state
  const [activeTab, setActiveTab] = useState<
    | "feed"
    | "servers"
    | "profile"
    | "notifications"
    | "discovery"
    | "settings"
    | "shop"
    | "moux_trader"
  >("feed");
  const [activeCommentPost, setActiveCommentPost] = useState<StatusUpdate | null>(null);
  const [isMoreEmojiActive, setIsMoreEmojiActive] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<PostComment[]>([]);
  const [commentLimit, setCommentLimit] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [modalMode, setModalMode] = useState<
    "none" | "create_server" | "edit_profile"
  >("none");

  const [worldCountry, setWorldCountry] = useState("");

  const requestNotificationPermission = useCallback(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission === "denied") {
            setNotificationPermDenied(true);
          } else {
            setNotificationPermDenied(false);
          }
        });
      } else if (Notification.permission === "denied") {
        setNotificationPermDenied(true);
      }
    }
  }, []);
  const [worldCity, setWorldCity] = useState("");
  const [activeWorldRoom, setActiveWorldRoom] = useState<string | null>(null);
  const [worldScope, setWorldScope] = useState<"city" | "country">("city");
  const [worldCountryData, setWorldCountryData] = useState<any>(null);
  const [worldCityData, setWorldCityData] = useState<any>(null);
  const [showWorldSettings, setShowWorldSettings] = useState(false);
  const [hideGlobalChat, setHideGlobalChat] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);
  const [showDungeons, setShowDungeons] = useState(false);
  const [dungeonActive, setDungeonActive] = useState(false);
  const [dungeonEnemyHP, setDungeonEnemyHP] = useState(100);
  const [dungeonPlayerHP, setDungeonPlayerHP] = useState(100);
  const [dungeonLoot, setDungeonLoot] = useState(0);
  const [dungeonMsg, setDungeonMsg] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState<string>("");
  const [confirmDialog, setConfirmDialog] = useState<{message: string, onConfirm: () => void} | null>(null);
  const [userAssets, setUserAssets] = useState<UserAsset[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isMaturePost, setIsMaturePost] = useState(false);
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<string | null>(null);
  const [activeAlert, setActiveAlert] = useState<StatusUpdate | null>(null);
  const [lastPostId, setLastPostId] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const [notificationPermDenied, setNotificationPermDenied] = useState(false);
  const [mouxBotFeedEnabled, setMouxBotFeedEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const cachedSetting = window.localStorage.getItem("mouxbot_feed_enabled");
      if (cachedSetting !== null) {
        setMouxBotFeedEnabled(cachedSetting === "true");
      }
    }

    getDoc(doc(db, 'settings', 'mouxbot')).then((docSnap) => {
      if (docSnap.exists()) {
        const enabled = docSnap.data().enabled;
        setMouxBotFeedEnabled(enabled);
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem("mouxbot_feed_enabled", String(enabled));
        }
      }
    }).catch((err) => {
      console.warn("Could not load mouxbot settings on boot (offline fallback in use):", err);
    });
  }, []);

  // Two-Factor Authentication States
  const [is2FAVerified, setIs2FAVerified] = useState(false);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [temp2FASecret, setTemp2FASecret] = useState("");
  const [temp2FARecoveryCodes, setTemp2FARecoveryCodes] = useState<string[]>([]);
  const [entered2FAOTP, setEntered2FAOTP] = useState("");
  const [otpVerificationError, setOtpVerificationError] = useState("");
  const [enteredLoginOTP, setEnteredLoginOTP] = useState("");
  const [loginOTPError, setLoginOTPError] = useState("");
  const [showDeactivationOTPInput, setShowDeactivationOTPInput] = useState(false);
  const [enteredDeactivationOTP, setEnteredDeactivationOTP] = useState("");
  const [deactivationError, setDeactivationError] = useState("");

  const [currentSimulatedOTP, setCurrentSimulatedOTP] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  useEffect(() => {
    if (temp2FASecret || currentUser?.twoFactorSecret) {
      const secret = temp2FASecret || currentUser?.twoFactorSecret || "";
      const updateOTP = () => {
        setCurrentSimulatedOTP(generateTOTP(secret));
        setSecondsRemaining(30 - (Math.floor(Date.now() / 1000) % 30));
      };
      updateOTP();
      const interval = setInterval(updateOTP, 1000);
      return () => clearInterval(interval);
    }
  }, [temp2FASecret, currentUser?.twoFactorSecret]);

  // Login States
  const [loginMode, setLoginMode] = useState<"selection" | "email" | "convert">(
    "selection",
  );
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loginEmailInput, setLoginEmailInput] = useState("");
  const [loginPasswordInput, setLoginPasswordInput] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [grantSearchQuery, setGrantSearchQuery] = useState("");
  const [grantSearchResults, setGrantSearchResults] = useState<UserProfile[]>([]);
  const [isGrantSearching, setIsGrantSearching] = useState(false);

  // Admin Center States
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminSearchResults, setAdminSearchResults] = useState<UserProfile[]>(
    [],
  );
  const [isAdminSearching, setIsAdminSearching] = useState(false);
  const [modQueue, setModQueue] = useState<StatusUpdate[]>([]);
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [pendingAppeals, setPendingAppeals] = useState<any[]>([]);
  const [shadowMutedUsers, setShadowMutedUsers] = useState<UserProfile[]>([]);
  const [adminTab, setAdminTab] = useState<
    "moderation" | "reports" | "polls" | "challenges" | "appeals" | "users" | "servers" | "broadcast" | "shadowMuted"
  >("moderation");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [broadcastContent, setBroadcastContent] = useState("");
  const [userSortOrder, setUserSortOrder] = useState<
    "newest" | "richest" | "followers"
  >("newest");
  const [grantAmounts, setGrantAmounts] = useState<Record<string, string>>({});
  const [isGranting, setIsGranting] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [cropperState, setCropperState] = useState<{ src: string; type: 'pfp' | 'feed' | 'server' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States and handler hooks for native Pull-To-Refresh timeline gesture architecture
  const [isFeedRefreshing, setIsFeedRefreshing] = useState(false);
  const [feedPullOffset, setFeedPullOffset] = useState(0);
  const feedTouchStartY = useRef<number | null>(null);
  const isPullingFeed = useRef<boolean>(false);
  const feedScrollContainerRef = useRef<HTMLDivElement>(null);

  const handleFeedTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const el = feedScrollContainerRef.current;
    if (!el || el.scrollTop > 2 || isFeedRefreshing) return;
    feedTouchStartY.current = e.touches[0].clientY;
    isPullingFeed.current = true;
  };

  const handleFeedTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPullingFeed.current || feedTouchStartY.current === null || isFeedRefreshing) return;
    const clientY = e.touches[0].clientY;
    const deltaY = clientY - feedTouchStartY.current;
    if (deltaY > 0) {
      const pullOffset = Math.min(100, Math.pow(deltaY, 0.8) * 1.5);
      setFeedPullOffset(pullOffset);
      if (e.cancelable) e.preventDefault();
    } else {
      setFeedPullOffset(0);
      isPullingFeed.current = false;
    }
  };

  const handleFeedTouchEnd = () => {
    if (!isPullingFeed.current || isFeedRefreshing) return;
    isPullingFeed.current = false;
    feedTouchStartY.current = null;
    
    if (feedPullOffset >= 45) {
      setIsFeedRefreshing(true);
      setFeedPullOffset(50);
      
      (async () => {
        try {
          const { collection, getDocs, query, orderBy, limit } = await import("firebase/firestore");
          const q = query(collection(db, "world_feed"), orderBy("createdAt", "desc"), limit(1));
          await getDocs(q);
          
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } catch (err) {
          console.warn("Pull-to-refresh queried database with warning, concluding smoothly:", err);
        } finally {
          setIsFeedRefreshing(false);
          setFeedPullOffset(0);
        }
      })();
    } else {
      setFeedPullOffset(0);
    }
  };

  const handleFeedMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = feedScrollContainerRef.current;
    if (!el || el.scrollTop > 2 || isFeedRefreshing) return;
    feedTouchStartY.current = e.clientY;
    isPullingFeed.current = true;
  };

  const handleFeedMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPullingFeed.current || feedTouchStartY.current === null || isFeedRefreshing) return;
    const clientY = e.clientY;
    const deltaY = clientY - feedTouchStartY.current;
    if (deltaY > 0) {
      const pullOffset = Math.min(100, Math.pow(deltaY, 0.8) * 1.5);
      setFeedPullOffset(pullOffset);
      if (e.cancelable) e.preventDefault();
    } else {
      setFeedPullOffset(0);
      isPullingFeed.current = false;
    }
  };

  const handleFeedMouseUpOrLeave = () => {
    if (!isPullingFeed.current || isFeedRefreshing) return;
    isPullingFeed.current = false;
    feedTouchStartY.current = null;
    
    if (feedPullOffset >= 45) {
      setIsFeedRefreshing(true);
      setFeedPullOffset(50);
      
      (async () => {
        try {
          const { collection, getDocs, query, orderBy, limit } = await import("firebase/firestore");
          const q = query(collection(db, "world_feed"), orderBy("createdAt", "desc"), limit(1));
          await getDocs(q);
          
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } catch (err) {
          console.warn("Pull-to-refresh queried database with warning, concluding smoothly:", err);
        } finally {
          setIsFeedRefreshing(false);
          setFeedPullOffset(0);
        }
      })();
    } else {
      setFeedPullOffset(0);
    }
  };

  const [mediaPickerConfig, setMediaPickerConfig] = useState<{
    isOpen: boolean;
    mode: "pfp" | "feed" | "server";
  }>({ isOpen: false, mode: "feed" });
  const [feedMediaState, setFeedMediaState] = useState<{ url: string, file: File | null, type: 'image' | 'video' } | null>(null);

  const handleMediaPickerSelect = (file: File) => {
    const { mode } = mediaPickerConfig;
    if (mode === 'pfp') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setCropperState({ src: ev.target.result as string, type: 'pfp' });
        }
      };
      reader.readAsDataURL(file);
    } else if (mode === 'server') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setCropperState({ src: ev.target.result as string, type: 'server' });
        }
      };
      reader.readAsDataURL(file);
    } else if (mode === 'feed') {
      if (file.type === "video/mp4" || file.type.startsWith("video/")) {
        const previewUrl = URL.createObjectURL(file);
        setFeedMediaState({ url: previewUrl, file, type: "video" }); // Adapt feed logic
      } else if (file.type === "image/gif") {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setFeedMediaState({ url: ev.target.result as string, file: null, type: 'image' });
          }
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setCropperState({ src: ev.target.result as string, type: 'feed' });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Profile edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [photoURLInput, setPhotoURLInput] = useState("");
  const [nameError, setNameError] = useState("");
  const [isCheckingName, setIsCheckingName] = useState(false);

  // Real-time data
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [feedUpdates, setFeedUpdates] = useState<StatusUpdate[]>([]);
  const [communityServers, setCommunityServers] = useState<CommunityServer[]>(
    [],
  );
  const [notifications, setNotifications] = useState<MouxNotification[]>([]);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [feedSearch, setFeedSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Community server creation states
  const [serverNameInput, setServerNameInput] = useState("");
  const [serverDescInput, setServerDescInput] = useState("");
  const [serverIsPublic, setServerIsPublic] = useState(true);
  const [serverIconURL, setServerIconURL] = useState("");
  const [isGeneratingIcon, setIsGeneratingIcon] = useState(false);
  const [isCreatingServer, setIsCreatingServer] = useState(false);

  // DM state
  const [dmTarget, setDmTarget] = useState<UserProfile | null>(null);
  const [dmInput, setDmInput] = useState("");

  // Marketplace state
  const [marketSearch, setMarketSearch] = useState("");
  const [marketCategory, setMarketCategory] = useState<
    | "all"
    | "weapons"
    | "ammunition"
    | "collectible"
    | "financials"
    | "passes"
    | "favorites"
  >("all");
  const [selectedMarketItem, setSelectedMarketItem] = useState<any | null>(
    null,
  );
  const [cryptoVolatility, setCryptoVolatility] = useState<
    Record<string, number>
  >({});
  const [equippedWeaponId, setEquippedWeaponId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMinLoading(false), 3000);
    
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          setBatteryLevel(battery.level);
          setIsCharging(battery.charging);
          if (battery.level < 0.15 && !battery.charging && theme !== "low-power") {
            setTheme("low-power");
            if (window.Notification && Notification.permission === "granted") {
              try {
                new Notification("Moux World", {
                  body: "Entering Low Power Mode...",
                });
              } catch (e) {
                console.warn("Failed to send battery notification", e);
              }
            }
          } else if (battery.charging && theme === "low-power") {
            setTheme("dark");
          }
        };
        updateBattery();
        battery.addEventListener("levelchange", updateBattery);
        battery.addEventListener("chargingchange", updateBattery);
      });
    }

    return () => clearTimeout(timer);
  }, [theme]);

  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const showToast = useCallback(
    (message: string, type: "error" | "success" = "error") => {
      setToastMessage({ message, type });
      setTimeout(() => setToastMessage(null), 3000);
    },
    [],
  );

  useEffect(() => {
    // Load equipped weapon from user data if it exists
    if (currentUser?.primaryWeaponId) {
      setEquippedWeaponId(currentUser.primaryWeaponId);
    }
  }, [currentUser]);

  const mouxBotFeedPost = async (content: string) => {
    if (currentUser?.muteGlobalPopups) {
      console.log("MouxBot silent mode: blocked automated notification post.");
      return;
    }
    const mouxBot: UserProfile = {
      uid: "MOUXBOT",
      displayName: "MouxBot",
      rank: "GOD",
      email: "mouxbot@moux.world",
      location: "Void",
      mouxBalance: 9999999,
      isBanned: false,
      ageVerified: true,
      isAdmin: true,
      nameChangePasses: 0,
      createdAt: Date.now()
    };
    await postToFeed(content, mouxBot, false);
  };

  useEffect(() => {
    // Simulate price fluctuation every 30 seconds
    const interval = setInterval(() => {
      const newVolatility: Record<string, number> = {};
      [
        "MOUX",
        "VOID",
        "ETHER",
        "BOND-X",
        "MOA-INDEX",
        "GOV-U",
        "CORP-Y",
      ].forEach((coin) => {
        newVolatility[coin] = Math.random() * 0.1 - 0.05; // +/- 5%
      });
      setCryptoVolatility(newVolatility);

      // 10% chance to post a Market Alert every 30s
      if (Math.random() < 0.1) {
        const assets = ["MOUX", "VOID", "ETHER", "BOND-X"];
        const asset = assets[Math.floor(Math.random() * assets.length)];
        const isUp = Math.random() > 0.5;
        const percent = (Math.random() * 15 + 5).toFixed(2);
        const emoji = isUp ? "📈" : "📉";
        const message = `[MARKET ALERT] ${emoji} ${asset} has experienced a volatility spike of ${
          isUp ? "+" : "-"
        }${percent}% in the last 60 cycles. Trade at your own risk. Digital survival depends on your positioning.`;
        mouxBotFeedPost(message);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Post edit states
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editingPost, setEditingPost] = useState<{
    id: string;
    collection: string;
    content: string;
  } | null>(null);
  const [editContentInput, setEditContentInput] = useState("");

  const filteredFeed = feedUpdates.filter((update) => {
    // Search filtering
    const matchesSearch = (() => {
      if (!feedSearch.trim()) return true;
      const query = feedSearch.toLowerCase();
      if (query.startsWith('#')) return update.content.toLowerCase().includes(query);
      if (query.startsWith('@')) {
        const mention = query.substring(1).toLowerCase();
        return update.content.toLowerCase().includes(`@${mention}`) || 
               update.authorName.toLowerCase().includes(mention);
      }
      return update.content.toLowerCase().includes(query) ||
             update.authorName.toLowerCase().includes(query);
    })();

    if (!matchesSearch) return false;

    // Blocked or Muted check
    if (currentUser?.blockedUsers?.includes(update.authorId)) return false;
    if (currentUser?.mutedUsers?.includes(update.authorId)) return false;

    // Admins see everything
    if (currentUser?.isAdmin) return true;

    // Author sees their own posts
    if (update.authorId === currentUser?.uid) return true;

    // Reject pending/rejected posts for others
    if (
      update.moderationStatus === "pending" ||
      update.moderationStatus === "rejected"
    )
      return false;

    // Reject mature posts if user is not verified
    if (currentUser?.ageVerified === false && update.isMature) return false;

    return true;
  });

  const [feedSortMethod, setFeedSortMethod] = useState<"latest" | "likes" | "views">("latest");
  const [postMenuOpenId, setPostMenuOpenId] = useState<string | null>(null);

  // Immersive Lightbox overlay state configurations
  const [lightboxMedia, setLightboxMedia] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // DB optimized view incrementation trigger
  const handlePostViewIncrement = useCallback(async (postId: string, currentViews: number = 0) => {
    try {
      const cacheKey = `viewed_${postId}`;
      if (sessionStorage.getItem(cacheKey)) return;
      sessionStorage.setItem(cacheKey, "true");

      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        views: (currentViews || 0) + 1
      });
      console.log(`Successfully logged interactive view event for document node: ${postId}`);
    } catch (e) {
      console.warn("Firestore view tracking guarded:", e);
    }
  }, []);

  const sortedFilteredFeed = [...filteredFeed].sort((a, b) => {
    if (feedSortMethod === "likes") {
      const likesA = a.likes?.length || 0;
      const likesB = b.likes?.length || 0;
      if (likesB !== likesA) {
        return likesB - likesA;
      }
    } else if (feedSortMethod === "views") {
      const viewsA = a.views || 0;
      const viewsB = b.views || 0;
      if (viewsB !== viewsA) {
        return viewsB - viewsA;
      }
    }
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  // Input states
  const [chatInput, setChatInput] = useState("");
  const [showAboutAccount, setShowAboutAccount] = useState(false);
  const [showActionCenter, setShowActionCenter] = useState(false);
  const [showServerDebate, setShowServerDebate] = useState(false);
  const feedFileInputRef = useRef<HTMLInputElement>(null);
  const [useFollowingFeed, setUseFollowingFeed] = useState(false);
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [isFollowingSelectedUser, setIsFollowingSelectedUser] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);
  const [followGraphState, setFollowGraphState] = useState<{ isOpen: boolean, title: string, users: UserProfile[] } | null>(null);
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [serverSettingsName, setServerSettingsName] = useState("");
  const [serverSettingsIsPublic, setServerSettingsIsPublic] = useState(true);
  const [serverSettingsRequireVerification, setServerSettingsRequireVerification] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Community Server form states
  const [activeCommunityServer, setActiveCommunityServer] =
    useState<CommunityServer | null>(null);

  // District states
  const [activeDistrict, setActiveDistrict] = useState<DistrictChannel | null>(null);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelIsPrivate, setNewChannelIsPrivate] = useState(false);
  const [newChannelAllowedRoles, setNewChannelAllowedRoles] = useState<string[]>([]);

  const handleGenerateServerIcon = () => {
    if (!serverNameInput.trim()) {
      showToast("Identity required for icon generation.");
      return;
    }
    const seed = encodeURIComponent(serverNameInput.trim());
    setServerIconURL(`https://api.dicebear.com/9.x/identicon/svg?seed=${seed}`);
    showToast("Server icon generated.", "success");
  };

  const handleServerIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      showToast("This file is too large and will deny it from sending", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setCropperState({ src: ev.target.result as string, type: 'server' });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset
  };

  const [selarProductLink, setSelarProductLink] = useState("https://selar.co");
  const [redeemReference, setRedeemReference] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isSelarModalOpen, setIsSelarModalOpen] = useState(false);
  const [isMouxbotGateLockedModalOpen, setIsMouxbotGateLockedModalOpen] = useState(false);
  const [isVeteranMouxBotPostIntelligenceModalOpen, setIsVeteranMouxBotPostIntelligenceModalOpen] = useState(false);
  const [mouxBotInjectedPayload, setMouxBotInjectedPayload] = useState<string | null>(null);
  const [mouxBotGlobalFeedAccess, setMouxBotGlobalFeedAccess] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;
    const fetchGlobalFlags = async () => {
      try {
        const { doc, onSnapshot } = await import("firebase/firestore");
        const { db } = await import("./firebase");
        unsubscribe = onSnapshot(doc(db, "system_control", "mouxbot_global_feed_access"), (docSnap) => {
          if (docSnap.exists()) {
             setMouxBotGlobalFeedAccess(docSnap.data().enabled !== false);
          } else {
             setMouxBotGlobalFeedAccess(true);
          }
        });
      } catch (e) {
        console.warn("Could not fetch mouxbot_global_feed_access", e);
      }
    };
    fetchGlobalFlags();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Load local storage fallback immediately if available
    if (typeof window !== "undefined" && window.localStorage) {
      const cachedLink = window.localStorage.getItem("selar_product_link");
      if (cachedLink) {
        setSelarProductLink(cachedLink);
      }
    }

    // Dynamically fetch public Selar link on boot
    const fetchSelarLink = async () => {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("./firebase");
        const snap = await getDoc(doc(db, "config", "selar"));
        if (snap.exists() && snap.data().productLink) {
          const fetchedLink = snap.data().productLink;
          setSelarProductLink(fetchedLink);
          if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.setItem("selar_product_link", fetchedLink);
          }
        }
      } catch (e) {
        console.warn("Could not fetch online Selar link, using offline cached link instead.", e);
      }
    };
    fetchSelarLink();
  }, []);

  const handleMouxBotClick = () => {
    const isUnlimited = currentUser?.is_veteran === true || currentUser?.is_pro_plus === true;
    const isPro = currentUser?.is_pro === true;
    if (isUnlimited || isPro) {
      setActiveTab("moux_trader");
      setShowActionCenter(false);
    } else {
      setIsMouxbotGateLockedModalOpen(true);
      setShowActionCenter(false);
    }
  };

  const handleMouxBotPostIntelligenceClick = (update: any) => {
    if (currentUser?.is_veteran === true || currentUser?.email === "pervercy23@gmail.com") {
      const authorText = update.authorHandle || update.authorName || "operative";
      const bodyClean = (update.content || "").replace(/['"\n\r]/g, " ").substring(0, 400);
      const systemPrompt = `[CONTEXT_INJECTION // Post by @${authorText}: '${bodyClean}'. Analyze, reply, or share your thoughts on this post.]`;
      setMouxBotInjectedPayload(systemPrompt);
      setActiveTab("moux_trader");
      showToast("MouxBot Post context injected.", "success");
    } else {
      setIsVeteranMouxBotPostIntelligenceModalOpen(true);
    }
  };

  const handleSaveSelarLink = async (newLink: string) => {
    try {
      const { doc, setDoc } = await import("firebase/firestore");
      const { db } = await import("./firebase");
      await setDoc(doc(db, "config", "selar"), { productLink: newLink }, { merge: true });
      setSelarProductLink(newLink);
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("selar_product_link", newLink);
      }
      showToast("Selar Merchant Link updated successfully!", "success");
    } catch (e) {
      showToast("Permission denied.", "error");
    }
  };

  const handleRedeemSelar = async () => {
    if (!redeemReference.trim()) {
      showToast("Please enter your Selar Transaction Reference ID", "error");
      return;
    }
    setIsRedeeming(true);
    try {
      const { doc, getDoc, setDoc } = await import("firebase/firestore");
      const { db } = await import("./firebase");
      
      const referenceClean = redeemReference.trim().toUpperCase();
      const refSnap = await getDoc(doc(db, "redeemed_transactions", referenceClean));
      if (refSnap.exists()) {
        showToast("This reference ID has already been redeemed.", "error");
        setIsRedeeming(false);
        return;
      }

      let payAmount = 0;
      let payCurrency = "NGN";
      let isVerified = false;

      // Contact our secure Full-Stack Node backend proxy to bypass CORS & protect API Secret
      try {
        const response = await fetch("/api/verify-selar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ reference: referenceClean })
        });
        
        if (response.ok) {
          const resData = await response.json();
          if (resData && resData.success) {
            payAmount = resData.amount || 0;
            payCurrency = resData.currency || "NGN";
            isVerified = true;
          } else {
            showToast(resData.error || "Verification failed on the payment server.", "error");
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          showToast(errData.error || "Payment terminal response error.", "error");
        }
      } catch (fetchErr: any) {
        console.error("Express proxy fetch error:", fetchErr);
        showToast("Network error contacting payment server.", "error");
      }

      if (isVerified) {
        const creditRate = 1; // 1 to 1 conversation
        const mouxCredited = Math.round(payAmount * creditRate);

        await setDoc(doc(db, "redeemed_transactions", referenceClean), {
          uid: currentUser!.uid,
          amount: payAmount,
          currency: payCurrency,
          redeemedAt: Date.now(),
          mouxCredited: mouxCredited
        });

        const currentBalance = currentUser!.mouxBalance || 0;
        const newBalance = currentBalance + mouxCredited;
        await updateProfile(currentUser!.uid, { mouxBalance: newBalance });
        setCurrentUser({ ...currentUser!, mouxBalance: newBalance });

        showToast(`Receipt Verified! +${mouxCredited.toLocaleString()} Mux credited successfully! 💎`, "success");
        setRedeemReference("");
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Redemption Bypassed: ${err.message || "Endpoint error"}`, "error");
    } finally {
      setIsRedeeming(false);
    }
  };

  // Theme-aware dynamic classes
  const isDark = theme === "dark";
  const isLight = theme === "light";
  const isLowPower = theme === "low-power";

  const animationsEnabled = !isLowPower;
  const blurEnabled = false;

  const springTransition = animationsEnabled ? { type: "spring", stiffness: 400, damping: 10 } : { duration: 0 };
  const smoothTransition = animationsEnabled ? { duration: 1 } : { duration: 0 };
  const quickTransition = animationsEnabled ? { duration: 0.2 } : { duration: 0 };

  const bgMain = isLight ? "bg-white" : "bg-black";
  const bgSide = isLight ? "bg-gray-100" : "bg-black";
  const textMain = isLight ? "text-black" : "text-white";
  const textMuted = isLight ? "text-gray-600 font-mono" : "text-gray-400 font-mono";
  const borderMain = isLight ? "border-gray-300" : "border-[#222222]";
  const cardMain = isLight ? "bg-white border-gray-300" : "bg-discord-black border-[#222222]";
  const inputMain = isLight ? "bg-gray-100 text-black border-gray-300" : "bg-black text-white border-[#222222]";

  useEffect(() => {
    if (currentUser) {
      checkMouxBotWealth(currentUser);
      const unsubscribeAssets = subscribeToUserAssets(
        currentUser.uid,
        (assets) => {
          setUserAssets(assets);
        },
      );
      return () => unsubscribeAssets();
    }
  }, [currentUser?.mouxBalance]);

  // Automated post-payment redirect payload gate & database updates
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout_status") || params.get("status") || params.get("payment") || params.get("pay");
    if (checkoutStatus === "success") {
      const tierParam = params.get("tier") || params.get("product") || params.get("item") || params.get("product_id") || "";
      const urlUid = params.get("uid");
      const targetUid = urlUid || currentUser?.uid;

      if (targetUid && tierParam) {
        const isPro = tierParam.toLowerCase().includes("pro") && !tierParam.toLowerCase().includes("plus") && !tierParam.toLowerCase().includes("veteran");
        const isVeteran = tierParam.toLowerCase().includes("veteran") || tierParam.toLowerCase().includes("plus");

        const updates: any = {};
        if (isPro) {
          updates.is_pro = true;
          updates.is_verified = true;
        } else if (isVeteran) {
          updates.is_veteran = true;
          updates.is_pro = true;
          updates.is_verified = true;
        }

        if (Object.keys(updates).length > 0) {
          import("./firebase").then(({ updateProfile }) => {
            updateProfile(targetUid, updates).then(() => {
              if (currentUser && currentUser.uid === targetUid) {
                setCurrentUser((prev: any) => prev ? ({ ...prev, ...updates }) : null);
              }
              showToast(
                isVeteran 
                  ? "Veteran legendary status authenticated successfully! Checked badge and unrestricted MouxBot AI Terminal unlocked."
                  : "Pro Elite status authenticated successfully! Custom badge rendering unlocked.",
                "success"
              );

              const newUrl = window.location.pathname + window.location.hash;
              window.history.replaceState({}, document.title, newUrl);
            }).catch((err) => {
              console.error("Failed executing automated post-purchase state update:", err);
            });
          });
        }
      }
    }
  }, [currentUser?.uid, showToast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setIsEmailVerified(
            firebaseUser.isAnonymous ||
              firebaseUser.emailVerified ||
              firebaseUser.providerData.some(
                (p) => p.providerId === "google.com",
              ),
          );
          
          // Wait, check if they are banned first
          let bannedCheck = null;
          try {
            bannedCheck = await getBannedUser(firebaseUser.uid);
          } catch (err) {
            console.warn("Failed checking ban status on boot (offline mode assumed safe):", err);
          }
          if (bannedCheck) {
            setBannedUserRecord(bannedCheck);
            setLoading(false);
            return;
          }

          let profile = await getUserProfile(firebaseUser.uid);
          if (!profile) {
            try {
              profile = await createUserProfile(firebaseUser);
            } catch (err) {
              console.warn("Offline profile creation fallback:", err);
              profile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: "Offline Wanderer",
                location: "Void Mode",
                mouxBalance: 500,
                isBanned: false,
                ageVerified: true,
                createdAt: Date.now(),
                rank: "Wanderer" as const,
                isAdmin: false,
                nameChangePasses: 0
              };
            }
          }

          // Daily login streak calculation Engine
          const todayStr = new Date().toISOString().split('T')[0];
          const lastLoginDate = profile.lastLoginDate;
          let loginStreak = profile.loginStreak || 0;
          let balanceBonus = 0;

          if (!lastLoginDate) {
            loginStreak = 1;
            try {
              await updateProfile(firebaseUser.uid, {
                lastLoginDate: todayStr,
                loginStreak: 1
              });
            } catch (e) {}
            profile.lastLoginDate = todayStr;
            profile.loginStreak = 1;
          } else if (lastLoginDate !== todayStr) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastLoginDate === yesterdayStr) {
              loginStreak += 1;
              balanceBonus = 200; // Gamification bonus
            } else {
              loginStreak = 1;
            }

            const updates: Partial<UserProfile> = {
              lastLoginDate: todayStr,
              loginStreak: loginStreak
            };
            if (balanceBonus > 0) {
              updates.mouxBalance = (profile.mouxBalance || 0) + balanceBonus;
            }

            try {
              await updateProfile(firebaseUser.uid, updates);
            } catch (e) {}
            profile.lastLoginDate = todayStr;
            profile.loginStreak = loginStreak;
            if (balanceBonus > 0) {
              profile.mouxBalance = (profile.mouxBalance || 0) + balanceBonus;
            }

            if (balanceBonus > 0) {
              setTimeout(() => {
                showToast(`Welcome back! ${loginStreak}-day Login Streak Active! +${balanceBonus} Mux credited! 🔥`, "success");
              }, 1000);
            } else {
              setTimeout(() => {
                showToast(`Daily check-in successful. Streak started!`, "success");
              }, 1000);
            }
          }

          setCurrentUser(profile);
          setNameInput(profile.username || "admin");
          setDisplayNameInput(profile.displayName || "admin");
          setBioInput(profile.bio || "");
          setColorInput(profile.profileColor || "#00ffff");
          setPhotoURLInput(profile.photoURL || "");

          // Fetch followed IDs
          try {
            const ids = await getFollowedIds(firebaseUser.uid);
            setFollowedIds(ids);
          } catch (e) {
            setFollowedIds([]);
          }

          // Prompt for notifications on first login/session
          requestNotificationPermission();
        } else {
          setCurrentUser(null);
          setNotificationPermDenied(false);
          setIsEmailVerified(true);
        }
      } catch (err) {
        console.error("Auth status change execution caught robust override:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser?.uid) {
      const unsubNotifs = subscribeToNotifications(currentUser.uid, (notifs) =>
        setNotifications(notifs),
      );
      const unsubDMs = subscribeToDMs(currentUser.uid, (dms) =>
        setPrivateMessages(dms),
      );
      const unsubProfile = subscribeToUserProfile(
        currentUser.uid,
        (profile) => {
          if (profile) setCurrentUser(profile);
        },
      );

      const unsubServers = subscribeToCommunityServers(
        currentUser.uid,
        (servers) => setCommunityServers(servers),
      );

      let unsubMod: any;
      let unsubReports: any;
      let unsubAppeals: any;
      if (currentUser.isAdmin) {
        unsubMod = subscribeToModerationQueue((queue) => setModQueue(queue));
        unsubReports = subscribeToReports((reports) =>
          setPendingReports(reports),
        );
        unsubAppeals = subscribeToAppeals((appeals) =>
          setPendingAppeals(appeals),
        );

        // Admin Setup
        getWorldCountry("The Admin Haven").then((country) => {
          if (country && !country.presidentId) {
            updateWorldCountry(country.id, {
              presidentId: currentUser.uid,
              isPublic: true,
            });
            getWorldCity(country.id, "Admin Central").then((city) => {
              if (city && !city.ownerId)
                updateWorldCity(city.id, { ownerId: currentUser.uid });
            });
          }
        });
      }

      // Check if user needs an anime avatar
      if (!currentUser.photoURL && !currentUser.isGuest) {
        generateAndSetDefaultAvatar(currentUser.uid);
      }

      // Renewal System check
      if (
        currentUser.expiryDate &&
        Date.now() > currentUser.expiryDate &&
        (currentUser.is_verified === false || currentUser.is_verified === true)
      ) {
        updateProfile(currentUser.uid, {
          is_verified: false,
          expiryDate: undefined,
        });
      }

      // Heartbeat: Update presence every 2 minutes
      const heartbeat = setInterval(() => {
        updateProfile(currentUser.uid, {
          lastSeen: new Date().toISOString(),
          isOnline: true,
        });
      }, 120000);
      // Initial presence
      updateProfile(currentUser.uid, {
        lastSeen: new Date().toISOString(),
        isOnline: true,
      });

      return () => {
        unsubNotifs();
        unsubDMs();
        unsubProfile();
        unsubServers();
        unsubMod?.();
        unsubReports?.();
        unsubAppeals?.();
        clearInterval(heartbeat);
      };
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    let unsubFeed: () => void;
    if (useFollowingFeed) {
      unsubFeed = subscribeToFollowingFeed(
        [...followedIds, currentUser.uid],
        (updates) => setFeedUpdates(updates),
      );
    } else {
      unsubFeed = subscribeToFeed((updates) => setFeedUpdates(updates));
    }

    return () => unsubFeed();
  }, [currentUser?.uid, useFollowingFeed, followedIds]);

  useEffect(() => {
    if (dmTarget && currentUser && privateMessages.length > 0) {
      const unreadCount = privateMessages.filter(
        (m) => m.senderId === dmTarget.uid && m.receiverId === currentUser.uid && !m.read
      ).length;
      if (unreadCount > 0) {
        markPrivateMessagesAsRead(dmTarget.uid, currentUser.uid);
      }
    }
  }, [dmTarget, currentUser, privateMessages]);

  useEffect(() => {
    if (feedUpdates.length > 0 && currentUser) {
      const latest = feedUpdates[0];
      // Only trigger if we have a "lastPostId" set (so not on initial load)
      if (lastPostId && latest.id !== lastPostId) {
        const isMouxBot = latest.authorId === "MOUXBOT";
        const isFollowed = followedIds.includes(latest.authorId);
        
        // Non-intrusive popup logic
        if ((isMouxBot || isFollowed) && !currentUser.muteGlobalPopups && activeTab !== "feed") {
          setActiveAlert(latest);
          
          // System notification for MouxBot alerts
          if (isMouxBot && window.Notification && Notification.permission === "granted") {
            try {
              new Notification("MOUX_WORLD: GLOBAL_ALERT", {
                body: latest.content,
                icon: "https://api.dicebear.com/9.x/bottts/svg?seed=MOUXBOT",
                tag: "mouxbot-alert"
              });
            } catch (e) {
              console.warn("Failed to send MouxBot notification", e);
            }
          }

          // Auto-hide after 10 seconds
          setTimeout(() => setActiveAlert(null), 10000);
        }
      }
      setLastPostId(latest.id);
    }
  }, [feedUpdates, activeTab, currentUser, followedIds]);

  // Dynamic Selector for refreshed active community server with real-time district channels
  const selectedServerRefreshed = activeCommunityServer
    ? (communityServers.find((s) => s.id === activeCommunityServer.id) || activeCommunityServer)
    : null;

  // Sync activeDistrict when community server selected or updated
  useEffect(() => {
    if (selectedServerRefreshed) {
      const chans = selectedServerRefreshed.district_channels || [];
      if (chans.length > 0) {
        // Keep selected district if it exists, otherwise fall back to first one (general)
        const exists = chans.find((c) => c.district_id === activeDistrict?.district_id);
        if (!exists) {
          setActiveDistrict(chans[0]);
          setActiveWorldRoom(`${selectedServerRefreshed.id}_${chans[0].district_id}`);
        }
      } else {
        // Fallback default
        const defaultGeneralChan = {
          district_id: "general",
          channel_name: "# general",
          is_private: false,
          allowed_roles: []
        };
        setActiveDistrict(defaultGeneralChan);
        setActiveWorldRoom(`${selectedServerRefreshed.id}_general`);
      }
    } else {
      setActiveDistrict(null);
    }
  }, [selectedServerRefreshed?.id, communityServers]);

  // Background hook for MouxBot tag inside district messages stream
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  // Helper validation to ensure the user has unlock authorization for private district channels
  const isUserAuthorizedForDistrict = (chan: DistrictChannel | null) => {
    if (!chan) return false;
    if (!chan.is_private) return true;
    if (!currentUser) return false;
    if (currentUser.isAdmin) return true;
    if (selectedServerRefreshed && currentUser.uid === selectedServerRefreshed.ownerId) return true;

    const roles = chan.allowed_roles || [];
    if (roles.length === 0) return true;
    if (roles.includes("pro") && currentUser.is_pro) return true;
    if (roles.includes("pro_plus") && currentUser.is_pro_plus) return true;
    if (roles.includes("veteran") && currentUser.is_veteran) return true;

    return false;
  };

  useEffect(() => {
    if (!selectedServerRefreshed || !activeWorldRoom || !currentUser) return;
    if (chatMessages.length === 0) return;

    // Check if activeDistrict is locked
    if (!isUserAuthorizedForDistrict(activeDistrict)) return;

    const latestMsg = chatMessages[chatMessages.length - 1];

    if (
      latestMsg.authorId !== "MOUXBOT" &&
      !processedMessageIdsRef.current.has(latestMsg.id)
    ) {
      const matchText = latestMsg.text.toLowerCase();
      if (matchText.includes("mouxbot")) {
        processedMessageIdsRef.current.add(latestMsg.id);

        const callMouxBotAIChannel = async () => {
          try {
            const promptClean = latestMsg.text.replace(/mouxbot/gi, "").trim();

            const res = await fetch("/api/mouxbot", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: promptClean || "Hello MouxBot, introduce yourself!",
                history: [],
                isVeteran: true,
                email: currentUser.email
              })
            });

            if (res.ok) {
              const resData = await res.json();
              const reply = resData.response || "Secure transmission returned empty payload.";

              await sendChatMessage(activeWorldRoom, reply, {
                uid: "MOUXBOT",
                displayName: "MouxBot",
                badges: ["GOD", "AI"],
                is_verified: true,
                is_pro: true,
                is_veteran: true,
                isAdmin: true,
                mouxBalance: 999999
              } as any);
            }
          } catch (err) {
            console.error("Failed to fetch inline reply card response for district from Gemini:", err);
          }
        };

        callMouxBotAIChannel();
      }
    }
  }, [chatMessages, selectedServerRefreshed?.id, activeWorldRoom, currentUser, activeDistrict]);

  useEffect(() => {
    if (activeWorldRoom && currentUser?.uid) {
      const unsubChat = subscribeToChat(activeWorldRoom, (msgs) =>
        setChatMessages(msgs),
      );
      return () => unsubChat();
    }
  }, [activeWorldRoom, currentUser?.uid]);

  useEffect(() => {
    if (!activeCommunityServer || !currentUser?.uid) {
      setIsServerMember(null);
      setServerHistory([]);
      setServerMembers([]);
      return;
    }

    const memberDocRef = doc(db, "community_servers", activeCommunityServer.id, "members", currentUser.uid);
    const unsubMember = onSnapshot(memberDocRef, (snap) => {
      setIsServerMember(snap.exists());
    });

    const historyColRef = collection(db, "community_servers", activeCommunityServer.id, "history");
    const historyQuery = query(historyColRef, orderBy("timestamp", "desc"), limit(50));
    const unsubHistory = onSnapshot(historyQuery, (snap) => {
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setServerHistory(logs);
    }, (err) => {
      console.error("Failed to fetch server history:", err);
    });

    const membersColRef = collection(db, "community_servers", activeCommunityServer.id, "members");
    const unsubMembers = onSnapshot(membersColRef, (snap) => {
      const mems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setServerMembers(mems);
    }, (err) => {
      console.error("Failed to fetch server members:", err);
    });

    return () => {
      unsubMember();
      unsubHistory();
      unsubMembers();
    };
  }, [activeCommunityServer?.id, currentUser?.uid]);

  useEffect(() => {
    if (activeCommunityServer && currentUser && isServerMember === false && currentUser.uid === activeCommunityServer.ownerId) {
      const joinOwner = async () => {
        const serverId = activeCommunityServer.id;
        const userId = currentUser.uid;
        
        try {
          await setDoc(doc(db, "community_servers", serverId, "members", userId), {
            userId,
            username: currentUser.username || "admin",
            displayName: currentUser.displayName || "Admin",
            joinedAt: Date.now(),
            photoURL: currentUser.avatar_base64 || ""
          });
          console.log("Auto-joining owner member doc created successfully");
        } catch (e: any) {
          console.error("Auto-joining owner: members doc write failed:", e.message || e);
        }

        try {
          await addDoc(collection(db, "community_servers", serverId, "history"), {
            userId,
            username: currentUser.username || "admin",
            displayName: currentUser.displayName || "Admin",
            type: "join",
            timestamp: Date.now()
          });
          console.log("Auto-joining owner history doc created successfully");
        } catch (e: any) {
          console.error("Auto-joining owner: history doc write failed:", e.message || e);
        }
      };
      joinOwner();
    }
  }, [activeCommunityServer?.id, currentUser?.uid, isServerMember]);

  useEffect(() => {
    if (activeTab === "servers") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      if (authMode === "login") {
        await loginEmail(loginEmailInput, loginPasswordInput);
      } else {
        await registerEmail(loginEmailInput, loginPasswordInput);
      }
    } catch (err: any) {
      showToast(err.message || "Authentication failure.", "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginGuest();
    } catch (err: any) {
      showToast(err.message || "Guest login failed. Ensure provider is enabled.", "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleConvertGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsLoggingIn(true);
    try {
      await linkGuestWithEmail(loginEmailInput, loginPasswordInput);
      setCurrentUser({
        ...currentUser,
        isGuest: false,
        email: loginEmailInput,
      });
      setIsEmailVerified(false);
      showToast("Identity successfully permanentized!", "success");
      setLoginMode("selection");
    } catch (err: any) {
      showToast(err.message || "Identity conversion failed.", "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEditPostAction = (
    postId: string,
    collectionName: string,
    currentContent: string,
    authorId: string,
  ) => {
    if (currentUser?.uid !== authorId) {
      showToast("ACCESS DENIED: Post ownership required.", "error");
      return;
    }
    setEditingPost({
      id: postId,
      collection: collectionName,
      content: currentContent,
    });
    setEditContentInput(currentContent);
    setIsEditingPost(true);
  };

  const handleEditPostSubmit = async () => {
    if (
      !currentUser ||
      !editingPost ||
      !editContentInput.trim() ||
      editContentInput === editingPost.content
    ) {
      if (editContentInput === editingPost?.content) setIsEditingPost(false);
      return;
    }

    try {
      await updatePost(
        editingPost.id,
        editingPost.collection,
        editContentInput,
        currentUser.uid,
      );
      setIsEditingPost(false);
      setEditingPost(null);
      setEditContentInput("");
    } catch (err) {
      showToast("Failed to update notification.", "error");
    }
  };

  const handleDeletePostAction = async (
    postId: string,
    collectionName: string,
    authorId: string,
  ) => {
    if (currentUser?.uid !== authorId && !currentUser?.isAdmin) {
      showToast("ACCESS DENIED: Post ownership required.", "error");
      return;
    }
    console.log("Attempting to delete post:", postId, "from:", collectionName);
    
    setConfirmDialog({
      message: "Are you sure you want to delete this message?",
      onConfirm: async () => {
        try {
          await deletePost(postId, collectionName, currentUser.uid, currentUser.isAdmin);
          console.log("Delete post successful");
          showToast("Post deleted successfully.", "success");
        } catch (err) {
          console.error("Delete post failed:", err);
          showToast(
            "Failed to delete post. Error: " +
              (err instanceof Error ? err.message : String(err)),
            "error"
          );
        }
      }
    });
  };

  const generateAndSetDefaultAvatar = async (uid: string) => {
    try {
      console.log("Generating visual identity for universe entity via server API proxy:", uid);
      const res = await fetch("/api/generate-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid })
      });
      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }
      const data = await res.json();
      if (data && data.avatar_base64) {
        if (data.fallback) {
          // If it's a fallback Dicebear URL or custom SVG, write directly to prevent useless compression errors
          await updateProfile(uid, { avatar_base64: data.avatar_base64 });
          console.log("Visual identity persistent in database as fallback vector symbol.");
        } else {
          const compressedBase64 = await compressImage(data.avatar_base64, 256, 0.7);
          await updateProfile(uid, { avatar_base64: compressedBase64 });
          console.log("Visual identity persistent in database as compressed binary notification.");
        }
      }
    } catch (error: any) {
      console.warn("Visual generation catch block fallback:", error);
      // Hard fallback client-side to guarantee seamless continuity
      const fallbackUrl = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${uid}&backgroundColor=ef4444`;
      try {
        await updateProfile(uid, { avatar_base64: fallbackUrl });
      } catch (err) {
        console.error("Failed to write hard fallback client-side:", err);
      }
    }
  };

  const handleCropComplete = async (croppedBase64: string) => {
    if (!cropperState) return;
    
    if (cropperState.type === 'pfp' && currentUser) {
      setIsUploadingPhoto(true);
      try {
        const compressedBase64 = await compressImage(croppedBase64, 256, 0.7);
        await updateProfile(currentUser.uid, { avatar_base64: compressedBase64 });
        setCurrentUser({ ...currentUser, avatar_base64: compressedBase64 });
        showToast("Identity visual updated in field.", "success");
      } catch (err) {
        showToast("Visual message failure.", "error");
        console.error(err);
      } finally {
        setIsUploadingPhoto(false);
      }
    } else if (cropperState.type === 'feed') {
      try {
        const compressedBase64 = await compressImage(croppedBase64, 800, 0.8);
        setFeedMediaState({ url: compressedBase64, file: null, type: 'image' });
      } catch (err) {
        showToast("Failed to process image.", "error");
        console.error(err);
      }
    } else if (cropperState.type === 'server') {
      try {
        const compressedBase64 = await compressImage(croppedBase64, 400, 0.7);
        setServerIconURL(compressedBase64);
        showToast("Icon updated.", "success");
      } catch (err) {
        showToast("Upload failed.", "error");
        console.error(err);
      }
    }
    
    setCropperState(null);
  };

  const handleJoinServer = async () => {
    if (!activeCommunityServer || !currentUser) return;
    try {
      const serverId = activeCommunityServer.id;
      const userId = currentUser.uid;
      
      // 1. Create membership document
      await setDoc(doc(db, "community_servers", serverId, "members", userId), {
        userId,
        username: currentUser.username || "wanderer",
        displayName: currentUser.displayName || "Wanderer",
        joinedAt: Date.now(),
        photoURL: currentUser.avatar_base64 || ""
      });

      // 2. Create history log
      await addDoc(collection(db, "community_servers", serverId, "history"), {
        userId,
        username: currentUser.username || "wanderer",
        displayName: currentUser.displayName || "Wanderer",
        type: "join",
        timestamp: Date.now()
      });

      // 3. Update server membersCount
      await updateDoc(doc(db, "community_servers", serverId), {
        membersCount: increment(1)
      });

      showToast(`Welcome to ${activeCommunityServer.name}! 🎉`, "success");
    } catch (e) {
      console.error("Failed to join server:", e);
      showToast("Could not join community server.", "error");
    }
  };

  const handleLeaveServer = async () => {
    if (!activeCommunityServer || !currentUser) return;
    try {
      const serverId = activeCommunityServer.id;
      const userId = currentUser.uid;
      
      // If they are owner, discourage or prevent leaving directly
      if (currentUser.uid === activeCommunityServer.ownerId) {
        showToast("Owners cannot leave the server. If you want to delete it, use Server Settings.", "error");
        return;
      }

      // 1. Delete membership document
      await deleteDoc(doc(db, "community_servers", serverId, "members", userId));

      // 2. Create history log
      await addDoc(collection(db, "community_servers", serverId, "history"), {
        userId,
        username: currentUser.username || "wanderer",
        displayName: currentUser.displayName || "Wanderer",
        type: "leave",
        timestamp: Date.now()
      });

      // 3. Update server membersCount
      await updateDoc(doc(db, "community_servers", serverId), {
        membersCount: increment(-1)
      });

      showToast(`You have left ${activeCommunityServer.name}.`, "info");
      setActiveCommunityServer(null);
      setActiveWorldRoom(null);
      setShowMemberHistory(false);
    } catch (e) {
      console.error("Failed to leave server:", e);
      showToast("Could not leave community server.", "error");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (file.type.startsWith("video/") || file.type === "image/gif") {
      if (file.size > 15 * 1024 * 1024) {
        showToast("This file is too large and will deny it from sending", "error");
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setCropperState({ src: ev.target.result as string, type: 'pfp' });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const handleLikePostAction = async (postId: string) => {
    if (!currentUser) return;
    try {
      await toggleLikePost(postId, currentUser.uid);
      const post = feedUpdates.find(p => p.id === postId);
      if (post) {
        handlePostViewIncrement(postId, post.views);
      }
    } catch (error) {
      console.error("Like toggle failure:", error);
    }
  };

  const handleToggleReactionAction = async (postId: string, emoji: string) => {
    if (!currentUser) return;
    try {
      await toggleReaction(postId, currentUser.uid, emoji);
      const post = feedUpdates.find(p => p.id === postId);
      if (post) {
        handlePostViewIncrement(postId, post.views);
      }
    } catch (error) {
      console.error("Reaction toggle failure:", error);
    }
  };

  const handleVoteAction = async (postId: string, optionIndex: number) => {
    if (!currentUser) return;
    const post = feedUpdates.find(p => p.id === postId);
    if (!post || !post.poll) return;

    const newPoll = { ...post.poll };
    // Remove user's previous vote from any option
    newPoll.options = newPoll.options.map(opt => ({
      ...opt,
      votes: opt.votes.filter(uid => uid !== currentUser.uid)
    }));
    // Add new vote
    newPoll.options[optionIndex].votes.push(currentUser.uid);

    try {
      await updateDoc(doc(db, "world_feed", postId), { poll: newPoll });
      handlePostViewIncrement(postId, post.views);
    } catch (error) {
      console.error("Vote failure:", error);
    }
  };

  useEffect(() => {
    if (!activeCommentPost) {
      setPostComments([]);
      setCommentLimit(5);
      return;
    }
    const unsubscribe = subscribeToComments(activeCommentPost.id, setPostComments, commentLimit);
    return () => unsubscribe();
  }, [activeCommentPost, commentLimit]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeCommentPost || !newComment.trim() || commentLoading) return;
    
    setCommentLoading(true);
    try {
      await addComment(activeCommentPost.id, currentUser.uid, currentUser.displayName, newComment.trim());
      setNewComment("");
    } catch (error) {
      console.error("Comment failure:", error);
      showToast("Post failure: Network error.", "error");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteCommentAction = async (commentId: string, authorId: string) => {
    if (currentUser?.uid !== authorId) {
      showToast("ACCESS DENIED: Comment ownership required.", "error");
      return;
    }
    setConfirmDialog({
      message: "Are you sure you want to delete this comment?",
      onConfirm: async () => {
        try {
          await deleteComment(commentId, currentUser.uid);
          showToast("Comment deleted successfully.", "success");
        } catch (err) {
          console.error("Delete comment failed:", err);
          showToast("Failed to delete comment: " + err, "error");
        }
      }
    });
  };

  const handleLogout = () => {
    setIs2FAVerified(false);
    auth.signOut();
  };

  const handleEditCommentAction = async (commentId: string, authorId: string, currentContent: string) => {
    if (currentUser?.uid !== authorId) {
      showToast("ACCESS DENIED: Comment ownership required.", "error");
      return;
    }
    setEditingCommentId(commentId);
    setEditingCommentContent(currentContent);
  };

  const handleSaveEditAction = async (commentId: string) => {
    try {
      await updateComment(commentId, editingCommentContent, currentUser!.uid);
      setEditingCommentId(null);
      setEditingCommentContent("");
      showToast("Comment updated.", "success");
    } catch (err) {
      console.error("Save edit failed:", err);
      showToast("Failed to edit comment.", "error");
    }
  };

  const handleVerifyAge = async (isAdult: boolean) => {
    if (currentUser) {
      const newRank = isAdult ? "Wanderer" : "Young Adventurer";
      await updateProfile(currentUser.uid, {
        ageVerified: isAdult,
        rank: newRank as Rank,
      });
      setCurrentUser({
        ...currentUser,
        ageVerified: isAdult,
        rank: newRank as Rank,
      });
    }
  };

  const openProfileView = async (userId: string) => {
    let profile = await getUserProfile(userId);
    if (!profile) {
      const banned = await getBannedUser(userId);
      if (banned) {
        profile = {
          uid: userId,
          displayName: "User Not Found",
          isBanned: true,
          mouxBalance: 0,
          createdAt: 0,
          rank: "Wanderer" as Rank,
          location: "Void"
        } as UserProfile;
      }
    }

    if (profile) {
      setViewingUser(profile);
      setActiveTab("profile");
      if (currentUser) {
        const following = await isFollowing(currentUser.uid, userId);
        setIsFollowingSelectedUser(following);
      }
    } else {
        showToast("Identity not found.", "error");
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !viewingUser) return;

    const wasFollowing = isFollowingSelectedUser;

    // Optimistic Update
    if (wasFollowing) {
      setIsFollowingSelectedUser(false);
      setFollowedIds((prev) => prev.filter((id) => id !== viewingUser.uid));
      setViewingUser((prev) =>
        prev
          ? {
              ...prev,
              followersCount: Math.max(0, (prev.followersCount || 1) - 1),
            }
          : null,
      );
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              followingCount: Math.max(0, (prev.followingCount || 1) - 1),
            }
          : null,
      );

      try {
        await unfollowUser(currentUser.uid, viewingUser.uid);
      } catch (err) {
        // Revert on failure
        setIsFollowingSelectedUser(true);
        setFollowedIds((prev) => [...prev, viewingUser.uid]);
        setViewingUser((prev) =>
          prev
            ? { ...prev, followersCount: (prev.followersCount || 0) + 1 }
            : null,
        );
        setCurrentUser((prev) =>
          prev
            ? { ...prev, followingCount: (prev.followingCount || 0) + 1 }
            : null,
        );
      }
    } else {
      setIsFollowingSelectedUser(true);
      setFollowedIds((prev) => [...prev, viewingUser.uid]);
      setViewingUser((prev) =>
        prev
          ? { ...prev, followersCount: (prev.followersCount || 0) + 1 }
          : null,
      );
      setCurrentUser((prev) =>
        prev
          ? { ...prev, followingCount: (prev.followingCount || 0) + 1 }
          : null,
      );

      try {
        await followUser(currentUser.uid, viewingUser.uid);
      } catch (err) {
        // Revert on failure
        setIsFollowingSelectedUser(false);
        setFollowedIds((prev) => prev.filter((id) => id !== viewingUser.uid));
        setViewingUser((prev) =>
          prev
            ? {
                ...prev,
                followersCount: Math.max(0, (prev.followersCount || 1) - 1),
              }
            : null,
        );
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                followingCount: Math.max(0, (prev.followingCount || 1) - 1),
              }
            : null,
        );
      }
    }
  };

  useEffect(() => {
    if (activeTab !== "profile") {
      setViewingUser(null);
    }
  }, [activeTab]);

  const handleUpdateProfile = async () => {
    if (!currentUser || isCheckingName) return;

    // Guest Restriction Check
    if (currentUser.isGuest) {
      setModalMode("auth");
      showToast("Sign in to claim your unique permanent tag. Create a Moux account via Google or Email to continue.", "info");
      return;
    }

    setIsCheckingName(true);
    let finalUsername = currentUser.username || "";
    let finalDisplayName = currentUser.displayName || "admin";
    let lastUsernameUpdate = currentUser.last_username_update || 0;

    // Username Change logic
    if (nameInput !== currentUser.username) {
      // 7-day throttle check
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - lastUsernameUpdate < sevenDaysInMs) {
         showToast("You can only modify your username once every 7 days.", "error");
         setIsCheckingName(false);
         return;
      }

      if (nameInput.length < 3 || nameInput.length > 20) {
        setNameError("Username must be 3-20 characters");
        setIsCheckingName(false);
        return;
      }
      
      const isUnique = await isUsernameUnique(nameInput);
      if (!isUnique) {
        setNameError("Username is already taken.");
        setIsCheckingName(false);
        return;
      }
      finalUsername = nameInput;
      lastUsernameUpdate = Date.now();
    }

    finalDisplayName = displayNameInput || "admin";

    try {
      const updateData: Partial<UserProfile> = {
        username: finalUsername,
        displayName: finalDisplayName,
        last_username_update: lastUsernameUpdate,
        bio: bioInput,
        profileColor: colorInput,
        photoURL: photoURLInput,
      };

      // If manually setting a photoURL, clear the AI/Uploaded base64 avatar
      if (photoURLInput !== (currentUser.photoURL || "")) {
        updateData.avatar_base64 = "";
      }

      await updateProfile(currentUser.uid, updateData);
      setCurrentUser({
        ...currentUser,
        ...updateData,
      });
      setIsEditingProfile(false);
      setNameError("");
      showToast("Profile configuration updated.", "success");
    } catch (e) {
      setNameError("Failed to update profile");
    } finally {
      setIsCheckingName(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Just now";
    try {
      const date =
        typeof timestamp === "number"
          ? new Date(timestamp)
          : timestamp?.toDate
            ? timestamp.toDate()
            : new Date(timestamp);
      if (isNaN(date.getTime())) return "Just now";
      // If date is more than 10 years in the past or future, it's likely invalid data
      const now = Date.now();
      if (Math.abs(date.getTime() - now) > 10 * 365 * 24 * 60 * 60 * 1000)
        return "Just now";
      return date.toLocaleString();
    } catch (e) {
      return "Just now";
    }
  };

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return "just now";
    try {
      const date =
        typeof timestamp === "number"
          ? new Date(timestamp)
          : timestamp?.toDate
            ? timestamp.toDate()
            : new Date(timestamp);
      if (isNaN(date.getTime())) return "just now";

      const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
      if (seconds < 60) return "just now";

      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;

      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;

      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;

      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "just now";
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "Just now";
    try {
      const date =
        typeof timestamp === "number"
          ? new Date(timestamp)
          : timestamp?.toDate
            ? timestamp.toDate()
            : new Date(timestamp);
      if (isNaN(date.getTime())) return "Just now";
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Just now";
    }
  };
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchUsers(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSendDM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmInput.trim() || !dmTarget || !currentUser) return;
    await sendPrivateMessage(currentUser, dmTarget, dmInput);
    setDmInput("");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !chatInput.trim() ||
      !currentUser ||
      currentUser.isBanned ||
      !activeWorldRoom
    )
      return;

    // Direct active community server verification gate
    if (activeCommunityServer && activeCommunityServer.id === activeWorldRoom) {
      if (activeCommunityServer.requireVerification) {
        const isUserVerifiedToChat = 
          currentUser.is_verified || 
          currentUser.is_pro || 
          currentUser.is_veteran || 
          currentUser.isAdmin || 
          currentUser.uid === activeCommunityServer.ownerId;
          
        if (!isUserVerifiedToChat) {
          showToast("Verification Enforced! Secure subscription credentials are required to chat in this channel. See Shop & Verification Tab. 🛡️", "error");
          return;
        }
      }
    }

    let content = chatInput;
    if (content.trim().startsWith("/roll")) {
      const match = content.trim().match(/^\/roll\s*([0-9]*)/);
      let limit = 6;
      if (match && match[1]) {
        limit = parseInt(match[1], 10);
      }
      if (isNaN(limit) || limit < 2) limit = 6;
      const roll = Math.floor(Math.random() * limit) + 1;
      content = `🎲 Rolled ${roll} (d${limit})`;
    }

    await sendChatMessage(activeWorldRoom, content, currentUser);
    setChatInput("");
  };

  const renderContent = (content: string) => {
    const filtered =
      currentUser?.ageVerified === false ? filterProfanity(content) : content;

    // Split by mention regex
    const parts = filtered.split(/(@[a-zA-Z0-9_\-]+)/g);

    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        const username = part.substring(1);
        return (
          <button
            key={i}
            onClick={async (e) => {
              e.stopPropagation();
              // Try to find the user
              const results = await searchUsers(username, 1);
              if (
                results.length > 0 &&
                results[0].displayName.toLowerCase() === username.toLowerCase()
              ) {
                openProfileView(results[0].uid);
              }
            }}
            className="text-moux-cyan hover:underline font-bold transition-all"
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };

  const handleFeedPaste = (e: React.ClipboardEvent<HTMLDivElement | HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    let fileItem = null;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image/') === 0 || items[i].type.indexOf('video/') === 0) {
        fileItem = items[i];
        break;
      }
    }
    if (fileItem) {
      e.preventDefault(); // Stop default text paste if there is an image
      const file = fileItem.getAsFile();
      if (file) {
        // Temporarily override mode if needed, but since it's feed textarea, it's 'feed' context
        setMediaPickerConfig(prev => ({ ...prev, mode: 'feed' }));
        handleMediaPickerSelect(file);
      }
    } else {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    }
  };

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverNameInput.trim() || !currentUser || currentUser.isBanned) return;

    setIsCreatingServer(true);
    try {
      const serverId = await createCommunityServer({
        name: serverNameInput.trim(),
        description: serverDescInput.trim(),
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName,
        isPublic: serverIsPublic,
        iconURL: serverIconURL || undefined,
      });

      if (serverId) {
        setServerNameInput("");
        setServerDescInput("");
        setServerIconURL("");
        setModalMode("none");
        showToast("Server initialized successfully.", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Server initialization failed.");
    } finally {
      setIsCreatingServer(false);
    }
  };

  const handleGrantConfirm = async (uid: string, name: string) => {
    const amtStr = grantAmounts[uid];
    if (!amtStr) return;
    const amt = parseInt(amtStr);
    if (isNaN(amt)) return;

    setIsGranting(uid);
    try {
      await grantCurrency(uid, amt);
      if (currentUser)
        await logAdminAction(
          currentUser,
          "GRANT_MOUX",
          `Granted ${amt} Moux manually`,
          { id: uid, name },
        );
      setGrantAmounts((prev) => {
        const next = { ...prev };
        delete next[uid];
        return next;
      });
      fetchUsersForAdmin();
    } finally {
      setIsGranting(null);
    }
  };

  const handleToggleBadgeAction = async (
    uid: string,
    name: string,
    badge: string,
  ) => {
    await toggleBadge(uid, badge);
    if (currentUser)
      await logAdminAction(
        currentUser,
        "TOGGLE_BADGE",
        `Toggled ${badge} badge`,
        { id: uid, name },
      );
    fetchUsersForAdmin();
  };

  const handleAdminSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSearchQuery.trim()) return;
    setIsAdminSearching(true);
    const results = await searchUsers(adminSearchQuery, 20);
    setAdminSearchResults(results);
    setIsAdminSearching(false);
  };

  const handleNotificationClick = async (notif: MouxNotification) => {
    await markNotificationAsRead(notif.id);
    if (notif.link) {
      if (notif.link.startsWith("/#")) {
        const tab = notif.link.replace("/#", "") as any;
        // Simple mapping for common tabs
        if (tab === "settings") setActiveTab("settings");
        else if (tab === "market" || tab === "shop") setActiveTab("shop");
        else if (tab === "identity" || tab === "profile") setActiveTab("profile");
        else if (tab === "activity" || tab === "notifications") setActiveTab("notifications");
        else if (tab === "feed" || tab === "world") setActiveTab("feed");
        else if (tab === "discovery") setActiveTab("discovery");
        else if (tab === "servers") setActiveTab("servers");
      }
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    try {
      await markAllNotificationsAsRead(currentUser.uid);
      showToast("All notifications cleared.", "success");
    } catch (e: any) {
      showToast("Failed to clear notifications.");
    }
  };

  const handleReport = async (
    targetId: string,
    targetType: "feed" | "chat",
    targetContent: string,
    authorId: string,
    reason: string,
  ) => {
    if (!currentUser) return;
    try {
      await reportContent({
        reporterId: currentUser.uid,
        reporterName: currentUser.displayName,
        targetId,
        targetType,
        targetContent,
        authorId,
        reason,
        createdAt: Date.now(),
        status: "pending",
      });
      showToast("Report submitted. Admins will review.", "success");
    } catch (e: any) {
      showToast(e.message || "Report failed.");
    }
  };

  const handleBlockUserAction = async (
    targetId: string,
    targetName: string,
  ) => {
    if (!currentUser) return;
    const isBlocked = (currentUser.blockedUsers || []).includes(targetId);

    if (isBlocked) {
      try {
        await unblockUser(currentUser.uid, targetId);
        showToast(`${targetName} has been unblocked.`, "success");
      } catch (e: any) {
        showToast(e.message || "Unblocking failed.");
      }
    } else {
      setConfirmDialog({
        message: `Are you sure you want to block ${targetName}? You will no longer see their content.`,
        onConfirm: async () => {
          try {
            await blockUser(currentUser.uid, targetId);
            showToast(`${targetName} has been blocked.`, "success");
          } catch (e: any) {
            showToast(e.message || "Blocking failed.", "error");
          }
        }
      });
    }
  };

  const handleMuteUserAction = async (targetId: string, targetName: string) => {
    if (!currentUser) return;
    const isMuted = (currentUser.mutedUsers || []).includes(targetId);

    try {
      if (isMuted) {
        await unmuteUser(currentUser.uid, targetId);
        showToast(`${targetName} has been unmuted.`, "success");
      } else {
        await muteUser(currentUser.uid, targetId);
        showToast(`${targetName} has been muted.`, "success");
      }
    } catch (e: any) {
      showToast(e.message || "Muting/Unmuting failed.");
    }
  };

  const handleInitiate2FASetup = () => {
    const secret = generateSecret();
    const codes = generateRecoveryCodes();
    setTemp2FASecret(secret);
    setTemp2FARecoveryCodes(codes);
    setEntered2FAOTP("");
    setOtpVerificationError("");
    setIsSettingUp2FA(true);
  };

  const handleCancel2FASetup = () => {
    setIsSettingUp2FA(false);
    setTemp2FASecret("");
    setTemp2FARecoveryCodes([]);
    setEntered2FAOTP("");
    setOtpVerificationError("");
  };

  const handleActivate2FA = async () => {
    if (!currentUser) return;
    if (!entered2FAOTP.trim()) {
      setOtpVerificationError("Please enter verification token.");
      return;
    }
    const isValid = verifyTOTP(temp2FASecret, entered2FAOTP);
    if (isValid) {
      try {
        await updateProfile(currentUser.uid, {
          twoFactorEnabled: true,
          twoFactorSecret: temp2FASecret,
          twoFactorRecoveryCodes: temp2FARecoveryCodes,
        });
        setCurrentUser({
          ...currentUser,
          twoFactorEnabled: true,
          twoFactorSecret: temp2FASecret,
          twoFactorRecoveryCodes: temp2FARecoveryCodes,
        });
        setIs2FAVerified(true);
        setIsSettingUp2FA(false);
        setTemp2FASecret("");
        setTemp2FARecoveryCodes([]);
        setEntered2FAOTP("");
        showToast("Two-Factor Authentication protocol activated. Secure tunnel active.", "success");
      } catch (err: any) {
        setOtpVerificationError(err.message || "Activation failure.");
      }
    } else {
      setOtpVerificationError("Signature mismatch: check code sync or try again.");
    }
  };

  const handleDeactivate2FA = async () => {
    if (!currentUser) return;
    if (!enteredDeactivationOTP.trim()) {
      setDeactivationError("Please enter verification token.");
      return;
    }
    
    // Allow either active TOTP code OR any of their valid recovery codes for deactivation!
    const secret = currentUser.twoFactorSecret || "";
    const isOTPValid = verifyTOTP(secret, enteredDeactivationOTP);
    const isRecoveryValid = (currentUser.twoFactorRecoveryCodes || []).includes(enteredDeactivationOTP.trim());
    
    if (isOTPValid || isRecoveryValid) {
      try {
        await updateProfile(currentUser.uid, {
          twoFactorEnabled: false,
          twoFactorSecret: "",
          twoFactorRecoveryCodes: [],
        });
        setCurrentUser({
          ...currentUser,
          twoFactorEnabled: false,
          twoFactorSecret: undefined,
          twoFactorRecoveryCodes: undefined,
        });
        setIs2FAVerified(false);
        setShowDeactivationOTPInput(false);
        setEnteredDeactivationOTP("");
        setDeactivationError("");
        showToast("Two-Factor Authentication decommissioned. Profile vulnerability warning issued.", "error");
      } catch (err: any) {
        setDeactivationError(err.message || "Deactivation failure.");
      }
    } else {
      setDeactivationError("Verification failure: signature or recovery code mismatch.");
    }
  };

  const handleVerifyChallengeOTP = () => {
    if (!currentUser) return;
    if (!enteredLoginOTP.trim()) {
      setLoginOTPError("Verification signature required.");
      return;
    }
    
    const secret = currentUser.twoFactorSecret || "";
    const isOTPValid = verifyTOTP(secret, enteredLoginOTP);
    const isRecoveryValid = (currentUser.twoFactorRecoveryCodes || []).includes(enteredLoginOTP.trim());

    if (isOTPValid) {
      setIs2FAVerified(true);
      setEnteredLoginOTP("");
      setLoginOTPError("");
      showToast("Verification code accepted. Secure context unlocked.", "success");
    } else if (isRecoveryValid) {
      // It's a valid recovery code! Revoke it from array
      const remainingCodes = (currentUser.twoFactorRecoveryCodes || []).filter(c => c !== enteredLoginOTP.trim());
      updateProfile(currentUser.uid, {
        twoFactorRecoveryCodes: remainingCodes
      }).then(() => {
        setCurrentUser({
          ...currentUser,
          twoFactorRecoveryCodes: remainingCodes
        });
        setIs2FAVerified(true);
        setEnteredLoginOTP("");
        setLoginOTPError("");
        showToast("Backup Recovery Code authenticated & blacklisted. Context unlocked.", "success");
      }).catch((err: any) => {
        setLoginOTPError("Failed to update recovery nodes: " + err.message);
      });
    } else {
      setLoginOTPError("Invalid TOTP signature pin or backup recovery hash.");
    }
  };

  const fetchUsersForAdmin = async () => {
    const users = await getAllUsers();
    setAllUsers(users);
    
    // Track shadow muted users
    const now = Date.now();
    const muted = users.filter(u => u.shadowMutedUntil && u.shadowMutedUntil > now);
    setShadowMutedUsers(muted);

    if (adminSearchQuery.length >= 2) {
      const results = await searchUsers(adminSearchQuery, 20);
      setAdminSearchResults(results);
    }
  };

  const filteredChat = chatMessages.filter((msg) => {
    if (currentUser?.blockedUsers?.includes(msg.authorId)) return false;
    if (currentUser?.mutedUsers?.includes(msg.authorId)) return false;
    return true;
  });

  const filteredDMs = privateMessages.filter((dm) => {
    const partnerId =
      dm.senderId === currentUser?.uid ? dm.receiverId : dm.senderId;
    if (currentUser?.blockedUsers?.includes(partnerId)) return false;
    return true;
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (adminTab === "users" && adminSearchQuery.length >= 2) {
        setIsAdminSearching(true);
        searchUsers(adminSearchQuery, 20).then((results) => {
          setAdminSearchResults(results);
          setIsAdminSearching(false);
        });
      } else if (adminSearchQuery.length < 2) {
        setAdminSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [adminSearchQuery, adminTab]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (adminTab === "moderation" && grantSearchQuery.length >= 2) {
        setIsGrantSearching(true);
        searchUsers(grantSearchQuery, 5).then((results) => {
          setGrantSearchResults(results);
          setIsGrantSearching(false);
        });
      } else if (grantSearchQuery.length < 2) {
        setGrantSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [grantSearchQuery, adminTab]);

  const sortedUsers = [
    ...(adminSearchResults.length > 0 ? adminSearchResults : allUsers),
  ].sort((a, b) => {
    switch (userSortOrder) {
      case "richest":
        return b.mouxBalance - a.mouxBalance;
      case "followers":
        return (b.followersCount || 0) - (a.followersCount || 0);
      case "newest":
      default:
        return b.createdAt - a.createdAt;
    }
  });

  // Combined render logic for smooth transitions
  return (
    <div className={cn("min-h-screen relative overflow-hidden", bgMain)}>
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[200]"
          >
            <div
              className={cn(
                "px-6 py-4 border shadow-none flex items-center gap-3",
                toastMessage.type === "error"
                  ? "bg-red-500/10 border-red-500/30 text-red-500"
                  : "bg-moux-cyan/10 border-moux-cyan/30 text-moux-cyan",
              )}
            >
              {toastMessage.type === "error" ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              <span className="text-xs font-semibold tracking-wide">
                {toastMessage.message}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {(loading || minLoading) && <MouxLoader key="global-loader" />}
      </AnimatePresence>

      {!(loading || minLoading) && !currentUser && !bannedUserRecord && (
        <motion.div
          key="login-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            "h-screen flex items-center justify-center p-4 transition-colors duration-500",
            bgMain,
          )}
        >
          <div className="max-w-md w-full text-center">
            <div
              className="w-24 h-24 flex items-center justify-center mx-auto mb-8 border-gray-200 dark:border-gray-800 bg-white/5"
            >
              <Globe className="w-12 h-12 text-white" />
            </div>
            <h1
              className="text-4xl font-sans font-semibold mb-12  tracking-tighter text-white"
            >
              MOUX
            </h1>

            <div className="space-y-4">
              {loginMode === "selection" ? (
                <>
                  <button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="w-full bg-white text-black font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-all tracking-wide text-xs"
                  >
                    <Globe className="w-5 h-5" />
                    Sign in with Google
                  </button>

                  <button
                    onClick={() => setLoginMode("email")}
                    disabled={isLoggingIn}
                    className="w-full bg-discord-dark border border-white/10 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/5 transition-all tracking-wide text-xs"
                  >
                    <Mail className="w-5 h-5" />
                    Email Login
                  </button>

                  <button
                    onClick={handleGuestLogin}
                    disabled={isLoggingIn}
                    className="w-full bg-moux-cyan/10 border border-moux-cyan/20 text-moux-cyan font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-moux-cyan/20 transition-all tracking-wide text-xs"
                  >
                    <UserPlus className="w-5 h-5" />
                    Continue as Guest
                  </button>
                </>
              ) : (
                <form
                  onSubmit={handleEmailLogin}
                  className="space-y-4 text-left"
                >
                  <div className="flex bg-discord-dark p-1 rounded-xl mb-4 border border-white/5">
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-semibold tracking-wide rounded-lg transition-all",
                        authMode === "login"
                          ? "bg-moux-cyan text-black"
                          : "text-gray-500 hover:text-white",
                      )}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode("signup")}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-semibold tracking-wide rounded-lg transition-all",
                        authMode === "signup"
                          ? "bg-moux-cyan text-black"
                          : "text-gray-500 hover:text-white",
                      )}
                    >
                      Join
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-2 block tracking-widest ml-1">
                      Identity Email
                    </label>
                    <input
                      type="email"
                      value={loginEmailInput}
                      onChange={(e) => setLoginEmailInput(e.target.value)}
                      className="w-full bg-discord-dark border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-moux-cyan/50 focus:outline-none"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-2 block tracking-widest ml-1">
                      Access Password
                    </label>
                    <input
                      type="password"
                      value={loginPasswordInput}
                      onChange={(e) => setLoginPasswordInput(e.target.value)}
                      className="w-full bg-discord-dark border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-moux-cyan/50 focus:outline-none"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-white text-black font-semibold py-4 flex items-center justify-center gap-3 hover:brightness-110 transition-all tracking-wide text-xs"
                  >
                    {isLoggingIn
                      ? "Messaging Notifications..."
                      : authMode === "login"
                        ? "Confirm Access"
                        : "Initialize Identity"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMode("selection")}
                    className={cn(
                      "w-full text-gray-500 text-[10px] font-semibold tracking-wide transition-colors py-2",
                      isLight ? "hover:text-black" : "hover:text-white",
                    )}
                  >
                    Return to Selection
                  </button>
                </form>
              )}
            </div>

            <p className="mt-12 text-xs text-gray-500 text-gray-600  tracking-[0.2em]">
              System.v{new Date().getFullYear()}.alpha.0
            </p>
          </div>
        </motion.div>
      )}

      {!(loading || minLoading) && bannedUserRecord && (
        <motion.div
          key="banned-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            "h-screen flex items-center justify-center p-4 transition-colors duration-500",
            bgMain,
          )}
        >
          <div className="max-w-md w-full bg-[#121212] border-gray-200 dark:border-gray-800 p-8 space-y-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-gray-900/50 rounded-3xl flex items-center justify-center border border-white/5 shadow-inner">
                <span className="font-script text-5xl text-gray-500 opacity-50 grayscale select-none tracking-tighter">
                  m
                </span>
              </div>
              <h2 className="text-xl font-sans font-semibold tracking-wide text-gray-400">Restricted Access</h2>
            </div>
            
            {bannedUserRecord?.appealStatus === 'pending' ? (
              <div className="bg-moux-cyan/5 border border-moux-cyan/20 rounded-2xl p-6 text-center space-y-2">
                <p className="text-moux-cyan text-sm font-bold tracking-wide">Appeal Pending</p>
                <p className="text-gray-400 text-xs">The moderators are reviewing your transmission.</p>
              </div>
            ) : bannedUserRecord?.appealStatus === 'rejected' ? (
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-center space-y-2">
                <p className="text-red-500 text-sm font-bold tracking-wide">Appeal Rejected</p>
                <p className="text-gray-400 text-xs text-center px-4">The decision is final.</p>
              </div>
            ) : (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!appealInput.trim()) return;
                  setIsSubmittingAppeal(true);
                  try {
                    await submitAppeal(auth.currentUser!.uid, appealInput);
                    setBannedUserRecord({ ...bannedUserRecord, appealStatus: 'pending' });
                    setAppealInput("");
                    showToast("Appeal submitted successfully.", "success");
                  } catch (e: any) {
                    showToast(e.message || "Failed to submit appeal.", "error");
                  } finally {
                    setIsSubmittingAppeal(false);
                  }
                }}
                className="space-y-4"
              >
                <p className="text-gray-400 text-sm leading-relaxed text-center px-2">
                  Your access to Moux World has been revoked. State your case for an appeal.
                </p>
                <textarea 
                  value={appealInput}
                  onChange={e => setAppealInput(e.target.value)}
                  placeholder="Explain your situation here..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-moux-cyan/50 h-32 resize-none"
                />
                <button 
                  type="submit" 
                  disabled={isSubmittingAppeal || !appealInput.trim()}
                  className="w-full bg-white text-black font-bold text-xs tracking-widest py-4 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  {isSubmittingAppeal ? "Submitting..." : "Submit Appeal"}
                </button>
              </form>
            )}
            <button 
              onClick={() => {
                auth.signOut();
                setBannedUserRecord(null);
                setLoginMode("selection");
              }}
              className="w-full text-center text-gray-500 hover:text-white  text-[10px] tracking-widest font-semibold transition-colors"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      )}

      {!(loading || minLoading) && currentUser && !isEmailVerified && (
        <motion.div
          key="verify-email"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            "h-screen flex items-center justify-center p-4 transition-colors duration-500",
            bgMain,
          )}
        >
          <div
            className={cn(
              "w-full max-w-md space-y-8 text-center p-8 border rounded-3xl shadow-2xl relative overflow-hidden",
              blurEnabled && "backdrop-blur-xl",
              cardMain,
              borderMain,
            )}
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-moux-cyan/10 rounded-full flex items-center justify-center border-4 border-moux-cyan/30 animate-pulse">
                <ShieldCheck className="w-10 h-10 text-moux-cyan" />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight  text-moux-cyan">
              Verify Identity
            </h2>
            <p className="text-gray-400 text-sm">
              We've sent a verification link to{" "}
              <span className="text-white font-bold">
                {auth.currentUser?.email}
              </span>
              . Please check your inbox (and spam folder) to authenticate your
              biological identity.
            </p>

            <div className="pt-8 flex flex-col gap-4">
              <button
                onClick={() => {
                  auth.currentUser?.reload().then(() => {
                    if (auth.currentUser?.emailVerified) {
                      setIsEmailVerified(true);
                    } else {
                      showToast(
                        "Still waiting for verification. Please check your email.",
                        "info"
                      );
                    }
                  });
                }}
                className="w-full py-4 bg-white text-discord-black font-semibold tracking-wide hover:brightness-110 transition-all"
              >
                I've Verified
              </button>
              <button
                onClick={async () => {
                  if (auth.currentUser) {
                    try {
                      await sendEmailVerification(auth.currentUser);
                      showToast("Verification email resent.", "success");
                    } catch (e: any) {
                      showToast(e.message, "error");
                    }
                  }
                }}
                className="w-full py-4 bg-white/5 text-gray-300 font-bold tracking-wide rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
              >
                Resend Email
              </button>
              <button
                onClick={() => auth.signOut()}
                className="text-xs text-gray-500 tracking-wide hover:text-red-500 transition-colors mt-4"
              >
                Sign Out / Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {!(loading || minLoading) && currentUser && isEmailVerified && currentUser.twoFactorEnabled && !is2FAVerified && (
        <motion.div
          key="2fa-challenge"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            "h-screen flex items-center justify-center p-4 transition-colors duration-500",
            bgMain,
          )}
        >
          <div
            className={cn(
              "w-full max-w-md space-y-6 text-center p-8 border rounded-3xl shadow-2xl relative overflow-hidden font-mono",
              blurEnabled && "backdrop-blur-xl",
              cardMain,
              borderMain,
            )}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-moux-cyan/10 rounded-full flex items-center justify-center border-4 border-moux-cyan/30 animate-pulse">
                <Lock className="w-8 h-8 text-moux-cyan" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                ● Identity Encrypted & Locked
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-moux-cyan pt-2 font-sans">
                2FA Verification
              </h2>
            </div>

            <p className="text-gray-400 text-[10.5px] leading-relaxed">
              This node is protected. Enter the 6-digit dynamic passcode from your authenticator app or one of your fallback emergency recovery keys:
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyChallengeOTP();
              }}
              className="space-y-4 pt-2 text-left"
            >
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                  Secure Passcode / Recovery Hash
                </label>
                <input
                  type="text"
                  maxLength={19}
                  value={enteredLoginOTP}
                  onChange={(e) => {
                    setEnteredLoginOTP(e.target.value);
                    setLoginOTPError("");
                  }}
                  className={cn(
                    "w-full px-4 py-3.5 text-sm rounded-xl font-mono border text-center font-bold tracking-wider",
                    inputMain
                  )}
                  placeholder="000 000 OR xxxx-xxxx"
                  autoFocus
                />
                {loginOTPError && (
                  <p className="text-[10px] text-red-500 font-bold pl-1 font-mono">
                    * {loginOTPError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-moux-cyan text-discord-black font-extrabold text-xs tracking-widest rounded-xl hover:brightness-110 shadow-lg shadow-moux-cyan/10 transition-all font-sans"
              >
                AUTHORIZE IDENTITY & SECURE
              </button>
            </form>

            {/* Simulated Authenticator Pin display so they can easily test inside this sandbox! */}
            <div className="p-3.5 bg-moux-cyan/5 rounded-xl border border-moux-cyan/10 text-left space-y-1.5">
              <span className="text-[9px] text-moux-cyan font-bold block uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 animate-pulse" /> Sandbox Live Authenticator Pin
              </span>
              <p className="text-[9px] text-gray-500 leading-normal">
                Forgot your phone? We simulated your linked Authenticator below:
              </p>
              <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded border border-white/5 mt-1 font-mono">
                <div className="text-xs text-moux-cyan font-bold tracking-widest flex items-center gap-2">
                  <span>{currentSimulatedOTP.slice(0, 3)} {currentSimulatedOTP.slice(3)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEnteredLoginOTP(currentSimulatedOTP);
                      setLoginOTPError("");
                      showToast("Pin copied into entry field.", "success");
                    }}
                    className="text-[8.5px] text-gray-400 hover:text-white transition-colors bg-white/5 rounded px-1.5 py-0.5 border border-white/10"
                  >
                    Use Pin
                  </button>
                </div>
                <div className="text-[9px] text-white flex items-center gap-1.5">
                  <span className="text-[8px] text-gray-500">ROTATING</span>
                  <span>{secondsRemaining}s</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-gray-500 tracking-wide hover:text-red-500 transition-colors py-2"
              >
                Sign Out node / Exit
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {!(loading || minLoading) && currentUser && isEmailVerified && (!currentUser.twoFactorEnabled || is2FAVerified) && (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className={cn(
            "flex h-screen overflow-hidden font-sans flex-col md:flex-row transition-all duration-500",
            theme === "dark" && "bg-discord-black text-white",
            theme === "light" && "bg-gray-50 text-discord-black",
            theme === "low-power" && "bg-black text-gray-400 grayscale",
          )}
        >
          {/* Desktop Left Sidebar (Discord Style) */}
          <aside
            className={cn(
              "hidden md:flex flex-col w-[72px] items-center py-3 gap-2 border-r z-50 shrink-0",
              blurEnabled && "backdrop-blur-xl",
              bgSide,
              borderMain,
            )}
          >
            <motion.button
              whileTap={{ scale: animationsEnabled ? 1.15 : 1 }}
              transition={springTransition}
              onClick={() => setActiveTab("feed")}
              className={cn(
                "w-12 h-12 flex items-center justify-center transition-all duration-200",
                activeTab === "feed"
                  ? "rounded-[16px] bg-moux-cyan text-black"
                  : "rounded-[24px] bg-white/5 hover:rounded-[16px] hover:bg-moux-cyan/20 text-moux-cyan",
              )}
            >
              <Globe className="w-7 h-7" />
            </motion.button>

            <div className="w-8 h-[2px] bg-white/10 rounded-full my-1" />

            <motion.button
              whileTap={{ scale: animationsEnabled ? 1.15 : 1 }}
              transition={springTransition}
              onClick={() => setActiveTab("discovery")}
              className={cn(
                "w-12 h-12 flex items-center justify-center transition-all duration-200",
                activeTab === "discovery"
                  ? "rounded-[16px] bg-moux-cyan text-black"
                  : "rounded-[24px] bg-white/5 hover:rounded-[16px] hover:bg-moux-cyan/20 text-moux-cyan",
              )}
            >
              <Search className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileTap={{ scale: animationsEnabled ? 1.15 : 1 }}
              transition={springTransition}
              onClick={() => setActiveTab("servers")}
              className={cn(
                "w-12 h-12 flex items-center justify-center transition-all duration-200",
                activeTab === "servers"
                  ? "rounded-[16px] bg-moux-cyan text-black"
                  : "rounded-[24px] bg-white/5 hover:rounded-[16px] hover:bg-moux-cyan/20 text-moux-cyan",
              )}
            >
              <Server className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileTap={{ scale: animationsEnabled ? 1.15 : 1 }}
              transition={springTransition}
              onClick={() => setActiveTab("shop")}
              className={cn(
                "w-12 h-12 flex items-center justify-center transition-all duration-200",
                activeTab === "shop"
                  ? "rounded-[16px] bg-moux-cyan text-black"
                  : "rounded-[24px] bg-white/5 hover:rounded-[16px] hover:bg-moux-cyan/20 text-moux-cyan",
              )}
            >
              <ShoppingBag className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileTap={{ scale: animationsEnabled ? 1.15 : 1 }}
              transition={springTransition}
              onClick={handleMouxBotClick}
              className={cn(
                "w-12 h-12 flex items-center justify-center transition-all duration-200",
                activeTab === "moux_trader"
                  ? "rounded-[16px] bg-moux-cyan text-black"
                  : "rounded-[24px] bg-white/5 hover:rounded-[16px] hover:bg-moux-cyan/20 text-moux-cyan",
              )}
            >
              <Terminal className="w-6 h-6" />
            </motion.button>

            <div className="w-8 h-[2px] bg-white/10 rounded-full my-1 shrink-0" />

            {/* Left Sidebar Premium Integration */}
            <div 
              title={!currentUser?.is_pro && !currentUser?.is_pro_plus && !currentUser?.is_veteran ? "Buy Premium" : "Active Premium subscription"}
              className="w-12 h-12 flex flex-col items-center justify-center relative border border-white/5 bg-white/[0.02] rounded-xl hover:bg-white/[0.05] transition-all cursor-pointer overflow-hidden shrink-0" 
              onClick={() => setIsSelarModalOpen(true)}
            >
              {!currentUser?.is_pro && !currentUser?.is_pro_plus && !currentUser?.is_veteran ? (
                <div className="flex flex-col items-center text-center">
                  <span className="text-[7.5px] font-black text-moux-cyan uppercase tracking-widest leading-none">
                    Buy
                  </span>
                  <span className="text-[6.5px] font-black text-gray-400 uppercase tracking-tight leading-none mt-0.5">
                    Premium
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center px-0.5">
                  {currentUser?.is_veteran ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[16px] h-[16px] shrink-0 mb-0.5" fill="none">
                        <defs>
                          <linearGradient id="shimmerGradSidebarVetS" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FFD700" />
                            <stop offset="50%" stopColor="#FFFFFF" />
                            <stop offset="100%" stopColor="#FFD700" />
                          </linearGradient>
                          <style>
                            {`
                              @keyframes goldSweepS {
                                0% { opacity: 0.85; filter: drop-shadow(0 0 1px #FFD700); }
                                50% { opacity: 1; filter: drop-shadow(0 0 3px #FFFFFF); }
                                100% { opacity: 0.85; filter: drop-shadow(0 0 1px #FFD700); }
                              }
                              .moux-shimmer-vet-s {
                                animation: goldSweepS 2.5s infinite linear;
                              }
                            `}
                          </style>
                        </defs>
                        <g className="moux-shimmer-vet-s">
                          <path d="M12 2L14.8 5.7L19.2 4.8L18.8 9.3L22 12L18.8 14.7L19.2 19.2L14.8 18.3L12 22L9.2 18.3L4.8 19.2L5.2 14.7L2 12L5.2 9.3L4.8 4.8L9.2 5.7L12 2Z" fill="url(#shimmerGradSidebarVetS)"/>
                          <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                      </svg>
                      <span className="text-[6.5px] font-black text-white uppercase tracking-tighter leading-none truncate w-10 text-center">
                        Veteran
                      </span>
                    </>
                  ) : currentUser?.is_pro_plus ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[16px] h-[16px] shrink-0 mb-0.5" fill="none">
                        <style>
                          {`
                            @keyframes scaleBreathingS {
                              0% { transform: scale(1); }
                              50% { transform: scale(1.08); }
                              100% { transform: scale(1); }
                            }
                            .moux-pulse-proplus-s {
                              transform-origin: center;
                              animation: scaleBreathingS 2s infinite ease-in-out;
                            }
                          `}
                        </style>
                        <g className="moux-pulse-proplus-s">
                          <path d="M12 2L14.8 5.7L19.2 4.8L18.8 9.3L22 12L18.8 14.7L19.2 19.2L14.8 18.3L12 22L9.2 18.3L4.8 19.2L5.2 14.7L2 12L5.2 9.3L4.8 4.8L9.2 5.7L12 2Z" fill="#7C4DFF"/>
                          <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                      </svg>
                      <span className="text-[6.5px] font-black text-white uppercase tracking-tighter leading-none truncate w-10 text-center">
                        Pro Plus
                      </span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[16px] h-[16px] shrink-0 mb-0.5" fill="none">
                        <path d="M12 2L14.8 5.7L19.2 4.8L18.8 9.3L22 12L18.8 14.7L19.2 19.2L14.8 18.3L12 22L9.2 18.3L4.8 19.2L5.2 14.7L2 12L5.2 9.3L4.8 4.8L9.2 5.7L12 2Z" fill="#1DA1F2"/>
                        <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[6.5px] font-black text-white uppercase tracking-tighter leading-none truncate w-10 text-center font-semibold">
                        Pro
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-2 relative">
              <motion.button
                whileTap={{ scale: animationsEnabled ? 1.15 : 1 }}
                transition={springTransition}
                onClick={() => setActiveTab("notifications")}
                className={cn(
                  "w-12 h-12 flex items-center justify-center transition-all duration-200",
                  activeTab === "notifications"
                    ? "rounded-[16px] bg-white/20 text-white"
                    : "rounded-[24px] bg-white/5 hover:rounded-[16px] text-gray-500 hover:text-white",
                )}
              >
                <Bell className="w-6 h-6" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-discord-dark flex items-center justify-center min-w-[20px] h-[20px]">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: animationsEnabled ? 1.15 : 1 }}
                transition={springTransition}
                onClick={() => setActiveTab("profile")}
                className={cn(
                  "w-12 h-12 flex items-center justify-center transition-all duration-200 relative",
                  activeTab === "profile"
                    ? "rounded-[16px] bg-white/20 text-white"
                    : "rounded-[24px] bg-white/5 hover:rounded-[16px] text-gray-500 hover:text-white",
                )}
              >
                <User className="w-6 h-6" />
              </motion.button>
            </div>
          </aside>

          {/* Mobile Top Header */}
          <header
            className={cn(
              "md:hidden h-14 border-b flex items-center px-4 justify-between sticky top-0 z-30",
              blurEnabled && "backdrop-blur-md",
              bgSide,
              borderMain,
            )}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-10 h-10 flex items-center justify-center cursor-pointer ml-1"
                onClick={() => {
                  setActiveTab("feed");
                  if (activeTab === "feed") {
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-8 h-8" fill="none">
                  <path 
                    d="M 15 65 C 20 40, 28 25, 38 25 C 48 25, 48 48, 48 58 C 48 40, 56 25, 65 25 C 75 25, 76 45, 75 58 C 78 45, 84 42, 90 45" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-white"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {batteryLevel !== null && (
                  <div className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold font-mono hidden sm:flex",
                    batteryLevel < 0.2 ? "bg-red-500/20 text-red-500" : "bg-moux-cyan/10 text-moux-cyan"
                  )}>
                    {isCharging ? (
                      <Zap className="w-3 h-3 animate-pulse" />
                    ) : batteryLevel < 0.2 ? (
                      <BatteryLow className="w-3 h-3" />
                    ) : (
                      <Battery className="w-3 h-3" />
                    )}
                    {Math.round(batteryLevel * 100)}%
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {currentUser.isAdmin && (
                  <button
                    onClick={() => {
                      setShowAdmin(true);
                      fetchUsersForAdmin();
                    }}
                    className="p-1.5 text-red-500 bg-red-500/10 rounded-lg"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
              )}
              <button
                onClick={() => setActiveTab("notifications")}
                className={cn(
                  "p-1.5 rounded-xl relative transition-all",
                  activeTab === "notifications"
                    ? "text-moux-cyan bg-moux-cyan/10"
                    : "text-gray-500 hover:text-white",
                )}
              >
                <Bell className="w-4 h-4" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-discord-dark flex items-center justify-center min-w-[20px] h-[20px]">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setIsRightDrawerOpen(true)}
                className="w-8 h-8 rounded-full overflow-hidden border border-white/20 cursor-pointer ml-1"
              >
                <UserAvatar uid={currentUser?.uid || ""} size="w-full h-full" className="rounded-full" />
              </button>
            </div>
          </div>
          <input
            type="file"
            hidden
            ref={fileInputRef}
            accept="image/*"
            onChange={handlePhotoUpload}
          />
        </header>

          {/* Sidebars for Desktop / Mobile Drawer */}
          <AnimatePresence>
            {isRightDrawerOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsRightDrawerOpen(false)}
                  className="fixed inset-0 z-[60] bg-black/60"
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className={cn(
                    "fixed top-0 right-0 h-full w-[280px] z-[70] flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.5)]",
                    theme === "dark" ? "bg-[#09090b] border-l border-white/10" : "bg-white border-l border-gray-200"
                  )}
                >
                  <div className="p-5 flex flex-col items-start relative border-b border-white/5">
                    <button onClick={() => setIsRightDrawerOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 cursor-pointer">
                      <X className="w-5 h-5 text-gray-400" />
                    </button>

                    <div className="w-14 h-14 rounded-full border-2 border-white/10 overflow-hidden mb-3 mt-4">
                       <UserAvatar uid={currentUser?.uid || ""} size="w-full h-full" className="rounded-full" />
                    </div>

                    <div className="flex flex-col mb-4 w-full">
                       <h3 className={cn("font-bold text-base leading-none tracking-wide", textMain)}>{currentUser?.displayName || "admin"}</h3>
                       <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-gray-500 font-mono text-sm">@{currentUser?.username || "admin"}</span>
                        <VerifiedBadge
                          className="w-4 h-4 shrink-0"
                          uid={currentUser?.uid}
                          name={currentUser?.displayName}
                          email={currentUser?.email}
                          isVerified={currentUser?.isVerified}
                          badges={currentUser?.badges}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm font-sans mb-2">
                      <div className="flex gap-1.5 hover:underline cursor-pointer" onClick={async () => {
                        const following = await getFollowing(currentUser?.uid || "", 50);
                        setFollowGraphState({ isOpen: true, title: "Following", users: following });
                      }}>
                         <span className={cn("font-bold", textMain)}>{currentUser?.followingCount || 0}</span>
                         <span className="text-gray-500">Following</span>
                      </div>
                      <div className="flex gap-1.5 hover:underline cursor-pointer" onClick={async () => {
                        const followers = await getFollowers(currentUser?.uid || "", 50);
                        setFollowGraphState({ isOpen: true, title: "Followers", users: followers });
                      }}>
                         <span className={cn("font-bold", textMain)}>{currentUser?.followersCount || 0}</span>
                         <span className="text-gray-500">Followers</span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links inside Right Drawer */}
                  <div className={cn(
                    "flex flex-col gap-1 px-3 mt-4 w-full text-[15px] font-semibold",
                    isLight ? "text-gray-700" : "text-gray-300"
                  )}>
                    <button 
                      onClick={() => { setActiveTab("profile"); setIsRightDrawerOpen(false); }} 
                      className={cn(
                        "w-full text-left p-3.5 rounded-xl flex items-center gap-4 transition-all duration-200 cursor-pointer",
                        isLight ? "hover:bg-black/5 hover:text-black" : "hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <User className="w-5 h-5" /> Profile
                    </button>
                    <button 
                      onClick={() => { setActiveTab("settings"); setIsRightDrawerOpen(false); }} 
                      className={cn(
                        "w-full text-left p-3.5 rounded-xl flex items-center gap-4 transition-all duration-200 cursor-pointer",
                        isLight ? "hover:bg-black/5 hover:text-black" : "hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Settings className="w-5 h-5 text-moux-cyan" /> Account Settings
                    </button>
                    <button 
                      onClick={() => { setActiveTab("shop"); setIsRightDrawerOpen(false); }} 
                      className={cn(
                        "w-full text-left p-3.5 rounded-xl flex items-center gap-4 transition-all duration-200 cursor-pointer",
                        isLight ? "hover:bg-black/5 hover:text-black" : "hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <ShoppingBag className="w-5 h-5" /> Market
                    </button>
                  </div>
                  
                  <div className="mt-auto p-4 mb-4">
                     <button onClick={async () => { await auth.signOut(); }} className="w-full text-left p-3.5 hover:bg-red-500/10 rounded-xl flex items-center gap-4 text-red-500 transition-colors text-[15px] font-semibold cursor-pointer">
                      <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}

            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-black/60 md:hidden"
              />
            )}
          </AnimatePresence>

          <aside
            className={cn(
              "fixed md:relative top-0 right-0 h-full w-72 border-l md:border-r z-50 transition-transform duration-300 flex flex-col",
              bgSide,
              borderMain,
              !isSidebarOpen &&
                "translate-x-full md:translate-x-0 md:flex hidden",
            )}
          >
            <div
              className={cn(
                "p-4 border-b flex items-center justify-between",
                borderMain,
              )}
            >
              <p
                className={cn(
                  "text-[10px] font-semibold tracking-wide ",
                  textMuted,
                )}
              >
                Server Users
              </p>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className={textMuted}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded border group",
                  cardMain,
                  borderMain,
                )}
              >
                <div
                  className="relative cursor-pointer group/avatar"
                  onClick={() => setMediaPickerConfig({ isOpen: true, mode: 'pfp' })}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full overflow-hidden border",
                      borderMain,
                    )}
                  >
                    <UserAvatar 
                      uid={currentUser?.uid || ""}
                      size="w-8 h-8"
                      className="rounded-full"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                      <ImagePlus className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 rounded-full",
                      isLight ? "border-white" : "border-discord-sidebar",
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className={cn("text-sm font-bold truncate", textMain)}>
                      {currentUser.displayName}
                    </p>
                    <VerifiedBadge
                      className="w-3 h-3"
                      uid={currentUser.uid}
                      name={currentUser.displayName}
                      email={currentUser.email}
                      isVerified={currentUser.isVerified}
                      badges={currentUser.badges}
                    />
                  </div>
                  <p
                    className={cn("text-[9px] font-mono ", textMuted)}
                  >
                    ROLEPLAYER
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main
            className={cn(
              "flex-1 flex flex-col relative overflow-hidden pb-16 md:pb-0",
              bgMain,
            )}
          >
            <header
              className={cn(
                "hidden md:flex h-14 border-b items-center px-4 justify-between backdrop-blur sticky top-0 z-20",
                isLight ? "bg-white/80" : "bg-discord-dark/50",
                borderMain,
              )}
            >
              <div className="flex items-center gap-6">
                <h2
                  className={cn(
                    "font-bold flex items-center gap-2 font-semibold tracking-tight",
                    textMain,
                  )}
                >
                  {activeTab === "servers" && (
                    <>
                      <MapPin className="w-5 h-5 text-gray-500" />{" "}
                      localized-servers
                    </>
                  )}
                  {activeTab === "feed" && (
                    <>
                      <Globe className="w-5 h-5 text-gray-500" /> world-feed
                    </>
                  )}
                  {activeTab === "profile" && (
                    <>
                      <User className="w-5 h-5 text-gray-500" />{" "}
                      account profile
                    </>
                  )}
                  {activeTab === "notifications" && (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-gray-500" /> notifications
                      </div>
                      <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 text-[10px] font-semibold tracking-wide text-moux-cyan hover:text-white transition-colors"
                      >
                        <CheckCheck className="w-4 h-4" /> Clear All
                      </button>
                    </div>
                  )}
                  {activeTab === "discovery" && (
                    <>
                      <Search className="w-5 h-5 text-gray-500" /> discovery
                    </>
                  )}
                  {activeTab === "settings" && (
                    <>
                      <Settings className="w-5 h-5 text-gray-500" /> settings
                    </>
                  )}
                  {activeTab === "shop" && (
                    <>
                      <ShoppingBag className="w-5 h-5 text-gray-500" />{" "}
                      marketplace
                    </>
                  )}
                </h2>
                <div className="h-6 w-[1px] bg-white/5" />
                <BalanceTicker value={currentUser.mouxBalance || 0} />
              </div>
              <div className="flex items-center gap-4">
                {currentUser.isAdmin && (
                  <button
                    onClick={() => {
                      setShowAdmin(true);
                      fetchUsersForAdmin();
                    }}
                    className="py-1.5 px-3 text-[10px] font-semibold tracking-wide flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-all"
                  >
                    <ShieldAlert className="w-4 h-4" /> Command
                  </button>
                )}
                <button 
                  onClick={() => setIsRightDrawerOpen(true)}
                  className="w-8 h-8 rounded-full overflow-hidden border border-white/20 cursor-pointer ml-2"
                >
                  <UserAvatar uid={currentUser?.uid || ""} size="w-full h-full" className="rounded-full" />
                </button>
              </div>
            </header>

            {/* Content Tabs */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {activeTab === "servers" && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {!activeCommunityServer ? (
                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                      <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <h2
                              className={cn(
                                "text-2xl font-bold tracking-tight",
                                textMain,
                              )}
                            >
                              Explore World
                            </h2>
                            <p
                              className={cn(
                                "text-xs font-mono tracking-wide",
                                textMuted,
                              )}
                            >
                              Discover Community Servers
                            </p>
                          </div>
                          <button
                            onClick={() => setModalMode("create_server")}
                            className="btn-primary py-2 px-4 text-[10px] font-semibold tracking-wide flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" /> Start Community
                          </button>
                        </div>

                        {communityServers.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40 grayscale">
                            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center border border-dashed border-white/20 mb-6">
                              <Server className="w-10 h-10" />
                            </div>
                            <p className="font-mono text-sm tracking-wide">
                              No active servers detected.
                            </p>
                            <p className="text-[10px] mt-2">
                              Create the first server.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {communityServers
                              .filter(
                                (s) =>
                                  s.isPublic || s.ownerId === currentUser.uid,
                              )
                              .map((server) => (
                                <button
                                  key={server.id}
                                  onClick={() => {
                                    setActiveCommunityServer(server);
                                    setActiveWorldRoom(server.id);
                                  }}
                                  className={cn(
                                    "p-5 rounded-3xl border text-left transition-all group overflow-hidden relative",
                                    cardMain,
                                    borderMain,
                                    "hover:border-moux-cyan/30 hover:shadow-[0_0_20px_rgba(0,255,255,0.05)]",
                                  )}
                                >
                                  <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-moux-cyan/10 flex items-center justify-center border border-moux-cyan/20 group-hover:scale-110 transition-transform">
                                      {server.iconURL ? (
                                        <img
                                          src={server.iconURL || undefined}
                                          alt=""
                                          className="w-full h-full object-cover rounded-2xl"
                                        />
                                      ) : (
                                        <Server className="w-6 h-6 text-moux-cyan" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4
                                        className={cn(
                                          "font-bold tracking-tight truncate",
                                          textMain,
                                        )}
                                      >
                                        {server.name}
                                      </h4>
                                      <p className="text-[10px] text-gray-500 font-mono flex items-center gap-2 ">
                                        {server.membersCount} Members • BY{" "}
                                        {server.ownerName}
                                      </p>
                                    </div>
                                  </div>
                                  <p
                                    className={cn(
                                      "mt-3 text-xs line-clamp-2 leading-relaxed opacity-60",
                                      textMain,
                                    )}
                                  >
                                    {server.description ||
                                      "No description provided for this server."}
                                  </p>
                                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus className="w-4 h-4 text-moux-cyan" />
                                  </div>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <header
                        className={cn(
                          "p-4 border-b flex items-center justify-between bg-black/20",
                          borderMain,
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setActiveCommunityServer(null);
                              setActiveWorldRoom(null);
                            }}
                            className="p-2 text-gray-500 hover:text-moux-cyan transition-colors"
                          >
                            <MapPin className="w-5 h-5 rotate-180" />
                          </button>
                          <div>
                            <h3
                              className={cn(
                                "font-sans font-bold tracking-tight text-sm text-moux-cyan flex items-center gap-2",
                              )}
                            >
                              {activeCommunityServer.name}
                              {!activeCommunityServer.isPublic && (
                                <Lock className="w-3 h-3 text-gray-600" />
                              )}
                            </h3>
                            <p className="text-[8px] text-gray-500 font-mono tracking-widest ">
                              Public Channel
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setShowServerDebate(!showServerDebate)} className={cn("p-2 transition-colors", showServerDebate ? "text-moux-cyan" : "text-gray-500 hover:text-white")}>
                            <Scale className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setShowMemberHistory(!showMemberHistory)} 
                            className={cn("p-2 transition-colors relative", showMemberHistory ? "text-moux-cyan" : "text-gray-500 hover:text-white")}
                            title="Member History & Logs"
                          >
                            <Users className="w-5 h-5" />
                            {serverHistory.length > 0 && (
                              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-moux-cyan rounded-full border border-black animate-pulse" />
                            )}
                          </button>
                          {currentUser.uid === activeCommunityServer.ownerId && (
                            <button 
                              onClick={() => {
                                if (activeCommunityServer) {
                                  setServerSettingsName(activeCommunityServer.name || "");
                                  setServerSettingsIsPublic(activeCommunityServer.isPublic !== false);
                                  setServerSettingsRequireVerification(activeCommunityServer.requireVerification || false);
                                }
                                setShowServerSettings(true);
                              }} 
                              className="p-2 text-gray-500 hover:text-white"
                            >
                              <Settings className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </header>
                      
                      {showServerDebate ? (
                          <div className="flex-1 overflow-hidden">
                              <ServerDebateMode 
                                currentUser={currentUser} 
                                isLight={isLight} 
                                onClose={() => setShowServerDebate(false)} 
                              />
                          </div>
                      ) : (
                        <div className="flex-1 flex overflow-hidden">
                          {/* District / Channel Navigation Sidebar */}
                          <div className={cn("w-56 shrink-0 border-r flex flex-col bg-black/30", borderMain)}>
                            <div className="p-3.5 border-b border-white/5 flex items-center justify-between">
                              <span className="text-[10px] font-mono tracking-widest text-moux-cyan uppercase font-bold flex items-center gap-1.5">
                                <Radio className="w-3.5 h-3.5 text-moux-cyan animate-pulse" /> Channels
                              </span>
                              {selectedServerRefreshed && currentUser && currentUser.uid === selectedServerRefreshed.ownerId && (
                                <button
                                  onClick={() => setShowCreateChannelModal(true)}
                                  className="p-1 hover:text-moux-cyan text-gray-500 rounded hover:bg-white/5 transition-all"
                                  title="Create District Channel"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                              {selectedServerRefreshed && (selectedServerRefreshed.district_channels || []).map((chan: DistrictChannel) => {
                                const isActive = activeDistrict?.district_id === chan.district_id;
                                const isLocked = chan.is_private && !isUserAuthorizedForDistrict(chan);
                                return (
                                  <button
                                    key={chan.district_id}
                                    onClick={() => {
                                      setActiveDistrict(chan);
                                      setActiveWorldRoom(`${selectedServerRefreshed.id}_${chan.district_id}`);
                                    }}
                                    className={cn(
                                      "w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between text-xs transition-all relative overflow-hidden group/btn cursor-pointer",
                                      isActive 
                                        ? "bg-moux-cyan/15 text-moux-cyan font-semibold border-l-2 border-moux-cyan shadow-[inset_0_0_10px_rgba(0,255,255,0.05)]" 
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    )}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      {chan.is_private ? (
                                        <Lock className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-moux-cyan" : "text-gray-500")} />
                                      ) : (
                                        <Hash className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-moux-cyan" : "text-gray-500")} />
                                      )}
                                      <span className="truncate font-mono text-[11px] tracking-wide">{chan.channel_name}</span>
                                    </div>

                                    {chan.is_private && (
                                      <span className={cn(
                                        "text-[8px] px-1 py-0.5 rounded border uppercase font-mono scale-[0.85] transform origin-right shrink-0",
                                        isLocked 
                                          ? "bg-red-500/10 text-red-500 border-red-500/20" 
                                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                      )}>
                                        {isLocked ? "Vault" : "Secure"}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Left Column: Chat messages and Input (or Join Server banner) */}
                          <div className="flex-1 flex flex-col overflow-hidden relative">
                            {!isUserAuthorizedForDistrict(activeDistrict) ? (
                              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto gap-4 z-10 select-none">
                                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.15)] text-red-400">
                                  <Lock className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[9px] font-mono tracking-widest text-red-500 font-bold uppercase">
                                    QUANTUM SECURE TRANSMISSION RESTRICTED
                                  </span>
                                  <h3 className={cn("text-sm font-bold font-sans tracking-tight", textMain)}>
                                    District Vault Encryption Active
                                  </h3>
                                  <p className={cn("text-[11px] leading-relaxed", textMuted)}>
                                    This sub-channel ({activeDistrict?.channel_name}) requires verified clearances or specific community roles to decrypt.
                                  </p>
                                </div>

                                <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 w-full flex flex-col items-center gap-1.5">
                                  <span className="text-[9px] font-mono tracking-wider text-gray-400 uppercase">
                                    REQUIRED SECURITY CREDENTIALS
                                  </span>
                                  <div className="flex flex-wrap gap-1.5 justify-center">
                                    {(activeDistrict?.allowed_roles || []).map((role) => (
                                      <span key={role} className="text-[9px] px-2 py-0.5 rounded-full font-semibold bg-moux-cyan/10 text-moux-cyan border border-moux-cyan/20 uppercase font-mono">
                                        {role}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <button
                                  onClick={() => setIsSelarModalOpen(true)}
                                  className="w-full bg-gradient-to-r from-moux-cyan to-blue-600 text-black py-2.5 rounded-xl font-bold font-mono text-[10px] tracking-wider shadow-lg hover:shadow-cyan-500/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <Zap className="w-3.5 h-3.5 fill-current text-black animate-pulse" /> Decrypt with Premium Clearance
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                  {chatMessages.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
                                      <MessageSquare className="w-16 h-16 mb-4" />
                                      <p
                                        className={cn(
                                          "font-mono text-xs tracking-wide",
                                          textMain,
                                        )}
                                      >
                                        Server chatter incoming...
                                      </p>
                                    </div>
                                  )}
                                  {filteredChat.map((msg) => (
                                    <div key={msg.id} className="flex flex-col group animate-fade-in duration-300">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                          <span
                                            onClick={() => openProfileView(msg.authorId)}
                                            className="text-xs font-semibold text-moux-cyan tracking-tighter cursor-pointer hover:underline"
                                          >
                                            {msg.authorName}
                                          </span>
                                          <VerifiedBadge
                                            className="w-3"
                                            uid={msg.authorId}
                                            name={msg.authorName}
                                          />
                                          <span
                                            className={cn(
                                              "text-xs text-gray-500",
                                              textMuted,
                                            )}
                                          >
                                            {formatTime(msg.createdAt)}
                                          </span>
                                          {currentUser.uid !== msg.authorId && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                              <button
                                                onClick={() =>
                                                  handleMuteUserAction(
                                                    msg.authorId,
                                                    msg.authorName,
                                                  )
                                                }
                                                className="p-1 text-gray-600 hover:text-yellow-500 transition-colors"
                                                title="Mute"
                                              >
                                                <VolumeX className="w-3 h-3" />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  handleBlockUserAction(
                                                    msg.authorId,
                                                    msg.authorName,
                                                  )
                                                }
                                                className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                                title="Block"
                                              >
                                                <UserX className="w-3 h-3" />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  handleReport(
                                                    msg.id,
                                                    "chat",
                                                    msg.text,
                                                    msg.authorId,
                                                    "Inappropriate Behavior",
                                                  )
                                                }
                                                className="p-1 text-gray-600 hover:text-red-500 transition-colors"
                                                title="Report"
                                              >
                                                <Flag className="w-3 h-3" />
                                              </button>
                                            </div>
                                          )}
                                          {(currentUser.uid === msg.authorId || (msg.authorId === "MOUXBOT" && currentUser.isAdmin)) && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                              <button
                                                onClick={() => handleDeletePostAction(msg.id, `world_chat_${activeWorldRoom || "global"}`, msg.authorId)}
                                                className="p-1 text-gray-600 hover:text-red-500 transition-colors"
                                                title="Delete Message"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {msg.authorId === "MOUXBOT" ? (
                                        <div className="border border-moux-cyan/40 bg-moux-cyan/5 rounded-[20px] p-4 max-w-2xl shadow-[0_0_15px_rgba(0,255,255,0.05)] mt-1 animate-fade-in select-text">
                                          <div className="flex items-center gap-2 mb-2 select-none">
                                            <div className="w-5 h-5 rounded-full bg-moux-cyan/15 flex items-center justify-center animate-pulse">
                                              <BrainCircuit className="w-3.5 h-3.5 text-moux-cyan" />
                                            </div>
                                            <span className="text-[10px] font-mono tracking-widest text-moux-cyan uppercase font-bold">
                                              MouxBot Compliant Response
                                            </span>
                                          </div>
                                          <p className={cn("text-xs leading-relaxed whitespace-pre-wrap font-sans leading-6 selection:bg-moux-cyan/20", textMain)}>
                                            {msg.text}
                                          </p>
                                        </div>
                                      ) : (
                                        <p
                                          className={cn(
                                            "leading-relaxed max-w-2xl p-3 rounded-tr-xl rounded-br-xl rounded-bl-sm border-l-2 border-moux-cyan/30 text-sm shadow-xl select-text selection:bg-moux-cyan/20",
                                            cardMain,
                                            textMain,
                                          )}
                                        >
                                          {renderContent(msg.text)}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                  <div ref={chatEndRef} />
                                </div>

                                {/* Chat Message Input or Join Server Banner */}
                                {isServerMember ? (
                                  <form
                                    onSubmit={handleSendMessage}
                                    className={cn("p-4 border-t", borderMain)}
                                  >
                                    <div className="relative group max-w-4xl mx-auto w-full">
                                      <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder={`Message ${activeDistrict?.channel_name || activeCommunityServer.name}... (Type /roll d20, Tag "MouxBot")`}
                                        className={cn(
                                          "w-full border rounded-xl px-5 py-4 focus:outline-none focus:border-moux-cyan/50 transition-all font-medium",
                                          inputMain,
                                        )}
                                      />
                                      <button
                                        type="submit"
                                        disabled={!chatInput.trim()}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-3 text-moux-cyan hover:bg-moux-cyan/10 rounded-lg transition-colors border border-transparent hover:border-moux-cyan/20"
                                      >
                                        <Send className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <div className={cn("p-6 border-t flex flex-col items-center text-center gap-3 bg-[#090909]/45 backdrop-blur-sm z-10", borderMain)}>
                                    <div className="max-w-md">
                                      <p className={cn("text-xs font-semibold tracking-wide mb-1", textMain)}>
                                        🌐 Preview Mode Active
                                      </p>
                                      <p className={cn("text-[10px] leading-relaxed", textMuted)}>
                                        Join this community server to participate in server chatter, access live discussions, and view server activity history.
                                      </p>
                                    </div>
                                    <button
                                      onClick={handleJoinServer}
                                      className="py-2.5 px-6 bg-moux-cyan text-black text-[11px] font-bold font-mono tracking-wider rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg hover:shadow-moux-cyan/25 cursor-pointer flex items-center gap-2"
                                    >
                                      <UserPlus className="w-4 h-4 text-black animate-bounce" /> Enlist to Server
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {/* Right Column: Collapsible Member & Activity Logs Sidebar */}
                          <AnimatePresence>
                            {showMemberHistory && (
                              <motion.div
                                initial={{ x: "100%", opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: "100%", opacity: 0 }}
                                transition={{ type: "spring", damping: 26, stiffness: 220 }}
                                className={cn(
                                  "w-80 border-l flex flex-col overflow-hidden h-full shrink-0 relative z-20",
                                  borderMain,
                                  isLight ? "bg-white" : "bg-discord-dark"
                                )}
                              >
                                {/* Sidebar Header */}
                                <div className={cn("p-4 border-b flex items-center justify-between", borderMain)}>
                                  <span className={cn("text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-1.5", textMain)}>
                                    <Users className="w-4 h-4 text-moux-cyan" /> Member Hub
                                  </span>
                                  <button
                                    onClick={() => setShowMemberHistory(false)}
                                    className="p-1 text-gray-500 hover:text-white rounded transition-colors cursor-pointer"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Sidebar Scrollable Content */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                                  {/* Current Member Action card */}
                                  {isServerMember && (
                                    <div className={cn("p-3.5 rounded-2xl border flex flex-col gap-2.5", cardMain, borderMain)}>
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full border border-moux-cyan/30 overflow-hidden shrink-0">
                                          <UserAvatar uid={currentUser?.uid || ""} size="w-full h-full" className="rounded-full" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className={cn("text-[11px] font-bold truncate", textMain)}>
                                            @{currentUser?.username || "me"}
                                          </p>
                                          <p className="text-[9px] text-green-500 font-mono">Verified Member</p>
                                        </div>
                                      </div>
                                      {currentUser?.uid !== activeCommunityServer.ownerId ? (
                                        <button
                                          onClick={handleLeaveServer}
                                          className="w-full py-1.5 border border-red-500/20 text-red-500 text-[10px] font-bold font-mono rounded-lg hover:bg-red-500/10 active:scale-[0.98] transition-all cursor-pointer text-center"
                                        >
                                          Leave Server
                                        </button>
                                      ) : (
                                        <span className="text-[9px] text-yellow-500/80 font-mono text-center">
                                          👑 Server Creator
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Member History Log Section */}
                                  <div className="space-y-3">
                                    <h4 className={cn("text-[10px] uppercase font-mono tracking-widest font-semibold pb-1.5 border-b", isLight ? "border-gray-200 text-gray-600" : "border-white/5 text-gray-400")}>
                                      📜 Member History Logs
                                    </h4>
                                    
                                    {serverHistory.length === 0 ? (
                                      <div className="py-6 text-center text-gray-500 opacity-60">
                                        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                                        <p className="text-[10px] font-mono leading-relaxed">
                                          No recent join/leave events registered in the void logs.
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                        {serverHistory.map((log) => {
                                          const logTime = log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "";
                                          const isJoin = log.type === "join";
                                          return (
                                            <div 
                                              key={log.id} 
                                              className={cn(
                                                "p-2.5 rounded-xl border flex flex-col gap-1 transition-all hover:bg-white/5",
                                                isLight ? "bg-gray-50 border-gray-100" : "bg-black/35 border-white/5"
                                              )}
                                            >
                                              <div className="flex items-center justify-between">
                                                <span 
                                                  onClick={() => log.userId && openProfileView(log.userId)} 
                                                  className="text-[10px] font-bold text-moux-cyan hover:underline cursor-pointer truncate max-w-[120px]"
                                                >
                                                  @{log.username || "wanderer"}
                                                </span>
                                                <span className={cn(
                                                  "text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                                  isJoin 
                                                    ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                                )}>
                                                  {isJoin ? "Join" : "Leave"}
                                                </span>
                                              </div>
                                              <div className="flex items-end justify-between gap-1">
                                                <p className="text-[9px] text-gray-500 leading-normal truncate max-w-[160px]">
                                                  {log.displayName || "Wanderer"} {isJoin ? "enlisted to the guild." : "returned to the VOID."}
                                                </p>
                                                <span className="text-[8px] text-gray-600 font-mono shrink-0">
                                                  {logTime}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>

                                  {/* Active Server Members List Section */}
                                  <div className="space-y-3">
                                    <h4 className={cn("text-[10px] uppercase font-mono tracking-widest font-semibold pb-1.5 border-b", isLight ? "border-gray-200 text-gray-600" : "border-white/5 text-gray-400")}>
                                      👥 Active Guild Members ({serverMembers.length})
                                    </h4>
                                    
                                    {serverMembers.length === 0 ? (
                                      <div className="py-4 text-center text-gray-500 text-[10px] font-mono">
                                        Waiting for signatures...
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        {serverMembers.map((member) => (
                                          <div 
                                            key={member.id} 
                                            onClick={() => member.userId && openProfileView(member.userId)}
                                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer group"
                                          >
                                            <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0">
                                              {member.photoURL ? (
                                                <img 
                                                  src={member.photoURL} 
                                                  alt="" 
                                                  className="w-full h-full object-cover" 
                                                  referrerPolicy="no-referrer"
                                                />
                                              ) : (
                                                <div className="w-full h-full bg-moux-cyan/15 flex items-center justify-center text-[10px] text-moux-cyan uppercase font-bold font-mono">
                                                  {(member.username || "?").charAt(0)}
                                                </div>
                                              )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <p className={cn("text-[10px] font-medium group-hover:text-moux-cyan transition-colors truncate", textMain)}>
                                                @{member.username || "wanderer"}
                                              </p>
                                              <p className="text-[8px] text-gray-500 font-mono truncate">
                                                {member.displayName || "Wanderer"}
                                              </p>
                                            </div>
                                            {member.userId === activeCommunityServer.ownerId && (
                                              <span className="text-[8px] text-yellow-500 font-mono shrink-0 select-none">👑 Creator</span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "feed" && (
                <div 
                  ref={feedScrollContainerRef}
                  onTouchStart={handleFeedTouchStart}
                  onTouchMove={handleFeedTouchMove}
                  onTouchEnd={handleFeedTouchEnd}
                  onMouseDown={handleFeedMouseDown}
                  onMouseMove={handleFeedMouseMove}
                  onMouseUp={handleFeedMouseUpOrLeave}
                  onMouseLeave={handleFeedMouseUpOrLeave}
                  className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 relative select-none"
                  style={{
                    touchAction: feedPullOffset > 0 ? "none" : "auto"
                  }}
                >
                  {/* Pull to Refresh Spinning Loop Asset */}
                  <motion.div 
                    className="absolute left-0 right-0 flex items-center justify-center pointer-events-none"
                    animate={{
                      y: feedPullOffset,
                      opacity: feedPullOffset > 10 ? Math.min(1, (feedPullOffset - 10) / 40) : 0,
                      scale: feedPullOffset > 10 ? Math.min(1.15, 0.5 + (feedPullOffset / 50) * 0.65) : 0.5
                    }}
                    transition={animationsEnabled ? {
                      type: "spring",
                      stiffness: 240,
                      damping: 18,
                      mass: 0.6
                    } : { duration: 0 }}
                    style={{
                      top: "-42px",
                      zIndex: 9999
                    }}
                  >
                    <div className="bg-[#090909]/95 border border-white/10 rounded-full p-2 w-10 h-10 flex items-center justify-center shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
                      <Loader2 
                        className={cn(
                          "w-5 h-5 text-moux-cyan",
                          (isFeedRefreshing || feedPullOffset > 45) ? "animate-spin" : ""
                        )}
                        style={{
                          transform: !(isFeedRefreshing || feedPullOffset > 45) ? `rotate(${feedPullOffset * 5}deg)` : undefined
                        }}
                      />
                    </div>
                  </motion.div>

                  <motion.div 
                    animate={{
                      y: feedPullOffset
                    }}
                    transition={animationsEnabled ? {
                      type: "spring",
                      stiffness: 240,
                      damping: 18,
                      mass: 0.6
                    } : { duration: 0 }}
                  >
                    <div className="max-w-2xl mx-auto w-full">
                    <FeedComposer
                        currentUser={currentUser}
                        isLight={isLight}
                        externalMedia={feedMediaState}
                        onClearExternalMedia={() => setFeedMediaState(null)}
                        onOpenMediaPicker={() => setMediaPickerConfig({ isOpen: true, mode: 'feed' })}
                        onPost={async (text, media, audienceLocal, isMatureLocal) => {
                          const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = 4000): Promise<T> => {
                            return new Promise<T>((resolve, reject) => {
                              const timer = setTimeout(() => reject(new Error("Timeout")), timeoutMs);
                              promise.then(
                                (res) => { clearTimeout(timer); resolve(res); },
                                (err) => { clearTimeout(timer); reject(err); }
                              );
                            });
                          };

                          const blobToBase64 = (blob: Blob): Promise<string> => {
                            return new Promise((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onloadend = () => resolve(reader.result as string);
                              reader.onerror = reject;
                              reader.readAsDataURL(blob);
                            });
                          };
                          let mediaUrl = undefined;
                          let postMediaType: 'image' | 'video' | undefined = undefined;

                          if (media) {
                            if (media.url && media.url.startsWith("data:")) {
                              // If it's a base64 string from cropper or gif sheet, upload it as a blob
                              try {
                                const { uploadFeedMedia } = await import("./firebase");
                                const res = await fetch(media.url);
                                const fileToUpload = await res.blob();
                                // attach name
                                (fileToUpload as any).name = `upload.${fileToUpload.type === "image/gif" ? "gif" : "jpg"}`;
                                try {
                                  mediaUrl = await withTimeout(uploadFeedMedia(currentUser.uid, fileToUpload), 4000);
                                } catch (uploadErr) {
                                  console.warn("Blob upload failed or timed out, performing fallback:", uploadErr);
                                  mediaUrl = media.url;
                                }
                                postMediaType = media.type || 'image';
                              } catch (err) {
                                showToast("Failed to upload media.", "error");
                                return;
                              }
                            } else if (media.file) {
                              try {
                                const { uploadFeedMedia } = await import("./firebase");
                                let fileToUpload: File | Blob = media.file;
                                if (media.type === 'image' && media.file.type !== "image/gif") {
                                  // Compress it client-side to enforce max limits and speed up upload
                                  const { compressImage } = await import("./lib/imageUtils");
                                  const base64 = await compressImage(media.file, 1600, 0.85);
                                  const res = await fetch(base64);
                                  fileToUpload = await res.blob();
                                  (fileToUpload as any).name = "compressed.jpg";
                                }
                                try {
                                  mediaUrl = await withTimeout(uploadFeedMedia(currentUser.uid, fileToUpload), 4000);
                                } catch (uploadErr) {
                                  console.warn("Media file upload failed or timed out, performing fallback conversion:", uploadErr);
                                  try {
                                    mediaUrl = await blobToBase64(fileToUpload);
                                  } catch (fallbackErr) {
                                    console.error("Fallback base64 conversion failed too:", fallbackErr);
                                    showToast("Failed to upload media.", "error");
                                    return;
                                  }
                                }
                                postMediaType = media.type;
                              } catch (err) {
                                showToast("Failed to upload media.", "error");
                                return;
                              }
                            } else {
                              mediaUrl = media.url;
                              postMediaType = media.type;
                            }
                          }
                          await postToFeed(
                            text,
                            currentUser,
                            isMatureLocal,
                            mediaUrl,
                            undefined,
                            postMediaType
                          );
                          setFeedMediaState(null);
                          setMediaPickerConfig(prev => ({ ...prev, isOpen: false }));
                        }}
                      />
                      
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 px-1">
                      <h3
                        className={cn(
                          "text-xl font-sans font-semibold  tracking-tighter",
                          textMain,
                        )}
                      >
                        World Feed
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Sort Toggle */}
                        <div className="flex gap-1 p-1 bg-black border border-gray-200 dark:border-gray-800 rounded-lg">
                          <button
                            onClick={() => setFeedSortMethod("latest")}
                            className={cn(
                              "px-2.5 py-1 text-[10.5px] font-semibold tracking-wide transition-all flex items-center gap-1.5 rounded-md",
                              feedSortMethod === "latest"
                                ? "bg-white text-black font-bold shadow-sm"
                                : "text-gray-400 hover:text-white",
                            )}
                          >
                            <History className="w-3 h-3" />
                            Latest
                          </button>
                          <button
                            onClick={() => setFeedSortMethod("likes")}
                            className={cn(
                              "px-2.5 py-1 text-[10.5px] font-semibold tracking-wide transition-all flex items-center gap-1.5 rounded-md",
                              feedSortMethod === "likes"
                                ? "bg-white text-black font-bold shadow-sm"
                                : "text-gray-400 hover:text-white",
                            )}
                          >
                            <Flame className="w-3 h-3 text-red-500" />
                            Top Liked
                          </button>
                          <button
                            onClick={() => setFeedSortMethod("views")}
                            className={cn(
                              "px-2.5 py-1 text-[10.5px] font-semibold tracking-wide transition-all flex items-center gap-1.5 rounded-md",
                              feedSortMethod === "views"
                                ? "bg-white text-black font-bold shadow-sm"
                                : "text-gray-400 hover:text-white",
                            )}
                          >
                            <Eye className="w-3 h-3 text-cyan-500" />
                            Top Viewed
                          </button>
                        </div>

                        {/* Audience Filter Toggle */}
                        <div className="flex gap-1 p-1 bg-black border border-gray-200 dark:border-gray-800 rounded-lg">
                          <button
                            onClick={() => {
                              setUseFollowingFeed(false);
                              setFeedSearch("");
                            }}
                            className={cn(
                              "px-2.5 py-1 text-[10.5px] font-semibold tracking-wide transition-all rounded-md",
                              !useFollowingFeed
                                ? "bg-white text-black font-bold shadow-sm"
                                : "text-gray-400 hover:text-white",
                            )}
                          >
                            Global
                          </button>
                          <button
                            onClick={() => {
                              setUseFollowingFeed(true);
                              setFeedSearch("");
                            }}
                            className={cn(
                              "px-2.5 py-1 text-[10.5px] font-semibold tracking-wide transition-all rounded-md",
                              useFollowingFeed
                                ? "bg-white text-black font-bold shadow-sm"
                                : "text-gray-400 hover:text-white",
                            )}
                          >
                            Following
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6 relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="h-4 w-4 text-gray-500 group-focus-within:text-moux-cyan transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="FILTER POSTS (@USER OR #TOPIC)..."
                        value={feedSearch}
                        onChange={(e) => setFeedSearch(e.target.value)}
                        className={cn(
                          "w-full pl-10 pr-4 py-2 bg-black/20 border border-white/5 rounded-xl text-xs text-gray-500 tracking-widest placeholder:text-gray-700 focus:outline-none focus:border-moux-cyan/30 transition-all ",
                          textMain,
                        )}
                      />
                      {feedSearch && (
                        <button
                          onClick={() => setFeedSearch("")}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-6">
                      {sortedFilteredFeed.length === 0 ? (
                        <div className="text-center py-12 bg-black border border-dashed border-[#222222] rounded-2xl">
                          <Users className="w-12 h-12 text-gray-700 mx-auto mb-4 opacity-20" />
                          <p className="text-gray-500 font-mono text-sm tracking-wide ">
                            No notifications detected in this sector.
                          </p>
                        </div>
                      ) : (
                        sortedFilteredFeed.map((update) => {
                          const isMouxBot = update.authorId === "MOUXBOT";
                          return (
                            <div
                              key={update.id}
                              className="relative pb-8 mb-8 border-b border-white/5 last:border-b-0 last:pb-0 last:mb-0 group bg-transparent transition-all"
                            >
                              <PostViewTracker postId={update.id} currentViews={update.views || 0} onIncrement={handlePostViewIncrement} />
                              
                              {/* Floating Quick-Reaction Panel */}
                              {!isMouxBot && (
                                <div 
                                  id={`quick-react-panel-${update.id}`}
                                  className="absolute right-10 top-2 z-40 hidden sm:flex items-center gap-0.5 p-1 bg-[#090909]/95 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 transform translate-y-1 group-hover:translate-y-0"
                                >
                                  {REACTION_EMOJIS.map((emoji) => {
                                    const reactions = update.reactions || {};
                                    const uids = reactions[emoji] || [];
                                    const isReacted = currentUser && uids.includes(currentUser.uid);
                                    return (
                                      <button
                                        key={emoji}
                                        id={`quick-react-btn-${update.id}-${emoji}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleReactionAction(update.id, emoji);
                                        }}
                                        className={cn(
                                          "w-7 h-7 flex items-center justify-center rounded-lg text-sm hover:bg-white/10 hover:scale-125 active:scale-90 transition-all duration-150 cursor-pointer",
                                          isReacted && "bg-moux-cyan/15 text-moux-cyan border border-moux-cyan/30"
                                        )}
                                        title={`React with ${emoji}`}
                                      >
                                        {emoji}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Seamless/Fluid Profile Row */}
                              <div className="flex items-center justify-between mb-3 bg-transparent py-1">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0",
                                      !isMouxBot &&
                                        "cursor-pointer hover:border-moux-cyan transition-colors",
                                    )}
                                    onClick={() =>
                                      !isMouxBot &&
                                      openProfileView(update.authorId)
                                    }
                                  >
                                    <UserAvatar 
                                      uid={update.authorId}
                                      isMouxBot={isMouxBot}
                                      isBannedAuthor={(update as any).isBannedAuthor}
                                      className="rounded-full"
                                    />
                                  </div>
                                  <div>
                                    <div
                                      className={cn(
                                        "flex items-center gap-1",
                                        !isMouxBot &&
                                          "cursor-pointer group/name hover:text-moux-cyan transition-colors",
                                      )}
                                      onClick={() =>
                                        !isMouxBot &&
                                        openProfileView(update.authorId)
                                      }
                                    >
                                      <p
                                        className={cn(
                                          "font-extrabold text-xs tracking-wide leading-none",
                                          textMain,
                                          (update as any).isBannedAuthor && "text-gray-500"
                                        )}
                                      >
                                        {(update as any).isBannedAuthor ? "User Not Found" : update.authorName}
                                      </p>
                                      {isMouxBot ? (
                                        <span className="bg-red-500 text-white text-[8px] font-semibold px-1.5 py-0.5 rounded tracking-wide animate-pulse ml-1">
                                          SYSTEM_CORE
                                        </span>
                                      ) : (
                                        <VerifiedBadge
                                          className="w-3 h-3"
                                          uid={update.authorId}
                                          name={update.authorName}
                                          isVerified={
                                            (update as any).authorIsVerified
                                          }
                                          badges={(update as any).authorBadges}
                                        />
                                      )}
                                    </div>
                                    <p className="text-[9px] text-gray-500 font-mono mt-1">
                                      {isMouxBot
                                        ? "OFFICIAL UPDATE"
                                        : formatDate(update.createdAt)}
                                      {update.isEdited && (
                                        <span className="ml-2 text-moux-cyan opacity-40">
                                          (EDITED)
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>

                                {/* Clean Menu Controls */}
                                <div className="flex items-center gap-2">
                                  {update.isMature && (
                                    <span className="bg-red-500/10 text-red-500 text-[9px] font-semibold px-1.5 py-0.5 rounded border border-red-500/20 tracking-tighter">
                                      Mature
                                    </span>
                                  )}
                                  
                                  <div className="relative">
                                    <button
                                      onClick={() => setPostMenuOpenId(postMenuOpenId === update.id ? null : update.id)}
                                      className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all outline-none"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </button>

                                    {postMenuOpenId === update.id && (
                                      <>
                                        {/* Dropdown Backdrop helper */}
                                        <div className="fixed inset-0 z-40" onClick={() => setPostMenuOpenId(null)} />
                                        <div className="absolute right-0 mt-1 w-48 bg-[#090909] border border-white/10 rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-50 overflow-hidden font-mono outline-none text-left">
                                          <div className="py-1 text-[10px] uppercase font-bold tracking-wider">
                                            <button onClick={() => { setPostMenuOpenId(null); navigator.clipboard.writeText(update.id); showToast("Post ID sequence copied to clipboard.", "success"); }} className="w-full text-left px-4 py-2.5 text-[10px] text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 font-mono uppercase"><Copy className="w-3.5 h-3.5 text-blue-400 font-bold" /> Copy Link</button>
                                            {((currentUser && currentUser.uid === update.authorId) || (isMouxBot && currentUser?.isAdmin)) && (
                                              <>
                                                <button
                                                  onClick={() => {
                                                    setPostMenuOpenId(null);
                                                    handleEditPostAction(
                                                      update.id,
                                                      "world_feed",
                                                      update.content,
                                                      update.authorId,
                                                    );
                                                  }}
                                                  className="w-full text-left px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                                                >
                                                  <Edit2 className="w-3.5 h-3.5 text-moux-cyan" /> Edit Post
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    setPostMenuOpenId(null);
                                                    handleDeletePostAction(
                                                      update.id,
                                                      "world_feed",
                                                      update.authorId,
                                                    );
                                                  }}
                                                  className="w-full text-left px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-white/5 transition-all flex items-center gap-2"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" /> Delete Post
                                                </button>
                                              </>
                                            )}

                                            {!isMouxBot && currentUser?.uid !== update.authorId && (
                                              <>
                                                <button
                                                  onClick={() => {
                                                    setPostMenuOpenId(null);
                                                    handleMuteUserAction(
                                                      update.authorId,
                                                      update.authorName,
                                                    );
                                                  }}
                                                  className="w-full text-left px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                                                >
                                                  <VolumeX className="w-3.5 h-3.5 text-yellow-500" /> Mute User
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    setPostMenuOpenId(null);
                                                    handleBlockUserAction(
                                                      update.authorId,
                                                      update.authorName,
                                                    );
                                                  }}
                                                  className="w-full text-left px-4 py-2.5 text-rose-400 hover:text-rose-300 hover:bg-white/5 transition-all flex items-center gap-2"
                                                >
                                                  <UserX className="w-3.5 h-3.5" /> Block Node
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    setPostMenuOpenId(null);
                                                    handleReport(
                                                      update.id,
                                                      "feed",
                                                      update.content,
                                                      update.authorId,
                                                      "Inappropriate Content",
                                                    );
                                                  }}
                                                  className="w-full text-left px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                                                >
                                                  <Flag className="w-3.5 h-3.5" /> Report Content
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <p
                                className={cn(
                                  "leading-relaxed text-sm my-2.5 px-0",
                                  isMouxBot
                                    ? "text-red-200 font-mono"
                                    : "text-gray-300",
                                )}
                              >
                                {renderContent(update.content)}
                              </p>

                              {update.poll && (
                                <div className="mt-6 bg-black/30 border border-white/10 rounded-2xl overflow-hidden">
                                  <div className="p-4 border-b border-white/10 bg-moux-cyan/5">
                                    <h4 className="text-sm font-semibold text-white tracking-tighter flex items-center gap-2">
                                      <PieChart className="w-4 h-4 text-moux-cyan" />
                                      {update.poll.question}
                                    </h4>
                                  </div>
                                  <div className="p-4 space-y-3">
                                    {update.poll.options.map((opt, idx) => {
                                      const totalVotes = update.poll!.options.reduce((acc, current) => acc + current.votes.length, 0);
                                      const percentage = totalVotes > 0 ? (opt.votes.length / totalVotes) * 100 : 0;
                                      const hasVoted = opt.votes.includes(currentUser.uid);
                                      
                                      return (
                                        <button
                                          key={idx}
                                          onClick={() => handleVoteAction(update.id, idx)}
                                          className="w-full text-left group/opt relative h-10 overflow-hidden transition-all bg-white/5 hover:bg-white/10"
                                        >
                                          <div 
                                            className={cn("absolute inset-y-0 left-0 transition-all duration-1000", hasVoted ? "bg-moux-cyan/30" : "bg-white/5")} 
                                            style={{ width: `${percentage}%` }}
                                          />
                                          <div className="relative h-full flex items-center justify-between px-4">
                                            <span className={cn("text-xs font-bold tracking-tight", hasVoted ? "text-moux-cyan" : "text-gray-400")}>
                                              {opt.text}
                                            </span>
                                            <div className="flex items-center gap-2">
                                              {hasVoted && <Check className="w-3 h-3 text-moux-cyan" />}
                                              <span className="text-xs text-gray-500 text-gray-500">
                                                {percentage.toFixed(0)}% ({(opt.votes as string[]).length})
                                              </span>
                                            </div>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                  <div className="px-4 py-2 bg-black border-t border-[#222222]">
                                    <p className="text-[8px] text-gray-600 font-mono  text-right">
                                      {update.poll.options.reduce((acc, current) => acc + current.votes.length, 0)} ENTRIES DETECTED
                                    </p>
                                  </div>
                                </div>
                              )}
                              {(update as any).image && (update as any).mediaType === 'video' ? (
                                <div className="mt-4.5 w-full overflow-hidden bg-black flex justify-center">
                                  <LazyVideo
                                    src={(update as any).image}
                                    className="w-full max-h-[600px] object-contain"
                                    onMediaClick={(mediaUrl) => {
                                      setLightboxMedia(mediaUrl);
                                      setIsLightboxOpen(true);
                                      handlePostViewIncrement(update.id, update.views);
                                    }}
                                  />
                                </div>
                              ) : (update as any).image ? (
                                <div className="mt-4.5 w-full overflow-hidden">
                                  <LazyGifImage
                                    src={(update as any).image}
                                    alt="World Media Module"
                                    className="w-full max-h-[640px] object-cover"
                                    onMediaClick={(mediaUrl) => {
                                      setLightboxMedia(mediaUrl);
                                      setIsLightboxOpen(true);
                                      handlePostViewIncrement(update.id, update.views);
                                    }}
                                  />
                                </div>
                              ) : null}

                              {!isMouxBot && (
                                <div className="mt-6 pt-4 border-t border-[#222222] flex items-center justify-between">
                                  <div className="flex items-center gap-6">
                                    <button
                                      onClick={() =>
                                        handleLikePostAction(update.id)
                                      }
                                      className={cn(
                                        "flex items-center gap-2 group/btn transition-colors",
                                        update.likes?.includes(currentUser.uid)
                                          ? "text-red-500 font-bold"
                                          : "text-gray-500 hover:text-red-400",
                                      )}
                                    >
                                      <motion.div
                                        animate={{
                                          scale: update.likes?.includes(currentUser.uid)
                                            ? [1, 1.45, 1]
                                            : [1, 0.85, 1],
                                        }}
                                        transition={{ duration: 0.35, ease: "easeOut" }}
                                        initial={false}
                                        className="flex items-center justify-center"
                                      >
                                        <Heart
                                          className={cn(
                                            "w-4 h-4 transition-transform group-hover/btn:scale-110",
                                            update.likes?.includes(
                                              currentUser.uid,
                                            ) && "fill-current shadow-[0_0_10px_rgba(239,68,68,0.5)]",
                                          )}
                                        />
                                      </motion.div>
                                      <span className="text-xs font-semibold">
                                        {update.likes?.length || 0}
                                      </span>
                                    </button>
                                    <button
                                      onClick={() =>
                                        setActiveCommentPost(update)
                                      }
                                      className="flex items-center gap-2 group/btn text-gray-500 hover:text-moux-cyan transition-colors"
                                    >
                                      <MessageCircle className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                                      <span className="text-xs font-semibold">
                                        {update.repliesCount || 0}
                                      </span>
                                    </button>
                                    
                                    {/* Views Counter Display */}
                                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold py-1 select-none" title="Total Views logged">
                                      <Eye className="w-4 h-4 text-gray-400" />
                                      <span>{update.views || 0}</span>
                                    </div>

                                    {/* MouxBot Post Intelligence Cursive "m" Action Button */}
                                    {mouxBotGlobalFeedAccess && (
                                      <button
                                        onClick={() => handleMouxBotPostIntelligenceClick(update)}
                                        className="flex items-center gap-1.5 text-gray-550 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
                                        title="MouxBot Post Intelligence"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="18" height="18" fill="none">
                                          <path 
                                            d="M 15 65 
                                               C 20 40, 28 25, 38 25 
                                               C 48 25, 48 48, 48 58 
                                               C 48 40, 56 25, 65 25 
                                               C 75 25, 76 45, 75 58 
                                               C 78 45, 84 42, 90 45" 
                                            stroke="#FFFFFF" 
                                            strokeWidth="6.5" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                        <span className="text-[10px] font-bold tracking-wider opacity-60 font-mono text-gray-400">INTEL</span>
                                      </button>
                                    )}
                                    <div className="relative">
                                      {(() => {
                                        const reactions = update.reactions || {};
                                        const myReaction = Object.entries(reactions).find(([_, uids]) => (uids as string[]).includes(currentUser?.uid || ""))?.[0];
                                        const myReactionCount = myReaction ? (reactions[myReaction] as string[]).length : 0;
                                        
                                        return (
                                          <button
                                            onContextMenu={(e) => {
                                              e.preventDefault();
                                              setShowEmojiPickerFor(showEmojiPickerFor === update.id ? null : update.id);
                                            }}
                                            onClick={() =>
                                              setShowEmojiPickerFor(
                                                showEmojiPickerFor === update.id
                                                  ? null
                                                  : update.id,
                                              )
                                            }
                                            className={cn(
                                              "flex items-center gap-2 group/btn transition-all",
                                              myReaction 
                                                ? "px-2 py-1 bg-white/10 border-gray-200 dark:border-gray-800 text-white"
                                                : "text-gray-500 hover:text-white"
                                            )}
                                          >
                                            {myReaction ? (
                                              <>
                                                <span className="text-sm">{myReaction}</span>
                                                <span className="text-xs font-semibold">{myReactionCount}</span>
                                              </>
                                            ) : (
                                              <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center transition-transform group-hover/btn:scale-110">
                                                <Plus className="w-3.5 h-3.5" />
                                              </div>
                                            )}
                                          </button>
                                        );
                                      })()}

                                      {showEmojiPickerFor === update.id && (
                                        <div className="absolute bottom-full left-0 mb-3 p-2 bg-black border-gray-200 dark:border-gray-800 flex gap-1 z-50 animate-in fade-in slide-in-from-bottom-2 min-w-[200px]">
                                          {isMoreEmojiActive === update.id ? (
                                            <div className="flex items-center gap-2 p-1 w-full animate-in fade-in zoom-in-95">
                                              <input
                                                autoFocus
                                                type="text"
                                                placeholder="Enter emoji..."
                                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-moux-cyan"
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter") {
                                                    const val = e.currentTarget.value.trim();
                                                    if (val) {
                                                      handleToggleReactionAction(update.id, val);
                                                      setShowEmojiPickerFor(null);
                                                      setIsMoreEmojiActive(null);
                                                    }
                                                  } else if (e.key === "Escape") {
                                                    setIsMoreEmojiActive(null);
                                                  }
                                                }}
                                              />
                                              <button
                                                onClick={() => setIsMoreEmojiActive(null)}
                                                className="p-2 text-gray-500 hover:text-white transition-colors"
                                              >
                                                <X className="w-4 h-4" />
                                              </button>
                                            </div>
                                          ) : (
                                            <>
                                              {REACTION_EMOJIS.map((emoji) => (
                                                <button
                                                  key={emoji}
                                                  onClick={() => {
                                                    handleToggleReactionAction(
                                                      update.id,
                                                      emoji,
                                                    );
                                                    setShowEmojiPickerFor(null);
                                                  }}
                                                  className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all text-xl"
                                                >
                                                  <motion.span
                                                    whileTap={{ scale: 1.5 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                  >
                                                    {emoji}
                                                  </motion.span>
                                                </button>
                                              ))}
                                              <button
                                                onClick={() => setIsMoreEmojiActive(update.id)}
                                                className="w-10 h-10 flex flex-col items-center justify-center hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white group"
                                              >
                                                <Smile className="w-5 h-5 transition-transform group-hover:scale-110" />
                                                <span className="text-[7px] font-bold mt-0.5">More</span>
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-[8px] font-semibold text-gray-700 tracking-wide">
                                    Private Message
                                  </div>
                                </div>
                              )}

                              {update.reactions &&
                                Object.keys(update.reactions).length > 0 &&
                                !isMouxBot && (
                                  <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-white/5">
                                    {(Object.entries(update.reactions) as [string, string[]][]).map(
                                      ([emoji, uids]) => (
                                        <button
                                          key={emoji}
                                          onClick={() =>
                                            handleToggleReactionAction(
                                              update.id,
                                              emoji,
                                            )
                                          }
                                          className={cn(
                                            "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all border font-bold",
                                            uids.includes(currentUser.uid)
                                              ? "bg-moux-cyan/10 border-moux-cyan/50 text-moux-cyan"
                                              : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300",
                                          )}
                                        >
                                          <motion.span
                                            whileTap={{ scale: 1.5 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                          >
                                            {emoji}
                                          </motion.span>
                                          <span className="font-mono text-[10px]">{uids.length}</span>
                                        </button>
                                      ),
                                    )}
                                  </div>
                                )}

                              {isMouxBot && (
                                <div className="mt-6 pt-4 border-t border-red-500/10 flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 opacity-20 grayscale cursor-not-allowed">
                                      <Heart className="w-4 h-4" />
                                      <span className="text-[10px] font-semibold">
                                        LOCKED
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-20 grayscale cursor-not-allowed">
                                      <MessageCircle className="w-4 h-4" />
                                      <span className="text-[10px] font-semibold">
                                        LOCKED
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-[8px] font-semibold text-red-500/50  tracking-[0.2em]">
                                    <Cpu className="w-3 h-3" /> System
                                    Official Post
                                  </div>
                                </div>
                              )}

                              {update.isEdited && !isMouxBot && (
                                <div className="mt-2 flex items-center gap-1.5 opacity-30 select-none">
                                  <History className="w-3 h-3 text-moux-cyan" />
                                  <span className="text-[8px] font-bold text-moux-cyan tracking-widest ">
                                    Notification Modified by Author
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {activeTab === "moux_trader" && (
                <TraderBotInterface 
                  currentUser={currentUser} 
                  injectedPrompt={mouxBotInjectedPayload}
                  onInjectedPromptProcessed={() => setMouxBotInjectedPayload(null)}
                  onOpenShop={() => setIsSelarModalOpen(true)}
                />
              )}

              {activeTab === "shop" && (
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                  <div className="max-w-6xl mx-auto">
                    <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div>
                        <h2
                          className={cn(
                            "text-4xl font-bold tracking-tight leading-none mb-2",
                            textMain,
                          )}
                        >
                          Marketplace
                        </h2>
                        <p
                          className={cn(
                            "text-xs font-medium tracking-widest opacity-40",
                            textMain,
                          )}
                        >
                          Marketplace
                        </p>
                      </div>
                      <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-xl overflow-x-auto no-scrollbar">
                        {(
                          [
                            "all",
                            "favorites",
                            "weapons",
                            "ammunition",
                            "passes",
                            "financials",
                            "collectible",
                          ] as const
                        ).map((cat) => {
                          if (cat === "weapons" && currentUser?.isGuest)
                            return null;
                          return (
                            <button
                              key={cat}
                              onClick={() => setMarketCategory(cat)}
                              className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-semibold tracking-wide transition-all whitespace-nowrap",
                                marketCategory === cat
                                  ? "bg-moux-cyan text-black"
                                  : "text-gray-400 hover:text-white",
                              )}
                            >
                              {cat === "all"
                                ? "All Units"
                                : cat.replace("_", " ")}
                            </button>
                          );
                        })}
                      </div>
                    </header>

                    {/* Glowing Premium Payments Portal */}
                    <div className="mb-10 bg-gradient-to-r from-[#0d9488]/20 via-[#0d9488]/5 to-black/40 border border-[#0d9488]/20 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-[#0d9488]/10 rounded-full filter blur-[100px] pointer-events-none" />
                      
                      <div className="space-y-2 max-w-xl z-10">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#0a7a70] text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                            Secure Core Enabled
                          </span>
                          <span className="text-gray-500 font-mono text-[9px]">PCI-DSS COMPLIANT // PORTAL GATEWAY</span>
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                          <CreditCard className="w-6 h-6 text-moux-cyan" /> Premium Clearance & Credits
                        </h3>
                        <p className="text-xs text-gray-400 leading-relaxed font-mono">
                          Need extra levels of clearance credentials or liquid M̶ funds? Access our secure direct checkout integrations instantly on-the-fly and verify promotional / beta codes directly inside the core system application.
                        </p>
                      </div>

                      <div className="flex items-center z-10 shrink-0">
                        <button
                          onClick={() => setIsSelarModalOpen(true)}
                          className="flex items-center justify-center gap-2 px-8 py-4 bg-moux-cyan text-discord-black font-extrabold text-xs tracking-widest uppercase transition-all rounded-2xl hover:brightness-110 active:scale-[0.98]"
                        >
                          <Zap className="w-4 h-4 fill-discord-black animate-bounce" /> Open Premium Shop
                        </button>
                      </div>
                    </div>

                    <div className="relative mb-8">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="SCAN FOR SPECIFIC ASSETS OR IDENTITIES..."
                        value={marketSearch}
                        onChange={(e) => setMarketSearch(e.target.value)}
                        className={cn(
                          "w-full pl-12 pr-4 py-4 border text-[10px] font-semibold tracking-wide focus:outline-none transition-all",
                          inputMain,
                        )}
                      />
                    </div>

                    {/* Weapon Groups - Horizontal Browsing */}
                    {(marketCategory === "all" ||
                      marketCategory === "weapons") &&
                      !marketSearch &&
                      !currentUser?.isGuest && (
                        <div className="space-y-12 mb-12">
                          {[
                            "Pistol",
                            "Shotgun",
                            "Assault Rifle",
                            "Sniper",
                            "Explosive",
                          ].map((subType) => (
                            <div key={subType} className="space-y-4">
                              <h3 className="text-xs font-bold tracking-[0.4em] text-moux-cyan/60 px-4">
                                {subType}s
                              </h3>
                              <div className="flex gap-6 overflow-x-auto pb-6 px-4 no-scrollbar">
                                {MARKET_ITEMS.filter(
                                  (i) =>
                                    i.type === "weapon" &&
                                    i.subType === subType,
                                ).map((item) => (
                                  <div
                                    key={item.id}
                                    onClick={() => setSelectedMarketItem(item)}
                                    className={cn(
                                      "min-w-[320px] p-6 border flex flex-col transition-all group cursor-pointer relative overflow-hidden flex-shrink-0",
                                      cardMain,
                                      borderMain,
                                      "hover:border-moux-cyan/40",
                                    )}
                                  >
                                    {item.image && (
                                      <div className="absolute inset-0 opacity-10 grayscale group-hover:opacity-20 group-hover:grayscale-0 transition-all">
                                        <img
                                          src={item.image || undefined}
                                          alt=""
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <div className="relative z-10">
                                      <div className="w-16 h-16 bg-black border-gray-200 dark:border-gray-800 flex items-center justify-center mb-6">
                                        {React.cloneElement(
                                          item.icon as React.ReactElement,
                                          {
                                            className: "w-8 h-8 text-moux-cyan",
                                          },
                                        )}
                                      </div>
                                      <h3 className="font-bold tracking-tight text-xl mb-1">
                                        {item.name}
                                      </h3>
                                      <p className="text-[10px] text-gray-500 font-semibold mb-4 tracking-wide">
                                        Damage: {item.stats?.Damage}
                                      </p>
                                      <div className="flex items-center justify-between mt-auto">
                                        <span className="text-lg font-semibold text-white tracking-tight">
                                          {formatMoux(item.price)}
                                        </span>
                                        <div className="px-4 py-2 bg-moux-cyan/20 text-moux-cyan font-bold text-[8px] tracking-widest rounded-xl">
                                          Details
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Financial Sectors Grouping */}
                    {(marketCategory === "all" ||
                      marketCategory === "financials") &&
                      !marketSearch && (
                        <div className="space-y-12 mb-12">
                          {[
                            "Crypto",
                            "Stocks",
                            "Government Bonds",
                            "Corporate Bonds",
                          ].map((subType) => (
                            <section
                              key={subType}
                              className="p-8 bg-black border-gray-200 dark:border-gray-800"
                            >
                              <h3 className="text-xs font-bold tracking-[0.4em] text-green-500 mb-6 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> {subType}{" "}
                                Sector
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {MARKET_ITEMS.filter(
                                  (i) =>
                                    i.type === "financials" &&
                                    i.subType === subType,
                                ).map((coin) => {
                                  const vol =
                                    cryptoVolatility[coin.ticker || ""] || 0;
                                  const isUp = vol >= 0;
                                  return (
                                    <div
                                      key={coin.id}
                                      className="p-5 bg-[#121212] border-gray-200 dark:border-gray-800 hover:border-green-500/30 transition-all group cursor-pointer"
                                      onClick={() =>
                                        setSelectedMarketItem(coin)
                                      }
                                    >
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-green-500">
                                          {coin.icon}
                                        </div>
                                        <span
                                          className={cn(
                                            "text-[8px] font-semibold font-mono",
                                            isUp
                                              ? "text-green-500"
                                              : "text-red-500",
                                          )}
                                        >
                                          {isUp ? "+" : ""}
                                          {(vol * 100).toFixed(2)}%
                                        </span>
                                      </div>
                                      <h4 className="text-[11px] font-semibold text-white  mb-0.5">
                                        {coin.name}
                                      </h4>
                                      <p className="text-[9px] font-mono text-gray-500  mb-3">
                                        {coin.ticker}
                                      </p>
                                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-white ">
                                          {formatMoux(coin.price)}
                                        </span>
                                        <button className="text-[7px] font-bold text-green-500">
                                          Buy
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </section>
                          ))}
                        </div>
                      )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                      {MARKET_ITEMS.filter((item) => {
                        if (!marketSearch) {
                          if (
                            marketCategory === "financials" ||
                            marketCategory === "weapons"
                          )
                            return false; // Handled by group views
                        }
                        const matchesSearch = item.name
                          .toLowerCase()
                          .includes(marketSearch.toLowerCase());
                        const matchesCategory =
                          marketCategory === "favorites"
                            ? currentUser?.favoriteMarketItems?.includes(
                                item.id,
                              )
                            : marketCategory === "all" ||
                              item.type === marketCategory;
                        return matchesSearch && matchesCategory;
                      }).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedMarketItem(item)}
                          className={cn(
                            "p-8 rounded-[3rem] border flex flex-col transition-all group cursor-pointer relative overflow-hidden",
                            cardMain,
                            borderMain,
                            "hover:scale-[1.02] hover:border-moux-cyan/40",
                          )}
                        >
                          {item.image && (
                            <div className="absolute inset-0 opacity-10 grayscale group-hover:opacity-20 group-hover:grayscale-0 transition-all">
                              <img
                                src={item.image || undefined}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-8">
                              <div className="w-20 h-20 bg-black border-gray-200 dark:border-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                {React.cloneElement(
                                  item.icon as React.ReactElement,
                                  { className: "w-10 h-10 text-moux-cyan" },
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (currentUser?.uid)
                                    toggleFavoriteMarketItem(
                                      currentUser.uid,
                                      item.id,
                                    );
                                }}
                                className={cn(
                                  "p-3 rounded-full border backdrop-blur-md transition-all",
                                  currentUser?.favoriteMarketItems?.includes(
                                    item.id,
                                  )
                                    ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10",
                                  !currentUser &&
                                    "opacity-50 cursor-not-allowed",
                                )}
                              >
                                <Heart
                                  className={cn(
                                    "w-5 h-5",
                                    currentUser?.favoriteMarketItems?.includes(
                                      item.id,
                                    ) && "fill-current",
                                  )}
                                />
                              </button>
                            </div>
                            <h3
                              className={cn(
                                "font-bold tracking-tight text-2xl mb-2",
                                textMain,
                              )}
                            >
                              {item.name}
                            </h3>
                            <p
                              className={cn(
                                "text-xs leading-relaxed mb-8 flex-1 opacity-50 line-clamp-2",
                                textMain,
                              )}
                            >
                              {item.description}
                            </p>

                            {item.stats && (
                              <div className="flex flex-wrap gap-2 mb-8">
                                {Object.entries(item.stats).map(([k, v]) => (
                                  <div
                                    key={k}
                                    className="p-2 rounded-xl bg-white/5 border border-white/5 min-w-[70px]"
                                  >
                                    <p className="text-[8px] font-bold text-gray-500 mb-0.5">
                                      {k.replace("_", " ")}
                                    </p>
                                    <p className="text-[10px] font-semibold text-white">
                                      {v as string}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-auto pt-8 border-t border-white/10">
                              <span className="text-2xl font-semibold text-white tracking-tight">
                                {formatMoux(item.price)}
                              </span>
                              <div className="px-6 py-3 bg-moux-cyan text-black font-bold text-[10px] tracking-widest rounded-2xl hover:brightness-110 transition-all">
                                Inspect
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {selectedMarketItem && (
                  <MarketDetailModal
                    item={selectedMarketItem}
                    onClose={() => setSelectedMarketItem(null)}
                    volatility={
                      cryptoVolatility[selectedMarketItem.ticker || ""]
                    }
                    isFavorite={currentUser?.favoriteMarketItems?.includes(
                      selectedMarketItem.id,
                    )}
                    onFavorite={() =>
                      currentUser?.uid &&
                      toggleFavoriteMarketItem(
                        currentUser.uid,
                        selectedMarketItem.id,
                      )
                    }
                    onBuy={async (item, quantity) => {
                      try {
                        const finalValue = quantity
                          ? item.price * quantity
                          : item.price;
                        await purchaseAsset(
                          currentUser!.uid,
                          {
                            name: quantity
                              ? `${quantity}x ${item.name}`
                              : item.name,
                            type: item.type,
                            value: finalValue,
                          },
                          finalValue,
                        );
                        setSelectedMarketItem(null);
                        showToast("ASSET ADDED TO INVENTORY.", "success");
                      } catch (e: any) {
                        let msg = e.message;
                        try {
                          const parsed = JSON.parse(msg);
                          if (parsed.error) msg = parsed.error;
                        } catch (err) {}
                        showToast(msg, "error");
                      }
                    }}
                  />
                )}
              </AnimatePresence>

              {activeTab === "profile" && (
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                  <div className="max-w-xl mx-auto w-full">
                    {/* Account Profile Card */}
                    {(() => {
                      const displayProfile = viewingUser || currentUser;
                      if (!displayProfile) return null;
                      const isOwnProfile =
                        !viewingUser || viewingUser.uid === currentUser?.uid;

                      if (displayProfile.isBanned) {
                        return (
                          <div className="profile-card border-white/10 shadow-none flex flex-col items-center justify-center py-20 grayscale">
                            <div className="w-24 h-24 rounded-full bg-white opacity-80 mb-6" />
                            <h2 className="text-2xl font-semibold text-white tracking-wide mb-2">User Not Found</h2>
                            <p className="text-gray-500 text-sm  font-mono tracking-wide">This identity has been removed.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="profile-card border-moux-cyan/30 shadow-[0_0_50px_-12px_rgba(0,255,255,0.2)]">
                          <div className="flex flex-col items-center mb-8">
                            <div
                              className="w-24 h-24 rounded-full flex items-center justify-center border-2 mb-4 relative overflow-hidden group/pass-avatar cursor-default"
                              style={{
                                borderColor:
                                  displayProfile.profileColor || "#00ffff",
                                backgroundColor: `${displayProfile.profileColor}10`,
                              }}
                            >
                              <UserAvatar 
                                uid={displayProfile.uid}
                                size="w-full h-full"
                                isBannedAuthor={displayProfile.isBanned}
                                className="transition-transform group-hover/pass-avatar:scale-110"
                              />
                              <div className="absolute -bottom-1 -right-1 bg-discord-black p-1 rounded-full border border-moux-cyan/30">
                                <ShieldCheck className="w-5 h-5 text-green-500" />
                              </div>
                            </div>

                            <div className="text-center w-full">
                                <div className="flex flex-col items-center">
                                  <div className="flex items-center justify-center gap-2 group flex-wrap">
                                    <h3
                                      className="text-3xl font-sans font-semibold text-white tracking-tighter flex items-center gap-2"
                                      style={{
                                        color:
                                          displayProfile.profileColor ||
                                          "#00ffff",
                                        textShadow: `0 0 20px ${displayProfile.profileColor || "#00ffff"}44`,
                                      }}
                                    >
                                      {displayProfile.displayName}
                                      <VerifiedBadge
                                        className="w-6 h-6"
                                        uid={displayProfile.uid}
                                        name={displayProfile.displayName}
                                        email={displayProfile.email}
                                        isVerified={displayProfile.isVerified}
                                        badges={displayProfile.badges}
                                      />
                                    </h3>
                                    {isOwnProfile ? (
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() =>
                                            setShowAboutAccount(
                                              !showAboutAccount,
                                            )
                                          }
                                          className={cn(
                                            "p-1 transition-colors",
                                            showAboutAccount
                                              ? "text-moux-cyan"
                                              : "text-gray-500",
                                            isLight
                                              ? "hover:text-black"
                                              : "hover:text-white",
                                          )}
                                        >
                                          <Info className="w-5 h-5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() =>
                                            setShowAboutAccount(
                                              !showAboutAccount,
                                            )
                                          }
                                          className={cn(
                                            "p-1 transition-colors",
                                            showAboutAccount
                                              ? "text-moux-cyan"
                                              : "text-gray-500",
                                            isLight
                                              ? "hover:text-black"
                                              : "hover:text-white",
                                          )}
                                        >
                                          <Info className="w-5 h-5" />
                                        </button>
                                        <button
                                          onClick={handleFollow}
                                          className={cn(
                                            "flex items-center gap-2 px-4 py-1 rounded-full text-[10px] font-semibold tracking-wide transition-all",
                                            isFollowingSelectedUser
                                              ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                                              : "bg-moux-cyan/10 text-moux-cyan border border-moux-cyan/20 hover:bg-moux-cyan/20",
                                          )}
                                        >
                                          {isFollowingSelectedUser ? (
                                            <UserX className="w-3 h-3" />
                                          ) : (
                                            <UserPlus className="w-3 h-3" />
                                          )}
                                          {isFollowingSelectedUser
                                            ? "Unfollow"
                                            : "Follow"}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <div className="mt-2 flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-1.5 mt-1 bg-black/40 px-2 py-1 rounded-full border border-white/5">
                                      <span
                                        className={cn(
                                          "w-1.5 h-1.5 rounded-full animate-pulse",
                                          isUserOnline(displayProfile)
                                            ? "bg-green-500"
                                            : "bg-gray-600",
                                        )}
                                      />
                                      <span className="text-[10px] font-bold text-gray-400">
                                        {isUserOnline(displayProfile)
                                          ? "Online"
                                          : (displayProfile.bio || "Offline")}
                                      </span>
                                    </div>
                                  </div>
                                  {displayProfile.bio && (
                                    <div className="mt-6 relative px-8 py-4 bg-white/5 border border-white/5 rounded-2xl  text-gray-300 text-sm max-w-xs leading-relaxed group overflow-hidden text-center">
                                      <div
                                        className="absolute top-0 left-0 w-1 h-full"
                                        style={{
                                          backgroundColor:
                                            displayProfile.profileColor ||
                                            "#00ffff",
                                        }}
                                      />
                                      <Quote className="absolute -top-2 -left-2 w-8 h-8 text-white/5" />
                                      <p className="relative z-10 font-medium">
                                        "{displayProfile.bio}"
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Unified Stats Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                            {isOwnProfile && (
                              <div
                                className={cn(
                                  "p-4 rounded-2xl border flex flex-col items-center justify-center",
                                  cardMain,
                                  borderMain,
                                )}
                              >
                                <p
                                  className={cn(
                                    "text-[8px] font-bold mb-1 tracking-widest",
                                    textMuted,
                                  )}
                                >
                                  Money
                                </p>
                                <span
                                  className={cn(
                                    "text-sm font-semibold tracking-tight",
                                    textMain,
                                  )}
                                >
                                  {formatMoux(displayProfile.mouxBalance || 0)}
                                </span>
                              </div>
                            )}
                            <div
                              className={cn(
                                "p-4 rounded-2xl border flex flex-col items-center justify-center",
                                cardMain,
                                borderMain,
                              )}
                            >
                              <p
                                className={cn(
                                  "text-[8px] font-bold mb-1 tracking-widest",
                                  textMuted,
                                )}
                              >
                                Asset Value
                              </p>
                              <span
                                className={cn(
                                  "text-sm font-semibold tracking-tight text-moux-cyan",
                                )}
                              >
                                {formatMoux(
                                  displayProfile.mouxAssetValue || 0,
                                ).replace("M̶ ", "M")}
                              </span>
                            </div>
                            <div
                              className={cn(
                                "p-4 rounded-2xl border flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors",
                                cardMain,
                                borderMain,
                              )}
                              onClick={async () => {
                                const following = await getFollowing(displayProfile.uid, 50);
                                setFollowGraphState({ isOpen: true, title: "Following", users: following });
                              }}
                            >
                              <p
                                className={cn(
                                  "text-[8px] font-bold mb-1 tracking-widest",
                                  textMuted,
                                )}
                              >
                                Following
                              </p>
                              <span
                                className={cn(
                                  "text-sm font-semibold tracking-tight",
                                  textMain,
                                )}
                              >
                                {displayProfile.followingCount || 0}
                              </span>
                            </div>
                            <div
                              className={cn(
                                "p-4 rounded-2xl border flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors",
                                cardMain,
                                borderMain,
                              )}
                              onClick={async () => {
                                const followers = await getFollowers(displayProfile.uid, 50);
                                setFollowGraphState({ isOpen: true, title: "Followers", users: followers });
                              }}
                            >
                              <p
                                className={cn(
                                  "text-[8px] font-bold mb-1 tracking-widest",
                                  textMuted,
                                )}
                              >
                                Followers
                              </p>
                              <span
                                className={cn(
                                  "text-sm font-semibold tracking-tight",
                                  textMain,
                                )}
                              >
                                {displayProfile.followersCount || 0}
                              </span>
                            </div>

                            {/* Fiery Login Streak Tile */}
                            <div
                              className={cn(
                                "p-4 rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden",
                                cardMain,
                                borderMain,
                              )}
                            >
                              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-transparent pointer-events-none" />
                              <p
                                className={cn(
                                  "text-[8px] font-bold mb-1 tracking-widest text-orange-500 flex items-center gap-1",
                                )}
                              >
                                <Flame className="w-2.5 h-2.5 text-orange-500 animate-pulse fill-orange-500/20" />
                                Streak
                              </p>
                              <span
                                className={cn(
                                  "text-sm font-semibold tracking-tight text-white flex items-center gap-1",
                                )}
                              >
                                {displayProfile.loginStreak || 1} 🔥
                              </span>
                            </div>
                          </div>

                          {/* Equipped Weapons */}
                          <div className="mb-8">
                            <h4 className="text-[10px] font-bold text-gray-500 mb-4 tracking-widest">
                              Equipped Weapons
                            </h4>
                            <div className="grid grid-cols-3 gap-3">
                              {[displayProfile.primaryWeaponId, null, null].map(
                                (weaponId, idx) => (
                                  <div
                                    key={idx}
                                    className={cn(
                                      "relative p-4 rounded-2xl border border-white/5 bg-white/5",
                                      !weaponId && "opacity-50",
                                    )}
                                  >
                                    {weaponId ? (
                                      <div className="flex flex-col items-center gap-2">
                                        <Crosshair className="w-6 h-6 text-moux-cyan" />
                                        <span className="text-[9px] font-bold text-white tracking-tighter truncate w-full text-center">
                                          {displayProfile.primaryWeaponName}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center gap-2 py-2">
                                        <div className="w-6 h-6 rounded-full border border-dashed border-gray-600" />
                                        <span className="text-[8px] font-semibold text-gray-600 ">
                                          Empty
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          {isOwnProfile && (
                            <MyStuffTab
                              user={displayProfile}
                              assets={userAssets}
                              showToast={showToast}
                              setConfirmDialog={setConfirmDialog}
                            />
                          )}

                          {isOwnProfile && (
                            <button
                              onClick={handleLogout}
                              className="w-full mt-10 p-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-bold tracking-[0.2em] text-[10px] hover:bg-red-500/20 transition-all flex items-center justify-center gap-3"
                            >
                              <LogOut className="w-5 h-5" /> LOG OUT
                            </button>
                          )}

                          <AnimatePresence>
                            {showAboutAccount && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 mb-8 overflow-hidden bg-black/20 p-4 rounded-2xl border border-white/5"
                              >
                                <h4 className="text-[10px] font-bold text-gray-500 mb-2 tracking-widest">
                                  About this account
                                </h4>
                                <div
                                  className={cn(
                                    "flex items-center justify-between p-3 rounded-lg text-xs",
                                    cardMain,
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "font-bold",
                                      textMuted,
                                    )}
                                  >
                                    Established
                                  </span>
                                  <span className={cn("font-mono", textMain)}>
                                    {formatDate(displayProfile.createdAt)}
                                  </span>
                                </div>
                                <div
                                  className={cn(
                                    "flex items-center justify-between p-3 rounded-lg text-xs",
                                    cardMain,
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "font-bold",
                                      textMuted,
                                    )}
                                  >
                                    Location
                                  </span>
                                  <span
                                    className={cn("font-mono ", textMain)}
                                  >
                                    {displayProfile.location}
                                  </span>
                                </div>
                                <div
                                  className={cn(
                                    "flex items-center justify-between p-3 rounded-lg text-xs",
                                    cardMain,
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "font-bold",
                                      textMuted,
                                    )}
                                  >
                                    Age Verified
                                  </span>
                                  <span
                                    className={cn(
                                      "font-bold",
                                      displayProfile.ageVerified
                                        ? "text-green-500"
                                        : "text-yellow-500",
                                    )}
                                  >
                                    {displayProfile.ageVerified
                                      ? "ADULT ACCESS"
                                      : "RESTRICTED"}
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })()}

                    {currentUser.isGuest && (
                      <div
                        className={cn(
                          "mt-8 p-6 border rounded-2xl text-left",
                          isLight
                            ? "bg-moux-cyan/5 border-moux-cyan/20"
                            : "bg-moux-cyan/5 border-moux-cyan/20",
                        )}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <ShieldAlert className="w-6 h-6 text-moux-cyan" />
                          <h4
                            className={cn(
                              "font-sans font-bold tracking-tight text-sm",
                              textMain,
                            )}
                          >
                            GUEST IDENTITY
                          </h4>
                        </div>
                        <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                          Your progress is tied to this session. Save your
                          identity to a permanent account to access your rank
                          across devices.
                        </p>
                        <form
                          onSubmit={handleConvertGuest}
                          className="space-y-3"
                        >
                          <input
                            type="email"
                            value={loginEmailInput}
                            onChange={(e) => setLoginEmailInput(e.target.value)}
                            placeholder="New Identity Email"
                            className="w-full bg-discord-black border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-moux-cyan/50"
                            required
                          />
                          <input
                            type="password"
                            value={loginPasswordInput}
                            onChange={(e) =>
                              setLoginPasswordInput(e.target.value)
                            }
                            placeholder="Access Password"
                            className="w-full bg-discord-black border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-moux-cyan/50"
                            required
                          />
                          <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full py-3 bg-moux-cyan text-discord-black rounded-xl font-semibold tracking-wide text-xs hover:brightness-110 disabled:opacity-50"
                          >
                            {isLoggingIn ? "UPGRADING..." : "SAVE IDENTITY"}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
                  {/* Recent Chat Partners */}
                  <section className="max-w-2xl mx-auto">
                    <h4
                      className={cn(
                        "text-[10px] font-bold mb-4 tracking-[0.2em] flex items-center gap-2",
                        textMuted,
                      )}
                    >
                      <MessageCircle className="w-3 h-3" /> Recent Messages
                    </h4>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                      {Array.from(
                        new Set(
                          filteredDMs.map((m) =>
                            m.senderId === currentUser?.uid
                              ? m.receiverId
                              : m.senderId,
                          ),
                        ),
                      ).map((partnerId) => {
                        const mostRecent = filteredDMs.find(
                          (m) =>
                            m.senderId === partnerId ||
                            m.receiverId === partnerId,
                        );
                        const partnerName =
                          mostRecent?.senderId === partnerId
                            ? mostRecent.senderName
                            : mostRecent?.receiverName || "Identity";
                        return (
                          <button
                            key={partnerId}
                            onClick={() =>
                              setDmTarget({
                                uid: partnerId,
                                displayName: partnerName,
                              } as UserProfile)
                            }
                            className="flex flex-col items-center gap-2 min-w-[80px] group"
                          >
                            <div
                              className={cn(
                                "w-14 h-14 rounded-full border flex items-center justify-center group-hover:scale-110 transition-transform relative",
                                isLight
                                  ? "bg-moux-cyan/10 border-moux-cyan/20"
                                  : "bg-moux-cyan/10 border-moux-cyan/20",
                              )}
                            >
                              <User className="w-6 h-6 text-moux-cyan" />
                              {privateMessages.some(
                                (m) => m.senderId === partnerId && !m.read,
                              ) && (
                                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-discord-black" />
                              )}
                            </div>
                            <span
                              className={cn(
                                "text-[10px] font-bold truncate w-20 text-center tracking-tighter",
                                textMain,
                              )}
                            >
                              {partnerName}
                            </span>
                          </button>
                        );
                      })}
                      {privateMessages.length === 0 && (
                        <p
                          className={cn(
                            "text-[10px]  font-mono ",
                            textMuted,
                          )}
                        >
                          Initiate notifications in Discovery.
                        </p>
                      )}
                    </div>
                  </section>

                  <section className="max-w-2xl mx-auto">
                    <h4
                      className={cn(
                        "text-[10px] font-bold mb-4 tracking-[0.2em] flex items-center gap-2",
                        textMuted,
                      )}
                    >
                      <Bell className="w-3 h-3" /> Echoes & Mentions
                    </h4>
                    {notifications.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-20 grayscale opacity-30">
                        <Bell className="w-16 h-16 mb-6" />
                        <h3
                          className={cn(
                            "text-xl font-sans font-semibold   mb-2",
                            textMain,
                          )}
                        >
                          No Notifications Detected
                        </h3>
                        <p className={cn("max-w-xs mx-auto", textMuted)}>
                          No notifications yet. New notifications and system
                          alerts will echo here.
                        </p>
                      </div>
                    ) : (
                      <div className="max-w-2xl mx-auto space-y-3">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={cn(
                              "p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group",
                              n.read
                                ? cn(cardMain, borderMain, "opacity-60")
                                : "bg-moux-cyan/5 border-moux-cyan/20 scale-[1.01] shadow-lg",
                            )}
                          >
                            {!n.read && (
                              <div className="absolute inset-y-0 left-0 w-1 bg-moux-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                            )}
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "p-2 rounded-lg",
                                  isLight ? "bg-black/5" : "bg-white/5",
                                )}
                              >
                                {n.type === "dm" && (
                                  <MessageCircle className="w-5 h-5 text-moux-cyan" />
                                )}
                                {n.type === "mention" && (
                                  <AtSign className="w-5 h-5 text-purple-400" />
                                )}
                                {n.type === "system" && (
                                  <ShieldAlert className="w-5 h-5 text-yellow-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p
                                    className={cn("font-bold text-sm", textMain)}
                                  >
                                    {n.title}
                                  </p>
                                  {n.link && (
                                    <span className="text-[8px] font-bold text-moux-cyan bg-moux-cyan/10 px-1 rounded">
                                      Action Required
                                    </span>
                                  )}
                                </div>
                                <p
                                  className={cn(
                                    "text-xs mt-0.5 line-clamp-1",
                                    textMuted,
                                  )}
                                >
                                  {n.message}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span
                                  className={cn(
                                    "text-[9px] font-mono  whitespace-nowrap",
                                    textMuted,
                                  )}
                                >
                                  {formatTime(n.createdAt)}
                                </span>
                                {n.link && (
                                  <ArrowUpDown className="w-3 h-3 text-moux-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}

              {activeTab === "discovery" && (
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                  <div className="max-w-2xl mx-auto">
                    <form
                      onSubmit={handleSearch}
                      className="mb-8 relative group"
                    >
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Scan for identities (e.g. '@Ghost')..."
                        className={cn(
                          "w-full border rounded-2xl px-6 py-5 focus:outline-none focus:border-moux-cyan/50 transition-all text-lg",
                          inputMain,
                          isLight
                            ? "placeholder:text-gray-400"
                            : "placeholder:text-gray-600",
                        )}
                      />
                      <button className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-moux-cyan text-discord-black rounded-xl hover:brightness-110">
                        <Search className="w-6 h-6" />
                      </button>
                    </form>

                    {isSearching ? (
                      <div className="flex justify-center py-10">
                        <div className="w-10 h-10 border-4 border-moux-cyan/30 border-t-moux-cyan rounded-full animate-spin" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {searchResults.map((user) => (
                          <div
                            key={user.uid}
                            className="profile-card border-white/5 hover:border-moux-cyan/30 group cursor-pointer transition-all hover:translate-y-[-2px]"
                            onClick={() => openProfileView(user.uid)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full border border-moux-cyan/20 flex items-center justify-center bg-moux-cyan/5 overflow-hidden">
                              <UserAvatar 
                                 uid={user.uid}
                                 size="w-full h-full"
                                 className="rounded-full"
                              />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-white font-bold truncate leading-none">
                                    {user.displayName}
                                  </p>
                                  <VerifiedBadge
                                    className="w-3.5"
                                    uid={user.uid}
                                    name={user.displayName}
                                    email={user.email}
                                    isVerified={user.isVerified}
                                    badges={user.badges}
                                  />
                                  {user.isAdmin && (
                                    <span className="text-[8px] bg-red-500/20 text-red-500 px-1 rounded  font-semibold">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <p className="text-[10px] text-gray-500 font-mono tracking-wide leading-none text-left">
                                    {user.rank}
                                  </p>
                                  <span
                                    className={cn(
                                      "w-1.5 h-1.5 rounded-full",
                                      isUserOnline(user)
                                        ? "bg-green-500"
                                        : "bg-gray-700",
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={() => setDmTarget(user)}
                                className="flex-1 bg-moux-cyan/10 hover:bg-moux-cyan/20 text-moux-cyan text-[10px] font-semibold tracking-wide py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-moux-cyan/10"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />{" "}
                                Notification
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBlockUserAction(
                                    user.uid,
                                    user.displayName,
                                  );
                                }}
                                className={cn(
                                  "p-2.5 rounded-xl transition-all border",
                                  currentUser?.blockedUsers?.includes(user.uid)
                                    ? "bg-red-500/20 text-red-500 border-red-500/30"
                                    : "bg-white/5 text-gray-500 border-white/10 hover:text-red-500",
                                )}
                                title={
                                  currentUser?.blockedUsers?.includes(user.uid)
                                    ? "Unblock Identity"
                                    : "Block Identity"
                                }
                              >
                                {currentUser?.blockedUsers?.includes(
                                  user.uid,
                                ) ? (
                                  <Unlock className="w-4 h-4" />
                                ) : (
                                  <Lock className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      searchQuery && (
                        <div className="text-center py-10 opacity-40">
                          <p className="font-mono text-sm">
                            NO IDENTITIES MATCHED SCAN.
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                  <div className="max-w-xl mx-auto space-y-8">
                    <section className="bg-white/5 border border-white/5 rounded-3xl p-6">
                      <h3 className="text-white font-sans font-bold tracking-tight text-sm mb-6 flex items-center gap-2">
                        <User className="w-4 h-4 text-moux-cyan" /> Account Profile Config
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 flex items-center gap-2">
                            <Edit2 className="w-3 h-3" /> Edit Username
                          </label>
                          <input
                            value={nameInput}
                            onChange={(e) => {
                              setNameInput(e.target.value);
                              setNameError("");
                            }}
                            className="w-full bg-discord-dark border border-white/10 rounded-xl p-3 text-white font-bold text-sm"
                            placeholder="3-20 characters"
                          />
                          {currentUser && currentUser.username !== nameInput && currentUser.isGuest && (
                            <p className="text-[9px] text-moux-cyan font-bold ">
                              GUEST ACCESS RESTRICTED
                            </p>
                          )}
                          {nameError && (
                            <p className="text-[10px] text-red-500 font-bold mt-1">
                              {nameError}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 flex items-center gap-2">
                            <User className="w-3 h-3" /> Edit Name
                          </label>
                          <input
                            value={displayNameInput}
                            onChange={(e) => setDisplayNameInput(e.target.value)}
                            placeholder="Display moniker"
                            className="w-full bg-discord-dark border border-white/10 rounded-xl p-3 text-white text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 flex items-center gap-2">
                            <FileText className="w-3 h-3" /> Edit Bio
                          </label>
                          <textarea
                            value={bioInput}
                            onChange={(e) => setBioInput(e.target.value.slice(0, 130))}
                            placeholder="Describe your essence..."
                            maxLength={130}
                            className="w-full bg-discord-dark border border-white/10 rounded-xl p-3 text-white text-sm min-h-[80px] resize-none"
                          />
                          <div className="flex justify-end pr-1">
                            <span className={cn(
                              "text-[9px] font-bold tracking-tighter transition-colors",
                              (130 - bioInput.length) <= 10 ? "text-red-500" : "text-gray-500"
                            )}>
                              {130 - bioInput.length} CHARACTERS REMAINING
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handleUpdateProfile}
                          disabled={isCheckingName}
                          className="w-full py-4 mt-4 bg-moux-cyan text-black font-extrabold tracking-widest text-xs rounded-xl hover:bg-white hover:text-black transition-all disabled:opacity-50"
                        >
                          {isCheckingName ? "SAVING..." : "SAVE CONFIGURATION"}
                        </button>
                      </div>
                    </section>

                    <section className="bg-white/5 border border-white/5 rounded-3xl p-6">
                      <h3 className="text-white font-sans font-bold tracking-tight text-sm mb-6 flex items-center gap-2">
                        <BellOff className="w-4 h-4 text-yellow-500" /> Notifications & Alerts
                      </h3>
                      <div className="space-y-4">
                        {currentUser?.muteGlobalPopups && notificationPermDenied && (
                          <button 
                            onClick={() => showToast("Notifications are disabled. You're missing out on MouxBot rewards. Enable in System Settings?", "error")}
                            className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 hover:bg-red-500/20 transition-all text-left"
                          >
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                            <p className="text-[10px] text-red-500 font-bold  leading-tight">
                              Notifications are disabled. You're missing out on MouxBot rewards. Enable in System Settings?
                            </p>
                          </button>
                        )}
                        <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                          <div>
                            <p className="text-white text-xs font-bold">
                              Mute Global Popups
                            </p>
                            <p className="text-[10px] text-gray-500">
                              Silence MouxBot and Follower popups outside the feed.
                            </p>
                          </div>
                          <button
                            onClick={async () => {
                              const newVal = !currentUser?.muteGlobalPopups;
                              await updateProfile(currentUser!.uid, { muteGlobalPopups: newVal });
                              setCurrentUser({ ...currentUser!, muteGlobalPopups: newVal });
                              showToast(`Popups ${newVal ? 'muted' : 'unmuted'}`, "success");
                            }}
                            className={cn(
                              "w-10 h-5 rounded-full transition-all relative flex items-center px-1",
                              currentUser?.muteGlobalPopups ? "bg-moux-cyan" : "bg-white/10"
                            )}
                          >
                            <div className={cn(
                              "w-3 h-3 bg-white transition-all",
                              currentUser?.muteGlobalPopups ? "translate-x-5" : "translate-x-0"
                            )} />
                          </button>
                        </div>
                      </div>
                    </section>

                    <section className="bg-black border-gray-200 dark:border-gray-800 p-6">
                      <h3 className="text-white font-sans font-bold tracking-tight text-sm mb-6 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-moux-cyan" /> Visual
                        Interface
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {[
                          {
                            mode: "dark" as ThemeMode,
                            icon: Moon,
                            label: "Dark",
                            detail: "Immersive deep-space interface protocol.",
                            color: "text-moux-cyan",
                          },
                          {
                            mode: "light" as ThemeMode,
                            icon: Sun,
                            label: "Light",
                            detail: "High-visibility photon-active interface.",
                            color: "text-orange-400",
                          },
                          {
                            mode: "low-power" as ThemeMode,
                            icon: Zap,
                            label: "Low-Power",
                            detail:
                              "Emergency gray-spectrum resource reduction.",
                            color: "text-gray-400",
                          },
                        ].map((t) => (
                          <button
                            key={t.mode}
                            onClick={() => setTheme(t.mode)}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                              theme === t.mode
                                ? "bg-white/10 border-white/20 shadow-[0_0_15px_rgba(0,243,255,0.1)]"
                                : "bg-black/20 border-transparent hover:bg-white/5",
                            )}
                          >
                            <div
                              className={cn(
                                "p-3 rounded-xl bg-white/5",
                                t.color,
                              )}
                            >
                              <t.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-bold text-xs tracking-widest">
                                {t.label}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {t.detail}
                              </p>
                            </div>
                            {theme === t.mode && (
                              <div className="w-2 h-2 bg-moux-cyan rounded-full animate-pulse shadow-[0_0_10px_#00f3ff]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </section>

                    <section className="bg-white/5 border border-white/5 rounded-3xl p-6">
                      <h3 className="text-gray-500 font-sans font-bold tracking-tight text-sm mb-6">
                        System Protocol
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                          <div>
                            <p className="text-white text-xs font-bold">
                              Notification Encryption
                            </p>
                            <p className="text-[10px] text-gray-500">
                              End-to-end identity shielding active.
                            </p>
                          </div>
                          <ShieldCheck className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                          <div>
                            <p className="text-white text-xs font-bold">
                              Latency
                            </p>
                            <p className="text-[10px] text-gray-500">
                              Connected to Europe-West Node.
                            </p>
                          </div>
                          <span className="text-[10px] text-moux-cyan font-mono animate-pulse">
                            STABLE
                          </span>
                        </div>
                      </div>
                    </section>



                    {/* Two-Factor Authentication (2FA) Security Section */}
                    <section className="bg-white/5 border border-white/5 rounded-3xl p-6">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                        <h3 className="text-white font-sans font-bold tracking-tight text-sm flex items-center gap-2">
                          <Lock className="w-4 h-4 text-moux-cyan" /> Two-Factor Authentication (2FA)
                        </h3>
                        {currentUser?.twoFactorEnabled ? (
                          <span className="text-[9px] bg-moux-cyan/10 text-moux-cyan border border-moux-cyan/20 px-2 py-0.5 rounded-full font-mono font-bold tracking-wide animate-pulse">
                            Node Protected
                          </span>
                        ) : (
                          <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full font-mono font-bold tracking-wide">
                            Vulnerable
                          </span>
                        )}
                      </div>

                      {!isSettingUp2FA && !currentUser?.twoFactorEnabled && (
                        <div className="space-y-4">
                          <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
                            Reinforce your identity profile defenses. Two-factor authentication (2FA) generates a dynamic, time-synced secret signature verifying your account credentials during deep system entry.
                          </p>
                          <button
                            onClick={handleInitiate2FASetup}
                            className="w-full py-3 bg-moux-cyan/15 hover:bg-moux-cyan/25 text-moux-cyan border border-moux-cyan/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 font-mono"
                          >
                            <ShieldCheck className="w-4 h-4" /> INITIATE SECURE 2FA PROTOCOL
                          </button>
                        </div>
                      )}

                      {isSettingUp2FA && (
                        <div className="space-y-6 font-mono">
                          <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-4">
                            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">
                              Step 1: Link Authenticator Node
                            </span>

                            {/* Matrix Cyber Scan Visualization */}
                            <div className="relative w-40 h-40 bg-black/60 border border-moux-cyan/25 p-2 rounded-2xl flex items-center justify-center mx-auto overflow-hidden">
                              <div className="absolute left-0 right-0 h-0.5 bg-moux-cyan/50 shadow-[0_0_10px_rgba(0,243,255,1)] animate-bounce" style={{ animationDuration: '3s' }} />
                              <div className="grid grid-cols-6 gap-2 w-full h-full opacity-80">
                                {[...Array(36)].map((_, i) => (
                                  <div 
                                    key={i} 
                                    className={cn(
                                      "rounded-sm transition-all duration-500",
                                      (i * 7 + 13) % 4 === 0 || i === 0 || i === 5 || i === 30 || i === 35 || (i > 10 && i < 15)
                                        ? "bg-moux-cyan shadow-[0_0_5px_rgba(0,243,255,0.4)]"
                                        : "bg-transparent border border-white/5"
                                    )} 
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="text-center space-y-2 pt-2">
                              <p className="text-[9px] text-gray-500">
                                SCAN CODE OR INPUT SECURE MANUAL KEY BELOW:
                              </p>
                              <div className="flex items-center justify-center gap-2 bg-black/50 px-3 py-1.5 rounded-lg border border-white/5 text-[11px] text-white select-all">
                                <code>{temp2FASecret}</code>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(temp2FASecret);
                                    showToast("Security key copied to clipboard.", "success");
                                  }}
                                  className="text-moux-cyan hover:brightness-125 transition-all text-xs"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Rolling Code Simulator */}
                          <div className="p-4 bg-moux-cyan/5 rounded-xl border border-moux-cyan/10 space-y-2">
                            <span className="text-[10px] text-moux-cyan font-bold block uppercase tracking-wider flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5" /> Synchronized Authenticator Simulator
                            </span>
                            <p className="text-[9.5px] text-gray-400 leading-normal">
                              We have synced a sandbox Google Authenticator app for convenient verification. Input or copy the active rolling code below to verify synchronization:
                            </p>
                            <div className="flex items-center justify-between bg-black/50 px-4 py-3 rounded-lg border border-white/5 mt-2">
                              <div className="space-y-0.5">
                                <span className="text-[9px] text-gray-500">CURRENT SANDBOX PIN</span>
                                <div className="text-base text-moux-cyan font-bold tracking-widest flex items-center gap-2">
                                  <span>{currentSimulatedOTP.slice(0, 3)} {currentSimulatedOTP.slice(3)}</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(currentSimulatedOTP);
                                      showToast("Simulated Code copied.", "success");
                                    }}
                                    className="text-[10px] text-gray-500 hover:text-white transition-colors uppercase font-mono px-1.5 py-0.5 bg-white/5 rounded border border-white/10 ml-1.5"
                                  >
                                    Copy Code
                                  </button>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[8px] text-gray-500 block">ROTATING IN</span>
                                <span className="text-xs text-white font-bold">{secondsRemaining}s</span>
                                <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                                  <div 
                                    className="h-full bg-moux-cyan transition-all duration-1000" 
                                    style={{ width: `${(secondsRemaining / 30) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2">
                            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">
                              Step 2: Save Account Recovery Codes
                            </span>
                            <p className="text-[9.5px] text-gray-500 leading-normal">
                              Keep these single-use physical recovery fallback keys in case your device is compromised:
                            </p>
                            <div className="grid grid-cols-2 gap-2 my-3">
                              {temp2FARecoveryCodes.map((code) => (
                                <div key={code} className="bg-black/80 border border-white/10 px-3 py-1.5 rounded-lg text-center text-gray-300 text-[10px] select-all">
                                  {code}
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(temp2FARecoveryCodes.join("\n"));
                                showToast("All 4 recovery codes saved.", "success");
                              }}
                              className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-[9px] text-white border border-white/5 rounded-lg transition-all"
                            >
                              Copy All Recovery Codes
                            </button>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 block tracking-widest uppercase">
                              Verify Sync Token
                            </label>
                            <div className="flex gap-2 font-sans">
                              <input
                                type="text"
                                maxLength={6}
                                value={entered2FAOTP}
                                onChange={(e) => {
                                  setEntered2FAOTP(e.target.value.replace(/\D/g, ''));
                                  setOtpVerificationError("");
                                }}
                                className={cn(
                                  "flex-1 px-4 py-3 text-xs rounded-xl font-mono border text-center font-bold tracking-[0.2em]",
                                  inputMain
                                )}
                                placeholder="000000"
                              />
                              <button
                                onClick={handleActivate2FA}
                                className="px-6 py-3 bg-moux-cyan text-discord-black hover:brightness-110 font-bold text-xs rounded-xl transition-all font-sans"
                              >
                                Enable TOTP
                              </button>
                            </div>
                            {otpVerificationError && (
                              <p className="text-[10px] text-red-500 font-bold mt-1">
                                * {otpVerificationError}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={handleCancel2FASetup}
                            className="w-full text-center text-gray-500 hover:text-white text-[10px] font-bold py-2 mt-2 transition-colors"
                          >
                            Cancel Setup
                          </button>
                        </div>
                      )}

                      {currentUser?.twoFactorEnabled && (
                        <div className="space-y-4 font-mono">
                          <div className="p-4 bg-black/45 rounded-2xl border border-moux-cyan/15 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-moux-cyan/15 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-4 h-4 text-moux-cyan" />
                              </div>
                              <div>
                                <h4 className="text-white text-xs font-bold leading-tight uppercase tracking-wider">
                                  Security Verification Protocol Status: Complete
                                </h4>
                                <p className="text-[9px] text-gray-500">
                                  Time-synchronized authorization verification is active.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-2">
                            <p className="text-[10px] font-bold text-gray-400">
                              ACTIVE SECURITY SIGNATURE KEY:
                            </p>
                            <p className="text-[9.5px] text-gray-500 leading-normal">
                              To sync separate authenticators, type or scan key:
                            </p>
                            <div className="flex items-center justify-between bg-black/60 px-3 py-1.5 rounded-lg border border-white/5 text-[10px] text-gray-400 select-all">
                              <code>{currentUser.twoFactorSecret}</code>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(currentUser.twoFactorSecret || "");
                                  showToast("Key copied.", "success");
                                }}
                                className="text-moux-cyan hover:brightness-125 transition-all text-[9.5px] font-sans"
                              >
                                Copy
                              </button>
                            </div>
                          </div>

                          {/* Authenticator display inside enable state too! */}
                          <div className="p-4 bg-moux-cyan/5 rounded-xl border border-moux-cyan/10 space-y-2">
                            <span className="text-[10px] text-moux-cyan font-bold block uppercase tracking-wider flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 animate-pulse" /> Live Authenticator Sync Pin
                            </span>
                            <div className="flex items-center justify-between bg-black/50 px-4 py-3 rounded-lg border border-white/5 mt-2">
                              <div className="space-y-0.5">
                                <span className="text-[9px] text-gray-500">CURRENT SYNCHRONIZED PIN</span>
                                <div className="text-base text-moux-cyan font-bold tracking-widest flex items-center gap-2">
                                  <span>{currentSimulatedOTP.slice(0, 3)} {currentSimulatedOTP.slice(3)}</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(currentSimulatedOTP);
                                      showToast("Synchronized Pin copied.", "success");
                                    }}
                                    className="text-[10px] text-gray-500 hover:text-white transition-colors uppercase font-mono px-1.5 py-0.5 bg-white/5 rounded border border-white/10 ml-1.5"
                                  >
                                    Copy
                                  </button>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[8px] text-gray-500 block">ROTATING IN</span>
                                <span className="text-xs text-white font-bold">{secondsRemaining}s</span>
                                <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                                  <div 
                                    className="h-full bg-moux-cyan transition-all duration-1000" 
                                    style={{ width: `${(secondsRemaining / 30) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {currentUser.twoFactorRecoveryCodes && currentUser.twoFactorRecoveryCodes.length > 0 && (
                            <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-2">
                              <p className="text-[10px] font-bold text-gray-400">
                                SPARE RECOVERY CLOUD KEYS ({currentUser.twoFactorRecoveryCodes.length}/4 LEFT):
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {currentUser.twoFactorRecoveryCodes.map((code) => (
                                  <div key={code} className="bg-black/60 border border-white/5 px-2.5 py-1.5 rounded-lg text-center text-gray-400 text-[9px]">
                                    {code}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {!showDeactivationOTPInput ? (
                            <button
                              onClick={() => {
                                setShowDeactivationOTPInput(true);
                                setEnteredDeactivationOTP("");
                                setDeactivationError("");
                              }}
                              className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-bold transition-all uppercase"
                            >
                              Dismantle 2FA protocol
                            </button>
                          ) : (
                            <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20 space-y-3 font-mono">
                              <span className="text-[10px] font-bold text-red-400 block tracking-widest uppercase">
                                Authorization Signature required to decommission 2FA
                              </span>
                              <p className="text-[9px] text-gray-500 leading-normal">
                                Enter your active 6-digit Authenticator code or any remaining recovery backup code:
                              </p>
                              <div className="flex gap-2 font-sans">
                                <input
                                  type="text"
                                  value={enteredDeactivationOTP}
                                  onChange={(e) => {
                                    setEnteredDeactivationOTP(e.target.value);
                                    setDeactivationError("");
                                  }}
                                  className={cn(
                                    "flex-1 px-4 py-2.5 text-xs rounded-xl font-mono border text-center tracking-wider",
                                    inputMain
                                  )}
                                  placeholder="OTP or xxxx-xxxx"
                                />
                                <button
                                  onClick={handleDeactivate2FA}
                                  className="px-4 py-2 bg-red-500 text-white hover:brightness-110 font-bold text-[10px] rounded-xl transition-all"
                                >
                                  Decommission
                                </button>
                              </div>
                              {deactivationError && (
                                <p className="text-[10px] text-red-400 font-bold font-mono">
                                  * {deactivationError}
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setShowDeactivationOTPInput(false);
                                  setEnteredDeactivationOTP("");
                                }}
                                className="w-full text-center text-gray-500 hover:text-white text-[9px] font-bold py-1 transition-colors block font-mono"
                              >
                                Keep Active
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </section>

                    <section className="bg-white/5 border border-white/5 rounded-3xl p-6">
                      <h3 className="text-white font-sans font-bold tracking-tight text-sm mb-6 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-500" /> Safety
                        & Privacy
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 tracking-widest mb-4">
                            Blocked Identities (
                            {currentUser?.blockedUsers?.length || 0})
                          </p>
                          {!currentUser?.blockedUsers ||
                          currentUser.blockedUsers.length === 0 ? (
                            <p className="text-[10px] text-gray-400 ">
                              No identities filtered from your reality.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {currentUser.blockedUsers.map((uid) => (
                                <div
                                  key={uid}
                                  className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5"
                                >
                                  <span className="text-xs text-white font-mono truncate max-w-[200px]">
                                    {uid}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleBlockUserAction(uid, "this user")
                                    }
                                    className="text-[10px] font-bold text-red-500 hover:brightness-125 transition-all"
                                  >
                                    Unblock
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-white/5">
                          <p className="text-[10px] font-bold text-gray-500 tracking-widest mb-4">
                            Muted Users (
                            {currentUser?.mutedUsers?.length || 0})
                          </p>
                          {!currentUser?.mutedUsers ||
                          currentUser.mutedUsers.length === 0 ? (
                            <p className="text-[10px] text-gray-400 ">
                              No frequencies suppressed.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {currentUser.mutedUsers.map((uid) => (
                                <div
                                  key={uid}
                                  className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5"
                                >
                                  <span className="text-xs text-white font-mono truncate max-w-[200px]">
                                    {uid}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleMuteUserAction(uid, "this user")
                                    }
                                    className="text-[10px] font-bold text-yellow-500 hover:brightness-125 transition-all"
                                  >
                                    Unmute
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Nav Bar - Mobile Only */}
            <nav
              className={cn(
                "md:hidden fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around px-2 z-40 bg-discord-black/80 backdrop-blur-lg",
                bgMain,
                borderMain,
              )}
            >
                <motion.button
                  whileTap={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  onClick={() => {
                    setActiveTab("feed");
                    setShowActionCenter(false);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 flex-1 py-1 min-h-[44px]",
                    activeTab === "feed" ? "text-moux-cyan" : textMuted,
                  )}
                >
                  <Globe className="w-6 h-6" />
                  <span className="text-[10px] font-bold tracking-tight">
                    Feed
                  </span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  onClick={() => {
                    setActiveTab("discovery");
                    setShowActionCenter(false);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 flex-1 py-1 min-h-[44px]",
                    activeTab === "discovery" ? "text-moux-cyan" : textMuted,
                  )}
                >
                  <Search className="w-6 h-6" />
                  <span className="text-[10px] font-bold tracking-tight">
                    Discovery
                  </span>
                </motion.button>

              {/* Center X Action Center */}
              <div className="relative -mt-8 px-4">
                <motion.button
                  whileTap={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  onClick={() => setShowActionCenter(!showActionCenter)}
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_30px_rgba(0,255,255,0.3)] border-4 z-50",
                    showActionCenter
                      ? "bg-white border-moux-cyan rotate-45"
                      : "bg-moux-cyan border-white/20",
                  )}
                >
                  <X
                    className={cn(
                      "w-8 h-8 transition-colors",
                      showActionCenter ? "text-moux-cyan" : "text-black",
                    )}
                  />
                </motion.button>

                <AnimatePresence>
                  {showActionCenter && (
                    <motion.div
                      initial={{ opacity: 0, y: 100, scale: 0.9 }}
                      animate={{ opacity: 1, y: -20, scale: 1 }}
                      exit={{ opacity: 0, y: 100, scale: 0.9 }}
                      className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 bg-discord-black border border-white/10 rounded-3xl p-2 shadow-2xl overflow-hidden backdrop-blur-xl"
                    >
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => {
                            setActiveTab("servers");
                            setShowActionCenter(false);
                          }}
                          className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-white/5 text-left transition-all"
                        >
                          <div className="w-8 h-8 rounded-lg bg-moux-cyan/10 flex items-center justify-center border border-moux-cyan/20">
                            <Server className="w-4 h-4 text-moux-cyan" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-white tracking-wide leading-none">
                              View Servers
                            </p>
                            <p className="text-[8px] text-gray-500 font-mono mt-1">
                              Explore World
                            </p>
                          </div>
                        </button>
                        <div className="h-[1px] bg-white/5 mx-2" />
                        <button
                          onClick={handleMouxBotClick}
                          className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-white/5 text-left transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-moux-cyan/10 flex items-center justify-center border border-moux-cyan/20 group-hover:bg-moux-cyan/20 transition-colors">
                            <Terminal className="w-4 h-4 text-moux-cyan" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-white tracking-wide leading-none">
                              MouxBot Terminal
                            </p>
                            <p className="text-[8px] text-moux-cyan font-mono mt-1 ">
                              M6 Intelligence
                            </p>
                          </div>
                        </button>
                        <div className="h-[1px] bg-white/5 mx-2" />
                        <button
                          onClick={() => {
                            setModalMode("create_server");
                            setShowActionCenter(false);
                          }}
                          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-moux-cyan/5 hover:bg-moux-cyan/10 text-left transition-all border border-moux-cyan/10"
                        >
                          <div className="w-8 h-8 rounded-lg bg-moux-cyan flex items-center justify-center shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                            <Plus className="w-4 h-4 text-black" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-moux-cyan tracking-wide leading-none">
                              Create Server
                            </p>
                            <p className="text-[8px] text-moux-cyan/50 font-mono mt-1">
                              Start Community
                            </p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

                <motion.button
                  whileTap={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  onClick={() => {
                    setActiveTab("shop");
                    setShowActionCenter(false);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 flex-1 py-1 min-h-[44px]",
                    activeTab === "shop" ? "text-moux-cyan" : textMuted,
                  )}
                >
                  <ShoppingBag className="w-6 h-6" />
                  <span className="text-[10px] font-bold tracking-tight">
                    Market
                  </span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  onClick={() => {
                    setActiveTab("profile");
                    setShowActionCenter(false);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 flex-1 py-1 min-h-[44px] relative",
                    activeTab === "profile" ? "text-moux-cyan" : textMuted,
                  )}
                >
                  <User className="w-6 h-6" />
                  <span className="text-[10px] font-bold tracking-tight">
                    Profile
                  </span>
                </motion.button>
            </nav>
          </main>

          {/* Overlays */}
          <AnimatePresence>
            {showDungeons && currentUser && (
              <DungeonMiniGame
                user={currentUser}
                onClose={() => setShowDungeons(false)}
                onComplete={async (result) => {
                  await completeDungeon(currentUser.uid, result);
                }}
                theme={theme}
              />
            )}

            {modalMode === "create_server" && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-discord-black/90 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className={cn(
                    "w-full max-w-md border overflow-hidden shadow-2xl rounded-3xl bg-discord-dark border-white/10",
                  )}
                >
                  <header className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-moux-cyan/10 flex items-center justify-center border border-moux-cyan/30">
                        <Plus className="w-6 h-6 text-moux-cyan" />
                      </div>
                      <div>
                        <h2 className="text-xl font-sans font-semibold text-white  tracking-tighter">
                          Initialize Server
                        </h2>
                        <p className="text-[10px] text-gray-500 font-mono tracking-widest ">
                          Community Creation Protocol
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setModalMode("none")}
                      className="p-2 text-gray-500 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </header>

                  <form onSubmit={handleCreateServer} className="p-6 space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-2 block tracking-widest ml-1">
                        Server Designation (Name)
                      </label>
                      <input
                        type="text"
                        value={serverNameInput}
                        onChange={(e) => setServerNameInput(e.target.value)}
                        placeholder="Townsville, Safe Haven, etc."
                        maxLength={32}
                        className={cn(
                          "w-full border rounded-2xl px-5 py-4 focus:outline-none focus:border-moux-cyan/50",
                          inputMain,
                        )}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-2 block tracking-widest ml-1">
                        Community Description
                      </label>
                      <textarea
                        value={serverDescInput}
                        onChange={(e) => setServerDescInput(e.target.value)}
                        placeholder="What is the purpose of this notification?"
                        maxLength={140}
                        className={cn(
                          "w-full border rounded-2xl px-5 py-4 focus:outline-none focus:border-moux-cyan/50 h-24 resize-none",
                          inputMain,
                        )}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-2 block tracking-widest ml-1">
                        Server Icon
                      </label>
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {serverIconURL ? (
                            <img src={serverIconURL || undefined} alt="Icon" className="w-full h-full object-cover" />
                          ) : (
                            <Globe className="w-8 h-8 text-gray-700" />
                          )}
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={handleGenerateServerIcon}
                            className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-semibold tracking-wide hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-moux-cyan" /> Generate AI Icon
                          </button>
                          <button 
                            type="button"
                            onClick={() => setMediaPickerConfig({ isOpen: true, mode: 'server' })}
                            className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-semibold tracking-wide hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer text-center">
                            <Plus className="w-3.5 h-3.5" /> Upload Custom
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div>
                        <p className="text-white text-xs font-bold  tracking-wider">
                          Public Accessibility
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Visible to all wanderers.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setServerIsPublic(!serverIsPublic)}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          serverIsPublic ? "bg-moux-cyan" : "bg-gray-700",
                        )}
                      >
                        <div
                          className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            serverIsPublic ? "right-1" : "left-1",
                          )}
                        />
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isCreatingServer || !serverNameInput.trim()}
                      className="w-full btn-primary py-5 rounded-2xl font-semibold tracking-wide text-xs shadow-[0_0_30px_rgba(0,255,255,0.2)] disabled:opacity-50"
                    >
                      {isCreatingServer
                        ? "Initializing Server..."
                        : "Construct Community"}
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {currentUser.ageVerified === null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
              >
                <div
                  className={cn(
                    "max-w-lg w-full border p-8 rounded-3xl text-center shadow-2xl",
                    cardMain,
                    borderMain,
                  )}
                >
                  <ShieldAlert className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                  <h2
                    className={cn(
                      "text-3xl font-sans font-semibold mb-4  tracking-wide ",
                      textMain,
                    )}
                  >
                    IDENTITY CHECK
                  </h2>
                  <p className={cn("mb-8 leading-relaxed", textMuted)}>
                    Moux World contains mature content and social interactions.
                    Verify your status to continue.
                  </p>
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => handleVerifyAge(true)}
                      className="btn-primary py-4 text-lg flex items-center justify-center gap-2"
                    >
                      <Globe className="w-6 h-6 text-discord-black" /> I AM 18+
                      (ADULT)
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleVerifyAge(false)}
                        className="bg-white/5 hover:bg-white/10 text-gray-300 py-4 rounded font-semibold text-xs tracking-widest "
                      >
                        MINOR
                      </button>
                      <button
                        onClick={handleLogout}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 py-4 rounded font-semibold text-xs tracking-widest "
                      >
                        EXIT
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Admin Panel Modal */}
          <AnimatePresence>
            {showAdmin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[70] flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="w-full max-w-5xl bg-discord-dark rounded-3xl border border-red-500/20 overflow-hidden shadow-2xl flex flex-col h-[90vh]"
                >
                  <header className="p-6 border-b border-white/5 flex items-center justify-between bg-red-500/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/30">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-sans font-semibold text-white  tracking-tighter">
                          COMMAND CENTER
                        </h2>
                        <p className="text-[10px] text-gray-500 font-mono tracking-widest ">
                          Root Access Granted
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAdmin(false)}
                      className={cn(
                        "p-2 text-gray-500",
                        isLight ? "hover:text-black" : "hover:text-white",
                      )}
                    >
                      <X className="w-8 h-8" />
                    </button>
                  </header>

                  <div className="flex border-b border-white/5 bg-discord-black/50 overflow-x-auto no-scrollbar">
                    {[
                      {
                        id: "moderation",
                        label: "Mod Queue",
                        icon: Filter,
                        count: modQueue.length,
                      },
                      {
                        id: "reports",
                        label: "Notification Reports",
                        icon: Flag,
                        count: pendingReports.length,
                      },
                      {
                        id: "appeals",
                        label: "Ban Appeals",
                        icon: UserX,
                        count: pendingAppeals.length,
                      },
                      {
                        id: "shadowMuted",
                        label: "Shadow-Muted",
                        icon: Ghost,
                        count: shadowMutedUsers.length,
                      },

                      { id: "polls", label: "Global Polls", icon: PieChart },
                      { id: "challenges", label: "Moux Challenges", icon: Zap },
                      { id: "broadcast", label: "Official Updates", icon: Radio },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setAdminTab(tab.id as any)}
                        className={cn(
                          "flex items-center gap-2 px-8 py-4 text-xs font-semibold tracking-wide border-b-2 transition-all",
                          adminTab === tab.id
                            ? "border-red-500 text-red-500 bg-red-500/5"
                            : "border-transparent text-gray-500 hover:text-gray-300",
                        )}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                          <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-1 animate-pulse">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    {adminTab === "polls" && (
                       <div className="space-y-6">
                         <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                           <h4 className="text-white font-bold text-xs mb-4">Launch Global Poll</h4>
                           <input 
                             placeholder="Poll Question"
                             value={pollQuestion}
                             onChange={e => setPollQuestion(e.target.value)}
                             className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white mb-4 placeholder:text-gray-700"
                           />
                           <div className="space-y-2 mb-4">
                             {pollOptions.map((opt, i) => (
                               <input 
                                 key={i}
                                 placeholder={`Option ${i+1}`}
                                 value={opt}
                                 onChange={e => {
                                   const newOpts = [...pollOptions];
                                   newOpts[i] = e.target.value;
                                   setPollOptions(newOpts);
                                 }}
                                 className="w-full bg-black/20 border border-white/5 p-3 rounded-lg text-sm text-gray-300"
                               />
                             ))}
                             {pollOptions.length < 5 && (
                               <button 
                                 onClick={() => setPollOptions([...pollOptions, ""])}
                                 className="text-[10px] font-semibold text-moux-cyan tracking-wide hover:underline"
                               >
                                 + Add Option
                               </button>
                             )}
                           </div>
                           <button 
                             onClick={async () => {
                               if (!pollQuestion || pollOptions.some(o => !o)) return;
                               const mouxBot: UserProfile = {
                                 uid: "MOUXBOT", displayName: "MouxBot", rank: "GOD", email: "mouxbot@moux.world", location: "Void", mouxBalance: 9999999, isBanned: false, ageVerified: true, isAdmin: true, nameChangePasses: 0, createdAt: Date.now()
                               };
                               await postToFeed(pollQuestion, mouxBot, false, undefined, {
                                 question: pollQuestion,
                                 options: pollOptions.map(o => ({ text: o, votes: [] }))
                               });
                               setPollQuestion("");
                               setPollOptions(["", ""]);
                               showToast("Global Poll Initiated", "success");
                             }}
                             className="w-full py-4 bg-moux-cyan text-black font-bold tracking-tight rounded-xl hover:brightness-110 transition-all"
                           >
                             Transmit Poll Signal
                           </button>
                         </div>
                       </div>
                    )}
                    {adminTab === "broadcast" && (
                      <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                           <h4 className="text-white font-bold text-xs mb-4">MouxBot Override</h4>
                           <textarea 
                             placeholder="Official update content..."
                             value={broadcastContent}
                             onChange={e => setBroadcastContent(e.target.value)}
                             className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white mb-4 placeholder:text-gray-700 min-h-[120px]"
                           />
                           <button 
                             onClick={async () => {
                               if (!broadcastContent) return;
                               await mouxBotFeedPost(broadcastContent);
                               setBroadcastContent("");
                               showToast("Official update posted successfuly", "success");
                             }}
                             className="w-full py-4 bg-red-500 text-white font-bold tracking-tight rounded-xl hover:brightness-110 transition-all mb-4"
                           >
                             Forced Pulse Emission
                           </button>
                           <button
                             onClick={async () => {
                               try {
                                 const { collection, getDocs, query, where, deleteDoc, doc } = await import("firebase/firestore");
                                 const { db } = await import("./firebase");
                                 const q = query(collection(db, "world_feed"), where("authorId", "==", "MOUXBOT"));
                                 const snapshot = await getDocs(q);
                                 let count = 0;
                                 for (const docSnap of snapshot.docs) {
                                   await deleteDoc(doc(db, "world_feed", docSnap.id));
                                   count++;
                                 }
                                 showToast(`Cleared ${count} Official Updates`, "success");
                               } catch(e) {
                                  showToast("Failed to clear updates: " + e, "error");
                               }
                             }}
                             className="w-full py-4 bg-orange-500 text-white font-bold tracking-tight rounded-xl hover:brightness-110 transition-all mb-6"
                           >
                             Clear All Official Updates
                           </button>
                           <button
                             onClick={async () => {
                               const newState = !mouxBotFeedEnabled;
                               await setDoc(doc(db, 'settings', 'mouxbot'), { enabled: newState }, { merge: true });
                               setMouxBotFeedEnabled(newState);
                               showToast(`MouxBot Feed ${newState ? "Enabled" : "Disabled"}`, "success");
                             }}
                             className={cn(
                               "w-full py-4 font-bold tracking-tight rounded-xl transition-all",
                               mouxBotFeedEnabled ? "bg-green-500 text-black" : "bg-white/10 text-white"
                             )}
                           >
                             MouxBot Feed Access: {mouxBotFeedEnabled ? "ON" : "OFF"}
                           </button>
                        </div>
                      </div>
                    )}
                    {adminTab === "challenges" && (
                       <div className="p-10 text-center text-gray-500 font-mono ">CHALLENGE SYSTEM INTEGRATION PENDING...</div>
                    )}
                    {adminTab === "moderation" && (
                      <div className="space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8">
                          <h4 className="text-white font-bold text-xs mb-4">Grant Wealth</h4>
                          <div className="relative mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search User..."
                              value={grantSearchQuery}
                              onChange={(e) => setGrantSearchQuery(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 py-3 pl-12 pr-4 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-moux-cyan transition-colors"
                            />
                            {isGrantSearching && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-moux-cyan border-t-transparent rounded-full animate-spin" />
                            )}
                          </div>
                          {grantSearchResults.length > 0 && (
                            <div className="space-y-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                              {grantSearchResults.map((user) => (
                                <div key={user.uid} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                                  <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <UserAvatar uid={user.uid} size="w-12 h-12" className="rounded-xl border border-white/10" isMouxBot={user.uid === "MOUXBOT"} />
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-bold text-white truncate">{user.displayName}</h4>
                                      <p className="text-xs text-gray-500 font-mono truncate">@{user.username || user.uid.slice(0,8)}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
                                    <div className="flex flex-col gap-3 pr-6 border-r border-white/10 hidden md:flex">
                                        <label className="relative inline-flex items-center cursor-pointer group">
                                          <input 
                                            type="checkbox" 
                                            checked={!!user.is_verified}
                                            onChange={() => updateDoc(doc(db, "users", user.uid), { is_verified: !user.is_verified }).then(()=>showToast("Toggled Verified", "success"))}
                                            className="sr-only peer"
                                          />
                                          <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-500"></div>
                                          <span className="ml-3 text-[10px] font-bold text-gray-400 group-hover:text-blue-500 transition-colors tracking-widest">Verified Status</span>
                                        </label>
                                        <label className="relative inline-flex items-center cursor-pointer group">
                                          <input 
                                            type="checkbox" 
                                            checked={!!user.is_pro}
                                            onChange={() => updateDoc(doc(db, "users", user.uid), { is_pro: !user.is_pro }).then(()=>showToast("Toggled Pro", "success"))}
                                            className="sr-only peer"
                                          />
                                          <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-yellow-500"></div>
                                          <span className="ml-3 text-[10px] font-bold text-gray-400 group-hover:text-yellow-500 transition-colors tracking-widest">Pro Status</span>
                                        </label>
                                        <label className="relative inline-flex items-center cursor-pointer group">
                                          <input 
                                            type="checkbox" 
                                            checked={!!user.is_veteran}
                                            onChange={() => updateDoc(doc(db, "users", user.uid), { is_veteran: !user.is_veteran }).then(()=>showToast("Toggled Veteran", "success"))}
                                            className="sr-only peer"
                                          />
                                          <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-red-500"></div>
                                          <span className="ml-3 text-[10px] font-bold text-gray-400 group-hover:text-red-500 transition-colors tracking-widest">Veteran Status</span>
                                        </label>
                                    </div>
                                    <input 
                                      type="number" 
                                      placeholder="Amount" 
                                      value={grantAmounts[user.uid] || ""}
                                      onChange={(e) => setGrantAmounts({ ...grantAmounts, [user.uid]: e.target.value })}
                                      className="flex-1 sm:w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-3 sm:py-2 text-white font-mono text-sm focus:outline-none focus:border-moux-cyan transition-colors"
                                    />
                                    <button 
                                      onClick={async () => {
                                        const amt = parseInt(grantAmounts[user.uid]);
                                        if (isNaN(amt) || amt <= 0) return;
                                        await grantCurrency(user.uid, amt);
                                        setGrantAmounts({ ...grantAmounts, [user.uid]: "" });
                                        showToast(`Granted ${amt} Moux to ${user.displayName}`, "success");
                                      }}
                                      className="px-6 py-3 sm:py-2 bg-moux-cyan text-black font-semibold tracking-wide text-xs rounded-lg hover:brightness-110 transition-all flex items-center justify-center min-w-[120px]"
                                    >
                                      Grant
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {modQueue.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-20">
                            <Check className="w-16 h-16 mb-4" />
                            <p className="font-mono text-sm ">
                              Queue Clear
                            </p>
                          </div>
                        ) : (
                          modQueue.map((item) => (
                            <div
                              key={item.id}
                              className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start"
                            >
                              <div className="flex-1 w-full">
                                <div className="flex items-center gap-3 mb-4">
                                  <span className="text-red-500 text-[10px] font-bold px-2 py-0.5 bg-red-500/10 rounded">
                                    Mature Tagged
                                  </span>
                                  <span className="text-gray-500 text-xs text-gray-500">
                                    By {item.authorName} •{" "}
                                    {formatDate(item.createdAt)}
                                  </span>
                                </div>
                                <p className="text-white text-lg  leading-relaxed">
                                  "{item.content}"
                                </p>
                              </div>
                              <div className="flex gap-2 w-full md:w-auto">
                                <button
                                  onClick={() =>
                                    updateModerationStatus(item.id, "approved")
                                  }
                                  className="flex-1 md:flex-none p-4 bg-green-500 text-black rounded-2xl font-semibold tracking-wide text-xs hover:brightness-110 flex items-center justify-center gap-2"
                                >
                                  <ShieldCheck className="w-5 h-5" /> Approve
                                </button>
                                <button
                                  onClick={() =>
                                    updateModerationStatus(item.id, "rejected")
                                  }
                                  className="flex-1 md:flex-none p-4 bg-white/5 text-gray-400 hover:bg-white/10 rounded-2xl font-semibold tracking-wide text-xs flex items-center justify-center gap-2"
                                >
                                  <EyeOff className="w-5 h-5" /> Reject
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {adminTab === "shadowMuted" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                           <h4 className="text-white font-bold text-xs uppercase tracking-widest text-moux-cyan">Active Shadow Mutes</h4>
                           <button 
                             onClick={fetchUsersForAdmin}
                             className="text-[10px] text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                           >
                              <RefreshCw className="w-3 h-3" /> Refresh
                           </button>
                        </div>
                        {shadowMutedUsers.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-20">
                            <Ghost className="w-16 h-16 mb-4" />
                            <p className="font-mono text-sm ">
                              No Active Shadow-Mutes
                            </p>
                          </div>
                        ) : (
                          <div className="grid gap-3">
                            {shadowMutedUsers.map((user) => (
                              <div
                                key={user.uid}
                                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-all"
                              >
                                <div className="flex items-center gap-4">
                                  <UserAvatar uid={user.uid} size="w-12 h-12" className="rounded-xl" />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="text-white font-bold text-sm">{user.displayName}</h5>
                                      <span className="text-[9px] px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded uppercase font-mono tracking-tighter">
                                        @{user.username || "wanderer"}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-mono mt-1">
                                      Muted until: {new Date(user.shadowMutedUntil!).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={async () => {
                                    try {
                                      await updateDoc(doc(db, "users", user.uid), {
                                        shadowMutedUntil: 0
                                      });
                                      showToast(`Override successful: ${user.displayName} has been released.`, "success");
                                      fetchUsersForAdmin();
                                      if (currentUser) {
                                        await logAdminAction(
                                          currentUser,
                                          "MUTE_OVERRIDE",
                                          "Manually removed shadow-mute status from user",
                                          { id: user.uid, name: user.displayName }
                                        );
                                      }
                                    } catch(e) {
                                      showToast("Override sequence failed: " + e, "error");
                                    }
                                  }}
                                  className="px-4 py-2 bg-moux-cyan/10 text-moux-cyan border border-moux-cyan/20 rounded-xl text-[10px] font-bold tracking-tight hover:bg-moux-cyan hover:text-black transition-all"
                                >
                                  Forced Override
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {adminTab === "reports" && (
                      <div className="space-y-4">
                        {pendingReports.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-20">
                            <Flag className="w-16 h-16 mb-4" />
                            <p className="font-mono text-sm ">
                              No New Incidents
                            </p>
                          </div>
                        ) : (
                          pendingReports.map((report) => (
                            <div
                              key={report.id}
                              className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-red-500 text-[10px] font-bold px-2 py-0.5 bg-red-500/10 rounded">
                                    CRITICAL REPORT
                                  </span>
                                  <p className="text-xs text-gray-500 font-mono ">
                                    Reporter: {report.reporterName}
                                  </p>
                                </div>
                                <div className="mb-4">
                                  <p className="text-[10px] text-gray-500  font-semibold mb-1">
                                    Target Content (Type: {report.targetType})
                                  </p>
                                  <p className="text-white bg-black/30 p-3 rounded-xl border border-white/5 ">
                                    "{report.targetContent}"
                                  </p>
                                </div>
                                <p className="text-sm text-gray-400">
                                  <span className="text-gray-500 font-semibold">
                                    REASON:
                                  </span>{" "}
                                  {report.reason}
                                </p>
                              </div>
                              <div className="flex flex-col gap-2 w-full md:w-auto">
                                <button
                                  onClick={() => resolveReport(report.id)}
                                  className="p-4 bg-white/5 text-white hover:bg-white/10 rounded-2xl font-semibold tracking-wide text-[10px]"
                                >
                                  Mark Resolved
                                </button>
                                <button
                                  onClick={async () => {
                                    // Quick action: Ban author
                                    await banUser(report.authorId);
                                    if (currentUser)
                                      await logAdminAction(
                                        currentUser,
                                        "BAN_USER",
                                        "Banned user via report resolution",
                                        {
                                          id: report.authorId,
                                          name: "Report Target",
                                        },
                                      );
                                    resolveReport(report.id);
                                  }}
                                  className="p-4 bg-red-500 text-black rounded-2xl font-semibold tracking-wide text-[10px] flex items-center justify-center gap-2"
                                >
                                  <Ban className="w-4 h-4" /> Ban Author
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {adminTab === "appeals" && (
                      <div className="space-y-4">
                        {pendingAppeals.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-20">
                            <UserX className="w-16 h-16 mb-4" />
                            <p className="font-mono text-sm ">
                              No Pending Appeals
                            </p>
                          </div>
                        ) : (
                          pendingAppeals.map((appeal) => (
                            <div
                              key={appeal.id}
                              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start"
                            >
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="bg-red-500/20 text-red-500 font-bold  text-[10px] px-2 py-1 rounded">
                                    Banned Profile
                                  </span>
                                  <span className="font-bold text-white">
                                    {appeal.displayName}
                                  </span>
                                  <span className="text-gray-500 text-xs text-gray-500">
                                    {appeal.email}
                                  </span>
                                </div>
                                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                  <p className="text-sm text-gray-300 whitespace-pre-wrap">
                                    {appeal.appealText || "No appeal reason provided."}
                                  </p>
                                </div>
                                <div className="text-[10px] text-gray-500 flex justify-between items-center mt-4">
                                  <span className="font-mono">ID: {appeal.id}</span>
                                  <span>
                                    Appealed:{" "}
                                    {new Date(appeal.updatedAt).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 min-w-[200px]">
                                <button
                                  onClick={async () => {
                                    await resolveAppeal(appeal.id, "approved");
                                    if (currentUser) {
                                      await logAdminAction(
                                        currentUser,
                                        "APPROVE_APPEAL",
                                        "Approved unban appeal",
                                        { id: appeal.id, name: appeal.displayName }
                                      );
                                    }
                                  }}
                                  className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold tracking-wide px-4 py-3 rounded-xl transition-all w-full flex justify-center items-center gap-2"
                                >
                                  <Check className="w-4 h-4" />
                                  Approve & Unban
                                </button>
                                <button
                                  onClick={async () => {
                                    await resolveAppeal(appeal.id, "rejected");
                                    if (currentUser) {
                                      await logAdminAction(
                                        currentUser,
                                        "REJECT_APPEAL",
                                        "Rejected unban appeal",
                                        { id: appeal.id, name: appeal.displayName }
                                      );
                                    }
                                  }}
                                  className="bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 border border-transparent hover:border-red-500/30 text-xs font-bold tracking-wide px-4 py-3 rounded-xl transition-all w-full flex justify-center items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Reject Appeal
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}



                    {adminTab === "servers" && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-sans font-semibold text-white  tracking-tighter mb-4">
                          World Servers
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[
                            {
                              name: "Global Main",
                              room: "global_main",
                              region: "Worldwide",
                              status: "Online",
                              users: 15420,
                              ping: "24ms",
                            },
                            {
                              name: "Tokyo Central",
                              room: "japan_tokyo",
                              region: "Japan",
                              status: "Online",
                              users: 3421,
                              ping: "12ms",
                            },
                            {
                              name: "London Hub",
                              room: "uk_london",
                              region: "UK",
                              status: "Online",
                              users: 4120,
                              ping: "15ms",
                            },
                            {
                              name: "NY Exchange",
                              room: "usa_newyork",
                              region: "USA East",
                              status: "Online",
                              users: 6100,
                              ping: "18ms",
                            },
                            {
                              name: "São Paulo",
                              room: "brazil_saopaulo",
                              region: "Brazil",
                              status: "Online",
                              users: 2150,
                              ping: "35ms",
                            },
                            {
                              name: "Sydney Core",
                              room: "australia_sydney",
                              region: "Australia",
                              status: "Maintenance",
                              users: 0,
                              ping: "--",
                            },
                          ].map((server, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                if (server.status === "Online") {
                                  setActiveWorldRoom(server.room);
                                  setActiveTab("servers");
                                  setWorldCountry(server.region);
                                  setWorldCity(server.name);
                                  setShowAdmin(false);
                                }
                              }}
                              className={cn(
                                "bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-2 transition-all border-l-4 border-l-moux-cyan",
                                server.status === "Online"
                                  ? "cursor-pointer hover:bg-white/10"
                                  : "opacity-50",
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-white font-semibold text-sm tracking-wide">
                                    {server.name}
                                  </h4>
                                  <p className="text-gray-500 text-xs font-medium">
                                    {server.region}
                                  </p>
                                </div>
                                <span
                                  className={cn(
                                    "text-[9px] px-2 py-0.5 rounded font-bold tracking-tight",
                                    server.status === "Online"
                                      ? "bg-moux-cyan/10 text-moux-cyan border border-moux-cyan/20"
                                      : "bg-red-500/10 text-red-500 border border-red-500/20",
                                  )}
                                >
                                  {server.status}
                                </span>
                              </div>
                              <div className="flex justify-between mt-2 pt-2 border-t border-white/5">
                                <span className="text-gray-400 text-xs flex items-center gap-1">
                                  <Server className="w-3 h-3" /> {server.users}
                                </span>
                                <span className="text-gray-500 font-mono text-xs">
                                  {server.ping}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DM Modal */}
          <AnimatePresence>
            {isEditingPost && editingPost && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-md z-[80] flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="w-full max-w-lg bg-discord-dark rounded-3xl border border-moux-cyan/30 overflow-hidden shadow-[0_0_50px_-12px_rgba(0,255,255,0.3)]"
                >
                  <header className="p-6 border-b border-white/5 flex items-center justify-between bg-moux-cyan/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-moux-cyan/10 flex items-center justify-center border border-moux-cyan/30">
                        <Edit2 className="w-6 h-6 text-moux-cyan" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-sans font-semibold text-white  tracking-tighter text-left">
                          MESSAGE LOGIC
                        </h2>
                        <p className="text-[10px] text-gray-500 font-mono tracking-widest  text-left">
                          Modifying Notification Community
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditingPost(false)}
                      className={cn(
                        "p-2 text-gray-500 transition-colors",
                        isLight ? "hover:text-black" : "hover:text-white",
                      )}
                    >
                      <X className="w-8 h-8" />
                    </button>
                  </header>

                  <div className="p-8 space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 tracking-widest flex items-center gap-2">
                        <FileText className="w-3 h-3" /> Notification Content
                      </label>
                      <textarea
                        value={editContentInput}
                        onChange={(e) => setEditContentInput(e.target.value)}
                        className={cn(
                          "w-full border rounded-2xl p-6 focus:outline-none focus:border-moux-cyan/50 min-h-[200px] resize-none text-lg transition-all ",
                          inputMain,
                        )}
                        placeholder="Re-write your notification..."
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setIsEditingPost(false)}
                        className="flex-1 py-4 rounded-xl font-semibold tracking-wide text-xs text-gray-500 hover:bg-white/5 transition-all"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={handleEditPostSubmit}
                        disabled={
                          !editContentInput.trim() ||
                          editContentInput === editingPost.content
                        }
                        className="flex-1 py-4 bg-white text-black font-semibold tracking-wide text-xs hover:brightness-110 disabled:opacity-50 disabled:grayscale transition-all"
                      >
                        SAVE
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Network Graph Modal */}
          <AnimatePresence>
            {followGraphState?.isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  className={cn(
                    "w-full max-w-md rounded-2xl border overflow-hidden shadow-2xl relative flex flex-col max-h-[80vh]",
                    cardMain,
                    borderMain,
                  )}
                >
                  <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-inherit z-10 border-white/5">
                    <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 text-white">
                      <Users className="w-5 h-5 text-moux-cyan" />
                      {followGraphState.title}
                    </h2>
                    <button
                      onClick={() => setFollowGraphState(null)}
                      className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                    <div className="space-y-2 text-white">
                      {followGraphState.users.length === 0 ? (
                        <div className="py-8 text-center text-gray-500 font-bold text-sm tracking-widest">
                          NO RECORDS FOUND
                        </div>
                      ) : (
                        followGraphState.users.map((u) => (
                          <div
                            key={u.uid}
                            onClick={() => {
                              setFollowGraphState(null);
                              openProfileView(u.uid);
                            }}
                            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden flex-shrink-0">
                               <UserAvatar uid={u.uid} size="w-full h-full" className="rounded-full" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-white text-sm truncate flex items-center gap-2">
                                {u.displayName}
                                <VerifiedBadge
                                    className="w-3.5 h-3.5"
                                    uid={u.uid}
                                    name={u.displayName}
                                    email={u.email}
                                    isVerified={u.isVerified}
                                    badges={u.badges}
                                />
                              </h3>
                              <p className="text-xs text-gray-500 truncate">@{u.username || "user"}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-600" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {followGraphState.users.length === 50 && (
                    <div className="p-3 border-t border-white/5 text-center bg-black/20">
                      <p className="text-[10px] font-semibold text-gray-500 tracking-widest">
                        Only showing first 50 records...
                      </p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {activeAlert && (
              <NonIntrusivePopup 
                post={activeAlert} 
                onClose={() => setActiveAlert(null)}
                onView={(id) => {
                  setActiveTab("feed");
                  setActiveAlert(null);
                  setTimeout(() => {
                    const el = document.getElementById(id);
                    el?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 100);
                }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {dmTarget && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-discord-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className={cn(
                    "w-full max-w-md border overflow-hidden shadow-2xl flex flex-col h-[80vh]",
                    bgSide,
                    borderMain,
                    isDark || isLowPower ? "rounded-3xl" : "rounded-2xl",
                  )}
                >
                  <header className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                      <UserAvatar 
                         uid={dmTarget.uid}
                         size="w-10 h-10"
                         className="rounded-full"
                      />
                      <div>
                        <p className="text-white font-bold leading-none">
                          {dmTarget.displayName}
                        </p>
                        <p className="text-[10px] text-gray-500 font-mono mt-1 ">
                          Direct Notification
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDmTarget(null)}
                      className={cn(
                        "p-2 text-gray-500 transition-colors",
                        isLight ? "hover:text-black" : "hover:text-white",
                      )}
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </header>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {privateMessages
                      .filter(
                        (m) =>
                          (m.senderId === dmTarget.uid &&
                            m.receiverId === currentUser?.uid) ||
                          (m.senderId === currentUser?.uid &&
                            m.receiverId === dmTarget.uid),
                      )
                      .sort(
                        (a, b) =>
                          (typeof a.createdAt === "number" ? a.createdAt : 0) -
                          (typeof b.createdAt === "number" ? b.createdAt : 0),
                      ).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
                        <MessageCircle className="w-12 h-12 mb-4" />
                        <p className="text-xs font-mono text-gray-500">
                          No messages yet.
                        </p>
                      </div>
                    ) : (
                      privateMessages
                        .filter(
                          (m) =>
                            (m.senderId === dmTarget.uid &&
                              m.receiverId === currentUser?.uid) ||
                            (m.senderId === currentUser?.uid &&
                              m.receiverId === dmTarget.uid),
                        )
                        .map((m) => (
                          <div
                            key={m.id}
                            className={cn(
                              "flex flex-col",
                              m.senderId === currentUser?.uid
                                ? "items-end"
                                : "items-start",
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[80%] p-3 rounded-2xl text-sm",
                                m.senderId === currentUser?.uid
                                  ? "bg-moux-cyan text-discord-black rounded-tr-none"
                                  : "bg-white/5 text-white border border-white/10 rounded-tl-none",
                              )}
                            >
                              {m.text}
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-gray-600 select-none">
                              <span className="text-[8px] font-mono">
                                {formatTime(m.createdAt)}
                              </span>
                              {m.senderId === currentUser?.uid && (
                                <span title={m.read ? "Read message" : "Sent message"}>
                                  {m.read ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-moux-cyan" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-gray-600" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  <form
                    onSubmit={handleSendDM}
                    className="p-4 bg-white/5 border-t border-white/5 flex gap-2"
                  >
                    <input
                      value={dmInput}
                      onChange={(e) => setDmInput(e.target.value)}
                      placeholder="Type a message..."
                      className={cn(
                        "flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-moux-cyan/50",
                        inputMain,
                      )}
                    />
                    <button className="p-3 bg-moux-cyan text-discord-black rounded-xl hover:brightness-110">
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showWorldSettings && worldCountryData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
                onClick={() => setShowWorldSettings(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "w-full max-w-sm rounded-3xl border overflow-hidden shadow-2xl flex flex-col max-h-[80vh]",
                    bgMain,
                    borderMain,
                  )}
                >
                  <div className="p-4 md:p-6 flex items-center justify-between border-b border-white/10 bg-black/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-moux-cyan/10 flex items-center justify-center border border-moux-cyan/20">
                        <ShieldCheck className="w-5 h-5 text-moux-cyan" />
                      </div>
                      <div>
                        <h2 className="text-xl font-sans font-semibold text-white  tracking-tighter">
                          Country Settings
                        </h2>
                        <p className="text-[10px] text-gray-500 font-mono tracking-widest ">
                          President Access
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowWorldSettings(false)}
                      className={cn(
                        "p-2 text-gray-500",
                        isLight ? "hover:text-black" : "hover:text-white",
                      )}
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white tracking-wide">
                          Public Country Chat
                        </p>
                        <p className="text-xs text-gray-500">
                          Allow non-citizens to join.
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          const newVal = !worldCountryData.isPublic;
                          await updateWorldCountry(worldCountryData.id, {
                            isPublic: newVal,
                          });
                          setWorldCountryData({
                            ...worldCountryData,
                            isPublic: newVal,
                          });
                        }}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative",
                          worldCountryData.isPublic
                            ? "bg-moux-cyan"
                            : "bg-gray-600",
                        )}
                      >
                        <div
                          className={cn(
                            "h-4 w-4 bg-white rounded-full absolute top-1 transition-all",
                            worldCountryData.isPublic ? "right-1" : "left-1",
                          )}
                        />
                      </button>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-white tracking-wide mb-2">
                        City Leader Title
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Choose the title given to city owners in your server.
                      </p>

                      <div className="flex flex-col gap-2">
                        {["Prime Minister", "Governor", "King"].map((title) => (
                          <button
                            key={title}
                            onClick={async () => {
                              await updateWorldCountry(worldCountryData.id, {
                                cityOwnerTitle: title,
                              });
                              setWorldCountryData({
                                ...worldCountryData,
                                cityOwnerTitle: title,
                              });
                            }}
                            className={cn(
                              "px-4 py-3 border rounded-xl text-xs font-bold text-left transition-all",
                              worldCountryData.cityOwnerTitle === title
                                ? "border-moux-cyan text-moux-cyan bg-moux-cyan/10"
                                : "border-white/10 text-gray-500 hover:border-white/30",
                            )}
                          >
                            {title}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {activeCommentPost && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end justify-center"
                onClick={() => setActiveCommentPost(null)}
              >
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "w-full max-w-2xl rounded-t-[2.5rem] border-t border-x overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col h-[85vh]",
                    bgMain,
                    borderMain,
                  )}
                >
                  <div className="h-1 w-12 bg-white/10 rounded-full mx-auto mt-3 mb-1" />
                  
                  <div className="p-6 pb-2 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                       <MessageCircle className="w-6 h-6 text-moux-cyan" />
                       <div>
                          <h2 className="text-xl font-sans font-semibold text-white  tracking-tighter">Activity</h2>
                          <p className="text-[10px] text-moux-cyan font-mono tracking-widest ">Notifications</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setActiveCommentPost(null)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                     <div className={cn("p-4 rounded-2xl border bg-white/5", borderMain)}>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-xs font-semibold text-moux-cyan ">{activeCommentPost.authorName}</span>
                           <span className="text-[10px] text-gray-500 font-mono tracking-tighter">{formatTime(activeCommentPost.createdAt)}</span>
                        </div>
                        <p className={cn("text-sm", textMain)}>{activeCommentPost.content}</p>
                        {activeCommentPost.image && (
                           <LazyGifImage 
                             src={activeCommentPost.image || undefined} 
                             alt="Attachment" 
                             className="mt-4 rounded-xl border border-white/5 w-full max-h-48 object-cover"
                           />
                        )}
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <h3 className="text-[10px] font-bold text-gray-500 tracking-widest">Responses ({activeCommentPost.repliesCount || postComments.length})</h3>
                        </div>
                        {postComments.length >= commentLimit && (
                           <div className="text-center pb-2">
                              <button 
                                 onClick={() => setCommentLimit(prev => prev + 10)}
                                 className="text-xs text-moux-cyan hover:text-white font-bold tracking-widest transition-colors"
                              >
                                 Load older comments
                              </button>
                           </div>
                        )}
                        {postComments.length === 0 ? (
                           <div className="py-12 text-center">
                              <p className="text-sm text-gray-500 ">No comments yet. Be the first to share.</p>
                           </div>
                        ) : (
                           postComments.map(comment => (
                              <div key={comment.id} className="flex gap-3 group">
                                 <div className="w-8 h-8 rounded-lg bg-moux-cyan/10 border border-moux-cyan/20 flex items-center justify-center shrink-0">
                                    <UserAvatar uid={comment.authorId} size="w-8 h-8" className="rounded-lg" />

                                 </div>
                                 <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                       <span className="text-xs font-bold text-white">{comment.authorName}</span>
                                       <span className="text-[9px] text-gray-600 font-mono tracking-tighter">{formatTimeAgo(comment.createdAt)}</span>
                                    </div>
                                    {comment.id === editingCommentId ? (
                                      <div className="flex flex-col gap-2 mt-2">
                                        <textarea
                                          value={editingCommentContent}
                                          onChange={(e) => setEditingCommentContent(e.target.value)}
                                          className="w-full bg-black/40 border border-moux-cyan/30 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-moux-cyan"
                                        />
                                        <div className="flex gap-2">
                                          <button onClick={() => setEditingCommentId(null)} className="text-[10px] text-gray-500 hover:text-white">Cancel</button>
                                          <button onClick={() => handleSaveEditAction(comment.id)} className="text-[10px] text-moux-cyan font-bold hover:text-white">Save</button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-gray-400 leading-relaxed">{comment.content}</p>
                                    )}
                                    {comment.image && comment.id !== editingCommentId && (
                                      <LazyGifImage src={comment.image || undefined} alt="Comment attachment" className="mt-2 rounded-xl border border-white/5 w-full max-h-32 object-cover" />
                                    )}
                                    <div className="flex items-center gap-4 mt-2">
                                       <button onClick={() => likeComment(comment.id, currentUser!.uid)} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-red-500">
                                           <Heart className={cn("w-3 h-3", (comment.likes || []).includes(currentUser!.uid) && "fill-current text-red-500")} />
                                           {comment.likes?.length || 0}
                                       </button>
                                       {currentUser?.uid === comment.authorId && comment.id !== editingCommentId && (
                                          <>
                                            <button onClick={() => handleDeleteCommentAction(comment.id, comment.authorId)} className="text-[10px] text-red-500 hover:text-red-400">Delete</button>
                                            <button onClick={() => handleEditCommentAction(comment.id, comment.authorId, comment.content)} className="text-[10px] text-blue-500 hover:text-blue-400">Edit</button>
                                          </>
                                       )}
                                    </div>
                                 </div>
                              </div>
                            ))
                         )}
                      </div>
                   </div>
                            <div className={cn("p-6 border-t", borderMain, bgMain)}>
                      <form onSubmit={handleAddComment} className="flex items-center gap-3">
                         <div className="flex-1 relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                               <button 
                                 type="button"
                                 onClick={() => {
                                   const input = document.getElementById('comment-input');
                                   if (input) {
                                     input.focus();
                                   }
                                 }}
                                 className="p-1 text-gray-500 hover:text-moux-cyan transition-colors"
                               >
                                 <Smile className="w-5 h-5" />
                               </button>
                            </div>
                            <input 
                              type="text"
                              id="comment-input"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Write a comment..."
                              className={cn(
                                "w-full bg-black/40 border rounded-2xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-moux-cyan/50 transition-all",
                                borderMain,
                                textMain
                              )}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                               <CornerDownRight className="w-4 h-4 text-gray-600" />
                            </div>
                         </div>
                         <button 
                           type="submit"
                           disabled={!newComment.trim() || commentLoading}
                           className={cn(
                             "p-4 bg-white text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 font-semibold tracking-wide text-[10px]",
                             commentLoading && "animate-pulse"
                           )}
                         >
                            {commentLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                         </button>
                      </form>
                   </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <CustomMediaPicker
            isOpen={mediaPickerConfig.isOpen}
            mode={mediaPickerConfig.mode}
            onClose={() => setMediaPickerConfig(prev => ({ ...prev, isOpen: false }))}
            onSelect={handleMediaPickerSelect}
          />
          {cropperState && (
            <ImageCropperModal
              imageSrc={cropperState.src}
              onCropComplete={handleCropComplete}
              onClose={() => setCropperState(null)}
              aspectRatio={cropperState.type === 'feed' ? undefined : 1}
              circularCrop={cropperState.type === 'pfp' || cropperState.type === 'server'}
            />
          )}

          {/* Create District Channel Modal */}
          {showCreateChannelModal && selectedServerRefreshed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1001] flex items-center justify-center p-4 font-sans selection:bg-moux-cyan/20"
            >
              <div className={cn("w-full max-w-sm rounded-[2rem] border overflow-hidden shadow-2xl relative", cardMain, borderMain)}>
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2 font-sans">
                      <Radio className="w-5 h-5 text-moux-cyan animate-pulse" /> Initialize District Channel
                    </h2>
                    <button
                      onClick={() => {
                        setShowCreateChannelModal(false);
                        setNewChannelName("");
                        setNewChannelIsPrivate(false);
                        setNewChannelAllowedRoles([]);
                      }}
                      className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-gray-400 mb-1.5 uppercase">
                        Channel Identity Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. general-hq"
                        value={newChannelName}
                        onChange={(e) => {
                          const sanitized = e.target.value.toLowerCase().replace(/[\s#]+/g, "-");
                          setNewChannelName(sanitized);
                        }}
                        className={cn("w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-moux-cyan/50 font-mono", inputMain)}
                      />
                      <p className="text-[9px] text-gray-500 mt-1 font-mono">
                        Supports lowercase words auto-hyphenated for compatibility.
                      </p>
                    </div>

                    <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl p-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-white font-sans flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-moux-cyan" /> Private Vault Channel
                        </span>
                        <p className="text-[10px] text-gray-500">
                          Secure decryption keys required to read chat.
                        </p>
                      </div>
                      <button
                        onClick={() => setNewChannelIsPrivate(!newChannelIsPrivate)}
                        className={cn(
                          "w-10 h-6 rounded-full p-1 transition-all duration-300 relative cursor-pointer",
                          newChannelIsPrivate ? "bg-moux-cyan" : "bg-neutral-800"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 bg-black rounded-full transition-all duration-300 transform",
                          newChannelIsPrivate ? "translate-x-4" : "translate-x-0"
                        )} />
                      </button>
                    </div>

                    {newChannelIsPrivate && (
                      <div className="space-y-2 bg-black/40 border border-white/5 rounded-2xl p-3.5 animate-fade-in duration-350">
                        <span className="block text-[10px] font-mono tracking-wider text-gray-400 mb-1 uppercase">
                          Authorized Membership Tiers
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {["pro", "pro_plus", "veteran"].map((role) => {
                            const isSelected = newChannelAllowedRoles.includes(role);
                            return (
                              <button
                                key={role}
                                onClick={() => {
                                  if (isSelected) {
                                    setNewChannelAllowedRoles(newChannelAllowedRoles.filter(r => r !== role));
                                  } else {
                                    setNewChannelAllowedRoles([...newChannelAllowedRoles, role]);
                                  }
                                }}
                                className={cn(
                                  "w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-[11px] font-mono transition-all border cursor-pointer",
                                  isSelected 
                                    ? "bg-moux-cyan/15 text-moux-cyan border-moux-cyan/30" 
                                    : "bg-transparent text-gray-500 border-white/5 hover:border-white/10"
                                )}
                              >
                                <span className="uppercase">{role}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-moux-cyan" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={() => {
                        setShowCreateChannelModal(false);
                        setNewChannelName("");
                        setNewChannelIsPrivate(false);
                        setNewChannelAllowedRoles([]);
                      }}
                      className={cn("flex-1 py-3 text-xs font-semibold rounded-xl border hover:bg-white/5 active:scale-95 transition-all text-gray-400 cursor-pointer font-sans", borderMain)}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!newChannelName.trim()) {
                          showToast("Specify channel identity name first.", "error");
                          return;
                        }
                        const nameFormatted = newChannelName.startsWith("#") ? newChannelName : `# ${newChannelName}`;
                        const result = await createDistrictChannel(
                          selectedServerRefreshed.id,
                          nameFormatted,
                          newChannelIsPrivate,
                          newChannelIsPrivate ? newChannelAllowedRoles : []
                        );
                        if (result) {
                          showToast(`District Channel "${nameFormatted}" initialized.`, "success");
                          setNewChannelName("");
                          setNewChannelIsPrivate(false);
                          setNewChannelAllowedRoles([]);
                          setShowCreateChannelModal(false);
                          setActiveDistrict(result);
                          setActiveWorldRoom(`${selectedServerRefreshed.id}_${result.district_id}`);
                        }
                      }}
                      className="flex-1 bg-moux-cyan text-black py-3 text-xs font-bold font-mono tracking-wider rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
                    >
                      Deploy
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {showServerSettings && activeCommunityServer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1001] flex items-center justify-center p-4"
            >
              <div className={cn("w-full max-w-sm rounded-[2rem] border overflow-hidden shadow-2xl", cardMain, borderMain)}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                      <Settings className="w-5 h-5 text-moux-cyan" /> Server Settings
                    </h2>
                    <button onClick={() => setShowServerSettings(false)} className="text-gray-500 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-400 mb-2 font-mono uppercase tracking-wider">Edit Server Name:</h3>
                      <input 
                        type="text" 
                        value={serverSettingsName} 
                        onChange={(e) => setServerSettingsName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-moux-cyan/40"
                        placeholder="My Premium Server"
                      />
                    </div>
                    
                    <div className="bg-white/[0.02] dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-xl p-4 space-y-4">
                      <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 font-mono tracking-wide uppercase border-b border-white/5 pb-2">Privacy & Verification</h3>
                      
                      {/* Public/Private Toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-gray-200 block">Public Server</span>
                          <span className="text-[10px] text-gray-500">Accessible from search lists</span>
                        </div>
                        <button
                          onClick={() => setServerSettingsIsPublic(!serverSettingsIsPublic)}
                          className={cn(
                            "w-10 h-5 rounded-full p-0.5 transition-colors relative",
                            serverSettingsIsPublic ? "bg-moux-cyan" : "bg-gray-600"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 bg-black rounded-full transition-transform",
                            serverSettingsIsPublic ? "translate-x-5" : "translate-x-0"
                          )} />
                        </button>
                      </div>

                      {/* Require Verification Toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-gray-200 block">Enforce Verification</span>
                          <span className="text-[10px] text-gray-500">Require Blue/Gold check to chat</span>
                        </div>
                        <button
                          onClick={() => setServerSettingsRequireVerification(!serverSettingsRequireVerification)}
                          className={cn(
                            "w-10 h-5 rounded-full p-0.5 transition-colors relative",
                            serverSettingsRequireVerification ? "bg-moux-cyan" : "bg-gray-600"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 bg-black rounded-full transition-transform",
                            serverSettingsRequireVerification ? "translate-x-5" : "translate-x-0"
                          )} />
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={async () => {
                          if (!serverSettingsName.trim()) {
                            showToast("Server name cannot be empty.", "error");
                            return;
                          }
                          try {
                            const { doc, updateDoc } = await import("firebase/firestore");
                            const { db } = await import("./firebase");
                            await updateDoc(doc(db, "community_servers", activeCommunityServer.id), {
                              name: serverSettingsName.trim(),
                              isPublic: serverSettingsIsPublic,
                              requireVerification: serverSettingsRequireVerification
                            });
                            showToast("Server configurations saved! 🛡️", "success");
                            setShowServerSettings(false);
                          } catch (e: any) {
                            console.error(e);
                            showToast("Failed to updates server settings.", "error");
                          }
                        }}
                        className="w-full py-3.5 rounded-xl bg-moux-cyan text-black font-extrabold text-xs tracking-wider uppercase hover:brightness-110 active:scale-[0.98] transition-all"
                      >
                        Save Server Configurations
                      </button>

                      <button 
                        onClick={() => {
                          setConfirmDialog({
                            message: `Are you absolutely certain you want to permanently dismantle and wipe '${activeCommunityServer.name}'? All channel logs and discussions will be deleted forever under compliance rules.`,
                            onConfirm: async () => {
                              try {
                                const { doc, deleteDoc } = await import("firebase/firestore");
                                const { db } = await import("./firebase");
                                await deleteDoc(doc(db, "community_servers", activeCommunityServer.id));
                                showToast("Community Server destroyed.", "success");
                                setShowServerSettings(false);
                                setActiveCommunityServer(null);
                                setActiveWorldRoom(null);
                              } catch (e: any) {
                                console.error(e);
                                showToast("Failed to delete server.", "error");
                              } finally {
                                setConfirmDialog(null);
                              }
                            }
                          });
                        }}
                        className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 font-bold text-xs hover:bg-red-500/10 transition-colors"
                      >
                        Dismantle & Delete Server
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {confirmDialog && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-white tracking-tight">Confirm Action</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">{confirmDialog.message}</p>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setConfirmDialog(null)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        confirmDialog.onConfirm();
                        setConfirmDialog(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-moux-cyan/20 hover:bg-moux-cyan/30 text-moux-cyan text-xs font-bold transition-all border border-moux-cyan/30"
                    >
                      Confirm
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <SelarCheckoutModal
            isOpen={isSelarModalOpen}
            onClose={() => setIsSelarModalOpen(false)}
            currentUser={currentUser}
            isLight={isLight}
            onBalanceUpdated={(newBalance) => {
              setCurrentUser(prev => prev ? { ...prev, mouxBalance: newBalance } : prev);
            }}
            onProfileUpdated={(updates) => {
              setCurrentUser(prev => prev ? { ...prev, ...updates } : prev);
            }}
            showToast={showToast}
          />

           <MediaLightbox
            isOpen={isLightboxOpen}
            src={lightboxMedia || ""}
            onClose={() => {
              setIsLightboxOpen(false);
              setLightboxMedia(null);
            }}
          />

          {/* MouxBot Core Locked Wall Gate Modal */}
          <AnimatePresence>
            {isMouxbotGateLockedModalOpen && (
              <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsMouxbotGateLockedModalOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="w-full max-w-md rounded-2xl bg-[#09090b] border border-white/10 p-6 text-center space-y-6 shadow-2xl relative z-10"
                >
                  <div className="absolute top-4 right-4 text-[7px] bg-red-500/10 border border-red-500/20 text-red-500 px-2 py-0.5 rounded-none font-bold uppercase tracking-wider font-mono">
                    Node Locked
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center relative mx-auto mt-4">
                    <svg viewBox="0 0 100 100" className="w-8 h-8 fill-current text-white opacity-30" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 85V15h14l21 34 21-34h14v70H71V40L50 74 29 40v45H15z" />
                    </svg>
                    <Lock className="w-4 h-4 text-red-500 absolute bottom-1 right-1 bg-black p-0.5 rounded-full border border-red-500/30" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest font-mono">MouxBot Core Locked</h3>
                    <p className="text-xs text-gray-400 font-sans max-w-xs mx-auto leading-relaxed">
                      MouxBot Core is locked. Upgrade to Pro or Veteran status to unlock your terminal.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 font-sans pt-2">
                    <button
                      onClick={() => {
                        setIsMouxbotGateLockedModalOpen(false);
                        setIsSelarModalOpen(true);
                      }}
                      className="w-full py-3 bg-moux-cyan text-black text-xs font-black tracking-widest uppercase transition-all rounded-xl hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer border-0"
                    >
                      <Sparkles className="w-4 h-4" /> Open Shop & Upgrade
                    </button>
                    <button
                      onClick={() => setIsMouxbotGateLockedModalOpen(false)}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold tracking-widest uppercase transition-all rounded-xl border border-white/5 cursor-pointer"
                    >
                      Dismiss Connection
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* MouxBot Veteran-Tier Post Intelligence Block Modal */}
          <AnimatePresence>
            {isVeteranMouxBotPostIntelligenceModalOpen && (
              <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsVeteranMouxBotPostIntelligenceModalOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="w-full max-w-md rounded-2xl bg-[#09090b] border border-white/10 p-6 text-center space-y-6 shadow-2xl relative z-10"
                >
                  <div className="absolute top-4 right-4 text-[7px] bg-moux-cyan/10 border border-moux-cyan/25 text-moux-cyan px-2 py-0.5 rounded-none font-bold uppercase tracking-wider font-mono">
                    Clearance Required
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center relative mx-auto mt-4">
                    <svg viewBox="0 0 100 100" className="w-8 h-8 fill-current text-white opacity-30" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 85V15h14l21 34 21-34h14v70H71V40L50 74 29 40v45H15z" />
                    </svg>
                    <Lock className="w-4 h-4 text-moux-cyan absolute bottom-1 right-1 bg-black p-0.5 rounded-full border border-moux-cyan/30" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest font-mono">Post Intelligence Restricted</h3>
                    <p className="text-xs text-gray-400 font-sans max-w-xs mx-auto leading-relaxed">
                      MouxBot Post Intelligence is reserved exclusively for Veteran Tier operatives. Upgrade to access MouxBot.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 font-sans pt-2">
                    <button
                      onClick={() => {
                        setIsVeteranMouxBotPostIntelligenceModalOpen(false);
                        setIsSelarModalOpen(true);
                      }}
                      className="w-full py-3 bg-moux-cyan text-black text-xs font-black tracking-widest uppercase transition-all rounded-xl hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer border-0"
                    >
                      <Sparkles className="w-4 h-4" /> Open Shop & Buy Veteran
                    </button>
                    <button
                      onClick={() => setIsVeteranMouxBotPostIntelligenceModalOpen(false)}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold tracking-widest uppercase transition-all rounded-xl border border-white/5 cursor-pointer"
                    >
                      Dismiss Connection
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Onboarding Funnel Gate Overlay */}
      <AnimatePresence>
        {currentUser?.is_new_user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-[150] flex items-center justify-center p-4 backdrop-blur-xl",
              isLight ? "bg-white/90" : "bg-black/90"
            )}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className={cn(
                "w-full max-w-sm rounded-[32px] border p-8 flex flex-col items-center text-center shadow-2xl relative",
                isLight ? "bg-white border-gray-200 text-black shadow-gray-200/50" : "bg-discord-dark border-white/10 text-white shadow-black/80"
              )}
            >
              {onboardingPhase === 'avatar' ? (
                <>
                  <div className="absolute top-4 right-6 text-xs text-gray-500 font-mono">
                    Step 1 / 2
                  </div>
                  
                  <h2 className="text-xl font-bold tracking-tight mb-2 mt-2">
                    Visual Identity
                  </h2>
                  <p className={cn("text-xs leading-relaxed mb-8 max-w-[280px]", isLight ? "text-gray-600" : "text-gray-400")}>
                    First impression is permanent. Stand out by uploading a unique signature profile avatar.
                  </p>

                  <div className="relative group mb-8">
                    <input
                      type="file"
                      accept="image/*"
                      id="onboarding-avatar-file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            const base64 = event.target?.result as string;
                            if (base64) {
                              try {
                                const { compressImage } = await import("./lib/imageUtils");
                                const compressed = await compressImage(base64, 256, 0.7);
                                setOnboardingAvatar(compressed);
                              } catch (err) {
                                setOnboardingAvatar(base64);
                              }
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="onboarding-avatar-file"
                      className="cursor-pointer block relative transition-transform hover:scale-105 active:scale-95 duration-200"
                    >
                      <div className={cn(
                        "w-36 h-36 rounded-full overflow-hidden border-2 flex items-center justify-center relative bg-gray-200 shadow-inner",
                        isLight ? "border-gray-300" : "border-white/10"
                      )}>
                        {onboardingAvatar ? (
                          <img
                            src={onboardingAvatar}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-full"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-white rounded-full" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-full text-white">
                          <Upload className="w-6 h-6 mb-1 text-white" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white">Change</span>
                        </div>
                      </div>
                    </label>
                  </div>

                  <button
                    onClick={() => {
                      const input = document.getElementById('onboarding-avatar-file') as HTMLInputElement;
                      input?.click();
                    }}
                    className="w-full py-3 px-4 bg-moux-cyan text-black text-xs font-bold tracking-wider rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-3 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-black" /> Upload Profile Picture
                  </button>

                  <button
                    onClick={() => {
                      // Skip preserves pristine white canvas
                      setOnboardingAvatar("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23ffffff'/></svg>");
                      setOnboardingPhase('username');
                    }}
                    className={cn(
                      "w-full py-3 px-4 text-xs font-mono tracking-wider rounded-xl transition-all cursor-pointer",
                      isLight ? "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    Skip for Now
                  </button>

                  {onboardingAvatar !== "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23ffffff'/></svg>" && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setOnboardingPhase('username')}
                      className="w-full mt-3 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold tracking-wide rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      Continue with Photo <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </>
              ) : (
                <>
                  <div className="absolute top-4 right-6 text-xs text-gray-500 font-mono">
                    Step 2 / 2
                  </div>

                  <h2 className="text-xl font-bold tracking-tight mb-2 mt-2">
                    Create Your Username
                  </h2>
                  <p className={cn("text-xs leading-relaxed mb-8 max-w-[280px]", isLight ? "text-gray-600" : "text-gray-400")}>
                    Secure a unique identity on the network. This handle cannot be skipped and must be at least 3 characters.
                  </p>

                  <div className="w-full relative mb-1.55">
                    <span className="absolute left-4 top-3.5 text-gray-400 font-semibold font-mono text-sm">@</span>
                    <input
                      type="text"
                      value={onboardingUsername}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className={cn(
                        "w-full pl-8 pr-10 py-3.5 border rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-moux-cyan/50 focus:border-moux-cyan/50 transition-all font-mono",
                        isLight ? "bg-gray-50 border-gray-300 text-black" : "bg-black border-[#333333] text-white"
                      )}
                      placeholder="username"
                      disabled={isSavingOnboarding}
                    />
                    {checkingUsername && (
                      <span className="absolute right-4 top-4">
                        <Loader2 className="w-4 h-4 animate-spin text-moux-cyan" />
                      </span>
                    )}
                  </div>

                  <div className="min-h-[22px] w-full text-left mb-6">
                    {usernameAvailabilityError ? (
                      <span className="text-red-500 text-[11px] font-mono flex items-center gap-1 pl-1">
                        <ShieldAlert className="w-3 h-3 text-red-500" /> {usernameAvailabilityError}
                      </span>
                    ) : onboardingUsername && onboardingUsername.length >= 3 && !checkingUsername ? (
                      <span className="text-green-500 text-[11px] font-mono flex items-center gap-1 pl-1">
                        <Check className="w-3 h-3 text-green-500" /> Username is available
                      </span>
                    ) : onboardingUsername && onboardingUsername.length < 3 ? (
                      <span className="text-gray-500 text-[11px] font-mono flex items-center gap-1 pl-1">
                        Must be 3+ characters
                      </span>
                    ) : null}
                  </div>

                  <button
                    disabled={onboardingUsername.length < 3 || !!usernameAvailabilityError || checkingUsername || isSavingOnboarding}
                    onClick={async () => {
                      if (onboardingUsername.length < 3 || !!usernameAvailabilityError || checkingUsername) return;
                      setIsSavingOnboarding(true);
                      try {
                        const { updateProfile } = await import("./firebase");
                        await updateProfile(currentUser.uid, {
                          is_new_user: false,
                          avatar_base64: onboardingAvatar,
                          username: onboardingUsername.toLowerCase(),
                          displayName: onboardingUsername
                        });
                        
                        setCurrentUser({
                          ...currentUser,
                          is_new_user: false,
                          avatar_base64: onboardingAvatar,
                          username: onboardingUsername.toLowerCase(),
                          displayName: onboardingUsername
                        });
                        
                        showToast(`Profile setup successful! Welcome @${onboardingUsername}! ✨`, "success");
                      } catch (err) {
                        console.error("Failed completing onboarding:", err);
                        showToast("Setup transaction failed.", "error");
                      } finally {
                        setIsSavingOnboarding(false);
                      }
                    }}
                    className={cn(
                      "w-full py-3.5 px-4 text-xs font-bold tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2",
                      onboardingUsername.length < 3 || !!usernameAvailabilityError || checkingUsername || isSavingOnboarding
                        ? "bg-gray-400/20 text-gray-500 border border-gray-400/10 cursor-not-allowed"
                        : "bg-moux-cyan text-black hover:brightness-110 active:scale-[0.98]"
                    )}
                  >
                    {isSavingOnboarding ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" /> Finishing...
                      </>
                    ) : (
                      "Finish Setup"
                    )}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
