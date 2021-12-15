// monsterkodi/kode 0.128.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}}

var precedence, print


precedence = function (o)
{
    var t, _12_20_

    t = (o != null ? (_12_20_=o.operation) != null ? _12_20_.operator.text : undefined : undefined)
    switch (t)
    {
        case 'not':
        case 'delete':
        case 'empty':
        case 'valid':
        case '~':
            return 0

        case '*':
        case '/':
        case '%':
            return 1

        case '+':
        case '-':
            return 2

        case '<<':
        case '>>':
        case '>>>':
            return 3

        case '<':
        case '<=':
        case '>':
        case '>=':
            return 4

        case 'is':
        case 'equals':
            return 5

        case '==':
        case '!=':
            return 6

        case '&':
            return 7

        case '^':
            return 8

        case '|':
            return 9

        case 'and':
            return 10

        case 'or':
            return 11

        case '?':
        case '?:':
            return 12

        case '=':
            return 13

        case '+=':
        case '-=':
        case '*=':
        case '/=':
        case '%=':
        case '&=':
        case '^=':
        case '|=':
            return 14

        case '<<=':
        case '>>=':
        case '>>>=':
        case '&&=':
        case '||=':
        case '?=':
            return 15

        default:
            return Infinity
    }

}
print = require('./print')
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
        var _50_19_, e

        if ((tl != null ? (_50_19_=tl.exps) != null ? _50_19_.length : undefined : undefined))
        {
            var list = _k_.list(tl.exps)
            for (var _51_25_ = 0; _51_25_ < list.length; _51_25_++)
            {
                e = list[_51_25_]
                this.exp(e)
            }
        }
        return tl
    }

    exp (e)
    {
        var v, key, val

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
            this.op(e)
            return this.exp(e.operation.rhs)
        }
        else if (e instanceof Array)
        {
            if (e.length)
            {
                var list = _k_.list(e)
                for (var _66_42_ = 0; _66_42_ < list.length; _66_42_++)
                {
                    v = list[_66_42_]
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
                        this.exp(val)
                    }
                }
            }
        }
    }

    op (e)
    {
        var chain, c, _86_19_, p, i

        chain = [e]
        c = e.operation
        while ((c.rhs != null ? c.rhs.operation : undefined))
        {
            chain.push(c.rhs)
            c = c.rhs.operation
        }
        if (chain.length > 1)
        {
            p = chain.map(function (i)
            {
                return precedence(i)
            })
            if (this.debug)
            {
                this.logChain(chain,p)
            }
            for (i = 1; i < p.length; i++)
            {
                if (p[i] > p[i - 1])
                {
                    this.fixPrec(e,chain,p)
                    break
                }
            }
        }
    }

    fixPrec (e, chain, p)
    {
        var op, _115_52_, _115_91_, _115_81_, _115_70_, _123_41_, _123_30_, newlhs, newop, c, _150_27_

        if (this.debug)
        {
            this.logChain(chain,p,precedence(e),precedence(e.rhs))
        }
        if (precedence(e) < precedence(e.rhs))
        {
            op = e.operation
            if (op.operator.text === 'not' && ((op.rhs != null ? op.rhs.incond : undefined) || _k_.in(((_115_70_=op.rhs) != null ? (_115_81_=_115_70_.operation) != null ? (_115_91_=_115_81_.operator) != null ? _115_91_.text : undefined : undefined : undefined),['=','+=','-=','*=','/=','%=','^=','&=','|=','&&=','||='])))
            {
                this.verb('skip not in or not x ?=')
                return
            }
            if (_k_.in(op.operator.text,['=','+=','-=','*=','/=','%=','^=','&=','|=','&&=','||=']))
            {
                this.verb('skip assignment')
                return
            }
            if (_k_.in(((_123_30_=e.operation.rhs) != null ? (_123_41_=_123_30_.operation) != null ? _123_41_.operator.text : undefined : undefined),['=','+=','-=','*=','/=','%=','^=','&=','|=','&&=','||=']))
            {
                this.verb('skip rhs assignment')
                return
            }
            this.verb('swap',precedence(e),precedence(e.operation.rhs))
            if (this.debug)
            {
                print.ast('before swap',e)
            }
            newlhs = {operation:{lhs:e.operation.lhs,operator:e.operation.operator,rhs:e.operation.rhs.operation.lhs}}
            newop = {operation:{lhs:newlhs,operator:e.operation.rhs.operation.operator,rhs:e.operation.rhs.operation.rhs}}
            e.operation = newop.operation
            if (this.debug)
            {
                print.ast('after swap2',e)
            }
            if (this.debug)
            {
                chain = [e]
                c = e.operation
                while ((c.rhs != null ? c.rhs.operation : undefined))
                {
                    chain.push(c.rhs)
                    c = c.rhs.operation
                }
                p = chain.map(function (i)
                {
                    return precedence(i)
                })
                return this.logChain(chain,p)
            }
        }
    }

    logChain (chain, p)
    {
        var s, rndr, _166_49_

        s = ''
        rndr = (function (n)
        {
            try
            {
                return w2(this.kode.renderer.node(n))
            }
            catch (e)
            {
                return print.noon(e,n)
            }
        }).bind(this)
        s += chain.map((function (i)
        {
            return (rndr(i.operation.lhs)) + ' ' + w3(i.operation.operator.text) + ' ' + b6(precedence(i))
        }).bind(this)).join(' ')
        s += ' ' + ((_166_49_=rndr(chain.slice(-1)[0].operation.rhs)) != null ? _166_49_ : '...')
        console.log(w4('▪'),s,g3(p))
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