// models/index.js
const sequelize = require('../database/connection');
const User = require('./User');
const PredictionHistory = require('./PredictionHistory');
const Message = require('./Message');          // NEW
const MessageFile = require('./MessageFile');  // NEW

// Existing associations
User.hasMany(PredictionHistory, {
  foreignKey: 'user_id',
  as: 'predictions',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
PredictionHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Messaging associations
User.hasMany(Message, { foreignKey: 'sender_id', as: 'messages_sent' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'messages_received' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

Message.hasMany(MessageFile, { foreignKey: 'message_id', as: 'files', onDelete: 'CASCADE' });
MessageFile.belongsTo(Message, { foreignKey: 'message_id', as: 'message' });

module.exports = {
  sequelize,
  User,
  PredictionHistory,
  Message,
  MessageFile,
};
