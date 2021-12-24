// monsterkodi/kode 0.219.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}}

var kstr, noon, slash

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
        var after, before, col, end, key, line, lines, match, ni, reg, si, tokens, txt, value

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
                    else if (_k_.in(key,['comment','triple']))
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
                    else if (key === 'test')
                    {
                        if (!(tokens.slice(-2,-1)[0] != null) || tokens.slice(-2,-1)[0].type === 'nl' || tokens.slice(-2,-1)[0].type === 'ws' && (tokens.slice(-3,-2)[0] != null ? tokens.slice(-3,-2)[0].type : undefined) === 'nl')
                        {
                            end = text.indexOf('\n')
                            if (end < 0)
                            {
                                end = text.length
                            }
                            txt = kstr.strip(text.slice(1, typeof end === 'number' ? end : -1))
                            tokens.slice(-1)[0].type = 'section'
                            tokens.slice(-1)[0].text = txt
                            end >= text.length ? text = '' : text = text.slice(end)
                            break
                        }
                        else
                        {
                            tokens.slice(-1)[0].type = 'op'
                            tokens.slice(-1)[0].text = kstr.strip(tokens.slice(-1)[0].text,' \n')
                        }
                    }
                    else if (key.startsWith('prof'))
                    {
                        ni = text.indexOf('\n')
                        si = text.indexOf(';')
                        if (ni >= 0 && si >= 0)
                        {
                            end = Math.min(ni,si)
                        }
                        else if (ni >= 0)
                        {
                            end = ni
                        }
                        else if (si >= 0)
                        {
                            end = si
                        }
                        else
                        {
                            end = text.length
                        }
                        txt = kstr.strip(text.slice(tokens.slice(-1)[0].text.length, typeof end === 'number' ? end : -1))
                        tokens.slice(-1)[0].id = txt
                        end >= text.length ? text = '' : text = text.slice(end)
                        break
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
                console.log("files",this.kode.args.files)
                console.log(`stray character ▸${text[0]}◂ in line ${line} col ${col} text:\n`,text)
                tokens.push({type:'stray',text:text[0],line:line,col:col})
                text = text.slice(1)
            }
        }
        return tokens
    }

    tripdent (tokens)
    {
        var minind, splt, tok

        var list = _k_.list(tokens)
        for (var _136_16_ = 0; _136_16_ < list.length; _136_16_++)
        {
            tok = list[_136_16_]
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
                                if (_k_.empty((kstr.strip(s))))
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
        var idx, newTokens, tok

        newTokens = []
        idx = 0
        while (idx < tokens.length)
        {
            tok = tokens[idx]
            if (tok.text === '\\')
            {
                idx += 1
                while (_k_.in(tokens[idx].type,['nl','ws']))
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
        var idx, newTokens, tok

        newTokens = []
        idx = 0
        while (idx < tokens.length)
        {
            tok = tokens[idx]
            if (tok.type === 'op' && !(_k_.in(tok.text,['--','++','=','clone','copy','delete','new','is','instanceof','noon'])))
            {
                newTokens.push(tok)
                idx += 1
                while (_k_.in(tokens[idx].type,['nl','ws']))
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
        var idx, newTokens, tok

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
        var block, blocks, idx, nxt, outdentTo, tok

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
        for (var _268_19_ = idx = 0, _268_23_ = tokens.length; (_268_19_ <= _268_23_ ? idx < tokens.length : idx > tokens.length); (_268_19_ <= _268_23_ ? ++idx : --idx))
        {
            tok = tokens[idx]
            if (tok.type === 'nl')
            {
                nxt = tokens[idx + 1]
                if (_k_.in((nxt != null ? nxt.type : undefined),['nl']))
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