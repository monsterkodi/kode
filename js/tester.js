// monsterkodi/kode 0.231.0

var _k_ = {kolor: { f: function (r, g, b) { return '\x1b[38;5;' + (16 + 36 * r + 6 * g + b) + 'm' }, F: function (r, g, b) { return '\x1b[48;5;' + (16 + 36 * r + 6 * g + b) + 'm' }, r: function (i = 4) { return (i < 6) && _k_.kolor.f(i,0,0) || _k_.kolor.f(5,i - 5,i - 5) }, R: function (i = 4) { return (i < 6) && _k_.kolor.F(i,0,0) || _k_.kolor.F(5,i - 5,i - 5) }, g: function (i = 4) { return (i < 6) && _k_.kolor.f(0,i,0) || _k_.kolor.f(i - 5,5,i - 5) }, G: function (i = 4) { return (i < 6) && _k_.kolor.F(0,i,0) || _k_.kolor.F(i - 5,5,i - 5) }, b: function (i = 4) { return (i < 6) && _k_.kolor.f(0,0,i) || _k_.kolor.f(i - 5,i - 5,5) }, B: function (i = 4) { return (i < 6) && _k_.kolor.F(0,0,i) || _k_.kolor.F(i - 5,i - 5,5) }, y: function (i = 4) { return (i < 6) && _k_.kolor.f(i,i,0) || _k_.kolor.f(5,5,i - 5) }, Y: function (i = 4) { return (i < 6) && _k_.kolor.F(i,i,0) || _k_.kolor.F(5,5,i - 5) }, m: function (i = 4) { return (i < 6) && _k_.kolor.f(i,0,i) || _k_.kolor.f(5,i - 5,5) }, M: function (i = 4) { return (i < 6) && _k_.kolor.F(i,0,i) || _k_.kolor.F(5,i - 5,5) }, c: function (i = 4) { return (i < 6) && _k_.kolor.f(0,i,i) || _k_.kolor.f(i - 5,5,5) }, C: function (i = 4) { return (i < 6) && _k_.kolor.F(0,i,i) || _k_.kolor.F(i - 5,5,5) }, w: function (i = 4) { return '\x1b[38;5;' + (232 + (i - 1) * 3) + 'm' }, W: function (i = 4) { return '\x1b[48;5;' + (232 + (i - 1) * 3 + 2) + 'm' }, wrap: function (open, close, reg) { return function (s) { return open + (~(s += '').indexOf(close,4) && s.replace(reg,open) || s) + close } }, F256: function (open) { return _k_.kolor.wrap(open,'\x1b[39m',new RegExp('\\x1b\\[39m','g')) }, B256: function (open) { return _k_.kolor.wrap(open,'\x1b[49m',new RegExp('\\x1b\\[49m','g')) }}, list: function (l) {return l != null ? typeof l.length === 'number' ? l : [] : []}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, isStr: function (o) {return typeof o === 'string' || o instanceof String}, each_r: function (o) {return o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}}, noon: function (obj) { var pad = function (s, l) { while (s.length < l) { s += ' ' }; return s }; var esc = function (k, arry) { var es, sp; if (0 <= k.indexOf('\n')) { sp = k.split('\n'); es = sp.map(function (s) { return esc(s,arry) }); es.unshift('...'); es.push('...'); return es.join('\n') } if (k === '' || k === '...' || _k_.in(k[0],[' ','#','|']) || _k_.in(k[k.length - 1],[' ','#','|'])) { k = '|' + k + '|' } else if (arry && /  /.test(k)) { k = '|' + k + '|' }; return k }; var pretty = function (o, ind, seen) { var k, kl, l, v, mk = 4; if (Object.keys(o).length > 1) { for (k in o) { if (Object.hasOwn(o,k)) { kl = parseInt(Math.ceil((k.length + 2) / 4) * 4); mk = Math.max(mk,kl); if (mk > 32) { mk = 32; break } } } }; l = []; var keyValue = function (k, v) { var i, ks, s, vs; s = ind; k = esc(k,true); if (k.indexOf('  ') > 0 && k[0] !== '|') { k = `|${k}|` } else if (k[0] !== '|' && k[k.length - 1] === '|') { k = '|' + k } else if (k[0] === '|' && k[k.length - 1] !== '|') { k += '|' }; ks = pad(k,Math.max(mk,k.length + 2)); i = pad(ind + '    ',mk); s += ks; vs = toStr(v,i,false,seen); if (vs[0] === '\n') { while (s[s.length - 1] === ' ') { s = s.substr(0,s.length - 1) } }; s += vs; while (s[s.length - 1] === ' ') { s = s.substr(0,s.length - 1) }; return s }; for (k in o) { if (Object.hasOwn(o,k)) { l.push(keyValue(k,o[k])) } }; return l.join('\n') }; var toStr = function (o, ind = '', arry = false, seen = []) { var s, t, v; if (!(o != null)) { if (o === null) { return 'null' }; if (o === undefined) { return 'undefined' }; return '<?>' }; switch (t = typeof(o)) { case 'string': {return esc(o,arry)}; case 'object': { if (_k_.in(o,seen)) { return '<v>' }; seen.push(o); if ((o.constructor != null ? o.constructor.name : undefined) === 'Array') { s = ind !== '' && arry && '.' || ''; if (o.length && ind !== '') { s += '\n' }; s += (function () { var result = []; var list = _k_.list(o); for (var li = 0; li < list.length; li++)  { v = list[li];result.push(ind + toStr(v,ind + '    ',true,seen))  } return result }).bind(this)().join('\n') } else if ((o.constructor != null ? o.constructor.name : undefined) === 'RegExp') { return o.source } else { s = (arry && '.\n') || ((ind !== '') && '\n' || ''); s += pretty(o,ind,seen) }; return s } default: return String(o) }; return '<???>' }; return toStr(obj) }, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, valid: undefined, min: function () { m = Infinity; for (a of arguments) { if (a instanceof Array) {m = _k_.min.apply(_k_.min,[m].concat(a))} else {n = parseFloat(a); if(!isNaN(n)){m = n < m ? n : m}}}; return m }};_k_.r1=_k_.kolor.F256(_k_.kolor.r(1));_k_.R1=_k_.kolor.B256(_k_.kolor.R(1));_k_.r2=_k_.kolor.F256(_k_.kolor.r(2));_k_.R2=_k_.kolor.B256(_k_.kolor.R(2));_k_.r3=_k_.kolor.F256(_k_.kolor.r(3));_k_.R3=_k_.kolor.B256(_k_.kolor.R(3));_k_.r4=_k_.kolor.F256(_k_.kolor.r(4));_k_.R4=_k_.kolor.B256(_k_.kolor.R(4));_k_.r5=_k_.kolor.F256(_k_.kolor.r(5));_k_.R5=_k_.kolor.B256(_k_.kolor.R(5));_k_.r6=_k_.kolor.F256(_k_.kolor.r(6));_k_.R6=_k_.kolor.B256(_k_.kolor.R(6));_k_.r7=_k_.kolor.F256(_k_.kolor.r(7));_k_.R7=_k_.kolor.B256(_k_.kolor.R(7));_k_.r8=_k_.kolor.F256(_k_.kolor.r(8));_k_.R8=_k_.kolor.B256(_k_.kolor.R(8));_k_.g1=_k_.kolor.F256(_k_.kolor.g(1));_k_.G1=_k_.kolor.B256(_k_.kolor.G(1));_k_.g2=_k_.kolor.F256(_k_.kolor.g(2));_k_.G2=_k_.kolor.B256(_k_.kolor.G(2));_k_.g3=_k_.kolor.F256(_k_.kolor.g(3));_k_.G3=_k_.kolor.B256(_k_.kolor.G(3));_k_.g4=_k_.kolor.F256(_k_.kolor.g(4));_k_.G4=_k_.kolor.B256(_k_.kolor.G(4));_k_.g5=_k_.kolor.F256(_k_.kolor.g(5));_k_.G5=_k_.kolor.B256(_k_.kolor.G(5));_k_.g6=_k_.kolor.F256(_k_.kolor.g(6));_k_.G6=_k_.kolor.B256(_k_.kolor.G(6));_k_.g7=_k_.kolor.F256(_k_.kolor.g(7));_k_.G7=_k_.kolor.B256(_k_.kolor.G(7));_k_.g8=_k_.kolor.F256(_k_.kolor.g(8));_k_.G8=_k_.kolor.B256(_k_.kolor.G(8));_k_.b1=_k_.kolor.F256(_k_.kolor.b(1));_k_.B1=_k_.kolor.B256(_k_.kolor.B(1));_k_.b2=_k_.kolor.F256(_k_.kolor.b(2));_k_.B2=_k_.kolor.B256(_k_.kolor.B(2));_k_.b3=_k_.kolor.F256(_k_.kolor.b(3));_k_.B3=_k_.kolor.B256(_k_.kolor.B(3));_k_.b4=_k_.kolor.F256(_k_.kolor.b(4));_k_.B4=_k_.kolor.B256(_k_.kolor.B(4));_k_.b5=_k_.kolor.F256(_k_.kolor.b(5));_k_.B5=_k_.kolor.B256(_k_.kolor.B(5));_k_.b6=_k_.kolor.F256(_k_.kolor.b(6));_k_.B6=_k_.kolor.B256(_k_.kolor.B(6));_k_.b7=_k_.kolor.F256(_k_.kolor.b(7));_k_.B7=_k_.kolor.B256(_k_.kolor.B(7));_k_.b8=_k_.kolor.F256(_k_.kolor.b(8));_k_.B8=_k_.kolor.B256(_k_.kolor.B(8));_k_.c1=_k_.kolor.F256(_k_.kolor.c(1));_k_.C1=_k_.kolor.B256(_k_.kolor.C(1));_k_.c2=_k_.kolor.F256(_k_.kolor.c(2));_k_.C2=_k_.kolor.B256(_k_.kolor.C(2));_k_.c3=_k_.kolor.F256(_k_.kolor.c(3));_k_.C3=_k_.kolor.B256(_k_.kolor.C(3));_k_.c4=_k_.kolor.F256(_k_.kolor.c(4));_k_.C4=_k_.kolor.B256(_k_.kolor.C(4));_k_.c5=_k_.kolor.F256(_k_.kolor.c(5));_k_.C5=_k_.kolor.B256(_k_.kolor.C(5));_k_.c6=_k_.kolor.F256(_k_.kolor.c(6));_k_.C6=_k_.kolor.B256(_k_.kolor.C(6));_k_.c7=_k_.kolor.F256(_k_.kolor.c(7));_k_.C7=_k_.kolor.B256(_k_.kolor.C(7));_k_.c8=_k_.kolor.F256(_k_.kolor.c(8));_k_.C8=_k_.kolor.B256(_k_.kolor.C(8));_k_.m1=_k_.kolor.F256(_k_.kolor.m(1));_k_.M1=_k_.kolor.B256(_k_.kolor.M(1));_k_.m2=_k_.kolor.F256(_k_.kolor.m(2));_k_.M2=_k_.kolor.B256(_k_.kolor.M(2));_k_.m3=_k_.kolor.F256(_k_.kolor.m(3));_k_.M3=_k_.kolor.B256(_k_.kolor.M(3));_k_.m4=_k_.kolor.F256(_k_.kolor.m(4));_k_.M4=_k_.kolor.B256(_k_.kolor.M(4));_k_.m5=_k_.kolor.F256(_k_.kolor.m(5));_k_.M5=_k_.kolor.B256(_k_.kolor.M(5));_k_.m6=_k_.kolor.F256(_k_.kolor.m(6));_k_.M6=_k_.kolor.B256(_k_.kolor.M(6));_k_.m7=_k_.kolor.F256(_k_.kolor.m(7));_k_.M7=_k_.kolor.B256(_k_.kolor.M(7));_k_.m8=_k_.kolor.F256(_k_.kolor.m(8));_k_.M8=_k_.kolor.B256(_k_.kolor.M(8));_k_.y1=_k_.kolor.F256(_k_.kolor.y(1));_k_.Y1=_k_.kolor.B256(_k_.kolor.Y(1));_k_.y2=_k_.kolor.F256(_k_.kolor.y(2));_k_.Y2=_k_.kolor.B256(_k_.kolor.Y(2));_k_.y3=_k_.kolor.F256(_k_.kolor.y(3));_k_.Y3=_k_.kolor.B256(_k_.kolor.Y(3));_k_.y4=_k_.kolor.F256(_k_.kolor.y(4));_k_.Y4=_k_.kolor.B256(_k_.kolor.Y(4));_k_.y5=_k_.kolor.F256(_k_.kolor.y(5));_k_.Y5=_k_.kolor.B256(_k_.kolor.Y(5));_k_.y6=_k_.kolor.F256(_k_.kolor.y(6));_k_.Y6=_k_.kolor.B256(_k_.kolor.Y(6));_k_.y7=_k_.kolor.F256(_k_.kolor.y(7));_k_.Y7=_k_.kolor.B256(_k_.kolor.Y(7));_k_.y8=_k_.kolor.F256(_k_.kolor.y(8));_k_.Y8=_k_.kolor.B256(_k_.kolor.Y(8));_k_.w1=_k_.kolor.F256(_k_.kolor.w(1));_k_.W1=_k_.kolor.B256(_k_.kolor.W(1));_k_.w2=_k_.kolor.F256(_k_.kolor.w(2));_k_.W2=_k_.kolor.B256(_k_.kolor.W(2));_k_.w3=_k_.kolor.F256(_k_.kolor.w(3));_k_.W3=_k_.kolor.B256(_k_.kolor.W(3));_k_.w4=_k_.kolor.F256(_k_.kolor.w(4));_k_.W4=_k_.kolor.B256(_k_.kolor.W(4));_k_.w5=_k_.kolor.F256(_k_.kolor.w(5));_k_.W5=_k_.kolor.B256(_k_.kolor.W(5));_k_.w6=_k_.kolor.F256(_k_.kolor.w(6));_k_.W6=_k_.kolor.B256(_k_.kolor.W(6));_k_.w7=_k_.kolor.F256(_k_.kolor.w(7));_k_.W7=_k_.kolor.B256(_k_.kolor.W(7));_k_.w8=_k_.kolor.F256(_k_.kolor.w(8));_k_.W8=_k_.kolor.B256(_k_.kolor.W(8))

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
        console.log(_k_.W1(kstr.lpad('',depth * 3 - 1) + ' ' + global[`g${Math.max(1,8 - 2 * depth)}`](kstr.pad(t,26 - depth * 3) + ' ')))
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
        if (!(a instanceof Array) && !(typeof(a) === 'object'))
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
                    keystack.splice(0,keystack.length)
                    return false
                }
                if (_k_.empty(keystack))
                {
                    return false
                }
                keystack.pop()
            }
        }
        else if (_k_.isStr(a))
        {
            if (a !== b)
            {
                console.log(_k_.r5(this.showSpace(a)))
                console.log(_k_.g3(this.showSpace(b)))
                return false
            }
        }
        else
        {
            if (!this.sameObjects(Object.keys(a),Object.keys(b)))
            {
                return false
            }
            for (k in a)
            {
                v = a[k]
                keystack.push(k)
                if (!this.sameObjects(v,b[k],keystack))
                {
                    keystack.splice(0,keystack.length)
                    return false
                }
                if (_k_.empty(keystack))
                {
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
        console.log(_k_.R1(black(ind + comps + ' ')) + ' ' + _k_.r5(this.short(a)) + ' ' + _k_.R1(_k_.r4(' ▸ ')) + ' ' + _k_.g1(this.short(b)))
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
                    console.log(_k_.G1(_k_.y8(' ' + kstr.pad(k,25) + ' ')))
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
        if (!(_k_.isStr(s)))
        {
            return _k_.noon(s)
        }
        return s.split('\n').map(function (l)
        {
            return l + _k_.w2('◂')
        }).join('\n')
    }

    summarize ()
    {
        var fail, summary

        var list = _k_.list(allfails)
        for (var _171_17_ = 0; _171_17_ < list.length; _171_17_++)
        {
            fail = list[_171_17_]
            console.log(_k_.R2(_k_.y5(' ' + fail.stack[0] + ' ')) + _k_.R1(_k_.y5(' ' + fail.stack.slice(1).join(_k_.r3(' ▸ ')) + ' ')))
            console.log(_k_.r5(this.showSpace(fail.lhs)))
            console.log(_k_.R1(_k_.r3(' ▸ ')))
            console.log(_k_.g3(this.showSpace(fail.rhs)))
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
            summary = _k_.w2(kstr.now() + ' ')
            if (allsuccs)
            {
                summary += _k_.g3(" ✔ ") + _k_.g1(allsuccs) + ' '
            }
            if (!_k_.empty(allfails))
            {
                summary += _k_.R2(_k_.y2(' ❌ ') + _k_.y6(allfails.length) + _k_.y3(' failures '))
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
                    a = _k_.min(v.length,30 - l)
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
        ss = split.join(_k_.w2('➜ '))
        if (l >= 30)
        {
            ss += _k_.w2('...')
        }
        return ss
    }
}

module.exports = Tester