23:36:36.622 Running build in Washington, D.C., USA (East) – iad1
23:36:36.623 Build machine configuration: 2 cores, 8 GB
23:36:36.808 Retrieving list of deployment files...
23:36:36.813 Previous build caches not available.
23:36:37.356 Downloading 200 deployment files...
23:36:39.355 Running "vercel build"
23:36:40.033 Vercel CLI 51.2.1
23:36:40.328 Warning: Detected "engines": { "node": ">=18.0.0" } in your `package.json` that will automatically upgrade when a new major Node.js Version is released. Learn More: https://vercel.link/node-version
23:36:40.340 Running "install" command: `npm ci`...
23:36:43.245 npm error code EUSAGE
23:36:43.252 npm error
23:36:43.252 npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
23:36:43.252 npm error
23:36:43.252 npm error Invalid: lock file's eslint-config-next@15.1.6 does not satisfy eslint-config-next@15.5.15
23:36:43.253 npm error Invalid: lock file's @next/eslint-plugin-next@15.1.6 does not satisfy @next/eslint-plugin-next@15.5.15
23:36:43.253 npm error
23:36:43.253 npm error Clean install a project
23:36:43.253 npm error
23:36:43.254 npm error Usage:
23:36:43.254 npm error npm ci
23:36:43.254 npm error
23:36:43.254 npm error Options:
23:36:43.254 npm error [--install-strategy <hoisted|nested|shallow|linked>] [--legacy-bundling]
23:36:43.255 npm error [--global-style] [--omit <dev|optional|peer> [--omit <dev|optional|peer> ...]]
23:36:43.255 npm error [--include <prod|dev|optional|peer> [--include <prod|dev|optional|peer> ...]]
23:36:43.255 npm error [--strict-peer-deps] [--foreground-scripts] [--ignore-scripts]
23:36:43.255 npm error [--allow-git <all|none|root>] [--no-audit] [--no-bin-links] [--no-fund]
23:36:43.255 npm error [--dry-run]
23:36:43.255 npm error [-w|--workspace <workspace-name> [-w|--workspace <workspace-name> ...]]
23:36:43.256 npm error [--workspaces] [--include-workspace-root] [--install-links]
23:36:43.256 npm error
23:36:43.256 npm error   --install-strategy
23:36:43.256 npm error     Sets the strategy for installing packages in node_modules.
23:36:43.256 npm error
23:36:43.256 npm error   --legacy-bundling
23:36:43.256 npm error     Instead of hoisting package installs in `node_modules`, install packages
23:36:43.256 npm error
23:36:43.256 npm error   --global-style
23:36:43.256 npm error     Only install direct dependencies in the top level `node_modules`,
23:36:43.256 npm error
23:36:43.256 npm error   --omit
23:36:43.257 npm error     Dependency types to omit from the installation tree on disk.
23:36:43.257 npm error
23:36:43.257 npm error   --include
23:36:43.257 npm error     Option that allows for defining which types of dependencies to install.
23:36:43.257 npm error
23:36:43.257 npm error   --strict-peer-deps
23:36:43.257 npm error     If set to `true`, and `--legacy-peer-deps` is not set, then _any_
23:36:43.257 npm error
23:36:43.257 npm error   --foreground-scripts
23:36:43.257 npm error     Run all build scripts (ie, `preinstall`, `install`, and
23:36:43.257 npm error
23:36:43.257 npm error   --ignore-scripts
23:36:43.257 npm error     If true, npm does not run scripts specified in package.json files.
23:36:43.257 npm error
23:36:43.257 npm error   --allow-git
23:36:43.257 npm error     Limits the ability for npm to fetch dependencies from git references.
23:36:43.258 npm error
23:36:43.258 npm error   --audit
23:36:43.258 npm error     When "true" submit audit reports alongside the current npm command to the
23:36:43.258 npm error
23:36:43.258 npm error   --bin-links
23:36:43.258 npm error     Tells npm to create symlinks (or `.cmd` shims on Windows) for package
23:36:43.258 npm error
23:36:43.258 npm error   --fund
23:36:43.258 npm error     When "true" displays the message at the end of each `npm install`
23:36:43.258 npm error
23:36:43.258 npm error   --dry-run
23:36:43.258 npm error     Indicates that you don't want npm to make any changes and that it should
23:36:43.258 npm error
23:36:43.258 npm error   -w|--workspace
23:36:43.258 npm error     Enable running a command in the context of the configured workspaces of the
23:36:43.258 npm error
23:36:43.258 npm error   --workspaces
23:36:43.259 npm error     Set to true to run the command in the context of **all** configured
23:36:43.259 npm error
23:36:43.259 npm error   --include-workspace-root
23:36:43.259 npm error     Include the workspace root when workspaces are enabled for a command.
23:36:43.259 npm error
23:36:43.261 npm error   --install-links
23:36:43.262 npm error     When set file: protocol dependencies will be packed and installed as
23:36:43.263 npm error
23:36:43.263 npm error
23:36:43.263 npm error aliases: clean-install, ic, install-clean, isntall-clean
23:36:43.263 npm error
23:36:43.263 npm error Run "npm help ci" for more info
23:36:43.264 npm error A complete log of this run can be found in: /vercel/.npm/_logs/2026-04-15T14_36_40_574Z-debug-0.log
23:36:43.326 Error: Command "npm ci" exited with 1