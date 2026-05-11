const express = require('express');
const {
  getProfile, getUserPosts, toggleFollow,
  getFollowers, getFollowing, searchUsers, getSuggestedUsers,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/suggested', protect, getSuggestedUsers);
router.get('/:username', protect, getProfile);
router.get('/:username/posts', protect, getUserPosts);
router.get('/:username/followers', protect, getFollowers);
router.get('/:username/following', protect, getFollowing);
router.post('/:userId/follow', protect, toggleFollow);

module.exports = router;
