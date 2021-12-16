// monsterkodi/kode 0.131.1

var _k_ = {empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}}

var slash, kstr, klor, karg, childp, print, pkg, register, args, kode

slash = require('kslash')
kstr = require('kstr')
klor = require('klor')
karg = require('karg')
childp = require('child_process')
print = require('./print')
pkg = require(`${__dirname}/../package`)
register = require('./utils').register

klor.kolor.globalize()
class Kode
{
    constructor (args)
    {
        var _27_14_, Lexer, Parser, Scoper, Stripol, Returner, Operator, Renderer, Tester

        this.args = args
        this.onChange = this.onChange.bind(this)
        this.version = pkg.version
        this.args = ((_27_14_=this.args) != null ? _27_14_ : {})
        if (this.args.verbose)
        {
            this.args.debug = this.args.block = this.args.tokens = this.args.parse = true
        }
        if (this.args.tokens || this.args.block || this.args.parse || this.args.astr)
        {
            this.args.run = false
        }
        this.literals = ['bool','num','regex','single','double','triple']
        this.atoms = this.literals.concat(['var'])
        Lexer = require('./lexer')
        Parser = require('./parser')
        Scoper = require('./scoper')
        Stripol = require('./stripol')
        Returner = require('./returner')
        Operator = require('./operator')
        Renderer = require('./renderer')
        Tester = require('./tester')
        this.lexer = new Lexer(this)
        this.parser = new Parser(this)
        this.scoper = new Scoper(this)
        this.stripol = new Stripol(this)
        this.returner = new Returner(this)
        this.operator = new Operator(this)
        this.renderer = new Renderer(this)
        this.tester = new Tester(this)
    }

    static compile (text, opt = {})
    {
        return (new Kode(opt)).compile(text)
    }

    compile (text, file)
    {
        var ast, js

        if (_k_.empty(kstr.strip(text)))
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
        return this.operator.collect(this.returner.collect(this.scoper.collect(this.stripol.collect(this.parser.parse(block)))))
    }

    astr (text, scopes)
    {
        return print.astr(this.ast(text),scopes)
    }

    eval (text, file, glob)
    {
        var vm, sandbox, k, v, Module, _module, _require, r, js

        if (_k_.empty(text))
        {
            return
        }
        vm = require('vm')
        sandbox = vm.createContext()
        if (glob)
        {
            for (k in glob)
            {
                v = glob[k]
                sandbox[k] = v
            }
        }
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
            for (var _117_18_ = 0; _117_18_ < list.length; _117_18_++)
            {
                r = list[_117_18_]
                if (!(_k_.in(r,['paths','arguments','caller','length','name'])))
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
            console.log(this.eval(this.args.eval,'eval',global))
            return
        }
        if (!this.args.files.length)
        {
            return
        }
        var list = _k_.list(this.args.files)
        for (var _149_17_ = 0; _149_17_ < list.length; _149_17_++)
        {
            file = list[_149_17_]
            file = slash.resolve(file)
            if (this.args.verbose)
            {
                console.log(gray(file))
            }
            text = slash.readText(file)
            if (_k_.empty(text))
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
            else if (this.args.test)
            {
                this.tester.test(text,file)
            }
            else if (this.args.run)
            {
                console.log(this.eval(text,file,global))
            }
            else
            {
                console.log(this.compile(text))
            }
            if (this.args.watch)
            {
                slash.watch(file,this.onChange)
            }
        }
        if (this.args.test)
        {
            return this.tester.summarize()
        }
    }

    onChange (file)
    {
        var text, js, out

        text = slash.readText(file)
        if (_k_.empty(text))
        {
            console.error(Y4(r2(`can't read ${R3(y5(file))}`)))
            return
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
        else if (this.args.test)
        {
            this.tester.test(text,file)
            return this.tester.summarize()
        }
        else if (this.args.run)
        {
            console.log(this.eval(text,file,global))
        }
    }
}

module.exports = Kode
if (!module.parent || slash.resolve(module.parent.path).endsWith('/kode/bin'))
{
    args = karg(`kode option
    files       . **
    eval        . ? evaluate a string and print the result
    compile     . ? transpile a string and print the result
    outdir      . ? output directory for transpiled files
    run         . ? execute files                               . = true
    test        . ? execute tests                               . = false
    watch       . ? watch for changes and compile, test or run  . = false
    map         . ? generate inline source maps                 . = true
    kode        . ? pretty print input code                     . = false
    js          . ? pretty print transpiled js code             . = false
    header      . ? prepend output with version header          . = false  . - H
    tokens      . ? print tokens                                . = false  . - T
    block       . ? print block tree                            . = false  . - B
    parse       . ? print parse tree                            . = false  . - P
    astr        . ? print parse tree as string                  . = false  . - A
    scope       . ? print scopes                                . = false  . - S
    verbose     . ? log everything                              . = false
    debug       . ? log debug                                   . = false
    raw         . ? log raw                                     . = false  . - R

version  ${pkg.version}`)
    register()
    kode = new Kode(args)
    kode.cli()
}