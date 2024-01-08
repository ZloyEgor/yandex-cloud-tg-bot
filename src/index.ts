// @ts-nocheck
import {userRepository} from "./repository/user";

import {driver, initDatabase} from "./database";
import Telegraf from "telegraf";

import {
  addItemToWishlist,
  createWishlist,
  deleteItemFromWishlist, deleteWishlist,
  listUserWishlistsWithItems
} from "./commands/wishlist";

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
  return ctx.reply(
    '/create <имя_вишлиста>\n' +
    '/add <имя_вишлиста> <название> [описание]\n' +
    '/delete_item <имя_вишлиста> <название>\n' +
    '/delete_list <имя_вишлиста>\n' +
    '/list\n'
  );
})

bot.command('create', createWishlist);
bot.command('list', listUserWishlistsWithItems);
bot.command('add', addItemToWishlist);
bot.command('delete_item', deleteItemFromWishlist);
bot.command('delete_list', deleteWishlist);

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
