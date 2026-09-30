import React, { useState } from 'react';
import { X, Volume2, Sparkles, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { FruitType, VOCAB_DATA } from '../types/game';
import { FruitGraphic } from './FruitGraphic';
import { soundManager } from '../utils/audio';

interface TeacherVocabModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: FruitType;
}

export const TeacherVocabModal: React.FC<TeacherVocabModalProps> = ({
  isOpen,
  onClose,
  initialType = 'apple',
}) => {
  const fruitKeys: FruitType[] = ['apple', 'banana', 'kiwi'];
  const [selectedType, setSelectedType] = useState<FruitType>(initialType);

  if (!isOpen) return null;

  const currentVocab = VOCAB_DATA[selectedType];
  const currentIndex = fruitKeys.indexOf(selectedType);

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % fruitKeys.length;
    setSelectedType(fruitKeys[nextIndex]);
    soundManager.playPop();
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + fruitKeys.length) % fruitKeys.length;
    setSelectedType(fruitKeys[prevIndex]);
    soundManager.playPop();
  };

  const speak = (spell = false, slow = false) => {
    soundManager.playSuccessChime();
    soundManager.speakEnglishWord(currentVocab.word, { spell, slow });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-4 border-amber-300 text-center">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-4">
          <div className="flex items-center gap-2 text-amber-800 font-fun font-bold text-lg">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <span>课堂单词卡 · English Word Flashcards</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Word Switcher Tabs */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {fruitKeys.map((key) => {
            const vocab = VOCAB_DATA[key];
            const isActive = selectedType === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedType(key);
                  soundManager.playPop();
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-fun font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-md scale-105'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <span>{vocab.word}</span>
                <span>({vocab.translation})</span>
              </button>
            );
          })}
        </div>

        {/* Flashcard Body with Carousel arrows */}
        <div className="relative bg-amber-50/70 border-2 border-amber-200/80 rounded-2xl p-6 mb-6">
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md text-amber-800 hover:bg-white cursor-pointer transition-transform hover:scale-110"
            aria-label="Previous word"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md text-amber-800 hover:bg-white cursor-pointer transition-transform hover:scale-110"
            aria-label="Next word"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-3">
            <FruitGraphic type={currentVocab.type} size={110} />
          </div>

          <h3
            className="text-4xl sm:text-5xl font-extrabold font-fun tracking-wide mb-1"
            style={{ color: currentVocab.color }}
          >
            {currentVocab.word}
          </h3>

          <div className="text-slate-600 font-medium text-base mb-3 flex items-center justify-center gap-2">
            <span className="font-mono text-slate-500">{currentVocab.phonetic}</span>
            <span>·</span>
            <span className="font-bold text-slate-800 text-lg">{currentVocab.translation}</span>
          </div>

          {/* Spell blocks */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {currentVocab.letters.map((letter, i) => (
              <span
                key={i}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-amber-200 text-amber-900 font-bold font-fun shadow-xs"
              >
                {letter}
              </span>
            ))}
          </div>

          {/* Bilingual sentence */}
          <div className="bg-white/80 rounded-xl p-3 text-left border border-amber-100 text-sm">
            <div className="font-semibold text-slate-900">"{currentVocab.sentence}"</div>
            <div className="text-slate-500 text-xs mt-0.5">{currentVocab.chineseSentence}</div>
          </div>
        </div>

        {/* Classroom Controls */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => speak(false, false)}
            className="flex flex-col items-center justify-center p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer font-fun"
          >
            <Volume2 className="w-5 h-5 mb-1" />
            <span className="text-xs sm:text-sm font-semibold">标准发音</span>
          </button>

          <button
            type="button"
            onClick={() => speak(true, false)}
            className="flex flex-col items-center justify-center p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer font-fun"
          >
            <Sparkles className="w-5 h-5 mb-1" />
            <span className="text-xs sm:text-sm font-semibold">字母拼读</span>
          </button>

          <button
            type="button"
            onClick={() => speak(false, true)}
            className="flex flex-col items-center justify-center p-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer font-fun"
          >
            <Volume2 className="w-5 h-5 mb-1" />
            <span className="text-xs sm:text-sm font-semibold">慢速跟读</span>
          </button>
        </div>
      </div>
    </div>
  );
};
