import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import CreatePostModal from '../Feed/CreatePostModal';

const MainLayout: React.FC = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Sidebar onCreatePost={() => setShowCreatePost(true)} />
      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}
    </div>
  );
};

export default MainLayout;
