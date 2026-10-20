export type PageItem = number | "ellipsis";

const range = (start: number, end: number): number[] => {
  const length = Math.max(end - start + 1, 0);
  return Array.from({ length }, (_, i) => start + i);
};

/**
 * Build a windowed list of page items for a paginator so the number of buttons
 * stays bounded no matter how many pages exist. Long gaps collapse to an
 * "ellipsis" marker, e.g. [1, "ellipsis", 6, 7, 8, "ellipsis", 38].
 *
 * Always keeps the first page, the last page, and `siblingCount` pages on each
 * side of the current page visible.
 */
export const getPaginationRange = (
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): PageItem[] => {
  if (totalPages <= 0) return [];

  // first + last + current + 2*siblings + 2 ellipses
  const totalPageNumbers = siblingCount * 2 + 5;

  // Few enough pages that every one fits — show them all.
  if (totalPageNumbers >= totalPages) {
    return range(1, totalPages);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  // Only show an ellipsis when it hides at least one page (page 2 / page n-1
  // are rendered directly instead of being replaced by "…").
  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  const firstPage = 1;
  const lastPage = totalPages;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount;
    return [...range(1, leftItemCount), "ellipsis", lastPage];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount;
    return [firstPage, "ellipsis", ...range(totalPages - rightItemCount + 1, totalPages)];
  }

  return [
    firstPage,
    "ellipsis",
    ...range(leftSiblingIndex, rightSiblingIndex),
    "ellipsis",
    lastPage,
  ];
};
