const state = require('./state');

function avaliarRegras() {
  if (cruzouPraCima()) {
    console.log('🚀 Cruzou pra cima! Comprar BTC');
    // Aqui você pode disparar a função de compra
  }

  if (cruzouPraBaixo()) {
    console.log('🔻 Cruzou pra baixo! Vender BTC');
    // Aqui você pode avaliar lotes para venda
    const lotesParaVender = avaliarLotesParaVenda();
    // Depois enviar ordens de venda
    console.log(`Lotes para vender: ${lotesParaVender.length}`);
  }
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

function cruzouPraCima(confirmTicks = 2) {
  // Verifica se a média rápida está acima da lenta nos últimos N ticks
  let continuaCima = true;

  for (let i = 0; i < confirmTicks; i++) {
    const precoRapida = state.ultimosPrecosRapida[state.ultimosPrecosRapida.length - 1 - i];
    const precoLenta = state.ultimosPrecosLenta[state.ultimosPrecosLenta.length - 1 - i];

    if (precoRapida <= precoLenta) {
      continuaCima = false;
      break;
    }
  }

  // Dispara apenas se houve cruzamento e continua em alta
  return (
    state.prev_MEDIA_RAPIDA <= state.prev_MEDIA_LENTA &&
    state.MEDIA_RAPIDA > state.MEDIA_LENTA &&
    continuaCima
  );
}

function cruzouPraBaixo(confirmTicks = 2) {
  let continuaBaixa = true;

  for (let i = 0; i < confirmTicks; i++) {
    const precoRapida = state.ultimosPrecosRapida[state.ultimosPrecosRapida.length - 1 - i];
    const precoLenta = state.ultimosPrecosLenta[state.ultimosPrecosLenta.length - 1 - i];

    if (precoRapida >= precoLenta) {
      continuaBaixa = false;
      break;
    }
  }

  return (
    state.prev_MEDIA_RAPIDA >= state.prev_MEDIA_LENTA &&
    state.MEDIA_RAPIDA < state.MEDIA_LENTA &&
    continuaBaixa
  );
}

module.exports = {
  avaliarRegras
};
