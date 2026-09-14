import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { resolveGeminiApiKey } from '@/lib/ai/geminiClient';

export const dynamic = 'force-dynamic';

export interface MockTestQuestion {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
  rule_to_remember: string;
  misconception_warning: string;
}

export interface MockTestResponse {
  topic: string;
  adaptive_level: string;
  questions: MockTestQuestion[];
  is_live_gemini: boolean;
  model_used: string;
}

const TOPIC_FALLBACKS: Record<string, MockTestQuestion[]> = {
  'Graph Transformations': [
    {
      id: 1,
      question: 'Given the parent quadratic function f(x) = x², describe the transformation that produces g(x) = (x - 5)² + 4.',
      options: [
        'Shift left 5 units, shift up 4 units',
        'Shift right 5 units, shift up 4 units',
        'Shift right 5 units, shift down 4 units',
        'Shift left 5 units, shift down 4 units'
      ],
      correct_index: 1,
      rule_to_remember: 'Horizontal Translation Rule: Inside parentheses (x - h) shifts RIGHT by h units, while +k shifts UP.',
      misconception_warning: 'Common Misconception: Transposing the minus sign to mean moving left along the negative x-axis.'
    },
    {
      id: 2,
      question: 'What transformation maps the function y = √x to y = -√(x + 3)?',
      options: [
        'Shift right 3 units, reflect across the x-axis',
        'Shift left 3 units, reflect across the y-axis',
        'Shift left 3 units, reflect across the x-axis',
        'Shift up 3 units, reflect across the x-axis'
      ],
      correct_index: 2,
      rule_to_remember: 'Reflection Rule: A negative sign outside the radical reflects across the x-axis. (x + 3) inside shifts LEFT 3 units.',
      misconception_warning: 'Common Misconception: Forgetting that a negative outside the function inverts y-coordinates, not x-coordinates.'
    },
    {
      id: 3,
      question: 'If the vertex of parabola y = (x + 2)² - 7 is moved 4 units right and 2 units up, what is the new equation?',
      options: [
        'y = (x - 2)² - 5',
        'y = (x + 6)² - 5',
        'y = (x - 2)² - 9',
        'y = (x + 2)² - 5'
      ],
      correct_index: 0,
      rule_to_remember: 'Vertex Shift: Moving right 4 transforms (x + 2) into (x + 2 - 4) = (x - 2). Moving up 2 changes -7 to -5.',
      misconception_warning: 'Common Misconception: Adding 4 directly to the +2 inside parentheses instead of subtracting for rightward shifts.'
    }
  ],
  'Quadratic Equations & Roots': [
    {
      id: 1,
      question: 'When substituting a = 1, b = -6, and c = 5 into the quadratic formula x = (-b ± √(b² - 4ac)) / (2a), what is the correct value of the leading term -b?',
      options: [
        '-6',
        '+6',
        '±6',
        '-36'
      ],
      correct_index: 1,
      rule_to_remember: 'Ghost Parentheses Rule: Always write - (b). With b = -6, evaluate - (-6) = +6.',
      misconception_warning: 'Common Misconception: Dropping the negative sign and writing -6 because b is already negative.'
    },
    {
      id: 2,
      question: 'For the quadratic equation 2x² - 4x + 5 = 0, what does the discriminant b² - 4ac determine about the roots?',
      options: [
        'Discriminant = -24; Two real distinct roots',
        'Discriminant = +56; Two real distinct roots',
        'Discriminant = -24; Two complex (non-real) roots',
        'Discriminant = 0; Exactly one real root'
      ],
      correct_index: 2,
      rule_to_remember: 'Discriminant Test: (-4)² - 4(2)(5) = 16 - 40 = -24. When b² - 4ac < 0, roots are complex conjugate pairs.',
      misconception_warning: 'Common Misconception: Evaluating (-4)² as -16 instead of +16.'
    },
    {
      id: 3,
      question: 'What are the solutions to the factored quadratic equation (2x - 3)(x + 7) = 0?',
      options: [
        'x = -3/2 and x = 7',
        'x = 3/2 and x = -7',
        'x = -3 and x = 7',
        'x = 2/3 and x = -7'
      ],
      correct_index: 1,
      rule_to_remember: 'Zero Product Property: 2x - 3 = 0 ⟹ 2x = 3 ⟹ x = 3/2. x + 7 = 0 ⟹ x = -7.',
      misconception_warning: 'Common Misconception: Inverting signs incorrectly when transposing terms across the equals sign.'
    }
  ],
  'Linear Equations & Systems': [
    {
      id: 1,
      question: 'What is the slope and y-intercept of the linear equation 3x - 2y = 8?',
      options: [
        'slope = 3, y-intercept = -4',
        'slope = 3/2, y-intercept = -4',
        'slope = -3/2, y-intercept = 4',
        'slope = 3/2, y-intercept = 8'
      ],
      correct_index: 1,
      rule_to_remember: 'Slope-Intercept Form: Transpose to y = mx + b. -2y = -3x + 8 ⟹ y = (3/2)x - 4.',
      misconception_warning: 'Common Misconception: Dividing 8 by 2 without carrying the negative sign attached to the y coefficient.'
    },
    {
      id: 2,
      question: 'Solve the system of equations by elimination: { 2x + y = 7,  x - y = 2 }.',
      options: [
        'x = 3, y = 1',
        'x = 3, y = -1',
        'x = 1, y = 5',
        'x = 4, y = -1'
      ],
      correct_index: 0,
      rule_to_remember: 'Elimination Method: Add the equations to eliminate y: 3x = 9 ⟹ x = 3. Substitute: 3 - y = 2 ⟹ y = 1.',
      misconception_warning: 'Common Misconception: Forgetting to verify the solution in both original system equations.'
    },
    {
      id: 3,
      question: 'What is the equation of the line perpendicular to y = -(1/4)x + 5 passing through (0, 2)?',
      options: [
        'y = -(1/4)x + 2',
        'y = 4x + 2',
        'y = -4x + 2',
        'y = (1/4)x + 2'
      ],
      correct_index: 1,
      rule_to_remember: 'Perpendicular Slope Rule: Negative reciprocal of -1/4 is +4. With y-intercept 2, equation is y = 4x + 2.',
      misconception_warning: 'Common Misconception: Only changing the sign without inverting the fraction (using +1/4 instead of 4).'
    }
  ],
  'Function Domain & Inverses': [
    {
      id: 1,
      question: 'What is the domain of the rational radical function f(x) = √(x - 3) / (x - 7)?',
      options: [
        '[3, ∞)',
        '[3, 7) ∪ (7, ∞)',
        '(3, 7) ∪ (7, ∞)',
        '(-∞, 7) ∪ (7, ∞)'
      ],
      correct_index: 1,
      rule_to_remember: 'Double-Gate Domain Checklist: Radicand must be non-negative (x ≥ 3) AND denominator cannot equal zero (x ≠ 7).',
      misconception_warning: 'Common Misconception: Checking only the square root floor while omitting the vertical asymptote restriction at x = 7.'
    },
    {
      id: 2,
      question: 'Find the inverse function f⁻¹(x) for f(x) = (2x + 5) / 3.',
      options: [
        'f⁻¹(x) = (3x - 5) / 2',
        'f⁻¹(x) = (3x + 5) / 2',
        'f⁻¹(x) = 3 / (2x + 5)',
        'f⁻¹(x) = (2x - 5) / 3'
      ],
      correct_index: 0,
      rule_to_remember: 'Inverse Step-by-Step: Swap variables: x = (2y + 5)/3 ⟹ 3x = 2y + 5 ⟹ 3x - 5 = 2y ⟹ y = (3x - 5)/2.',
      misconception_warning: 'Common Misconception: Taking the reciprocal of the whole expression instead of transposing operations in reverse order.'
    },
    {
      id: 3,
      question: 'For which values of x is f(x) = 1 / √(4 - x²) defined?',
      options: [
        '[-2, 2]',
        '(-2, 2)',
        '(-∞, -2) ∪ (2, ∞)',
        '[0, 2)'
      ],
      correct_index: 1,
      rule_to_remember: 'Strict Inequality in Denominator: Because the radical is in the denominator, 4 - x² must be STRICTLY > 0 (not ≥ 0). Hence (-2, 2).',
      misconception_warning: 'Common Misconception: Using closed brackets [-2, 2], which causes division by zero at x = ±2.'
    }
  ]
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic = (body.topic || body.topicName || 'Graph Transformations').trim();
    const apiKey = resolveGeminiApiKey();
    const isApiKeyConfigured = !!apiKey && apiKey.length > 10;

    if (isApiKeyConfigured) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are a master STEM educator designing an "Adaptive Mastery Checkpoint" mock test for high school math students.
The student has just reviewed the topic: "${topic}".
Your goal is to generate exactly 3 multiple-choice questions that test whether the student has genuinely cleared common cognitive misconceptions (e.g. inverted translations, dropped negative signs, domain boundaries).

CRITICAL FORMAT REQUIREMENTS:
Output ONLY a valid raw JSON object matching this schema without markdown fences:
{
  "topic": "${topic}",
  "adaptive_level": "Remediation & Mastery Checkpoint",
  "questions": [
    {
      "id": 1,
      "question": "Clear, precise math problem statement",
      "options": [
        "Option A text",
        "Option B text",
        "Option C text",
        "Option D text"
      ],
      "correct_index": 0,
      "rule_to_remember": "Concise key mathematical rule or formula that explains the correct solution",
      "misconception_warning": "Common mistake or cognitive divergence that leads students to choose a distractor"
    }
  ]
}

Make sure:
1. Exactly 3 questions are generated.
2. "options" has exactly 4 items.
3. "correct_index" is an integer between 0 and 3.
4. Mathematical notation is clean and readable (e.g., x^2, f(x - 3), sqrt(x)).
5. The rule_to_remember provides actionable study guidance.`;

        const candidateModels = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];
        for (const modelName of candidateModels) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: [{ text: prompt }],
              config: {
                responseMimeType: 'application/json',
                temperature: 0.2,
              },
            });

            const text = response.text?.trim() || '{}';
            const cleanJson = text
              .replace(/^```json\s*/i, '')
              .replace(/^```\s*/i, '')
              .replace(/```\s*$/i, '')
              .trim();

            const parsed = JSON.parse(cleanJson);

            if (Array.isArray(parsed.questions) && parsed.questions.length >= 3) {
              return NextResponse.json({
                topic: parsed.topic || topic,
                adaptive_level: 'Remediation & Mastery Checkpoint',
                questions: parsed.questions.slice(0, 3).map((q: any, idx: number) => ({
                  id: idx + 1,
                  question: q.question || 'Math problem statement',
                  options: Array.isArray(q.options) && q.options.length === 4
                    ? q.options
                    : ['Option A', 'Option B', 'Option C', 'Option D'],
                  correct_index: typeof q.correct_index === 'number' ? q.correct_index : 0,
                  rule_to_remember: q.rule_to_remember || 'Double check signs and formula substitution.',
                  misconception_warning: q.misconception_warning || 'Watch out for transposing errors.',
                })),
                is_live_gemini: true,
                model_used: `${modelName} (Interactive Adaptive Engine)`,
              });
            }
          } catch (modelErr) {
            console.warn(`Model ${modelName} unavailable for mock test generation, trying next...`);
          }
        }
      } catch (geminiError) {
        console.error('Gemini Mock Test Generation Error (using curated fallback):', geminiError);
      }
    }

    // Curated Intelligent Educational Fallback
    // Matches requested topic or defaults to Graph Transformations
    let matchedQuestions = TOPIC_FALLBACKS[topic];
    if (!matchedQuestions) {
      const lower = topic.toLowerCase();
      if (lower.includes('graph') || lower.includes('transform')) {
        matchedQuestions = TOPIC_FALLBACKS['Graph Transformations'];
      } else if (lower.includes('quad') || lower.includes('root')) {
        matchedQuestions = TOPIC_FALLBACKS['Quadratic Equations & Roots'];
      } else if (lower.includes('linear') || lower.includes('system') || lower.includes('algebra')) {
        matchedQuestions = TOPIC_FALLBACKS['Linear Equations & Systems'];
      } else if (lower.includes('domain') || lower.includes('inverse') || lower.includes('function')) {
        matchedQuestions = TOPIC_FALLBACKS['Function Domain & Inverses'];
      } else {
        matchedQuestions = TOPIC_FALLBACKS['Graph Transformations'];
      }
    }

    return NextResponse.json({
      topic,
      adaptive_level: 'Remediation & Mastery Checkpoint',
      questions: matchedQuestions,
      is_live_gemini: false,
      model_used: 'Gemini Diagnostic Bank (Curated Adaptive Fallback)',
    });
  } catch (error: any) {
    console.error('Error generating mock test:', error);
    return NextResponse.json(
      { error: 'Failed to generate mock test. ' + (error?.message || '') },
      { status: 500 }
    );
  }
}
