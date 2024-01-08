import {ContextMessageUpdate, Middleware} from "telegraf";
import {wishlistRepository} from "../repository/wishlist";
import {parseArguments} from "../utils/arguments-parser";
import {replyError, wishlistWithItemsToString} from "../utils/common";
import {wishlistService} from "../service/wishlist-service";

export const createWishlist: Middleware<ContextMessageUpdate> = async (ctx) => {
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
};

export const listWishlists: Middleware<ContextMessageUpdate> = async (ctx) => {
  const userId = Number(ctx.message?.from?.id);
  const wishlists = await wishlistRepository.selectWishlistsByUserId(userId);
  const wishlistString = wishlists.reduce((acc, cur, index) => `${acc}\n${index + 1}. ${cur.name}`, "")
  await ctx.reply(`Вот ваши вишлисты:\n${wishlistString}`);
}

export const listUserWishlistsWithItems: Middleware<ContextMessageUpdate> = async (ctx) => {
  const userId = Number(ctx.message?.from?.id);
  const wishlists = await wishlistService.selectWishlistsWithItemsByUserId(userId);

  const wishlistsString = wishlists.reduce((acc, cur) => `${acc}\n\n${wishlistWithItemsToString(cur)}`, '');
  await ctx.reply(`Вот ваши вишлисты:${wishlistsString}`)
}
export const addItemToWishlist: Middleware<ContextMessageUpdate> = async (ctx) => {
  const userId = Number(ctx.message?.from?.id);
  const [wishlistName, itemName, ...itemDescriptionWords] = parseArguments(ctx.message?.text);
  const itemDescription = itemDescriptionWords.join(" ");

  if (!wishlistName || !itemName) {
    return await ctx.reply('Пожалуйста, обязательно укажите имя вишлиста и название элемента!');
  }

  const wishlists = await wishlistRepository.selectWishlistsByUserId(userId);

  const targetWishlist = wishlists.find(v => v.name === wishlistName);

  if (!targetWishlist) {
    return await ctx.reply('Похоже, такого вишлиста не существует!');
  }

  try {
    await wishlistRepository.addItemToWishlist({
      name: itemName,
      wishlistId: targetWishlist.id,
      description: itemDescription
    })
    await ctx.reply("Элемент добавлен успешно!");
  } catch (e) {
    await replyError(ctx);
  }
}

export const deleteItemFromWishlist: Middleware<ContextMessageUpdate> = async (ctx) => {
  const userId = Number(ctx.message?.from?.id);
  const [wishlistName, itemName] = parseArguments(ctx.message?.text);

  if (!wishlistName || !itemName) {
    return await ctx.reply('Пожалуйста, обязательно укажите имя вишлиста и название элемента!');
  }

  const wishlists = await wishlistRepository.selectWishlistsByUserId(userId);

  const targetWishlist = wishlists.find(v => v.name === wishlistName);

  if (!targetWishlist) {
    return await ctx.reply('Похоже, такого вишлиста не существует!');
  }

  try {
    await wishlistRepository.deleteItemFromWishlist({
      name: itemName,
      wishlistId: targetWishlist.id,
    })
    await ctx.reply("Элемент удален успешно!");
  } catch (e) {
    await replyError(ctx);
  }

}