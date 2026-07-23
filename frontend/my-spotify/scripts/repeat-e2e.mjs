import { spawnSync } from 'node:child_process';
import process from 'node:process';

function parseArgs(argv) {
  const args = { framework: 'playwright', repeat: 3, browser: 'electron', specs: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--framework') {
      args.framework = argv[index + 1];
      index += 1;
    } else if (arg === '--repeat') {
      args.repeat = Number(argv[index + 1]);
      index += 1;
    } else if (arg === '--browser') {
      args.browser = argv[index + 1];
      index += 1;
    } else if (arg === '--spec') {
      args.specs.push(argv[index + 1]);
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/repeat-e2e.mjs --framework playwright|cypress --repeat 3 --spec <path> [--spec <path>] [--browser electron]\n`);
}

function buildCommand(args) {
  if (args.framework === 'cypress') {
    const command = ['npx', 'cypress', 'run'];
    if (args.specs.length) {
      command.push('--spec', args.specs.join(','));
    }
    command.push('--browser', args.browser);
    return command;
  }

  const command = ['npx', 'playwright', 'test'];
  if (args.specs.length) {
    command.push(...args.specs);
  }
  command.push('--reporter=list');
  return command;
}

function run() {
  const args = parseArgs(process.argv.slice(2));
  const repeatCount = Number.isInteger(args.repeat) && args.repeat > 0 ? args.repeat : 3;

  if (!['playwright', 'cypress'].includes(args.framework)) {
    console.error('Framework must be either playwright or cypress.');
    process.exit(1);
  }

  const command = buildCommand({ ...args, repeat: repeatCount });
  const label = args.framework === 'cypress' ? 'Cypress' : 'Playwright';

  console.log(`${label} stability run: ${repeatCount} iterations`);

  let failures = 0;

  for (let iteration = 1; iteration <= repeatCount; iteration += 1) {
    console.log(`\n[${label}] Iteration ${iteration}/${repeatCount}`);
    const result = spawnSync(command[0], command.slice(1), {
      stdio: 'inherit',
      shell: false,
      cwd: process.cwd(),
    });

    if (result.status !== 0) {
      failures += 1;
      console.error(`\n[${label}] Iteration ${iteration} failed.`);
    } else {
      console.log(`\n[${label}] Iteration ${iteration} passed.`);
    }
  }

  if (failures > 0) {
    console.error(`\n${label} stability check failed: ${failures}/${repeatCount} iterations failed.`);
    process.exit(1);
  }

  console.log(`\n${label} stability check passed: all ${repeatCount} iterations succeeded.`);
}

run();
