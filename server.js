const axios = require('axios');
// Função para buscar o preço do BTC/USDT na API da Binance
async function fetchBTCPrice() {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
    return parseFloat(response.data.price);
  } catch (error) {
    console.error('Erro ao buscar preço do BTC:', error.message);
    return null;
  }
}

// A cada 3 segundos, busca o preço do BTC e envia para todos os clientes conectados
setInterval(async () => {
  const btcPrice = await fetchBTCPrice();
  if (btcPrice !== null) {
    io.emit('btc_price', { price: btcPrice, timestamp: Date.now() });
    console.log('Preço BTC enviado para clientes:', btcPrice);
  }
}, 3000);
// Servidor Socket.IO básico que envia ping para todos os clientes a cada 10 segundos


const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.json());

let storedNumber = 0.0;

// Rota para obter o número armazenado
app.get('/saldo', (req, res) => {
  res.json({ saldo: storedNumber });
});

// Rota para atualizar o número armazenado
app.post('/numero', (req, res) => {
  const { saldo } = req.body;
  if (typeof saldo !== 'number') {
    return res.status(400).json({ erro: 'O campo "saldo" deve ser um número.' });
  }
  storedNumber = parseFloat(saldo.toFixed(2));
  res.json({ saldo: storedNumber });
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor Socket.IO e API rodando na porta ${PORT}`);
});
