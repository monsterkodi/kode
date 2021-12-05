###
000      00000000  000   000  00000000  00000000
000      000        000 000   000       000   000
000      0000000     00000    0000000   0000000
000      000        000 000   000       000   000
0000000  00000000  000   000  00000000  000   000
###

noon  = require 'noon'
slash = require 'kslash'
kstr  = require 'kstr'

class Lexer

    @: (@kode) ->

        @debug    = @kode.args.debug
        @verbose  = @kode.args.verbose
        @raw      = @kode.args.raw

        @patterns = noon.load slash.join __dirname, '../coffee/lexer.noon'

        @regs = []
        for key,pat of @patterns
            if typeof pat == 'string'
                @regs.push [key, new RegExp pat]
            else if pat instanceof Array
                pat = pat.map (p) -> kstr.escapeRegexp "#{p}"
                reg = '\\b(' + pat.join('|') + ')\\b'
                @regs.push [key, new RegExp reg]

    # 000000000   0000000   000   000  00000000  000   000  000  0000000  00000000
    #    000     000   000  000  000   000       0000  000  000     000   000
    #    000     000   000  0000000    0000000   000 0 000  000    000    0000000
    #    000     000   000  000  000   000       000  0000  000   000     000
    #    000      0000000   000   000  00000000  000   000  000  0000000  00000000

    ###
        converts text into a list of token objects
        token object:
            type: string        # any of the keys in lexer.noon
            text: string        # text of match
            line: number        # line number
            col:  number        # start index in line
    ###

    tokenize: (text) ->

        tokens = []
        line = 1
        col = 0
        while text.length
            before = text.length
            for [key,reg] in @regs
                match = text.match reg
                if match?.index == 0

                    value = if key == 'nl' then '' else match[0]
                    if key == 'then' then value = 'then'; key = 'keyword'
                    if value == 'then' and tokens[-2]?.text == 'else' 
                        # skip then after else
                    else

                        tokens.push type:key, text:value, line:line, col:col

                    if key == 'nl'
                        col = 0
                        line++
                    else if key in ['comment''triple']
                        lines = value.split '\n'
                        line += lines.length-1
                        if lines.length > 1
                            col = lines[-1].length
                        else
                            col += value.length
                    else
                        col += value.length

                    text = text[match[0].length..-1]
                    break

            after = text.length
            if before == after
                log "stray character #{text[0]} in line #{line} col #{col}"
                tokens.push type:'stray' text:text[0], line:line, col:col
                text = text[1..-1]
        tokens

    # 000   000  000   000   0000000  000       0000000    0000000  000   000
    # 000   000  0000  000  000       000      000   000  000       000   000
    # 000   000  000 0 000  0000000   000      000000000  0000000   000000000
    # 000   000  000  0000       000  000      000   000       000  000   000
    #  0000000   000   000  0000000   0000000  000   000  0000000   000   000

    # walks through tokens and joins lines that end with '\'

    unslash: (tokens) ->

        newTokens = []

        idx = 0
        while idx < tokens.length
            tok = tokens[idx]
            if tok.text == '\\'
                idx += 1
                while tokens[idx].type in ['nl' 'ws']
                    idx += 1
            else
                newTokens.push tok
                idx += 1

        newTokens
        
    # 00     00  00000000  00000000    0000000   00000000   0000000   00000000   
    # 000   000  000       000   000  000        000       000   000  000   000  
    # 000000000  0000000   0000000    000  0000  0000000   000   000  00000000   
    # 000 0 000  000       000   000  000   000  000       000   000  000        
    # 000   000  00000000  000   000   0000000   00000000   0000000   000        
    
    # walks through tokens and joins lines that end with operators (except ++ and --)
    
    mergeop: (tokens) ->

        newTokens = []

        idx = 0
        while idx < tokens.length
            tok = tokens[idx]
            if tok.type == 'op' and tok.text not in ['--''++']
                newTokens.push tok
                idx += 1
                while tokens[idx].type in ['nl' 'ws']
                    idx += 1
            else
                newTokens.push tok
                idx += 1

        newTokens
        
    # 000   000  000   000   0000000   0000000   00     00  00     00  00000000  000   000  000000000  
    # 000   000  0000  000  000       000   000  000   000  000   000  000       0000  000     000     
    # 000   000  000 0 000  000       000   000  000000000  000000000  0000000   000 0 000     000     
    # 000   000  000  0000  000       000   000  000 0 000  000 0 000  000       000  0000     000     
    #  0000000   000   000   0000000   0000000   000   000  000   000  00000000  000   000     000     
    
    # TODO: keep the swallowed tokens and reinsert them after parsing
    
    uncomment: (tokens) ->
        
        newTokens = []

        idx = 0
        while idx < tokens.length
            tok = tokens[idx]
            if tok.type == 'comment'
                # if not (tokens[idx-1]?.type == 'nl' or tokens[idx-2]?.type == 'nl' and tokens[idx-1]?.type == 'ws')
                idx += 1
                continue

            newTokens.push tok
            idx += 1

        newTokens
        
    # 0000000    000       0000000    0000000  000   000  000  00000000  000   000
    # 000   000  000      000   000  000       000  000   000  000        000 000
    # 0000000    000      000   000  000       0000000    000  000000      00000
    # 000   000  000      000   000  000       000  000   000  000          000
    # 0000000    0000000   0000000    0000000  000   000  000  000          000

    ###
        converts list of tokens into tree of blocks
        block:
            type:  'block'
            tokens: array           # tokens of the block
            indent: string          # indentation string
            line:   number          # first line number
            col:    number

        ws tokens and empty lines are pruned from the tree
        nl tokens are only kept between lines of the same block
    ###

    blockify: (tokens) ->

        tokens = @unslash   tokens
        tokens = @uncomment tokens
        tokens = @mergeop   tokens

        blocks = []

        block = type:'block' tokens:[] indent:'' line:1 col:0
        blocks.push block

        outdentTo = (depth, line) ->
            while depth < block.indent.length
                blocks.pop()
                block = blocks[-1]

        for idx in 0...tokens.length
            tok = tokens[idx]
            if tok.type == 'nl'

                nxt = tokens[idx+1]
                if nxt?.type in ['nl']
                    continue

                if nxt?.type == 'ws'

                    if tokens[idx+2]?.type == 'nl' or idx+1 >= tokens.length-1
                        continue

                    if nxt.text.length > block.indent.length

                        block = type:'block' tokens:[] line:nxt.line, indent:nxt.text, col:nxt.text.length
                        blocks[-1].tokens.push block
                        blocks.push block
                        continue

                    else if nxt.text.length < block.indent.length
                        outdentTo nxt.text.length, nxt.line
                        
                else if nxt
                    if block.indent.length
                        outdentTo 0, nxt.line

            else if tok.type == 'ws'
                continue

            block.tokens.push tok

        blocks[0]
        
module.exports = Lexer
