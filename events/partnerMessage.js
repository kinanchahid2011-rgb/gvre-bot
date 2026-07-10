const embedTemplate = require("../utils/embedTemplate");

module.exports = {
  name: "messageCreate",

  async execute(message) {
    // Ignore bot messages
    if (message.author.bot) return;

    // Target channel
    const targetChannelId = "1483450024581927034";

    if (message.channel.id !== targetChannelId) return;

    // Create embed
    const { embed } = embedTemplate({
      title: "<:shines:1524097104547680276> Greenville Roleplay East - *__Partnerships__* <:shines:1524097104547680276>",
      description:
        "> <:arrowright2:1523737938960322640> Interested in partnering with **GVRE**? Open a ticket in support!\n" +
        "> <:arrowright2:1523737938960322640> Tired of these pings? Feel free to mute this channel."
    });

    // Send embed
    await message.channel.send({
      embeds: [embed]
    });
  }
};
