import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { Post } from '../types';
import PostCard from '../components/Feed/PostCard';
import toast from 'react-hot-toast';

const PostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    postsAPI.getPost(id)
      .then(({ data }) => setPost(data))
      .catch(() => toast.error('Post not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-400" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg">Post not found</p>
        <Link to="/" className="text-brand-400 text-sm mt-4 block hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link to="/" className="text-gray-500 hover:text-white text-sm mb-4 inline-flex items-center gap-1 transition-colors">
        ← Back
      </Link>
      <div className="mt-4">
        <PostCard post={post} onDelete={() => window.history.back()} />
      </div>
    </div>
  );
};

export default PostPage;
