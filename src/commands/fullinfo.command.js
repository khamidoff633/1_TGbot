const { Markup } = require('telegraf');
const telegramScraper = require('../services/telegramScraper.service');

module.exports = (bot) => {
  bot.command('fullinfo', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    const target = args[0];

    if (!target) {
      return ctx.reply(
        '❌ Foydalanuvchi ID yoki username kiriting.\n\n' +
        'Masalalar:\n' +
        '• /fullinfo 123456789\n' +
        '• /fullinfo @username\n\n' +
        '⚡ Bu komanda Telegram API cheklovlarini chetlab o\'tib,\n' +
        '   public ma\'lumotlarni yig\'ish orqali to\'liq ma\'lumot beradi.',
        Markup.keyboard([['/fullinfo', '/help']]).resize()
      );
    }

    try {
      await ctx.reply('🔍 To\'liq ma\'lumot yig\'ilmoqda... Bu biroz vaqt olishi mumkin.');

      let userId;
      let username;

      // Target ni aniqlash
      if (target.startsWith('@')) {
        username = target.substring(1);
        userId = 'unknown'; // Username bo'lsa ID noma'lum
      } else if (/^\d+$/.test(target)) {
        userId = target;
        username = 'unknown'; // ID bo'lsa username noma'lum
      } else {
        return ctx.reply(
          '❌ Noto\'g\'ri format. ID yoki @username kiriting.\n\n' +
          'Masala: /fullinfo @username yoki /fullinfo 123456789',
          Markup.keyboard([['/fullinfo', '/help']]).resize()
        );
      }

      // To'liq ma'lumotlarni olish
      const report = await telegramScraper.getComprehensiveReport(userId, username);

      // Natijani formatlash
      let response = `📊 TO'LIQ MA'LUMOTLAR (${username || userId}):\n\n`;
      
      // Asosiy ma'lumotlar
      response += `👤 ASOSIY MA'LUMOTLAR:\n`;
      response += `🆔 ID: ${report.data.id}\n`;
      response += `🔗 Username: ${report.data.username}\n`;
      response += `📝 Display Name: ${report.data.basicInfo.displayName || 'Noma\'lum'}\n`;
      response += `📄 Bio: ${report.data.basicInfo.bio || 'Noma\'lum'}\n`;
      response += `✅ Verified: ${report.data.basicInfo.isVerified ? 'Ha' : 'Yo\'q'}\n`;
      response += `⚠️ Scam Risk: ${report.data.basicInfo.isScam ? 'Yuqori' : 'Past'}\n\n`;

      // Taxminiy ma'lumotlar
      response += `📈 TAXMINIY MA'LUMOTLAR:\n`;
      response += `📅 Taxminiy qo\'shilgan: ${report.data.estimatedData.estimatedJoinDate}\n`;
      response += `👶 Taxminiy yoshi: ${report.data.estimatedData.estimatedAge}\n`;
      response += `📊 Faoliyat darajasi: ${report.data.estimatedData.activityLevel}\n`;
      response += `🎯 Xavflik reytingi: ${report.data.estimatedData.riskScore}/100\n\n`;

      // Kanallar
      if (report.data.channelInfo.length > 0) {
        response += `📺 KANALLAR (${report.data.channelInfo.length} ta):\n`;
        report.data.channelInfo.forEach((channel, index) => {
          response += `${index + 1}. ${channel.title}\n`;
          response += `   🔗 @${channel.username}\n`;
          response += `   👥 A\'zolar: ${channel.memberCount}\n`;
          response += `   ✅ Verified: ${channel.isVerified ? 'Ha' : 'Yo\'q'}\n\n`;
        });
      }

      // Guruhlar
      if (report.data.groupInfo.length > 0) {
        response += `👥 GURUHLAR (${report.data.groupInfo.length} ta):\n`;
        report.data.groupInfo.forEach((group, index) => {
          response += `${index + 1}. ${group.name || 'Noma\'lum'}\n`;
          response += `   🆔 ID: ${group.id}\n\n`;
        });
      }

      // Faoliyat
      response += `📈 FAOLIYAT:\n`;
      response += `💬 Xabarlar soni: ${report.data.activityInfo.messageCount}\n`;
      response += `🕐 Oxirgi faollik: ${report.data.activityInfo.lastSeen}\n`;
      response += `🌐 Online status: ${report.data.activityInfo.onlineStatus}\n\n`;

      // Username tarixi (taxminiy)
      response += `🔄 USERNAME TARIXI (taxminiy):\n`;
      response += `📝 Hozirgi: ${report.data.estimatedData.usernameHistory[0]}\n`;
      response += `📊 O\'zgarishlar soni: ${report.data.estimatedData.nameChanges}\n\n`;

      // Xulosa
      response += `📋 USULLAR:\n`;
      report.data.methods.forEach((method, index) => {
        response += `${index + 1}. ${method}\n`;
      });

      response += `\n⚠️ Eslatma: ${report.disclaimer}`;
      response += `\n🕐 Ma\'lumotlar olingan vaqt: ${report.timestamp}`;

      // Javobni yuborish
      if (response.length > 4000) {
        // Uzun javobni qismlarga bo'lib yuborish
        const parts = response.match(/.{1,4000}/g) || [];
        for (const part of parts) {
          await ctx.reply(part);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else {
        await ctx.reply(response);
      }

      // Tugmalarni yangilash
      await ctx.reply(
        '🔍 Qo\'shimcha ma\'lumotlar uchun:\n' +
        '• /mygroups - mening guruhlari\n' +
        '• /interactions - muloqot tarixi\n' +
        '• /socialprofile - social profil\n',
        Markup.keyboard([
          ['/fullinfo', '/mygroups'],
          ['/interactions', '/socialprofile'],
          ['/help', '/me']
        ]).resize()
      );

    } catch (error) {
      console.error('FullInfo command xato:', error);
      await ctx.reply(
        '❌ Ma\'lumotlarni olishda xatolik yuz berdi.\n\n' +
        'Iltimos, qayta urinib ko\'ring.',
        Markup.keyboard([['/fullinfo', '/help']]).resize()
      );
    }
  });
};
