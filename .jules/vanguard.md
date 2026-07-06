# Vanguard Journal

## Critical Learnings
- **2026-01-15**: Discovered that hardcoded security hashes (SHA-256) are often accompanied by cleartext password comments during development, which may survive into production if not explicitly audited. Always perform a grep for specific hash strings and adjacent comments during security scans.
- **2026-03-09**: Discovered that while previous audit reports claimed to have implemented secure hashing for analytics passwords, the actual implementation was still using cleartext comparisons. Always verify the code implementation of security fixes mentioned in historical audit reports to prevent regressions or false senses of security.
