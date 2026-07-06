import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from "remotion";
import React from "react";

export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#2a0808", color: "white", fontFamily: "sans-serif", display: "flex", justifyContent: "center", alignItems: "center" }}>
      
      {/* Scene 1: 0 - 150 */}
      <Sequence from={0} durationInFrames={150}>
        <Scene1 />
      </Sequence>

      {/* Scene 2: 150 - 300 */}
      <Sequence from={150} durationInFrames={150}>
        <Scene2 />
      </Sequence>

      {/* Scene 3: 300 - 450 */}
      <Sequence from={300} durationInFrames={150}>
        <Scene3 />
      </Sequence>

    </AbsoluteFill>
  );
};

const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const scale = spring({ fps, frame, config: { damping: 12 } });
  const opacity = interpolate(frame, [120, 150], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ display: "flex", justifyContent: "center", alignItems: "center", opacity }}>
      <h1 style={{ fontSize: "80px", textAlign: "center", transform: `scale(${scale})`, color: "#f39c12", textShadow: "0px 4px 15px rgba(0,0,0,0.5)" }}>
        Struggling with stress or anxiety?
      </h1>
      <p style={{ fontSize: "40px", marginTop: "20px", opacity: interpolate(frame, [30, 60], [0, 1]) }}>
        You don't have to face it alone.
      </p>
    </AbsoluteFill>
  );
};

const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const translateY = interpolate(frame, [0, 30], [100, 0], { extrapolateRight: "clamp" });
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [120, 150], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ display: "flex", justifyContent: "center", alignItems: "center", opacity: fadeOut }}>
      <div style={{ transform: `translateY(${translateY}px)`, opacity, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h1 style={{ fontSize: "100px", fontWeight: "bold", margin: 0, color: "#fff" }}>
          SJC Counselling Unit
        </h1>
        <div style={{ width: "200px", height: "8px", backgroundColor: "#f39c12", marginTop: "30px", borderRadius: "4px" }}></div>
        <p style={{ fontSize: "50px", marginTop: "30px", color: "#e8dfc8" }}>
          A safe space for your peace of mind.
        </p>
      </div>
    </AbsoluteFill>
  );
};

const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const scale = spring({ fps, frame, config: { mass: 0.5 } });
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ display: "flex", justifyContent: "center", alignItems: "center", opacity }}>
      <h1 style={{ fontSize: "90px", textAlign: "center", color: "#f39c12", marginBottom: "40px" }}>
        Your mental wellness matters.
      </h1>
      <div style={{ padding: "30px 60px", backgroundColor: "white", color: "#2a0808", borderRadius: "20px", transform: `scale(${scale})`, fontSize: "60px", fontWeight: "bold", boxShadow: "0px 20px 40px rgba(0,0,0,0.5)" }}>
        Book an Appointment Today
      </div>
    </AbsoluteFill>
  );
};
