/**
 * Which way to face.
 *
 * The number is the answer; the dial just makes it readable at a glance — a
 * fixed bearing from north, which is what a paper qibla card has always given.
 */

type Props = {
  degrees: number;
  point: string;
  placeLabel: string;
};

const TICKS = [
  { label: "N", angle: 0 },
  { label: "E", angle: 90 },
  { label: "S", angle: 180 },
  { label: "W", angle: 270 },
];

const QiblaCompass = ({ degrees, point, placeLabel }: Props) => {
  return (
    <div className="hl-qibla">
      <div className="hl-qibla-dial-wrap">
        <div className="hl-qibla-dial" data-testid="qibla-dial">
          {TICKS.map((tick) => (
            <span
              key={tick.label}
              className="hl-qibla-tick"
              style={{ transform: `rotate(${tick.angle}deg)` }}
            >
              <em style={{ transform: `rotate(${-tick.angle}deg)` }}>{tick.label}</em>
            </span>
          ))}

          <span
            className="hl-qibla-needle"
            data-testid="qibla-needle"
            style={{ transform: `rotate(${degrees}deg)` }}
          />
        </div>
      </div>

      <div className="hl-qibla-read">
        <div className="hl-qibla-deg" data-testid="qibla-reading">
          {degrees}° <span className="hl-qibla-point">{point}</span>
        </div>
        <p>
          Face {degrees}° from north to face the Kaaba from {placeLabel}.
        </p>
      </div>
    </div>
  );
};

export default QiblaCompass;
