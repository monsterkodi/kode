var _k_ = {list:   function (l)   {return (l != null ? typeof l.length === 'number' ? l : [] : [])},             length: function (l)   {return (l != null ? typeof l.length === 'number' ? l.length : 0 : 0)},             in:     function (a,l) {return (l != null ? typeof l.indexOf === 'function' ? l.indexOf(a) >= 0 : false : false)},             extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var childp, slash, empty, valid, register, lastLineCol, firstLineCol

childp = require('child_process')
slash = require('kslash')

empty = function (a)
{
    return [].indexOf.call(['',null,undefined], a) >= 0 || (typeof(a) === 'object' && Object.keys(a).length === 0)
}

valid = function (a)
{
    return !empty(a)
}

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
            if ([].indexOf.call(['kode','coffee'], slash.ext(path)) >= 0)
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
    var _82_13_, _85_30_, cols

    if (((e != null ? e.col : undefined) != null))
    {
        return {line:e.line,col:e.col + (e.text != null ? e.text.length : undefined)}
    }
    else if ((e != null) && e instanceof Object)
    {
        cols = Object.values(e).map(lastLineCol)
        if (valid(cols))
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
    var _105_13_, cols

    if (((e != null ? e.col : undefined) != null))
    {
        return {line:e.line,col:e.col}
    }
    else if ((e != null) && e instanceof Object)
    {
        cols = Object.values(e).map(firstLineCol)
        if (valid(cols))
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
module.exports = {register:register,firstLineCol:firstLineCol,lastLineCol:lastLineCol,empty:empty,valid:valid}