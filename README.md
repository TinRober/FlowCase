# FlowCase -- Bot de Atendimento WhatsApp 

Este projeto é um bot de atendimento para WhatsApp, focado em **fluxo
estruturado (CASES)**, pausas automáticas e controle de mensagens para
evitar interferência durante o atendimento humano.

⚠ **Importante:**\
A pasta `clientes/` foi **intencionalmente ignorada** no
`.gitignore` por questões de privacidade.\
Caso você queira usar este projeto, **crie manualmente a pasta
`clientes/` e a subpasta do cliente** (ex.: `clientes/MeuCliente/`).

------------------------------------------------------------------------

## 🚀 Tecnologias Utilizadas

-   Node.js
-   WhatsApp-Web.js
-   Puppeteer
-   Winston (logs)
-   Deduplicação de mensagens
-   Controle de pausas para atendimento humano
-   Watchdog para estabilidade e auto-restart

------------------------------------------------------------------------

## 🧠 Funcionalidades Principais (Sem IA)

✔ **Fluxo tipo CASES** -- respostas definidas e organizadas por opções\
✔ **Pausa automática de 30 minutos** quando: - A equipe envia mensagem
manualmente - O cliente escolhe falar com atendente\
✔ **Bloqueio por contato**\
✔ **Deduplicação avançada**\
✔ **Watchdog**\
✔ Ignora mensagens de grupo, status e mensagens antigas

------------------------------------------------------------------------

## 📁 Estrutura Geral do Projeto

    /index.js
    /manager/
    /clientes/        <-- ignorado no Git, deve ser criado manualmente
    /logs/
    /utils/
    /instances/
    /qrcodes/

------------------------------------------------------------------------

## 🛠️ Pré-requisitos

-   Node.js 18+
-   npm ou yarn
-   Chromium/Chrome instalado

------------------------------------------------------------------------

## 📦 Instalação

1.  Clone o repositório:

``` sh
git clone https://github.com/TinRober/flow-case.git
cd  flow-case
```

2.  Instale dependências:

``` sh
npm install
```

3.  Crie as pastas necessárias:

``` sh
mkdir clientes
mkdir sessions
mkdir logs
```

4.  Opcional (Linux): defina o caminho do Chromium no `.env`:

```{=html}
<!-- -->
```
    CHROME_PATH=/usr/bin/chromium

------------------------------------------------------------------------

## ▶️ Executando o Bot

``` sh
node index.js
```

O QR Code será exibido no terminal na primeira execução.

------------------------------------------------------------------------

## 🧩 Funcionamento do Bot

### 🔹 1. Fluxo CASES

As mensagens seguem o roteamento definido no `flowRouter`.

### 🔹 2. Pausa automática (30min)

O bot pausa automaticamente ao detectar: - Envio manual pelo WhatsApp
conectado\
- Opção "Falar com atendente"

### 🔹 3. Watchdog

Reinicia o bot se o WhatsApp travar.

------------------------------------------------------------------------

## 📌 Observação Importante

Como usa WhatsApp-Web.js: - O bot **não detecta** mensagens enviadas de
outras instâncias do WhatsApp. - A pausa automática só funciona no
**mesmo WhatsApp pareado** ao bot.

------------------------------------------------------------------------

## 📝 Licença

MIT License © 2025 Roberto Alzir Galarani Chaves

------------------------------------------------------------------------

## 📬 Contato

-   GitHub: https://github.com/TinRober
-   E-mail: galarani.dev@gmail.com
