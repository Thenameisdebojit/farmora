// backend/src/controllers/marketController.js
const marketService = require('../services/marketService');

// Get current market prices
exports.getCurrentMarketPrices = async (req, res) => {
  try {
    const { commodity, state, district } = req.query;
    
    if (!commodity) {
      return res.status(400).json({
        success: false,
        message: 'Commodity is required'
      });
    }

    console.log('Fetching market prices for:', { commodity, state, district });
    const marketData = await marketService.getCurrentMarketPrices(commodity, state || 'Maharashtra', district || 'Pune');
    
    res.json({
      success: true,
      data: {
        commodity,
        state: state || 'Maharashtra',
        district: district || 'Pune',
        prices: marketData,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Market prices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market prices'
    });
  }
};

// Get market trends and analysis
exports.getMarketTrends = async (req, res) => {
  try {
    const { commodity, duration = '30d' } = req.query;
    
    if (!commodity) {
      return res.status(400).json({
        success: false,
        message: 'Commodity is required'
      });
    }

    console.log('Fetching market trends for:', { commodity, duration });
    const trends = await marketService.getMarketTrends(commodity, duration);
    const analysis = await marketService.getMarketAnalysis(commodity, 'Maharashtra');
    
    res.json({
      success: true,
      data: {
        commodity,
        duration,
        trends,
        analysis
      }
    });

  } catch (error) {
    console.error('Market trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market trends'
    });
  }
};

// Get price predictions
exports.getPricePredictions = async (req, res) => {
  try {
    const { commodity, state, days = 7 } = req.query;
    
    if (!commodity) {
      return res.status(400).json({
        success: false,
        message: 'Commodity is required'
      });
    }

    console.log('Generating price predictions for:', { commodity, state, days });
    const predictions = await marketService.getPricePredictions(commodity, state || 'Maharashtra', parseInt(days));
    
    // Calculate overall confidence
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    
    res.json({
      success: true,
      data: {
        commodity,
        state: state || 'Maharashtra',
        predictions,
        overallConfidence: Math.round(avgConfidence),
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Price predictions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate price predictions'
    });
  }
};

// Get selling recommendations
exports.getSellingRecommendations = async (req, res) => {
  try {
    const { userId, commodity, quantity } = req.query;
    
    if (!userId || !commodity) {
      return res.status(400).json({
        success: false,
        message: 'User ID and commodity are required'
      });
    }

    // Get current market data
    const currentPrices = await getMarketPricesFromAPI(commodity, 'all', 'all');
    const trends = await getMarketTrendsFromAPI(commodity, '30d');
    const predictions = await generatePricePredictions(commodity, 'all', 7);
    
    // Generate recommendations based on market data
    const recommendations = {
      commodity,
      quantity: quantity || 'N/A',
      currentMarket: {
        averagePrice: currentPrices[0]?.modalPrice || 0,
        bestMarkets: currentPrices.slice(0, 3)
      },
      recommendation: {
        action: 'sell_now', // or 'wait', 'sell_partial'
        reason: 'Current prices are favorable based on market trends',
        confidence: 0.85,
        expectedReturn: quantity ? (quantity * currentPrices[0]?.modalPrice) : null
      },
      timing: {
        bestTimeToSell: 'Within next 3-5 days',
        priceOutlook: 'stable_to_rising'
      },
      alternativeOptions: [
        {
          option: 'Sell 70% now, hold 30%',
          rationale: 'Hedge against price volatility'
        },
        {
          option: 'Wait for next price cycle',
          rationale: 'Seasonal patterns suggest price increase in 2 weeks'
        }
      ]
    };

    res.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    console.error('Selling recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate selling recommendations'
    });
  }
};

// Set price alert
exports.setPriceAlert = async (req, res) => {
  try {
    const { userId, commodity, targetPrice, alertType, state, district } = req.body;
    
    if (!userId || !commodity || !targetPrice || !alertType) {
      return res.status(400).json({
        success: false,
        message: 'User ID, commodity, target price, and alert type are required'
      });
    }

    // In a real implementation, this would save to database
    const priceAlert = {
      id: Date.now().toString(),
      userId,
      commodity,
      targetPrice: parseFloat(targetPrice),
      alertType, // 'above', 'below', 'both'
      location: { state, district },
      isActive: true,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Price alert set successfully',
      data: priceAlert
    });

  } catch (error) {
    console.error('Set price alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set price alert'
    });
  }
};

// Helper functions
async function getMarketPricesFromAPI(commodity, state, district) {
  return [
    {
      market: 'Main Market',
      minPrice: 1500,
      maxPrice: 1800,
      modalPrice: 1650,
      date: new Date().toISOString().split('T')[0]
    }
  ];
}

async function getMarketTrendsFromAPI(commodity, duration) {
  const days = parseInt(duration.replace('d', ''));
  const trends = [];
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    trends.push({
      date: date.toISOString().split('T')[0],
      price: 1500 + Math.random() * 300,
      volume: Math.floor(Math.random() * 1000) + 500
    });
  }
  
  return trends;
}

async function generatePricePredictions(commodity, state, days) {
  const predictions = [];
  const basePrice = 1650;
  
  for (let i = 1; i <= days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    predictions.push({
      date: date.toISOString().split('T')[0],
      predictedPrice: basePrice + (Math.random() - 0.5) * 200,
      confidence: Math.random() * 0.3 + 0.7
    });
  }
  
  return predictions;
}

function generateMarketAnalysis(trends) {
  if (!trends || trends.length === 0) return null;
  
  const latestPrice = trends[trends.length - 1].price;
  const oldestPrice = trends[0].price;
  const change = latestPrice - oldestPrice;
  const changePercent = (change / oldestPrice) * 100;
  
  return {
    priceChange: change,
    priceChangePercent: changePercent,
    trend: change > 0 ? 'upward' : change < 0 ? 'downward' : 'stable',
    recommendation: changePercent > 5 ? 'good_time_to_sell' : 
                   changePercent < -5 ? 'hold_for_better_prices' : 'monitor_closely'
  };
}

function calculatePredictionConfidence(predictions) {
  if (!predictions || predictions.length === 0) return 0;
  
  const confidenceSum = predictions.reduce((sum, pred) => sum + pred.confidence, 0);
  return confidenceSum / predictions.length;
}
