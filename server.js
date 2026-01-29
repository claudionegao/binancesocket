const axios = require('axios');
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
  }
}, 3000);

// Servidor Socket.IO básico que envia ping para todos os clientes a cada 10 segundos


const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.json());

let currency = 100.0;

// Endpoint para obter o saldo atual
app.get('/saldo', (req, res) => {
  res.json({ saldo: currency });
});

// Endpoint ping
app.get('/ping', (req, res) => {
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
  socket.emit('saldo_atualizado', { saldo: currency });

  // Evento para atualizar saldo
  socket.on('atualizar_saldo', (data) => {
    const { saldo } = data;
    if (typeof saldo === 'number') {
      currency = parseFloat(saldo.toFixed(2));
      // Emite saldo atualizado para todos os clientes
      io.emit('saldo_atualizado', { saldo: currency });
      console.log('Saldo atualizado e enviado para clientes:', currency);
    } else {
      socket.emit('erro', { mensagem: 'O campo "saldo" deve ser um número.' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor Socket.IO e API rodando na porta ${PORT}`);
});
