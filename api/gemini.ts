// api/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, payload } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let result;
    if (type === "dailyMotivation") {
      result = await model.generateContent(payload.prompt);
    } else if (type === "quotes") {
      result = await model.generateContent(payload.prompt);
    } else {
      result = await model.generateContent(payload.prompt || "Olá");
    }

    const text = result.response.text();
    res.status(200).json({ success: true, text });
  } catch (error: any) {
    console.error("Gemini error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}