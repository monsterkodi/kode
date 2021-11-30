###
00000000   00000000  000000000  000   000  00000000   000   000  00000000  00000000   
000   000  000          000     000   000  000   000  0000  000  000       000   000  
0000000    0000000      000     000   000  0000000    000 0 000  0000000   0000000    
000   000  000          000     000   000  000   000  000  0000  000       000   000  
000   000  00000000     000      0000000   000   000  000   000  00000000  000   000  
###

print = require './print'

###
    walks through an abstract syntax tree and inserts implicit return statements
###

class Returner

    @: (@kode) ->

        @verbose = @kode.args.verbose
        @debug   = @kode.args.debug
        
    #  0000000   0000000   000      000      00000000   0000000  000000000  
    # 000       000   000  000      000      000       000          000     
    # 000       000   000  000      000      0000000   000          000     
    # 000       000   000  000      000      000       000          000     
    #  0000000   0000000   0000000  0000000  00000000   0000000     000     
    
    collect: (tl) -> @scope tl

    #  0000000   0000000   0000000   00000000   00000000  
    # 000       000       000   000  000   000  000       
    # 0000000   000       000   000  00000000   0000000   
    #      000  000       000   000  000        000       
    # 0000000    0000000   0000000   000        00000000  
    
    scope: (body) ->

        if body?.exps?.length
            @exp e for e in body.exps
        body
        
    # 00000000  000   000  000   000   0000000  
    # 000       000   000  0000  000  000       
    # 000000    000   000  000 0 000  000       
    # 000       000   000  000  0000  000       
    # 000        0000000   000   000   0000000  
    
    func: (f) ->
        
        @exp f.args if f.args
        
        if f.body?.exps?.length

            if f.name?.text not in ['@' 'constructor']
                
                lst = f.body.exps[-1]
                
                insert = -> 
                    f.body.exps.push return:
                        ret: type:'keyword' text:'return'
                        val: f.body.exps.pop()
                
                if lst.type in ['var' 'num' 'single' 'double' 'triple'] then insert()
                else if lst.call        then if lst.call.callee.text not in ['log' 'warn' 'error'] then insert()
                else if lst.operation   then insert()
                else if lst.func        then insert()
                else if lst.array       then insert()
                else if lst.prop        then insert()
                else if lst.index       then insert()
                else if lst.return      then null
                else if lst.while       then null
                else if lst.if          then @if lst.if
                else
                    log 'todo: returner' Object.keys(lst)[0]
            
            @scope f.body 
        
    # 000  00000000  
    # 000  000       
    # 000  000000    
    # 000  000       
    # 000  000       
    
    if: (e) ->
        
        e.returns = true
        e.then = @insert e.then
        
        for ei in e.elifs ? []
            @insert ei.elif.exps if ei.elif.exps
        
        e.else = @insert e.else if e.else
            
    insert: (e) ->

        if e instanceof Array
            l = e[-1]
            if not (l.return or l.call?.callee?.text == 'log')
                e.push
                    return:
                        ret: type:'keyword' text:'return'
                        val: e.pop()
        e
            
    # 00000000  000   000  00000000   
    # 000        000 000   000   000  
    # 0000000     00000    00000000   
    # 000        000 000   000        
    # 00000000  000   000  000        
    
    exp: (e) ->

        if not e then return
            
        if e.type                   then return
        else if e instanceof Array  then @exp v for v in e if e.length
        else if e instanceof Object
            
            if e.func
                @func e.func
            else
                for key,val of e
                    if val
                        if val.type then @exp val
                        else
                            if val instanceof Array
                                if val.length
                                    @exp v for v in val
                            else
                                @exp v for k,v of val
        
    verb: -> if @verbose then console.log.apply console.log, arguments 

module.exports = Returner
