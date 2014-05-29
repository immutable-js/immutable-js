/**
 * Created with JetBrains WebStorm.
 * User: bensudbury
 * Date: 25/03/13
 * Time: 9:23 AM
 * To change this template use File | Settings | File Templates.
 */

///<reference path='../definitions/node.d.ts'/>
///<reference path='../definitions/async.d.ts'/>

import fs = module("fs");
import async = module("async");
import path = module("path");
import util = module("util");
import events = module("events");

var EventEmitter = events.EventEmitter;

/***
 * This class recursively finds files that match the filter function passed to the constructor
 * An alternative constructor takes a fileModifiedDate and returns all files that have been modified since that date
 * this class emits a number of events
 * on "match" is emitted for every path that matches
 */
export class finder extends EventEmitter {


    constructor(options: {rootFolder: string; fileModifiedDate : Date;});
    constructor(options: {rootFolder: string; filterFunction : (strPath : string, fsStat : fs.Stats) => void;});
    constructor(public options: any) {
        super();
        if(options.fileModifiedDate)
            options.filterFunction = function (strPath, fsStat) {
                return (fsStat.mtime > options.fileModifiedDate) ? true : false;
            }

    }

    startSearch() {
        var that = this;
        this.recurseFolder(that.options.rootFolder, function(err) {
            if(err){
                that.emit("error", err);
                return;
            }

            //console.log("This Should Call when everything is finished");

            that.emit("complete");
        });

    }

    recurseFolder(strFolderName: string, folderCompleteCallback: (err: Error) => void){
        var that = this;


        fs.readdir(strFolderName, function(err, files) {
            if(err){
                pathError(err, strFolderName);
                return folderCompleteCallback(err);
            }
            if(!files){
                return folderCompleteCallback(null); // This is just an empty folder

            }

            async.each(files,
                function (file: String, callback: Function){
                    try{
                        var strPath : string = path.join(strFolderName, file);

                    }
                    catch(e)
                    {
                        pathError(e, strPath);
                        return callback(null); // Don't return error to callback or we will miss other files in directory
                    }
                    fs.lstat(strPath, function(err, stat) {
                        if(err){
                            pathError(err, strPath);
                            return callback(null); // Don't return error to callback or we will miss other files in directory
                        }
                        if(!stat){
                            pathError(new Error("Could not get stat for file " + strPath), strPath);
                            return callback(null); // Don't return error to callback or we will miss other files in directory
                        }
                        if(stat.isDirectory()){
                            checkMatch(strPath, stat);
                            that.recurseFolder(strPath, function(err){
                                if(err){
                                    pathError(err, strPath);
                                }
                                return callback(null);
                            });
                        }else
                        {
                            checkMatch(strPath, stat);

                            return callback(null);


                        }

                    })
                },
                function onComplete(err){
                    if(err){
                        pathError(err, strFolderName);
                    }

//                    if(strFolderName.length < 20)
//                        console.log("finished " + strFolderName);
                    return folderCompleteCallback(err);
                }

            )

        })

        function pathError(err, strPath) {
            try{
                that.emit("patherror", err, strPath);
            }catch(e)
            {
                //Already emitted a path error and the handler failed must not throw error or other files will fail to process too
                that.emit("error", new Error("Error in path Error Handler" + e));
            }

        }

        function checkMatch(strPath, stat) {

            try {
                if (that.options.filterFunction(strPath, stat)) {
                    that.emit("match", strPath, stat);
                }

            }
            catch (e) {
                pathError(e, strPath);
            }
        }
    }
}
(module).exports = finder;
