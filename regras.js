// regras.js
// Aqui ficarão as regras automáticas para compra e venda de BTC




// Quantidade máxima de lotes (positions)
const MAX_LOTES = 5;
const MEDIA_ULTIMOS_PRECOS = 5;
const COOLDOWN_LOTES = 60; // 1 minuto de cooldown por lote

// Função para avaliar regras e retornar intenções de trade
// Retorna: [{ type: 'BUY', ... } | { type: 'SELL', ... }] ou []
function avaliarRegras({ precoAtual, saldoUSD, saldoBTC, lastTradeTime, positions, ultimosPrecos = [] }) {
    // Loga sempre que houver média dos últimos preços
    if (Array.isArray(ultimosPrecos) && ultimosPrecos.length === MEDIA_ULTIMOS_PRECOS) {
      const soma = ultimosPrecos.reduce((acc, v) => acc + v, 0);
      const media = soma / ultimosPrecos.length;
      const resultado = precoAtual - media;
      console.log(`${Number(precoAtual.toFixed(2))} - ${media.toFixed(2)} = ${Number(resultado.toFixed(2))}`);
    }
  const now = Date.now();
  const acoes = [];

  // Regra de compra: só compra se não atingiu o máximo de lotes
  if (positions.length < MAX_LOTES) {
    // Compra se preço subiu 0,4% desde a última compra OU se não há lotes
    const ultimaCompra = positions.length > 0 ? positions[positions.length - 1] : null;
    // Só permite a primeira compra se já houver média dos últimos 5 preços
    if (!ultimaCompra) {
      if (Array.isArray(ultimosPrecos) && ultimosPrecos.length === MEDIA_ULTIMOS_PRECOS && saldoUSD > 1) {
        // Calcula a média dos últimos 5 preços
        const soma = ultimosPrecos.reduce((acc, v) => acc + v, 0);
        const media = soma / ultimosPrecos.length;
        console.log(`Média dos últimos ${MEDIA_ULTIMOS_PRECOS} preços: ${media.toFixed(2)}`);
        // Só compra se o preço atual estiver acima da média
        if (precoAtual > media) {
          acoes.push({ type: 'BUY', percentage: 0.05 });
        } else {
          console.log(`Primeira compra bloqueada: preço atual (${precoAtual}) não está acima da média (${media.toFixed(2)}) dos últimos ${MEDIA_ULTIMOS_PRECOS} preços.`);
        }
      }
    } else if (ultimaCompra && precoAtual > ultimaCompra.preco * 1.003 && saldoUSD > 1) {
      acoes.push({ type: 'BUY', percentage: 0.05 });
    }
  }

  // Regra de venda: avalia cada lote individualmente
  positions.forEach((lote, idx) => {
    const now = Date.now();
    const cooldownMs = COOLDOWN_LOTES * 1000; // 1 minuto de cooldown por lote
    // Stop loss: vende 100% do lote se preço cair 0,01% abaixo do preço de compra (ignora cooldown)
    if (precoAtual < lote.preco * 0.9999 && lote.quantidade > 0.00001) {
      acoes.push({ type: 'SELL', percentage: 1, loteIndex: idx, stop: true });
      return;
    }
    if (lote.lastSellTime && now - lote.lastSellTime < cooldownMs) {
      // Cooldown do lote ainda não expirou, não gera intenção de venda
      return;
    }
    // Calcula a diferença percentual do preço atual para o preço do lote
    const variacao = ((precoAtual - lote.preco) / lote.preco) * 100;
    console.log(`Lote ${idx}: preço de compra = ${lote.preco}, preço atual = ${precoAtual}, variação = ${variacao.toFixed(4)}%`);
    // Nova regra: vende 10% se variação > 0.03%
    if (variacao > 0.03 && lote.quantidade > 0.00001) {
      acoes.push({ type: 'SELL', percentage: 0.10, loteIndex: idx, motivo: 'variacao_0.3' });
    }
  });

  return acoes;
}

module.exports = {
  avaliarRegras,
  MAX_LOTES
};
