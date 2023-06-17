#!/usr/bin/env node
import startCommand from './command/start';
import yargs from 'yargs';
import type { TYargs } from './interface';

const cli = (argv = [], cwd = ''): TYargs => {
  const yargsCli = yargs(argv, cwd);
  yargsCli
    .usage('Usage: $0 <command> [options]')
    .demandCommand(
      1,
      'A command is required. Pass --help to see all available commands and options.'
    )
    .recommendCommands()
    .strict();
  return yargsCli;
}

function main() {
  cli()
    .command(startCommand as any)
    .parse(process.argv.slice(2));
}

main();
