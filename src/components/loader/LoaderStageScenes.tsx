import { useEffect } from "react";
import "./loader-stage-scenes.scss";

/** Crossfading storyboard scenes for the search loaders (see loaderStages.ts). */
type Props = { images: string[]; active: number };

const LoaderStageScenes = ({ images, active }: Props) => {
  // Warm the cache so each scene is decoded before its turn (no blank flash).
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  return (
    <div className="lss" aria-hidden="true">
      {images.map((src, i) => (
        <div key={src} className={`lss__stage${i === active ? " is-active" : ""}`}>
          <div className="lss__fill" style={{ backgroundImage: `url(${src})` }} />
          <img className="lss__img" src={src} alt="" draggable={false} />
        </div>
      ))}
    </div>
  );
};

export default LoaderStageScenes;
