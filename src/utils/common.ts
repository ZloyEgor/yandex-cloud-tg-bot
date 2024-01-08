import {ContextMessageUpdate} from "telegraf";
import {WishlistWithItems} from "../repository/wishlist";

export const replyError = async (ctx: ContextMessageUpdate, errMessage?: string) => {
  await ctx.reply(errMessage || "Похоже, возникла ошибка");
}

export const wishlistWithItemsToString = (wishlist: WishlistWithItems) => {
  const itemsStr = wishlist.items.reduce((acc, i) => `${acc}\n• ${i.name}` + (i.description ? `\n${i.description}` : ''), '')
  return `${wishlist.name}:${itemsStr}`;
}