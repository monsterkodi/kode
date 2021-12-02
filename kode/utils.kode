###
000   000  000000000  000  000       0000000    
000   000     000     000  000      000         
000   000     000     000  000      0000000     
000   000     000     000  000           000    
 0000000      000     000  0000000  0000000     
###

# 00000000  00     00  00000000   000000000  000   000  
# 000       000   000  000   000     000      000 000   
# 0000000   000000000  00000000      000       00000    
# 000       000 0 000  000           000        000     
# 00000000  000   000  000           000        000     

empty = (a) -> a in ['' null undefined] or (typeof(a) == 'object' and Object.keys(a).length == 0)

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
        if not empty cols
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
        if not empty cols
            return cols.reduce (a,b) -> 
                if a.line < b.line then a 
                else if a.line == b.line
                    if a.col < b.col then a else b
                else b
    line:Infinity
    col: Infinity
        
module.exports = { firstLineCol, lastLineCol, empty }
