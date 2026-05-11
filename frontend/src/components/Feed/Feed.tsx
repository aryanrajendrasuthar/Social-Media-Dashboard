import React, { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { postsAPI } from '../../services/api';
import { Post } from '../../types';
import PostCard from './PostCard';
import toast from 'react-hot-toast';

interface FeedProps {
  newPost?: Post | null;
}

const PostSkeleton = () => (
  <div className="bg-dark-700 rounded-2xl border border-dark-500 p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-dark-500" />
      <div className="space-y-2">
        <div className="h-3 w-24 bg-dark-500 rounded" />
        <div className="h-2 w-16 bg-dark-500 rounded" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 w-full bg-dark-500 rounded" />
      <div className="h-3 w-3/4 bg-dark-500 rounded" />
    </div>
  </div>
);

const Feed: React.FC<FeedProps> = ({ newPost }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { ref: sentinelRef, inView } = useInView({ threshold: 0.1 });

  const fetchFeed = useCallback(async (c?: string) => {
    try {
      const { data } = await postsAPI.getFeed(c);
      if (c) {
        setPosts(prev => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  // Prepend new post from parent
  useEffect(() => {
    if (newPost) setPosts(prev => [newPost, ...prev]);
  }, [newPost]);

  // Infinite scroll trigger
  useEffect(() => {
    if (inView && hasMore && !loadingMore && !loading && cursor) {
      setLoadingMore(true);
      fetchFeed(cursor);
    }
  }, [inView, hasMore, loadingMore, loading, cursor, fetchFeed]);

  const handleDelete = (id: string) => {
    setPosts(prev => prev.filter(p => p._id !== id));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
      </div>
    );
  }

  if (!loading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-white font-semibold text-xl mb-2">Your feed is empty</h3>
        <p className="text-gray-500 text-sm max-w-xs">
          Follow some users or create your first post to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <div key={post._id}>
          <PostCard post={post} onDelete={handleDelete} />
        </div>
      ))}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="py-2" />

      {loadingMore && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-400" />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-6 text-gray-600 text-sm">
          You've reached the end of your feed
        </div>
      )}
    </div>
  );
};

export default Feed;
