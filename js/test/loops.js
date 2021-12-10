// monsterkodi/kode 0.72.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, length: function (l) {return (l != null ? typeof l.length === 'number' ? l.length : 0 : 0)}, in: function (a,l) {return (l != null ? typeof l.indexOf === 'function' ? l.indexOf(a) >= 0 : false : false)}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var cmp, evl

cmp = require('./utils').cmp
evl = require('./utils').evl

describe('loops',function ()
{
    it('for in',function ()
    {
        cmp("for x in [3...4]",`for (x = 3; x < 4; x++)
{
}`)
        cmp("for x in [3..4]",`for (x = 3; x <= 4; x++)
{
}`)
        cmp("for x in 5..6",`for (x = 5; x <= 6; x++)
{
}`)
        cmp("for x in 5..6",`for (x = 5; x <= 6; x++)
{
}`)
        cmp("for x in 15..4",`for (x = 15; x >= 4; x--)
{
}`)
        cmp(`for t in l
    t`,`var list = _k_.list(l)
for (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)
{
    t = list[_1_6_]
    t
}`)
        cmp(`for a in [1,2,3] then log a`,`var list = [1,2,3]
for (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)
{
    a = list[_1_6_]
    console.log(a)
}`)
        cmp(`for a in [1,2,3] then log a
log a`,`var list = [1,2,3]
for (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)
{
    a = list[_1_6_]
    console.log(a)
}
console.log(a)`)
        cmp(`for a in [1,2,3]
    log '1' a
    log '2' a
log '3' a`,`var list = [1,2,3]
for (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)
{
    a = list[_1_6_]
    console.log('1',a)
    console.log('2',a)
}
console.log('3',a)`)
        cmp(`for v,i in @regs
    log i,v`,`var list = _k_.list(this.regs)
for (i = 0; i < list.length; i++)
{
    v = list[i]
    console.log(i,v)
}`)
        cmp(`for [a,b] in @regs
    log a,b`,`var list = _k_.list(this.regs)
for (var _1_10_ = 0; _1_10_ < list.length; _1_10_++)
{
    a = list[_1_10_][0]
    b = list[_1_10_][1]
    console.log(a,b)
}`)
        cmp(`for a in [1..2] then for b in [1..3] then c = 1; d = 1`,`for (a = 1; a <= 2; a++)
{
    for (b = 1; b <= 3; b++)
    {
        c = 1
        d = 1
    }
}`)
        cmp(`for a in [1..9] then for b in [1..9]
    c = 3
    d:
        e: 1`,`for (a = 1; a <= 9; a++)
{
    for (b = 1; b <= 9; b++)
    {
        c = 3
        {d:{e:1}}
    }
}`)
        cmp(`empty = (a) -> a in ['' null undefined] or b`,`
empty = function (a)
{
    return [].indexOf.call(['',null,undefined], a) >= 0 || b
}`)
        return cmp(`@exp body.exps,k,e for e,k in body.exps`,`var list = _k_.list(body.exps)
for (k = 0; k < list.length; k++)
{
    e = list[k]
    this.exp(body.exps,k,e)
}`)
    })
    it('for of',function ()
    {
        cmp(`for key,val of @patterns
    log key, val`,`for (key in this.patterns)
{
    val = this.patterns[key]
    console.log(key,val)
}`)
        return cmp(`matches = ([k, r.exec t] for k,r of rgs)`,`matches = (function () { var result = []; for (var k in rgs)  { var r = rgs[k];result.push([k,r.exec(t)])  } return result }).bind(this)()`)
    })
    it('for tail',function ()
    {
        return cmp(`f e for e in l ? []`,`var list = (l != null ? l : [])
for (var _1_10_ = 0; _1_10_ < list.length; _1_10_++)
{
    e = list[_1_10_]
    f(e)
}`)
    })
    it('list comprehension',function ()
    {
        cmp("m = ([k, r.exec t] for k,r of rgs)",`m = (function () { var result = []; for (var k in rgs)  { var r = rgs[k];result.push([k,r.exec(t)])  } return result }).bind(this)()`)
        cmp("m = ([i, k] for k,i in rgs)",`m = (function () { var result = []; var list = _k_.list(rgs); for (i = 0; i < list.length; i++)  { var k = list[i];result.push([i,k])  } return result }).bind(this)()`)
        evl("1",1)
        evl("'abc'",'abc')
        evl("[1,2,3]",[1,2,3])
        evl("[i for i in [1,2,3]]",[1,2,3])
        evl("(i for i in [1,2,3])",[1,2,3])
        evl("[i*2 for i in [1,2,3]]",[2,4,6])
        evl("(i+3 for i in [1,2,3])",[4,5,6])
        evl("(k for k of {a:1,b:2,c:3})",['a','b','c'])
        evl("(v*v for k,v of {a:1,b:2,c:3})",[1,4,9])
        evl("(''+i+' '+v for i,v of [5,4,3])",['0 5','1 4','2 3'])
        return evl('((-> (a={})[v]=k; a)() for k,v of {a:1,b:2,c:3})',[{'1':'a'},{'2':'b'},{'3':'c'}])
    })
    it('each',function ()
    {
        cmp("{a:1,b:2}","{a:1,b:2}")
        evl("a = {a:1,b:2}",{a:1,b:2})
        evl("a = {a:1,b:2} each (k,v) -> [k, v*3]",{a:3,b:6})
        evl("a = {a:1,b:2} each (k,v) -> ['▸'+k, v]",{'▸a':1,'▸b':2})
        evl("a = [1,2,3] each (i,v) -> [i, v]",[1,2,3])
        evl("a = [1,2,3] each (i,v) -> [2-i, v]",[3,2,1])
        evl("a = [1,3]   each (i,v) -> [1-i,v*v]",[9,1])
        evl("a = ['3''2''1'] each (i,v) -> [i, v+'▸'+i]",['3▸0','2▸1','1▸2'])
        evl("a = 'hello' each (i,c) -> [i,c+c]","hheelllloo")
        return evl("a = 'hello world' each (i,c) -> [i,i%2 and c.toUpperCase() or c]","hElLo wOrLd")
    })
    it('each single',function ()
    {
        evl("a = '' each ->",'')
        evl("a = {} each ->",{})
        evl("a = [] each ->",[])
        evl("a = [1,2] each -> 'a'",['a','a'])
        evl("a = [1,2] each ->",[])
        evl("a = [1,2,3] each (v) -> v",[1,2,3])
        return evl("a = {a:1,b:2} each (v) -> v*3",{a:3,b:6})
    })
    return it('while',function ()
    {
        cmp(`while true
    log 4`,`while (true)
{
    console.log(4)
}`)
        cmp(`while true then log 5`,`while (true)
{
    console.log(5)
}`)
        return cmp(`while a == b then log c; log d
log e`,`while (a === b)
{
    console.log(c)
    console.log(d)
}
console.log(e)`)
    })
})