# Run from the repository root: source scripts/use-local-node.sh
if [ -x "$PWD/.tools/node-v24.21.0-darwin-arm64/bin/node" ]; then
  export PATH="$PWD/.tools/node-v24.21.0-darwin-arm64/bin:$PATH"
else
  echo 'Project-local Node is missing. Install Node 24.21.0 or use nvm install.'
  return 1
fi
