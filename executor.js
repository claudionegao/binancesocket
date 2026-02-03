// executor.js
// Executor de ordens paper trading

const state = require('./state');

function executarIntencoes(intencoes) {
    if (!intencoes) {
        return;
    }
    const { acao, precoAtual } = intencoes;

    if (acao === 'comprar') {
        state.movimentacoes_de_lote.push({ acao: 'comprar', preco: state.BTC_PRICE, timestamp: Date.now() });
        console.log(`🛒 Executando ordem de COMPRA a $${precoAtual}`);
        //atualizar os saldos ficticios
        state.saldoUSD -= state.saldoUSD * 0.05; // exemplo de compra com 5% do saldo USD
        state.saldoBTC += (state.saldoUSD * 0.05) / precoAtual;
        //adicionar lote
        state.positions.push({restante: (state.saldoUSD * 0.05) / precoAtual, quantidadeComprada: (state.saldoUSD * 0.05) / precoAtual, precoCompra: precoAtual, timestamp: Date.now() });
    } else if (acao === 'vender') {
        const { lotes } = intencoes;
        lotes.forEach(lote => {
            const {index, quantidade} = lote;
            //adicionar usd e remover btc
            const precoVenda = precoAtual * quantidade;
            state.saldoUSD += precoVenda;
            state.saldoBTC -= quantidade;
            state.movimentacoes_de_lote.push({ acao: 'vender', preco: precoAtual, quantidade, timestamp: Date.now() });
            console.log(`💰 Executando ordem de VENDA de ${quantidade} BTC a $${precoAtual}`);
            //remover o lote vendido da lista de posições caso tenha sido vendido completamente
            if (state.positions[index].restante <= 0) {
                state.positions.splice(index, 1);
            }
        });
            
        // vender 
        
    } else {
        console.log('Ação desconhecida:', acao);
    }
}

module.exports = { executarIntencoes };
