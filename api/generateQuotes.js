// api/generateQuotes.js (função serverless do Vercel)
import { GoogleGenerativeAI } from "@google/generative-ai"; // Assumindo que é Gemini – instale se não tiver: npm i @google/generative-ai

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY; // Seguro, só no server
  if (!apiKey) {
    return res.status(500).json({ error: "API Key não configurada" });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Ajuste o modelo

  try {
    const prompt = req.body.prompt; // Pegue o prompt do body
    const result = await model.generateContent(prompt);
    res.status(200).json({ quotes: result.response.text() }); // Ajuste pro seu formato
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}