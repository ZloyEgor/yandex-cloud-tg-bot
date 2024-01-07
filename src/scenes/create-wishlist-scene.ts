import {BaseScene} from "telegraf";

export const getWishlistName = new BaseScene('getWishlistName');

getWishlistName.on('text', async (ctx) => {
  ctx.reply(`Название вашего вишлиста: ${ctx.message?.text}`);
});
