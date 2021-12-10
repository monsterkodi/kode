// monsterkodi/kode 0.74.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, length: function (l) {return (l != null ? typeof l.length === 'number' ? l.length : 0 : 0)}, in: function (a,l) {return (l != null ? typeof l.indexOf === 'function' ? l.indexOf(a) >= 0 : false : false)}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var slash, kstr, klor, karg, childp, print, pkg, register, args, kode

slash = require('kslash')
kstr = require('kstr')
klor = require('klor')
karg = require('karg')
childp = require('child_process')
print = require('./print')
pkg = require(`${__dirname}/../package`)
empty = require('./utils').empty
register = require('./utils').register

klor.kolor.globalize()
class Kode
{
    constructor (args)
    {
        var _27_14_, Lexer, Parser, Scoper, Stripol, Returner, Renderer

        this.args = args
        this.version = pkg.version
        this.args = ((_27_14_=this.args) != null ? _27_14_ : {})
        if (this.args.verbose)
        {
            this.args.debug = this.args.block = this.args.tokens = this.args.parse = true
        }
        Lexer = require('./lexer')
        Parser = require('./parser')
        Scoper = require('./scoper')
        Stripol = require('./stripol')
        Returner = require('./returner')
        Renderer = require('./renderer')
        this.lexer = new Lexer(this)
        this.parser = new Parser(this)
        this.scoper = new Scoper(this)
        this.stripol = new Stripol(this)
        this.returner = new Returner(this)
        this.renderer = new Renderer(this)
    }

    static compile (text, opt = {})
    {
        return (new Kode(opt)).compile(text)
    }

    compile (text, file)
    {
        var ast, js

        if (empty(kstr.strip(text)))
        {
            return ''
        }
        ast = this.ast(text)
        if (this.args.parse)
        {
            print.ast('ast',ast)
        }
        if (this.args.astr)
        {
            console.log(print.astr(ast,this.args.scope))
        }
        js = this.renderer.render(ast,file)
        if (this.args.js || this.args.debug)
        {
            print.code('js',js)
        }
        return js
    }

    ast (text)
    {
        var tokens, block

        if (!text.slice(-1)[0] === '\n')
        {
            text += '\n'
        }
        if (this.args.verbose || this.args.debug || this.args.kode)
        {
            print.code('kode',text,'coffee')
        }
        tokens = this.lexer.tokenize(text)
        if (this.args.raw)
        {
            print.noon('raw tokens',tokens)
        }
        if (this.args.tokens)
        {
            print.tokens('tokens',tokens)
        }
        block = this.lexer.blockify(tokens)
        if (this.args.raw)
        {
            print.noon('raw block',block)
        }
        if (this.args.block)
        {
            print.block('tl block',block)
        }
        return this.returner.collect(this.scoper.collect(this.stripol.collect(this.parser.parse(block))))
    }

    astr (text, scopes)
    {
        return print.astr(this.ast(text),scopes)
    }

    eval (text, file)
    {
        var vm, sandbox, Module, _module, _require, r, js

        if (empty(text))
        {
            return
        }
        vm = require('vm')
        sandbox = vm.createContext()
        sandbox.global = global
        sandbox.__filename = (file != null ? file : 'eval')
        sandbox.__dirname = slash.dir(sandbox.__filename)
        sandbox.console = console
        if (!(sandbox.module || sandbox.require) || file)
        {
            Module = require('module')
            sandbox.module = _module = new Module('eval')
            sandbox.require = _require = function (file)
            {
                return Module._load(file,_module,true)
            }
            _module.filename = sandbox.__filename
            var list = _k_.list(Object.getOwnPropertyNames(require))
            for (var _111_18_ = 0; _111_18_ < list.length; _111_18_++)
            {
                r = list[_111_18_]
                if (!(_k_.in(r, ['paths','arguments','caller','length','name'])))
                {
                    _require[r] = require[r]
                }
            }
            _require.paths = _module.paths = Module._nodeModulePaths(process.cwd())
            _require.resolve = function (request)
            {
                return Module._resolveFilename(request,_module)
            }
        }
        try
        {
            js = this.compile(text,file)
            return vm.runInContext(js,sandbox)
        }
        catch (err)
        {
            console.error(err,text)
            throw err
        }
    }

    cli ()
    {
        var file, text, js, out

        if (this.args.compile)
        {
            console.log(this.compile(this.args.compile))
            return
        }
        if (this.args.eval)
        {
            console.log(this.eval(this.args.eval))
            return
        }
        if (!this.args.files.length)
        {
            return
        }
        var list = _k_.list(this.args.files)
        for (var _143_17_ = 0; _143_17_ < list.length; _143_17_++)
        {
            file = list[_143_17_]
            file = slash.resolve(file)
            if (this.args.verbose)
            {
                console.log(gray(file))
            }
            text = slash.readText(file)
            if (empty(text))
            {
                console.error(Y4(r2(`can't read ${R3(y5(file))}`)))
                continue
            }
            if (this.args.outdir)
            {
                js = this.compile(text,file)
                out = slash.resolve(this.args.outdir,slash.file(file))
                out = slash.swapExt(out,'js')
                if (!slash.writeText(out,js))
                {
                    console.error(R2(y3(`can't write ${R3(y6(out))}`)))
                }
            }
            else if (this.args.js)
            {
                this.compile(text,file)
            }
            else if (this.args.run)
            {
                this.eval(text,file)
            }
            else
            {
                console.log(this.compile(text))
            }
        }
    }
}

module.exports = Kode
if (!module.parent || slash.resolve(module.parent.path).endsWith('/kode/bin'))
{
    args = karg(`kode option
    files       . **
    eval        . ? evaluate a string and print the result
    compile     . ? compile a string and print the result
    outdir      . ? output directory for transpiled files
    run         . ? execute file                            . = true
    map         . ? generate inline source maps             . = true
    kode        . ? pretty print input code                 . = false
    js          . ? pretty print transpiled js code         . = false
    header      . ? prepend output with version header      . = false  . - H
    tokens      . ? print tokens                            . = false  . - T
    block       . ? print block tree                        . = false  . - B
    parse       . ? print parse tree                        . = false  . - P
    astr        . ? print parse tree as string              . = false  . - A
    scope       . ? print scopes                            . = false  . - S
    verbose     . ? log more                                . = false
    debug       . ? log debug                               . = false
    raw         . ? log raw                                 . = false  . - R

version  ${pkg.version}`)
    register()
    kode = new Kode(args)
    kode.cli()
}