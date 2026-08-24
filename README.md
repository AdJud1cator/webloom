# WebLoom

**A programmable web testbed for importing, snapshotting, modifying, and serving test websites to test website change detection tools.**

WebLoom provides a controlled environment for reproducing real-world website changes and testing whether monitoring and change-detection systems can reliably identify them.

## Why WebLoom?

Testing a website change detection tool against live websites is difficult. Real websites change unpredictably, making it hard to know exactly what changed and whether the expected change was detected.

WebLoom aims to solve this by allowing developers to:

- Import pages from real websites as snapshots
- Create and manage collections of test pages
- Modify saved HTML and page content
- Add, remove, and modify URLs
- Create controlled website change scenarios
- Serve modified pages through predictable URLs
- Test change detection against known changes
- Run the same test environment locally or as a deployed service

The goal is to make website change detection **repeatable, controllable, and testable**.
