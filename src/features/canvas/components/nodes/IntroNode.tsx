import React, { useState } from 'react';
import { HeroText } from '@/features/entry/components/HeroText';
import { EnterLab } from '@/features/entry/components/EnterLab';
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';

export function IntroNode() {
  const [showEnterLab, setShowEnterLab] = useState(false);
  const isIntroAnimationFinished = useCanvasStore(state => state.isIntroAnimationFinished);
  const setIntroAnimationFinished = useCanvasStore(state => state.setIntroAnimationFinished);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
      {!showEnterLab && (
        <HeroText onSequenceComplete={() => setShowEnterLab(true)} />
      )}

      {showEnterLab && !isIntroAnimationFinished && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full flex justify-center">
          <EnterLab onAnimationComplete={() => setIntroAnimationFinished(true)} />
        </div>
      )}
    </div>
  );
}
