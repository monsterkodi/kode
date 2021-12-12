// monsterkodi/kode 0.92.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, in: function (a,l) {return [].indexOf.call(l,a) >= 0}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}, each_r: function (o) {return o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}}}

var kstr, comps, succs, fails, stack

kstr = require('kstr')
comps = 0
succs = 0
fails = []
stack = []
class Tester
{
    constructor (kode)
    {
        this.kode = kode
        this.compare = this.compare.bind(this)
        this.debug = this.kode.args.debug
    }

    section (t, f)
    {
        var depth

        stack.push(t)
        comps = 0
        depth = stack.length
        console.log(W1(kstr.lpad('',depth * 3 - 1) + ' ' + global[`y${Math.max(1,8 - 2 * depth)}`](t + ' ')))
        f()
        return stack.pop()
    }

    sameObjects (a, b)
    {
        var k, v

        if (Object.keys(a).length !== Object.keys(b).length)
        {
            return false
        }
        if (typeof(a) !== typeof(b))
        {
            return false
        }
        for (k in a)
        {
            v = a[k]
            if (!Object.is(v,b[k]))
            {
                if (!this.sameObjects(v,b[k]))
                {
                    return false
                }
            }
        }
        return true
    }

    compare (a, b)
    {
        var depth, ind, fail, v, i

        depth = stack.length
        ind = kstr.lpad('',(depth + 1) * 3)
        comps++
        if (Object.is(a,b))
        {
            succs++
            return
        }
        if (Array.isArray(a) && Array.isArray(b))
        {
            fail = false
            if (a.length === b.length)
            {
                var list = _k_.list(a)
                for (i = 0; i < list.length; i++)
                {
                    v = list[i]
                    if (!Object.is(v,b[i]))
                    {
                        if ((typeof(v) === typeof(b[i]) && typeof(b[i]) === 'object'))
                        {
                            fail = !this.sameObjects(v,b[i])
                            if (fail)
                            {
                                break
                            }
                        }
                        else
                        {
                            fail = true
                            break
                        }
                    }
                }
            }
            if (!fail)
            {
                succs++
                return
            }
        }
        else if (this.sameObjects(a,b))
        {
            succs++
            return
        }
        console.log(R3(r2(ind + comps + ' ')) + ' ' + r5(this.short(a)) + ' ' + R1(r4(' ▸ ')) + ' ' + g1(this.short(b)))
        return fails.push({stack:stack.join(' ') + ' ' + comps,comps:comps,lhs:a,rhs:b})
    }

    test (text, file)
    {
        var g, tests, fail, summary

        comps = 0
        succs = 0
        fails = []
        stack = []
        g = {compare:this.compare,section:this.section}
        tests = this.kode.eval(text,file,g)
        ;        (function (o) {
            var r = _k_.each_r(o)
            for (var k in o)
            {   
                var m = (function (k, v)
            {
                if (v._section_)
                {
                    stack.push(k)
                    console.log(G1(y8(' ' + k + ' ')))
                    v()
                    return stack.pop()
                }
            })(k, o[k])
                if (m != null && m[0] != null)
                {
                    r[m[0]] = m[1]
                }
            }
            return typeof o == 'string' ? r.join('') : r
        })(tests)
        var list = _k_.list(fails)
        for (var _119_17_ = 0; _119_17_ < list.length; _119_17_++)
        {
            fail = list[_119_17_]
            console.log(R3(r2(fail.stack)))
            console.log('lhs')
            console.log(r5(fail.lhs))
            console.log('rhs')
            console.log(g3(fail.rhs))
        }
        if (fails.length)
        {
            summary = b6(succs + fails.length)
            if (succs)
            {
                summary += g4(" ✔ ") + g3(succs) + ' '
            }
            if (!_k_.empty(fails))
            {
                summary += R2(y2(' ❌ ') + y6(fails.length) + y3(' failures '))
            }
            console.log(summary)
        }
    }

    short (s)
    {
        var split, l, ss

        split = ('' + s).split('\n')
        l = 0
        split = (function (o) {
            var r = _k_.each_r(o)
            for (var k in o)
            {   
                var m = (function (v)
            {
                var a

                a = Math.min(v.length,30 - l)
                l += a
                return v.slice(0, typeof a === 'number' ? a : -1)
            })(o[k])
                if (m != null)
                {
                    r[k] = m
                }
            }
            return typeof o == 'string' ? r.join('') : r
        })(split)
        split = split.filter(function (s)
        {
            return s.length
        })
        ss = split.join(w2('➜ '))
        if (l >= 30)
        {
            ss += w2('...')
        }
        return ss
    }
}

module.exports = Tester