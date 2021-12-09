// monsterkodi/kode 0.66.0

var _k_ = {list:   function (l)   {return (l != null ? typeof l.length === 'number' ? l : [] : [])},             length: function (l)   {return (l != null ? typeof l.length === 'number' ? l.length : 0 : 0)},             in:     function (a,l) {return (l != null ? typeof l.indexOf === 'function' ? l.indexOf(a) >= 0 : false : false)},             extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var ast

ast = require('./utils').ast

describe('ast',function ()
{
    it('simple',function ()
    {
        ast('a','a')
        ast('1','1')
        ast('no','no')
        return ast('1;2','1\n2')
    })
    return it('operation',function ()
    {
        ast('a and b',`operation
    lhs
        a
    operator
        and
    rhs
        b`)
        ast('1 + 2',`operation
    lhs
        1
    operator
        +
    rhs
        2`)
        ast('++a',`operation
    operator
        ++
    rhs
        a`)
        ast('not a',`operation
    operator
        not
    rhs
        a`)
        ast('a = b + 1',`operation
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
        ast('a = b = c',`operation
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
        return ast('for a in l then a',`for
    vals
        a
    inof
        in
    list
        l
    then
        a`)
    })
})