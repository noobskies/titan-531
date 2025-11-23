
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Initialize the client with the API key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Retry helper
async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(r => setTimeout(r, delay));
    return retry(fn, retries - 1, delay * 2);
  }
}

export const getCoachAdvice = async (
  query: string,
  systemContext: string
): Promise<{ text: string; sources?: any[] }> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const response = await retry<GenerateContentResponse>(() => ai.models.generateContent({
      model,
      contents: `
        System Instruction: You are an expert strength training coach specializing in Jim Wendler's 5/3/1 methodology. 
        You provide concise, motivating, and technically accurate advice. 
        You have access to the user's profile and recent history in the context below. Use this data to give specific advice.
        If the user asks about recent fitness news, studies, or general facts, use the search tool to find accurate info.
        
        User Context: 
        ${systemContext}
        
        User Query: ${query}
      `,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 } 
      }
    }));

    // Extract grounding chunks if available
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return {
      text: response.text || "Sorry, I couldn't generate advice right now.",
      sources: sources
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "I'm having trouble connecting to the coaching server. Please check your connection and try again." };
  }
};

export const generateWorkoutTip = async (cycle: number, week: number, lift: string): Promise<string> => {
    try {
        const response = await retry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Give me a one-sentence tip for the ${lift} exercise during Week ${week} of Cycle ${cycle} in a 5/3/1 program.`
        }));
        return response.text || "Stay consistent and trust the process.";
    } catch (e) {
        return "Focus on form and explosiveness today.";
    }
};

export const generateExerciseIllustration = async (exerciseName: string): Promise<string | null> => {
  try {
    const response = await retry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Create a simple, minimalist, white-outline schematic vector illustration of a person performing the "${exerciseName}" exercise. The background must be solid black (#000000). High contrast. No text, no shading, just clean white lines.`
          }
        ]
      }
    }));

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64EncodeString}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};

export const analyzeForm = async (
    exerciseName: string, 
    mediaBase64: string, 
    mimeType: string
): Promise<string> => {
    try {
        const response = await retry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: mediaBase64
                        }
                    },
                    {
                        text: `Analyze the form of this person performing ${exerciseName}. 
                        Identify 3 things they are doing well and 3 things they can improve. 
                        Rate the form on a scale of 1-10. 
                        Be specific to powerlifting/strength training standards.
                        Format the output as Markdown.`
                    }
                ]
            }
        }));

        return response.text || "Could not analyze form.";
    } catch (error) {
        console.error("Form Check Error:", error);
        return "Error processing the video/image. Please ensure it is under 20MB and try again.";
    }
};

export const findGymsNearby = async (lat: number, lng: number): Promise<{ text: string; places: any[] }> => {
  try {
    const response = await retry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Find top rated hardcore gyms, powerlifting gyms, or well-equipped strength training facilities near me. Provide a brief 1 sentence summary of their equipment for a powerlifter.",
      config: {
        tools: [{ googleMaps: {} }],
        // @ts-ignore
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      }
    }));

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Filter specifically for maps chunks
    const mapPlaces = chunks
      .filter((chunk: any) => chunk.web?.uri?.includes('google.com/maps') || (chunk as any).maps)
      .map((chunk: any) => chunk.maps || chunk.web);

    return {
      text: response.text || "No gyms found.",
      places: mapPlaces
    };
  } catch (error) {
    console.error("Gym Finder Error:", error);
    return { text: "Unable to locate gyms at this time.", places: [] };
  }
};

export const analyzeNutrition = async (input: string | { data: string; mimeType: string }): Promise<{ name: string; calories: number; protein: number; carbs: number; fats: number } | null> => {
    try {
        const parts: any[] = [];
        
        if (typeof input === 'string') {
            parts.push({ text: `Analyze the nutritional content of this food description: "${input}".` });
        } else {
            parts.push({
                inlineData: {
                    data: input.data,
                    mimeType: input.mimeType
                }
            });
            parts.push({ text: "Analyze the food in this image." });
        }

        parts.push({ text: "Provide the name of the meal and estimated macros (calories, protein, carbs, fats). Return ONLY raw JSON." });

        const response = await retry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "Short name of the meal" },
                        calories: { type: Type.NUMBER, description: "Estimated calories (kcal)" },
                        protein: { type: Type.NUMBER, description: "Protein in grams" },
                        carbs: { type: Type.NUMBER, description: "Carbohydrates in grams" },
                        fats: { type: Type.NUMBER, description: "Fats in grams" }
                    },
                    required: ["name", "calories", "protein", "carbs", "fats"]
                }
            }
        }));

        if (response.text) {
            return JSON.parse(response.text);
        }
        return null;
    } catch (error) {
        console.error("Nutrition Analysis Error:", error);
        return null;
    }
};
