import React, { useState } from 'react';
import { HeroText } from '@/features/entry/components/HeroText';
import { EnterLab } from '@/features/entry/components/EnterLab';
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';

export function IntroNode() {
  const [scrambleComplete, setScrambleComplete] = useState(false);
  const setIntroAnimationFinished = useCanvasStore(state => state.setIntroAnimationFinished);

  return (
    <div className="w-[100vw] h-[100vh] flex flex-col items-center justify-center relative pointer-events-none">
      <HeroText onScrambleComplete={() => setScrambleComplete(true)} />
      
      {scrambleComplete && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full flex justify-center">
          <EnterLab onAnimationComplete={() => setIntroAnimationFinished(true)} />
        </div>
      )}
    </div>
  );
}
