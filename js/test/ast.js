// monsterkodi/kode 0.91.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, in: function (a,l) {return [].indexOf.call(l,a) >= 0}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}, each_r: function (o) {return o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}}}

var ast

ast = require('./utils').ast

module.exports["ast"] = function ()
{
    section("simple", function ()
    {
        compare(ast('a'),'a')
        compare(ast('1'),'1')
        compare(ast('no'),'no')
        compare(ast('1;2'),'1\n2')
    })
    section("operation", function ()
    {
        compare(ast('a and b'),`operation
    lhs
        a
    operator
        and
    rhs
        b`)
        compare(ast('1 + 2'),`operation
    lhs
        1
    operator
        +
    rhs
        2`)
        compare(ast('++a'),`operation
    operator
        ++
    rhs
        a`)
        compare(ast('not a'),`operation
    operator
        not
    rhs
        a`)
        compare(ast('a = b + 1'),`operation
    lhs
        a
    operator
        =
    rhs
        operation
            lhs
                b
            operator
                +
            rhs
                1`)
        compare(ast('a = b = c'),`operation
    lhs
        a
    operator
        =
    rhs
        operation
            lhs
                b
            operator
                =
            rhs
                c`)
        compare(ast('for a in l then a'),`for
    vals
        a
    inof
        in
    list
        l
    then
        a`)
    })
}
module.exports["ast"]._section_ = true
module.exports
