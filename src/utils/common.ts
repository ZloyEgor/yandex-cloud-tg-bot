import {ContextMessageUpdate} from "telegraf";
import {WishlistItem, WishlistWithItems} from "../repository/wishlist";

export type FormatOptions = { showBookedMarks?: boolean, isForMarkDown?: boolean };
export const replyError = async (ctx: ContextMessageUpdate, errMessage?: string) => {
  await ctx.reply(errMessage || "Похоже, возникла ошибка");
}

export const prepareStringForMarkdown = (input: string) => input.replaceAll('_', '\\_')
  .replace('*', '\\*');

export const wishlistItemToString = (item: WishlistItem, options?: FormatOptions) => {
  let mark = '';
  let descriptionStr = item.description ? `${item.description}` : null;
  let name = item.name;

  if (options?.showBookedMarks)
    mark = item.bookedBy ? '✅ ' : '⏺️ ';

  if (options?.isForMarkDown) {
    name = prepareStringForMarkdown(name)
  }

  if (options?.isForMarkDown && descriptionStr)
    descriptionStr = `_${prepareStringForMarkdown(descriptionStr)}_`;

  if (descriptionStr) {
    return `${mark}${name}\n${descriptionStr}`;
  } else {
    return `${mark}${name}`;
  }
}

export const wishlistWithItemsToString = (wishlist: WishlistWithItems, options?: FormatOptions) => {
  const itemsStr = wishlist.items.reduce((acc, i) => `${acc}\n${wishlistItemToString(i, options)}\n`, '')
  const name = options?.isForMarkDown ? `*${wishlist.name}*` : wishlist.name;
  const shareCommand = `\`/explore ${wishlist.id}\``;
  return `${name}:\n${itemsStr}\n_Ссылка_:\n${shareCommand}`;
}