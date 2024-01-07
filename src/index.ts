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
    'Что вы хотите сделать?',
    Markup.inlineKeyboard([
      Markup.callbackButton('Перейти к моим вишлистам', 'goToMyWishlists'),
      Markup.callbackButton('Посмотреть вишлист другого пользователя', 'showOtherWishlist'),
    ]).extra()
  )
})

bot.action('goToMyWishlists', (ctx) => {
  return ctx.answerCbQuery('Option 1 selected!')
})

bot.action('showOtherWishlist', (ctx) => {
  return ctx.answerCbQuery('showOtherWishlist mock')
})

bot.action('option3', (ctx) => {
  return ctx.answerCbQuery('Option 3 selected!')
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
