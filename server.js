const { avaliarRegras } = require('./regras');
const state = require('./state');
const { executarIntencoes } = require('./executor');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
app.use(express.json());

// Endpoint para obter o saldo atual (USD, BTC e posições)
app.get('/saldo', (req, res) => {
  res.json({ saldo: state.saldoUSD, saldo_btc: state.saldoBTC, positions: state.positions });
});

// Endpoint ping
app.get('/ping', (req, res) => {
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

  // Envia saldo atual ao conectar
  socket.emit('saldo_atualizado', { saldo: state.saldoUSD, saldo_btc: state.saldoBTC, positions: state.positions });

  // Evento para atualizar saldo manualmente
  socket.on('atualizar_saldo', (data) => {
    const { saldo } = data;
    if (typeof saldo === 'number') {
      state.saldoUSD = parseFloat(saldo.toFixed(2));
      io.emit('saldo_atualizado', { saldo: state.saldoUSD, saldo_btc: state.saldoBTC, positions: state.positions });
      console.log('Saldo atualizado e enviado para clientes:', state.saldoUSD, state.saldoBTC);
    } else {
      socket.emit('erro', { mensagem: 'O campo "saldo" deve ser um número.' });
    }
  });

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
let lastBTCPrice = null;
setInterval(async () => {
  const btcPrice = await fetchBTCPrice();
  console.log('Preço atual do BTC:', btcPrice);
  if (btcPrice !== null && btcPrice !== lastBTCPrice) {
    io.emit('btc_price', { price: btcPrice, timestamp: Date.now() });
    console.log("Preço BTC enviado para clientes");
    lastBTCPrice = btcPrice;
    // Avalia regras e executa intenções
    const intencoes = avaliarRegras({
      precoAtual: btcPrice,
      saldoUSD: state.saldoUSD,
      saldoBTC: state.saldoBTC,
      lastTradeTime: state.lastTradeTime,
      positions: state.positions
    });
    if (intencoes && intencoes.length > 0) {
      executarIntencoes(intencoes, btcPrice);
      io.emit('saldo_atualizado', { saldo: state.saldoUSD, saldo_btc: state.saldoBTC, positions: state.positions });
    }
  }
}, 3000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor Socket.IO e API rodando na porta ${PORT}`);
});
