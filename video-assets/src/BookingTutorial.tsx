import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const BookingTutorial: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 15], [50, 0], { extrapolateRight: 'clamp' });

  const cursorX = spring({ frame: frame - 45, fps, config: { damping: 14 } }) * 200 - 100;
  const cursorY = spring({ frame: frame - 45, fps, config: { damping: 14 } }) * 150 - 50;
  
  const clickScale = interpolate(frame, [80, 85, 90], [1, 0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const boxScale = spring({ frame: frame - 95, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ backgroundColor: '#faf6ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"DM Sans", sans-serif' }}>
      <h1 style={{ position: 'absolute', top: 120, fontSize: 80, color: '#7a1818', opacity: titleOpacity, transform: `translateY(${titleY}px)`, fontWeight: 700 }}>
        Book an Appointment
      </h1>

      {/* Mock UI elements */}
      <div style={{ position: 'relative', width: 600, height: 400, backgroundColor: 'white', borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, overflow: 'hidden' }}>
        
        {frame < 100 ? (
          <>
            <div style={{ width: 400, height: 40, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 20 }} />
            <div style={{ width: 400, height: 80, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 40 }} />
            
            <div style={{ padding: '20px 60px', backgroundColor: '#c9a84c', color: 'white', borderRadius: 12, fontSize: 32, fontWeight: 'bold', transform: `scale(${clickScale})` }}>
              Book Session
            </div>
            
            {/* Cursor */}
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(${cursorX}px, ${cursorY}px)`, zIndex: 10 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="#222" stroke="white" strokeWidth="2">
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
              </svg>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${boxScale})` }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 style={{ fontSize: 40, color: '#15803d', margin: 0 }}>Request Sent!</h2>
            <p style={{ fontSize: 24, color: '#888', marginTop: 10, textAlign: 'center' }}>Counsellor will assign<br/>Date & Time</p>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
