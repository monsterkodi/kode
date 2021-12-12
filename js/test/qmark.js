// monsterkodi/kode 0.92.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, in: function (a,l) {return [].indexOf.call(l,a) >= 0}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}, each_r: function (o) {return o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}}}

var kc, ke

kc = require('./utils').kc
ke = require('./utils').ke

module.exports["qmark"] = function ()
{
    section("nullcmp", function ()
    {
        compare(kc("a?"),";(a != null)")
        compare(kc("a.b.c?"),";(a.b.c != null)")
        compare(kc("a.b().c?"),";(a.b().c != null)")
        compare(kc("if a.b().c?"),"if ((a.b().c != null))\n{\n}")
        compare(kc("@m?"),";(this.m != null)")
        compare(kc("-> m?"),`(function ()
{
    return (m != null)
})`)
        compare(kc("r.filter (m) -> m?"),`r.filter(function (m)
{
    return (m != null)
})`)
        compare(kc("matches = matches.filter (m) -> m[1]?"),`matches = matches.filter(function (m)
{
    return (m[1] != null)
})`)
    })
    section("?=", function ()
    {
        compare(kc("t.a ?= {}"),`t.a = ((_1_4_=t.a) != null ? _1_4_ : {})`)
        compare(kc("x = t.b ?= {}"),`x = t.b = ((_1_8_=t.b) != null ? _1_8_ : {})`)
    })
    section("assert", function ()
    {
        compare(kc("e?.d"),";(e != null ? e.d : undefined)")
        compare(kc("e?()"),';(typeof e === "function" ? e() : undefined)')
        compare(kc("e?[1]"),";(e != null ? e[1] : undefined)")
        compare(kc("e?[1].f"),";(e != null ? e[1].f : undefined)")
        compare(kc("e?[1]?.g"),";(e != null ? e[1] != null ? e[1].g : undefined : undefined)")
        compare(kc("e?.f?.d"),";(e != null ? (_1_4_=e.f) != null ? _1_4_.d : undefined : undefined)")
        compare(kc("@m?.n"),";(this.m != null ? this.m.n : undefined)")
        compare(kc("@m? a"),';(typeof this.m === "function" ? this.m(a) : undefined)')
        compare(kc("@m?.f a"),";(this.m != null ? this.m.f(a) : undefined)")
        compare(kc(`->
    s?.c
    r?.d`),`(function ()
{
    ;(s != null ? s.c : undefined)
    return (r != null ? r.d : undefined)
})`)
        compare(ke("e=1;e?[1]?.g"),undefined)
    })
    section("combined", function ()
    {
        compare(kc("e?.col?"),";((e != null ? e.col : undefined) != null)")
        compare(kc(`(a.b?.c.d?.e == 2)`),`;(((_1_4_=a.b) != null ? (_1_9_=_1_4_.c.d) != null ? _1_9_.e : undefined : undefined) === 2)`)
        compare(kc(`x = a[1]?.b()?.c?().d?.e`),`x = (a[1] != null ? (_1_13_=a[1].b()) != null ? typeof (_1_16_=_1_13_.c) === "function" ? (_1_21_=_1_16_().d) != null ? _1_21_.e : undefined : undefined : undefined : undefined)`)
        compare(kc(`x = a.b?[222]?(333)?.e`),`x = ((_1_7_=a.b) != null ? typeof _1_7_[222] === "function" ? (_1_19_=_1_7_[222](333)) != null ? _1_19_.e : undefined : undefined : undefined)`)
    })
    section("functions", function ()
    {
        compare(kc("f c ? '', 4"),"f((c != null ? c : ''),4)")
        compare(kc(`a = ->
    if b?.e?.l
        hua
    oga`),`
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
}
module.exports["qmark"]._section_ = true
module.exports
