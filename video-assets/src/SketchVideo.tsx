import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, staticFile, spring } from 'remotion';

export const SketchVideo: React.FC<{
  character: string;
}> = ({ character }) => {
  const frame = useCurrentFrame();

  // Floating animation: moves up and down based on a sine wave
  // A cycle every 180 frames (6 seconds at 30fps)
  const floatY = Math.sin((frame / 180) * Math.PI * 2) * 15;
  
  // A gentle rotation
  const rotate = Math.cos((frame / 180) * Math.PI * 2) * 2;

  // Fade in at the start
  const opacity = spring({
    frame,
    fps: 30,
    config: {
      damping: 200,
    },
  });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: 'transparent' }}>
      <Img
        src={staticFile(`characters/${character}.png`)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: `translateY(${floatY}px) rotate(${rotate}deg)`,
          opacity: opacity,
        }}
      />
    </AbsoluteFill>
  );
};
