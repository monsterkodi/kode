// monsterkodi/kode 0.233.0

var _k_ = {extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, kolor: { f:(r,g,b)=>'\x1b[38;5;'+(16+36*r+6*g+b)+'m', F:(r,g,b)=>'\x1b[48;5;'+(16+36*r+6*g+b)+'m', r:(i)=>(i<6)&&_k_.kolor.f(i,0,0)||_k_.kolor.f(5,i-5,i-5), R:(i)=>(i<6)&&_k_.kolor.F(i,0,0)||_k_.kolor.F(5,i-5,i-5), g:(i)=>(i<6)&&_k_.kolor.f(0,i,0)||_k_.kolor.f(i-5,5,i-5), G:(i)=>(i<6)&&_k_.kolor.F(0,i,0)||_k_.kolor.F(i-5,5,i-5), b:(i)=>(i<6)&&_k_.kolor.f(0,0,i)||_k_.kolor.f(i-5,i-5,5), B:(i)=>(i<6)&&_k_.kolor.F(0,0,i)||_k_.kolor.F(i-5,i-5,5), y:(i)=>(i<6)&&_k_.kolor.f(i,i,0)||_k_.kolor.f(5,5,i-5), Y:(i)=>(i<6)&&_k_.kolor.F(i,i,0)||_k_.kolor.F(5,5,i-5), m:(i)=>(i<6)&&_k_.kolor.f(i,0,i)||_k_.kolor.f(5,i-5,5), M:(i)=>(i<6)&&_k_.kolor.F(i,0,i)||_k_.kolor.F(5,i-5,5), c:(i)=>(i<6)&&_k_.kolor.f(0,i,i)||_k_.kolor.f(i-5,5,5), C:(i)=>(i<6)&&_k_.kolor.F(0,i,i)||_k_.kolor.F(i-5,5,5), w:(i)=>'\x1b[38;5;'+(232+(i-1)*3)+'m', W:(i)=>'\x1b[48;5;'+(232+(i-1)*3+2)+'m', wrap: function (open, close, reg) { return function (s) { return open + (~(s += '').indexOf(close,4) && s.replace(reg,open) || s) + close } }, F256: function (open) { return _k_.kolor.wrap(open,'\x1b[39m',new RegExp('\\x1b\\[39m','g')) }, B256: function (open) { return _k_.kolor.wrap(open,'\x1b[49m',new RegExp('\\x1b\\[49m','g')) }}};_k_.r1=_k_.kolor.F256(_k_.kolor.r(1));_k_.R1=_k_.kolor.B256(_k_.kolor.R(1));_k_.Rr1=s=>_k_.R1(_k_.r8(s));_k_.r2=_k_.kolor.F256(_k_.kolor.r(2));_k_.R2=_k_.kolor.B256(_k_.kolor.R(2));_k_.Rr2=s=>_k_.R2(_k_.r7(s));_k_.r3=_k_.kolor.F256(_k_.kolor.r(3));_k_.R3=_k_.kolor.B256(_k_.kolor.R(3));_k_.Rr3=s=>_k_.R3(_k_.r6(s));_k_.r4=_k_.kolor.F256(_k_.kolor.r(4));_k_.R4=_k_.kolor.B256(_k_.kolor.R(4));_k_.Rr4=s=>_k_.R4(_k_.r5(s));_k_.r5=_k_.kolor.F256(_k_.kolor.r(5));_k_.R5=_k_.kolor.B256(_k_.kolor.R(5));_k_.Rr5=s=>_k_.R5(_k_.r4(s));_k_.r6=_k_.kolor.F256(_k_.kolor.r(6));_k_.R6=_k_.kolor.B256(_k_.kolor.R(6));_k_.Rr6=s=>_k_.R6(_k_.r3(s));_k_.r7=_k_.kolor.F256(_k_.kolor.r(7));_k_.R7=_k_.kolor.B256(_k_.kolor.R(7));_k_.Rr7=s=>_k_.R7(_k_.r2(s));_k_.r8=_k_.kolor.F256(_k_.kolor.r(8));_k_.R8=_k_.kolor.B256(_k_.kolor.R(8));_k_.Rr8=s=>_k_.R8(_k_.r1(s));_k_.g1=_k_.kolor.F256(_k_.kolor.g(1));_k_.G1=_k_.kolor.B256(_k_.kolor.G(1));_k_.Gg1=s=>_k_.G1(_k_.g8(s));_k_.g2=_k_.kolor.F256(_k_.kolor.g(2));_k_.G2=_k_.kolor.B256(_k_.kolor.G(2));_k_.Gg2=s=>_k_.G2(_k_.g7(s));_k_.g3=_k_.kolor.F256(_k_.kolor.g(3));_k_.G3=_k_.kolor.B256(_k_.kolor.G(3));_k_.Gg3=s=>_k_.G3(_k_.g6(s));_k_.g4=_k_.kolor.F256(_k_.kolor.g(4));_k_.G4=_k_.kolor.B256(_k_.kolor.G(4));_k_.Gg4=s=>_k_.G4(_k_.g5(s));_k_.g5=_k_.kolor.F256(_k_.kolor.g(5));_k_.G5=_k_.kolor.B256(_k_.kolor.G(5));_k_.Gg5=s=>_k_.G5(_k_.g4(s));_k_.g6=_k_.kolor.F256(_k_.kolor.g(6));_k_.G6=_k_.kolor.B256(_k_.kolor.G(6));_k_.Gg6=s=>_k_.G6(_k_.g3(s));_k_.g7=_k_.kolor.F256(_k_.kolor.g(7));_k_.G7=_k_.kolor.B256(_k_.kolor.G(7));_k_.Gg7=s=>_k_.G7(_k_.g2(s));_k_.g8=_k_.kolor.F256(_k_.kolor.g(8));_k_.G8=_k_.kolor.B256(_k_.kolor.G(8));_k_.Gg8=s=>_k_.G8(_k_.g1(s));_k_.b1=_k_.kolor.F256(_k_.kolor.b(1));_k_.B1=_k_.kolor.B256(_k_.kolor.B(1));_k_.Bb1=s=>_k_.B1(_k_.b8(s));_k_.b2=_k_.kolor.F256(_k_.kolor.b(2));_k_.B2=_k_.kolor.B256(_k_.kolor.B(2));_k_.Bb2=s=>_k_.B2(_k_.b7(s));_k_.b3=_k_.kolor.F256(_k_.kolor.b(3));_k_.B3=_k_.kolor.B256(_k_.kolor.B(3));_k_.Bb3=s=>_k_.B3(_k_.b6(s));_k_.b4=_k_.kolor.F256(_k_.kolor.b(4));_k_.B4=_k_.kolor.B256(_k_.kolor.B(4));_k_.Bb4=s=>_k_.B4(_k_.b5(s));_k_.b5=_k_.kolor.F256(_k_.kolor.b(5));_k_.B5=_k_.kolor.B256(_k_.kolor.B(5));_k_.Bb5=s=>_k_.B5(_k_.b4(s));_k_.b6=_k_.kolor.F256(_k_.kolor.b(6));_k_.B6=_k_.kolor.B256(_k_.kolor.B(6));_k_.Bb6=s=>_k_.B6(_k_.b3(s));_k_.b7=_k_.kolor.F256(_k_.kolor.b(7));_k_.B7=_k_.kolor.B256(_k_.kolor.B(7));_k_.Bb7=s=>_k_.B7(_k_.b2(s));_k_.b8=_k_.kolor.F256(_k_.kolor.b(8));_k_.B8=_k_.kolor.B256(_k_.kolor.B(8));_k_.Bb8=s=>_k_.B8(_k_.b1(s));_k_.c1=_k_.kolor.F256(_k_.kolor.c(1));_k_.C1=_k_.kolor.B256(_k_.kolor.C(1));_k_.Cc1=s=>_k_.C1(_k_.c8(s));_k_.c2=_k_.kolor.F256(_k_.kolor.c(2));_k_.C2=_k_.kolor.B256(_k_.kolor.C(2));_k_.Cc2=s=>_k_.C2(_k_.c7(s));_k_.c3=_k_.kolor.F256(_k_.kolor.c(3));_k_.C3=_k_.kolor.B256(_k_.kolor.C(3));_k_.Cc3=s=>_k_.C3(_k_.c6(s));_k_.c4=_k_.kolor.F256(_k_.kolor.c(4));_k_.C4=_k_.kolor.B256(_k_.kolor.C(4));_k_.Cc4=s=>_k_.C4(_k_.c5(s));_k_.c5=_k_.kolor.F256(_k_.kolor.c(5));_k_.C5=_k_.kolor.B256(_k_.kolor.C(5));_k_.Cc5=s=>_k_.C5(_k_.c4(s));_k_.c6=_k_.kolor.F256(_k_.kolor.c(6));_k_.C6=_k_.kolor.B256(_k_.kolor.C(6));_k_.Cc6=s=>_k_.C6(_k_.c3(s));_k_.c7=_k_.kolor.F256(_k_.kolor.c(7));_k_.C7=_k_.kolor.B256(_k_.kolor.C(7));_k_.Cc7=s=>_k_.C7(_k_.c2(s));_k_.c8=_k_.kolor.F256(_k_.kolor.c(8));_k_.C8=_k_.kolor.B256(_k_.kolor.C(8));_k_.Cc8=s=>_k_.C8(_k_.c1(s));_k_.m1=_k_.kolor.F256(_k_.kolor.m(1));_k_.M1=_k_.kolor.B256(_k_.kolor.M(1));_k_.Mm1=s=>_k_.M1(_k_.m8(s));_k_.m2=_k_.kolor.F256(_k_.kolor.m(2));_k_.M2=_k_.kolor.B256(_k_.kolor.M(2));_k_.Mm2=s=>_k_.M2(_k_.m7(s));_k_.m3=_k_.kolor.F256(_k_.kolor.m(3));_k_.M3=_k_.kolor.B256(_k_.kolor.M(3));_k_.Mm3=s=>_k_.M3(_k_.m6(s));_k_.m4=_k_.kolor.F256(_k_.kolor.m(4));_k_.M4=_k_.kolor.B256(_k_.kolor.M(4));_k_.Mm4=s=>_k_.M4(_k_.m5(s));_k_.m5=_k_.kolor.F256(_k_.kolor.m(5));_k_.M5=_k_.kolor.B256(_k_.kolor.M(5));_k_.Mm5=s=>_k_.M5(_k_.m4(s));_k_.m6=_k_.kolor.F256(_k_.kolor.m(6));_k_.M6=_k_.kolor.B256(_k_.kolor.M(6));_k_.Mm6=s=>_k_.M6(_k_.m3(s));_k_.m7=_k_.kolor.F256(_k_.kolor.m(7));_k_.M7=_k_.kolor.B256(_k_.kolor.M(7));_k_.Mm7=s=>_k_.M7(_k_.m2(s));_k_.m8=_k_.kolor.F256(_k_.kolor.m(8));_k_.M8=_k_.kolor.B256(_k_.kolor.M(8));_k_.Mm8=s=>_k_.M8(_k_.m1(s));_k_.y1=_k_.kolor.F256(_k_.kolor.y(1));_k_.Y1=_k_.kolor.B256(_k_.kolor.Y(1));_k_.Yy1=s=>_k_.Y1(_k_.y8(s));_k_.y2=_k_.kolor.F256(_k_.kolor.y(2));_k_.Y2=_k_.kolor.B256(_k_.kolor.Y(2));_k_.Yy2=s=>_k_.Y2(_k_.y7(s));_k_.y3=_k_.kolor.F256(_k_.kolor.y(3));_k_.Y3=_k_.kolor.B256(_k_.kolor.Y(3));_k_.Yy3=s=>_k_.Y3(_k_.y6(s));_k_.y4=_k_.kolor.F256(_k_.kolor.y(4));_k_.Y4=_k_.kolor.B256(_k_.kolor.Y(4));_k_.Yy4=s=>_k_.Y4(_k_.y5(s));_k_.y5=_k_.kolor.F256(_k_.kolor.y(5));_k_.Y5=_k_.kolor.B256(_k_.kolor.Y(5));_k_.Yy5=s=>_k_.Y5(_k_.y4(s));_k_.y6=_k_.kolor.F256(_k_.kolor.y(6));_k_.Y6=_k_.kolor.B256(_k_.kolor.Y(6));_k_.Yy6=s=>_k_.Y6(_k_.y3(s));_k_.y7=_k_.kolor.F256(_k_.kolor.y(7));_k_.Y7=_k_.kolor.B256(_k_.kolor.Y(7));_k_.Yy7=s=>_k_.Y7(_k_.y2(s));_k_.y8=_k_.kolor.F256(_k_.kolor.y(8));_k_.Y8=_k_.kolor.B256(_k_.kolor.Y(8));_k_.Yy8=s=>_k_.Y8(_k_.y1(s));_k_.w1=_k_.kolor.F256(_k_.kolor.w(1));_k_.W1=_k_.kolor.B256(_k_.kolor.W(1));_k_.Ww1=s=>_k_.W1(_k_.w8(s));_k_.w2=_k_.kolor.F256(_k_.kolor.w(2));_k_.W2=_k_.kolor.B256(_k_.kolor.W(2));_k_.Ww2=s=>_k_.W2(_k_.w7(s));_k_.w3=_k_.kolor.F256(_k_.kolor.w(3));_k_.W3=_k_.kolor.B256(_k_.kolor.W(3));_k_.Ww3=s=>_k_.W3(_k_.w6(s));_k_.w4=_k_.kolor.F256(_k_.kolor.w(4));_k_.W4=_k_.kolor.B256(_k_.kolor.W(4));_k_.Ww4=s=>_k_.W4(_k_.w5(s));_k_.w5=_k_.kolor.F256(_k_.kolor.w(5));_k_.W5=_k_.kolor.B256(_k_.kolor.W(5));_k_.Ww5=s=>_k_.W5(_k_.w4(s));_k_.w6=_k_.kolor.F256(_k_.kolor.w(6));_k_.W6=_k_.kolor.B256(_k_.kolor.W(6));_k_.Ww6=s=>_k_.W6(_k_.w3(s));_k_.w7=_k_.kolor.F256(_k_.kolor.w(7));_k_.W7=_k_.kolor.B256(_k_.kolor.W(7));_k_.Ww7=s=>_k_.W7(_k_.w2(s));_k_.w8=_k_.kolor.F256(_k_.kolor.w(8));_k_.W8=_k_.kolor.B256(_k_.kolor.W(8));_k_.Ww8=s=>_k_.W8(_k_.w1(s))

var firstLineCol, lastLineCol, Parse, ParseUtils, print

print = require('./print')
ParseUtils = require('./parseutils')
firstLineCol = require('./utils').firstLineCol
lastLineCol = require('./utils').lastLineCol


Parse = (function ()
{
    _k_.extend(Parse, ParseUtils)
    function Parse (kode)
    {
        this.kode = kode
    
        this.debug = this.kode.args.debug
        this.verbose = this.kode.args.verbose
        this.raw = this.kode.args.raw
        return Parse.__super__.constructor.apply(this, arguments)
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
            console.log(_k_.Y5(_k_.w1((tok != null ? tok.text : undefined))))
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
            if (e.text === '@' && unspaced && _k_.in(tokens[0].type,['var','keyword','op']))
            {
                e = this.this(e,tokens)
                break
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
            else if ((spaced && (nxt.line === last.line || (nxt.col > first.col && !(_k_.in(this.stack.slice(-1)[0],['if'])))) && !(_k_.in(nxt.text,['then','when','else','break','continue','in','of','for','while'])) && (!(_k_.in(nxt.text,['if'])) || !this.noThenAhead(tokens)) && !(_k_.in(nxt.text,',.;:)}]')) && !(_k_.in(nxt.type,['nl'])) && (nxt.type !== 'op' || _k_.in(nxt.text,['++','--','noon','new','not']) || _k_.in(nxt.text,['+','-']) && tokens[1].col === nxt.col + 1) && this.isSuitableForImplicitCall(e)))
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

    return Parse
})()

module.exports = Parse