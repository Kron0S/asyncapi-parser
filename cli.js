#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const packageInfo = require('./package.json');
const parse = require('./lib/parser').parse;
const fs = require('fs')
const util = require('util')

const fs_writeFilePromise = util.promisify(fs.writeFile)

const red = text => `\x1b[31m${text}\x1b[0m`;
const magenta = text => `\x1b[35m${text}\x1b[0m`;
const yellow = text => `\x1b[33m${text}\x1b[0m`;
const green = text => `\x1b[32m${text}\x1b[0m`;

const resolveDir = dir => path.resolve(dir);

const showErrorAndExit = err => {
  console.error(red('Something went wrong:'));
  console.error(red(err.stack || err.message));
  process.exit(1);
};

program
  .version(packageInfo.version, '-v, --version')
  .option('-o, --output <outputFile>', 'File where to put the spec', resolveDir, 'spec.yaml')
  .option('-i, --input <inputDir>', 'directory where source code are located', resolveDir, './')
  .option('-r, --regexp <regexp>', '', '\/\*\* @asyncApi.*?\*\/')
  .parse(process.argv);


async function prep({output, input, regexp}) {
	try {
		const spec = await parse({input, regexp})
		await fs_writeFilePromise(output, spec);
	} catch(err) {
		showErrorAndExit(err);
	}
	console.log(green('Done!'));
	console.log(yellow('Check out your shiny new generated file at ') + magenta(output) + yellow('.'));
}

prep(program)

process.on('unhandledRejection', showErrorAndExit);
