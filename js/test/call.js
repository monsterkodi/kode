// monsterkodi/kode 0.68.0

var _k_ = {list:   function (l)   {return (l != null ? typeof l.length === 'number' ? l : [] : [])},             length: function (l)   {return (l != null ? typeof l.length === 'number' ? l.length : 0 : 0)},             in:     function (a,l) {return (l != null ? typeof l.indexOf === 'function' ? l.indexOf(a) >= 0 : false : false)},             extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var cmp

cmp = require('./utils').cmp

describe('call',function ()
{
    it('calls',function ()
    {
        cmp('a(b)','a(b)')
        cmp('a(b,c)','a(b,c)')
        cmp('a(1,null,"2")','a(1,null,"2")')
        cmp('a[1](b)','a[1](b)')
        cmp("f 'b', (a) ->","f('b',function (a)\n{})")
        cmp("a('1' 2 3.4 true false null undefined NaN Infinity)","a('1',2,3.4,true,false,null,undefined,NaN,Infinity)")
        cmp(`a b:c[1], d:2`,`a({b:c[1],d:2})`)
        cmp(`a b:c[2], d:3
4`,`a({b:c[2],d:3})
4`)
        cmp(`a '1'
b  2
c  3.4
d  true`,`a('1')
b(2)
c(3.4)
d(true)`)
        cmp(`a b 1
c d 2`,`a(b(1))
c(d(2))`)
        cmp("a 'b' -> c",`a('b',function ()
{
    return c
})`)
        cmp('l = pat.map ->','l = pat.map(function ()\n{})')
        cmp(`((a) -> 1)`,`;(function (a)
{
    return 1
})`)
        cmp(`l = a (i) -> 0`,`l = a(function (i)
{
    return 0
})`)
        cmp(`l = timer ((i) -> 1)`,`l = timer((function (i)
{
    return 1
}))`)
        cmp(`l = timer ((i) -> i), y`,`l = timer((function (i)
{
    return i
}),y)`)
        return cmp(`a.b c:2
x = y`,`a.b({c:2})
x = y`)
    })
    it('lambda',function ()
    {
        cmp("a = (-> 1)()",`a = (function ()
{
    return 1
})()`)
        return cmp(`a = (->
    1)()`,`a = (function ()
{
    return 1
})()`)
    })
    it('parens',function ()
    {
        return cmp(`a(
    '1'
    2
    3.4
    true
    [
        null
        undefined
    ]
)`,`a('1',2,3.4,true,[null,undefined])`)
    })
    it('block',function ()
    {
        cmp(`a
    b
        3
c
    d
        4`,`a(b(3))
c(d(4))`)
        return cmp(`a
    b
    1
c
    d
    2`,`a(b,1)
c(d,2)`)
    })
    return it('comma',function ()
    {
        return cmp(`c 1,
  2`,`c(1,2)`)
    })
})