// monsterkodi/kode 0.76.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, length: function (l) {return (l != null ? typeof l.length === 'number' ? l.length : 0 : 0)}, in: function (a,l) {return [].indexOf.call(l,a) >= 0}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var kstr, slash, print, SrcMap, firstLineCol, lastLineCol

kstr = require('kstr')
slash = require('kslash')
print = require('./print')
SrcMap = require('./srcmap')
valid = require('./utils').valid
empty = require('./utils').empty
firstLineCol = require('./utils').firstLineCol
lastLineCol = require('./utils').lastLineCol

class Renderer
{
    constructor (kode)
    {
        var _20_29_, _21_29_

        this.kode = kode
        this.js = this.js.bind(this)
        this.debug = (this.kode.args != null ? this.kode.args.debug : undefined)
        this.verbose = (this.kode.args != null ? this.kode.args.verbose : undefined)
    }

    header ()
    {
        var h, fs

        h = `list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}
length: function (l) {return (l != null ? typeof l.length === 'number' ? l.length : 0 : 0)}
in: function (a,l) {return [].indexOf.call(l,a) >= 0}
extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}`
        fs = h.split('\n').join(', ')
        return `var _k_ = {${fs}}\n\n`
    }

    render (ast, source)
    {
        var s, vs, v, sm

        this.varstack = [ast.vars]
        this.indent = ''
        s = ''
        if (this.kode.args.header)
        {
            s += this.js(`// monsterkodi/kode ${this.kode.version}\n\n`,true)
        }
        s += this.js(this.header(),true)
        if (valid(ast.vars))
        {
            vs = (function () { var result = []; var list = _k_.list(ast.vars); for (var _64_31_ = 0; _64_31_ < list.length; _64_31_++)  { v = list[_64_31_];result.push(v.text)  } return result }).bind(this)().join(', ')
            s += this.js(`var ${vs}\n\n`,true)
        }
        s += this.nodes(ast.exps,'\n',true)
        if (this.srcmap)
        {
            this.srcmap.done(s)
            sm = this.srcmap.generate(s)
            print.noon(sm)
            s += this.srcmap.jscode(sm)
        }
        return s
    }

    js (s, tl)
    {
        var _80_15_

        (this.srcmap != null ? this.srcmap.commit(s,tl) : undefined)
        return s
    }

    nodes (nodes, sep = ',', tl)
    {
        var s, i, a, stripped

        s = ''
        for (i = 0; i < nodes.length; i++)
        {
            a = this.atom(nodes[i])
            if (sep === '\n')
            {
                stripped = kstr.lstrip(a)
                if (_k_.in(stripped[0],'(['))
                {
                    a = ';' + a
                }
                else if (stripped.startsWith('function'))
                {
                    a = `(${a})`
                }
            }
            a += i < nodes.length - 1 ? sep : ''
            if (tl)
            {
                this.js(a,tl)
            }
            s += a
        }
        return s
    }

    node (exp)
    {
        var _117_19_, _117_33_, a, s, k, v

        if (!exp)
        {
            return ''
        }
        if ((exp.type != null) && (exp.text != null))
        {
            return this.token(exp)
        }
        if (exp instanceof Array)
        {
            return (function () { var result = []; var list = _k_.list(exp); for (var _119_60_ = 0; _119_60_ < list.length; _119_60_++)  { a = list[_119_60_];result.push(this.node(a))  } return result }).bind(this)().join(';\n')
        }
        s = ''
        for (k in exp)
        {
            v = exp[k]
            s += ((function ()
            {
                switch (k)
                {
                    case 'if':
                        return this.if(v)

                    case 'for':
                        return this.for(v)

                    case 'while':
                        return this.while(v)

                    case 'return':
                        return this.return(v)

                    case 'class':
                        return this.class(v)

                    case 'function':
                        return this.function(v)

                    case 'switch':
                        return this.switch(v)

                    case 'when':
                        return this.when(v)

                    case 'assert':
                        return this.assert(v)

                    case 'qmrkop':
                        return this.qmrkop(v)

                    case 'stripol':
                        return this.stripol(v)

                    case 'qmrkcolon':
                        return this.qmrkcolon(v)

                    case 'operation':
                        return this.operation(v)

                    case 'incond':
                        return this.incond(v)

                    case 'parens':
                        return this.parens(v)

                    case 'object':
                        return this.object(v)

                    case 'keyval':
                        return this.keyval(v)

                    case 'array':
                        return this.array(v)

                    case 'lcomp':
                        return this.lcomp(v)

                    case 'index':
                        return this.index(v)

                    case 'slice':
                        return this.slice(v)

                    case 'prop':
                        return this.prop(v)

                    case 'each':
                        return this.each(v)

                    case 'func':
                        return this.func(v)

                    case 'call':
                        return this.call(v)

                    case 'try':
                        return this.try(v)

                    default:
                        console.log(R4(`renderer.node unhandled key ${k} in exp`),exp)
                        return ''
                }

            }).bind(this))()
        }
        return s
    }

    atom (exp)
    {
        return this.fixAsserts(this.node(exp))
    }

    qmrkop (p)
    {
        var lhs, vn

        if (p.lhs.type === 'var' || !p.qmrk)
        {
            lhs = this.atom(p.lhs)
            return `(${lhs} != null ? ${lhs} : ${this.atom(p.rhs)})`
        }
        else
        {
            vn = `_${p.qmrk.line}_${p.qmrk.col}_`
            return `((${vn}=${this.atom(p.lhs)}) != null ? ${vn} : ${this.atom(p.rhs)})`
        }
    }

    qmrkcolon (p)
    {
        return `(${this.atom(p.lhs)} ? ${this.atom(p.mid)} : ${this.atom(p.rhs)})`
    }

    assert (p)
    {
        if (p.obj.type !== 'var' && !p.obj.index)
        {
            return '▾' + this.node(p.obj) + `▸${p.qmrk.line}_${p.qmrk.col}◂`
        }
        else
        {
            return '▾' + this.node(p.obj) + `▸${0}_${0}◂`
        }
    }

    fixAsserts (s)
    {
        var i, n, splt, mtch, t, rhs, l

        this.verb('fixAsserts',s)
        if (!(s != null) || s.length === 0)
        {
            return ''
        }
        if (_k_.in(s,['▾',"'▾'",'"▾"']))
        {
            return s
        }
        while (s[0] === '▾')
        {
            s = s.slice(1)
        }
        if (/(?<!['"\[])[▾]/.test(s))
        {
            i = s.indexOf('▾')
            if ((n = s.indexOf('\n',i)) > i)
            {
                return s.slice(0, typeof i === 'number' ? i : -1) + this.fixAsserts(s.slice(i + 1, typeof n === 'number' ? n : -1)) + this.fixAsserts(s.slice(n))
            }
            else
            {
                return s.slice(0, typeof i === 'number' ? i : -1) + this.fixAsserts(s.slice(i + 1))
            }
        }
        splt = s.split(/▸\d+_\d+◂/)
        mtch = s.match(/▸\d+_\d+◂/g)
        if (splt.length > 1)
        {
            mtch = mtch.map(function (m)
            {
                return `_${m.slice(1, -1)}_`
            })
            if (splt.slice(-1)[0] === '')
            {
                if (splt.length > 2)
                {
                    splt.pop()
                    mtch.pop()
                    t = splt.shift()
                    while (splt.length)
                    {
                        t += '▸' + mtch.shift().slice(1, -1) + '◂'
                        t += splt.shift()
                    }
                    t = this.fixAsserts(t)
                }
                else
                {
                    t = splt[0]
                }
                return `(${t} != null)`
            }
            s = ''
            for (i = 0; i < mtch.length; i++)
            {
                if (mtch.length > 1)
                {
                    rhs = i ? (mtch[i - 1] !== "_0_0_" ? mtch[i - 1] : l) + splt[i] : splt[0]
                    if (mtch[i] !== "_0_0_")
                    {
                        l = `(${mtch[i]}=${rhs})`
                    }
                    else
                    {
                        l = rhs
                    }
                }
                else
                {
                    l = splt[0]
                }
                if (splt[i + 1][0] === '(')
                {
                    s += `typeof ${l} === \"function\" ? `
                }
                else
                {
                    s += `${l} != null ? `
                }
            }
            if (mtch.length > 1)
            {
                if (mtch.slice(-1)[0] !== "_0_0_")
                {
                    s += mtch.slice(-1)[0] + splt.slice(-1)[0]
                }
                else
                {
                    s += l + splt.slice(-1)[0]
                }
            }
            else
            {
                s += splt[0] + splt[1]
            }
            for (i = 0; i < mtch.length; i++)
            {
                s += " : undefined"
            }
            s = `(${s})`
        }
        return s
    }

    class (n)
    {
        var s, mthds, con, bind, b, bn, _289_50_, mi

        s = ''
        s += `class ${n.name.text}`
        if (n.extends)
        {
            s += " extends " + n.extends.map(function (e)
            {
                return e.text
            }).join(', ')
        }
        s += '\n{'
        mthds = n.body
        if ((mthds != null ? mthds.length : undefined))
        {
            con = this.prepareMethods(mthds)[0]
            bind = this.prepareMethods(mthds)[1]

            if (bind.length)
            {
                var list = _k_.list(bind)
                for (var _287_22_ = 0; _287_22_ < list.length; _287_22_++)
                {
                    b = list[_287_22_]
                    bn = b.keyval.val.func.name.text
                    con.keyval.val.func.body.exps = ((_289_50_=con.keyval.val.func.body.exps) != null ? _289_50_ : [])
                    con.keyval.val.func.body.exps.unshift({type:'code',text:`this.${bn} = this.${bn}.bind(this)`})
                }
            }
            this.indent = '    '
            for (mi = 0; mi < mthds.length; mi++)
            {
                if (mi)
                {
                    s += '\n'
                }
                s += this.mthd(mthds[mi])
            }
            s += '\n'
            this.indent = ''
        }
        s += '}\n'
        return s
    }

    super (p)
    {
        if (this.mthdName)
        {
            return `${p.callee.text}.${this.mthdName}(${this.nodes(p.args,',')})`
        }
        else if (this.fncnName && this.fncsName)
        {
            return `${this.fncnName}.__super__.${this.fncsName}.call(this, ${this.nodes(p.args,',')})`
        }
    }

    mthd (n)
    {
        var s

        if (n.keyval)
        {
            s = '\n'
            this.mthdName = n.keyval.val.func.name.text
            s += this.indent + this.func(n.keyval.val.func)
            delete this.mthdName
        }
        return s
    }

    function (n)
    {
        var s, e, mthds, con, bind, b, bn, _361_50_, _367_46_, mi

        this.fncnName = n.name.text
        s = '\n'
        s += `${this.fncnName} = (function ()\n`
        s += '{\n'
        if (n.extends)
        {
            var list = _k_.list(n.extends)
            for (var _348_18_ = 0; _348_18_ < list.length; _348_18_++)
            {
                e = list[_348_18_]
                s += `    _k_.extend(${n.name.text}, ${e.text});`
            }
            s += '\n'
        }
        mthds = n.body
        if ((mthds != null ? mthds.length : undefined))
        {
            con = this.prepareMethods(mthds)[0]
            bind = this.prepareMethods(mthds)[1]

            if (bind.length)
            {
                var list1 = _k_.list(bind)
                for (var _359_22_ = 0; _359_22_ < list1.length; _359_22_++)
                {
                    b = list1[_359_22_]
                    bn = b.keyval.val.func.name.text
                    con.keyval.val.func.body.exps = ((_361_50_=con.keyval.val.func.body.exps) != null ? _361_50_ : [])
                    con.keyval.val.func.body.exps.unshift({type:'code',text:`this[\"${bn}\"] = this[\"${bn}\"].bind(this)`})
                }
            }
            if (n.extends)
            {
                con.keyval.val.func.body.exps = ((_367_46_=con.keyval.val.func.body.exps) != null ? _367_46_ : [])
                con.keyval.val.func.body.exps.push({type:'code',text:`return ${this.fncnName}.__super__.constructor.apply(this, arguments)`})
            }
            this.indent = '    '
            for (mi = 0; mi < mthds.length; mi++)
            {
                s += this.funcs(mthds[mi],n.name.text)
                s += '\n'
            }
            this.indent = ''
        }
        delete this.fncnName
        s += `    return ${n.name.text}\n`
        s += '})()\n'
        return s
    }

    funcs (n, className)
    {
        var s, f

        s = ''
        if (n.keyval)
        {
            f = n.keyval.val.func
            if (f.name.text === 'constructor')
            {
                this.fncsName = 'constructor'
                s = this.indent + this.func(f,'function ' + className)
                s += '\n'
            }
            else if (f.name.text.startsWith('static'))
            {
                this.fncsName = f.name.text.slice(7)
                s = this.indent + this.func(f,`${className}[\"${this.fncsName}\"] = function`)
                s += '\n'
            }
            else
            {
                this.fncsName = f.name.text
                s = this.indent + this.func(f,`${className}.prototype[\"${this.fncsName}\"] = function`)
                s += '\n'
            }
            delete this.fncsName
        }
        return s
    }

    prepareMethods (mthds)
    {
        var bind, m, name, con, _434_37_, ast

        bind = []
        var list = _k_.list(mthds)
        for (var _419_14_ = 0; _419_14_ < list.length; _419_14_++)
        {
            m = list[_419_14_]
            if (!m.keyval)
            {
                print.ast('not an method?',m)
                continue
            }
            if (!m.keyval.val.func)
            {
                print.ast('no func for method?',m)
                continue
            }
            name = m.keyval.val.func.name.text
            if (_k_.in(name,['@','constructor']))
            {
                if (con)
                {
                    console.error('more than one constructor?')
                }
                m.keyval.val.func.name.text = 'constructor'
                con = m
            }
            else if (name.startsWith('@'))
            {
                m.keyval.val.func.name.text = 'static ' + name.slice(1)
            }
            else if ((m.keyval.val.func != null ? m.keyval.val.func.arrow.text : undefined) === '=>')
            {
                bind.push(m)
            }
        }
        if ((bind.length || this.fncnName) && !con)
        {
            ast = this.kode.ast("constructor: ->")
            con = ast.exps[0].object.keyvals[0]
            con.keyval.val.func.name = {type:'name',text:'constructor'}
            mthds.unshift(con)
        }
        return [con,bind]
    }

    func (n, name)
    {
        var gi, _457_29_, _457_22_, s, args, _462_29_, _462_21_, str, ths, vs, v, t, ss

        if (!n)
        {
            return ''
        }
        gi = this.ind()
        name = (name != null ? name : ((_457_29_=(n.name != null ? n.name.text : undefined)) != null ? _457_29_ : 'function'))
        s = name
        s += ' ('
        args = ((_462_21_=n.args) != null ? (_462_29_=_462_21_.parens) != null ? _462_29_.exps : undefined : undefined)
        if (args)
        {
            str = this.args(args)[0]
            ths = this.args(args)[1]

            s += str
        }
        s += ')\n'
        s += gi + '{'
        this.varstack.push(n.body.vars)
        if (valid(n.body.vars))
        {
            s += '\n'
            vs = (function () { var result = []; var list = _k_.list(n.body.vars); for (var _474_31_ = 0; _474_31_ < list.length; _474_31_++)  { v = list[_474_31_];result.push(v.text)  } return result }).bind(this)().join(', ')
            s += this.indent + `var ${vs}\n`
        }
        var list1 = (ths != null ? ths : [])
        for (var _477_14_ = 0; _477_14_ < list1.length; _477_14_++)
        {
            t = list1[_477_14_]
            s += '\n' + this.indent + ths
        }
        if (valid(n.body.exps))
        {
            s += '\n'
            ss = n.body.exps.map((function (s)
            {
                return this.node(s)
            }).bind(this))
            ss = ss.map((function (s)
            {
                return this.indent + s
            }).bind(this))
            s += ss.join('\n')
            s += '\n' + gi
        }
        s += '}'
        this.varstack.pop()
        this.ded()
        if (n.arrow.text === '=>' && !n.name)
        {
            s = `(${s}).bind(this)`
        }
        return s
    }

    args (args)
    {
        var ths, used, a, str

        ths = []
        used = {}
        var list = _k_.list(args)
        for (var _510_14_ = 0; _510_14_ < list.length; _510_14_++)
        {
            a = list[_510_14_]
            if (a.text)
            {
                used[a.text] = a.text
            }
        }
        args = args.map(function (a)
        {
            var txt, i

            if (a.prop && a.prop.obj.type === 'this')
            {
                txt = a.prop.prop.text
                if (used[txt])
                {
                    for (i = 1; i <= 100; i++)
                    {
                        if (!used[txt + i])
                        {
                            ths.push(`this.${txt} = ${txt + i}`)
                            txt += i
                            used[txt] = txt
                            break
                        }
                    }
                }
                else
                {
                    ths.push(`this.${txt} = ${txt}`)
                }
                return {type:'@arg',text:txt}
            }
            else
            {
                return a
            }
        })
        str = args.map((function (a)
        {
            return this.node(a)
        }).bind(this)).join(', ')
        return [str,ths]
    }

    return (n)
    {
        var s

        s = 'return'
        s += ' ' + this.node(n.val)
        return kstr.strip(s)
    }

    call (p)
    {
        var callee

        if (_k_.in(p.callee.text,['log','warn','error']))
        {
            p.callee.text = `console.${p.callee.text}`
        }
        callee = this.node(p.callee)
        if (p.args)
        {
            if (_k_.in(callee,['new','throw','delete']))
            {
                return `${callee} ${this.nodes(p.args,',')}`
            }
            else if (callee === 'super')
            {
                return this.super(p)
            }
            else
            {
                return `${callee}(${this.nodes(p.args,',')})`
            }
        }
        else
        {
            return `${callee}()`
        }
    }

    if (n)
    {
        var first, last, gi, s, e, _590_24_, elif, _594_28_, _598_36_, _606_28_

        first = firstLineCol(n)
        last = lastLineCol(n)
        if ((first.line === last.line && n.else && !n.returns) || n.inline)
        {
            return this.ifInline(n)
        }
        gi = this.ind()
        s = ''
        s += `if (${this.atom(n.cond)})\n`
        s += gi + "{\n"
        var list = ((_590_24_=n.then) != null ? _590_24_ : [])
        for (var _590_14_ = 0; _590_14_ < list.length; _590_14_++)
        {
            e = list[_590_14_]
            s += this.indent + this.node(e) + '\n'
        }
        s += gi + "}"
        var list1 = ((_594_28_=n.elifs) != null ? _594_28_ : [])
        for (var _594_17_ = 0; _594_17_ < list1.length; _594_17_++)
        {
            elif = list1[_594_17_]
            s += '\n'
            s += gi + `else if (${this.atom(elif.elif.cond)})\n`
            s += gi + "{\n"
            var list2 = ((_598_36_=elif.elif.then) != null ? _598_36_ : [])
            for (var _598_18_ = 0; _598_18_ < list2.length; _598_18_++)
            {
                e = list2[_598_18_]
                s += this.indent + this.node(e) + '\n'
            }
            s += gi + "}"
        }
        if (n.else)
        {
            s += '\n'
            s += gi + 'else\n'
            s += gi + "{\n"
            var list3 = ((_606_28_=n.else) != null ? _606_28_ : [])
            for (var _606_18_ = 0; _606_18_ < list3.length; _606_18_++)
            {
                e = list3[_606_18_]
                s += this.indent + this.node(e) + '\n'
            }
            s += gi + "}"
        }
        this.ded()
        return s
    }

    ifInline (n, dontClose)
    {
        var s, _624_17_, e

        s = ''
        s += `${this.atom(n.cond)} ? `
        if ((n.then != null ? n.then.length : undefined))
        {
            s += (function () { var result = []; var list = _k_.list(n.then); for (var _625_33_ = 0; _625_33_ < list.length; _625_33_++)  { e = list[_625_33_];result.push(this.atom(e))  } return result }).bind(this)().join(', ')
        }
        if (n.elifs)
        {
            var list1 = _k_.list(n.elifs)
            for (var _628_18_ = 0; _628_18_ < list1.length; _628_18_++)
            {
                e = list1[_628_18_]
                s += ' : '
                s += this.ifInline(e.elif,true)
            }
        }
        if (n.else)
        {
            s += ' : '
            if (n.else.length === 1)
            {
                s += this.atom(n.else[0])
            }
            else
            {
                s += '(' + (function () { var result = []; var list2 = _k_.list(n.else); for (var _637_42_ = 0; _637_42_ < list2.length; _637_42_++)  { e = list2[_637_42_];result.push(this.atom(e))  } return result }).bind(this)().join(', ') + ')'
            }
        }
        else if (!dontClose)
        {
            s += ' : undefined'
        }
        return s
    }

    each (n)
    {
        var numArgs, _650_33_, _684_35_

        numArgs = (n.fnc.func.args != null ? n.fnc.func.args.parens.exps.length : undefined)
        if (numArgs === 1)
        {
            return `(function (o) {
    r = o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}
    for (k in o)
    {   
        var m = (${this.node(n.fnc)})(o[k])
        if (m != null)
        {
            r[k] = m
        }
    }
    return typeof o == 'string' ? r.join('') : r
})(${this.node(n.lhs)})`
        }
        else if (numArgs)
        {
            return `(function (o) {
    r = o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}
    for (k in o)
    {   
        var m = (${this.node(n.fnc)})(k, o[k])
        if (m != null && m[0] != null)
        {
            r[m[0]] = m[1]
        }
    }
    return typeof o == 'string' ? r.join('') : r
})(${this.node(n.lhs)})`
        }
        else
        {
            if ((n.fnc.func.body.exps != null ? n.fnc.func.body.exps.length : undefined) > 0)
            {
                return `(function (o) {
    r = o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}
    for (k in o)
    {   
        var m = (${this.node(n.fnc)})(o[k])
        if (m != null)
        {
            r[k] = m
        }
    }
    return typeof o == 'string' ? r.join('') : r
})(${this.node(n.lhs)})
    `
            }
            else
            {
                return `(function (o) { return o instanceof Array ? [] : typeof o == 'string' ? '' : {} })(${this.node(n.lhs)})`
            }
        }
    }

    for (n)
    {
        if (!n.then)
        {
            this.verb('for expected then',n)
        }
        switch (n.inof.text)
        {
            case 'in':
                return this.for_in(n)

            case 'of':
                return this.for_of(n)

            default:
                return console.error('for expected in/of')
        }

    }

    for_in (n, varPrefix = '', lastPrefix = '', lastPostfix = '', lineBreak)
    {
        var list, _736_27_, gi, nl, eb, g2, listVar, iterVar, s, _758_28_, j, v, e, _770_24_, prefix, postfix

        if (!n.list.qmrkop && !n.list.array && !n.list.slice)
        {
            list = `_k_.list(${this.node(n.list)})`
        }
        else
        {
            if (((_736_27_=n.list.array) != null ? _736_27_.items[0] != null ? _736_27_.items[0].slice : undefined : undefined) || n.list.slice)
            {
                return this.for_in_range(n,varPrefix,lastPrefix,lastPostfix,lineBreak)
            }
            list = this.node(n.list)
        }
        if (!list || list === 'undefined')
        {
            print.noon('no list for',n.list)
            print.ast('no list for',n.list)
        }
        gi = lineBreak || this.ind()
        nl = lineBreak || '\n'
        eb = lineBreak && ';' || '\n'
        g2 = lineBreak ? '' : this.indent
        listVar = this.freshVar('list')
        iterVar = `_${n.inof.line}_${n.inof.col}_`
        s = ''
        s += `var ${listVar} = ${list}` + eb
        if (n.vals.text)
        {
            s += gi + `for (var ${iterVar} = 0; ${iterVar} < ${listVar}.length; ${iterVar}++)` + nl
            s += gi + "{" + nl
            s += g2 + `${n.vals.text} = ${listVar}[${iterVar}]` + eb
        }
        else if ((n.vals.array != null ? n.vals.array.items : undefined))
        {
            s += gi + `for (var ${iterVar} = 0; ${iterVar} < ${listVar}.length; ${iterVar}++)` + nl
            s += gi + "{" + nl
            for (j = 0; j < n.vals.array.items.length; j++)
            {
                v = n.vals.array.items[j]
                s += g2 + `${v.text} = ${listVar}[${iterVar}][${j}]` + eb
            }
        }
        else if (n.vals.length > 1)
        {
            iterVar = n.vals[1].text
            s += gi + `for (${iterVar} = 0; ${iterVar} < ${listVar}.length; ${iterVar}++)` + nl
            s += gi + "{" + nl
            s += g2 + `${varPrefix}${n.vals[0].text} = ${listVar}[${iterVar}]` + eb
        }
        var list1 = ((_770_24_=n.then) != null ? _770_24_ : [])
        for (var _770_14_ = 0; _770_14_ < list1.length; _770_14_++)
        {
            e = list1[_770_14_]
            prefix = lastPrefix && e === n.then.slice(-1)[0] ? lastPrefix : ''
            postfix = lastPostfix && e === n.then.slice(-1)[0] ? lastPostfix : ''
            s += g2 + prefix + this.node(e) + postfix + nl
        }
        s += gi + "}"
        if (!lineBreak)
        {
            this.ded()
        }
        return s
    }

    for_in_range (n, varPrefix, lastPrefix, lastPostfix, lineBreak)
    {
        var slice, _787_46_, _787_28_, gi, nl, eb, g2, iterVar, _797_32_, iterStart, iterEnd, start, end, iterCmp, iterDir, s, e, _816_24_, prefix, postfix

        slice = ((_787_46_=((_787_28_=n.list.array) != null ? _787_28_.items[0] != null ? _787_28_.items[0].slice : undefined : undefined)) != null ? _787_46_ : n.list.slice)
        gi = lineBreak || this.ind()
        nl = lineBreak || '\n'
        eb = lineBreak && ';' || '\n'
        g2 = lineBreak ? '' : this.indent
        iterVar = ((_797_32_=n.vals.text) != null ? _797_32_ : n.vals[0].text)
        iterStart = this.node(slice.from)
        iterEnd = this.node(slice.upto)
        start = parseInt(iterStart)
        end = parseInt(iterEnd)
        iterCmp = slice.dots.text === '...' ? '<' : '<='
        iterDir = '++'
        if (Number.isFinite(start) && Number.isFinite(end))
        {
            if (start > end)
            {
                iterCmp = slice.dots.text === '...' ? '>' : '>='
                iterDir = '--'
            }
        }
        s = ''
        s += `for (${iterVar} = ${iterStart}; ${iterVar} ${iterCmp} ${iterEnd}; ${iterVar}${iterDir})` + nl
        s += gi + "{" + nl
        var list = ((_816_24_=n.then) != null ? _816_24_ : [])
        for (var _816_14_ = 0; _816_14_ < list.length; _816_14_++)
        {
            e = list[_816_14_]
            prefix = lastPrefix && e === n.then.slice(-1)[0] ? lastPrefix : ''
            postfix = lastPostfix && e === n.then.slice(-1)[0] ? lastPostfix : ''
            s += g2 + prefix + this.node(e) + postfix + nl
        }
        s += gi + "}"
        if (!lineBreak)
        {
            this.ded()
        }
        return s
    }

    for_of (n, varPrefix = '', lastPrefix = '', lastPostfix = '', lineBreak)
    {
        var gi, nl, eb, g2, key, _838_26_, val, obj, s, e, _847_24_, prefix, postfix

        gi = lineBreak || this.ind()
        nl = lineBreak || '\n'
        eb = lineBreak && ';' || '\n'
        g2 = lineBreak ? '' : this.indent
        key = ((_838_26_=n.vals.text) != null ? _838_26_ : (n.vals[0] != null ? n.vals[0].text : undefined))
        val = (n.vals[1] != null ? n.vals[1].text : undefined)
        obj = this.node(n.list)
        s = ''
        s += `for (${varPrefix}${key} in ${obj})` + nl
        s += gi + "{" + nl
        if (val)
        {
            s += g2 + `${varPrefix}${val} = ${obj}[${key}]` + eb
        }
        var list = ((_847_24_=n.then) != null ? _847_24_ : [])
        for (var _847_14_ = 0; _847_14_ < list.length; _847_14_++)
        {
            e = list[_847_14_]
            prefix = lastPrefix && e === n.then.slice(-1)[0] ? lastPrefix : ''
            postfix = lastPostfix && e === n.then.slice(-1)[0] ? lastPostfix : ''
            s += g2 + prefix + this.node(e) + postfix + nl
        }
        s += gi + "}"
        if (!lineBreak)
        {
            this.ded()
        }
        return s
    }

    lcomp (n)
    {
        var comp

        comp = (function (f)
        {
            switch (f.inof.text)
            {
                case 'in':
                    return this.for_in(f,'var ','result.push(',')',' ')

                case 'of':
                    return this.for_of(f,'var ','result.push(',')',' ')

            }

        }).bind(this)
        return `(function () { var result = []; ${comp(n.for)} return result }).bind(this)()`
    }

    while (n)
    {
        var gi, s, e, _885_24_

        gi = this.ind()
        s = ''
        s += `while (${this.node(n.cond)})\n`
        s += gi + "{\n"
        var list = ((_885_24_=n.then) != null ? _885_24_ : [])
        for (var _885_14_ = 0; _885_14_ < list.length; _885_14_++)
        {
            e = list[_885_14_]
            s += this.indent + this.node(e) + '\n'
        }
        s += gi + "}"
        this.ded()
        return s
    }

    switch (n)
    {
        var gi, s, e, _909_25_

        if (!n.match)
        {
            console.error('switch expected match',n)
        }
        if (!n.whens)
        {
            console.error('switch expected whens',n)
        }
        gi = this.ind()
        s = ''
        s += `switch (${this.node(n.match)})\n`
        s += gi + "{\n"
        var list = ((_909_25_=n.whens) != null ? _909_25_ : [])
        for (var _909_14_ = 0; _909_14_ < list.length; _909_14_++)
        {
            e = list[_909_14_]
            s += gi + this.node(e) + '\n'
        }
        if (valid(n.else))
        {
            s += this.indent + 'default:\n'
            var list1 = _k_.list(n.else)
            for (var _914_18_ = 0; _914_18_ < list1.length; _914_18_++)
            {
                e = list1[_914_18_]
                s += this.indent + '    ' + this.node(e) + '\n'
            }
        }
        s += gi + "}\n"
        this.ded()
        return s
    }

    when (n)
    {
        var s, e, i, _936_24_, gi

        if (!n.vals)
        {
            return console.error('when expected vals',n)
        }
        s = ''
        var list = _k_.list(n.vals)
        for (var _933_14_ = 0; _933_14_ < list.length; _933_14_++)
        {
            e = list[_933_14_]
            i = e !== n.vals[0] && this.indent || '    '
            s += i + 'case ' + this.node(e) + ':\n'
        }
        var list1 = ((_936_24_=n.then) != null ? _936_24_ : [])
        for (var _936_14_ = 0; _936_14_ < list1.length; _936_14_++)
        {
            e = list1[_936_14_]
            gi = this.ind()
            s += gi + '    ' + this.node(e) + '\n'
            this.ded()
        }
        if (!(n.then && n.then.slice(-1)[0] && n.then.slice(-1)[0].return))
        {
            s += this.indent + '    ' + 'break'
        }
        return s
    }

    try (n)
    {
        var s, gi, _959_19_

        s = ''
        gi = this.ind()
        s += 'try\n'
        s += gi + '{\n'
        s += this.indent + this.nodes(n.exps,'\n' + this.indent)
        s += '\n'
        s += gi + '}'
        if (((_959_19_=n.catch) != null ? _959_19_ : []))
        {
            s += '\n'
            s += gi + `catch (${this.node(n.catch.errr)})\n`
            s += gi + '{\n'
            s += this.indent + this.nodes(n.catch.exps,'\n' + this.indent)
            s += '\n'
            s += gi + '}'
        }
        if (n.finally)
        {
            s += '\n'
            s += gi + 'finally\n'
            s += gi + '{\n'
            s += this.indent + this.nodes(n.finally,'\n' + this.indent)
            s += '\n'
            s += gi + '}'
        }
        this.ded()
        return s
    }

    token (tok)
    {
        var s

        s = tok.type === 'comment' ? this.comment(tok) : tok.type === 'this' ? 'this' : tok.type === 'triple' ? '`' + tok.text.slice(3, -3) + '`' : _k_.in(tok.type,['keyword','bool']) && tok.text === 'yes' ? 'true' : _k_.in(tok.type,['keyword','bool']) && tok.text === 'no' ? 'false' : tok.text
        this.js(s,tok)
        return s
    }

    comment (tok)
    {
        if (tok.text.startsWith('###'))
        {
            return '/*' + tok.text.slice(3, -3) + '*/' + '\n'
        }
        else if (tok.text.startsWith('#'))
        {
            return kstr.pad('',tok.col) + '//' + tok.text.slice(1)
        }
        else
        {
            console.error("# comment token expected")
            return ''
        }
    }

    operation (op)
    {
        var opmap, o, sep, ro, _1039_40_, _1039_29_, open, close, s, keyval, val, i, _1062_21_, _1062_60_, _1062_50_, _1062_39_, _1066_33_, _1066_22_, first, prfx, _1071_43_

        opmap = function (o)
        {
            var omp, _1032_19_

            omp = {and:'&&',or:'||',not:'!','==':'===','!=':'!=='}
            return ((_1032_19_=omp[o]) != null ? _1032_19_ : o)
        }
        o = opmap(op.operator.text)
        sep = ' '
        if (!op.lhs || !op.rhs)
        {
            sep = ''
        }
        if (_k_.in(o,['<','<=','===','!==','>=','>']))
        {
            ro = opmap(((_1039_29_=op.rhs) != null ? (_1039_40_=_1039_29_.operation) != null ? _1039_40_.operator.text : undefined : undefined))
            if (_k_.in(ro,['<','<=','===','!==','>=','>']))
            {
                return '(' + this.atom(op.lhs) + sep + o + sep + this.atom(op.rhs.operation.lhs) + ' && ' + kstr.lstrip(this.atom(op.rhs)) + ')'
            }
        }
        open = close = ''
        if (o === '=')
        {
            if (op.lhs.object)
            {
                s = ''
                var list = _k_.list(op.lhs.object.keyvals)
                for (var _1049_27_ = 0; _1049_27_ < list.length; _1049_27_++)
                {
                    keyval = list[_1049_27_]
                    s += `${keyval.text} = ${this.atom(op.rhs)}.${keyval.text}\n`
                }
                return s
            }
            if (op.lhs.array)
            {
                s = ''
                var list1 = _k_.list(op.lhs.array.items)
                for (var _1055_24_ = 0; _1055_24_ < list1.length; _1055_24_++)
                {
                    val = list1[_1055_24_]
                    i = op.lhs.array.items.indexOf(val)
                    s += (i && this.indent || '') + `${val.text} = ${this.atom(op.rhs)}[${i}]\n`
                }
                return s
            }
        }
        else if (o === '!')
        {
            if ((op.rhs != null ? op.rhs.incond : undefined) || ((_1062_39_=op.rhs) != null ? (_1062_50_=_1062_39_.operation) != null ? (_1062_60_=_1062_50_.operator) != null ? _1062_60_.text : undefined : undefined : undefined) === '=')
            {
                open = '('
                close = ')'
            }
        }
        else if (((_1066_22_=op.rhs) != null ? (_1066_33_=_1066_22_.operation) != null ? _1066_33_.operator.text : undefined : undefined) === '=')
        {
            open = '('
            close = ')'
        }
        first = firstLineCol(op.lhs)
        prfx = first.col === 0 && (op.rhs != null ? op.rhs.func : undefined) ? '\n' : ''
        return prfx + this.atom(op.lhs) + sep + o + sep + open + kstr.lstrip(this.atom(op.rhs) + close)
    }

    incond (p)
    {
        return `_k_.in(${this.atom(p.lhs)},${this.node(p.rhs)})`
    }

    parens (p)
    {
        return `(${this.nodes(p.exps)})`
    }

    object (p)
    {
        var nodes

        nodes = p.keyvals.map((function (s)
        {
            return this.atom(s)
        }).bind(this))
        nodes = nodes.map(function (n)
        {
            if (_k_.in(':',n))
            {
                return n
            }
            else
            {
                return `${n}:${n}`
            }
        })
        return `{${nodes.join(',')}}`
    }

    keyval (p)
    {
        var key

        key = this.node(p.key)
        if (!(_k_.in(key[0],"'\"")) && /[\.\,\;\*\+\-\/\=\|]/.test(key))
        {
            key = `'${key}'`
        }
        return `${key}:${this.atom(p.val)}`
    }

    prop (p)
    {
        return `${this.node(p.obj)}.${this.node(p.prop)}`
    }

    index (p)
    {
        var slice, from, _1138_32_, addOne, upto, _1142_32_, _1144_25_, _1144_54_, u, upper, _1160_27_, ni

        if (slice = p.slidx.slice)
        {
            from = (slice.from != null) ? this.node(slice.from) : '0'
            addOne = slice.dots.text === '..'
            upto = (slice.upto != null) ? this.node(slice.upto) : '-1'
            if ((slice.upto != null ? slice.upto.type : undefined) === 'num' || (slice.upto != null ? slice.upto.operation : undefined) || upto === '-1')
            {
                u = parseInt(upto)
                if (Number.isFinite(u))
                {
                    if (u === -1 && addOne)
                    {
                        upper = ''
                    }
                    else
                    {
                        if (addOne)
                        {
                            u += 1
                        }
                        upper = `, ${u}`
                    }
                }
                else
                {
                    upper = `, ${upto}`
                }
            }
            else
            {
                if (addOne)
                {
                    if (upto)
                    {
                        upper = `, typeof ${upto} === 'number' ? ${upto}+1 : Infinity`
                    }
                }
                else
                {
                    upper = `, typeof ${upto} === 'number' ? ${upto} : -1`
                }
            }
            return `${this.atom(p.idxee)}.slice(${from}${(upper != null ? upper : '')})`
        }
        else
        {
            if ((p.slidx.text != null ? p.slidx.text[0] : undefined) === '-')
            {
                ni = parseInt(p.slidx.text)
                if (ni === -1)
                {
                    return `${this.node(p.idxee)}.slice(${ni})[0]`
                }
                else
                {
                    return `${this.node(p.idxee)}.slice(${ni},${ni + 1})[0]`
                }
            }
            return `${this.node(p.idxee)}[${this.node(p.slidx)}]`
        }
    }

    array (p)
    {
        if ((p.items[0] != null ? p.items[0].slice : undefined))
        {
            return this.slice(p.items[0].slice)
        }
        else
        {
            return `[${this.nodes(p.items,',')}]`
        }
    }

    slice (p)
    {
        var _1190_41_, from, upto, x, o

        if ((p.from.type === 'num' && 'num' === (p.upto != null ? p.upto.type : undefined)))
        {
            from = parseInt(p.from.text)
            upto = parseInt(p.upto.text)
            if (upto - from <= 10)
            {
                if (p.dots.text === '...')
                {
                    upto--
                }
                return '[' + ((function () { var result = []; for (x = from; x <= upto; x++)  { result.push(x)  } return result }).bind(this)().join(',')) + ']'
            }
            else
            {
                o = p.dots.text === '...' ? '<' : '<='
                return `(function() { var r = []; for (var i = ${from}; i ${o} ${upto}; i++){ r.push(i); } return r; }).apply(this)`
            }
        }
        else
        {
            o = p.dots.text === '...' ? '<' : '<='
            return `(function() { var r = []; for (var i = ${this.node(p.from)}; i ${o} ${this.node(p.upto)}; i++){ r.push(i); } return r; }).apply(this)`
        }
    }

    freshVar (name, suffix = 0)
    {
        var vars, v

        var list = _k_.list(this.varstack)
        for (var _1211_17_ = 0; _1211_17_ < list.length; _1211_17_++)
        {
            vars = list[_1211_17_]
            var list1 = _k_.list(vars)
            for (var _1212_18_ = 0; _1212_18_ < list1.length; _1212_18_++)
            {
                v = list1[_1212_18_]
                if (v.text === name + (suffix || ''))
                {
                    return this.freshVar(name,suffix + 1)
                }
            }
        }
        this.varstack.slice(-1)[0].push({text:name + (suffix || '')})
        return name + (suffix || '')
    }

    verb ()
    {
        if (this.verbose)
        {
            return console.log.apply(console.log,arguments)
        }
    }

    ind ()
    {
        var oi

        oi = this.indent
        this.indent += '    '
        return oi
    }

    ded ()
    {
        return this.indent = this.indent.slice(0, -4)
    }

    stripol (chunks)
    {
        var s, chunk, t, c

        s = '`'
        var list = _k_.list(chunks)
        for (var _1238_17_ = 0; _1238_17_ < list.length; _1238_17_++)
        {
            chunk = list[_1238_17_]
            t = chunk.text
            switch (chunk.type)
            {
                case 'open':
                    s += t + '${'
                    break
                case 'close':
                    s += '}' + t
                    break
                case 'midl':
                    s += '}' + t + '${'
                    break
                case 'code':
                    c = this.nodes(chunk.exps)
                    if (c[0] === ';')
                    {
                        c = c.slice(1)
                    }
                    s += c
                    break
            }

        }
        s += '`'
        return s
    }
}

module.exports = Renderer