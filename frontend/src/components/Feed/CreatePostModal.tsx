import React, { useState, useRef } from 'react';
import { postsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../Common/Avatar';
import toast from 'react-hot-toast';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated?: (post: any) => void;
}

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const SUGGESTIONS = ['#photography', '#travel', '#tech', '#design', '#coding', '#art', '#music', '#food'];

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Only images allowed'); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append('content', content);
      if (image) form.append('image', image);
      const { data } = await postsAPI.createPost(form);
      toast.success('Post created!');
      onPostCreated?.(data);
      onClose();
    } catch {
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const addHashtag = (tag: string) => {
    setContent(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + tag + ' ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-700 rounded-2xl border border-dark-400 w-full max-w-lg shadow-2xl transition-all duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-500">
          <h2 className="text-lg font-bold text-white">Create Post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-dark-500">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* User + textarea */}
          <div className="flex gap-3">
            {user && <Avatar src={user.avatarUrl} username={user.username} size="md" />}
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              className="flex-1 bg-dark-600 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 border border-dark-400 focus:outline-none focus:border-brand-500 transition-colors resize-none text-sm"
              maxLength={2200}
            />
          </div>

          {/* Char count */}
          <div className="text-right text-xs text-gray-600">{content.length}/2200</div>

          {/* Hashtag suggestions */}
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => addHashtag(tag)}
                className="text-xs text-brand-400 bg-brand-400/10 hover:bg-brand-400/20 px-3 py-1 rounded-full transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Image drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200
              ${isDragging ? 'border-brand-400 bg-brand-400/10' : 'border-dark-400 hover:border-dark-300'}
              ${preview ? 'border-transparent p-0' : ''}`}
          >
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="w-full rounded-xl max-h-48 object-cover" />
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setImage(null); setPreview(null); }}
                  className="absolute top-2 right-2 bg-dark-800/80 rounded-full p-1 text-white hover:bg-red-500 transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-2 text-gray-500">
                <ImageIcon />
                <p className="text-sm">Drag & drop or <span className="text-brand-400">browse</span></p>
                <p className="text-xs">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-dark-500 rounded-xl transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!content.trim() && !image)}
              className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-semibold text-sm flex items-center gap-2"
            >
              {loading ? <div className="animate-spin w-4 h-4 rounded-full border-2 border-white border-t-transparent" /> : null}
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
