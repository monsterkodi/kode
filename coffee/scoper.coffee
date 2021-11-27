###
 0000000   0000000   0000000   00000000   00000000  00000000 
000       000       000   000  000   000  000       000   000
0000000   000       000   000  00000000   0000000   0000000  
     000  000       000   000  000        000       000   000
0000000    0000000   0000000   000        00000000  000   000
###

class Scoper

    @: (@kode) ->

        @verbose = @kode.args?.verbose
        @debug   = @kode.args?.debug
        @raw     = @kode.args?.raw
        
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
        # log 'scoper:' body.vars if body.vars.length
        body.vars
        
    exp: (e) ->

        if e.type == 'var'
            # log(gray(e.type), green(e.text)) 
        else if e.type
            # log(gray(e.type), blue(e.text))  
        else if e.operation and e.operation.lhs?.text and e.operation.operator.text == '='
            # log(yellow(e.operation.lhs.text), red(e.operation.operator.text))   
            if not @maps[-1][e.operation.lhs.text]
                @vars[-1].push e.operation.lhs.text
                @maps[-1][e.operation.lhs.text] = e.operation.operator.text
        
    verb: -> if @verbose then console.log.apply console.log, arguments 

module.exports = Scoper
