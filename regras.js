const { executarIntencoes } = require('./executor');
const state = require('./state');
const paracima = {precoaocruzar:0,cruzou:false};
const parabaixo = {precoaocruzar:0,cruzou:false};


function avaliarRegras() {  
  const intencoes = [];
  if (cruzouPraCima(2)) {
    console.log('🚀 Cruzou pra cima! Comprar BTC');
    executarIntencoes({ acao: 'comprar', preco: state.BTC_PRICE });
    // Aqui você pode disparar a função de compra
  }

  if (cruzouPraBaixo(2)) {
    console.log('🔻 Cruzou pra baixo! Vender BTC');
    // Aqui você pode avaliar lotes para venda
    const lotesParaVender = avaliarLotesParaVenda();
    executarIntencoes({ acao: 'vender', lotes: lotesParaVender, precoAtual: state.BTC_PRICE });
    // Depois enviar ordens de venda
    console.log(`Lotes para vender: ${lotesParaVender.length}`);
  }
}

// Avalia cada lote e retorna os que devem ser vendidos
function avaliarLotesParaVenda() {
  const lotesParaVender = [];

  state.positions.forEach((lote, index) => {
    if (lote.timestamp && (Date.now() - lote.timestamp) < state.COOLDOWN_LOTES * 1000)  return;

    /*
    
    A primeira ordem de venda realiza lucro com um ganho de 1% vendendo 33% do lote comprado.
    A próxima ordem de venda realiza lucro com 4% vendendo 33% do restante.
    A última ordem de venda realiza lucro com um ganho de 7% vendendo oque restar do lote.
    ex: lote de 100 btc primeira venda 33 btc com 1% de lucro, segunda venda 33 btc com 4% de lucro, terceira venda 34 btc com 7% de lucro.

    */
    const percentualGanho = ((state.BTC_PRICE - lote.precoCompra) / lote.precoCompra) * 100;
    //verificar a quantidade restante do lote para definir se pode vender
    //se o lote esta vazio excluir ele da lista de lotes
    //garantir estar removendo o lote correto
    if (lote.restante <= 0) {
      state.positions.splice(index, 1);
      return;
    }
    const porcentagemrestante = (lote.restante / lote.quantidadeComprada) * 100;
    
    if (porcentagemrestante > 66 && percentualGanho >= 1) {
      lotesParaVender.push({ index, quantidade: lote.quantidadeComprada * 0.33 });
      lote.restante -= lote.quantidadeComprada * 0.33;
    } else if (porcentagemrestante > 33 && percentualGanho >= 4) {
      lotesParaVender.push({ index, quantidade: lote.quantidadeComprada * 0.33 });
      lote.restante -= lote.quantidadeComprada * 0.33;
    } else if (porcentagemrestante <= 33 && percentualGanho >= 7) {
      lotesParaVender.push({ index, quantidade: lote.restante });
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
