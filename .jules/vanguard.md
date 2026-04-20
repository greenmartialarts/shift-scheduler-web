# Vanguard Journal

## Critical Learnings
- **2026-01-15**: Discovered that hardcoded security hashes (SHA-256) are often accompanied by cleartext password comments during development, which may survive into production if not explicitly audited. Always perform a grep for specific hash strings and adjacent comments during security scans.
- **2026-04-20**: For UI components with dynamic navigation (e.g. `EventSidebar`), always move static path configurations outside the component and use `useMemo` for derived URLs to prevent referential identity changes that trigger expensive sidebar re-renders.
