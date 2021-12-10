// monsterkodi/kode 0.68.0

var _k_ = {list:   function (l)   {return (l != null ? typeof l.length === 'number' ? l : [] : [])},             length: function (l)   {return (l != null ? typeof l.length === 'number' ? l.length : 0 : 0)},             in:     function (a,l) {return (l != null ? typeof l.indexOf === 'function' ? l.indexOf(a) >= 0 : false : false)},             extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var cmp

cmp = require('./utils').cmp

describe('punctuation',function ()
{
    it('parens',function ()
    {
        cmp('(b)',';(b)')
        cmp('(b c)',';(b(c))')
        cmp('(b --c)',';(b(--c))')
        return cmp('a + (b --c)','a + (b(--c))')
    })
    return it('optional commata',function ()
    {
        cmp("a = -1","a = -1")
        cmp("a = [ 1 2 3 ]","a = [1,2,3]")
        cmp("a = [-1 2 3 ]","a = [-1,2,3]")
        cmp("a = [ 1 -2 3 ]","a = [1,-2,3]")
        cmp("a = [-1 -2 -3]","a = [-1,-2,-3]")
        cmp("a = [ 1 +2 -3]","a = [1,2,-3]")
        cmp("a = [+1 -2 +3]","a = [1,-2,3]")
        cmp("a = [1 a]","a = [1,a]")
        cmp("a = [1 -b]","a = [1,-b]")
        cmp("a = ['0' -2 'c' -3]","a = ['0',-2,'c',-3]")
        cmp("a = [-1 - 2 - 3]","a = [-1 - 2 - 3]")
        cmp("a = [-1-2-3]","a = [-1 - 2 - 3]")
        cmp("a = { a:1 b:2 }","a = {a:1,b:2}")
        cmp("a = a:1 b:2","a = {a:1,b:2}")
        cmp("a = ['a' 'b' 'c']","a = ['a','b','c']")
        cmp("a = ['a''b''c']","a = ['a','b','c']")
        cmp("a = { a:{a:1}, b:{b:2} }","a = {a:{a:1},b:{b:2}}")
        cmp("a = { a:{a:3} b:{b:4} }","a = {a:{a:3},b:{b:4}}")
        cmp("a = [ {a:5} {b:6} ]","a = [{a:5},{b:6}]")
        cmp("a = [ {a:1 b:2} ]","a = [{a:1,b:2}]")
        cmp("a = [ [] [] ]","a = [[],[]]")
        cmp("a = [[] []]","a = [[],[]]")
        cmp("a = [[[[[] []] [[] []]]]]","a = [[[[[],[]],[[],[]]]]]")
        cmp("a = [ [1 2] [3 '4'] ]","a = [[1,2],[3,'4']]")
        cmp("a = [ [-1 -2] [-3 '4' -5] ]","a = [[-1,-2],[-3,'4',-5]]")
        cmp("a.on 'b' c","a.on('b',c)")
        cmp("describe 'test' ->","describe('test',function ()\n{})")
        cmp('log "hello" 1 "world"','console.log("hello",1,"world")')
        cmp('log 1 2 3','console.log(1,2,3)')
        cmp("a = ['a' 1 2.3 null undefined true false yes no]","a = ['a',1,2.3,null,undefined,true,false,true,false]")
        cmp("a = [ [a:2] [b:'4'] [c:[]] ]","a = [[{a:2}],[{b:'4'}],[{c:[]}]]")
        cmp("f 'a' ->","f('a',function ()\n{})")
        cmp("f 'a' (b) ->","f('a',function (b)\n{})")
        cmp("f 'b' not a","f('b',!a)")
        cmp("f 'b' {a:1}","f('b',{a:1})")
        cmp("f 'b' ++a","f('b',++a)")
        cmp("f 'b' []","f('b',[])")
        cmp("f 'b' 1 2","f('b',1,2)")
        cmp("g 2 ->","g(2,function ()\n{})")
        cmp("g 2 (b) ->","g(2,function (b)\n{})")
        cmp("g 2 not a","g(2,!a)")
        cmp("g 2 {a:1}","g(2,{a:1})")
        cmp("g 2 ++a","g(2,++a)")
        cmp("g 2 []","g(2,[])")
        return cmp("g 2 1 2","g(2,1,2)")
    })
})