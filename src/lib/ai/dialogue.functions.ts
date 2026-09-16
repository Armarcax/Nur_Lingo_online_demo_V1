import { getWavClient } from '@/lib/audio/WavClient';

export interface DialogueTurn {
  speaker: 'user' | 'assistant';
  text: string;
  translation?: string;
}

export interface DialogueSession {
  id: string;
  context: string;
  turns: DialogueTurn[];
  language: string;
  completed: boolean;
  score?: number;
}

export interface DialogueEvaluation {
  score: number;
  feedback: string[];
  corrections: { original: string; corrected: string }[];
}

export function evaluateDialogue(
  session: DialogueSession,
  userInput: string
): DialogueEvaluation {
  const feedback: string[] = [];
  const corrections: { original: string; corrected: string }[] = [];

  if (userInput.length < 3) {
    feedback.push('Please provide a longer response.');
  }

  if (userInput.toLowerCase().includes('hello')) {
    feedback.push('Good use of greetings!');
  }

  return {
    score: feedback.length > 0 ? 70 : 85,
    feedback,
    corrections
  };
}

export function generateDialogueContext(topic: string): string {
  const contexts: Record<string, string> = {
    greetings: 'You are at a cafe in Yerevan. Introduce yourself and order coffee.',
    family: 'You are visiting your Armenian friend\'s family. Talk about your family.',
    food: 'You are at a restaurant. Order food and ask about the menu.',
    travel: 'You are planning a trip to Armenia. Ask about places to visit.',
    work: 'You are at a job interview. Talk about your experience and skills.'
  };

  return contexts[topic] || 'Start a conversation in Armenian.';
}

export function getDialoguePrompt(topic: string, language: string): string {
  if (topic === 'greetings' && language === 'hy') {
    return 'Start the conversation in Armenian. Introduce yourself.';
  }
  if (topic === 'greetings' && language === 'en') {
    return 'Start the conversation in English. Introduce yourself.';
  }
  if (topic === 'family' && language === 'hy') {
    return 'Talk about your family in Armenian.';
  }
  if (topic === 'family' && language === 'en') {
    return 'Talk about your family in English.';
  }
  if (topic === 'food' && language === 'hy') {
    return 'Order food in Armenian.';
  }
  if (topic === 'food' && language === 'en') {
    return 'Order food in English.';
  }
  return 'Start the conversation.';
}

export function processDialogueInput(input: string, context: string): {
  response: string;
  suggestions: string[];
} {
  const suggestions: string[] = [];

  if (input.toLowerCase().includes('hello')) {
    suggestions.push('How are you?');
    suggestions.push('Nice to meet you!');
  }

  if (input.toLowerCase().includes('food')) {
    suggestions.push('I would like to order...');
    suggestions.push('What do you recommend?');
  }

  if (input.toLowerCase().includes('family')) {
    suggestions.push('I have a sister.');
    suggestions.push('My family is from...');
  }

  let response = 'That is interesting!';
  if (input.includes('?')) {
    response = 'Thank you for asking. Let me think about that.';
  }

  return {
    response,
    suggestions: suggestions.length > 0 ? suggestions : ['Try to extend your answer.']
  };
}

export function generateDialoguePractice(topic: string, language: string): {
  context: string;
  prompt: string;
  expectedPhrases: string[];
} {
  const expectedPhrases: Record<string, string[]> = {
    hy: ['hello', 'goodbye', 'thank you'],
    en: ['hello', 'goodbye', 'thank you'],
    ru: ['привет', 'пока', 'спасибо']
  };

  return {
    context: generateDialogueContext(topic),
    prompt: getDialoguePrompt(topic, language),
    expectedPhrases: expectedPhrases[language] || ['hello', 'goodbye']
  };
}

export function evaluateSpokenResponse(
  userInput: string,
  expectedPhrases: string[]
): {
  accuracy: number;
  matchedPhrases: string[];
  suggestions: string[];
} {
  const matchedPhrases: string[] = [];
  const suggestions: string[] = [];

  for (const phrase of expectedPhrases) {
    if (userInput.toLowerCase().includes(phrase.toLowerCase())) {
      matchedPhrases.push(phrase);
    } else {
      suggestions.push('Try to use: ' + phrase);
    }
  }

  const accuracy = expectedPhrases.length > 0
    ? (matchedPhrases.length / expectedPhrases.length) * 100
    : 0;

  return {
    accuracy,
    matchedPhrases,
    suggestions
  };
}

export { getWavClient };