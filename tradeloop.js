const state = require("./state");
const { avaliarRegras } = require("./regras");
const { executarIntencoes } = require("./executor");

function TradeLoop(price, io) {
    state.BTC_PRICE = price;
    // adicionar o preço atual aos arrays de preços
    state.ultimosPrecosRapida.push(price);
    state.ultimosPrecosLenta.push(price);

    // manter apenas os últimos N preços
    if (state.ultimosPrecosRapida.length > state.MEDIA_RAPIDA_N) {
        state.ultimosPrecosRapida.shift();
    }
    if (state.ultimosPrecosLenta.length > state.MEDIA_LENTA_N) {
        state.ultimosPrecosLenta.shift();
    }
    
    // calcular médias móveis
    const sumRapida = state.ultimosPrecosRapida.reduce((a, b) => a + b, 0);
    const sumLenta = state.ultimosPrecosLenta.reduce((a, b) => a + b, 0);
    state.prev_MEDIA_RAPIDA = state.MEDIA_RAPIDA;
    state.prev_MEDIA_LENTA = state.MEDIA_LENTA;
    state.MEDIA_RAPIDA = sumRapida / state.ultimosPrecosRapida.length;
    state.MEDIA_LENTA = sumLenta / state.ultimosPrecosLenta.length;

    if (state.prev_MEDIA_RAPIDA !== null) {
        state.movimentacao_rapida = state.MEDIA_RAPIDA - state.prev_MEDIA_RAPIDA;
    }
    if (state.prev_MEDIA_LENTA !== null) {
        state.movimentacao_lenta = state.MEDIA_LENTA - state.prev_MEDIA_LENTA;
    }
    
    executarIntencoes('stop_loss');
    
    const acao = avaliarRegras();
    executarIntencoes(acao);

    io.emit('state', state);    
}

module.exports = { TradeLoop };