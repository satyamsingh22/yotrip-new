export interface CarMediaItem {
  type?: string | null;
  url?: string | null;
  width?: number | null;
  height?: number | null;
}

const IMAGE_TYPE_PRIORITY = [
  "EXTRALARGE",
  "LARGE",
  "MEDIUM",
  "SMALL",
  "THUMBNAIL",
];

/** Sabre VCMP serves both http and https; force https for mixed-content safety. */
export const normalizeCarImageUrl = (url?: string | null): string | null => {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  // Local placeholders are not real supplier photos — treat as missing.
  if (
    trimmed.startsWith("/assets/") ||
    trimmed.includes("/assets/img/cars/")
  ) {
    return null;
  }
  try {
    const parsed = new URL(trimmed);
    if (
      parsed.protocol === "http:" &&
      parsed.hostname.toLowerCase() === "vcmp-cars.sabre.com"
    ) {
      parsed.protocol = "https:";
      return parsed.toString();
    }
    return trimmed;
  } catch {
    return trimmed;
  }
};

/** API / shared-model photo only — null when supplier sent no image. */
export const getCarDisplayImageUrl = (vehicle?: {
  display?: {
    imageUrl?: string | null;
    fallbackAssetUrl?: string | null;
    isFallbackImage?: boolean;
  } | null;
  car?: {
    images?: CarMediaItem[];
    class?: string | null;
    typeLabel?: string | null;
  };
} | null): string | null => {
  if (vehicle?.display?.isFallbackImage) return null;

  const displayUrl = normalizeCarImageUrl(vehicle?.display?.imageUrl);
  if (displayUrl) return displayUrl;

  const apiImage = vehicle?.car?.images?.find(
    (img) => img.url && img.type !== "FALLBACK",
  );
  return normalizeCarImageUrl(apiImage?.url);
};

export const vehicleHasApiImage = (vehicle?: {
  display?: {
    imageUrl?: string | null;
    isFallbackImage?: boolean;
  } | null;
  car?: { images?: CarMediaItem[] };
} | null): boolean => Boolean(getCarDisplayImageUrl(vehicle));

/** Keep relative order, but push listings without supplier photos to the end. */
export const sortVehiclesImagesFirst = <T extends {
  display?: { imageUrl?: string | null; isFallbackImage?: boolean } | null;
  car?: { images?: CarMediaItem[] };
}>(
  vehicles: T[],
): T[] => {
  if (vehicles.length < 2) return vehicles;
  const withImage: T[] = [];
  const withoutImage: T[] = [];
  for (const vehicle of vehicles) {
    if (vehicleHasApiImage(vehicle)) withImage.push(vehicle);
    else withoutImage.push(vehicle);
  }
  return [...withImage, ...withoutImage];
};

export const isLocalStaticCarImage = (url: string) =>
  url.startsWith("/assets/img/cars/") || url.includes("/assets/img/cars/");

const isVideoUrl = (url: string, type?: string | null) => {
  const normalizedType = (type || "").toUpperCase();
  if (normalizedType.includes("VIDEO")) return true;
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
};

export const resolveCarGalleryImages = (
  images: CarMediaItem[] = [],
  fallbackUrl?: string | null,
): string[] => {
  const videos: string[] = [];
  const bestByBase = new Map<string, { url: string; priority: number }>();

  images.forEach((image) => {
    const url = normalizeCarImageUrl(image.url)?.trim();
    if (!url) return;

    if (isVideoUrl(url, image.type)) {
      videos.push(url);
      return;
    }

    const type = (image.type || "MEDIUM").toUpperCase();
    const priority = IMAGE_TYPE_PRIORITY.indexOf(type);
    const baseKey = url.split("?")[0];
    const existing = bestByBase.get(baseKey);
    const nextPriority = priority === -1 ? IMAGE_TYPE_PRIORITY.length : priority;

    if (!existing || nextPriority < existing.priority) {
      bestByBase.set(baseKey, { url, priority: nextPriority });
    }
  });

  const gallery = [...bestByBase.values()]
    .sort((a, b) => a.priority - b.priority)
    .map((item) => item.url);

  if (gallery.length) return gallery;
  const normalizedFallback = normalizeCarImageUrl(fallbackUrl);
  if (normalizedFallback) return [normalizedFallback];
  return [];
};

/** Prefer API images only — empty gallery when supplier sent none. */
export const resolveCarGalleryFromVehicle = (
  vehicle?: {
    display?: {
      imageUrl?: string | null;
      fallbackAssetUrl?: string | null;
      isFallbackImage?: boolean;
    } | null;
    car?: {
      images?: CarMediaItem[];
      class?: string | null;
      typeLabel?: string | null;
    };
  } | null,
): string[] => {
  if (vehicle?.display?.isFallbackImage) return [];

  const sabreImages = (vehicle?.car?.images || []).filter(
    (img) => img.url && img.type !== "FALLBACK",
  );
  const gallery = resolveCarGalleryImages(
    sabreImages,
    vehicle?.display?.imageUrl,
  );
  if (gallery.length) return gallery;

  const displayUrl = normalizeCarImageUrl(vehicle?.display?.imageUrl);
  return displayUrl ? [displayUrl] : [];
};

export const resolveCarVideos = (images: CarMediaItem[] = []): string[] =>
  images
    .map((image) => ({
      url: normalizeCarImageUrl(image.url)?.trim(),
      type: image.type,
    }))
    .filter((image) => image.url && isVideoUrl(image.url, image.type))
    .map((image) => image.url as string);

export const toLightboxSlides = (images: string[]) =>
  images.map((src) => ({ src }));

export const formatCarMoney = (
  amount?: number | null,
  currency = "USD",
): string => {
  if (amount == null || !Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/** Dev helper: log image availability at list click / details load */
export const logCarImageDebug = (
  stage: "list-click" | "search-result" | "price-check" | "details-resolved",
  payload: {
    id?: string;
    title?: string;
    vendor?: string;
    rateKey?: string | null;
    displayImageUrl?: string | null;
    searchImages?: CarMediaItem[];
    priceCheckImages?: CarMediaItem[];
    resolvedGallery?: string[];
    usingFallback?: boolean;
  },
) => {
  const searchCount = payload.searchImages?.filter((i) => i.url)?.length ?? 0;
  const priceCheckCount =
    payload.priceCheckImages?.filter((i) => i.url)?.length ?? 0;
  const resolvedCount = payload.resolvedGallery?.length ?? 0;
  const hasRealImage =
    Boolean(
      payload.displayImageUrl &&
        !payload.displayImageUrl.includes("/fallback-image") &&
        !isLocalStaticCarImage(payload.displayImageUrl),
    ) ||
    searchCount > 0 ||
    priceCheckCount > 0 ||
    (resolvedCount > 0 &&
      !payload.resolvedGallery?.every((u) => isLocalStaticCarImage(u)));

  const summary = hasRealImage ? "✅ HAS API IMAGE" : "❌ NO API IMAGE (fallback)";

  console.group(
    `%c🚗 Car Image Debug [${stage}] ${summary}`,
    `color: ${hasRealImage ? "#16a34a" : "#dc2626"}; font-weight: bold;`,
  );
  console.log("Vehicle:", payload.title || payload.id || "unknown");
  console.log("Vendor:", payload.vendor || "—");
  console.log("Rate Key:", payload.rateKey || "—");
  console.log("display.imageUrl:", payload.displayImageUrl || "—");
  console.log(
    `Search images: ${searchCount}`,
    payload.searchImages?.length ? payload.searchImages : "none",
  );
  console.log(
    `Price-check images: ${priceCheckCount}`,
    payload.priceCheckImages?.length ? payload.priceCheckImages : "none",
  );
  console.log(
    `Resolved gallery (${resolvedCount}):`,
    payload.resolvedGallery || "—",
  );
  console.log("Using fallback placeholder:", payload.usingFallback ?? !hasRealImage);
  console.groupEnd();
};
