###
00000000   00000000  000   000  0000000    00000000  00000000   00000000  00000000
000   000  000       0000  000  000   000  000       000   000  000       000   000
0000000    0000000   000 0 000  000   000  0000000   0000000    0000000   0000000
000   000  000       000  0000  000   000  000       000   000  000       000   000
000   000  00000000  000   000  0000000    00000000  000   000  00000000  000   000
###

kstr   = require 'kstr'
slash  = require 'kslash'
print  = require './print'
SrcMap = require './srcmap'

{ valid, empty, firstLineCol, lastLineCol } = require './utils'

class Renderer

    @: (@kode) ->

        @header = """
            const _k_ = {
                list:   function (l)   {return (l != null ? typeof l.length === 'number' ? l : [] : [])}
                length: function (l)   {return (l != null ? typeof l.length === 'number' ? l.length : 0 : 0)},
                in:     function (a,l) {return (l != null ? typeof l.indexOf === 'function' ? l.indexOf(a) >= 0 : false : false)}
                }
            """
        
        @debug   = @kode.args?.debug
        @verbose = @kode.args?.verbose

    render: (ast, source) ->

        if @kode.args.map and source
            @srcmap = new SrcMap source
        
        @varstack = [ast.vars]
        @indent = ''

        s = ''
        if valid ast.vars
            vs = (v.text for v in ast.vars).join ', '
            s += @js "var #{vs}\n" true
            s += '\n'

        s += @nodes ast.exps, '\n' true
        
        if @srcmap
            # log @srcmap.generate source:source, target:slash.swapExt source, 'js'
            s+= """
                
                //# sourceMappingURL=data:application/json;base64,xx
                //# sourceURL=#{source}
                """
        
        @srcmap?.done s
        s

    js: (s, tl) => 
    
        @srcmap?.commit s, tl
        s
        
    nodes: (nodes, sep=',' tl) ->

        s = ''
        sl = nodes.map (n) =>
        
            s = @atom n
        
            if sep == '\n'
                
                stripped = kstr.lstrip s
                if stripped[0] in '([' then s = ';'+s 
                else if stripped.startsWith 'function' then s = "(#{s})"

            @js s, tl if tl
            s
            
        sl.join sep

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

            s+= switch k
                when 'if'        then @if v
                when 'for'       then @for v
                when 'while'     then @while v
                when 'return'    then @return v
                when 'class'     then @class v
                when 'function'  then @function v
                when 'switch'    then @switch v
                when 'when'      then @when v
                when 'assert'    then @assert v
                when 'qmrkop'    then @qmrkop v
                when 'stripol'   then @stripol v
                when 'qmrkcolon' then @qmrkcolon v
                when 'operation' then @operation v
                when 'incond'    then @incond v
                when 'parens'    then @parens v
                when 'object'    then @object v
                when 'keyval'    then @keyval v
                when 'array'     then @array v
                when 'lcomp'     then @lcomp v
                when 'index'     then @index v
                when 'slice'     then @slice v
                when 'prop'      then @prop v
                when 'each'      then @each v
                when 'func'      then @func v
                when 'call'      then @call v
                when 'try'       then @try v
                else
                    log R4("renderer.node unhandled key #{k} in exp"), exp # if @debug or @verbose
                    ''        
        s

    #  0000000   000000000   0000000   00     00
    # 000   000     000     000   000  000   000
    # 000000000     000     000   000  000000000
    # 000   000     000     000   000  000 0 000
    # 000   000     000      0000000   000   000

    atom: (exp) ->

        @fixAsserts @node exp
        
    qmrkop: (p) ->
        
        if p.lhs.type == 'var' or not p.qmrk
            lhs = @atom p.lhs
            "(#{lhs} != null ? #{lhs} : #{@atom p.rhs})"
        else
            vn = "_#{p.qmrk.line}_#{p.qmrk.col}_"
            "((#{vn}=#{@atom p.lhs}) != null ? #{vn} : #{@atom p.rhs})"

    qmrkcolon: (p) ->
        
        "(#{@atom p.lhs} ? #{@atom p.mid} : #{@atom p.rhs})"
        
    # 00000000  000  000   000   0000000    0000000   0000000  00000000  00000000   000000000   0000000
    # 000       000   000 000   000   000  000       000       000       000   000     000     000
    # 000000    000    00000    000000000  0000000   0000000   0000000   0000000       000     0000000
    # 000       000   000 000   000   000       000       000  000       000   000     000          000
    # 000       000  000   000  000   000  0000000   0000000   00000000  000   000     000     0000000

    assert: (p) ->

        # @verb 'fix' p
        if p.obj.type != 'var' and not p.obj.index
            '▾' + @node(p.obj) + "▸#{p.qmrk.line}_#{p.qmrk.col}◂"
        else
            '▾' + @node(p.obj) + "▸#{0}_#{0}◂" # hint fixAssert to not use generated var
    
    fixAsserts: (s) ->

        @verb 'fixAsserts' s
        
        return '' if not s? or s.length == 0
        return s if s in ['▾' "'▾'" '"▾"']
        
        while s[0] == '▾' then s = s[1..] # remove any leading ▾
        
        if /(?<!['"\[])[▾]/.test s
            i = s.indexOf '▾'
            if (n = s.indexOf '\n' i) > i
                # log b3('n!'), w3(s[...i]), m6(s[i+1...n]), green(s[n..])
                return s[...i] + @fixAsserts(s[i+1...n]) + @fixAsserts(s[n..])
            else
                # log b3('▾!'), w3(s[...i]), m6(s[i+1..])
                return s[...i] + @fixAsserts s[i+1..]
        
        splt = s.split /▸\d+_\d+◂/
        mtch = s.match /▸\d+_\d+◂/g

        if splt.length > 1

            mtch = mtch.map (m) -> "_#{m[1..-2]}_"
            
            if splt[-1] == '' # assert ends with ?
                if splt.length > 2
                    splt.pop()
                    mtch.pop()
                    t = splt.shift()
                    while splt.length                    
                        t += '▸'+mtch.shift()[1...-1]+'◂'
                        t += splt.shift()
                    t = @fixAsserts t
                else 
                    t = splt[0]
                return  "(#{t} != null)"
                
            # log splt, mtch

            s = ''

            for i in 0...mtch.length

                if mtch.length > 1 
                    rhs = if i then (if mtch[i-1] != "_0_0_" then mtch[i-1] else l)+splt[i] else splt[0]
                    if mtch[i] != "_0_0_"
                        l = "(#{mtch[i]}=#{rhs})"
                    else
                        l = rhs
                else
                    l = splt[0]

                if splt[i+1][0] == '('
                    s += "typeof #{l} === \"function\" ? "
                else
                    s += "#{l} != null ? "

            if mtch.length > 1
                if mtch[-1] != "_0_0_"
                    s += mtch[-1]+splt[-1]
                else
                    s += l+splt[-1]
            else
                s += splt[0]+splt[1]

            for i in 0...mtch.length then s += " : undefined"

            s = "(#{s})"
        s

    #  0000000  000       0000000    0000000   0000000
    # 000       000      000   000  000       000
    # 000       000      000000000  0000000   0000000
    # 000       000      000   000       000       000
    #  0000000  0000000  000   000  0000000   0000000

    class: (n) ->

        s = '\n'
        s += "class #{n.name.text}"

        if n.extends
            s += " extends " + n.extends.map((e) -> e.text).join ', '

        s += '\n{'

        mthds = n.body

        if mthds?.length
            
            [con, bind] = @prepareMethods mthds
            
            if bind.length
                for b in bind
                    bn = b.keyval.val.func.name.text
                    con.keyval.val.func.body.exps ?= []
                    con.keyval.val.func.body.exps.unshift
                        type: 'code'
                        text: "this.#{bn} = this.#{bn}.bind(this)"
            
            @indent = '    '
            for mi in 0...mthds.length
                s += '\n' if mi
                s += @mthd mthds[mi]
            s += '\n'
            @indent = ''
        s += '}\n'
        s
        
    # 00     00  000000000  000   000  0000000
    # 000   000     000     000   000  000   000
    # 000000000     000     000000000  000   000
    # 000 0 000     000     000   000  000   000
    # 000   000     000     000   000  0000000

    mthd: (n) ->

        if n.keyval
            s  = '\n'
            s += @indent + @func n.keyval.val.func
        s

    # 00000000  000   000  000   000   0000000  000000000  000   0000000   000   000  
    # 000       000   000  0000  000  000          000     000  000   000  0000  000  
    # 000000    000   000  000 0 000  000          000     000  000   000  000 0 000  
    # 000       000   000  000  0000  000          000     000  000   000  000  0000  
    # 000        0000000   000   000   0000000     000     000   0000000   000   000  
    
    function: (n) ->

        s = '\n'
        s += "#{n.name.text} = (function ()\n"
        s += '{\n'

        # if n.extends
            # s += " extends " + n.extends.map((e) -> e.text).join ', '

        mthds = n.body

        if mthds?.length
            
            [con, bind] = @prepareMethods mthds
            
            if bind.length
                for b in bind
                    bn = b.keyval.val.func.name.text
                    con.keyval.val.func.body.exps ?= []
                    con.keyval.val.func.body.exps.unshift
                        type: 'code'
                        text: "this[\"#{bn}\"] = this[\"#{bn}\"].bind(this)"
            
            @indent = '    '
            for mi in 0...mthds.length
                s += @funcs mthds[mi], n.name.text
                s += '\n'
            @indent = ''
            
        s += "    return #{n.name.text}\n"
        s += '})()\n'
        s
        
    # 00000000  000   000  000   000   0000000   0000000  
    # 000       000   000  0000  000  000       000       
    # 000000    000   000  000 0 000  000       0000000   
    # 000       000   000  000  0000  000            000  
    # 000        0000000   000   000   0000000  0000000   
    
    funcs: (n, className) ->

        s = ''
        if n.keyval
            f = n.keyval.val.func
            if f.name.text == 'constructor'
                s = @indent + @func f, 'function ' + className
                s += '\n'
            else if f.name.text.startsWith 'static'
                s = @indent + @func f, "#{className}[\"#{f.name.text[7..]}\"] = function"
                s += '\n'
            else
                s = @indent + @func f, "#{className}.prototype[\"#{f.name.text}\"] = function"
                s += '\n'
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
                print.ast 'not an method?' m
                continue
            if not m.keyval.val.func
                print.ast 'no func for method?' m
                continue

            name = m.keyval.val.func.name.text
            if name in ['@' 'constructor']
                if con then error 'more than one constructor?'
                m.keyval.val.func.name.text = 'constructor'
                con = m
            else if name.startsWith '@'
                m.keyval.val.func.name.text = 'static ' + name[1..]
            else if m.keyval.val.func?.arrow.text == '=>'
                bind.push m

        if bind.length and not con            # found some methods to bind, but no constructor
            ast = @kode.ast "constructor: ->" # create one from scratch
            con = ast.exps[0].object.keyvals[0]
            con.keyval.val.func.name = type:'name' text:'constructor'
            mthds.unshift con

        [con, bind]
        
    # 00000000  000   000  000   000   0000000
    # 000       000   000  0000  000  000
    # 000000    000   000  000 0 000  000
    # 000       000   000  000  0000  000
    # 000        0000000   000   000   0000000

    func: (n, name) ->

        return '' if not n

        gi = @ind()
        
        name ?= n.name?.text ? 'function'

        s = name
        s += ' ('

        args = n.args?.parens?.exps
        if args
            [str, ths] = @args args
            s += str

        s += ')\n'
        s += gi + '{'

        @varstack.push n.body.vars

        if valid n.body.vars
            s += '\n'
            vs = (v.text for v in n.body.vars).join ', '
            s += @indent + "var #{vs}\n"

        for t in ths ? []
            s += '\n' + @indent + ths

        if valid n.body.exps

            s += '\n'
            ss = n.body.exps.map (s) => @node s
            ss = ss.map (s) => @indent + s
            s += ss.join '\n'
            s += '\n' + gi

        s += '}'

        @varstack.pop()

        @ded()
        
        if n.arrow.text == '=>' and not n.name
            s = "(#{s}).bind(this)"
        
        s

    #  0000000   00000000    0000000    0000000
    # 000   000  000   000  000        000
    # 000000000  0000000    000  0000  0000000
    # 000   000  000   000  000   000       000
    # 000   000  000   000   0000000   0000000

    args: (args) ->

        ths  = []
        used = {}

        for a in args
            if a.text then used[a.text] = a.text

        args = args.map (a) ->
            if a.prop and a.prop.obj.type == 'this'
                txt = a.prop.prop.text
                if used[txt]
                    for i in [1..100]
                        if not used[txt+i]
                            ths.push "this.#{txt} = #{txt+i}"
                            txt += i
                            used[txt] = txt
                            break
                else
                    ths.push "this.#{txt} = #{txt}"

                return
                    type:'@arg'
                    text:txt
            else
                a

        str = args.map((a) => @node a).join ', '

        [str,ths]

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
            
        callee = @node p.callee
        
        if p.args
            if callee in ['new' 'throw' 'delete']
                "#{callee} #{@nodes p.args, ','}"
            else
                "#{callee}(#{@nodes p.args, ','})"
        else
            "#{callee}()"

    # 000  00000000
    # 000  000
    # 000  000000
    # 000  000
    # 000  000

    if: (n) ->

        first = firstLineCol n
        last  = lastLineCol n

        if first.line == last.line and n.else and not n.returns
            return @ifInline n

        gi = @ind()

        s = ''
        s += "if (#{@atom(n.cond)})\n"
        s += gi+"{\n"
        for e in n.then ? []
            s += @indent + @node(e) + '\n'
        s += gi+"}"

        for elif in n.elifs ? []
            s += '\n'
            s += gi + "else if (#{@atom(elif.elif.cond)})\n"
            s += gi+"{\n"
            for e in elif.elif.then ? []
                s += @indent + @node(e) + '\n'
            s += gi+"}"

        if n.else
            s += '\n'
            s += gi + 'else\n'
            s += gi+"{\n"
            for e in n.else ? []
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

        s += "#{@atom(n.cond)} ? "
        if n.then?.length
            s += (@atom(e) for e in n.then).join ', '

        if n.elifs
            for e in n.elifs
                s += ' : '
                s += @ifInline e.elif

        if n.else
            s += ' : '
            if n.else.length == 1
                s += @atom n.else[0]
            else
                s += '(' + (@atom e for e in n.else).join(', ') + ')'
        s

    # 00000000   0000000    0000000  000   000  
    # 000       000   000  000       000   000  
    # 0000000   000000000  000       000000000  
    # 000       000   000  000       000   000  
    # 00000000  000   000   0000000  000   000  
    
    each: (n) ->
        
        numArgs = n.fnc.func.args?.parens.exps.length
        
        if numArgs == 1
            """
            (function (o) {
                r = o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}
                for (k in o)
                {   
                    var m = (#{@node n.fnc})(o[k])
                    if (m != null)
                    {
                        r[k] = m
                    }
                }
                return typeof o == 'string' ? r.join('') : r
            })(#{@node n.lhs})
            """
        else if numArgs
            """
            (function (o) {
                r = o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}
                for (k in o)
                {   
                    var m = (#{@node n.fnc})(k, o[k])
                    if (m != null && m[0] != null)
                    {
                        r[m[0]] = m[1]
                    }
                }
                return typeof o == 'string' ? r.join('') : r
            })(#{@node n.lhs})
            """
            
        else # no args
            if n.fnc.func.body.exps?.length > 0 # some func but no args
                """
                (function (o) {
                    r = o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}
                    for (k in o)
                    {   
                        var m = (#{@node n.fnc})(o[k])
                        if (m != null)
                        {
                            r[k] = m
                        }
                    }
                    return typeof o == 'string' ? r.join('') : r
                })(#{@node n.lhs})
                    
                """
            else # no args and empty func
                """
                (function (o) { return o instanceof Array ? [] : typeof o == 'string' ? '' : {} })(#{@node n.lhs})
                """
        
    # 00000000   0000000   00000000
    # 000       000   000  000   000
    # 000000    000   000  0000000
    # 000       000   000  000   000
    # 000        0000000   000   000

    for: (n) ->

        if not n.then then @verb 'for expected then' n

        switch n.inof.text
            when 'in' then @for_in n
            when 'of' then @for_of n
            else error 'for expected in/of'

    # 00000000   0000000   00000000           000  000   000  
    # 000       000   000  000   000          000  0000  000  
    # 000000    000   000  0000000            000  000 0 000  
    # 000       000   000  000   000          000  000  0000  
    # 000        0000000   000   000  000000  000  000   000  
    
    for_in: (n, varPrefix='', lastPrefix='', lastPostfix='', lineBreak) ->

        if not n.list.qmrkop and not n.list.array and not n.list.slice
            list = @node qmrkop:
                            lhs: n.list
                            rhs: 
                                type: 'array'
                                text: '[]'
        else
            if n.list.array?.items[0]?.slice or n.list.slice
                return @for_in_range n, varPrefix, lastPrefix, lastPostfix, lineBreak
            list = @node n.list

        if not list or list == 'undefined'
            print.noon 'no list for' n.list
            print.ast 'no list for' n.list

        gi = lineBreak or @ind()
        nl = lineBreak or '\n'
        eb = lineBreak and ';' or '\n'
        
        g2 = if lineBreak then '' else @indent
        
        listVar = @freshVar 'list'
        iterVar = "_#{n.inof.line}_#{n.inof.col}_"
        s = ''
        s += "var #{listVar} = #{list}" + eb
        if n.vals.text
            s += gi+"for (var #{iterVar} = 0; #{iterVar} < #{listVar}.length; #{iterVar}++)" + nl
            s += gi+"{"+nl
            s += g2+"#{n.vals.text} = #{listVar}[#{iterVar}]" + eb
        else if n.vals.array?.items
            s += gi+"for (var #{iterVar} = 0; #{iterVar} < #{listVar}.length; #{iterVar}++)" + nl
            s += gi+"{"+nl
            for j in 0...n.vals.array.items.length
                v = n.vals.array.items[j]
                s += g2+"#{v.text} = #{listVar}[#{iterVar}][#{j}]" + eb
        else if n.vals.length > 1
            iterVar = n.vals[1].text
            s += gi+"for (#{iterVar} = 0; #{iterVar} < #{listVar}.length; #{iterVar}++)" + nl
            s += gi+"{" + nl
            s += g2+"#{varPrefix}#{n.vals[0].text} = #{listVar}[#{iterVar}]" + eb

        for e in n.then ? []
            prefix = if lastPrefix and e == n.then[-1] then lastPrefix else ''
            postfix = if lastPostfix and e == n.then[-1] then lastPostfix else ''
            s += g2 + prefix+@node(e)+postfix + nl
        s += gi+"}"

        @ded() if not lineBreak
        s

    # 00000000   0000000   00000000           000  000   000          00000000    0000000   000   000   0000000   00000000  
    # 000       000   000  000   000          000  0000  000          000   000  000   000  0000  000  000        000       
    # 000000    000   000  0000000            000  000 0 000          0000000    000000000  000 0 000  000  0000  0000000   
    # 000       000   000  000   000          000  000  0000          000   000  000   000  000  0000  000   000  000       
    # 000        0000000   000   000  000000  000  000   000  000000  000   000  000   000  000   000   0000000   00000000  
    
    for_in_range: (n, varPrefix, lastPrefix, lastPostfix, lineBreak) ->
        
        slice = n.list.array?.items[0]?.slice ? n.list.slice

        # log 'for_in_range' slice
        
        gi = lineBreak or @ind()
        nl = lineBreak or '\n'
        eb = lineBreak and ';' or '\n'
        
        g2 = if lineBreak then '' else @indent
        
        iterVar   = n.vals.text ? n.vals[0].text
        
        iterStart = @node slice.from
        iterEnd   = @node slice.upto
        
        start = parseInt iterStart
        end   = parseInt iterEnd
        
        iterCmp = if slice.dots.text == '...' then '<' else '<='
        iterDir = '++'
        
        if Number.isFinite(start) and Number.isFinite(end)
            if start > end
                iterCmp = if slice.dots.text == '...' then '>' else '>='
                iterDir = '--'
            
        s = ''
        s += "for (#{iterVar} = #{iterStart}; #{iterVar} #{iterCmp} #{iterEnd}; #{iterVar}#{iterDir})" + nl
        s += gi+"{"+nl
        for e in n.then ? []
            prefix = if lastPrefix and e == n.then[-1] then lastPrefix else ''
            postfix = if lastPostfix and e == n.then[-1] then lastPostfix else ''
            s += g2 + prefix+@node(e)+postfix + nl
        s += gi+"}"
            
        @ded() if not lineBreak
        s
        
    # 00000000   0000000   00000000            0000000   00000000  
    # 000       000   000  000   000          000   000  000       
    # 000000    000   000  0000000            000   000  000000    
    # 000       000   000  000   000          000   000  000       
    # 000        0000000   000   000  000000   0000000   000       
    
    for_of: (n, varPrefix='', lastPrefix='', lastPostfix='', lineBreak) ->

        gi = lineBreak or @ind()
        nl = lineBreak or '\n'
        eb = lineBreak and ';' or '\n'
        g2 = if lineBreak then '' else @indent

        key = n.vals.text ? n.vals[0]?.text
        val = n.vals[1]?.text

        obj = @node n.list
        s = ''
        s += "for (#{varPrefix}#{key} in #{obj})"+nl
        s += gi+"{"+nl
        if val
            s += g2+"#{varPrefix}#{val} = #{obj}[#{key}]" + eb
        for e in n.then ? []
            prefix = if lastPrefix and e == n.then[-1] then lastPrefix else ''
            postfix = if lastPostfix and e == n.then[-1] then lastPostfix else ''
            s += g2+ prefix+@node(e)+postfix + nl
            
        s += gi+"}"

        @ded() if not lineBreak
        s
        
    # 000       0000000   0000000   00     00  00000000   
    # 000      000       000   000  000   000  000   000  
    # 000      000       000   000  000000000  00000000   
    # 000      000       000   000  000 0 000  000        
    # 0000000   0000000   0000000   000   000  000        
    
    lcomp: (n) ->
        
        comp = (f) =>
            switch f.inof.text
                when 'in' then @for_in f, 'var ' 'result.push(' ')' ' '
                when 'of' then @for_of f, 'var ' 'result.push(' ')' ' '

        "(function () { var result = []; #{comp n.for} return result }).bind(this)()"

    # 000   000  000   000  000  000      00000000
    # 000 0 000  000   000  000  000      000
    # 000000000  000000000  000  000      0000000
    # 000   000  000   000  000  000      000
    # 00     00  000   000  000  0000000  00000000

    while: (n) ->

        gi = @ind()

        s = ''
        s += "while (#{@node n.cond})\n"
        s += gi+"{\n"
        for e in n.then ? []
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
            
        if valid n.else
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

        s = ''
        for e in n.vals
            i = e != n.vals[0] and @indent or '    '
            s += i+'case ' + @node(e) + ':\n'
        for e in n.then ? []
            gi = @ind()
            s += gi + '    ' + @node(e) + '\n'
            @ded()
        if not (n.then and n.then[-1] and n.then[-1].return)
            s += @indent + '    ' + 'break' 
        s

    # 000000000  00000000   000   000  
    #    000     000   000   000 000   
    #    000     0000000      00000    
    #    000     000   000     000     
    #    000     000   000     000     
    
    try: (n) ->
        
        s = ''
        gi = @ind()
        s += 'try\n'
        s += gi+'{\n'
        s += @indent+@nodes n.exps, '\n'+@indent
        s += '\n'
        s += gi+'}'
        if n.catch ? []
            s += '\n'
            s += gi+"catch (#{@node n.catch.errr})\n" 
            s += gi+'{\n'
            s += @indent+@nodes n.catch.exps, '\n'+@indent
            s += '\n'
            s += gi+'}'
        if n.finally
            s += '\n'
            s += gi+'finally\n'
            s += gi+'{\n'
            s += @indent+@nodes n.finally, '\n'+@indent
            s += '\n'
            s += gi+'}'
        @ded()
        s
        
    # 000000000   0000000   000   000  00000000  000   000
    #    000     000   000  000  000   000       0000  000
    #    000     000   000  0000000    0000000   000 0 000
    #    000     000   000  000  000   000       000  0000
    #    000      0000000   000   000  00000000  000   000

    token: (tok) ->

        s = 
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
                
        @js s, tok
        s

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
                return '(' + @atom(op.lhs) + sep + o + sep + @atom(op.rhs.operation.lhs) + ' && ' + kstr.lstrip(@atom(op.rhs)) + ')'

        open = close = ''
        
        if o == '='
            
            if op.lhs.object # lhs is curly, eg. {x,y} = require ''
                s = ''
                for keyval in op.lhs.object.keyvals
                    s += "#{keyval.text} = #{@atom(op.rhs)}.#{keyval.text}\n"
                return s
                
            if op.lhs.array # lhs is aray, eg. [x,y] = require ''
                s = ''
                for val in op.lhs.array.items
                    i = op.lhs.array.items.indexOf val
                    s += (i and @indent or '') + "#{val.text} = #{@atom(op.rhs)}[#{i}]\n"
                return s
                
        else if o == '!'

            if op.rhs?.incond or op.rhs?.operation?.operator?.text == '='
                    open = '('
                    close = ')'
                            
        else if op.rhs?.operation?.operator.text == '='
            open = '('
            close = ')'
            
        first = firstLineCol op.lhs
        prfx = if first.col == 0 and op.rhs?.func then '\n' else ''
            
        prfx + @atom(op.lhs) + sep + o + sep + open + kstr.lstrip @atom(op.rhs) + close

    # 000  000   000   0000000   0000000   000   000  0000000
    # 000  0000  000  000       000   000  0000  000  000   000
    # 000  000 0 000  000       000   000  000 0 000  000   000
    # 000  000  0000  000       000   000  000  0000  000   000
    # 000  000   000   0000000   0000000   000   000  0000000

    incond: (p) ->

        # "#{@node p.rhs}.indexOf(#{@atom p.lhs}) >= 0"
        "[].indexOf.call(#{@node p.rhs}, #{@atom p.lhs}) >= 0"

    # 00000000    0000000   00000000   00000000  000   000   0000000
    # 000   000  000   000  000   000  000       0000  000  000
    # 00000000   000000000  0000000    0000000   000 0 000  0000000
    # 000        000   000  000   000  000       000  0000       000
    # 000        000   000  000   000  00000000  000   000  0000000

    parens: (p) -> 
        # log 'parens' p
        "(#{@nodes p.exps})"

    #  0000000   0000000          000  00000000   0000000  000000000
    # 000   000  000   000        000  000       000          000
    # 000   000  0000000          000  0000000   000          000
    # 000   000  000   000  000   000  000       000          000
    #  0000000   0000000     0000000   00000000   0000000     000

    object: (p) -> 
        nodes = p.keyvals.map (s) => @atom s
        nodes = nodes.map (n) -> if ':' in n then n else "#{n}:#{n}"        
        "{#{nodes.join ','}}"

    # 000   000  00000000  000   000  000   000   0000000   000
    # 000  000   000        000 000   000   000  000   000  000
    # 0000000    0000000     00000     000 000   000000000  000
    # 000  000   000          000        000     000   000  000
    # 000   000  00000000     000         0      000   000  0000000

    keyval: (p) ->
        key = @node p.key
        if key[0] not in "'\"" and /[\.\,\;\*\+\-\/\=\|]/.test key then key = "'#{key}'"
        "#{key}:#{@atom(p.val)}"

    # 00000000   00000000    0000000   00000000
    # 000   000  000   000  000   000  000   000
    # 00000000   0000000    000   000  00000000
    # 000        000   000  000   000  000
    # 000        000   000   0000000   000

    prop:   (p) ->

        "#{@node(p.obj)}.#{@node p.prop}"

    # 000  000   000  0000000    00000000  000   000
    # 000  0000  000  000   000  000        000 000
    # 000  000 0 000  000   000  0000000     00000
    # 000  000  0000  000   000  000        000 000
    # 000  000   000  0000000    00000000  000   000

    index:  (p) ->

        if slice = p.slidx.slice

            from = if slice.from? then @node slice.from else '0'

            addOne = slice.dots.text == '..'

            upto = if slice.upto? then @node slice.upto else '-1'

            if slice.upto?.type == 'num' or slice.upto?.operation or upto == '-1'
                u = parseInt upto
                if Number.isFinite u
                    if u == -1 and addOne
                        upper = ''
                    else
                        u += 1 if addOne
                        upper = ", #{u}"
                else
                    upper = ", #{upto}"
            else
                if addOne then if upto then upper = ", typeof #{upto} === 'number' ? #{upto}+1 : Infinity"
                else                        upper = ", typeof #{upto} === 'number' ? #{upto} : -1"

            "#{@atom(p.idxee)}.slice(#{from}#{upper ? ''})"
        else
            if p.slidx.text?[0] == '-'
                ni = parseInt p.slidx.text
                if ni == -1
                    return "#{@node(p.idxee)}.slice(#{ni})[0]"
                else
                    return "#{@node(p.idxee)}.slice(#{ni},#{ni+1})[0]"

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

    slice: (p) ->
        
        if p.from.type == 'num' == p.upto?.type
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

    # 00000000  00000000   00000000   0000000  000   000  000   000   0000000   00000000   
    # 000       000   000  000       000       000   000  000   000  000   000  000   000  
    # 000000    0000000    0000000   0000000   000000000   000 000   000000000  0000000    
    # 000       000   000  000            000  000   000     000     000   000  000   000  
    # 000       000   000  00000000  0000000   000   000      0      000   000  000   000  
    
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

    ded: -> @indent = @indent[...-4]
        
    #  0000000  000000000  00000000   000  00000000    0000000   000      
    # 000          000     000   000  000  000   000  000   000  000      
    # 0000000      000     0000000    000  00000000   000   000  000      
    #      000     000     000   000  000  000        000   000  000      
    # 0000000      000     000   000  000  000         0000000   0000000  
    
    stripol: (chunks) ->
        
       s = '`'
       for chunk in chunks
           t = chunk.text
           switch chunk.type
               when 'open'  then s+= t+'${'
               when 'close' then s+= '}'+t
               when 'midl'  then s+= '}'+t+'${'
               when 'code'  
                   # c = @compile t
                   c = @nodes chunk.exps
                   if c[0] == ';' then c = c[1..]
                   s+= c
       s += '`'
       s

module.exports = Renderer
