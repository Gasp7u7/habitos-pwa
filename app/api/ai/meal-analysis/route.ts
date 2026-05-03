import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    meal_name: { type: Type.STRING },
    estimated_calories: { type: Type.INTEGER },
    estimated_protein_g: { type: Type.INTEGER },
    estimated_carbs_g: { type: Type.INTEGER },
    estimated_fat_g: { type: Type.INTEGER },
    confidence: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
    assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['meal_name', 'estimated_calories', 'estimated_protein_g', 'estimated_carbs_g', 'estimated_fat_g', 'confidence', 'assumptions'],
};

export async function POST(req: NextRequest) {
  try {
    const { text, mealType } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text represents a meal description is required' }, { status: 400 });
    }

    const prompt = `Eres un asistente nutricional para estimar comidas de forma aproximada.

Tu tarea es analizar una descripción de comida escrita por el usuario y devolver una estimación nutricional en JSON válido.

No des consejos médicos.
No inventes precisión exacta.
Si la información es insuficiente, usa confidence "low".
Si la comida es clara pero faltan cantidades exactas, usa confidence "medium".
Si hay cantidades claras, usa confidence "high".

Descripción del usuario:
${text}

Si es aplicable, ten en cuenta que el tipo de comida sugerido es: ${mealType || 'unknown'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Failed to generate text");
    }

    const data = JSON.parse(resultText);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error in meal analysis:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
