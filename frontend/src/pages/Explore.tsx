import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { postsAPI, usersAPI } from '../services/api';
import { Post, User } from '../types';
import PostCard from '../components/Feed/PostCard';
import Avatar from '../components/Common/Avatar';
import toast from 'react-hot-toast';

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const Explore: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [trending, setTrending] = useState<{ tag: string; count: number }[]>([]);
  const [tab, setTab] = useState<'posts' | 'users'>('posts');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    postsAPI.getTrending().then(({ data }) => setTrending(data)).catch(() => {});
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setPosts([]); setUsers([]); return; }
    setLoading(true);
    try {
      const [postRes, userRes] = await Promise.all([
        postsAPI.search(q),
        usersAPI.search(q),
      ]);
      setPosts(postRes.data);
      setUsers(userRes.data);
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    if (q) search(q);
  }, [searchParams, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) setSearchParams({ q: query });
  };

  const handleTagClick = (tag: string) => {
    const q = `#${tag}`;
    setQuery(q);
    setSearchParams({ q });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Explore</h2>
        <p className="text-gray-500 text-sm mt-1">Discover posts, users, and trending topics</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          <SearchIcon />
        </div>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search posts, users, #hashtags..."
          className="w-full bg-dark-700 border border-dark-400 rounded-2xl pl-12 pr-4 py-3.5 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-1.5 rounded-xl text-sm font-medium transition-colors"
        >
          Search
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main results */}
        <div className="lg:col-span-2">
          {query && (
            <div className="flex gap-2 mb-4">
              {(['posts', 'users'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors
                    ${tab === t ? 'bg-brand-500 text-white' : 'bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-500'}`}
                >
                  {t} {t === 'posts' ? `(${posts.length})` : `(${users.length})`}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-400" />
            </div>
          ) : !query ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-medium text-white">Search for anything</p>
              <p className="text-sm mt-1">Try a hashtag, username, or keyword</p>
            </div>
          ) : tab === 'posts' ? (
            posts.length === 0 ? (
              <p className="text-center py-10 text-gray-500">No posts found for "{query}"</p>
            ) : (
              <div className="space-y-4">
                {posts.map(post => <PostCard key={post._id} post={post} />)}
              </div>
            )
          ) : (
            users.length === 0 ? (
              <p className="text-center py-10 text-gray-500">No users found for "{query}"</p>
            ) : (
              <div className="space-y-3">
                {users.map(u => (
                  <Link
                    key={u._id}
                    to={`/profile/${u.username}`}
                    className="flex items-center gap-4 p-4 bg-dark-700 rounded-2xl border border-dark-500 hover:border-dark-400 transition-all"
                  >
                    <Avatar src={u.avatarUrl} username={u.username} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">@{u.username}</p>
                      <p className="text-sm text-gray-500 truncate">{u.bio || 'No bio'}</p>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                      <p>{u.followersCount} followers</p>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}
        </div>

        {/* Trending sidebar */}
        <div className="space-y-4">
          <div className="bg-dark-700 rounded-2xl border border-dark-500 p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Trending Hashtags
            </h3>
            {trending.length === 0 ? (
              <p className="text-gray-600 text-sm">No trending topics yet</p>
            ) : (
              <div className="space-y-2">
                {trending.map(({ tag, count }, i) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-dark-500 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-xs w-5">{i + 1}</span>
                      <span className="text-brand-400 font-medium text-sm group-hover:text-brand-300">#{tag}</span>
                    </div>
                    <span className="text-gray-600 text-xs">{count} posts</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
