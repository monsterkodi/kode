// monsterkodi/kode 0.84.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, in: function (a,l) {return [].indexOf.call(l,a) >= 0}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var print

print = require('./print')
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
        var _36_21_, e

        if ((body != null ? (_36_21_=body.exps) != null ? _36_21_.length : undefined : undefined))
        {
            var list = _k_.list(body.exps)
            for (var _37_25_ = 0; _37_25_ < list.length; _37_25_++)
            {
                e = list[_37_25_]
                this.exp(e)
            }
        }
        return body
    }

    func (f)
    {
        var _50_23_, _50_17_, _52_21_, lst, ins

        if (f.args)
        {
            this.exp(f.args)
        }
        if (((_50_17_=f.body) != null ? (_50_23_=_50_17_.exps) != null ? _50_23_.length : undefined : undefined))
        {
            if (!(_k_.in((f.name != null ? f.name.text : undefined),['@','constructor'])))
            {
                lst = f.body.exps.slice(-1)[0]
                ins = (function ()
                {
                    return this.insert(f.body.exps)
                }).bind(this)
                if (_k_.in(lst.type,this.kode.atoms))
                {
                    ins()
                }
                else if (lst.call)
                {
                    if (!(_k_.in(lst.call.callee.text,['log','warn','error'])))
                    {
                        ins()
                    }
                }
                else if (lst.operation)
                {
                    ins()
                }
                else if (lst.func)
                {
                    ins()
                }
                else if (lst.array)
                {
                    ins()
                }
                else if (lst.prop)
                {
                    ins()
                }
                else if (lst.index)
                {
                    ins()
                }
                else if (lst.object)
                {
                    ins()
                }
                else if (lst.assert)
                {
                    ins()
                }
                else if (lst.stripol)
                {
                    ins()
                }
                else if (lst.qmrkop)
                {
                    ins()
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
        var ei

        e.returns = true
        this.insert(e.then)
        var list = _k_.list(e.elifs)
        for (var _89_15_ = 0; _89_15_ < list.length; _89_15_++)
        {
            ei = list[_89_15_]
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

        var list = _k_.list(e.whens)
        for (var _113_14_ = 0; _113_14_ < list.length; _113_14_++)
        {
            w = list[_113_14_]
            if (!_k_.empty(w.when.then))
            {
                this.insert(w.when.then)
            }
        }
        if (!_k_.empty(e.else))
        {
            return this.insert(e.else)
        }
    }

    insert (e)
    {
        var lst, _133_50_, _133_42_

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
            if (!(lst.return || _k_.in(((_133_42_=lst.call) != null ? (_133_50_=_133_42_.callee) != null ? _133_50_.text : undefined : undefined),['log','throw'])))
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
                var list = _k_.list(e)
                for (var _151_50_ = 0; _151_50_ < list.length; _151_50_++)
                {
                    v = list[_151_50_]
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
                                var list1 = _k_.list(val)
                                for (var _162_49_ = 0; _162_49_ < list1.length; _162_49_++)
                                {
                                    v = list1[_162_49_]
                                    this.exp(v)
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