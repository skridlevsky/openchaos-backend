# MCP Server

Model Context Protocol server for OpenChaos governance data.

## Client Configuration

<details>
<summary>Claude Desktop</summary>

Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "openchaos": {
      "command": "node",
      "args": ["-e", "process.stdin.pipe(require('http').request('https://backend.openchaos.dev/mcp', {method:'POST'}, r => r.pipe(process.stdout)))"]
    }
  }
}
```
</details>

<details>
<summary>Claude CLI</summary>

**Using config file:**

Add to `~/.claude/mcp_settings.json`:
```json
{
  "mcpServers": {
    "openchaos": {
      "url": "https://backend.openchaos.dev/mcp"
    }
  }
}
```

**Using command line:**
```bash
claude mcp add openchaos --url https://backend.openchaos.dev/mcp
```
</details>

<details>
<summary>Cursor</summary>

Add to Cursor settings under **Settings > Features > MCP**:
```
Server URL: https://backend.openchaos.dev/mcp
```
</details>

<details>
<summary>OpenAI / ChatGPT</summary>

```bash
mcp add openchaos https://backend.openchaos.dev/mcp
```
</details>

## Tools

- `get_open_prs` - List open PRs (params: limit, minVotes)
- `get_merged_prs` - List merged PRs (params: limit)
- `get_pr_details` - Get PR details (params: prNumber)
- `get_repo_stats` - Repository statistics
- `analyze_pr_competition` - Vote distribution analysis

## Development

Start server:
```bash
pnpm dev
```

Test with inspector:
```bash
npx @modelcontextprotocol/inspector http://localhost:3001/mcp
```
