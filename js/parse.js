// monsterkodi/kode 0.44.0

var kstr, print, firstLineCol, lastLineCol, e

kstr = require('kstr')
print = require('./print')
empty = require('./utils').empty
valid = require('./utils').valid
firstLineCol = require('./utils').firstLineCol
lastLineCol = require('./utils').lastLineCol


class Parse
{
    constructor (kode)
    {
        this.kode = kode
        this.debug = this.kode.args.debug
        this.verbose = this.kode.args.verbose
        this.raw = this.kode.args.raw
    }

    parse (block)
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

    exps (rule, tokens, stop)
    {
        var es, numTokens, b, block, blocked, blockExps, nl, e, last, colon

        if (empty(tokens))
        {
            return
        }
        this.sheapPush('exps',rule)
        es = []
        while (tokens.length)
        {
            numTokens = tokens.length
            b = ((function ()
            {
                switch (this.stack.slice(-1)[0])
                {
                    case '▸arg':
                        return es.length

                    case 'if':
                    case 'switch':
                    case 'then':
                    case '▸else':
                        return tokens[0].text === 'else'

                    case '[':
                        return tokens[0].text === ']'

                    case '{':
                        return '}'.indexOf(tokens[0].text) >= 0

                    case '(':
                        return tokens[0].text === ')'

                    case '▸args':
                        return [']',';','else','then'].indexOf(tokens[0].text) >= 0

                    case '▸return':
                        return tokens[0].text === 'if'

                    case 'call':
                        return ';'.indexOf(tokens[0].text) >= 0

                    case rule:
                        return tokens[0].text === stop

                    default:
                        return false
                }

            }).bind(this))()
            if (b)
            {
                this.verb(`exps break for ${tokens[0].text} and stack top`,this.stack)
                break
            }
            if (stop && tokens[0].text === stop)
            {
                this.verb(`exps break for ${tokens[0].text} and stop`,stop())
                break
            }
            if (tokens[0].type === 'block')
            {
                if (['nl'].indexOf(stop) >= 0)
                {
                    this.verb(`exps block start with stop ${stop} break!`)
                    break
                }
                block = tokens.shift()
                this.verb(`exps block start stop:${stop} block:`,block)
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
            if (tokens[0].type === 'block')
            {
                this.verb('exps break on block')
                break
            }
            if (tokens[0].text === ')')
            {
                this.verb('exps break on )')
                break
            }
            if (['in','of'].indexOf(tokens[0].text) >= 0 && rule === 'for vals')
            {
                this.verb('exps break on in|of')
                break
            }
            if (tokens[0].type === 'nl')
            {
                this.verb('exps nl stop:',stop,tokens[0],this.stack)
                if (this.stack.slice(-1)[0] === '[' && (tokens[1] != null ? tokens[1].text : undefined) === ']')
                {
                    this.shiftNewline('exps nl ] in array',tokens)
                    break
                }
                if (stop)
                {
                    this.verb('exps nl with stop',stop)
                    if (['▸args','▸body','▸return','then','▸else'].indexOf(this.stack.slice(-1)[0]) >= 0 || stop !== 'nl')
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
                    console.log('exps nl next line starts with .var!')
                    es.push(this.prop(es.pop(),tokens))
                }
                this.verb('exps nl continue...')
                continue
            }
            e = this.exp(tokens)
            last = lastLineCol(e)
            while ((['if','for','while'].indexOf((tokens[0] != null ? tokens[0].text : undefined)) >= 0 && !(['▸args','▸return'].indexOf(this.stack.slice(-1)[0]) >= 0) && last.line === tokens[0].line))
            {
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
        es.push(e)
        if ((['if','then','for','while'].indexOf((tokens[0] != null ? tokens[0].text : undefined)) >= 0 && tokens[0].col > last.col && es.length && !blocked && last.line === tokens[0].line))
        {
            this.verb('exps break on if|then|for|while')
            break
        }
        if ((tokens[0] != null ? tokens[0].text : undefined) === ';')
        {
            if (!(['▸args','when','{'].indexOf(this.stack.slice(-1)[0]) >= 0))
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
        this.sheapPop('exps',rule)
        return es
    }

    exp (tokens)
    {
        var tok, _250_34_, e, numTokens, _280_33_

        if (empty(tokens))
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
                return console.error("INTERNAL ERROR: unexpected block token in exp!")

            case 'nl':
                return console.error("INTERNAL ERROR: unexpected nl token in exp!")

            case ';':
                return console.error("INTERNAL ERROR: unexpected ; token in exp!")

            case 'keyword':
                if (!(':'.indexOf((tokens[0] != null ? tokens[0].text : undefined)) >= 0))
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
                            if (!(['▸args','▸return'].indexOf(this.stack.slice(-1)[0]) >= 0))
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
                    return this.func(null,tok,tokens)

            }

        }

        this.sheapPush('exp',((_250_34_=tok.text) != null ? _250_34_ : tok.type))
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
            if (';'.indexOf((tokens[0] != null ? tokens[0].text : undefined)) >= 0)
            {
                this.verb('exp break on ;')
                break
            }
            if (numTokens === tokens.length)
            {
                if (','.indexOf((tokens[0] != null ? tokens[0].text : undefined)) >= 0)
                {
                    this.verb('exp shift comma')
                    tokens.shift()
                }
                this.verb('exp no token consumed: break!')
                break
            }
        }
        if (this.verbose)
        {
            print.ast(`exp ${empty(this.stack) ? 'DONE' : ''}`,e)
        }
        this.sheapPop('exp',((_280_33_=tok.text) != null ? _280_33_ : tok.type))
        return e
    }

    rhs (e, tokens)
    {
        var nxt, numTokens, unspaced, llc, spaced, e, _334_26_

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
            if ('({'.indexOf(nxt.text) >= 0 && ['single','double','triple','num','regex'].indexOf(e.type) >= 0)
            {
                break
            }
            if (this.stack.slice(-1)[0] === '▸arg' && nxt.type === 'op')
            {
                this.verb('rhs break for ▸arg')
                break
            }
            else if (nxt.text === ':' && ['class'].indexOf(this.stack.slice(-1)[0]) >= 0)
            {
                if (this.debug)
                {
                    print.tokens('rhs is class method',tokens.slice(0, 21))
                }
                e = this.keyval(e,tokens)
                break
            }
            else if (nxt.text === ':' && (unspaced || !(this.stack.indexOf('?') >= 0)))
            {
                if (this.stack.slice(-1)[0] !== '{')
                {
                    this.verb('rhs is first key of implicit object',e)
                    if (this.verbose)
                    {
                        print.tokens('rhs is first key of implicit object',tokens)
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
                else if (e.text === 'not')
                {
                    e = this.operation(null,e,tokens)
                }
                else if (['++','--'].indexOf(e.text) >= 0 && unspaced)
                {
                    this.verb('rhs increment')
                    e = this.operation(null,e,tokens)
                }
                else if (['+','-'].indexOf(e.text) >= 0 && unspaced)
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
                else if (['++','--'].indexOf(nxt.text) >= 0 && unspaced)
                {
                    if (!(['var'].indexOf(e.type) >= 0))
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
                if (['++','--'].indexOf(nxt.text) >= 0 && unspaced)
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
                else if (this.stack.slice(-1)[0] === '[' && nxt.text === ']')
                {
                    this.verb('rhs [ array end',nxt)
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

    lhs (e, tokens)
    {
        var nxt, numTokens, last, first, unspaced, spaced, b, e

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
                if (nxt.type === 'block' && this.stack.slice(-1)[0] === 'if' || (spaced && nxt.text === 'then') || nxt.type === 'nl')
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
            else if (nxt.type === 'dots' && !this.stack.slice(-1)[0].startsWith('op'))
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
            else if ((nxt.type === 'op' && !(['++','--','+','-','not'].indexOf(nxt.text) >= 0) && !(['[','('].indexOf(e.text) >= 0) && !(this.stack.indexOf('▸arg') >= 0)))
            {
            }
            if ((this.stack.slice(-1)[0] != null ? this.stack.slice(-1)[0].startsWith('op' && this.stack.slice(-1)[0] !== 'op=') : undefined))
            {
                this.verb('lhs stop on operation',e,nxt)
                break
            }
            else if (this.stack.slice(-1)[0] === 'in?')
            {
                this.verb('lhs stop on in?',e,nxt)
                break
            }
            else
            {
                this.verb('lhs is lhs of op',e,nxt)
                e = this.operation(e,tokens.shift(),tokens)
            }
        }
        if ((['+','-'].indexOf(nxt.text) >= 0 && !(['[','('].indexOf(e.text) >= 0) && spaced && (tokens[1] != null ? tokens[1].col : undefined) > nxt.col + nxt.text.length))
        {
            else
        }
        this.verb('lhs is lhs of +-\s',e,nxt)
        return e = this.operation(e,tokens.shift(),tokens)
    }
undefined
undefined
undefined
}

module.exports = Parse