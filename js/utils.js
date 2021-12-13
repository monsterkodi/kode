// monsterkodi/kode 0.108.0

var _k_ = {in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, valid: undefined}

var childp, slash, register, lastLineCol, firstLineCol

childp = require('child_process')
slash = require('kslash')

register = function ()
{
    var loadFile, Module, fork, binary

    loadFile = function (module, file)
    {
        var Kode, kode, code, result

        try
        {
            Kode = require('./kode')
            kode = new Kode({header:true,files:[file],map:false})
            code = slash.readText(file)
            result = kode.compile(code)
            return module._compile(result,file)
        }
        catch (err)
        {
            console.error(`error loading ${file}:`,code)
            throw err
        }
    }
    if (require.extensions)
    {
        require.extensions['.kode'] = loadFile
        require.extensions['.coffee'] = loadFile
        Module = require('module')
        Module.prototype.load = function (file)
        {
            var ext

            this.filename = file
            this.paths = Module._nodeModulePaths(slash.dir(file))
            ext = '.' + slash.ext(file)
            Module._extensions[ext](this,file)
            return this.loaded = true
        }
    }
    if (childp)
    {
        fork = childp.fork

        binary = require.resolve('../bin/kode')
        return childp.fork = function (path, args, options)
        {
            if (_k_.in(slash.ext(path),['kode','coffee']))
            {
                if (!Array.isArray(args))
                {
                    options = args || {}
                    args = []
                }
                args = [path].concat(args)
                path = binary
            }
            return fork(path,args,options)
        }
    }
}

lastLineCol = function (e)
{
    var _73_13_, _76_30_, cols

    if (((e != null ? e.col : undefined) != null))
    {
        return {line:e.line,col:e.col + (e.text != null ? e.text.length : undefined)}
    }
    else if ((e != null) && e instanceof Object)
    {
        cols = Object.values(e).map(lastLineCol)
        if (!_k_.empty(cols))
        {
            return cols.reduce(function (a, b)
            {
                if (a.line > b.line)
                {
                    return a
                }
                else if (a.line === b.line)
                {
                    if (a.col > b.col)
                    {
                        return a
                    }
                    else
                    {
                        return b
                    }
                }
                else
                {
                    return b
                }
            })
        }
    }
    return {line:1,col:0}
}

firstLineCol = function (e)
{
    var _96_13_, cols

    if (((e != null ? e.col : undefined) != null))
    {
        return {line:e.line,col:e.col}
    }
    else if ((e != null) && e instanceof Object)
    {
        cols = Object.values(e).map(firstLineCol)
        if (!_k_.empty(cols))
        {
            return cols.reduce(function (a, b)
            {
                if (a.line < b.line)
                {
                    return a
                }
                else if (a.line === b.line)
                {
                    if (a.col < b.col)
                    {
                        return a
                    }
                    else
                    {
                        return b
                    }
                }
                else
                {
                    return b
                }
            })
        }
    }
    return {line:Infinity,col:Infinity}
}
module.exports = {register:register,firstLineCol:firstLineCol,lastLineCol:lastLineCol}