/**
 * LearnGraph Production Answer-Sheet Analysis Pipeline
 * Full-cycle pipeline:
 * UPLOAD -> VALIDATION -> OCR / MULTIMODAL UNDERSTANDING -> QUESTION SEGMENTATION
 * -> EVALUATION -> SCORING -> MISCONCEPTION DETECTION -> VALIDATION LAYER -> RESULT
 */

import { ProcessedDocument, processUploadedFile } from './documentProcessor';
import { buildAnalysisPrompt } from './prompts';
import { executeGeminiAnalysis, GeminiCallResult } from './geminiClient';
import { validateAndSanitizeAnalysis, ValidationReport } from './validator';
import { AnalysisResult } from './types';

export interface RunPipelineOptions {
  buffer: Buffer;
  fileName: string;
  declaredMimeType?: string;
  sessionStudentName?: string | null;
  targetSubject?: string | null;
}

export async function runAnswerSheetPipeline(options: RunPipelineOptions): Promise<AnalysisResult> {
  const { buffer, fileName, declaredMimeType, sessionStudentName, targetSubject } = options;

  // STAGE 1: File Validation & Document Preprocessing
  const processedDoc = processUploadedFile(buffer, fileName, declaredMimeType);
  if (!processedDoc.isValid) {
    throw new Error(processedDoc.error || 'Invalid uploaded file.');
  }

  // STAGE 2: Build Structured, Grounded Prompt
  const prompt = buildAnalysisPrompt({
    fileName: processedDoc.fileName,
    fileSize: processedDoc.fileSize,
    sessionStudentName,
    targetSubject,
    extractedTextContent: processedDoc.extractedTextContent,
  });

  // STAGE 3: Multimodal Gemini LLM Execution with Cascade & Backoff
  let geminiResult: GeminiCallResult;
  try {
    geminiResult = await executeGeminiAnalysis({
      prompt,
      media: !processedDoc.isTextDocument
        ? {
            base64Data: processedDoc.base64Data,
            mimeType: processedDoc.mimeType,
          }
        : undefined,
      temperature: 0.1, // Low temperature for deterministic grading accuracy
    });
  } catch (geminiError: any) {
    console.error('Gemini multimodal execution failed:', geminiError?.message || geminiError);
    throw new Error(`AI Diagnostic Engine failed to analyze document: ${geminiError?.message || 'Model service error'}`);
  }

  // STAGE 4: Schema & Consistency Validation Layer
  const validation: ValidationReport = validateAndSanitizeAnalysis(geminiResult.json, {
    modelUsed: geminiResult.modelUsed,
    targetSubject,
    sessionStudentName,
  });

  const finalResult = validation.sanitizedResult;

  // Annotate with operational telemetry
  finalResult.notices.push(
    `Latency: ${geminiResult.latencyMs}ms | Model: ${geminiResult.modelUsed} | Total Questions Evaluated: ${finalResult.questions.length}`
  );

  return finalResult;
}
