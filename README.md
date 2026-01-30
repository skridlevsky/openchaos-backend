# openchaos-backend

Backend infrastructure for [openchaos.dev](https://openchaos.dev). Standalone services that need a persistent process (not serverless).

## Setup

```bash
git clone https://github.com/skridlevsky/openchaos-backend.git
cd openchaos-backend
pnpm install
cp .env.example .env
pnpm dev
```

## Services

| Service | Status | Description |
|---------|--------|-------------|
| MCP Server | live | AI agent access to governance data - [Setup guide](src/mcp/README.md) |
| Visitor Counter | planned | Real-time visitor tracking ([PR #152](https://github.com/skridlevsky/openchaos/pull/152)) |

## Contributing

This repo is maintainer-reviewed. For the democratic codebase, see [openchaos](https://github.com/skridlevsky/openchaos).

## License

MIT
