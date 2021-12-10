// monsterkodi/kode 0.74.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, length: function (l) {return (l != null ? typeof l.length === 'number' ? l.length : 0 : 0)}, in: function (a,l) {return (l != null ? typeof l.indexOf === 'function' ? l.indexOf(a) >= 0 : false : false)}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var cmp, evl

cmp = require('./utils').cmp
evl = require('./utils').evl

describe('qmark',function ()
{
    it('nullcmp',function ()
    {
        cmp("a?",";(a != null)")
        cmp("a.b.c?",";(a.b.c != null)")
        cmp("a.b().c?",";(a.b().c != null)")
        cmp("if a.b().c?","if ((a.b().c != null))\n{\n}")
        cmp("@m?",";(this.m != null)")
        cmp("-> m?",`(function ()
{
    return (m != null)
})`)
        cmp("r.filter (m) -> m?",`r.filter(function (m)
{
    return (m != null)
})`)
        return cmp("matches = matches.filter (m) -> m[1]?",`matches = matches.filter(function (m)
{
    return (m[1] != null)
})`)
    })
    it('?=',function ()
    {
        cmp("t.a ?= {}",`t.a = ((_1_4_=t.a) != null ? _1_4_ : {})`)
        return cmp("x = t.b ?= {}",`x = t.b = ((_1_8_=t.b) != null ? _1_8_ : {})`)
    })
    it('assert',function ()
    {
        cmp("e?.d",";(e != null ? e.d : undefined)")
        cmp("e?()",';(typeof e === "function" ? e() : undefined)')
        cmp("e?[1]",";(e != null ? e[1] : undefined)")
        cmp("e?[1].f",";(e != null ? e[1].f : undefined)")
        cmp("e?[1]?.g",";(e != null ? e[1] != null ? e[1].g : undefined : undefined)")
        cmp("e?.f?.d",";(e != null ? (_1_4_=e.f) != null ? _1_4_.d : undefined : undefined)")
        cmp("@m?.n",";(this.m != null ? this.m.n : undefined)")
        cmp("@m? a",';(typeof this.m === "function" ? this.m(a) : undefined)')
        cmp("@m?.f a",";(this.m != null ? this.m.f(a) : undefined)")
        cmp(`->
    s?.c
    r?.d`,`(function ()
{
    (s != null ? s.c : undefined)
    return (r != null ? r.d : undefined)
})`)
        return evl("e=1;e?[1]?.g",undefined)
    })
    it('combined',function ()
    {
        cmp("e?.col?",";((e != null ? e.col : undefined) != null)")
        cmp(`(a.b?.c.d?.e == 2)`,`;(((_1_4_=a.b) != null ? (_1_9_=_1_4_.c.d) != null ? _1_9_.e : undefined : undefined) === 2)`)
        cmp(`x = a[1]?.b()?.c?().d?.e`,`x = (a[1] != null ? (_1_13_=a[1].b()) != null ? typeof (_1_16_=_1_13_.c) === "function" ? (_1_21_=_1_16_().d) != null ? _1_21_.e : undefined : undefined : undefined : undefined)`)
        return cmp(`x = a.b?[222]?(333)?.e`,`x = ((_1_7_=a.b) != null ? typeof _1_7_[222] === "function" ? (_1_19_=_1_7_[222](333)) != null ? _1_19_.e : undefined : undefined : undefined)`)
    })
    return it('functions',function ()
    {
        cmp("f c ? '', 4","f((c != null ? c : ''),4)")
        return cmp(`a = ->
    if b?.e?.l
        hua
    oga`,`
a = function ()
{
    var _2_11_

    if ((b != null ? (_2_11_=b.e) != null ? _2_11_.l : undefined : undefined))
    {
        hua
    }
    return oga
}`)
    })
})