// monsterkodi/kode 0.22.2

var kstr, klor, noon, slash, childp, fs, idx, color, legend, ext

kstr = require('kstr')
klor = require('klor')
noon = require('noon')
slash = require('kslash')
childp = require('child_process')
fs = require('fs-extra')
klor.kolor.globalize()

class Print
{
    static tokens (header, tokens)
    {
        var s, tok, idx

        console.log(R3(y5(`\n ${header}`)))
        console.log(b6(kstr.pad('',80,' ')))
        s = ''
        var list = tokens
        for (idx = 0; idx < list.length; idx++)
        {
            tok = list[i]
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
        if (['ws','nl'].indexOf(tok.type) >= 0)
        {
            return ''
        }
        toktext = function (tok)
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
                var list = tok.tokens
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
        }
        return b6(kstr.lpad(tok.line,4)) + ' ' + blue(kstr.lpad(tok.col,3)) + ' ' + w2(kstr.lpad(idx,4)) + ' ' + gray(kstr.pad(tok.type,10)) + ' ' + bold(yellow(indent + toktext(tok)) + '\n')
    }

    static stack (stack, node, color = W4)
    {
        var _59_51_

        console.log(W2(stack.join(' ') + ' ') + color(((_59_51_=node) != null ? _59_51_ : '')))
    }

    static sheap (sheap, popped)
    {
        var s, r, c

        s = B2('   ')
        var list = sheap
        for (var _64_14_ = 0; _64_14_ < list.length; _64_14_++)
        {
            r = list[_64_14_]
            switch (r.type)
            {
                case 'exps':
                    s += B5(r.text) + B2(' ')
                    break
                case 'stack':
                    s += W4(r.text) + W2(' ')
                    break
                case 'rhs':
                    s += R3(r1(r.text)) + R1(' ')
                    break
                case 'lhs':
                    s += G3(g1(r.text)) + G1(' ')
                    break
                default:
                    s += Y4(black(r.text) + Y2(' '))
            }

        }
        if (popped)
        {
            c = (function ()
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

            })()
            s += black(c(popped.text) + ' ')
        }
        console.log(s)
    }

    static block (header, block, legend = false)
    {
        var printBlock

        console.log(R3(y5(`\n ${header}`)))
        printBlock = function (b)
        {
            var s, c, _95_27_, ci, cn, _102_44_

            if (legend)
            {
                s = b.indent + b6(kstr.rpad(b.line,3)) + w2(kstr.rpad(b.col,3)) + yellow(b.tokens.length)
                s += '\n' + b.indent
            }
            s = b.indent
            if (['{}','()','[]'].indexOf(b.type) >= 0)
            {
                s += b.type[0] + ' '
            }
            var list = b.tokens
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
            if (['{}','()','[]'].indexOf(b.type) >= 0)
            {
                s += b.type[1]
            }
            return s
        }
        console.log(printBlock(block))
    }

    static ast (header, ast)
    {
        var lpad, printNode, indent, visited, node

        console.log(G1(g6(`\n ${header}`)))
        lpad = kstr.lpad('',19)
        printNode = function (node, indent = '', visited = [])
        {
            var s, _126_44_, _126_85_, value, name

            s = ''
            if (!node)
            {
                return s
            }
            if (node.type)
            {
                s += b6(kstr.lpad(((_126_44_=node.line) != null ? _126_44_ : '')(4))) + ' ' + blue(kstr.lpad(((_126_85_=node.col) != null ? _126_85_ : '')(3))) + ' ' + gray(kstr.pad(node.type,10)) + ' ' + bold(yellow(indent + node.text) + '\n')
            }
            else if (node instanceof Array)
            {
                if (visited.indexOf(node) >= 0)
                {
                    return s
                }
                visited.push(node)
                if (node.length)
                {
                    s += lpad + ' ' + indent + bold(w3('['))
                    var list = node
                    for (var _134_30_ = 0; _134_30_ < list.length; _134_30_++)
                    {
                        value = list[_134_30_]
                        s += '\n'
                        s += printNode(value,indent,visited)
                    }
                    s += lpad + ' ' + bold(w3(indent + ']\n'))
                }
                else
                {
                    s += lpad + ' ' + indent + bold(w3('[]\n'))
                }
            }
            else
            {
                if (visited.indexOf(node) >= 0)
                {
                    return s
                }
                visited.push(node)
                for (name in node)
                {
                    value = node[name]
                    s += lpad + ' ' + bold(b8(indent + name))
                    s += '\n'
                    s += printNode(value,indent + '  ',visited)
                }
            }
            return s
        }
        if (ast instanceof Array)
        {
            var list = ast
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
        var printNode, indent, visited, s

        printNode = function (node, indent = '', visited = [])
        {
            var s, value, _183_28_, _183_43_, name

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
                if (visited.indexOf(node) >= 0)
                {
                    return s
                }
                visited.push(node)
                if (node.length)
                {
                    var list = node
                    for (var _177_30_ = 0; _177_30_ < list.length; _177_30_++)
                    {
                        value = list[_177_30_]
                        s += printNode(value,indent,visited)
                    }
                }
            }
            else
            {
                if (visited.indexOf(node) >= 0)
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
            s = (function () { var result = []; var list = ast; for (var _193_41_ = 0; _193_41_ < list.length; _193_41_++)  { node = list[_193_41_];result.push(printNode(node))  } return result })().join('')
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

        console.log(W1(w5(kstr.lpad(msg + ' ',80))))
        tmp = slash.tmpfile()
        tmp = slash.swapExt(tmp,ext)
        slash.writeText(tmp,code)
        console.log(childp.execSync(`${__dirname}/../node_modules/.bin/colorcat --lineNumbers ${tmp}`,{encoding:'utf8'}))
        return fs.unlink(tmp)
    }

    static noon (msg, arg)
    {
        var arg, msg

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