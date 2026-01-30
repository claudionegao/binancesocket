// executor.js
// Executor de ordens paper trading

const state = require('./state');
const { MAX_LOTES } = require('./regras');

function executarIntencoes(intencoes, precoAtual) {
  let operou = false;
  intencoes.forEach(intencao => {
    if (intencao.type === 'BUY' && state.positions.length < MAX_LOTES) {
      // Compra 5% do saldo USD
      const valorCompra = state.saldoUSD * intencao.percentage;
      if (valorCompra > 0.0001 && precoAtual > 0) {
        const quantidade = valorCompra / precoAtual;
        state.saldoUSD -= valorCompra;
        state.saldoBTC += quantidade;
        state.positions.push({ quantidade, preco: precoAtual, timestamp: Date.now(), lastSellTime: 0 });
        state.lastTradeTime = Date.now();
        operou = true;
        console.log(`[PAPER] Comprado ${quantidade} BTC a $${precoAtual}, Saldo atual: $${state.saldoUSD}, Saldo BTC atual: ${state.saldoBTC}`);
      }
    }
    if (intencao.type === 'SELL' && state.positions[intencao.loteIndex]) {
      const lote = state.positions[intencao.loteIndex];
      const now = Date.now();
      const quantidadeVenda = lote.quantidade * intencao.percentage;
      if (quantidadeVenda > 0.00000001 && precoAtual > 0) {
        lote.quantidade -= quantidadeVenda;
        // Remove lote se zerado
        if (lote.quantidade < 0.00000001) {
          state.positions.splice(intencao.loteIndex, 1);
        }
        // Atualiza saldoBTC para refletir a soma dos lotes restantes
        state.saldoBTC = state.positions.reduce((acc, l) => acc + l.quantidade, 0);
        const valorRecebido = quantidadeVenda * precoAtual;
        state.saldoUSD += valorRecebido;
        lote.lastSellTime = now;
        state.lastTradeTime = now;
        operou = true;
        const percentual = (intencao.percentage * 100).toFixed(2);
        console.log(`[PAPER] Vendido ${percentual}% do lote ${intencao.loteIndex} a $${precoAtual}, Saldo atual: $${state.saldoUSD}, Saldo BTC atual: ${state.saldoBTC}`);
      }
    }
  });
  return operou;
}

module.exports = { executarIntencoes };
