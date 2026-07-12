require("dotenv").config();
const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Bot is alive!"));
app.listen(3000, () => console.log("Web server running on port 3000"));
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  Events,
} = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const embedTemplate = require("./utils/embedTemplate");
require("./giveaway/giveawayhandler")(client);

// -----------------------------------------------------
// LOGGING SETUP
// -----------------------------------------------------
const GENERAL_LOG_CHANNEL = "1482745496018616524"; // bot-logs
const SESSION_LOG_CHANNEL = "1524362111575134298"; // session-logs
const FEEDBACK_LOG_CHANNEL = "1482337865433088091"; // feedback submissions

function logEvent(
  client,
  channelId,
  title,
  interaction,
  extraDescription = "",
) {
  const guild = client.guilds.cache.get("1481939959513481288");
  if (!guild) return;

  const logChannel = guild.channels.cache.get(channelId);
  if (!logChannel) return;

  const unix = Math.floor(Date.now() / 1000);
  const timestamp = `<t:${unix}:F>`;

  const description =
    `> <:arrowright:1523736161770672209> **User:** ${interaction.user} (${interaction.user.id})\n` +
    `> <:arrowright:1523736161770672209> **Guild:** ${guild.name} (${guild.id})\n` +
    (interaction.channel
      ? `> <:arrowright:1523736161770672209> **Channel:** ${interaction.channel} (${interaction.channel.id})\n`
      : `> <:arrowright:1523736161770672209> **Channel:** DM\n`) +
    (interaction.message
      ? `> <:arrowright:1523736161770672209> **Message ID:** ${interaction.message.id}\n`
      : "") +
    `> <:arrowright:1523736161770672209> **Timestamp:** ${timestamp}\n\n` +
    extraDescription;

  const { embed } = embedTemplate({ title, description });
  logChannel.send({ embeds: [embed] }).catch(() => {});
}

// -----------------------------------------------------
// CLIENT SETUP
// -----------------------------------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

// -----------------------------------------------------
// LOAD COMMANDS
// -----------------------------------------------------
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
  }
}

// -----------------------------------------------------
// LOAD EVENTS
// -----------------------------------------------------
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// -----------------------------------------------------
// READY EVENT
// -----------------------------------------------------
client.once(Events.ClientReady, () => {
  console.log(`🟢 Bot is online as ${client.user.tag}`);
});

// -----------------------------------------------------
// GLOBAL INTERACTION HANDLER
// -----------------------------------------------------
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // -----------------------------------------------------
    // 🔹 Slash commands → BOT LOGS
    // -----------------------------------------------------
    if (interaction.isChatInputCommand()) {
      logEvent(
        client,
        GENERAL_LOG_CHANNEL,
        "<:shines:1524097104547680276> Command Used <:shines:1524097104547680276>",
        interaction,
        `> <:arrowright2:1523737938960322640> **Command:** /${interaction.commandName}`,
      );

      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
      return;
    }

    // -----------------------------------------------------
    // 🔹 FEEDBACK BUTTON → BOT LOGS
    // -----------------------------------------------------
    if (interaction.isButton() && interaction.customId === "feedback_form") {
      logEvent(
        client,
        GENERAL_LOG_CHANNEL,
        "<:shines:1524097104547680276> Button Clicked <:shines:1524097104547680276>",
        interaction,
        `> <:arrowright2:1523737938960322640> **Button ID:** feedback_form`,
      );

      await interaction.showModal({
        title: "GVRE Support Feedback",
        custom_id: "feedback_modal",
        components: [
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: "feedback_rating",
                label: "Rate your experience (1–5)",
                style: 1,
                placeholder: "Enter a number between 1 and 5",
                required: true,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: "feedback_comment",
                label: "What did you like about our support?",
                style: 2,
                min_length: 10,
                max_length: 500,
                placeholder: "Share what went well!",
                required: true,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: "feedback_improve",
                label: "What could we improve?",
                style: 2,
                min_length: 10,
                max_length: 500,
                placeholder: "Tell us how we can do better.",
                required: false,
              },
            ],
          },
        ],
      });

      return;
    }

    // -----------------------------------------------------
    // 🔹 FEEDBACK MODAL → FEEDBACK LOGS
    // -----------------------------------------------------
    if (
      interaction.isModalSubmit() &&
      interaction.customId === "feedback_modal"
    ) {
      logEvent(
        client,
        FEEDBACK_LOG_CHANNEL,
        "<:shines:1524097104547680276> Feedback Submitted <:shines:1524097104547680276>",
        interaction,
        "> <:arrowright2:1523737938960322640> Feedback submitted via DM",
      );

      const rating = interaction.fields.getTextInputValue("feedback_rating");
      const comment = interaction.fields.getTextInputValue("feedback_comment");
      const improve = interaction.fields.getTextInputValue("feedback_improve");

      const guild = client.guilds.cache.get("1481939959513481288");
      const feedbackChannel = guild.channels.cache.get(FEEDBACK_LOG_CHANNEL);

      const { embed: feedbackEmbed } = embedTemplate({
        title:
          "<:shines:1524097104547680276> New Feedback <:shines:1524097104547680276>",
        description:
          `> **From:** ${interaction.user}\n` +
          `> **Rating:** ${rating}/5\n\n` +
          `> **Positive Feedback:**\n${comment}\n\n` +
          (improve ? `> **Suggestions for Improvement:**\n${improve}` : ""),
      });

      await feedbackChannel.send({ embeds: [feedbackEmbed] });

      await interaction.reply({
        content: "Thank you for your feedback! 💚",
        flags: 64,
      });

      return;
    }

    // -----------------------------------------------------
    // 🔹 STARTUP SYSTEM BUTTONS → BOT LOGS
    // -----------------------------------------------------
    if (interaction.isButton()) {
      logEvent(
        client,
        GENERAL_LOG_CHANNEL,
        "<:shines:1524097104547680276> Button Clicked <:shines:1524097104547680276>",
        interaction,
        `> <:arrowright2:1523737938960322640> **Button ID:** ${interaction.customId}`,
      );

      if (interaction.customId === "claim_ticket") return;

      const messages = await interaction.channel.messages.fetch({ limit: 50 });
      const startupMessage = messages.find((m) =>
        m.embeds[0]?.title?.includes("Session Startup"),
      );

      let reacted = false;

      if (startupMessage) {
        for (const reaction of startupMessage.reactions.cache.values()) {
          const users = await reaction.users.fetch();
          if (users.has(interaction.user.id)) {
            reacted = true;
            break;
          }
        }
      }

      if (!reacted) {
        const { embed } = embedTemplate({
          title:
            "<:shines:1524097104547680276> Access Denied <:shines:1524097104547680276>",
          description:
            "> <:arrowright:1523736161770672209> You must react to the **Startup Embed** before accessing the session link.",
        });

        return interaction.reply({
          embeds: [embed],
          flags: 64,
        });
      }

      const link = interaction.message.sessionLink || "Link unavailable.";
      let linkLabel = "";

      switch (interaction.customId) {
        case "release_link":
          linkLabel = "Session Link";
          break;
        case "reinvites_link":
          linkLabel = "Reinvite Link";
          break;
        case "earlyaccess_link":
          linkLabel = "Early Access Link";
          break;
        case "regen_link":
          linkLabel = "Regenerated Link";
          break;
        default:
          linkLabel = "Link";
      }

      // ⭐ SESSION BUTTONS → STILL BOT LOGS (NOT session logs)
      logEvent(
        client,
        GENERAL_LOG_CHANNEL,
        "<:shines:1524097104547680276> Session Button Used <:shines:1524097104547680276>",
        interaction,
        `> <:arrowright2:1523737938960322640> **Action:** ${interaction.customId}`,
      );

      const { embed } = embedTemplate({
        title: `<:shines:1524097104547680276> ${linkLabel} <:shines:1524097104547680276>`,
        description: `> <:arrowright:1523736161770672209> Here is your ${linkLabel.toLowerCase()}:\n${link}`,
      });

      return interaction.reply({
        embeds: [embed],
        flags: 64,
      });
    }
  } catch (error) {
    console.error("Interaction error:", error);

    const { embed } = embedTemplate({
      title:
        "<:shines:1524097104547680276> Error <:shines:1524097104547680276>",
      description:
        "> <:arrowright:1523736161770672209> There was an error executing this interaction.",
    });

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [embed], flags: 64 });
    } else {
      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  }
});

// -----------------------------------------------------
// LOGIN
// -----------------------------------------------------
client.login(process.env.TOKEN);
