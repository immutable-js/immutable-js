/**
 * Created with JetBrains WebStorm.
 * User: bensudbury
 * Date: 7/03/13
 * Time: 2:11 PM
 * To change this template use File | Settings | File Templates.
 */
module "should" {

}


declare interface Object {
    should: any;
    be: any;
    not: any;
    an: any;
    ok: any;
    arguments: any;
    empty: any;
    true: any;
    false: any;
    json: any;
    html: any;
    include(obj: any): any;
    includeEql(obj: any): any;
    throw (): any;
    throwError(regExp: RegExp): any;
    within(start: number, end: number): any;
    fail(value?: string): any;
    strictEqual(a: any, b: any): any;
    eql(value: any): any;
    equal(value: any): any;
    exist(value: any): any;
    above(number: number): any;
    below(number: number): any;
    ownProperty(name: string): any;
    match(reg: RegExp): any;
    length(value: number): any;
    instanceof(value: Function): any;
    instanceOf(value: Function): any;
    have: any;
    and: any;
    property(...name:string[]): any;
    keys(...keys:string[]): any;
    lengthOf(value: number): any;
    a(name: string): any;
    status(code: number): any;
    header(field: string, value?: any): any;
}

declare var should: any;