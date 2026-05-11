const express = require('express');
const {
  createPost, getFeed, getPost, deletePost,
  toggleLike, getComments, addComment, getTrending, searchPosts,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/feed', protect, getFeed);
router.get('/trending', protect, getTrending);
router.get('/search', protect, searchPosts);
router.post('/', protect, upload.single('image'), createPost);
router.get('/:id', protect, getPost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);
router.get('/:id/comments', protect, getComments);
router.post('/:id/comments', protect, addComment);

module.exports = router;
