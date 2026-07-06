import "./index.css";
import { Composition } from 'remotion';
import { MyComposition } from './Composition';
import { RegisterTutorial } from './RegisterTutorial';
import { BookingTutorial } from './BookingTutorial';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RegisterTutorial"
        component={RegisterTutorial}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="BookingTutorial"
        component={BookingTutorial}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};
