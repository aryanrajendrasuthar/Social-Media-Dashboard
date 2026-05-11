const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 2200 },
  imageUrl: { type: String, default: '' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  commentsCount: { type: Number, default: 0 },
  sharesCount: { type: Number, default: 0 },
  hashtags: [{ type: String }],
}, { timestamps: true });

// Extract hashtags from content before save
postSchema.pre('save', function (next) {
  const tags = this.content.match(/#\w+/g);
  this.hashtags = tags ? tags.map(t => t.toLowerCase().slice(1)) : [];
  next();
});

postSchema.index({ hashtags: 1 });
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
