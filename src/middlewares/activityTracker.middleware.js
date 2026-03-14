const advancedTracker = require('../services/advancedTracker.service');
const userTracker = require('../services/userTracker.service');
const socialTracker = require('../services/socialTracker.service');

module.exports = (bot) => {
  // Har qanday xabar uchun faoliyatni kuzatish
  bot.use(async (ctx, next) => {
    try {
      // Foydalanuvchi ma'lumotlarini yangilash
      if (ctx.from) {
        userTracker.updateUser(ctx.from);
      }

      // Guruh faoliyatini kuzatish
      if (ctx.chat && ctx.chat.type !== 'private' && ctx.from) {
        advancedTracker.trackGroupActivity(
          ctx.chat.id,
          ctx.from.id,
          ctx.message?.text ? 'message' : 'action',
          {
            messageType: ctx.message?.type || 'unknown',
            chatName: ctx.chat.title || 'Unknown'
          }
        );

        // Social tracking
        socialTracker.trackGroupActivity(
          ctx.from.id,
          ctx.chat.id,
          ctx.chat.title || 'Unknown',
          'message',
          {
            messageType: ctx.message?.type || 'unknown',
            hasText: !!ctx.message?.text
          }
        );

        // Muloqotlarni kuzatish (reply bo'lsa)
        if (ctx.message?.reply_to_message?.from) {
          socialTracker.trackInteraction(
            ctx.from.id,
            ctx.message.reply_to_message.from.id,
            ctx.message.text || ctx.message.caption || 'Media',
            ctx.chat.id,
            ctx.chat.type
          );
        }
      }

      // Username o'zgarishini kuzatish
      if (ctx.message?.new_chat_members) {
        ctx.message.new_chat_members.forEach(member => {
          if (member.username) {
            advancedTracker.trackUsernameChange(
              ctx.chat.id,
              member.id,
              null,
              member.username
            );
          }
        });
      }

      // Left chat member
      if (ctx.message?.left_chat_member) {
        advancedTracker.trackGroupActivity(
          ctx.chat.id,
          ctx.message.left_chat_member.id,
          'left_group',
          {
            username: ctx.message.left_chat_member.username,
            name: ctx.message.left_chat_member.first_name
          }
        );
      }

    } catch (error) {
      console.error('Activity tracker middleware xato:', error);
    }

    return next();
  });

  // Chat member update
  bot.on('chat_member', async (ctx) => {
    try {
      const oldChatMember = ctx.chatMember.old_chat_member;
      const newChatMember = ctx.chatMember.new_chat_member;
      
      if (oldChatMember.user.username !== newChatMember.user.username) {
        advancedTracker.trackUsernameChange(
          ctx.chat.id,
          newChatMember.user.id,
          oldChatMember.user.username,
          newChatMember.user.username
        );
      }

      if (oldChatMember.user.first_name !== newChatMember.user.first_name) {
        advancedTracker.trackNameChange(
          ctx.chat.id,
          newChatMember.user.id,
          oldChatMember.user.first_name,
          newChatMember.user.first_name
        );
      }
    } catch (error) {
      console.error('Chat member update xato:', error);
    }
  });
};
