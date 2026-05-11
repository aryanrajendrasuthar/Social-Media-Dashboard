import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Avatar from '../components/Common/Avatar';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('bio', bio);
      if (file) formData.append('avatar', file);
      const { data } = await authAPI.updateProfile(formData);
      updateUser(data);
      toast.success('Profile updated!');
      setFile(null);
      setPreview(null);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

      <form onSubmit={handleSubmit} className="bg-dark-700 rounded-2xl border border-dark-500 p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar
            src={preview || user?.avatarUrl}
            username={user?.username || ''}
            size="xl"
          />
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Change photo
            </button>
            <p className="text-gray-600 text-xs mt-1">JPG, PNG, GIF up to 5MB</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        </div>

        {/* Username (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Username</label>
          <input
            type="text"
            value={`@${user?.username}`}
            disabled
            className="w-full bg-dark-600 border border-dark-400 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
          <input
            type="email"
            value={user?.email}
            disabled
            className="w-full bg-dark-600 border border-dark-400 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell people about yourself..."
            rows={3}
            maxLength={160}
            className="w-full bg-dark-600 border border-dark-400 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors resize-none"
          />
          <p className="text-gray-600 text-xs mt-1 text-right">{bio.length}/160</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
