const path = require("node:path");
const embedTemplate = require("../utils/embedTemplate");

module.exports = {
  name: "guildMemberRemove",

  async execute(member) {
    const channelId = "1524653816505700472"; // goodbye channel
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    const description =
      `> <:arrowright:1523736161770672209> **${member.user.tag}** has left **Greenville Roleplay East**. We hope to see you again soon — thank you for being part of our community!`;

    const { embed, files } = embedTemplate({
      title: "<a:startilt:1524621292790222989> Goodbye from **GVRE** <a:startilt:1524621292790222989>",
      description,
      banner: path.join(__dirname, "../graphics/gvregoodbye.png"),
      thumbnail: member.user.displayAvatarURL({ dynamic: true })
    });

    await channel.send({
      embeds: [embed],
      files
    });
  }
};
