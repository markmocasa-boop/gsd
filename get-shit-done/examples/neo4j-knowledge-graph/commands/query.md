---
name: neo4j:query
description: Query the knowledge graph with Cypher
argument-hint: "<cypher-query>"
allowed-tools: [Bash, Read]
---

<process>
Execute a Cypher query against the Neo4j knowledge graph.

1. Validate the query syntax
2. Execute against Neo4j at bolt://localhost:7687
3. Format and return results

Use cypher-shell for query execution:
```bash
cypher-shell -u neo4j -p gsd-knowledge "MATCH (n) RETURN n LIMIT 10"
```
</process>
