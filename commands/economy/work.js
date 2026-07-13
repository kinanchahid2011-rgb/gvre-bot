const { SlashCommandBuilder } = require("discord.js");
const {
  getUserRecord,
  updateUserRecord,
  loadWorkMessages,
} = require("../../economy/economyutils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("work")
    .setDescription("Work a job and earn money (1 hour cooldown)"),

  async execute(interaction) {
    const userId = interaction.user.id;
    const user = await getUserRecord(userId);

    const cooldown = 60 * 60 * 1000; // 1 hour in ms
    const now = Date.now();

    if (user.lastWork && now - user.lastWork < cooldown) {
      const remaining = cooldown - (now - user.lastWork);
      const minutes = Math.ceil(remaining / 60000);

      return interaction.reply({
        content: `⏳ You must wait **${minutes} minutes** before working again.`,
        ephemeral: true,
      });
    }

    const workMessages = await loadWorkMessages();
    const keys = Object.keys(workMessages);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const message = workMessages[randomKey];

    // Extract pay amount from message (e.g., "$500")
    const payMatch = message.match(/\$(\d+)/);
    const pay = payMatch ? parseInt(payMatch[1]) : 0;

    user.cash += pay;
    user.lastWork = now;

    await updateUserRecord(user);

    return interaction.reply(
      `💼 ${message}\n\nYou now have **$${user.cash}**.`,
    );
  },
};
