const state = require("./state");

function executarIntencoes(tipo) {
        if (tipo === 'compra') {
            comprar();
        } else if (tipo === 'venda') {
            vender();
        } else if (tipo === 'stop_loss') {
        verificarStopLoss();
    }
    }

function vender() {
    // venda será por lote, stop loss caso o preço de compra estiver 0,22% menor que o preço atual, em caso de lucro seguir as regras abaixo
    // primeira venda do lote apenas caso 1% de lucro vendendo 33% do total comprado do lote, segunda venda do lote apenas com 4% de lucro vendendo mais 33% do total comprado do lote, venda final do lote com 7% de lucro vendendo o restante do lote
    const lotes = state.positions
    lotes.forEach((lote) => {
        const {precoCompra, identificador } = lote;
        const index = state.positions.findIndex((pos) => pos.identificador === identificador);
        if (index === -1) return;
        // verificar se ultima venda foi feita a menos de state.COOLDOWN_LOTES segundos
        if (state.positions[index].ultimavenda) {
            const agora = Date.now();
            const diffSegundos = (agora - state.positions[index].ultimavenda) / 1000;
            if (diffSegundos < state.COOLDOWN_LOTES) {
                console.log(`Lote ${identificador} em cooldown. Última venda feita há ${diffSegundos.toFixed(2)} segundos.`);
                return;
            }
        }
        const lucroPercentual = ((state.BTC_PRICE - precoCompra) / precoCompra) * 100;
        if (state.positions[index].restante <= 0) {
            // identificar o lote e remover da lista de posições
            state.positions = state.positions.filter((pos) => pos.identificador !== identificador);
            return;
        }
        if (lucroPercentual >= 1 && state.positions[index].restante > 0 && state.positions[index].vendasrealizadas === 0) {
            // vender 33% do total comprado do lote
            const quantidadeAVender = state.positions[index].quantidadeBTC * 0.33;
            console.log(`Vendendo ${quantidadeAVender} BTC a ${state.BTC_PRICE} USDT`);
            state.saldoUSD += quantidadeAVender * state.BTC_PRICE;
            state.saldoBTC -= quantidadeAVender;
            // criar um novo lote com os novos dados identificar o lote certo e substituir os dados do lote
            state.positions[index].restante -= quantidadeAVender;
            state.positions[index].vendasrealizadas += 1;
            state.positions[index].ultimavenda = Date.now();
            state.movimentacoes_de_lote.push({
                tipo: 'venda',
                quantidadeBTC: quantidadeAVender,
                precoVenda: state.BTC_PRICE,
                timestamp: Date.now(),
            });
            return;
        }
        // verificar se o lote ja foi vendido alguma vez
        if (lucroPercentual >= 4 && state.positions[index].restante > 0 && state.positions[index].vendasrealizadas === 1) {
            // vender mais 33% do total comprado do lote
            const quantidadeAVender = state.positions[index].quantidadeBTC * 0.33;
            console.log(`Vendendo ${quantidadeAVender} BTC a ${state.BTC_PRICE} USDT`);
            state.saldoUSD += quantidadeAVender * state.BTC_PRICE;
            state.saldoBTC -= quantidadeAVender;
            // criar um novo lote com os novos dados identificar o lote certo e substituir os dados do lote
            state.positions[index].restante -= quantidadeAVender;
            state.positions[index].vendasrealizadas += 1;
            state.positions[index].ultimavenda = Date.now();
            state.movimentacoes_de_lote.push({
                tipo: 'venda',
                quantidadeBTC: quantidadeAVender,
                precoVenda: state.BTC_PRICE,
                timestamp: Date.now(),
            });
            return;
        }
        if (lucroPercentual >= 7 && state.positions[index].restante > 0 && state.positions[index].vendasrealizadas === 2) {
            // vender o restante do lote
            const quantidadeAVender = state.positions[index].restante;
            console.log(`Vendendo ${quantidadeAVender} BTC a ${state.BTC_PRICE} USDT`);
            state.saldoUSD += quantidadeAVender * state.BTC_PRICE;
            state.saldoBTC -= quantidadeAVender;
            // identificar o lote e remover da lista de posições
            state.positions = state.positions.filter((pos) => pos.identificador !== identificador);
            state.movimentacoes_de_lote.push({
                tipo: 'venda',
                quantidadeBTC: quantidadeAVender,
                precoVenda: state.BTC_PRICE,
                timestamp: Date.now(),
            });
            return;
        }
        // stop loss caso o preço de compra estiver 0,22% menor que o preço atual
        if (lucroPercentual <= -0.22 && state.positions[index].restante > 0) {
            const quantidadeAVender = state.positions[index].restante;
            console.log(`Stop Loss: Vendendo ${quantidadeAVender} BTC a ${state.BTC_PRICE} USDT`);
            state.saldoUSD += quantidadeAVender * state.BTC_PRICE;
            state.saldoBTC -= quantidadeAVender;
            // identificar o lote e remover da lista de posições
            state.positions = state.positions.filter((pos) => pos.identificador !== identificador);
            state.movimentacoes_de_lote.push({
                tipo: 'venda',
                quantidadeBTC: quantidadeAVender,
                precoVenda: state.BTC_PRICE,
                timestamp: Date.now(),
            });
            return;
        }
    });
}
// compra será sempre em 5% do saldo USD
function comprar() {
    if (state.positions.length >= state.MAX_LOTES) {
        console.log('Limite de lotes atingido');
        return;
    }
    const valorCompra = state.saldoUSD * (state.PERCENTUAL_COMPRA / 100);
    if (state.saldoUSD < valorCompra || valorCompra <= 0) {
        console.log('Saldo insuficiente para comprar');
        return;
    }
    const quantidadeBTC = valorCompra / state.BTC_PRICE;
    console.log(`Comprando ${quantidadeBTC} BTC a ${state.BTC_PRICE} USDT`);
    state.saldoUSD -= valorCompra;
    state.saldoBTC += quantidadeBTC;
    state.positions.push({
        identificador: Date.now(),
        quantidadeBTC,
        restante: quantidadeBTC,
        precoCompra: state.BTC_PRICE,
        vendasrealizadas: 0,
        ultimavenda: null,
    });
    state.movimentacoes_de_lote.push({
        tipo: 'compra',
        quantidadeBTC,
        precoCompra: state.BTC_PRICE,
        timestamp: Date.now(),
    });
}

function verificarStopLoss() {
    state.positions.forEach((lote) => {
        const lucroPercentual = ((state.BTC_PRICE - lote.precoCompra) / lote.precoCompra) * 100;
        
        if (lucroPercentual <= state.STOP_LOSS_PERCENT && lote.restante > 0) {
            const quantidadeAVender = lote.restante;
            console.log(`🛑 STOP LOSS: Vendendo ${quantidadeAVender} BTC a ${state.BTC_PRICE} USDT (Prejuízo: ${lucroPercentual.toFixed(2)}%)`);
            
            state.saldoUSD += quantidadeAVender * state.BTC_PRICE;
            state.saldoBTC -= quantidadeAVender;
            
            // Remover lote
            state.positions = state.positions.filter((pos) => pos.identificador !== lote.identificador);
            
            // Registrar movimentação
            state.movimentacoes_de_lote.push({
                tipo: 'stop_loss',
                quantidadeBTC: quantidadeAVender,
                precoVenda: state.BTC_PRICE,
                prejuizo: lucroPercentual.toFixed(2) + '%',
                timestamp: Date.now(),
            });
        }
    });
}

module.exports = { executarIntencoes };