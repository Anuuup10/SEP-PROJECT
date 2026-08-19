// pages/api/assistant/chat.js (or app/api/assistant/chat/route.js)
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history, context, stream = true } = req.body;

  try {
    // Build system prompt with nutrition context
    const systemPrompt = `You are KhanaLens Assistant, a helpful nutrition and diet assistant.
Current nutrition data:
- Calories: ${context.caloriesConsumed}/${context.calorieTarget} (${context.caloriesRemaining} remaining)
- Protein: ${context.proteinConsumed}/${context.proteinTarget}g (${context.proteinRemaining}g remaining)
- Carbs: ${context.carbsConsumed}/${context.carbsTarget}g
- Fat: ${context.fatConsumed}/${context.fatTarget}g

You can respond in both English and Nepali (नेपाली). If the user speaks Nepali, respond in Nepali.
Provide helpful, concise nutritional advice. Be warm and encouraging.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message },
    ];

    if (stream) {
      // Set up streaming response
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      const stream = await groq.chat.completions.create({
        model: 'mixtral-8x7b-32768', // or 'llama2-70b-4096'
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }
      
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } else {
      // Non-streaming fallback
      const completion = await groq.chat.completions.create({
        model: 'mixtral-8x7b-32768',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      });

      const reply = completion.choices[0]?.message?.content || "Sorry, I couldn't process that.";
      res.status(200).json({ reply });
    }
  } catch (error) {
    console.error('Assistant API error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
}