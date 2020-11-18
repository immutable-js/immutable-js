/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = loadJSON;

function loadJSON(url, then) {
  const oReq = new XMLHttpRequest();
  oReq.onload = (event) => {
    let json;
    try {
      json = JSON.parse(event.target.responseText);
    } catch (e) {
      // ignore error
    }
    then(json);
  };
  oReq.open('get', url, true);
  oReq.send();
}
