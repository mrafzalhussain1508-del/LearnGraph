import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export interface TopicBreakdownItem {
  topic_name: string;
  understanding_percentage: number;
  status: 'Green' | 'Yellow' | 'Red';
}

export interface AnalyzeSheetResponse {
  student_name: string;
  overall_score_percentage: number;
  topic_breakdown: TopicBreakdownItem[];
  common_misconceptions: string[];
  what_to_learn_next: string[];
  is_live_gemini?: boolean;
  model_used?: string;
  notice?: string;
}

const SYSTEM_INSTRUCTION = `You are an expert educational diagnostician and master teacher evaluating a student answer sheet or exam paper.
Your primary objective is moving assessment from "Raw Marks" to "Deep Conceptual Understanding" while being 100% faithful to the actual grades written on the paper.

CRITICAL INSTRUCTIONS FOR GRADING & SCORE CALCULATION:
1. Focus on Graded Marks:
You must look for the teacher's explicitly written grades next to each question (e.g., '3/3', '0/4', '0/3') and the final total score (e.g., '3/10'). Do NOT guess or hallucinate percentages.

2. Strict Math Calculation:
Calculate the 'understanding_percentage' for each topic strictly based on the fraction of marks awarded for that specific question. If a student gets 3/3, the percentage is exactly 100. If they get 0/4, it is exactly 0. If a topic spans multiple questions, sum the awarded marks and divide by the total possible marks for those questions to get the exact integer percentage.

3. Exact Overall Score:
The 'overall_score_percentage' must be the exact mathematical conversion of the final score written on the paper (e.g., 3/10 = 30). Do not use an arbitrary number.

Additional Analysis Guidelines:
- Student Name: Look for the student's name written on the test sheet (e.g., in the header or title box). If absent or illegible, return "Student".
- Topic Breakdown: Group questions into their respective curriculum topics (e.g., "Linear Equations", "Quadratic Equations", "Function Domain & Range", "Graph Transformations"). For each topic:
  - "topic_name": Descriptive curriculum strand.
  - "understanding_percentage": Exact mathematical percentage (0-100) based strictly on marks awarded.
  - "status": Strictly "Green" if understanding_percentage >= 80, "Yellow" if between 50 and 79, or "Red" if < 50.
- Common Misconceptions: Identify the exact cognitive fallacies in the student's steps where marks were deducted. Be specific and pedagogical.
- What to Learn Next: Provide concise, high-impact learning prescriptions and rules to practice.

STRICT JSON OUTPUT REQUIREMENT:
You MUST respond with ONLY a valid, raw JSON object matching this exact schema:
{
  "student_name": "string",
  "overall_score_percentage": 0,
  "topic_breakdown": [
    {
      "topic_name": "string",
      "understanding_percentage": 0,
      "status": "Green"
    }
  ],
  "common_misconceptions": [
    "string"
  ],
  "what_to_learn_next": [
    "string"
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    // Validate whether a real key was configured (not placeholder)
    const isApiKeyConfigured = 
      !!apiKey && 
      apiKey !== 'PASTE_MY_NEW_GEMINI_API_KEY_HERE' && 
      apiKey !== 'your_gemini_api_key_here' && 
      apiKey.length > 10;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No test sheet file provided. Please upload an image or PDF.' },
        { status: 400 }
      );
    }

    // Convert file to base64 buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';

    // If Gemini API Key is configured, execute live AI analysis via @google/genai SDK
    if (isApiKeyConfigured) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `${SYSTEM_INSTRUCTION}

Now analyze this uploaded student answer sheet file (${file.name}, size: ${file.size} bytes).
CRITICAL RULES TO ENFORCE:
1. Focus on Graded Marks: You must look for the teacher's explicitly written grades next to each question (e.g., '3/3', '0/4', '0/3') and the final total score (e.g., '3/10'). Do NOT guess or hallucinate percentages.
2. Strict Math Calculation: Calculate the 'understanding_percentage' for each topic strictly based on the fraction of marks awarded for that specific question. If a student gets 3/3, the percentage is exactly 100. If they get 0/4, it is exactly 0.
3. Exact Overall Score: The 'overall_score_percentage' must be the exact mathematical conversion of the final score written on the paper (e.g., 3/10 = 30). Do not use an arbitrary number.

Output ONLY the requested raw JSON.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
          ],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const responseText = response.text?.trim() || '{}';

        // Clean any markdown code block fences if present
        const cleanJson = responseText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();

        const parsedData = JSON.parse(cleanJson);

        // Normalize statuses to 'Green' | 'Yellow' | 'Red'
        if (Array.isArray(parsedData.topic_breakdown)) {
          parsedData.topic_breakdown = parsedData.topic_breakdown.map((t: any) => {
            const pct = Math.round(Number(t.understanding_percentage) || 0);
            let status: 'Green' | 'Yellow' | 'Red' = 'Green';
            if (pct < 50) status = 'Red';
            else if (pct < 80) status = 'Yellow';
            return {
              topic_name: t.topic_name || 'General Mathematics',
              understanding_percentage: Math.min(100, Math.max(0, pct)),
              status: status,
            };
          });
        }

        const rawOverall = Number(parsedData.overall_score_percentage);
        const overallScore = !isNaN(rawOverall) ? Math.min(100, Math.max(0, Math.round(rawOverall))) : 0;

        const result: AnalyzeSheetResponse = {
          student_name: parsedData.student_name || 'Student',
          overall_score_percentage: overallScore,
          topic_breakdown: parsedData.topic_breakdown || [],
          common_misconceptions: parsedData.common_misconceptions || [],
          what_to_learn_next: parsedData.what_to_learn_next || [],
          is_live_gemini: true,
          model_used: 'Gemini 3.6 Flash',
        };

        return NextResponse.json(result);
      } catch (geminiError: any) {
        // Safe logging without leaking credentials or internal secrets
        const safeErrorMsg = (geminiError?.message || 'Unknown error').replace(
          new RegExp(apiKey, 'g'),
          '[REDACTED]'
        );
        console.error('Gemini API call error (safe):', safeErrorMsg);
        // Fall through to diagnostic fallback so user experience remains resilient
      }
    }

    // Graceful Intelligent Diagnostic Fallback
    // Allows full frontend testing before user pastes their production Gemini API key
    const fallbackResponse: AnalyzeSheetResponse = {
      student_name: file.name.toLowerCase().includes('alex') ? 'Alex Chen' : 'Alex Chen',
      overall_score_percentage: 72,
      topic_breakdown: [
        {
          topic_name: 'Algebra & Linear Equations',
          understanding_percentage: 95,
          status: 'Green',
        },
        {
          topic_name: 'Quadratic Equations',
          understanding_percentage: 64,
          status: 'Yellow',
        },
        {
          topic_name: 'Functions & Domain Restrictions',
          understanding_percentage: 42,
          status: 'Red',
        },
        {
          topic_name: 'Graph Transformations',
          understanding_percentage: 35,
          status: 'Red',
        },
      ],
      common_misconceptions: [
        'Inverted horizontal translation rule: shifted f(x - 3) left by 3 units instead of right by 3 units.',
        'Omitted denominator zero boundary (x != 7) when evaluating radical domain sqrt(x - 3) / (x - 7).',
        'Lost negative sign inside formula when evaluating -b for b = -4, calculating -4 instead of +4.',
      ],
      what_to_learn_next: [
        'Horizontal Shift Rule: Set inside parentheses to 0: (x - 3) = 0 -> x = +3 (Shift RIGHT).',
        'Double-Gate Domain Checklist: Evaluate radical floor (>=0) AND denominator vault (!=0) independently.',
        'Ghost Parentheses Substitution: Always write - (b) +- sqrt((b)^2 - 4ac) before inserting values.',
      ],
      is_live_gemini: false,
      model_used: 'gemini-2.5-flash (Demo Diagnostic Fallback)',
      notice: isApiKeyConfigured
        ? 'Live Gemini request could not complete (safe network/quota fallback); showing diagnostic preview.'
        : 'Running in demonstration mode. Replace PASTE_MY_NEW_GEMINI_API_KEY_HERE in .env with your real Gemini API key to activate live Gemini 2.5 Flash inference.',
    };

    return NextResponse.json(fallbackResponse);
  } catch (error: any) {
    console.error('API Error in analyze-sheet:', error?.message || 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to process student answer sheet: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}