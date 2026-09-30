export type FruitType = 'apple' | 'banana' | 'kiwi';

export interface FruitVocab {
  type: FruitType;
  word: string;
  translation: string;
  phonetic: string;
  letters: string[];
  color: string;
  accentBg: string;
  sentence: string;
  chineseSentence: string;
  funFact: string;
}

export const VOCAB_DATA: Record<FruitType, FruitVocab> = {
  apple: {
    type: 'apple',
    word: 'Apple',
    translation: '苹果',
    phonetic: '/ˈæpl/',
    letters: ['A', 'P', 'P', 'L', 'E'],
    color: '#EF4444',
    accentBg: 'bg-rose-50 border-rose-200 text-rose-700',
    sentence: 'I love juicy red apples!',
    chineseSentence: '我喜欢多汁的红苹果！',
    funFact: 'Apples float in water because 25% of their volume is air! (苹果25%是空气，能浮在水面上哦！)'
  },
  banana: {
    type: 'banana',
    word: 'Banana',
    translation: '香蕉',
    phonetic: '/bəˈnænə/',
    letters: ['B', 'A', 'N', 'A', 'N', 'A'],
    color: '#EAB308',
    accentBg: 'bg-amber-50 border-amber-200 text-amber-700',
    sentence: 'The monkey loves eating bananas!',
    chineseSentence: '小猴子最喜欢吃香蕉啦！',
    funFact: 'Bananas are naturally curved because they grow towards the sun! (香蕉向着阳光生长，所以会弯弯的！)'
  },
  kiwi: {
    type: 'kiwi',
    word: 'Kiwi',
    translation: '奇异果',
    phonetic: '/ˈkiːwiː/',
    letters: ['K', 'I', 'W', 'I'],
    color: '#65A30D',
    accentBg: 'bg-lime-50 border-lime-200 text-lime-700',
    sentence: 'Kiwi is fuzzy outside and green inside!',
    chineseSentence: '奇异果外面毛茸茸，里面绿油油！',
    funFact: 'Kiwi fruit was named after the fuzzy New Zealand Kiwi bird! (奇异果因长得像新西兰奇异鸟而得名！)'
  }
};

export interface FallingFruit {
  id: string;
  type: FruitType;
  startX: number; // percentage (15 to 82)
  currentY: number; // percentage (0 to 105)
  speed: number; // speed multiplier (e.g. 0.15 to 0.45 per frame)
  swayAmp: number; // horizontal sway amplitude
  swayFreq: number; // sway frequency
  swayPhase: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  isPopping?: boolean;
}

export type GameMode = 'target_apple' | 'target_challenge' | 'free_harvest';
export type SpeedLevel = 'slow' | 'normal' | 'fast';

export interface FloatingCard {
  id: string;
  fruit: FruitVocab;
  x: number;
  y: number;
  points: number;
  comboCount: number;
}
