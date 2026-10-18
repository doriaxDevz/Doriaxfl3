const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const qrcode = require('qrcode-terminal')
const P = require('pino')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    printQRInTerminal: true
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom ? lastDisconnect.error.output.statusCode : 0) !== DisconnectReason.loggedOut
      if (shouldReconnect) startBot()
    } else if (connection === 'open') {
      console.log('✅ BOT MIAMIFL CONECTADO')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const from = msg.key.remoteJid
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''

    if (!text) return

    const lower = text.toLowerCase()

    if (lower === 'ping') {
      await sock.sendMessage(from, { text: '🏓 pong! Bot MiamiFL activo' })
    }
    if (lower === 'menu' || lower === '.menu') {
      await sock.sendMessage(from, { 
        text: `*MIAMIFL BOT*\n\n- ping\n- menu\n- hola\n\nBot creado por Doriax` 
      })
    }
    if (lower === 'hola') {
      await sock.sendMessage(from, { text: '¡Hola! Soy tu bot MiamiFL 🚀' })
    }
  })
}

startBot()
console.log('Iniciando bot...')
