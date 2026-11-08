require("dotenv").config();

const emoji = (key, fallback = "•") => process.env[`EMOJI_${key}`] || fallback;

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  channels: {
    welcome: process.env.WELCOME_CHANNEL_ID,
    goodbye: process.env.GOODBYE_CHANNEL_ID,
    ticketCategory: process.env.TICKET_CATEGORY_ID,
    ticketLogs: process.env.TICKET_LOG_CHANNEL_ID,
    giveaway: process.env.GIVEAWAY_CHANNEL_ID,
    suggestions: process.env.SUGGESTION_CHANNEL_ID,
    modLogs: process.env.MOD_LOG_CHANNEL_ID
  },
  emoji
};
