// monsterkodi/kode 0.84.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, in: function (a,l) {return [].indexOf.call(l,a) >= 0}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var cmp

cmp = require('./utils').cmp

describe('basics',function ()
{
    it('literals',function ()
    {
        cmp('','')
        cmp(' ','')
        cmp('a','a')
        cmp('1','1')
        cmp('2.2','2.2')
        cmp('""','""')
        cmp("''","''")
        cmp('[]',';[]')
        cmp('()',';()')
        cmp('{}','{}')
        cmp('true','true')
        cmp('false','false')
        cmp('yes','true')
        cmp('no','false')
        cmp('Infinity','Infinity')
        cmp('NaN','NaN')
        cmp('null','null')
        return cmp('undefined','undefined')
    })
    it('prop',function ()
    {
        cmp('a.a','a.a')
        cmp('{a:b}.a','{a:b}.a')
        cmp('a.b.c d','a.b.c(d)')
        cmp('a.b.c[d]','a.b.c[d]')
        return cmp('[a.b*c[d]]',';[a.b * c[d]]')
    })
    it('regex',function ()
    {
        cmp('/a/','/a/')
        cmp('/a|b/','/a|b/')
        cmp('/(a|b)/','/(a|b)/')
        cmp('/(a|b)/g','/(a|b)/g')
        return cmp('/\\//gimsuy','/\\//gimsuy')
    })
    it('op',function ()
    {
        cmp('a == b','a === b')
        cmp('a != b','a !== b')
        cmp('a and b','a && b')
        cmp('1 and 2 and 3','1 && 2 && 3')
        cmp('e and (f or g)','e && (f || g)')
        cmp('(e and f) or g',';(e && f) || g')
        cmp(`a and \
b or \
c`,`a && b || c`)
        cmp(`d and
    e or f and
        g or h`,`d && e || f && g || h`)
        cmp(`d and
e or f and
g or h`,`d && e || f && g || h`)
        cmp(`a = d and
    e or f and
    g or h`,`a = d && e || f && g || h`)
        cmp(`b = 1 <= a < c`,`b = (1 <= a && a < c)`)
        cmp(`x = y > z >= 1`,`x = (y > z && z >= 1)`)
        cmp(`a = b == c == d`,`a = (b === c && c === d)`)
        return cmp(`a = b != c != d`,`a = (b !== c && c !== d)`)
    })
    it('not',function ()
    {
        cmp('not true','!true')
        cmp('not c1 or c2','!c1 || c2')
        cmp('not (x > 0)','!(x > 0)')
        cmp('not x == 0','!x === 0')
        return cmp('if not m = t','if (!(m = t))\n{\n}')
    })
    it('assign',function ()
    {
        cmp('a = b','a = b')
        cmp('a = b = c = 1','a = b = c = 1')
        cmp(`module.exports = sthg
log 'ok'`,`module.exports = sthg
console.log('ok')`)
        cmp(`a = b = c = sthg == othr
log 'ok'`,`a = b = c = sthg === othr
console.log('ok')`)
        cmp(`d = a and
b or
    c`,`d = a && b || c`)
        cmp(`d = a and
    b or
        c`,`d = a && b || c`)
        cmp(`d = a and
    b or
    c`,`d = a && b || c`)
        return cmp(`r = 1 + p = 2 + 3`,`r = 1 + (p = 2 + 3)`)
    })
    it('math',function ()
    {
        cmp('a + b','a + b')
        cmp('a - b + c - 1','a - b + c - 1')
        cmp('-a+-b','-a + -b')
        cmp('+a+-b','+a + -b')
        cmp('a + -b','a + -b')
        cmp('a+ -b','a + -b')
        cmp('a + -(b-c)','a + -(b - c)')
        cmp('b --c','b(--c)')
        cmp('a + -b --c','a + -b(--c)')
        cmp('a -b','a(-b)')
        cmp('-a -b','-a(-b)')
        cmp('-a +b','-a(+b)')
        return cmp('+a -b','+a(-b)')
    })
    return it('increment',function ()
    {
        cmp('a++','a++')
        cmp('a--','a--')
        cmp('++a','++a')
        cmp('--a','--a')
        cmp('--a,++b','--a\n++b')
        cmp('a[1]++','a[1]++')
        cmp('a[1]--','a[1]--')
        cmp('--a[1]','--a[1]')
        cmp('++a[1]','++a[1]')
        cmp('a.b.c++','a.b.c++')
        cmp('a.b.c--','a.b.c--')
        cmp('a(b).c++','a(b).c++')
        cmp('a(b).c--','a(b).c--')
        cmp('(--b)',';(--b)')
        cmp('(++b)',';(++b)')
        cmp('(b--)',';(b--)')
        cmp('(b++)',';(b++)')
        cmp('log(++b)','console.log(++b)')
        cmp('log(++{b:1}.b)','console.log(++{b:1}.b)')
        if (false)
        {
            cmp(('--a++')(''))
            cmp(('--a--')(''))
            cmp(('++a++')(''))
            cmp(('++a--')(''))
            cmp(('++--')(''))
            cmp(('++1')(''))
            cmp(('1--')(''))
            return cmp(('""++')(''))
        }
    })
})