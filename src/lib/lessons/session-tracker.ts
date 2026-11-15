// src/lib/lessons/session-tracker.ts

export type EventType = 'correct' | 'incorrect' | 'revealed' | 'hint';

export interface LessonEvent {
  id: string;
  itemId: string;
  type: EventType;
  timestamp: number;
}

export interface LessonSession {
  id: string;
  lessonId: string;
  startedAt: number;
  itemIds: string[];
  events: LessonEvent[];
}

export interface SessionSummary {
  totalItems: number;
  attempted: number;
  correct: number;
  incorrect: number;
  revealed: number;
  hintsUsed: number;
  independentCorrect: number; // Առանց հուշումների և առանց սխալների
  errorIds: string[];
}

export function startSession(lessonId: string, itemIds: string[]): LessonSession {
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    lessonId,
    startedAt: Date.now(),
    itemIds,
    events: [],
  };
}

export function logEvent(session: LessonSession, itemId: string, type: EventType): LessonSession {
  const newEvent: LessonEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    itemId,
    type,
    timestamp: Date.now(),
  };
  
  return {
    ...session,
    events: [...session.events, newEvent],
  };
}

export function summarizeSession(session: LessonSession): SessionSummary {
  const summary: SessionSummary = {
    totalItems: session.itemIds.length,
    attempted: 0,
    correct: 0,
    incorrect: 0,
    revealed: 0,
    hintsUsed: 0,
    independentCorrect: 0,
    errorIds: [],
  };

  // Խմբավորում ենք իրադարձությունները ըստ հարցի (itemId)
  const itemEvents: Record<string, LessonEvent[]> = {};
  
  for (const event of session.events) {
    if (!itemEvents[event.itemId]) {
      itemEvents[event.itemId] = [];
    }
    itemEvents[event.itemId].push(event);
  }

  for (const [itemId, events] of Object.entries(itemEvents)) {
    let hasError = false;
    let hasHint = false;
    let finalStatus: 'correct' | 'incorrect' | 'revealed' | null = null;

    for (const evt of events) {
      if (evt.type === 'hint') hasHint = true;
      if (evt.type === 'incorrect') hasError = true;
      if (evt.type === 'revealed') {
        hasError = true;
        finalStatus = 'revealed';
      }
      if (evt.type === 'correct') {
        finalStatus = 'correct';
      }
    }

    if (finalStatus) {
      summary.attempted++;
      
      if (finalStatus === 'correct') {
        summary.correct++;
        // Ինքնուրույն է, եթե սխալ չի եղել և հուշում չի օգտագործվել
        if (!hasError && !hasHint) {
          summary.independentCorrect++;
        }
      } else if (finalStatus === 'incorrect') {
        summary.incorrect++;
        summary.errorIds.push(itemId);
      } else if (finalStatus === 'revealed') {
        summary.revealed++;
        summary.errorIds.push(itemId);
      }
    }

    if (hasHint) summary.hintsUsed++;
  }

  return summary;
}