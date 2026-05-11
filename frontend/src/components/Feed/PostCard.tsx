import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Post, Comment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { postsAPI } from '../../services/api';
import Avatar from '../Common/Avatar';
import toast from 'react-hot-toast';

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const CommentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const ShareIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

interface PostCardProps {
  post: Post;
  onDelete?: (id: string) => void;
  onLikeUpdate?: (id: string, likes: number, liked: boolean) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onDelete, onLikeUpdate }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(user ? post.likes.includes(user._id) : false);
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentCount, setCommentCount] = useState(post.commentsCount);
  const [loadingComments, setLoadingComments] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const handleLike = async () => {
    if (!user) return;
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 300);
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(c => newLiked ? c + 1 : c - 1);
    try {
      await postsAPI.toggleLike(post._id);
      onLikeUpdate?.(post._id, newLiked ? likeCount + 1 : likeCount - 1, newLiked);
    } catch {
      setLiked(!newLiked);
      setLikeCount(c => newLiked ? c - 1 : c + 1);
    }
  };

  const handleToggleComments = async () => {
    setShowComments(v => !v);
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const { data } = await postsAPI.getComments(post._id);
        setComments(data);
      } catch {
        toast.error('Failed to load comments');
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const { data } = await postsAPI.addComment(post._id, commentText.trim());
      setComments(prev => [data, ...prev]);
      setCommentCount(c => c + 1);
      setCommentText('');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
    toast.success('Link copied to clipboard!');
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await postsAPI.deletePost(post._id);
      onDelete?.(post._id);
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const renderContent = (text: string) => {
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, i) =>
      part.startsWith('#') ? (
        <Link key={i} to={`/explore?q=${part}`} className="text-brand-400 hover:underline">
          {part}
        </Link>
      ) : part
    );
  };

  return (
    <article className="bg-dark-700 rounded-2xl border border-dark-500 overflow-hidden hover:border-dark-400 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <Link to={`/profile/${post.userId.username}`} className="flex items-center gap-3 group">
          <Avatar src={post.userId.avatarUrl} username={post.userId.username} size="md" />
          <div>
            <p className="font-semibold text-white group-hover:text-brand-400 transition-colors">
              @{post.userId.username}
            </p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>
        {user && user._id === post.userId._id && (
          <button
            onClick={handleDelete}
            className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-5 pb-3">
        <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{renderContent(post.content)}</p>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="px-5 pb-3">
          <img
            src={post.imageUrl}
            alt="Post image"
            className="w-full rounded-xl object-cover max-h-96"
            loading="lazy"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 px-4 py-3 border-t border-dark-500">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200
            ${liked ? 'text-red-400 bg-red-400/10' : 'text-gray-500 hover:text-red-400 hover:bg-red-400/10'}
            ${likeAnimating ? 'scale-110' : 'scale-100'}`}
        >
          <HeartIcon filled={liked} />
          <span className="text-sm font-medium">{likeCount}</span>
        </button>
        <button
          onClick={handleToggleComments}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200
            ${showComments ? 'text-brand-400 bg-brand-400/10' : 'text-gray-500 hover:text-brand-400 hover:bg-brand-400/10'}`}
        >
          <CommentIcon />
          <span className="text-sm font-medium">{commentCount}</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:text-green-400 hover:bg-green-400/10 transition-all duration-200"
        >
          <ShareIcon />
          <span className="text-sm font-medium">{post.sharesCount}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-dark-500 px-5 py-4 space-y-4">
          {user && (
            <form onSubmit={handleAddComment} className="flex gap-3">
              <Avatar src={user.avatarUrl} username={user.username} size="sm" />
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-dark-600 rounded-xl px-4 py-2 text-sm text-gray-200 placeholder-gray-600 border border-dark-400 focus:outline-none focus:border-brand-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm rounded-xl transition-colors font-medium"
              >
                Post
              </button>
            </form>
          )}
          {loadingComments ? (
            <div className="flex justify-center py-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-400" />
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map(comment => (
                <div key={comment._id} className="flex gap-3">
                  <Avatar src={comment.userId.avatarUrl} username={comment.userId.username} size="sm" />
                  <div className="flex-1 bg-dark-600 rounded-xl px-4 py-3">
                    <Link to={`/profile/${comment.userId.username}`} className="font-medium text-sm text-brand-400 hover:underline">
                      @{comment.userId.username}
                    </Link>
                    <p className="text-gray-300 text-sm mt-1">{comment.text}</p>
                    <p className="text-gray-600 text-xs mt-1">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default PostCard;
