/**
 * Optional capability implemented by local repositories that ship with seed
 * data (e.g. market benchmarks). Deliberately NOT part of the public
 * repository interfaces UI/hook code depends on — a future ApiBenchmarkRepository
 * simply never implements this, since seeding becomes a server-side concern.
 */
export interface ISeedable {
  seedIfEmpty(): Promise<void>;
}
