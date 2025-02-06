import { type FC } from "react";

interface TutorialVideoProps {
  level: number;
}

export const TutorialVideo: FC<TutorialVideoProps> = ({ level }) => {
  // This is a temporary placeholder video
  const placeholderVideo = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  return (
    <div className="fixed bottom-4 right-4 w-64 bg-black/80 rounded-lg overflow-hidden shadow-xl z-50">
      <div className="p-2 bg-black/90">
        <h3 className="text-sm font-medium text-white">Tutorial: Level {level}</h3>
      </div>
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="w-full"
        style={{ maxHeight: "180px", objectFit: "cover" }}
      >
        <source src={placeholderVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};