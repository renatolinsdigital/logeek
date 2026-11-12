#!/usr/bin/env node
// PreToolUse hook. Keeps secrets out of the conversation: reading a secrets
// file (.env, a private key, a credentials file) is denied, and writing one
// asks first. `.env.example` and its kin hold names, not values, and stay open.
// Rule: .claude/rules/security.md.
//
// Shell commands are judged best effort: a reading program (cat, Get-Content,
// grep, node, ...) aimed at a secrets file is denied. Copying or writing one
// is left to the normal permission flow.

import fs from 'node:fs';

const PUBLIC_ENV_VARIANTS = new Set(['example', 'sample', 'template', 'defaults', 'schema', 'dist']);
const READING_PROGRAMS = new Set([
  'cat', 'type', 'more', 'less', 'head', 'tail', 'bat', 'get-content', 'gc', 'sed', 'awk',
  'grep', 'egrep', 'rg', 'findstr', 'select-string', 'sls', 'strings', 'xxd', 'od',
  'hexdump', 'base64', 'source', '.', 'nl', 'tac', 'sort', 'cut', 'jq', 'node', 'python',
  'python3', 'py', 'bun', 'deno', 'import-csv', 'get-item',
]);
const EMBEDDED_PATH = /[\w./\\:-]*\.env[\w.-]*|[\w./\\:-]+\.(pem|key|p12|pfx|jks|keystore|ppk)\b|id_(rsa|dsa|ecdsa|ed25519)\b|[\w./\\:-]*credentials\.json/gi;

function readPayload() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return null;
  }
}

function isSecretPath(filePath) {
  if (typeof filePath !== 'string' || !filePath) return false;
  const name = filePath.split(/[\\/]/).pop().toLowerCase();
  const envFile = name.match(/^\.env(?:\.(.+))?$/);
  if (envFile) return !PUBLIC_ENV_VARIANTS.has((envFile[1] ?? '').split('.').pop());
  if (/^[\w-]+\.env$/.test(name)) return true;
  if (/\.(pem|key|p12|pfx|jks|keystore|ppk)$/.test(name)) return true;
  if (/^id_(rsa|dsa|ecdsa|ed25519)$/.test(name)) return true;
  if (/^(\.netrc|\.pgpass|credentials)$/.test(name)) return true;
  return /(^|[-_.])credentials\.json$/.test(name) || /^service-account.*\.json$/.test(name);
}

function splitCommandSegments(command) {
  return command
    .split(/&&|\|\||[|;&\n]/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function shellCommandReadsSecret(command) {
  return splitCommandSegments(command).some((segment) => {
    const tokens = segment.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
    const program = (tokens[0] ?? '').replace(/^["']|["']$/g, '').split(/[\\/]/).pop().toLowerCase();
    const isReader = READING_PROGRAMS.has(program.replace(/\.(exe|cmd)$/, '')) || tokens.includes('<');
    if (!isReader) return false;
    const candidates = segment.match(EMBEDDED_PATH) ?? [];
    return candidates.some((candidate) => isSecretPath(candidate.replace(/^["']|["']$/g, '')));
  });
}

function decide(toolName, toolInput) {
  switch (toolName) {
    case 'Read':
      return isSecretPath(toolInput.file_path) ? 'deny' : null;
    case 'Grep':
      return isSecretPath(toolInput.path) || isSecretPath(toolInput.glob) ? 'deny' : null;
    case 'Edit':
    case 'Write':
    case 'MultiEdit':
      return isSecretPath(toolInput.file_path) ? 'ask' : null;
    case 'Bash':
    case 'PowerShell':
      return typeof toolInput.command === 'string' && shellCommandReadsSecret(toolInput.command)
        ? 'deny'
        : null;
    default:
      return null;
  }
}

const payload = readPayload();
const decision = payload ? decide(payload.tool_name, payload.tool_input ?? {}) : null;
if (decision) {
  const reason =
    decision === 'deny'
      ? 'Secrets stay out of the conversation (.claude/rules/security.md). Read .env.example for the variable names; if a task needs a real value, ask the user to set it.'
      : 'This writes a secrets file. Approve only if you asked for it; real values are better typed by you.';
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: decision,
        permissionDecisionReason: reason,
      },
    }),
  );
}
