import { AzureOpenAI } from "openai";

const endpoint = "https://jeff-mme51s1p-eastus2.cognitiveservices.azure.com/";
const deployment = "gpt-5.3-chat";
const modelName = "gpt-5.3-chat";
const apiVersion = "2024-04-01-preview";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array required" });
  }

  try {
    const client = new AzureOpenAI({ endpoint, apiKey, deployment, apiVersion });

    const response = await client.chat.completions.create({
      messages,
      max_completion_tokens: 1024,
      model: modelName,
    });

    return res.status(200).json({
      content: response.choices[0].message.content,
    });
  } catch (err) {
    console.error("Azure OpenAI error:", err);
    return res.status(500).json({ error: "Failed to get response" });
  }
}
