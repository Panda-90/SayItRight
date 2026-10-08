import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const systemInstruction = `You are SayRight, an AI communication coach. You are NOT a paraphrasing tool.

Your job is to transform RAW THOUGHTS into a READY-TO-SEND MESSAGE.

PIPELINE:
RAW THOUGHTS -> UNDERSTAND SITUATION & INTENT -> RELATIONSHIP & EMOTION -> CHOOSE TONE -> COMPOSE MESSAGE -> ADD PERSONALITY -> RETURN MESSAGE

1. RAW INTENT DETECTION: Treat phrases like "I don't know how to say", "I want to compliment", "help me express" as signals of raw intent. Do NOT paraphrase the explanation. Say it FOR them.
2. NO ADVICE: If the user says "I don't know what to say", do NOT give advice. Directly generate the message.
3. FLIRTING / ROMANTIC / COMPLIMENTS: Do NOT simply list requested compliments. Build a complete conversational message. Add subtle personality and light flirting. Keep it respectful, especially for new interactions. Example pattern: Observation -> Natural Compliment -> Subtle Flirt -> Conversation Hook.
4. REQUESTED WORDS: If the user asks for specific words (e.g. "cute, sweet, beautiful"), use them naturally in a flowing sentence. Don't force them into an awkward list.
5. NATURALNESS: Avoid generic AI phrases ("I just wanted to say", "I couldn't help but notice", "I hope this finds you well"). Use conversational language, contractions, natural pauses ("..."), and short sentences. Sound human.
6. EMOTIONAL INTENSITY: Match the user's stated intensity. Do not exaggerate ("I think she's cute" != "You are the love of my life").
7. NO INVENTED FACTS: Never invent relationship history, shared memories, or events that didn't happen.
8. EMOJI INTELLIGENCE (Native Unicode): Do NOT automatically add emojis.
   - Professional/Academic (Professor, HR, Recruiter): 0 emojis.
   - Personal/Casual (Birthday, Romantic, Friends): 0-4 emojis maximum.
   - Flirting: 0-2 emojis (e.g. 😌, 😉).
   - IMPORTANT: Use actual Unicode characters (❤️, 😊). NEVER use text placeholders like :heart: or [smile].
9. MESSAGE LENGTH: 2-5 sentences for most situations. Keep it concise and ready to copy/send.
10. FORMATTING & CONTEXT-AWARENESS: Understand the user's true feelings and the gravity of the situation to decide the length and format.
    - If the user is writing something long, serious, or initiating a formal request (e.g., asking a Professor for an extension, applying for a job), format it as a full formal email with a Subject line.
    - If the user is writing a quick reply, a simple thank you, or a short update to a Manager/Colleague, DO NOT write a full email. Format it as a professional Slack/Teams direct message (e.g., "Hi [Name], thanks for the feedback...").
    - Never force "Subject: Re: [Previous Subject]" for short replies.

FINAL INTERNAL CHECK (Silent):
1. Did I create a real message instead of paraphrasing?
2. Does it fit the relationship and tone?
3. If flirting, is it natural and respectful?
4. Are requested words used naturally?
5. Are emojis appropriate and in Unicode?
6. Would a real person actually send this?`;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Analyze endpoint
app.post('/api/analyze', async (req, res) => {
  const { message, action, context, recipient } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const recipientContext = recipient ? `\nRecipient: ${recipient}` : '';
  let userPrompt = `Raw Thoughts: ${message}${recipientContext}`;

  if (action === 'shorter') {
    userPrompt = `Original context: ${context || ''}\nGenerated message: ${message}${recipientContext}\n\nMake this message shorter while preserving the original intent, emotion and important information.`;
  } else if (action === 'casual') {
    userPrompt = `Original context: ${context || ''}\nGenerated message: ${message}${recipientContext}\n\nMake this message feel more natural, relaxed and conversational. Do not make it childish or overly informal.`;
  } else if (action === 'formal') {
    userPrompt = `Original context: ${context || ''}\nGenerated message: ${message}${recipientContext}\n\nMake this message more polished and professional, while preserving the original meaning.`;
  } else if (action === 'confident') {
    userPrompt = `Original context: ${context || ''}\nGenerated message: ${message}${recipientContext}\n\nMake this message sound confident, assertive, and clear while remaining polite.`;
  } else if (action === 'flirty') {
    userPrompt = `Original context: ${context || ''}\nGenerated message: ${message}${recipientContext}\n\nMake this message charming, playful, and subtly flirty while remaining respectful.`;
  } else if (action === 'regenerate') {
    userPrompt = `Raw Thoughts: ${message}${recipientContext}\n\nGenerate a new, alternative version of the message with the same underlying intent.`;
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;

  if (geminiApiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: action === 'regenerate' ? 0.7 : 0.2,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rewritten_message: { type: Type.STRING },
              overall_assessment: { type: Type.STRING },
              why_this_works: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              tone: {
                type: Type.OBJECT,
                properties: {
                  primary: { type: Type.STRING },
                  secondary: { type: Type.STRING },
                  intensity: { type: Type.STRING },
                },
                required: ['primary', 'secondary', 'intensity'],
              },
              alternatives: {
                type: Type.OBJECT,
                properties: {
                  shorter: { type: Type.STRING },
                  casual: { type: Type.STRING },
                  formal: { type: Type.STRING },
                  confident: { type: Type.STRING },
                  flirty: { type: Type.STRING },
                },
              },
            },
            required: ['rewritten_message', 'overall_assessment', 'why_this_works', 'tone', 'alternatives'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('Gemini generation error:', err);
      // Fall through to Groq or fallback if Gemini failed
    }
  }

  if (groqApiKey) {
    try {
      const model = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemInstruction + '\nReturn structured JSON ONLY.' },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: action === 'regenerate' ? 0.7 : 0.2,
        }),
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        const content = groqData.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return res.json(parsed);
        }
      } else {
        const errText = await groqRes.text();
        console.error('Groq API error:', errText);
      }
    } catch (err) {
      console.error('Groq fetch error:', err);
    }
  }

  // Fallback response if no API keys are provided or network is unreachable
  return res.json({
    rewritten_message: `Here is a refined version: "${message.trim()}"`,
    overall_assessment: 'Direct and clear communication.',
    why_this_works: [
      'Expresses core intent clearly without unnecessary preamble.',
      'Maintains respectful and appropriate professional tone.',
      'Easy for the recipient to understand and act upon.'
    ],
    tone: {
      primary: action || 'Balanced',
      secondary: recipient || 'Neutral',
      intensity: 'Medium'
    },
    alternatives: {
      shorter: message.length > 50 ? message.slice(0, 45) + '...' : message,
      casual: `Hey, just wanted to check in regarding: ${message}`,
      formal: `I am writing to formally communicate the following: ${message}`,
      confident: `I am writing to confirm: ${message}`,
      flirty: `Just thinking about this: ${message} 😉`
    }
  });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
