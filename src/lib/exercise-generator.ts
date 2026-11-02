// src/lib/exercise-generator.ts
import { Exercise } from '@/components/InteractiveLesson';

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateExercisesFromLesson(lessonData: any): Exercise[] {
  const generated: Exercise[] = [];
  const vocab = lessonData?.vocabulary || [];
  const phrases = lessonData?.phrases || [];

  // 1. Խառնված տառեր (Word Scramble)
  vocab.forEach((v: any, i: number) => {
    if (i % 3 === 0 && v.hy && v.hy.length > 2) {
      const scrambled = shuffleArray(v.hy.split('')).join('');
      generated.push({
        id: `gen_scramble_${i}`,
        type: 'word-scramble',
        question: `Վերականգնիր բառը (Ակնարկ՝ ${v.en}):`,
        correctAnswer: v.hy,
        audioText: v.hy,
        translations: { en: v.en }
      });
    }
  });

  // 2. Ճիշտ / Սխալ (True/False)
  vocab.forEach((v: any, i: number) => {
    if (i % 4 === 0 && v.hy && v.en) {
      const isCorrect = Math.random() > 0.5;
      const fakeEn = isCorrect ? v.en : (vocab[Math.floor(Math.random() * vocab.length)]?.en || "hello");
      generated.push({
        id: `gen_tf_${i}`,
        type: 'true-false',
        question: `«${v.hy}» բառը թարգմանվում է որպես «${fakeEn}»։`,
        correctAnswer: String(isCorrect),
        audioText: v.hy,
      });
    }
  });

  // 3. Խառնված նախադասություն (Jumbled Sentence)
  phrases.forEach((p: any, i: number) => {
    if (i % 3 === 0 && p.hy && p.hy.includes(' ')) {
      const words = p.hy.split(' ');
   exercise-generator.ts   const jumbled = shuffleArray(words);
      generated.push({
        id: `gen_jumble_${i}`,
        type: 'jumbled-sentence',
        question: "Դասավորիր բառերը ճիշտ հերթականությամբ.",
        options: jumbled, // Խառնված բառերը
        correctAnswer: p.hy,
        audioText: p.hy,
      });
    }
  });

  // 4. Բաց թողնված բառ (Fill-in-the-Blanks)
  phrases.forEach((p: any, i: number) => {
    if (i % 4 === 1 && p.hy && p.hy.includes(' ')) {
      const words = p.hy.split(' ');
      const targetIndex = Math.floor(Math.random() * words.length);
      const targetWord = words[targetIndex];
      const masked = [...words];
      masked[targetIndex] = "___";
      generated.push({
        id: `gen_fib_${i}`,
        type: 'fill-in-the-blanks',
        question: masked.join(' '),
        correctAnswer: targetWord,
        audioText: p.hy,
        translations: { en: p.en }
      });
    }
  });

  return generated;
}