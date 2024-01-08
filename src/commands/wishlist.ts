import {ContextMessageUpdate, Middleware} from "telegraf";
import {wishlistRepository} from "../repository/wishlist";

export const listWishlists: Middleware<ContextMessageUpdate> = async (ctx) => {
  const userId = Number(ctx.message?.from?.id);
  const wishlists = await wishlistRepository.selectWishlistsByUserId(userId);
  const wishlistString = wishlists.reduce((acc, cur, index) => `${acc}\n${index + 1}. ${cur.name}`, "")
  await ctx.reply(`Вот ваши вишлисты:\n${wishlistString}`);
}