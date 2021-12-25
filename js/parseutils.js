// monsterkodi/kode 0.227.0

var _k_ = {list: function (l) {return l != null ? typeof l.length === 'number' ? l : [] : []}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, valid: undefined}

var ParseUtils, print

print = require('./print')

ParseUtils = (function ()
{
    function ParseUtils ()
    {}

    ParseUtils.prototype["prepareCallAssign"] = function (rhs)
    {
        if ((rhs != null ? rhs.switch : undefined))
        {
            rhs = {call:{callee:{parens:{exps:[{func:{arrow:{text:'=>'},body:{vars:[],exps:[rhs]}}}]}}}}
        }
        if ((rhs != null ? rhs.if : undefined))
        {
            if (this.ifSuitableForInline(rhs))
            {
                rhs.if.inline = true
            }
            else
            {
                rhs = {call:{callee:{parens:{exps:[{func:{arrow:{text:'=>'},body:{vars:[],exps:[rhs]}}}]}}}}
            }
        }
        return rhs
    }

    ParseUtils.prototype["shiftClose"] = function (rule, text, tokens)
    {
        if ((tokens[0] != null ? tokens[0].text : undefined) === text)
        {
            return tokens.shift()
        }
        if ((tokens[0] != null ? tokens[0].type : undefined) === 'nl' && (tokens[1] != null ? tokens[1].text : undefined) === text)
        {
            this.shiftNewline(rule,tokens)
            return tokens.shift()
        }
        console.error(`parse.shiftClose: '${rule}' expected closing '${text}'`)
        return print.tokens(`shiftClose missing close '${text}'`,tokens)
    }

    ParseUtils.prototype["shiftNewline"] = function (rule, tokens)
    {
        if (this.debug)
        {
            console.log(M3(y5(` ◂ ${w1(rule)}`)))
        }
        return tokens.shift()
    }

    ParseUtils.prototype["shiftNewlineTok"] = function (rule, tokens, tok, cond)
    {
        if ((tokens[0] != null ? tokens[0].type : undefined) === 'nl' && cond)
        {
            if ((tokens[1] != null ? tokens[1].col : undefined) === tok.col)
            {
                return this.shiftNewline(rule,tokens)
            }
        }
    }

    ParseUtils.prototype["nameMethods"] = function (mthds)
    {
        var m, name, _106_34_, _106_39_, _107_35_, _107_41_

        if ((mthds != null ? mthds.length : undefined))
        {
            var list = _k_.list(mthds)
            for (var _105_18_ = 0; _105_18_ < list.length; _105_18_++)
            {
                m = list[_105_18_]
                if (name = ((_106_34_=m.keyval) != null ? (_106_39_=_106_34_.key) != null ? _106_39_.text : undefined : undefined))
                {
                    if (((m.keyval.val != null ? m.keyval.val.func : undefined) != null))
                    {
                        m.keyval.val.func.name = {type:'name',text:name}
                    }
                }
            }
        }
        return mthds
    }

    ParseUtils.prototype["then"] = function (id, tokens)
    {
        var block, thn

        if ((tokens[0] != null ? tokens[0].text : undefined) === 'then')
        {
            tokens.shift()
            if (_k_.in((tokens[0] != null ? tokens[0].type : undefined),['block','nl']))
            {
                this.verb('empty then!')
                thn = []
            }
            else
            {
                this.push('then')
                thn = this.exps(id,tokens,'nl')
                this.pop('then')
            }
        }
        else if ((tokens[0] != null ? tokens[0].type : undefined) === 'block')
        {
            block = tokens.shift()
            this.push('then')
            thn = this.exps(id,block.tokens)
            this.pop('then')
            if (block.tokens.length)
            {
                if (this.debug)
                {
                    print.tokens('then: dangling block tokens',tokens)
                }
                while (block.tokens.length)
                {
                    this.verb('unshift',block.tokens.slice(-1)[0])
                    tokens.unshift(block.tokens.pop())
                }
                print.tokens('then after unshifting dangling block tokens',tokens)
            }
        }
        else
        {
            this.verb(`no then and no block after ${id}!`)
        }
        return thn
    }

    ParseUtils.prototype["block"] = function (id, tokens)
    {
        var block, exps, nl, origTokens

        if ((tokens[0] != null ? tokens[0].type : undefined) === 'block')
        {
            origTokens = tokens
            block = tokens.shift()
            tokens = block.tokens
            nl = null
        }
        else
        {
            nl = 'nl'
        }
        this.push('▸' + id)
        exps = this.exps(id,tokens,nl)
        this.pop('▸' + id)
        if (block && block.tokens.length)
        {
            if (this.debug)
            {
                print.tokens('dangling block tokens',tokens)
            }
            while (block.tokens.length)
            {
                this.verb('unshift',block.tokens.slice(-1)[0])
                origTokens.unshift(block.tokens.pop())
            }
            if (this.debug)
            {
                print.tokens('block after unshifting dangling block tokens',origTokens)
            }
        }
        return exps
    }

    ParseUtils.prototype["subBlocks"] = function (tokens)
    {
        var elseTokens, subbs, t

        subbs = [[]]
        if (tokens.slice(-1)[0].type === 'block' && tokens.slice(-1)[0].tokens[0].text === 'then')
        {
            elseTokens = tokens.pop().tokens
            elseTokens[0].text = 'else'
        }
        if ((tokens[0] != null ? tokens[0].text : undefined) === 'then')
        {
            tokens[0].text = 'else'
            return [tokens]
        }
        while (!_k_.empty(tokens))
        {
            t = tokens.shift()
            if (t.type === 'nl')
            {
                if (_k_.in((tokens[0] != null ? tokens[0].text : undefined),')}]'))
                {
                    subbs.slice(-1)[0].push(t)
                }
                else
                {
                    subbs.push([])
                    if ((tokens[0] != null ? tokens[0].text : undefined) === 'then')
                    {
                        tokens[0].text = 'else'
                    }
                }
            }
            else
            {
                subbs.slice(-1)[0].push(t)
            }
        }
        if (elseTokens)
        {
            subbs.push(elseTokens)
        }
        return subbs
    }

    ParseUtils.prototype["isSuitableForImplicitCall"] = function (e)
    {
        return (!(_k_.in(e.type,this.kode.literals))) && (!(_k_.in(e.type,['punct','comment','op','section','test','func']))) && (!(_k_.in(e.text,['null','undefined','Infinity','NaN','if','then','else','for','while']))) && !e.array && !e.object && !e.keyval && !e.operation && !e.incond && !e.qmrkop
    }

    ParseUtils.prototype["ifSuitableForInline"] = function (e)
    {
        var ei, _255_24_, _256_24_, _257_24_, _258_24_, _263_26_, _264_26_

        if (e.if)
        {
            if ((e.if.then != null ? e.if.then.length : undefined) > 1)
            {
                return false
            }
            if ((e.if.then != null ? e.if.then[0].if : undefined))
            {
                if (!this.ifSuitableForInline(e.if.then[0]))
                {
                    return false
                }
            }
            if ((e.if.else != null ? e.if.else.length : undefined) > 1)
            {
                return false
            }
            if ((e.if.else != null ? e.if.else[0].if : undefined))
            {
                if (!this.ifSuitableForInline(e.if.else[0]))
                {
                    return false
                }
            }
            var list = _k_.list(e.if.elifs)
            for (var _259_19_ = 0; _259_19_ < list.length; _259_19_++)
            {
                ei = list[_259_19_]
                if (!this.ifSuitableForInline(ei))
                {
                    return false
                }
            }
            return true
        }
        if (e.elif)
        {
            if ((e.elif.then != null ? e.elif.then.length : undefined) > 1)
            {
                return false
            }
            if ((e.elif.then != null ? e.elif.then[0].if : undefined))
            {
                if (!this.ifSuitableForInline(e.elif.then[0]))
                {
                    return false
                }
            }
            return true
        }
        return false
    }

    ParseUtils.prototype["stackAllowsBlockArg"] = function ()
    {
        var s

        s = this.stack.filter(function (s)
        {
            return _k_.in(s,['if','for','while','then','class','function','{',':','switch','when','▸body','try','catch'])
        })
        if (_k_.empty(s))
        {
            return true
        }
        if (_k_.in(s.slice(-1)[0],['then','▸body']))
        {
            return true
        }
        return false
    }

    ParseUtils.prototype["noThenAhead"] = function (tokens)
    {
        var ti

        if ((tokens[1] != null ? tokens[1].type : undefined) === 'block')
        {
            return false
        }
        ti = 0
        while (++ti < tokens.length)
        {
            if (tokens[ti].text === 'then')
            {
                if (tokens[ti].col > tokens[ti - 1].col + tokens[ti - 1].text.length)
                {
                    return false
                }
            }
            if (_k_.in(tokens[ti].type,['nl','block']))
            {
                return true
            }
        }
        return true
    }

    ParseUtils.prototype["sheapPush"] = function (type, text)
    {
        this.sheap.push({type:type,text:text})
        if (this.debug)
        {
            return print.sheap(this.sheap)
        }
    }

    ParseUtils.prototype["sheapPop"] = function (m, t)
    {
        var popped

        popped = this.sheap.pop()
        if (popped.text !== t && popped.text !== kstr.strip(t,"'"))
        {
            console.error('wrong pop?',popped.text,t)
        }
        if (this.debug)
        {
            return print.sheap(this.sheap,popped)
        }
    }

    ParseUtils.prototype["push"] = function (node)
    {
        if (this.debug)
        {
            print.stack(this.stack,node)
        }
        this.stack.push(node)
        return this.sheapPush('stack',node)
    }

    ParseUtils.prototype["pop"] = function (n)
    {
        var p

        p = this.stack.pop()
        this.sheapPop('stack',p)
        if (p !== n)
        {
            console.error("unexpected pop!",p,n)
        }
        if (this.debug)
        {
            return print.stack(this.stack,p,function (s)
            {
                return W1(w1(s))
            })
        }
    }

    ParseUtils.prototype["verb"] = function ()
    {
        if (this.verbose)
        {
            return console.log.apply(console.log,arguments)
        }
    }

    return ParseUtils
})()

module.exports = ParseUtils