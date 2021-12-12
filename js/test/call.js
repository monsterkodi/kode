// monsterkodi/kode 0.91.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, in: function (a,l) {return [].indexOf.call(l,a) >= 0}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}, each_r: function (o) {return o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}}}

var kc

kc = require('./utils').kc

module.exports["call"] = function ()
{
    section("calls", function ()
    {
        compare(kc('a(b)'),'a(b)')
        compare(kc('a(b,c)'),'a(b,c)')
        compare(kc('a(1,null,"2")'),'a(1,null,"2")')
        compare(kc('a[1](b)'),'a[1](b)')
        compare(kc("f 'b', (a) ->"),"f('b',function (a)\n{})")
        compare(kc("a('1' 2 3.4 true false null undefined NaN Infinity)"),"a('1',2,3.4,true,false,null,undefined,NaN,Infinity)")
        compare(kc(`a b:c[1], d:2`),`a({b:c[1],d:2})`)
        compare(kc(`a b:c[2], d:3
4`),`a({b:c[2],d:3})
4`)
        compare(kc(`a '1'
b  2
c  3.4
d  true`),`a('1')
b(2)
c(3.4)
d(true)`)
        compare(kc(`a b 1
c d 2`),`a(b(1))
c(d(2))`)
        compare(kc("a 'b' -> c"),`a('b',function ()
{
    return c
})`)
        compare(kc('l = pat.map ->'),'l = pat.map(function ()\n{})')
        compare(kc(`((a) -> 1)`),`;(function (a)
{
    return 1
})`)
        compare(kc(`l = a (i) -> 0`),`l = a(function (i)
{
    return 0
})`)
        compare(kc(`l = timer ((i) -> 1)`),`l = timer((function (i)
{
    return 1
}))`)
        compare(kc(`l = timer ((i) -> i), y`),`l = timer((function (i)
{
    return i
}),y)`)
        compare(kc(`a.b c:2
x = y`),`a.b({c:2})
x = y`)
    })
    section("lambda", function ()
    {
        compare(kc("a = (-> 1)()"),`a = (function ()
{
    return 1
})()`)
        compare(kc(`a = (->
    1)()`),`a = (function ()
{
    return 1
})()`)
    })
    section("parens", function ()
    {
        compare(kc(`a(
    '1'
    2
    3.4
    true
    [
        null
        undefined
    ]
)`),`a('1',2,3.4,true,[null,undefined])`)
    })
    section("block", function ()
    {
        compare(kc(`a
    b
        3
c
    d
        4`),`a(b(3))
c(d(4))`)
        compare(kc(`a
    b
    1
c
    d
    2`),`a(b,1)
c(d,2)`)
    })
    section("comma", function ()
    {
        compare(kc(`c 1,
  2`),`c(1,2)`)
    })
}
module.exports["call"]._section_ = true
module.exports
