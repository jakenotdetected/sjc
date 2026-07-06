import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';

export const DoodleCharacter: React.FC<{ type: string }> = ({ type }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Progress of the drawing animation (0 to 1)
  // We want it to finish drawing at 80% of the video duration, then stay drawn.
  const drawProgress = interpolate(
    frame,
    [0, Math.floor(durationInFrames * 0.8)],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Dash array length for drawing effect
  const pathLength = 1000;
  const dashOffset = pathLength * (1 - drawProgress);

  const sketchStyle: React.CSSProperties = {
    fill: 'none',
    stroke: '#1a1a1a', // pencil color
    strokeWidth: 3,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeDasharray: pathLength,
    strokeDashoffset: dashOffset,
  };

  // Helper to render multiple overlapping paths to look "sketchy"
  const renderSketchyPath = (d: string, seed: number) => {
    return (
      <g>
        <path d={d} style={sketchStyle} opacity={0.8} />
        <path d={d} style={{ ...sketchStyle, strokeWidth: 1.5, stroke: '#444' }} opacity={0.6} transform={`translate(${seed * 2}, ${seed * -1}) rotate(${seed})`} />
        <path d={d} style={{ ...sketchStyle, strokeWidth: 1, stroke: '#666' }} opacity={0.4} transform={`translate(${seed * -2}, ${seed * 2}) rotate(${-seed})`} />
      </g>
    );
  };

  // A stick figure student character
  const StudentDoodle = (
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
      {/* Head */}
      {renderSketchyPath("M100 40 A20 20 0 1 0 100 41", 1)}
      {/* Body */}
      {renderSketchyPath("M100 60 Q95 100 100 130", 2)}
      {/* Arms reading a book */}
      {renderSketchyPath("M100 80 Q70 85 60 100 Q80 110 100 105", 3)}
      {renderSketchyPath("M100 80 Q130 85 140 100 Q120 110 100 105", 1.5)}
      {/* Book */}
      {renderSketchyPath("M80 110 L100 105 L120 110 L120 90 L100 85 L80 90 Z", 2.5)}
      {/* Legs */}
      {renderSketchyPath("M100 130 Q80 160 70 190", 1.2)}
      {renderSketchyPath("M100 130 Q120 160 130 190", 2.2)}
    </svg>
  );

  // A stick figure counsellor character
  const CounsellorDoodle = (
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
      {/* Head */}
      {renderSketchyPath("M100 40 A20 20 0 1 0 100 41", 1)}
      {/* Body */}
      {renderSketchyPath("M100 60 Q105 100 100 130", 2)}
      {/* Arms reaching out */}
      {renderSketchyPath("M100 80 Q60 70 40 90", 3)}
      {renderSketchyPath("M100 80 Q140 70 160 90", 1.5)}
      {/* Legs */}
      {renderSketchyPath("M100 130 Q80 160 70 190", 1.2)}
      {renderSketchyPath("M100 130 Q120 160 130 190", 2.2)}
      {/* Heart */}
      {renderSketchyPath("M40 90 A10 10 0 0 1 60 90 A10 10 0 0 1 80 90 Q80 110 60 130 Q40 110 40 90", 1)}
    </svg>
  );

  // A tree (growth/wellness)
  const TreeDoodle = (
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
      {/* Trunk */}
      {renderSketchyPath("M90 190 Q90 120 100 100 Q110 120 110 190", 1)}
      {/* Branches & Leaves */}
      {renderSketchyPath("M100 110 Q70 80 50 60 A40 40 0 0 1 100 20 A40 40 0 0 1 150 60 Q130 80 100 110", 2)}
      {renderSketchyPath("M100 110 Q70 50 100 40 Q130 50 100 110", 1.5)}
    </svg>
  );

  const getDoodle = () => {
    switch (type) {
      case 'counsellor': return CounsellorDoodle;
      case 'tree': return TreeDoodle;
      case 'student': default: return StudentDoodle;
    }
  };

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
      {getDoodle()}
    </AbsoluteFill>
  );
};
