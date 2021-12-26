// monsterkodi/kode 0.233.0

var _k_ = {kolor: { f:(r,g,b)=>'\x1b[38;5;'+(16+36*r+6*g+b)+'m', F:(r,g,b)=>'\x1b[48;5;'+(16+36*r+6*g+b)+'m', r:(i)=>(i<6)&&_k_.kolor.f(i,0,0)||_k_.kolor.f(5,i-5,i-5), R:(i)=>(i<6)&&_k_.kolor.F(i,0,0)||_k_.kolor.F(5,i-5,i-5), g:(i)=>(i<6)&&_k_.kolor.f(0,i,0)||_k_.kolor.f(i-5,5,i-5), G:(i)=>(i<6)&&_k_.kolor.F(0,i,0)||_k_.kolor.F(i-5,5,i-5), b:(i)=>(i<6)&&_k_.kolor.f(0,0,i)||_k_.kolor.f(i-5,i-5,5), B:(i)=>(i<6)&&_k_.kolor.F(0,0,i)||_k_.kolor.F(i-5,i-5,5), y:(i)=>(i<6)&&_k_.kolor.f(i,i,0)||_k_.kolor.f(5,5,i-5), Y:(i)=>(i<6)&&_k_.kolor.F(i,i,0)||_k_.kolor.F(5,5,i-5), m:(i)=>(i<6)&&_k_.kolor.f(i,0,i)||_k_.kolor.f(5,i-5,5), M:(i)=>(i<6)&&_k_.kolor.F(i,0,i)||_k_.kolor.F(5,i-5,5), c:(i)=>(i<6)&&_k_.kolor.f(0,i,i)||_k_.kolor.f(i-5,5,5), C:(i)=>(i<6)&&_k_.kolor.F(0,i,i)||_k_.kolor.F(i-5,5,5), w:(i)=>'\x1b[38;5;'+(232+(i-1)*3)+'m', W:(i)=>'\x1b[48;5;'+(232+(i-1)*3+2)+'m', wrap: function (open, close, reg) { return function (s) { return open + (~(s += '').indexOf(close,4) && s.replace(reg,open) || s) + close } }, F256: function (open) { return _k_.kolor.wrap(open,'\x1b[39m',new RegExp('\\x1b\\[39m','g')) }, B256: function (open) { return _k_.kolor.wrap(open,'\x1b[49m',new RegExp('\\x1b\\[49m','g')) }}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, list: function (l) {return l != null ? typeof l.length === 'number' ? l : [] : []}};_k_.r1=_k_.kolor.F256(_k_.kolor.r(1));_k_.R1=_k_.kolor.B256(_k_.kolor.R(1));_k_.Rr1=s=>_k_.R1(_k_.r8(s));_k_.r2=_k_.kolor.F256(_k_.kolor.r(2));_k_.R2=_k_.kolor.B256(_k_.kolor.R(2));_k_.Rr2=s=>_k_.R2(_k_.r7(s));_k_.r3=_k_.kolor.F256(_k_.kolor.r(3));_k_.R3=_k_.kolor.B256(_k_.kolor.R(3));_k_.Rr3=s=>_k_.R3(_k_.r6(s));_k_.r4=_k_.kolor.F256(_k_.kolor.r(4));_k_.R4=_k_.kolor.B256(_k_.kolor.R(4));_k_.Rr4=s=>_k_.R4(_k_.r5(s));_k_.r5=_k_.kolor.F256(_k_.kolor.r(5));_k_.R5=_k_.kolor.B256(_k_.kolor.R(5));_k_.Rr5=s=>_k_.R5(_k_.r4(s));_k_.r6=_k_.kolor.F256(_k_.kolor.r(6));_k_.R6=_k_.kolor.B256(_k_.kolor.R(6));_k_.Rr6=s=>_k_.R6(_k_.r3(s));_k_.r7=_k_.kolor.F256(_k_.kolor.r(7));_k_.R7=_k_.kolor.B256(_k_.kolor.R(7));_k_.Rr7=s=>_k_.R7(_k_.r2(s));_k_.r8=_k_.kolor.F256(_k_.kolor.r(8));_k_.R8=_k_.kolor.B256(_k_.kolor.R(8));_k_.Rr8=s=>_k_.R8(_k_.r1(s));_k_.g1=_k_.kolor.F256(_k_.kolor.g(1));_k_.G1=_k_.kolor.B256(_k_.kolor.G(1));_k_.Gg1=s=>_k_.G1(_k_.g8(s));_k_.g2=_k_.kolor.F256(_k_.kolor.g(2));_k_.G2=_k_.kolor.B256(_k_.kolor.G(2));_k_.Gg2=s=>_k_.G2(_k_.g7(s));_k_.g3=_k_.kolor.F256(_k_.kolor.g(3));_k_.G3=_k_.kolor.B256(_k_.kolor.G(3));_k_.Gg3=s=>_k_.G3(_k_.g6(s));_k_.g4=_k_.kolor.F256(_k_.kolor.g(4));_k_.G4=_k_.kolor.B256(_k_.kolor.G(4));_k_.Gg4=s=>_k_.G4(_k_.g5(s));_k_.g5=_k_.kolor.F256(_k_.kolor.g(5));_k_.G5=_k_.kolor.B256(_k_.kolor.G(5));_k_.Gg5=s=>_k_.G5(_k_.g4(s));_k_.g6=_k_.kolor.F256(_k_.kolor.g(6));_k_.G6=_k_.kolor.B256(_k_.kolor.G(6));_k_.Gg6=s=>_k_.G6(_k_.g3(s));_k_.g7=_k_.kolor.F256(_k_.kolor.g(7));_k_.G7=_k_.kolor.B256(_k_.kolor.G(7));_k_.Gg7=s=>_k_.G7(_k_.g2(s));_k_.g8=_k_.kolor.F256(_k_.kolor.g(8));_k_.G8=_k_.kolor.B256(_k_.kolor.G(8));_k_.Gg8=s=>_k_.G8(_k_.g1(s));_k_.b1=_k_.kolor.F256(_k_.kolor.b(1));_k_.B1=_k_.kolor.B256(_k_.kolor.B(1));_k_.Bb1=s=>_k_.B1(_k_.b8(s));_k_.b2=_k_.kolor.F256(_k_.kolor.b(2));_k_.B2=_k_.kolor.B256(_k_.kolor.B(2));_k_.Bb2=s=>_k_.B2(_k_.b7(s));_k_.b3=_k_.kolor.F256(_k_.kolor.b(3));_k_.B3=_k_.kolor.B256(_k_.kolor.B(3));_k_.Bb3=s=>_k_.B3(_k_.b6(s));_k_.b4=_k_.kolor.F256(_k_.kolor.b(4));_k_.B4=_k_.kolor.B256(_k_.kolor.B(4));_k_.Bb4=s=>_k_.B4(_k_.b5(s));_k_.b5=_k_.kolor.F256(_k_.kolor.b(5));_k_.B5=_k_.kolor.B256(_k_.kolor.B(5));_k_.Bb5=s=>_k_.B5(_k_.b4(s));_k_.b6=_k_.kolor.F256(_k_.kolor.b(6));_k_.B6=_k_.kolor.B256(_k_.kolor.B(6));_k_.Bb6=s=>_k_.B6(_k_.b3(s));_k_.b7=_k_.kolor.F256(_k_.kolor.b(7));_k_.B7=_k_.kolor.B256(_k_.kolor.B(7));_k_.Bb7=s=>_k_.B7(_k_.b2(s));_k_.b8=_k_.kolor.F256(_k_.kolor.b(8));_k_.B8=_k_.kolor.B256(_k_.kolor.B(8));_k_.Bb8=s=>_k_.B8(_k_.b1(s));_k_.c1=_k_.kolor.F256(_k_.kolor.c(1));_k_.C1=_k_.kolor.B256(_k_.kolor.C(1));_k_.Cc1=s=>_k_.C1(_k_.c8(s));_k_.c2=_k_.kolor.F256(_k_.kolor.c(2));_k_.C2=_k_.kolor.B256(_k_.kolor.C(2));_k_.Cc2=s=>_k_.C2(_k_.c7(s));_k_.c3=_k_.kolor.F256(_k_.kolor.c(3));_k_.C3=_k_.kolor.B256(_k_.kolor.C(3));_k_.Cc3=s=>_k_.C3(_k_.c6(s));_k_.c4=_k_.kolor.F256(_k_.kolor.c(4));_k_.C4=_k_.kolor.B256(_k_.kolor.C(4));_k_.Cc4=s=>_k_.C4(_k_.c5(s));_k_.c5=_k_.kolor.F256(_k_.kolor.c(5));_k_.C5=_k_.kolor.B256(_k_.kolor.C(5));_k_.Cc5=s=>_k_.C5(_k_.c4(s));_k_.c6=_k_.kolor.F256(_k_.kolor.c(6));_k_.C6=_k_.kolor.B256(_k_.kolor.C(6));_k_.Cc6=s=>_k_.C6(_k_.c3(s));_k_.c7=_k_.kolor.F256(_k_.kolor.c(7));_k_.C7=_k_.kolor.B256(_k_.kolor.C(7));_k_.Cc7=s=>_k_.C7(_k_.c2(s));_k_.c8=_k_.kolor.F256(_k_.kolor.c(8));_k_.C8=_k_.kolor.B256(_k_.kolor.C(8));_k_.Cc8=s=>_k_.C8(_k_.c1(s));_k_.m1=_k_.kolor.F256(_k_.kolor.m(1));_k_.M1=_k_.kolor.B256(_k_.kolor.M(1));_k_.Mm1=s=>_k_.M1(_k_.m8(s));_k_.m2=_k_.kolor.F256(_k_.kolor.m(2));_k_.M2=_k_.kolor.B256(_k_.kolor.M(2));_k_.Mm2=s=>_k_.M2(_k_.m7(s));_k_.m3=_k_.kolor.F256(_k_.kolor.m(3));_k_.M3=_k_.kolor.B256(_k_.kolor.M(3));_k_.Mm3=s=>_k_.M3(_k_.m6(s));_k_.m4=_k_.kolor.F256(_k_.kolor.m(4));_k_.M4=_k_.kolor.B256(_k_.kolor.M(4));_k_.Mm4=s=>_k_.M4(_k_.m5(s));_k_.m5=_k_.kolor.F256(_k_.kolor.m(5));_k_.M5=_k_.kolor.B256(_k_.kolor.M(5));_k_.Mm5=s=>_k_.M5(_k_.m4(s));_k_.m6=_k_.kolor.F256(_k_.kolor.m(6));_k_.M6=_k_.kolor.B256(_k_.kolor.M(6));_k_.Mm6=s=>_k_.M6(_k_.m3(s));_k_.m7=_k_.kolor.F256(_k_.kolor.m(7));_k_.M7=_k_.kolor.B256(_k_.kolor.M(7));_k_.Mm7=s=>_k_.M7(_k_.m2(s));_k_.m8=_k_.kolor.F256(_k_.kolor.m(8));_k_.M8=_k_.kolor.B256(_k_.kolor.M(8));_k_.Mm8=s=>_k_.M8(_k_.m1(s));_k_.y1=_k_.kolor.F256(_k_.kolor.y(1));_k_.Y1=_k_.kolor.B256(_k_.kolor.Y(1));_k_.Yy1=s=>_k_.Y1(_k_.y8(s));_k_.y2=_k_.kolor.F256(_k_.kolor.y(2));_k_.Y2=_k_.kolor.B256(_k_.kolor.Y(2));_k_.Yy2=s=>_k_.Y2(_k_.y7(s));_k_.y3=_k_.kolor.F256(_k_.kolor.y(3));_k_.Y3=_k_.kolor.B256(_k_.kolor.Y(3));_k_.Yy3=s=>_k_.Y3(_k_.y6(s));_k_.y4=_k_.kolor.F256(_k_.kolor.y(4));_k_.Y4=_k_.kolor.B256(_k_.kolor.Y(4));_k_.Yy4=s=>_k_.Y4(_k_.y5(s));_k_.y5=_k_.kolor.F256(_k_.kolor.y(5));_k_.Y5=_k_.kolor.B256(_k_.kolor.Y(5));_k_.Yy5=s=>_k_.Y5(_k_.y4(s));_k_.y6=_k_.kolor.F256(_k_.kolor.y(6));_k_.Y6=_k_.kolor.B256(_k_.kolor.Y(6));_k_.Yy6=s=>_k_.Y6(_k_.y3(s));_k_.y7=_k_.kolor.F256(_k_.kolor.y(7));_k_.Y7=_k_.kolor.B256(_k_.kolor.Y(7));_k_.Yy7=s=>_k_.Y7(_k_.y2(s));_k_.y8=_k_.kolor.F256(_k_.kolor.y(8));_k_.Y8=_k_.kolor.B256(_k_.kolor.Y(8));_k_.Yy8=s=>_k_.Y8(_k_.y1(s));_k_.w1=_k_.kolor.F256(_k_.kolor.w(1));_k_.W1=_k_.kolor.B256(_k_.kolor.W(1));_k_.Ww1=s=>_k_.W1(_k_.w8(s));_k_.w2=_k_.kolor.F256(_k_.kolor.w(2));_k_.W2=_k_.kolor.B256(_k_.kolor.W(2));_k_.Ww2=s=>_k_.W2(_k_.w7(s));_k_.w3=_k_.kolor.F256(_k_.kolor.w(3));_k_.W3=_k_.kolor.B256(_k_.kolor.W(3));_k_.Ww3=s=>_k_.W3(_k_.w6(s));_k_.w4=_k_.kolor.F256(_k_.kolor.w(4));_k_.W4=_k_.kolor.B256(_k_.kolor.W(4));_k_.Ww4=s=>_k_.W4(_k_.w5(s));_k_.w5=_k_.kolor.F256(_k_.kolor.w(5));_k_.W5=_k_.kolor.B256(_k_.kolor.W(5));_k_.Ww5=s=>_k_.W5(_k_.w4(s));_k_.w6=_k_.kolor.F256(_k_.kolor.w(6));_k_.W6=_k_.kolor.B256(_k_.kolor.W(6));_k_.Ww6=s=>_k_.W6(_k_.w3(s));_k_.w7=_k_.kolor.F256(_k_.kolor.w(7));_k_.W7=_k_.kolor.B256(_k_.kolor.W(7));_k_.Ww7=s=>_k_.W7(_k_.w2(s));_k_.w8=_k_.kolor.F256(_k_.kolor.w(8));_k_.W8=_k_.kolor.B256(_k_.kolor.W(8));_k_.Ww8=s=>_k_.W8(_k_.w1(s))

var kstr, print, slash

kstr = require('kstr')
slash = require('kslash')
print = require('./print')
class SourceMap
{
    constructor (source)
    {
        this.source = source
    
        this.jsline = 0
        this.lines = []
        this.cache = []
    }

    commit (s, tl)
    {
        var _45_46_

        if (tl === true)
        {
            while (s[0] === '\n')
            {
                s = s.slice(1)
                this.jsline++
            }
            console.log(_k_.b7('c'),_k_.g4(kstr.lpad(this.jsline,4)),s)
            this.jsline += this.solve(s)
            return this.cache = []
        }
        else if ((tl != null ? tl.type : undefined))
        {
            console.log(_k_.b4('t'),_k_.r2(kstr.lpad(((_45_46_=tl.line) != null ? _45_46_ : '?'),4)),s)
            return this.cache.push([s,tl])
        }
        else
        {
            console.log(_k_.b4('.'),_k_.b2(kstr.lpad(this.jsline,4)),_k_.w2(s))
        }
    }

    solve (s)
    {
        var ci, cs, i, ji, jsidx, jslns, ln, p, slcs, tok

        if (_k_.empty(s))
        {
            return 0
        }
        p = 0
        slcs = []
        jsidx = 0
        jslns = s.split('\n')
        ln = jslns[jsidx]
        console.log(_k_.y5('solve'),this.jsline)
        for (var _72_18_ = ci = 0, _72_22_ = this.cache.length; (_72_18_ <= _72_22_ ? ci < this.cache.length : ci > this.cache.length); (_72_18_ <= _72_22_ ? ++ci : --ci))
        {
            var _74_22_ = this.cache[ci]; cs = _74_22_[0]; tok = _74_22_[1]

            while ((i = ln.indexOf(cs,p)) <= 0)
            {
                if (jsidx >= jslns.length - 1)
                {
                    break
                }
                ln = jslns[++jsidx]
                p = 0
            }
            if (i >= 0 && jsidx < jslns.length)
            {
                ji = this.jsline + jsidx
                slcs.push([ln.slice(i, i + cs.length),[ji,tok.line,tok.col]])
                this.add([tok.line - 1,tok.col],[ji,i],ln.slice(i, i + cs.length))
                console.log(_k_.b6(ji),_k_.w3(i),_k_.r4(tok.line),_k_.r2(tok.col),cs + _k_.r2('◂'))
                p = i + cs.length
            }
            else
            {
                console.log(`srcmap.solve can't locate tok ${tok.text} in ${s}`)
            }
        }
        console.log(this.jsline,s,slcs)
        return jslns.length - 1
    }

    done (s)
    {
        var c, li, lm, ln, ls

        ls = s.split('\n')
        console.log(_k_.b5('d'),this.jsline,ls.length,this.lines.length)
        console.log(ls)
        for (var _107_18_ = li = 0, _107_22_ = ls.length; (_107_18_ <= _107_22_ ? li < ls.length : li > ls.length); (_107_18_ <= _107_22_ ? ++li : --li))
        {
            ln = ls[li]
            console.log(`${_k_.b3(kstr.lstrip(li,4))} ${ln}${_k_.r2('◂')}`)
            if (lm = this.lines[li])
            {
                var list = _k_.list(lm.columns)
                for (var _114_22_ = 0; _114_22_ < list.length; _114_22_++)
                {
                    c = list[_114_22_]
                    if (!c)
                    {
                        continue
                    }
                    console.log(`${red(c.jsstr)} ${c.sourceLine} ${c.sourceColumn}`)
                }
            }
        }
    }

    add (source, target, jsstr)
    {
        var column, line, _127_21_

        var _126_23_ = target; line = _126_23_[0]; column = _126_23_[1]

        this.lines[line] = ((_127_21_=this.lines[line]) != null ? _127_21_ : new LineMap(line))
        return this.lines[line].add(column,source,jsstr)
    }

    generate (code)
    {
        var buffer, file, lastColumn, lastSourceColumn, lastSourceLine, lineMap, lineNumber, mapping, needComma, writingline

        writingline = 0
        lastColumn = 0
        lastSourceLine = 0
        lastSourceColumn = 0
        needComma = false
        buffer = ""
        var list = _k_.list(this.lines)
        for (lineNumber = 0; lineNumber < list.length; lineNumber++)
        {
            lineMap = list[lineNumber]
            if (!lineMap)
            {
                continue
            }
            var list1 = _k_.list(lineMap.columns)
            for (var _153_24_ = 0; _153_24_ < list1.length; _153_24_++)
            {
                mapping = list1[_153_24_]
                if (!mapping)
                {
                    continue
                }
                while (writingline < mapping.line)
                {
                    lastColumn = 0
                    needComma = false
                    buffer += ";"
                    writingline++
                }
                if (needComma)
                {
                    buffer += ","
                    needComma = false
                }
                buffer += this.encodeVlq(mapping.column - lastColumn)
                lastColumn = mapping.column
                buffer += this.encodeVlq(0)
                buffer += this.encodeVlq(mapping.sourceLine - lastSourceLine)
                lastSourceLine = mapping.sourceLine
                buffer += this.encodeVlq(mapping.sourceColumn - lastSourceColumn)
                lastSourceColumn = mapping.sourceColumn
                needComma = true
            }
        }
        file = slash.file(slash.swapExt(this.source,'js'),this.source)
        return {version:3,file:file,sources:[slash.file(this.source) || ''],mappings:buffer}
    }

    jscode (v3Map)
    {
        var dataURL, encoded, sourceURL

        encoded = this.base64encode(JSON.stringify(v3Map))
        dataURL = `//# sourceMappingURL=data:application/json;base64,${encoded}`
        sourceURL = `//# sourceURL=${this.source}`
        return `\n\n${dataURL}\n${sourceURL}\n`
    }

    decodejs (encoded)
    {
        return JSON.parse(this.base64decode(encoded))
    }

    encodeVlq (value)
    {
        var answer, nextChunk, signBit, valueToEncode, VLQ_CONTINUATION_BIT, VLQ_SHIFT, VLQ_VALUE_MASK

        VLQ_SHIFT = 5
        VLQ_CONTINUATION_BIT = 1 << VLQ_SHIFT
        VLQ_VALUE_MASK = VLQ_CONTINUATION_BIT - 1
        signBit = value < 0 ? 1 : 0
        valueToEncode = (Math.abs(value) << 1) + signBit
        answer = ''
        while (valueToEncode || !answer)
        {
            nextChunk = valueToEncode & VLQ_VALUE_MASK
            valueToEncode = valueToEncode >> VLQ_SHIFT
            if (valueToEncode)
            {
                nextChunk |= VLQ_CONTINUATION_BIT
            }
            answer += this.encodeBase64(nextChunk)
        }
        return answer
    }

    base64decode (src)
    {
        return Buffer.from(src,'base64').toString()
    }

    base64encode (src)
    {
        return Buffer.from(src).toString('base64')
    }

    encodeBase64 (value)
    {
        var BASE64_CHARS

        BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        return BASE64_CHARS[value]
    }
}

class LineMap
{
    constructor (line)
    {
        this.line = line
    
        this.columns = []
    }

    add (column, srcloc, jsstr)
    {
        var sourceColumn, sourceLine

        var _285_35_ = srcloc; sourceLine = _285_35_[0]; sourceColumn = _285_35_[1]

        if (this.columns[column])
        {
            console.log(`LineMap has column ${column}`,sourceLine,sourceColumn,options)
            return
        }
        return this.columns[column] = {line:this.line,column:column,sourceLine:sourceLine,sourceColumn:sourceColumn,jsstr:jsstr}
    }
}

module.exports = SourceMap