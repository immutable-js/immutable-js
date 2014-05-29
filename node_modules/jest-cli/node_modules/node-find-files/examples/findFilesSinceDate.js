/**
 * Created with JetBrains WebStorm.
 * User: bensudbury
 * Date: 26/03/13
 * Time: 2:18 PM
 * To change this template use File | Settings | File Templates.
 */

    var node_find_files = require("node-find-files");


    var d = new Date()
    d.setDate(d.getDate() - 1);

    var finder = new node_find_files({
        rootFolder : "/Users",
        fileModifiedDate : d
    });


//    //  Alternate Usage to acheive the same goal, but you can use any of the properties of the fs.stat object or the path to do your filtering
//    var finder = new node_find_files({
//        rootFolder : "/Users",
//        filterFunction : function (path, stat) {
//            return (stat.mtime > d) ? true : false;
//        }
//    });


    finder.on("match", function(strPath, stat) {
        console.log(strPath + " - " + stat.mtime);
    })
    finder.on("complete", function() {
        console.log("Finished")
    })
    finder.on("patherror", function(err, strPath) {
        console.log("Error for Path " + strPath + " " + err)
    })
    finder.on("error", function(err) {
        console.log("Global Error " + err);
    })
    finder.startSearch();