###
 0000000  000000000  00000000   000  00000000    0000000   000        
000          000     000   000  000  000   000  000   000  000        
0000000      000     0000000    000  00000000   000   000  000        
     000     000     000   000  000  000        000   000  000        
0000000      000     000   000  000  000         0000000   0000000    
###

{ empty } = require './utils'
print = require './print'

###
    walks through an abstract syntax tree and parses string interpolations
###

class Stripol

    @: (@kode) ->

        @verbose = @kode.args.verbose
        @debug   = @kode.args.debug
        @raw     = @kode.args.raw
        
    #  0000000   0000000   000      000      00000000   0000000  000000000  
    # 000       000   000  000      000      000       000          000     
    # 000       000   000  000      000      0000000   000          000     
    # 000       000   000  000      000      000       000          000     
    #  0000000   0000000   0000000  0000000  00000000   0000000     000     
    
    collect: (tl) ->
        
        @scope tl
        tl

    #  0000000   0000000   0000000   00000000   00000000  
    # 000       000       000   000  000   000  000       
    # 0000000   000       000   000  00000000   0000000   
    #      000  000       000   000  000        000       
    # 0000000    0000000   0000000   000        00000000  
    
    scope: (body) ->

        @exp body.exps, k, e for e,k in body.exps ? []
        
    # 00000000  000   000  00000000   
    # 000        000 000   000   000  
    # 0000000     00000    00000000   
    # 000        000 000   000        
    # 00000000  000   000  000        
    
    exp: (p, k, e) ->

        if not e then return
            
        if e.type 
            if e.type in ['double' 'triple']
                p[k] = @string e
            return
            
        else if e instanceof Array  then @exp e, k, v for v,k in e if e.length
        else if e instanceof Object
            
            for key,val of e
                if val
                    if val.type then @exp e, key, val
                    else
                        if val instanceof Array
                            @exp val, k, v for v,k in val if val.length
                        else
                            @exp val, k, v for k,v of val
        
    #  0000000  000000000  00000000   000  000   000   0000000   
    # 000          000     000   000  000  0000  000  000        
    # 0000000      000     0000000    000  000 0 000  000  0000  
    #      000     000     000   000  000  000  0000  000   000  
    # 0000000      000     000   000  000  000   000   0000000   
    
    string: (e) ->
        s = if e.type == 'triple' then e.text[3...-3] else e.text[1...-1]
        chunks = @dissect s, e.line, e.col
        if chunks.length > 1
            # log red(e.text), green s
            # print.noon 'chunks' chunks
            if chunks[-1].type != 'close'
                chunks.push type:'close' text:'' line:e.line, col:e.col+s.length
                
            return stripol:chunks
        e
        
    # 0000000    000   0000000   0000000  00000000   0000000  000000000  
    # 000   000  000  000       000       000       000          000     
    # 000   000  000  0000000   0000000   0000000   000          000     
    # 000   000  000       000       000  000       000          000     
    # 0000000    000  0000000   0000000   00000000   0000000     000     
    
    dissect: (s, line, col) ->

        c = 0; chunks = []
            
        push = (type,text) -> 
            chunks.push type:type, text:text, line:line, col:col+c
            # switch type
                # when 'open'  then log m6('open'),  g4 text
                # when 'code'  then log m6('code'),  w8 text
                # when 'midl'  then log m6('midl'),  g4 text
                # when 'close' then log m6('close'), g4 text
        
        while c < s.length
            
            t = s[c..]
            
            # log r5("outer"), b8(c), g3(t)
            
            if not m = /(?<!\\)#{/.exec t
                push 'close' t
                break

            push empty(chunks) and 'open' or 'midl', t[...m.index] 
            
            c += m.index+2
            ic = c

            while c < s.length
                
                t = s[c..]
                
                # log r3("inner"), b8(c), g2(t)
                
                rgs = 
                    triple:  /"""(?:.|\n)*?"""/     
                    double:  /"(?:\\["\\]|[^\n"])*"/
                    single:  /'(?:\\['\\]|[^\n'])*'/
                    comment: /#/                    
                    open:    /{/                    
                    close:   /}/                    
                
                matches = ([k, r.exec t] for k,r of rgs)
                matches = matches.filter (m) -> m[1]?
                
                if empty matches
                    log 'INNER MIDL'
                    push 'midl' s[c..]
                    c = s.length
                    break
                
                matches.sort (a,b) -> a[1].index - b[1].index
                
                length = matches[0][1][0].length
                index  = matches[0][1].index
                
                b = switch matches[0][0]
                    when 'close'
                        push 'code' s[ic...c+index]
                        c += index+length
                        true
                    when 'triple' 'double' 'single'
                        # log 'str' s[ic...c+index+length]
                        c += index+length
                        false
                    else
                        log 'unhandled?' matches[0]
                        c += index+length
                        true
                break if b
            
        chunks
                                
    verb: -> if @verbose then console.log.apply console.log, arguments 

module.exports = Stripol
