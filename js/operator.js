// monsterkodi/kode 0.163.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}}

var assign, precedence, print


precedence = function (o)
{
    var t, _15_20_

    if ((o != null ? o.qmrkcolon : undefined))
    {
        return 12
    }
    t = (o != null ? (_15_20_=o.operation) != null ? _15_20_.operator.text : undefined : undefined)
    switch (t)
    {
        case 'copy':
        case 'clone':
        case 'new':
        case 'not':
        case 'delete':
        case 'empty':
        case 'valid':
        case '~':
        case 'noon':
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
assign = ['=','+=','-=','*=','/=','%=','^=','&=','|=','&&=','||=']
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
        var e, _56_19_

        if ((tl != null ? (_56_19_=tl.exps) != null ? _56_19_.length : undefined : undefined))
        {
            var list = _k_.list(tl.exps)
            for (var _57_25_ = 0; _57_25_ < list.length; _57_25_++)
            {
                e = list[_57_25_]
                this.exp(e)
            }
        }
        return tl
    }

    exp (e)
    {
        var key, v, val, _74_30_

        if (!e)
        {
            return
        }
        else if (e.type)
        {
            return
        }
        else if (e instanceof Array)
        {
            if (e.length)
            {
                var list = _k_.list(e)
                for (var _71_42_ = 0; _71_42_ < list.length; _71_42_++)
                {
                    v = list[_71_42_]
                    this.exp(v)
                }
            }
        }
        else if (e.operation)
        {
            this.op(e)
            if ((e.operation != null ? e.operation.rhs : undefined))
            {
                return this.exp(e.operation.rhs)
            }
            else if (e.qmrkcolon)
            {
                this.exp(e.qmrkcolon.mid)
                return this.exp(e.qmrkcolon.rhs)
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
        var c, chain, i, p, _96_19_, _96_39_, _98_40_

        chain = [e]
        c = e.operation
        while ((c.rhs != null ? c.rhs.operation : undefined) || (c.rhs != null ? c.rhs.qmrkcolon : undefined))
        {
            chain.push(c.rhs)
            c = c.rhs.operation || (c.rhs != null ? c.rhs.qmrkcolon : undefined)
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
        var newlhs, newop, op, _126_23_, _126_41_, _126_52_, _126_62_, _130_37_, _130_48_

        if (this.debug)
        {
            this.logChain(chain,p,precedence(e),precedence(e.rhs))
        }
        if (precedence(e) < precedence(e.rhs))
        {
            op = e.operation || e.qmrkcolon
            if (op.operator.text === 'not' && _k_.in(((op.rhs != null ? op.rhs.incond : undefined) || ((_126_41_=op.rhs) != null ? (_126_52_=_126_41_.operation) != null ? (_126_62_=_126_52_.operator) != null ? _126_62_.text : undefined : undefined : undefined)),assign))
            {
                return
            }
            if (_k_.in(op.operator.text,assign))
            {
                return
            }
            if (_k_.in(((_130_37_=e.operation.rhs) != null ? (_130_48_=_130_37_.operation) != null ? _130_48_.operator.text : undefined : undefined),assign))
            {
                return
            }
            this.verb('swap',precedence(e),precedence(op.rhs))
            if (this.debug)
            {
                print.ast('before swap',e)
            }
            if (op.rhs.qmrkcolon)
            {
                newlhs = {operation:{lhs:op.lhs,operator:op.operator,rhs:op.rhs.qmrkcolon.lhs}}
                newop = {lhs:newlhs,qmrk:op.rhs.qmrkcolon.qmrk,mid:op.rhs.qmrkcolon.mid,colon:op.rhs.qmrkcolon.colon,rhs:op.rhs.qmrkcolon.rhs}
                delete e.operation
                e.qmrkcolon = newop
            }
            else
            {
                newlhs = {operation:{lhs:op.lhs,operator:op.operator,rhs:op.rhs.operation.lhs}}
                newop = {lhs:newlhs,operator:op.rhs.operation.operator,rhs:op.rhs.operation.rhs}
                e.operation = newop
            }
            if (this.debug)
            {
                return print.ast('after swap2',e)
            }
        }
    }

    logChain (chain, p)
    {
        var rndr, s, _182_43_, _182_50_

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
            if (i.operation)
            {
                return (rndr(i.operation.lhs)) + ' ' + w3(i.operation.operator.text) + ' ' + b6(precedence(i))
            }
            else
            {
                return (rndr(i.qmrkcolon.lhs)) + ' ? ' + (rndr(i.qmrkcolon.mid)) + ' '
            }
        }).bind(this)).join(' ')
        s += ' ' + ((_182_50_=rndr((chain.slice(-1)[0].operation != null ? chain.slice(-1)[0].operation.rhs : undefined))) != null ? _182_50_ : '...')
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