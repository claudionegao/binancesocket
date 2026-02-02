const WebSocket = require('ws');
const { TradeLoop } = require('./TradeLoop');

function connect() {
  const ws = new WebSocket(
    'wss://data-stream.binance.vision/ws/btcusdt@ticker'
  );

  ws.on('open', () => {
    console.log('Conectado à Binance');
  });

  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    const price = Number(msg.c);
    TradeLoop(price);
  });

  ws.on('ping', () => {
    ws.pong();
  });

  ws.on('error', (err) => {
    console.error('Erro WS:', err.message);
  });

  ws.on('close', () => {
    console.log('Conexão caiu, reconectando em 5s...');
    setTimeout(connect, 5000);
  });
}

module.exports = { connect };
