###
00000000    0000000   00000000    0000000  00000000  00000000
000   000  000   000  000   000  000       000       000   000
00000000   000000000  0000000    0000000   0000000   0000000
000        000   000  000   000       000  000       000   000
000        000   000  000   000  0000000   00000000  000   000
###

# this is the equivalent of a BNF or grammar for this little language.
#    
# instead of converting an essentially dynamic problem to a static 
# representation and then converting that back into dynamic code again,
# i decided to go the direct route.
#
# it might be less formal and sligthly less concise, but it's definitely 
# more customizable and easier to debug.
#
# but the biggest advantage is that the main features are seperated from
# the nasty details and corner cases, which are handled in the base class

print = require './print'
Parse = require './parse'

{ firstLineCol, lastLineCol, empty } = require './utils'

class Parser extends Parse

    scope: (exps) ->
        
        vars: []
        exps: exps
    
    # 000  00000000
    # 000  000
    # 000  000000
    # 000  000
    # 000  000

    if: (tok, tokens) ->

        @push 'if'

        cond = @exp tokens
        
        thn = @then 'if' tokens

        e = if:
                cond:   cond
                then:   thn
                
        @shiftNewlineTok 'if after then' tokens, tok, tokens[1]?.text == 'else'
        
        while tokens[0]?.text == 'else' and tokens[1]?.text == 'if'

            tokens.shift()
            tokens.shift()

            e.if.elifs ?= []

            cond = @exp tokens

            thn = @then 'elif' tokens

            @shiftNewlineTok 'if after elif then' tokens, tok, tokens[1]?.text == 'else'
            
            e.if.elifs.push
                elif:
                    cond: cond
                    then: thn

        if tokens[0]?.text == 'else'

            tokens.shift()

            e.if.else = @block 'else' tokens
            
        print.tokens 'if end ' tokens

        print ''
        e
        
    # 000  00000000  000000000   0000000   000  000      
    # 000  000          000     000   000  000  000      
    # 000  000000       000     000000000  000  000      
    # 000  000          000     000   000  000  000      
    # 000  000          000     000   000  000  0000000  
    
    ifTail: (e, tok, tokens) ->
        
        if:
            cond: @exp tokens
            then: [e]
            
    # 00000000   0000000   00000000   
    # 000       000   000  000   000  
    # 000000    000   000  0000000    
    # 000       000   000  000   000  
    # 000        0000000   000   000  
    
    for: (tok, tokens) ->
        
        @push 'for'

        vals = @exps 'for vals' tokens
        
        vals = vals[0] if vals.length == 1

        inof = tokens.shift()
        
        list = @exp tokens

        thn  = @then 'for' tokens
        
        @pop 'for' 

        for:
            vals:   vals
            inof:   inof
            list:   list
            then:   thn
            
    # 00000000   0000000   00000000   000000000   0000000   000  000      
    # 000       000   000  000   000     000     000   000  000  000      
    # 000000    000   000  0000000       000     000000000  000  000      
    # 000       000   000  000   000     000     000   000  000  000      
    # 000        0000000   000   000     000     000   000  000  0000000  
    
    forTail: (e, tok, tokens) ->
        
        @push 'for'
        
        vals = @exps 'for vals' tokens

        vals = vals[0] if vals.length == 1

        inof = tokens.shift()
        
        list = @exp tokens
        
        @pop 'for' 
        
        for:
            vals:  vals
            inof:  inof
            list:  list
            then: [e]
            
    # 000   000  000   000  000  000      00000000  
    # 000 0 000  000   000  000  000      000       
    # 000000000  000000000  000  000      0000000   
    # 000   000  000   000  000  000      000       
    # 00     00  000   000  000  0000000  00000000  
    
    while: (tok, tokens) ->
        
        @push 'while'
        
        cond = @exp tokens

        thn = @then 'while' tokens
        
        @pop 'while'
        
        while:
            cond: cond
            then: thn

    # 000   000  000   000  000  000      00000000  000000000   0000000   000  000      
    # 000 0 000  000   000  000  000      000          000     000   000  000  000      
    # 000000000  000000000  000  000      0000000      000     000000000  000  000      
    # 000   000  000   000  000  000      000          000     000   000  000  000      
    # 00     00  000   000  000  0000000  00000000     000     000   000  000  0000000  
    
    whileTail: (e, tok, tokens) ->
        
        # @push 'while'
        
        cond = @exp tokens

        # @pop 'while'
        
        while:
            cond: cond
            then: [e]
            
    #  0000000  000   000  000  000000000   0000000  000   000
    # 000       000 0 000  000     000     000       000   000
    # 0000000   000000000  000     000     000       000000000
    #      000  000   000  000     000     000       000   000
    # 0000000   00     00  000     000      0000000  000   000

    switch: (tok, tokens) ->

        @push 'switch'
        
        match = @exp tokens
        
        if tokens[0]?.type == 'block'
            tokens = tokens.shift().tokens
        else
            return @error pop:'switch' msg:'block expected!' tokens
        
        whens = []
        while tokens[0]?.text == 'when'
            whens.push @exp tokens
                        
        e = switch:
                match:  match
                whens:  whens
        
        if tokens[0]?.text == 'else'

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
        
        vals = []
        
        while (tokens[0]? and (tokens[0].type not in ['block''nl']) and tokens[0].text != 'then')
            vals.push @exp tokens
        
        thn = @then 'when' tokens
        
        @shiftNewlineTok 'when with empty then' tokens, tok, empty thn
        
        @pop 'when'
        
        when:
            vals: vals
            then: thn

    # 000000000  00000000   000   000  
    #    000     000   000   000 000   
    #    000     0000000      00000    
    #    000     000   000     000     
    #    000     000   000     000     
    
    try: (tok, tokens) ->
        
        @push 'try'
        
        exps = @block 'body' tokens
        
        @shiftNewlineTok 'try body end' tokens, tok, tokens[1].text in ['catch' 'finally']
        
        if tokens[0]?.text == 'catch'
            
            @push 'catch'

            tokens.shift()
        
            ctch = 
                errr: @exp tokens
                exps: @block 'body' tokens
        
            @pop  'catch'

            @shiftNewlineTok 'try catch end' tokens, tok, tokens[1]?.text == 'finally'
            
        if tokens[0]?.text == 'finally'
            tokens.shift()
            fnlly = @block 'body' tokens
            
        @pop 'try'

        try:
            exps:    exps
            catch:   ctch
            finally: fnlly
            
    #  0000000  000       0000000    0000000   0000000
    # 000       000      000   000  000       000
    # 000       000      000000000  0000000   0000000
    # 000       000      000   000       000       000
    #  0000000  0000000  000   000  0000000   0000000

    class: (tok, tokens) ->

        @push 'class'

        name = tokens.shift()

        e = class:
            name:name

        if tokens[0]?.text == 'extends'
            tokens.shift()
            e.class.extends = @exps 'class extends' tokens, 'nl'

        if tokens[0]?.type == 'block'
            tokens = tokens.shift().tokens
            e.class.body = @exps 'class body' tokens
            @nameMethods e.class.body[0].object.keyvals
                
        @pop 'class'

        e

    # 00000000  000   000  000   000   0000000
    # 000       000   000  0000  000  000
    # 000000    000   000  000 0 000  000
    # 000       000   000  000  0000  000
    # 000        0000000   000   000   0000000

    func: (args, arrow, tokens) ->

        @push 'func'
        
        body = @scope @block 'body' tokens
        
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

        tok = tok.token if tok.token
                        
        last = lastLineCol tok
        if tokens[0].text == '(' and tokens[0].line == last.line and tokens[0].col == last.col
            open = tokens.shift()
            if tokens[0]?.text == ')'
                args = []
            else
                @push 'args('
                args = @exps '(' tokens, ')'
                @pop 'args('
        else
            if tok.type == 'keyword' and tok.text in ['typeof' 'delete']
                name = 'arg'
            else
                name = 'args'
            
            args = @block name, tokens

        if open 
            if tokens[0]?.text == ')'
                close = tokens.shift()
            else if tokens[0]?.type == 'nl' and tokens[1].text == ')'
                @shiftNewline 'implicit call ends' tokens
                close = tokens.shift()

        if open and not close then @error hdr:'call' msg:'explicit call without closing )' tokens

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
        
        if op.text == '='
            rhs = @exp tokens
        else
            rhs = @exp tokens
                
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

        close = @shiftClose 'array' ']' tokens

        @pop '['
        
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

        if tokens[0]?.text == ']'
            upto = null
        else
            upto = @exp tokens

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

        open = tokens.shift()
        
        if tokens[0]?.type == 'dots'
            slice = @slice null, tokens
        else
            slice = @exp tokens

        close = @shiftClose 'index' ']' tokens
        
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

        close = @shiftClose 'parens' ')' tokens
        
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

        close = @shiftClose 'curly' '}' tokens

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

        first = firstLineCol key
        
        exps = [@keyval key, tokens]
        
        if tokens[0]?.type == 'nl'
            if tokens[1]?.col >= first.col and tokens[1].text not in '])'
                @shiftNewline 'continue block object ...' tokens
                exps = exps.concat @exps 'object' tokens
        else
            if tokens[0]?.line == first.line and tokens[0].text not in '])};'
                exps = exps.concat @exps 'object' tokens, ';'
                
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

        k = type:'key'
        
        if key.type 
            
            if key.type not in ['keyword' 'op' 'punct' 'var' 'this' 'num' 'single' 'double' 'triple']
                log 'what could that be?' key
            
            k.text = key.text
            k.line = key.line
            k.col  = key.col
            
        else if key.prop
            
            {line, col} = firstLineCol key
            text = @kode.renderer.node key
            if text.startsWith 'this'
                if text == 'this' then text = '@'
                else if text.startsWith 'this.' then text = '@' + text[5..]

            k.text = text
            k.line = line
            k.col  = col
            
        else
            log 'WHAT COULD THAT BE?' key
            
        keyval:
            key:   k
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
            
    #  0000000    0000000   0000000  00000000  00000000   000000000  
    # 000   000  000       000       000       000   000     000     
    # 000000000  0000000   0000000   0000000   0000000       000     
    # 000   000       000       000  000       000   000     000     
    # 000   000  0000000   0000000   00000000  000   000     000     
    
    assert: (obj, tokens) ->
        
        assert:
            obj:    obj
            qmrk:   tokens.shift()
            
    #  0000000   00     00  00000000   000   000   0000000   00000000   
    # 000   000  000   000  000   000  000  000   000   000  000   000  
    # 000 00 00  000000000  0000000    0000000    000   000  00000000   
    # 000 0000   000 0 000  000   000  000  000   000   000  000        
    #  00000 00  000   000  000   000  000   000   0000000   000        
    
    qmrkop: (lhs, tokens) ->
     
        @push '?'
        
        qmrk = tokens.shift()
        rhs  = @exp tokens
        
        @pop  '?'
        
        qmrkop:
            lhs:    lhs
            qmrk:   qmrk
            rhs:    rhs
            
    #  0000000   00     00  00000000   000   000   0000000   0000000   000       0000000   000   000  
    # 000   000  000   000  000   000  000  000   000       000   000  000      000   000  0000  000  
    # 000 00 00  000000000  0000000    0000000    000       000   000  000      000   000  000 0 000  
    # 000 0000   000 0 000  000   000  000  000   000       000   000  000      000   000  000  0000  
    #  00000 00  000   000  000   000  000   000   0000000   0000000   0000000   0000000   000   000  
    
    qmrkcolon: (qmrkop, tokens) ->
        
        @push ':'
        
        colon = tokens.shift()
        rhs = @exp tokens 
        
        @pop  ':'
        
        qmrkcolon:
            lhs:    qmrkop.lhs
            qmrk:   qmrkop.qmrk
            mid:    qmrkop.rhs
            colon:  colon
            rhs:    rhs
            
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

    error: (o, tokens) ->
        
        @pop o.pop if o.pop
        error B3(b7(" #{tokens[0]?.line ? ' '} ")) + R1(y4(" #{o.hdr ? o.pop} ")) + R2(y7(" #{o.msg} "))
        null
            
module.exports = Parser
