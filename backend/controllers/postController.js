const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { getRedis } = require('../config/redis');

// Create a post
const createPost = async (req, res) => {
  const { content } = req.body;
  if (!content && !req.file) return res.status(400).json({ message: 'Content or image required' });
  try {
    const post = await Post.create({
      userId: req.user._id,
      content: content || '',
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
    });
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });

    // Invalidate feed cache for followers
    const redis = getRedis();
    if (redis && redis.status === 'ready') {
      const followers = await Follow.find({ followingId: req.user._id }).select('followerId');
      await Promise.all(followers.map(f => redis.del(`feed:${f.followerId}`)));
    }

    const populated = await Post.findById(post._id).populate('userId', 'username avatarUrl');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get home feed (cursor-based pagination)
const getFeed = async (req, res) => {
  const { cursor, limit = 10 } = req.query;
  const userId = req.user._id.toString();
  const redis = getRedis();

  try {
    const following = await Follow.find({ followerId: userId }).select('followingId');
    const followingIds = following.map(f => f.followingId);
    followingIds.push(req.user._id); // include own posts

    const query = { userId: { $in: followingIds } };
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

// Get single post
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('userId', 'username avatarUrl');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Unauthorized' });
    await post.deleteOne();
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: -1 } });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Like / Unlike post
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const liked = post.likes.includes(req.user._id);
    if (liked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
      // Emit notification
      if (post.userId.toString() !== req.user._id.toString()) {
        const notif = await Notification.create({
          userId: post.userId,
          type: 'like',
          fromUserId: req.user._id,
          postId: post._id,
        });
        const io = req.app.get('io');
        io.to(`user:${post.userId}`).emit('notification:new', {
          ...notif.toObject(),
          fromUser: { _id: req.user._id, username: req.user.username, avatarUrl: req.user.avatarUrl },
        });
      }
    }
    await post.save();
    res.json({ likes: post.likes.length, liked: !liked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get comments
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('userId', 'username avatarUrl');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add comment
const addComment = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Comment text required' });
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({ postId: post._id, userId: req.user._id, text });
    await Post.findByIdAndUpdate(post._id, { $inc: { commentsCount: 1 } });
    await comment.populate('userId', 'username avatarUrl');

    if (post.userId.toString() !== req.user._id.toString()) {
      const notif = await Notification.create({
        userId: post.userId,
        type: 'comment',
        fromUserId: req.user._id,
        postId: post._id,
      });
      const io = req.app.get('io');
      io.to(`user:${post.userId}`).emit('notification:new', {
        ...notif.toObject(),
        fromUser: { _id: req.user._id, username: req.user.username, avatarUrl: req.user.avatarUrl },
      });
    }

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Share post
const sharePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await Post.findByIdAndUpdate(post._id, { $inc: { sharesCount: 1 } });

    if (post.userId.toString() !== req.user._id.toString()) {
      const notif = await Notification.create({
        userId: post.userId,
        type: 'share',
        fromUserId: req.user._id,
        postId: post._id,
      });
      const io = req.app.get('io');
      io.to(`user:${post.userId}`).emit('notification:new', {
        ...notif.toObject(),
        fromUser: { _id: req.user._id, username: req.user.username, avatarUrl: req.user.avatarUrl },
      });
    }

    res.json({ sharesCount: post.sharesCount + 1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get trending hashtags
const getTrending = async (req, res) => {
  const redis = getRedis();
  const cacheKey = 'trending:hashtags';
  try {
    if (redis && redis.status === 'ready') {
      const cached = await redis.get(cacheKey);
      if (cached) return res.json(JSON.parse(cached));
    }

    const trending = await Post.aggregate([
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { tag: '$_id', count: 1, _id: 0 } },
    ]);

    if (redis && redis.status === 'ready') {
      await redis.set(cacheKey, JSON.stringify(trending), 'EX', 300);
    }
    res.json(trending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search posts by hashtag or content
const searchPosts = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  try {
    const tag = q.startsWith('#') ? q.slice(1).toLowerCase() : q.toLowerCase();
    const posts = await Post.find({
      $or: [
        { hashtags: tag },
        { content: { $regex: q, $options: 'i' } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('userId', 'username avatarUrl');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPost, getFeed, getPost, deletePost, toggleLike, getComments, addComment, sharePost, getTrending, searchPosts };
