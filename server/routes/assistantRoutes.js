import express from "express";

const router = express.Router();

/* =========================================================
   GROQ CONFIG
========================================================= */

const GROQ_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const GROQ_MODEL =
  process.env.GROQ_MODEL || "openai/gpt-oss-20b";

/* =========================================================
   KHANA AI SYSTEM PROMPT
========================================================= */

const KHANA_AI_PROMPT = `
You are Khana AI, the intelligent food and nutrition assistant
inside the KhanaLens application.

Your job is to help users with:

- Food and nutrition
- Calories
- Protein
- Carbohydrates
- Fat
- Fiber
- Water
- Meals
- Healthy eating
- Food choices
- Daily nutrition
- Nutrition goals
- Food tracking
- General food questions
- Translating between English and Nepali

=========================================================
LANGUAGE RULES
=========================================================

Khana AI supports BOTH English and Nepali.

1. If the user asks in English:
   - Answer naturally in English.

2. If the user asks in Nepali:
   - Answer naturally in Nepali.
   - Use Devanagari script.

3. If the user explicitly asks:
   - "translate this to Nepali"
   - "translate to Nepali"
   - "नेपालीमा अनुवाद गर"
   - or similar:
     Translate the requested text into natural Nepali.

4. If the user explicitly asks:
   - "translate this to English"
   - "translate into English"
   - "अंग्रेजीमा अनुवाद गर"
   - or similar:
     Translate the requested text into natural English.

5. Do NOT unnecessarily translate the user's question.

6. Preserve the meaning of translations.
   Do not translate word-for-word if that makes the sentence unnatural.

=========================================================
CONVERSATION
=========================================================

You can answer normal questions.

Examples:

User:
"What is protein?"

Answer in English.

User:
"प्रोटिन भनेको के हो?"

Answer in Nepali.

User:
"दालमा कति प्रोटिन हुन्छ?"

Answer in Nepali.

User:
"Translate दाल in English"

Answer:
"Lentils."

=========================================================
NUTRITION DATA
=========================================================

The application may provide nutrition data about the user.

Use that data when it is available.

IMPORTANT:

- Never invent the user's food intake.
- Never invent the user's calories.
- Never invent protein, carbohydrates, fat, water,
  or other nutrition numbers for the user's personal data.
- If personal data is unavailable, clearly say that
  the information is not available.

For general food questions, you may provide approximate
nutrition information when appropriate, but make it clear
that values can vary depending on serving size and preparation.

=========================================================
SAFETY
=========================================================

You are a nutrition assistant, not a doctor.

Do not diagnose diseases.

Do not claim that a food can cure a disease.

For serious medical problems, recommend consulting
a qualified healthcare professional.

=========================================================
STYLE
=========================================================

Be:

- Friendly
- Helpful
- Natural
- Clear
- Concise
- Conversational

Avoid unnecessary long explanations.

Use bullet points when useful.

Do not use complicated medical terminology unless necessary.

=========================================================
USER NUTRITION DATA
=========================================================

The following information may be provided by KhanaLens:

{{NUTRITION_CONTEXT}}
`;

/* =========================================================
   CLEAN TEXT
========================================================= */

function cleanText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\u0000/g, "")
    .replace(/\r/g, "")
    .trim();
}

/* =========================================================
   SAFE HISTORY
========================================================= */

function buildSafeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item) => {
      return (
        item &&
        (item.role === "user" ||
          item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.trim().length > 0
      );
    })
    .slice(-12)
    .map((item) => ({
      role: item.role,
      content: cleanText(item.content),
    }));
}

/* =========================================================
   NORMALIZE + APPLY REQUESTED REPLY LANGUAGE
   ---------------------------------------------------------
   The system prompt's own LANGUAGE RULES section only makes
   the model match whatever language the question was asked
   in. That's why a frontend "reply language" toggle previously
   had zero effect: nothing ever told the model to override
   that auto-match behavior.

   This function normalizes whatever the client sends (e.g.
   "nepali", "ne", "ne-NP", "english", "en") and, if it's a
   language we support, appends a HIGH-PRIORITY override block
   to the system prompt that explicitly beats the auto-match
   rules above it.
========================================================= */

function normalizeLanguage(language) {
  if (typeof language !== "string") {
    return null;
  }

  const value = language.trim().toLowerCase();

  if (value.startsWith("ne")) {
    return "ne";
  }

  if (value.startsWith("en")) {
    return "en";
  }

  return null;
}

function buildSystemPrompt(nutritionContext, language) {
  const basePrompt = KHANA_AI_PROMPT.replace(
    "{{NUTRITION_CONTEXT}}",
    nutritionContext
  );

  const normalized = normalizeLanguage(language);

  if (!normalized) {
    return basePrompt;
  }

  const languageLabel =
    normalized === "ne"
      ? "Nepali, written in Devanagari script"
      : "English";

  const override = `

=========================================================
RESPONSE LANGUAGE OVERRIDE (HIGHEST PRIORITY)
=========================================================

The user has explicitly set their preferred reply language
to: ${languageLabel}.

This overrides every rule in the LANGUAGE RULES section above.
Regardless of what language the user's message is written in,
you MUST write your entire reply in ${languageLabel}.

The only exception is rules 3 and 4 above (explicit translation
requests) — if the user explicitly asks you to translate text
into a specific language, honor that request instead.
`;

  return basePrompt + override;
}

/* =========================================================
   GROQ AI
========================================================= */

async function askKhanaAI(
  message,
  history = [],
  context = {},
  language = null
) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is missing from server/.env"
    );
  }

  const safeMessage = cleanText(message);

  if (!safeMessage) {
    throw new Error("Message cannot be empty");
  }

  let nutritionContext = "{}";

  try {
    nutritionContext = JSON.stringify(
      context || {},
      null,
      2
    );
  } catch {
    nutritionContext = "{}";
  }

  const systemPrompt = buildSystemPrompt(
    nutritionContext,
    language
  );

  const safeHistory = buildSafeHistory(history);

  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },

    ...safeHistory,

    {
      role: "user",
      content: safeMessage,
    },
  ];

  console.log(
    `[Khana AI] Sending request using model: ${GROQ_MODEL} (language: ${
      normalizeLanguage(language) || "auto"
    })`
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

      temperature: 0.5,

      max_tokens: 500,
    }),
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Groq returned an invalid response."
    );
  }

  if (!response.ok) {
    console.error(
      "========== GROQ API ERROR =========="
    );

    console.error("Status:", response.status);
    console.error("Model:", GROQ_MODEL);

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

  if (
    typeof reply !== "string" ||
    !reply.trim()
  ) {
    throw new Error(
      "Khana AI returned an empty response."
    );
  }

  return reply.trim();
}

/* =========================================================
   HEALTH CHECK
========================================================= */

router.get("/", (req, res) => {
  res.json({
    success: true,

    message:
      "Khana AI Assistant API is running",

    model: GROQ_MODEL,

    features: [
      "English questions",
      "Nepali questions",
      "English answers",
      "Nepali answers",
      "English to Nepali translation",
      "Nepali to English translation",
      "Nutrition assistance",
      "Food questions",
      "Conversation history",
    ],
  });
});

/* =========================================================
   CHAT
========================================================= */

router.post("/chat", async (req, res) => {
  try {
    const {
      message,
      history = [],
      context = {},
      language = null,
    } = req.body || {};

    /* ---------------------------------------------
       Validate message
    --------------------------------------------- */

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    /* ---------------------------------------------
       Ask Khana AI
    --------------------------------------------- */

    const reply = await askKhanaAI(
      message,
      history,
      context,
      language
    );

    /* ---------------------------------------------
       Response
    --------------------------------------------- */

    return res.status(200).json({
      success: true,

      reply,

      language:
        detectLanguage(reply),

      model: GROQ_MODEL,
    });
  } catch (error) {
    console.error(
      "========== KHANA AI ERROR =========="
    );

    console.error(error);

    console.error(
      "===================================="
    );

    return res.status(500).json({
      success: false,

      message:
        error?.message ||
        "Khana AI failed to respond.",
    });
  }
});

/* =========================================================
   LANGUAGE DETECTION
========================================================= */

function detectLanguage(text) {
  if (!text) {
    return "unknown";
  }

  const nepaliCharacters =
    (text.match(
      /[\u0900-\u097F]/g
    ) || []).length;

  const totalLetters =
    (text.match(/[A-Za-z\u0900-\u097F]/g) || [])
      .length;

  if (
    totalLetters > 0 &&
    nepaliCharacters / totalLetters > 0.25
  ) {
    return "ne";
  }

  return "en";
}

/* =========================================================
   TRANSLATION ROUTE
   OPTIONAL
=========================================================

   The main /chat endpoint already understands
   translation requests.

   This separate endpoint is useful if your frontend
   has a dedicated Translate button.
========================================================= */

router.post("/translate", async (req, res) => {
  try {
    const {
      text,
      targetLanguage,
    } = req.body || {};

    if (
      typeof text !== "string" ||
      !text.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Text is required.",
      });
    }

    if (
      targetLanguage !== "en" &&
      targetLanguage !== "ne"
    ) {
      return res.status(400).json({
        success: false,
        message:
          'targetLanguage must be "en" or "ne".',
      });
    }

    const languageName =
      targetLanguage === "ne"
        ? "natural Nepali using Devanagari script"
        : "natural English";

    const translationPrompt = `
Translate the following text into ${languageName}.

Rules:

- Preserve the original meaning.
- Do not add explanations.
- Do not remove important information.
- Make the translation natural and conversational.
- Return ONLY the translation.

TEXT:

${cleanText(text)}
`;

    const translatedText =
      await askKhanaAI(
        translationPrompt,
        [],
        {}
      );

    return res.status(200).json({
      success: true,

      translation: translatedText,

      targetLanguage,
    });
  } catch (error) {
    console.error(
      "[Khana AI Translation Error]",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error?.message ||
        "Translation failed.",
    });
  }
});

/* =========================================================
   EXPORT
========================================================= */

export default router;