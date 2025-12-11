import { GoogleGenAI } from "@google/genai";
import { DocumentCategory } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const suggestCategory = async (title: string, description: string): Promise<DocumentCategory | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  const prompt = `
    You are a document classification assistant for a corporate SaaS.
    
    Categories:
    - Operacional
    - Saúde e Segurança
    - Qualidade
    - Regulatório
    - Contratos
    - Frota

    Task: Analyze the following document details and suggest the ONE best category from the list above.
    
    Document Title: "${title}"
    Document Description: "${description}"

    Reply ONLY with the exact category name. Do not add punctuation or explanation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text?.trim();
    
    // Validate if the response matches a known category
    const categories = Object.values(DocumentCategory);
    if (categories.includes(text as DocumentCategory)) {
        return text as DocumentCategory;
    }
    return null;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};
