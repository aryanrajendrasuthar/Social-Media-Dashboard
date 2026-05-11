export interface User {
  _id: string;
  username: string;
  email: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  createdAt: string;
}

export interface Post {
  _id: string;
  userId: User;
  content: string;
  imageUrl: string;
  likes: string[];
  commentsCount: number;
  sharesCount: number;
  hashtags: string[];
  createdAt: string;
}

export interface Comment {
  _id: string;
  postId: string;
  userId: User;
  text: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'share';
  fromUserId: User;
  postId?: Post;
  read: boolean;
  createdAt: string;
}

export interface FeedResponse {
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}
