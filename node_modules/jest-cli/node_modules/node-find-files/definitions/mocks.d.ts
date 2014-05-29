/**
 * Created with JetBrains WebStorm.
 * User: bensudbury
 * Date: 26/03/13
 * Time: 11:47 AM
 * To change this template use File | Settings | File Templates.
 */
declare module "mocks" {
    declare function  loadFile(strPath : string, options: {fs : any;});
    declare var fs : {
        create(jsonFS : any);
        file(mtime: string, content: string);
    }
}