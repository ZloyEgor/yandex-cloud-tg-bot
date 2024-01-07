import {BaseScene} from "telegraf";

const nameScene = new BaseScene('nameScene');
nameScene.enter((ctx) => ctx.reply('Теперь ты в сцене имени. Представься'))
nameScene.hears(/.*/, async (ctx) => {
  try {
    const name = ctx.match?.at(0);
    if (name) {
      await ctx.reply(`Привет, ${name}`);
      await ctx.scene.leave()
    } else {
      await ctx.reply('Я так и не понял, как тебя зовут')
      await ctx.scene.reenter()
    }
  } catch (e) {
    await ctx.replyWithMarkdown(`\`\`\`${e}\`\`\``)
  }
})

export default nameScene;