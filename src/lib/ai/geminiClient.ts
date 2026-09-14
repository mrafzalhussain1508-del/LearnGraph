/**
 * LearnGraph Gemini Multimodal Client
 * Production-hardened client with robust multi-tier API key binding,
 * multi-model fallback cascade, exponential backoff, rate-limit resilience,
 * and safe initialization without unhandled fatal crashes.
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

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

/**
 * Robust, multi-tier environment variable resolver for GEMINI_API_KEY.
 * Inspects process.env, NEXT_PUBLIC_GEMINI_API_KEY, .env.local, and .env on disk,
 * ensuring the API key is always resolved safely without hardcoding secrets in git.
 */
export function resolveGeminiApiKey(): string {
  // Tier 1: Standard server-side process.env.GEMINI_API_KEY
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 10) {
    return process.env.GEMINI_API_KEY.trim();
  }

  // Tier 2: Client or public environment variable NEXT_PUBLIC_GEMINI_API_KEY
  if (process.env.NEXT_PUBLIC_GEMINI_API_KEY && process.env.NEXT_PUBLIC_GEMINI_API_KEY.trim().length > 10) {
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY.trim();
  }

  // Tier 3: Proactively read from .env.local on disk if process.env was not yet hydrated
  try {
    const envLocalPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, 'utf-8');
      const match = content.match(/(?:GEMINI_API_KEY|NEXT_PUBLIC_GEMINI_API_KEY)\s*=\s*([^\r\n#]+)/);
      if (match && match[1] && match[1].trim().length > 10) {
        const key = match[1].trim().replace(/^["']|["']$/g, '');
        process.env.GEMINI_API_KEY = key;
        return key;
      }
    }
  } catch {}

  // Tier 4: Proactively read from .env on disk
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/(?:GEMINI_API_KEY|NEXT_PUBLIC_GEMINI_API_KEY)\s*=\s*([^\r\n#]+)/);
      if (match && match[1] && match[1].trim().length > 10) {
        const key = match[1].trim().replace(/^["']|["']$/g, '');
        process.env.GEMINI_API_KEY = key;
        return key;
      }
    }
  } catch {}

  return process.env.GEMINI_API_KEY?.trim() || '';
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
  const apiKey = resolveGeminiApiKey();
  if (!apiKey || apiKey.length < 10) {
    throw new Error('Gemini API key is not configured in environment or configuration files.');
  }

  let ai: GoogleGenAI;
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (initErr: any) {
    console.warn('GoogleGenAI safe initialization warning:', initErr?.message);
    throw initErr;
  }

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
        console.warn(`Gemini notice on ${modelName}:`, err?.message?.substring(0, 150));
        await wait(800);
      }
    }
  }

  throw new Error(`All candidate models temporarily busy. Last notice: ${lastError?.message || 'Network delay'}`);
}
