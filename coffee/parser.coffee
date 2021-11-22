###
00000000    0000000   00000000    0000000  00000000  00000000
000   000  000   000  000   000  000       000       000   000
00000000   000000000  0000000    0000000   0000000   0000000
000        000   000  000   000       000  000       000   000
000        000   000  000   000  0000000   00000000  000   000
###

print = require './print'
empty = (a) -> a in ['' null undefined] or (typeof(a) == 'object' and Object.keys(a).length == 0)

class Parser

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

        ast = @exps 'tl block' block.tokens

        if @raw then print.noon 'raw ast' ast

        print.tokens "#{block.tokens.length} remaining tokens:" block.tokens if block.tokens.length

        ast

    # 00000000  000   000  00000000    0000000
    # 000        000 000   000   000  000
    # 0000000     00000    00000000   0000000
    # 000        000 000   000             000
    # 00000000  000   000  000        0000000

    # consumes tokens and returns list of expressions

    exps: (rule, tokens, stop) ->
        
        return if empty tokens

        if tokens[0].type == 'block'

            block = tokens.shift()
            if tokens[0]?.type == 'nl' 
                print.tokens 'swallow nl' tokens if @debug
                tokens.shift()

            return @exps 'exps block' block.tokens

        es = []

        while tokens.length
            
            if @stack[-1] == rule and tokens[0].text == stop
                @verb "stack.end #{@stack[-1]} #{tokens[0].text}"
                break
            else if (@stack[-1] in ['if''switch']) and (tokens[0].text == 'else')
                @verb 'exps else break'
                break
                
            if tokens[0].type == 'nl' #or tokens[0].text == ';'
                @verb 'exps nl stop:' stop, tokens[0], @stack

                if @stack[-1] == 'if' and tokens[1]?.text != 'else'
                    @verb 'exps ifbreak (shift nl ; and break)' 
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
                @verb 'exps continue...' 
                continue
                
            if tokens[0].text == ';'
                if @stack[-1] in ['call''{']
                    @verb 'exps call break on ;'
                    tokens.shift()
                    break
                
            if tokens[0].type == 'block' 
                @verb 'exps break on block'
                break
                
            if tokens[0].text == ')'
                @verb 'exps break on )'
                break

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

        if tok.type == 'block' 
            log "DAGFUK! CLEAN UP YOUR MESSS!"
            if tokens[0]?.type == 'nl' then tokens.shift()
            return @exps 'exp block' tok.tokens
        else if tok.text == 'if'        then return @if     tok, tokens
        else if tok.text == 'for'       then return @for    tok, tokens
        else if tok.text == 'while'     then return @while  tok, tokens
        else if tok.text == 'switch'    then return @switch tok, tokens
        else if tok.text == 'when'      then return @when   tok, tokens
        else if tok.text == 'class'     then return @class  tok, tokens
        else if tok.text == 'return'    then return @return tok, tokens
        else if tok.text in ['->' '=>'] then return @func   null, tok, tokens
        else if tok.text in [',' ';']   then return @exp tokens # skip , or ;
        else if tok.type == 'nl'        then return @exp tokens # skip nl

        e = token:tok
        while nxt = tokens[0]

            if not e then return error 'no e?' nxt
            
            if e.col?
                last = e.col+e.text?.length
            else if e.close?.col?
                last = e.close.col+e.close.text?.length
            else if Object.values(e)[0]?.col?
                last = Object.values(e)[0].col+Object.values(e)[0].text?.length
            else if Object.values(e)[0]?.close?.col?
                last = Object.values(e)[0].close.col+Object.values(e)[0].close.text?.length
            else
                last = -1
                @verb 'parser no last? e:' e
                
            @verb 'parser last next' last, nxt.col

            if nxt.type == 'op' and nxt.text not in ['++' '--']
                @verb 'exp is lhs of op' e
                e = @operation e, tokens.shift(), tokens
            else if nxt.type == 'func'
                f = tokens.shift()
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
                else if last < nxt.col and \
                        nxt.text not in ')]},;:.' and \
                        nxt.text not in ['then' 'else' 'break' 'continue' 'in' 'of'] and \
                        nxt.type not in ['nl'] and \
                        (nxt.type != 'op' or last < nxt.col) and \
                        (e.token.type not in ['num' 'single' 'double' 'triple' 'regex' 'punct' 'comment' 'op']) and \
                        (e.token.text not in ['null' 'undefined' 'Infinity' 'NaN' 'true' 'false' 'yes' 'no']) and \
                        (e.token.type != 'keyword' or (e.token.text in ['new' 'require'])) and \
                        ((@stack[-1] not in ['if' 'for']) or nxt.line == e.token.line)
                    @verb 'exp is lhs of implicit call! e' e, @stack[-1]
                    @verb 'exp is lhs of implicit call! nxt' nxt
                    e = @call e, tokens
                else
                    @verb 'no nxt match?' nxt, @stack
                    break
            else
                if nxt.text in ['++''--'] and last == nxt.col
                    e = @operation e, tokens.shift()                
                else if nxt.type == 'dots' and @stack[-1] not in '.'
                    e = @slice e, tokens
                else
                    print.ast "no nxt match?? #{@stack}" e if @verbose
                    @verb 'no nxt match?? e:' e
                    @verb 'no nxt match?? nxt:' nxt
                break
                
        if @verbose
            print.ast 'exp' e
            log blue('exp'), e
        e
        
    ###
    000  00000000
    000  000
    000  000000
    000  000
    000  000
    ###

    if: (tok, tokens) ->

        @push 'if'

        print.tokens 'if' tokens if @debug

        exp = @exp tokens

        print.tokens 'then' tokens if @debug

        if tokens[0]?.text == 'then'
            tokens.shift()
        else if tokens[0]?.type == 'block'
            tokens = tokens.shift().tokens
        else 
            error 'parser.if: then or block expected!'

        thn = @exps 'if then' tokens

        e = if:
                exp:    exp
                then:   thn

        while tokens[0]?.text == 'else' and tokens[1]?.text == 'if'

            print.tokens 'else if' tokens if @debug

            tokens.shift()
            tokens.shift()

            e.if.elifs ?= []

            exp = @exp tokens

            print.tokens 'else if then' tokens if @debug

            if tokens[0]?.text == 'then'
                tokens.shift()
            else if tokens[0]?.type == 'block'
                tokens = tokens.shift().tokens
            else 
                error 'parser.if: then or block expected!'

            thn = @exps 'elif then' tokens

            e.if.elifs.push
                elif:
                    exp:  exp
                    then: thn

        @pop 'if' # shouldn't this be popped after the else block?

        if tokens[0]?.text == 'else'

            print.tokens 'else' tokens if @debug

            tokens.shift()

            e.if.else = @exps 'else' tokens, 'nl'

        print.tokens 'if leftover' tokens if tokens.length and @debug

        e

    ###
    00000000   0000000   00000000   
    000       000   000  000   000  
    000000    000   000  0000000    
    000       000   000  000   000  
    000        0000000   000   000  
    ###
    
    for: (tok, tokens) ->
        
        @push 'for'

        print.tokens 'for' tokens if @debug

        vals = @exp tokens

        print.tokens 'inof' tokens if @debug
        
        inof = tokens.shift()
        
        print.tokens 'list' tokens if @debug
        
        list = @exp tokens

        if tokens[0]?.text == 'then'
            tokens.shift()
        else if tokens[0]?.type == 'block'
            tokens = tokens.shift().tokens
        else 
            error 'parser.for: then or block expected!'

        @pop 'for' # shouldn't this be popped after the then block?
        
        thn = @exps 'for then' tokens, 'nl'

        for:
            vals:   vals
            inof:   inof
            list:   list
            then:   thn
            
    ###
    000   000  000   000  000  000      00000000  
    000 0 000  000   000  000  000      000       
    000000000  000000000  000  000      0000000   
    000   000  000   000  000  000      000       
    00     00  000   000  000  0000000  00000000  
    ###
    
    while: (tok, tokens) ->
        
        @push 'while'
        
        cond = @exp tokens

        print.tokens 'while then|block' tokens if @verbose
        
        if tokens[0]?.text == 'then'
            nl = 'nl'
            tokens.shift()
        else if tokens[0]?.type == 'block'
            nl = null
            tokens = tokens.shift().tokens
        else 
            error 'parser.while: then or block expected!'
        

        print.tokens 'while thens' tokens if @verbose
        
        thn = @exps 'while then' tokens, nl
        
        @pop 'while'
        
        while:
            cond: cond
            then: thn
        
    ###
     0000000  000   000  000  000000000   0000000  000   000
    000       000 0 000  000     000     000       000   000
    0000000   000000000  000     000     000       000000000
         000  000   000  000     000     000       000   000
    0000000   00     00  000     000      0000000  000   000
    ###

    switch: (tok, tokens) ->

        @push 'switch'
        
        match = @exp tokens
        
        if tokens[0]?.type == 'block'
            tokens = tokens.shift().tokens
        else
            @pop 'switch'
            return error 'parser.switch: block expected!'
        
        print.tokens 'switch whens' tokens if @debug
        
        whens = []
        while tokens[0]?.text == 'when'
            print.tokens 'switch when' tokens if @debug
            whens.push @exp tokens
                        
        e = switch:
                match:  match
                whens:  whens
        
        print.tokens 'switch else?' tokens if @debug
        
        if tokens[0]?.type == 'nl'
            tokens.shift()
        
        if tokens[0]?.text == 'else'

            print.tokens 'switch else' tokens if @debug
            
            tokens.shift()

            e.switch.else = @exps 'else' tokens, 'nl'
            
        @pop 'switch'
        
        e
                
    # 000   000  000   000  00000000  000   000  
    # 000 0 000  000   000  000       0000  000  
    # 000000000  000000000  0000000   000 0 000  
    # 000   000  000   000  000       000  0000  
    # 00     00  000   000  00000000  000   000  
    
    when: (tok, tokens) ->
        
        @push 'when'
        
        print.tokens 'when vals' tokens if @debug
        
        vals = []
        
        @verb 'when.vals tokens[0]' tokens[0]
        
        while (tokens[0]? and (tokens[0].type not in ['block''nl']) and tokens[0].text != 'then')
            print.tokens 'when val' tokens if @debug
            vals.push @exp tokens
        
        print.tokens 'when then' tokens if @debug
        
        @verb 'when.then tokens[0]' tokens[0]
        
        if tokens[0]?.text == 'then'
            tokens.shift()
        else if tokens[0]?.type == 'block'
            tokens = tokens.shift().tokens
        else
            @pop 'when'
            return error 'parser.when: then or block expected!'

        thn = @exps 'when then' tokens
        
        @pop 'when'
        
        when:
            vals: vals
            then: thn

    ###
     0000000  000       0000000    0000000   0000000
    000       000      000   000  000       000
    000       000      000000000  0000000   0000000
    000       000      000   000       000       000
     0000000  0000000  000   000  0000000   0000000
    ###

    class: (tok, tokens) ->

        @push 'class'

        print.tokens 'class' tokens if @debug

        name = tokens.shift()

        e = class:
            name:name

        print.tokens 'class extends' tokens if @debug

        if tokens[0]?.text == 'extends'
            tokens.shift()
            e.class.extends = @exps 'class extends' tokens, 'nl'

        print.tokens 'class body' tokens if @debug

        print.noon 'before class body' tokens if @debug
        
        if tokens[0]?.type == 'block'
            tokens = tokens.shift().tokens
            e.class.body = @exps 'class body' tokens
        else
            @verb 'no class body!'

        if @debug
            print.ast 'e.class.body' e.class.body
            print.tokens 'class pop' tokens 

        @pop 'class'

        e

    # 00000000  000   000  000   000   0000000
    # 000       000   000  0000  000  000
    # 000000    000   000  000 0 000  000
    # 000       000   000  000  0000  000
    # 000        0000000   000   000   0000000

    func: (args, arrow, tokens) ->

        body = @exps 'func body' tokens, 'nl'
            
        func:
            args:  args
            arrow: arrow
            body:  body

    # 00000000   00000000  000000000  000   000  00000000   000   000  
    # 000   000  000          000     000   000  000   000  0000  000  
    # 0000000    0000000      000     000   000  0000000    000 0 000  
    # 000   000  000          000     000   000  000   000  000  0000  
    # 000   000  00000000     000      0000000   000   000  000   000  
    
    return: (tok, tokens) ->
        
        return:
            ret: tok
            val: @exp tokens
            
    #  0000000   0000000   000      000
    # 000       000   000  000      000
    # 000       000000000  000      000
    # 000       000   000  000      000
    #  0000000  000   000  0000000  0000000

    call: (tok, tokens) ->

        @push 'call'

        print.tokens 'call.open' tokens if @debug
        
        if tokens[0].text == '('
            open = tokens.shift()
            if tokens[0]?.text == ')'
                args = []
            else
                args = @exps 'call' tokens, ')'
        else
            args = @exps 'call' tokens, 'nl'

        if open and tokens[0]?.text == ')'
            close = tokens.shift()

        if open and not close
            error 'expected )'

        tok = tok.token if tok.token

        print.tokens 'call.close' tokens if @debug

        @pop 'call'
        
        call:
            callee: tok
            open:   open
            args:   args
            close:  close

    #  0000000   00000000   00000000  00000000    0000000   000000000  000   0000000   000   000
    # 000   000  000   000  000       000   000  000   000     000     000  000   000  0000  000
    # 000   000  00000000   0000000   0000000    000000000     000     000  000   000  000 0 000
    # 000   000  000        000       000   000  000   000     000     000  000   000  000  0000
    #  0000000   000        00000000  000   000  000   000     000     000   0000000   000   000

    operation: (lhs, op, tokens) ->

        if tokens?[0]?.type == 'block'
            tokens = tokens.shift().tokens
        
        rhs = @exp tokens if tokens
            
        if lhs?.token then lhs = lhs.token
        if rhs?.token then rhs = rhs.token

        operation:
            lhs:        lhs
            operator:   op
            rhs:        rhs

    #  0000000  000      000   0000000  00000000  
    # 000       000      000  000       000       
    # 0000000   000      000  000       0000000   
    #      000  000      000  000       000       
    # 0000000   0000000  000   0000000  00000000  
    
    slice: (from, tokens) ->

        dots = tokens.shift()

        upto = @exp tokens

        if not upto then return error "no slice end!"
        
        if from.token then from = from.token
        if upto.token then upto = upto.token

        slice:
            from: from
            dots: dots
            upto: upto

    #  0000000   00000000   00000000    0000000   000   000
    # 000   000  000   000  000   000  000   000   000 000
    # 000000000  0000000    0000000    000000000    00000
    # 000   000  000   000  000   000  000   000     000
    # 000   000  000   000  000   000  000   000     000

    array: (open, tokens) ->

        if tokens[0]?.text == ']'
            return array:
                open:  open
                exps:  []
                close: tokens.shift()

        @push '['

        exps = @exps '[' tokens, ']' 

        if tokens[0]?.text == ']'
            close = tokens.shift()
        else
            error 'next token not a ]'

        @pop '['

        array:
            open:  open
            exps:  exps
            close: close

    # 000  000   000  0000000    00000000  000   000
    # 000  0000  000  000   000  000        000 000
    # 000  000 0 000  000   000  0000000     00000
    # 000  000  0000  000   000  000        000 000
    # 000  000   000  0000000    00000000  000   000

    index: (tok, tokens) ->

        @push 'idx'

        open = tokens.shift()

        slice = @exp tokens

        print.tokens 'index.close' tokens if @debug

        if tokens[0]?.text == ']'
            close = tokens.shift()
        else
            error 'expected ]'

        @pop 'idx'

        index:
            idxee: tok
            open:  open
            slidx: slice
            close: close

    # 00000000    0000000   00000000   00000000  000   000   0000000
    # 000   000  000   000  000   000  000       0000  000  000
    # 00000000   000000000  0000000    0000000   000 0 000  0000000
    # 000        000   000  000   000  000       000  0000       000
    # 000        000   000  000   000  00000000  000   000  0000000

    parens: (open, tokens) ->

        @push '('

        exps = @exps '(' tokens, ')'

        if tokens[0]?.text == ')'
            close = tokens.shift()
        else
            error 'next token not a )'

        @pop '('

        parens:
            open:  open
            exps:  exps
            close: close

    #  0000000  000   000  00000000   000      000   000
    # 000       000   000  000   000  000       000 000
    # 000       000   000  0000000    000        00000
    # 000       000   000  000   000  000         000
    #  0000000   0000000   000   000  0000000     000

    curly: (open, tokens) ->

        if tokens[0]?.text == '}'
            return object:
                open:    open
                keyvals: []
                close:   tokens.shift()

        @push '{'

        exps = @exps '{' tokens, '}'

        if tokens[0]?.text == '}'
            close = tokens.shift()
        else
            error 'next token not a }'

        @pop '{'

        object:
            open:    open
            keyvals: exps
            close:   close

    #  0000000   0000000          000  00000000   0000000  000000000
    # 000   000  000   000        000  000       000          000
    # 000   000  0000000          000  0000000   000          000
    # 000   000  000   000  000   000  000       000          000
    #  0000000   0000000     0000000   00000000   0000000     000

    object: (key, tokens) ->

        @push '{'

        keyCol = key.token.col
        
        exps = [@keyval key, tokens]
        
        if tokens[0]? and (tokens[0].col == keyCol or tokens[0].type != 'nl')
        
            if tokens[0].line == key.token.line then stop='nl' else stop=null
            exps = exps.concat @exps 'object' tokens, stop

        @pop '{'

        object:
            keyvals: exps

    # 000   000  00000000  000   000  000   000   0000000   000
    # 000  000   000        000 000   000   000  000   000  000
    # 0000000    0000000     00000     000 000   000000000  000
    # 000  000   000          000        000     000   000  000
    # 000   000  00000000     000         0      000   000  0000000

    keyval: (key, tokens) ->

        colon = tokens.shift()

        @push ':'

        value = @exp tokens

        @pop ':'

        keyval:
            key:   key
            colon: colon
            val:   value

    # 00000000   00000000    0000000   00000000
    # 000   000  000   000  000   000  000   000
    # 00000000   0000000    000   000  00000000
    # 000        000   000  000   000  000
    # 000        000   000   0000000   000

    prop: (obj, tokens) ->

        dot = tokens.shift()
        @push '.'

        prop = @exp tokens

        @pop '.'

        prop:
            obj:  obj
            dot:  dot
            prop: prop

    # 00000000   000   000   0000000  000   000
    # 000   000  000   000  000       000   000
    # 00000000   000   000  0000000   000000000
    # 000        000   000       000  000   000
    # 000         0000000   0000000   000   000

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

module.exports = Parser
