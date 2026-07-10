const path = require("node:path");
const embedTemplate = require("../utils/embedTemplate");

module.exports = {
  name: "guildMemberRemove",

  async execute(member, client) {
    const channelId = "1524653816505700472"; // goodbye channel
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    const partnerRoleId = "1524695910443909181"; // Partner role
    const hrRoleId = "1481953102654607451"; // HR role
    const staffRoleId = "1481953107448692860"; // Staff Team role

    const isPartner = member.roles.cache.has(partnerRoleId);
    const isStaff = member.roles.cache.has(staffRoleId);

    // ⭐ Ping the user who left
    const pingUser = `<@${member.user.id}>`;

    let description = `> <:arrowright:1523736161770672209> **${member.user.tag}** has left **Greenville Roleplay East**. We hope to see you again soon — thank you for being part of our community!`;

    if (isPartner) {
      description += `\n\n> <:arrowright:1523736161770672209> **Partner has left the server.**`;
    }

    if (isStaff) {
      description += `\n\n> <:arrowright:1523736161770672209> **Staff member has left the server.**`;
    }

    const { embed, files } = embedTemplate({
      title:
        "<:shines:1524097104547680276> Goodbye from GVRE <:shines:1524097104547680276>",
      description,
      banner: path.join(__dirname, "../graphics/gvregoodbye.png"),
      thumbnail: member.user.displayAvatarURL({ dynamic: true }),
      color: isStaff ? 0xdc1ee9 : isPartner ? 0xffe481 : undefined,
    });

    // ⭐ Partner leaves → ping HR
    if (isPartner) {
      await channel.send({
        content: `${pingUser} <@&${hrRoleId}>`,
        embeds: [embed],
        files,
      });
      return;
    }

    // ⭐ Staff leaves → ping HR
    if (isStaff) {
      await channel.send({
        content: `${pingUser} <@&${hrRoleId}>`,
        embeds: [embed],
        files,
      });
      return;
    }

    // ⭐ Normal user leaves → ping user only
    await channel.send({
      content: pingUser,
      embeds: [embed],
      files,
    });
  },
};
