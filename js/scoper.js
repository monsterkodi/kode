// monsterkodi/kode 0.146.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

class Scoper
{
    constructor (kode)
    {
        this.kode = kode
        this.verbose = this.kode.args.verbose
        this.debug = this.kode.args.debug
        this.raw = this.kode.args.raw
    }

    collect (tl)
    {
        this.maps = []
        this.args = []
        this.vars = []
        this.scope(tl)
        return tl
    }

    scope (body)
    {
        var e

        this.maps.push({})
        this.args.push({})
        this.vars.push(body.vars)
        var list = _k_.list(body.exps)
        for (var _44_21_ = 0; _44_21_ < list.length; _44_21_++)
        {
            e = list[_44_21_]
            this.exp(e)
        }
        this.maps.pop()
        this.args.pop()
        this.vars.pop()
        return body
    }

    func (f)
    {
        var arg, _62_25_, t, _65_42_, _65_37_, _68_74_, _68_69_, e, _70_30_

        this.maps.push({})
        this.args.push({})
        this.vars.push(f.body.vars)
        var list = _k_.list((f.args != null ? f.args.parens.exps : undefined))
        for (var _62_16_ = 0; _62_16_ < list.length; _62_16_++)
        {
            arg = list[_62_16_]
            if (t = arg.text)
            {
                this.args.slice(-1)[0][t] = t
            }
            else if (t = ((_65_37_=arg.operation) != null ? (_65_42_=_65_37_.lhs) != null ? _65_42_.text : undefined : undefined))
            {
                this.args.slice(-1)[0][t] = t
            }
            else
            {
                if (((_68_69_=arg.prop) != null ? (_68_74_=_68_69_.obj) != null ? _68_74_.text : undefined : undefined) !== '@')
                {
                    console.log('todo: scoper handle complex arg',arg)
                }
            }
        }
        var list1 = _k_.list((f.body != null ? f.body.exps : undefined))
        for (var _70_21_ = 0; _70_21_ < list1.length; _70_21_++)
        {
            e = list1[_70_21_]
            this.exp(e)
        }
        this.maps.pop()
        this.args.pop()
        this.vars.pop()
        return f
    }

    exp (e)
    {
        var insert, v, _104_34_, keyval, val, vals, _119_51_, _119_43_, key

        if (!e)
        {
            return
        }
        insert = (function (v, t)
        {
            var map, arg

            var list = _k_.list(this.maps)
            for (var _88_37_ = 0; _88_37_ < list.length; _88_37_++)
            {
                map = list[_88_37_]
                if (map[v])
                {
                    return
                }
            }
            var list1 = _k_.list(this.args)
            for (var _89_37_ = 0; _89_37_ < list1.length; _89_37_++)
            {
                arg = list1[_89_37_]
                if (arg[v])
                {
                    return
                }
            }
            this.verb(yellow(v),red(t))
            this.vars.slice(-1)[0].push({text:v,type:t})
            return this.maps.slice(-1)[0][v] = t
        }).bind(this)
        if (e.type)
        {
            if (e.type === 'code')
            {
                this.exp(e.exps)
            }
            return
        }
        else if (e instanceof Array)
        {
            if (e.length)
            {
                var list = _k_.list(e)
                for (var _100_46_ = 0; _100_46_ < list.length; _100_46_++)
                {
                    v = list[_100_46_]
                    this.exp(v)
                }
            }
        }
        else if (e instanceof Object)
        {
            if (e.operation && e.operation.operator.text === '=')
            {
                if ((e.operation.lhs != null ? e.operation.lhs.text : undefined))
                {
                    insert(e.operation.lhs.text,e.operation.operator.text)
                }
                else if (e.operation.lhs.object)
                {
                    var list1 = _k_.list(e.operation.lhs.object.keyvals)
                    for (var _107_31_ = 0; _107_31_ < list1.length; _107_31_++)
                    {
                        keyval = list1[_107_31_]
                        if (keyval.type === 'var')
                        {
                            insert(keyval.text,'curly')
                        }
                    }
                }
                else if (e.operation.lhs.array)
                {
                    var list2 = _k_.list(e.operation.lhs.array.items)
                    for (var _111_28_ = 0; _111_28_ < list2.length; _111_28_++)
                    {
                        val = list2[_111_28_]
                        if (val.type === 'var')
                        {
                            insert(val.text,'array')
                        }
                    }
                }
            }
            if (e.for)
            {
                if (e.for.vals.text)
                {
                    insert(e.for.vals.text,'for')
                }
                else
                {
                    vals = ((_119_51_=(e.for.vals.array != null ? e.for.vals.array.items : undefined)) != null ? _119_51_ : e.for.vals)
                    var list3 = _k_.list(vals)
                    for (var _120_26_ = 0; _120_26_ < list3.length; _120_26_++)
                    {
                        v = list3[_120_26_]
                        if (v.text)
                        {
                            insert(v.text,'for')
                        }
                    }
                }
            }
            if (e.assert)
            {
                this.verb('assert',e)
                if (e.assert.obj.type !== 'var' && !e.assert.obj.index)
                {
                    insert(`_${e.assert.qmrk.line}_${e.assert.qmrk.col}_`,'?.')
                }
            }
            if (e.qmrkop)
            {
                this.verb('qmrkop',e)
                if (e.qmrkop.lhs.type !== 'var')
                {
                    insert(`_${e.qmrkop.qmrk.line}_${e.qmrkop.qmrk.col}_`,' ? ')
                }
            }
            if (e.function)
            {
                insert(e.function.name.text)
            }
            if (e.func)
            {
                this.func(e.func)
            }
            else
            {
                for (key in e)
                {
                    val = e[key]
                    this.exp(val)
                }
            }
        }
        return
    }

    verb ()
    {
        if (this.verbose)
        {
            return console.log.apply(console.log,arguments)
        }
    }
}

module.exports = Scoper