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

class Parse # the base class of Parser

    @: (@kode) ->

        @debug    = @kode.args.debug
        @verbose  = @kode.args.verbose
        @raw      = @kode.args.raw

    # 00000000    0000000   00000000    0000000  00000000
    # 000   000  000   000  000   000  000       000
    # 00000000   000000000  0000000    0000000   0000000
    # 000        000   000  000   000       000  000
    # 000        000   000  000   000  0000000   00000000

    parse: (block) -> # convert block tree to abstract syntax tree

        @stack = []
        @sheap = []

        ast = []

        # while block.tokens.length
        ast = ast.concat @exps 'tl' block.tokens

        if @raw then print.noon 'raw ast' ast

        vars:[] 
        exps:ast

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
            
                when '▸arg'                 then es.length
                when 'if' 'switch' '▸else'  then tokens[0].text == 'else'
                when '['                    then tokens[0].text == ']'  
                when '{'                    then tokens[0].text in '}'
                when '('                    then tokens[0].text == ')'
                when '▸args'                then tokens[0].text in '];'
                when 'call'                 then tokens[0].text in ';' # bail out for implicit calls
                                                                                   
                when rule                   then tokens[0].text == stop                    
                else false

            if b then @verb "exps break for #{tokens[0].text} and stack top" @stack ; break 
                
            if tokens[0].text == stop then @verb "exps break for #{tokens[0].text} and stop" stop ; break 
                    
            if tokens[0].type == 'block'
    
                block = tokens.shift()
    
                @verb "exps block start" block
                    
                es = es.concat @exps 'block' block.tokens                    

                if tokens[0]?.text == ','
                    @verb "exps block end shift comma , and continue..."
                    tokens.shift()
                    continue
                else if tokens[0]?.type == 'nl' and tokens[1]?.text == ','
                    @shiftNewline "exps block end nl comma , and continue..." tokens
                    tokens.shift()
                    continue
                    
                @verb 'exps block end break!' block.tokens.length
                break
                
            if tokens[0].type == 'block'    then @verb 'exps break on block'    ; break
            if tokens[0].text == ')'        then @verb 'exps break on )'        ; break
            if tokens[0].text in ['in''of'] and rule == 'for vals' then @verb 'exps break on in|of' ; break
                
            if tokens[0].type == 'nl' 
                
                @verb 'exps nl stop:' stop, tokens[0], @stack
                    
                if @stack[-1] == '[' and tokens[1]?.text == ']'
                    @shiftNewline 'exps nl ] in array' tokens
                    break
                    
                if stop
                    @verb 'exps nl with stop' stop
                    if @stack[-1] in ['call' ':' 'func' '▸args']
                        @verb "exps nl with stop in #{@stack[-1]} (break, but don't shift nl)"
                    else
                        @shiftNewline "exps nl with stop #{stop}" tokens 
                    break 

                nl = @shiftNewline "exps nl (no stop) ..." tokens
                
                if tokens[0]?.text == '.' and tokens[1]?.type == 'var'
                    log 'exps nl next line starts with .var!'
                    es.push @prop es.pop(), tokens
                    
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

            e = @lhs e, tokens               # see, if we can use the result as the left hand side of something
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

            if nxt.text in '({' and e.type in ['single' 'double' 'triple' 'num' 'regex']
                break
            
            if @stack[-1] == '▸arg' and nxt.type == 'op' then @verb 'rhs break for ▸arg'; break
                
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
                if      e.text == '['   then e = @array           e, tokens
                else if e.text == '('   then e = @parens          e, tokens
                else if e.text == '{'   then e = @curly           e, tokens                
                else if e.text == 'not' then e = @operation null, e, tokens
                else if e.text in ['+''-''++''--'] and unspaced
                    if nxt.type not in ['var''paren'] and e.text in ['++''--']
                        tokens.shift()
                        error 'wrong lhs increment' e, nxt
                        return
                    @verb 'rhs null operation'
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
                else
                    print.tokens "rhs no nxt match? break! stack:#{@stack} nxt:" [nxt] if @verbose
                    break                    
                    
            else # if e is not a token anymore
                
                if nxt.text in ['++''--']    and unspaced        then e = @operation e, tokens.shift(); break
                else if @stack[-1] == 'call' and nxt.text == ']' then @verb 'rhs call array end';       break
                else if @stack[-1] == '{'    and nxt.text == '}' then @verb 'rhs curly end';            break                    
                else if @stack[-1] == '['    and nxt.text == ']' then @verb 'rhs array end';            break
                else if @stack[-1] == '['    and nxt.text == ']' then @verb 'rhs [ array end' nxt;      break
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
            
            if      nxt.text == '.'    then e = @prop   e, tokens
            else if nxt.type == 'dots' then e = @slice  e, tokens
            else if nxt.text == '?' and unspaced and tokens[1]?.text == '.'
                qmark = tokens.shift()
                e = @prop e, tokens, qmark # this should be done differently!
                
            else if (
                    nxt.type == 'op' and 
                    nxt.text not in ['++' '--' '+' '-' 'not'] and 
                    e.text not in ['[' '('] and                     
                    '▸arg' not in @stack
                    )
                if @stack[-1]?.startsWith 'op' and @stack[-1] != 'op='
                    @verb 'lhs stop on operation' e, nxt
                    break
                else
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
                @verb 'lhs is args for func' e
                e = @func e, tokens.shift(), tokens
                
            else if nxt.text == '(' and unspaced
                @verb 'lhs is lhs of call'
                e = @call e, tokens
                    
            else if nxt.text == '[' and unspaced and tokens[1]?.text != ']'
                @verb 'lhs is lhs of index' e
                e = @index e, tokens
                    
            else if (
                    spaced and (nxt.line == last.line or nxt.col > first.col) and
                    nxt.text not in ['then' 'else' 'break' 'continue' 'in' 'of'] and 
                    (e.type not in ['num' 'single' 'double' 'triple' 'regex' 'punct' 'comment' 'op']) and 
                    (e.text not in ['null' 'undefined' 'Infinity' 'NaN' 'true' 'false' 'yes' 'no']) and 
                    not e.array and
                    not e.object and
                    not e.keyval and
                    not e.operation and
                    not e.incond and
                    e.call?.callee?.text not in ['delete''new''typeof'] and
                    '▸arg' not in @stack
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

    #  0000000  000   000  000  00000000  000000000  000   000  00000000  000   000  000      000  000   000  00000000  
    # 000       000   000  000  000          000     0000  000  000       000 0 000  000      000  0000  000  000       
    # 0000000   000000000  000  000000       000     000 0 000  0000000   000000000  000      000  000 0 000  0000000   
    #      000  000   000  000  000          000     000  0000  000       000   000  000      000  000  0000  000       
    # 0000000   000   000  000  000          000     000   000  00000000  00     00  0000000  000  000   000  00000000  
    
    shiftNewline: (rule, tokens) ->
        
        if @debug then log M3 y5 " ◂ #{w1 rule}" 
        tokens.shift()
        
    # 000   000   0000000   00     00  00000000  00     00  00000000  000000000  000   000   0000000   0000000     0000000  
    # 0000  000  000   000  000   000  000       000   000  000          000     000   000  000   000  000   000  000       
    # 000 0 000  000000000  000000000  0000000   000000000  0000000      000     000000000  000   000  000   000  0000000   
    # 000  0000  000   000  000 0 000  000       000 0 000  000          000     000   000  000   000  000   000       000  
    # 000   000  000   000  000   000  00000000  000   000  00000000     000     000   000   0000000   0000000    0000000   
    
    nameMethods: (mthds) ->
 
        if mthds?.length
            for m in mthds
                if name = m.keyval.key?.text
                    m.keyval.val.func.name = type:'name' text:name
        mthds
        
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
            tokens = block.tokens
            nl = null
        else 
            nl = 'nl'

        @push '▸'+id
        exps = @exps id, tokens, nl
        @pop '▸'+id

        if block and block.tokens.length
            print.tokens 'dangling block tokens' tokens
            
        exps
                    
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
        print.sheap @sheap if @debug
        
    sheapPop: (m, t) ->
        
        popped = @sheap.pop()
        if popped.text != t and popped.text != kstr.strip(t, "'") then error 'wrong pop?' popped.text, t
        print.sheap @sheap, popped if @debug
        
    #  0000000  000000000   0000000    0000000  000   000  
    # 000          000     000   000  000       000  000   
    # 0000000      000     000000000  000       0000000    
    #      000     000     000   000  000       000  000   
    # 0000000      000     000   000   0000000  000   000  

    push: (node) ->

        print.stack @stack, node if @debug
        @stack.push node

    pop: (n) ->
        p = @stack.pop()
        if p != n
            error "unexpected pop!" p, n
        if @debug
            print.stack @stack, p, (s) -> W1 w1 s

    verb: -> if @verbose then console.log.apply console.log, arguments 
    
module.exports = Parse
