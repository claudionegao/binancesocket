const state = require('./state');
const paracima = {precoaocruzar:0,cruzou:false};
const parabaixo = {precoaocruzar:0,cruzou:false};


function avaliarRegras() {  
  if (cruzouPraCima(2)) {
    console.log('🚀 Cruzou pra cima! Comprar BTC');
    // Aqui você pode disparar a função de compra
  }

  if (cruzouPraBaixo(2)) {
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
  // Verifica se temos dados suficientes
  if (state.prev_MEDIA_RAPIDA === null || state.prev_MEDIA_LENTA === null) {
    return false;
  }

  // Verificação principal: cruzamento ocorreu
  const cruzouAgora = state.prev_MEDIA_RAPIDA <= state.prev_MEDIA_LENTA && state.MEDIA_RAPIDA > state.MEDIA_LENTA;
  
  if (cruzouAgora) {
    parabaixo.cruzou = false; // Reset cruzamento pra baixo se houver cruzamento pra cima
    console.clear();
    console.log('CRUZAMENTO CONFIRMADO pra cima!');
    console.log(`  Anterior: Rápida=${state.prev_MEDIA_RAPIDA}, Lenta=${state.prev_MEDIA_LENTA}`);
    console.log(`  Atual: Rápida=${state.MEDIA_RAPIDA}, Lenta=${state.MEDIA_LENTA}`);
    paracima.cruzou = true;
    paracima.precoaocruzar = state.BTC_PRICE;
  }

  // Se já havia subido, verifica se continua
  if (state.MEDIA_RAPIDA > state.MEDIA_LENTA) {
  }
  if (paracima.cruzou){
    const percentualAlta = ((state.BTC_PRICE - paracima.precoaocruzar) / paracima.precoaocruzar) * 100;
    //console.log(`  Desde o cruzamento pra cima, variação: ${percentualAlta.toFixed(2)}% Preço atual: ${state.BTC_PRICE}`);
    
    if(percentualAlta >= 0.2) {
      console.clear();
      console.log(`✅ CONFIRMAÇÃO DE ALTA! Variação: ${percentualAlta.toFixed(2)}% (limiar: 0.2%)`);
      paracima.cruzou = false; // Reset após confirmação
      return true;
    }
    else if(percentualAlta < -0.5) {
      console.log('❌ Cancelando condição de compra - preço caiu após cruzamento');
      paracima.cruzou = false;
    }
  }
  return false;
}

function cruzouPraBaixo(confirmTicks = 2) {
  // Verifica se temos dados suficientes
  if (state.prev_MEDIA_RAPIDA === null || state.prev_MEDIA_LENTA === null) {
    return false;
  }

  // Verificação principal: cruzamento ocorreu
  const cruzouAgora = state.prev_MEDIA_RAPIDA >= state.prev_MEDIA_LENTA && state.MEDIA_RAPIDA < state.MEDIA_LENTA;
  
  if (cruzouAgora) {
    paracima.cruzou = false; // Reset cruzamento pra cima se houver cruzamento pra baixo
    console.clear();
    console.log('CRUZAMENTO CONFIRMADO pra baixo!');
    console.log(`  Anterior: Rápida=${state.prev_MEDIA_RAPIDA}, Lenta=${state.prev_MEDIA_LENTA}`);
    console.log(`  Atual: Rápida=${state.MEDIA_RAPIDA}, Lenta=${state.MEDIA_LENTA}`);
    parabaixo.cruzou = true;
    parabaixo.precoaocruzar = state.BTC_PRICE;
  }

  // Se já havia caído, verifica se continua
  if (state.MEDIA_RAPIDA < state.MEDIA_LENTA) {
  }
  if (parabaixo.cruzou){
    const percentualBaixa = ((parabaixo.precoaocruzar - state.BTC_PRICE) / parabaixo.precoaocruzar) * -100;
    //console.log(`  Desde o cruzamento pra baixo, variação: ${percentualBaixa.toFixed(2)}% Preço atual: ${state.BTC_PRICE}`);
    
    if(percentualBaixa >= 0.2) {
      console.clear();
      console.log(`✅ CONFIRMAÇÃO DE BAIXA! Variação: ${percentualBaixa.toFixed(2)}% (limiar: 0.2%)`);
      parabaixo.cruzou = false; // Reset após confirmação
      return true;
    }
    else if(percentualBaixa < -0.5) {
      console.log('❌ Cancelando condição de venda - preço subiu após cruzamento');
      parabaixo.cruzou = false;
    }
  }
  return false;
}


module.exports = {
  avaliarRegras
};
