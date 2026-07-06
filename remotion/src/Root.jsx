const { Composition } = require('remotion');
const { MentalWellness } = require('./MentalWellness');

exports.RemotionRoot = () => (
  <Composition
    id="MentalWellness"
    component={MentalWellness}
    durationInFrames={4 * 80}
    fps={30}
    width={1280}
    height={720}
  />
);
