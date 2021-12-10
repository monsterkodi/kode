var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, length: function (l) {return (l != null ? typeof l.length === 'number' ? l.length : 0 : 0)}, in: function (a,l) {return (l != null ? typeof l.indexOf === 'function' ? l.indexOf(a) >= 0 : false : false)}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var noon, slash, kstr

noon = require('noon')
slash = require('kslash')
kstr = require('kstr')
class Lexer
{
    constructor (kode)
    {
        var key, pat, reg

        this.kode = kode
        this.debug = this.kode.args.debug
        this.verbose = this.kode.args.verbose
        this.raw = this.kode.args.raw
        this.patterns = noon.load(slash.join(__dirname,'../kode/lexer.noon'))
        this.regs = []
        for (key in this.patterns)
        {
            pat = this.patterns[key]
            if (typeof(pat) === 'string')
            {
                this.regs.push([key,new RegExp(pat)])
            }
            else if (pat instanceof Array)
            {
                pat = pat.map(function (p)
                {
                    return kstr.escapeRegexp(`${p}`)
                })
                reg = '\\b(' + pat.join('|') + ')\\b'
                this.regs.push([key,new RegExp(reg)])
            }
        }
    }

    tokenize (text)
    {
        var tokens, line, col, before, key, reg, match, value, lines, after

        tokens = []
        line = 1
        col = 0
        while (text.length)
        {
            before = text.length
            var list = _k_.list(this.regs)
            for (var _60_26_ = 0; _60_26_ < list.length; _60_26_++)
            {
                key = list[_60_26_][0]
                reg = list[_60_26_][1]
                match = text.match(reg)
                if ((match != null ? match.index : undefined) === 0)
                {
                    value = key === 'nl' ? '' : match[0]
                    if (key === 'then')
                    {
                        value = 'then'
                        key = 'keyword'
                    }
                    if (value === 'then' && (tokens.slice(-2,-1)[0] != null ? tokens.slice(-2,-1)[0].text : undefined) === 'else')
                    {
                    }
                    else
                    {
                        tokens.push({type:key,text:value,line:line,col:col})
                    }
                    if (key === 'nl')
                    {
                        col = 0
                        line++
                    }
                    else if ([].indexOf.call(['comment','triple'], key) >= 0)
                    {
                        lines = value.split('\n')
                        line += lines.length - 1
                        if (lines.length > 1)
                        {
                            col = lines.slice(-1)[0].length
                        }
                        else
                        {
                            col += value.length
                        }
                    }
                    else
                    {
                        col += value.length
                    }
                    text = text.slice(match[0].length)
                    break
                }
            }
            after = text.length
            if (before === after)
            {
                console.log(`stray character ${text[0]} in line ${line} col ${col}`)
                tokens.push({type:'stray',text:text[0],line:line,col:col})
                text = text.slice(1)
            }
        }
        return tokens
    }

    tripdent (tokens)
    {
        var tok, splt, minind

        var list = _k_.list(tokens)
        for (var _106_16_ = 0; _106_16_ < list.length; _106_16_++)
        {
            tok = list[_106_16_]
            if (tok.type === 'triple')
            {
                splt = tok.text.slice(3, -3).split('\n')
                if (splt.length > 1)
                {
                    if (splt.length === 2)
                    {
                        if (kstr.strip(splt[1]) === '')
                        {
                            tok.text = '"""' + splt[0] + '"""'
                        }
                        else
                        {
                            tok.text = '"""' + splt[0] + '\n' + kstr.lstrip(splt[1]) + '"""'
                        }
                    }
                    else
                    {
                        if (kstr.strip(splt[0]) === '' && splt.length > 2)
                        {
                            splt.shift()
                        }
                        if (kstr.strip(splt.slice(-1)[0]) === '')
                        {
                            splt.pop()
                        }
                        if (splt.length === 1)
                        {
                            tok.text = '"""' + kstr.lstrip(splt[0]) + '"""'
                        }
                        else
                        {
                            minind = Math.min.apply(0,splt.map(function (s)
                            {
                                if (empty(kstr.strip(s)))
                                {
                                    return Infinity
                                }
                                else
                                {
                                    return kstr.lcnt(s,' ')
                                }
                            }))
                            if ((Infinity > minind && minind > 0))
                            {
                                splt = splt.map(function (s)
                                {
                                    return s.slice(minind)
                                })
                            }
                            tok.text = '"""' + splt.join('\n') + '"""'
                        }
                    }
                }
            }
        }
        return tokens
    }

    unslash (tokens)
    {
        var newTokens, idx, tok

        newTokens = []
        idx = 0
        while (idx < tokens.length)
        {
            tok = tokens[idx]
            if (tok.text === '\\')
            {
                idx += 1
                while ([].indexOf.call(['nl','ws'], tokens[idx].type) >= 0)
                {
                    idx += 1
                }
            }
            else
            {
                newTokens.push(tok)
                idx += 1
            }
        }
        return newTokens
    }

    mergeop (tokens)
    {
        var newTokens, idx, tok

        newTokens = []
        idx = 0
        while (idx < tokens.length)
        {
            tok = tokens[idx]
            if (tok.type === 'op' && !([].indexOf.call(['--','++'], tok.text) >= 0))
            {
                newTokens.push(tok)
                idx += 1
                while ([].indexOf.call(['nl','ws'], tokens[idx].type) >= 0)
                {
                    idx += 1
                }
            }
            else
            {
                newTokens.push(tok)
                idx += 1
            }
        }
        return newTokens
    }

    uncomment (tokens)
    {
        var newTokens, idx, tok

        newTokens = []
        idx = 0
        while (idx < tokens.length)
        {
            tok = tokens[idx]
            if (tok.type === 'comment')
            {
                idx += 1
                continue
            }
            newTokens.push(tok)
            idx += 1
        }
        return newTokens
    }

    blockify (tokens)
    {
        var blocks, block, outdentTo, idx, tok, nxt

        tokens = this.tripdent(tokens)
        tokens = this.unslash(tokens)
        tokens = this.uncomment(tokens)
        tokens = this.mergeop(tokens)
        blocks = []
        block = {type:'block',tokens:[],indent:'',line:1,col:0}
        blocks.push(block)
        outdentTo = function (depth, line)
        {
            while (depth < block.indent.length)
            {
                blocks.pop()
                block = blocks.slice(-1)[0]
            }
        }
        for (idx = 0; idx < tokens.length; idx++)
        {
            tok = tokens[idx]
            if (tok.type === 'nl')
            {
                nxt = tokens[idx + 1]
                if ([].indexOf.call(['nl'], (nxt != null ? nxt.type : undefined)) >= 0)
                {
                    continue
                }
                if ((nxt != null ? nxt.type : undefined) === 'ws')
                {
                    if ((tokens[idx + 2] != null ? tokens[idx + 2].type : undefined) === 'nl' || idx + 1 >= tokens.length - 1)
                    {
                        continue
                    }
                    if (nxt.text.length > block.indent.length)
                    {
                        block = {type:'block',tokens:[],line:nxt.line,indent:nxt.text,col:nxt.text.length}
                        blocks.slice(-1)[0].tokens.push(block)
                        blocks.push(block)
                        continue
                    }
                    else if (nxt.text.length < block.indent.length)
                    {
                        outdentTo(nxt.text.length,nxt.line)
                    }
                }
                else if (nxt)
                {
                    if (block.indent.length)
                    {
                        outdentTo(0,nxt.line)
                    }
                }
            }
            else if (tok.type === 'ws')
            {
                continue
            }
            block.tokens.push(tok)
        }
        return blocks[0]
    }
}

module.exports = Lexer