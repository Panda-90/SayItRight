import os
import json
from groq import Groq
from pydantic import BaseModel
from typing import List, Optional

class ToneInfo(BaseModel):
    primary: str
    secondary: str
    intensity: str

class Alternatives(BaseModel):
    shorter: Optional[str] = None
    casual: Optional[str] = None
    formal: Optional[str] = None
    confident: Optional[str] = None
    flirty: Optional[str] = None

class AnalysisResult(BaseModel):
    rewritten_message: str
    overall_assessment: str
    why_this_works: List[str]
    tone: ToneInfo
    alternatives: Alternatives

async def analyze_message(message: str, action: Optional[str] = None, context: Optional[str] = None, recipient: Optional[str] = None) -> AnalysisResult:
    api_key = os.environ.get("GROQ_API_KEY")
    model_name = os.environ.get("GROQ_MODEL", "qwen/qwen3.8-27b")
    
    if not api_key:
        return AnalysisResult(
            rewritten_message="API Key is missing.",
            overall_assessment="Error",
            why_this_works=["API Key is not configured."],
            tone=ToneInfo(primary="Error", secondary="None", intensity="None"),
            alternatives=Alternatives()
        )

    client = Groq(api_key=api_key)
    
    system_prompt = """You are SayRight, an AI communication coach. You are NOT a paraphrasing tool.

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
6. Would a real person actually send this?

Return structured JSON ONLY:
{
  "rewritten_message": "...",
  "overall_assessment": "Short 1-sentence assessment of the original thoughts.",
  "why_this_works": [
    "Reason 1",
    "Reason 2",
    "Reason 3"
  ],
  "tone": {
    "primary": "Tone (e.g. Flirty, Confident, Professional)",
    "secondary": "Secondary Tone",
    "intensity": "Low/Medium/High"
  },
  "alternatives": {
    "shorter": "...",
    "casual": "...",
    "formal": "...",
    "confident": "...",
    "flirty": "..."
  }
}
"""

    recipient_context = f"\nRecipient: {recipient}" if recipient else ""
    
    if action == "shorter":
        user_prompt = f"Original context: {context}\nGenerated message: {message}{recipient_context}\n\nMake this message shorter while preserving the original intent, emotion and important information."
    elif action == "casual":
        user_prompt = f"Original context: {context}\nGenerated message: {message}{recipient_context}\n\nMake this message feel more natural, relaxed and conversational. Do not make it childish or overly informal."
    elif action == "formal":
        user_prompt = f"Original context: {context}\nGenerated message: {message}{recipient_context}\n\nMake this message more polished and professional, while preserving the original meaning."
    elif action == "regenerate":
        user_prompt = f"Raw Thoughts: {message}{recipient_context}\n\nGenerate a new, alternative version of the message with the same underlying intent."
    else:
        user_prompt = f"Raw Thoughts: {message}{recipient_context}"

    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7 if action == "regenerate" else 0.2
        )
        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response from Groq API")
        
        result_dict = json.loads(content)
        return AnalysisResult(**result_dict)
    except Exception as e:
        print(f"Error in generation: {e}")
        return AnalysisResult(
            rewritten_message=f"Error generating content: {str(e)}",
            overall_assessment="Error processing the request.",
            why_this_works=["There was an error communicating with the AI."],
            tone=ToneInfo(primary="Error", secondary="None", intensity="None"),
            alternatives=Alternatives()
        )
