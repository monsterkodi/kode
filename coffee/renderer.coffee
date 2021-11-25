###
00000000   00000000  000   000  0000000    00000000  00000000   00000000  00000000
000   000  000       0000  000  000   000  000       000   000  000       000   000
0000000    0000000   000 0 000  000   000  0000000   0000000    0000000   0000000
000   000  000       000  0000  000   000  000       000   000  000       000   000
000   000  00000000  000   000  0000000    00000000  000   000  00000000  000   000
###

kstr  = require 'kstr'
print = require './print'
empty = (a) -> a in ['' null undefined] or (typeof(a) == 'object' and Object.keys(a).length == 0)

opmap =
    and:    '&&'
    or:     '||'
    '==':   '==='
    '!=':   '!=='

class Renderer

    @: (@kode) ->

        @debug   = @kode.args?.debug
        @verbose = @kode.args?.verbose

    render: (ast) ->

        s = ''
        s += @block ast
        s

    block: (nodes) ->

        nodes.map((s) => @node s).join '\n'
        
    nodes: (nodes, sep=';') ->
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
                when 'class'     then @class v
                when 'switch'    then @switch v
                when 'when'      then @when v
                when 'incond'    then @incond v
                # when 'token'     then @token v
                when 'operation' then @operation v
                when 'parens'    then @parens v
                when 'array'     then @array v
                when 'object'    then @object v
                when 'keyval'    then @keyval v
                when 'call'      then @call v
                when 'prop'      then @prop v
                when 'index'     then @index v
                when 'slice'     then @slice v
                when 'var'       then v.text
                when 'func'      then @func v
                when 'return'    then @return v
                else
                    log R4('renderer.node unhandled exp'), exp # if @debug or @verbose
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
                if not m.type == 'comment'
                    log 'wtf?' m 
                    print.ast 'not an method?' m
                continue
            name = m.keyval.key.text
            if name in ['@' 'constructor']
                if constructor then error 'more than one constructor?'
                m.keyval.key.text= 'constructor'
                constructor = m
            else if name.startsWith '@'
                m.keyval.key.text = 'static ' + name[1..]
            else if m.keyval.val.func?.arrow.text == '=>'
                bind.push m
                
        if bind.length and not constructor # found some methods to bind, but no constructor
            ast = @kode.ast "constructor: ->" # create one from scratch
            print.noon 'ast' ast if @debug
            constructor = ast[0].object.keyvals[0]
            mthds.unshift constructor
            if @debug
                print.noon 'constructor' constructor
                print.ast 'implicit constructor' constructor
                print.ast 'mthds with implicit construcotr' mthds
            
        if bind.length
            for b in bind
                bn = b.keyval.key.text
                log 'method to bind:' bn if @verbose
                constructor.keyval.val.func.body ?= []
                constructor.keyval.val.func.body.push 
                    type: 'code'
                    text: "this.#{bn} = this.#{bn}.bind(this);"
                    
            print.ast 'constructor after bind' constructor if @debug

        print.ast 'prepared mthds' mthds if @debug
        mthds
                
    # 00     00  000000000  000   000  0000000    
    # 000   000     000     000   000  000   000  
    # 000000000     000     000000000  000   000  
    # 000 0 000     000     000   000  000   000  
    # 000   000     000     000   000  0000000    
    
    mthd: (n) ->

        if n.type == 'comment'
            return @comment n
        
        if n.keyval
            s = @func n.keyval.val.func, n.keyval.key.text
        s

    # 00000000  000   000  000   000   0000000  
    # 000       000   000  0000  000  000       
    # 000000    000   000  000 0 000  000       
    # 000       000   000  000  0000  000       
    # 000        0000000   000   000   0000000  
    
    func: (n, name='function') ->
        
        id = '    '
        gi = @indent ? ''
        
        s = gi + name
        s += ' ('
        args = n.args?.parens?.exps
        if args
            s += args.map((a) => @node a).join ', '
        s += ')\n'
        s += gi + '{'
        
        # print.noon 'func' n if @verbose
        
        if not empty n.body
            
            @indent = gi + id
            s += '\n'
            ss = n.body.map (s) => @node s
            
            if not ss[-1].startsWith('return') and name != 'constructor'
                ss.push 'return ' + kstr.lstrip ss.pop()
            ss = ss.map (s) => @indent + s
            s += ss.join ';\n'
            s += '\n' + gi
            @indent = gi
        s += '}'
        s
                
    # 00000000   00000000  000000000  000   000  00000000   000   000  
    # 000   000  000          000     000   000  000   000  0000  000  
    # 0000000    0000000      000     000   000  0000000    000 0 000  
    # 000   000  000          000     000   000  000   000  000  0000  
    # 000   000  00000000     000      0000000   000   000  000   000  
    
    return: (n) ->

        s = 'return '
        s += kstr.lstrip @node n.val
        s

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

        id = '    '
        gi = @indent ? ''
        @indent = gi + id

        s = ''
        s += "if (#{@node(n.exp)})\n"
        s += gi+"{\n"
        for e in n.then ? []
            s += gi + id + @node(e) + '\n'
        s += gi+"}"

        for elif in n.elifs ? []
            s += '\n'
            s += gi + "else if (#{@node(elif.elif.exp)})\n"
            s += gi+"{\n"
            for e in elif.elif.then ? []
                s += gi + id + @node(e) + '\n'
            s += gi+"}"

        if n.else
            s += '\n'
            s += gi + 'else\n'
            s += gi+"{\n"
            for e in n.else
                 s += gi + id + @node(e) + '\n'
            s += gi+"}"
            
        @indent = gi
        s
        
    # 00000000   0000000   00000000   
    # 000       000   000  000   000  
    # 000000    000   000  0000000    
    # 000       000   000  000   000  
    # 000        0000000   000   000  
    
    for: (n) ->
        
        if not n.then then error 'for expected then' n

        id = '    '
        gi = @indent ? ''
        @indent = gi+id

        val = n.vals.text ? n.vals[0]?.text
        list = @node n.list
        if not list or list == 'undefined'
            print.noon 'no list for' n.list
            print.ast 'no list for' n.list
        listVar = 'list'    
        s = ''
        s += "var #{listVar} = #{list}\n"
        s += "for (var i = 0; i < #{listVar}.length; i++)\n"
        s += gi+"{\n"
        s += gi+id+"#{val} = #{listVar}[i]\n"
        for e in n.then ? []
            s += gi+id + @node(e) + '\n'
        s += gi+"}"
            
        @indent = gi
        s

    # 000   000  000   000  000  000      00000000  
    # 000 0 000  000   000  000  000      000       
    # 000000000  000000000  000  000      0000000   
    # 000   000  000   000  000  000      000       
    # 00     00  000   000  000  0000000  00000000  

    while: (n) ->
        
        if not n.then then error 'when expected then' n

        id = '    '
        gi = @indent ? ''
        @indent = gi+id

        s = ''
        s += "while (#{@node n.cond})\n"
        s += gi+"{\n"
        for e in n.then ? []
            s += gi+id + @node(e) + '\n'
        s += gi+"}"
            
        @indent = gi
        s
        
    #  0000000  000   000  000  000000000   0000000  000   000  
    # 000       000 0 000  000     000     000       000   000  
    # 0000000   000000000  000     000     000       000000000  
    #      000  000   000  000     000     000       000   000  
    # 0000000   00     00  000     000      0000000  000   000  
    
    switch: (n) ->
        
        if not n.match then error 'switch expected match' n
        if not n.whens then error 'switch expected whens' n

        id = '    '
        gi = @indent ? ''
        @indent = gi+id
        
        s = ''
        s += "switch (#{@node n.match})\n"
        s += gi+"{\n"
        for e in n.whens ? []
            s += gi+ @node(e) + '\n'            
        if n.else
            s += gi+id+'default:\n'
            for e in n.else
                s += gi+id+id+ @node(e) + '\n'            
        s += gi+"}\n"

        @indent = gi
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
            s += @indent + 'case ' + @node(e) + ':\n'
        for e in n.then
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

        o   = opmap[op.operator.text] ? op.operator.text
        sep = ' '
        sep = '' if not op.lhs or not op.rhs
        
        if o in ['<''<=''===''!==''>=''>']
            ro = opmap[op.rhs?.operation?.operator.text] ? op.rhs?.operation?.operator.text
            if ro in ['<''<=''===''!==''>=''>']
                return '(' + @node(op.lhs) + sep + o + sep + @node(op.rhs.operation.lhs) + ' && ' + kstr.lstrip(@node(op.rhs)) + ')'

        @node(op.lhs) + sep + o + sep + kstr.lstrip @node(op.rhs)

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
    
    keyval: (p) -> "#{@node(p.key)}:#{@node(p.val)}"
    
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
            
module.exports = Renderer
