import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (form: FormData) =>
    api.put('/auth/profile', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Posts
export const postsAPI = {
  getFeed: (cursor?: string) =>
    api.get('/posts/feed', { params: cursor ? { cursor } : {} }),
  createPost: (form: FormData) =>
    api.post('/posts', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deletePost: (id: string) => api.delete(`/posts/${id}`),
  toggleLike: (id: string) => api.post(`/posts/${id}/like`),
  getComments: (id: string) => api.get(`/posts/${id}/comments`),
  addComment: (id: string, text: string) => api.post(`/posts/${id}/comments`, { text }),
  getTrending: () => api.get('/posts/trending'),
  search: (q: string) => api.get('/posts/search', { params: { q } }),
};

// Users
export const usersAPI = {
  getProfile: (username: string) => api.get(`/users/${username}`),
  getUserPosts: (username: string, cursor?: string) =>
    api.get(`/users/${username}/posts`, { params: cursor ? { cursor } : {} }),
  follow: (userId: string) => api.post(`/users/${userId}/follow`),
  getFollowers: (username: string) => api.get(`/users/${username}/followers`),
  getFollowing: (username: string) => api.get(`/users/${username}/following`),
  search: (q: string) => api.get('/users/search', { params: { q } }),
  getSuggested: () => api.get('/users/suggested'),
};

// Notifications
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAllRead: () => api.put('/notifications/read-all'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
};

export default api;
