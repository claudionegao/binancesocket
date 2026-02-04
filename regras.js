const state = require("./state");
const paracima = {precoaocruzar:0,cruzou:false};
const parabaixo = {precoaocruzar:0,cruzou:false};

function avaliarRegras() {
    if (cruzouPraCima()) {
    console.log('🚀 Cruzou pra cima! Comprar BTC');
    return 'compra';
    }

    if (cruzouPraBaixo()) {
        console.log('🔻 Cruzou pra baixo! Vender BTC');
        return 'venda';
    }
    if (avaliarStopLoss()){
      console.log('😭 Stoploss detectado, Vender lote')
      return 'venda';
    }
    return null;
}

function cruzouPraCima() {
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

function cruzouPraBaixo() {
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

function avaliarStopLoss() {
  if (!state.positions || state.positions.length === 0) return false;

  for (const lote of state.positions) {

    const lucroPercentual =
      ((state.BTC_PRICE - lote.precoCompra) / lote.precoCompra) * 100;

    if (lucroPercentual <= state.stoplosspercent) {

      console.log(
        `🛑 STOP LOSS | Lote ${lote.identificador} | ` +
        `P/L: ${lucroPercentual.toFixed(3)}% | ` +
        `Stop: ${state.stoplosspercent}%`
      );

      return true;
    }
  }

  return false;
}

module.exports = { avaliarRegras };