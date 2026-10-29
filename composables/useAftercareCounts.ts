// raised after a claim or review changes in the console, so the sidebar badges refetch
export const useAftercareCountsStale = () => useState('aftercare-counts-stale', () => 0)
