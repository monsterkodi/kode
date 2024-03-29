// monsterkodi/kode 0.256.0

var _k_ = {empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, trim: function (s,c=' ') {return _k_.ltrim(_k_.rtrim(s,c),c)}, list: function (l) {return l != null ? typeof l.length === 'number' ? l : [] : []}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, k: { f:(r,g,b)=>'\x1b[38;5;'+(16+36*r+6*g+b)+'m', F:(r,g,b)=>'\x1b[48;5;'+(16+36*r+6*g+b)+'m', r:(i)=>(i<6)&&_k_.k.f(i,0,0)||_k_.k.f(5,i-5,i-5), R:(i)=>(i<6)&&_k_.k.F(i,0,0)||_k_.k.F(5,i-5,i-5), g:(i)=>(i<6)&&_k_.k.f(0,i,0)||_k_.k.f(i-5,5,i-5), G:(i)=>(i<6)&&_k_.k.F(0,i,0)||_k_.k.F(i-5,5,i-5), b:(i)=>(i<6)&&_k_.k.f(0,0,i)||_k_.k.f(i-5,i-5,5), B:(i)=>(i<6)&&_k_.k.F(0,0,i)||_k_.k.F(i-5,i-5,5), y:(i)=>(i<6)&&_k_.k.f(i,i,0)||_k_.k.f(5,5,i-5), Y:(i)=>(i<6)&&_k_.k.F(i,i,0)||_k_.k.F(5,5,i-5), m:(i)=>(i<6)&&_k_.k.f(i,0,i)||_k_.k.f(5,i-5,5), M:(i)=>(i<6)&&_k_.k.F(i,0,i)||_k_.k.F(5,i-5,5), c:(i)=>(i<6)&&_k_.k.f(0,i,i)||_k_.k.f(i-5,5,5), C:(i)=>(i<6)&&_k_.k.F(0,i,i)||_k_.k.F(i-5,5,5), w:(i)=>'\x1b[38;5;'+(232+(i-1)*3)+'m', W:(i)=>'\x1b[48;5;'+(232+(i-1)*3+2)+'m', wrap:(open,close,reg)=>(s)=>open+(~(s+='').indexOf(close,4)&&s.replace(reg,open)||s)+close, F256:(open)=>_k_.k.wrap(open,'\x1b[39m',new RegExp('\\x1b\\[39m','g')), B256:(open)=>_k_.k.wrap(open,'\x1b[49m',new RegExp('\\x1b\\[49m','g'))}, ltrim: function (s,c=' ') { while (_k_.in(s[0],c)) { s = s.slice(1) } return s}, rtrim: function (s,c=' ') {while (_k_.in(s.slice(-1)[0],c)) { s = s.slice(0, s.length - 1) } return s}};_k_.r2=_k_.k.F256(_k_.k.r(2));_k_.R2=_k_.k.B256(_k_.k.R(2));_k_.R3=_k_.k.B256(_k_.k.R(3));_k_.y3=_k_.k.F256(_k_.k.y(3));_k_.Y4=_k_.k.B256(_k_.k.Y(4));_k_.y5=_k_.k.F256(_k_.k.y(5));_k_.y6=_k_.k.F256(_k_.k.y(6))

var args, childp, ddi, karg, kode, passOnArgv, pkg, print, register, slash

slash = require('kslash')
karg = require('karg')
childp = require('child_process')
print = require('./print')
pkg = require(`${__dirname}/../package`)
register = require('./utils').register

class Kode
{
    constructor (args)
    {
        var Lexer, Operator, Parser, Renderer, Returner, Scoper, Stripol, Tester, _23_14_

        this.args = args
    
        this.onChange = this.onChange.bind(this)
        this.version = pkg.version
        this.args = ((_23_14_=this.args) != null ? _23_14_ : {})
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

        if (_k_.empty(_k_.trim(text)))
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
        var block, tokens

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
        var js, k, Module, r, sandbox, v, vm, _module, _require

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
        sandbox.process = process
        sandbox.global = global
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
            for (var _115_18_ = 0; _115_18_ < list.length; _115_18_++)
            {
                r = list[_115_18_]
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
            console.error(err)
            throw err
        }
    }

    cli ()
    {
        var file, js, out, text

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
        var list = _k_.list(this.args.files)
        for (var _145_17_ = 0; _145_17_ < list.length; _145_17_++)
        {
            file = list[_145_17_]
            file = slash.resolve(file)
            if (this.args.verbose)
            {
                console.log(gray(file))
            }
            text = slash.readText(file)
            if (_k_.empty(text))
            {
                console.error(_k_.Y4(_k_.r2(`can't read ${_k_.R3(_k_.y5(file))}`)))
                continue
            }
            if (this.args.outdir)
            {
                js = this.compile(text,file)
                out = slash.swapExt(slash.resolve(this.args.outdir,slash.file(file)),'js')
                if (!slash.writeText(out,js))
                {
                    console.error(_k_.R2(_k_.y3(`can't write ${_k_.R3(_k_.y6(out))}`)))
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
        var f, js, k, out, text, v

        text = slash.readText(file)
        if (_k_.empty(text))
        {
            console.error(_k_.Y4(_k_.r2(`can't read ${_k_.R3(_k_.y5(file))}`)))
            return
        }
        if (this.args.outdir)
        {
            js = this.compile(text,file)
            out = slash.resolve(this.args.outdir,slash.file(file))
            out = slash.swapExt(out,'js')
            if (!slash.writeText(out,js))
            {
                console.error(_k_.R2(_k_.y3(`can't write ${_k_.R3(_k_.y6(out))}`)))
            }
        }
        else if (this.args.test)
        {
            for (k in require.cache)
            {
                v = require.cache[k]
                if (slash.base(k) === slash.base(file))
                {
                    delete require.cache[k]
                }
            }
            if (this.tester.test(text,file))
            {
                return this.tester.summarize()
            }
            else
            {
                var list = _k_.list(this.args.files)
                for (var _198_26_ = 0; _198_26_ < list.length; _198_26_++)
                {
                    f = list[_198_26_]
                    this.tester.test(slash.readText(f),f)
                }
                return this.tester.summarize()
            }
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
    if (_k_.in('--',process.argv))
    {
        ddi = process.argv.indexOf('--')
        passOnArgv = process.argv.slice(ddi + 1)
        process.argv = process.argv.slice(0,ddi)
    }
    args = karg(`kode
    files       **
    eval        evaluate a string and print the result
    compile     transpile a string and print the result
    outdir      transpile files into output directory
    run         execute files                               = true
    test        execute tests                               = false
    watch       watch for changes and compile, test or run  = false
    map         generate inline source maps                 = true
    kode        pretty print input code                     = false
    js          pretty print transpiled js code             = false
    header      prepend output with version header          = false -H
    tokens      print tokens                                = false -T
    block       print block tree                            = false -B
    parse       print parse tree                            = false -P
    astr        print parse tree as string                  = false -A
    scope       print scopes                                = false -S
    verbose     log everything                              = false
    debug       log debug                                   = false
    raw         log raw                                     = false -R

▸
    --      
        arguments following a standalone -- are ignored
        and passed on to the executed script
    
version  ${pkg.version}`)
    process.argv = process.argv.slice(0, 2).concat((passOnArgv != null ? passOnArgv : []))
    register()
    kode = new Kode(args)
    kode.cli()
}