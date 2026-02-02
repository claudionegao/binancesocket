const state = require('./state');

function avaliarRegras() {
  
}

// Avalia cada lote e retorna os que devem ser vendidos
function avaliarLotesParaVenda() {
  const lotesParaVender = [];

  state.positions.forEach((lote, index) => {
    const diferencaUSD = state.BTC_PRICE - lote.precoCompra;
    const diferencaPercent = (diferencaUSD / lote.precoCompra) * 100;

    console.log(
      `  Lote #${index + 1}: Comprado a $${lote.precoCompra.toFixed(2)}, ` +
      `Atual $${state.BTC_PRICE.toFixed(2)}, ` +
      `Diferença: ${diferencaPercent.toFixed(2)}%`
    );

    // Vender se lucro mínimo for atingido
    if (diferencaPercent >= state.LUCRO_MINIMO_PERCENT) {
      console.log(`  ✅ Lote #${index + 1} VENDENDO (Lucro: ${diferencaPercent.toFixed(2)}%)`);
      lotesParaVender.push({ index, lote, lucro: diferencaPercent });
    }
    // Vender se stop loss for acionado
    else if (diferencaPercent <= state.STOP_LOSS_PERCENT) {
      console.log(`  ⚠️ Lote #${index + 1} VENDENDO (Stop Loss: ${diferencaPercent.toFixed(2)}%)`);
      lotesParaVender.push({ index, lote, prejuizo: diferencaPercent });
    }
    // Manter lote aberto
    else {
      console.log(`  ⏸️ Lote #${index + 1} MANTENDO ABERTO`);
    }
  });

  return lotesParaVender;
}

function cruzouPraCima() {
  if (
    state.prev_MEDIA_RAPIDA !== undefined &&
    state.prev_MEDIA_LENTA !== undefined
  ) {
    return (
      state.prev_MEDIA_RAPIDA <= state.prev_MEDIA_LENTA &&
      state.MEDIA_RAPIDA > state.MEDIA_LENTA
    );
  }
  return false;
}

function cruzouPraBaixo() {
  if (
    state.prev_MEDIA_RAPIDA !== undefined &&
    state.prev_MEDIA_LENTA !== undefined
  ) {
    return (
      state.prev_MEDIA_RAPIDA >= state.prev_MEDIA_LENTA &&
      state.MEDIA_RAPIDA < state.MEDIA_LENTA
    );
  }
  return false;
}

module.exports = {
  avaliarRegras
};
