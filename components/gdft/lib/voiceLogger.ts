
import { toast } from 'sonner';

export type VoiceAction = 
  | { type: 'ADD_SET', weight: number, reps: number }
  | { type: 'HEART_RATE', avg?: number, max?: number }
  | { type: 'START_REST', seconds: number }
  | { type: 'NEXT_EXERCISE' }
  | { type: 'FINISH_SET' }
  | { type: 'CANCEL' }
  | { type: 'ERROR', message: string };

// Helper to convert word numbers to digits
const textToNumber = (text: string): number => {
  const numberMap: Record<string, number> = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
    'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
    'twenty-one': 21, 'twenty-two': 22, 'twenty-three': 23, 'twenty-four': 24, 'twenty-five': 25,
    'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
    'hundred': 100
  };
  
  const clean = text.toLowerCase().trim();
  if (!isNaN(parseFloat(clean))) return parseFloat(clean);
  return numberMap[clean] || 0;
};

// Advanced number parser for multi-word numbers like "one hundred twenty five"
const parseComplexNumber = (text: string): number => {
  const words = text.toLowerCase().trim().split(/[\s-]+/);
  let total = 0;
  let current = 0;

  for (const word of words) {
    const val = textToNumber(word);
    if (word === 'hundred') {
      current = (current || 1) * 100;
    } else {
      current += val;
    }
  }
  return total + current;
};

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
  onstart: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const getSpeechRecognition = () => {
  if (typeof window !== 'undefined') {
    return window.SpeechRecognition || window.webkitSpeechRecognition;
  }
  return null;
};

export class VoiceLogger {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private onAction: (action: VoiceAction) => void;

  constructor(onAction: (action: VoiceAction) => void) {
    this.onAction = onAction;
    const SpeechRecognitionAPI = getSpeechRecognition();
    if (SpeechRecognitionAPI) {
      this.recognition = new SpeechRecognitionAPI();
      this.recognition.continuous = false; // Single phrase usually better for commands
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript.toLowerCase()
          .replace(/[.,?!]/g, '') // Remove punctuation
          .trim();
        
        console.log('Processed Voice Transcript:', transcript);
        toast(`Voice: "${transcript}"`, { duration: 2000 });
        
        const action = this.parseTranscript(transcript);
        this.onAction(action);
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech Recognition Error:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please check site permissions.');
        } else if (event.error !== 'no-speech') {
          this.onAction({ type: 'ERROR', message: `Recognition error: ${event.error}` });
        }
        this.isListening = false;
      };

      this.recognition.onstart = () => {
        console.log('Speech recognition started');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        console.log('Speech recognition ended');
      };
    }
  }

  public start() {
    if (!this.recognition) {
      toast.error('Voice recognition not supported in this browser.');
      return;
    }
    if (this.isListening) return;

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      console.error('Failed to start recognition:', e);
      // Attempt to stop and restart if already started state error
      try {
        this.recognition.stop();
        setTimeout(() => this.recognition?.start(), 100);
      } catch(e2) {}
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  private parseTranscript(transcript: string): VoiceAction {
    // 1. ADD SET Pattern: "add 225 for 8", "30 for 10", "135 for eight"
    // Capture groups: (weight phrase) (separator) (reps phrase)
    const addSetRegex = /(?:add|log|set)?\s*([\w\s-]+?)\s*(?:lbs|pounds|for|at)?\s+([\w\s-]+?)\s*(?:reps|repetitions|sets)?$/i;
    
    // 2. HEART RATE Pattern: "average heart rate 140", "max heart rate 160", "hr 135"
    const avgHrRegex = /(?:average|avg)?\s*(?:heart rate|hr|heartrate)\s*([\w\s-]+)$/i;
    const maxHrRegex = /(?:max|maximum)\s*(?:heart rate|hr|heartrate)\s*([\w\s-]+)$/i;

    const restPattern = /(?:rest|timer|countdown)\s*([\w\s-]+)\s*(?:seconds|secs|sec)?$/i;
    const nextPattern = /(?:next|skip|move to next)\s*(?:exercise|set)?$/i;
    const finishPattern = /(?:finish|done|complete|end)\s*(?:set|exercise)?$/i;
    const cancelPattern = /(?:cancel|undo|discard|stop)\s*(?:input|set)?$/i;

    let match;

    // Check Heart Rate first
    const avgMatch = transcript.match(avgHrRegex);
    const maxMatch = transcript.match(maxHrRegex);
    if (avgMatch || maxMatch) {
      return {
        type: 'HEART_RATE',
        avg: avgMatch ? parseComplexNumber(avgMatch[1]) : undefined,
        max: maxMatch ? parseComplexNumber(maxMatch[1]) : undefined
      };
    }

    if ((match = transcript.match(restPattern))) {
      return { 
        type: 'START_REST', 
        seconds: parseComplexNumber(match[1]) 
      };
    }

    if (nextPattern.test(transcript)) {
      return { type: 'NEXT_EXERCISE' };
    }

    if (finishPattern.test(transcript)) {
      return { type: 'FINISH_SET' };
    }

    if (cancelPattern.test(transcript)) {
      return { type: 'CANCEL' };
    }

    // Try Add Set last as it's the most common but also general
    if ((match = transcript.match(addSetRegex))) {
      const weight = parseComplexNumber(match[1]);
      const reps = parseComplexNumber(match[2]);
      
      if (weight > 0 && reps > 0) {
        return { type: 'ADD_SET', weight, reps };
      }
    }

    return { type: 'ERROR', message: `Command not recognized. Try "Add 30 for 10"` };
  }
}
