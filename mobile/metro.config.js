const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

const packagesDir = path.resolve(workspaceRoot, 'packages');
const packageDirs = fs.existsSync(packagesDir)
  ? fs
      .readdirSync(packagesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => path.resolve(packagesDir, d.name))
  : [];

config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(workspaceRoot, 'node_modules'),
  ...packageDirs,
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
