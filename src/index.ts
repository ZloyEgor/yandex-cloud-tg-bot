import {driver, initDatabase} from "./database";
import Telegraf from "telegraf";

import {
  addItemToWishlist, reserveItem,
  createWishlist,
  deleteItemFromWishlist, deleteWishlist, exploreWishlist,
  listUserWishlistsWithItems, shareWishlist, cancelItemReservation
} from "./commands/wishlist";
import {createUser} from "./commands/user";


const bot = new Telegraf(String(process.env.BOT_TOKEN));

bot.start(createUser);
bot.command('create', createWishlist);
bot.command('list', listUserWishlistsWithItems);
bot.command('add', addItemToWishlist);
bot.command('delete_item', deleteItemFromWishlist);
bot.command('share', shareWishlist);
bot.command('delete_list', deleteWishlist);
bot.command('explore', exploreWishlist);
bot.command('reserve', reserveItem);
bot.command('undo_reserve', cancelItemReservation);
bot.command('help', ctx => {
  return ctx.replyWithMarkdown("🤖 Актуальный список моих команд:\n\n" +
    '🆕 \`/create имя_вишлиста\` – создать новый вишлист\n' +
    '🆕 \`/add имя_вишлиста имя_элемента описание_элемента\` – добавить элемент в вишлист. Описание элемента можно не задавать\n' +
    '🚮 \`/delete_item имя_вишлиста имя_элемента\` – удалить элемент из вишлиста\n' +
    '🚮 \`/delete_list имя_вишлиста\` – удалить вишлист\n' +
    '📋 \`/list\` – вывести список ваших вишлистов\n' +
    '🚀 \`/share имя_вишлиста\` – бот создаст пригласительное сообщение, которым вы сможете поделиться с другими пользователями\n' +
    '📋 \`/explore код_вишлиста\` – открыть вишлист других пользователей для бронирования элементов\n' +
    '💝 \`/reserve код_вишлиста имя_элемента\` – забронировать элемент вишлиста\n' +
    '💔 \`/undo_reserve код_вишлиста имя_элемента\` – отменить бронирование элемента вишлиста'
  );
})

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
