/**
 * LearnGraph Document Preprocessor
 * Validates file uploads, detects MIME types via magic bytes,
 * extracts text where available, and prepares payloads for multimodal Gemini analysis.
 */

export interface ProcessedDocument {
  isValid: boolean;
  error?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  base64Data: string;
  extractedTextContent?: string;
  isTextDocument: boolean;
  pageCount: number;
}

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB limit

export function processUploadedFile(
  buffer: Buffer,
  originalFileName: string,
  declaredMimeType?: string
): ProcessedDocument {
  const fileName = originalFileName || 'uploaded_document.jpg';
  const fileSize = buffer.length;

  if (!buffer || buffer.length === 0) {
    return {
      isValid: false,
      error: 'Uploaded file is completely empty (0 bytes).',
      fileName,
      fileSize: 0,
      mimeType: '',
      base64Data: '',
      isTextDocument: false,
      pageCount: 0,
    };
  }

  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File exceeds maximum allowed size of 25MB (received ${(fileSize / (1024 * 1024)).toFixed(1)}MB).`,
      fileName,
      fileSize,
      mimeType: '',
      base64Data: '',
      isTextDocument: false,
      pageCount: 0,
    };
  }

  let detectedMime = declaredMimeType || '';
  let isTextDocument = false;
  let extractedTextContent: string | undefined = undefined;
  let pageCount = 1;

  // Magic Bytes Inspection
  if (buffer.length >= 4) {
    // PDF Magic Bytes: %PDF (0x25 0x50 0x44 0x46)
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
      detectedMime = 'application/pdf';
      try {
        const rawStr = buffer.toString('utf-8');
        // Count /Page objects roughly to estimate page count
        const matches = rawStr.match(/\/Type\s*\/Page[^s]/g);
        if (matches) pageCount = Math.max(1, matches.length);

        // Simple text extraction from PDF if text stream is present
        if (rawStr.includes('Student Name') || rawStr.includes('Question') || rawStr.includes('Subject:')) {
          extractedTextContent = rawStr;
        }
      } catch {}
    }
    // PNG Magic Bytes: 0x89 0x50 0x4E 0x47
    else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      detectedMime = 'image/png';
    }
    // JPEG Magic Bytes: 0xFF 0xD8 0xFF
    else if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      detectedMime = 'image/jpeg';
    }
    // WEBP Magic Bytes: RIFF (0x52 0x49 0x46 0x46)
    else if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      detectedMime = 'image/webp';
    }
    // Plain Text inspection
    else {
      try {
        const sampleText = buffer.toString('utf-8');
        // Check if printable ASCII/UTF-8
        if (!/[\x00-\x08\x0E-\x1F]/.test(sampleText.slice(0, 1000))) {
          detectedMime = 'text/plain';
          isTextDocument = true;
          extractedTextContent = sampleText;
        }
      } catch {}
    }
  }

  // Fallback for file extension if MIME is still generic
  if (!detectedMime || detectedMime === 'application/octet-stream') {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') detectedMime = 'application/pdf';
    else if (ext === 'png') detectedMime = 'image/png';
    else if (ext === 'jpg' || ext === 'jpeg') detectedMime = 'image/jpeg';
    else if (ext === 'webp') detectedMime = 'image/webp';
    else if (ext === 'txt') {
      detectedMime = 'text/plain';
      isTextDocument = true;
      extractedTextContent = buffer.toString('utf-8');
    }
  }

  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'];
  if (!supportedTypes.includes(detectedMime)) {
    return {
      isValid: false,
      error: `Unsupported file format (${detectedMime || 'unknown'}). Please upload a JPEG, PNG, WEBP, PDF, or TXT file.`,
      fileName,
      fileSize,
      mimeType: detectedMime,
      base64Data: '',
      isTextDocument: false,
      pageCount: 0,
    };
  }

  const base64Data = buffer.toString('base64');

  return {
    isValid: true,
    fileName,
    fileSize,
    mimeType: detectedMime,
    base64Data,
    extractedTextContent,
    isTextDocument,
    pageCount,
  };
}
