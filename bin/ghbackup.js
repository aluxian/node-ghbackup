#!/usr/bin/env node
const argv = require('yargs')
  .option('username', {required: true, describe: 'GitHub username'})
  .option('token', {required: true, describe: 'GitHub personal access token'})
  .help()
  .argv;

const github = new (require('github'))();
github.authenticate({type: 'token', token: argv.token});

console.log('   ===   collecting repositories ...');
collectAll(function (repos) {
  console.log('   ===   cloning %i repositories ...', repos.length);
  cloneAll(repos, function () {
    console.log('   ===   backup done');
  });
});

function collectAll (callback) {
  let repos = [];
  let page = 1;

  function reposCallback (err, res) {
    if (err) throw err;

    repos = repos.concat(res.data);
    console.log('   ===   collected page %i', page);

    if (github.hasNextPage(res)) {
      page++;
      github.getNextPage(res, reposCallback);
    } else {
      callback(repos);
    }
  }

  github.repos.getAll({per_page: 100}, reposCallback);
}

function cloneAll (repos, callback) {
  let i = 0;

  function clone () {
    if (!repos[i]) {
      return callback();
    }

    console.log();
    const cp = require('child_process');
    const git = cp.spawn('git', ['clone', '--all', repos[i].ssh_url], {stdio: 'inherit'});

    git.on('close', function (code) {
      if (code === 0) {
        i++;
        clone();
      } else {
        console.log();
        process.exitCode = 1;
      }
    });
  }

  clone();
}
