
# 000      000  000   000  00000000  00     00   0000000   00000000   
# 000      000  0000  000  000       000   000  000   000  000   000  
# 000      000  000 0 000  0000000   000000000  000000000  00000000   
# 000      000  000  0000  000       000 0 000  000   000  000        
# 0000000  000  000   000  00000000  000   000  000   000  000        

# keeps track of source positions for a single line of js code

class LineMap
    
    @: (@line) -> @columns = []

    add: (column, [sourceLine, sourceColumn]) ->
        if @columns[column] 
            log "LineMap has column #{column}" sourceLine, sourceColumn, options
            return
        @columns[column] = {line: @line, column, sourceLine, sourceColumn}

    sourceLocation: (column) ->
        
        column-- while not ((mapping = @columns[column]) or (column <= 0))
        mapping and [mapping.sourceLine, mapping.sourceColumn]

###
 0000000   0000000   000   000  00000000    0000000  00000000  00     00   0000000   00000000   
000       000   000  000   000  000   000  000       000       000   000  000   000  000   000  
0000000   000   000  000   000  0000000    000       0000000   000000000  000000000  00000000   
     000  000   000  000   000  000   000  000       000       000 0 000  000   000  000        
0000000    0000000    0000000   000   000   0000000  00000000  000   000  000   000  000        
###

# maps locations in a single generated js file back to locations in the original source file

class SourceMap
    
    @: (@source) -> 
        
        @jscode = ''
        @jsline = 0
        @lines  = []

    commit: (s, tl) ->
        
        if tl
            log b7('c'), ++@jsline, s
            @jsline += s.split('\n').length-1
            @jscode += s + '\n'
        else
            log b4('.'), @jsline, s
        
    done: (s) ->
        
        log b5('d'), @jsline, s.length
        
    add: (source, target) -> # source and target: [line, column]
        
        [line, column] = target
        @lines[line] ?= new LineMap line
        @lines[line].add column, source

    sourceLocation: ([line, column]) ->
        
        line-- until (lineMap = @lines[line]) or (line <= 0)
        lineMap and lineMap.sourceLocation column

    #  0000000   00000000  000   000  00000000  00000000    0000000   000000000  00000000  
    # 000        000       0000  000  000       000   000  000   000     000     000       
    # 000  0000  0000000   000 0 000  0000000   0000000    000000000     000     0000000   
    # 000   000  000       000  0000  000       000   000  000   000     000     000       
    #  0000000   00000000  000   000  00000000  000   000  000   000     000     00000000  
    
    generate: (opt = {}, code) ->
        
        writingline      = 0
        lastColumn       = 0
        lastSourceLine   = 0
        lastSourceColumn = 0
        needComma        = no
        buffer           = ""

        for lineMap, lineNumber in @lines when lineMap
            for mapping in lineMap.columns when mapping
                while writingline < mapping.line
                    lastColumn = 0
                    needComma = no
                    buffer += ";"
                    writingline++

                # Write a comma if we've already written a segment on this line.

                if needComma
                    buffer += ","
                    needComma = no

                # Write the next segment. Segments can be 1, 4, or 5 values.    
                # If just one, then it is a generated column which doesn't match anything in the source code.
                
                # The starting column in the generated source, relative to any previous recorded
                # column for the current line:

                buffer += @encodeVlq mapping.column - lastColumn
                lastColumn = mapping.column

                # The index into the list of sources:

                buffer += @encodeVlq 0

                # The starting line in the original source, relative to the previous source line.

                buffer += @encodeVlq mapping.sourceLine - lastSourceLine
                lastSourceLine = mapping.sourceLine

                # The starting column in the original source, relative to the previous column.

                buffer += @encodeVlq mapping.sourceColumn - lastSourceColumn
                lastSourceColumn = mapping.sourceColumn
                needComma = yes

        version:        3
        file:           opt.target or ''
        sourceRoot:     opt.root or ''
        sources:        [opt.source or '']
        names:          []
        mappings:       buffer
        sourcesContent: [code]

    # 00000000  000   000   0000000   0000000   0000000    00000000  
    # 000       0000  000  000       000   000  000   000  000       
    # 0000000   000 0 000  000       000   000  000   000  0000000   
    # 000       000  0000  000       000   000  000   000  000       
    # 00000000  000   000   0000000   0000000   0000000    00000000  
    
    # Note that SourceMap VLQ encoding is "backwards".  MIDI-style VLQ encoding puts
    # the most-significant-bit (MSB) from the original value into the MSB of the VLQ
    # encoded value (see [Wikipedia](https://en.wikipedia.org/wiki/File:Uintvar_coding.svg)).
    # SourceMap VLQ does things the other way around, with the least significat four
    # bits of the original value encoded into the first byte of the VLQ encoded value.
    
    encodeVlq: (value) ->
        
        VLQ_SHIFT            = 5
        VLQ_CONTINUATION_BIT = 1 << VLQ_SHIFT            # 0010 0000
        VLQ_VALUE_MASK       = VLQ_CONTINUATION_BIT - 1  # 0001 1111
        
        signBit = if value < 0 then 1 else 0 # Least significant bit represents the sign.

        valueToEncode = (Math.abs(value) << 1) + signBit # The next bits are the actual value.

        # Make sure we encode at least one character, even if valueToEncode is 0.
        answer = ''
        while valueToEncode or not answer
            nextChunk = valueToEncode & VLQ_VALUE_MASK
            valueToEncode = valueToEncode >> VLQ_SHIFT
            nextChunk |= VLQ_CONTINUATION_BIT if valueToEncode
            answer += @encodeBase64 nextChunk
        answer

    encodeBase64: (value) -> 
    
        BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        BASE64_CHARS[value] or throw new Error "Cannot Base64 encode value: #{value}"

module.exports = SourceMap



