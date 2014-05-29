/**
 * Created with JetBrains WebStorm.
 * User: bensudbury
 * Date: 25/03/13
 * Time: 10:22 AM
 * To change this template use File | Settings | File Templates.
 */
/**
 * Created with JetBrains WebStorm.
 * User: bensudbury
 * Date: 6/03/13
 * Time: 9:57 AM
 * To change this template use File | Settings | File Templates.
 */
var testFiles=[
    "test_node_find"
];


var Mocha = require('mocha');
var path = require("path");


var mocha = new Mocha;


mocha.reporter('spec').ui('bdd');


for (var i =0;i<testFiles.length;i++){


    mocha.addFile(path.join("test", testFiles[i]));


}

var runner = mocha.run(function(){

    console.log('finished');

});
