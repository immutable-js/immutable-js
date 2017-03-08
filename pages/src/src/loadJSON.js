module.exports = loadJSON;

function loadJSON(url, then) {
  var oReq = new XMLHttpRequest();
  oReq.onload = event => {
    var json;
    try {
      json = JSON.parse(event.target.responseText);
    } catch (e) {
      // ignore error
    }
    then(json);
  }
  oReq.open("get", url, true);
  oReq.send();
}
