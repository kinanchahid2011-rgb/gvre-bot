const path = require("node:path");
const embedTemplate = require("../utils/embedTemplate");

module.exports = {
  name: "guildMemberAdd",

  async execute(member, client) { // 👈 added client
    const channelId = "1482299778170622033"; // #welcome channel
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    const description =
      `> <:arrowright:1523736161770672209> Welcome to **Greenville Roleplay East**, please head to <#1481962763994660964> to verify yourself and gain access to the rest of the server. ${member}!\n\n` +
      `> <:arrowright:1523736161770672209> After verifying, visit <#1481953494519775254> to get familiar with our rules, FAQs, and department applications. We hope you enjoy your time here!`;

    const { embed, files } = embedTemplate({
      title: "<a:startilt:1524621292790222989> Welcome to Greenville Roleplay East <a:startilt:1524621292790222989>",
      description,
      banner: path.join(__dirname, "../graphics/gvrewelcome.png"),
      thumbnail: member.user.displayAvatarURL({ dynamic: true })
    });

    await channel.send({
      content: `${member}`,
      embeds: [embed],
      files
    });

    try {
      await member.send({
        embeds: [embed],
        files
      });
    } catch (err) {
      console.log(`❌ Could not DM ${member.user.tag}. DMs may be closed.`);
    }
  }
};