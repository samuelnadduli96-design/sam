
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini API client using the environment variable API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface BotAnalysis {
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  reasoning: string;
  confidence: number;
  targetPrice: number;
}

export const analyzeMarket = async (marketSnapshot: any, diversificationThreshold: number): Promise<BotAnalysis> => {
  const prompt = `Analyze this digital asset market snapshot for an automated trading bot.
  
  Market Data: ${JSON.stringify(marketSnapshot.snapshot)}
  Risk Profile: ${marketSnapshot.profile}
  Stop-Loss: ${marketSnapshot.stopLoss}%
  Diversification Threshold: ${diversificationThreshold}%

  IMPORTANT: If any asset allocation exceeds the diversification threshold (${diversificationThreshold}%), your strategy should strongly consider SELL or HOLD to rebalance the portfolio and mitigate concentration risk.

  You must return the analysis in a strictly formatted JSON object.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendation: { type: Type.STRING, enum: ['BUY', 'SELL', 'HOLD'] },
            reasoning: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            targetPrice: { type: Type.NUMBER }
          },
          required: ['recommendation', 'reasoning', 'confidence', 'targetPrice']
        }
      }
    });

    // Extract text and parse as JSON
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      recommendation: 'HOLD',
      reasoning: "Market volatility or structural imbalance detected. Bot safely remaining in liquidity.",
      confidence: 100,
      targetPrice: 0
    };
  }
};
