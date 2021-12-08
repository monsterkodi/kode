###
000   000   0000000   0000000    00000000
000  000   000   000  000   000  000
0000000    000   000  000   000  0000000
000  000   000   000  000   000  000
000   000   0000000   0000000    00000000
###

slash  = require 'kslash'
kstr   = require 'kstr'
klor   = require 'klor'
karg   = require 'karg'
childp = require 'child_process'
print  = require './print'
pkg    = require "#{__dirname}/../package"

{ empty, register } = require './utils'

klor.kolor.globalize()

class Kode

    @: (@args) ->

        @version = pkg.version
        
        @args ?= {}

        if @args.verbose then @args.debug = @args.block = @args.tokens = @args.parse = true

        Lexer     = require './lexer'
        Parser    = require './parser'
        Scoper    = require './scoper'
        Stripol   = require './stripol'
        Returner  = require './returner'
        Renderer  = require './renderer'

        @lexer    = new Lexer    @
        @parser   = new Parser   @
        @scoper   = new Scoper   @
        @stripol  = new Stripol  @
        @returner = new Returner @
        @renderer = new Renderer @

    #  0000000   0000000   00     00  00000000   000  000      00000000
    # 000       000   000  000   000  000   000  000  000      000
    # 000       000   000  000000000  00000000   000  000      0000000
    # 000       000   000  000 0 000  000        000  000      000
    #  0000000   0000000   000   000  000        000  0000000  00000000

    @compile: (text, opt={}) -> (new Kode opt).compile text
    compile: (text, file) ->

        return '' if empty kstr.strip text

        ast = @ast text

        if @args.parse then print.ast 'ast' ast
        if @args.astr  then log print.astr ast, @args.scope

        js = @renderer.render ast, file

        if @args.js or @args.debug
            print.code 'js' js 
        js

    ast: (text) ->

        text += '\n' if not text[-1] == '\n'

        print.code 'kode' text, 'coffee' if @args.verbose or @args.debug or @args.kode

        tokens = @lexer.tokenize text

        if @args.raw    then print.noon 'raw tokens' tokens
        if @args.tokens then print.tokens 'tokens' tokens

        block = @lexer.blockify tokens

        if @args.raw   then print.noon 'raw block' block
        if @args.block then print.block 'tl block' block

        @returner.collect @scoper.collect @stripol.collect @parser.parse block

    astr: (text, scopes) -> print.astr @ast(text), scopes
        
    # 00000000  000   000   0000000   000
    # 000       000   000  000   000  000
    # 0000000    000 000   000000000  000
    # 000          000     000   000  000
    # 00000000      0      000   000  0000000

    eval: (text, file) ->

        return if empty text

        vm = require 'vm'

        sandbox = vm.createContext()
        sandbox.global = global

        sandbox.__filename = file ? 'eval'
        sandbox.__dirname  = slash.dir sandbox.__filename
        sandbox.console    = console

        if not (sandbox.module or sandbox.require) or file
            Module = require 'module'
            sandbox.module  = _module  = new Module 'eval'
            sandbox.require = _require = (file) -> Module._load file, _module, true
            _module.filename = sandbox.__filename
            for r in Object.getOwnPropertyNames require
                if r not in ['paths' 'arguments' 'caller']
                    _require[r] = require[r]

            _require.paths = _module.paths = Module._nodeModulePaths process.cwd()
            _require.resolve = (request) -> Module._resolveFilename request, _module

        try
            js = @compile text, file
            vm.runInContext js, sandbox
        catch err
            error err, text
            throw err

    #  0000000  000      000
    # 000       000      000
    # 000       000      000
    # 000       000      000
    #  0000000  0000000  000

    cli: ->

        if @args.compile
            log @compile @args.compile
            return
            
        if @args.eval
            log @eval @args.eval
            return

        return if not @args.files.length

        for file in @args.files

            file = slash.resolve file
            log gray file if @args.verbose

            text = slash.readText file

            if empty text then error Y4 r2 "can't read #{R3 y5 file}"; continue

            if @args.outdir
                js  = @compile text, file
                out = slash.resolve @args.outdir, slash.file file
                out = slash.swapExt out, 'js'
                if not slash.writeText out, js
                    error R2 y3 "can't write #{R3 y6 out}"
            else if @args.js
                @compile text, file
            else if @args.run
                @eval text, file
            else
                log @compile text
            
# 00     00   0000000   000  000   000
# 000   000  000   000  000  0000  000
# 000000000  000000000  000  000 0 000
# 000 0 000  000   000  000  000  0000
# 000   000  000   000  000  000   000

module.exports = Kode

if not module.parent or slash.resolve(module.parent.path).endsWith '/kode/bin'

    args = karg """
        kode option
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

        version  #{pkg.version}
        """

    register()
    kode = new Kode args
    kode.cli()
