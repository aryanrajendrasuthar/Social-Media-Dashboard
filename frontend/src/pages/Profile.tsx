import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { User, Post } from '../types';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Common/Avatar';
import PostCard from '../components/Feed/PostCard';
import toast from 'react-hot-toast';

const GridIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

interface FollowListModalProps {
  username: string;
  type: 'followers' | 'following';
  onClose: () => void;
}

const FollowListModal: React.FC<FollowListModalProps> = ({ username, type, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fn = type === 'followers' ? usersAPI.getFollowers : usersAPI.getFollowing;
    fn(username)
      .then(({ data }) => setUsers(data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [username, type]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-700 rounded-2xl border border-dark-400 w-full max-w-sm max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-500">
          <h3 className="text-white font-bold capitalize">{type}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 rounded-full border-2 border-brand-400 border-t-transparent" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No {type} yet</p>
          ) : (
            users.map(u => (
              <Link
                key={u._id}
                to={`/profile/${u.username}`}
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-500 transition-colors"
              >
                <Avatar src={u.avatarUrl} username={u.username} size="md" />
                <div>
                  <p className="text-white font-medium text-sm">@{u.username}</p>
                  <p className="text-gray-500 text-xs truncate max-w-[180px]">{u.bio || 'No bio'}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [followModal, setFollowModal] = useState<'followers' | 'following' | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    try {
      const { data } = await usersAPI.getProfile(username);
      setProfile(data);
    } catch {
      toast.error('User not found');
    } finally {
      setLoading(false);
    }
  }, [username]);

  const fetchPosts = useCallback(async (c?: string) => {
    if (!username) return;
    setPostsLoading(true);
    try {
      const { data } = await usersAPI.getUserPosts(username, c);
      if (c) setPosts(prev => [...prev, ...data.posts]);
      else setPosts(data.posts);
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
    setPosts([]);
    setCursor(null);
    setHasMore(true);
  }, [username, fetchProfile, fetchPosts]);

  const handleFollow = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      const { data } = await usersAPI.follow(profile._id);
      setProfile(prev => prev ? {
        ...prev,
        isFollowing: data.following,
        followersCount: data.following ? prev.followersCount + 1 : prev.followersCount - 1,
      } : null);
    } catch {
      toast.error('Failed to update follow');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-dark-700 rounded-2xl border border-dark-500 animate-pulse">
          <div className="h-40 bg-dark-500 rounded-t-2xl" />
          <div className="px-6 pb-6">
            <div className="w-20 h-20 rounded-full bg-dark-500 -mt-10 border-4 border-dark-700" />
            <div className="mt-4 space-y-2">
              <div className="h-5 w-32 bg-dark-500 rounded" />
              <div className="h-3 w-48 bg-dark-500 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  const isOwn = me?._id === profile._id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Profile Card */}
      <div className="bg-dark-700 rounded-2xl border border-dark-500 overflow-hidden mb-6">
        {/* Cover */}
        <div className="h-40 bg-gradient-to-br from-brand-600/40 to-dark-600 relative">
          {profile.coverUrl && (
            <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="px-6 pb-6">
          {/* Avatar + Actions */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-brand-500/20 border-4 border-dark-700 flex items-center justify-center">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-brand-400 font-bold text-2xl">{profile.username[0].toUpperCase()}</span>
              )}
            </div>
            <div className="flex gap-2">
              {isOwn ? (
                <Link
                  to="/settings"
                  className="px-5 py-2 bg-dark-500 hover:bg-dark-400 text-white rounded-xl text-sm font-medium transition-colors border border-dark-400"
                >
                  Edit Profile
                </Link>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                    ${profile.isFollowing
                      ? 'bg-dark-500 hover:bg-red-500/20 hover:text-red-400 text-white border border-dark-400'
                      : 'bg-brand-500 hover:bg-brand-600 text-white'
                    }`}
                >
                  {followLoading ? '...' : profile.isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          {/* Info */}
          <h1 className="text-xl font-bold text-white">@{profile.username}</h1>
          {profile.bio && <p className="text-gray-400 text-sm mt-1">{profile.bio}</p>}

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <p className="text-white font-bold">{profile.postsCount}</p>
              <p className="text-gray-500 text-xs">Posts</p>
            </div>
            <button
              onClick={() => setFollowModal('followers')}
              className="text-center hover:opacity-80 transition-opacity"
            >
              <p className="text-white font-bold">{profile.followersCount}</p>
              <p className="text-gray-500 text-xs">Followers</p>
            </button>
            <button
              onClick={() => setFollowModal('following')}
              className="text-center hover:opacity-80 transition-opacity"
            >
              <p className="text-white font-bold">{profile.followingCount}</p>
              <p className="text-gray-500 text-xs">Following</p>
            </button>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Posts</h3>
        <div className="flex gap-1 bg-dark-700 rounded-xl p-1">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:text-white'}`}
          >
            <GridIcon />
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${view === 'list' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:text-white'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Posts */}
      {postsLoading && posts.length === 0 ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-400" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-3">📝</div>
          <p className="font-medium text-white">No posts yet</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-3 gap-2">
          {posts.map(post => (
            <div key={post._id} className="aspect-square bg-dark-600 rounded-xl overflow-hidden group relative">
              {post.imageUrl ? (
                <img src={post.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-3 group-hover:bg-dark-500 transition-colors">
                  <p className="text-gray-400 text-xs line-clamp-4 text-center">{post.content}</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white text-xs font-medium">❤️ {post.likes.length}  💬 {post.commentsCount}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => <PostCard key={post._id} post={post} />)}
        </div>
      )}

      {hasMore && posts.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => fetchPosts(cursor ?? undefined)}
            disabled={postsLoading}
            className="px-6 py-2.5 bg-dark-600 hover:bg-dark-500 text-gray-400 rounded-xl text-sm font-medium transition-colors border border-dark-400"
          >
            {postsLoading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}

      {/* Follow modal */}
      {followModal && (
        <FollowListModal
          username={profile.username}
          type={followModal}
          onClose={() => setFollowModal(null)}
        />
      )}
    </div>
  );
};

export default Profile;
