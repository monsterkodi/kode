// monsterkodi/kode 0.68.0

var _k_ = {list:   function (l)   {return (l != null ? typeof l.length === 'number' ? l : [] : [])},             length: function (l)   {return (l != null ? typeof l.length === 'number' ? l.length : 0 : 0)},             in:     function (a,l) {return (l != null ? typeof l.indexOf === 'function' ? l.indexOf(a) >= 0 : false : false)},             extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var cmp

cmp = require('./utils').cmp

describe('func',function ()
{
    it('func',function ()
    {
        cmp('->','(function ()\n{})')
        cmp('(a) ->','(function (a)\n{})')
        cmp('(a,b,c) ->','(function (a, b, c)\n{})')
        cmp('a = (a,b) ->','\na = function (a, b)\n{}')
        cmp(`-> return 1`,`(function ()
{
    return 1
})`)
        cmp(`->
    1
    2`,`(function ()
{
    1
    return 2
})`)
        cmp(`->
    return 1
    2`,`(function ()
{
    return 1
    return 2
})`)
        cmp(`->
    1
    return 2`,`(function ()
{
    1
    return 2
})`)
        cmp(`a = (a,b,c) -> d`,`
a = function (a, b, c)
{
    return d
}`)
        cmp(`a.x = (y,z) -> q`,`
a.x = function (y, z)
{
    return q
}`)
        cmp(`a = ->
    b = ->`,`
a = function ()
{
    var b

    return b = function ()
    {}
}`)
        cmp(`a = (b,c) ->
    b = (e, f) -> g
    b`,`
a = function (b, c)
{
    b = function (e, f)
    {
        return g
    }
    return b
}`)
        cmp(`a = (b,c) ->
    b = (e, f) -> h`,`
a = function (b, c)
{
    return b = function (e, f)
    {
        return h
    }
}`)
        cmp(`a = (b,c) ->
    (e, f) -> j`,`
a = function (b, c)
{
    return function (e, f)
    {
        return j
    }
}`)
        cmp(`f = ->
    (a) -> 1`,`
f = function ()
{
    return function (a)
    {
        return 1
    }
}`)
        cmp(`a = ->
    'a'
1
`,`
a = function ()
{
    return 'a'
}
1`)
        cmp(`a = ->
    log 'a'

b = ->
    log 'b'`,`
a = function ()
{
    console.log('a')
}

b = function ()
{
    console.log('b')
}`)
        cmp("a = ( a, b=1 c=2 ) ->","\na = function (a, b = 1, c = 2)\n{}")
        cmp(`if 1 then return`,`if (1)
{
    return
}`)
        cmp(`if x then return
a`,`if (x)
{
    return
}
a`)
        cmp("-> @a",`(function ()
{
    return this.a
})`)
        cmp("(@a) -> @a",`(function (a)
{
    this.a = a
    return this.a
})`)
        return cmp("(@a,a) -> log @a",`(function (a1, a)
{
    this.a = a1
    console.log(this.a)
})`)
    })
    return it('return',function ()
    {
        cmp(`ff = ->
    if 232 then return`,`
ff = function ()
{
    if (232)
    {
        return
    }
}`)
        cmp(`fff = ->
    if 3
        log '42'`,`
fff = function ()
{
    if (3)
    {
        console.log('42')
    }
}`)
        cmp(`ffff = ->
    if 4
        '42'`,`
ffff = function ()
{
    if (4)
    {
        return '42'
    }
}`)
        cmp(`->
    if 1 then h
    else if 2
        if 3 then j else k
    else l`,`(function ()
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
        cmp(`return 'Q' if t == 'W'`,`if (t === 'W')
{
    return 'Q'
}`)
        cmp(`return if not XXX`,`if (!XXX)
{
    return
}`)
        return cmp(`fffff = ->
    try
        'return me!'
    catch e
        error e`,`
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
})