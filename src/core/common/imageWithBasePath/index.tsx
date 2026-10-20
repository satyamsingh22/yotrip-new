
// import { img_path} from '../../../environment';

// interface Image {
//   className?: string;
//   src: string;
//   alt?: string;
//   height?: number;
//   width?: number;
//   id?:string;
// }

// const ImageWithBasePath = (props: Image) => {
//   // Combine the base path and the provided src to create the full image source URL
//   const fullSrc = `${img_path}${props.src}`;
//   return (
//     <img
//       style={{height:"auto"}}
//       className={props.className}
//       src={fullSrc}
//       height={props.height}
//       alt={props.alt}
//       width={props.width}
//       id={props.id}
//     />
//   );
// };

// export default ImageWithBasePath;
import { img_path } from '../../../environment';
import type { CSSProperties, ImgHTMLAttributes, SyntheticEvent } from 'react';

interface Image {
  className?: string;
  src?: string | null;
  alt?: string;
  height?: number;
  width?: number;
  id?: string;
  style?: CSSProperties;
  onError?: ImgHTMLAttributes<HTMLImageElement>["onError"];
}

const DEFAULT_IMAGE = "/assets/img/hotels/hotel-thumb-06.jpg";

const ImageWithBasePath = (props: Image) => {
  const rawSrc = props.src?.trim() || DEFAULT_IMAGE;
  // Sabre car CDN is often returned as http:// — upgrade so HTTPS pages can load it.
  const src =
    rawSrc.startsWith("http://vcmp-cars.sabre.com/")
      ? `https://${rawSrc.slice("http://".length)}`
      : rawSrc;
  const isExternal =
    src.startsWith("http://") || src.startsWith("https://");

  const fullSrc = isExternal ? src : `${img_path}${src}`;

  const handleError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    if (props.onError) {
      props.onError(e);
      return;
    }
    if (e.currentTarget.src !== DEFAULT_IMAGE) {
      e.currentTarget.src = `${img_path}${DEFAULT_IMAGE}`;
    }
  };

  return (
    <img
      style={{ height: "auto", ...props.style }}
      className={props.className}
      src={fullSrc}
      height={props.height}
      alt={props.alt}
      width={props.width}
      id={props.id}
      onError={handleError}
    />
  );
};

export default ImageWithBasePath;
