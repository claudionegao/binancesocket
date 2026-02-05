const _state = require("./state");
const { avaliarRegras } = require("./regras");
const { executarIntencoes } = require("./executor");

function TradeLoop(state= _state, price, io) {
    state.PRICE = price;
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
    
    const acao = avaliarRegras(state);
    executarIntencoes(state,acao);
    state.positions.forEach((lote) => {
        if (lote.melhorpreco < price){
            lote.melhorpreco = price
        }
    })
    const takeprofit = ((state.PRICE - melhorpreco) / melhorpreco) * 100;
    if (takeprofit <= state.TAKE_PROFIT_PERCENT){
        const quantidadeAVender = state.positions[index].restante;
        console.log(`Take Profit: Vendendo ${quantidadeAVender} ${state.CRYPTO} a ${state.PRICE} USDT porque o preço caiu ${takeprofit.toFixed(2)}% em relação ao melhor preço de venda`);
        state.saldoUSD += quantidadeAVender * state.PRICE;
        state.saldo -= quantidadeAVender;
        // identificar o lote e remover da lista de posições
        state.positions = state.positions.filter((pos) => pos.identificador !== identificador);
        state.movimentacoes_de_lote.push({
            tipo: 'take profit',
            quantidade: quantidadeAVender,
            precoVenda: state.PRICE,
            timestamp: Date.now(),
        });
        return;
    }

    io.emit('state', state);    
}

module.exports = { TradeLoop };