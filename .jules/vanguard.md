# Vanguard Journal

## Critical Learnings
- **2026-01-15**: Discovered that hardcoded security hashes (SHA-256) are often accompanied by cleartext password comments during development, which may survive into production if not explicitly audited. Always perform a grep for specific hash strings and adjacent comments during security scans.
- **2026-03-09**: Performance optimization: Static configuration objects or arrays (like sidebar navigation items) defined inside React components cause unnecessary re-allocations and can trigger re-renders of children. Always move these to the module scope or wrap them in `useMemo` if they depend on props.
