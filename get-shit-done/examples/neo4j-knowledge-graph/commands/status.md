---
name: neo4j:status
description: Check Neo4j service status and connection
allowed-tools: [Bash]
---

<process>
Check the status of the Neo4j knowledge graph service.

1. Check if Docker container is running:
   `docker ps --filter "name=gsd-neo4j" --format "{{.Status}}"`

2. If running, test connection:
   `curl -s -o /dev/null -w "%{http_code}" http://localhost:7474`

3. Report status:
   - Container running/stopped
   - HTTP status (200 = healthy)
   - Port availability (7474 web, 7687 bolt)
</process>
