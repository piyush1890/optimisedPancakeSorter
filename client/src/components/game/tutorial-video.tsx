import { type FC } from "react";

interface TutorialVideoProps {
  level: number;
}

export const TutorialVideo: FC<TutorialVideoProps> = ({ level }) => {
  // This is a placeholder video URL - will be replaced later
  const dummyVideoUrl = "https://example.com/tutorial-video.mp4";
  
  return (
    <div className="fixed bottom-4 right-4 w-64 rounded-lg overflow-hidden shadow-lg">
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="w-full"
      >
        <source src={dummyVideoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};
