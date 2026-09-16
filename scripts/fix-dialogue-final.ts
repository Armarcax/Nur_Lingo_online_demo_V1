// scripts/fix-dialogue-final.ts
import fs from 'fs';
import path from 'path';

class FixDialogueFinal {
  async run() {
    console.log('🔧 Fixing dialogue.functions.ts FINAL...\n');

    const dlgPath = path.join(process.cwd(), 'src/lib/ai/dialogue.functions.ts');
    
    // Correct content for dialogue.functions.ts - using single quotes to avoid backtick issues
    const correctContent = `import { getWavClient } from '@/lib/audio/WavClient';

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

// Evaluation functions
export function evaluateDialogue(
  session: DialogueSession,
  userInput: string
): DialogueEvaluation {
  const feedback: string[] = [];
  const corrections: { original: string; corrected: string }[] = [];

  // Basic evaluation logic
  if (userInput.length < 3) {
    feedback.push('Please provide a longer response.');
  }

  if (userInput.toLowerCase().includes('hello') || userInput.toLowerCase().includes('բարև')) {
    feedback.push('Good use of greetings!');
  }

  return {
    score: feedback.length > 0 ? 70 : 85,
    feedback,
    corrections
  };
}

// Generate dialogue context
export function generateDialogueContext(topic: string): string {
  const contexts: Record<string, string> = {
    greetings: 'You are at a cafe in Yerevan. Introduce yourself and order coffee.',
    family: 'You are visiting your Armenian friend\'s family. Talk about your family.',
    food: 'You are at a restaurant. Order food and ask about the menu.',
    travel: 'You are planning a trip to Armenia. Ask about places to visit.',
    work: 'You are at a job interview. Talk about your experience and skills.'
  };

  return contexts[topic] || contexts.greetings;
}

// Get dialogue prompt
export function getDialoguePrompt(topic: string, language: string): string {
  const prompts: Record<string, Record<string, string>> = {
    greetings: {
      hy: 'Սկսեք զրույցը հայերենով: Ներկայացեք և ասեք, թե որտեղից եք:',
      en: 'Start the conversation in English. Introduce yourself and say where you are from.',
      ru: 'Начните разговор на русском. Представьтесь и скажите, откуда вы.'
    },
    family: {
      hy: 'Խոսեք ձեր ընտանիքի մասին: Ասեք, թե քանի հոգի են և ինչ են անում:',
      en: 'Talk about your family. Say how many people are in your family and what they do.',
      ru: 'Расскажите о своей семье. Скажите, сколько человек в вашей семье и чем они занимаются.'
    },
    food: {
      hy: 'Պատվիրեք ուտելիք և հարցրեք ճաշացուցակի մասին:',
      en: 'Order food and ask about the menu.',
      ru: 'Закажите еду и спросите о меню.'
    }
  };

  return prompts[topic]?.[language] || prompts.greetings[language] || 'Start the conversation.';
}

// Process dialogue input
export function processDialogueInput(input: string, context: string): {
  response: string;
  suggestions: string[];
} {
  const suggestions: string[] = [];

  // Generate suggestions based on input
  if (input.toLowerCase().includes('hello') || input.toLowerCase().includes('բարև')) {
    suggestions.push('How are you? / Ինչպես ես:');
    suggestions.push('Nice to meet you! / Ուրախ եմ ծանոթանալու:');
  }

  if (input.toLowerCase().includes('food') || input.toLowerCase().includes('ուտելիք')) {
    suggestions.push('I would like to order... / Ես կուզենայի պատվիրել...');
    suggestions.push('What do you recommend? / Ինչ եք առաջարկում:');
  }

  if (input.toLowerCase().includes('family') || input.toLowerCase().includes('ընտանիք')) {
    suggestions.push('I have a sister/brother. / Ես ունեմ քույր/եղբայր:');
    suggestions.push('My family is from... / Իմ ընտանիքը...-ից է:');
  }

  // Simple response generation
  let response = 'That is interesting!';
  if (input.includes('?')) {
    response = 'Thank you for asking. Let me think about that.';
  }

  return {
    response,
    suggestions: suggestions.length > 0 ? suggestions : ['Try to extend your answer.', 'Ask a follow-up question.']
  };
}

// Generate dialogue practice
export function generateDialoguePractice(topic: string, language: string): {
  context: string;
  prompt: string;
  expectedPhrases: string[];
} {
  const expectedPhrases: Record<string, Record<string, string[]>> = {
    greetings: {
      hy: ['բարև', 'ինչպես ես', 'ուրախ եմ ծանոթանալու', 'ցտեսություն'],
      en: ['hello', 'how are you', 'nice to meet you', 'goodbye'],
      ru: ['привет', 'как дела', 'приятно познакомиться', 'до свидания']
    },
    family: {
      hy: ['ընտանիք', 'մայր', 'հայր', 'քույր', 'եղբայր'],
      en: ['family', 'mother', 'father', 'sister', 'brother'],
      ru: ['семья', 'мать', 'отец', 'сестра', 'брат']
    },
    food: {
      hy: ['ուտելիք', 'խմելիք', 'ճաշ', 'ընթրիք'],
      en: ['food', 'drink', 'lunch', 'dinner'],
      ru: ['еда', 'напиток', 'обед', 'ужин']
    }
  };

  return {
    context: generateDialogueContext(topic),
    prompt: getDialoguePrompt(topic, language),
    expectedPhrases: expectedPhrases[topic]?.[language] || ['hello', 'goodbye']
  };
}

// Evaluate spoken response
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

// Export WavClient
export { getWavClient };
`;
    fs.writeFileSync(dlgPath, correctContent);
    console.log('✅ dialogue.functions.ts has been completely rebuilt!');
    console.log('📁 File: ' + dlgPath);
    console.log('\n🎯 Please run: npm run audit');
  }
}

const fixer = new FixDialogueFinal();
fixer.run().catch(console.error);