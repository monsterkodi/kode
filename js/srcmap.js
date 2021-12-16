// monsterkodi/kode 0.134.0

var _k_ = {empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var kstr, slash, print

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
            console.log(b7('c'),g4(kstr.lpad(this.jsline,4)),s)
            this.jsline += this.solve(s)
            return this.cache = []
        }
        else if ((tl != null ? tl.type : undefined))
        {
            console.log(b4('t'),r2(kstr.lpad(((_45_46_=tl.line) != null ? _45_46_ : '?'),4)),s)
            return this.cache.push([s,tl])
        }
        else
        {
            console.log(b4('.'),b2(kstr.lpad(this.jsline,4)),w2(s))
        }
    }

    solve (s)
    {
        var p, slcs, jsidx, jslns, ln, ci, cs, tok, i, ji

        if (_k_.empty(s))
        {
            return 0
        }
        p = 0
        slcs = []
        jsidx = 0
        jslns = s.split('\n')
        ln = jslns[jsidx]
        console.log(y5('solve'),this.jsline)
        for (ci = 0; ci < this.cache.length; ci++)
        {
            var _74_22_ = this.cache[ci] ; cs = _74_22_[0]            ; tok = _74_22_[1]

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
                console.log(b6(ji),w3(i),r4(tok.line),r2(tok.col),cs + r2('◂'))
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
        var ls, li, ln, lm, c

        ls = s.split('\n')
        console.log(b5('d'),this.jsline,ls.length,this.lines.length)
        console.log(ls)
        for (li = 0; li < ls.length; li++)
        {
            ln = ls[li]
            console.log(`${b3(kstr.lstrip(li,4))} ${ln}${r2('◂')}`)
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
        var line, column, _127_21_

        var _126_23_ = target ; line = _126_23_[0]        ; column = _126_23_[1]

        this.lines[line] = ((_127_21_=this.lines[line]) != null ? _127_21_ : new LineMap(line))
        return this.lines[line].add(column,source,jsstr)
    }

    generate (code)
    {
        var writingline, lastColumn, lastSourceLine, lastSourceColumn, needComma, buffer, lineMap, lineNumber, mapping, file

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
        var encoded, dataURL, sourceURL

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
        var VLQ_SHIFT, VLQ_CONTINUATION_BIT, VLQ_VALUE_MASK, signBit, valueToEncode, answer, nextChunk

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
        var sourceLine, sourceColumn

        var _285_35_ = srcloc ; sourceLine = _285_35_[0]        ; sourceColumn = _285_35_[1]

        if (this.columns[column])
        {
            console.log(`LineMap has column ${column}`,sourceLine,sourceColumn,options)
            return
        }
        return this.columns[column] = {line:this.line,column:column,sourceLine:sourceLine,sourceColumn:sourceColumn,jsstr:jsstr}
    }
}

module.exports = SourceMap