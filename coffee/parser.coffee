###
00000000    0000000   00000000    0000000  00000000  00000000
000   000  000   000  000   000  000       000       000   000
00000000   000000000  0000000    0000000   0000000   0000000
000        000   000  000   000       000  000       000   000
000        000   000  000   000  0000000   00000000  000   000
###

print = require './print'
empty = (a) -> a in ['' null undefined] or (typeof(a) == 'object' and Object.keys(a).length == 0)

Parse = require './parse'

class Parser extends Parse

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

        thn = @then 'if then' tokens

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

            thn = @then 'elif then' tokens

            e.if.elifs.push
                elif:
                    exp:  exp
                    then: thn

        if tokens[0]?.text == 'else'

            print.tokens 'else' tokens if @debug

            tokens.shift()

            e.if.else = @block 'else' tokens
            
        @pop 'if'

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

        # vals = @exp tokens
        vals = @exps 'for vals' tokens

        print.tokens 'inof' tokens if @debug
        
        inof = tokens.shift()
        
        print.tokens 'list' tokens if @debug
        
        list = @exp tokens

        thn = @then 'for then' tokens
        
        @pop 'for' 

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
        
        thn = @then 'while then' tokens
        
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
        
        thn = @then 'when then' tokens
        
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

    call: (tok, tokens, qmrk) ->

        @push 'call'

        print.tokens 'call.open' tokens if @debug

        tok = tok.token if tok.token
                
        if tok.type == 'keyword' and tok.text in ['typeof' 'delete']
            @push 'onearg'
        
        if tokens[0].text == '('
            open = tokens.shift()
            if tokens[0]?.text == ')'
                args = []
            else
                args = @exps 'call' tokens, ')'
        else
            print.tokens 'call args' tokens if @debug
            args = @block 'call' tokens
            print.ast 'call args' args if @debug

        if open and tokens[0]?.text == ')'
            close = tokens.shift()

        if open and not close
            error 'expected )'

        print.tokens 'call.close' tokens if @debug

        if tok.type == 'keyword' and tok.text in ['typeof' 'delete']
            @pop 'onearg'
        
        @pop 'call'
        
        e = call: callee: tok
        e.call.open  = open
        e.call.qmrk  = qmrk if qmrk
        e.call.args  = args
        e.call.close = close
        e
            
    #  0000000   00000000   00000000  00000000    0000000   000000000  000   0000000   000   000
    # 000   000  000   000  000       000   000  000   000     000     000  000   000  0000  000
    # 000   000  00000000   0000000   0000000    000000000     000     000  000   000  000 0 000
    # 000   000  000        000       000   000  000   000     000     000  000   000  000  0000
    #  0000000   000        00000000  000   000  000   000     000     000   0000000   000   000

    operation: (lhs, op, tokens) ->

        @push "op#{op.text}"
        
        if lhs?.token then lhs = lhs.token
        print.tokens "operation #{lhs.text} #{op.text}" tokens if lhs and @debug
        
        rhs = @blockExp 'operation' tokens if tokens
        
        if rhs?.token then rhs = rhs.token
        
        @pop "op#{op.text}"
        
        operation:
            lhs:        lhs
            operator:   op
            rhs:        rhs
            
    # 000  000   000   0000000   0000000   000   000  0000000    
    # 000  0000  000  000       000   000  0000  000  000   000  
    # 000  000 0 000  000       000   000  000 0 000  000   000  
    # 000  000  0000  000       000   000  000  0000  000   000  
    # 000  000   000   0000000   0000000   000   000  0000000    
    
    incond: (lhs, tokens) ->
        
        intok = tokens.shift()
        
        incond:
            lhs: lhs
            in:  intok
            rhs: @exp tokens
            
    #  0000000   00000000   00000000    0000000   000   000
    # 000   000  000   000  000   000  000   000   000 000
    # 000000000  0000000    0000000    000000000    00000
    # 000   000  000   000  000   000  000   000     000
    # 000   000  000   000  000   000  000   000     000

    array: (open, tokens) ->

        if tokens[0]?.text == ']'
            return array:
                open:  open
                items: []
                close: tokens.shift()

        @push '['

        items = @exps '[' tokens, ']'

        if tokens[0]?.text == ']' then close = tokens.shift() else close = text:']' type:'paren' line:-1 col:-1 

        @pop '['
        
        if tokens[0]?.type == 'block' and @stack[-1] not in ['for' 'if']
            @verb 'fucked up indentation! block after array! flattening block tokens:'
            print.tokens 'tokens before splice' tokens if @verbose
            tokens.splice.apply tokens, [0 1].concat tokens[0].tokens
            print.tokens 'tokens after splice' tokens if @verbose

        array:
            open:  open
            items: items
            close: close

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

    # 000  000   000  0000000    00000000  000   000
    # 000  0000  000  000   000  000        000 000
    # 000  000 0 000  000   000  0000000     00000
    # 000  000  0000  000   000  000        000 000
    # 000  000   000  0000000    00000000  000   000

    index: (tok, tokens) ->

        @push 'idx'

        print.tokens 'index.open' tokens if @debug
                
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

        if tokens[0]?.text == '}' then close = tokens.shift() else close = text:'}' type:'paren' line:-1 col:-1 

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

        print.tokens 'object val' tokens if @debug
        
        exps = [@keyval key, tokens]
        
        print.tokens 'object continue...?' tokens if @debug

        tokens.shift() if tokens[0]?.type == 'nl'
        
        if tokens[0]? and (tokens[0].col == key.token.col or tokens[0].line == key.token.line)
            if tokens[0].text not in '])'
                @verb 'continue object...' if @debug
                if tokens[0].line == key.token.line then stop='nl' else stop=null
                exps = exps.concat @exps 'object' tokens, stop

        print.tokens 'object pop' tokens if @debug
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

        if tokens[0]?.type == 'block'
            block = tokens.shift()
            tokens.shift() if tokens[0]?.type == 'nl'
            value = @exps 'keyval value' block.tokens
        else 
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

    prop: (obj, tokens, qmrk) ->

        dot = tokens.shift()
        
        @push '.'

        prop = @exp tokens

        @pop '.'

        e = prop: obj: obj
        e.prop.qmrk = qmrk if qmrk
        e.prop.dot  = dot
        e.prop.prop = prop
        e
            
module.exports = Parser
