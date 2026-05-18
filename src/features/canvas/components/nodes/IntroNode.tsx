import React, { useState } from 'react';
import { HeroText } from '@/features/entry/components/HeroText';
import { EnterLab } from '@/features/entry/components/EnterLab';
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';

export function IntroNode() {
  const [showEnterLab, setShowEnterLab] = useState(false);
  const isIntroAnimationFinished = useCanvasStore(state => state.isIntroAnimationFinished);
  const setIntroAnimationFinished = useCanvasStore(state => state.setIntroAnimationFinished);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none overflow-hidden">
      {!showEnterLab && (
        <HeroText onSequenceComplete={() => setShowEnterLab(true)} />
      )}

      {showEnterLab && !isIntroAnimationFinished && (
        <div className="absolute inset-0 z-10 flex justify-center items-center">
          <EnterLab onAnimationComplete={() => setIntroAnimationFinished(true)} />
        </div>
      )}
    </div>
  );
}
