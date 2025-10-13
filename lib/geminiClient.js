import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateAnswer(prompt, history = []) {
  try {
    console.log("===== Gemini AI Request =====");
    console.log("Prompt:", prompt);
    console.log("History:", history);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("Using model: gemini-2.5-flash");

    const chatSession = model.startChat({
      history: history?.map(h => ({ role: h.role, parts: [{ text: h.content }] })) || []
    });

    console.log("Chat session started with history.");

    const result = await chatSession.sendMessage(prompt);
    const textResponse = await result.response.text();

    console.log("===== Gemini AI Response =====");
    console.log(textResponse);

    return textResponse || "No response from Gemini";

  } catch (error) {
    console.error("Gemini connection failed:", error.message);
    console.error(error);
    throw error;
  }
}
