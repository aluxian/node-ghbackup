#!/usr/bin/env node

const cp = require('child_process');
const chalk = require('chalk');
const yargs = require('yargs');
const GitHub = require('github');

const argv = yargs
  .option('accessToken', {describe: 'Personal access token', required: true})
  .option('visibility', {choices: ['all', 'public', 'private']})
  .option('affiliation', {choices: ['owner', 'collaborator', 'organization_member']})
  .option('type', {choices: ['all', 'owner', 'public', 'private', 'member']})
  .option('mirror', {describe: 'Pass --mirror to git clone', default: false})
  .help()
  .argv;

const github = new GitHub({Promise});
github.authenticate({type: 'token', token: argv.accessToken});

main().catch(err => {
  setTimeout(() => {
    throw err;
  });
});

async function main () {
  log('collecting repositories ...');
  const repos = await collectAll();

  log('cloning ' + repos.length + ' repositories ...');
  const success = await cloneAll(repos);

  if (success) {
    log('backup complete');
  } else {
    log('backup failed');
  }
}

async function collectAll () {
  const opts = {
    per_page: 100
  };

  if (argv.visibility) opts.visibility = argv.visibility;
  if (argv.affiliation) opts.affiliation = argv.affiliation;
  if (argv.type) opts.type = argv.type;

  let res = await github.repos.getAll(opts);
  let repos = [].concat(res.data);

  let page = 1;
  log('collected page ' + page);

  while (github.hasNextPage(res)) {
    res = await github.getNextPage(res);
    repos = repos.concat(res.data);

    page++;
    log('collected page ' + page);
  }

  return repos;
}

async function cloneAll (repos) {
  for (const repo of repos) {
    log('=== ' + repo.full_name + ' ===');

    if (argv.mirror) {
      const cloned = await git(['clone', '--mirror', repo.ssh_url, repo.full_name + '.git'], {stdio: 'inherit'});
      if (!cloned) return false;
    } else {
      const cloned = await git(['clone', repo.ssh_url, repo.full_name], {stdio: 'inherit'});
      if (!cloned) return false;
    }
  }

  return true;
}

function git (args, opts) {
  return new Promise((resolve, reject) => {
    cp.spawn('git', args, opts).on('close', (code) => {
      process.exitCode = code;
      resolve(code === 0);
    });
  });
}

function log (msg) {
  console.log(chalk.green(msg));
}
