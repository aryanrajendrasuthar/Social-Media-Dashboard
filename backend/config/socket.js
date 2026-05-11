const jwt = require('jsonwebtoken');

const onlineUsers = new Map(); // userId -> socketId

const socketHandler = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);

    // Join personal room for targeted notifications
    socket.join(`user:${userId}`);

    io.emit('user:online', { userId });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user:offline', { userId });
    });
  });
};

const getOnlineUsers = () => onlineUsers;

module.exports = socketHandler;
module.exports.getOnlineUsers = getOnlineUsers;
