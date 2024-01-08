// @ts-nocheck
import {userRepository} from "./repository/user";

import {driver, initDatabase} from "./database";
import Telegraf from "telegraf";
import {parseArguments} from "./utils/arguments-parser";
import {wishlistRepository} from "./repository/wishlist";
import {listWishlists} from "./commands/wishlist";

const bot = new Telegraf(String(process.env.BOT_TOKEN));


bot.start(async (ctx) => {
  await ctx.reply('Добро пожаловать!\nВведите /help для ознакомления с возможностями бота!');
  try {
    await userRepository.createUser(Number(ctx.message?.from?.id), ctx.message.from.username)
  } catch (e) {
    await ctx.replyWithMarkdown('```' + String(e) + '```');
  }
});

bot.command('help', ctx => {
  // return ctx.reply(
  //   'Что вы хотите сделать?',
  //   Markup.inlineKeyboard([
  //     [Markup.callbackButton('Перейти к моим вишлистам', 'goToMyWishlists')],
  //     [Markup.callbackButton('Создать новый вишлист', 'createNewWishlist')],
  //     [Markup.callbackButton('Посмотреть вишлист другого пользователя', 'showOtherWishlist')],
  //   ]).extra()
  // )
  return ctx.reply(
    '/create <имя_вишлиста>\n' +
    '/add <имя_вишлиста> <название> [описание]\n' +
    '/list'
  );
})

bot.action('goToMyWishlists', (ctx) => {
  return ctx.answerCbQuery('Option 1 selected!')
})

bot.action('showOtherWishlist', (ctx) => {
  return ctx.answerCbQuery('showOtherWishlist mock')
})

bot.command('create', async (ctx) => {
  const [wishlistName] = parseArguments(ctx.message?.text);
  const userId = Number(ctx.message?.from?.id);

  try {
    if (wishlistName) {
      const isAlreadyExist = await wishlistRepository.checkIfWishlistExists(userId, wishlistName);
      if (!isAlreadyExist) {
        await wishlistRepository.createWishlist(userId, wishlistName);
        await ctx.reply(`Вишлист "${wishlistName}" создан успешно!`);
      } else {
        await ctx.reply("Вишлист с таким именем уже существует!");
      }
    } else {
      await ctx.reply("Пожалуйста, укажите название вишлиста!");
    }
  } catch (e) {
    await ctx.replyWithMarkdown("```" + e + "```");
  }
})

bot.command('list', listWishlists);


// bot.on('text', (ctx) => {
//   ctx.reply(`Привет, ${ctx.message.from.username}! Я долбаеб `);
// });

module.exports.handler = async function (event, context) {
  try {
    const message = JSON.parse(event.body);
    await initDatabase();
    await bot.handleUpdate(message);
    return {
      statusCode: 200,
      body: '',
    };
  } catch (e) {
    console.error(`Error occured: ${e}`);
  } finally {
    await driver.destroy();
  }
};
