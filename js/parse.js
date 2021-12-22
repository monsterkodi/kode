// monsterkodi/kode 0.193.0

var _k_ = {empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, valid: undefined}

var firstLineCol, kstr, lastLineCol, Parse, print

kstr = require('kstr')
print = require('./print')
firstLineCol = require('./utils').firstLineCol
lastLineCol = require('./utils').lastLineCol


Parse = (function ()
{
    function Parse (kode)
    {
        this.kode = kode
        this.debug = this.kode.args.debug
        this.verbose = this.kode.args.verbose
        this.raw = this.kode.args.raw
    }

    Parse.prototype["parse"] = function (block)
    {
        var ast

        this.stack = []
        this.sheap = []
        ast = []
        ast = ast.concat(this.exps('tl',block.tokens))
        if (this.raw)
        {
            print.noon('raw ast',ast)
        }
        return {vars:[],exps:ast}
    }

    Parse.prototype["exps"] = function (rule, tokens, stop)
    {
        var b, block, blocked, blockExps, colon, e, es, last, nl, numTokens, tok

        if (_k_.empty(tokens))
        {
            return
        }
        this.sheapPush('exps',rule)
        es = []
        while (tokens.length)
        {
            numTokens = tokens.length
            tok = tokens[0]
            b = ((function ()
            {
                switch (this.stack.slice(-1)[0])
                {
                    case '▸arg':
                        return es.length

                    case 'switch':
                    case 'if':
                    case 'then':
                    case '▸else':
                        return tok.text === 'else'

                    case '[':
                        return tok.text === ']'

                    case '{':
                        return _k_.in(tok.text,['}','->','=>','(','▸',':',']'])

                    case '(':
                        return tok.text === ')'

                    case '▸args':
                        return _k_.in(tok.text,[']',';','else','then'])

                    case '▸return':
                        return tok.text === 'if'

                    case 'call':
                        return _k_.in(tok.text,';')

                    case rule:
                        return tok.text === stop && tok.type !== 'var'

                    default:
                        return false
                }

            }).bind(this))()
            if (b)
            {
                this.verb(`exps break for ${tok.text} and stack top`,this.stack)
                break
            }
            if (stop && tok.text === stop && tok.type !== 'var')
            {
                this.verb(`exps break for ${tok.text} and stop`,stop)
                break
            }
            if (tok.type === 'block')
            {
                if (_k_.in(stop,['nl',';']))
                {
                    this.verb(`exps block start with stop ${stop} break!`)
                    break
                }
                block = tokens.shift()
                this.verb(`exps block start stop ${stop} block:`,block)
                blocked = true
                blockExps = this.exps('block',block.tokens)
                es = es.concat(blockExps)
                if (block.tokens.length)
                {
                    this.verb('exps block end remaining block tokens:',block.tokens.length)
                    if (this.debug)
                    {
                        print.tokens('before unshifting dangling block tokens',tokens)
                    }
                    while (block.tokens.length)
                    {
                        tokens.unshift(block.tokens.pop())
                    }
                    if (this.debug)
                    {
                        print.tokens('exps after unshifting dangling block tokens',tokens)
                    }
                }
                if ((tokens[0] != null ? tokens[0].text : undefined) === ',')
                {
                    this.verb("exps block end shift comma , and continue...")
                    tokens.shift()
                    continue
                }
                else if ((tokens[0] != null ? tokens[0].type : undefined) === 'nl' && (tokens[1] != null ? tokens[1].text : undefined) === ',')
                {
                    this.shiftNewline("exps block end nl comma , and continue...",tokens)
                    tokens.shift()
                    continue
                }
                this.verb('exps block end, break!')
                break
            }
            if (tok.text === ')')
            {
                this.verb('exps break on )')
                break
            }
            if (_k_.in(tok.text,['in','of']) && rule === 'for vals')
            {
                this.verb('exps break on in|of')
                break
            }
            if (tok.type === 'nl')
            {
                this.verb('exps nl stop:',stop,tok,this.stack)
                if (this.stack.slice(-1)[0] === '[' && (tokens[1] != null ? tokens[1].text : undefined) === ']')
                {
                    this.shiftNewline('exps nl ] in array',tokens)
                    break
                }
                if (stop)
                {
                    this.verb('exps nl with stop',stop)
                    if (_k_.in(this.stack.slice(-1)[0],['▸args','▸body','▸return','then','▸else']) || stop !== 'nl')
                    {
                        this.verb(`exps nl with stop '${stop}' in ${this.stack.slice(-1)[0]} (break, but don't shift nl)`)
                    }
                    else
                    {
                        this.shiftNewline(`exps nl with stop '${stop}'`,tokens)
                    }
                    break
                }
                nl = this.shiftNewline("exps nl (no stop) ...",tokens)
                if ((tokens[0] != null ? tokens[0].text : undefined) === '.' && (tokens[1] != null ? tokens[1].type : undefined) === 'var')
                {
                    console.log('exps nl next line starts with .var!',this.stack)
                    es.push(this.prop(es.pop(),tokens))
                }
                this.verb('exps nl continue...')
                continue
            }
            if (tok.text === ',')
            {
                if (_k_.in(this.stack.slice(-1)[0],['▸args']))
                {
                    this.verb('exps comma continues args ...')
                    tokens.shift()
                    if ((tokens[0] != null ? tokens[0].type : undefined) === 'block')
                    {
                        this.verb('exps comma followed by block ...')
                        tokens = tokens.shift().tokens
                    }
                    continue
                }
            }
            if (tok.text === ';' && (tokens[1] != null ? tokens[1].text : undefined) !== ':')
            {
                this.verb("exps shift semicolon ; and continue...")
                tokens.shift()
                continue
            }
            e = this.exp(tokens)
            last = lastLineCol(e)
            while ((_k_.in((tokens[0] != null ? tokens[0].text : undefined),['if','for','while']) && this.noThenAhead(tokens) && !(_k_.in(this.stack.slice(-1)[0],['▸args','▸return'])) && last.line === tokens[0].line))
            {
                if (!this.noThenAhead(tokens))
                {
                    console.log('then ahead!',tokens)
                }
                this.verb(`exps ${tokens[0].text}Tail`,e,this.stack)
                switch (tokens[0].text)
                {
                    case 'if':
                        e = this.ifTail(e,tokens.shift(),tokens)
                        break
                    case 'for':
                        e = this.forTail(e,tokens.shift(),tokens)
                        break
                    case 'while':
                        e = this.whileTail(e,tokens.shift(),tokens)
                        break
                }

            }
            if ((tokens[0] != null ? tokens[0].text : undefined) === '▸')
            {
                if (_k_.in(this.stack.slice(-1)[0],['▸args','{']))
                {
                    es.push(e)
                    break
                }
                else
                {
                    e = this.compare(e,tokens)
                }
            }
            es.push(e)
            if ((_k_.in((tokens[0] != null ? tokens[0].text : undefined),['if','then','for','while']) && tokens[0].col > last.col && es.length && !blocked && last.line === tokens[0].line))
            {
                this.verb('exps break on if|then|for|while')
                break
            }
            if ((tokens[0] != null ? tokens[0].text : undefined) === ';')
            {
                if (!(_k_.in(this.stack.slice(-1)[0],['▸args','when','{'])))
                {
                    this.verb('exps shift colon',this.stack)
                    colon = tokens.shift()
                }
                else
                {
                    this.verb('exps break on colon',this.stack)
                    break
                }
            }
            if (numTokens === tokens.length)
            {
                this.verb('exps no token consumed',tokens)
                break
            }
        }
        this.sheapPop('exps',rule)
        return es
    }

    Parse.prototype["exp"] = function (tokens)
    {
        var block, e, numTokens, tok, _268_34_, _326_33_

        if (_k_.empty(tokens))
        {
            return
        }
        tok = tokens.shift()
        if (this.debug)
        {
            console.log(Y5(w1((tok != null ? tok.text : undefined))))
        }
        switch (tok.type)
        {
            case 'block':
                print.tokens('ERROR: exp unexpected block',[tok].concat(tokens))
                return console.error("INTERNAL ERROR: unexpected block token in exp!")

            case 'nl':
                print.tokens('ERROR: exp unexpected nl',[tok].concat(tokens))
                return console.error("INTERNAL ERROR: unexpected nl token in exp!")

            case ';':
                print.tokens('ERROR: exp unexpected ;',[tok].concat(tokens))
                return console.error("INTERNAL ERROR: unexpected ; token in exp!")

            case 'section':
                return this.section(tok,tokens)

            case 'keyword':
                if (!(_k_.in((tokens[0] != null ? tokens[0].text : undefined),':')))
                {
                    switch (tok.text)
                    {
                        case 'return':
                            return this.return(tok,tokens)

                        case 'switch':
                            return this.switch(tok,tokens)

                        case 'class':
                            return this.class(tok,tokens)

                        case 'function':
                            return this.function(tok,tokens)

                        case 'while':
                            return this.while(tok,tokens)

                        case 'when':
                            return this.when(tok,tokens)

                        case 'try':
                            return this.try(tok,tokens)

                        case 'for':
                            return this.for(tok,tokens)

                        case 'if':
                            if (!(_k_.in(this.stack.slice(-1)[0],['▸return'])))
                            {
                                if (this.stack.length)
                                {
                                    this.verb('if',this.stack)
                                }
                                return this.if(tok,tokens)
                            }
                            break
                    }

                }
                break
            default:
                switch (tok.text)
            {
                case '->':
                case '=>':
                    if (!(_k_.in(this.stack.slice(-1)[0],['{'])))
                    {
                        return this.func(null,tok,tokens)
                    }
                    break
            }

        }

        this.sheapPush('exp',((_268_34_=tok.text) != null ? _268_34_ : tok.type))
        e = tok
        while (tokens.length)
        {
            numTokens = tokens.length
            e = this.rhs(e,tokens)
            if (this.verbose)
            {
                print.ast("rhs",e)
            }
            e = this.lhs(e,tokens)
            if (this.verbose)
            {
                print.ast("lhs",e)
            }
            if (_k_.in((tokens[0] != null ? tokens[0].text : undefined),';'))
            {
                this.verb('exp break on ;',(tokens[0] != null ? tokens[0].text : undefined))
                break
            }
            if (numTokens === tokens.length)
            {
                if (_k_.in((tokens[0] != null ? tokens[0].text : undefined),','))
                {
                    if (_k_.in(this.stack.slice(-1)[0],['▸args']))
                    {
                        this.verb('comma in args, break without shifting')
                        break
                    }
                    this.verb('exp shift comma')
                    tokens.shift()
                }
                if ((tokens[0] != null ? tokens[0].type : undefined) === 'block')
                {
                    if ((tokens[0].tokens[0] != null ? tokens[0].tokens[0].text : undefined) === '.')
                    {
                        this.verb('exp prop chain block! shift block and continue ...')
                        this.push('propchain' + tokens[0].tokens[0].col)
                        block = tokens.shift()
                        e = this.prop(e,block.tokens)
                        if (block.tokens.length)
                        {
                            this.verb('dangling prop chain tokens',block.tokens,this.stack.slice(-1)[0])
                            tokens = block.tokens
                            continue
                        }
                        break
                    }
                }
                if ((tokens[0] != null ? tokens[0].type : undefined) === 'nl')
                {
                    if ((tokens[1] != null ? tokens[1].text : undefined) === '.')
                    {
                        if (_k_.in(`propchain${(tokens[1] != null ? tokens[1].col : undefined)}`,this.stack.slice(0, -1)))
                        {
                            this.verb('exp higher level prop chain active! break!')
                            break
                        }
                        this.verb('exp prop chain block continues on next line! shift nl and continue ...')
                        this.shiftNewline('exp prop chain block continues',tokens)
                        continue
                    }
                }
                this.verb('exp no token consumed: break!',this.stack.slice(-1)[0])
                break
            }
        }
        if (this.verbose)
        {
            print.ast(`exp ${_k_.empty((this.stack)) ? 'DONE' : ''}`,e)
        }
        if ((this.stack.slice(-1)[0] != null ? this.stack.slice(-1)[0].startsWith('propchain') : undefined))
        {
            this.verb(`exp cleanup ${this.stack.slice(-1)[0]}`)
            this.pop(this.stack.slice(-1)[0])
        }
        this.sheapPop('exp',((_326_33_=tok.text) != null ? _326_33_ : tok.type))
        return e
    }

    Parse.prototype["rhs"] = function (e, tokens)
    {
        var llc, numTokens, nxt, spaced, unspaced, _387_22_

        this.sheapPush('rhs','rhs')
        while (nxt = tokens[0])
        {
            numTokens = tokens.length
            if (!e)
            {
                return console.error('no e?',nxt)
            }
            unspaced = (llc = lastLineCol(e)).col === nxt.col && llc.line === nxt.line
            spaced = !unspaced
            if (_k_.in(nxt.text,'({') && _k_.in(e.type,this.kode.literals))
            {
                break
            }
            if (nxt.text === '▸')
            {
                this.verb('rhs break for ▸')
                break
            }
            if (this.stack.slice(-1)[0] === '▸arg' && nxt.type === 'op')
            {
                this.verb('rhs break for ▸arg')
                break
            }
            if (nxt.text === ':' && _k_.in(this.stack.slice(-1)[0],['class']))
            {
                if (this.debug)
                {
                    print.tokens('rhs is class method',tokens.slice(0, 21))
                }
                e = this.keyval(e,tokens)
                break
            }
            else if (nxt.text === ':' && (unspaced || !(_k_.in('?',this.stack))))
            {
                if (this.stack.slice(-1)[0] !== '{')
                {
                    this.verb('rhs is first key of implicit object',e)
                    if (this.verbose)
                    {
                        print.tokens('rhs is first key of implicit object ...',tokens.slice(0, 21))
                    }
                    e = this.object(e,tokens)
                }
                else
                {
                    this.verb('rhs is key of (implicit) object',e)
                    e = this.keyval(e,tokens)
                }
            }
            else if (nxt.text === 'in' && this.stack.slice(-1)[0] !== 'for')
            {
                this.verb('incond',e,tokens)
                e = this.incond(e,tokens)
            }
            else if ((e.text != null))
            {
                if (e.text === '[')
                {
                    e = this.array(e,tokens)
                }
                else if (e.text === '(')
                {
                    e = this.parens(e,tokens)
                }
                else if (e.text === '{')
                {
                    e = this.curly(e,tokens)
                }
                else if (_k_.in(e.text,['not']) && (!(_k_.in(nxt.type,['op'])) || _k_.in(nxt.text,['++','--','+','-'])))
                {
                    e = this.operation(null,e,tokens)
                }
                else if (_k_.in(e.text,['delete','new','empty','valid','noon','copy','clone']) && (!(_k_.in(nxt.type,['op','nl'])) && !(_k_.in(nxt.text,',.}])'))))
                {
                    e = this.operation(null,e,tokens)
                }
                else if (_k_.in(e.text,['++','--']) && unspaced)
                {
                    this.verb('rhs increment')
                    e = this.operation(null,e,tokens)
                }
                else if (_k_.in(e.text,['+','-']) && unspaced)
                {
                    if (nxt.type === 'num')
                    {
                        this.verb('rhs +- num')
                        if (e.text === '-')
                        {
                            nxt.text = '-' + nxt.text
                            nxt.col -= 1
                        }
                        e = tokens.shift()
                    }
                    else
                    {
                        this.verb('rhs +- operation')
                        e = this.operation(null,e,tokens)
                    }
                }
                else if (_k_.in(nxt.text,['++','--']) && unspaced)
                {
                    if (!(_k_.in(e.type,['var'])))
                    {
                        return console.error('wrong rhs increment')
                    }
                    e = this.operation(e,tokens.shift())
                }
                else
                {
                    if (this.verbose)
                    {
                        print.tokens(`rhs no nxt match? break! stack:${this.stack} nxt:`,[nxt])
                    }
                    break
                }
            }
            else
            {
                if (_k_.in(nxt.text,['++','--']) && unspaced)
                {
                    e = this.operation(e,tokens.shift())
                    break
                }
                else if (this.stack.slice(-1)[0] === 'call' && nxt.text === ']')
                {
                    this.verb('rhs call array end')
                    break
                }
                else if (this.stack.slice(-1)[0] === '{' && nxt.text === '}')
                {
                    this.verb('rhs curly end')
                    break
                }
                else if (this.stack.slice(-1)[0] === '[' && nxt.text === ']')
                {
                    this.verb('rhs array end')
                    break
                }
                else
                {
                    if (this.verbose)
                    {
                        print.ast(`rhs no nxt match?? stack:${this.stack} e:`,e)
                        print.tokens("rhs no nxt match?? nxt:",nxt)
                    }
                    break
                }
            }
            if (numTokens === tokens.length)
            {
                this.verb('rhs no token consumed, break!')
                break
            }
        }
        this.sheapPop('rhs','rhs')
        return e
    }

    Parse.prototype["lhs"] = function (e, tokens)
    {
        var b, first, last, numTokens, nxt, spaced, unspaced

        this.sheapPush('lhs','lhs')
        while (nxt = tokens[0])
        {
            numTokens = tokens.length
            if (!e)
            {
                return console.error('no e?',nxt)
            }
            last = lastLineCol(e)
            first = firstLineCol(e)
            unspaced = last.col === nxt.col && last.line === nxt.line
            spaced = !unspaced
            b = ((function ()
            {
                switch (this.stack.slice(-1)[0])
                {
                    case '[':
                        return nxt.text === ']'

                    case '{':
                        return nxt.text === '}'

                }

            }).bind(this))()
            if (b)
            {
                break
            }
            if (e.text === '@')
            {
                if ((nxt.type === 'block' && this.stack.slice(-1)[0] === 'if' || (spaced && _k_.in(nxt.text,['then','if','then'])) || nxt.type === 'nl' || nxt.text === ','))
                {
                    break
                }
                else
                {
                    e = this.this(e,tokens)
                    break
                }
            }
            if (nxt.text === '.')
            {
                e = this.prop(e,tokens)
            }
            else if (nxt.type === 'dots' && !this.stack.slice(-1)[0].startsWith('op') && this.stack.slice(-1)[0] !== '(')
            {
                e = this.slice(e,tokens)
            }
            else if (nxt.text === 'each')
            {
                e = this.each(e,tokens)
            }
            else if (nxt.text === '?')
            {
                if (unspaced)
                {
                    e = this.assert(e,tokens)
                }
                else
                {
                    e = this.qmrkop(e,tokens)
                }
            }
            else if (nxt.text === ':' && e.qmrkop)
            {
                e = this.qmrkcolon(e.qmrkop,tokens)
            }
            else if ((nxt.type === 'op' && !(_k_.in(nxt.text,['++','--','+','-','not','noon','new','empty','valid'])) && !(_k_.in(e.text,['[','('])) && !(_k_.in('▸arg',this.stack))))
            {
                if ((this.stack.slice(-1)[0] != null ? this.stack.slice(-1)[0].startsWith('op' && this.stack.slice(-1)[0] !== 'op=') : undefined))
                {
                    this.verb('lhs stop on operation',e,nxt)
                    break
                }
                else if (_k_.in(this.stack.slice(-1)[0],['in?','opempty','opvalid']))
                {
                    this.verb(`lhs stop on ${this.stack.slice(-1)[0]}`,e,nxt)
                    break
                }
                else if (nxt.text === '▸')
                {
                    this.verb("lhs break on ▸")
                    break
                }
                else
                {
                    this.verb('lhs is lhs of op',e,nxt)
                    e = this.operation(e,tokens.shift(),tokens)
                }
            }
            else if ((_k_.in(nxt.text,['+','-']) && !(_k_.in(e.text,['[','('])) && spaced && (tokens[1] != null ? tokens[1].col : undefined) > nxt.col + nxt.text.length))
            {
                this.verb('lhs is lhs of +-\s',e,nxt)
                e = this.operation(e,tokens.shift(),tokens)
            }
            else if (nxt.type === 'func' && e.parens)
            {
                this.verb('lhs is args for func',e)
                e = this.func(e,tokens.shift(),tokens)
            }
            else if (nxt.text === '(' && unspaced)
            {
                this.verb('lhs is lhs of call')
                e = this.call(e,tokens)
            }
            else if (nxt.text === '[' && unspaced && (tokens[1] != null ? tokens[1].text : undefined) !== ']')
            {
                this.verb('lhs is lhs of index',e)
                e = this.index(e,tokens)
            }
            else if (nxt.text === 'not' && (tokens[1] != null ? tokens[1].text : undefined) === 'in')
            {
                e = {operation:{operator:tokens.shift(),rhs:this.incond(e,tokens)}}
            }
            else if ((spaced && (nxt.line === last.line || (nxt.col > first.col && !(_k_.in(this.stack.slice(-1)[0],['if'])))) && !(_k_.in(nxt.text,['then','else','break','continue','in','of','for','while'])) && (!(_k_.in(nxt.text,['if'])) || !this.noThenAhead(tokens)) && !(_k_.in(nxt.text,':)}]')) && !(_k_.in(nxt.type,['nl'])) && (nxt.type !== 'op' || _k_.in(nxt.text,['++','--','noon','new']) || _k_.in(nxt.text,['+','-']) && tokens[1].col === nxt.col + 1) && this.isSuitableForImplicitCall(e)))
            {
                this.verb('lhs is lhs of implicit call! e',e,this.stack.slice(-1)[0])
                this.verb('    is lhs of implicit call! nxt',nxt)
                this.verb('    is lhs first',first)
                e = this.call(e,tokens)
                break
            }
            else if (_k_.in(nxt.text,['+','-']) && !(_k_.in(e.text,['[','('])))
            {
                if (spaced && (tokens[1] != null ? tokens[1].col : undefined) === nxt.col + nxt.text.length)
                {
                    this.verb('lhs op is unbalanced +- break...',e,nxt,this.stack)
                    break
                }
                this.verb('lhs is lhs of +- op',e,nxt)
                e = this.operation(e,tokens.shift(),tokens)
            }
            else
            {
                if (this.verbose)
                {
                    print.tokens(`lhs no nxt match? break! stack:${this.stack} nxt:`,[nxt])
                }
                if (this.verbose)
                {
                    print.ast(`lhs no nxt match? break! stack:${this.stack}`,e)
                }
                if (nxt.type === 'block')
                {
                    if (this.isSuitableForImplicitCall(e) && this.stackAllowsBlockArg() && !(_k_.in((nxt.tokens[0] != null ? nxt.tokens[0].text : undefined),['then','when'])) && !(_k_.in(this.stack.slice(-1)[0],['if','then','for','while','switch','when','catch','in?','▸args','class','function','op+','op-','opis','opor','opand','op==','opnot','op<','op>'])))
                    {
                        this.verb('blocked call arg',this.stack,e,nxt)
                        e = this.call(e,tokens)
                    }
                }
                break
            }
            if (numTokens === tokens.length)
            {
                console.error('lhs no token consumed?')
                break
            }
        }
        this.sheapPop('lhs','lhs')
        return e
    }

    Parse.prototype["shiftClose"] = function (rule, text, tokens)
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

    Parse.prototype["shiftNewline"] = function (rule, tokens)
    {
        if (this.debug)
        {
            console.log(M3(y5(` ◂ ${w1(rule)}`)))
        }
        return tokens.shift()
    }

    Parse.prototype["shiftNewlineTok"] = function (rule, tokens, tok, cond)
    {
        if ((tokens[0] != null ? tokens[0].type : undefined) === 'nl' && cond)
        {
            if ((tokens[1] != null ? tokens[1].col : undefined) === tok.col)
            {
                return this.shiftNewline(rule,tokens)
            }
        }
    }

    Parse.prototype["nameMethods"] = function (mthds)
    {
        var m, name, _640_34_, _640_39_, _641_35_, _641_41_

        if ((mthds != null ? mthds.length : undefined))
        {
            var list = _k_.list(mthds)
            for (var _639_18_ = 0; _639_18_ < list.length; _639_18_++)
            {
                m = list[_639_18_]
                if (name = ((_640_34_=m.keyval) != null ? (_640_39_=_640_34_.key) != null ? _640_39_.text : undefined : undefined))
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

    Parse.prototype["then"] = function (id, tokens)
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

    Parse.prototype["block"] = function (id, tokens)
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

    Parse.prototype["subBlocks"] = function (tokens)
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

    Parse.prototype["isSuitableForImplicitCall"] = function (e)
    {
        return (!(_k_.in(e.type,this.kode.literals))) && (!(_k_.in(e.type,['punct','comment','op','section','test','func']))) && (!(_k_.in(e.text,['null','undefined','Infinity','NaN','if','then','else','for','while']))) && !e.array && !e.object && !e.keyval && !e.operation && !e.incond && !e.qmrkop
    }

    Parse.prototype["stackAllowsBlockArg"] = function ()
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

    Parse.prototype["noThenAhead"] = function (tokens)
    {
        var ti

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

    Parse.prototype["sheapPush"] = function (type, text)
    {
        this.sheap.push({type:type,text:text})
        if (this.debug)
        {
            return print.sheap(this.sheap)
        }
    }

    Parse.prototype["sheapPop"] = function (m, t)
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

    Parse.prototype["push"] = function (node)
    {
        if (this.debug)
        {
            print.stack(this.stack,node)
        }
        this.stack.push(node)
        return this.sheapPush('stack',node)
    }

    Parse.prototype["pop"] = function (n)
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

    Parse.prototype["verb"] = function ()
    {
        if (this.verbose)
        {
            return console.log.apply(console.log,arguments)
        }
    }

    return Parse
})()

module.exports = Parse