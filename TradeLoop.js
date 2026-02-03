const { avaliarRegras } = require('./regras');
const state = require('./state');
const { executarIntencoes } = require('./executor');

let lastBTCPrice = null;

async function TradeLoop(btcPrice, io) {
  if (btcPrice !== null && btcPrice !== lastBTCPrice) {
    lastUpdateTime = Date.now();
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
    state.prev_MEDIA_LENTA = state.MEDIA_LENTA;
    state.prev_MEDIA_RAPIDA = state.MEDIA_RAPIDA;
    state.MEDIA_RAPIDA = Number((state.ultimosPrecosRapida.reduce((a, b) => a + b, 0) / state.ultimosPrecosRapida.length).toFixed(2));
    state.MEDIA_LENTA = Number((state.ultimosPrecosLenta.reduce((a, b) => a + b, 0) / state.ultimosPrecosLenta.length).toFixed(2));
    state.movimentacao_rapida = Number((btcPrice - state.MEDIA_RAPIDA).toFixed(2));
    state.movimentacao_lenta = Number((btcPrice - state.MEDIA_LENTA).toFixed(2));
    
    lastBTCPrice = btcPrice;
    state.BTC_PRICE = btcPrice;

    const intencoes = avaliarRegras();
    
    // Executar as intenções do bot
    if (intencoes) {
      executarIntencoes(intencoes, btcPrice);
    }
    io.emit('saldo_atualizado', {
      saldo: state.saldoUSD,
      saldo_btc: state.saldoBTC,
      positions: state.positions,
    });
    io.emit('btc_price', { price: btcPrice });  
    io.emit('state', state);
  }
}

module.exports = { TradeLoop };