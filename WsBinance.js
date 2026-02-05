const WebSocket = require('ws');

function connect(crypto="btcusdt",callback) {
  const ws = new WebSocket(
    `wss://data-stream.binance.vision/ws/${crypto}@ticker`
  );

  ws.on('open', () => {
    console.log('Conectado à Binance');
  });

  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    const price = Number(msg.c);
    callback(price);
  });

  ws.on('ping', () => {
    console.log('Ping recebido da Binance');
    ws.pong();
  });

  ws.on('error', (err) => {
    console.error('Erro WS:', err.message);
  });

  ws.on('close', () => {
    console.log('Conexão caiu');
  });
}

module.exports = { connect };
