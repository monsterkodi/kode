// monsterkodi/kode 0.41.0


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
        this.vars = []
        this.scope(tl)
        return tl
    }

    scope (body)
    {
        var e, _42_34_

        this.maps.push({})
        this.vars.push(body.vars)
        var list = ((_42_34_=body.exps) != null ? _42_34_ : [])
        for (var _42_21_ = 0; _42_21_ < list.length; _42_21_++)
        {
            e = list[_42_21_]
            this.exp(e)
        }
        this.maps.pop()
        this.vars.pop()
        return body
    }

    exp (e)
    {
        var insert, v, _73_34_, keyval, val, vals, _89_51_, _89_43_, key

        if (!e)
        {
            return
        }
        insert = (function (v, t)
        {
            var map

            this.verb(yellow(v),red(t))
            var list = (this.maps != null ? this.maps : [])
            for (var _62_20_ = 0; _62_20_ < list.length; _62_20_++)
            {
                map = list[_62_20_]
                if (map[v])
                {
                    return
                }
            }
            this.vars.slice(-1)[0].push({text:v,type:t})
            return this.maps.slice(-1)[0][v] = t
        }).bind(this)
        if (e.type)
        {
            null
        }
        else if (e instanceof Array)
        {
            if (e.length)
            {
                var list = (e != null ? e : [])
                for (var _69_54_ = 0; _69_54_ < list.length; _69_54_++)
                {
                    v = list[_69_54_]
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
                    var list1 = (e.operation.lhs.object.keyvals != null ? e.operation.lhs.object.keyvals : [])
                    for (var _77_31_ = 0; _77_31_ < list1.length; _77_31_++)
                    {
                        keyval = list1[_77_31_]
                        if (keyval.type === 'var')
                        {
                            insert(keyval.text,'curly')
                        }
                    }
                }
                else if (e.operation.lhs.array)
                {
                    var list2 = (e.operation.lhs.array.items != null ? e.operation.lhs.array.items : [])
                    for (var _81_28_ = 0; _81_28_ < list2.length; _81_28_++)
                    {
                        val = list2[_81_28_]
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
                    vals = ((_89_51_=(e.for.vals.array != null ? e.for.vals.array.items : undefined)) != null ? _89_51_ : e.for.vals)
                    var list3 = (vals != null ? vals : [])
                    for (var _90_26_ = 0; _90_26_ < list3.length; _90_26_++)
                    {
                        v = list3[_90_26_]
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
            if (e.func)
            {
                if (e.func.args)
                {
                    this.exp(e.func.args)
                }
                if (e.func.body)
                {
                    this.scope(e.func.body)
                }
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