// monsterkodi/kode 0.91.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, in: function (a,l) {return [].indexOf.call(l,a) >= 0}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}, each_r: function (o) {return o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}}}

var kc

kc = require('./utils').kc

module.exports["func"] = function ()
{
    section("func", function ()
    {
        compare(kc('->'),'(function ()\n{})')
        compare(kc('(a) ->'),'(function (a)\n{})')
        compare(kc('(a,b,c) ->'),'(function (a, b, c)\n{})')
        compare(kc('a = (a,b) ->'),'\na = function (a, b)\n{}')
        compare(kc(`-> return 1`),`(function ()
{
    return 1
})`)
        compare(kc(`->
    1
    2`),`(function ()
{
    1
    return 2
})`)
        compare(kc(`->
    return 1
    2`),`(function ()
{
    return 1
    return 2
})`)
        compare(kc(`->
    1
    return 2`),`(function ()
{
    1
    return 2
})`)
        compare(kc(`a = (a,b,c) -> d`),`
a = function (a, b, c)
{
    return d
}`)
        compare(kc(`a.x = (y,z) -> q`),`
a.x = function (y, z)
{
    return q
}`)
        compare(kc(`a = ->
    b = ->`),`
a = function ()
{
    var b

    return b = function ()
    {}
}`)
        compare(kc(`a = (b,c) ->
    b = (e, f) -> g
    b`),`
a = function (b, c)
{
    b = function (e, f)
    {
        return g
    }
    return b
}`)
        compare(kc(`a = (b,c) ->
    b = (e, f) -> h`),`
a = function (b, c)
{
    return b = function (e, f)
    {
        return h
    }
}`)
        compare(kc(`a = (b,c) ->
    (e, f) -> j`),`
a = function (b, c)
{
    return function (e, f)
    {
        return j
    }
}`)
        compare(kc(`f = ->
    (a) -> 1`),`
f = function ()
{
    return function (a)
    {
        return 1
    }
}`)
        compare(kc(`a = ->
    'a'
1
`),`
a = function ()
{
    return 'a'
}
1`)
        compare(kc(`a = ->
    log 'a'

b = ->
    log 'b'`),`
a = function ()
{
    console.log('a')
}

b = function ()
{
    console.log('b')
}`)
        kc("a = ( a, b=1 c=2 ) ->","\na = function (a, b = 1, c = 2)\n{}")
        compare(kc(`if 1 then return`),`if (1)
{
    return
}`)
        compare(kc(`if x then return
a`),`if (x)
{
    return
}
a`)
        compare(kc("-> @a"),`(function ()
{
    return this.a
})`)
        compare(kc("(@a) -> @a"),`(function (a)
{
    this.a = a
    return this.a
})`)
        compare(kc("(@a,a) -> log @a"),`(function (a1, a)
{
    this.a = a1
    console.log(this.a)
})`)
    })
    section("return", function ()
    {
        compare(kc(`ff = ->
    if 232 then return`),`
ff = function ()
{
    if (232)
    {
        return
    }
}`)
        compare(kc(`fff = ->
    if 3
        log '42'`),`
fff = function ()
{
    if (3)
    {
        console.log('42')
    }
}`)
        compare(kc(`ffff = ->
    if 4
        '42'`),`
ffff = function ()
{
    if (4)
    {
        return '42'
    }
}`)
        compare(kc(`->
    if 1 then h
    else if 2
        if 3 then j else k
    else l`),`(function ()
{
    if (1)
    {
        return h
    }
    else if (2)
    {
        if (3)
        {
            return j
        }
        else
        {
            return k
        }
    }
    else
    {
        return l
    }
})`)
        compare(kc(`return 'Q' if t == 'W'`),`if (t === 'W')
{
    return 'Q'
}`)
        compare(kc(`return if not XXX`),`if (!XXX)
{
    return
}`)
        compare(kc(`fffff = ->
    try
        'return me!'
    catch e
        error e`),`
fffff = function ()
{
    try
    {
        return 'return me!'
    }
    catch (e)
    {
        console.error(e)
    }
}`)
    })
}
module.exports["func"]._section_ = true
module.exports
