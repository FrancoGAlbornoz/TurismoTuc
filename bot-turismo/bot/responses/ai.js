// bot/responses/ai.js
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getGPTResponse(message) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
      temperature: 0.7
    });
    return response.choices[0].message.content;
  } catch (err) {
    console.error("Error OpenAI:", err.message);
    return "Lo siento, no puedo responder ahora. Intenta más tarde.";
  }
}
