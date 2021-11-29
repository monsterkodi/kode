###
 0000000   0000000   0000000   00000000   00000000  00000000 
000       000       000   000  000   000  000       000   000
0000000   000       000   000  00000000   0000000   0000000  
     000  000       000   000  000        000       000   000
0000000    0000000   0000000   000        00000000  000   000
###

###
    walks through an abstract syntax tree and collects vars
###

class Scoper

    @: (@kode) ->

        @verbose = @kode.args.verbose
        @debug   = @kode.args.debug
        @raw     = @kode.args.raw
        
    collect: (tl) ->
        
        @maps = []
        @vars = []
        @scope tl
        tl

    scope: (body) ->

        @maps.push {}
        @vars.push body.vars
        @exp e for e in body.exps ? []
        @maps.pop()
        @vars.pop()
        body
        
    exp: (e) ->

        if not e then return
            
        insert = (v,t) => 
            @verb yellow(v), red(t)
            if not @maps[-1][v]
                @vars[-1].push text:v, type:t
                @maps[-1][v] = t
        
        if e.type then null
        else if e instanceof Array  then @exp v for v in e if e.length
        else if e instanceof Object
            
            if e.operation and e.operation.lhs?.text and e.operation.operator.text == '='
                insert e.operation.lhs.text, e.operation.operator.text
                    
            if e.for
                if e.for.vals.text
                    insert e.for.vals.text, 'for'
                else 
                    vals = e.for.vals.array?.items ? e.for.vals
                    for v in vals ? []
                        insert v.text, 'for' if v.text

            if e.func
                @exp   e.func.args if e.func.args
                @scope e.func.body if e.func.body
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

module.exports = Scoper
