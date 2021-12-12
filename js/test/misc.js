// monsterkodi/kode 0.91.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, in: function (a,l) {return [].indexOf.call(l,a) >= 0}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}, each_r: function (o) {return o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}}}

var kc, ke

kc = require('./utils').kc
ke = require('./utils').ke

module.exports["misc"] = function ()
{
    section("this", function ()
    {
        compare(kc('@'),'this')
        compare(kc('@a'),'this.a')
        compare(kc('@a.b'),'this.a.b')
        compare(kc('@a.b()'),'this.a.b()')
        compare(kc('t = @'),'t = this')
        compare(kc("a.on 'b' @c"),"a.on('b',this.c)")
        compare(kc("a.on 'b' @c"),"a.on('b',this.c)")
        compare(kc(`if @
    1`),`if (this)
{
    1
}`)
        compare(kc(`if @ then 1`),`if (this)
{
    1
}`)
        compare(kc(`a @, file`),`a(this,file)`)
    })
    section("try", function ()
    {
        compare(kc(`try 
    something
catch err
    error err`),`try
{
    something
}
catch (err)
{
    console.error(err)
}`)
        compare(kc(`try 
    sthelse
catch err
    error err
finally
    cleanup`),`try
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
    section("throw", function ()
    {
        compare(kc("throw 'msg'"),"throw 'msg'")
    })
    section("delete", function ()
    {
        compare(kc("delete a"),"delete a")
        compare(kc("delete @a"),"delete this.a")
        compare(kc("delete a.b"),"delete a.b")
        compare(kc('[delete a, b]'),';[delete a,b]')
        compare(kc('delete a.b.c'),'delete a.b.c')
        compare(kc('[delete a.b, a:b]'),';[delete a.b,{a:b}]')
        compare(kc('delete a.b == false'),'delete a.b === false')
    })
    section("require", function ()
    {
        compare(kc("noon  = require 'noon'"),"noon = require('noon')")
        compare(kc(`slash = require 'kslash'
kstr  = require 'kstr'`),`slash = require('kslash')
kstr = require('kstr')`)
    })
    section("empty", function ()
    {
        compare(kc(`if empty [] == false
    1234`),`if (_k_.empty([]) === false)
{
    1234
}`)
        compare(ke("a = []; empty a"),true)
        compare(ke("a = {}; empty a"),true)
        compare(ke("a = ''; empty a"),true)
        compare(ke("a = null; empty a"),true)
        compare(ke("a = undefined; empty a"),true)
        compare(ke("a = NaN; empty a"),true)
        compare(ke('empty 1 or empty {}'),true)
        compare(ke('empty {} or empty 1'),true)
        compare(ke("a = Infinity; empty a"),false)
        compare(ke("a = 0; empty a"),false)
        compare(ke("a = 'a'; empty a"),false)
        compare(ke("a = Infinity; empty a"),false)
        compare(ke("a = [null]; empty a"),false)
        compare(ke("a = {a:null}; empty a"),false)
        compare(ke("a = [[]]; empty a"),false)
        compare(ke('empty "x" or valid {}'),false)
        compare(ke('empty {} and valid []'),false)
    })
    section("valid", function ()
    {
        compare(ke("valid []"),false)
        compare(ke("valid {}"),false)
        compare(ke("valid ''"),false)
        compare(ke("valid null"),false)
        compare(ke("valid undefined"),false)
        compare(ke("valid NaN"),false)
        compare(ke('valid {} and valid 0'),false)
        compare(ke("valid Infinity"),true)
        compare(ke("valid 0"),true)
        compare(ke("valid 'a'"),true)
        compare(ke("valid [null]"),true)
        compare(ke("valid {a:null}"),true)
        compare(ke("valid [[]]"),true)
        compare(ke('valid {} or valid 1'),true)
        compare(ke("valid 'a' or valid ''"),true)
        compare(ke("valid 'a' and empty ''"),true)
    })
    section("typeof", function ()
    {
        compare(kc(`if typeof pat == 'string'
    1`),`if (typeof(pat) === 'string')
{
    1
}`)
    })
    section("instanceof", function ()
    {
        compare(kc('a instanceof b'),'a instanceof b')
        compare(kc('a instanceof b == true'),'a instanceof b === true')
    })
    section("in condition", function ()
    {
        compare(kc("a in l"),"_k_.in(a,l)")
        compare(kc("a in 'xyz'"),"_k_.in(a,'xyz')")
        compare(kc("a in [1,2,3]"),"_k_.in(a,[1,2,3])")
        compare(kc("a not in b"),"!(_k_.in(a,b))")
        compare(kc("a not in [3,4]"),"!(_k_.in(a,[3,4]))")
        compare(kc(`if a in l then 1`),`if (_k_.in(a,l))
{
    1
}`)
        compare(kc(`if not a in l then 2`),`if (!(_k_.in(a,l)))
{
    2
}`)
        compare(kc(`if a in l
    2`),`if (_k_.in(a,l))
{
    2
}`)
    })
    section("primes", function ()
    {
        compare(ke(`eratosthenes = (n) ->
    
    prime = [x < 2 and 1 or 0 for x in 0..n]
    
    for i in 0..Math.sqrt n
        
        if prime[i] == 0
            
            l = 2

            while true
                
                break if n < j = i * l++

                prime[j] = 1

    prime = prime each (i,p) -> [i, parseInt p ? 0 : i]
    prime = prime.filter (p) -> p
                
eratosthenes 100`),[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97])
    })
}
module.exports["misc"]._section_ = true
module.exports
