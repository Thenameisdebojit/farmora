// backend/src/services/aiAdvisoryService.js
const axios = require('axios');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIAdvisoryService {
  constructor() {
    this.cropDatabase = this.initializeCropDatabase();
    
    // Initialize AI clients
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // AI Model configuration
    this.aiConfig = {
      primaryModel: 'gpt-4',
      fallbackModel: 'gemini-pro',
      maxTokens: 2000,
      temperature: 0.7,
      timeout: 30000
    };
    
    // System prompts for different AI tasks
    this.systemPrompts = {
      generalAdvisory: `You are an expert agricultural advisor AI with deep knowledge in crop management, pest control, soil science, and sustainable farming practices. Provide practical, actionable advice based on the farmer's specific situation. Always consider:
      - Local climate and seasonal factors
      - Crop-specific requirements
      - Sustainable and organic practices where possible
      - Cost-effective solutions
      - Risk mitigation strategies
      Respond in a clear, concise manner with specific recommendations.`,
      
      pestDiseaseAnalysis: `You are a plant pathology and entomology expert AI. Analyze the provided symptoms, images, or descriptions to:
      - Identify potential pests or diseases
      - Assess severity and spread risk
      - Recommend immediate and long-term management strategies
      - Suggest prevention measures
      - Provide integrated pest management approaches
      Focus on accurate identification and practical treatment options.`,
      
      cropPlanning: `You are an agricultural planning specialist AI. Help farmers optimize their crop selection and rotation based on:
      - Soil conditions and climate
      - Market demand and profitability
      - Resource availability
      - Risk factors
      - Sustainable farming practices
      Provide detailed crop recommendations with reasoning and expected outcomes.`,
      
      weatherInsights: `You are a agricultural meteorology expert AI. Analyze weather data and provide:
      - Impact assessment on current crops
      - Actionable recommendations for weather-related risks
      - Irrigation and field management advice
      - Timing recommendations for agricultural activities
      - Climate adaptation strategies
      Focus on practical, timely advice for weather-related decisions.`,
      
      marketInsights: `You are an agricultural economics and market analysis expert AI. Provide:
      - Market trend analysis for specific crops
      - Price predictions and market opportunities
      - Value chain optimization suggestions
      - Risk management for market volatility
      - Strategic timing for selling produce
      Base recommendations on current market data and economic principles.`
    };
  }

  async generatePersonalizedAdvisory({ user, crop, growthStage, issues = [] }) {
    try {
      const advisory = {
        userProfile: this.analyzeUserProfile(user),
        cropAnalysis: this.analyzeCropStage(crop, growthStage),
        issueAnalysis: await this.analyzeReportedIssues(issues, crop),
        recommendations: await this.generateRecommendations(user, crop, growthStage, issues),
        nextSteps: this.getNextSteps(crop, growthStage),
        timeline: this.generateTimeline(crop, growthStage),
        resources: this.getRelevantResources(crop, issues),
        aiInsights: await this.generateAIInsights({ user, crop, growthStage, issues })
      };

      return advisory;
    } catch (error) {
      console.error('Advisory generation error:', error);
      throw new Error('Failed to generate personalized advisory');
    }
  }

  // Advanced AI-powered methods
  async generateAIInsights({ user, crop, growthStage, issues }) {
    try {
      const context = this.buildContext({ user, crop, growthStage, issues });
      const aiResponse = await this.callAIModel(context, 'generalAdvisory');
      
      return {
        insights: aiResponse,
        confidence: this.calculateConfidence(aiResponse),
        source: 'ai_analysis',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI insights generation error:', error);
      return {
        insights: 'Unable to generate AI insights at this time. Please check your connection and try again.',
        confidence: 0,
        source: 'fallback',
        timestamp: new Date().toISOString()
      };
    }
  }

  async chatWithAssistant(message, context = {}) {
    try {
      const conversationContext = this.buildChatContext(message, context);
      const aiResponse = await this.callAIModel(conversationContext, 'generalAdvisory');
      
      return {
        response: aiResponse,
        timestamp: new Date().toISOString(),
        confidence: this.calculateConfidence(aiResponse),
        suggestions: await this.generateFollowUpSuggestions(message, aiResponse)
      };
    } catch (error) {
      console.error('Chat assistant error:', error);
      return {
        response: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.',
        timestamp: new Date().toISOString(),
        confidence: 0,
        suggestions: ['Try rephrasing your question', 'Check basic crop information', 'Contact local agricultural extension']
      };
    }
  }

  async analyzePestDisease(symptoms, images = []) {
    try {
      const analysisContext = this.buildPestDiseaseContext(symptoms, images);
      const aiResponse = await this.callAIModel(analysisContext, 'pestDiseaseAnalysis');
      
      const analysis = this.parsePestDiseaseResponse(aiResponse);
      
      return {
        ...analysis,
        confidence: this.calculateConfidence(aiResponse),
        recommendedActions: await this.generatePestManagementPlan(analysis),
        preventiveMeasures: this.getPreventiveMeasures(symptoms),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Pest/Disease analysis error:', error);
      return this.getFallbackPestAnalysis(symptoms);
    }
  }

  async generateCropPlan({ location, soilType, climate, budget, preferences = {} }) {
    try {
      const planningContext = this.buildCropPlanningContext({ location, soilType, climate, budget, preferences });
      const aiResponse = await this.callAIModel(planningContext, 'cropPlanning');
      
      const cropPlan = this.parseCropPlanResponse(aiResponse);
      
      return {
        ...cropPlan,
        marketAnalysis: await this.getMarketInsights(cropPlan.recommendedCrops),
        riskAssessment: this.assessPlanRisks(cropPlan),
        timeline: this.generateCropPlanTimeline(cropPlan),
        confidence: this.calculateConfidence(aiResponse),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Crop planning error:', error);
      return this.getFallbackCropPlan({ location, soilType, climate });
    }
  }

  async getWeatherBasedInsights(weatherData, cropInfo) {
    try {
      const weatherContext = this.buildWeatherContext(weatherData, cropInfo);
      const aiResponse = await this.callAIModel(weatherContext, 'weatherInsights');
      
      return {
        insights: aiResponse,
        priority: this.assessWeatherPriority(weatherData),
        actions: this.extractActionItems(aiResponse),
        timing: this.getOptimalTiming(weatherData, cropInfo),
        confidence: this.calculateConfidence(aiResponse),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Weather insights error:', error);
      return this.getFallbackWeatherInsights(weatherData, cropInfo);
    }
  }

  async getMarketInsights(crops, location) {
    try {
      const marketContext = this.buildMarketContext(crops, location);
      const aiResponse = await this.callAIModel(marketContext, 'marketInsights');
      
      return {
        analysis: aiResponse,
        trends: this.extractMarketTrends(aiResponse),
        opportunities: this.identifyOpportunities(aiResponse),
        risks: this.identifyMarketRisks(aiResponse),
        recommendations: this.extractMarketRecommendations(aiResponse),
        confidence: this.calculateConfidence(aiResponse),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Market insights error:', error);
      return this.getFallbackMarketInsights(crops, location);
    }
  }

  // Core AI interaction method
  async callAIModel(context, promptType, options = {}) {
    const systemPrompt = this.systemPrompts[promptType] || this.systemPrompts.generalAdvisory;
    
    try {
      // Try primary model (OpenAI GPT-4)
      if (this.openai && process.env.OPENAI_API_KEY) {
        const response = await this.openai.chat.completions.create({
          model: options.model || this.aiConfig.primaryModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: context }
          ],
          max_tokens: options.maxTokens || this.aiConfig.maxTokens,
          temperature: options.temperature || this.aiConfig.temperature,
          timeout: this.aiConfig.timeout
        });
        
        return response.choices[0]?.message?.content || 'No response generated';
      }
    } catch (error) {
      console.warn('Primary AI model failed, trying fallback:', error.message);
    }
    
    try {
      // Fallback to Gemini
      if (this.gemini && process.env.GEMINI_API_KEY) {
        const model = this.gemini.getGenerativeModel({ model: this.aiConfig.fallbackModel });
        const prompt = `${systemPrompt}\n\n${context}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        return response.text() || 'No response generated';
      }
    } catch (error) {
      console.warn('Fallback AI model failed:', error.message);
    }
    
    // Final fallback - return contextual response
    return this.generateFallbackResponse(promptType, context);
  }

  async getCropRecommendations({ location, season, soilType }) {
    try {
      const suitableCrops = this.findSuitableCrops(location, season, soilType);
      const marketAnalysis = await this.getMarketViability(suitableCrops, location);
      
      const recommendations = suitableCrops.map(crop => ({
        ...crop,
        marketViability: marketAnalysis[crop.name] || 'moderate',
        profitability: this.calculateProfitability(crop, location),
        riskLevel: this.assessRiskLevel(crop, location, season),
        requiredInvestment: this.calculateInvestment(crop),
        expectedROI: this.calculateROI(crop, location)
      }));

      return recommendations.sort((a, b) => b.expectedROI - a.expectedROI);
    } catch (error) {
      console.error('Crop recommendations error:', error);
      throw new Error('Failed to generate crop recommendations');
    }
  }

  async getFertilizerRecommendations({ cropType, soilTestResults, farmSize, growthStage }) {
    try {
      const cropNutrientNeeds = this.getCropNutrientRequirements(cropType, growthStage);
      const soilNutrientStatus = this.analyzeSoilNutrients(soilTestResults);
      const deficiencies = this.identifyDeficiencies(cropNutrientNeeds, soilNutrientStatus);
      
      const recommendations = {
        immediate: this.getImmediateFertilizerNeeds(deficiencies, farmSize),
        seasonal: this.getSeasonalFertilizerPlan(cropType, farmSize, growthStage),
        organic: this.getOrganicAlternatives(deficiencies),
        application: this.getFertilizerApplicationTiming(cropType, growthStage),
        costAnalysis: this.calculateFertilizerCosts(deficiencies, farmSize)
      };

      return recommendations;
    } catch (error) {
      console.error('Fertilizer recommendations error:', error);
      throw new Error('Failed to generate fertilizer recommendations');
    }
  }

  // Helper methods
  analyzeUserProfile(user) {
    return {
      experience: user.experience || 'intermediate',
      farmSize: user.farmDetails?.farmSize || 0,
      location: user.location,
      soilType: user.farmDetails?.soilType,
      primaryCrops: user.farmDetails?.primaryCrops || [],
      organicPreference: user.farmDetails?.organicCertified || false
    };
  }

  analyzeCropStage(crop, growthStage) {
    if (!crop) {
      return {
        stage: growthStage,
        description: 'General crop management stage',
        duration: '7-14 days',
        keyActivities: ['Monitor crop health', 'Maintain irrigation']
      };
    }

    const stageInfo = crop.growthStages?.find(stage => stage.stage === growthStage);
    
    return {
      stage: growthStage,
      description: stageInfo?.description || 'Crop development stage',
      duration: stageInfo?.durationDays ? `${stageInfo.durationDays} days` : 'Variable',
      keyActivities: this.getStageActivities(growthStage),
      requirements: stageInfo?.requirements || {}
    };
  }

  async analyzeReportedIssues(issues, crop) {
    const analysis = [];

    for (const issue of issues) {
      const issueAnalysis = {
        issue,
        severity: this.assessIssueSeverity(issue),
        possibleCauses: this.identifyPossibleCauses(issue, crop),
        immediateActions: this.getImmediateActions(issue),
        preventiveMeasures: this.getPreventiveMeasures(issue)
      };
      analysis.push(issueAnalysis);
    }

    return analysis;
  }

  async generateRecommendations(user, crop, growthStage, issues) {
    const recommendations = {
      irrigation: this.getIrrigationRecommendations(crop, growthStage, user.location),
      fertilization: this.getFertilizationRecommendations(crop, growthStage),
      pestManagement: this.getPestManagementRecommendations(crop, issues),
      generalCare: this.getGeneralCareRecommendations(crop, growthStage),
      weatherBased: await this.getWeatherBasedRecommendations(user.location, crop)
    };

    return recommendations;
  }

  getNextSteps(crop, growthStage) {
    const stageSequence = [
      'seed_preparation', 'germination', 'seedling', 'vegetative', 
      'flowering', 'fruit_formation', 'maturation', 'harvest'
    ];

    const currentIndex = stageSequence.indexOf(growthStage);
    const nextStage = currentIndex >= 0 && currentIndex < stageSequence.length - 1 
      ? stageSequence[currentIndex + 1] 
      : 'post_harvest';

    return {
      nextStage,
      estimatedDays: this.getEstimatedDaysToNextStage(growthStage),
      preparationNeeded: this.getStagePreparation(nextStage),
      criticalTasks: this.getCriticalTasks(growthStage)
    };
  }

  generateTimeline(crop, growthStage) {
    // Mock timeline generation
    return [
      {
        date: new Date().toISOString().split('T')[0],
        task: 'Monitor current growth stage',
        priority: 'high'
      },
      {
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        task: 'Apply recommended fertilizers',
        priority: 'medium'
      },
      {
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        task: 'Check for pest and disease symptoms',
        priority: 'high'
      }
    ];
  }

  getRelevantResources(crop, issues) {
    return {
      articles: [
        'Best Practices for Crop Management',
        'Integrated Pest Management Techniques',
        'Sustainable Farming Methods'
      ],
      videos: [
        'Proper Irrigation Techniques',
        'Identifying Common Plant Diseases',
        'Organic Fertilizer Application'
      ],
      contacts: [
        'Local Agricultural Extension Office',
        'Certified Crop Advisors',
        'Agricultural Supply Stores'
      ]
    };
  }

  findSuitableCrops(location, season, soilType) {
    // Mock crop suitability data
    const crops = [
      {
        name: 'wheat',
        suitabilityScore: 85,
        reasons: ['Suitable for winter season', 'Grows well in loamy soil', 'Good market demand'],
        yield: '45-50 quintals per hectare',
        duration: '120-150 days',
        investment: 25000
      },
      {
        name: 'rice',
        suitabilityScore: 78,
        reasons: ['Suitable for monsoon season', 'High water requirement met', 'Traditional crop'],
        yield: '50-60 quintals per hectare',
        duration: '110-140 days',
        investment: 30000
      },
      {
        name: 'cotton',
        suitabilityScore: 72,
        reasons: ['Good for black soil', 'High market value', 'Long growing season'],
        yield: '15-20 quintals per hectare',
        duration: '180-200 days',
        investment: 40000
      }
    ];

    return crops.filter(crop => crop.suitabilityScore > 70);
  }

  async getMarketViability(crops, location) {
    // Mock market viability analysis
    const viability = {};
    crops.forEach(crop => {
      viability[crop.name] = Math.random() > 0.3 ? 'high' : 'moderate';
    });
    return viability;
  }

  calculateProfitability(crop, location) {
    // Mock profitability calculation
    const revenue = parseFloat(crop.yield.split('-')[0]) * 1500; // Assuming price per quintal
    const profit = revenue - crop.investment;
    return Math.round((profit / crop.investment) * 100); // Profit percentage
  }

  assessRiskLevel(crop, location, season) {
    // Mock risk assessment
    const riskFactors = ['weather', 'pest', 'market', 'disease'];
    const randomRisk = Math.random();
    
    if (randomRisk < 0.3) return 'low';
    if (randomRisk < 0.7) return 'medium';
    return 'high';
  }

  calculateInvestment(crop) {
    return {
      seeds: Math.round(crop.investment * 0.2),
      fertilizers: Math.round(crop.investment * 0.3),
      pesticides: Math.round(crop.investment * 0.15),
      labor: Math.round(crop.investment * 0.25),
      irrigation: Math.round(crop.investment * 0.1),
      total: crop.investment
    };
  }

  calculateROI(crop, location) {
    return this.calculateProfitability(crop, location);
  }

  getCropNutrientRequirements(cropType, growthStage) {
    const requirements = {
      'wheat': {
        'vegetative': { N: 40, P: 20, K: 15 },
        'flowering': { N: 30, P: 15, K: 20 },
        'maturation': { N: 10, P: 10, K: 25 }
      },
      'rice': {
        'vegetative': { N: 50, P: 25, K: 20 },
        'flowering': { N: 35, P: 20, K: 25 },
        'maturation': { N: 15, P: 10, K: 30 }
      }
    };

    return requirements[cropType.toLowerCase()]?.[growthStage] || { N: 30, P: 20, K: 20 };
  }

  analyzeSoilNutrients(soilTestResults) {
    return {
      N: soilTestResults.nitrogen || 0,
      P: soilTestResults.phosphorus || 0,
      K: soilTestResults.potassium || 0,
      pH: soilTestResults.ph || 7,
      organicCarbon: soilTestResults.organicCarbon || 0.5
    };
  }

  identifyDeficiencies(needs, available) {
    const deficiencies = {};
    
    Object.keys(needs).forEach(nutrient => {
      const deficit = needs[nutrient] - (available[nutrient] || 0);
      if (deficit > 0) {
        deficiencies[nutrient] = deficit;
      }
    });

    return deficiencies;
  }

  getImmediateFertilizerNeeds(deficiencies, farmSize) {
    const fertilizers = [];

    if (deficiencies.N > 0) {
      fertilizers.push({
        name: 'Urea',
        quantity: Math.round(deficiencies.N * 2.17 * farmSize), // kg
        application: 'Split application - 50% basal, 50% top dressing'
      });
    }

    if (deficiencies.P > 0) {
      fertilizers.push({
        name: 'Single Super Phosphate (SSP)',
        quantity: Math.round(deficiencies.P * 6.25 * farmSize), // kg
        application: 'Full basal application at sowing'
      });
    }

    if (deficiencies.K > 0) {
      fertilizers.push({
        name: 'Muriate of Potash (MOP)',
        quantity: Math.round(deficiencies.K * 1.67 * farmSize), // kg
        application: 'Split application - 50% basal, 50% at flowering'
      });
    }

    return fertilizers;
  }

  getSeasonalFertilizerPlan(cropType, farmSize, growthStage) {
    // Mock seasonal plan
    return [
      {
        stage: 'basal',
        timing: 'At sowing',
        fertilizers: ['DAP', 'MOP', 'Zinc Sulphate'],
        completed: growthStage !== 'seed_preparation'
      },
      {
        stage: 'first_top_dressing',
        timing: '20-25 days after sowing',
        fertilizers: ['Urea'],
        completed: ['vegetative', 'flowering', 'maturation'].includes(growthStage)
      },
      {
        stage: 'second_top_dressing',
        timing: 'At flowering',
        fertilizers: ['Urea', 'MOP'],
        completed: ['maturation'].includes(growthStage)
      }
    ];
  }

  getOrganicAlternatives(deficiencies) {
    const alternatives = [];

    if (deficiencies.N > 0) {
      alternatives.push({
        nutrient: 'Nitrogen',
        sources: ['Farm Yard Manure', 'Vermicompost', 'Green manure'],
        application: '5-10 tons per hectare'
      });
    }

    if (deficiencies.P > 0) {
      alternatives.push({
        nutrient: 'Phosphorus',
        sources: ['Rock phosphate', 'Bone meal', 'Compost'],
        application: '200-400 kg per hectare'
      });
    }

    if (deficiencies.K > 0) {
      alternatives.push({
        nutrient: 'Potassium',
        sources: ['Wood ash', 'Kelp meal', 'Granite dust'],
        application: '100-200 kg per hectare'
      });
    }

    return alternatives;
  }

  getFertilizerApplicationTiming(cropType, growthStage) {
    return {
      optimal: 'Early morning (6-8 AM) or evening (4-6 PM)',
      avoid: 'Hot afternoon hours (12-3 PM)',
      weather: 'Avoid application before heavy rains',
      soil: 'Ensure adequate soil moisture for better absorption',
      frequency: this.getApplicationFrequency(cropType, growthStage)
    };
  }

  calculateFertilizerCosts(deficiencies, farmSize) {
    const prices = { N: 6, P: 8, K: 7 }; // Price per kg of nutrient
    let totalCost = 0;

    Object.keys(deficiencies).forEach(nutrient => {
      if (prices[nutrient]) {
        totalCost += deficiencies[nutrient] * prices[nutrient] * farmSize;
      }
    });

    return {
      totalCost: Math.round(totalCost),
      costPerAcre: Math.round(totalCost / farmSize),
      breakdown: Object.keys(deficiencies).map(nutrient => ({
        nutrient,
        cost: Math.round(deficiencies[nutrient] * prices[nutrient] * farmSize)
      }))
    };
  }

  // Additional helper methods for recommendations
  getStageActivities(growthStage) {
    const activities = {
      'seed_preparation': ['Seed treatment', 'Soil preparation', 'Land leveling'],
      'germination': ['Monitor soil moisture', 'Check emergence', 'Light irrigation'],
      'vegetative': ['Regular irrigation', 'First fertilizer application', 'Weed control'],
      'flowering': ['Monitor bloom', 'Pest surveillance', 'Adequate water supply'],
      'fruit_formation': ['Support heavy branches', 'Continue irrigation', 'Disease monitoring'],
      'maturation': ['Reduce irrigation', 'Harvest preparation', 'Storage planning'],
      'harvest': ['Timely harvesting', 'Proper drying', 'Storage management']
    };

    return activities[growthStage] || ['General crop monitoring'];
  }

  assessIssueSeverity(issue) {
    const highSeverity = ['wilting', 'yellowing', 'pest_damage', 'disease_spots'];
    const mediumSeverity = ['slow_growth', 'leaf_curl', 'minor_discoloration'];
    
    if (highSeverity.some(severe => issue.toLowerCase().includes(severe))) {
      return 'high';
    } else if (mediumSeverity.some(medium => issue.toLowerCase().includes(medium))) {
      return 'medium';
    }
    return 'low';
  }

  identifyPossibleCauses(issue, crop) {
    // Mock cause identification
    return [
      'Nutrient deficiency',
      'Water stress',
      'Pest infestation',
      'Disease infection',
      'Environmental stress'
    ];
  }

  getImmediateActions(issue) {
    return [
      'Inspect affected plants closely',
      'Take photos for expert consultation',
      'Isolate severely affected plants if possible',
      'Check irrigation and drainage',
      'Monitor weather conditions'
    ];
  }

  getPreventiveMeasures(issue) {
    return [
      'Regular field monitoring',
      'Proper irrigation management',
      'Balanced fertilization',
      'Integrated pest management',
      'Crop rotation practices'
    ];
  }

  getIrrigationRecommendations(crop, growthStage, location) {
    return {
      frequency: this.getIrrigationFrequency(growthStage),
      amount: this.getIrrigationAmount(crop, growthStage),
      timing: 'Early morning or evening',
      method: 'Drip or furrow irrigation recommended'
    };
  }

  getFertilizationRecommendations(crop, growthStage) {
    return {
      type: 'Balanced NPK fertilizer',
      timing: this.getFertilizerTiming(growthStage),
      application: 'Split application recommended',
      organic: 'Consider organic alternatives'
    };
  }

  getPestManagementRecommendations(crop, issues) {
    return {
      monitoring: 'Weekly field inspection',
      prevention: 'Use of resistant varieties',
      treatment: 'IPM approach recommended',
      organic: 'Neem-based products for minor infestations'
    };
  }

  getGeneralCareRecommendations(crop, growthStage) {
    return [
      'Regular monitoring of crop health',
      'Maintain proper plant spacing',
      'Remove weeds regularly',
      'Ensure good drainage',
      'Keep detailed farm records'
    ];
  }

  async getWeatherBasedRecommendations(location, crop) {
    // This would integrate with weather service
    return {
      irrigation: 'Monitor soil moisture due to expected rainfall',
      spraying: 'Avoid spraying during windy conditions',
      harvesting: 'Plan harvest timing based on weather forecast'
    };
  }

  initializeCropDatabase() {
    // Mock crop database initialization
    return {
      wheat: { waterNeed: 'medium', pestRisk: 'low', marketDemand: 'high' },
      rice: { waterNeed: 'high', pestRisk: 'medium', marketDemand: 'high' },
      cotton: { waterNeed: 'medium', pestRisk: 'high', marketDemand: 'medium' }
    };
  }

  getEstimatedDaysToNextStage(currentStage) {
    const stageDurations = {
      'seed_preparation': 7,
      'germination': 10,
      'seedling': 14,
      'vegetative': 30,
      'flowering': 21,
      'fruit_formation': 25,
      'maturation': 20
    };

    return stageDurations[currentStage] || 14;
  }

  getStagePreparation(nextStage) {
    const preparations = {
      'germination': ['Ensure proper soil moisture', 'Monitor temperature'],
      'vegetative': ['Prepare for first fertilizer application', 'Plan irrigation schedule'],
      'flowering': ['Arrange for pollination support', 'Increase monitoring'],
      'harvest': ['Prepare storage facilities', 'Arrange harvesting equipment']
    };

    return preparations[nextStage] || ['Continue regular monitoring'];
  }

  getCriticalTasks(growthStage) {
    const tasks = {
      'vegetative': ['Weed control', 'First top dressing'],
      'flowering': ['Pest monitoring', 'Adequate water supply'],
      'maturation': ['Harvest timing decision', 'Storage preparation']
    };

    return tasks[growthStage] || ['Regular monitoring'];
  }

  getIrrigationFrequency(growthStage) {
    const frequencies = {
      'germination': 'Daily light irrigation',
      'vegetative': 'Every 3-4 days',
      'flowering': 'Every 2-3 days',
      'maturation': 'Weekly or as needed'
    };

    return frequencies[growthStage] || 'As per soil moisture';
  }

  getIrrigationAmount(crop, growthStage) {
    return '25-30mm per irrigation event';
  }

  getFertilizerTiming(growthStage) {
    const timings = {
      'vegetative': 'Apply nitrogen-rich fertilizer',
      'flowering': 'Apply phosphorus and potassium',
      'fruit_formation': 'Continue potassium application'
    };

    return timings[growthStage] || 'Follow soil test recommendations';
  }

  getApplicationFrequency(cropType, growthStage) {
    return 'Split into 2-3 applications during growing season';
  }

  // AI Helper Methods
  buildContext({ user, crop, growthStage, issues }) {
    return `
Farmer Profile:
- Experience: ${user.experience || 'Not specified'}
- Location: ${user.location || 'Not specified'}
- Farm Size: ${user.farmDetails?.farmSize || 'Not specified'} acres
- Soil Type: ${user.farmDetails?.soilType || 'Not specified'}
- Primary Crops: ${user.farmDetails?.primaryCrops?.join(', ') || 'Not specified'}
- Organic Preference: ${user.farmDetails?.organicCertified ? 'Yes' : 'No'}

Current Situation:
- Crop: ${crop?.name || 'Not specified'}
- Growth Stage: ${growthStage || 'Not specified'}
- Reported Issues: ${issues.length > 0 ? issues.join(', ') : 'None reported'}

Please provide comprehensive agricultural advice considering the farmer's profile and current situation. Include specific, actionable recommendations for immediate and long-term actions.`;
  }

  buildChatContext(message, context) {
    const contextInfo = context.user ? `
Farmer Context:
- Location: ${context.user.location || 'Unknown'}
- Experience: ${context.user.experience || 'Unknown'}
- Farm Size: ${context.user.farmDetails?.farmSize || 'Unknown'} acres
- Current Crops: ${context.currentCrops?.join(', ') || 'Unknown'}
` : '';

    return `${contextInfo}
Farmer's Question: ${message}

Please provide a helpful, practical response to the farmer's question. Consider their context and provide specific, actionable advice.`;
  }

  buildPestDiseaseContext(symptoms, images) {
    let context = `Reported Symptoms: ${symptoms}\n`;
    
    if (images && images.length > 0) {
      context += `Number of images provided: ${images.length}\n`;
      context += `Note: Images have been uploaded for analysis.\n`;
    }
    
    context += `\nPlease analyze these symptoms and provide:
1. Likely pest/disease identification
2. Severity assessment
3. Immediate treatment recommendations
4. Long-term management strategies
5. Prevention measures for future occurrences`;

    return context;
  }

  buildCropPlanningContext({ location, soilType, climate, budget, preferences }) {
    return `
Location: ${location}
Soil Type: ${soilType}
Climate: ${JSON.stringify(climate)}
Budget: $${budget}
Preferences: ${JSON.stringify(preferences)}

Please provide a comprehensive crop planning recommendation including:
1. Suitable crop varieties for the location and soil
2. Expected yields and profitability analysis
3. Planting timeline and schedule
4. Resource requirements (seeds, fertilizers, water, labor)
5. Risk assessment and mitigation strategies
6. Market considerations and timing
7. Sustainable farming practices integration`;
  }

  buildWeatherContext(weatherData, cropInfo) {
    return `
Current Weather Data:
${JSON.stringify(weatherData, null, 2)}

Crop Information:
${JSON.stringify(cropInfo, null, 2)}

Please analyze the weather impact on the current crops and provide:
1. Immediate weather-related risks or opportunities
2. Recommended actions for the next 7-14 days
3. Irrigation and field management adjustments
4. Timing recommendations for critical activities
5. Long-term weather adaptation strategies`;
  }

  buildMarketContext(crops, location) {
    return `
Crops for Analysis: ${Array.isArray(crops) ? crops.join(', ') : crops}
Location: ${location}

Please provide market analysis including:
1. Current market trends and price forecasts
2. Supply and demand analysis
3. Best selling strategies and timing
4. Value addition opportunities
5. Market risks and mitigation strategies
6. Alternative market channels
7. Long-term market outlook`;
  }

  calculateConfidence(response) {
    if (!response || typeof response !== 'string') return 0;
    
    // Simple confidence calculation based on response characteristics
    let confidence = 0.5; // Base confidence
    
    // Increase confidence for detailed responses
    if (response.length > 200) confidence += 0.2;
    if (response.length > 500) confidence += 0.1;
    
    // Increase confidence for structured responses
    if (response.includes('1.') || response.includes('•') || response.includes('-')) confidence += 0.1;
    
    // Increase confidence for specific recommendations
    if (response.includes('recommend') || response.includes('suggest') || response.includes('advise')) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  async generateFollowUpSuggestions(originalMessage, response) {
    const suggestions = [
      'Can you provide more specific details about my situation?',
      'What are the cost implications of these recommendations?',
      'How long will it take to see results?',
      'Are there any alternative approaches?',
      'What tools or resources do I need?'
    ];
    
    // Could be enhanced with AI-generated contextual suggestions
    return suggestions.slice(0, 3);
  }

  parsePestDiseaseResponse(response) {
    // Parse structured response (could be enhanced with more sophisticated parsing)
    return {
      identification: this.extractSection(response, 'identification') || 'Analysis provided',
      severity: this.extractSection(response, 'severity') || 'moderate',
      treatment: this.extractSection(response, 'treatment') || response,
      management: this.extractSection(response, 'management') || 'Follow integrated pest management principles'
    };
  }

  parseCropPlanResponse(response) {
    return {
      recommendedCrops: this.extractCrops(response),
      timeline: this.extractTimeline(response),
      resources: this.extractResources(response),
      fullAnalysis: response
    };
  }

  extractSection(text, section) {
    const patterns = {
      identification: /(identify|identification|likely|appears to be)([^\n]*)/i,
      severity: /(severity|severe|mild|moderate)([^\n]*)/i,
      treatment: /(treatment|treat|apply|use)([^\n]*)/i,
      management: /(management|manage|prevent|control)([^\n]*)/i
    };
    
    const match = text.match(patterns[section]);
    return match ? match[0] : null;
  }

  extractCrops(response) {
    // Extract crop recommendations from AI response
    const cropPattern = /(wheat|rice|corn|cotton|soybean|tomato|potato|onion|sugarcane|barley)/gi;
    const matches = response.match(cropPattern) || [];
    return [...new Set(matches.map(crop => crop.toLowerCase()))];
  }

  extractTimeline(response) {
    // Extract timeline information
    return 'Timeline information extracted from AI analysis';
  }

  extractResources(response) {
    return 'Resource requirements extracted from AI analysis';
  }

  extractActionItems(response) {
    const actionPattern = /(should|must|need to|recommend|suggest)([^.!?]*[.!?])/gi;
    const matches = response.match(actionPattern) || [];
    return matches.slice(0, 5).map(action => action.trim());
  }

  extractMarketTrends(response) {
    return 'Market trends extracted from AI analysis';
  }

  identifyOpportunities(response) {
    return ['Opportunity 1 from AI analysis', 'Opportunity 2 from AI analysis'];
  }

  identifyMarketRisks(response) {
    return ['Market risk 1 from AI analysis', 'Market risk 2 from AI analysis'];
  }

  extractMarketRecommendations(response) {
    return this.extractActionItems(response);
  }

  assessWeatherPriority(weatherData) {
    if (weatherData.alerts && weatherData.alerts.length > 0) return 'high';
    if (weatherData.temperature > 35 || weatherData.temperature < 5) return 'high';
    if (weatherData.humidity > 80 || weatherData.humidity < 20) return 'medium';
    return 'low';
  }

  getOptimalTiming(weatherData, cropInfo) {
    return {
      irrigation: 'Optimal timing based on weather analysis',
      spraying: 'Best time for application based on conditions',
      harvesting: 'Recommended harvest timing'
    };
  }

  async generatePestManagementPlan(analysis) {
    return [
      {
        action: 'Immediate inspection',
        priority: 'high',
        timeframe: 'Today'
      },
      {
        action: 'Apply recommended treatment',
        priority: 'high',
        timeframe: '1-2 days'
      },
      {
        action: 'Monitor progress',
        priority: 'medium',
        timeframe: '1 week'
      }
    ];
  }

  assessPlanRisks(cropPlan) {
    return {
      weather: 'Weather-related risks from plan analysis',
      market: 'Market risks from plan analysis',
      pest: 'Pest and disease risks',
      financial: 'Financial risks assessment'
    };
  }

  generateCropPlanTimeline(cropPlan) {
    return [
      {
        month: 'Current',
        activities: ['Land preparation', 'Seed procurement'],
        priority: 'high'
      },
      {
        month: 'Next Month',
        activities: ['Sowing', 'Initial irrigation'],
        priority: 'high'
      }
    ];
  }

  generateFallbackResponse(promptType, context) {
    const fallbackResponses = {
      generalAdvisory: 'Based on general agricultural principles, I recommend regular monitoring of your crops, maintaining proper irrigation schedules, and consulting with local agricultural extension services for specific guidance tailored to your region.',
      pestDiseaseAnalysis: 'For pest and disease issues, I recommend immediate field inspection, taking clear photos of affected plants, and consulting with local agricultural experts or extension services for accurate identification and treatment recommendations.',
      cropPlanning: 'For crop planning, consider your local climate conditions, soil type, and market demand. Research successful crops in your area and consult with experienced local farmers and agricultural advisors.',
      weatherInsights: 'Monitor weather forecasts regularly and adjust irrigation and field activities accordingly. Protect crops from extreme weather conditions and plan activities during favorable weather windows.',
      marketInsights: 'Stay informed about local market prices and demand trends. Consider diversifying crops and exploring multiple marketing channels to reduce market risks.'
    };
    
    return fallbackResponses[promptType] || fallbackResponses.generalAdvisory;
  }

  // Fallback methods for when AI is unavailable
  getFallbackPestAnalysis(symptoms) {
    return {
      identification: 'Unable to identify specific pest/disease. Please consult local agricultural expert.',
      severity: 'unknown',
      treatment: 'Inspect plants carefully and consider contacting agricultural extension services.',
      management: 'Implement general IPM practices and monitor field regularly.',
      confidence: 0.1,
      recommendedActions: [
        { action: 'Consult local expert', priority: 'high', timeframe: 'ASAP' },
        { action: 'Take detailed photos', priority: 'medium', timeframe: 'Today' },
        { action: 'Monitor spread', priority: 'medium', timeframe: 'Daily' }
      ],
      preventiveMeasures: this.getPreventiveMeasures(symptoms),
      timestamp: new Date().toISOString()
    };
  }

  getFallbackCropPlan({ location, soilType, climate }) {
    return {
      recommendedCrops: ['wheat', 'rice', 'vegetables'],
      timeline: 'Consult local agricultural calendar',
      resources: 'Contact local agricultural suppliers',
      fullAnalysis: 'AI analysis temporarily unavailable. Please consult local agricultural extension services for detailed crop planning guidance.',
      marketAnalysis: { analysis: 'Market data unavailable - consult local markets' },
      riskAssessment: { general: 'Consider weather, pest, and market risks for your region' },
      confidence: 0.1,
      timestamp: new Date().toISOString()
    };
  }

  getFallbackWeatherInsights(weatherData, cropInfo) {
    return {
      insights: 'Weather analysis temporarily unavailable. Monitor local weather forecasts and adjust farming activities accordingly.',
      priority: 'medium',
      actions: [
        'Check weather forecast regularly',
        'Adjust irrigation based on rainfall',
        'Protect crops from extreme weather'
      ],
      timing: {
        irrigation: 'Early morning or evening',
        spraying: 'When wind speed is low',
        harvesting: 'During dry weather'
      },
      confidence: 0.1,
      timestamp: new Date().toISOString()
    };
  }

  getFallbackMarketInsights(crops, location) {
    return {
      analysis: 'Market analysis temporarily unavailable. Please check local market prices and consult with local traders.',
      trends: 'Contact local agricultural market committees for current trends',
      opportunities: ['Explore local markets', 'Consider value addition'],
      risks: ['Price volatility', 'Storage and transportation'],
      recommendations: [
        'Monitor local market prices',
        'Diversify crop portfolio',
        'Build relationships with buyers'
      ],
      confidence: 0.1,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new AIAdvisoryService();
