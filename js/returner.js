// monsterkodi/kode 0.50.0

var print

print = require('./print')
valid = require('./utils').valid


class Returner
{
    constructor (kode)
    {
        this.kode = kode
        this.verbose = this.kode.args.verbose
        this.debug = this.kode.args.debug
    }

    collect (tl)
    {
        return this.scope(tl)
    }

    scope (body)
    {
        var _37_21_, e

        if ((body != null ? (_37_21_=body.exps) != null ? _37_21_.length : undefined : undefined))
        {
            var list = (body.exps != null ? body.exps : [])
            for (var _38_25_ = 0; _38_25_ < list.length; _38_25_++)
            {
                e = list[_38_25_]
                this.exp(e)
            }
        }
        return body
    }

    func (f)
    {
        var _51_23_, _51_17_, _53_21_, lst, insert

        if (f.args)
        {
            this.exp(f.args)
        }
        if (((_51_17_=f.body) != null ? (_51_23_=_51_17_.exps) != null ? _51_23_.length : undefined : undefined))
        {
            if (!(['@','constructor'].indexOf((f.name != null ? f.name.text : undefined)) >= 0))
            {
                lst = f.body.exps.slice(-1)[0]
                insert = function ()
                {
                    return f.body.exps.push({return:{ret:{type:'keyword',text:'return'},val:f.body.exps.pop()}})
                }
                if (['var','num','single','double','triple'].indexOf(lst.type) >= 0)
                {
                    insert()
                }
                else if (lst.call)
                {
                    if (!(['log','warn','error'].indexOf(lst.call.callee.text) >= 0))
                    {
                        insert()
                    }
                }
                else if (lst.operation)
                {
                    insert()
                }
                else if (lst.func)
                {
                    insert()
                }
                else if (lst.array)
                {
                    insert()
                }
                else if (lst.prop)
                {
                    insert()
                }
                else if (lst.index)
                {
                    insert()
                }
                else if (lst.object)
                {
                    insert()
                }
                else if (lst.assert)
                {
                    insert()
                }
                else if (lst.stripol)
                {
                    insert()
                }
                else if (lst.qmrkop)
                {
                    insert()
                }
                else if (lst.return)
                {
                    null
                }
                else if (lst.while)
                {
                    null
                }
                else if (lst.for)
                {
                    null
                }
                else if (lst.if)
                {
                    this.if(lst.if)
                }
                else if (lst.try)
                {
                    this.try(lst.try)
                }
                else if (lst.switch)
                {
                    this.switch(lst.switch)
                }
                else
                {
                    console.log('todo: returner',Object.keys(lst)[0])
                }
            }
            return this.scope(f.body)
        }
    }

    if (e)
    {
        var ei, _94_26_

        e.returns = true
        this.insert(e.then)
        var list = ((_94_26_=e.elifs) != null ? _94_26_ : [])
        for (var _94_15_ = 0; _94_15_ < list.length; _94_15_++)
        {
            ei = list[_94_15_]
            if (ei.elif.then)
            {
                this.insert(ei.elif.then)
            }
        }
        if (e.else)
        {
            return this.insert(e.else)
        }
    }

    try (e)
    {
        this.insert(e.exps)
        if (e.finally)
        {
            return this.insert(e.finally)
        }
    }

    switch (e)
    {
        var w

        var list = (e.whens != null ? e.whens : [])
        for (var _118_14_ = 0; _118_14_ < list.length; _118_14_++)
        {
            w = list[_118_14_]
            if (valid(w.when.then))
            {
                this.insert(w.when.then)
            }
        }
        if (valid(e.else))
        {
            return this.insert(e.else)
        }
    }

    insert (e)
    {
        var lst, _138_50_, _138_42_

        if (e instanceof Array)
        {
            lst = e.slice(-1)[0]
            if (lst.if)
            {
                return this.if(lst.if)
            }
            if (lst.return)
            {
                return
            }
            if (lst.while)
            {
                return
            }
            if (lst.for)
            {
                return
            }
            if (!(lst.return || ((_138_42_=lst.call) != null ? (_138_50_=_138_42_.callee) != null ? _138_50_.text : undefined : undefined) === 'log'))
            {
                return e.push({return:{ret:{type:'keyword',text:'return'},val:e.pop()}})
            }
        }
    }

    exp (e)
    {
        var v, key, val, k

        if (!e)
        {
            return
        }
        if (e.type)
        {
            return
        }
        else if (e instanceof Array)
        {
            if (e.length)
            {
                var list = (e != null ? e : [])
                for (var _155_54_ = 0; _155_54_ < list.length; _155_54_++)
                {
                    v = list[_155_54_]
                    this.exp(v)
                }
            }
        }
        else if (e instanceof Object)
        {
            if (e.func)
            {
                return this.func(e.func)
            }
            else
            {
                for (key in e)
                {
                    val = e[key]
                    if (val)
                    {
                        if (val.type)
                        {
                            this.exp(val)
                        }
                        else
                        {
                            if (val instanceof Array)
                            {
                                if (val.length)
                                {
                                    var list1 = (val != null ? val : [])
                                    for (var _167_49_ = 0; _167_49_ < list1.length; _167_49_++)
                                    {
                                        v = list1[_167_49_]
                                        this.exp(v)
                                    }
                                }
                            }
                            else
                            {
                                for (k in val)
                                {
                                    v = val[k]
                                    this.exp(v)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    verb ()
    {
        if (this.verbose)
        {
            return console.log.apply(console.log,arguments)
        }
    }
}

module.exports = Returner