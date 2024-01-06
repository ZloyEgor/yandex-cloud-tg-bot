import {Context, Telegraf} from "telegraf";

interface WishlistContext extends Context {
  myProps?: string;
  myOtherProps?: string;
}

const bot = new Telegraf<WishlistContext>(String(process.env.BOT_TOKEN));
bot.start((ctx) => ctx.reply(`Hello. \nMy name Serverless Hello Telegram Bot \nI'm working on Cloud Function in the Yandex Cloud.`))
bot.help((ctx) => ctx.reply(`Hello, ${ctx.message.from.username}.\nI can say Hello and nothing more`))
bot.on('text', (ctx) => {
  ctx.reply(`Hello, ${ctx.message.from.username}! I use TypeScript now!`);

});

module.exports.handler = async function (event, context) {
  const message = JSON.parse(event.body);
  await bot.handleUpdate(message);
  return {
    statusCode: 200,
    body: '',
  };
};
