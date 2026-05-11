import React, { useState } from 'react';
import Feed from '../components/Feed/Feed';
import StoryBar from '../components/Feed/StoryBar';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState<Post | null>(null);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Home</h2>
        <p className="text-gray-500 text-sm mt-1">Your personalized feed</p>
      </div>
      <StoryBar />
      <Feed newPost={newPost} />
    </div>
  );
};

export default Home;
