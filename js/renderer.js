// monsterkodi/kode 0.104.0

var _k_ = {empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, valid: undefined, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, each_r: function (o) {return o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}}

var kstr, slash, print, SrcMap, firstLineCol, lastLineCol

kstr = require('kstr')
slash = require('kslash')
print = require('./print')
SrcMap = require('./srcmap')
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

    render (ast, source)
    {
        var s, vs, v, sm

        this.hint = {_k_:{}}
        this.varstack = [ast.vars]
        this.indent = ''
        s = ''
        if (this.kode.args.header)
        {
            s += this.js(`// monsterkodi/kode ${this.kode.version}\n\n`,true)
        }
        s += this.js("var _k_\n\n",true)
        if (!_k_.empty(ast.vars))
        {
            vs = (function () { var result = []; var list = _k_.list(ast.vars); for (var _46_31_ = 0; _46_31_ < list.length; _46_31_++)  { v = list[_46_31_];result.push(v.text)  } return result }).bind(this)().join(', ')
            s += this.js(`var ${vs}\n\n`,true)
        }
        s += this.nodes(ast.exps,'\n',true)
        if (this.hint.section)
        {
            s += '\nmodule.exports\n'
        }
        if (this.srcmap)
        {
            this.srcmap.done(s)
            sm = this.srcmap.generate(s)
            print.noon(sm)
            s += this.srcmap.jscode(sm)
        }
        s = this.header(s)
        return s
    }

    js (s, tl)
    {
        var _66_15_

        ;(this.srcmap != null ? this.srcmap.commit(s,tl) : undefined)
        return s
    }

    header (s)
    {
        var kf, hr, ks, ht

        if (_k_.empty(Object.keys(this.hint._k_)))
        {
            return s
        }
        kf = {list:"function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}",empty:"function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}",in:"function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}",extend:"function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}",each_r:"function (o) {return o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}}"}
        hr = (function (o) {
            var r = _k_.each_r(o)
            for (var k in o)
            {   
                var m = (function (k, v)
            {
                if (v)
                {
                    return [k,`${k}: ${kf[k]}`]
                }
            })(k, o[k])
                if (m != null && m[0] != null)
                {
                    r[m[0]] = m[1]
                }
            }
            return typeof o == 'string' ? r.join('') : r
        })(this.hint._k_)
        ks = Object.values(hr).join(', ')
        ht = `var _k_ = {${ks}}\n\n`
        s = s.replace("var _k_\n\n",ht)
        return s
    }

    nodes (nodes, sep = ',', tl)
    {
        var s, i, a, stripped

        s = ''
        for (i = 0; i < nodes.length; i++)
        {
            a = this.atom(nodes[i])
            if (sep[0] === '\n')
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
        var _127_19_, _127_33_, a, s, k, v

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
            return (function () { var result = []; var list = _k_.list(exp); for (var _129_60_ = 0; _129_60_ < list.length; _129_60_++)  { a = list[_129_60_];result.push(this.node(a))  } return result }).bind(this)().join(';\n')
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

                    case 'section':
                        return this.section(v)

                    case 'subsect':
                        return this.subsect(v)

                    case 'compare':
                        return this.compare(v)

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
        var s, mthds, con, bind, b, bn, _302_50_, mi

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
                for (var _300_22_ = 0; _300_22_ < list.length; _300_22_++)
                {
                    b = list[_300_22_]
                    bn = b.keyval.val.func.name.text
                    con.keyval.val.func.body.exps = ((_302_50_=con.keyval.val.func.body.exps) != null ? _302_50_ : [])
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
        var s, _341_32_

        if (n.keyval)
        {
            s = '\n'
            if ((n.keyval.val.func != null))
            {
                this.mthdName = n.keyval.val.func.name.text
                s += this.indent + this.func(n.keyval.val.func)
                delete this.mthdName
            }
            else
            {
                if (n.keyval.key.text.startsWith('@'))
                {
                    s += this.indent + 'static ' + n.keyval.key.text.slice(1) + ' = ' + this.node(n.keyval.val)
                }
                else
                {
                    console.log('what is this?',n)
                }
            }
        }
        return s
    }

    function (n)
    {
        var s, e, mthds, con, bind, b, bn, _381_50_, _387_46_, mi

        this.fncnName = n.name.text
        s = '\n'
        s += `${this.fncnName} = (function ()\n`
        s += '{\n'
        if (n.extends)
        {
            var list = _k_.list(n.extends)
            for (var _367_18_ = 0; _367_18_ < list.length; _367_18_++)
            {
                e = list[_367_18_]
                this.hint._k_.extend = true
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
                for (var _379_22_ = 0; _379_22_ < list1.length; _379_22_++)
                {
                    b = list1[_379_22_]
                    bn = b.keyval.val.func.name.text
                    con.keyval.val.func.body.exps = ((_381_50_=con.keyval.val.func.body.exps) != null ? _381_50_ : [])
                    con.keyval.val.func.body.exps.unshift({type:'code',text:`this[\"${bn}\"] = this[\"${bn}\"].bind(this)`})
                }
            }
            if (n.extends)
            {
                con.keyval.val.func.body.exps = ((_387_46_=con.keyval.val.func.body.exps) != null ? _387_46_ : [])
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
        var bind, m, name, con, _453_37_, ast

        bind = []
        var list = _k_.list(mthds)
        for (var _439_14_ = 0; _439_14_ < list.length; _439_14_++)
        {
            m = list[_439_14_]
            if (!m.keyval)
            {
                print.ast('not an method?',m)
                continue
            }
            if (!m.keyval.val.func)
            {
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
        var gi, _476_29_, _476_22_, s, args, _481_29_, _481_21_, str, ths, vs, v, t

        if (!n)
        {
            return ''
        }
        gi = this.ind()
        name = (name != null ? name : ((_476_29_=(n.name != null ? n.name.text : undefined)) != null ? _476_29_ : 'function'))
        s = name
        s += ' ('
        args = ((_481_21_=n.args) != null ? (_481_29_=_481_21_.parens) != null ? _481_29_.exps : undefined : undefined)
        if (args)
        {
            str = this.args(args)[0]
            ths = this.args(args)[1]

            s += str
        }
        s += ')\n'
        s += gi + '{'
        this.varstack.push(n.body.vars)
        if (!_k_.empty(n.body.vars))
        {
            s += '\n'
            vs = (function () { var result = []; var list = _k_.list(n.body.vars); for (var _493_31_ = 0; _493_31_ < list.length; _493_31_++)  { v = list[_493_31_];result.push(v.text)  } return result }).bind(this)().join(', ')
            s += this.indent + `var ${vs}\n`
        }
        var list1 = _k_.list(ths)
        for (var _496_14_ = 0; _496_14_ < list1.length; _496_14_++)
        {
            t = list1[_496_14_]
            s += '\n' + this.indent + ths
        }
        if (!_k_.empty(n.body.exps))
        {
            s += '\n'
            s += this.indent + this.nodes(n.body.exps,'\n' + this.indent)
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
        for (var _530_14_ = 0; _530_14_ < list.length; _530_14_++)
        {
            a = list[_530_14_]
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
        var first, last, gi, s, e, elif

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
        var list = _k_.list(n.then)
        for (var _610_14_ = 0; _610_14_ < list.length; _610_14_++)
        {
            e = list[_610_14_]
            s += this.indent + this.node(e) + '\n'
        }
        s += gi + "}"
        var list1 = _k_.list(n.elifs)
        for (var _614_17_ = 0; _614_17_ < list1.length; _614_17_++)
        {
            elif = list1[_614_17_]
            s += '\n'
            s += gi + `else if (${this.atom(elif.elif.cond)})\n`
            s += gi + "{\n"
            var list2 = _k_.list(elif.elif.then)
            for (var _618_18_ = 0; _618_18_ < list2.length; _618_18_++)
            {
                e = list2[_618_18_]
                s += this.indent + this.node(e) + '\n'
            }
            s += gi + "}"
        }
        if (n.else)
        {
            s += '\n'
            s += gi + 'else\n'
            s += gi + "{\n"
            var list3 = _k_.list(n.else)
            for (var _626_18_ = 0; _626_18_ < list3.length; _626_18_++)
            {
                e = list3[_626_18_]
                s += this.indent + this.node(e) + '\n'
            }
            s += gi + "}"
        }
        this.ded()
        return s
    }

    ifInline (n, dontClose)
    {
        var s, _644_17_, e

        s = ''
        s += `${this.atom(n.cond)} ? `
        if ((n.then != null ? n.then.length : undefined))
        {
            s += (function () { var result = []; var list = _k_.list(n.then); for (var _645_33_ = 0; _645_33_ < list.length; _645_33_++)  { e = list[_645_33_];result.push(this.atom(e))  } return result }).bind(this)().join(', ')
        }
        if (n.elifs)
        {
            var list1 = _k_.list(n.elifs)
            for (var _648_18_ = 0; _648_18_ < list1.length; _648_18_++)
            {
                e = list1[_648_18_]
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
                s += '(' + (function () { var result = []; var list2 = _k_.list(n.else); for (var _657_42_ = 0; _657_42_ < list2.length; _657_42_++)  { e = list2[_657_42_];result.push(this.atom(e))  } return result }).bind(this)().join(', ') + ')'
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
        var numArgs, _670_33_, i, fnc, _713_35_

        numArgs = (n.fnc.func.args != null ? n.fnc.func.args.parens.exps.length : undefined)
        i = this.indent
        if (numArgs === 1)
        {
            this.hint._k_.each_r = true
            this.ind()
            fnc = this.node(n.fnc)
            this.ded()
            return `${i}(function (o) {
${i}    var r = _k_.each_r(o)
${i}    for (var k in o)
${i}    {   
${i}        var m = (${fnc})(o[k])
${i}        if (m != null)
${i}        {
${i}            r[k] = m
${i}        }
${i}    }
${i}    return typeof o == 'string' ? r.join('') : r
${i}})(${this.node(n.lhs)})`
        }
        else if (numArgs)
        {
            this.hint._k_.each_r = true
            this.ind()
            fnc = this.node(n.fnc)
            this.ded()
            return `${i}(function (o) {
${i}    var r = _k_.each_r(o)
${i}    for (var k in o)
${i}    {   
${i}        var m = (${fnc})(k, o[k])
${i}        if (m != null && m[0] != null)
${i}        {
${i}            r[m[0]] = m[1]
${i}        }
${i}    }
${i}    return typeof o == 'string' ? r.join('') : r
${i}})(${this.node(n.lhs)})`
        }
        else
        {
            if ((n.fnc.func.body.exps != null ? n.fnc.func.body.exps.length : undefined) > 0)
            {
                this.hint._k_.each_r = true
                this.ind()
                fnc = this.node(n.fnc)
                this.ded()
                return `${i}(function (o) {
${i}    var r = _k_.each_r(o)
${i}    for (var k in o)
${i}    {   
${i}        var m = (${fnc})(o[k])
${i}        if (m != null)
${i}        {
${i}            r[k] = m
${i}        }
${i}    }
${i}    return typeof o == 'string' ? r.join('') : r
${i}})(${this.node(n.lhs)})
    `
            }
            else
            {
                return `${i}(function (o) { return o instanceof Array ? [] : typeof o == 'string' ? '' : {} })(${this.node(n.lhs)})`
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
        var list, _765_27_, gi, nl, eb, g2, listVar, iterVar, s, _787_28_, j, v, e, prefix, postfix

        if (!n.list.qmrkop && !n.list.array && !n.list.slice)
        {
            this.hint._k_.list = true
            list = `_k_.list(${this.atom(n.list)})`
        }
        else
        {
            if (((_765_27_=n.list.array) != null ? _765_27_.items[0] != null ? _765_27_.items[0].slice : undefined : undefined) || n.list.slice)
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
        var list1 = _k_.list(n.then)
        for (var _799_14_ = 0; _799_14_ < list1.length; _799_14_++)
        {
            e = list1[_799_14_]
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
        var slice, _816_46_, _816_28_, gi, nl, eb, g2, iterVar, _826_32_, iterStart, iterEnd, start, end, iterCmp, iterDir, s, e, prefix, postfix

        slice = ((_816_46_=((_816_28_=n.list.array) != null ? _816_28_.items[0] != null ? _816_28_.items[0].slice : undefined : undefined)) != null ? _816_46_ : n.list.slice)
        gi = lineBreak || this.ind()
        nl = lineBreak || '\n'
        eb = lineBreak && ';' || '\n'
        g2 = lineBreak ? '' : this.indent
        iterVar = ((_826_32_=n.vals.text) != null ? _826_32_ : n.vals[0].text)
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
        var list = _k_.list(n.then)
        for (var _845_14_ = 0; _845_14_ < list.length; _845_14_++)
        {
            e = list[_845_14_]
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
        var gi, nl, eb, g2, key, _867_26_, val, obj, s, e, prefix, postfix

        gi = lineBreak || this.ind()
        nl = lineBreak || '\n'
        eb = lineBreak && ';' || '\n'
        g2 = lineBreak ? '' : this.indent
        key = ((_867_26_=n.vals.text) != null ? _867_26_ : (n.vals[0] != null ? n.vals[0].text : undefined))
        val = (n.vals[1] != null ? n.vals[1].text : undefined)
        obj = this.node(n.list)
        s = ''
        s += `for (${varPrefix}${key} in ${obj})` + nl
        s += gi + "{" + nl
        if (val)
        {
            s += g2 + `${varPrefix}${val} = ${obj}[${key}]` + eb
        }
        var list = _k_.list(n.then)
        for (var _876_14_ = 0; _876_14_ < list.length; _876_14_++)
        {
            e = list[_876_14_]
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
        var gi, s, e

        gi = this.ind()
        s = ''
        s += `while (${this.node(n.cond)})\n`
        s += gi + "{\n"
        var list = _k_.list(n.then)
        for (var _914_14_ = 0; _914_14_ < list.length; _914_14_++)
        {
            e = list[_914_14_]
            s += this.indent + this.node(e) + '\n'
        }
        s += gi + "}"
        this.ded()
        return s
    }

    switch (n)
    {
        var gi, s, e

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
        var list = _k_.list(n.whens)
        for (var _938_14_ = 0; _938_14_ < list.length; _938_14_++)
        {
            e = list[_938_14_]
            s += gi + this.node(e) + '\n'
        }
        if (!_k_.empty(n.else))
        {
            s += this.indent + 'default:\n'
            var list1 = _k_.list(n.else)
            for (var _943_18_ = 0; _943_18_ < list1.length; _943_18_++)
            {
                e = list1[_943_18_]
                s += this.indent + '    ' + this.node(e) + '\n'
            }
        }
        s += gi + "}\n"
        this.ded()
        return s
    }

    when (n)
    {
        var s, e, i, gi

        if (!n.vals)
        {
            return console.error('when expected vals',n)
        }
        s = ''
        var list = _k_.list(n.vals)
        for (var _962_14_ = 0; _962_14_ < list.length; _962_14_++)
        {
            e = list[_962_14_]
            i = e !== n.vals[0] && this.indent || '    '
            s += i + 'case ' + this.node(e) + ':\n'
        }
        var list1 = _k_.list(n.then)
        for (var _965_14_ = 0; _965_14_ < list1.length; _965_14_++)
        {
            e = list1[_965_14_]
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
        var s, gi

        s = ''
        gi = this.ind()
        s += 'try\n'
        s += gi + '{\n'
        s += this.indent + this.nodes(n.exps,'\n' + this.indent)
        s += '\n'
        s += gi + '}'
        if (n.catch)
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

        s = tok.type === 'comment' ? this.comment(tok) : tok.type === 'this' ? 'this' : tok.type === 'triple' ? '`' + tok.text.slice(3, -3) + '`' : tok.type === 'bool' && tok.text === 'yes' ? 'true' : tok.type === 'bool' && tok.text === 'no' ? 'false' : tok.text
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
        var opmap, o, sep, ro, _1070_40_, _1070_29_, open, close, s, keyval, val, i, _1094_25_, _1094_64_, _1094_54_, _1094_43_, _1104_29_, _1104_18_, first, prfx, _1109_43_

        opmap = function (o)
        {
            var omp, _1063_19_

            omp = {and:'&&',or:'||',not:'!',empty:'_k_.empty',valid:'!_k_.empty','==':'===','!=':'!=='}
            return ((_1063_19_=omp[o]) != null ? _1063_19_ : o)
        }
        o = opmap(op.operator.text)
        sep = ' '
        if (!op.lhs || !op.rhs)
        {
            sep = ''
        }
        if (_k_.in(o,['<','<=','===','!==','>=','>']))
        {
            ro = opmap(((_1070_29_=op.rhs) != null ? (_1070_40_=_1070_29_.operation) != null ? _1070_40_.operator.text : undefined : undefined))
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
                for (var _1081_31_ = 0; _1081_31_ < list.length; _1081_31_++)
                {
                    keyval = list[_1081_31_]
                    s += `${keyval.text} = ${this.atom(op.rhs)}.${keyval.text}\n`
                }
                return s
            }
            if (op.lhs.array)
            {
                s = ''
                var list1 = _k_.list(op.lhs.array.items)
                for (var _1087_28_ = 0; _1087_28_ < list1.length; _1087_28_++)
                {
                    val = list1[_1087_28_]
                    i = op.lhs.array.items.indexOf(val)
                    s += (i && this.indent || '') + `${val.text} = ${this.atom(op.rhs)}[${i}]\n`
                }
                return s
            }
        }
        else if (o === '!')
        {
            if ((op.rhs != null ? op.rhs.incond : undefined) || ((_1094_43_=op.rhs) != null ? (_1094_54_=_1094_43_.operation) != null ? (_1094_64_=_1094_54_.operator) != null ? _1094_64_.text : undefined : undefined : undefined) === '=')
            {
                open = '('
                close = ')'
            }
        }
        else if (_k_.in(op.operator.text,['empty','valid']))
        {
            this.hint._k_.empty = true
            if (op.operator.text === 'valid')
            {
                this.hint._k_.valid = true
            }
            open = '('
            close = ')'
        }
        else if (((_1104_18_=op.rhs) != null ? (_1104_29_=_1104_18_.operation) != null ? _1104_29_.operator.text : undefined : undefined) === '=')
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
        this.hint._k_.in = true
        return `_k_.in(${this.atom(p.lhs)},${this.atom(p.rhs)})`
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
        var slice, from, _1176_32_, addOne, upto, _1180_32_, _1182_25_, _1182_54_, u, upper, _1198_27_, ni

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
        var _1228_41_, from, upto, x, o

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

    stripol (chunks)
    {
        var s, chunk, t, c

        s = '`'
        var list = _k_.list(chunks)
        for (var _1250_17_ = 0; _1250_17_ < list.length; _1250_17_++)
        {
            chunk = list[_1250_17_]
            t = chunk.text
            switch (chunk.type)
            {
                case 'open':
                    s += t + '${'
                    break
                case 'midl':
                    s += '}' + t + '${'
                    break
                case 'close':
                    s += '}' + t
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

    section (p)
    {
        var gi, s

        this.hint.section = true
        gi = this.ind()
        s = `module.exports[${p.title.text}] = function ()\n` + gi + '{\n' + this.indent + this.nodes(p.exps,'\n' + this.indent,true) + '\n' + gi + '}\n' + `module.exports[${p.title.text}]._section_ = true`
        this.ded()
        return s
    }

    subsect (p)
    {
        var gi, s

        gi = this.ind()
        s = `section(${p.title.text}, function ()\n` + gi + '{\n' + this.indent + this.nodes(p.exps,'\n' + this.indent) + '\n' + gi + '})'
        this.ded()
        return s
    }

    compare (p)
    {
        var s

        s = 'compare(' + this.node(p.lhs) + ',' + this.node(p.rhs) + ')'
        return s
    }

    freshVar (name, suffix = 0)
    {
        var vars, v

        var list = _k_.list(this.varstack)
        for (var _1317_17_ = 0; _1317_17_ < list.length; _1317_17_++)
        {
            vars = list[_1317_17_]
            var list1 = _k_.list(vars)
            for (var _1318_18_ = 0; _1318_18_ < list1.length; _1318_18_++)
            {
                v = list1[_1318_18_]
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
}

module.exports = Renderer