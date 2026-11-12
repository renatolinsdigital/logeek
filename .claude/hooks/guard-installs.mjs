#!/usr/bin/env node
// PreToolUse hook for Bash and PowerShell. A command that would bring something
// new into the project or onto the machine (a package, a CLI, a container image,
// a clone, a script from the web) stops at a permission prompt, so nothing is
// installed or downloaded without the user's yes. The assistant still asks in
// chat first, with its reasons (.claude/rules/ask-first.md): this is the backstop.
//
// Restoring what a committed manifest already declares passes: `npm ci`,
// `npm install` with no package name, `docker compose up`, `docker build`.
// The hook only ever asks, never denies, and stays silent when it cannot parse.

import fs from 'node:fs';
import path from 'node:path';

const NPM_INSTALL_ALIASES = new Set([
  'install', 'i', 'in', 'ins', 'inst', 'insta', 'instal',
  'isnt', 'isnta', 'isntal', 'isntall', 'add',
]);
const FLAGS_WITH_VALUES = new Set([
  '--prefix', '-w', '--workspace', '--registry', '--omit', '--include', '--tag',
  '--loglevel', '--cache', '--userconfig', '--filter', '-F', '--dir', '-C', '--cwd',
  '--save-prefix', '--install-strategy', '-p', '--package',
]);
const PREFIX_WORDS = new Set(['sudo', 'time', 'env', 'nohup', 'command']);
const OS_PACKAGE_MANAGERS = new Set([
  'winget', 'choco', 'scoop', 'brew', 'apt', 'apt-get', 'dnf', 'yum', 'pacman',
  'snap', 'zypper', 'apk', 'port',
]);
const OS_CHANGE_WORDS = new Set(['install', 'upgrade', 'add', 'reinstall', 'update']);

const PIPE_TO_SHELL = [
  /\b(curl|wget|iwr|irm|invoke-webrequest|invoke-restmethod)\b[^\n]*\|\s*(sudo\s+)?(sh|bash|zsh|dash|pwsh|powershell|iex|invoke-expression)\b/i,
  /\b(iex|invoke-expression)\b[^\n]*\b(irm|iwr|invoke-restmethod|invoke-webrequest|downloadstring)\b/i,
  /<\(\s*(curl|wget)\b/i,
];

function readPayload() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return null;
  }
}

// Splits on unquoted &&, ||, |, &, ; and newlines: each part runs as a command
// of its own, so `cd web && npm install zod` is judged on its second half.
function splitCommandSegments(command) {
  const segments = [];
  let current = '';
  let openQuote = null;
  for (const character of command) {
    if (openQuote) {
      current += character;
      if (character === openQuote) openQuote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      openQuote = character;
      current += character;
      continue;
    }
    if ('\n;|&'.includes(character)) {
      segments.push(current);
      current = '';
      continue;
    }
    current += character;
  }
  segments.push(current);
  return segments.map((segment) => segment.trim()).filter(Boolean);
}

function tokenize(segment) {
  const tokens = segment.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
  return tokens.map((token) => token.replace(/^(["'])(.*)\1$/, '$2'));
}

function programName(token) {
  const baseName = token.split(/[\\/]/).pop().toLowerCase();
  return baseName.replace(/\.(cmd|exe|ps1|bat)$/, '');
}

function dropPrefixes(tokens) {
  let firstCommandIndex = 0;
  while (
    firstCommandIndex < tokens.length &&
    (/^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[firstCommandIndex]) ||
      PREFIX_WORDS.has(tokens[firstCommandIndex]))
  ) {
    firstCommandIndex++;
  }
  return tokens.slice(firstCommandIndex);
}

function positionalArguments(argumentsList) {
  const positional = [];
  for (let argumentIndex = 0; argumentIndex < argumentsList.length; argumentIndex++) {
    const argument = argumentsList[argumentIndex];
    if (/^\d*>>?$/.test(argument) || argument === '<') {
      argumentIndex++;
      continue;
    }
    if (/^\d*>/.test(argument) || argument.startsWith('<')) continue;
    if (argument.startsWith('-')) {
      if (FLAGS_WITH_VALUES.has(argument)) argumentIndex++;
      continue;
    }
    positional.push(argument);
  }
  return positional;
}

function packageBinaryName(packageSpec) {
  return packageSpec.replace(/(.)@[^/]*$/, '$1').split('/').pop();
}

function hasLocalBinary(binaryName, directories) {
  return directories.some((directory) =>
    ['', '.cmd', '.exe', '.ps1'].some((extension) =>
      fs.existsSync(path.join(directory, 'node_modules', '.bin', binaryName + extension)),
    ),
  );
}

function classifyPackageRunner(program, argumentsList, directories) {
  const explicitPackage = argumentsList.some(
    (argument) => argument === '-p' || argument === '--package' || argument.startsWith('--package='),
  );
  const [packageSpec] = positionalArguments(argumentsList);
  if (!packageSpec) return null;
  if (!explicitPackage && hasLocalBinary(packageBinaryName(packageSpec), directories)) return null;
  return `downloads and runs ${packageSpec} through ${program}, which is not installed in this project`;
}

function classifyDocker(program, subcommand, rest, argumentsList) {
  if (subcommand === 'pull') return `pulls a container image (${program} pull)`;
  if (subcommand === 'run' || subcommand === 'create') {
    return `may pull a container image no committed file declares (${program} ${subcommand})`;
  }
  if (subcommand === 'compose' && rest[0] === 'pull') return 'pulls container images (compose pull)';
  if (subcommand === 'plugin' && rest[0] === 'install') return `installs a ${program} plugin`;
  const isBuild = subcommand === 'build' || (subcommand === 'buildx' && rest[0] === 'build');
  if (isBuild && argumentsList.includes('--pull')) return 'pulls fresh base images (build --pull)';
  return null;
}

function classifySegment(tokens, directories) {
  const [rawProgram, ...argumentsList] = dropPrefixes(tokens);
  if (!rawProgram) return null;
  const program = programName(rawProgram);
  const [rawSubcommand = '', ...rest] = positionalArguments(argumentsList);
  const subcommand = rawSubcommand.toLowerCase();
  const lowerArguments = argumentsList.map((argument) => argument.toLowerCase());

  switch (program) {
    case 'npm':
      if (NPM_INSTALL_ALIASES.has(subcommand)) {
        return rest.length ? `adds npm packages: ${rest.join(' ')}` : null;
      }
      if (['update', 'up', 'upgrade'].includes(subcommand)) return 'updates npm packages';
      if (['exec', 'x', 'create'].includes(subcommand)) {
        return `downloads and runs ${rest[0] ?? 'a package'} (npm ${subcommand})`;
      }
      if (subcommand === 'init' && rest.length) return `runs the initializer ${rest[0]}, which npm downloads`;
      if (subcommand === 'audit' && rest[0] === 'fix') return 'changes installed versions (npm audit fix)';
      return null;
    case 'pnpm':
      if (subcommand === 'add') return `adds packages: ${rest.join(' ')}`;
      if (['update', 'up', 'upgrade'].includes(subcommand)) return 'updates packages';
      if (['dlx', 'create'].includes(subcommand)) return `downloads and runs ${rest[0] ?? 'a package'} (pnpm ${subcommand})`;
      return null;
    case 'yarn':
      if (subcommand === 'add' || (subcommand === 'global' && rest[0] === 'add')) return 'adds packages (yarn add)';
      if (['up', 'upgrade', 'upgrade-interactive'].includes(subcommand)) return 'updates packages';
      if (['dlx', 'create'].includes(subcommand)) return `downloads and runs ${rest[0] ?? 'a package'} (yarn ${subcommand})`;
      return null;
    case 'bun':
      if (['add', 'a'].includes(subcommand)) return `adds packages: ${rest.join(' ')}`;
      if (['install', 'i'].includes(subcommand) && rest.length) return `adds packages: ${rest.join(' ')}`;
      if (['update', 'x', 'create'].includes(subcommand)) return `downloads or updates packages (bun ${subcommand})`;
      return null;
    case 'npx':
    case 'pnpx':
    case 'bunx':
      return classifyPackageRunner(program, argumentsList, directories);
    case 'ng':
      return ['add', 'update', 'new'].includes(subcommand) ? `installs packages (ng ${subcommand})` : null;
    case 'nest':
      return ['new', 'add'].includes(subcommand) ? `installs packages (nest ${subcommand})` : null;
    case 'vue':
    case 'sv':
      return ['add', 'create'].includes(subcommand) ? `installs packages (${program} ${subcommand})` : null;
    case 'pip':
    case 'pip3':
      return ['install', 'download'].includes(subcommand) ? `installs Python packages (pip ${subcommand})` : null;
    case 'python':
    case 'python3':
    case 'py': {
      const moduleIndex = argumentsList.indexOf('-m');
      const isPipInstall =
        moduleIndex >= 0 && argumentsList[moduleIndex + 1] === 'pip' && argumentsList[moduleIndex + 2] === 'install';
      return isPipInstall ? 'installs Python packages (python -m pip install)' : null;
    }
    case 'uv':
      if (subcommand === 'add' || (['pip', 'tool'].includes(subcommand) && rest[0] === 'install')) {
        return `installs Python packages (uv ${subcommand})`;
      }
      return null;
    case 'uvx':
    case 'pipx':
      return `downloads and runs Python tools (${program})`;
    case 'cargo':
      return ['install', 'add'].includes(subcommand) ? `installs Rust crates (cargo ${subcommand})` : null;
    case 'go':
      return ['install', 'get'].includes(subcommand) ? `downloads Go modules (go ${subcommand})` : null;
    case 'gem':
      return subcommand === 'install' ? 'installs Ruby gems' : null;
    case 'composer':
      return subcommand === 'require' ? 'adds PHP packages (composer require)' : null;
    case 'dotnet':
      if ((subcommand === 'add' && rest.includes('package')) || (subcommand === 'tool' && rest[0] === 'install')) {
        return 'adds .NET packages or tools';
      }
      return null;
    case 'git':
      if (subcommand === 'clone') return 'clones a repository';
      if (subcommand === 'submodule' && ['add', 'update'].includes(rest[0])) return 'downloads a submodule';
      return null;
    case 'gh':
      if (subcommand === 'repo' && rest[0] === 'clone') return 'clones a repository';
      if (subcommand === 'release' && rest[0] === 'download') return 'downloads release files';
      if (subcommand === 'extension' && rest[0] === 'install') return 'installs a gh extension';
      return null;
    case 'degit':
    case 'tiged':
    case 'giget':
      return 'downloads a repository template';
    case 'curl':
      if (
        argumentsList.some(
          (argument) => /^-[a-zA-Z]*[oO]/.test(argument) || /^--(output|remote-name)/.test(argument),
        )
      ) {
        return 'downloads a file (curl)';
      }
      return null;
    case 'wget': {
      const writesToStandardOutput = argumentsList.some((argument, argumentIndex) =>
        /^-[a-zA-Z]*O-$|^--output-document=-$/.test(argument) ||
        (/^-[a-zA-Z]*O$/.test(argument) && argumentsList[argumentIndex + 1] === '-'),
      );
      return writesToStandardOutput ? null : 'downloads a file (wget)';
    }
    case 'invoke-webrequest':
    case 'iwr':
    case 'invoke-restmethod':
    case 'irm':
      return lowerArguments.includes('-outfile') ? `downloads a file (${program} -OutFile)` : null;
    case 'start-bitstransfer':
      return 'downloads a file (Start-BitsTransfer)';
    case 'install-module':
    case 'install-package':
    case 'install-script':
      return `installs PowerShell software (${program})`;
    case 'docker':
    case 'podman':
      return classifyDocker(program, subcommand, rest, argumentsList);
    case 'docker-compose':
      return subcommand === 'pull' ? 'pulls container images (compose pull)' : null;
    case 'code':
      return lowerArguments.includes('--install-extension') ? 'installs a VS Code extension' : null;
    case 'claude':
      if (subcommand === 'plugin' && ['install', 'marketplace'].includes(rest[0])) return 'installs a Claude Code plugin';
      if (subcommand === 'mcp' && rest[0] === 'add') return 'connects a new MCP server';
      return null;
    default:
      if (
        OS_PACKAGE_MANAGERS.has(program) &&
        lowerArguments.some((argument) => OS_CHANGE_WORDS.has(argument) || /^-s/.test(argument))
      ) {
        return `changes software on this machine (${program})`;
      }
      return null;
  }
}

function findInstallReasons(command, directories) {
  const reasons = [];
  if (PIPE_TO_SHELL.some((pattern) => pattern.test(command))) {
    reasons.push('runs a script downloaded from the web');
  }
  for (const segment of splitCommandSegments(command)) {
    const reason = classifySegment(tokenize(segment), directories);
    if (reason && !reasons.includes(reason)) reasons.push(reason);
  }
  return reasons;
}

const payload = readPayload();
const command = payload?.tool_input?.command;
if (typeof command === 'string') {
  const directories = [payload.cwd, process.env.CLAUDE_PROJECT_DIR].filter(Boolean);
  const reasons = findInstallReasons(command, directories);
  if (reasons.length) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'ask',
          permissionDecisionReason: `Ask first (.claude/rules/ask-first.md): this command ${reasons.join('; ')}. Approve only what you already agreed to.`,
        },
      }),
    );
  }
}
