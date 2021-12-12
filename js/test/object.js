// monsterkodi/kode 0.91.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, in: function (a,l) {return [].indexOf.call(l,a) >= 0}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}, each_r: function (o) {return o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}}}

var kc

kc = require('./utils').kc

module.exports["object"] = function ()
{
    section("object", function ()
    {
        compare(kc('a:1'),'{a:1}')
        compare(kc('{a:1}'),'{a:1}')
        compare(kc('a:1 b:2'),'{a:1,b:2}')
        compare(kc('{a:3 b:4}'),'{a:3,b:4}')
        compare(kc('a:b:c'),'{a:{b:c}}')
        compare(kc('a:b:c,d:e:f'),'{a:{b:c,d:{e:f}}}')
        compare(kc('a:b c'),'{a:b(c)}')
        compare(kc('a:b:c d:e:f'),'{a:{b:c({d:{e:f}})}}')
        compare(kc('o = { a:1 b:2 c: d:4 e:5 }'),'o = {a:1,b:2,c:{d:4,e:5}}')
        compare(kc(`a
    {
        a:1
    }`),`a({a:1})`)
        compare(kc(`a =
    {
        a:1
    }`),`a = {a:1}`)
        compare(kc(`{a:1}
log 3`),`{a:1}
console.log(3)`)
        compare(kc(`o={a:1}
log o`),`o = {a:1}
console.log(o)`)
        compare(kc(`i = y:1
log i`),`i = {y:1}
console.log(i)`)
        compare(kc(`i = y:1 z:2
log i`),`i = {y:1,z:2}
console.log(i)`)
        compare(kc(`u = v:0 w:1; x=y:2`),`u = {v:0,w:1}
x = {y:2}`)
        compare(kc(`i = y:1 z:2; z=a:1
log i`),`i = {y:1,z:2}
z = {a:1}
console.log(i)`)
    })
    section("stringify", function ()
    {
        compare(kc("a.b:1"),"{'a.b':1}")
        compare(kc("|:1"),"{'|':1}")
        compare(kc("==:1"),"{'==':1}")
        compare(kc(">=:1"),"{'>=':1}")
        compare(kc("<=:1"),"{'<=':1}")
        compare(kc("!=:1"),"{'!=':1}")
        compare(kc(".:1"),"{'.':1}")
        compare(kc(",:1"),"{',':1}")
        compare(kc(";:1"),"{';':1}")
        compare(kc("*:1"),"{'*':1}")
        compare(kc("+:1"),"{'+':1}")
        compare(kc("-:1"),"{'-':1}")
        compare(kc("/:1"),"{'/':1}")
    })
    section("assign", function ()
    {
        compare(kc("{x} = o"),"x = o.x\n")
        compare(kc("{x,y} = o"),"x = o.x\ny = o.y\n")
        compare(kc("{x,y} = require 'sthg'"),"x = require('sthg').x\ny = require('sthg').y\n")
    })
}
module.exports["object"]._section_ = true
module.exports
