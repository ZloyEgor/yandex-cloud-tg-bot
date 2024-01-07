import {BaseScene} from "telegraf";
import WizardScene from "telegraf/scenes/wizard";
import {wishlistRepository} from "../repository/wishlist";

export const getWishlistName = new BaseScene('getWishlistName');

getWishlistName.enter(
  async (ctx) => {
    await ctx.reply(`Вишлист (1): ${ctx.message?.text}`);
  });

getWishlistName.on('text', async (ctx) => {
  //TODO: check if there's no duplicates
  try {
    if (ctx.message?.text !== undefined) {
      // await wishlistRepository.createWishlist(Number(ctx.message?.from?.id), String(ctx.message?.text));
      await ctx.reply(`Вишлист "${ctx.message.text}" создан!`);
    } else {
      console.log('another way!')
      await ctx.reply('Еще раз');
      ctx.scene.reenter();
    }
  } catch (e) {
    ctx.replyWithMarkdown('```' + String(e) + '```');
  }
});

export const getWishlistNameWizardScene = new WizardScene('getWishlistName',
  ctx => {
    ctx.reply("What's your name?");
    ctx.wizard.state.data = {};
    return ctx.wizard.next();
  },
  ctx => {
    ctx.wizard.state.data.name = ctx.message.text;
    ctx.reply('Enter your phone number');
    return ctx.wizard.next();
  },
  ctx => {
    ctx.wizard.state.data.phone = ctx.message.text;
    ctx.reply(`Your name is ${ctx.wizard.state.data.name}`);
    ctx.reply(`Your phone is ${ctx.wizard.state.data.phone}`);
    return ctx.scene.leave();
  })