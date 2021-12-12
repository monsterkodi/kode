// monsterkodi/kode 0.90.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, in: function (a,l) {return [].indexOf.call(l,a) >= 0}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}, each_r: function (o) {return o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}}}

var cmp, evl

cmp = require('./utils').cmp
evl = require('./utils').evl

describe('class',function ()
{
    it('class',function ()
    {
        cmp(`class A`,`class A
{}
`)
        cmp(`class B
    @: ->`,`class B
{
    constructor ()
    {}
}
`)
        cmp(`class C
    @a: ->
    b: ->`,`class C
{
    static a ()
    {}

    b ()
    {}
}
`)
        cmp(`class D
    a: =>`,`class D
{
    constructor ()
    {
        this.a = this.a.bind(this)
    }

    a ()
    {}
}
`)
        cmp(`class E
    @f: ->
    @g: ->`,`class E
{
    static f ()
    {}

    static g ()
    {}
}
`)
        cmp(`class F
    @f: ->
    @g: ->
    @h: ->`,`class F
{
    static f ()
    {}

    static g ()
    {}

    static h ()
    {}
}
`)
        cmp(`class X
    @: ->
        '@'

    m: -> 'm'`,`class X
{
    constructor ()
    {
        '@'
    }

    m ()
    {
        return 'm'
    }
}
`)
        return cmp(`class Y
    @: -> '@'

    m: ->
        'm'`,`class Y
{
    constructor ()
    {
        '@'
    }

    m ()
    {
        return 'm'
    }
}
`)
    })
    it('bind',function ()
    {
        return cmp(`class A
    @: -> @f()
    b: => log 'hello'
    f: ->
        g = => @b()
        g()`,`class A
{
    constructor ()
    {
        this.b = this.b.bind(this)
        this.f()
    }

    b ()
    {
        console.log('hello')
    }

    f ()
    {
        var g

        g = (function ()
        {
            return this.b()
        }).bind(this)
        return g()
    }
}
`)
    })
    return it('old school',function ()
    {
        evl(`function T1
    @: ->
    f: (a) -> 1 + a

function T2 extends T1
    @: ->
    f: (a) -> super(a) + 30
    
(new T2).f 1`,32)
        return evl(`function T3
     
    f: (a) -> 1 + a
 
function T4 extends T3
 
    f: (a) -> super(a) + 40
     
(new T4).f 1`,42)
    })
})