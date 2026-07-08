const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const embedTemplate = require("../../utils/embedTemplate");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketclose")
    .setDescription("Close a support ticket and send a transcript."),

  async execute(interaction) {
    const channel = interaction.channel;

    // 🔹 Claimer check
    if (!channel.claimerId) {
      return interaction.reply({
        content: "This ticket has not been claimed yet.",
        flags: 64,
      });
    }

    if (interaction.user.id !== channel.claimerId) {
      return interaction.reply({
        content: "Only the claimer can close this ticket.",
        flags: 64,
      });
    }

    await interaction.deferReply({ flags: 64 });

    // 🔹 Identify opener safely
    let openerUser;
    try {
      openerUser = await interaction.guild.members.fetch(channel.openerId);
    } catch {
      return interaction.editReply({
        content: "Could not identify the ticket opener.",
      });
    }

    const transcriptLogChannel = interaction.guild.channels.cache.get(
      "1524343516384198727",
    );

    const generalLogChannel = interaction.guild.channels.cache.get(
      "1482745496018616524",
    );

    // 🔹 Generate transcript
    const messages = await channel.messages.fetch({ limit: 100 });
    const transcript = messages
      .map((m) => `${m.author.tag}: ${m.content}`)
      .reverse()
      .join("\n");

    // 🔹 DM transcript to user
    try {
      await openerUser.send({
        content: "Here is your GVRE Support Ticket transcript:",
        files: [
          {
            attachment: Buffer.from(transcript, "utf-8"),
            name: `${channel.name}-transcript.txt`,
          },
        ],
      });
    } catch {
      console.log("Could not DM user transcript.");
    }

    // 🔹 Log transcript file
    await transcriptLogChannel.send({
      content: `Transcript for ${channel.name}:`,
      files: [
        {
          attachment: Buffer.from(transcript, "utf-8"),
          name: `${channel.name}-transcript.txt`,
        },
      ],
    });

    // ⭐ FULL LOGGING FOR TICKET CLOSE
    if (generalLogChannel) {
    const unix = Math.floor(Date.now() / 1000);
    const timestamp = `<t:${unix}:F>`;

      const { embed: logEmbed } = embedTemplate({
        title:
          "<:shines:1524097104547680276> Ticket Closed <:shines:1524097104547680276>",
        description:
          `> <:arrowright:1523736161770672209> **Ticket:** ${channel.name}\n` +
          `> <:arrowright:1523736161770672209> **Closed By:** ${interaction.user} (${interaction.user.id})\n` +
          `> <:arrowright:1523736161770672209> **Guild:** ${interaction.guild.name} (${interaction.guild.id})\n` +
          `> <:arrowright:1523736161770672209> **Channel:** ${channel} (${channel.id})\n` +
          (interaction.message
            ? `> <:arrowright:1523736161770672209> **Message ID:** ${interaction.message.id}\n`
            : "") +
          `> <:arrowright:1523736161770672209> **Timestamp:** ${timestamp}\n\n` +
          `> <:arrowright2:1523737938960322640> Transcript saved and ticket deleted.`,
      });

      generalLogChannel.send({ embeds: [logEmbed] }).catch(() => {});
    }

    // 🔹 Feedback button (sent to DMs)
    const feedbackButton = new ButtonBuilder()
      .setCustomId("feedback_form")
      .setLabel("Submit Feedback")
      .setStyle(ButtonStyle.Primary);

    const feedbackRow = new ActionRowBuilder().addComponents(feedbackButton);

    const { embed } = embedTemplate({
      title:
        "<:shines:1524097104547680276> Ticket Closed <:shines:1524097104547680276>",
      description:
        `> Closed by: ${interaction.user}\n\n` +
        `> Your transcript has been sent.\n\n` +
        `> Please submit your feedback using the button below.`,
    });

    // 🔹 Send feedback form to user's DMs
    try {
      await openerUser.send({
        embeds: [embed],
        components: [feedbackRow],
      });
    } catch {
      console.log("Could not DM feedback form to user.");
    }

    // 🔹 Delete ticket channel
    setTimeout(() => {
      channel.delete().catch(() => {});
    }, 3000);

    // 🔹 Final reply to claimer
    await interaction.editReply({
      content: "Ticket closed, transcript sent, and feedback form delivered.",
    });
  },
};
