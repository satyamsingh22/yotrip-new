/**
 * Dates carried in from a homepage holiday link.
 *
 * Its own module so the parsing rules can be tested without mounting the search
 * page and its whole context tree.
 *
 * Returns null unless there is a usable future departure date — callers then
 * leave the context defaults alone rather than searching a nonsense range.
 */
export const readDateDeepLink = (
  search: string,
  today: Date,
): { departureDate: string; returnDate: string } | null => {
  const params = new URLSearchParams(search);
  const dep = params.get("dep") || "";
  const ret = params.get("ret") || "";

  const valid = (v: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`))
      ? `${new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10)}` === v
      : false;

  if (!valid(dep)) return null;
  if (Date.parse(`${dep}T00:00:00Z`) < Date.parse(`${today.toISOString().slice(0, 10)}T00:00:00Z`))
    return null;

  const useRet = valid(ret) && Date.parse(`${ret}T00:00:00Z`) >= Date.parse(`${dep}T00:00:00Z`);
  return { departureDate: dep, returnDate: useRet ? ret : "" };
};
