// monsterkodi/kode 0.124.0

var _k_ = {each_r: function (o) {return o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}}, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, valid: undefined}

var kstr, print, comps, succs, fails, stack, allfails, allsuccs

kstr = require('kstr')
print = require('./print')
comps = 0
succs = 0
fails = []
stack = []
allfails = []
allsuccs = 0
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
        console.log(W1(kstr.lpad('',depth * 3 - 1) + ' ' + global[`g${Math.max(1,8 - 2 * depth)}`](kstr.pad(t,26 - depth * 3) + ' ')))
        f()
        return stack.pop()
    }

    sameObjects (a, b)
    {
        var k, v

        if (Object.is(a,b))
        {
            return true
        }
        if (typeof(a) !== typeof(b))
        {
            return false
        }
        if (!Array.isArray(a) && typeof(a) !== 'object')
        {
            return false
        }
        if (Object.keys(a).length !== Object.keys(b).length)
        {
            return false
        }
        for (k in a)
        {
            v = a[k]
            if (!this.sameObjects(v,b[k]))
            {
                return false
            }
        }
        return true
    }

    compare (a, b)
    {
        var depth, ind

        depth = stack.length
        ind = kstr.lpad('',(depth + 1) * 3)
        comps++
        if (this.sameObjects(a,b))
        {
            succs++
            return
        }
        if (typeof(b) === 'function')
        {
            if (b(a))
            {
                succs++
                return
            }
        }
        console.log(R1(black(ind + comps + ' ')) + ' ' + r5(this.short(a)) + ' ' + R1(r4(' ▸ ')) + ' ' + g1(this.short(b)))
        return fails.push({stack:stack.concat([comps]),comps:comps,lhs:a,rhs:b})
    }

    test (text, file)
    {
        var g, tests

        comps = 0
        succs = 0
        fails = []
        stack = []
        g = {compare:this.compare,section:this.section}
        try
        {
            tests = this.kode.eval(text,file,g)
        }
        catch (err)
        {
            console.error(text)
            console.error(err)
        }
        ;        (function (o) {
            var r = _k_.each_r(o)
            for (var k in o)
            {   
                var m = (function (k, v)
            {
                if (v._section_)
                {
                    stack.push(k)
                    console.log(G1(y8(' ' + kstr.pad(k,25) + ' ')))
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
        allsuccs += succs
        return allfails = allfails.concat(fails)
    }

    showSpace (s)
    {
        if (typeof(s) !== 'string')
        {
            return s
        }
        return s.split('\n').map(function (l)
        {
            return l + w2('◂')
        }).join('\n')
    }

    summarize ()
    {
        var fail, summary

        var list = _k_.list(allfails)
        for (var _125_17_ = 0; _125_17_ < list.length; _125_17_++)
        {
            fail = list[_125_17_]
            console.log(R2(y5(' ' + fail.stack[0] + ' ')) + R1(y5(' ' + fail.stack.slice(1).join(r3(' ▸ ')) + ' ')))
            console.log(r5(this.showSpace(fail.lhs)))
            console.log(R1(r3(' ▸ ')))
            console.log(g3(this.showSpace(fail.rhs)))
            if (_k_.in("[object Object]",'' + fail.lhs))
            {
                print.noon('lhs',fail.lhs)
            }
            if (_k_.in("[object Object]",'' + fail.rhs))
            {
                print.noon('rhs',fail.rhs)
            }
        }
        if (allsuccs || fails.length)
        {
            summary = w2(kstr.now() + ' ')
            if (allsuccs)
            {
                summary += g3(" ✔ ") + g1(allsuccs) + ' '
            }
            if (!_k_.empty(allfails))
            {
                summary += R2(y2(' ❌ ') + y6(allfails.length) + y3(' failures '))
            }
            console.log(summary)
        }
        allfails = []
        return allsuccs = 0
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