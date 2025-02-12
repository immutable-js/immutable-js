'use client';

import { useEffect } from 'react';

type InstallSpace = {
  Immutable?: unknown;
  module?: unknown;
  exports?: unknown;
};

let installingVersion: string | undefined;

export function ImmutableConsole({ version }: { version: string }) {
  useEffect(() => {
    const installSpace = global as unknown as InstallSpace;
    if (installingVersion === version) {
      return;
    }
    installingVersion = version;
    installUMD(installSpace, getSourceURL(version)).then((Immutable) => {
      installSpace.Immutable = Immutable;
      /* eslint-disable no-console */
      console.log(
        '\n' +
          '   ▄▟████▙▄       _   __    __ __    __ _    _ _______       ____  _     _____ \n' +
          ' ▟██████████▙    | | |  \\  /  |  \\  /  | |  | |__   __|/\\   |  _ \\| |   |  ___|\n' +
          '██████████████   | | |   \\/   |   \\/   | |  | |  | |  /  \\  | |_) | |   | |__   \n' +
          '██████████████   | | | |\\  /| | |\\  /| | |  | |  | | / /\\ \\ |  _ <| |   |  __|  \n' +
          ' ▜██████████▛    | | | | \\/ | | | \\/ | | |__| |  | |/ ____ \\| |_) | |___| |___ \n' +
          '   ▀▜████▛▀      |_| |_|    |_|_|    |_|\\____/   |_/_/    \\_\\____/|_____|_____|\n' +
          '\n' +
          `Version: ${version}\n` +
          '> console.log(Immutable);'
      );
      console.log(Immutable);
      /* eslint-enable no-console */
    });
  }, [version]);
  return null;
}

function getSourceURL(version: string) {
  if (version === 'latest@main') {
    return `https://cdn.jsdelivr.net/gh/immutable-js/immutable-js@npm/dist/immutable.js`;
  }
  const semver = version[0] === 'v' ? version.slice(1) : version;
  return `https://cdn.jsdelivr.net/npm/immutable@${semver}/dist/immutable.js`;
}

function installUMD(installSpace: InstallSpace, src: string): Promise<unknown> {
  return new Promise((resolve) => {
    const installedModule = (installSpace.module = {
      exports: (installSpace.exports = {}),
    });
    const script = document.createElement('script');
    const firstScript = document.getElementsByTagName('script')[0];
    script.src = src;
    script.addEventListener(
      'load',
      () => {
        installSpace.module = undefined;
        installSpace.exports = undefined;
        script.remove();
        resolve(installedModule.exports);
      },
      false
    );
    firstScript?.parentNode?.insertBefore(script, firstScript);
  });
}
