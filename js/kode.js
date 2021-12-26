// monsterkodi/kode 0.233.0

var _k_ = {empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, list: function (l) {return l != null ? typeof l.length === 'number' ? l : [] : []}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, kolor: { f:(r,g,b)=>'\x1b[38;5;'+(16+36*r+6*g+b)+'m', F:(r,g,b)=>'\x1b[48;5;'+(16+36*r+6*g+b)+'m', r:(i)=>(i<6)&&_k_.kolor.f(i,0,0)||_k_.kolor.f(5,i-5,i-5), R:(i)=>(i<6)&&_k_.kolor.F(i,0,0)||_k_.kolor.F(5,i-5,i-5), g:(i)=>(i<6)&&_k_.kolor.f(0,i,0)||_k_.kolor.f(i-5,5,i-5), G:(i)=>(i<6)&&_k_.kolor.F(0,i,0)||_k_.kolor.F(i-5,5,i-5), b:(i)=>(i<6)&&_k_.kolor.f(0,0,i)||_k_.kolor.f(i-5,i-5,5), B:(i)=>(i<6)&&_k_.kolor.F(0,0,i)||_k_.kolor.F(i-5,i-5,5), y:(i)=>(i<6)&&_k_.kolor.f(i,i,0)||_k_.kolor.f(5,5,i-5), Y:(i)=>(i<6)&&_k_.kolor.F(i,i,0)||_k_.kolor.F(5,5,i-5), m:(i)=>(i<6)&&_k_.kolor.f(i,0,i)||_k_.kolor.f(5,i-5,5), M:(i)=>(i<6)&&_k_.kolor.F(i,0,i)||_k_.kolor.F(5,i-5,5), c:(i)=>(i<6)&&_k_.kolor.f(0,i,i)||_k_.kolor.f(i-5,5,5), C:(i)=>(i<6)&&_k_.kolor.F(0,i,i)||_k_.kolor.F(i-5,5,5), w:(i)=>'\x1b[38;5;'+(232+(i-1)*3)+'m', W:(i)=>'\x1b[48;5;'+(232+(i-1)*3+2)+'m', wrap: function (open, close, reg) { return function (s) { return open + (~(s += '').indexOf(close,4) && s.replace(reg,open) || s) + close } }, F256: function (open) { return _k_.kolor.wrap(open,'\x1b[39m',new RegExp('\\x1b\\[39m','g')) }, B256: function (open) { return _k_.kolor.wrap(open,'\x1b[49m',new RegExp('\\x1b\\[49m','g')) }}};_k_.r1=_k_.kolor.F256(_k_.kolor.r(1));_k_.R1=_k_.kolor.B256(_k_.kolor.R(1));_k_.Rr1=s=>_k_.R1(_k_.r8(s));_k_.r2=_k_.kolor.F256(_k_.kolor.r(2));_k_.R2=_k_.kolor.B256(_k_.kolor.R(2));_k_.Rr2=s=>_k_.R2(_k_.r7(s));_k_.r3=_k_.kolor.F256(_k_.kolor.r(3));_k_.R3=_k_.kolor.B256(_k_.kolor.R(3));_k_.Rr3=s=>_k_.R3(_k_.r6(s));_k_.r4=_k_.kolor.F256(_k_.kolor.r(4));_k_.R4=_k_.kolor.B256(_k_.kolor.R(4));_k_.Rr4=s=>_k_.R4(_k_.r5(s));_k_.r5=_k_.kolor.F256(_k_.kolor.r(5));_k_.R5=_k_.kolor.B256(_k_.kolor.R(5));_k_.Rr5=s=>_k_.R5(_k_.r4(s));_k_.r6=_k_.kolor.F256(_k_.kolor.r(6));_k_.R6=_k_.kolor.B256(_k_.kolor.R(6));_k_.Rr6=s=>_k_.R6(_k_.r3(s));_k_.r7=_k_.kolor.F256(_k_.kolor.r(7));_k_.R7=_k_.kolor.B256(_k_.kolor.R(7));_k_.Rr7=s=>_k_.R7(_k_.r2(s));_k_.r8=_k_.kolor.F256(_k_.kolor.r(8));_k_.R8=_k_.kolor.B256(_k_.kolor.R(8));_k_.Rr8=s=>_k_.R8(_k_.r1(s));_k_.g1=_k_.kolor.F256(_k_.kolor.g(1));_k_.G1=_k_.kolor.B256(_k_.kolor.G(1));_k_.Gg1=s=>_k_.G1(_k_.g8(s));_k_.g2=_k_.kolor.F256(_k_.kolor.g(2));_k_.G2=_k_.kolor.B256(_k_.kolor.G(2));_k_.Gg2=s=>_k_.G2(_k_.g7(s));_k_.g3=_k_.kolor.F256(_k_.kolor.g(3));_k_.G3=_k_.kolor.B256(_k_.kolor.G(3));_k_.Gg3=s=>_k_.G3(_k_.g6(s));_k_.g4=_k_.kolor.F256(_k_.kolor.g(4));_k_.G4=_k_.kolor.B256(_k_.kolor.G(4));_k_.Gg4=s=>_k_.G4(_k_.g5(s));_k_.g5=_k_.kolor.F256(_k_.kolor.g(5));_k_.G5=_k_.kolor.B256(_k_.kolor.G(5));_k_.Gg5=s=>_k_.G5(_k_.g4(s));_k_.g6=_k_.kolor.F256(_k_.kolor.g(6));_k_.G6=_k_.kolor.B256(_k_.kolor.G(6));_k_.Gg6=s=>_k_.G6(_k_.g3(s));_k_.g7=_k_.kolor.F256(_k_.kolor.g(7));_k_.G7=_k_.kolor.B256(_k_.kolor.G(7));_k_.Gg7=s=>_k_.G7(_k_.g2(s));_k_.g8=_k_.kolor.F256(_k_.kolor.g(8));_k_.G8=_k_.kolor.B256(_k_.kolor.G(8));_k_.Gg8=s=>_k_.G8(_k_.g1(s));_k_.b1=_k_.kolor.F256(_k_.kolor.b(1));_k_.B1=_k_.kolor.B256(_k_.kolor.B(1));_k_.Bb1=s=>_k_.B1(_k_.b8(s));_k_.b2=_k_.kolor.F256(_k_.kolor.b(2));_k_.B2=_k_.kolor.B256(_k_.kolor.B(2));_k_.Bb2=s=>_k_.B2(_k_.b7(s));_k_.b3=_k_.kolor.F256(_k_.kolor.b(3));_k_.B3=_k_.kolor.B256(_k_.kolor.B(3));_k_.Bb3=s=>_k_.B3(_k_.b6(s));_k_.b4=_k_.kolor.F256(_k_.kolor.b(4));_k_.B4=_k_.kolor.B256(_k_.kolor.B(4));_k_.Bb4=s=>_k_.B4(_k_.b5(s));_k_.b5=_k_.kolor.F256(_k_.kolor.b(5));_k_.B5=_k_.kolor.B256(_k_.kolor.B(5));_k_.Bb5=s=>_k_.B5(_k_.b4(s));_k_.b6=_k_.kolor.F256(_k_.kolor.b(6));_k_.B6=_k_.kolor.B256(_k_.kolor.B(6));_k_.Bb6=s=>_k_.B6(_k_.b3(s));_k_.b7=_k_.kolor.F256(_k_.kolor.b(7));_k_.B7=_k_.kolor.B256(_k_.kolor.B(7));_k_.Bb7=s=>_k_.B7(_k_.b2(s));_k_.b8=_k_.kolor.F256(_k_.kolor.b(8));_k_.B8=_k_.kolor.B256(_k_.kolor.B(8));_k_.Bb8=s=>_k_.B8(_k_.b1(s));_k_.c1=_k_.kolor.F256(_k_.kolor.c(1));_k_.C1=_k_.kolor.B256(_k_.kolor.C(1));_k_.Cc1=s=>_k_.C1(_k_.c8(s));_k_.c2=_k_.kolor.F256(_k_.kolor.c(2));_k_.C2=_k_.kolor.B256(_k_.kolor.C(2));_k_.Cc2=s=>_k_.C2(_k_.c7(s));_k_.c3=_k_.kolor.F256(_k_.kolor.c(3));_k_.C3=_k_.kolor.B256(_k_.kolor.C(3));_k_.Cc3=s=>_k_.C3(_k_.c6(s));_k_.c4=_k_.kolor.F256(_k_.kolor.c(4));_k_.C4=_k_.kolor.B256(_k_.kolor.C(4));_k_.Cc4=s=>_k_.C4(_k_.c5(s));_k_.c5=_k_.kolor.F256(_k_.kolor.c(5));_k_.C5=_k_.kolor.B256(_k_.kolor.C(5));_k_.Cc5=s=>_k_.C5(_k_.c4(s));_k_.c6=_k_.kolor.F256(_k_.kolor.c(6));_k_.C6=_k_.kolor.B256(_k_.kolor.C(6));_k_.Cc6=s=>_k_.C6(_k_.c3(s));_k_.c7=_k_.kolor.F256(_k_.kolor.c(7));_k_.C7=_k_.kolor.B256(_k_.kolor.C(7));_k_.Cc7=s=>_k_.C7(_k_.c2(s));_k_.c8=_k_.kolor.F256(_k_.kolor.c(8));_k_.C8=_k_.kolor.B256(_k_.kolor.C(8));_k_.Cc8=s=>_k_.C8(_k_.c1(s));_k_.m1=_k_.kolor.F256(_k_.kolor.m(1));_k_.M1=_k_.kolor.B256(_k_.kolor.M(1));_k_.Mm1=s=>_k_.M1(_k_.m8(s));_k_.m2=_k_.kolor.F256(_k_.kolor.m(2));_k_.M2=_k_.kolor.B256(_k_.kolor.M(2));_k_.Mm2=s=>_k_.M2(_k_.m7(s));_k_.m3=_k_.kolor.F256(_k_.kolor.m(3));_k_.M3=_k_.kolor.B256(_k_.kolor.M(3));_k_.Mm3=s=>_k_.M3(_k_.m6(s));_k_.m4=_k_.kolor.F256(_k_.kolor.m(4));_k_.M4=_k_.kolor.B256(_k_.kolor.M(4));_k_.Mm4=s=>_k_.M4(_k_.m5(s));_k_.m5=_k_.kolor.F256(_k_.kolor.m(5));_k_.M5=_k_.kolor.B256(_k_.kolor.M(5));_k_.Mm5=s=>_k_.M5(_k_.m4(s));_k_.m6=_k_.kolor.F256(_k_.kolor.m(6));_k_.M6=_k_.kolor.B256(_k_.kolor.M(6));_k_.Mm6=s=>_k_.M6(_k_.m3(s));_k_.m7=_k_.kolor.F256(_k_.kolor.m(7));_k_.M7=_k_.kolor.B256(_k_.kolor.M(7));_k_.Mm7=s=>_k_.M7(_k_.m2(s));_k_.m8=_k_.kolor.F256(_k_.kolor.m(8));_k_.M8=_k_.kolor.B256(_k_.kolor.M(8));_k_.Mm8=s=>_k_.M8(_k_.m1(s));_k_.y1=_k_.kolor.F256(_k_.kolor.y(1));_k_.Y1=_k_.kolor.B256(_k_.kolor.Y(1));_k_.Yy1=s=>_k_.Y1(_k_.y8(s));_k_.y2=_k_.kolor.F256(_k_.kolor.y(2));_k_.Y2=_k_.kolor.B256(_k_.kolor.Y(2));_k_.Yy2=s=>_k_.Y2(_k_.y7(s));_k_.y3=_k_.kolor.F256(_k_.kolor.y(3));_k_.Y3=_k_.kolor.B256(_k_.kolor.Y(3));_k_.Yy3=s=>_k_.Y3(_k_.y6(s));_k_.y4=_k_.kolor.F256(_k_.kolor.y(4));_k_.Y4=_k_.kolor.B256(_k_.kolor.Y(4));_k_.Yy4=s=>_k_.Y4(_k_.y5(s));_k_.y5=_k_.kolor.F256(_k_.kolor.y(5));_k_.Y5=_k_.kolor.B256(_k_.kolor.Y(5));_k_.Yy5=s=>_k_.Y5(_k_.y4(s));_k_.y6=_k_.kolor.F256(_k_.kolor.y(6));_k_.Y6=_k_.kolor.B256(_k_.kolor.Y(6));_k_.Yy6=s=>_k_.Y6(_k_.y3(s));_k_.y7=_k_.kolor.F256(_k_.kolor.y(7));_k_.Y7=_k_.kolor.B256(_k_.kolor.Y(7));_k_.Yy7=s=>_k_.Y7(_k_.y2(s));_k_.y8=_k_.kolor.F256(_k_.kolor.y(8));_k_.Y8=_k_.kolor.B256(_k_.kolor.Y(8));_k_.Yy8=s=>_k_.Y8(_k_.y1(s));_k_.w1=_k_.kolor.F256(_k_.kolor.w(1));_k_.W1=_k_.kolor.B256(_k_.kolor.W(1));_k_.Ww1=s=>_k_.W1(_k_.w8(s));_k_.w2=_k_.kolor.F256(_k_.kolor.w(2));_k_.W2=_k_.kolor.B256(_k_.kolor.W(2));_k_.Ww2=s=>_k_.W2(_k_.w7(s));_k_.w3=_k_.kolor.F256(_k_.kolor.w(3));_k_.W3=_k_.kolor.B256(_k_.kolor.W(3));_k_.Ww3=s=>_k_.W3(_k_.w6(s));_k_.w4=_k_.kolor.F256(_k_.kolor.w(4));_k_.W4=_k_.kolor.B256(_k_.kolor.W(4));_k_.Ww4=s=>_k_.W4(_k_.w5(s));_k_.w5=_k_.kolor.F256(_k_.kolor.w(5));_k_.W5=_k_.kolor.B256(_k_.kolor.W(5));_k_.Ww5=s=>_k_.W5(_k_.w4(s));_k_.w6=_k_.kolor.F256(_k_.kolor.w(6));_k_.W6=_k_.kolor.B256(_k_.kolor.W(6));_k_.Ww6=s=>_k_.W6(_k_.w3(s));_k_.w7=_k_.kolor.F256(_k_.kolor.w(7));_k_.W7=_k_.kolor.B256(_k_.kolor.W(7));_k_.Ww7=s=>_k_.W7(_k_.w2(s));_k_.w8=_k_.kolor.F256(_k_.kolor.w(8));_k_.W8=_k_.kolor.B256(_k_.kolor.W(8));_k_.Ww8=s=>_k_.W8(_k_.w1(s))

var args, childp, ddi, karg, kode, kstr, passOnArgv, pkg, print, register, slash

slash = require('kslash')
kstr = require('kstr')
karg = require('karg')
childp = require('child_process')
print = require('./print')
pkg = require(`${__dirname}/../package`)
register = require('./utils').register

class Kode
{
    constructor (args)
    {
        var Lexer, Operator, Parser, Renderer, Returner, Scoper, Stripol, Tester, _24_14_

        this.args = args
    
        this.onChange = this.onChange.bind(this)
        this.version = pkg.version
        this.args = ((_24_14_=this.args) != null ? _24_14_ : {})
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
            for (var _116_18_ = 0; _116_18_ < list.length; _116_18_++)
            {
                r = list[_116_18_]
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
        for (var _146_17_ = 0; _146_17_ < list.length; _146_17_++)
        {
            file = list[_146_17_]
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
                for (var _199_26_ = 0; _199_26_ < list.length; _199_26_++)
                {
                    f = list[_199_26_]
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