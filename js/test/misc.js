// monsterkodi/kode 0.84.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, in: function (a,l) {return [].indexOf.call(l,a) >= 0}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var cmp, evl

cmp = require('./utils').cmp
evl = require('./utils').evl

describe('misc',function ()
{
    it('this',function ()
    {
        cmp('@','this')
        cmp('@a','this.a')
        cmp('@a.b','this.a.b')
        cmp('@a.b()','this.a.b()')
        cmp('t = @','t = this')
        cmp("a.on 'b', @c","a.on('b',this.c)")
        cmp("a.on 'b' @c","a.on('b',this.c)")
        cmp(`if @
    1`,`if (this)
{
    1
}`)
        cmp(`if @ then 1`,`if (this)
{
    1
}`)
        return cmp(`a @, file`,`a(this,file)`)
    })
    it('try',function ()
    {
        cmp(`try 
    something
catch err
    error err`,`try
{
    something
}
catch (err)
{
    console.error(err)
}`)
        return cmp(`try 
    sthelse
catch err
    error err
finally
    cleanup`,`try
{
    sthelse
}
catch (err)
{
    console.error(err)
}
finally
{
    cleanup
}`)
    })
    it('throw',function ()
    {
        return cmp("throw 'msg'","throw 'msg'")
    })
    it('delete',function ()
    {
        cmp("delete a","delete a")
        cmp("delete @a","delete this.a")
        cmp("delete a.b","delete a.b")
        cmp('[delete a, b]',';[delete a,b]')
        cmp('delete a.b.c','delete a.b.c')
        cmp('[delete a.b, a:b]',';[delete a.b,{a:b}]')
        return cmp('delete a.b == false','delete a.b === false')
    })
    it('require',function ()
    {
        cmp("noon  = require 'noon'","noon = require('noon')")
        return cmp(`slash = require 'kslash'
kstr  = require 'kstr'`,`slash = require('kslash')
kstr = require('kstr')`)
    })
    it('empty',function ()
    {
        cmp(`if empty [] == false
    1234`,`if (_k_.empty([]) === false)
{
    1234
}`)
        evl("a = []; empty a",true)
        evl("a = {}; empty a",true)
        evl("a = ''; empty a",true)
        evl("a = null; empty a",true)
        evl("a = undefined; empty a",true)
        evl("a = NaN; empty a",true)
        evl("a = Infinity; empty a",false)
        evl("a = 0; empty a",false)
        evl("a = 'a'; empty a",false)
        evl("a = Infinity; empty a",false)
        evl("a = [null]; empty a",false)
        evl("a = {a:null}; empty a",false)
        evl("a = [[]]; empty a",false)
        evl("valid []",false)
        evl("valid {}",false)
        evl("valid ''",false)
        evl("valid null",false)
        evl("valid undefined",false)
        evl("valid NaN",false)
        evl("valid Infinity",true)
        evl("valid 0",true)
        evl("valid 'a'",true)
        evl("valid [null]",true)
        evl("valid {a:null}",true)
        evl("valid [[]]",true)
        evl('empty 1 or empty {}',true)
        evl('empty {} or empty 1',true)
        evl('valid {} or valid 1',true)
        evl("valid 'a' or valid ''",true)
        evl("valid 'a' and empty ''",true)
        evl('empty "x" or valid {}',false)
        evl('empty {} and valid []',false)
        return evl('valid {} and valid 0',false)
    })
    it('typeof',function ()
    {
        return cmp(`if typeof pat == 'string'
    1`,`if (typeof(pat) === 'string')
{
    1
}`)
    })
    it('instanceof',function ()
    {
        cmp('a instanceof b','a instanceof b')
        return cmp('a instanceof b == true','a instanceof b === true')
    })
    return it('in condition',function ()
    {
        cmp("a in l","_k_.in(a,l)")
        cmp("a in 'xyz'","_k_.in(a,'xyz')")
        cmp("a in [1,2,3]","_k_.in(a,[1,2,3])")
        cmp("a not in b","!(_k_.in(a,b))")
        cmp("a not in [3,4]","!(_k_.in(a,[3,4]))")
        cmp(`if a in l then 1`,`if (_k_.in(a,l))
{
    1
}`)
        cmp(`if not a in l then 2`,`if (!(_k_.in(a,l)))
{
    2
}`)
        return cmp(`if a in l
    2`,`if (_k_.in(a,l))
{
    2
}`)
    })
})