// monsterkodi/kode 0.125.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

class Operator
{
    constructor (kode)
    {
        this.kode = kode
        this.verbose = this.kode.args.verbose
        this.debug = this.kode.args.debug
    }

    collect (tl)
    {
        return this.scope(tl)
    }

    scope (body)
    {
        var _34_21_, e

        if ((body != null ? (_34_21_=body.exps) != null ? _34_21_.length : undefined : undefined))
        {
            var list = _k_.list(body.exps)
            for (var _35_25_ = 0; _35_25_ < list.length; _35_25_++)
            {
                e = list[_35_25_]
                this.exp(e)
            }
        }
        return body
    }

    exp (e)
    {
        var v, key, val, k

        if (!e)
        {
            return
        }
        else if (e.type)
        {
            return
        }
        else if (e.operation)
        {
            return this.op(e)
        }
        else if (e instanceof Array)
        {
            if (e.length)
            {
                var list = _k_.list(e)
                for (var _50_50_ = 0; _50_50_ < list.length; _50_50_++)
                {
                    v = list[_50_50_]
                    this.exp(v)
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
                    if (val.operation)
                    {
                        this.op(val)
                    }
                    else
                    {
                        if (val instanceof Array)
                        {
                            var list1 = _k_.list(val)
                            for (var _57_45_ = 0; _57_45_ < list1.length; _57_45_++)
                            {
                                v = list1[_57_45_]
                                this.exp(v)
                            }
                        }
                        else
                        {
                            for (k in val)
                            {
                                v = val[k]
                                this.exp(v)
                            }
                        }
                    }
                }
            }
        }
    }

    op (e)
    {
        var chain, c, _72_19_, print, s, rndr, _81_53_

        chain = [e]
        c = e.operation
        while ((c.rhs != null ? c.rhs.operation : undefined))
        {
            chain.push(c.rhs)
            c = c.rhs.operation
        }
        if (chain.length > 1)
        {
            print = require('./print')
            s = ''
            rndr = (function (n)
            {
                return n
            }).bind(this)
            s += chain.map((function (i)
            {
                return (rndr(i.operation.lhs)) + ' ' + i.operation.operator.text
            }).bind(this)).join(' ')
            s += ' ' + ((_81_53_=rndr(chain.slice(-1)[0].operation.rhs)) != null ? _81_53_ : '...')
            console.log(w4('operator.op chain'),s)
        }
    }

    verb ()
    {
        if (this.verbose)
        {
            return console.log.apply(console.log,arguments)
        }
    }
}

module.exports = Operator