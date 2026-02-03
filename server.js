const { avaliarRegras } = require('./regras');
const state = require('./state');
const { executarIntencoes } = require('./executor');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
const {connect} = require('./WsBinance');

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


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

connect(io);

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