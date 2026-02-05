const state = require('./state');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { TradeLoop } = require('./tradeloop');

const app = express();
const {connect} = require('./WsBinance');


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

connect("btcusdt",(price) => TradeLoop(price, io));

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