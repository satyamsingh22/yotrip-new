/**
 * What YoTrip's halal mode actually does.
 *
 * The homepage band lists these as six words each; here they get a sentence,
 * because this is the page someone lands on when they want to know whether the
 * claim is real.
 */

import { Link } from "react-router-dom";
import { all_routes } from "@/feature-module/router/all_routes";
import { Mosque } from "@/feature-module/home-one/yt/icons";

const FEATURES = [
  {
    title: "Halal-certified hotels",
    body: "Filter to stays certified by a recognised halal authority — not just ones that happen to have a prayer mat in the wardrobe.",
  },
  {
    title: "Alcohol-free rooms",
    body: "Skip the minibar entirely. We flag properties that keep alcohol out of the room and off the floor.",
  },
  {
    title: "Prayer time alerts",
    body: "Times follow you as you travel, adjusted for wherever you land — not the city you booked from.",
  },
  {
    title: "Halal dining nearby",
    body: "See what you can eat within walking distance of your hotel before you book it, not after you arrive.",
  },
  {
    title: "Qibla at your hotel",
    body: "The bearing from your actual room, worked out from the property's coordinates.",
  },
  {
    title: "Hajj & Umrah packages",
    body: "Flights, stays near the Haram and ground transfers arranged as one trip rather than three bookings.",
  },
];

/**
 * Makkah has no airport — pilgrims fly into Jeddah and travel on by road. The
 * card says so, because landing on a Jeddah search after clicking "Makkah"
 * is only sensible if we told them first.
 */
const DESTINATIONS = [
  { city: "Makkah", iata: "JED", blurb: "Fly into Jeddah, then on to the Haram" },
  { city: "Madinah", iata: "MED", blurb: "Steps from Al-Masjid an-Nabawi" },
  { city: "Istanbul", iata: "IST", blurb: "Where two continents meet" },
  { city: "Dubai", iata: "DXB", blurb: "Halal dining on every corner" },
];

/**
 * Deep-links into flight search. flightList reads `?to=<IATA>` and overrides the
 * destination only, leaving the origin as whatever geo detection resolved — so
 * the code has to be a real airport, not a city name, or the page quietly
 * searches its default route instead.
 */
const flightHref = (iata: string) => `${all_routes.flightList}?to=${iata}`;

const HalalFeatures = () => (
  <>
    <section className="section">
      <div className="wrap">
        <div className="sec-head">
          <span className="sec-eyebrow">An industry first</span>
          <h2>Travel that respects your faith</h2>
          <p>
            Two billion Muslim travellers, and no major booking site truly built for them. Flip one
            switch and everything adapts.
          </p>
        </div>

        <div className="hl-feats">
          {FEATURES.map((feature) => (
            <article className="hl-feat" key={feature.title}>
              <Mosque size={24} />
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="section hl-dest-section">
      <div className="wrap">
        <div className="sec-head">
          <span className="sec-eyebrow">Where travellers go</span>
          <h2>Start with somewhere that gets it right</h2>
        </div>

        <div className="hl-dests">
          {DESTINATIONS.map((destination) => (
            <Link
              className="hl-dest"
              to={flightHref(destination.iata)}
              key={destination.city}
            >
              <strong>{destination.city}</strong>
              <span>{destination.blurb}</span>
            </Link>
          ))}
        </div>

        <div className="hl-cta">
          {/* Home, not a flight search: nothing has been chosen at this point,
              so the visitor should pick their own vertical and route rather
              than land on results for a trip they never asked for. The label
              stays neutral because home offers flights, hotels and cars. */}
          <Link className="btn btn-primary" to={all_routes.home1}>
            Plan your trip
          </Link>
        </div>
      </div>
    </section>
  </>
);

export default HalalFeatures;
