const { Markup } = require('telegraf');
const socialTracker = require('../services/socialTracker.service');

module.exports = (bot) => {
  // Foydalanuvchining barcha guruhlari
  bot.command('mygroups', async (ctx) => {
    try {
      const userId = ctx.from.id;
      const groups = socialTracker.getUserGroups(userId);
      
      if (groups.length === 0) {
        return ctx.reply('❌ Siz hech qanday guruhda topilmadingiz.');
      }

      let response = `👥 Sizning guruhlaringiz (${groups.length} ta):\n\n`;
      
      groups.forEach((group, index) => {
        response += `${index + 1}. ${group.name}\n`;
        response += `   🆔 ID: ${group.id}\n`;
        response += `   👥 A'zolar: ${group.memberCount} ta\n`;
        response += `   📅 Qo'shilgan: ${group.joinDate}\n\n`;
      });

      response += `⚠️ Eslatma: Bu faqat bot aniqlagan guruhlar.`;
      
      await ctx.reply(response);
    } catch (error) {
      console.error('MyGroups command xato:', error);
      ctx.reply('❌ Guruhlarni olishda xatolik yuz berdi.');
    }
  });

  // Foydalanuvchining muloqot tarixi
  bot.command('interactions', async (ctx) => {
    try {
      const userId = ctx.from.id;
      const args = ctx.message.text.split(' ');
      const days = parseInt(args[1]) || 7;
      
      const history = socialTracker.getInteractionHistory(userId, days);
      
      if (history.length === 0) {
        return ctx.reply(`❌ Oxirgi ${days} kun ichida muloqotlar topilmadi.`);
      }

      let response = `💬 Oxirgi ${days} kunlik muloqotlar:\n\n`;
      
      // Har kunga guruhlash
      const groupedByDay = {};
      history.forEach(item => {
        const day = new Date(item.timestamp).toISOString().split('T')[0];
        if (!groupedByDay[day]) groupedByDay[day] = [];
        groupedByDay[day].push(item);
      });

      Object.entries(groupedByDay).forEach(([day, items]) => {
        response += `📅 ${day}:\n`;
        items.forEach(item => {
          const direction = item.type === 'sent' ? '➡️' : '⬅️';
          response += `${direction} ${item.message.substring(0, 50)}...\n`;
        });
        response += '\n';
      });

      await ctx.reply(response);
    } catch (error) {
      console.error('Interactions command xato:', error);
      ctx.reply('❌ Muloqotlarni olishda xatolik yuz berdi.');
    }
  });

  // Kanal ma'lumotlari (public)
  bot.command('checkchannel', async (ctx) => {
    try {
      const args = ctx.message.text.split(' ').slice(1);
      const channelUsername = args[0];

      if (!channelUsername) {
        return ctx.reply(
          '❌ Kanal username kiriting.\n\n' +
          'Masala: /checkchannel @durov'
        );
      }

      await ctx.reply('🔍 Kanal ma\'lumotlari tekshirilmoqda...');

      const channelInfo = await socialTracker.trackChannelInfo(channelUsername);
      
      if (channelInfo) {
        let response = `📺 Kanal ma'lumotlari:\n\n`;
        response += `🏷️ Nomi: ${channelInfo.name}\n`;
        response += `🔗 Username: ${channelInfo.username}\n`;
        response += `👥 A'zolar: ${channelInfo.members}\n`;
        response += `📝 Tavsif: ${channelInfo.description}\n`;
        response += `🌐 Public: ${channelInfo.isPublic ? '✅ Ha' : '❌ Yo\'q'}\n`;
        response += `🕐 Tekshirilgan: ${channelInfo.lastChecked}`;
        
        await ctx.reply(response);
      } else {
        ctx.reply('❌ Kanal ma\'lumotlarini olish imkonsiz. Kanal public bo\'lishi kerak.');
      }
    } catch (error) {
      console.error('CheckChannel command xato:', error);
      ctx.reply('❌ Kanalni tekshirishda xatolik yuz berdi.');
    }
  });

  // To'liq social profili
  bot.command('socialprofile', async (ctx) => {
    try {
      const args = ctx.message.text.split(' ').slice(1);
      const targetUserId = args[0] ? parseInt(args[0]) : ctx.from.id;

      const profile = socialTracker.getSocialProfile(targetUserId);
      
      let response = `👤 Social profil (ID: ${targetUserId}):\n\n`;
      
      // Guruh ma'lumotlari
      if (profile.groups.length > 0) {
        response += `👥 Guruhlari (${profile.groups.length} ta):\n`;
        profile.groups.forEach(group => {
          response += `• ${group.name} (${group.memberCount} a'zo)\n`;
        });
        response += '\n';
      }

      // Faoliyat statistikasi
      response += `📈 Faoliyati:\n`;
      response += `• Jami xabarlar: ${profile.activity.totalMessages}\n`;
      response += `• Faol guruhlar: ${profile.activity.activeChats?.size || 0} ta\n`;
      response += `• Oxirgi faollik: ${profile.activity.lastSeen || 'Noma\'lum'}\n\n`;

      // Muloqotlar
      if (Object.keys(profile.interactions).length > 0) {
        response += `💬 Muloqotlari:\n`;
        Object.entries(profile.interactions).forEach(([date, data]) => {
          response += `• ${date}: ${data.totalMessages} ta xabar\n`;
        });
        response += '\n';
      }

      response += `⚠️ Eslatma: Ma\'lumotlar faqat bot orqali aniqlanganlari.`;
      
      await ctx.reply(response);
    } catch (error) {
      console.error('SocialProfile command xato:', error);
      ctx.reply('❌ Social profilni olishda xatolik yuz berdi.');
    }
  });

  // Muloqotdagi odamlar ro'yxati
  bot.command('contacts', async (ctx) => {
    try {
      const userId = ctx.from.id;
      const args = ctx.message.text.split(' ');
      const days = parseInt(args[1]) || 30;
      
      const history = socialTracker.getInteractionHistory(userId, days);
      const contacts = new Set();
      
      history.forEach(item => {
        if (item.to) contacts.add(item.to);
      });

      if (contacts.size === 0) {
        return ctx.reply(`❌ Oxirgi ${days} kun ichida muloqot qilgan odamlar topilmadi.`);
      }

      let response = `👥 Oxirgi ${days} kun ichida muloqot qilgan odamlar (${contacts.size} ta):\n\n`;
      
      Array.from(contacts).forEach((contactId, index) => {
        response += `${index + 1}. ID: ${contactId}\n`;
      });

      response += `\n💡 To'liq ma'lumot olish uchun: /socialprofile ${userId}`;
      
      await ctx.reply(response);
    } catch (error) {
      console.error('Contacts command xato:', error);
      ctx.reply('❌ Muloqot qilgan odamlarni olishda xatolik yuz berdi.');
    }
  });

  // Global statistika
  bot.command('socialstats', async (ctx) => {
    try {
      const stats = socialTracker.getStats();
      
      let response = `📊 Social tracker statistikasi:\n\n`;
      response += `👥 Jami foydalanuvchilar: ${stats.totalUsers}\n`;
      response += `👥 Jami guruhlar: ${stats.totalGroups}\n`;
      response += `📺 Jami kanallar: ${stats.totalChannels}\n`;
      response += `💬 Jami muloqotlar: ${stats.totalInteractions}\n`;
      response += `🕐 Oxirgi yangilanish: ${stats.lastUpdate}\n\n`;
      
      response += `⚠️ Bu faqat bot orqali yig'ilgan ma'lumotlar.`;
      
      await ctx.reply(response);
    } catch (error) {
      console.error('SocialStats command xato:', error);
      ctx.reply('❌ Statistikani olishda xatolik yuz berdi.');
    }
  });
};
