function Variacao(a, b) {
    return ((a - b) / b) * 100;
}

function Percentual(valor, percentual) {
    return (valor * percentual) / 100;
}

function PercentualValor(valor, percentual) {
    return valor + Percentual(valor, percentual);
}

function Arredondar(valor, casas = 2) {
    return Math.round(valor * Math.pow(10, casas)) / Math.pow(10, casas);
}

module.exports = { Variacao, Percentual, PercentualValor, Arredondar };