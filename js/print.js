// monsterkodi/kode 0.231.0

var _k_ = {kolor: { f: function (r, g, b) { return '\x1b[38;5;' + (16 + 36 * r + 6 * g + b) + 'm' }, F: function (r, g, b) { return '\x1b[48;5;' + (16 + 36 * r + 6 * g + b) + 'm' }, r: function (i = 4) { return (i < 6) && _k_.kolor.f(i,0,0) || _k_.kolor.f(5,i - 5,i - 5) }, R: function (i = 4) { return (i < 6) && _k_.kolor.F(i,0,0) || _k_.kolor.F(5,i - 5,i - 5) }, g: function (i = 4) { return (i < 6) && _k_.kolor.f(0,i,0) || _k_.kolor.f(i - 5,5,i - 5) }, G: function (i = 4) { return (i < 6) && _k_.kolor.F(0,i,0) || _k_.kolor.F(i - 5,5,i - 5) }, b: function (i = 4) { return (i < 6) && _k_.kolor.f(0,0,i) || _k_.kolor.f(i - 5,i - 5,5) }, B: function (i = 4) { return (i < 6) && _k_.kolor.F(0,0,i) || _k_.kolor.F(i - 5,i - 5,5) }, y: function (i = 4) { return (i < 6) && _k_.kolor.f(i,i,0) || _k_.kolor.f(5,5,i - 5) }, Y: function (i = 4) { return (i < 6) && _k_.kolor.F(i,i,0) || _k_.kolor.F(5,5,i - 5) }, m: function (i = 4) { return (i < 6) && _k_.kolor.f(i,0,i) || _k_.kolor.f(5,i - 5,5) }, M: function (i = 4) { return (i < 6) && _k_.kolor.F(i,0,i) || _k_.kolor.F(5,i - 5,5) }, c: function (i = 4) { return (i < 6) && _k_.kolor.f(0,i,i) || _k_.kolor.f(i - 5,5,5) }, C: function (i = 4) { return (i < 6) && _k_.kolor.F(0,i,i) || _k_.kolor.F(i - 5,5,5) }, w: function (i = 4) { return '\x1b[38;5;' + (232 + (i - 1) * 3) + 'm' }, W: function (i = 4) { return '\x1b[48;5;' + (232 + (i - 1) * 3 + 2) + 'm' }, wrap: function (open, close, reg) { return function (s) { return open + (~(s += '').indexOf(close,4) && s.replace(reg,open) || s) + close } }, F256: function (open) { return _k_.kolor.wrap(open,'\x1b[39m',new RegExp('\\x1b\\[39m','g')) }, B256: function (open) { return _k_.kolor.wrap(open,'\x1b[49m',new RegExp('\\x1b\\[49m','g')) }}, list: function (l) {return l != null ? typeof l.length === 'number' ? l : [] : []}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}};_k_.r1=_k_.kolor.F256(_k_.kolor.r(1));_k_.R1=_k_.kolor.B256(_k_.kolor.R(1));_k_.r2=_k_.kolor.F256(_k_.kolor.r(2));_k_.R2=_k_.kolor.B256(_k_.kolor.R(2));_k_.r3=_k_.kolor.F256(_k_.kolor.r(3));_k_.R3=_k_.kolor.B256(_k_.kolor.R(3));_k_.r4=_k_.kolor.F256(_k_.kolor.r(4));_k_.R4=_k_.kolor.B256(_k_.kolor.R(4));_k_.r5=_k_.kolor.F256(_k_.kolor.r(5));_k_.R5=_k_.kolor.B256(_k_.kolor.R(5));_k_.r6=_k_.kolor.F256(_k_.kolor.r(6));_k_.R6=_k_.kolor.B256(_k_.kolor.R(6));_k_.r7=_k_.kolor.F256(_k_.kolor.r(7));_k_.R7=_k_.kolor.B256(_k_.kolor.R(7));_k_.r8=_k_.kolor.F256(_k_.kolor.r(8));_k_.R8=_k_.kolor.B256(_k_.kolor.R(8));_k_.g1=_k_.kolor.F256(_k_.kolor.g(1));_k_.G1=_k_.kolor.B256(_k_.kolor.G(1));_k_.g2=_k_.kolor.F256(_k_.kolor.g(2));_k_.G2=_k_.kolor.B256(_k_.kolor.G(2));_k_.g3=_k_.kolor.F256(_k_.kolor.g(3));_k_.G3=_k_.kolor.B256(_k_.kolor.G(3));_k_.g4=_k_.kolor.F256(_k_.kolor.g(4));_k_.G4=_k_.kolor.B256(_k_.kolor.G(4));_k_.g5=_k_.kolor.F256(_k_.kolor.g(5));_k_.G5=_k_.kolor.B256(_k_.kolor.G(5));_k_.g6=_k_.kolor.F256(_k_.kolor.g(6));_k_.G6=_k_.kolor.B256(_k_.kolor.G(6));_k_.g7=_k_.kolor.F256(_k_.kolor.g(7));_k_.G7=_k_.kolor.B256(_k_.kolor.G(7));_k_.g8=_k_.kolor.F256(_k_.kolor.g(8));_k_.G8=_k_.kolor.B256(_k_.kolor.G(8));_k_.b1=_k_.kolor.F256(_k_.kolor.b(1));_k_.B1=_k_.kolor.B256(_k_.kolor.B(1));_k_.b2=_k_.kolor.F256(_k_.kolor.b(2));_k_.B2=_k_.kolor.B256(_k_.kolor.B(2));_k_.b3=_k_.kolor.F256(_k_.kolor.b(3));_k_.B3=_k_.kolor.B256(_k_.kolor.B(3));_k_.b4=_k_.kolor.F256(_k_.kolor.b(4));_k_.B4=_k_.kolor.B256(_k_.kolor.B(4));_k_.b5=_k_.kolor.F256(_k_.kolor.b(5));_k_.B5=_k_.kolor.B256(_k_.kolor.B(5));_k_.b6=_k_.kolor.F256(_k_.kolor.b(6));_k_.B6=_k_.kolor.B256(_k_.kolor.B(6));_k_.b7=_k_.kolor.F256(_k_.kolor.b(7));_k_.B7=_k_.kolor.B256(_k_.kolor.B(7));_k_.b8=_k_.kolor.F256(_k_.kolor.b(8));_k_.B8=_k_.kolor.B256(_k_.kolor.B(8));_k_.c1=_k_.kolor.F256(_k_.kolor.c(1));_k_.C1=_k_.kolor.B256(_k_.kolor.C(1));_k_.c2=_k_.kolor.F256(_k_.kolor.c(2));_k_.C2=_k_.kolor.B256(_k_.kolor.C(2));_k_.c3=_k_.kolor.F256(_k_.kolor.c(3));_k_.C3=_k_.kolor.B256(_k_.kolor.C(3));_k_.c4=_k_.kolor.F256(_k_.kolor.c(4));_k_.C4=_k_.kolor.B256(_k_.kolor.C(4));_k_.c5=_k_.kolor.F256(_k_.kolor.c(5));_k_.C5=_k_.kolor.B256(_k_.kolor.C(5));_k_.c6=_k_.kolor.F256(_k_.kolor.c(6));_k_.C6=_k_.kolor.B256(_k_.kolor.C(6));_k_.c7=_k_.kolor.F256(_k_.kolor.c(7));_k_.C7=_k_.kolor.B256(_k_.kolor.C(7));_k_.c8=_k_.kolor.F256(_k_.kolor.c(8));_k_.C8=_k_.kolor.B256(_k_.kolor.C(8));_k_.m1=_k_.kolor.F256(_k_.kolor.m(1));_k_.M1=_k_.kolor.B256(_k_.kolor.M(1));_k_.m2=_k_.kolor.F256(_k_.kolor.m(2));_k_.M2=_k_.kolor.B256(_k_.kolor.M(2));_k_.m3=_k_.kolor.F256(_k_.kolor.m(3));_k_.M3=_k_.kolor.B256(_k_.kolor.M(3));_k_.m4=_k_.kolor.F256(_k_.kolor.m(4));_k_.M4=_k_.kolor.B256(_k_.kolor.M(4));_k_.m5=_k_.kolor.F256(_k_.kolor.m(5));_k_.M5=_k_.kolor.B256(_k_.kolor.M(5));_k_.m6=_k_.kolor.F256(_k_.kolor.m(6));_k_.M6=_k_.kolor.B256(_k_.kolor.M(6));_k_.m7=_k_.kolor.F256(_k_.kolor.m(7));_k_.M7=_k_.kolor.B256(_k_.kolor.M(7));_k_.m8=_k_.kolor.F256(_k_.kolor.m(8));_k_.M8=_k_.kolor.B256(_k_.kolor.M(8));_k_.y1=_k_.kolor.F256(_k_.kolor.y(1));_k_.Y1=_k_.kolor.B256(_k_.kolor.Y(1));_k_.y2=_k_.kolor.F256(_k_.kolor.y(2));_k_.Y2=_k_.kolor.B256(_k_.kolor.Y(2));_k_.y3=_k_.kolor.F256(_k_.kolor.y(3));_k_.Y3=_k_.kolor.B256(_k_.kolor.Y(3));_k_.y4=_k_.kolor.F256(_k_.kolor.y(4));_k_.Y4=_k_.kolor.B256(_k_.kolor.Y(4));_k_.y5=_k_.kolor.F256(_k_.kolor.y(5));_k_.Y5=_k_.kolor.B256(_k_.kolor.Y(5));_k_.y6=_k_.kolor.F256(_k_.kolor.y(6));_k_.Y6=_k_.kolor.B256(_k_.kolor.Y(6));_k_.y7=_k_.kolor.F256(_k_.kolor.y(7));_k_.Y7=_k_.kolor.B256(_k_.kolor.Y(7));_k_.y8=_k_.kolor.F256(_k_.kolor.y(8));_k_.Y8=_k_.kolor.B256(_k_.kolor.Y(8));_k_.w1=_k_.kolor.F256(_k_.kolor.w(1));_k_.W1=_k_.kolor.B256(_k_.kolor.W(1));_k_.w2=_k_.kolor.F256(_k_.kolor.w(2));_k_.W2=_k_.kolor.B256(_k_.kolor.W(2));_k_.w3=_k_.kolor.F256(_k_.kolor.w(3));_k_.W3=_k_.kolor.B256(_k_.kolor.W(3));_k_.w4=_k_.kolor.F256(_k_.kolor.w(4));_k_.W4=_k_.kolor.B256(_k_.kolor.W(4));_k_.w5=_k_.kolor.F256(_k_.kolor.w(5));_k_.W5=_k_.kolor.B256(_k_.kolor.W(5));_k_.w6=_k_.kolor.F256(_k_.kolor.w(6));_k_.W6=_k_.kolor.B256(_k_.kolor.W(6));_k_.w7=_k_.kolor.F256(_k_.kolor.w(7));_k_.W7=_k_.kolor.B256(_k_.kolor.W(7));_k_.w8=_k_.kolor.F256(_k_.kolor.w(8));_k_.W8=_k_.kolor.B256(_k_.kolor.W(8))

var childp, klor, kstr, noon, slash

kstr = require('kstr')
klor = require('klor')
noon = require('noon')
slash = require('kslash')
childp = require('child_process')
klor.kolor.globalize()
class Print
{
    static tokens (header, tokens)
    {
        var idx, s, tok

        console.log(_k_.R3(_k_.y5(`\n ${header}`)))
        console.log(_k_.b6(kstr.pad('',80,' ')))
        s = ''
        var list = _k_.list(tokens)
        for (idx = 0; idx < list.length; idx++)
        {
            tok = list[idx]
            s += this.token(tok,idx)
        }
        console.log(s)
    }

    static token (tok, idx = '')
    {
        var indent, toktext

        indent = kstr.lpad('',tok.col)
        if (tok.type === 'nl')
        {
            return red('◂\n')
        }
        if (_k_.in(tok.type,['ws','nl']))
        {
            return ''
        }
        toktext = (function (tok)
        {
            var s, t

            if (tok.text === '')
            {
                return '\n' + indent
            }
            else if (tok.text)
            {
                return tok.text
            }
            else if (tok.tokens)
            {
                s = ''
                var list = _k_.list(tok.tokens)
                for (var _44_22_ = 0; _44_22_ < list.length; _44_22_++)
                {
                    t = list[_44_22_]
                    s += this.token(t)
                }
                return '\n' + s
            }
            else
            {
                return '???'
            }
        }).bind(this)
        return _k_.b6(kstr.lpad(tok.line,4)) + ' ' + blue(kstr.lpad(tok.col,3)) + ' ' + _k_.w2(kstr.lpad(idx,4)) + ' ' + gray(kstr.pad(tok.type,10)) + ' ' + bold(yellow(indent + toktext(tok)) + '\n')
    }

    static stack (stack, node, color = W4)
    {
        console.log(_k_.W2(stack.join(' ') + ' ') + color((node != null ? node : '')))
    }

    static sheap (sheap, popped)
    {
        var c, r, s

        s = _k_.B2('   ')
        var list = _k_.list(sheap)
        for (var _64_14_ = 0; _64_14_ < list.length; _64_14_++)
        {
            r = list[_64_14_]
            switch (r.type)
            {
                case 'exps':
                    s += _k_.B5(r.text) + _k_.B2(' ')
                    break
                case 'stack':
                    s += _k_.W4(r.text) + _k_.W2(' ')
                    break
                case 'rhs':
                    s += _k_.R3(_k_.r1(r.text)) + _k_.R1(' ')
                    break
                case 'lhs':
                    s += _k_.G3(_k_.g1(r.text)) + _k_.G1(' ')
                    break
                default:
                    s += _k_.Y4(black(r.text) + _k_.Y2(' '))
            }

        }
        if (popped)
        {
            c = ((function ()
            {
                switch (popped.type)
                {
                    case 'exps':
                        return B1

                    case 'stack':
                        return W3

                    default:
                        return W1
                }

            }).bind(this))()
            s += black(c(popped.text) + ' ')
        }
        console.log(s)
    }

    static block (header, block, legend = false)
    {
        var printBlock

        console.log(_k_.R3(_k_.y5(`\n ${header}`)))
        printBlock = function (b)
        {
            var c, ci, cn, s, _102_44_, _95_27_

            if (legend)
            {
                s = b.indent + _k_.b6(kstr.rpad(b.line,3)) + _k_.w2(kstr.rpad(b.col,3)) + yellow(b.tokens.length)
                s += '\n' + b.indent
            }
            s = b.indent
            if (_k_.in(b.type,['{}','()','[]']))
            {
                s += b.type[0] + ' '
            }
            var list = _k_.list(b.tokens)
            for (var _94_18_ = 0; _94_18_ < list.length; _94_18_++)
            {
                c = list[_94_18_]
                if ((c.tokens != null))
                {
                    s += '\n' + printBlock(c) + b.indent
                }
                else if (c.type === 'nl')
                {
                    s += '\n' + b.indent + '▸'
                }
                else
                {
                    ci = parseInt(b.indent.length / 4)
                    cn = ['g5','r5','m5','g3','r3','m3','g1','r1','m1'][ci % 8]
                    s += global[cn]((((_102_44_=c.text) != null ? _102_44_ : '')) + ' ')
                }
            }
            if (_k_.in(b.type,['{}','()','[]']))
            {
                s += b.type[1]
            }
            return s
        }
        console.log(printBlock(block))
    }

    static ast (header, ast)
    {
        var lpad, node, printNode

        console.log(_k_.G1(_k_.g6(`\n ${header}`)))
        lpad = kstr.lpad('',19)
        printNode = function (node, indent = '', visited = [])
        {
            var name, s, value, _126_44_, _126_85_

            s = ''
            if (!node)
            {
                return s
            }
            if (node.type)
            {
                s += _k_.b6(kstr.lpad(((_126_44_=node.line) != null ? _126_44_ : ''),4)) + ' ' + blue(kstr.lpad(((_126_85_=node.col) != null ? _126_85_ : ''),3)) + ' ' + gray(kstr.pad(node.type,10)) + ' ' + bold(yellow(indent + node.text) + '\n')
            }
            else if (node instanceof Array)
            {
                if (_k_.in(node,visited))
                {
                    return s
                }
                visited.push(node)
                if (node.length)
                {
                    s += lpad + ' ' + indent + bold(_k_.w3('['))
                    var list = _k_.list(node)
                    for (var _134_30_ = 0; _134_30_ < list.length; _134_30_++)
                    {
                        value = list[_134_30_]
                        s += '\n'
                        s += printNode(value,indent,visited)
                    }
                    s += lpad + ' ' + bold(_k_.w3(indent + ']\n'))
                }
                else
                {
                    s += lpad + ' ' + indent + bold(_k_.w3('[]\n'))
                }
            }
            else
            {
                if (_k_.in(node,visited))
                {
                    return s
                }
                visited.push(node)
                for (name in node)
                {
                    value = node[name]
                    s += lpad + ' ' + bold(_k_.b8(indent + name))
                    s += '\n'
                    s += printNode(value,indent + '  ',visited)
                }
            }
            return s
        }
        if (ast instanceof Array)
        {
            var list = _k_.list(ast)
            for (var _151_40_ = 0; _151_40_ < list.length; _151_40_++)
            {
                node = list[_151_40_]
                console.log(printNode(node))
            }
        }
        else
        {
            console.log(printNode(ast))
        }
    }

    static astr (ast, scopes)
    {
        var node, printNode, s

        printNode = function (node, indent = '', visited = [])
        {
            var name, s, value, _183_28_, _183_43_

            s = ''
            if (!node)
            {
                return s
            }
            if (node.type)
            {
                s += indent + node.text + '\n'
            }
            else if (node instanceof Array)
            {
                if (_k_.in(node,visited))
                {
                    return s
                }
                visited.push(node)
                if (node.length)
                {
                    var list = _k_.list(node)
                    for (var _177_30_ = 0; _177_30_ < list.length; _177_30_++)
                    {
                        value = list[_177_30_]
                        s += printNode(value,indent,visited)
                    }
                }
            }
            else
            {
                if (_k_.in(node,visited))
                {
                    return s
                }
                visited.push(node)
                if ((node.vars != null) && (node.exps != null) && !scopes)
                {
                    s = printNode(node.exps,indent,visited)
                }
                else
                {
                    for (name in node)
                    {
                        value = node[name]
                        s += indent + name
                        s += '\n'
                        s += printNode(value,indent + '    ',visited)
                    }
                }
            }
            return s
        }
        if (ast instanceof Array)
        {
            s = (function () { var _193__41_ = []; var list = _k_.list(ast); for (var _193_41_ = 0; _193_41_ < list.length; _193_41_++)  { node = list[_193_41_];_193__41_.push(printNode(node))  } return _193__41_ }).bind(this)().join('')
        }
        else
        {
            s = printNode(ast)
        }
        return kstr.strip(s,' \n')
    }

    static code (msg, code, ext = 'js')
    {
        var tmp

        console.log(_k_.W1(_k_.w5(kstr.lpad(msg + ' ',80))))
        tmp = slash.tmpfile()
        tmp = slash.swapExt(tmp,ext)
        slash.writeText(tmp,code)
        console.log(childp.execSync(`${__dirname}/../node_modules/.bin/colorcat --lineNumbers ${tmp}`,{encoding:'utf8'}))
        return slash.remove(tmp,function ()
        {})
    }

    static noon (msg, arg)
    {
        if (!arg)
        {
            arg = msg
            msg = null
        }
        if (msg)
        {
            console.log(red(msg))
        }
        console.log(noon.stringify(arg,{colors:true}))
    }
}

module.exports = Print