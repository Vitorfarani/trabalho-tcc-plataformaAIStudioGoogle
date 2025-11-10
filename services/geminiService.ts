
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from '../types';

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove the initial 'data:image/...;base64,' part
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const extractTransactionDetailsFromImage = async (
  imageFile: File
): Promise<Partial<Omit<Transaction, 'id' | 'type' | 'category'>>> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Image = await fileToBase64(imageFile);

    const imagePart = {
      inlineData: {
        mimeType: imageFile.type,
        data: base64Image,
      },
    };

    const textPart = {
      text: `Analyze this receipt image and extract the following information in JSON format: total amount (as a number), date (in YYYY-MM-DD format), and a brief description (like the store name). If a value cannot be found, use null.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: {
              type: Type.NUMBER,
              description: 'The total value of the transaction.',
            },
            date: {
              type: Type.STRING,
              description: 'The date of the transaction in YYYY-MM-DD format.',
            },
            description: {
              type: Type.STRING,
              description: 'The name of the establishment or a brief description.',
            },
          },
        },
      },
    });

    const jsonString = response.text.trim();
    const extractedData = JSON.parse(jsonString);

    const result: Partial<Omit<Transaction, 'id' | 'type' | 'category'>> = {};
    if (extractedData.amount) {
        result.amount = Number(extractedData.amount.toFixed(2));
    }
    if (extractedData.date) {
        result.date = extractedData.date;
    }
    if (extractedData.description) {
        result.description = extractedData.description;
    }

    return result;

  } catch (error) {
    console.error("Error extracting details from image:", error);
    throw new Error("Failed to analyze receipt. Please enter the details manually.");
  }
};
