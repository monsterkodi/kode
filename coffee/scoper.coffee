###
 0000000   0000000   0000000   00000000   00000000  00000000 
000       000       000   000  000   000  000       000   000
0000000   000       000   000  00000000   0000000   0000000  
     000  000       000   000  000        000       000   000
0000000    0000000   0000000   000        00000000  000   000
###

# walks through an abstract syntax tree and collects vars

class Scoper

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
        
        @maps = []
        @vars = []
        @scope tl
        tl

    #  0000000   0000000   0000000   00000000   00000000  
    # 000       000       000   000  000   000  000       
    # 0000000   000       000   000  00000000   0000000   
    #      000  000       000   000  000        000       
    # 0000000    0000000   0000000   000        00000000  
    
    scope: (body) ->

        @maps.push {}
        @vars.push body.vars
        @exp e for e in body.exps ? []
        @maps.pop()
        @vars.pop()
        body
        
    # 00000000  000   000  00000000   
    # 000        000 000   000   000  
    # 0000000     00000    00000000   
    # 000        000 000   000        
    # 00000000  000   000  000        
    
    exp: (e) ->

        # @verb 'scoper.exp' e
        
        if not e then return
            
        insert = (v,t) => 
            @verb yellow(v), red(t)
            
            for map in @maps 
                if map[v] then return
            
            @vars[-1].push text:v, type:t
            @maps[-1][v] = t
        
        if e.type then null
        else if e instanceof Array  then @exp v for v in e if e.length
        else if e instanceof Object
            
            if e.operation and e.operation.operator.text == '='
                if e.operation.lhs?.text
                    insert e.operation.lhs.text, e.operation.operator.text
                else if e.operation.lhs.object
                    # log 'scoper curly lhs' e.operation.lhs.object.keyvals
                    for keyval in e.operation.lhs.object.keyvals
                        if keyval.type == 'var'
                            insert keyval.text, 'curly'
                else if e.operation.lhs.array
                    for val in e.operation.lhs.array.items
                        if val.type == 'var'
                            insert val.text, 'array'
            if e.for
                
                if e.for.vals.text
                    insert e.for.vals.text, 'for'
                else 
                    vals = e.for.vals.array?.items ? e.for.vals
                    for v in vals ? []
                        insert v.text, 'for' if v.text
                        
            if e.assert
                @verb 'assert' e
                if e.assert.obj.type != 'var' and not e.assert.obj.index
                    insert "_#{e.assert.qmrk.line}_#{e.assert.qmrk.col}_" '?.'
                
            if e.qmrkop
                @verb 'qmrkop' e
                if e.qmrkop.lhs.type != 'var'
                    insert "_#{e.qmrkop.qmrk.line}_#{e.qmrkop.qmrk.col}_" ' ? '

            if e.func
                @exp   e.func.args if e.func.args
                @scope e.func.body if e.func.body
            else
                @exp val for key,val of e
        return
        
    verb: -> if @verbose then console.log.apply console.log, arguments 

module.exports = Scoper
