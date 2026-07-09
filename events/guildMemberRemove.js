const path = require("node:path");
const embedTemplate = require("../utils/embedTemplate");

module.exports = {
  name: "guildMemberRemove",

  async execute(member) {
    const channelId = "1524653816505700472"; // goodbye channel
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    // Partner role ID
    const partnerRoleId = "1524695910443909181";

    // Check if user had partner role
    const isPartner = member.roles.cache.has(partnerRoleId);

    // Base description
    let description =
      `> <:arrowright:1523736161770672209> **${member.user.tag}** has left **Greenville Roleplay East**. We hope to see you again soon — thank you for being part of our community!`;

    // Add partner message if needed
    if (isPartner) {
      description +=
        `\n\n> <:arrowright:1523736161770672209> **Server partner has left GVRE.**`;
    }

    // Build embed
    const { embed, files } = embedTemplate({
      title: "<a:startilt:1524621292790222989> Goodbye from **GVRE** <a:startilt:1524621292790222989>",
      description,
      banner: path.join(__dirname, "../graphics/gvrebye.png"),
      thumbnail: member.user.displayAvatarURL({ dynamic: true }),
      color: isPartner ? "ffe481" : undefined // special color for partners
    });

    // If partner, ping HR outside embed
    if (isPartner) {
      await channel.send(`<@&1524695910443909181>`);
    }

    // Send embed
    await channel.send({
      embeds: [embed],
      files
    });
  }
};
