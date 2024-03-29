// monsterkodi/kode 0.256.0

var _k_ = {list: function (l) {return l != null ? typeof l.length === 'number' ? l : [] : []}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, k: { f:(r,g,b)=>'\x1b[38;5;'+(16+36*r+6*g+b)+'m', F:(r,g,b)=>'\x1b[48;5;'+(16+36*r+6*g+b)+'m', r:(i)=>(i<6)&&_k_.k.f(i,0,0)||_k_.k.f(5,i-5,i-5), R:(i)=>(i<6)&&_k_.k.F(i,0,0)||_k_.k.F(5,i-5,i-5), g:(i)=>(i<6)&&_k_.k.f(0,i,0)||_k_.k.f(i-5,5,i-5), G:(i)=>(i<6)&&_k_.k.F(0,i,0)||_k_.k.F(i-5,5,i-5), b:(i)=>(i<6)&&_k_.k.f(0,0,i)||_k_.k.f(i-5,i-5,5), B:(i)=>(i<6)&&_k_.k.F(0,0,i)||_k_.k.F(i-5,i-5,5), y:(i)=>(i<6)&&_k_.k.f(i,i,0)||_k_.k.f(5,5,i-5), Y:(i)=>(i<6)&&_k_.k.F(i,i,0)||_k_.k.F(5,5,i-5), m:(i)=>(i<6)&&_k_.k.f(i,0,i)||_k_.k.f(5,i-5,5), M:(i)=>(i<6)&&_k_.k.F(i,0,i)||_k_.k.F(5,i-5,5), c:(i)=>(i<6)&&_k_.k.f(0,i,i)||_k_.k.f(i-5,5,5), C:(i)=>(i<6)&&_k_.k.F(0,i,i)||_k_.k.F(i-5,5,5), w:(i)=>'\x1b[38;5;'+(232+(i-1)*3)+'m', W:(i)=>'\x1b[48;5;'+(232+(i-1)*3+2)+'m', wrap:(open,close,reg)=>(s)=>open+(~(s+='').indexOf(close,4)&&s.replace(reg,open)||s)+close, F256:(open)=>_k_.k.wrap(open,'\x1b[39m',new RegExp('\\x1b\\[39m','g')), B256:(open)=>_k_.k.wrap(open,'\x1b[49m',new RegExp('\\x1b\\[49m','g'))}};_k_.g3=_k_.k.F256(_k_.k.g(3));_k_.b6=_k_.k.F256(_k_.k.b(6));_k_.w2=_k_.k.F256(_k_.k.w(2));_k_.w3=_k_.k.F256(_k_.k.w(3));_k_.w4=_k_.k.F256(_k_.k.w(4))

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
        case 'new':
            return -1

        case 'is':
        case 'equals':
        case 'noon':
            return 0

        case 'copy':
        case 'clone':
        case 'not':
        case 'delete':
        case 'empty':
        case 'valid':
        case '~':
            return 1

        case '*':
        case '/':
        case '%':
            return 2

        case '+':
        case '-':
            return 3

        case '<<':
        case '>>':
        case '>>>':
            return 4

        case '<':
        case '<=':
        case '>':
        case '>=':
            return 5

        case '==':
        case '!=':
        case 'eql':
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
        var e, _58_19_

        if ((tl != null ? (_58_19_=tl.exps) != null ? _58_19_.length : undefined : undefined))
        {
            var list = _k_.list(tl.exps)
            for (var _59_25_ = 0; _59_25_ < list.length; _59_25_++)
            {
                e = list[_59_25_]
                this.exp(e)
            }
        }
        return tl
    }

    exp (e)
    {
        var key, v, val, _76_30_

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
                for (var _73_42_ = 0; _73_42_ < list.length; _73_42_++)
                {
                    v = list[_73_42_]
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
        var c, chain, i, p, _100_40_, _98_19_, _98_39_

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
            for (var _108_21_ = i = 1, _108_25_ = p.length; (_108_21_ <= _108_25_ ? i < p.length : i > p.length); (_108_21_ <= _108_25_ ? ++i : --i))
            {
                if (p[i] > p[i - 1])
                {
                    this.fixPrec(e)
                    break
                }
            }
        }
        else
        {
            return this.exp(e.operation.rhs)
        }
    }

    fixPrec (e)
    {
        var newlhs, newop, op, _129_23_, _129_41_, _129_52_, _129_62_, _133_37_, _133_48_, _169_54_, _169_84_, _175_32_, _175_53_

        op = e.operation || e.qmrkcolon
        if (precedence(e) < precedence(op.rhs))
        {
            if (op.operator.text === 'not' && _k_.in(((op.rhs != null ? op.rhs.incond : undefined) || ((_129_41_=op.rhs) != null ? (_129_52_=_129_41_.operation) != null ? (_129_62_=_129_52_.operator) != null ? _129_62_.text : undefined : undefined : undefined)),assign))
            {
                return
            }
            if (_k_.in(op.operator.text,assign))
            {
                return
            }
            if (_k_.in(((_133_37_=e.operation.rhs) != null ? (_133_48_=_133_37_.operation) != null ? _133_48_.operator.text : undefined : undefined),assign))
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
                if ((e.operation.rhs != null ? e.operation.rhs.operation : undefined) || (e.operation.rhs != null ? e.operation.rhs.qmrkcolon : undefined))
                {
                    this.op(e.operation.rhs)
                }
            }
            if (this.debug)
            {
                return print.ast('after swap2',e)
            }
        }
        else
        {
            if ((op.rhs != null ? op.rhs.operation : undefined) || (op.rhs != null ? op.rhs.qmrkcolon : undefined))
            {
                this.op(op.rhs)
            }
            if (precedence(e) < precedence(op.rhs))
            {
                return this.fixPrec(e)
            }
        }
    }

    logChain (chain, p)
    {
        var rndr, s, _193_43_, _193_50_

        s = ''
        rndr = (function (n)
        {
            try
            {
                return _k_.w2(this.kode.renderer.node(n))
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
                return (rndr(i.operation.lhs)) + ' ' + _k_.w3(i.operation.operator.text) + ' ' + _k_.b6(precedence(i))
            }
            else
            {
                return (rndr(i.qmrkcolon.lhs)) + ' ? ' + (rndr(i.qmrkcolon.mid)) + ' '
            }
        }).bind(this)).join(' ')
        s += ' ' + ((_193_50_=rndr((chain.slice(-1)[0].operation != null ? chain.slice(-1)[0].operation.rhs : undefined))) != null ? _193_50_ : '...')
        console.log(_k_.w4('▪'),s,_k_.g3(p))
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