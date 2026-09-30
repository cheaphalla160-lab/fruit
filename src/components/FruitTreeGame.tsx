import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, RotateCcw, Volume2, VolumeX, Music, BookOpen, Target, Settings, Flame } from 'lucide-react';
import { FruitType, FallingFruit, VOCAB_DATA, SpeedLevel, GameMode } from '../types/game';
import { FruitGraphic } from './FruitGraphic';
import { WordPopupCard } from './WordPopupCard';
import { TeacherVocabModal } from './TeacherVocabModal';
import { soundManager } from '../utils/audio';

// Local asset paths from generate_image
const ORCHARD_BG = '/src/assets/images/orchard_storybook_bg_1790756884809.jpg';
const MAGIC_TREE_IMG = '/src/assets/images/magic_fruit_tree_1790756903237.jpg';
const BASKET_IMG = '/src/assets/images/cute_fruit_basket_1790756917701.jpg';

interface HangingBranchFruit {
  id: string;
  type: FruitType;
  xPercent: number; // 22% to 78%
  yPercent: number; // 12% to 38%
  scale: number;
}

export const FruitTreeGame: React.FC = () => {
  // Game states
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [harvestCounts, setHarvestCounts] = useState<Record<FruitType, number>>({
    apple: 0,
    banana: 0,
    kiwi: 0,
  });

  // Settings
  const [gameMode, setGameMode] = useState<GameMode>('target_apple');
  const [currentTargetFruit, setCurrentTargetFruit] = useState<FruitType>('apple');
  const [speedLevel, setSpeedLevel] = useState<SpeedLevel>('normal');
  const [isBgmActive, setIsBgmActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState<boolean>(false);

  // Active word popup when eliminated
  const [activePopupVocab, setActivePopupVocab] = useState<{
    vocab: typeof VOCAB_DATA['apple'];
    points: number;
    combo: number;
  } | null>(null);

  // Floating text animations (+10, Good Job, etc.)
  const [floatingScores, setFloatingScores] = useState<
    Array<{ id: string; x: number; y: number; text: string; color: string }>
  >([]);

  // Tree hanging fruits & falling fruits
  const [hangingFruits, setHangingFruits] = useState<HangingBranchFruit[]>([]);
  const [fallingFruits, setFallingFruits] = useState<FallingFruit[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef<number>(Date.now());
  const fruitIdCounter = useRef<number>(1);

  // Speed multiplier
  const speedMultipliers: Record<SpeedLevel, number> = {
    slow: 0.16,
    normal: 0.26,
    fast: 0.40,
  };

  // Pre-seed hanging fruits on tree branches
  const seedHangingFruits = useCallback(() => {
    const branchSlots: Array<{ x: number; y: number }> = [
      { x: 30, y: 18 },
      { x: 42, y: 14 },
      { x: 55, y: 15 },
      { x: 68, y: 19 },
      { x: 25, y: 26 },
      { x: 38, y: 24 },
      { x: 50, y: 22 },
      { x: 62, y: 25 },
      { x: 74, y: 28 },
      { x: 32, y: 34 },
      { x: 48, y: 32 },
      { x: 65, y: 35 },
    ];

    const types: FruitType[] = ['apple', 'apple', 'apple', 'banana', 'kiwi', 'apple'];
    const seeded: HangingBranchFruit[] = branchSlots.map((slot, index) => {
      // In target_apple mode, skew more towards apples
      let type: FruitType = types[index % types.length];
      if (gameMode === 'target_apple' && Math.random() > 0.3) {
        type = 'apple';
      }
      return {
        id: `hang-${fruitIdCounter.current++}`,
        type,
        xPercent: slot.x + (Math.random() * 4 - 2),
        yPercent: slot.y + (Math.random() * 3 - 1.5),
        scale: 0.85 + Math.random() * 0.25,
      };
    });

    setHangingFruits(seeded);
  }, [gameMode]);

  // Initial seeding
  useEffect(() => {
    seedHangingFruits();
  }, [seedHangingFruits]);

  // Drop a fruit from tree
  const spawnFallingFruit = useCallback(() => {
    const types: FruitType[] = ['apple', 'apple', 'banana', 'kiwi'];
    let selectedType: FruitType = types[Math.floor(Math.random() * types.length)];

    if (gameMode === 'target_apple') {
      // 65% chance of apple in apple focus mode
      selectedType = Math.random() < 0.65 ? 'apple' : (Math.random() < 0.5 ? 'banana' : 'kiwi');
    } else if (gameMode === 'target_challenge') {
      // balanced with current target
      selectedType = Math.random() < 0.5 ? currentTargetFruit : (Math.random() < 0.5 ? 'banana' : 'kiwi');
    }

    // Varied speeds for each fruit (fast, medium, slow)
    const baseMult = speedMultipliers[speedLevel];
    // Random speed factor between 0.7x (slow, floats gently) and 1.8x (fast drop)
    const speedVariation = 0.7 + Math.random() * 1.1;
    const finalSpeed = baseMult * speedVariation;

    const newFruit: FallingFruit = {
      id: `fruit-${fruitIdCounter.current++}`,
      type: selectedType,
      startX: 18 + Math.random() * 64, // 18% to 82% across screen
      currentY: 18 + Math.random() * 12, // start from canopy branches
      speed: finalSpeed,
      swayAmp: 2.5 + Math.random() * 4.5,
      swayFreq: 0.02 + Math.random() * 0.025,
      swayPhase: Math.random() * Math.PI * 2,
      rotation: (Math.random() - 0.5) * 20,
      rotationSpeed: (Math.random() - 0.5) * 0.8,
      scale: 0.9 + Math.random() * 0.3,
    };

    setFallingFruits((prev) => [...prev, newFruit]);
  }, [gameMode, currentTargetFruit, speedLevel, speedMultipliers]);

  // Main Game Loop for smooth falling fruit animation
  useEffect(() => {
    let lastTime = performance.now();

    const updateGame = (now: number) => {
      const delta = (now - lastTime) / 16.66; // Normalized to 60fps
      lastTime = now;

      // Spawn falling fruits periodically
      const spawnInterval = speedLevel === 'fast' ? 1200 : speedLevel === 'slow' ? 2400 : 1700;
      if (Date.now() - lastSpawnTimeRef.current > spawnInterval) {
        lastSpawnTimeRef.current = Date.now();
        // Limit max simultaneous falling fruits to 7 for clarity and easy tapping for kids
        setFallingFruits((prev) => {
          if (prev.length < 7) {
            spawnFallingFruit();
          }
          return prev;
        });
      }

      // Update positions of falling fruits
      setFallingFruits((prevFruits) => {
        return prevFruits
          .map((fruit) => {
            const nextY = fruit.currentY + fruit.speed * delta;
            const nextRot = fruit.rotation + fruit.rotationSpeed * delta;
            return {
              ...fruit,
              currentY: nextY,
              rotation: nextRot,
            };
          })
          .filter((fruit) => {
            // If it falls off screen (beyond 105%), reset combo softly
            if (fruit.currentY > 102) {
              return false;
            }
            return true;
          });
      });

      animationFrameRef.current = requestAnimationFrame(updateGame);
    };

    animationFrameRef.current = requestAnimationFrame(updateGame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [speedLevel, spawnFallingFruit]);

  // Handle clicking a fruit
  const handleFruitClick = (fruit: FallingFruit, clientX: number, clientY: number) => {
    const vocab = VOCAB_DATA[fruit.type];
    const isTarget =
      gameMode === 'free_harvest' ||
      (gameMode === 'target_apple' && fruit.type === 'apple') ||
      (gameMode === 'target_challenge' && fruit.type === currentTargetFruit);

    if (isTarget) {
      // 1. Success Elimination Sound & Chime
      soundManager.playPop();
      soundManager.playSuccessChime();

      // 2. Pronounce the English word crisply!
      soundManager.speakEnglishWord(vocab.word);

      // 3. Score & Combo calculations
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      const basePoints = 10;
      const comboBonus = Math.min(newCombo * 2, 20);
      const totalPoints = basePoints + comboBonus;

      setScore((prev) => prev + totalPoints);
      setHarvestCounts((prev) => ({
        ...prev,
        [fruit.type]: prev[fruit.type] + 1,
      }));

      // 4. Confetti trigger at click coordinates
      if (typeof window !== 'undefined') {
        const xRatio = clientX / window.innerWidth;
        const yRatio = clientY / window.innerHeight;
        confetti({
          particleCount: 22,
          spread: 55,
          origin: { x: xRatio, y: yRatio },
          colors: [vocab.color, '#FDE047', '#38BDF8', '#4ADE80'],
          disableForReducedMotion: true,
        });
      }

      // 5. Floating Score Indicator
      const scoreId = `score-${Date.now()}-${Math.random()}`;
      setFloatingScores((prev) => [
        ...prev,
        {
          id: scoreId,
          x: clientX,
          y: clientY - 30,
          text: `+${totalPoints} ${vocab.word}!`,
          color: vocab.color,
        },
      ]);
      setTimeout(() => {
        setFloatingScores((prev) => prev.filter((s) => s.id !== scoreId));
      }, 1200);

      // 6. Show the prominent Word Card with letters & phonics
      setActivePopupVocab({
        vocab,
        points: totalPoints,
        combo: newCombo,
      });

      // 7. Remove the clicked fruit immediately
      setFallingFruits((prev) => prev.filter((f) => f.id !== fruit.id));

      // 8. If in challenge mode and reached 5 of this fruit, cheer and switch target!
      if (gameMode === 'target_challenge' && (harvestCounts[currentTargetFruit] + 1) % 5 === 0) {
        soundManager.playCelebration();
        const fruits: FruitType[] = ['apple', 'banana', 'kiwi'];
        const remaining = fruits.filter((f) => f !== currentTargetFruit);
        const nextTarget = remaining[Math.floor(Math.random() * remaining.length)];
        setCurrentTargetFruit(nextTarget);
      }
    } else {
      // Friendly non-punitive guidance for wrong fruit clicked
      soundManager.playGentleBoing();
      soundManager.speakEnglishWord(`This is ${vocab.word}. Find ${VOCAB_DATA[gameMode === 'target_apple' ? 'apple' : currentTargetFruit].word}!`);

      // Gentle floating hint
      const scoreId = `hint-${Date.now()}`;
      setFloatingScores((prev) => [
        ...prev,
        {
          id: scoreId,
          x: clientX,
          y: clientY - 20,
          text: `这是 ${vocab.translation} (${vocab.word}) 哟`,
          color: '#64748B',
        },
      ]);
      setTimeout(() => {
        setFloatingScores((prev) => prev.filter((s) => s.id !== scoreId));
      }, 1400);

      setCombo(0);
    }
  };

  // Toggle Background Music
  const handleToggleBgm = () => {
    const isNowPlaying = soundManager.toggleBGM();
    setIsBgmActive(isNowPlaying);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    soundManager.setMuted(newMuted);
  };

  // Reset Game
  const handleResetGame = () => {
    soundManager.playPop();
    setScore(0);
    setCombo(0);
    setHarvestCounts({ apple: 0, banana: 0, kiwi: 0 });
    setFallingFruits([]);
    seedHangingFruits();
  };

  // Mode Selection handler
  const handleModeChange = (mode: GameMode) => {
    soundManager.playPop();
    setGameMode(mode);
    if (mode === 'target_apple') {
      setCurrentTargetFruit('apple');
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden flex flex-col bg-amber-50 select-none"
    >
      {/* 1. Header Bar: Three-Zone Top Bar Contract */}
      <header className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/90 backdrop-blur-md border-b border-amber-200/80 shadow-xs">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-fun font-bold text-amber-900 tracking-tight">
            Fruit Orchard Words
          </span>
          <span className="hidden md:inline text-xs font-semibold text-amber-600 bg-amber-100/70 px-2 py-0.5 rounded-md">
            小学英语趣味课堂
          </span>
        </div>

        {/* Zone 2: Navigation & Mode Selection Tabs */}
        <nav className="flex items-center gap-1.5 p-1 bg-amber-100/70 rounded-xl">
          <button
            type="button"
            onClick={() => handleModeChange('target_apple')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-fun font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              gameMode === 'target_apple'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-amber-900 hover:bg-amber-200/60'
            }`}
          >
            🍎 专练苹果 (Apple)
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('target_challenge')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-fun font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              gameMode === 'target_challenge'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-900 hover:bg-amber-200/60'
            }`}
          >
            🎯 听辨挑战 (Mission)
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('free_harvest')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-fun font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              gameMode === 'free_harvest'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-amber-900 hover:bg-amber-200/60'
            }`}
          >
            🧺 自由采摘 (All Fruits)
          </button>
        </nav>

        {/* Zone 3: Audio & Classroom Tools */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundManager.playPop();
              setIsTeacherModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-fun font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
            title="查看全部单词卡与发音"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">单词卡片</span>
          </button>

          {/* BGM Toggle */}
          <button
            type="button"
            onClick={handleToggleBgm}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isBgmActive
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-600 border-amber-200 hover:bg-amber-50'
            }`}
            title={isBgmActive ? '暂停背景音乐' : '播放轻快背景音乐'}
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Sound FX Mute */}
          <button
            type="button"
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-100 text-rose-600 border-rose-300'
                : 'bg-white text-slate-600 border-amber-200 hover:bg-amber-50'
            }`}
            title={isMuted ? '开启音效' : '静音'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Reset Game */}
          <button
            type="button"
            onClick={handleResetGame}
            className="p-2 rounded-xl bg-white border border-amber-200 text-slate-600 hover:bg-amber-50 cursor-pointer"
            title="重新开始"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Secondary Sub-HUD: Classroom Target & Score Bar */}
      <div className="relative z-20 px-4 py-2 bg-amber-100/85 backdrop-blur-xs border-b border-amber-200 flex flex-wrap items-center justify-between text-xs sm:text-sm gap-2">
        {/* Mission Goal Prompt */}
        <div className="flex items-center gap-2 font-fun text-amber-950 font-semibold">
          <Target className="w-4 h-4 text-rose-600 shrink-0" />
          <span>目标任务：</span>
          {gameMode === 'target_apple' && (
            <span className="text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
              点击掉落的苹果 🍎 Apple！
            </span>
          )}
          {gameMode === 'target_challenge' && (
            <span
              className="px-2 py-0.5 rounded-md font-bold text-white shadow-xs"
              style={{ backgroundColor: VOCAB_DATA[currentTargetFruit].color }}
            >
              请点击：{VOCAB_DATA[currentTargetFruit].word} ({VOCAB_DATA[currentTargetFruit].translation})
            </span>
          )}
          {gameMode === 'free_harvest' && (
            <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
              点击任意水果，学习单词与清脆发音！
            </span>
          )}
        </div>

        {/* Speed Control & Score Tallies */}
        <div className="flex items-center gap-4">
          {/* Speed Selector */}
          <div className="flex items-center gap-1 text-slate-600">
            <span className="text-xs">掉落速度：</span>
            {(['slow', 'normal', 'fast'] as SpeedLevel[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSpeedLevel(lvl)}
                className={`px-2 py-0.5 text-xs font-semibold rounded cursor-pointer transition-colors ${
                  speedLevel === lvl
                    ? 'bg-amber-800 text-white'
                    : 'text-amber-800 hover:bg-amber-200'
                }`}
              >
                {lvl === 'slow' ? '慢速' : lvl === 'normal' ? '标准' : '快速'}
              </button>
            ))}
          </div>

          {/* Current Score & Combo */}
          <div className="flex items-center gap-3">
            {combo > 1 && (
              <span className="flex items-center gap-1 text-orange-600 font-bold font-fun animate-pulse">
                <Flame className="w-4 h-4 fill-orange-500" />
                <span>{combo}连击!</span>
              </span>
            )}

            <div className="flex items-center gap-1.5 font-fun text-slate-800 font-bold bg-white/90 px-3 py-1 rounded-xl shadow-xs border border-amber-200">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>得分：</span>
              <span className="text-rose-600 text-base tabular-nums font-mono font-extrabold">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Playground Canvas Area */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Layer 1: Illustrated Picture Book Background */}
        <div
          className="absolute inset-0 bg-cover bg-bottom opacity-90 transition-opacity"
          style={{ backgroundImage: `url(${ORCHARD_BG})` }}
        />

        {/* Subtle Sunbeams / Clouds Floating Overlay */}
        <div className="absolute top-2 left-6 pointer-events-none opacity-80 animate-sway">
          <svg width="120" height="60" viewBox="0 0 120 60" fill="white" className="filter drop-shadow-sm">
            <path d="M 20 40 Q 20 20 40 20 Q 55 10 75 22 Q 95 15 100 35 Q 110 45 95 50 Q 80 52 20 50 Z" />
          </svg>
        </div>
        <div className="absolute top-8 right-12 pointer-events-none opacity-70 animate-sway" style={{ animationDelay: '2s' }}>
          <svg width="100" height="50" viewBox="0 0 100 50" fill="white" className="filter drop-shadow-sm">
            <path d="M 15 32 Q 15 16 32 16 Q 44 8 60 18 Q 76 12 80 28 Q 88 36 76 40 Q 64 42 15 40 Z" />
          </svg>
        </div>

        {/* Layer 2: Center Giant Magic Fruit Tree Graphic */}
        <div className="absolute inset-x-0 top-0 bottom-12 flex justify-center pointer-events-none">
          <div className="relative w-full max-w-4xl h-full flex flex-col items-center">
            {/* Tree Canopy SVG with lush leaf layers and wooden trunk */}
            <svg
              viewBox="0 0 800 600"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full filter drop-shadow-xl"
            >
              <defs>
                <linearGradient id="trunkWood" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#78350F" />
                  <stop offset="35%" stopColor="#92400E" />
                  <stop offset="70%" stopColor="#B45309" />
                  <stop offset="100%" stopColor="#5E2305" />
                </linearGradient>
                <radialGradient id="canopyTop" cx="45%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#86EFAC" />
                  <stop offset="40%" stopColor="#22C55E" />
                  <stop offset="85%" stopColor="#15803D" />
                  <stop offset="100%" stopColor="#14532D" />
                </radialGradient>
                <radialGradient id="canopyShadow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#166534" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#14532D" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Wooden Trunk & Deep Roots */}
              <path
                d="M 360 280
                   C 360 380, 320 460, 260 580
                   L 540 580
                   C 480 460, 440 380, 440 280
                   Z"
                fill="url(#trunkWood)"
              />
              {/* Branch Left */}
              <path
                d="M 370 290 C 310 270, 240 260, 190 280 C 230 300, 320 310, 365 330 Z"
                fill="#78350F"
              />
              {/* Branch Right */}
              <path
                d="M 430 290 C 490 270, 560 260, 610 280 C 570 300, 480 310, 435 330 Z"
                fill="#78350F"
              />

              {/* Tree Foliage Clusters */}
              <g className="animate-rustle">
                {/* Background dark canopy */}
                <circle cx="280" cy="190" r="130" fill="#15803D" opacity="0.85" />
                <circle cx="520" cy="190" r="130" fill="#15803D" opacity="0.85" />
                <circle cx="400" cy="120" r="140" fill="#166534" opacity="0.9" />

                {/* Main lush green canopy masses */}
                <circle cx="240" cy="220" r="110" fill="url(#canopyTop)" />
                <circle cx="560" cy="220" r="110" fill="url(#canopyTop)" />
                <circle cx="340" cy="140" r="130" fill="url(#canopyTop)" />
                <circle cx="460" cy="140" r="130" fill="url(#canopyTop)" />
                <circle cx="400" cy="200" r="150" fill="url(#canopyTop)" />

                {/* Front highlight leaf tufts */}
                <circle cx="320" cy="180" r="80" fill="#4ADE80" opacity="0.4" />
                <circle cx="480" cy="180" r="80" fill="#4ADE80" opacity="0.4" />
                <circle cx="400" cy="120" r="70" fill="#86EFAC" opacity="0.4" />
              </g>
            </svg>
          </div>
        </div>

        {/* Layer 3: Hanging Fruits on Branches (Gently swaying) */}
        <div className="absolute inset-0 pointer-events-none">
          {hangingFruits.map((hf, i) => (
            <div
              key={hf.id}
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 animate-sway hover:scale-110 transition-transform cursor-pointer"
              style={{
                left: `${hf.xPercent}%`,
                top: `${hf.yPercent}%`,
                transform: `scale(${hf.scale})`,
                animationDelay: `${(i % 5) * 0.7}s`,
              }}
              onClick={(e) => {
                // Clicking a hanging fruit drops or harvests it!
                handleFruitClick(
                  {
                    id: hf.id,
                    type: hf.type,
                    startX: hf.xPercent,
                    currentY: hf.yPercent,
                    speed: 0.2,
                    swayAmp: 3,
                    swayFreq: 0.02,
                    swayPhase: 0,
                    rotation: 0,
                    rotationSpeed: 0,
                    scale: hf.scale,
                  },
                  e.clientX,
                  e.clientY
                );
                // Replace with fresh hanging fruit after a short while
                setHangingFruits((prev) =>
                  prev.map((item) =>
                    item.id === hf.id
                      ? {
                          ...item,
                          id: `hang-new-${fruitIdCounter.current++}`,
                          type: gameMode === 'target_apple' ? 'apple' : (['apple', 'banana', 'kiwi'] as FruitType[])[Math.floor(Math.random() * 3)],
                        }
                      : item
                  )
                );
              }}
              title={`点击采摘 ${VOCAB_DATA[hf.type].word}`}
            >
              <FruitGraphic type={hf.type} size={52} />
            </div>
          ))}
        </div>

        {/* Layer 4: Falling Fruits (Dynamic, Animated with varying speed & sway) */}
        <div className="absolute inset-0 pointer-events-none">
          {fallingFruits.map((fruit) => {
            // Calculate horizontal sinusoidal sway
            const swayX = Math.sin(fruit.currentY * fruit.swayFreq + fruit.swayPhase) * fruit.swayAmp;
            const currentX = fruit.startX + swayX;

            return (
              <div
                key={fruit.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFruitClick(fruit, e.clientX, e.clientY);
                }}
                className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 active:scale-95 filter drop-shadow-lg"
                style={{
                  left: `${currentX}%`,
                  top: `${fruit.currentY}%`,
                  transform: `scale(${fruit.scale}) rotate(${fruit.rotation}deg)`,
                }}
                title={`点击消除 ${VOCAB_DATA[fruit.type].word} 并听发音`}
              >
                {/* Visual pulse glow for target fruit */}
                {(gameMode === 'target_apple' && fruit.type === 'apple') ||
                (gameMode === 'target_challenge' && fruit.type === currentTargetFruit) ? (
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-white/40 blur-xs animate-ping pointer-events-none" />
                    <FruitGraphic type={fruit.type} size={64} />
                  </div>
                ) : (
                  <FruitGraphic type={fruit.type} size={60} />
                )}
              </div>
            );
          })}
        </div>

        {/* Layer 5: Floating Scores and Encouragement Texts */}
        {floatingScores.map((scoreItem) => (
          <div
            key={scoreItem.id}
            className="fixed pointer-events-none font-fun font-extrabold text-xl sm:text-2xl drop-shadow-md z-40 transition-all transform -translate-x-1/2 animate-out fade-out slide-out-to-top duration-1000"
            style={{
              left: `${scoreItem.x}px`,
              top: `${scoreItem.y}px`,
              color: scoreItem.color,
            }}
          >
            {scoreItem.text}
          </div>
        ))}

        {/* Layer 6: Bottom Harvest Basket Counter & Meadow Garden */}
        <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none flex items-end justify-between px-4 sm:px-8 pb-3">
          {/* Left: Little Harvest Basket Card */}
          <div className="pointer-events-auto bg-white/90 backdrop-blur-md rounded-2xl p-3 border-2 border-amber-200 shadow-lg flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-amber-50 border border-amber-200 shrink-0">
              <img
                src={BASKET_IMG}
                alt="Fruit basket"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="text-xs text-amber-900 font-bold font-fun">
                课堂收获篮 (Harvest Basket)
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm font-fun font-semibold mt-1">
                <span className="flex items-center gap-1 text-rose-600">
                  <span>🍎</span>
                  <span>Apple: {harvestCounts.apple}</span>
                </span>
                <span className="flex items-center gap-1 text-amber-600">
                  <span>🍌</span>
                  <span>Banana: {harvestCounts.banana}</span>
                </span>
                <span className="flex items-center gap-1 text-lime-700">
                  <span>🥝</span>
                  <span>Kiwi: {harvestCounts.kiwi}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Speech Repetition Teacher Tool */}
          <div className="pointer-events-auto hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl border-2 border-amber-200 shadow-lg">
            <span className="text-xs text-slate-500 font-semibold px-2">单词快听：</span>
            {(['apple', 'banana', 'kiwi'] as FruitType[]).map((ft) => (
              <button
                key={ft}
                type="button"
                onClick={() => {
                  soundManager.playPop();
                  soundManager.speakEnglishWord(VOCAB_DATA[ft].word);
                }}
                className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-fun font-bold text-xs border border-amber-200 cursor-pointer transition-transform active:scale-95 flex items-center gap-1"
              >
                <span>{ft === 'apple' ? '🍎' : ft === 'banana' ? '🍌' : '🥝'}</span>
                <span>{VOCAB_DATA[ft].word}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Active Word Pop-up Modal when eliminated */}
      {activePopupVocab && (
        <WordPopupCard
          vocab={activePopupVocab.vocab}
          pointsAwarded={activePopupVocab.points}
          combo={activePopupVocab.combo}
          onClose={() => setActivePopupVocab(null)}
        />
      )}

      {/* 5. Teacher Flashcard & Classroom Reading Modal */}
      <TeacherVocabModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        initialType={currentTargetFruit}
      />
    </div>
  );
};
