const {
  SlashCommandBuilder, PermissionFlagsBits, ChannelType,
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder
} = require("discord.js");
const { emoji } = require("./config");

const commands = [
  new SlashCommandBuilder().setName("help").setDescription("Muestra todos los comandos de GHOST BOT"),
  new SlashCommandBuilder().setName("ping").setDescription("Comprueba la latencia del bot"),
  new SlashCommandBuilder().setName("serverinfo").setDescription("Información del servidor"),
  new SlashCommandBuilder().setName("userinfo").setDescription("Información de un usuario")
    .addUserOption(o=>o.setName("usuario").setDescription("Usuario a consultar")),
  new SlashCommandBuilder().setName("client").setDescription("Información de GHOST CLIENT"),
  new SlashCommandBuilder().setName("status").setDescription("Estado de GHOST CLIENT"),
  new SlashCommandBuilder().setName("premium").setDescription("Información de GHOST Premium"),
  new SlashCommandBuilder().setName("invite").setDescription("Invita a GHOST BOT"),
  new SlashCommandBuilder().setName("say").setDescription("Envía un mensaje como el bot")
    .addStringOption(o=>o.setName("mensaje").setDescription("Texto").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder().setName("purge").setDescription("Elimina mensajes recientes (máximo 100)")
    .addIntegerOption(o=>o.setName("cantidad").setDescription("Cantidad entre 1 y 100").setMinValue(1).setMaxValue(100).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder().setName("kick").setDescription("Expulsa a un miembro")
    .addUserOption(o=>o.setName("usuario").setDescription("Miembro").setRequired(true))
    .addStringOption(o=>o.setName("razon").setDescription("Motivo"))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  new SlashCommandBuilder().setName("ban").setDescription("Banea a un miembro")
    .addUserOption(o=>o.setName("usuario").setDescription("Miembro").setRequired(true))
    .addStringOption(o=>o.setName("razon").setDescription("Motivo"))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  new SlashCommandBuilder().setName("timeout").setDescription("Aplica timeout a un miembro")
    .addUserOption(o=>o.setName("usuario").setDescription("Miembro").setRequired(true))
    .addIntegerOption(o=>o.setName("minutos").setDescription("Duración en minutos").setMinValue(1).setMaxValue(40320).setRequired(true))
    .addStringOption(o=>o.setName("razon").setDescription("Motivo"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  new SlashCommandBuilder().setName("lock").setDescription("Cierra el canal actual")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  new SlashCommandBuilder().setName("unlock").setDescription("Abre el canal actual")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  new SlashCommandBuilder().setName("ticket-panel").setDescription("Publica el panel de tickets")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  new SlashCommandBuilder().setName("poll").setDescription("Crea una encuesta con botones")
    .addStringOption(o=>o.setName("pregunta").setDescription("Pregunta").setRequired(true))
    .addStringOption(o=>o.setName("opcion1").setDescription("Primera opción").setRequired(true))
    .addStringOption(o=>o.setName("opcion2").setDescription("Segunda opción").setRequired(true))
    .addStringOption(o=>o.setName("opcion3").setDescription("Tercera opción opcional")),
  new SlashCommandBuilder().setName("suggest").setDescription("Envía una sugerencia")
    .addStringOption(o=>o.setName("idea").setDescription("Tu sugerencia").setRequired(true)),
  new SlashCommandBuilder().setName("giveaway").setDescription("Crea un sorteo")
    .addStringOption(o=>o.setName("premio").setDescription("Premio").setRequired(true))
    .addIntegerOption(o=>o.setName("minutos").setDescription("Duración en minutos").setMinValue(1).setMaxValue(10080).setRequired(true))
    .addIntegerOption(o=>o.setName("ganadores").setDescription("Número de ganadores").setMinValue(1).setMaxValue(10).setRequired(true)),
  new SlashCommandBuilder().setName("announce").setDescription("Publica un anuncio")
    .addStringOption(o=>o.setName("titulo").setDescription("Título").setRequired(true))
    .addStringOption(o=>o.setName("texto").setDescription("Contenido").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder().setName("invites").setDescription("Consulta invitaciones atribuidas")
    .addUserOption(o=>o.setName("usuario").setDescription("Usuario")),
  new SlashCommandBuilder().setName("avatar").setDescription("Muestra el avatar de un usuario")
    .addUserOption(o=>o.setName("usuario").setDescription("Usuario")),
  new SlashCommandBuilder().setName("roleinfo").setDescription("Información de un rol")
    .addRoleOption(o=>o.setName("rol").setDescription("Rol").setRequired(true))
].map(c => c.toJSON());

module.exports = { commands };
