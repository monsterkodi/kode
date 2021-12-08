###
000   000  000000000  000  000       0000000    
000   000     000     000  000      000         
000   000     000     000  000      0000000     
000   000     000     000  000           000    
 0000000      000     000  0000000  0000000     
###

childp = require 'child_process'
slash  = require 'kslash'

# 00000000  00     00  00000000   000000000  000   000  
# 000       000   000  000   000     000      000 000   
# 0000000   000000000  00000000      000       00000    
# 000       000 0 000  000           000        000     
# 00000000  000   000  000           000        000     

empty = (a) -> a in ['' null undefined] or (typeof(a) == 'object' and Object.keys(a).length == 0)
valid = (a) -> not empty a

###
00000000   00000000   0000000   000   0000000  000000000  00000000  00000000   
000   000  000       000        000  000          000     000       000   000  
0000000    0000000   000  0000  000  0000000      000     0000000   0000000    
000   000  000       000   000  000       000     000     000       000   000  
000   000  00000000   0000000   000  0000000      000     00000000  000   000  
###

register = ->
    
    loadFile = (module, file) ->
        
        try
            Kode   = require './kode'
            kode   = new Kode header:true, files:[file], map:false
            code   = slash.readText file
            result = kode.compile code
            module._compile result, file
        catch err
            error "error loading #{file}:" code
            throw err
    
    if require.extensions
        
        require.extensions['.kode']   = loadFile
        require.extensions['.coffee'] = loadFile
    
        Module = require 'module'
    
        Module.prototype.load = (file) ->
            @filename = file
            @paths = Module._nodeModulePaths slash.dir file
            ext = '.' + slash.ext file
            Module._extensions[ext](@, file)
            @loaded = true
    
    if childp
    
        { fork } = childp
        binary = require.resolve '../bin/kode'
        
        childp.fork = (path, args, options) ->
            
            if slash.ext(path) in ['kode''coffee']
                
                if not Array.isArray args
                    options = args or {}
                    args = []
                args = [path].concat args
                path = binary
                
            fork path, args, options

# 000       0000000    0000000  000000000  000      000  000   000  00000000   0000000   0000000   000      
# 000      000   000  000          000     000      000  0000  000  000       000       000   000  000      
# 000      000000000  0000000      000     000      000  000 0 000  0000000   000       000   000  000      
# 000      000   000       000     000     000      000  000  0000  000       000       000   000  000      
# 0000000  000   000  0000000      000     0000000  000  000   000  00000000   0000000   0000000   0000000  

lastLineCol = (e) ->
    
    if e?.col?
        return
            line: e.line
            col:  e.col+e.text?.length
    else if e? and e instanceof Object
        cols = Object.values(e).map lastLineCol
        if valid cols
            return cols.reduce (a,b) -> 
                if a.line > b.line then a 
                else if a.line == b.line
                    if a.col > b.col then a else b
                else b
    line:1
    col: 0

# 00000000  000  00000000    0000000  000000000  000      000  000   000  00000000   0000000   0000000   000      
# 000       000  000   000  000          000     000      000  0000  000  000       000       000   000  000      
# 000000    000  0000000    0000000      000     000      000  000 0 000  0000000   000       000   000  000      
# 000       000  000   000       000     000     000      000  000  0000  000       000       000   000  000      
# 000       000  000   000  0000000      000     0000000  000  000   000  00000000   0000000   0000000   0000000  

firstLineCol = (e) ->
    
    if e?.col?
        return
            line: e.line
            col:  e.col
    else if e? and e instanceof Object
        cols = Object.values(e).map firstLineCol
        if valid cols
            return cols.reduce (a,b) -> 
                if a.line < b.line then a 
                else if a.line == b.line
                    if a.col < b.col then a else b
                else b
    line:Infinity
    col: Infinity
            
module.exports = { register, firstLineCol, lastLineCol, empty, valid }
