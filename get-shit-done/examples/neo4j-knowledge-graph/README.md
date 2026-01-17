# neo4j-knowledge-graph

A knowledge graph plugin for GSD that captures research data and enables semantic querying across projects. Built on Neo4j, this plugin demonstrates complex plugin patterns including Docker services and lifecycle hooks.

## Prerequisites

- Docker Desktop or Docker Engine installed
- `docker compose` command available
- Ports 7474 (web) and 7687 (bolt) available

## Installation

```bash
gsd plugin install ./neo4j-knowledge-graph
```

The plugin will automatically start the Neo4j container on installation.

## Starting the Service

If the service is not running:

```bash
cd ~/.claude/neo4j-knowledge-graph/docker
docker compose up -d
```

Wait approximately 30 seconds for Neo4j to initialize before running commands.

## Commands

| Command | Description |
|---------|-------------|
| `/neo4j:query <cypher>` | Execute a Cypher query against the knowledge graph |
| `/neo4j:status` | Check Neo4j service status and connection health |

## Usage

### Check Service Status

```
/neo4j:status
```

Verifies that:
- Docker container is running
- Neo4j HTTP endpoint is responding
- Both web (7474) and bolt (7687) ports are available

### Query the Knowledge Graph

```
/neo4j:query MATCH (n) RETURN n LIMIT 10
```

Executes a Cypher query and returns the results. Common queries:

```cypher
# Find all concepts
MATCH (c:Concept) RETURN c.name, c.description

# Find relationships between concepts
MATCH (a:Concept)-[r]->(b:Concept) RETURN a.name, type(r), b.name

# Find concepts discovered in a specific project
MATCH (p:Project {name: 'my-project'})-[:DISCOVERED]->(c:Concept) RETURN c
```

## Hook Behavior

### post-research Hook

After any research phase completes, this plugin automatically:
1. Reads the research summary from `.planning/phases/{phase}/research/`
2. Extracts key concepts and their relationships
3. Indexes them into the knowledge graph

This builds a persistent knowledge base that reduces future research costs by surfacing relevant prior discoveries.

## Architecture

```
neo4j-knowledge-graph/
├── plugin.json           # Plugin manifest with services config
├── commands/
│   ├── query.md         # Cypher query command
│   └── status.md        # Service health check
├── hooks/
│   └── post-research.md # Automatic research indexing
└── docker/
    └── docker-compose.yml # Neo4j container definition
```

## Troubleshooting

### Container Not Starting

```bash
# Check container logs
docker logs gsd-neo4j

# Verify ports are available
lsof -i :7474
lsof -i :7687
```

### Connection Refused

1. Wait 30-60 seconds after starting for Neo4j to initialize
2. Check container status: `docker ps --filter "name=gsd-neo4j"`
3. Verify health: `curl http://localhost:7474`

### Reset Data

To clear all knowledge graph data:

```bash
cd ~/.claude/neo4j-knowledge-graph/docker
docker compose down -v
docker compose up -d
```

## Default Credentials

- Username: `neo4j`
- Password: `gsd-knowledge`

Access the Neo4j Browser at http://localhost:7474

## Uninstallation

```bash
gsd plugin uninstall neo4j-knowledge-graph
```

This will stop the container and remove all data volumes.
