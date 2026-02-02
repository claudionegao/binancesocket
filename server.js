const { avaliarRegras } = require('./regras');
const state = require('./state');
const { executarIntencoes } = require('./executor');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();

// Endpoint para obter o saldo atual (USD, BTC, posições e último preço do BTC)
app.get('/saldo', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  res.json(require('./state'));
});

// Endpoint ping
app.get('/ping', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  console.log('Ping recebido');
  res.json({ message: 'pong' });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Função para buscar o preço do BTC/USDT na API da Binance
async function fetchBTCPrice() {
  try {
    const response = await axios.get('https://www.binance.us/api/v3/ticker/price?symbol=BTCUSDT');
    return parseFloat(response.data.price);
  } catch (error) {
    console.error('Erro ao buscar preço do BTC:', error.message);
    return null;
  }
}

// Transmite o preço do BTC apenas quando houver mudança
const MEDIA_ULTIMOS_PRECOS = require('./state');
let lastBTCPrice = null;
setInterval(async () => {
  const btcPrice = await fetchBTCPrice();
  if (btcPrice !== null && btcPrice !== lastBTCPrice) {
    lastUpdateTime = Date.now();
    console.clear();
    // Atualiza o array dos últimos 5 preços
    if (!Array.isArray(state.ultimosPrecosRapida)) state.ultimosPrecosRapida = [];
    state.ultimosPrecosRapida.push(btcPrice);
    if (state.ultimosPrecosRapida.length > state.MEDIA_RAPIDA_N) {
      state.ultimosPrecosRapida.shift(); // remove o mais antigo
    }
    if (!Array.isArray(state.ultimosPrecosLenta)) state.ultimosPrecosLenta = [];
    state.ultimosPrecosLenta.push(btcPrice);
    if (state.ultimosPrecosLenta.length > state.MEDIA_LENTA_N) {
      state.ultimosPrecosLenta.shift(); // remove o mais antigo
    }
    // Calcula a média móvel dos últimos preços
    state.MEDIA_RAPIDA = Number((state.ultimosPrecosRapida.reduce((a, b) => a + b, 0) / state.ultimosPrecosRapida.length).toFixed(2));
    state.MEDIA_LENTA = Number((state.ultimosPrecosLenta.reduce((a, b) => a + b, 0) / state.ultimosPrecosLenta.length).toFixed(2));
    state.movimentacao_rapida = Number((btcPrice - state.MEDIA_RAPIDA).toFixed(2));
    state.movimentacao_lenta = Number((btcPrice - state.MEDIA_LENTA).toFixed(2));
    
    lastBTCPrice = btcPrice;
    state.BTC_PRICE = btcPrice;

    //SOMENTE logar todos os dados por enqaunto
    console.log('Estado atual:');
    console.log(state);
    const intencoes = await avaliarRegras();
  }
}, 3000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor Socket.IO e API rodando na porta ${PORT}`);
});
