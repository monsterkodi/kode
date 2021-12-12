// monsterkodi/kode 0.93.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}, each_r: function (o) {return o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}}}

var kc

kc = require('./utils').kc

module.exports["basics"] = function ()
{
    section("literals", function ()
    {
        compare(kc(''),'')
        compare(kc(' '),'')
        compare(kc('a'),'a')
        compare(kc('1'),'1')
        compare(kc('2.2'),'2.2')
        compare(kc('""'),'""')
        compare(kc("''"),"''")
        compare(kc('[]'),';[]')
        compare(kc('()'),';()')
        compare(kc('{}'),'{}')
        compare(kc('true'),'true')
        compare(kc('false'),'false')
        compare(kc('yes'),'true')
        compare(kc('no'),'false')
        compare(kc('Infinity'),'Infinity')
        compare(kc('NaN'),'NaN')
        compare(kc('null'),'null')
        compare(kc('undefined'),'undefined')
    })
    section("prop", function ()
    {
        compare(kc('a.a'),'a.a')
        compare(kc('{a:b}.a'),'{a:b}.a')
        compare(kc('a.b.c d'),'a.b.c(d)')
        compare(kc('a.b.c[d]'),'a.b.c[d]')
        compare(kc('[a.b*c[d]]'),';[a.b * c[d]]')
    })
    section("regex", function ()
    {
        compare(kc('/a/'),'/a/')
        compare(kc('/a|b/'),'/a|b/')
        compare(kc('/(a|b)/'),'/(a|b)/')
        compare(kc('/(a|b)/g'),'/(a|b)/g')
        compare(kc('/\\//gimsuy'),'/\\//gimsuy')
    })
    section("op", function ()
    {
        compare(kc('a == b'),'a === b')
        compare(kc('a != b'),'a !== b')
        compare(kc('a and b'),'a && b')
        compare(kc('1 and 2 and 3'),'1 && 2 && 3')
        compare(kc('e and (f or g)'),'e && (f || g)')
        compare(kc('(e and f) or g'),';(e && f) || g')
        compare(kc(`a and \
b or \
c`),`a && b || c`)
        compare(kc(`d and
    e or f and
        g or h`),`d && e || f && g || h`)
        compare(kc(`d and
e or f and
g or h`),`d && e || f && g || h`)
        compare(kc(`a = d and
    e or f and
    g or h`),`a = d && e || f && g || h`)
        compare(kc(`b = 1 <= a < c`),`b = (1 <= a && a < c)`)
        compare(kc(`x = y > z >= 1`),`x = (y > z && z >= 1)`)
        compare(kc(`a = b == c == d`),`a = (b === c && c === d)`)
        compare(kc(`a = b != c != d`),`a = (b !== c && c !== d)`)
    })
    section("not", function ()
    {
        compare(kc('not true'),'!true')
        compare(kc('not c1 or c2'),'!c1 || c2')
        compare(kc('not (x > 0)'),'!(x > 0)')
        compare(kc('not x == 0'),'!x === 0')
        compare(kc('if not m = t'),'if (!(m = t))\n{\n}')
    })
    section("assign", function ()
    {
        compare(kc('a = b'),'a = b')
        compare(kc('a = b = c = 1'),'a = b = c = 1')
        compare(kc(`module.exports = sthg
log 'ok'`),`module.exports = sthg
console.log('ok')`)
        compare(kc(`a = b = c = sthg == othr
log 'ok'`),`a = b = c = sthg === othr
console.log('ok')`)
        compare(kc(`d = a and
b or
    c`),`d = a && b || c`)
        compare(kc(`d = a and
    b or
        c`),`d = a && b || c`)
        compare(kc(`d = a and
    b or
    c`),`d = a && b || c`)
        compare(kc(`r = 1 + p = 2 + 3`),`r = 1 + (p = 2 + 3)`)
    })
    section("math", function ()
    {
        compare(kc('a + b'),'a + b')
        compare(kc('a - b + c - 1'),'a - b + c - 1')
        compare(kc('-a+-b'),'-a + -b')
        compare(kc('+a+-b'),'+a + -b')
        compare(kc('a + -b'),'a + -b')
        compare(kc('a+ -b'),'a + -b')
        compare(kc('a + -(b-c)'),'a + -(b - c)')
        compare(kc('b --c'),'b(--c)')
        compare(kc('a + -b --c'),'a + -b(--c)')
        compare(kc('a -b'),'a(-b)')
        compare(kc('-a -b'),'-a(-b)')
        compare(kc('-a +b'),'-a(+b)')
        compare(kc('+a -b'),'+a(-b)')
    })
    section("increment", function ()
    {
        compare(kc('a++'),'a++')
        compare(kc('a--'),'a--')
        compare(kc('++a'),'++a')
        compare(kc('--a'),'--a')
        compare(kc('--a,++b'),'--a\n++b')
        compare(kc('a[1]++'),'a[1]++')
        compare(kc('a[1]--'),'a[1]--')
        compare(kc('--a[1]'),'--a[1]')
        compare(kc('++a[1]'),'++a[1]')
        compare(kc('a.b.c++'),'a.b.c++')
        compare(kc('a.b.c--'),'a.b.c--')
        compare(kc('a(b).c++'),'a(b).c++')
        compare(kc('a(b).c--'),'a(b).c--')
        compare(kc('(--b)'),';(--b)')
        compare(kc('(++b)'),';(++b)')
        compare(kc('(b--)'),';(b--)')
        compare(kc('(b++)'),';(b++)')
        compare(kc('log(++b)'),'console.log(++b)')
        compare(kc('log(++{b:1}.b)'),'console.log(++{b:1}.b)')
        if (false)
        {
            compare(kc(('--a++')),'')
            compare(kc(('--a--')),'')
            compare(kc(('++a++')),'')
            compare(kc(('++a--')),'')
            compare(kc(('++--')),'')
            compare(kc(('++1')),'')
            compare(kc(('1--')),'')
            compare(kc(('""++')),'')
        }
    })
}
module.exports["basics"]._section_ = true
module.exports
