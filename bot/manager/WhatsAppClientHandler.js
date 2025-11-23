const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcodeTerminal = require("qrcode-terminal");
const qrcodeImage = require("qrcode");
const fs = require("fs");
const path = require("path");

const { logger, logMessage } = require("../utils/core/logger");
const { processarMensagem } = require("../utils/mensagens/fluxoMensagem");
const { resetAtendimento } = require("../utils/mensagens/atendimentoHumano");
const { iniciarWatchdog, marcarPing } = require("../utils/core/watchdog");

class WhatsAppClientHandler {
    constructor() {
        this.client = null;
        this.botAtivo = false;

        // Diretórios
        this.sessionDir = path.join(process.cwd(), "bot/.wwebjs_cache");
        this.qrDir = path.join(process.cwd(), "bot/qrcodes");

        this.atendimentoTemp = {};  // controle de pausa por usuário
        this.watchdog = null;

        // Caminho do Chrome no Windows
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

            this.setupEvents();

            await this.client.initialize();
            this.botAtivo = true;

            // 🔄 Watchdog
            this.watchdog = iniciarWatchdog(
                this.client,
                async () => {
                    logger.info(`[arenaemige] Reiniciando via watchdog...`);
                    if (this.watchdog) clearInterval(this.watchdog);
                    this.botAtivo = false;
                    await this.initialize();
                },
                30_000,        // intervalo
                5 * 60_000     // timeout
            );

            logger.info(`🟢 Bot ArenaEmige iniciado com sucesso.`);

        } catch (err) {
            logger.error(`Erro ao iniciar bot: ${err.message}`);
        }
    }

    setupEvents() {
        const client = this.client;

        // 🟦 Gerar QR code
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

        // 📩 Recebe mensagens e envia para o fluxo
        client.on("message", async msg => {
            try {
                marcarPing(client);

                logMessage("RECEIVED", msg.from, msg.body, "arenaemige");

                await processarMensagem(
                    msg,
                    client,
                    this.atendimentoTemp
                );

            } catch (err) {
                logger.error(`Erro ao processar mensagem: ${err.message}`);
            }
        });

        client.on("message_create", () => {
            marcarPing(client);
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
