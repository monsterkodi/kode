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

        # log 'Scoper scope' body
        @maps.push {}
        @vars.push body.vars
        @exp e for e in body.exps
        @maps.pop()
        @vars.pop()
        # log 'scoper:' body #if body.vars.length
        body
        
    exp: (e) ->

        # log e
        if e.type == 'var'
            @verb gray(e.type), green(e.text)
        else if e.type
            @verb gray(e.type), blue(e.text)
        else 
            if e.operation and e.operation.lhs?.text and e.operation.operator.text == '='
                @verb yellow(e.operation.lhs.text), red(e.operation.operator.text)
                if not @maps[-1][e.operation.lhs.text]
                    @vars[-1].push text:e.operation.lhs.text, type:e.operation.operator.text
                    @maps[-1][e.operation.lhs.text] = e.operation.operator.text
                    # log 'insert' @vars, @maps
            # log 'scoper node' e
            for key,val of e
                if val.type? then @exp val
                else
                    if val instanceof Array
                        @exp v for v in val
                    else
                        @exp v for k,v of val
        
    verb: -> if @verbose then console.log.apply console.log, arguments 

module.exports = Scoper
