const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');

// Get user profile by username
const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isFollowing = req.user
      ? !!(await Follow.findOne({ followerId: req.user._id, followingId: user._id }))
      : false;

    res.json({ ...user.toObject(), isFollowing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's posts
const getUserPosts = async (req, res) => {
  const { cursor, limit = 12 } = req.query;
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const query = { userId: user._id };
    if (cursor) query.createdAt = { $lt: new Date(cursor) };

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) + 1)
      .populate('userId', 'username avatarUrl');

    const hasMore = posts.length > Number(limit);
    if (hasMore) posts.pop();
    const nextCursor = hasMore ? posts[posts.length - 1].createdAt.toISOString() : null;

    res.json({ posts, nextCursor, hasMore });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Follow / Unfollow
const toggleFollow = async (req, res) => {
  const targetId = req.params.userId;
  if (targetId === req.user._id.toString())
    return res.status(400).json({ message: "Can't follow yourself" });

  try {
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: 'User not found' });

    const existing = await Follow.findOne({ followerId: req.user._id, followingId: targetId });

    if (existing) {
      await existing.deleteOne();
      await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } });
      await User.findByIdAndUpdate(targetId, { $inc: { followersCount: -1 } });
      res.json({ following: false });
    } else {
      await Follow.create({ followerId: req.user._id, followingId: targetId });
      await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } });
      await User.findByIdAndUpdate(targetId, { $inc: { followersCount: 1 } });

      const notif = await Notification.create({
        userId: targetId,
        type: 'follow',
        fromUserId: req.user._id,
      });
      const io = req.app.get('io');
      io.to(`user:${targetId}`).emit('notification:new', {
        ...notif.toObject(),
        fromUser: { _id: req.user._id, username: req.user.username, avatarUrl: req.user.avatarUrl },
      });

      res.json({ following: true });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get followers list
const getFollowers = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const follows = await Follow.find({ followingId: user._id }).populate('followerId', 'username avatarUrl bio');
    res.json(follows.map(f => f.followerId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get following list
const getFollowing = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const follows = await Follow.find({ followerId: user._id }).populate('followingId', 'username avatarUrl bio');
    res.json(follows.map(f => f.followingId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search users
const searchUsers = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  try {
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
      ],
    })
      .select('-passwordHash')
      .limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get suggested users (not yet following)
const getSuggestedUsers = async (req, res) => {
  try {
    const following = await Follow.find({ followerId: req.user._id }).select('followingId');
    const followingIds = following.map(f => f.followingId.toString());
    followingIds.push(req.user._id.toString());

    const suggested = await User.find({ _id: { $nin: followingIds } })
      .select('-passwordHash')
      .limit(5);
    res.json(suggested);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProfile, getUserPosts, toggleFollow, getFollowers, getFollowing, searchUsers, getSuggestedUsers };
