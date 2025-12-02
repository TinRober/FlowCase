const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcodeTerminal = require("qrcode-terminal");
const qrcodeImage = require("qrcode");
const fs = require("fs");
const path = require("path");

const { logger, logMessage } = require("../utils/core/logger");
const { processarMensagem } = require("../utils/mensagens/fluxoMensagem");
const { marcarAtendimento, resetAtendimento } = require("../utils/mensagens/atendimentoHumano");
const { iniciarWatchdog, marcarPing } = require("../utils/core/watchdog");

class WhatsAppClientHandler {
constructor() {
this.client = null;
this.botAtivo = false;

    this.sessionDir = path.join(process.cwd(), "bot/.wwebjs_cache");
    this.qrDir = path.join(process.cwd(), "bot/qrcodes");

    this.atendimentoTemp = {};
    this.watchdog = null;

    this.chromiumPath =
        process.env.CHROME_PATH ||
        "C:/Program Files/Google/Chrome/Application/chrome.exe";
}

async initialize() {
    try {
        logger.info(`🟡 Iniciando bot ArenaEmige...`);

        resetAtendimento(this.atendimentoTemp);

        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: "arenaemige",
                dataPath: this.sessionDir,
            }),
            puppeteer: {
                headless: false,
                executablePath: this.chromiumPath,
                args: [
                    "--disable-gpu",
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-software-rasterizer"
                ]
            }
        });

        this.client.clienteId = "arenaemige";

        this.setupEvents();

        await this.client.initialize();
        this.botAtivo = true;

        this.watchdog = iniciarWatchdog(
            this.client,
            async () => {
                logger.info(`[arenaemige] Reiniciando via watchdog...`);
                if (this.watchdog) clearInterval(this.watchdog);
                this.botAtivo = false;
                await this.initialize();
            },
            30_000,
            5 * 60_000
        );

        logger.info(`🟢 Bot ArenaEmige iniciado com sucesso.`);

    } catch (err) {
        logger.error(`Erro ao iniciar bot: ${err.message}`);
    }
}

setupEvents() {
    const client = this.client;

    this.enviandoMensagemBot = false;

    // Salva função original
    client._sendMessageOriginal = client.sendMessage?.bind(client);

    // Override seguro do sendMessage
    client.sendMessage = async (to, content, options) => {
        try {
            this.enviandoMensagemBot = true;
            return await client._sendMessageOriginal(to, content, options);
        } finally {
            this.enviandoMensagemBot = false;
        }
    };

    // Método para fluxo usar: sendMessageBot
    client.sendMessageBot = async (to, content, options) => {
        return await client.sendMessage(to, content, options);
    };

    // Getter dinâmico para fluxo detectar mensagens do bot
    Object.defineProperty(client, "enviandoMensagemBot", {
        get: () => this.enviandoMensagemBot
    });

    // QR CODE
    client.on("qr", async qr => {
        qrcodeTerminal.generate(qr, { small: true });
        const qrPath = path.join(this.qrDir, `arenaemige.png`);
        await qrcodeImage.toFile(qrPath, qr);
    });

    client.on("ready", () => {
        logger.info(`✅ Bot conectado ao WhatsApp.`);
        marcarPing(client);
    });

    client.on("authenticated", () => {
        logger.info(`🔐 Sessão autenticada.`);
        marcarPing(client);
    });

    // Detector de mensagens enviadas manualmente
    client.on("message_create", async (msg) => {
        try {
            marcarPing(client);

            if (msg.fromMe && !this.enviandoMensagemBot) {
                const target = msg.to || msg.from;
                logger.info(`[PAUSA] Mensagem manual sua detectada → bloqueando ${target} por 30min`);
                marcarAtendimento(this.atendimentoTemp, target, 30 * 60_000);
            }

        } catch (err) {
            logger.error(`Erro no message_create: ${err.message}`);
        }
    });

    // Processamento de mensagens recebidas
    client.on("message", async msg => {
        try {
            marcarPing(client);
            logMessage("RECEIVED", msg.from, msg.body, "arenaemige");

            await processarMensagem(msg, client, this.atendimentoTemp);

        } catch (err) {
            logger.error(`Erro ao processar mensagem: ${err.message}`);
        }
    });
}

async destroy() {
    if (this.client) {
        await this.client.destroy();
        this.botAtivo = false;
        if (this.watchdog) clearInterval(this.watchdog);
        logger.info(`Bot finalizado.`);
    }
}

getStatus() {
    return this.botAtivo ? "Ativo" : "Inativo";
}

}

module.exports = { WhatsAppClientHandler };