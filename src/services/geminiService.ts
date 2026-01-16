import { GoogleGenAI } from "@google/genai";

// Use import.meta.env for Vite
const apiKey = import.meta.env.VITE_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateGeminiInsight = async (prompt: string): Promise<string> => {
  if (!apiKey) return "API Key Gemini belum dikonfigurasi.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Tidak ada respons dari AI.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Gagal menghubungi layanan AI. Coba lagi nanti.";
  }
};