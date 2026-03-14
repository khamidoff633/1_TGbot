const { Markup } = require('telegraf');
const advancedTracker = require('../services/advancedTracker.service');

module.exports = (bot) => {
  // Guruh a'zolari haqida ma'lumot
  bot.command('scan', async (ctx) => {
    try {
      const chatId = ctx.chat.id;
      
      if (ctx.chat.type === 'private') {
        return ctx.reply('❌ Bu komanda faqat guruhlarda ishlaydi.');
      }

      await ctx.reply('🔍 Guruh a\'zolari skanlanmoqda...');

      const members = await advancedTracker.getGroupMembers(bot, chatId);
      
      if (members.length === 0) {
        return ctx.reply('❌ Guruh a\'zolari topilmadi.');
      }

      let response = `👥 Guruh a\'zolari (${members.length} ta):\n\n`;
      
      members.forEach((member, index) => {
        response += `${index + 1}. ${member.name}\n`;
        response += `   🆔 ID: ${member.id}\n`;
        response += `   🔗 @${member.username || 'username yo\'q'}\n`;
        response += `   👑 ${member.title}\n\n`;
      });

      await ctx.reply(response);
    } catch (error) {
      console.error('Scan command xato:', error);
      ctx.reply('❌ Guruhni skanlashda xatolik yuz berdi.');
    }
  });

  // To'liq ma'lumot olish
  bot.command('fullinfo', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    const target = args[0];

    if (!target) {
      return ctx.reply(
        '❌ Foydalanuvchi ID yoki username kiriting.\n\n' +
        'Masala: /fullinfo 123456789 yoki /fullinfo @username'
      );
    }

    try {
      const userId = target.startsWith('@') ? null : parseInt(target);
      const username = target.startsWith('@') ? target.substring(1) : null;

      if (userId) {
        const userInfo = await advancedTracker.getComprehensiveUserInfo(bot, userId, username);
        
        let response = `📊 To'liq ma'lumot (ID: ${userId}):\n\n`;
        
        // Tracker ma'lumotlari
        if (userInfo.trackerInfo) {
          response += `🔍 Bot ma'lumotlari:\n`;
          response += `• Birinchi murojaat: ${userInfo.trackerInfo.firstSeen}\n`;
          response += `• Oxirgi murojaat: ${userInfo.trackerInfo.lastSeen}\n`;
          response += `• Ism o'zgarishlari: ${userInfo.trackerInfo.nameHistory.length} marta\n`;
          response += `• Username o'zgarishlari: ${userInfo.trackerInfo.usernameHistory.length} marta\n\n`;
        }

        // Taxminiy ma'lumotlar
        if (userInfo.estimatedData) {
          response += `📈 Taxminiy ma'lumotlar:\n`;
          response += `• Taxminiy qo'shilgan sana: ${userInfo.estimatedData.estimatedJoinDate}\n`;
          response += `• Faol kunlari: ${userInfo.estimatedData.daysActive}\n`;
          response += `• Ishonchlilik darajasi: ${userInfo.estimatedData.confidence}\n\n`;
        }

        // Guruh ma'lumotlari
        if (userInfo.groups.length > 0) {
          response += `👥 Guruhlardagi faoliyati:\n`;
          userInfo.groups.forEach(group => {
            response += `• ${group.chatName}: ${group.messageCount} ta xabar\n`;
          });
        }

        response += `\n⚠️ Eslatma: Bu ma\'lumotlar faqat bot bilan muloqot asosida.`;
        
        await ctx.reply(response);
      } else {
        ctx.reply('❌ Username orqali ma\'lumot olish cheklangan. ID kiriting.');
      }
    } catch (error) {
      console.error('Fullinfo command xato:', error);
      ctx.reply('❌ Ma\'lumotlarni olishda xatolik yuz berdi.');
    }
  });

  // Kanal ma'lumotlari
  bot.command('channelinfo', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    const channelUsername = args[0];

    if (!channelUsername) {
      return ctx.reply(
        '❌ Kanal username kiriting.\n\n' +
        'Masala: /channelinfo @channelname'
      );
    }

    try {
      const channelInfo = await advancedTracker.trackChannelActivity(bot, channelUsername);
      
      if (channelInfo) {
        let response = `📺 Kanal ma'lumotlari:\n\n`;
        response += `🏷️ Nomi: ${channelInfo.title}\n`;
        response += `🆔 ID: ${channelInfo.id}\n`;
        response += `👥 A\'zolar: ${channelInfo.memberCount}\n`;
        response += `🤖 Bot admini: ${channelInfo.isBotAdmin ? '✅ Ha' : '❌ Yo\'q'}\n`;
        response += `🕐 Tekshirilgan vaqt: ${channelInfo.lastChecked}`;
        
        await ctx.reply(response);
      } else {
        ctx.reply('❌ Kanal ma\'lumotlarini olish imkonsiz. Bot kanalda admin emas.');
      }
    } catch (error) {
      console.error('Channelinfo command xato:', error);
      ctx.reply('❌ Kanal ma\'lumotlarini olishda xatolik.');
    }
  });

  // Ma'lumotlarni eksport qilish
  bot.command('export', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    const userId = args[0] || ctx.from.id;

    try {
      const exportData = advancedTracker.exportUserData(userId);
      
      await ctx.replyWithDocument(
        { 
          source: Buffer.from(JSON.stringify(exportData, null, 2)),
          filename: `user_${userId}_data.json`
        },
        {
          caption: `📊 Foydalanuvchi ${userId} ma'lumotlari eksport qilindi.`
        }
      );
    } catch (error) {
      console.error('Export command xato:', error);
      ctx.reply('❌ Ma\'lumotlarni eksport qilishda xatolik.');
    }
  });
};
