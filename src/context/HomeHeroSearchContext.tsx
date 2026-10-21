import {
  createContext,
  useCallback,
  useContext,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { all_routes } from "../feature-module/router/all_routes";
import type { DestinationPackagePreset } from "../utils/destinationPackagePresets";
import {
  homePackageDestinationPath,
  homeSearchPath,
  type HomeSearchFocus,
  type HomeSearchTab,
} from "../utils/homeSearchDeepLink";

export type HomeHeroSearchRequest = {
  tab: HomeSearchTab;
  focus?: HomeSearchFocus;
  packageDestination?: DestinationPackagePreset;
};

type HomeHeroSearchContextValue = {
  focusSearch: (request: HomeHeroSearchRequest) => void;
};

const HomeHeroSearchContext = createContext<HomeHeroSearchContextValue | null>(
  null,
);

export function HomeHeroSearchProvider({
  focusSearch,
  children,
}: {
  focusSearch: (request: HomeHeroSearchRequest) => void;
  children: ReactNode;
}) {
  return (
    <HomeHeroSearchContext.Provider value={{ focusSearch }}>
      {children}
    </HomeHeroSearchContext.Provider>
  );
}

export function isHomeHeroPath(pathname: string): boolean {
  return pathname === all_routes.home1 || pathname === "/";
}

/** Homepage cards/tiles: scroll to hero, switch tab, open field — without full navigation when already on home. */
export function useHomeHeroSearch() {
  const ctx = useContext(HomeHeroSearchContext);
  const navigate = useNavigate();
  const location = useLocation();

  const go = useCallback(
    (tab: HomeSearchTab, focus?: HomeSearchFocus) => {
      if (isHomeHeroPath(location.pathname) && ctx) {
        ctx.focusSearch({ tab, focus });
        return;
      }
      navigate(homeSearchPath(tab, focus));
    },
    [ctx, location.pathname, navigate],
  );

  const goFromClick = useCallback(
    (
      e: MouseEvent<HTMLAnchorElement>,
      tab: HomeSearchTab,
      focus?: HomeSearchFocus,
    ) => {
      if (isHomeHeroPath(location.pathname) && ctx) {
        e.preventDefault();
        ctx.focusSearch({ tab, focus });
      }
    },
    [ctx, location.pathname],
  );

  const goPackageDestination = useCallback(
    (
      e: MouseEvent<HTMLAnchorElement> | null,
      destination: DestinationPackagePreset,
    ) => {
      const request: HomeHeroSearchRequest = {
        tab: "packages",
        packageDestination: destination,
      };
      if (isHomeHeroPath(location.pathname) && ctx) {
        e?.preventDefault();
        ctx.focusSearch(request);
        return;
      }
      if (e) {
        // Off home: let Link navigate unless we need programmatic nav
        return;
      }
      navigate(homePackageDestinationPath(destination));
    },
    [ctx, location.pathname, navigate],
  );

  const goPackageDestinationFromClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, destination: DestinationPackagePreset) => {
      goPackageDestination(e, destination);
    },
    [goPackageDestination],
  );

  return { go, goFromClick, goPackageDestinationFromClick };
}
