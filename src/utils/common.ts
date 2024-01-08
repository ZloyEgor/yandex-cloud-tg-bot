import {ContextMessageUpdate} from "telegraf";
import {WishlistItem, WishlistWithItems} from "../repository/wishlist";

export type FormatOptions = { showBookedMarks?: boolean, isForMarkDown?: boolean };
export const replyError = async (ctx: ContextMessageUpdate, errMessage?: string) => {
  await ctx.reply(errMessage || "Похоже, возникла ошибка");
}

export const wishlistItemToString = (item: WishlistItem, options?: FormatOptions) => {
  let mark = '';
  let descriptionStr = item.description ? `\n${item.description}` : '';
  let name = item.name;

  if (options?.showBookedMarks)
    mark = item.bookedBy ? '✅ ' : '⏺️ ';

  if (options?.isForMarkDown)
    descriptionStr = `_${descriptionStr}_`

  return `${mark}${name}${descriptionStr}`;
}
export const wishlistWithItemsToString = (wishlist: WishlistWithItems, options?: FormatOptions) => {
  const itemsStr = wishlist.items.reduce((acc, i) => `${acc}\n${wishlistItemToString(i, options)}`, '')
  return `📝 ${wishlist.name}:${itemsStr}`;
}