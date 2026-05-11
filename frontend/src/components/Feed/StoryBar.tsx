import React, { useEffect, useState } from 'react';
import { usersAPI } from '../../services/api';
import { User } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { Link } from 'react-router-dom';
import Avatar from '../Common/Avatar';

const StoryBar: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { onlineUsers } = useSocket();

  useEffect(() => {
    usersAPI.getSuggested().then(({ data }) => setUsers(data)).catch(() => {});
  }, []);

  if (users.length === 0) return null;

  return (
    <div className="bg-dark-700 rounded-2xl border border-dark-500 p-4 mb-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">People you may know</h3>
      <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
        {users.map(user => (
          <Link
            key={user._id}
            to={`/profile/${user.username}`}
            className="flex flex-col items-center gap-2 flex-shrink-0 group"
          >
            <Avatar
              src={user.avatarUrl}
              username={user.username}
              size="lg"
              online={onlineUsers.has(user._id)}
            />
            <span className="text-xs text-gray-400 group-hover:text-white transition-colors max-w-[60px] truncate text-center">
              @{user.username}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StoryBar;
