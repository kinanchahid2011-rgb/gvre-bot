const { loadGiveaways, removeGiveaway } = require("./giveawayutils");
const embedTemplate = require("../utils/embedTemplate");
const path = require("node:path");

module.exports = (client) => {
  setInterval(async () => {
    const giveaways = loadGiveaways();
    if (!giveaways.length) return;

    const now = Math.floor(Date.now() / 1000);

    for (const g of giveaways) {
      if (now < g.endTime) continue;

      try {
        const guild = client.guilds.cache.get(g.guildId);
        if (!guild) {
          removeGiveaway(g.messageId);
          continue;
        }

        const channel = guild.channels.cache.get(g.channelId);
        if (!channel) {
          removeGiveaway(g.messageId);
          continue;
        }

        const message = await channel.messages
          .fetch(g.messageId)
          .catch(() => null);
        if (!message) {
          removeGiveaway(g.messageId);
          continue;
        }

        // ⭐ Fetch reaction cache
        await message.fetch();
        await message.reactions.resolve(g.emoji)?.fetch();

        const reaction = message.reactions.cache.get(g.emoji);
        if (!reaction) {
          removeGiveaway(g.messageId);
          continue;
        }

        const users = await reaction.users.fetch();
        let entrants = users.filter((u) => !u.bot);

        if (g.roleRestrictions.length > 0) {
          entrants = entrants.filter((u) => {
            const member = guild.members.cache.get(u.id);
            if (!member) return false;
            return g.roleRestrictions.every((roleId) =>
              member.roles.cache.has(roleId),
            );
          });
        }

        const entrantArray = Array.from(entrants.values());
        let winners = [];

        if (entrantArray.length > 0) {
          for (let i = 0; i < g.winners; i++) {
            if (entrantArray.length === 0) break;
            const index = Math.floor(Math.random() * entrantArray.length);
            winners.push(entrantArray[index]);
            entrantArray.splice(index, 1);
          }
        }

        const { embed, files } = embedTemplate({
          title:
            "<a:startilt:1524621292790222989> Giveaway Ended <a:startilt:1524621292790222989>",
          description:
            `> <:gvreasterisk:1524624524849582101> **Prize:** ${g.prize}\n` +
            `> <:gvreasterisk:1524624524849582101> **Winners:** ${
              winners.length > 0
                ? winners.map((w) => `<@${w.id}>`).join(", ")
                : "No valid entrants"
            }\n\n` +
            `> <:gvreasterisk:1524624524849582101> Thank you for participating!`,
          banner: path.join(__dirname, "../graphics/gvregiveaway.png"),
          color: 0x3cf65b,
        });

        await channel.send({
          content:
            winners.length > 0
              ? winners.map((w) => `<@${w.id}>`).join(" ")
              : "",
          embeds: [embed],
          files,
        });

        removeGiveaway(g.messageId);
      } catch (err) {
        console.error("Giveaway handler error:", err);
        removeGiveaway(g.messageId);
      }
    }
  }, 5 * 1000);
};
