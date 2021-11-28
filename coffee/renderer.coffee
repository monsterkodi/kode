###
00000000   00000000  000   000  0000000    00000000  00000000   00000000  00000000
000   000  000       0000  000  000   000  000       000   000  000       000   000
0000000    0000000   000 0 000  000   000  0000000   0000000    0000000   0000000
000   000  000       000  0000  000   000  000       000   000  000       000   000
000   000  00000000  000   000  0000000    00000000  000   000  00000000  000   000
###

kstr  = require 'kstr'
print = require './print'

{ firstLineCol, lastLineCol, empty } = require './utils'

class Renderer

    @: (@kode) ->

        @debug   = @kode.args?.debug
        @verbose = @kode.args?.verbose

    render: (ast) ->

        @varstack = [ast.vars]
        @indent = ''
        s = ''
        
        if not empty ast.vars
            vs = (v.text for v in ast.vars).join ', '
            s += @indent + "var #{vs}\n\n"
        
        s += ast.exps.map((s) => @node s).join '\n'
        s

    nodes: (nodes, sep=',') ->
        ss = nodes.map (s) => @node s
        ss.join sep
        
    # 000   000   0000000   0000000    00000000
    # 0000  000  000   000  000   000  000
    # 000 0 000  000   000  000   000  0000000
    # 000  0000  000   000  000   000  000
    # 000   000   0000000   0000000    00000000

    node: (exp) ->
        
        return '' if not exp

        if exp.type? and exp.text? then return @token exp

        if exp instanceof Array then return (@node(a) for a in exp).join ';\n'

        s = ''

        for k,v of exp

            s += switch k
                when 'if'        then @if v
                when 'for'       then @for v
                when 'while'     then @while v
                when 'return'    then @return v
                when 'class'     then @class v
                when 'switch'    then @switch v
                when 'when'      then @when v
                when 'operation' then @operation v
                when 'incond'    then @incond v
                when 'parens'    then @parens v
                when 'object'    then @object v
                when 'keyval'    then @keyval v
                when 'array'     then @array v
                when 'index'     then @index v
                when 'slice'     then @slice v
                when 'prop'      then @prop v
                when 'func'      then @func v
                when 'call'      then @call v
                when 'var'       then v.text
                else
                    log R4("renderer.node unhandled key #{k} in exp"), exp # if @debug or @verbose
                    ''
        s
        
    #  0000000  000       0000000    0000000   0000000
    # 000       000      000   000  000       000
    # 000       000      000000000  0000000   0000000
    # 000       000      000   000       000       000
    #  0000000  0000000  000   000  0000000   0000000

    class: (n) ->

        s = ''
        s += "class #{n.name.text}"

        if n.extends
            s += " extends " + n.extends.map((e) -> e.text).join ', '

        s += '\n{'

        mthds = n.body?.object?.keyvals ? n.body?[0]?.object?.keyvals
        
        if mthds?.length
            mthds = @prepareMethods mthds
            @indent = '    '
            for m in mthds
                s += '\n'
                s += @mthd m
            s += '\n'
            @indent = ''
        s += '}'
        s
        
    # 00000000   00000000   00000000  00000000   00     00  00000000  000000000  000   000
    # 000   000  000   000  000       000   000  000   000  000          000     000   000
    # 00000000   0000000    0000000   00000000   000000000  0000000      000     000000000
    # 000        000   000  000       000        000 0 000  000          000     000   000
    # 000        000   000  00000000  000        000   000  00000000     000     000   000
    
    prepareMethods: (mthds) ->

        bind = []
        for m in mthds
            if not m.keyval 
                log 'wtf?' m 
                print.ast 'not an method?' m
                continue
            name = m.keyval.val.func.name.text
            if name in ['@' 'constructor']
                if constructor then error 'more than one constructor?'
                m.keyval.val.func.name.text = 'constructor'
                # log 'prepareMethods' name, m.keyval.val.func.name.text
                constructor = m
            else if name.startsWith '@'
                m.keyval.val.func.name.text = 'static ' + name[1..]
            else if m.keyval.val.func?.arrow.text == '=>'
                bind.push m
                
        if bind.length and not constructor # found some methods to bind, but no constructor
            ast = @kode.ast "constructor: ->" # create one from scratch
            print.noon 'ast' ast if @debug
            constructor = ast.exps[0].object.keyvals[0]
            constructor.keyval.val.func.name = type:'name' text:'constructor'
            mthds.unshift constructor
            if @debug
                print.noon 'constructor' constructor
                print.ast 'implicit constructor' constructor
                print.ast 'mthds with implicit constructor' mthds
            
        if bind.length
            for b in bind
                bn = b.keyval.val.func.name.text
                @verb 'method to bind:' bn
                constructor.keyval.val.func.body.exps ?= []
                constructor.keyval.val.func.body.exps.push 
                    type: 'code'
                    text: "this.#{bn} = this.#{bn}.bind(this)"
                    
            print.ast 'constructor after bind' constructor if @debug

        print.ast 'prepared mthds' mthds if @debug
        mthds
                
    # 00     00  000000000  000   000  0000000    
    # 000   000     000     000   000  000   000  
    # 000000000     000     000000000  000   000  
    # 000 0 000     000     000   000  000   000  
    # 000   000     000     000   000  0000000    
    
    mthd: (n) ->
        
        if n.keyval
            s = @indent + @func n.keyval.val.func
        s

    # 00000000  000   000  000   000   0000000  
    # 000       000   000  0000  000  000       
    # 000000    000   000  000 0 000  000       
    # 000       000   000  000  0000  000       
    # 000        0000000   000   000   0000000  
            
    func: (n) ->
        
        gi = @ind()
        
        s = n.name?.text ? 'function'
        s += ' ('
        args = n.args?.parens?.exps
        if args
            s += args.map((a) => @node a).join ', '
        s += ')\n'
        s += gi + '{'
        
        @varstack.push n.body.vars
        
        if not empty n.body.vars
            s += '\n'
            vs = (v.text for v in n.body.vars).join ', '
            s += @indent + "var #{vs}\n"
        
        if not empty n.body.exps
            
            s += '\n'
            ss = n.body.exps.map (s) => @node s
            ss = ss.map (s) => @indent + s
            s += ss.join '\n'
            s += '\n' + gi
        s += '}'
        
        @varstack.pop()
        
        @ded()
        s
                
    # 00000000   00000000  000000000  000   000  00000000   000   000  
    # 000   000  000          000     000   000  000   000  0000  000  
    # 0000000    0000000      000     000   000  0000000    000 0 000  
    # 000   000  000          000     000   000  000   000  000  0000  
    # 000   000  00000000     000      0000000   000   000  000   000  
    
    return: (n) ->

        s = 'return'
        s += ' ' + @node n.val
        kstr.strip s

    #  0000000   0000000   000      000      
    # 000       000   000  000      000      
    # 000       000000000  000      000      
    # 000       000   000  000      000      
    #  0000000  000   000  0000000  0000000  
    
    call: (p) ->
        if p.callee.text in ['log''warn''error']
            p.callee.text = "console.#{p.callee.text}"
        "#{@node(p.callee)}(#{@nodes p.args, ','})"
            
    # 000  00000000
    # 000  000
    # 000  000000
    # 000  000
    # 000  000

    if: (n) ->

        if not n.then then error 'if expected then' n

        first = firstLineCol n
        last  = lastLineCol n
        
        if first.line == last.line and n.else
            return @ifInline n
        
        gi = @ind()

        s = ''
        s += "if (#{@node(n.exp)})\n"
        s += gi+"{\n"
        for e in n.then.exps ? []
            s += @indent + @node(e) + '\n'
        s += gi+"}"

        for elif in n.elifs ? []
            s += '\n'
            s += gi + "else if (#{@node(elif.elif.exp)})\n"
            s += gi+"{\n"
            for e in elif.elif.then.exps ? []
                s += @indent + @node(e) + '\n'
            s += gi+"}"

        if n.else
            s += '\n'
            s += gi + 'else\n'
            s += gi+"{\n"
            for e in n.else.exps ? []
                 s += @indent + @node(e) + '\n'
            s += gi+"}"
            
        @ded()
        s
        
    # 000  00000000  000  000   000  000      000  000   000  00000000  
    # 000  000       000  0000  000  000      000  0000  000  000       
    # 000  000000    000  000 0 000  000      000  000 0 000  0000000   
    # 000  000       000  000  0000  000      000  000  0000  000       
    # 000  000       000  000   000  0000000  000  000   000  00000000  
    
    ifInline: (n) ->
        
        s = ''
        
        s += "#{@node(n.exp)} ? "
        if n.then.exps
            s += (@node(e) for e in n.then.exps).join ', '

        if n.elifs
            for e in n.elifs
                s += ' : '
                s += @ifInline e.elif

        if n.else
            s += ' : '
            if n.else.exps.length == 1
                s += @node n.else.exps[0]
            else
                s += '(' + (@node e for e in n.else.exps).join(', ') + ')'
        s
        
    # 00000000   0000000   00000000   
    # 000       000   000  000   000  
    # 000000    000   000  0000000    
    # 000       000   000  000   000  
    # 000        0000000   000   000  
    
    for: (n) ->
        
        if not n.then then error 'for expected then' n

        switch n.inof.text 
            when 'in' then @for_in n
            when 'of' then @for_of n
            else error 'for expected in/of'
        
    for_in: (n) ->
        
        gi = @ind()

        list = @node n.list
        
        if not list or list == 'undefined'
            print.noon 'no list for' n.list
            print.ast 'no list for' n.list
            
        listVar = @freshVar 'list'    
        s = ''
        s += "var #{listVar} = #{list}\n"
        if n.vals.text
            s += gi+"for (i = 0; i < #{listVar}.length; i++)\n"
            s += gi+"{\n"
            s += @indent+"#{n.vals.text} = #{listVar}[i]\n"
        else if n.vals.array?.items
            s += gi+"for (i = 0; i < #{listVar}.length; i++)\n"
            s += gi+"{\n"
            for j in 0...n.vals.array.items.length
                v = n.vals.array.items[j]
                s += @indent+"#{v.text} = #{listVar}[i][#{j}]\n"
        else if n.vals.length > 1
            lv = n.vals[1].text
            s += gi+"for (#{lv} = 0; #{lv} < #{listVar}.length; #{lv}++)\n"
            s += gi+"{\n"
            s += @indent+"#{n.vals[0].text} = #{listVar}[i]\n"
            
        for e in n.then.exps ? []
            s += @indent + @node(e) + '\n'
        s += gi+"}"
            
        @ded()
        s
        
    for_of: (n) ->
        
        gi = @ind()

        key = n.vals.text ? n.vals[0]?.text
        val = n.vals[1]?.text
        
        obj = @node n.list
        s = ''
        s += "for (#{key} in #{obj})\n"
        s += gi+"{\n"
        if val
            s += @indent+"#{val} = #{obj}[#{key}]\n"
        for e in n.then.exps ? []
            s += @indent + @node(e) + '\n'
        s += gi+"}"
            
        @ded()
        s

    # 000   000  000   000  000  000      00000000  
    # 000 0 000  000   000  000  000      000       
    # 000000000  000000000  000  000      0000000   
    # 000   000  000   000  000  000      000       
    # 00     00  000   000  000  0000000  00000000  

    while: (n) ->
        
        if not n.then then error 'when expected then' n

        gi = @ind()

        s = ''
        s += "while (#{@node n.cond})\n"
        s += gi+"{\n"
        for e in n.then.exps ? []
            s += @indent + @node(e) + '\n'
        s += gi+"}"
            
        @ded()
        s
        
    #  0000000  000   000  000  000000000   0000000  000   000  
    # 000       000 0 000  000     000     000       000   000  
    # 0000000   000000000  000     000     000       000000000  
    #      000  000   000  000     000     000       000   000  
    # 0000000   00     00  000     000      0000000  000   000  
    
    switch: (n) ->
        
        if not n.match then error 'switch expected match' n
        if not n.whens then error 'switch expected whens' n

        gi = @ind()
        
        s = ''
        s += "switch (#{@node n.match})\n"
        s += gi+"{\n"
        for e in n.whens ? []
            s += gi+ @node(e) + '\n'            
        if n.else
            s += @indent+'default:\n'
            for e in n.else
                s += @indent+'    '+ @node(e) + '\n'            
        s += gi+"}\n"

        @ded()
        s

    # 000   000  000   000  00000000  000   000  
    # 000 0 000  000   000  000       0000  000  
    # 000000000  000000000  0000000   000 0 000  
    # 000   000  000   000  000       000  0000  
    # 00     00  000   000  00000000  000   000  
    
    when: (n) ->

        if not n.vals then return error 'when expected vals' n
        if not n.then then return error 'when expected then' n
        
        s = ''
        for e in n.vals
            s += '    case ' + @node(e) + ':\n'
        for e in n.then.exps ? []
            s += @indent + '    ' + @node(e) + '\n'
        s += @indent + '    ' + 'break'
        s
                
    # 000000000   0000000   000   000  00000000  000   000
    #    000     000   000  000  000   000       0000  000
    #    000     000   000  0000000    0000000   000 0 000
    #    000     000   000  000  000   000       000  0000
    #    000      0000000   000   000  00000000  000   000

    token: (tok) ->
        
        if tok.type == 'comment'
            @comment tok
        else if tok.type == 'this' 
            'this'
        else if tok.type == 'triple'
            '`' + tok.text[3..-4] + '`'
        else if tok.type == 'keyword' and tok.text == 'yes'
            'true'
        else if tok.type == 'keyword' and tok.text == 'no'
            'false'
        else
            tok.text

    #  0000000   0000000   00     00  00     00  00000000  000   000  000000000
    # 000       000   000  000   000  000   000  000       0000  000     000
    # 000       000   000  000000000  000000000  0000000   000 0 000     000
    # 000       000   000  000 0 000  000 0 000  000       000  0000     000
    #  0000000   0000000   000   000  000   000  00000000  000   000     000

    comment: (tok) ->

        if tok.text.startsWith '###'
            '/*' + tok.text[3..-4] + '*/' + '\n'
        else if tok.text.startsWith '#'
            kstr.pad('', tok.col) + '//' + tok.text[1..-1]
        else
            error "# comment token expected"
            ''

    #  0000000   00000000   00000000  00000000    0000000   000000000  000   0000000   000   000
    # 000   000  000   000  000       000   000  000   000     000     000  000   000  0000  000
    # 000   000  00000000   0000000   0000000    000000000     000     000  000   000  000 0 000
    # 000   000  000        000       000   000  000   000     000     000  000   000  000  0000
    #  0000000   000        00000000  000   000  000   000     000     000   0000000   000   000

    operation: (op) ->
        
        opmap = (o) ->
            omp =
                and:    '&&'
                or:     '||'
                not:    '!'
                '==':   '==='
                '!=':   '!=='
            omp[o] ? o

        o   = opmap op.operator.text
        sep = ' '
        sep = '' if not op.lhs or not op.rhs
        
        if o in ['<''<=''===''!==''>=''>']
            ro = opmap op.rhs?.operation?.operator.text
            if ro in ['<''<=''===''!==''>=''>']
                return '(' + @node(op.lhs) + sep + o + sep + @node(op.rhs.operation.lhs) + ' && ' + kstr.lstrip(@node(op.rhs)) + ')'

        open = close = ''
        if o != '=' and op.rhs?.operation?.operator.text == '='
            open = '('
            close = ')'
                
        @node(op.lhs) + sep + o + sep + open + kstr.lstrip @node(op.rhs) + close

    # 000  000   000   0000000   0000000   000   000  0000000    
    # 000  0000  000  000       000   000  0000  000  000   000  
    # 000  000 0 000  000       000   000  000 0 000  000   000  
    # 000  000  0000  000       000   000  000  0000  000   000  
    # 000  000   000   0000000   0000000   000   000  0000000    
    
    incond: (p) ->
        
        "#{@node p.rhs}.indexOf(#{@node p.lhs}) >= 0"
        
    # 00000000    0000000   00000000   00000000  000   000   0000000  
    # 000   000  000   000  000   000  000       0000  000  000       
    # 00000000   000000000  0000000    0000000   000 0 000  0000000   
    # 000        000   000  000   000  000       000  0000       000  
    # 000        000   000  000   000  00000000  000   000  0000000   
    
    parens: (p) -> "(#{@nodes p.exps})"
    
    #  0000000   0000000          000  00000000   0000000  000000000  
    # 000   000  000   000        000  000       000          000     
    # 000   000  0000000          000  0000000   000          000     
    # 000   000  000   000  000   000  000       000          000     
    #  0000000   0000000     0000000   00000000   0000000     000     
    
    object: (p) -> "{#{@nodes p.keyvals, ','}}"
    
    # 000   000  00000000  000   000  000   000   0000000   000      
    # 000  000   000        000 000   000   000  000   000  000      
    # 0000000    0000000     00000     000 000   000000000  000      
    # 000  000   000          000        000     000   000  000      
    # 000   000  00000000     000         0      000   000  0000000  
    
    keyval: (p) -> 
        key = @node p.key
        if key[0] not in "'\"" and /[\.\,\;\*\+\-\/\=\|]/.test key then key = "'#{key}'"
        "#{key}:#{@node(p.val)}"
    
    # 00000000   00000000    0000000   00000000   
    # 000   000  000   000  000   000  000   000  
    # 00000000   0000000    000   000  00000000   
    # 000        000   000  000   000  000        
    # 000        000   000   0000000   000        
    
    prop:   (p) -> "#{@node(p.obj)}.#{@node p.prop}"
        
    # 000  000   000  0000000    00000000  000   000  
    # 000  0000  000  000   000  000        000 000   
    # 000  000 0 000  000   000  0000000     00000    
    # 000  000  0000  000   000  000        000 000   
    # 000  000   000  0000000    00000000  000   000  
    
    index:  (p) -> 
        
        if p.slidx.slice
            add = ''
            if p.slidx.slice.dots.text == '..'
                add = '+1'
            "#{@node(p.idxee)}.slice(#{@node p.slidx.slice.from}, #{@node p.slidx.slice.upto}#{add})"
        else
            if p.slidx.operation 
                o = p.slidx.operation
                if o.operator.text == '-' and not o.lhs and o.rhs?.type == 'num'
                    ni = parseInt o.rhs.text
                    if ni == 1
                        return "#{@node(p.idxee)}.slice(-#{ni})[0]"
                    else
                        return "#{@node(p.idxee)}.slice(-#{ni},-#{ni-1})[0]"
            
            "#{@node(p.idxee)}[#{@node p.slidx}]"
        
    #  0000000   00000000   00000000    0000000   000   000  
    # 000   000  000   000  000   000  000   000   000 000   
    # 000000000  0000000    0000000    000000000    00000    
    # 000   000  000   000  000   000  000   000     000     
    # 000   000  000   000  000   000  000   000     000     
    
    array: (p) ->

        if p.items[0]?.slice
            @slice p.items[0].slice
        else
            "[#{@nodes p.items, ','}]"

    #  0000000  000      000   0000000  00000000  
    # 000       000      000  000       000       
    # 0000000   000      000  000       0000000   
    #      000  000      000  000       000       
    # 0000000   0000000  000   0000000  00000000  
    
    slice:  (p) -> 
        
        if p.from.type == 'num' == p.upto.type
            from = parseInt p.from.text
            upto = parseInt p.upto.text
            if upto-from <= 10
                if p.dots.text == '...' then upto--
                '['+((x for x in [from..upto]).join ',')+']'
            else
                o = if p.dots.text == '...' then '<' else '<='
                "(function() { var r = []; for (var i = #{from}; i #{o} #{upto}; i++){ r.push(i); } return r; }).apply(this)"
        else 
            o = if p.dots.text == '...' then '<' else '<='
            "(function() { var r = []; for (var i = #{@node p.from}; i #{o} #{@node p.upto}; i++){ r.push(i); } return r; }).apply(this)"
       
    freshVar: (name, suffix=0) ->

        for vars in @varstack
            for v in vars
                if v.text == name + (suffix or '')
                    return @freshVar name, suffix+1
                    
        @varstack[-1].push text:name + (suffix or '')
        name + (suffix or '')
                
    verb: -> if @verbose then console.log.apply console.log, arguments 
    ind: ->
        
        oi = @indent
        @indent += '    '
        oi
        
    ded: ->
        
        @indent = @indent[...-4]
    
module.exports = Renderer
