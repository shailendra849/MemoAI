import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function transcribeAudio(audioBase64: string, mimeType: string, language: string): Promise<string> {
  const model = "gemini-3-flash-preview";
  const prompt = `Please transcribe this audio accurately. 
  CRITICAL: Identify different speakers (e.g., "Speaker 1", "Speaker 2") based on voice patterns and label their contributions in a dialogue format. 
  The spoken language is ${language}. 
  Provide only the transcription text.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: audioBase64,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
    ],
  });

  return response.text || "Transcription failed.";
}

export async function summarizeTranscript(transcript: string, language: string): Promise<string> {
  const model = "gemini-3-flash-preview";
  const prompt = `Summarize the following meeting transcript into concise, professional meeting notes. 
  Include key decisions, action items, and a brief overview. 
  Attribute key points or decisions to specific speakers (e.g., "Speaker 1 noted that...") if they were identified in the transcript.
  Use ${language} for the summary.

Transcript:
${transcript}`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
  });

  return response.text || "Summarization failed.";
}

export async function generateTitle(transcript: string): Promise<string> {
  const model = "gemini-3-flash-preview";
  const prompt = `Based on this meeting transcript, generate a short, professional title (max 5 words).
  
Transcript:
${transcript}`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
  });

  return response.text?.replace(/"/g, '') || "New Meeting";
}
