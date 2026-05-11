import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import CreatePostModal from '../Feed/CreatePostModal';
import { Post } from '../../types';

export interface MainLayoutContext {
  newPost: Post | null;
}

const MainLayout: React.FC = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState<Post | null>(null);

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Sidebar onCreatePost={() => setShowCreatePost(true)} />
      <main className="ml-64 min-h-screen">
        <Outlet context={{ newPost } satisfies MainLayoutContext} />
      </main>
      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onPostCreated={(post) => setNewPost(post)}
        />
      )}
    </div>
  );
};

export default MainLayout;
