// scripts/generate-exercise-audio-keys.ts
import * as fs from 'fs';
import * as path from 'path';

interface Lesson {
  id: string;
  exercises: Array<{ id: string; audioKey?: string }>;
}

interface World {
  id: string;
  lessons: Lesson[];
}

function generateExerciseAudioKeys() {
  console.log('🔍 Generating exercise audio keys...');
  
  // 1. Բեռնել բոլոր world-ները
  const worldsPath = path.join(__dirname, '../src/lib/content/builders');
  const worldFiles = fs.readdirSync(worldsPath)
    .filter(f => f.startsWith('world') && f.endsWith('.ts'));
  
  const exerciseKeys: Record<string, string> = {};
  
  for (const file of worldFiles) {
    // Իմպորտ անել world-ը
    const worldModule = require(path.join(worldsPath, file));
    const world = worldModule.default || worldModule;
    
    // Անցնել lesson-ների և exercise-ների վրայով
    if (world && world.lessons) {
      for (const lesson of world.lessons) {
        if (lesson.exercises) {
          for (const exercise of lesson.exercises) {
            if (exercise.audioKey) {
              exerciseKeys[exercise.id] = exercise.audioKey;
            }
          }
        }
      }
    }
  }
  
  // 2. Պահպանել JSON-ը
  const outputPath = path.join(__dirname, '../src/lib/content/exercise-audio-keys.json');
  fs.writeFileSync(outputPath, JSON.stringify(exerciseKeys, null, 2));
  
  console.log(`✅ Generated ${Object.keys(exerciseKeys).length} exercise audio keys`);
}

generateExerciseAudioKeys();