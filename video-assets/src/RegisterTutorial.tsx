import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const RegisterTutorial: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 15], [50, 0], { extrapolateRight: 'clamp' });

  const cursorX = spring({ frame: frame - 30, fps, config: { damping: 12 } }) * 300 - 150;
  const cursorY = spring({ frame: frame - 30, fps, config: { damping: 12 } }) * 200 - 100;
  
  const clickScale = interpolate(frame, [60, 65, 70], [1, 0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const btnColor = frame > 65 ? '#7a1818' : '#c9a84c';

  return (
    <AbsoluteFill style={{ backgroundColor: '#faf6ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"DM Sans", sans-serif' }}>
      <h1 style={{ position: 'absolute', top: 120, fontSize: 80, color: '#7a1818', opacity: titleOpacity, transform: `translateY(${titleY}px)`, fontWeight: 700 }}>
        How to Register
      </h1>

      {/* Mock UI elements */}
      <div style={{ position: 'relative', width: 600, height: 400, backgroundColor: 'white', borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 400, height: 40, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 20 }} />
        <div style={{ width: 400, height: 40, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 40 }} />
        
        <div style={{ padding: '20px 60px', backgroundColor: btnColor, color: 'white', borderRadius: 12, fontSize: 32, fontWeight: 'bold', transform: `scale(${clickScale})`, transition: 'background-color 0.1s' }}>
          {frame > 65 ? 'Registered!' : 'Register Now'}
        </div>

        {/* Cursor */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(${cursorX}px, ${cursorY}px)`, zIndex: 10 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#222" stroke="white" strokeWidth="2">
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};
