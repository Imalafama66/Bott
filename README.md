# GHOST BOT — Discord Community System

Bot modular para la comunidad GHOST CLIENT, construido con Node.js + discord.js v14.

## Incluye
- Bienvenidas y despedidas configurables por canal.
- Registro básico de invitaciones atribuidas (desde que el bot está activo).
- Tickets privados con botones de abrir/cerrar.
- Sorteos con botón de participación.
- Encuestas interactivas con botones y conteo de votos.
- Sugerencias con reacciones.
- Anuncios y mensajes personalizados.
- Moderación: purge, kick, ban, timeout, lock y unlock.
- Comandos de comunidad: help, ping, serverinfo, userinfo, avatar, roleinfo, invites.
- Comandos informativos de GHOST CLIENT: client, status y premium.
- Logs de moderación opcionales.
- Emojis custom configurables mediante variables de entorno.

## Requisitos
- Node.js 20 o superior.
- Aplicación y bot creados en Discord Developer Portal.
- Habilitar los intents privilegiados **Server Members Intent**, **Message Content Intent** y **Presence Intent** si se requieren funciones que los usen. El bot de este ZIP no usa Presence Intent.
- Invitar al bot con scopes `bot` y `applications.commands`, y permisos adecuados.

## Ejecutar en Replit
1. Importa el ZIP en Replit.
2. Crea Secrets a partir de `.env.example` (no publiques el token).
3. En Discord Developer Portal activa `SERVER MEMBERS INTENT` y `MESSAGE CONTENT INTENT`.
4. En Shell:
   ```bash
   npm install
   npm run deploy
   npm start
   ```

## Configuración de bienvenida, despedida y tickets
Pon los IDs de los canales/categoría en Replit Secrets:
- `WELCOME_CHANNEL_ID`
- `GOODBYE_CHANNEL_ID`
- `TICKET_CATEGORY_ID`
- `TICKET_LOG_CHANNEL_ID`
- `GIVEAWAY_CHANNEL_ID`
- `SUGGESTION_CHANNEL_ID`
- `MOD_LOG_CHANNEL_ID`

Si `WELCOME_CHANNEL_ID` o `GOODBYE_CHANNEL_ID` están vacíos, se intenta usar el canal de sistema del servidor.

## Comandos disponibles
`/help`, `/ping`, `/serverinfo`, `/userinfo`, `/client`, `/status`, `/premium`, `/invite`, `/say`, `/purge`, `/kick`, `/ban`, `/timeout`, `/lock`, `/unlock`, `/ticket-panel`, `/poll`, `/suggest`, `/giveaway`, `/announce`, `/invites`, `/avatar`, `/roleinfo`.

## Límites y seguridad importantes
- `/purge` elimina entre 1 y 100 mensajes recientes. Discord no permite bulk-delete de mensajes con más de 14 días. No existe un comando legítimo para borrar "todo" el historial del servidor de una sola vez; se limita a mensajes recientes y requiere permiso Manage Messages.
- Los sorteos y votos se guardan en memoria durante la ejecución; si el bot se reinicia, esos sorteos activos se pierden. Para producción, usar una base de datos.
- El conteo de invitaciones es aproximado: Discord no informa de forma fiable todos los casos (vanity URL, invitaciones temporales/expiradas, carreras entre usos). Los datos empiezan cuando el bot está encendido.
- No se incluye entrega de compras ni comprobación real de licencias: eso requiere conectar el backend seguro de GHOST CLIENT y validar webhooks de pago.
- Usa los emojis custom solo si el bot puede verlos y tiene acceso al servidor donde están alojados. Si no, utiliza los fallbacks.
- Protege el token como contraseña. Si se filtra, regénéralo en Developer Portal.
