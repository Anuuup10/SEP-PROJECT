import express from "express";
import OpenAI from "openai";

const router = express.Router();

/* =========================================================
   OPENAI
========================================================= */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =========================================================
   GROQ CONFIG
========================================================= */

const GROQ_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const GROQ_MODEL =
  process.env.GROQ_MODEL || "openai/gpt-oss-20b";

/* =========================================================
   GROQ AI
========================================================= */

async function askGroq(
  message,
  history = [],
  context = {}
) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is missing from server/.env"
    );
  }

  const systemPrompt = `
You are KhanaLens Assistant, a friendly nutrition and health AI assistant.

LANGUAGE:
- Always answer in natural Nepali.
- Use Nepali Devanagari script.
- You may understand English questions, but respond in Nepali.
- Sound natural, friendly and conversational.

PERSONALITY:
- Friendly
- Encouraging
- Short and clear
- Like a helpful nutrition coach

YOU CAN HELP WITH:
- Calories
- Protein
- Carbohydrates
- Fat
- Water
- Meals
- Food choices
- Healthy eating
- Daily food intake
- Nutrition goals

IMPORTANT:
- Use the user's nutrition data when available.
- Never invent food intake numbers.
- Never invent calories or protein that are not present in the provided data.
- If data is unavailable, say that you don't have that information.
- Do not diagnose diseases.
- Do not give dangerous medical advice.
- Keep normal answers relatively short because this assistant may be spoken aloud.

USER NUTRITION DATA:
${JSON.stringify(context, null, 2)}
`;

  const safeHistory = Array.isArray(history)
    ? history
        .filter(
          (item) =>
            item &&
            (item.role === "user" ||
              item.role === "assistant") &&
            typeof item.content === "string"
        )
        .slice(-10)
        .map((item) => ({
          role: item.role,
          content: item.content,
        }))
    : [];

  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },

    ...safeHistory,

    {
      role: "user",
      content: message.trim(),
    },
  ];

  console.log(
    `[KhanaLens AI] Sending request to Groq using model: ${GROQ_MODEL}`
  );

  const response = await fetch(GROQ_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },

    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "========== GROQ API ERROR =========="
    );

    console.error(
      "Status:",
      response.status
    );

    console.error(
      "Model:",
      GROQ_MODEL
    );

    console.error(
      "Response:",
      JSON.stringify(data, null, 2)
    );

    console.error(
      "===================================="
    );

    throw new Error(
      data?.error?.message ||
        `Groq request failed with status ${response.status}`
    );
  }

  const reply =
    data?.choices?.[0]?.message?.content;

  if (!reply) {
    throw new Error(
      "Groq returned an empty response"
    );
  }

  return reply.trim();
}

/* =========================================================
   TEST ROUTE
========================================================= */

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "KhanaLens Assistant API is running",
    model: GROQ_MODEL,
    voice: "OpenAI TTS enabled",
  });
});

/* =========================================================
   CHAT ROUTE
========================================================= */

router.post("/chat", async (req, res) => {
  try {
    const {
      message,
      history = [],
      context = {},
    } = req.body || {};

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const reply = await askGroq(
      message,
      history,
      context
    );

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error(
      "[Assistant Error]",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Assistant failed",
    });
  }
});

/* =========================================================
   OPENAI NEPALI TEXT-TO-SPEECH
========================================================= */

router.post("/voice", async (req, res) => {
  try {
    const { text } = req.body || {};

    /* -----------------------------------------------
       Validate text
    ------------------------------------------------ */

    if (
      typeof text !== "string" ||
      !text.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    /* -----------------------------------------------
       Check OpenAI API key
    ------------------------------------------------ */

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        message:
          "OPENAI_API_KEY is missing from server/.env",
      });
    }

    console.log(
      "[KhanaLens Voice] Generating OpenAI speech..."
    );

    console.log(
      "[KhanaLens Voice] Text:",
      text.trim()
    );

    /* -----------------------------------------------
       Generate speech
    ------------------------------------------------ */

    const speech =
      await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",

        voice: "coral",

        input: text.trim(),

        response_format: "mp3",
      });

    /* -----------------------------------------------
       Convert response to buffer
    ------------------------------------------------ */

    const audioBuffer = Buffer.from(
      await speech.arrayBuffer()
    );

    console.log(
      `[KhanaLens Voice] Audio generated: ${audioBuffer.length} bytes`
    );

    /* -----------------------------------------------
       Send audio to frontend
    ------------------------------------------------ */

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length,

      // Helpful for browser audio playback
      "Cache-Control": "no-cache",

      // Allows browser to receive the audio
      "Accept-Ranges": "bytes",
    });

    return res.send(audioBuffer);
  } catch (error) {
    console.error(
      "========== OPENAI VOICE ERROR =========="
    );

    console.error(
      error
    );

    console.error(
      "=========================================" 
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Voice generation failed",
    });
  }
});

/* =========================================================
   EXPORT
========================================================= */

export default router;