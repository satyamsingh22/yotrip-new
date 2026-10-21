/** Package destination prefill for homepage destination cards. */
export type DestinationPackagePreset = {
  name: string;
  country: string;
};

export const HOME_DESTINATION_PACKAGES = {
  dubai: { name: "Dubai", country: "AE" },
  istanbul: { name: "Istanbul", country: "TR" },
  maldives: { name: "Maldives", country: "MV" },
  kualaLumpur: { name: "Kuala Lumpur", country: "MY" },
} as const satisfies Record<string, DestinationPackagePreset>;
