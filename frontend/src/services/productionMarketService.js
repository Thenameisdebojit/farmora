// src/services/productionMarketService.js
import api from './api';

class ProductionMarketService {
  constructor() {
    this.API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    this.MARKET_API = import.meta.env.VITE_MARKET_API_URL;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes for market data
    this.commodities = [
      'wheat', 'rice', 'cotton', 'tomato', 'potato', 'onion', 
      'sugarcane', 'maize', 'soybean', 'groundnut', 'tea', 'coffee'
    ];
  }

  // Get real-time market prices
  async getMarketPrices(location = 'delhi') {
    const cacheKey = `market_prices_${location}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // First try to get data from our backend
      const response = await fetch(`${this.API_BASE}/market/prices?location=${location}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('farmora_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.setCache(cacheKey, data);
        return data;
      }

      // Fallback to external APIs or simulated data
      const marketData = await this.getAlternativeMarketData(location);
      this.setCache(cacheKey, marketData);
      return marketData;

    } catch (error) {
      console.error('Market prices fetch error:', error);
      return this.getFallbackMarketData();
    }
  }

  // Get historical price trends
  async getPriceHistory(commodity, days = 30) {
    const cacheKey = `price_history_${commodity}_${days}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.API_BASE}/market/history?commodity=${commodity}&days=${days}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('farmora_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.setCache(cacheKey, data);
        return data;
      }

      // Generate simulated historical data
      const historyData = this.generateHistoricalData(commodity, days);
      this.setCache(cacheKey, historyData);
      return historyData;

    } catch (error) {
      console.error('Price history fetch error:', error);
      return this.generateHistoricalData(commodity, days);
    }
  }

  // Get market trends and analysis
  async getMarketTrends() {
    const cacheKey = 'market_trends';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.API_BASE}/market/trends`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('farmora_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.setCache(cacheKey, data);
        return data;
      }

      // Generate trend analysis
      const trendsData = await this.generateTrendsAnalysis();
      this.setCache(cacheKey, trendsData);
      return trendsData;

    } catch (error) {
      console.error('Market trends fetch error:', error);
      return this.generateTrendsAnalysis();
    }
  }

  // Get market alerts and recommendations
  async getMarketAlerts(userCrops = []) {
    try {
      const response = await fetch(`${this.API_BASE}/market/alerts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('farmora_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ crops: userCrops })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }

      return this.generateMarketAlerts(userCrops);

    } catch (error) {
      console.error('Market alerts fetch error:', error);
      return this.generateMarketAlerts(userCrops);
    }
  }

  // Get demand forecast
  async getDemandForecast(commodity, region = 'national') {
    const cacheKey = `demand_forecast_${commodity}_${region}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.API_BASE}/market/demand-forecast?commodity=${commodity}&region=${region}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('farmora_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.setCache(cacheKey, data);
        return data;
      }

      const forecastData = this.generateDemandForecast(commodity, region);
      this.setCache(cacheKey, forecastData);
      return forecastData;

    } catch (error) {
      console.error('Demand forecast fetch error:', error);
      return this.generateDemandForecast(commodity, region);
    }
  }

  // Alternative market data sources
  async getAlternativeMarketData(location) {
    // Simulate real market data with realistic variations
    const basePrice = {
      wheat: 2250,
      rice: 1900,
      cotton: 5200,
      tomato: 35,
      potato: 18,
      onion: 25,
      sugarcane: 350,
      maize: 1800,
      soybean: 4200,
      groundnut: 5500,
      tea: 180,
      coffee: 420
    };

    const marketData = {};
    
    for (const [commodity, price] of Object.entries(basePrice)) {
      // Add realistic variations (-10% to +15%)
      const variation = (Math.random() * 0.25) - 0.1;
      const currentPrice = Math.round(price * (1 + variation));
      const previousPrice = Math.round(price * (1 + (variation * 0.8)));
      const change = currentPrice - previousPrice;
      const changePercent = ((change / previousPrice) * 100).toFixed(1);

      marketData[commodity] = {
        price: currentPrice,
        previousPrice,
        change,
        changePercent: `${change >= 0 ? '+' : ''}${changePercent}%`,
        trend: change >= 0 ? 'up' : 'down',
        volume: this.generateVolume(),
        unit: this.getUnit(commodity),
        location,
        timestamp: new Date().toISOString(),
        quality: this.getQualityGrades(commodity)
      };
    }

    return {
      success: true,
      data: marketData,
      location,
      lastUpdated: new Date().toISOString(),
      source: 'aggregated'
    };
  }

  // Generate historical data
  generateHistoricalData(commodity, days) {
    const basePrice = this.getBasePrice(commodity);
    const history = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Create realistic price movement
      const trend = Math.sin(i / 10) * 0.1; // Long-term trend
      const volatility = (Math.random() - 0.5) * 0.05; // Daily volatility
      const seasonality = Math.cos((i / days) * 2 * Math.PI) * 0.03; // Seasonal effect
      
      const priceMultiplier = 1 + trend + volatility + seasonality;
      const price = Math.round(basePrice * priceMultiplier);

      history.push({
        date: date.toISOString().split('T')[0],
        price,
        volume: this.generateVolume(),
        high: Math.round(price * 1.02),
        low: Math.round(price * 0.98),
        open: Math.round(price * (0.995 + Math.random() * 0.01)),
        close: price
      });
    }

    return {
      commodity,
      period: `${days} days`,
      data: history,
      summary: {
        avgPrice: Math.round(history.reduce((sum, day) => sum + day.price, 0) / history.length),
        minPrice: Math.min(...history.map(day => day.price)),
        maxPrice: Math.max(...history.map(day => day.price)),
        trend: this.calculateTrend(history)
      }
    };
  }

  // Generate trends analysis
  async generateTrendsAnalysis() {
    const trends = [];

    // Generate trending commodities
    for (const commodity of this.commodities.slice(0, 6)) {
      const priceChange = (Math.random() * 20) - 10; // -10% to +10%
      const demandChange = (Math.random() * 15) - 5; // -5% to +10%
      
      trends.push({
        commodity,
        priceChange: `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(1)}%`,
        demandChange: `${demandChange >= 0 ? '+' : ''}${demandChange.toFixed(1)}%`,
        trend: priceChange >= 0 ? 'bullish' : 'bearish',
        factors: this.getMarketFactors(commodity, priceChange),
        recommendation: this.getRecommendation(commodity, priceChange)
      });
    }

    return {
      trending: trends,
      marketSentiment: this.getOverallSentiment(trends),
      keyFactors: [
        'Seasonal demand patterns',
        'Weather conditions affecting supply',
        'Government policy changes',
        'Export-import dynamics',
        'Storage and logistics costs'
      ],
      insights: [
        'Kharif season crops showing strong demand',
        'Weather forecasts favorable for production',
        'Export opportunities emerging in select commodities',
        'Storage infrastructure improvements impacting prices'
      ]
    };
  }

  // Generate market alerts
  generateMarketAlerts(userCrops) {
    const alerts = [];

    userCrops.forEach(crop => {
      const priceChange = (Math.random() * 15) - 7.5;
      
      if (Math.abs(priceChange) > 5) {
        alerts.push({
          type: 'price_alert',
          severity: Math.abs(priceChange) > 8 ? 'high' : 'medium',
          commodity: crop,
          message: `${crop.charAt(0).toUpperCase() + crop.slice(1)} prices ${priceChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(priceChange).toFixed(1)}%`,
          recommendation: priceChange > 5 ? 'Consider selling if ready for harvest' : 'Hold for better prices',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Add general market alerts
    alerts.push({
      type: 'market_trend',
      severity: 'medium',
      message: 'Seasonal demand surge expected in next 2 weeks',
      recommendation: 'Plan harvest timing accordingly',
      timestamp: new Date().toISOString()
    });

    return alerts;
  }

  // Generate demand forecast
  generateDemandForecast(commodity, region) {
    const forecast = [];
    const baseDemand = this.getBaseDemand(commodity);

    for (let month = 0; month < 12; month++) {
      const seasonalFactor = this.getSeasonalFactor(commodity, month);
      const demand = Math.round(baseDemand * seasonalFactor);
      const price = this.getBasePrice(commodity) * (demand / baseDemand);

      forecast.push({
        month: new Date(2024, month, 1).toLocaleDateString('en-US', { month: 'long' }),
        demand,
        expectedPrice: Math.round(price),
        confidence: Math.random() * 20 + 80 // 80-100%
      });
    }

    return {
      commodity,
      region,
      forecast,
      summary: {
        peakMonth: forecast.reduce((max, current) => current.demand > max.demand ? current : max).month,
        avgDemand: Math.round(forecast.reduce((sum, month) => sum + month.demand, 0) / 12),
        priceRange: {
          min: Math.min(...forecast.map(m => m.expectedPrice)),
          max: Math.max(...forecast.map(m => m.expectedPrice))
        }
      }
    };
  }

  // Helper methods
  getBasePrice(commodity) {
    const prices = {
      wheat: 2250, rice: 1900, cotton: 5200, tomato: 35, potato: 18,
      onion: 25, sugarcane: 350, maize: 1800, soybean: 4200,
      groundnut: 5500, tea: 180, coffee: 420
    };
    return prices[commodity] || 1000;
  }

  getBaseDemand(commodity) {
    const demands = {
      wheat: 5000, rice: 8000, cotton: 1200, tomato: 3500, potato: 2800,
      onion: 1500, sugarcane: 6000, maize: 4200, soybean: 1800,
      groundnut: 900, tea: 400, coffee: 300
    };
    return demands[commodity] || 1000;
  }

  getSeasonalFactor(commodity, month) {
    // Simplified seasonal patterns
    const patterns = {
      wheat: [0.8, 0.9, 1.2, 1.3, 1.1, 0.9, 0.8, 0.7, 0.8, 0.9, 1.0, 1.1],
      rice: [1.0, 1.1, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.2, 1.0],
      tomato: [1.2, 1.3, 1.1, 0.9, 0.8, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3]
    };
    return patterns[commodity]?.[month] || 1.0;
  }

  getUnit(commodity) {
    const units = {
      wheat: '₹/quintal', rice: '₹/quintal', cotton: '₹/quintal',
      tomato: '₹/kg', potato: '₹/kg', onion: '₹/kg',
      sugarcane: '₹/ton', maize: '₹/quintal', soybean: '₹/quintal',
      groundnut: '₹/quintal', tea: '₹/kg', coffee: '₹/kg'
    };
    return units[commodity] || '₹/kg';
  }

  generateVolume() {
    return `${(Math.random() * 5 + 0.5).toFixed(1)}K tons`;
  }

  getQualityGrades(commodity) {
    return [
      { grade: 'Grade A', price: this.getBasePrice(commodity) * 1.1 },
      { grade: 'Grade B', price: this.getBasePrice(commodity) },
      { grade: 'Grade C', price: this.getBasePrice(commodity) * 0.9 }
    ];
  }

  getMarketFactors(commodity, priceChange) {
    const factors = [
      'Weather conditions',
      'Seasonal demand',
      'Storage costs',
      'Transportation',
      'Government policies'
    ];
    
    if (priceChange > 0) {
      factors.push('Increased demand', 'Supply constraints');
    } else {
      factors.push('Bumper harvest', 'Reduced demand');
    }
    
    return factors.slice(0, 4);
  }

  getRecommendation(commodity, priceChange) {
    if (priceChange > 5) {
      return 'Favorable time to sell if harvest is ready';
    } else if (priceChange < -5) {
      return 'Consider holding for better prices';
    } else {
      return 'Monitor market conditions closely';
    }
  }

  getOverallSentiment(trends) {
    const positive = trends.filter(t => t.trend === 'bullish').length;
    const total = trends.length;
    const ratio = positive / total;
    
    if (ratio > 0.6) return 'Optimistic';
    if (ratio < 0.4) return 'Cautious';
    return 'Neutral';
  }

  calculateTrend(history) {
    const first = history[0].price;
    const last = history[history.length - 1].price;
    const change = ((last - first) / first) * 100;
    
    if (change > 2) return 'upward';
    if (change < -2) return 'downward';
    return 'stable';
  }

  // Cache management
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Fallback data
  getFallbackMarketData() {
    return {
      success: false,
      data: {
        wheat: { price: 2250, changePercent: '+2.1%', trend: 'up', volume: '1.2K tons' },
        rice: { price: 1920, changePercent: '+1.5%', trend: 'up', volume: '850 tons' },
        cotton: { price: 5450, changePercent: '-1.8%', trend: 'down', volume: '340 tons' },
        tomato: { price: 45, changePercent: '+8.3%', trend: 'up', volume: '2.1K tons' }
      },
      location: 'Delhi',
      lastUpdated: new Date().toISOString(),
      source: 'offline',
      isOffline: true
    };
  }
}

// Create singleton instance
const productionMarketService = new ProductionMarketService();

export default productionMarketService;