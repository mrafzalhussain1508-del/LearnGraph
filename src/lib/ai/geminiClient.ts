/**
 * LearnGraph Gemini Multimodal Client
 * Production-hardened client with multi-model fallback cascade,
 * exponential backoff, rate-limit resilience, and strict JSON extraction.
 */

import { GoogleGenAI } from '@google/genai';

export interface GeminiCallOptions {
  prompt: string;
  media?: {
    base64Data: string;
    mimeType: string;
  };
  temperature?: number;
}

export interface GeminiCallResult {
  text: string;
  json: any;
  modelUsed: string;
  latencyMs: number;
  attempts: number;
}

// Ordered candidate models based on verified availability and capability
const CANDIDATE_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
];

function cleanJsonString(rawText: string): string {
  let cleaned = rawText.trim();
  // Strip markdown code fences if present
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  return cleaned.trim();
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function executeGeminiAnalysis(options: GeminiCallOptions): Promise<GeminiCallResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey.length < 10) {
    throw new Error('GEMINI_API_KEY is not configured or is invalid.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const temperature = options.temperature ?? 0.1;

  let lastError: any = null;
  let attempts = 0;
  const startTime = Date.now();

  for (const modelName of CANDIDATE_MODELS) {
    // Up to 2 attempts per candidate model (for transient network/rate issues)
    for (let retry = 0; retry < 2; retry++) {
      attempts++;
      try {
        const contents: any[] = [];
        contents.push({ text: options.prompt });

        if (options.media && options.media.base64Data) {
          contents.push({
            inlineData: {
              data: options.media.base64Data,
              mimeType: options.media.mimeType || 'image/jpeg',
            },
          });
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            responseMimeType: 'application/json',
            temperature,
          },
        });

        const rawText = response.text || '';
        if (!rawText.trim()) {
          throw new Error(`Empty response received from ${modelName}`);
        }

        const cleanJson = cleanJsonString(rawText);
        let parsed: any;
        try {
          parsed = JSON.parse(cleanJson);
        } catch (jsonErr: any) {
          throw new Error(`Failed to parse JSON response from ${modelName}: ${jsonErr.message}`);
        }

        const latencyMs = Date.now() - startTime;
        return {
          text: rawText,
          json: parsed,
          modelUsed: modelName,
          latencyMs,
          attempts,
        };
      } catch (err: any) {
        lastError = err;
        const msg = (err?.message || '').toLowerCase();
        const status = err?.status || err?.code || 0;

        // If rate limit (429), wait briefly before retrying or switching models
        if (status === 429 || msg.includes('quota') || msg.includes('rate')) {
          console.warn(`Gemini model ${modelName} rate limited (attempt ${retry + 1}/2). Backing off 1.5s...`);
          await wait(1500 * (retry + 1));
          continue;
        }

        // If 404 (model not available for this key), immediately break and try next model
        if (status === 404 || msg.includes('not found')) {
          console.warn(`Gemini model ${modelName} not available (404), switching to next model...`);
          break;
        }

        // Other errors: wait briefly
        console.warn(`Gemini error on ${modelName}:`, err?.message?.substring(0, 150));
        await wait(1000);
      }
    }
  }

  throw new Error(`All candidate Gemini models failed after ${attempts} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
}
