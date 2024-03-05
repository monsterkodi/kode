// monsterkodi/kode 0.256.0

var _k_ = {k: { f:(r,g,b)=>'\x1b[38;5;'+(16+36*r+6*g+b)+'m', F:(r,g,b)=>'\x1b[48;5;'+(16+36*r+6*g+b)+'m', r:(i)=>(i<6)&&_k_.k.f(i,0,0)||_k_.k.f(5,i-5,i-5), R:(i)=>(i<6)&&_k_.k.F(i,0,0)||_k_.k.F(5,i-5,i-5), g:(i)=>(i<6)&&_k_.k.f(0,i,0)||_k_.k.f(i-5,5,i-5), G:(i)=>(i<6)&&_k_.k.F(0,i,0)||_k_.k.F(i-5,5,i-5), b:(i)=>(i<6)&&_k_.k.f(0,0,i)||_k_.k.f(i-5,i-5,5), B:(i)=>(i<6)&&_k_.k.F(0,0,i)||_k_.k.F(i-5,i-5,5), y:(i)=>(i<6)&&_k_.k.f(i,i,0)||_k_.k.f(5,5,i-5), Y:(i)=>(i<6)&&_k_.k.F(i,i,0)||_k_.k.F(5,5,i-5), m:(i)=>(i<6)&&_k_.k.f(i,0,i)||_k_.k.f(5,i-5,5), M:(i)=>(i<6)&&_k_.k.F(i,0,i)||_k_.k.F(5,i-5,5), c:(i)=>(i<6)&&_k_.k.f(0,i,i)||_k_.k.f(i-5,5,5), C:(i)=>(i<6)&&_k_.k.F(0,i,i)||_k_.k.F(i-5,5,5), w:(i)=>'\x1b[38;5;'+(232+(i-1)*3)+'m', W:(i)=>'\x1b[48;5;'+(232+(i-1)*3+2)+'m', wrap:(open,close,reg)=>(s)=>open+(~(s+='').indexOf(close,4)&&s.replace(reg,open)||s)+close, F256:(open)=>_k_.k.wrap(open,'\x1b[39m',new RegExp('\\x1b\\[39m','g')), B256:(open)=>_k_.k.wrap(open,'\x1b[49m',new RegExp('\\x1b\\[49m','g'))}, lpad: function (l,s='',c=' ') {s=String(s); while(s.length<l){s=c+s} return s}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, list: function (l) {return l != null ? typeof l.length === 'number' ? l : [] : []}};_k_.r2=_k_.k.F256(_k_.k.r(2));_k_.r4=_k_.k.F256(_k_.k.r(4));_k_.g4=_k_.k.F256(_k_.k.g(4));_k_.b2=_k_.k.F256(_k_.k.b(2));_k_.b3=_k_.k.F256(_k_.k.b(3));_k_.b4=_k_.k.F256(_k_.k.b(4));_k_.b5=_k_.k.F256(_k_.k.b(5));_k_.b6=_k_.k.F256(_k_.k.b(6));_k_.b7=_k_.k.F256(_k_.k.b(7));_k_.y5=_k_.k.F256(_k_.k.y(5));_k_.w2=_k_.k.F256(_k_.k.w(2));_k_.w3=_k_.k.F256(_k_.k.w(3))

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
        var _45_43_

        if (tl === true)
        {
            while (s[0] === '\n')
            {
                s = s.slice(1)
                this.jsline++
            }
            console.log(_k_.b7('c'),_k_.g4(_k_.lpad(4,this.jsline)),s)
            this.jsline += this.solve(s)
            return this.cache = []
        }
        else if ((tl != null ? tl.type : undefined))
        {
            console.log(_k_.b4('t'),_k_.r2(_k_.lpad(4,((_45_43_=tl.line) != null ? _45_43_ : '?'))),s)
            return this.cache.push([s,tl])
        }
        else
        {
            console.log(_k_.b4('.'),_k_.b2(_k_.lpad(4,this.jsline)),_k_.w2(s))
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