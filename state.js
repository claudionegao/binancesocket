// state.js
// Estado central do bot de paper trading

const state = {
  saldoUSD: 100.0,
  saldoBTC: 0.0,
  positions: [], // [{ quantidade, preco, timestamp }]
  ultimosPrecosRapida: [], // armazena os últimos 5 preços do BTC
  ultimosPrecosLenta: [], // armazena os últimos 20 preços do BTC
  BTC_PRICE: null,
  MAX_LOTES: 5,
  MEDIA_LENTA_N: 20,
  MEDIA_RAPIDA_N: 5,
  COOLDOWN_LOTES: 60,
  MEDIA_RAPIDA: null,
  movimentacao_rapida: null,
  MEDIA_LENTA: null,
  movimentacao_lenta: null,
};

module.exports = state;