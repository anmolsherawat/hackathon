import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const SYSTEM_PROMPT =
  "You are a clinical AI assistant. I will provide you with a drug name and its raw medical data from the FDA. Summarize the primary use and major warnings in 2-3 short, highly readable bullet points. Base your summary ONLY on the provided raw data. Format in clean markdown.";

function getModel() {
  if (!API_KEY) return null;
  const genAI = new GoogleGenerativeAI(API_KEY);
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });
}

function fallbackSummary(title: string, raw: string) {
  const trimmed = (raw || "").slice(0, 600);
  return [
    `- ${title}`,
    `- Primary info: ${trimmed}`,
    `- Clinical intelligence offline. Review FDA data manually.`,
  ].join("\n");
}

export async function generateClinicalSummary(
  a: string,
  b: string,
  c?: string
): Promise<string> {
  const hasPair = typeof c === "string";
  const drugTitle = hasPair ? `${a} + ${b}` : a;
  const rawData = hasPair ? c! : b;
  const model = getModel();
  if (!model) return fallbackSummary(drugTitle, rawData);
  const userText = `Drug(s): ${drugTitle}\nRaw FDA Data:\n${rawData}`;
  const result = await model.generateContent(userText);
  const text = result?.response?.text?.() ?? "";
  return text || fallbackSummary(drugTitle, rawData);
}

export async function generateDrugSummary(
  drugName: string,
  rawData: string
): Promise<string> {
  const model = getModel();
  if (!model) return fallbackSummary(drugName, rawData);
  const userText = `Drug: ${drugName}\nRaw FDA Data:\n${rawData}`;
  const result = await model.generateContent(userText);
  const text = result?.response?.text?.() ?? "";
  return text || fallbackSummary(drugName, rawData);
}
