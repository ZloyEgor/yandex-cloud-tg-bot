import {ContextMessageUpdate, Middleware} from "telegraf";
import {wishlistRepository} from "../repository/wishlist";
import {parseArguments} from "../utils/arguments-parser";
import {prepareStringForMarkdown, replyError, wishlistItemToString, wishlistWithItemsToString} from "../utils/common";
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
  const wishlists = await wishlistService.getWishlistsWithItemsByUserId(userId);

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

export const shareWishlist: Middleware<ContextMessageUpdate> = async (ctx) => {
  const userId = Number(ctx.message?.from?.id);
  const [wishlistName] = parseArguments(ctx.message?.text);

  if (!wishlistName)
    return await ctx.reply("Пожалуйста, укажите название вишлиста!");

  const targetWishlist = await wishlistService.getWishlist(userId, wishlistName);

  if (!targetWishlist)
    return await ctx.reply("Похоже, такого вишлиста нет!");

  await ctx.reply('Поделитесь следующим сообщением с теми, кому хотите отправить вишлист:');
  await ctx.replyWithMarkdown(`🎁 Пользователь @${ctx.message?.from?.username} хочет поделиться с вами своим вишлистом! 🎁\n\n` +
    `Для просмотра вишлиста зайдите в бота @zloyegor\_wishlist\_bot и после запуска введите команду:\n\n` +
    `\`/explore ${targetWishlist.id}\`\n\n` +
    `Для ознакомления со всеми возможностями бота воспользуйтесь командой \`/help\`\n`);
}

export const reserveItem: Middleware<ContextMessageUpdate> = async (ctx) => {
  const userId = Number(ctx.message?.from?.id);
  const [wishlistId, itemName] = parseArguments(ctx.message?.text);

  if (!wishlistId || !itemName)
    return await ctx.reply("Пожалуйста, укажите идентификатор вишлиста и название элемента!");

  try {
    await wishlistService.reserveItem(userId, wishlistId, itemName);
    await ctx.reply(`💝 Вы зарезервировали ${itemName}!`)
  } catch (e) {
    const err = e as Error;
    await replyError(ctx, err.message);
  }
};

export const exploreWishlist: Middleware<ContextMessageUpdate> = async (ctx) => {
  const userId = Number(ctx.message?.from?.id);
  const [wishlistId] = parseArguments(ctx.message?.text);

  if (!wishlistId)
    return await ctx.reply("Пожалуйста, укажите идентификатор вишлиста!");

  try {
    const wishlist = await wishlistService.getWishlistById(wishlistId, userId);

    if (!wishlist)
      return await ctx.reply("Похоже, вишлист не найден. Проверьте введенный идентификатор");

    const text = wishlist.items.reduce((acc, item) => {
      const isReservedByCurrentUser = userId === item.bookedBy;
      const itemTextDescription = wishlistItemToString(item, {isForMarkDown: true, showBookedMarks: true});

      const itemSummary = (isReservedByCurrentUser ? '💝' : '') + itemTextDescription;

      let itemCommand = '';

      if (item.bookedBy && isReservedByCurrentUser) {
        itemCommand = `\n\`/unreserve ${wishlist.id} ${item.name}\``;
      }

      if (!item.bookedBy)
        itemCommand = `\n\`/reserve ${wishlist.id} ${item.name}\``

      return `${acc}\n\n${itemSummary}${itemCommand}`;
    }, '');

    try {
      console.log('userId', userId);
      console.log('wishlist', JSON.stringify(wishlist));
      await ctx.replyWithMarkdown(`${text}`);
    } catch (e) {
      await ctx.replyWithMarkdown("inner error!\n" + "```" + e + "```");

    }

  } catch (e) {
    // await replyError(ctx);
    await ctx.replyWithMarkdown("```" + e + "```");
  }
};

export const deleteWishlist: Middleware<ContextMessageUpdate> = async (ctx) => {
  const userId = Number(ctx.message?.from?.id);
  const [wishlistName] = parseArguments(ctx.message?.text);

  if (!wishlistName)
    return await ctx.reply('Пожалуйста, укажите название вишлиста!');

  const wishlistToDelete = await wishlistService.getWishlist(userId, wishlistName);

  if (!wishlistToDelete) {
    return await ctx.reply(`Вишлист с именем ${wishlistName} не найден`);
  }

  try {
    await wishlistService.deleteWishlist(wishlistToDelete.id);
    await ctx.reply(`Вишлист ${wishlistName} удален!`)
  } catch (e) {
    // await replyError(ctx);
    await ctx.replyWithMarkdown("```" + e + "```");
  }
}