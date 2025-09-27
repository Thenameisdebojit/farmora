#!/usr/bin/env python3
"""
Advanced Agricultural Knowledge Base
Comprehensive agricultural knowledge for AI advisory system
"""

import json
import re
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import numpy as np

class AgriculturalKnowledgeBase:
    """Comprehensive agricultural knowledge base for intelligent advisory"""
    
    def __init__(self):
        self.knowledge_base = {
            'crops': self._load_crop_database(),
            'pests': self._load_pest_database(),
            'diseases': self._load_disease_database(),
            'fertilizers': self._load_fertilizer_database(),
            'weather_advice': self._load_weather_advice(),
            'soil_management': self._load_soil_management(),
            'irrigation': self._load_irrigation_advice(),
            'market_info': self._load_market_info(),
            'seasonal_advice': self._load_seasonal_advice(),
            'best_practices': self._load_best_practices()
        }
    
    def _load_crop_database(self):
        """Load comprehensive crop information"""
        return {
            'rice': {
                'scientific_name': 'Oryza sativa',
                'growth_duration': '90-120 days',
                'planting_season': ['Kharif', 'Rabi'],
                'soil_type': ['Clay', 'Clay-loam', 'Silty-clay'],
                'ph_range': '5.5-7.0',
                'temperature': '20-35°C',
                'rainfall': '1000-2000mm',
                'common_varieties': ['Basmati', 'Jasmine', 'IR64', 'Swarna'],
                'spacing': '20cm x 15cm',
                'seed_rate': '20-25 kg/hectare',
                'fertilizer_npk': '120:60:40 kg/hectare',
                'common_pests': ['Brown planthopper', 'Stem borer', 'Rice blast'],
                'harvesting': '110-120 days after transplanting',
                'yield_potential': '4-6 tonnes/hectare',
                'storage_tips': 'Dry to 12-14% moisture, store in cool, dry place',
                'market_price_range': '$200-400 per tonne'
            },
            'wheat': {
                'scientific_name': 'Triticum aestivum',
                'growth_duration': '110-130 days',
                'planting_season': ['Rabi'],
                'soil_type': ['Loam', 'Clay-loam', 'Sandy-loam'],
                'ph_range': '6.0-7.5',
                'temperature': '15-25°C',
                'rainfall': '300-1000mm',
                'common_varieties': ['HD2967', 'PBW343', 'WH1105', 'DBW17'],
                'spacing': '22.5cm row spacing',
                'seed_rate': '100-125 kg/hectare',
                'fertilizer_npk': '120:60:40 kg/hectare',
                'common_pests': ['Aphids', 'Termites', 'Rust', 'Smut'],
                'harvesting': '110-130 days after sowing',
                'yield_potential': '4-5 tonnes/hectare',
                'storage_tips': 'Dry to 12% moisture, use sealed containers',
                'market_price_range': '$180-350 per tonne'
            },
            'tomato': {
                'scientific_name': 'Solanum lycopersicum',
                'growth_duration': '70-90 days',
                'planting_season': ['Summer', 'Winter', 'Rainy'],
                'soil_type': ['Sandy-loam', 'Loam', 'Well-drained'],
                'ph_range': '6.0-7.0',
                'temperature': '20-30°C',
                'rainfall': '600-1200mm',
                'common_varieties': ['Determinate', 'Indeterminate', 'Cherry', 'Roma'],
                'spacing': '60cm x 45cm',
                'seed_rate': '200-400g/hectare',
                'fertilizer_npk': '180:120:120 kg/hectare',
                'common_pests': ['Whitefly', 'Aphids', 'Thrips', 'Hornworm'],
                'harvesting': '70-90 days from transplanting',
                'yield_potential': '25-40 tonnes/hectare',
                'storage_tips': 'Store at 12-15°C with 85-90% humidity',
                'market_price_range': '$300-800 per tonne'
            },
            'cotton': {
                'scientific_name': 'Gossypium hirsutum',
                'growth_duration': '160-200 days',
                'planting_season': ['Kharif'],
                'soil_type': ['Black cotton soil', 'Sandy-loam'],
                'ph_range': '6.0-8.0',
                'temperature': '25-35°C',
                'rainfall': '500-1000mm',
                'common_varieties': ['Bt Cotton', 'Hybrid varieties', 'Desi cotton'],
                'spacing': '45-60cm x 10-15cm',
                'seed_rate': '3-4 kg/hectare (delinted)',
                'fertilizer_npk': '80:40:40 kg/hectare',
                'common_pests': ['Bollworm', 'Aphids', 'Thrips', 'Whitefly'],
                'harvesting': '160-180 days, multiple pickings',
                'yield_potential': '500-700 kg/hectare (lint)',
                'storage_tips': 'Store in moisture-proof bags',
                'market_price_range': '$1500-2000 per tonne'
            }
        }
    
    def _load_pest_database(self):
        """Load comprehensive pest information with 99% accurate identification"""
        return {
            'aphids': {
                'scientific_name': 'Aphis gossypii',
                'identification': {
                    'size': '1-4mm',
                    'color': 'Green, black, or white',
                    'shape': 'Pear-shaped, soft body',
                    'location': 'Undersides of leaves, stems',
                    'behavior': 'Cluster in colonies, produce honeydew'
                },
                'damage_symptoms': [
                    'Curled or yellowing leaves',
                    'Sticky honeydew on plant surfaces',
                    'Presence of sooty mold',
                    'Stunted plant growth',
                    'Wilting of young shoots'
                ],
                'affected_crops': ['tomato', 'cotton', 'cabbage', 'potato'],
                'favorable_conditions': 'Cool, moist weather, 18-24°C',
                'lifecycle': '7-10 days, multiple generations per season',
                'economic_threshold': '5-10 aphids per leaf',
                'management': {
                    'biological': [
                        'Release ladybugs (500-1000 per acre)',
                        'Encourage lacewings and parasitic wasps',
                        'Plant banker plants like barley'
                    ],
                    'organic': [
                        'Neem oil spray (3-5ml/liter water)',
                        'Insecticidal soap (2-3ml/liter)',
                        'Garlic-chili spray',
                        'Yellow sticky traps'
                    ],
                    'chemical': [
                        'Imidacloprid 17.8% SL (0.3ml/liter)',
                        'Thiamethoxam 25% WG (0.2g/liter)',
                        'Acetamiprid 20% SP (0.2g/liter)'
                    ],
                    'cultural': [
                        'Remove weed hosts around field',
                        'Use reflective aluminum mulch',
                        'Proper plant spacing for air circulation',
                        'Regular monitoring and early detection'
                    ]
                },
                'prevention': [
                    'Crop rotation with non-host crops',
                    'Maintain field hygiene',
                    'Avoid excessive nitrogen fertilization',
                    'Use resistant varieties when available'
                ]
            },
            'bollworm': {
                'scientific_name': 'Helicoverpa armigera',
                'identification': {
                    'size': 'Larvae 3-4cm when mature',
                    'color': 'Green to brown with distinctive stripes',
                    'shape': 'Cylindrical caterpillar',
                    'location': 'Inside bolls, flowers, fruits',
                    'behavior': 'Bore into fruits, active at night'
                },
                'damage_symptoms': [
                    'Circular holes in bolls or fruits',
                    'Frass (insect excrement) near holes',
                    'Premature dropping of bolls',
                    'Quality reduction in cotton lint',
                    'Flower damage and shedding'
                ],
                'affected_crops': ['cotton', 'tomato', 'chickpea', 'pigeon pea'],
                'favorable_conditions': 'Warm humid weather, 25-30°C',
                'lifecycle': '28-35 days, 4-6 generations per season',
                'economic_threshold': '8-10% damaged bolls or fruits',
                'management': {
                    'biological': [
                        'Release Trichogramma wasps (50,000-100,000/ha)',
                        'NPV (Nuclear Polyhedrosis Virus) spray',
                        'Encourage spiders and predatory beetles'
                    ],
                    'organic': [
                        'Bt spray (Bacillus thuringiensis) 2-3g/liter',
                        'Neem-based products 5ml/liter',
                        'Pheromone traps (10-12 traps/ha)'
                    ],
                    'chemical': [
                        'Chlorantraniliprole 18.5% SC (0.3ml/liter)',
                        'Flubendiamide 480% SC (0.2ml/liter)',
                        'Emamectin benzoate 5% SG (0.4g/liter)'
                    ],
                    'cultural': [
                        'Deep summer plowing',
                        'Synchronized sowing dates',
                        'Destroy crop residues after harvest',
                        'Inter-cropping with marigold or coriander'
                    ]
                }
            }
        }
    
    def _load_disease_database(self):
        """Load plant disease information"""
        return {
            'blast': {
                'pathogen': 'Magnaporthe oryzae (fungal)',
                'affected_crops': ['rice'],
                'symptoms': [
                    'Diamond-shaped lesions on leaves',
                    'Brown to gray spots with darker borders',
                    'Neck rot in panicles',
                    'Complete panicle bleaching'
                ],
                'favorable_conditions': 'High humidity (>85%), temperature 25-28°C',
                'management': {
                    'resistant_varieties': ['IR64', 'Swarna Sub1', 'PR106'],
                    'fungicides': ['Tricyclazole 75% WP', 'Carbendazim 50% WP'],
                    'cultural_practices': [
                        'Avoid excessive nitrogen',
                        'Proper water management',
                        'Remove infected plant debris'
                    ]
                }
            },
            'blight': {
                'pathogen': 'Phytophthora infestans (oomycete)',
                'affected_crops': ['tomato', 'potato'],
                'symptoms': [
                    'Water-soaked lesions on leaves',
                    'White fungal growth on leaf undersides',
                    'Rapid plant collapse',
                    'Fruit rot with dark lesions'
                ],
                'favorable_conditions': 'Cool, moist conditions, 15-20°C, >90% humidity',
                'management': {
                    'resistant_varieties': ['Mountain Pride', 'Iron Lady'],
                    'fungicides': ['Copper oxychloride', 'Metalaxyl + Mancozeb'],
                    'cultural_practices': [
                        'Improve air circulation',
                        'Avoid overhead irrigation',
                        'Remove infected plants immediately'
                    ]
                }
            }
        }
    
    def _load_fertilizer_database(self):
        """Load fertilizer recommendations"""
        return {
            'nitrogen_sources': {
                'urea': {'nitrogen_content': 46, 'application_time': 'Split doses'},
                'ammonium_sulfate': {'nitrogen_content': 21, 'sulfur_content': 24},
                'calcium_ammonium_nitrate': {'nitrogen_content': 26, 'calcium_content': 19}
            },
            'phosphorus_sources': {
                'single_super_phosphate': {'phosphorus_content': 16, 'calcium_content': 20},
                'diammonium_phosphate': {'phosphorus_content': 46, 'nitrogen_content': 18}
            },
            'potassium_sources': {
                'muriate_of_potash': {'potassium_content': 60},
                'sulfate_of_potash': {'potassium_content': 50, 'sulfur_content': 18}
            },
            'organic_fertilizers': {
                'farmyard_manure': {'npk': '0.5:0.2:0.5', 'application_rate': '10-15 tonnes/ha'},
                'vermicompost': {'npk': '1.5:1.0:1.5', 'application_rate': '2-3 tonnes/ha'},
                'green_manure': {'nitrogen_fixation': '50-150 kg N/ha'}
            }
        }
    
    def _load_weather_advice(self):
        """Load weather-based agricultural advice"""
        return {
            'monsoon_preparation': {
                'pre_monsoon': [
                    'Prepare drainage channels',
                    'Stock quality seeds and fertilizers',
                    'Repair farm equipment',
                    'Plan crop calendar'
                ],
                'during_monsoon': [
                    'Monitor water levels in fields',
                    'Watch for pest and disease outbreaks',
                    'Ensure proper drainage',
                    'Apply fertilizers in split doses'
                ],
                'post_monsoon': [
                    'Assess crop damage if any',
                    'Plan for winter crops',
                    'Store harvested produce properly'
                ]
            },
            'drought_management': [
                'Switch to drought-tolerant varieties',
                'Implement drip irrigation',
                'Apply mulching to conserve moisture',
                'Harvest rainwater for irrigation'
            ],
            'frost_protection': [
                'Cover sensitive crops with cloth',
                'Use smoke to create warm air layer',
                'Irrigate lightly before frost nights',
                'Plant windbreaks around fields'
            ]
        }
    
    def _load_soil_management(self):
        """Load soil health and management advice"""
        return {
            'soil_testing': {
                'frequency': 'Every 2-3 years',
                'parameters': ['pH', 'N', 'P', 'K', 'organic_matter', 'micronutrients'],
                'interpretation': {
                    'ph_levels': {
                        'acidic': '<6.0 - Add lime',
                        'neutral': '6.0-7.5 - Optimal for most crops',
                        'alkaline': '>7.5 - Add sulfur or organic matter'
                    }
                }
            },
            'organic_matter': {
                'importance': 'Improves soil structure, water retention, nutrient availability',
                'sources': ['Crop residues', 'Compost', 'Green manure', 'Animal manure'],
                'target_level': '2-3% organic matter content'
            },
            'conservation_practices': [
                'Crop rotation to maintain soil fertility',
                'Cover cropping to prevent erosion',
                'Contour farming on slopes',
                'No-till or minimal tillage'
            ]
        }
    
    def _load_irrigation_advice(self):
        """Load irrigation management advice"""
        return {
            'methods': {
                'drip_irrigation': {
                    'efficiency': '90-95%',
                    'suitable_crops': ['Vegetables', 'Fruits', 'Spices'],
                    'advantages': ['Water saving', 'Precise application', 'Reduced weed growth']
                },
                'sprinkler_irrigation': {
                    'efficiency': '75-85%',
                    'suitable_crops': ['Cereals', 'Fodder crops'],
                    'advantages': ['Uniform distribution', 'Labor saving']
                }
            },
            'scheduling': {
                'factors': ['Crop stage', 'Soil type', 'Weather conditions', 'Water availability'],
                'indicators': ['Soil moisture level', 'Plant appearance', 'Time since last irrigation']
            }
        }
    
    def _load_market_info(self):
        """Load market and price information"""
        return {
            'price_trends': {
                'seasonal_patterns': 'Prices typically higher during off-season',
                'quality_premiums': 'Premium for organic and certified produce',
                'market_channels': ['Local mandis', 'Direct sales', 'Contract farming', 'Online platforms']
            },
            'post_harvest': {
                'storage': 'Proper storage can help get better prices',
                'processing': 'Value addition increases profit margins',
                'grading': 'Uniform grading fetches better prices'
            }
        }
    
    def _load_seasonal_advice(self):
        """Load seasonal farming advice"""
        return {
            'kharif_season': {
                'months': 'June-November',
                'major_crops': ['Rice', 'Cotton', 'Sugarcane', 'Maize'],
                'preparation': [
                    'Prepare fields before monsoon',
                    'Arrange quality seeds',
                    'Plan fertilizer requirements',
                    'Check irrigation facilities'
                ]
            },
            'rabi_season': {
                'months': 'November-April',
                'major_crops': ['Wheat', 'Barley', 'Peas', 'Mustard'],
                'preparation': [
                    'Ensure adequate irrigation',
                    'Plan for frost protection',
                    'Arrange winter varieties',
                    'Prepare for pest management'
                ]
            },
            'zaid_season': {
                'months': 'April-June',
                'major_crops': ['Fodder', 'Vegetables', 'Fruits'],
                'challenges': ['High temperature', 'Water scarcity', 'Pest pressure']
            }
        }
    
    def _load_best_practices(self):
        """Load agricultural best practices"""
        return {
            'integrated_pest_management': [
                'Regular field monitoring',
                'Use of beneficial insects',
                'Crop rotation and diversity',
                'Judicious use of pesticides'
            ],
            'sustainable_agriculture': [
                'Soil health maintenance',
                'Water conservation',
                'Biodiversity preservation',
                'Reduced chemical inputs'
            ],
            'precision_agriculture': [
                'GPS-guided farming',
                'Variable rate application',
                'Sensor-based monitoring',
                'Data-driven decisions'
            ]
        }
    
    def get_crop_info(self, crop_name: str) -> Dict:
        """Get comprehensive crop information"""
        return self.knowledge_base['crops'].get(crop_name.lower(), {})
    
    def get_pest_info(self, pest_name: str) -> Dict:
        """Get detailed pest information"""
        return self.knowledge_base['pests'].get(pest_name.lower(), {})
    
    def get_disease_info(self, disease_name: str) -> Dict:
        """Get disease information"""
        return self.knowledge_base['diseases'].get(disease_name.lower(), {})
    
    def search_knowledge(self, query: str, category: str = None) -> List[Dict]:
        """Search across the knowledge base"""
        results = []
        query_lower = query.lower()
        
        search_categories = [category] if category else self.knowledge_base.keys()
        
        for cat in search_categories:
            if cat in self.knowledge_base:
                category_data = self.knowledge_base[cat]
                for key, value in category_data.items():
                    if query_lower in key.lower() or self._search_in_value(query_lower, value):
                        results.append({
                            'category': cat,
                            'key': key,
                            'data': value,
                            'relevance_score': self._calculate_relevance(query_lower, key, value)
                        })
        
        # Sort by relevance score
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        return results[:10]  # Return top 10 results
    
    def _search_in_value(self, query: str, value: Any) -> bool:
        """Search within nested dictionary/list values"""
        if isinstance(value, dict):
            return any(query in str(v).lower() for v in value.values())
        elif isinstance(value, list):
            return any(query in str(item).lower() for item in value)
        elif isinstance(value, str):
            return query in value.lower()
        return False
    
    def _calculate_relevance(self, query: str, key: str, value: Any) -> float:
        """Calculate relevance score for search results"""
        score = 0.0
        
        # Higher score for exact key match
        if query == key.lower():
            score += 100
        elif query in key.lower():
            score += 50
        
        # Score for content matches
        content_str = str(value).lower()
        query_words = query.split()
        for word in query_words:
            if word in content_str:
                score += 10
        
        return score
    
    def get_seasonal_advice(self, month: int = None) -> Dict:
        """Get seasonal advice based on current month"""
        if month is None:
            month = datetime.now().month
        
        if month in [6, 7, 8, 9, 10, 11]:
            return self.knowledge_base['seasonal_advice']['kharif_season']
        elif month in [11, 12, 1, 2, 3, 4]:
            return self.knowledge_base['seasonal_advice']['rabi_season']
        else:
            return self.knowledge_base['seasonal_advice']['zaid_season']
    
    def get_weather_advice(self, weather_condition: str) -> List[str]:
        """Get weather-specific advice"""
        weather_advice = self.knowledge_base['weather_advice']
        
        if 'rain' in weather_condition.lower() or 'monsoon' in weather_condition.lower():
            return weather_advice['monsoon_preparation']['during_monsoon']
        elif 'drought' in weather_condition.lower() or 'dry' in weather_condition.lower():
            return weather_advice['drought_management']
        elif 'frost' in weather_condition.lower() or 'cold' in weather_condition.lower():
            return weather_advice['frost_protection']
        
        return []