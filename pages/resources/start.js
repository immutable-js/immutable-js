var path = require('path');
var express = require('express');

var app = express();

app.use(express.static(path.join(__dirname, '../out')));

app.listen(8121, function () {
  console.log('http://localhost:8121/');
});
