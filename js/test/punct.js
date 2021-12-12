// monsterkodi/kode 0.93.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}, each_r: function (o) {return o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}}}

var kc

kc = require('./utils').kc

module.exports["punctuation"] = function ()
{
    section("parens", function ()
    {
        compare(kc('(b)'),';(b)')
        compare(kc('(b c)'),';(b(c))')
        compare(kc('(b --c)'),';(b(--c))')
        compare(kc('a + (b --c)'),'a + (b(--c))')
    })
    section("optional commata", function ()
    {
        compare(kc("a = -1"),"a = -1")
        compare(kc("a = [ 1 2 3 ]"),"a = [1,2,3]")
        compare(kc("a = [-1 2 3 ]"),"a = [-1,2,3]")
        compare(kc("a = [ 1 -2 3 ]"),"a = [1,-2,3]")
        compare(kc("a = [-1 -2 -3]"),"a = [-1,-2,-3]")
        compare(kc("a = [ 1 +2 -3]"),"a = [1,2,-3]")
        compare(kc("a = [+1 -2 +3]"),"a = [1,-2,3]")
        compare(kc("a = [1 a]"),"a = [1,a]")
        compare(kc("a = [1 -b]"),"a = [1,-b]")
        compare(kc("a = ['0' -2 'c' -3]"),"a = ['0',-2,'c',-3]")
        compare(kc("a = [-1 - 2 - 3]"),"a = [-1 - 2 - 3]")
        compare(kc("a = [-1-2-3]"),"a = [-1 - 2 - 3]")
        compare(kc("a = { a:1 b:2 }"),"a = {a:1,b:2}")
        compare(kc("a = a:1 b:2"),"a = {a:1,b:2}")
        compare(kc("a = ['a' 'b' 'c']"),"a = ['a','b','c']")
        compare(kc("a = ['a''b''c']"),"a = ['a','b','c']")
        compare(kc("a = { a:{a:1}, b:{b:2} }"),"a = {a:{a:1},b:{b:2}}")
        compare(kc("a = { a:{a:3} b:{b:4} }"),"a = {a:{a:3},b:{b:4}}")
        compare(kc("a = [ {a:5} {b:6} ]"),"a = [{a:5},{b:6}]")
        compare(kc("a = [ {a:1 b:2} ]"),"a = [{a:1,b:2}]")
        compare(kc("a = [ [] [] ]"),"a = [[],[]]")
        compare(kc("a = [[] []]"),"a = [[],[]]")
        compare(kc("a = [[[[[] []] [[] []]]]]"),"a = [[[[[],[]],[[],[]]]]]")
        compare(kc("a = [ [1 2] [3 '4'] ]"),"a = [[1,2],[3,'4']]")
        compare(kc("a = [ [-1 -2] [-3 '4' -5] ]"),"a = [[-1,-2],[-3,'4',-5]]")
        compare(kc("a.on 'b' c"),"a.on('b',c)")
        compare(kc("describe 'test' ->"),"describe('test',function ()\n{})")
        compare(kc('log "hello" 1 "world"'),'console.log("hello",1,"world")')
        compare(kc('log 1 2 3'),'console.log(1,2,3)')
        compare(kc("a = ['a' 1 2.3 null undefined true false yes no]"),"a = ['a',1,2.3,null,undefined,true,false,true,false]")
        compare(kc("a = [ [a:2] [b:'4'] [c:[]] ]"),"a = [[{a:2}],[{b:'4'}],[{c:[]}]]")
        compare(kc("f 'a' ->"),"f('a',function ()\n{})")
        compare(kc("f 'a' (b) ->"),"f('a',function (b)\n{})")
        compare(kc("f 'b' not a"),"f('b',!a)")
        compare(kc("f 'b' {a:1}"),"f('b',{a:1})")
        compare(kc("f 'b' ++a"),"f('b',++a)")
        compare(kc("f 'b' []"),"f('b',[])")
        compare(kc("f 'b' 1 2"),"f('b',1,2)")
        compare(kc("g 2 ->"),"g(2,function ()\n{})")
        compare(kc("g 2 (b) ->"),"g(2,function (b)\n{})")
        compare(kc("g 2 not a"),"g(2,!a)")
        compare(kc("g 2 {a:1}"),"g(2,{a:1})")
        compare(kc("g 2 ++a"),"g(2,++a)")
        compare(kc("g 2 []"),"g(2,[])")
        compare(kc("g 2 1 2"),"g(2,1,2)")
    })
}
module.exports["punctuation"]._section_ = true
module.exports
