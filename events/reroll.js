const { loadGiveaways } = require("../giveaway/giveawayutils");
const embedTemplate = require("../../utils/embedTemplate");
const path = require("node:path");

module.exports = {
  name: "messageCreate",

  async execute(message, client) {
    // Only HR can reroll
    const hrRoleId = "1481953102654607451";

    if (!message.content.startsWith("-reroll")) return;
    if (!message.member.roles.cache.has(hrRoleId)) {
      return message.reply("❌ Only HR can reroll giveaways.");
    }

    const args = message.content.split(" ");
    if (args.length < 2) {
      return message.reply("❌ Usage: `-reroll <messageID>`");
    }

    const messageId = args[1];
    const giveaways = loadGiveaways();
    const giveaway = giveaways.find(g => g.messageId === messageId);

    if (!giveaway) {
      return message.reply("❌ Giveaway not found.");
    }

    try {
      const guild = client.guilds.cache.get(giveaway.guildId);
      const channel = guild.channels.cache.get(giveaway.channelId);

      const giveawayMessage = await channel.messages.fetch(giveaway.messageId).catch(() => null);
      if (!giveawayMessage) {
        return message.reply("❌ Giveaway message not found.");
      }

      const reaction = giveawayMessage.reactions.cache.get(giveaway.emoji);
      if (!reaction) {
        return message.reply("❌ No reaction data found.");
      }

      const users = await reaction.users.fetch();
      let entrants = users.filter(u => !u.bot);

      // Apply AND role restrictions
      if (giveaway.roleRestrictions.length > 0) {
        entrants = entrants.filter(u => {
          const member = guild.members.cache.get(u.id);
          if (!member) return false;

          return giveaway.roleRestrictions.every(roleId =>
            member.roles.cache.has(roleId)
          );
        });
      }

      const entrantArray = Array.from(entrants.values());

      // Pick winners
      let winners = [];
      if (entrantArray.length > 0) {
        for (let i = 0; i < giveaway.winners; i++) {
          if (entrantArray.length === 0) break;
          const index = Math.floor(Math.random() * entrantArray.length);
          winners.push(entrantArray[index]);
          entrantArray.splice(index, 1);
        }
      }

      // Build reroll embed
      const { embed, files } = embedTemplate({
        title: "<a:startilt:1524621292790222989> Giveaway Rerolled <a:startilt:1524621292790222989>",
        description:
          `> <:gvreasterisk:1524624524849582101> **Prize:** ${giveaway.prize}\n` +
          `> <:gvreasterisk:1524624524849582101> **New Winners:** ${
            winners.length > 0
              ? winners.map(w => `<@${w.id}>`).join(", ")
              : "No valid entrants"
          }\n\n` +
          `> <:gvreasterisk:1524624524849582101> Giveaway has been rerolled by HR.`,
        banner: path.join(__dirname, "../../graphics/gvregiveaway.png"),
        color: 0x3cf65b,
      });

      await channel.send({
        content: winners.length > 0 ? winners.map(w => `<@${w.id}>`).join(" ") : "",
        embeds: [embed],
        files,
      });

      await message.reply("🔄 Giveaway rerolled successfully.");

    } catch (err) {
      console.error("Reroll error:", err);
      return message.reply("❌ An error occurred while rerolling.");
    }
  },
};
