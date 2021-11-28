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

    scope: (exps) ->
        
        vars: []
        exps: exps
    
    ###
    000  00000000
    000  000
    000  000000
    000  000
    000  000
    ###

    if: (tok, tokens) ->

        @push 'if'

        # print.tokens 'if' tokens if @debug

        exp = @exp tokens

        # print.tokens 'then' tokens if @debug

        thn = @then 'if then' tokens

        e = if:
                exp:    exp
                then:   @scope thn

        while tokens[0]?.text == 'else' and tokens[1]?.text == 'if'

            # print.tokens 'else if' tokens if @debug

            tokens.shift()
            tokens.shift()

            e.if.elifs ?= []

            exp = @exp tokens

            # print.tokens 'else if then' tokens if @debug

            thn = @then 'elif then' tokens

            e.if.elifs.push
                elif:
                    exp:  exp
                    then: @scope thn

        if tokens[0]?.text == 'else'

            # print.tokens 'else' tokens if @debug

            tokens.shift()

            e.if.else = @scope @block 'else' tokens
            
        @pop 'if'

        # print.tokens 'if leftover' tokens if tokens.length and @debug

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

        # print.tokens 'for' tokens if @debug

        vals = @exps 'for vals' tokens
        
        vals = vals[0] if vals.length == 1

        # print.tokens 'inof' tokens if @debug
        
        inof = tokens.shift()
        
        # print.tokens 'list' tokens if @debug
        
        list = @exp tokens

        thn = @then 'for then' tokens
        
        @pop 'for' 

        for:
            vals:   vals
            inof:   inof
            list:   list
            then:   @scope thn
            
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

        # print.tokens 'while then|block' tokens if @verbose
        
        thn = @then 'while then' tokens
        
        @pop 'while'
        
        while:
            cond: cond
            then: @scope thn
        
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
        
        # print.tokens 'switch whens' tokens if @debug
        
        whens = []
        while tokens[0]?.text == 'when'
            print.tokens 'switch when' tokens if @debug
            whens.push @exp tokens
                        
        e = switch:
                match:  match
                whens:  whens
        
        # print.tokens 'switch else?' tokens if @debug
        
        if tokens[0]?.text == 'else'

            # print.tokens 'switch else' tokens if @debug
            
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
        
        # print.tokens 'when vals' tokens if @debug
        
        vals = []
        
        # @verb 'when.vals tokens[0]' tokens[0]
        
        while (tokens[0]? and (tokens[0].type not in ['block''nl']) and tokens[0].text != 'then')
            print.tokens 'when val' tokens if @debug
            vals.push @exp tokens
        
        # print.tokens 'when then' tokens if @debug
        
        @verb 'when.then tokens[0]' tokens[0]
        
        thn = @then 'when then' tokens
        
        @pop 'when'
        
        when:
            vals: vals
            then: @scope thn

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

        # print.tokens 'class extends' tokens if @debug

        if tokens[0]?.text == 'extends'
            tokens.shift()
            e.class.extends = @exps 'class extends' tokens, 'nl'

        # print.tokens 'class body' tokens if @debug
        # print.noon 'before class body' tokens if @debug
        
        if tokens[0]?.type == 'block'
            tokens = tokens.shift().tokens
            e.class.body = @exps 'class body' tokens
            # print.ast 'class before named methods' e if @debug
            @nameMethods e.class.body[0].object.keyvals
            # print.ast 'class after named methods' e if @debug
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

        @push 'func'
        
        body = @scope @exps 'func body' tokens, 'nl'
        
        @pop 'func'
        
        e = func:{}
        e.func.args  = args if args
        e.func.arrow = arrow
        e.func.body  = body
        e

    # 00000000   00000000  000000000  000   000  00000000   000   000  
    # 000   000  000          000     000   000  000   000  0000  000  
    # 0000000    0000000      000     000   000  0000000    000 0 000  
    # 000   000  000          000     000   000  000   000  000  0000  
    # 000   000  00000000     000      0000000   000   000  000   000  
    
    return: (tok, tokens) ->
        
        if tokens[0]?.type != 'nl'
            val = @exp tokens
        
        e = return: ret: tok
        e.return.val = val if val
        e
            
    #  0000000   0000000   000      000
    # 000       000   000  000      000
    # 000       000000000  000      000
    # 000       000   000  000      000
    #  0000000  000   000  0000000  0000000

    call: (tok, tokens, qmrk) ->

        @push 'call'

        # print.tokens 'call.open' tokens if @debug

        tok = tok.token if tok.token
                        
        last = @lastLineCol tok
        if tokens[0].text == '(' and tokens[0].line == last.line and tokens[0].col == last.col
            open = tokens.shift()
            if tokens[0]?.text == ')'
                args = []
            else
                @push 'args('
                args = @exps '(' tokens, ')'
                @pop 'args('
        else
            # print.tokens 'call args' tokens if @debug
            if tok.type == 'keyword' and tok.text in ['typeof' 'delete']
                name = 'arg'
            else
                name = 'args'
            
            args = @block name, tokens
            # print.ast 'call args' args if @debug

        if open and tokens[0]?.text == ')'
            close = tokens.shift()

        if open and not close
            error 'expected )'

        # print.tokens 'call.close' tokens if @debug

        @pop 'call'
        
        e = call: callee: tok
        e.call.open  = open  if open
        e.call.qmrk  = qmrk  if qmrk
        e.call.args  = args
        e.call.close = close if close
        e
            
    #  0000000   00000000   00000000  00000000    0000000   000000000  000   0000000   000   000
    # 000   000  000   000  000       000   000  000   000     000     000  000   000  0000  000
    # 000   000  00000000   0000000   0000000    000000000     000     000  000   000  000 0 000
    # 000   000  000        000       000   000  000   000     000     000  000   000  000  0000
    #  0000000   000        00000000  000   000  000   000     000     000   0000000   000   000

    operation: (lhs, op, tokens) ->

        @push "op#{op.text}"
        
        print.ast 'operation lhs' lhs if @debug
        # print.tokens "operation #{lhs?.text} #{op.text}" tokens if @debug
        
        if op.text == '='
            # rhs = @blockExp 'operation lhs' tokens
            rhs = @exp tokens
        else
            rhs = @exp tokens
        
        # print.ast 'operation rhs' rhs if @debug
        # print.tokens "operation #{rhs?.text} #{op.text}" tokens if @debug
        
        @pop "op#{op.text}"
        
        e = operation: {}
        e.operation.lhs      = lhs if lhs
        e.operation.operator = op
        e.operation.rhs      = rhs if rhs
        e
            
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

        if tokens[0]?.text == ']' 
            close = tokens.shift() 
        else
            if tokens[0]?.type == 'nl' and tokens[1]?.text == ']'
                @shiftNewline 'array ends' tokens
                close = tokens.shift()
            else
                @verb 'array fake closing ]?'
                close = text:']' type:'paren' line:-1 col:-1 

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

        # print.tokens 'index.open' tokens if @debug
                
        open = tokens.shift()

        slice = @exp tokens

        # print.tokens 'index.close' tokens if @debug

        if tokens[0]?.text == ']'
            close = tokens.shift()
        else
            error 'parser.index expected ]'
            print.tokens 'missing ]' tokens

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
            if tokens[0]?.type == 'nl' and tokens[1]?.text == '}'
                @shiftNewline 'curly ends' tokens
                close = tokens.shift()
            else
                @verb 'curly fake closing }?'
                close = text:'}' type:'paren' line:-1 col:-1 

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

        first = @firstLineCol key
        
        print.tokens 'object val' tokens if @debug
        
        exps = [@keyval key, tokens]
        
        # print.tokens 'object continue...?' tokens if @debug

        if tokens[0]?.type == 'nl'
            @verb 'object nl' first.col, tokens[1]?.col
            if tokens[1]?.col >= first.col and tokens[1].text not in '])'
                @verb 'continue block object...' if @debug
                @shiftNewline 'continue block object ...' tokens
                exps = exps.concat @exps 'object' tokens
            else
                @verb 'outdent! object done'
        else
            if tokens[0]?.line == first.line and tokens[0].text not in '])};'
                @verb 'continue inline object...' if @debug
                exps = exps.concat @exps 'object' tokens, ';'
                
        # print.tokens 'object pop' tokens if @debug
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
            value = @exps 'keyval value' block.tokens
        else 
            value = @exp tokens

        @pop ':'

        if key.type in ['keyword' 'op' 'punct' 'var' 'this']
            
            key.type = 'key'
            key.text = key.text
            
        else if key.prop
            
            {line, col} = @firstLineCol key
            text = @kode.renderer.node key
            if text.startsWith 'this'
                if text == 'this' then text = '@'
                else if text.startsWith 'this.' then text = '@' + text[5..]
            delete key.prop
            key.type = 'key'
            key.text = text
            key.line = line
            key.col  = col
        else
            log 'WHAT COULD THAT BE?' key

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

        prop:
            obj:  obj
            dot:  tokens.shift()
            prop: tokens.shift()
            
    # 000000000  000   000  000   0000000  
    #    000     000   000  000  000       
    #    000     000000000  000  0000000   
    #    000     000   000  000       000  
    #    000     000   000  000  0000000   
    
    this: (obj, tokens) ->

        prop:
            obj:  obj
            dot:  type:'punct' text:'.' line:obj.line, col:obj.col
            prop: tokens.shift()
        
module.exports = Parser
