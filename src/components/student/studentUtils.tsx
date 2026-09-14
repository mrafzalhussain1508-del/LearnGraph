import React from 'react';

// Regex targeting key mathematical terms to mimic handwritten study guide highlighting
export const MATH_TERMS_REGEX = /(transposing|transposed|transpose|signs?|slope|y-intercept|x-intercept|intercepts?|horizontal translation|vertical translation|translations?|reflections?|transformations?|quadratic formula|quadratic equations?|quadratics?|roots?|domains?|ranges?|denominators?|numerators?|parentheses|ghost parentheses|fractions?|inequalit(?:y|ies)|substitut(?:e|ion|ed)|coefficients?|negative signs?|negatives?|positives?|radicals?|square roots?|exponents?|factoring|factors?|formulas?|coordinates?|derivatives?|variables?|f\([^\)]+\)|b\^2\s*-\s*4ac|-\s*b)/gi;

export function renderHighlightedMathText(text: string) {
  if (!text) return null;
  const parts = text.split(MATH_TERMS_REGEX);
  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;
        const isMatch = index % 2 === 1 || MATH_TERMS_REGEX.test(part);
        MATH_TERMS_REGEX.lastIndex = 0;
        if (isMatch) {
          return (
            <span
              key={index}
              className="bg-yellow-200 dark:bg-yellow-900/50 text-yellow-950 dark:text-yellow-200 font-bold px-1.5 py-0.5 rounded mx-0.5 inline-block border border-yellow-300/80 dark:border-yellow-700/60 shadow-2xs"
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export function parseMisconception(text: string, index: number) {
  const colonIndex = text.indexOf(':');
  if (colonIndex > 0 && colonIndex < 70) {
    return {
      title: text.substring(0, colonIndex).trim(),
      body: text.substring(colonIndex + 1).trim(),
    };
  }
  return {
    title: `Cognitive Divergence #${index + 1}`,
    body: text,
  };
}

export function parseActionStep(text: string, index: number) {
  const colonIndex = text.indexOf(':');
  if (colonIndex > 0 && colonIndex < 70) {
    return {
      title: text.substring(0, colonIndex).trim(),
      body: text.substring(colonIndex + 1).trim(),
    };
  }
  return {
    title: `Target Remediation #${index + 1}`,
    body: text,
  };
}
