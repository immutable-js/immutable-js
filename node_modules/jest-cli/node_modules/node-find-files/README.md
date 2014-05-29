#node-find-files

This is a quick utility I wrote for recursively searching a directory structure and finding files and directories that match a particular spec.

##What's Different About it

Similar projects that I was able to find processed the whole directory tree and then handed a set of results back at the end. This module inherits from EventEmitter so it will begin streaming results as soon as the first one is found.

My initial use case was to find files modified since a particular date, but you can also pass a filter function to return files that match any criteria you can find on the fs.stat object in node.

Usage:

    var node_find_files = require("node-find-files");


    var d = new Date()
    d.setDate(d.getDate() - 1);

    var finder = new node_find_files({
        rootFolder : "/Users",
        fileModifiedDate : d
    });

    finder.on("match", function(strPath, stat) {
        console.log(strPath + " - " + stat.mtime);
    })
    finder.on("complete", function() {
        console.log("Finished")
    })
    finder.on("patherror", function(err, strPath) {
        console.log("Error for Path " + strPath + " " + err)  // Note that an error in accessing a particular file does not stop the whole show
    })
    finder.on("error", function(err) {
        console.log("Global Error " + err);
    })
    finder.startSearch();

##OK but give me more Power

You can set up the finder object with any filter function you like

    //  Alternate Usage to achieve the same goal, but you can use any of the properties of the fs.stat object or the path to do your filtering
    var finder = new node_find_files({
        rootFolder : "/Users",
        filterFunction : function (path, stat) {
            return (stat.mtime > d) ? true : false;
        }
    });
