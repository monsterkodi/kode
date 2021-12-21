// monsterkodi/kode 0.179.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, dbg: function (f,l,c,m,...a) { console.log(f + ':' + l + ':' + c + (m ? ' ' + m + '\n' : '\n') + a.map(function (a) { return _k_.noon(a) }).join(' '))}, noon: function (obj) { var pad = function (s, l) { while (s.length < l) { s += ' ' }; return s }; var esc = function (k, arry) { var es, sp; if (0 <= k.indexOf('\n')) { sp = k.split('\n'); es = sp.map(function (s) { return esc(s,arry) }); es.unshift('...'); es.push('...'); return es.join('\n') } if (k === '' || k === '...' || _k_.in(k[0],[' ','#','|']) || _k_.in(k[k.length - 1],[' ','#','|'])) { k = '|' + k + '|' } else if (arry && /  /.test(k)) { k = '|' + k + '|' }; return k }; var pretty = function (o, ind, seen) { var k, kl, l, v, mk = 4; if (Object.keys(o).length > 1) { for (k in o) { v = o[k]; if (o.hasOwnProperty(k)) { kl = parseInt(Math.ceil((k.length + 2) / 4) * 4); mk = Math.max(mk,kl); if (mk > 32) { mk = 32; break } } } }; l = []; var keyValue = function (k, v) { var i, ks, s, vs; s = ind; k = esc(k,true); if (k.indexOf('  ') > 0 && k[0] !== '|') { k = `|${k}|` } else if (k[0] !== '|' && k[k.length - 1] === '|') { k = '|' + k } else if (k[0] === '|' && k[k.length - 1] !== '|') { k += '|' }; ks = pad(k,Math.max(mk,k.length + 2)); i = pad(ind + '    ',mk); s += ks; vs = toStr(v,i,false,seen); if (vs[0] === '\n') { while (s[s.length - 1] === ' ') { s = s.substr(0,s.length - 1) } }; s += vs; while (s[s.length - 1] === ' ') { s = s.substr(0,s.length - 1) }; return s }; for (k in o) { v = o[k]; if (o.hasOwnProperty(k)) { l.push(keyValue(k,v)) } }; return l.join('\n') }; var toStr = function (o, ind = '', arry = false, seen = []) { var s, t, v; if (!(o != null)) { if (o === null) { return 'null' }; if (o === undefined) { return 'undefined' }; return '<?>' }; switch (t = typeof(o)) { case 'string': {return esc(o,arry)}; case 'object': { if (_k_.in(o,seen)) { return '<v>' }; seen.push(o); if ((o.constructor != null ? o.constructor.name : undefined) === 'Array') { s = ind !== '' && arry && '.' || ''; if (o.length && ind !== '') { s += '\n' }; s += (function () { var result = []; var list = _k_.list(o); for (var li = 0; li < list.length; li++)  { v = list[li];result.push(ind + toStr(v,ind + '    ',true,seen))  } return result }).bind(this)().join('\n') } else if ((o.constructor != null ? o.constructor.name : undefined) === 'RegExp') { return o.source } else { s = (arry && '.\n') || ((ind !== '') && '\n' || ''); s += pretty(o,ind,seen) }; return s } default: return String(o) }; return '<???>' }; return toStr(obj) }, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}}

class Scoper
{
    constructor (kode)
    {
        this.kode = kode
        this.verbose = this.kode.args.verbose
        this.debug = this.kode.args.debug
        this.raw = this.kode.args.raw
    }

    collect (tl)
    {
        this.maps = []
        this.args = []
        this.vars = []
        this.scope(tl)
        return tl
    }

    scope (body)
    {
        var e

        this.maps.push({})
        this.args.push({})
        this.vars.push(body.vars)
        var list = _k_.list(body.exps)
        for (var _44_21_ = 0; _44_21_ < list.length; _44_21_++)
        {
            e = list[_44_21_]
            this.exp(e)
        }
        this.maps.pop()
        this.args.pop()
        this.vars.pop()
        return body
    }

    func (f)
    {
        var arg, e, t, _62_25_, _65_37_, _65_42_, _68_69_, _68_74_, _70_30_

        this.maps.push({})
        this.args.push({})
        this.vars.push(f.body.vars)
        var list = _k_.list((f.args != null ? f.args.parens.exps : undefined))
        for (var _62_16_ = 0; _62_16_ < list.length; _62_16_++)
        {
            arg = list[_62_16_]
            if (t = arg.text)
            {
                this.args.slice(-1)[0][t] = t
            }
            else if (t = ((_65_37_=arg.operation) != null ? (_65_42_=_65_37_.lhs) != null ? _65_42_.text : undefined : undefined))
            {
                this.args.slice(-1)[0][t] = t
            }
            else
            {
                if (((_68_69_=arg.prop) != null ? (_68_74_=_68_69_.obj) != null ? _68_74_.text : undefined : undefined) !== '@')
                {
                    _k_.dbg("kode/scoper.kode", 68, 16, null, 'todo: scoper handle complex arg',arg)
                }
            }
        }
        var list1 = _k_.list((f.body != null ? f.body.exps : undefined))
        for (var _70_21_ = 0; _70_21_ < list1.length; _70_21_++)
        {
            e = list1[_70_21_]
            this.exp(e)
        }
        this.maps.pop()
        this.args.pop()
        this.vars.pop()
        return f
    }

    exp (e)
    {
        var fv, insert, key, keyval, op, v, val, _105_29_, _116_25_, _121_37_, _121_45_

        if (!e)
        {
            return
        }
        insert = (function (v, t)
        {
            var arg, map

            var list = _k_.list(this.maps)
            for (var _88_37_ = 0; _88_37_ < list.length; _88_37_++)
            {
                map = list[_88_37_]
                if (map[v])
                {
                    return
                }
            }
            var list1 = _k_.list(this.args)
            for (var _89_37_ = 0; _89_37_ < list1.length; _89_37_++)
            {
                arg = list1[_89_37_]
                if (arg[v])
                {
                    return
                }
            }
            this.verb(yellow(v),red(t))
            this.vars.slice(-1)[0].push({text:v,type:t})
            return this.maps.slice(-1)[0][v] = t
        }).bind(this)
        if (e.type)
        {
            if (e.type === 'code')
            {
                this.exp(e.exps)
            }
            return
        }
        else if (e instanceof Array)
        {
            if (e.length)
            {
                var list = _k_.list(e)
                for (var _100_46_ = 0; _100_46_ < list.length; _100_46_++)
                {
                    v = list[_100_46_]
                    this.exp(v)
                }
            }
        }
        else if (e instanceof Object)
        {
            if (op = e.operation)
            {
                if (op.operator.text === '=')
                {
                    if ((op.lhs != null ? op.lhs.text : undefined))
                    {
                        insert(op.lhs.text,op.operator.text)
                    }
                    else if (op.lhs.object)
                    {
                        var list1 = _k_.list(op.lhs.object.keyvals)
                        for (var _108_35_ = 0; _108_35_ < list1.length; _108_35_++)
                        {
                            keyval = list1[_108_35_]
                            if (keyval.type === 'var')
                            {
                                insert(keyval.text,'curly')
                            }
                        }
                    }
                    else if (op.lhs.array)
                    {
                        var list2 = _k_.list(op.lhs.array.items)
                        for (var _112_32_ = 0; _112_32_ < list2.length; _112_32_++)
                        {
                            val = list2[_112_32_]
                            if (val.type === 'var')
                            {
                                insert(val.text,'array')
                            }
                        }
                    }
                }
            }
            if (fv = (e.for != null ? e.for.vals : undefined))
            {
                if (fv.text)
                {
                    insert(fv.text,'for')
                }
                else
                {
                    var list3 = ((_121_45_=(fv.array != null ? fv.array.items : undefined)) != null ? _121_45_ : e.for.vals)
                    for (var _121_26_ = 0; _121_26_ < list3.length; _121_26_++)
                    {
                        v = list3[_121_26_]
                        if (v.text)
                        {
                            insert(v.text,'for')
                        }
                    }
                }
            }
            if (e.assert)
            {
                this.verb('assert',e)
                if (e.assert.obj.type !== 'var' && !e.assert.obj.index)
                {
                    insert(`_${e.assert.qmrk.line}_${e.assert.qmrk.col}_`,'?.')
                }
            }
            if (e.qmrkop)
            {
                this.verb('qmrkop',e)
                if (e.qmrkop.lhs.type !== 'var')
                {
                    insert(`_${e.qmrkop.qmrk.line}_${e.qmrkop.qmrk.col}_`,' ? ')
                }
            }
            if (e.function)
            {
                insert(e.function.name.text)
            }
            if (e.func)
            {
                this.func(e.func)
            }
            else
            {
                for (key in e)
                {
                    val = e[key]
                    this.exp(val)
                }
            }
        }
        return
    }

    verb ()
    {
        if (this.verbose)
        {
            return console.log.apply(console.log,arguments)
        }
    }
}

module.exports = Scoper