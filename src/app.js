require("dotenv").config();

const express = require("express");
const { session } = require("telegraf");
const bot = require("./config/bot");
const env = require('./config/env');
const { initNewsCron } = require("./cron/news.cron");

const startCommand = require("./commands/start.command");
const helpCommand = require("./commands/help.command");
const tipCommand = require("./commands/tip.command");
const codeCommand = require("./commands/code.command");
const repoCommand = require("./commands/repo.command");
const newsCommand = require("./commands/news.command");
const quizCommand = require("./commands/quiz.command");
const settingsCommand = require("./commands/settings.command");
const groupEventsCommand = require("./commands/group-events.command");
const chatCommand = require("./commands/chat.command");
const scoreCommand = require('./commands/score.command');
const roadmapCommand = require('./commands/roadmap.command');
const interviewCommand = require('./commands/interview.command');
const bugCommand = require('./commands/bug.command');
const trendingCommand = require('./commands/trending.command');
const docCommand = require('./commands/doc.command');
const creatorCommand = require('./commands/creator.command');
const askCommand = require('./commands/ask.command');
const translateCommand = require('./commands/translate.command');
const summaryCommand = require('./commands/summary.command');
const planCommand = require('./commands/plan.command');
const explainCommand = require('./commands/explain.command');
const reviewCommand = require('./commands/review.command');
const projectCommand = require('./commands/project.command');
const challengeCommand = require('./commands/challenge.command');
const transcribeCommand = require('./commands/transcribe.command');
const audioCommand = require('./commands/audio.command');
const dailyCommand = require('./commands/daily.command');
const checklinkCommand = require('./commands/checklink.command');
const checkfileCommand = require('./commands/checkfile.command');
const checkmsgCommand = require("./commands/checkmsg.command");
const safehelpCommand = require("./commands/safehelp.command");
const userinfoCommand = require("./commands/userinfo.command");
const advancedCommand = require("./commands/advanced.command");
const socialCommand = require("./commands/social.command");
const activityTracker = require("./middlewares/activityTracker.middleware");

const app = express();
const PORT = env.PORT;
const WEBHOOK_PATH = `/telegraf/${process.env.BOT_TOKEN}`;
const WEBHOOK_URL = env.RENDER_EXTERNAL_URL ? `${env.RENDER_EXTERNAL_URL}${WEBHOOK_PATH}` : '';

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("IT News Bot is running 🚀");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Bot ishlayapti",
    timestamp: new Date().toISOString()
  });
});

bot.use(
  session({
    defaultSession: () => ({
      currentQuiz: null,
      currentInterview: null,
      transcribeMode: 'transcript',
      history: []
    })
  })
);

// Activity tracker middleware
activityTracker(bot);

startCommand(bot);
helpCommand(bot);
tipCommand(bot);
codeCommand(bot);
repoCommand(bot);
newsCommand(bot);
quizCommand(bot);
settingsCommand(bot);
groupEventsCommand(bot);
scoreCommand(bot);
roadmapCommand(bot);
interviewCommand(bot);
bugCommand(bot);
trendingCommand(bot);
docCommand(bot);
creatorCommand(bot);
askCommand(bot);
translateCommand(bot);
summaryCommand(bot);
planCommand(bot);
explainCommand(bot);
reviewCommand(bot);
projectCommand(bot);
challengeCommand(bot);
transcribeCommand(bot);
audioCommand(bot);
dailyCommand(bot);
checklinkCommand(bot);
checkfileCommand(bot);
checkmsgCommand(bot);
safehelpCommand(bot);
userinfoCommand(bot);
advancedCommand(bot);
socialCommand(bot);
chatCommand(bot);

bot.catch((error, ctx) => {
  console.error(`Global bot xato (${ctx?.updateType || 'unknown'}):`, error.message);
});

if (WEBHOOK_URL) {
  app.use(bot.webhookCallback(WEBHOOK_PATH));
}

(async () => {
  try {
    if (WEBHOOK_URL) {
      await bot.telegram.deleteWebhook({ drop_pending_updates: false });
      await bot.telegram.setWebhook(WEBHOOK_URL);
    } else {
      await bot.telegram.deleteWebhook({ drop_pending_updates: false });
      await bot.launch();
    }

    app.listen(PORT, () => {
      console.log(`Health server ${PORT}-portda ishlayapti 🌐`);
      if (WEBHOOK_URL) {
        console.log(`Webhook ulandi: ${WEBHOOK_URL}`);
      } else {
        console.log('Webhook URL yo‘q, polling rejimida ishlayapti 🤖');
      }
    });

    initNewsCron(bot);
    console.log(`Bot ${WEBHOOK_URL ? 'webhook' : 'polling'} rejimida ishga tushdi 🚀`);
  } catch (error) {
    console.error("Botni ishga tushirishda xato:", error.message);
    process.exit(1);
  }
})();

process.once("SIGINT", async () => {
  try {
    await bot.stop("SIGINT");
  } finally {
    process.exit(0);
  }
});

process.once("SIGTERM", async () => {
  try {
    await bot.stop("SIGTERM");
  } finally {
    process.exit(0);
  }
});
