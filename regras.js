// regras.js
// Aqui ficarão as regras automáticas para compra e venda de BTC




// Quantidade máxima de lotes (positions)
const MAX_LOTES = 5;

// Função para avaliar regras e retornar intenções de trade
// Retorna: [{ type: 'BUY', ... } | { type: 'SELL', ... }] ou []
function avaliarRegras({ precoAtual, saldoUSD, saldoBTC, lastTradeTime, positions }) {
  const now = Date.now();
  const cooldownMs = 60 * 1000; // 1 minuto de cooldown
  const acoes = [];
  if (now - lastTradeTime < cooldownMs) {
    return acoes; // ainda em cooldown
  }

  // Regra de compra: só compra se não atingiu o máximo de lotes
  if (positions.length < MAX_LOTES) {
    // Compra se preço subiu 2% desde a última compra OU se não há lotes
    const ultimaCompra = positions.length > 0 ? positions[positions.length - 1] : null;
    if (
      (!ultimaCompra && saldoUSD > 1) ||
      (ultimaCompra && precoAtual > ultimaCompra.preco * 1.02 && saldoUSD > 1)
    ) {
      acoes.push({ type: 'BUY', percentage: 0.05 });
    }
  }

  // Regra de venda: avalia cada lote individualmente
  positions.forEach((lote, idx) => {
    // Vende 5% do lote se preço subiu 5% desde a compra
    if (precoAtual > lote.preco * 1.05 && lote.quantidade > 0.00001) {
      acoes.push({ type: 'SELL', percentage: 0.05, loteIndex: idx });
    }
  });

  return acoes;
}

module.exports = {
  avaliarRegras,
  MAX_LOTES
};
