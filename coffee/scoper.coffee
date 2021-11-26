###
 0000000   0000000   0000000   00000000   00000000  00000000 
000       000       000   000  000   000  000       000   000
0000000   000       000   000  00000000   0000000   0000000  
     000  000       000   000  000        000       000   000
0000000    0000000   0000000   000        00000000  000   000
###

class Scoper

    @: (@kode) ->

        @verbose  = @kode.args?.verbose
        @debug    = @kode.args?.debug
        @raw      = @kode.args?.raw
        
    vars: (tl) ->
        
        @stack = []
        @scope tl
        tl

    scope: (body) -> 
        
        @stack.push {}
        @exp e for e in body.exps
        body.vars = Object.keys @stack.pop()
        # log 'scoper:' body.vars
        body.vars
        
    exp: (e) ->
        
        # log(e)
        
    verb: -> if @verbose then console.log.apply console.log, arguments 

module.exports = Scoper
