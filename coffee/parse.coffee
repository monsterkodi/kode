###
00000000    0000000   00000000    0000000  00000000
000   000  000   000  000   000  000       000     
00000000   000000000  0000000    0000000   0000000 
000        000   000  000   000       000  000     
000        000   000  000   000  0000000   00000000
###

print = require './print'
empty = (a) -> a in ['' null undefined] or (typeof(a) == 'object' and Object.keys(a).length == 0)

class Parse # the base class of Parser

    @: (args) ->

        @debug   = args?.debug
        @verbose = args?.verbose
        @raw     = args?.raw

    # 00000000    0000000   00000000    0000000  00000000
    # 000   000  000   000  000   000  000       000
    # 00000000   000000000  0000000    0000000   0000000
    # 000        000   000  000   000       000  000
    # 000        000   000  000   000  0000000   00000000

    parse: (block) -> # convert block tree to abstract syntax tree

        @stack = []

        ast = []

        while block.tokens.length
            ast = ast.concat @exps 'tl block' block.tokens

        if @raw then print.noon 'raw ast' ast

        ast

    # 00000000  000   000  00000000    0000000
    # 000        000 000   000   000  000
    # 0000000     00000    00000000   0000000
    # 000        000 000   000             000
    # 00000000  000   000  000        0000000

    # consumes tokens and returns list of expressions

    exps: (rule, tokens, stop) ->
        
        return if empty tokens

        es = []
                        
        while tokens.length
            
            b = switch @stack[-1]
            
                when 'typeof'       then es.length
                when 'if' 'switch'  then tokens[0].text == 'else'
                # when '['            then tokens[0].text == ']' and tokens.shift()
                # when '{'            then tokens[0].text in '};' and tokens.shift()
                when 'call'         then tokens[0].text == ';' and tokens.shift()
                when rule           then tokens[0].text == stop
                else false
                    # @verb 'exps break for typeof'
                    # break

            break if b
                    
            if @stack[-1] == '[' and tokens[0].text == ']'
                tokens.shift()
                break

            if @stack[-1] == '{' and tokens[0].text == '}'
                tokens.shift()
                break
                
            if @stack[-1] == '{' and tokens[0].text == ';'
                tokens.shift()
                break

            # if @stack[-1] == 'call' and tokens[0].text == ';'
                # tokens.shift()
                # break
                
            if tokens[0].type == 'block'
    
                block = tokens.shift()
    
                @verb "exps block:" block
                    
                while block.tokens.length
                    es = es.concat @exps 'exps block' block.tokens

                if tokens[0]?.type == 'nl' 
                    @verb "exps shift nl" 
                    tokens.shift()
                    
                if tokens[0]?.text == ','
                    @verb "exps shift ,"
                    tokens.shift()
                    
                @verb 'exps block! continue...'
                continue
                                            
            if tokens[0].type == 'block' 
                @verb 'exps break on block'
                break
                
            if tokens[0].text == ')'
                @verb 'exps break on )'
                break
                
            if rule == 'for vals' and tokens[0].text in ['in''of']
                @verb 'exps break on in|of'
                break
                
            if tokens[0].type == 'nl' 
                
                @verb 'exps nl stop:' stop, tokens[0], @stack

                if @stack[-1] == 'if' and tokens[1]?.text != 'else'
                    @verb 'exps ifbreak (shift nl ; and break)' 
                    tokens.shift()
                    break
                    
                if @stack[-1] == '[' and tokens[1]?.text == ']'
                    @verb 'exps nl + array ends in current block'
                    tokens.shift()
                    break
                    
                if stop
                    if @stack[-1] == 'call'
                        @verb 'exps call.end (dont shift nl)'
                    else
                        tokens.shift() 
                    @verb 'exps break on nl ;' 
                    break 
                    
                tokens.shift()
                
                if tokens[0]?.text == '.' and tokens[1]?.type == 'var'
                    log 'next line starts with .var!'
                    es.push @prop es.pop(), tokens
                
                @verb 'exps continue...' 
                continue
                
            ex = @exp tokens
            es.push ex

        es

    # 00000000  000   000  00000000
    # 000        000 000   000   000
    # 0000000     00000    00000000
    # 000        000 000   000
    # 00000000  000   000  000

    # consumes tokens and returns a single expression

    exp: (tokens) ->

        return if empty tokens

        tok = tokens.shift()

        log Y5 w1 tok?.text if @debug

        switch tok.type
            when 'block'     then return error "INTERNAL ERROR: unexpected block token in exp!"
            when 'nl'        then return @exp tokens # skip nl
            when 'keyword'
                switch tok.text 
                    when 'if'        then return @if     tok, tokens
                    when 'for'       then return @for    tok, tokens
                    when 'while'     then return @while  tok, tokens
                    when 'switch'    then return @switch tok, tokens
                    when 'when'      then return @when   tok, tokens
                    when 'class'     then return @class  tok, tokens
                    when 'return'    then return @return tok, tokens
            else
                switch tok.text 
                    when '->' '=>'   then return @func null, tok, tokens
                    when ';'         then return @exp tokens # skip ;
                    when ','         then return @exp tokens # skip ,

        e = token:tok
        
        while nxt = tokens[0]

            if not e then return error 'no e?' nxt
            
            if Object.values(e)[0]?.col?
                last = Object.values(e)[0].col+Object.values(e)[0].text?.length
            else if Object.values(e)[0]?.close?.col?
                last = Object.values(e)[0].close.col+Object.values(e)[0].close.text?.length
            else
                last = -1
                @verb 'parser no last? e:' e
                
            # @verb 'exp last next' last, nxt.col

            if @stack[-1] == 'typeof' and nxt.type in ['op']
                @verb 'exp break for typeof'
                break
            
            if nxt.type == 'op' and nxt.text not in ['++' '--' '+' '-'] and e.token?.text not in ['[' '(']
                @verb 'exp is lhs of op' e, nxt
                e = @operation e, tokens.shift(), tokens
                
            else if nxt.type == 'op' and nxt.text in ['+' '-'] and e.token?.text not in ['[' '('] and \
                    last < nxt.col and tokens[1]?.col > nxt.col+nxt.text.length
                @verb 'exp is lhs of +-\s' e, nxt
                e = @operation e, tokens.shift(), tokens
            
            else if nxt.type == 'func' and (e.parens or e.token and 
                    e.token.type not in ['num''single''double''triple'] and 
                    e.token.text not in '}]')
                f = tokens.shift()
                @verb 'exp func for e' e
                e = @func e, f, tokens
            else if nxt.text == '('
                if nxt.col == last
                    @verb 'exp is lhs of call'
                    e = @call e, tokens
                else
                    @verb 'exp is open paren'
                    e = @parens tok, tokens
            else if nxt.text == '[' and nxt.col == last and tokens[1]?.text != ']' and e.token?.text != '['
                @verb 'exp is lhs of index' e
                e = @index e, tokens
            else if nxt.text == '?' and last == nxt.col and tokens[1]?.text == '.'
                qmark = tokens.shift()
                e = @prop e, tokens, qmark
            else if nxt.text == '.'
                e = @prop e, tokens
                break
            else if nxt.text == ':'
                if @stack[-1] != '{'
                    @verb 'exp is first key of implicit object' e
                    e = @object e, tokens
                else
                    @verb 'exp is key of (implicit) object' e
                    e = @keyval e, tokens
            else if nxt.type == 'keyword' and nxt.text == 'in' and @stack[-1] != 'for'
                e = @incond e, tokens
            else if e.token
                if e.token.text == '('
                    e = @parens e.token, tokens
                else if e.token.text == '['
                    e = @array e.token, tokens
                else if e.token.text == '{'
                    e = @curly e.token, tokens
                else if e.token.text in ['+''-''++''--'] and last == nxt.col
                    if nxt.type not in ['var''paren'] and e.token.text in ['++''--']
                        tokens.shift()
                        error 'wrong lhs increment' e, nxt
                        return
                    @verb 'lhs null operation'
                    e = @operation null, e.token, tokens
                    if e.operation.rhs?.operation?.operator?.text in ['++''--']
                        error 'left and right side increment'
                        return
                else if nxt.text in ['++''--'] and last == nxt.col
                    if e.token.type not in ['var']
                        tokens.shift()
                        error 'wrong rhs increment'
                        return
                    e = @operation e, tokens.shift() 
                else if nxt.type == 'dots' and e.token.type in ['var' 'num']
                    e = @slice e, tokens
                else if @stack[-1] == '[' and nxt.text == ']'
                    @verb 'exp array end'
                    break
                else if @stack[-1] == '{' and nxt.text == '}'
                    @verb 'exp curly end'
                    break
                else if last < nxt.col and \
                        nxt.text not in ')]},;:.' and \
                        nxt.text not in ['then' 'else' 'break' 'continue' 'in' 'of'] and \
                        nxt.type not in ['nl'] and \
                        (e.token.type not in ['num' 'single' 'double' 'triple' 'regex' 'punct' 'comment' 'op']) and \
                        (e.token.text not in ['null' 'undefined' 'Infinity' 'NaN' 'true' 'false' 'yes' 'no']) and \
                        (e.token.type != 'keyword' or (e.token.text in ['new' 'require' 'typeof'])) and \
                        ((@stack[-1] not in ['if' 'for']) or nxt.line == e.token.line)
                    @verb 'exp is lhs of implicit call! e' e, @stack[-1]
                    @verb 'exp is lhs of implicit call! nxt' nxt
                    e = @call e, tokens

                else if nxt.type == 'op' and nxt.text in ['+' '-'] and e.token?.text not in ['[' '(']
                    if last < nxt.col and tokens[1]?.col == nxt.col+nxt.text.length
                        @verb 'exp op is unbalanced +- break...' e, nxt, @stack
                        break
                    @verb 'exp is lhs of op' e, nxt
                    e = @operation e, tokens.shift(), tokens
                    
                else
                    @verb 'no nxt match?' nxt, @stack
                    break                    
                    
            else # if e is not a token anymore
                if nxt.text in ['++''--'] and last == nxt.col
                    e = @operation e, tokens.shift()                
                else if nxt.type == 'dots' and @stack[-1] not in '.'
                    e = @slice e, tokens
                else
                    print.ast "no nxt match?? #{@stack}" e if @verbose
                    @verb 'no nxt match?? e:' e
                    @verb 'no nxt match?? nxt:' nxt
                break
        
        if empty @stack
            # fix null checks
            yes
                
        print.ast "exp #{if empty(@stack) then 'DONE' else ''}" e if @verbose
            
        e
        
    # 000000000  000   000  00000000  000   000 
    #    000     000   000  000       0000  000 
    #    000     000000000  0000000   000 0 000 
    #    000     000   000  000       000  0000 
    #    000     000   000  00000000  000   000 
    
    then: (id, tokens) ->
        
        if tokens[0]?.text == 'then'
            tokens.shift()
            nl = 'nl'
        else if tokens[0]?.type == 'block'
            block = tokens.shift()
            if tokens[0]?.type == 'nl'
                tokens.shift()
            tokens = block.tokens
            nl = null
        else 
            error "#{id}: then or block expected!"

        thn = @exps id, tokens, nl
        
        if block and block.tokens.length
            print.tokens 'dangling then tokens' tokens
            
        thn
        
    # 0000000    000       0000000    0000000  000   000  
    # 000   000  000      000   000  000       000  000   
    # 0000000    000      000   000  000       0000000    
    # 000   000  000      000   000  000       000  000   
    # 0000000    0000000   0000000    0000000  000   000  
    
    block: (id, tokens) ->
        
        if tokens[0]?.type == 'block'
            block = tokens.shift()
            if tokens[0]?.type == 'nl'
                tokens.shift()
            tokens = block.tokens
            nl = null
        else 
            nl = 'nl'
            
        exps = @exps id, tokens, nl

        if block and block.tokens.length
            print.tokens 'dangling block tokens' tokens
            
        exps
        
    #  0000000  000000000   0000000    0000000  000   000  
    # 000          000     000   000  000       000  000   
    # 0000000      000     000000000  000       0000000    
    #      000     000     000   000  000       000  000   
    # 0000000      000     000   000   0000000  000   000  

    push: (node) ->

        print.stack @stack, node if @verbose
        @stack.push node

    pop: (n) ->
        p = @stack.pop()
        if p != n
            error "unexpected pop!" p, n
        if @verbose
            print.stack @stack, p, (s) -> W1 w1 s

    verb: ->

        if @verbose
            console.log.apply console.log, arguments
        
module.exports = Parse
