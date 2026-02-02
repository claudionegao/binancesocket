// executor.js
// Executor de ordens paper trading

const state = require('./state');

function executarIntencoes(intencoes, precoAtual) {
    if (!intencoes) {
        return;
    }
    const { acao, preco } = intencoes;

    if (acao === 'comprar') {
        state.movimentacoes_de_lote.push({ acao: 'comprar', preco: state.BTC_PRICE, timestamp: Date.now() });
        console.log(`🛒 Executando ordem de COMPRA a $${precoAtual}`);
        //atualizar os saldos ficticios
        state.saldoUSD -= state.saldoUSD * 0.05; // exemplo de compra com 5% do saldo USD
        state.saldoBTC += (state.saldoUSD * 0.05) / precoAtual;
        //adicionar lote
        state.positions.push({ quantidadeBTC: (state.saldoUSD * 0.05) / precoAtual, precoCompra: precoAtual, timestamp: Date.now() });
    } else if (acao === 'vender') {
        const { lotes } = intencoes;
        // vender 
        
    } else {
        console.log('Ação desconhecida:', acao);
    }
}

module.exports = { executarIntencoes };
