###
00000000    0000000   00000000    0000000  00000000
000   000  000   000  000   000  000       000     
00000000   000000000  0000000    0000000   0000000 
000        000   000  000   000       000  000     
000        000   000  000   000  0000000   00000000
###

kstr  = require 'kstr'
print = require './print'
empty = (a) -> a in ['' null undefined] or (typeof(a) == 'object' and Object.keys(a).length == 0)

Renderer = require './renderer'

class Parse # the base class of Parser

    @: (args) ->

        @renderer = new Renderer args
        @debug    = args?.debug
        @verbose  = args?.verbose
        @raw      = args?.raw

    # 00000000    0000000   00000000    0000000  00000000
    # 000   000  000   000  000   000  000       000
    # 00000000   000000000  0000000    0000000   0000000
    # 000        000   000  000   000       000  000
    # 000        000   000  000   000  0000000   00000000

    parse: (block) -> # convert block tree to abstract syntax tree

        @stack = []
        @sheap = []

        ast = []

        while block.tokens.length
            ast = ast.concat @exps 'tl' block.tokens

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
        
        @sheapPush 'exps' rule

        es = []
                        
        while tokens.length
            
            numTokens = tokens.length
            
            b = switch @stack[-1]
            
                when 'onearg'       then es.length
                when 'if' 'switch'  then tokens[0].text == 'else'
                when '['            then tokens[0].text == ']'  
                when 'call'         then tokens[0].text in ')}];' # bail out for implicit calls
                when '{'            then tokens[0].text in ')}];' # bail out for implicit objects
                                                                                   
                when rule           then tokens[0].text == stop                    
                else false

            if b
                @verb 'exps break for stack top' @stack
                break 
                    
            if tokens[0].type == 'block'
    
                block = tokens.shift()
    
                @verb "exps block start" block
                    
                es = es.concat @exps 'exps block' block.tokens                    

                if tokens[0]?.type == 'nl' 
                    @verb "exps block end shift nl" 
                    nl = tokens.shift()
                    
                if tokens[0]?.text == ','
                    @verb "exps block end shift , and continue..."
                    tokens.shift()
                    continue
                    
                @verb 'exps block end break!'
                break
                
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
                    
                if @stack[-1] == '[' and tokens[1]?.text == ']'
                    @verb 'exps nl in array (shift and break)'
                    tokens.shift()
                    break
                    
                if stop
                    @verb 'exps nl with stop' 
                    if @stack[-1] == 'call'
                        @verb "exps nl with stop in call (break, but don't shift nl)"
                    else
                        @verb 'exps nl with stop (shift and break)' 
                        tokens.shift() 
                    break 

                @verb 'exps nl shift and ...'     
                nl = tokens.shift()
                
                if tokens[0]?.text == '.' and tokens[1]?.type == 'var'
                    log 'exps nl next line starts with .var!'
                    es.push @prop es.pop(), tokens
                    
                # log 'tokens[0].col' tokens[0].col
                
                @verb 'exps nl continue...' 
                continue
                
            ex = @exp tokens
            es.push ex
            
            if numTokens == tokens.length
                error 'exps no token consumed?'
                break

        @sheapPop 'exps' rule
        
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
        
        # this assumes that the handling of lists of expressions is done in exps and
        # silently skips over leading separating tokens like commatas, semicolons and nl.

        switch tok.type
            when 'block'            then return error "INTERNAL ERROR: unexpected block token in exp!"
            when 'nl'               
                @verb 'exp start shift nl!'
                return @exp tokens # skip nl
            when 'keyword'
                switch tok.text 
                    when 'if'       then return @if     tok, tokens
                    when 'for'      then return @for    tok, tokens
                    when 'while'    then return @while  tok, tokens
                    when 'return'   then return @return tok, tokens
                    when 'switch'   then return @switch tok, tokens
                    when 'when'     then return @when   tok, tokens
                    when 'class'    then return @class  tok, tokens
            else
                switch tok.text 
                    when '->' '=>'  then return @func null, tok, tokens
                    when ';'        then if tokens[0]?.text != ':' then return @exp tokens # skip ;

        ###
        here comes the hairy part :-)
        
        combine information about the rule stack, current and future tokens
        to figure out when the expression ends
        ###

        @sheapPush 'exp' tok.text ? tok.type
        
        e = tok
        while tokens.length
            numTokens = tokens.length

            e = @rhs e, tokens               # first, try to eat as much tokens as possible to the right
            print.ast "rhs" e if @verbose    

            e = @lhs e, tokens               # see, if we can the result as the left hand side of something
            print.ast "lhs" e if @verbose   
            
            if numTokens == tokens.length
                if tokens[0]?.text in ','
                    @verb 'exp shift comma'
                    tokens.shift()
                    break
                else
                    @verb 'exp no token consumed: break!'
                    break                    # bail out if no token was consumed
            
        print.ast "exp #{if empty(@stack) then 'DONE' else ''}" e if @verbose
        
        @sheapPop 'exp' tok.text ? tok.type
        e        

    # 00000000   000   000   0000000  
    # 000   000  000   000  000       
    # 0000000    000000000  0000000   
    # 000   000  000   000       000  
    # 000   000  000   000  0000000   
    
    rhs: (e, tokens) ->
        
        @sheapPush 'rhs' 'rhs'
        
        while nxt = tokens[0]
            
            numTokens = tokens.length

            if not e then return error 'no e?' nxt
            
            unspaced = (llc = @lastLineCol(e)).col == nxt.col and llc.line == nxt.line
            spaced = not unspaced

            if @stack[-1] == 'onearg' and nxt.type in ['op']
                @verb 'rhs break for onearg'
                break
                            
            if spaced and nxt.text == '('
                @verb 'rhs is open paren'
                e = @parens e, tokens

            else if nxt.text == ':'
                if @stack[-1] != '{'
                    @verb 'rhs is first key of implicit object' e
                    e = @object e, tokens
                else
                    @verb 'rhs is key of (implicit) object' e
                    e = @keyval e, tokens
            else if nxt.type == 'keyword' and nxt.text == 'in' and @stack[-1] != 'for'
                e = @incond e, tokens
            else if e.text?
                if      e.text == '(' then e = @parens e, tokens
                else if e.text == '[' then e = @array  e, tokens
                else if e.text == '{' then e = @curly  e, tokens
                else if e.text in ['+''-''++''--'] and unspaced
                    if nxt.type not in ['var''paren'] and e.text in ['++''--']
                        tokens.shift()
                        error 'wrong lhs increment' e, nxt
                        return
                    @verb 'lhs null operation'
                    e = @operation null, e, tokens
                    if e.operation.rhs?.operation?.operator?.text in ['++''--']
                        error 'left and right side increment'
                        return
                else if nxt.text in ['++''--'] and unspaced
                    if e.type not in ['var']
                        tokens.shift()
                        error 'wrong rhs increment'
                        return
                    e = @operation e, tokens.shift() 
                else if nxt.type == 'dots' and e.type in ['var' 'num']
                    e = @slice e, tokens
                else if @stack[-1] == '[' and nxt.text == ']'
                    @verb 'rhs array end'
                    break
                else if @stack[-1] == '{' and nxt.text == '}'
                    @verb 'rhs curly end'
                    break                    
                else
                    print.tokens "rhs no nxt match? break! stack:#{@stack} nxt:" [nxt] if @verbose
                    break                    
                    
            else # if e is not a token anymore
                if nxt.text in ['++''--'] and unspaced
                    e = @operation e, tokens.shift() # missing break here?
                else if nxt.type == 'dots' and @stack[-1] not in '.' # i think this should be removed!
                    e = @slice e, tokens # missing break here?
                else if @stack[-1] == 'call' and nxt.text == ']'
                    @verb 'rhs call array end'
                    break
                else if @stack[-1] == '[' and nxt.text == ']'
                    @verb 'rhs [ array end' nxt
                    break
                else
                    if @verbose
                        print.ast "rhs no nxt match?? stack:#{@stack} e:" e
                        print.tokens "rhs no nxt match?? nxt:" nxt
                    break
                    
            if numTokens == tokens.length
                error 'rhs no token consumed?'
                break
        
        if nxt = tokens[0]
            
            if empty @stack
                
                @verb 'rhs empty stack nxt' nxt
            
                if nxt.text == '[' and tokens[1]?.text != ']'
                    @verb 'rhs is last minute lhs of index' e
                    e = @index e, tokens                
                    
                # implement null checks here?
                
        @sheapPop 'rhs' 'rhs'
        e
        
    # 000      000   000   0000000  
    # 000      000   000  000       
    # 000      000000000  0000000   
    # 000      000   000       000  
    # 0000000  000   000  0000000   
    
    lhs: (e, tokens) ->
        
        @sheapPush 'lhs' 'lhs'
        
        while nxt = tokens[0]
            
            numTokens = tokens.length

            if not e then return error 'no e?' nxt
            
            last  = @lastLineCol  e
            first = @firstLineCol e
            unspaced = last.col == nxt.col and last.line == nxt.line
            spaced = not unspaced

            b = switch @stack[-1]
                when '[' then nxt.text == ']'
                when '{' then nxt.text == '}'
                
            break if b
            
            if e.text == '@' 
                if nxt.type == 'block' and @stack[-1] == 'if' or nxt.text == 'then'
                    break
                else
                    e = @this e, tokens
                    break
            
            if nxt.text == '.'
                @verb 'lhs prop'
                e = @prop e, tokens

            else if nxt.text == '?' and unspaced and tokens[1]?.text == '.'
                qmark = tokens.shift()
                e = @prop e, tokens, qmark # this should be done differently!
                
            else if nxt.type == 'op' and nxt.text not in ['++' '--' '+' '-'] and e.text not in ['[' '('] and 'onearg' not in @stack
                @verb 'lhs is lhs of op' e, nxt
                e = @operation e, tokens.shift(), tokens
                
            else if (
                    nxt.text in ['+' '-'] and 
                    e.text not in ['[' '('] and
                    spaced and tokens[1]?.col > nxt.col+nxt.text.length
                    )
                @verb 'lhs is lhs of +-\s' e, nxt
                e = @operation e, tokens.shift(), tokens
            
            else if nxt.type == 'func' and e.parens
                f = tokens.shift()
                @verb 'rhs func for e' e
                e = @func e, f, tokens
                
            else if nxt.text == '(' and unspaced
                @verb 'lhs is lhs of call'
                e = @call e, tokens
                    
            else if nxt.text == '[' and unspaced and tokens[1]?.text != ']' # and e.text != '['
                @verb 'rhs is lhs of index' e
                e = @index e, tokens
                    
            else if (
                    spaced and (nxt.line == last.line or nxt.col > first.col) and
                    nxt.text not in ')]},;:.' and 
                    nxt.text not in ['then' 'else' 'break' 'continue' 'in' 'of'] and 
                    nxt.type not in ['nl'] and 
                    (e.type not in ['num' 'single' 'double' 'triple' 'regex' 'punct' 'comment' 'op']) and 
                    (e.text not in ['null' 'undefined' 'Infinity' 'NaN' 'true' 'false' 'yes' 'no']) and 
                    (e.type != 'keyword' or (e.text in ['new' 'require' 'typeof' 'delete'])) and 
                    not e.array and
                    not e.object and
                    not e.keyval and
                    not e.operation and
                    not e.incond and
                    e.call?.callee?.text not in ['delete''new''typeof'] and
                    'onearg' not in @stack
                    )
                @verb 'lhs is lhs of implicit call! e' e, @stack[-1]
                @verb '    is lhs of implicit call! nxt' nxt
                @verb '    is lhs first' first 
                e = @call e, tokens
                break

            else if nxt.type == 'op' and nxt.text in ['+' '-'] and e.text not in ['[' '(']
                if spaced and tokens[1]?.col == nxt.col+nxt.text.length
                    @verb 'lhs op is unbalanced +- break...' e, nxt, @stack
                    break
                @verb 'lhs is lhs of op' e, nxt
                e = @operation e, tokens.shift(), tokens
                
            else
                print.tokens "lhs no nxt match? break! stack:#{@stack} nxt:" [nxt] if @verbose
                break                    
            
            if numTokens == tokens.length
                error 'lhs no token consumed?'
                break
                
        @sheapPop 'lhs' 'lhs'       
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
        
    # 0000000    000       0000000    0000000  000   000  00000000  000   000  00000000   
    # 000   000  000      000   000  000       000  000   000        000 000   000   000  
    # 0000000    000      000   000  000       0000000    0000000     00000    00000000   
    # 000   000  000      000   000  000       000  000   000        000 000   000        
    # 0000000    0000000   0000000    0000000  000   000  00000000  000   000  000        
    
    blockExp: (id, tokens) ->
        
        @verb "blockExp #{id}"
        if tokens[0]?.type == 'block'
            block = tokens.shift()
            # if tokens[0]?.type == 'nl' then tokens.shift()
            @exp block.tokens
        else 
            @exp tokens
            
    # 000       0000000    0000000  000000000  000      000  000   000  00000000   0000000   0000000   000      
    # 000      000   000  000          000     000      000  0000  000  000       000       000   000  000      
    # 000      000000000  0000000      000     000      000  000 0 000  0000000   000       000   000  000      
    # 000      000   000       000     000     000      000  000  0000  000       000       000   000  000      
    # 0000000  000   000  0000000      000     0000000  000  000   000  00000000   0000000   0000000   0000000  
    
    lastLineCol: (e) =>
        
        if e?.col?
            return
                line: e.line
                col:  e.col+e.text?.length
        else if e? and e instanceof Object
            cols = Object.values(e).map @lastLineCol
            if not empty cols
                return cols.reduce (a,b) -> 
                    if a.line > b.line then a 
                    else if a.line == b.line
                        if a.col > b.col then a else b
                    else b
        line:1
        col: 0

    # 00000000  000  00000000    0000000  000000000  000      000  000   000  00000000   0000000   0000000   000      
    # 000       000  000   000  000          000     000      000  0000  000  000       000       000   000  000      
    # 000000    000  0000000    0000000      000     000      000  000 0 000  0000000   000       000   000  000      
    # 000       000  000   000       000     000     000      000  000  0000  000       000       000   000  000      
    # 000       000  000   000  0000000      000     0000000  000  000   000  00000000   0000000   0000000   0000000  
    
    firstLineCol: (e) =>
        
        if e?.col?
            return
                line: e.line
                col:  e.col
        else if e? and e instanceof Object
            cols = Object.values(e).map @firstLineCol
            if not empty cols
                return cols.reduce (a,b) -> 
                    if a.line < b.line then a 
                    else if a.line == b.line
                        if a.col < b.col then a else b
                    else b
        line:Infinity
        col: Infinity
        
    #  0000000  000   000  00000000   0000000   00000000     
    # 000       000   000  000       000   000  000   000    
    # 0000000   000000000  0000000   000000000  00000000     
    #      000  000   000  000       000   000  000          
    # 0000000   000   000  00000000  000   000  000          
    
    sheapPush: (type, text) ->
        
        @sheap.push type:type, text:text
        print.sheap @sheap if @verbose
        
    sheapPop: (m, t) ->
        
        popped = @sheap.pop()
        if popped.text != t and popped.text != kstr.strip(t, "'") then error 'wrong pop?' popped.text, t
        print.sheap @sheap, popped if @verbose
        
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
