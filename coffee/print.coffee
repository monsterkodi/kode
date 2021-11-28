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
            log b6(kstr.pad '' 80 ' ')
            s = ''
            for tok,idx in tokens
                s += @token tok, idx
            log s

    @token: (tok, idx='') ->
        
        indent = kstr.lpad '' tok.col
        return red '◂\n' if tok.type == 'nl'
        return '' if tok.type in ['ws''nl']
        toktext = (tok) => 
            if tok.text == '' then '\n'+indent 
            else if tok.text then tok.text
            else if tok.tokens
                s = ''
                for t in tok.tokens
                    s += @token(t)# + '\n'
                '\n' + s
            else
                '???'
        b6(kstr.lpad tok.line, 4) + ' ' + blue(kstr.lpad tok.col, 3) + ' ' + w2(kstr.lpad idx, 4) + ' ' + gray(kstr.pad tok.type, 10) + ' ' + bold yellow(indent + toktext tok) + '\n'
            
    #  0000000  000000000   0000000    0000000  000   000
    # 000          000     000   000  000       000  000
    # 0000000      000     000000000  000       0000000
    #      000     000     000   000  000       000  000
    # 0000000      000     000   000   0000000  000   000

    @stack: (stack, node, color=W4) ->

        log W2(stack.join(' ') + ' ') + color node ? ''
        
    @sheap: (sheap, popped) ->
        
        s = B2 '   '
        for r in sheap
            switch r.type
                when 'exps'  then s += B5(r.text) + B2 ' '
                when 'stack' then s += W4(r.text) + W2 ' '
                when 'rhs'   then s += R3(r1 r.text) + R1 ' '
                when 'lhs'   then s += G3(g1 r.text) + G1 ' '
                else              s += Y4 black(r.text) + Y2 ' '
        if popped
            c = switch popped.type 
                when 'exps' then B1 
                when 'stack' then W3
                else W1
            s += black c(popped.text) + ' '
        log s

    # 0000000    000       0000000    0000000  000   000
    # 000   000  000      000   000  000       000  000
    # 0000000    000      000   000  000       0000000
    # 000   000  000      000   000  000       000  000
    # 0000000    0000000   0000000    0000000  000   000

    @block: (header, block, legend=false) ->

        log R3 y5 "\n #{header}"
        printBlock = (b) ->
            if legend
                s = b.indent + b6(kstr.rpad b.line, 3) + w2(kstr.rpad b.col, 3) + yellow(b.tokens.length)
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

        log G1 g6 "\n #{header}"
        
        lpad = kstr.lpad '' 19

        printNode = (node, indent='', visited=[]) ->

            s = ''

            return s if not node
            
            if node.type
                s += b6(kstr.lpad node.line ? '', 4) + ' ' + blue(kstr.lpad node.col ? '', 3) + ' ' + gray(kstr.pad node.type, 10) + ' ' + bold yellow(indent + node.text) + '\n'
            else if node instanceof Array
                
                return s if node in visited
                visited.push node

                if node.length
                    s += lpad + ' ' + indent + bold w3('[')
                    for value in node
                        s += '\n' 
                        s += printNode value, indent, visited
                    s += lpad + ' ' + bold w3(indent + ']\n')
                else
                    s += lpad + ' ' + indent + bold w3('[]\n')
            else
                return s if node in visited
                visited.push node
                
                for name,value of node
                    s += lpad + ' ' + bold b8(indent + name)
                    s += '\n'  
                    s += printNode value, indent+'  ', visited
            s

        if ast instanceof Array
            log printNode node for node in ast
        else
            log printNode ast

    #  0000000    0000000  000000000  00000000   
    # 000   000  000          000     000   000  
    # 000000000  0000000      000     0000000    
    # 000   000       000     000     000   000  
    # 000   000  0000000      000     000   000  
    
    @astr: (ast, scopes) ->

        printNode = (node, indent='', visited=[]) ->

            s = ''

            return s if not node
            
            if node.type
                s += indent + node.text + '\n'
            else if node instanceof Array
                
                return s if node in visited
                visited.push node
                
                if node.length
                    for value in node
                        s += printNode value, indent, visited
            else
                return s if node in visited
                visited.push node
                
                if node.vars? and node.exps? and not scopes
                    s = printNode node.exps, indent, visited
                else
                    for name,value of node
                        s += indent + name
                        s += '\n'  
                        s += printNode value, indent+'    ' visited
            s

        if ast instanceof Array
            s = (printNode node for node in ast).join ''
        else
            s = printNode ast
            
        kstr.strip s, ' \n'
            
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
        if not arg
            arg = msg
            msg = null
        log red msg if msg
        log noon.stringify arg, colors:true

module.exports = Print
