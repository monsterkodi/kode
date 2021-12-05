// monsterkodi/kode 0.41.0

var print

empty = require('./utils').empty

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

        var list = (body.exps != null ? body.exps : [])
        for (k = 0; k < list.length; k++)
        {
            e = list[k]
            this.exp(body.exps,k,e)
        }
    }

    exp (p, k, e)
    {
        var v, k, key, val

        if (!e)
        {
            return
        }
        if (e.type)
        {
            if (['double','triple'].indexOf(e.type) >= 0)
            {
                p[k] = this.string(e)
            }
            return
        }
        else if (e instanceof Array)
        {
            if (e.length)
            {
                var list = (e != null ? e : [])
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
                                var list1 = (val != null ? val : [])
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
        push = function (type, text)
        {
            return chunks.push({type:type,text:text,line:line,col:col + c})
        }
        while (c < s.length)
        {
            t = s.slice(c)
            if (!(m = /(?<!\\)#{/.exec(t)))
            {
                push('close',t)
                break
            }
            push(empty(chunks) && 'open' || 'midl',t.slice(0, typeof m.index === 'number' ? m.index : -1))
            c += m.index + 2
            ic = c
            while (c < s.length)
            {
                t = s.slice(c)
                rgs = {triple:/"""(?:.|\n)*?"""/,double:/"(?:\\["\\]|[^\n"])*"/,single:/'(?:\\['\\]|[^\n'])*'/,comment:/#/,open:/{/,close:/}/}
                matches = (function () { var result = []; for (var k in rgs)  { var r = rgs[k];result.push([k,r.exec(t)])  } return result }).bind(this)()
                matches = matches.filter(function (m)
                {
                    return (m[1] != null)
                })
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