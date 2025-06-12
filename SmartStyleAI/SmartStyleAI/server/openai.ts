import OpenAI from "openai";
import type { WardrobeItem } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface OutfitRecommendation {
  name: string;
  items: number[]; // IDs of wardrobe items
  confidence: number;
  reasoning: string;
  occasion: string;
  weatherSuitability: string;
  styleNotes: string[];
  alternatives?: {
    name: string;
    items: number[];
    reasoning: string;
  }[];
}

interface SustainabilityAnalysis {
  score: number;
  strengths: string[];
  improvements: string[];
  recommendations: {
    action: string;
    impact: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

export async function generateOutfitRecommendation(
  wardrobeItems: WardrobeItem[],
  occasion: string,
  weather?: string
): Promise<OutfitRecommendation> {
  try {
    const wardrobeDescription = wardrobeItems.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      color: item.color,
      brand: item.brand,
      timesWorn: item.timesWorn,
      isEthical: item.isEthical,
      isSustainable: item.isSustainable,
    }));

    const prompt = `You are an expert AI fashion stylist. Based on the following wardrobe items, create an outfit recommendation for a ${occasion} occasion${weather ? ` in ${weather} weather` : ''}.

Wardrobe Items:
${JSON.stringify(wardrobeDescription, null, 2)}

Please provide a detailed outfit recommendation in JSON format with the following structure:
{
  "name": "Descriptive outfit name",
  "items": [array of item IDs that make up the outfit],
  "confidence": number between 0-100,
  "reasoning": "Detailed explanation of why this outfit works",
  "occasion": "${occasion}",
  "weatherSuitability": "How well this outfit suits the weather conditions",
  "styleNotes": ["array", "of", "styling", "tips"],
  "alternatives": [
    {
      "name": "Alternative outfit name",
      "items": [array of item IDs],
      "reasoning": "Why this is a good alternative"
    }
  ]
}

Consider:
- Color coordination and complementary pieces
- Appropriate formality level for the occasion
- Weather appropriateness if specified
- Mixing sustainable/ethical pieces when possible
- Creating versatile, body-positive styling options
- Balancing frequently worn items with underutilized pieces`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert AI fashion stylist who creates inclusive, body-positive outfit recommendations. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate that recommended items exist in wardrobe
    const validItemIds = wardrobeItems.map(item => item.id);
    result.items = result.items?.filter((id: number) => validItemIds.includes(id)) || [];
    
    if (result.alternatives) {
      result.alternatives = result.alternatives.map((alt: any) => ({
        ...alt,
        items: alt.items?.filter((id: number) => validItemIds.includes(id)) || []
      }));
    }

    return result as OutfitRecommendation;
  } catch (error) {
    console.error("Error generating outfit recommendation:", error);
    
    // Fallback recommendation
    const topItems = wardrobeItems.filter(item => item.category === 'tops').slice(0, 1);
    const bottomItems = wardrobeItems.filter(item => item.category === 'bottoms').slice(0, 1);
    
    return {
      name: `${occasion} Outfit`,
      items: [...topItems.map(i => i.id), ...bottomItems.map(i => i.id)],
      confidence: 75,
      reasoning: `A classic combination perfect for ${occasion}. This outfit balances style and comfort.`,
      occasion,
      weatherSuitability: weather ? `Suitable for ${weather} conditions` : 'Versatile for various weather',
      styleNotes: ['Mix and match with accessories', 'Layer as needed for temperature'],
    };
  }
}

export async function analyzeWardrobeForSustainability(
  wardrobeItems: WardrobeItem[]
): Promise<SustainabilityAnalysis> {
  try {
    const sustainabilityData = {
      totalItems: wardrobeItems.length,
      sustainableItems: wardrobeItems.filter(item => item.isSustainable).length,
      ethicalItems: wardrobeItems.filter(item => item.isEthical).length,
      categoryBreakdown: wardrobeItems.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      wearData: wardrobeItems.map(item => ({
        category: item.category,
        timesWorn: item.timesWorn,
        purchasePrice: item.purchasePrice,
      })),
    };

    const prompt = `Analyze this wardrobe for sustainability and provide recommendations. 

Wardrobe Data:
${JSON.stringify(sustainabilityData, null, 2)}

Provide analysis in JSON format:
{
  "score": number between 0-100,
  "strengths": ["array of sustainability strengths"],
  "improvements": ["array of areas for improvement"],
  "recommendations": [
    {
      "action": "specific actionable recommendation",
      "impact": "expected positive impact",
      "priority": "high|medium|low"
    }
  ]
}

Consider:
- Ratio of sustainable/ethical items
- Cost per wear optimization
- Wardrobe versatility and gaps
- Overconsumption patterns
- Quality over quantity principles`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a sustainable fashion expert. Provide constructive, actionable advice for improving wardrobe sustainability. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    return JSON.parse(response.choices[0].message.content || '{}') as SustainabilityAnalysis;
  } catch (error) {
    console.error("Error analyzing wardrobe sustainability:", error);
    
    const sustainableCount = wardrobeItems.filter(item => item.isSustainable || item.isEthical).length;
    const score = wardrobeItems.length > 0 ? Math.round((sustainableCount / wardrobeItems.length) * 100) : 0;
    
    return {
      score,
      strengths: sustainableCount > 0 ? ['You have some sustainable pieces in your wardrobe'] : [],
      improvements: ['Consider adding more sustainable brands', 'Focus on cost per wear optimization'],
      recommendations: [
        {
          action: 'Research sustainable fashion brands',
          impact: 'Reduce environmental impact of future purchases',
          priority: 'high'
        },
        {
          action: 'Wear existing items more frequently',
          impact: 'Improve cost per wear and reduce need for new purchases',
          priority: 'medium'
        }
      ]
    };
  }
}
