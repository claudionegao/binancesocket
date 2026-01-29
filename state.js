// state.js
// Estado central do bot de paper trading

const state = {
  saldoUSD: 100.0,
  saldoBTC: 0.0,
  positions: [], // [{ quantidade, preco, timestamp }]
  lastTradeTime: 0, // timestamp da última operação
  ultimosPrecos: [], // armazena os últimos 5 preços do BTC
};

module.exports = state;
