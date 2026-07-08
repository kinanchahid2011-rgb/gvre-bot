const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const path = require("node:path");
const embedTemplate = require("../../utils/embedTemplate");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("support")
    .setDescription("Send the GVRE Support embed"),

  async execute(interaction) {
    const hrRoleId = "1481953102654607451"; // HR role ID
    const generalLogChannel = interaction.guild.channels.cache.get(
      "1482745496018616524",
    );

    if (!interaction.member.roles.cache.has(hrRoleId)) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        flags: 64,
      });
    }

    await interaction.deferReply({ flags: 64 });

    // ⭐ LOG: Support command used
    if (generalLogChannel) {
      const timestamp = new Date().toLocaleString("en-GB", { hour12: true });

      const { embed: logEmbed } = embedTemplate({
        title:
          "<:shines:1524097104547680276> Support Command Used <:shines:1524097104547680276>",
        description:
          `> <:arrowright:1523736161770672209> **Used By:** ${interaction.user} (${interaction.user.id})\n` +
          `> <:arrowright:1523736161770672209> **Guild:** ${interaction.guild.name} (${interaction.guild.id})\n` +
          `> <:arrowright:1523736161770672209> **Channel:** ${interaction.channel} (${interaction.channel.id})\n` +
          `> <:arrowright:1523736161770672209> **Message ID:** ${interaction.id}\n` +
          `> <:arrowright:1523736161770672209> **Timestamp:** ${timestamp}\n\n` +
          `> <:arrowright2:1523737938960322640> Support embed was sent.`,
      });

      generalLogChannel.send({ embeds: [logEmbed] }).catch(() => {});
    }

    // 🖼️ Banner embed
    const bannerEmbed = new EmbedBuilder()
      .setImage("attachment://gvresupport.png")
      .setColor(0x3cf65b);

    // 🟢 Main support embed
    const supportEmbed = new EmbedBuilder()
      .setTitle(
        "<:shines:1524097104547680276> Greenville Roleplay East - *__Support__* <:shines:1524097104547680276>",
      )
      .setDescription(
        "> <:arrowright:1523736161770672209> Welcome to the **GVRE Support Center**! Here, you can submit a support ticket for any issue or inquiry.\n\n" +
          "> <:arrowright2:1523737938960322640> Please select the appropriate category below to begin your request.\n" +
          "> <:arrowright2:1523737938960322640> Thank you for helping us keep GVRE running smoothly!",
      )
      .setColor(0x3cf65b)
      .setThumbnail(interaction.client.user.displayAvatarURL());

    const menu = new StringSelectMenuBuilder()
      .setCustomId("support_select")
      .setPlaceholder("Select a support category")
      .addOptions([
        {
          label: "General Support",
          description: "Questions or help with server features",
          value: "general",
        },
        {
          label: "User Report",
          description: "Report a user for rule violations",
          value: "user",
        },
        {
          label: "Staff Report",
          description: "Report a staff member for misconduct",
          value: "staff",
        },
        {
          label: "Partnership",
          description: "Inquire about partnerships or collaborations",
          value: "partner",
        },
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    // ⭐ SEND SUPPORT EMBEDS
    await interaction.channel.send({
      embeds: [bannerEmbed],
      files: [path.join(__dirname, "../../graphics/gvresupport.png")],
    });

    const message = await interaction.channel.send({
      embeds: [supportEmbed],
      components: [row],
    });

    await interaction.editReply({
      content: "Support embed sent successfully.",
    });

    // 🔹 Dropdown collector
    const collector = message.createMessageComponentCollector({
      time: 600000,
    });

    collector.on("collect", async (selectInteraction) => {
      const category = selectInteraction.values[0];
      const categoryId = "1524335280289615962";
      const staffTeamRole = "1481953107448692860";
      const hrRole = "1481953102654607451";

      const opener = selectInteraction.user;
      const channelName = `${category}-${opener.username}`;

      const channel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: categoryId,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: opener.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          },
          {
            id: hrRole,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          },
          {
            id: staffTeamRole,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          },
        ],
      });

      // ⭐ Store opener ID
      channel.openerId = opener.id;

      await selectInteraction.reply({
        content: `<:yes:1523981318935810139> Your support ticket has been created: ${channel}`,
        flags: 64,
      });

      // ⭐ LOG: Ticket opened
      if (generalLogChannel) {
        const timestamp = new Date().toLocaleString("en-GB", { hour12: true });

        const { embed: logEmbed } = embedTemplate({
          title:
            "<:shines:1524097104547680276> Ticket Opened <:shines:1524097104547680276>",
          description:
            `> <:arrowright:1523736161770672209> **Category:** ${category}\n` +
            `> <:arrowright:1523736161770672209> **Opened By:** ${opener} (${opener.id})\n` +
            `> <:arrowright:1523736161770672209> **Ticket Channel:** ${channel} (${channel.id})\n` +
            `> <:arrowright:1523736161770672209> **Guild:** ${interaction.guild.name} (${interaction.guild.id})\n` +
            `> <:arrowright:1523736161770672209> **Message ID:** ${selectInteraction.message.id}\n` +
            `> <:arrowright:1523736161770672209> **Timestamp:** ${timestamp}\n\n` +
            `> <:arrowright2:1523737938960322640> Ticket successfully created.`,
        });

        generalLogChannel.send({ embeds: [logEmbed] }).catch(() => {});
      }

      // Determine ping role
      const pingRole =
        category === "staff" || category === "partner"
          ? `<@&${hrRole}> <@${opener.id}>`
          : `<@&${staffTeamRole}> <@${opener.id}>`;

      // Instructions
      let instructions;
      if (category === "general")
        instructions = "Please describe your inquiry in detail.";
      else if (category === "partner")
        instructions = "Please describe your partnership request.";
      else if (category === "user")
        instructions = "Please provide evidence of the user's actions.";
      else if (category === "staff")
        instructions = "Please provide evidence of the staff member's actions.";

      const { embed, files } = embedTemplate({
        title:
          "<:shines:1524097104547680276> GVRE Support Ticket <:shines:1524097104547680276>",
        description:
          `> <:arrowright:1523736161770672209> **Category:** ${category}\n` +
          `> <:arrowright:1523736161770672209> **Opened By:** ${opener}\n\n` +
          `> <:arrowright:1523736161770672209> ${instructions}\n\n` +
          `> <:arrowright2:1523737938960322640> Our team will respond shortly.`,
        banner: path.join(__dirname, "../../graphics/gvresupport.png"),
        thumbnail: interaction.client.user.displayAvatarURL(),
      });

      // Claim button
      const claimButton = new ButtonBuilder()
        .setCustomId("claim_ticket")
        .setLabel("Claim Ticket")
        .setStyle(ButtonStyle.Success);

      const claimRow = new ActionRowBuilder().addComponents(claimButton);

      const ticketMessage = await channel.send({
        content: pingRole,
        embeds: [embed],
        files,
        components: [claimRow],
      });

      // Claim logic
      const buttonCollector = channel.createMessageComponentCollector({
        time: 86400000,
      });

      buttonCollector.on("collect", async (btnInteraction) => {
        if (btnInteraction.customId !== "claim_ticket") return;

        if (
          !btnInteraction.member.roles.cache.has(hrRole) &&
          !btnInteraction.member.roles.cache.has(staffTeamRole)
        ) {
          return btnInteraction.reply({
            content: "Only HR or Staff members can claim tickets.",
            flags: 64,
          });
        }

        await btnInteraction.deferUpdate();

        const now = new Date();
        const unix = Math.floor(Date.now() / 1000);
        const timestamp = `<t:${unix}:F>`;

        if (claimButton.data.style === ButtonStyle.Success) {
          claimButton.setStyle(ButtonStyle.Danger).setLabel("Unclaim Ticket");

          // ⭐ Store claimer ID
          channel.claimerId = btnInteraction.user.id;

          const { embed: claimEmbed } = embedTemplate({
            title:
              "<:shines:1524097104547680276> Ticket Claimed <:shines:1524097104547680276>",
            description: `${btnInteraction.user} has claimed this ticket.\n${timestamp}`,
          });

          await channel.send({ embeds: [claimEmbed] });

          // ⭐ LOG: Ticket claimed
          if (generalLogChannel) {
            const { embed: logEmbed } = embedTemplate({
              title:
                "<:shines:1524097104547680276> Ticket Claimed <:shines:1524097104547680276>",
              description:
                `> <:arrowright:1523736161770672209> **Ticket:** ${channel.name} (${channel.id})\n` +
                `> <:arrowright:1523736161770672209> **Claimed By:** ${btnInteraction.user} (${btnInteraction.user.id})\n` +
                `> <:arrowright:1523736161770672209> **Guild:** ${interaction.guild.name} (${interaction.guild.id})\n` +
                `> <:arrowright:1523736161770672209> **Message ID:** ${btnInteraction.message.id}\n` +
                `> <:arrowright:1523736161770672209> **Timestamp:** ${timestamp}`,
            });

            generalLogChannel.send({ embeds: [logEmbed] }).catch(() => {});
          }
        } else {
          claimButton.setStyle(ButtonStyle.Success).setLabel("Claim Ticket");

          channel.claimerId = null;

          const { embed: unclaimEmbed } = embedTemplate({
            title:
              "<:shines:1524097104547680276> Ticket Unclaimed <:shines:1524097104547680276>",
            description: `${btnInteraction.user} has unclaimed this ticket.\n${timestamp}`,
          });

          await channel.send({ embeds: [unclaimEmbed] });

          // ⭐ LOG: Ticket unclaimed
          if (generalLogChannel) {
            const { embed: logEmbed } = embedTemplate({
              title:
                "<:shines:1524097104547680276> Ticket Unclaimed <:shines:1524097104547680276>",
              description:
                `> <:arrowright:1523736161770672209> **Ticket:** ${channel.name} (${channel.id})\n` +
                `> <:arrowright:1523736161770672209> **Unclaimed By:** ${btnInteraction.user} (${btnInteraction.user.id})\n` +
                `> <:arrowright:1523736161770672209> **Guild:** ${interaction.guild.name} (${interaction.guild.id})\n` +
                `> <:arrowright:1523736161770672209> **Message ID:** ${btnInteraction.message.id}\n` +
                `> <:arrowright:1523736161770672209> **Timestamp:** ${timestamp}`,
            });

            generalLogChannel.send({ embeds: [logEmbed] }).catch(() => {});
          }
        }

        await ticketMessage.edit({
          components: [new ActionRowBuilder().addComponents(claimButton)],
        });
      });
    });
  },
};
