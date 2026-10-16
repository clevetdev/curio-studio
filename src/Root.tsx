import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import timeline from "../public/timeline.json";

export const Root: React.FC = () => (
  <Composition id="Short" component={Video} width={1080} height={1920}
    fps={timeline.fps} durationInFrames={timeline.durationInFrames} />
);
