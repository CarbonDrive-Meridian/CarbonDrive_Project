// Configurações de conversão centralizadas para CarbonDrive
// Mantém consistência entre frontend e backend

const axios = require('axios');

// Cache para cotação do dólar (evita muitas requisições)
let dollarCache = {
  rate: 5.50, // Taxa padrão de fallback
  lastUpdate: 0,
  cacheDuration: 5 * 60 * 1000 // 5 minutos em milliseconds
};

module.exports = {
  // Taxa de conversão dinâmica: 1 $CDRIVE = 0.05 USD convertido para BRL
  CDRIVE_TO_USD_RATE: 0.05, // 1 $CDRIVE = 0.05 USD
  
  // Relação carbono para tokens
  CO2_TO_CDRIVE_RATE: 1.0, // 1kg CO² economizado = 1 $CDRIVE
  
  // Fator de economia de carbono por km (kg CO²/km)
  CARBON_ECONOMY_FACTOR: 0.12,
  
  // Configurações para cálculo de eco-condução
  ECO_DRIVING: {
    MIN_KM: 10,
    MAX_KM: 60,
    MIN_EFFICIENCY_IMPROVEMENT: 0.1, // 10%
    MAX_EFFICIENCY_IMPROVEMENT: 0.4  // 40%
  },
  
  // Função para obter cotação do dólar em tempo real
  async getDollarRate() {
    const now = Date.now();
    
    // Verifica se o cache ainda é válido
    if (now - dollarCache.lastUpdate < dollarCache.cacheDuration) {
      return dollarCache.rate;
    }
    
    try {
      // Usa AwesomeAPI para obter cotação em tempo real
      const response = await axios.get('https://economia.awesomeapi.com.br/json/last/USD-BRL', {
        timeout: 5000
      });
      
      if (response.data && response.data.USDBRL && response.data.USDBRL.bid) {
        dollarCache.rate = parseFloat(response.data.USDBRL.bid);
        dollarCache.lastUpdate = now;
        console.log(`Cotação do dólar atualizada: R$ ${dollarCache.rate}`);
      }
    } catch (error) {
      console.warn('Erro ao obter cotação do dólar, usando cache:', error.message);
    }
    
    return dollarCache.rate;
  },
  
  // Função para obter taxa de conversão atual (CDRIVE para BRL)
  async getCDRIVEToBRLRate() {
    const dollarRate = await this.getDollarRate();
    return this.CDRIVE_TO_USD_RATE * dollarRate;
  },
  
  // Validações
  validateAmount: (amount) => {
    return amount > 0 && amount <= 10000; // Limite máximo de segurança
  },
  
  // Função para calcular tokens baseado em CO² economizado
  calculateTokensFromCO2: (carbonSaved) => {
    return carbonSaved * module.exports.CO2_TO_CDRIVE_RATE;
  },
  
  // Função para calcular valor em reais (agora assíncrona)
  async calculateBRLFromCDRIVE(cdriveAmount) {
    const currentRate = await this.getCDRIVEToBRLRate();
    return cdriveAmount * currentRate;
  },
  
  // Função síncrona para cálculo rápido (usa cache)
  calculateBRLFromCDRIVESync: (cdriveAmount) => {
    return cdriveAmount * dollarCache.rate * module.exports.CDRIVE_TO_USD_RATE;
  }
};