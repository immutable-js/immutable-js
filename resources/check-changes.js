/**
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { exec } = require('child_process');
require('colors');

const checkForChanges = () =>
  new Promise((resolve) =>
    exec(`git diff --quiet`, (error) => {
      if (error) {
        console.log(
          'The Travis build resulted in additional changed files.'.red
        );
        console.log(
          'Typically this is due to not running "npm test"" locally before submitting a pull request.'
        );
        return exec(`git diff --stat`, (diffError, diffOut) => {
          console.log('\nThe following changes were found:'.red);
          console.log(diffOut.yellow);
          process.exit(1);
        });
      }
      resolve();
    })
  );

return checkForChanges();
