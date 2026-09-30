import React, { useEffect } from 'react';
import { Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { FruitVocab } from '../types/game';
import { FruitGraphic } from './FruitGraphic';
import { soundManager } from '../utils/audio';

interface WordPopupCardProps {
  vocab: FruitVocab;
  pointsAwarded: number;
  combo: number;
  onClose: () => void;
}

export const WordPopupCard: React.FC<WordPopupCardProps> = ({
  vocab,
  pointsAwarded,
  combo,
  onClose,
}) => {
  useEffect(() => {
    // Auto dismiss after 3 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 3200);
    return () => clearTimeout(timer);
  }, [vocab, onClose]);

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playSuccessChime();
    soundManager.speakEnglishWord(vocab.word);
  };

  const handleSpell = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playPop();
    soundManager.speakEnglishWord(vocab.word, { spell: true });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-amber-200 text-center transform transition-all scale-100 animate-in zoom-in-95 duration-200"
      >
        {/* Combo Badge if > 1 */}
        {combo > 1 && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-amber-500 to-orange-500 text-white font-fun font-bold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5 text-sm sm:text-base animate-bounce">
            <Sparkles className="w-4 h-4 fill-amber-200 text-amber-200" />
            <span>{combo} COMBO! 连击 +{pointsAwarded}分</span>
          </div>
        )}

        {/* Fruit Illustration */}
        <div className="flex justify-center mb-3 mt-1">
          <div className="relative p-3 bg-amber-50/80 rounded-2xl border border-amber-100">
            <FruitGraphic type={vocab.type} size={96} />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Big English Word */}
        <div className="mb-1">
          <h2
            className="text-4xl sm:text-5xl font-extrabold tracking-wide font-fun drop-shadow-sm"
            style={{ color: vocab.color }}
          >
            {vocab.word}
          </h2>
        </div>

        {/* Letters Breakdown & Phonetics */}
        <div className="flex items-center justify-center gap-1.5 my-2">
          {vocab.letters.map((letter, idx) => (
            <span
              key={idx}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100/80 text-amber-900 font-bold font-fun text-lg border border-amber-200 shadow-xs"
            >
              {letter}
            </span>
          ))}
        </div>

        {/* Phonetic & Chinese Translation */}
        <div className="text-slate-600 text-sm sm:text-base flex items-center justify-center gap-2 mb-4 font-medium">
          <span className="font-mono text-slate-500">{vocab.phonetic}</span>
          <span>·</span>
          <span className="font-bold text-slate-800">{vocab.translation}</span>
        </div>

        {/* Interactive Classroom Audio Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={handleReplay}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-fun font-semibold rounded-xl shadow-md transition-transform active:scale-95 text-sm sm:text-base cursor-pointer"
          >
            <Volume2 className="w-5 h-5 shrink-0" />
            <span>再读一遍</span>
          </button>

          <button
            type="button"
            onClick={handleSpell}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white font-fun font-semibold rounded-xl shadow-md transition-transform active:scale-95 text-sm sm:text-base cursor-pointer"
          >
            <span className="text-base font-bold">A-B-C</span>
            <span>拼读发音</span>
          </button>
        </div>

        {/* Bilingual Example Sentence */}
        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-left text-xs sm:text-sm text-slate-700">
          <p className="font-semibold text-slate-900 mb-0.5">"{vocab.sentence}"</p>
          <p className="text-slate-500">{vocab.chineseSentence}</p>
        </div>

        {/* Close hint */}
        <p className="mt-3 text-xs text-slate-400">点击任意空白处继续采摘水果...</p>
      </div>
    </div>
  );
};
