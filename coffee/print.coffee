###
00000000   00000000   000  000   000  000000000
000   000  000   000  000  0000  000     000
00000000   0000000    000  000 0 000     000
000        000   000  000  000  0000     000
000        000   000  000  000   000     000
###

kstr   = require 'kstr'
klor   = require 'klor'
noon   = require 'noon'
slash  = require 'kslash'
childp = require 'child_process'
fs     = require 'fs-extra'

klor.kolor.globalize()

class Print

    # 000000000   0000000   000   000  00000000  000   000   0000000
    #    000     000   000  000  000   000       0000  000  000
    #    000     000   000  0000000    0000000   000 0 000  0000000
    #    000     000   000  000  000   000       000  0000       000
    #    000      0000000   000   000  00000000  000   000  0000000

    @tokens: (header, tokens) ->
            log R3 y5 "\n #{header}"
            # log b6('line'), blue('col'), gray('type'), bold yellow('text')
            log b6(kstr.pad '' 80 ' ')
            for tok in tokens
                indent = kstr.lpad '' tok.col
                log red '◂' if tok.type == 'nl'
                continue if tok.type in ['ws''nl']
                toktext = (tok) -> if tok.text == '' then '\n'+indent else if tok.text then tok.text else '\n'+(indent=tok.indent)+(tok.tokens.map (t) -> toktext(t)).join ' '
                text = toktext tok
                log b6(kstr.lpad tok.line, 4), blue(kstr.lpad tok.col, 3), gray(kstr.pad tok.type, 10), bold yellow(indent + text)
            # log b4(kstr.pad '' 80 ' ')

    #  0000000  000000000   0000000    0000000  000   000
    # 000          000     000   000  000       000  000
    # 0000000      000     000000000  000       0000000
    #      000     000     000   000  000       000  000
    # 0000000      000     000   000   0000000  000   000

    @stack: (stack, node, color=W4) ->

        log W2(stack.join(' ') + ' ') + color node ? ''

    # 0000000    000       0000000    0000000  000   000
    # 000   000  000      000   000  000       000  000
    # 0000000    000      000   000  000       0000000
    # 000   000  000      000   000  000       000  000
    # 0000000    0000000   0000000    0000000  000   000

    @block: (header, block, legend=false) ->

        log R3 y5 "\n #{header}"
        printBlock = (b) ->
            if legend
                s = b.indent + b6(kstr.rpad b.line, 3) + b5('- ' + kstr.pad b.last, 3) + w2(kstr.rpad b.col, 3) + yellow(b.tokens.length)
                s += '\n' + b.indent
            s = b.indent
            if b.type in ['{}''()''[]'] then s += b.type[0] + ' '
            for c in b.tokens
                if c.tokens?
                    s += '\n' + printBlock(c) + b.indent
                else if c.type == 'nl'
                    s += '\n'+b.indent+'▸'
                else
                    ci = parseInt b.indent.length/4
                    cn = ['g5''r5''m5''g3''r3''m3''g1''r1''m1'][ci%8]
                    s += global[cn] (c.text ? '') + ' '
            if b.type in ['{}''()''[]'] then s += b.type[1]
            s
        log printBlock block

    #  0000000    0000000  000000000
    # 000   000  000          000
    # 000000000  0000000      000
    # 000   000       000     000
    # 000   000  0000000      000

    @ast: (header, ast) ->

        log R3 y5 "\n #{header}"

        printNode = (node, indent='') ->

            s = ''

            return s if not node

            if node.type
                s += b6(kstr.lpad node.line, 4) + ' ' + blue(kstr.lpad node.col, 3) + ' ' + gray(kstr.pad node.type, 10) + ' ' + bold yellow(indent + node.text) + '\n'
            else if node instanceof Array
                s += (kstr.lpad '', 19) + ' ' + bold w3(indent + '{')
                for value in node
                    s += '\n' + printNode value, indent
                s += (kstr.lpad '', 19) + ' ' + bold w3(indent + '}\n')
            else
                for name,value of node
                    s += (kstr.lpad '', 19) + ' ' + bold b8(indent + name)
                    s += '\n' + printNode value, indent+'  '
            s

        if ast instanceof Array
            log printNode node for node in ast
        else
            log printNode ast

    #  0000000   0000000   0000000    00000000
    # 000       000   000  000   000  000
    # 000       000   000  000   000  0000000
    # 000       000   000  000   000  000
    #  0000000   0000000   0000000    00000000

    @code: (msg, code, ext='js') ->
        log W1 w5 kstr.lpad msg+' ' 80
        tmp = slash.tmpfile()
        tmp = slash.swapExt tmp, ext
        slash.writeText tmp, code
        log childp.execSync "#{__dirname}/../node_modules/.bin/colorcat --lineNumbers #{tmp}" encoding:'utf8'
        fs.unlink tmp

    @noon: (msg, arg) ->
        log red msg
        log noon.stringify arg, colors:true

module.exports = Print
