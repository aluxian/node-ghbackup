# ghbackup

Back up ALL your GitHub repositories.

[![NPM](https://nodei.co/npm/ghbackup.png)](https://nodei.co/npm/ghbackup/)

## Installation

```
$ npm install -g ghbackup
$ cd /my/backups/
$ ghbackup --accessToken 123 --mirror
```

## Usage

```
Options:
  --accessToken  Personal access token                                [required]
  --mirror       Pass --mirror to git clone                     [default: false]
  --help         Show help                                             [boolean]
```

A username is not required because it's included in the access token.

## Requirements

* `git` should be installed already

## License

MIT
