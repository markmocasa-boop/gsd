---
trigger: post-research
---

<process>
After research phase completion, index discovered concepts into the knowledge graph.

1. Read research summary from .planning/phases/{phase}/research/
2. Extract key concepts, relationships, and decisions
3. Create Cypher statements to add nodes and edges
4. Execute against Neo4j to persist the knowledge

This enables future research phases to query prior discoveries.
</process>
