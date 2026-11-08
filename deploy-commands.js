const { REST, Routes } = require("discord.js");
const { commands } = require("./commands");
const { token, clientId, guildId } = require("./config");
if (!token || !clientId || !guildId) {
  console.error("Configura DISCORD_TOKEN, CLIENT_ID y GUILD_ID en Secrets/.env");
  process.exit(1);
}
const rest = new REST({ version: "10" }).setToken(token);
(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log(`Registrados ${commands.length} comandos en el servidor ${guildId}.`);
  } catch (error) { console.error(error); process.exit(1); }
})();
