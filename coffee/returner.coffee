###
00000000   00000000  000000000  000   000  00000000   000   000  00000000  00000000   
000   000  000          000     000   000  000   000  0000  000  000       000   000  
0000000    0000000      000     000   000  0000000    000 0 000  0000000   0000000    
000   000  000          000     000   000  000   000  000  0000  000       000   000  
000   000  00000000     000      0000000   000   000  000   000  00000000  000   000  
###

###
    walks through an abstract syntax tree and inserts implicit return statements
###

class Returner

    @: (@kode) ->

        @verbose = @kode.args.verbose
        @debug   = @kode.args.debug
        
    collect: (tl) -> @scope tl

    scope: (body) ->

        if body?.exps?.length
            @exp e for e in body.exps
        body
        
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
                else if lst.call then if lst.call.callee.text not in ['log' 'warn' 'error'] then insert()
                else if lst.func then insert()
                else if lst.array then insert()
                else if lst.operation then insert()
                else if lst.prop then insert()
                else if lst.index then insert()
                else if lst.return then null
                else if lst.while then null
                else
                    log 'todo: returner' Object.keys(lst)[0]
            
            @scope f.body 
        
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
        else
            log 'dafuk?' e
        
    verb: -> if @verbose then console.log.apply console.log, arguments 

module.exports = Returner
