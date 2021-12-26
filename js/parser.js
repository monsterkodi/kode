// monsterkodi/kode 0.233.0

var _k_ = {extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, valid: undefined, kolor: { f:(r,g,b)=>'\x1b[38;5;'+(16+36*r+6*g+b)+'m', F:(r,g,b)=>'\x1b[48;5;'+(16+36*r+6*g+b)+'m', r:(i)=>(i<6)&&_k_.kolor.f(i,0,0)||_k_.kolor.f(5,i-5,i-5), R:(i)=>(i<6)&&_k_.kolor.F(i,0,0)||_k_.kolor.F(5,i-5,i-5), g:(i)=>(i<6)&&_k_.kolor.f(0,i,0)||_k_.kolor.f(i-5,5,i-5), G:(i)=>(i<6)&&_k_.kolor.F(0,i,0)||_k_.kolor.F(i-5,5,i-5), b:(i)=>(i<6)&&_k_.kolor.f(0,0,i)||_k_.kolor.f(i-5,i-5,5), B:(i)=>(i<6)&&_k_.kolor.F(0,0,i)||_k_.kolor.F(i-5,i-5,5), y:(i)=>(i<6)&&_k_.kolor.f(i,i,0)||_k_.kolor.f(5,5,i-5), Y:(i)=>(i<6)&&_k_.kolor.F(i,i,0)||_k_.kolor.F(5,5,i-5), m:(i)=>(i<6)&&_k_.kolor.f(i,0,i)||_k_.kolor.f(5,i-5,5), M:(i)=>(i<6)&&_k_.kolor.F(i,0,i)||_k_.kolor.F(5,i-5,5), c:(i)=>(i<6)&&_k_.kolor.f(0,i,i)||_k_.kolor.f(i-5,5,5), C:(i)=>(i<6)&&_k_.kolor.F(0,i,i)||_k_.kolor.F(i-5,5,5), w:(i)=>'\x1b[38;5;'+(232+(i-1)*3)+'m', W:(i)=>'\x1b[48;5;'+(232+(i-1)*3+2)+'m', wrap: function (open, close, reg) { return function (s) { return open + (~(s += '').indexOf(close,4) && s.replace(reg,open) || s) + close } }, F256: function (open) { return _k_.kolor.wrap(open,'\x1b[39m',new RegExp('\\x1b\\[39m','g')) }, B256: function (open) { return _k_.kolor.wrap(open,'\x1b[49m',new RegExp('\\x1b\\[49m','g')) }}};_k_.r1=_k_.kolor.F256(_k_.kolor.r(1));_k_.R1=_k_.kolor.B256(_k_.kolor.R(1));_k_.Rr1=s=>_k_.R1(_k_.r8(s));_k_.r2=_k_.kolor.F256(_k_.kolor.r(2));_k_.R2=_k_.kolor.B256(_k_.kolor.R(2));_k_.Rr2=s=>_k_.R2(_k_.r7(s));_k_.r3=_k_.kolor.F256(_k_.kolor.r(3));_k_.R3=_k_.kolor.B256(_k_.kolor.R(3));_k_.Rr3=s=>_k_.R3(_k_.r6(s));_k_.r4=_k_.kolor.F256(_k_.kolor.r(4));_k_.R4=_k_.kolor.B256(_k_.kolor.R(4));_k_.Rr4=s=>_k_.R4(_k_.r5(s));_k_.r5=_k_.kolor.F256(_k_.kolor.r(5));_k_.R5=_k_.kolor.B256(_k_.kolor.R(5));_k_.Rr5=s=>_k_.R5(_k_.r4(s));_k_.r6=_k_.kolor.F256(_k_.kolor.r(6));_k_.R6=_k_.kolor.B256(_k_.kolor.R(6));_k_.Rr6=s=>_k_.R6(_k_.r3(s));_k_.r7=_k_.kolor.F256(_k_.kolor.r(7));_k_.R7=_k_.kolor.B256(_k_.kolor.R(7));_k_.Rr7=s=>_k_.R7(_k_.r2(s));_k_.r8=_k_.kolor.F256(_k_.kolor.r(8));_k_.R8=_k_.kolor.B256(_k_.kolor.R(8));_k_.Rr8=s=>_k_.R8(_k_.r1(s));_k_.g1=_k_.kolor.F256(_k_.kolor.g(1));_k_.G1=_k_.kolor.B256(_k_.kolor.G(1));_k_.Gg1=s=>_k_.G1(_k_.g8(s));_k_.g2=_k_.kolor.F256(_k_.kolor.g(2));_k_.G2=_k_.kolor.B256(_k_.kolor.G(2));_k_.Gg2=s=>_k_.G2(_k_.g7(s));_k_.g3=_k_.kolor.F256(_k_.kolor.g(3));_k_.G3=_k_.kolor.B256(_k_.kolor.G(3));_k_.Gg3=s=>_k_.G3(_k_.g6(s));_k_.g4=_k_.kolor.F256(_k_.kolor.g(4));_k_.G4=_k_.kolor.B256(_k_.kolor.G(4));_k_.Gg4=s=>_k_.G4(_k_.g5(s));_k_.g5=_k_.kolor.F256(_k_.kolor.g(5));_k_.G5=_k_.kolor.B256(_k_.kolor.G(5));_k_.Gg5=s=>_k_.G5(_k_.g4(s));_k_.g6=_k_.kolor.F256(_k_.kolor.g(6));_k_.G6=_k_.kolor.B256(_k_.kolor.G(6));_k_.Gg6=s=>_k_.G6(_k_.g3(s));_k_.g7=_k_.kolor.F256(_k_.kolor.g(7));_k_.G7=_k_.kolor.B256(_k_.kolor.G(7));_k_.Gg7=s=>_k_.G7(_k_.g2(s));_k_.g8=_k_.kolor.F256(_k_.kolor.g(8));_k_.G8=_k_.kolor.B256(_k_.kolor.G(8));_k_.Gg8=s=>_k_.G8(_k_.g1(s));_k_.b1=_k_.kolor.F256(_k_.kolor.b(1));_k_.B1=_k_.kolor.B256(_k_.kolor.B(1));_k_.Bb1=s=>_k_.B1(_k_.b8(s));_k_.b2=_k_.kolor.F256(_k_.kolor.b(2));_k_.B2=_k_.kolor.B256(_k_.kolor.B(2));_k_.Bb2=s=>_k_.B2(_k_.b7(s));_k_.b3=_k_.kolor.F256(_k_.kolor.b(3));_k_.B3=_k_.kolor.B256(_k_.kolor.B(3));_k_.Bb3=s=>_k_.B3(_k_.b6(s));_k_.b4=_k_.kolor.F256(_k_.kolor.b(4));_k_.B4=_k_.kolor.B256(_k_.kolor.B(4));_k_.Bb4=s=>_k_.B4(_k_.b5(s));_k_.b5=_k_.kolor.F256(_k_.kolor.b(5));_k_.B5=_k_.kolor.B256(_k_.kolor.B(5));_k_.Bb5=s=>_k_.B5(_k_.b4(s));_k_.b6=_k_.kolor.F256(_k_.kolor.b(6));_k_.B6=_k_.kolor.B256(_k_.kolor.B(6));_k_.Bb6=s=>_k_.B6(_k_.b3(s));_k_.b7=_k_.kolor.F256(_k_.kolor.b(7));_k_.B7=_k_.kolor.B256(_k_.kolor.B(7));_k_.Bb7=s=>_k_.B7(_k_.b2(s));_k_.b8=_k_.kolor.F256(_k_.kolor.b(8));_k_.B8=_k_.kolor.B256(_k_.kolor.B(8));_k_.Bb8=s=>_k_.B8(_k_.b1(s));_k_.c1=_k_.kolor.F256(_k_.kolor.c(1));_k_.C1=_k_.kolor.B256(_k_.kolor.C(1));_k_.Cc1=s=>_k_.C1(_k_.c8(s));_k_.c2=_k_.kolor.F256(_k_.kolor.c(2));_k_.C2=_k_.kolor.B256(_k_.kolor.C(2));_k_.Cc2=s=>_k_.C2(_k_.c7(s));_k_.c3=_k_.kolor.F256(_k_.kolor.c(3));_k_.C3=_k_.kolor.B256(_k_.kolor.C(3));_k_.Cc3=s=>_k_.C3(_k_.c6(s));_k_.c4=_k_.kolor.F256(_k_.kolor.c(4));_k_.C4=_k_.kolor.B256(_k_.kolor.C(4));_k_.Cc4=s=>_k_.C4(_k_.c5(s));_k_.c5=_k_.kolor.F256(_k_.kolor.c(5));_k_.C5=_k_.kolor.B256(_k_.kolor.C(5));_k_.Cc5=s=>_k_.C5(_k_.c4(s));_k_.c6=_k_.kolor.F256(_k_.kolor.c(6));_k_.C6=_k_.kolor.B256(_k_.kolor.C(6));_k_.Cc6=s=>_k_.C6(_k_.c3(s));_k_.c7=_k_.kolor.F256(_k_.kolor.c(7));_k_.C7=_k_.kolor.B256(_k_.kolor.C(7));_k_.Cc7=s=>_k_.C7(_k_.c2(s));_k_.c8=_k_.kolor.F256(_k_.kolor.c(8));_k_.C8=_k_.kolor.B256(_k_.kolor.C(8));_k_.Cc8=s=>_k_.C8(_k_.c1(s));_k_.m1=_k_.kolor.F256(_k_.kolor.m(1));_k_.M1=_k_.kolor.B256(_k_.kolor.M(1));_k_.Mm1=s=>_k_.M1(_k_.m8(s));_k_.m2=_k_.kolor.F256(_k_.kolor.m(2));_k_.M2=_k_.kolor.B256(_k_.kolor.M(2));_k_.Mm2=s=>_k_.M2(_k_.m7(s));_k_.m3=_k_.kolor.F256(_k_.kolor.m(3));_k_.M3=_k_.kolor.B256(_k_.kolor.M(3));_k_.Mm3=s=>_k_.M3(_k_.m6(s));_k_.m4=_k_.kolor.F256(_k_.kolor.m(4));_k_.M4=_k_.kolor.B256(_k_.kolor.M(4));_k_.Mm4=s=>_k_.M4(_k_.m5(s));_k_.m5=_k_.kolor.F256(_k_.kolor.m(5));_k_.M5=_k_.kolor.B256(_k_.kolor.M(5));_k_.Mm5=s=>_k_.M5(_k_.m4(s));_k_.m6=_k_.kolor.F256(_k_.kolor.m(6));_k_.M6=_k_.kolor.B256(_k_.kolor.M(6));_k_.Mm6=s=>_k_.M6(_k_.m3(s));_k_.m7=_k_.kolor.F256(_k_.kolor.m(7));_k_.M7=_k_.kolor.B256(_k_.kolor.M(7));_k_.Mm7=s=>_k_.M7(_k_.m2(s));_k_.m8=_k_.kolor.F256(_k_.kolor.m(8));_k_.M8=_k_.kolor.B256(_k_.kolor.M(8));_k_.Mm8=s=>_k_.M8(_k_.m1(s));_k_.y1=_k_.kolor.F256(_k_.kolor.y(1));_k_.Y1=_k_.kolor.B256(_k_.kolor.Y(1));_k_.Yy1=s=>_k_.Y1(_k_.y8(s));_k_.y2=_k_.kolor.F256(_k_.kolor.y(2));_k_.Y2=_k_.kolor.B256(_k_.kolor.Y(2));_k_.Yy2=s=>_k_.Y2(_k_.y7(s));_k_.y3=_k_.kolor.F256(_k_.kolor.y(3));_k_.Y3=_k_.kolor.B256(_k_.kolor.Y(3));_k_.Yy3=s=>_k_.Y3(_k_.y6(s));_k_.y4=_k_.kolor.F256(_k_.kolor.y(4));_k_.Y4=_k_.kolor.B256(_k_.kolor.Y(4));_k_.Yy4=s=>_k_.Y4(_k_.y5(s));_k_.y5=_k_.kolor.F256(_k_.kolor.y(5));_k_.Y5=_k_.kolor.B256(_k_.kolor.Y(5));_k_.Yy5=s=>_k_.Y5(_k_.y4(s));_k_.y6=_k_.kolor.F256(_k_.kolor.y(6));_k_.Y6=_k_.kolor.B256(_k_.kolor.Y(6));_k_.Yy6=s=>_k_.Y6(_k_.y3(s));_k_.y7=_k_.kolor.F256(_k_.kolor.y(7));_k_.Y7=_k_.kolor.B256(_k_.kolor.Y(7));_k_.Yy7=s=>_k_.Y7(_k_.y2(s));_k_.y8=_k_.kolor.F256(_k_.kolor.y(8));_k_.Y8=_k_.kolor.B256(_k_.kolor.Y(8));_k_.Yy8=s=>_k_.Y8(_k_.y1(s));_k_.w1=_k_.kolor.F256(_k_.kolor.w(1));_k_.W1=_k_.kolor.B256(_k_.kolor.W(1));_k_.Ww1=s=>_k_.W1(_k_.w8(s));_k_.w2=_k_.kolor.F256(_k_.kolor.w(2));_k_.W2=_k_.kolor.B256(_k_.kolor.W(2));_k_.Ww2=s=>_k_.W2(_k_.w7(s));_k_.w3=_k_.kolor.F256(_k_.kolor.w(3));_k_.W3=_k_.kolor.B256(_k_.kolor.W(3));_k_.Ww3=s=>_k_.W3(_k_.w6(s));_k_.w4=_k_.kolor.F256(_k_.kolor.w(4));_k_.W4=_k_.kolor.B256(_k_.kolor.W(4));_k_.Ww4=s=>_k_.W4(_k_.w5(s));_k_.w5=_k_.kolor.F256(_k_.kolor.w(5));_k_.W5=_k_.kolor.B256(_k_.kolor.W(5));_k_.Ww5=s=>_k_.W5(_k_.w4(s));_k_.w6=_k_.kolor.F256(_k_.kolor.w(6));_k_.W6=_k_.kolor.B256(_k_.kolor.W(6));_k_.Ww6=s=>_k_.W6(_k_.w3(s));_k_.w7=_k_.kolor.F256(_k_.kolor.w(7));_k_.W7=_k_.kolor.B256(_k_.kolor.W(7));_k_.Ww7=s=>_k_.W7(_k_.w2(s));_k_.w8=_k_.kolor.F256(_k_.kolor.w(8));_k_.W8=_k_.kolor.B256(_k_.kolor.W(8));_k_.Ww8=s=>_k_.W8(_k_.w1(s))

var firstLineCol, lastLineCol, Parse, Parser, print

print = require('./print')
Parse = require('./parse')
firstLineCol = require('./utils').firstLineCol
lastLineCol = require('./utils').lastLineCol


Parser = (function ()
{
    _k_.extend(Parser, Parse)
    function Parser ()
    {
        return Parser.__super__.constructor.apply(this, arguments)
    }

    Parser.prototype["scope"] = function (exps)
    {
        return {vars:[],exps:exps}
    }

    Parser.prototype["if"] = function (tok, tokens)
    {
        var cond, e, thn, _66_23_

        if (tokens[0].type === 'block')
        {
            return this.ifBlock(tok,tokens)
        }
        this.push('if')
        this.lockBlock = true
        cond = this.exp(tokens)
        this.lockBlock = false
        thn = this.then('if',tokens)
        e = {if:{cond:cond,then:thn}}
        this.shiftNewlineTok('if after then',tokens,tok,(tokens[1] != null ? tokens[1].text : undefined) === 'else')
        if ((tokens[0] != null ? tokens[0].type : undefined) === 'block')
        {
            this.verb('block after if then -> switch to block mode')
            this.pop('if')
            return this.ifBlock(tok,tokens,e)
        }
        while ((tokens[0] != null ? tokens[0].text : undefined) === 'else' && (tokens[1] != null ? tokens[1].text : undefined) === 'if')
        {
            tokens.shift()
            tokens.shift()
            e.if.elifs = ((_66_23_=e.if.elifs) != null ? _66_23_ : [])
            cond = this.exp(tokens)
            thn = this.then('elif',tokens)
            this.shiftNewlineTok('if after elif then',tokens,tok,(tokens[1] != null ? tokens[1].text : undefined) === 'else')
            e.if.elifs.push({elif:{cond:cond,then:thn}})
        }
        if ((tokens[0] != null ? tokens[0].text : undefined) === 'else')
        {
            tokens.shift()
            e.if.else = this.block('else',tokens)
        }
        this.pop('if')
        return e
    }

    Parser.prototype["ifBlock"] = function (tok, tokens, e)
    {
        var cond, subbs, thn, _116_23_

        this.push('if')
        subbs = this.subBlocks(tokens.shift().tokens)
        if (!e)
        {
            tokens = subbs.shift()
            e = {if:{cond:this.exp(tokens),then:this.then('if',tokens)}}
        }
        while (subbs.length)
        {
            tokens = subbs.shift()
            if ((tokens[0] != null ? tokens[0].text : undefined) === 'else')
            {
                tokens.shift()
                e.if.else = this.block('else',tokens)
                break
            }
            cond = this.exp(tokens)
            thn = this.then('elif',tokens)
            e.if.elifs = ((_116_23_=e.if.elifs) != null ? _116_23_ : [])
            e.if.elifs.push({elif:{cond:cond,then:thn}})
        }
        this.pop('if')
        return e
    }

    Parser.prototype["ifTail"] = function (e, tok, tokens)
    {
        return {if:{cond:this.exp(tokens),then:[e]}}
    }

    Parser.prototype["for"] = function (tok, tokens)
    {
        var inof, list, thn, vals

        this.push('for')
        vals = this.exps('for vals',tokens)
        if (vals.length === 1)
        {
            vals = vals[0]
        }
        inof = tokens.shift()
        list = this.exp(tokens)
        thn = this.then('for',tokens)
        this.pop('for')
        return {for:{vals:vals,inof:inof,list:list,then:thn}}
    }

    Parser.prototype["each"] = function (e, tokens)
    {
        var ech

        ech = tokens.shift()
        return {each:{lhs:e,each:ech,fnc:this.exp(tokens)}}
    }

    Parser.prototype["forTail"] = function (e, tok, tokens)
    {
        var inof, list, vals

        this.push('for')
        vals = this.exps('for vals',tokens)
        if (vals.length === 1)
        {
            vals = vals[0]
        }
        inof = tokens.shift()
        list = this.exp(tokens)
        this.pop('for')
        return {for:{vals:vals,inof:inof,list:list,then:[e]}}
    }

    Parser.prototype["while"] = function (tok, tokens)
    {
        var cond, thn

        this.push('while')
        cond = this.exp(tokens)
        thn = this.then('while',tokens)
        this.pop('while')
        return {while:{cond:cond,then:thn}}
    }

    Parser.prototype["whileTail"] = function (e, tok, tokens)
    {
        var cond

        cond = this.exp(tokens)
        return {while:{cond:cond,then:[e]}}
    }

    Parser.prototype["switch"] = function (tok, tokens)
    {
        var e, lastWhen, match, subbs, whens

        this.push('switch')
        match = this.exp(tokens)
        if ((tokens[0] != null ? tokens[0].type : undefined) === 'block')
        {
            tokens = tokens.shift().tokens
        }
        else
        {
            return this.error({pop:'switch',msg:'block expected!',tokens:tokens})
        }
        whens = []
        e = {switch:{match:match,whens:whens}}
        if ((tokens[0] != null ? tokens[0].text : undefined) !== 'when')
        {
            subbs = this.subBlocks(tokens)
            while (subbs.length)
            {
                tokens = subbs.shift()
                if ((tokens[0] != null ? tokens[0].text : undefined) === 'else')
                {
                    tokens.shift()
                    e.switch.else = this.block('else',tokens)
                    break
                }
                whens.push(this.when(null,tokens))
                if ((whens.slice(-2,-1)[0] != null) && _k_.empty(whens.slice(-2,-1)[0].when.then))
                {
                    whens.slice(-1)[0].when.vals = whens.slice(-2,-1)[0].when.vals.concat(whens.slice(-1)[0].when.vals)
                    whens.splice(-2,1)
                }
            }
        }
        else
        {
            while ((tokens[0] != null ? tokens[0].text : undefined) === 'when')
            {
                lastWhen = tokens[0]
                whens.push(this.exp(tokens))
                this.shiftNewlineTok('switch after when',tokens,lastWhen,_k_.in((tokens[1] != null ? tokens[1].text : undefined),['when','else']))
            }
            if ((tokens[0] != null ? tokens[0].text : undefined) === 'else')
            {
                tokens.shift()
                e.switch.else = this.block('else',tokens)
            }
        }
        this.pop('switch')
        return e
    }

    Parser.prototype["when"] = function (tok, tokens)
    {
        var thn, vals

        this.push('when')
        vals = []
        while (((tokens[0] != null) && (!(_k_.in(tokens[0].type,['block','nl']))) && tokens[0].text !== 'then'))
        {
            vals.push(this.exp(tokens))
        }
        thn = this.then('when',tokens)
        this.shiftNewlineTok('when with empty then',tokens,tok,_k_.empty(thn))
        this.pop('when')
        return {when:{vals:vals,then:thn}}
    }

    Parser.prototype["try"] = function (tok, tokens)
    {
        var ctch, errr, exps, fnlly

        this.push('try')
        exps = this.block('body',tokens)
        this.shiftNewlineTok('try body end',tokens,tok,_k_.in(tokens[1].text,['catch','finally']))
        if ((tokens[0] != null ? tokens[0].text : undefined) === 'catch')
        {
            this.push('catch')
            tokens.shift()
            if (tokens[0].type !== 'block')
            {
                errr = this.exp(tokens)
            }
            ctch = {errr:errr,exps:this.block('body',tokens)}
            this.pop('catch')
            this.shiftNewlineTok('try catch end',tokens,tok,(tokens[1] != null ? tokens[1].text : undefined) === 'finally')
        }
        if ((tokens[0] != null ? tokens[0].text : undefined) === 'finally')
        {
            tokens.shift()
            fnlly = this.block('body',tokens)
        }
        this.pop('try')
        return {try:{exps:exps,catch:ctch,finally:fnlly}}
    }

    Parser.prototype["class"] = function (tok, tokens, type = 'class')
    {
        var e, name

        this.push('class')
        name = tokens.shift()
        e = {}
        e[type] = {name:name}
        if ((tokens[0] != null ? tokens[0].text : undefined) === 'extends')
        {
            tokens.shift()
            e[type].extends = this.exps('class extends',tokens,'nl')
        }
        if ((tokens[0] != null ? tokens[0].type : undefined) === 'block')
        {
            tokens = tokens.shift().tokens
            e[type].body = this.exps('class body',tokens)
            this.nameMethods(e[type].body)
        }
        this.pop('class')
        return e
    }

    Parser.prototype["function"] = function (tok, tokens)
    {
        return this.class(tok,tokens,'function')
    }

    Parser.prototype["func"] = function (args, arrow, tokens)
    {
        var body, e

        this.push('func')
        body = this.scope(this.block('body',tokens))
        this.pop('func')
        e = {func:{}}
        if (args)
        {
            e.func.args = args
        }
        e.func.arrow = arrow
        e.func.body = body
        return e
    }

    Parser.prototype["return"] = function (tok, tokens)
    {
        var e, val

        if ((tokens[0] != null ? tokens[0].type : undefined) !== 'nl')
        {
            val = this.block('return',tokens)
            if ((val != null ? val.length : undefined) > 1)
            {
                console.log('dafuk?')
            }
            val = (val != null ? val[0] : undefined)
        }
        e = {return:{ret:tok}}
        if (val)
        {
            e.return.val = val
        }
        return e
    }

    Parser.prototype["call"] = function (tok, tokens, qmrk)
    {
        var args, close, e, last, open

        this.push('call')
        if (tok.token)
        {
            tok = tok.token
        }
        last = lastLineCol(tok)
        if (tokens[0].text === '(' && tokens[0].line === last.line && tokens[0].col === last.col)
        {
            open = tokens.shift()
            if ((tokens[0] != null ? tokens[0].text : undefined) === ')')
            {
                args = []
            }
            else
            {
                this.push('args(')
                args = this.exps('(',tokens,')')
                this.pop('args(')
            }
        }
        else
        {
            if (_k_.in(tok.text,['typeof','new']))
            {
                this.push('▸arg')
                args = [this.exp(tokens)]
                this.pop('▸arg')
            }
            else
            {
                args = this.block('args',tokens)
            }
        }
        if (open)
        {
            if ((tokens[0] != null ? tokens[0].text : undefined) === ')')
            {
                close = tokens.shift()
            }
            else if ((tokens[0] != null ? tokens[0].type : undefined) === 'nl' && tokens[1].text === ')')
            {
                this.shiftNewline('implicit call ends',tokens)
                close = tokens.shift()
            }
        }
        if (open && !close)
        {
            this.error({hdr:'call',msg:'explicit call without closing )',tokens:tokens})
        }
        this.pop('call')
        if (!_k_.empty(args))
        {
            args[0] = this.prepareCallAssign(args[0])
        }
        e = {call:{callee:tok}}
        if (open)
        {
            e.call.open = open
        }
        if (qmrk)
        {
            e.call.qmrk = qmrk
        }
        e.call.args = args
        if (close)
        {
            e.call.close = close
        }
        return e
    }

    Parser.prototype["operation"] = function (lhs, op, tokens)
    {
        var e, rhs

        this.push(`op${op.text}`)
        if (op.text === '=' && tokens[0].type === 'block')
        {
            tokens = tokens.shift().tokens
        }
        rhs = this.exp(tokens)
        this.pop(`op${op.text}`)
        rhs = this.prepareCallAssign(rhs)
        if (op.text === '?=')
        {
            op.text = '='
            rhs = {qmrkop:{lhs:lhs,qmrk:{type:'op',text:'?',line:op.line,col:op.col},rhs:rhs}}
        }
        e = {operation:{}}
        if (lhs)
        {
            e.operation.lhs = lhs
        }
        e.operation.operator = op
        if (rhs)
        {
            e.operation.rhs = rhs
        }
        return e
    }

    Parser.prototype["incond"] = function (lhs, tokens)
    {
        var intok, rhs

        intok = tokens.shift()
        this.push('in?')
        rhs = this.exp(tokens)
        this.pop('in?')
        return {incond:{lhs:lhs,in:intok,rhs:rhs}}
    }

    Parser.prototype["array"] = function (open, tokens)
    {
        var close, comp, items

        if ((tokens[0] != null ? tokens[0].text : undefined) === ']')
        {
            return {array:{open:open,items:[],close:tokens.shift()}}
        }
        this.push('[')
        items = this.exps('[',tokens,']')
        close = this.shiftClose('array',']',tokens)
        this.pop('[')
        if (comp = this.lcomp(items))
        {
            return comp
        }
        return {array:{open:open,items:items,close:close}}
    }

    Parser.prototype["slice"] = function (from, tokens)
    {
        var dots, upto

        dots = tokens.shift()
        if ((tokens[0] != null ? tokens[0].text : undefined) === ']')
        {
            upto = null
        }
        else
        {
            upto = this.exp(tokens)
        }
        return {slice:{from:from,dots:dots,upto:upto}}
    }

    Parser.prototype["index"] = function (tok, tokens)
    {
        var close, open, slice

        this.push('idx')
        open = tokens.shift()
        if ((tokens[0] != null ? tokens[0].type : undefined) === 'dots')
        {
            slice = this.slice(null,tokens)
        }
        else
        {
            slice = this.exp(tokens)
        }
        close = this.shiftClose('index',']',tokens)
        this.pop('idx')
        return {index:{idxee:tok,open:open,slidx:slice,close:close}}
    }

    Parser.prototype["parens"] = function (open, tokens)
    {
        var close, comp, exps

        if ((tokens[0] != null ? tokens[0].text : undefined) === ')')
        {
            return {parens:{open:open,exps:[],close:tokens.shift()}}
        }
        this.push('(')
        exps = this.exps('(',tokens,')')
        close = this.shiftClose('parens',')',tokens)
        this.pop('(')
        if (comp = this.lcomp(exps))
        {
            return comp
        }
        return {parens:{open:open,exps:exps,close:close}}
    }

    Parser.prototype["lcomp"] = function (exps)
    {
        var f

        if (!(f = exps[0].for))
        {
            return
        }
        return {lcomp:exps[0]}
    }

    Parser.prototype["curly"] = function (open, tokens)
    {
        var close, exps

        if ((tokens[0] != null ? tokens[0].text : undefined) === '}')
        {
            return {object:{open:open,keyvals:[],close:tokens.shift()}}
        }
        this.push('{')
        exps = this.exps('{',tokens,'}')
        close = this.shiftClose('curly','}',tokens)
        this.pop('{')
        return {object:{open:open,keyvals:exps,close:close}}
    }

    Parser.prototype["object"] = function (key, tokens)
    {
        var block, exps, first, literals

        this.push('{')
        first = firstLineCol(key)
        exps = [this.keyval(key,tokens)]
        literals = this.kode.atoms.concat(['keyword','op'])
        while (tokens.length)
        {
            if ((tokens[0] != null ? tokens[0].type : undefined) === 'nl')
            {
                if (!(_k_.in((tokens[1] != null ? tokens[1].type : undefined),literals)))
                {
                    break
                }
                if (!(_k_.in((tokens[2] != null ? tokens[2].text : undefined),': ')))
                {
                    break
                }
                if ((tokens[1] != null ? tokens[1].col : undefined) >= first.col && !(_k_.in(tokens[1].text,'])')))
                {
                    this.shiftNewline('continue implicit object on nl...',tokens)
                    exps.push(this.exp(tokens))
                    continue
                }
                break
            }
            else if ((tokens[0] != null ? tokens[0].type : undefined) === 'block')
            {
                if (tokens[0].col >= first.col || this.stack.slice(-1)[0] === '{' && _k_.in('section',this.stack))
                {
                    block = tokens.shift()
                    tokens = block.tokens
                    exps = exps.concat(this.exps('object',block.tokens))
                }
                break
            }
            else if ((tokens[0] != null ? tokens[0].line : undefined) === first.line && !(_k_.in(tokens[0].text,'])};')))
            {
                exps = exps.concat(this.exps('object',tokens,';'))
                break
            }
            else
            {
                if (_k_.in(tokens[0].text,'])};'))
                {
                    break
                }
                if (!(_k_.in(tokens[0].type,literals)))
                {
                    break
                }
            }
        }
        this.pop('{')
        return {object:{keyvals:exps}}
    }

    Parser.prototype["keyval"] = function (key, tokens)
    {
        var block, col, colon, k, line, text, value

        colon = tokens.shift()
        this.push(':')
        if ((tokens[0] != null ? tokens[0].type : undefined) === 'block')
        {
            block = tokens.shift()
            value = this.exp(block.tokens)
        }
        else
        {
            value = this.exp(tokens)
        }
        this.pop(':')
        k = {type:'key'}
        if (key.type)
        {
            k.text = key.text
            k.line = key.line
            k.col = key.col
        }
        else if (key.prop)
        {
            line = firstLineCol(key).line
            col = firstLineCol(key).col

            text = this.kode.renderer.node(key)
            if (text.startsWith('this'))
            {
                if (text === 'this')
                {
                    text = '@'
                }
                else if (text.startsWith('this.'))
                {
                    text = '@' + text.slice(5)
                }
            }
            k.text = text
            k.line = line
            k.col = col
        }
        else
        {
            console.log('WHAT COULD THAT BE?',key)
        }
        return {keyval:{key:k,colon:colon,val:value}}
    }

    Parser.prototype["this"] = function (obj, tokens)
    {
        return {prop:{obj:obj,dot:{type:'punct',text:'.',line:obj.line,col:obj.col},prop:tokens.shift()}}
    }

    Parser.prototype["prop"] = function (obj, tokens)
    {
        var dot, prop

        dot = tokens.shift()
        prop = tokens.shift()
        prop.type = 'var'
        return {prop:{obj:obj,dot:dot,prop:prop}}
    }

    Parser.prototype["assert"] = function (obj, tokens)
    {
        return {assert:{obj:obj,qmrk:tokens.shift()}}
    }

    Parser.prototype["qmrkop"] = function (lhs, tokens)
    {
        var qmrk, rhs

        this.push('?')
        qmrk = tokens.shift()
        rhs = this.exp(tokens)
        this.pop('?')
        return {qmrkop:{lhs:lhs,qmrk:qmrk,rhs:rhs}}
    }

    Parser.prototype["qmrkcolon"] = function (qmrkop, tokens)
    {
        var colon, rhs

        this.push(':')
        colon = tokens.shift()
        rhs = this.exp(tokens)
        this.pop(':')
        return {qmrkcolon:{lhs:qmrkop.lhs,qmrk:qmrkop.qmrk,mid:qmrkop.rhs,colon:colon,rhs:rhs}}
    }

    Parser.prototype["section"] = function (tok, tokens)
    {
        var exps, title

        title = {type:'double',text:'"' + tok.text + '"',line:tok.line,col:tok.col}
        if (_k_.in('section',this.stack))
        {
            this.push('subsect')
            exps = this.block('subsect',tokens)
            this.pop('subsect')
            return {subsect:{title:title,exps:exps}}
        }
        else
        {
            this.push('section')
            exps = this.block('section',tokens)
            this.pop('section')
            return {section:{title:title,exps:exps}}
        }
    }

    Parser.prototype["compare"] = function (lhs, tokens)
    {
        tokens.shift()
        return {compare:{lhs:lhs,rhs:this.exp(tokens)}}
    }

    Parser.prototype["error"] = function (o, tokens)
    {
        var _1_17_, _1_6_

        if (o.pop)
        {
            this.pop(o.pop)
        }
        console.error(_k_.B3(_k_.b7(` ${((_1_17_=(tokens != null ? tokens[0] != null ? tokens[0].line : undefined : undefined)) != null ? _1_17_ : ' ')} `)) + _k_.R1(_k_.y4(` ${((_1_6_=o.hdr) != null ? _1_6_ : o.pop)} `)) + _k_.R2(_k_.y7(` ${o.msg} `)))
        return null
    }

    return Parser
})()

module.exports = Parser