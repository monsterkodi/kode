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
        @args = []
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
        @args.push {}
        @vars.push body.vars
        @exp e for e in body.exps ? []
        @maps.pop()
        @args.pop()
        @vars.pop()
        body
        
    # 00000000  000   000  000   000   0000000  
    # 000       000   000  0000  000  000       
    # 000000    000   000  000 0 000  000       
    # 000       000   000  000  0000  000       
    # 000        0000000   000   000   0000000  
    
    func: (f) ->

        @maps.push {}
        @args.push {}
        @vars.push f.body.vars
        
        for arg in f.args?.parens.exps ? []
            if t = arg.text
                @args[-1][t] = t
            else if t = arg.operation?.lhs?.text
                @args[-1][t] = t
            else
                log 'todo: scoper handle complex arg' arg if arg.prop?.obj?.text != '@'

        @exp e for e in f.body?.exps ? []
        @maps.pop()
        @args.pop()
        @vars.pop()
        f
        
    # 00000000  000   000  00000000   
    # 000        000 000   000   000  
    # 0000000     00000    00000000   
    # 000        000 000   000        
    # 00000000  000   000  000        
    
    exp: (e) ->

        if not e then return
            
        insert = (v,t) =>
            
            for map in @maps then if map[v] then return
            for arg in @args then if arg[v] then return
                
            @verb yellow(v), red(t)
            
            @vars[-1].push text:v, type:t
            @maps[-1][v] = t
        
        if e.type 
            if e.type == 'code'
                @exp e.exps
            return
        else if e instanceof Array  then @exp v for v in e if e.length
        else if e instanceof Object
            
            if e.operation and e.operation.operator.text == '='
                if e.operation.lhs?.text
                    insert e.operation.lhs.text, e.operation.operator.text
                else if e.operation.lhs.object
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

            if e.function
                insert e.function.name.text
                    
            if e.func
                @func e.func
            else
                @exp val for key,val of e
        return
        
    verb: -> if @verbose then console.log.apply console.log, arguments 

module.exports = Scoper
