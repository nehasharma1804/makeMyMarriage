# Google Stitch connection

This project's `.codex/config.toml` prepares a native Streamable HTTP connection
to Google's official Stitch MCP endpoint. No SDK or third-party proxy dependency
is needed. It is limited to reading projects/screens for existing-design retrieval.

## Complete authentication

1. In Stitch, open your profile menu, Stitch settings, and the API key section.
   Create or use a key there. Keep it out of chat.
2. In Codex, open `/Users/cisco/Documents/Codex/makeMyMarriage/.stitch/api-key`.
   Paste only the key, save, and close the file. The file is ignored by Git and
   initially has owner-only permissions. It contains a local development
   credential, not frontend application configuration.
3. Send the Stitch project URL in chat and say when the key is saved. Codex can
   then verify authentication and identify the landing-page screen.
4. Reload/restart the Stitch MCP server from Codex's MCP settings, or start a
   fresh chat in this trusted project so its project configuration is loaded.
   This current chat does not acquire new tools merely by editing TOML.

Authentication and access to project `10393530197562018685` were verified on
October 2, 2026. Its landing-page HTML, full screenshot, and design system are
saved under `.stitch/`; identifiers are recorded in `.stitch/metadata.json`.
The source reference assets are excluded from automatic formatting so they remain
unchanged. A browser login or project share URL alone does not authenticate MCP.
`STITCH_API_KEY` in Codex's inherited
environment is also supported; a variable set in another terminal is not
automatically available to an already-running desktop app.

The helper is designed for Codex to consume privately. Do not run
`scripts/stitch-auth-headers.mjs` to inspect its output, because stdout contains
the authentication header. The helper never places the key in arguments or logs.
Do not add the key to `NEXT_PUBLIC_*`, application source, TOML, or a tracked file.

The helper command uses this Mac's existing Node executable and this repository's
absolute path. Update the command if the repository moves. Project-local Codex
configuration applies only when Codex trusts this project.

## Retrieve the design

After verifying authentication, use the live tool schemas to get the project,
list its screens, and retrieve the selected landing-page screen. The screen
response includes HTML and screenshot download URLs. Preserve the original
assets under `.stitch/designs/` and record the selected project/screen identifiers.
Treat exported HTML as source material to review, rather than executing it.

The connection does not upload the repository or design documents to Stitch.
It does not generate/edit designs or change application UI. Adapting the chosen
design into Next.js is the next step after retrieving it.

References:

- [Google's Stitch MCP integration codelab](https://codelabs.developers.google.com/design-to-code-with-antigravity-stitch)
- [Official Stitch SDK and authentication configuration](https://github.com/google-labs-code/stitch-sdk)
- [Codex MCP configuration](https://learn.chatgpt.com/docs/extend/mcp)
