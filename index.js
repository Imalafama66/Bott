const {
  Client, GatewayIntentBits, Partials, Events, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType,
  PermissionFlagsBits, Collection
} = require("discord.js");
const config = require("./config");
const store = require("./store");

if (!config.token) {
  console.error("Falta DISCORD_TOKEN. Copia .env.example a .env y configura el token.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildInvites
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember]
});
const inviteCache = new Map();
const activeGiveaways = new Map();
const e = (key, fallback) => config.emoji(key, fallback);
const brand = 0x985cff;

function embed(title, description) {
  return new EmbedBuilder().setColor(brand).setTitle(title).setDescription(description).setFooter({ text: "GHOST BOT • Community System" }).setTimestamp();
}
async function log(guild, message) {
  const id = config.channels.modLogs;
  if (!id) return;
  const ch = await guild.channels.fetch(id).catch(()=>null);
  if (ch?.isTextBased()) ch.send({ embeds: [embed("Registro de moderación", message)] }).catch(()=>{});
}

client.once(Events.ClientReady, async c => {
  console.log(`GHOST BOT conectado como ${c.user.tag}`);
  c.user.setActivity("GHOST CLIENT • /help");
  for (const guild of c.guilds.cache.values()) {
    const invites = await guild.invites.fetch().catch(()=>null);
    if (invites) inviteCache.set(guild.id, new Map(invites.map(i=>[i.code,i.uses||0])));
  }
});

client.on(Events.InviteCreate, async invite => {
  const cache = inviteCache.get(invite.guild.id) || new Map();
  cache.set(invite.code, invite.uses || 0); inviteCache.set(invite.guild.id, cache);
});
client.on(Events.GuildMemberAdd, async member => {
  let inviter = null;
  const before = inviteCache.get(member.guild.id) || new Map();
  const now = await member.guild.invites.fetch().catch(()=>null);
  if (now) {
    const used = now.find(i => (i.uses || 0) > (before.get(i.code) || 0));
    if (used?.inviter) {
      inviter = used.inviter;
      const db = store.read(); db.invites[inviter.id] = (db.invites[inviter.id] || 0) + 1; store.write(db);
    }
    inviteCache.set(member.guild.id, new Map(now.map(i=>[i.code,i.uses||0])));
  }
  const ch = config.channels.welcome ? await member.guild.channels.fetch(config.channels.welcome).catch(()=>null) : member.guild.systemChannel;
  if (ch?.isTextBased()) ch.send({ embeds: [embed(`${e("HEART","💜")} ¡Bienvenido/a a GHOST CLIENT!`, `¡Qué bueno tenerte por aquí, ${member}!\\n\\nEres el miembro **#${member.guild.memberCount}**. Lee las reglas y disfruta de la comunidad.\\n${inviter ? `Invitado por: ${inviter}` : "Invitación: no identificada"}`)] }).catch(()=>{});
});
client.on(Events.GuildMemberRemove, async member => {
  const ch = config.channels.goodbye ? await member.guild.channels.fetch(config.channels.goodbye).catch(()=>null) : member.guild.systemChannel;
  if (ch?.isTextBased()) ch.send({ embeds: [embed("Hasta pronto 👋", `**${member.user.tag}** ha salido del servidor. ¡Esperamos verte de vuelta!`)] }).catch(()=>{});
});

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const { commandName: cmd, options, guild, member, user, channel } = interaction;
      if (cmd === "help") {
        const groups = [
          "**Comunidad**\n`/help` `/ping` `/serverinfo` `/userinfo` `/avatar` `/roleinfo` `/invites`",
          "**GHOST CLIENT**\n`/client` `/status` `/premium` `/invite`",
          "**Moderación**\n`/purge` `/kick` `/ban` `/timeout` `/lock` `/unlock` `/say`",
          "**Interacciones**\n`/ticket-panel` `/poll` `/suggest` `/giveaway` `/announce`"
        ];
        return interaction.reply({ embeds: [embed("GHOST BOT • Centro de comandos", groups.join("\\n\\n"))], ephemeral: true });
      }
      if (cmd === "ping") return interaction.reply({ embeds: [embed(`${e("PING","🏓")} Pong!`, `Latencia API: **${client.ws.ping} ms**\\nEstado: ${e("PING_MEDIUM","🟢")} Operativo`)], ephemeral: true });
      if (cmd === "client") return interaction.reply({ embeds: [embed(`${e("MINECRAFT","⛏️")} GHOST CLIENT`, "Plataforma de cliente Minecraft. Consulta las novedades y versiones en la web oficial de GHOST CLIENT.")], ephemeral: false });
      if (cmd === "status") return interaction.reply({ embeds: [embed("Estado de GHOST", `${e("PING_MEDIUM","🟢")} Bot: online\\n${e("PING","📡")} API Discord: ${client.ws.ping} ms\\n${e("ALERT","⚠️")} Estado de web/pagos: no conectado a este bot todavía.`)] });
      if (cmd === "premium") return interaction.reply({ embeds: [embed(`${e("CROWN","👑")} GHOST PREMIUM`, "Consulta planes, beneficios y disponibilidad en la página oficial. Las compras solo se reconocerán cuando el backend confirme el pago.")], ephemeral: false });
      if (cmd === "invite") return interaction.reply({ content: `Invita al bot desde el panel OAuth2 del Discord Developer Portal.`, ephemeral: true });
      if (cmd === "serverinfo") return interaction.reply({ embeds: [embed(`Información de ${guild.name}`, `Miembros: **${guild.memberCount}**\\nCanales: **${guild.channels.cache.size}**\\nCreado: <t:${Math.floor(guild.createdTimestamp/1000)}:D>`).setThumbnail(guild.iconURL())] });
      if (cmd === "userinfo") {
        const target = options.getUser("usuario") || user;
        return interaction.reply({ embeds: [embed(`Usuario: ${target.tag}`, `ID: \`${target.id}\`\\nCuenta creada: <t:${Math.floor(target.createdTimestamp/1000)}:R>`).setThumbnail(target.displayAvatarURL({size:512}))] });
      }
      if (cmd === "avatar") {
        const target = options.getUser("usuario") || user;
        return interaction.reply({ embeds: [embed(`Avatar de ${target.tag}`, `[PNG](${target.displayAvatarURL({size:1024,extension:"png"})})`).setImage(target.displayAvatarURL({size:1024}))] });
      }
      if (cmd === "roleinfo") {
        const role = options.getRole("rol");
        return interaction.reply({ embeds: [embed(`Rol: ${role.name}`, `ID: \`${role.id}\`\\nMiembros: **${role.members.size}**\\nColor: **${role.hexColor}**`)] });
      }
      if (cmd === "invites") {
        const target = options.getUser("usuario") || user; const db = store.read();
        return interaction.reply({ embeds: [embed("Invitaciones", `${target} tiene **${db.invites[target.id] || 0}** invitaciones atribuidas desde que GHOST BOT está registrando usos.`)], ephemeral: true });
      }
      if (cmd === "say") {
        await interaction.reply({ content: "Mensaje enviado.", ephemeral: true });
        return channel.send({ content: options.getString("mensaje") });
      }
      if (cmd === "purge") {
        const amount = options.getInteger("cantidad");
        if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) return interaction.reply({content:"No tienes permiso para purgar mensajes.",ephemeral:true});
        const deleted = await channel.bulkDelete(amount, true);
        return interaction.reply({content:`${e("HAMMER","🧹")} Se eliminaron **${deleted.size}** mensajes recientes. Discord no permite borrar mensajes de más de 14 días con esta acción.`,ephemeral:true});
      }
      if (cmd === "kick" || cmd === "ban") {
        const target = options.getUser("usuario"), reason = options.getString("razon") || "Sin motivo especificado";
        const targetMember = await guild.members.fetch(target.id).catch(()=>null);
        if (!targetMember) return interaction.reply({content:"No encontré a ese miembro.",ephemeral:true});
        if (cmd === "kick") await targetMember.kick(reason); else await targetMember.ban({reason});
        await log(guild, `${cmd.toUpperCase()}: ${target.tag} • ${reason} • Moderador: ${user.tag}`);
        return interaction.reply({content:`Acción completada para **${target.tag}**.`,ephemeral:true});
      }
      if (cmd === "timeout") {
        const target = options.getUser("usuario"), mins = options.getInteger("minutos"), reason = options.getString("razon") || "Sin motivo";
        const m = await guild.members.fetch(target.id).catch(()=>null);
        if (!m) return interaction.reply({content:"Miembro no encontrado.",ephemeral:true});
        await m.timeout(mins*60000, reason); await log(guild, `TIMEOUT: ${target.tag} • ${mins} min • ${reason}`);
        return interaction.reply({content:`Timeout aplicado a ${target.tag} por ${mins} minutos.`,ephemeral:true});
      }
      if (cmd === "lock" || cmd === "unlock") {
        await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: cmd === "unlock" ? null : false });
        return interaction.reply({content:cmd==="lock"?"🔒 Canal bloqueado.":"🔓 Canal desbloqueado.",ephemeral:true});
      }
      if (cmd === "ticket-panel") {
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("ticket:create").setLabel("Abrir ticket").setEmoji("🎫").setStyle(ButtonStyle.Primary));
        return interaction.reply({embeds:[embed("Centro de soporte", "Pulsa el botón para abrir un ticket privado con el equipo de soporte.")],components:[row]});
      }
      if (cmd === "poll") {
        const question = options.getString("pregunta");
        const choices = [options.getString("opcion1"),options.getString("opcion2"),options.getString("opcion3")].filter(Boolean);
        const row = new ActionRowBuilder().addComponents(...choices.map((x,i)=>new ButtonBuilder().setCustomId(`poll:${interaction.id}:${i}`).setLabel(x.slice(0,80)).setStyle([ButtonStyle.Primary,ButtonStyle.Success,ButtonStyle.Secondary][i])));
        const msg = await interaction.reply({embeds:[embed(`📊 ${question}`, choices.map((x,i)=>`${i+1}. ${x}`).join("\\n"))],components:[row],fetchReply:true});
        const collector = msg.createMessageComponentCollector({time:86400000});
        const votes = new Map();
        collector.on("collect", async i=>{ if(votes.has(i.user.id)) return i.reply({content:"Ya registraste tu voto.",ephemeral:true}); const idx=Number(i.customId.split(":").at(-1)); votes.set(i.user.id,idx); await i.reply({content:`Voto registrado: **${choices[idx]}**`,ephemeral:true}); });
        collector.on("end",async()=>{const counts=choices.map((x,i)=>`${x}: **${[...votes.values()].filter(v=>v===i).length}**`).join("\\n");msg.edit({embeds:[embed(`Encuesta finalizada: ${question}`,counts)],components:[]}).catch(()=>{});});
        return;
      }
      if (cmd === "suggest") {
        const text = options.getString("idea");
        const target = config.channels.suggestions ? await guild.channels.fetch(config.channels.suggestions).catch(()=>null) : channel;
        if (!target?.isTextBased()) return interaction.reply({content:"Canal de sugerencias no configurado.",ephemeral:true});
        const msg = await target.send({embeds:[embed("Nueva sugerencia", `${text}\\n\\nEnviada por ${user}`)]});
        await msg.react("👍"); await msg.react("👎");
        return interaction.reply({content:`${e("SENT","✅")} Sugerencia enviada.`,ephemeral:true});
      }
      if (cmd === "giveaway") {
        const prize=options.getString("premio"), mins=options.getInteger("minutos"), winners=options.getInteger("ganadores");
        const target=config.channels.giveaway?await guild.channels.fetch(config.channels.giveaway).catch(()=>null):channel;
        if(!target?.isTextBased()) return interaction.reply({content:"Canal de sorteos no disponible.",ephemeral:true});
        const end=Date.now()+mins*60000;
        const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("giveaway:enter").setLabel("Participar").setEmoji("🎉").setStyle(ButtonStyle.Success));
        const msg=await target.send({embeds:[embed("🎉 GHOST GIVEAWAY",`**Premio:** ${prize}\\n**Ganadores:** ${winners}\\n**Finaliza:** <t:${Math.floor(end/1000)}:R>\\nParticipantes: **0**`)],components:[row]});
        activeGiveaways.set(msg.id,{guildId:guild.id,channelId:target.id,prize,winners,end,entries:new Set()});
        setTimeout(async()=>{const g=activeGiveaways.get(msg.id);if(!g)return;const list=[...g.entries];const picked=list.sort(()=>Math.random()-.5).slice(0,g.winners);const ch=await client.channels.fetch(g.channelId).catch(()=>null);if(ch?.isTextBased()) ch.send({embeds:[embed("Sorteo finalizado",picked.length?`Ganador(es): ${picked.map(id=>`<@${id}>`).join(", ")}\\nPremio: **${g.prize}**`:"No hubo participantes.")]}).catch(()=>{});activeGiveaways.delete(msg.id);},mins*60000);
        return interaction.reply({content:"Sorteo publicado.",ephemeral:true});
      }
      if (cmd === "announce") {
        const title=options.getString("titulo"), text=options.getString("texto");
        await interaction.reply({content:"Anuncio publicado.",ephemeral:true});
        return channel.send({embeds:[embed(title,text)]});
      }
    }

    if (interaction.isButton()) {
      if (interaction.customId === "ticket:create") {
        const existing=interaction.guild.channels.cache.find(c=>c.topic===`ghost-ticket:${interaction.user.id}` && c.type===ChannelType.GuildText);
        if(existing) return interaction.reply({content:`Ya tienes un ticket abierto: ${existing}`,ephemeral:true});
        const name=`ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,90);
        const perms=[{id:interaction.guild.roles.everyone,deny:[PermissionFlagsBits.ViewChannel]},{id:interaction.user.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]},{id:client.user.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ManageChannels]}];
        const cat=config.channels.ticketCategory;
        const ch=await interaction.guild.channels.create({name,type:ChannelType.GuildText,topic:`ghost-ticket:${interaction.user.id}`,parent:cat||undefined,permissionOverwrites:perms});
        const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("ticket:close").setLabel("Cerrar ticket").setStyle(ButtonStyle.Danger));
        await ch.send({content:`${interaction.user}`,embeds:[embed("Ticket abierto","Describe tu consulta y el equipo te atenderá. No compartas contraseñas ni datos sensibles.")],components:[row]});
        return interaction.reply({content:`Ticket creado: ${ch}`,ephemeral:true});
      }
      if (interaction.customId === "ticket:close") {
        if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels) && !interaction.channel.topic?.includes(interaction.user.id)) return interaction.reply({content:"No puedes cerrar este ticket.",ephemeral:true});
        await interaction.reply({content:"Este ticket se cerrará en 5 segundos."});
        setTimeout(()=>interaction.channel.delete("Ticket cerrado").catch(()=>{}),5000);
      }
      if (interaction.customId === "giveaway:enter") {
        const g=activeGiveaways.get(interaction.message.id);
        if(!g) return interaction.reply({content:"Este sorteo ya terminó o el bot se reinició.",ephemeral:true});
        if(g.entries.has(interaction.user.id)) return interaction.reply({content:"Ya estás participando.",ephemeral:true});
        g.entries.add(interaction.user.id);
        return interaction.reply({content:`${e("GG","🎉")} ¡Ya estás participando!`,ephemeral:true});
      }
    }
  } catch (err) {
    console.error(err);
    const msg="Ocurrió un error al ejecutar la acción. Revisa permisos y configuración.";
    if (interaction.deferred || interaction.replied) interaction.followUp({content:msg,ephemeral:true}).catch(()=>{});
    else interaction.reply({content:msg,ephemeral:true}).catch(()=>{});
  }
});

client.login(config.token);
