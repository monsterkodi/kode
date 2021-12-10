// monsterkodi/kode 0.74.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, length: function (l) {return (l != null ? typeof l.length === 'number' ? l.length : 0 : 0)}, in: function (a,l) {return (l != null ? typeof l.indexOf === 'function' ? l.indexOf(a) >= 0 : false : false)}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var cmp

cmp = require('./utils').cmp

describe('object',function ()
{
    it('object',function ()
    {
        cmp('a:1','{a:1}')
        cmp('{a:1}','{a:1}')
        cmp('a:1 b:2','{a:1,b:2}')
        cmp('{a:3 b:4}','{a:3,b:4}')
        cmp('a:b:c','{a:{b:c}}')
        cmp('a:b:c,d:e:f','{a:{b:c,d:{e:f}}}')
        cmp('a:b c','{a:b(c)}')
        cmp('a:b:c d:e:f','{a:{b:c({d:{e:f}})}}')
        cmp('o = { a:1 b:2 c: d:4 e:5 }','o = {a:1,b:2,c:{d:4,e:5}}')
        cmp(`a
    {
        a:1
    }`,`a({a:1})`)
        cmp(`a =
    {
        a:1
    }`,`a = {a:1}`)
        cmp(`{a:1}
log 3`,`{a:1}
console.log(3)`)
        cmp(`o={a:1}
log o`,`o = {a:1}
console.log(o)`)
        cmp(`i = y:1
log i`,`i = {y:1}
console.log(i)`)
        cmp(`i = y:1 z:2
log i`,`i = {y:1,z:2}
console.log(i)`)
        cmp(`u = v:0 w:1; x=y:2`,`u = {v:0,w:1}
x = {y:2}`)
        return cmp(`i = y:1 z:2; z=a:1
log i`,`i = {y:1,z:2}
z = {a:1}
console.log(i)`)
    })
    it('stringify',function ()
    {
        cmp("a.b:1","{'a.b':1}")
        cmp("|:1","{'|':1}")
        cmp("==:1","{'==':1}")
        cmp(">=:1","{'>=':1}")
        cmp("<=:1","{'<=':1}")
        cmp("!=:1","{'!=':1}")
        cmp(".:1","{'.':1}")
        cmp(",:1","{',':1}")
        cmp(";:1","{';':1}")
        cmp("*:1","{'*':1}")
        cmp("+:1","{'+':1}")
        cmp("-:1","{'-':1}")
        return cmp("/:1","{'/':1}")
    })
    return it('assign',function ()
    {
        cmp("{x} = o","x = o.x\n")
        cmp("{x,y} = o","x = o.x\ny = o.y\n")
        return cmp("{x,y} = require 'sthg'","x = require('sthg').x\ny = require('sthg').y\n")
    })
})