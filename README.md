recall
======

Workspace persistence plugin for Light Table.

## Usage
Recall can now be installed directly via the LT plugin manager with no additional steps.

To install from source:
1. Clone the recall package into your LT plugins directory.

```bash
$ cd /path/to/config/LightTable/plugins && git clone https://github.com/joshuafcole/recall.git
```

2. Download the plugin dependencies via npm.

```bash
$ cd recall && npm install
```


## Changelog
* 0.1.5 Fixes migration for protocol 1..2 #15.
* 0.1.4 Fixes bug in migration system.
* 0.1.3 Adds support for recalling cursor position Fixes #14 - @chenglou.
* 0.1.2 Fixes first run bug where listing saved workspaces failed due to missing workspace dir.
* 0.1.1 Bumps protocol, should migrate automatically, adds support for per-tabset active tabs.
* 0.1.0 Stable release with support for remembering multiple tabsets.
* 0.0.4 Bundle node_modules on release branch to negate the need for dependency installation when using plugin manager.
* 0.0.3 Removal of jQuery dependency
* 0.0.2 Minor cleanup and plugin manager integration.
* 0.0.1 Inital Release

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/joshuafcole/recall/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

