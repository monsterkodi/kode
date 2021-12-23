// monsterkodi/kode 0.197.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, each_r: function (o) {return o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}}, noon: function (obj) { var pad = function (s, l) { while (s.length < l) { s += ' ' }; return s }; var esc = function (k, arry) { var es, sp; if (0 <= k.indexOf('\n')) { sp = k.split('\n'); es = sp.map(function (s) { return esc(s,arry) }); es.unshift('...'); es.push('...'); return es.join('\n') } if (k === '' || k === '...' || _k_.in(k[0],[' ','#','|']) || _k_.in(k[k.length - 1],[' ','#','|'])) { k = '|' + k + '|' } else if (arry && /  /.test(k)) { k = '|' + k + '|' }; return k }; var pretty = function (o, ind, seen) { var k, kl, l, v, mk = 4; if (Object.keys(o).length > 1) { for (k in o) { v = o[k]; if (o.hasOwnProperty(k)) { kl = parseInt(Math.ceil((k.length + 2) / 4) * 4); mk = Math.max(mk,kl); if (mk > 32) { mk = 32; break } } } }; l = []; var keyValue = function (k, v) { var i, ks, s, vs; s = ind; k = esc(k,true); if (k.indexOf('  ') > 0 && k[0] !== '|') { k = `|${k}|` } else if (k[0] !== '|' && k[k.length - 1] === '|') { k = '|' + k } else if (k[0] === '|' && k[k.length - 1] !== '|') { k += '|' }; ks = pad(k,Math.max(mk,k.length + 2)); i = pad(ind + '    ',mk); s += ks; vs = toStr(v,i,false,seen); if (vs[0] === '\n') { while (s[s.length - 1] === ' ') { s = s.substr(0,s.length - 1) } }; s += vs; while (s[s.length - 1] === ' ') { s = s.substr(0,s.length - 1) }; return s }; for (k in o) { v = o[k]; if (o.hasOwnProperty(k)) { l.push(keyValue(k,v)) } }; return l.join('\n') }; var toStr = function (o, ind = '', arry = false, seen = []) { var s, t, v; if (!(o != null)) { if (o === null) { return 'null' }; if (o === undefined) { return 'undefined' }; return '<?>' }; switch (t = typeof(o)) { case 'string': {return esc(o,arry)}; case 'object': { if (_k_.in(o,seen)) { return '<v>' }; seen.push(o); if ((o.constructor != null ? o.constructor.name : undefined) === 'Array') { s = ind !== '' && arry && '.' || ''; if (o.length && ind !== '') { s += '\n' }; s += (function () { var result = []; var list = _k_.list(o); for (var li = 0; li < list.length; li++)  { v = list[li];result.push(ind + toStr(v,ind + '    ',true,seen))  } return result }).bind(this)().join('\n') } else if ((o.constructor != null ? o.constructor.name : undefined) === 'RegExp') { return o.source } else { s = (arry && '.\n') || ((ind !== '') && '\n' || ''); s += pretty(o,ind,seen) }; return s } default: return String(o) }; return '<???>' }; return toStr(obj) }, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, valid: undefined}

var allfails, allsuccs, comps, fails, kstr, print, stack, succs

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

    sameObjects (a, b, keystack)
    {
        var i, k, v

        keystack = (keystack != null ? keystack : [])
        if (Object.is(a,b))
        {
            return true
        }
        if (typeof(a) !== typeof(b))
        {
            console.log(`${keystack.join('.')}: ${typeof(a)} !! ${typeof(b)}`)
            return false
        }
        if (!a instanceof Array && !typeof(a) === 'object')
        {
            console.log(`${keystack.join('.')}: ${a} != ${b}`)
            return false
        }
        if (a instanceof Array)
        {
            if (a.length !== b.length)
            {
                console.log(`${keystack.join('.')}: ${a.length} ][ ${b.length}`)
                return false
            }
            var list = _k_.list(a)
            for (i = 0; i < list.length; i++)
            {
                v = list[i]
                keystack.push(i)
                if (!this.sameObjects(v,b[i],keystack))
                {
                    keystack.pop()
                    return false
                }
                keystack.pop()
            }
        }
        else
        {
            if (Object.keys(a).length !== Object.keys(b).length)
            {
                console.log(`${keystack.join('.')}: ${Object.keys(a).length} <> ${Object.keys(b).length}`)
                return false
            }
            for (k in a)
            {
                v = a[k]
                keystack.push(k)
                if (!this.sameObjects(v,b[k],keystack))
                {
                    keystack.pop()
                    return false
                }
                keystack.pop()
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
        if (typeof(b) === 'function')
        {
            if (b(a))
            {
                succs++
                return
            }
        }
        if (this.sameObjects(a,b))
        {
            succs++
            return
        }
        console.log(R1(black(ind + comps + ' ')) + ' ' + r5(this.short(a)) + ' ' + R1(r4(' ▸ ')) + ' ' + g1(this.short(b)))
        return fails.push({stack:stack.concat([comps]),comps:comps,lhs:a,rhs:b})
    }

    test (text, file)
    {
        var g, tests

        if (!/\n\s*▸\s\w+/gm.test(text))
        {
            return
        }
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
            fails.push({stack:stack,lhs:file + stack,rhs:err})
            allfails.push(fails.slice(-1)[0])
            return
        }
        if ((tests != null ? tests._test_ : undefined) !== true)
        {
            return
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
        allfails = allfails.concat(fails)
        return true
    }

    showSpace (s)
    {
        if (!(function(o){return (typeof o === 'string' || o instanceof String)})(s))
        {
            return _k_.noon(s)
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
        for (var _161_17_ = 0; _161_17_ < list.length; _161_17_++)
        {
            fail = list[_161_17_]
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
        var l, split, ss

        if (_k_.empty(s))
        {
            return s
        }
        split = ('' + s).split('\n')
        l = 0
        split = (function (o) {
            var r = _k_.each_r(o)
            for (var k in o)
            {   
                var m = (function (v)
            {
                var a

                if (!_k_.empty(v))
                {
                    v = '' + v
                    a = Math.min(v.length,30 - l)
                    l += a
                    return v.slice(0, typeof a === 'number' ? a : -1)
                }
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