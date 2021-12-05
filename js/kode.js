// monsterkodi/kode 0.32.0

var slash, kstr, klor, karg, childp, print, pkg, opt, args, kode

slash = require('kslash')
kstr = require('kstr')
klor = require('klor')
karg = require('karg')
childp = require('child_process')
print = require('./print')
pkg = require(`${__dirname}/../package`)
empty = require('./utils').empty

klor.kolor.globalize()

class Kode
{
    constructor (args)
    {
        var _25_14_, Lexer, Parser, Scoper, Stripol, Returner, Renderer

        this.args = args
        this.args = ((_25_14_=this.args) != null ? _25_14_ : {})
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
        var list = (this.args.files != null ? this.args.files : [])
        for (var _62_17_ = 0; _62_17_ < list.length; _62_17_++)
        {
            file = list[_62_17_]
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
            js = this.compile(text)
            if (this.args.outdir)
            {
                out = slash.resolve(this.args.outdir,slash.file(file))
                out = slash.swapExt(out,'js')
                js = `// kode ${pkg.version}\n\n` + js
                if (!slash.writeText(out,js))
                {
                    console.error(R2(y3(`can't write ${R3(y6(out))}`)))
                }
            }
            else
            {
                if (!args.js)
                {
                    console.log(js)
                }
            }
        }
    }

    static compile (text, opt = {})
    {
        return (new Kode(opt)).compile(text)
    }

    compile (text)
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
        js = this.renderer.render(ast)
        if (this.args.header && kstr.strip(js).length)
        {
            js = `// monsterkodi/kode ${pkg.version}\n\n` + js
        }
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

    eval (text)
    {
        var vm, sandbox, js

        if (empty(text))
        {
            return
        }
        vm = require('vm')
        sandbox = vm.createContext()
        sandbox.__filename = 'eval'
        sandbox.__dirname = slash.dir(sandbox.__filename)
        sandbox.console = console
        try
        {
            js = this.compile(text)
            return vm.runInContext(js,sandbox)
        }
        catch (err)
        {
            console.error(err,text)
            throw(err)
        }
    }
}

module.exports = Kode
if (!module.parent || slash.resolve(module.parent.path).endsWith('/kode/bin'))
{
    args = karg(`
        kode option
            files       . **
            eval        . ? evaluate a string and print the result
            compile     . ? compile a string and print the result
            outdir      . ? output directory for transpiled files
            map         . ? generate inline source maps             . = true
            kode        . ? pretty print input code                 . = false
            js          . ? pretty print transpiled js code         . = false
            run         . ? execute file                            . = false
            header      . ? prepend output with version header      . = false  . - H
            tokens      . ? print tokens                            . = false  . - T
            block       . ? print block tree                        . = false  . - B
            parse       . ? print parse tree                        . = false  . - P
            astr        . ? print parse tree as string              . = false  . - A
            scope       . ? print scopes                            . = false  . - S
            verbose     . ? log more                                . = false
            debug       . ? log debug                               . = false
            raw         . ? log raw                                 . = false  . - R

        version  ${pkg.version}
        `)
    kode = new Kode(args)
    kode.cli()
}