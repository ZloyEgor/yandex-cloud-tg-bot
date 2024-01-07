// @ts-nocheck
import {userRepository} from "./repository/user";

const Telegraf = require('telegraf')
const {
  Markup,
  Stage,
  session
} = Telegraf
import {driver, initDatabase} from "./database";
import nameScene from "./scenes/name-scene";

const bot = new Telegraf(String(process.env.BOT_TOKEN));

const stage = new Stage([nameScene]);

bot.use(session());
bot.use(stage.middleware());

bot.start(async (ctx) => {
  await ctx.reply('Добро пожаловать!\nВведите /help для ознакомления с возможностями бота!');
  try {
    await userRepository.createUser(Number(ctx.message?.from?.id), ctx.message.from.username)
  } catch (e) {
    await ctx.replyWithMarkdown('```' + String(e) + '```');
  }
});

bot.command('help', ctx => {
  return ctx.reply(
    'Dynamic buttons example.',
    Markup.inlineKeyboard([
      Markup.callbackButton('Option 1', 'option1'),
      Markup.callbackButton('Option 2', 'option2'),
      Markup.callbackButton('Option 3', 'option3')
    ]).extra()
  )
})

bot.on('text', (ctx) => {
  ctx.reply(`Привет, ${ctx.message.from.username}! Я долбаеб `);
});

module.exports.handler = async function (event, context) {
  const message = JSON.parse(event.body);
  await initDatabase();
  await bot.handleUpdate(message);
  await driver.destroy();
  return {
    statusCode: 200,
    body: '',
  };
};
