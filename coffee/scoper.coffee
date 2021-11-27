###
 0000000   0000000   0000000   00000000   00000000  00000000 
000       000       000   000  000   000  000       000   000
0000000   000       000   000  00000000   0000000   0000000  
     000  000       000   000  000        000       000   000
0000000    0000000   0000000   000        00000000  000   000
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
        @exp e for e in body.exps
        @maps.pop()
        @vars.pop()
        body
        
    exp: (e) ->

        insert = (v,t) => 
            @verb yellow(v), red(t)
            if not @maps[-1][v]
                @vars[-1].push text:v, type:t
                @maps[-1][v] = t
        
        if e.type == 'var'
            @verb gray(e.type), green(e.text)
        else if e.type
            @verb gray(e.type), blue(e.text)
        else 
            
            if e.operation and e.operation.lhs?.text and e.operation.operator.text == '='
                insert e.operation.lhs.text, e.operation.operator.text
                    
            if e.for
                if e.for.vals.text
                    insert e.for.vals.text, 'for'
                else 
                    vals = e.for.vals.array?.items ? e.for.vals
                    for v in vals ? []
                        insert v.text, 'for' if v.text
                    
            for key,val of e
                if val.type? then @exp val
                else
                    if val instanceof Array
                        @exp v for v in val
                    else
                        @exp v for k,v of val
        
    verb: -> if @verbose then console.log.apply console.log, arguments 

module.exports = Scoper
