/**
 * Per-page title, description and social tags.
 *
 * The app is a client-rendered SPA with a single static `<title>Yotrip</title>`,
 * so every route currently shares one identity and shared links show no preview
 * card at all. This writes real tags on mount and takes them back down on
 * unmount, which fixes sharing outright and makes a page eligible for
 * JS-rendered indexing. It is not a substitute for prerendering.
 */

import { useEffect } from "react";

type Props = {
  title: string;
  description: string;
  /** Path only, e.g. "/halal" — the origin is filled in at runtime. */
  canonicalPath: string;
  image?: string;
};

/** Tags we own are marked so we only ever take our own back down. */
const OWNED = "data-page-meta";

const upsertMeta = (attribute: "name" | "property", key: string, value: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    tag.setAttribute(OWNED, "");
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", value);
};

const upsertCanonical = (href: string) => {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute(OWNED, "");
    document.head.appendChild(link);
  }

  link.setAttribute("href", href);
};

const PageMeta = ({ title, description, canonicalPath, image }: Props) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}${canonicalPath}`;

    upsertMeta("name", "description", description);
    upsertCanonical(url);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:url", url);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);

    if (image) {
      upsertMeta("property", "og:image", `${origin}${image}`);
      upsertMeta("name", "twitter:image", `${origin}${image}`);
    }

    return () => {
      document.title = previousTitle;
      document.head.querySelectorAll(`[${OWNED}]`).forEach((node) => node.remove());
    };
  }, [title, description, canonicalPath, image]);

  return null;
};

export default PageMeta;
