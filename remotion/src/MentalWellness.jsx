const { useCurrentFrame, useVideoConfig, interpolate, spring } = require('remotion');

const FPS = 30;
const SCENE_DURATION = 80;

const SCENES = [
  {
    eyebrow: 'ST. JOSEPH\'S COLLEGE · ANURADHAPURA',
    headline: 'Your Mental\nWellness Matters.',
    sub: null,
    cta: null,
  },
  {
    eyebrow: 'CONFIDENTIAL · FREE · COMPASSIONATE',
    headline: 'Struggling with\nstress or anxiety?',
    sub: "You don't have to face it alone.\nOur counsellors are here for you.",
    cta: null,
  },
  {
    eyebrow: 'COUNSELLING & CAREER GUIDANCE UNIT',
    headline: 'Not sure about\nyour career path?',
    sub: 'We help every Josephian discover their\nstrengths, talents, and ambitions.',
    cta: null,
  },
  {
    eyebrow: 'TAKE THE FIRST STEP',
    headline: 'Request an\nAppointment.',
    sub: 'Visit us at the Counselling Unit or book online.\nOne conversation can change everything.',
    cta: 'cgu.jakenetwork.xyz/appointments',
    accent: true,
  },
];

// Seeded pseudo-random
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function Particle({ x, y, size, delay }) {
  const frame = useCurrentFrame();
  const t = ((frame + delay) % 200) / 200;
  const posY = y - t * 110;
  const alpha = Math.sin(t * Math.PI) * 0.4;
  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${posY}%`,
      width: size,
      height: size,
      borderRadius: '50%',
      background: '#c9a84c',
      opacity: alpha,
      filter: `blur(${size * 0.4}px)`,
    }} />
  );
}

function Scene({ eyebrow, headline, sub, cta, accent, startFrame }) {
  const frame = useCurrentFrame();
  const local = frame - startFrame;

  if (local < 0 || local >= SCENE_DURATION) return null;

  const opacity = interpolate(local, [0, 18, SCENE_DURATION - 18, SCENE_DURATION], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const slideY  = interpolate(local, [0, 22], [28, 0], { extrapolateRight: 'clamp' });
  const eyeY    = interpolate(local, [0, 28], [14, 0], { extrapolateRight: 'clamp' });
  const subOp   = interpolate(local, [18, 38], [0, 1], { extrapolateRight: 'clamp' });
  const ctaOp   = interpolate(local, [30, 48], [0, 1], { extrapolateRight: 'clamp' });
  const ctaScale= interpolate(local, [30, 48], [0.88, 1], { extrapolateRight: 'clamp' });

  const lines = headline.split('\n');

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity,
      padding: '0 100px',
      textAlign: 'center',
    }}>
      {/* Eyebrow */}
      <div style={{
        fontFamily: 'system-ui, sans-serif',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: 'rgba(201,168,76,0.7)',
        marginBottom: 28,
        transform: `translateY(${eyeY}px)`,
        opacity,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{ width: 28, height: 1.5, background: 'rgba(201,168,76,0.5)' }} />
        {eyebrow}
        <div style={{ width: 28, height: 1.5, background: 'rgba(201,168,76,0.5)' }} />
      </div>

      {/* Headline */}
      <div style={{ transform: `translateY(${slideY}px)` }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: accent ? 102 : 92,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: accent ? '#c9a84c' : (i === lines.length - 1 ? '#e8c46a' : '#f5ede0'),
            display: 'block',
            textShadow: '0 4px 32px rgba(0,0,0,0.5)',
          }}>{line}</div>
        ))}
      </div>

      {/* Sub */}
      {sub && (
        <div style={{
          marginTop: 24,
          opacity: subOp,
          transform: `translateY(${interpolate(local, [18, 38], [10, 0], { extrapolateRight: 'clamp' })}px)`,
        }}>
          {sub.split('\n').map((line, i) => (
            <div key={i} style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: 20,
              color: 'rgba(255,255,255,0.62)',
              lineHeight: 1.7,
            }}>{line}</div>
          ))}
        </div>
      )}

      {/* CTA pill */}
      {cta && (
        <div style={{
          marginTop: 36,
          opacity: ctaOp,
          transform: `scale(${ctaScale})`,
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 32px',
            borderRadius: 50,
            border: '1.5px solid rgba(201,168,76,0.6)',
            background: 'rgba(201,168,76,0.12)',
            backdropFilter: 'blur(4px)',
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#c9a84c',
              boxShadow: '0 0 8px rgba(201,168,76,0.8)',
            }} />
            <span style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: 16,
              color: '#c9a84c',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}>{cta}</span>
          </div>
        </div>
      )}
    </div>
  );
}

exports.MentalWellness = () => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const totalFrames = SCENES.length * SCENE_DURATION;

  const rand = seededRand(77);
  const particles = Array.from({ length: 24 }, () => ({
    x: rand() * 100,
    y: 55 + rand() * 60,
    size: 4 + rand() * 8,
    delay: rand() * 200,
  }));

  const pulse = Math.sin(frame * 0.035) * 0.5 + 0.5;

  // Progress bar at very bottom
  const progress = frame / totalFrames;

  return (
    <div style={{ width, height, position: 'relative', overflow: 'hidden', background: '#0d0202' }}>
      {/* BG gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 70% at 50% 42%, #220606 0%, #0d0202 75%)',
      }} />

      {/* Gold ambient glow */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '44%',
        transform: 'translate(-50%,-50%)',
        width: 800, height: 500,
        borderRadius: '50%',
        background: `radial-gradient(ellipse, rgba(201,168,76,${0.04 + pulse * 0.05}) 0%, transparent 70%)`,
        filter: 'blur(60px)',
      }} />

      {/* Maroon vignette corners */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 110% 110% at 50% 50%, transparent 40%, rgba(80,5,5,0.55) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Particles */}
      {particles.map((p, i) => <Particle key={i} {...p} />)}

      {/* Scenes */}
      {SCENES.map((scene, i) => (
        <Scene key={i} {...scene} startFrame={i * SCENE_DURATION} />
      ))}


      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: 'rgba(255,255,255,0.08)',
      }}>
        <div style={{
          width: `${progress * 100}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #7a1818, #c9a84c)',
          transition: 'none',
        }} />
      </div>
    </div>
  );
};
