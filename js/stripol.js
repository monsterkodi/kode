// monsterkodi/kode 0.141.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}}

var print

print = require('./print')
class Stripol
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
        this.scope(tl)
        return tl
    }

    scope (body)
    {
        var e, k

        var list = _k_.list(body.exps)
        for (k = 0; k < list.length; k++)
        {
            e = list[k]
            this.exp(body.exps,k,e)
        }
    }

    exp (p, k, e)
    {
        var v, key, val

        if (!e)
        {
            return
        }
        if (e.type)
        {
            if (_k_.in(e.type,['double','triple']))
            {
                p[k] = this.string(e)
            }
            return
        }
        else if (e instanceof Array)
        {
            if (e.length)
            {
                var list = _k_.list(e)
                for (k = 0; k < list.length; k++)
                {
                    v = list[k]
                    this.exp(e,k,v)
                }
            }
        }
        else if (e instanceof Object)
        {
            for (key in e)
            {
                val = e[key]
                if (val)
                {
                    if (val.type)
                    {
                        this.exp(e,key,val)
                    }
                    else
                    {
                        if (val instanceof Array)
                        {
                            if (val.length)
                            {
                                var list1 = _k_.list(val)
                                for (k = 0; k < list1.length; k++)
                                {
                                    v = list1[k]
                                    this.exp(val,k,v)
                                }
                            }
                        }
                        else
                        {
                            for (k in val)
                            {
                                v = val[k]
                                this.exp(val,k,v)
                            }
                        }
                    }
                }
            }
        }
    }

    string (e)
    {
        var s, chunks

        s = e.type === 'triple' ? e.text.slice(3, -3) : e.text.slice(1, -1)
        chunks = this.dissect(s,e.line,e.col)
        if (chunks.length > 1)
        {
            if (chunks.slice(-1)[0].type !== 'close')
            {
                chunks.push({type:'close',text:'',line:e.line,col:e.col + s.length})
            }
            return {stripol:chunks}
        }
        return e
    }

    dissect (s, line, col)
    {
        var c, chunks, push, t, m, ic, rgs, matches, k, r, length, index, b

        c = 0
        chunks = []
        push = (function (type, text)
        {
            var exps

            if (type === 'code')
            {
                exps = this.kode.ast(text).exps
                return chunks.push({type:type,exps:exps,line:line,col:col + c})
            }
            else
            {
                return chunks.push({type:type,text:text,line:line,col:col + c})
            }
        }).bind(this)
        while (c < s.length)
        {
            t = s.slice(c)
            if (!(m = /(?<!\\)#{/.exec(t)))
            {
                push('close',t)
                break
            }
            push(_k_.empty((chunks)) && 'open' || 'midl',t.slice(0, typeof m.index === 'number' ? m.index : -1))
            c += m.index + 2
            ic = c
            while (c < s.length)
            {
                t = s.slice(c)
                rgs = {triple:/"""(?:.|\n)*?"""/,double:/"(?:\\["\\]|[^\n"])*"/,single:/'(?:\\['\\]|[^\n'])*'/,comment:/[\#]/,open:/[\{]/,close:/[\}]/}
                matches = []
                for (k in rgs)
                {
                    r = rgs[k]
                    m = r.exec(t)
                    if ((m != null))
                    {
                        matches.push([k,m])
                    }
                }
                matches.sort(function (a, b)
                {
                    return a[1].index - b[1].index
                })
                length = matches[0][1][0].length
                index = matches[0][1].index
                b = ((function ()
                {
                    switch (matches[0][0])
                    {
                        case 'close':
                            push('code',s.slice(ic, c + index))
                            c += index + length
                            return true

                        case 'triple':
                        case 'double':
                        case 'single':
                            c += index + length
                            return false

                        default:
                            console.log('unhandled?',matches[0])
                            c += index + length
                            return true
                    }

                }).bind(this))()
                if (b)
                {
                    break
                }
            }
        }
        return chunks
    }

    verb ()
    {
        if (this.verbose)
        {
            return console.log.apply(console.log,arguments)
        }
    }
}

module.exports = Stripol