import "@testing-library/jest-dom";
import "../i18n";

// jsdom does not implement matchMedia. Several page components pull in
// react-slick (via enquire.js), which calls matchMedia at module-load time,
// so any test that imports those components transitively needs this stub.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// jsdom in this setup exposes a `localStorage` object with no methods on it, so
// any code that persists a preference throws rather than silently no-opping.
// Install a real in-memory Storage when the methods are missing; guarded on
// behaviour rather than presence, since the object itself does exist.
if (typeof globalThis.localStorage?.setItem !== "function") {
  const createStorage = (): Storage => {
    let entries = new Map<string, string>();

    return {
      get length() {
        return entries.size;
      },
      key: (index: number) => [...entries.keys()][index] ?? null,
      getItem: (key: string) => (entries.has(key) ? entries.get(key)! : null),
      setItem: (key: string, value: string) => {
        entries.set(key, String(value));
      },
      removeItem: (key: string) => {
        entries.delete(key);
      },
      clear: () => {
        entries = new Map();
      },
    } as Storage;
  };

  for (const name of ["localStorage", "sessionStorage"] as const) {
    Object.defineProperty(globalThis, name, {
      value: createStorage(),
      configurable: true,
      writable: true,
    });
  }
}

// jsdom does not implement canvas rendering (no HTMLCanvasElement.getContext
// without the optional "canvas" native package). Some page components load
// lottie-web animations that grab a 2D context at module-load time; give
// them a harmless stub so import doesn't throw.
//
// Unlike matchMedia, jsdom *does* define getContext — it just returns null
// (logging "Not implemented") rather than being absent — so the guard has to
// probe behaviour, not presence, before installing the stub.
if (typeof HTMLCanvasElement !== "undefined") {
  let hasWorkingContext = false;
  try {
    hasWorkingContext = !!document.createElement("canvas").getContext("2d");
  } catch {
    hasWorkingContext = false;
  }

  if (!hasWorkingContext) {
    // A Proxy avoids having to enumerate every Canvas2D method lottie-web
    // happens to call at animation-init time (fillRect, save, translate, ...);
    // any unknown property reads back as a no-op function, any known data
    // property (fillStyle, etc.) just stores/returns the assigned value.
    const stubContext = new Proxy(
      {},
      {
        get: (target: Record<string, unknown>, prop) =>
          prop in target ? target[prop as string] : () => {},
        set: (target: Record<string, unknown>, prop, value) => {
          target[prop as string] = value;
          return true;
        },
      }
    );
    // @ts-expect-error -- intentionally minimal stub, not a full CanvasRenderingContext2D
    HTMLCanvasElement.prototype.getContext = () => stubContext;
  }
}

// jsdom does not define a global `CSS` object at all (it's a browser API,
// not part of the DOM spec jsdom implements), so `CSS.escape` — used by
// flightList.tsx's scroll-anchor restore effect to build an attribute
// selector from a flight key that can contain arbitrary characters — throws
// a ReferenceError the moment that effect actually runs with a real anchor.
// This is a real CSSOM API every shipping browser implements, so the polyfill
// below is the spec algorithm (https://drafts.csswg.org/cssom/#serialize-an-identifier),
// not a stand-in for behaviour the app doesn't otherwise rely on.
if (typeof globalThis.CSS === "undefined") {
  const cssEscape = (value: string): string => {
    const string = String(value);
    const length = string.length;
    let result = "";
    let index = -1;
    let codeUnit: number;
    const firstCodeUnit = string.charCodeAt(0);
    while (++index < length) {
      codeUnit = string.charCodeAt(index);
      if (codeUnit === 0x0000) {
        result += "�";
        continue;
      }
      if (
        (codeUnit >= 0x0001 && codeUnit <= 0x001f) ||
        codeUnit === 0x007f ||
        (index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
        (index === 1 &&
          codeUnit >= 0x0030 &&
          codeUnit <= 0x0039 &&
          firstCodeUnit === 0x002d)
      ) {
        result += `\\${codeUnit.toString(16)} `;
        continue;
      }
      if (
        index === 0 &&
        length === 1 &&
        codeUnit === 0x002d
      ) {
        result += `\\${string.charAt(index)}`;
        continue;
      }
      if (
        codeUnit >= 0x0080 ||
        codeUnit === 0x002d ||
        codeUnit === 0x005f ||
        (codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
        (codeUnit >= 0x0041 && codeUnit <= 0x005a) ||
        (codeUnit >= 0x0061 && codeUnit <= 0x007a)
      ) {
        result += string.charAt(index);
        continue;
      }
      result += `\\${string.charAt(index)}`;
    }
    return result;
  };
  // @ts-expect-error -- minimal CSSOM stub, only `escape` is needed anywhere in this app
  globalThis.CSS = { escape: cssEscape };
}
