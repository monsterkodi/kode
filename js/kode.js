// koffee 1.20.0

/*
000   000   0000000   0000000    00000000
000  000   000   000  000   000  000
0000000    000   000  000   000  0000000
000  000   000   000  000   000  000
000   000   0000000   0000000    00000000
 */
var Kode, args, childp, empty, karg, klor, kode, kstr, pkg, print, ref, register, slash;

slash = require('kslash');

kstr = require('kstr');

klor = require('klor');

karg = require('karg');

childp = require('child_process');

print = require('./print');

pkg = require(__dirname + "/../package");

ref = require('./utils'), empty = ref.empty, register = ref.register;

klor.kolor.globalize();

Kode = (function() {
    function Kode(args1) {
        var Lexer, Parser, Renderer, Returner, Scoper, Stripol;
        this.args = args1;
        if (this.args != null) {
            this.args;
        } else {
            this.args = {};
        }
        if (this.args.verbose) {
            this.args.debug = this.args.block = this.args.tokens = this.args.parse = true;
        }
        Lexer = require('./lexer');
        Parser = require('./parser');
        Scoper = require('./scoper');
        Stripol = require('./stripol');
        Returner = require('./returner');
        Renderer = require('./renderer');
        this.lexer = new Lexer(this);
        this.parser = new Parser(this);
        this.scoper = new Scoper(this);
        this.stripol = new Stripol(this);
        this.returner = new Returner(this);
        this.renderer = new Renderer(this);
    }

    Kode.compile = function(text, opt) {
        if (opt == null) {
            opt = {};
        }
        return (new Kode(opt)).compile(text);
    };

    Kode.prototype.compile = function(text, file) {
        var ast, js;
        if (empty(kstr.strip(text))) {
            return '';
        }
        ast = this.ast(text);
        if (this.args.parse) {
            print.ast('ast', ast);
        }
        if (this.args.astr) {
            console.log(print.astr(ast, this.args.scope));
        }
        js = this.renderer.render(ast, file);
        if (this.args.header && kstr.strip(js).length) {
            js = ("// monsterkodi/kode " + pkg.version + "\n\n") + js;
        }
        if (this.args.js || this.args.debug) {
            print.code('js', js);
        }
        return js;
    };

    Kode.prototype.ast = function(text) {
        var block, tokens;
        if (!text.slice(-1)[0] === '\n') {
            text += '\n';
        }
        if (this.args.verbose || this.args.debug || this.args.kode) {
            print.code('kode', text, 'coffee');
        }
        tokens = this.lexer.tokenize(text);
        if (this.args.raw) {
            print.noon('raw tokens', tokens);
        }
        if (this.args.tokens) {
            print.tokens('tokens', tokens);
        }
        block = this.lexer.blockify(tokens);
        if (this.args.raw) {
            print.noon('raw block', block);
        }
        if (this.args.block) {
            print.block('tl block', block);
        }
        return this.returner.collect(this.scoper.collect(this.stripol.collect(this.parser.parse(block))));
    };

    Kode.prototype.astr = function(text, scopes) {
        return print.astr(this.ast(text), scopes);
    };

    Kode.prototype["eval"] = function(text, file) {
        var Module, _module, _require, err, i, js, len, r, ref1, sandbox, vm;
        if (empty(text)) {
            return;
        }
        vm = require('vm');
        sandbox = vm.createContext();
        sandbox.global = global;
        sandbox.__filename = file != null ? file : 'eval';
        sandbox.__dirname = slash.dir(sandbox.__filename);
        sandbox.console = console;
        if (!(sandbox.module || sandbox.require) || file) {
            Module = require('module');
            sandbox.module = _module = new Module('eval');
            sandbox.require = _require = function(file) {
                return Module._load(file, _module, true);
            };
            _module.filename = sandbox.__filename;
            ref1 = Object.getOwnPropertyNames(require);
            for (i = 0, len = ref1.length; i < len; i++) {
                r = ref1[i];
                if (r !== 'paths' && r !== 'arguments' && r !== 'caller') {
                    _require[r] = require[r];
                }
            }
            _require.paths = _module.paths = Module._nodeModulePaths(process.cwd());
            _require.resolve = function(request) {
                return Module._resolveFilename(request, _module);
            };
        }
        try {
            js = this.compile(text, file);
            return vm.runInContext(js, sandbox);
        } catch (error) {
            err = error;
            console.error(err, text);
            throw err;
        }
    };

    Kode.prototype.cli = function() {
        var file, i, js, len, out, ref1, results, text;
        if (this.args.compile) {
            console.log(this.compile(this.args.compile));
            return;
        }
        if (this.args["eval"]) {
            console.log(this["eval"](this.args["eval"]));
            return;
        }
        if (!this.args.files.length) {
            return;
        }
        ref1 = this.args.files;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
            file = ref1[i];
            file = slash.resolve(file);
            if (this.args.verbose) {
                console.log(gray(file));
            }
            text = slash.readText(file);
            if (empty(text)) {
                console.error(Y4(r2("can't read " + (R3(y5(file))))));
                continue;
            }
            if (this.args.outdir) {
                js = this.compile(text, file);
                out = slash.resolve(this.args.outdir, slash.file(file));
                out = slash.swapExt(out, 'js');
                js = ("// kode " + pkg.version + "\n\n") + js;
                if (!slash.writeText(out, js)) {
                    results.push(console.error(R2(y3("can't write " + (R3(y6(out)))))));
                } else {
                    results.push(void 0);
                }
            } else if (this.args.js) {
                results.push(this.compile(text, file));
            } else if (this.args.run) {
                results.push(this["eval"](text, file));
            } else {
                results.push(console.log(this.compile(text)));
            }
        }
        return results;
    };

    return Kode;

})();

module.exports = Kode;

if (!module.parent || slash.resolve(module.parent.path).endsWith('/kode/bin')) {
    args = karg("kode option\n    files       . **\n    eval        . ? evaluate a string and print the result\n    compile     . ? compile a string and print the result\n    outdir      . ? output directory for transpiled files\n    run         . ? execute file                            . = true\n    map         . ? generate inline source maps             . = true\n    kode        . ? pretty print input code                 . = false\n    js          . ? pretty print transpiled js code         . = false\n    header      . ? prepend output with version header      . = false  . - H\n    tokens      . ? print tokens                            . = false  . - T\n    block       . ? print block tree                        . = false  . - B\n    parse       . ? print parse tree                        . = false  . - P\n    astr        . ? print parse tree as string              . = false  . - A\n    scope       . ? print scopes                            . = false  . - S\n    verbose     . ? log more                                . = false\n    debug       . ? log debug                               . = false\n    raw         . ? log raw                                 . = false  . - R\n\nversion  " + pkg.version);
    register();
    kode = new Kode(args);
    kode.cli();
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29kZS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImtvZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEtBQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxNQUFBLEdBQVMsT0FBQSxDQUFRLGVBQVI7O0FBQ1QsS0FBQSxHQUFTLE9BQUEsQ0FBUSxTQUFSOztBQUNULEdBQUEsR0FBUyxPQUFBLENBQVcsU0FBRCxHQUFXLGFBQXJCOztBQUVULE1BQXNCLE9BQUEsQ0FBUSxTQUFSLENBQXRCLEVBQUUsaUJBQUYsRUFBUzs7QUFFVCxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVgsQ0FBQTs7QUFFTTtJQUVDLGNBQUMsS0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsT0FBRDs7WUFFQSxJQUFDLENBQUE7O1lBQUQsSUFBQyxDQUFBLE9BQVE7O1FBRVQsSUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQVQ7WUFBc0IsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLEdBQWMsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLEdBQWMsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLEdBQWUsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLEdBQWMsS0FBL0U7O1FBRUEsS0FBQSxHQUFZLE9BQUEsQ0FBUSxTQUFSO1FBQ1osTUFBQSxHQUFZLE9BQUEsQ0FBUSxVQUFSO1FBQ1osTUFBQSxHQUFZLE9BQUEsQ0FBUSxVQUFSO1FBQ1osT0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSO1FBQ1osUUFBQSxHQUFZLE9BQUEsQ0FBUSxZQUFSO1FBQ1osUUFBQSxHQUFZLE9BQUEsQ0FBUSxZQUFSO1FBRVosSUFBQyxDQUFBLEtBQUQsR0FB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QUFULEVBQWUsSUFBZixHQURDO2FBQUEsTUFFQSxJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBVDs2QkFDRCxJQUFDLEVBQUEsSUFBQSxFQUFELENBQU0sSUFBTixFQUFZLElBQVosR0FEQzthQUFBLE1BQUE7NkJBR0YsT0FBQSxDQUFDLEdBQUQsQ0FBSyxJQUFDLENBQUEsT0FBRCxDQUFTLElBQVQsQ0FBTCxHQUhFOztBQWxCVDs7SUFaQzs7Ozs7O0FBeUNULE1BQU0sQ0FBQyxPQUFQLEdBQWlCOztBQUVqQixJQUFHLENBQUksTUFBTSxDQUFDLE1BQVgsSUFBcUIsS0FBSyxDQUFDLE9BQU4sQ0FBYyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQTVCLENBQWlDLENBQUMsUUFBbEMsQ0FBMkMsV0FBM0MsQ0FBeEI7SUFFSSxJQUFBLEdBQU8sSUFBQSxDQUFLLDRxQ0FBQSxHQW9CRyxHQUFHLENBQUMsT0FwQlo7SUF1QlAsUUFBQSxDQUFBO0lBQ0EsSUFBQSxHQUFPLElBQUksSUFBSixDQUFTLElBQVQ7SUFDUCxJQUFJLENBQUMsR0FBTCxDQUFBLEVBM0JKIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4wMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4jIyNcblxuc2xhc2ggID0gcmVxdWlyZSAna3NsYXNoJ1xua3N0ciAgID0gcmVxdWlyZSAna3N0cidcbmtsb3IgICA9IHJlcXVpcmUgJ2tsb3InXG5rYXJnICAgPSByZXF1aXJlICdrYXJnJ1xuY2hpbGRwID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbnByaW50ICA9IHJlcXVpcmUgJy4vcHJpbnQnXG5wa2cgICAgPSByZXF1aXJlIFwiI3tfX2Rpcm5hbWV9Ly4uL3BhY2thZ2VcIlxuXG57IGVtcHR5LCByZWdpc3RlciB9ID0gcmVxdWlyZSAnLi91dGlscydcblxua2xvci5rb2xvci5nbG9iYWxpemUoKVxuXG5jbGFzcyBLb2RlXG5cbiAgICBAOiAoQGFyZ3MpIC0+XG5cbiAgICAgICAgQGFyZ3MgPz0ge31cblxuICAgICAgICBpZiBAYXJncy52ZXJib3NlIHRoZW4gQGFyZ3MuZGVidWcgPSBAYXJncy5ibG9jayA9IEBhcmdzLnRva2VucyA9IEBhcmdzLnBhcnNlID0gdHJ1ZVxuXG4gICAgICAgIExleGVyICAgICA9IHJlcXVpcmUgJy4vbGV4ZXInXG4gICAgICAgIFBhcnNlciAgICA9IHJlcXVpcmUgJy4vcGFyc2VyJ1xuICAgICAgICBTY29wZXIgICAgPSByZXF1aXJlICcuL3Njb3BlcidcbiAgICAgICAgU3RyaXBvbCAgID0gcmVxdWlyZSAnLi9zdHJpcG9sJ1xuICAgICAgICBSZXR1cm5lciAgPSByZXF1aXJlICcuL3JldHVybmVyJ1xuICAgICAgICBSZW5kZXJlciAgPSByZXF1aXJlICcuL3JlbmRlcmVyJ1xuXG4gICAgICAgIEBsZXhlciAgICA9IG5ldyBMZXhlciAgICBAXG4gICAgICAgIEBwYXJzZXIgICA9IG5ldyBQYXJzZXIgICBAXG4gICAgICAgIEBzY29wZXIgICA9IG5ldyBTY29wZXIgICBAXG4gICAgICAgIEBzdHJpcG9sICA9IG5ldyBTdHJpcG9sICBAXG4gICAgICAgIEByZXR1cm5lciA9IG5ldyBSZXR1cm5lciBAXG4gICAgICAgIEByZW5kZXJlciA9IG5ldyBSZW5kZXJlciBAXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcblxuICAgIEBjb21waWxlOiAodGV4dCwgb3B0PXt9KSAtPiAobmV3IEtvZGUgb3B0KS5jb21waWxlIHRleHRcbiAgICBjb21waWxlOiAodGV4dCwgZmlsZSkgLT5cblxuICAgICAgICByZXR1cm4gJycgaWYgZW1wdHkga3N0ci5zdHJpcCB0ZXh0XG5cbiAgICAgICAgYXN0ID0gQGFzdCB0ZXh0XG5cbiAgICAgICAgaWYgQGFyZ3MucGFyc2UgdGhlbiBwcmludC5hc3QgJ2FzdCcgYXN0XG4gICAgICAgIGlmIEBhcmdzLmFzdHIgIHRoZW4gbG9nIHByaW50LmFzdHIgYXN0LCBAYXJncy5zY29wZVxuXG4gICAgICAgIGpzID0gQHJlbmRlcmVyLnJlbmRlciBhc3QsIGZpbGVcblxuICAgICAgICBpZiBAYXJncy5oZWFkZXIgYW5kIGtzdHIuc3RyaXAoanMpLmxlbmd0aFxuICAgICAgICAgICAganMgPSBcIi8vIG1vbnN0ZXJrb2RpL2tvZGUgI3twa2cudmVyc2lvbn1cXG5cXG5cIiArIGpzXG5cbiAgICAgICAgaWYgQGFyZ3MuanMgb3IgQGFyZ3MuZGVidWdcbiAgICAgICAgICAgIHByaW50LmNvZGUgJ2pzJyBqcyBcbiAgICAgICAganNcblxuICAgIGFzdDogKHRleHQpIC0+XG5cbiAgICAgICAgdGV4dCArPSAnXFxuJyBpZiBub3QgdGV4dFstMV0gPT0gJ1xcbidcblxuICAgICAgICBwcmludC5jb2RlICdrb2RlJyB0ZXh0LCAnY29mZmVlJyBpZiBAYXJncy52ZXJib3NlIG9yIEBhcmdzLmRlYnVnIG9yIEBhcmdzLmtvZGVcblxuICAgICAgICB0b2tlbnMgPSBAbGV4ZXIudG9rZW5pemUgdGV4dFxuXG4gICAgICAgIGlmIEBhcmdzLnJhdyAgICB0aGVuIHByaW50Lm5vb24gJ3JhdyB0b2tlbnMnIHRva2Vuc1xuICAgICAgICBpZiBAYXJncy50b2tlbnMgdGhlbiBwcmludC50b2tlbnMgJ3Rva2VucycgdG9rZW5zXG5cbiAgICAgICAgYmxvY2sgPSBAbGV4ZXIuYmxvY2tpZnkgdG9rZW5zXG5cbiAgICAgICAgaWYgQGFyZ3MucmF3ICAgdGhlbiBwcmludC5ub29uICdyYXcgYmxvY2snIGJsb2NrXG4gICAgICAgIGlmIEBhcmdzLmJsb2NrIHRoZW4gcHJpbnQuYmxvY2sgJ3RsIGJsb2NrJyBibG9ja1xuXG4gICAgICAgIEByZXR1cm5lci5jb2xsZWN0IEBzY29wZXIuY29sbGVjdCBAc3RyaXBvbC5jb2xsZWN0IEBwYXJzZXIucGFyc2UgYmxvY2tcblxuICAgIGFzdHI6ICh0ZXh0LCBzY29wZXMpIC0+IHByaW50LmFzdHIgQGFzdCh0ZXh0KSwgc2NvcGVzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAwICAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgZXZhbDogKHRleHQsIGZpbGUpIC0+XG5cbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IHRleHRcblxuICAgICAgICB2bSA9IHJlcXVpcmUgJ3ZtJ1xuXG4gICAgICAgIHNhbmRib3ggPSB2bS5jcmVhdGVDb250ZXh0KClcbiAgICAgICAgc2FuZGJveC5nbG9iYWwgPSBnbG9iYWxcblxuICAgICAgICBzYW5kYm94Ll9fZmlsZW5hbWUgPSBmaWxlID8gJ2V2YWwnXG4gICAgICAgIHNhbmRib3guX19kaXJuYW1lICA9IHNsYXNoLmRpciBzYW5kYm94Ll9fZmlsZW5hbWVcbiAgICAgICAgc2FuZGJveC5jb25zb2xlICAgID0gY29uc29sZVxuXG4gICAgICAgIGlmIG5vdCAoc2FuZGJveC5tb2R1bGUgb3Igc2FuZGJveC5yZXF1aXJlKSBvciBmaWxlXG4gICAgICAgICAgICBNb2R1bGUgPSByZXF1aXJlICdtb2R1bGUnXG4gICAgICAgICAgICBzYW5kYm94Lm1vZHVsZSAgPSBfbW9kdWxlICA9IG5ldyBNb2R1bGUgJ2V2YWwnXG4gICAgICAgICAgICBzYW5kYm94LnJlcXVpcmUgPSBfcmVxdWlyZSA9IChmaWxlKSAtPiBNb2R1bGUuX2xvYWQgZmlsZSwgX21vZHVsZSwgdHJ1ZVxuICAgICAgICAgICAgX21vZHVsZS5maWxlbmFtZSA9IHNhbmRib3guX19maWxlbmFtZVxuICAgICAgICAgICAgZm9yIHIgaW4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgcmVxdWlyZVxuICAgICAgICAgICAgICAgIGlmIHIgbm90IGluIFsncGF0aHMnICdhcmd1bWVudHMnICdjYWxsZXInXVxuICAgICAgICAgICAgICAgICAgICBfcmVxdWlyZVtyXSA9IHJlcXVpcmVbcl1cblxuICAgICAgICAgICAgX3JlcXVpcmUucGF0aHMgPSBfbW9kdWxlLnBhdGhzID0gTW9kdWxlLl9ub2RlTW9kdWxlUGF0aHMgcHJvY2Vzcy5jd2QoKVxuICAgICAgICAgICAgX3JlcXVpcmUucmVzb2x2ZSA9IChyZXF1ZXN0KSAtPiBNb2R1bGUuX3Jlc29sdmVGaWxlbmFtZSByZXF1ZXN0LCBfbW9kdWxlXG5cbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBqcyA9IEBjb21waWxlIHRleHQsIGZpbGVcbiAgICAgICAgICAgIHZtLnJ1bkluQ29udGV4dCBqcywgc2FuZGJveFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGVycm9yIGVyciwgdGV4dFxuICAgICAgICAgICAgdGhyb3cgZXJyXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDBcblxuICAgIGNsaTogLT5cblxuICAgICAgICBpZiBAYXJncy5jb21waWxlXG4gICAgICAgICAgICBsb2cgQGNvbXBpbGUgQGFyZ3MuY29tcGlsZVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQGFyZ3MuZXZhbFxuICAgICAgICAgICAgbG9nIEBldmFsIEBhcmdzLmV2YWxcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHJldHVybiBpZiBub3QgQGFyZ3MuZmlsZXMubGVuZ3RoXG5cbiAgICAgICAgZm9yIGZpbGUgaW4gQGFyZ3MuZmlsZXNcblxuICAgICAgICAgICAgZmlsZSA9IHNsYXNoLnJlc29sdmUgZmlsZVxuICAgICAgICAgICAgbG9nIGdyYXkgZmlsZSBpZiBAYXJncy52ZXJib3NlXG5cbiAgICAgICAgICAgIHRleHQgPSBzbGFzaC5yZWFkVGV4dCBmaWxlXG5cbiAgICAgICAgICAgIGlmIGVtcHR5IHRleHQgdGhlbiBlcnJvciBZNCByMiBcImNhbid0IHJlYWQgI3tSMyB5NSBmaWxlfVwiOyBjb250aW51ZVxuXG4gICAgICAgICAgICBpZiBAYXJncy5vdXRkaXJcbiAgICAgICAgICAgICAgICBqcyAgPSBAY29tcGlsZSB0ZXh0LCBmaWxlXG4gICAgICAgICAgICAgICAgb3V0ID0gc2xhc2gucmVzb2x2ZSBAYXJncy5vdXRkaXIsIHNsYXNoLmZpbGUgZmlsZVxuICAgICAgICAgICAgICAgIG91dCA9IHNsYXNoLnN3YXBFeHQgb3V0LCAnanMnXG4gICAgICAgICAgICAgICAganMgID0gXCIvLyBrb2RlICN7cGtnLnZlcnNpb259XFxuXFxuXCIgKyBqc1xuICAgICAgICAgICAgICAgIGlmIG5vdCBzbGFzaC53cml0ZVRleHQgb3V0LCBqc1xuICAgICAgICAgICAgICAgICAgICBlcnJvciBSMiB5MyBcImNhbid0IHdyaXRlICN7UjMgeTYgb3V0fVwiXG4gICAgICAgICAgICBlbHNlIGlmIEBhcmdzLmpzXG4gICAgICAgICAgICAgICAgQGNvbXBpbGUgdGV4dCwgZmlsZVxuICAgICAgICAgICAgZWxzZSBpZiBAYXJncy5ydW5cbiAgICAgICAgICAgICAgICBAZXZhbCB0ZXh0LCBmaWxlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbG9nIEBjb21waWxlIHRleHRcbiAgICAgICAgICAgIFxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG5cbm1vZHVsZS5leHBvcnRzID0gS29kZVxuXG5pZiBub3QgbW9kdWxlLnBhcmVudCBvciBzbGFzaC5yZXNvbHZlKG1vZHVsZS5wYXJlbnQucGF0aCkuZW5kc1dpdGggJy9rb2RlL2JpbidcblxuICAgIGFyZ3MgPSBrYXJnIFwiXCJcIlxuICAgICAgICBrb2RlIG9wdGlvblxuICAgICAgICAgICAgZmlsZXMgICAgICAgLiAqKlxuICAgICAgICAgICAgZXZhbCAgICAgICAgLiA/IGV2YWx1YXRlIGEgc3RyaW5nIGFuZCBwcmludCB0aGUgcmVzdWx0XG4gICAgICAgICAgICBjb21waWxlICAgICAuID8gY29tcGlsZSBhIHN0cmluZyBhbmQgcHJpbnQgdGhlIHJlc3VsdFxuICAgICAgICAgICAgb3V0ZGlyICAgICAgLiA/IG91dHB1dCBkaXJlY3RvcnkgZm9yIHRyYW5zcGlsZWQgZmlsZXNcbiAgICAgICAgICAgIHJ1biAgICAgICAgIC4gPyBleGVjdXRlIGZpbGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IHRydWVcbiAgICAgICAgICAgIG1hcCAgICAgICAgIC4gPyBnZW5lcmF0ZSBpbmxpbmUgc291cmNlIG1hcHMgICAgICAgICAgICAgLiA9IHRydWVcbiAgICAgICAgICAgIGtvZGUgICAgICAgIC4gPyBwcmV0dHkgcHJpbnQgaW5wdXQgY29kZSAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgICAgICBqcyAgICAgICAgICAuID8gcHJldHR5IHByaW50IHRyYW5zcGlsZWQganMgY29kZSAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICAgICAgaGVhZGVyICAgICAgLiA/IHByZXBlbmQgb3V0cHV0IHdpdGggdmVyc2lvbiBoZWFkZXIgICAgICAuID0gZmFsc2UgIC4gLSBIXG4gICAgICAgICAgICB0b2tlbnMgICAgICAuID8gcHJpbnQgdG9rZW5zICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIFRcbiAgICAgICAgICAgIGJsb2NrICAgICAgIC4gPyBwcmludCBibG9jayB0cmVlICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gQlxuICAgICAgICAgICAgcGFyc2UgICAgICAgLiA/IHByaW50IHBhcnNlIHRyZWUgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBQXG4gICAgICAgICAgICBhc3RyICAgICAgICAuID8gcHJpbnQgcGFyc2UgdHJlZSBhcyBzdHJpbmcgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIEFcbiAgICAgICAgICAgIHNjb3BlICAgICAgIC4gPyBwcmludCBzY29wZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gU1xuICAgICAgICAgICAgdmVyYm9zZSAgICAgLiA/IGxvZyBtb3JlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgICAgIGRlYnVnICAgICAgIC4gPyBsb2cgZGVidWcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgICAgICByYXcgICAgICAgICAuID8gbG9nIHJhdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIFJcblxuICAgICAgICB2ZXJzaW9uICAje3BrZy52ZXJzaW9ufVxuICAgICAgICBcIlwiXCJcblxuICAgIHJlZ2lzdGVyKClcbiAgICBrb2RlID0gbmV3IEtvZGUgYXJnc1xuICAgIGtvZGUuY2xpKClcbiJdfQ==
//# sourceURL=../coffee/kode.coffee