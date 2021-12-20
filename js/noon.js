// monsterkodi/kode 0.154.0

var _k_ = {in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var noon


noon = function (obj)
{
    var esc, pad, pretty, toStr

    pad = function (s, l)
    {
        while (s.length < l)
        {
            s += ' '
        }
        return s
    }
    esc = function (k, arry)
    {
        var es, sp

        if (0 <= k.indexOf('\n'))
        {
            sp = k.split('\n')
            es = sp.map(function (s)
            {
                return esc(s,arry)
            })
            es.unshift('...')
            es.push('...')
            return es.join('\n')
        }
        if (k === '' || k === '...' || _k_.in(k[0],[' ','#','|']) || _k_.in(k[k.length - 1],[' ','#','|']))
        {
            k = '|' + k + '|'
        }
        else if (arry && /\ \ /.test(k))
        {
            k = '|' + k + '|'
        }
        return k
    }
    pretty = function (o, ind, seen)
    {
        var k, keyValue, kl, l, mk, v

        mk = 4
        if (Object.keys(o).length > 1)
        {
            for (k in o)
            {
                v = o[k]
                if (o.hasOwnProperty(k))
                {
                    kl = parseInt(Math.ceil((k.length + 2) / 4) * 4)
                    mk = Math.max(mk,kl)
                    if (mk > 32)
                    {
                        mk = 32
                        break
                    }
                }
            }
        }
        l = []
        keyValue = function (k, v)
        {
            var i, ks, s, vs

            s = ind
            k = esc(k,true)
            if (k.indexOf('  ') > 0 && k[0] !== '|')
            {
                k = `|${k}|`
            }
            else if (k[0] !== '|' && k[k.length - 1] === '|')
            {
                k = '|' + k
            }
            else if (k[0] === '|' && k[k.length - 1] !== '|')
            {
                k += '|'
            }
            ks = pad(k,Math.max(mk,k.length + 2))
            i = pad(ind + '    ',mk)
            s += ks
            vs = toStr(v,i,false,seen)
            if (vs[0] === '\n')
            {
                while (s[s.length - 1] === ' ')
                {
                    s = s.substr(0,s.length - 1)
                }
            }
            s += vs
            while (s[s.length - 1] === ' ')
            {
                s = s.substr(0,s.length - 1)
            }
            return s
        }
        for (k in o)
        {
            v = o[k]
            if (o.hasOwnProperty(k))
            {
                l.push(keyValue(k,v))
            }
        }
        return l.join('\n')
    }
    toStr = function (o, ind = '', arry = false, seen = [])
    {
        var s, t, v, _105_32_, _109_37_

        if (!(o != null))
        {
            if (o === null)
            {
                return "null"
            }
            if (o === undefined)
            {
                return "undefined"
            }
            return '<?>'
        }
        switch (t = typeof(o))
        {
            case 'string':
                return esc(o,arry)

            case 'object':
                if (_k_.in(o,seen))
                {
                    return '<v>'
                }
                seen.push(o)
                if ((o.constructor != null ? o.constructor.name : undefined) === 'Array')
                {
                    s = ind !== '' && arry && '.' || ''
                    if (o.length && ind !== '')
                    {
                        s += '\n'
                    }
                    s += (function () { var result = []; var list = _k_.list(o); for (var _108_66_ = 0; _108_66_ < list.length; _108_66_++)  { v = list[_108_66_];result.push(ind + toStr(v,ind + '    ',true,seen))  } return result }).bind(this)().join('\n')
                }
                else if ((o.constructor != null ? o.constructor.name : undefined) === 'RegExp')
                {
                    return o.source
                }
                else
                {
                    s = (arry && '.\n') || ((ind !== '') && '\n' || '')
                    s += pretty(o,ind,seen)
                }
                return s

            default:
                return String(o)
        }

        return '<???>'
    }
    return toStr(obj)
}