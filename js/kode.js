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
        this.version = pkg.version;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29kZS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImtvZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEtBQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxNQUFBLEdBQVMsT0FBQSxDQUFRLGVBQVI7O0FBQ1QsS0FBQSxHQUFTLE9BQUEsQ0FBUSxTQUFSOztBQUNULEdBQUEsR0FBUyxPQUFBLENBQVcsU0FBRCxHQUFXLGFBQXJCOztBQUVULE1BQXNCLE9BQUEsQ0FBUSxTQUFSLENBQXRCLEVBQUUsaUJBQUYsRUFBUzs7QUFFVCxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVgsQ0FBQTs7QUFFTTtJQUVDLGNBQUMsS0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBRyxDQUFDOztZQUVmLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsT0FBUTs7UUFFVCxJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBVDtZQUFzQixJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sR0FBYyxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sR0FBYyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sR0FBZSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sR0FBYyxLQUEvRTs7UUFFQSxLQUFBLEdBQVksT0FBQSxDQUFRLFNBQVI7UUFDWixNQUFBLEdBQVksT0FBQSxDQUFRLFVBQVI7UUFDWixNQUFBLEdBQVksT0FBQSxDQUFRLFVBQVI7UUFDWixPQUFBLEdBQVksT0FBQSxDQUFRLFdBQVI7UUFDWixRQUFBLEdBQVksT0FBQSxDQUFRLFlBQVI7UUFDWixRQUFBLEdBQVksT0FB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OztBQXdDVCxNQUFNLENBQUMsT0FBUCxHQUFpQjs7QUFFakIsSUFBRyxDQUFJLE1BQU0sQ0FBQyxNQUFYLElBQXFCLEtBQUssQ0FBQyxPQUFOLENBQWMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUE1QixDQUFpQyxDQUFDLFFBQWxDLENBQTJDLFdBQTNDLENBQXhCO0lBRUksSUFBQSxHQUFPLElBQUEsQ0FBSyw0cUNBQUEsR0FvQkcsR0FBRyxDQUFDLE9BcEJaO0lBdUJQLFFBQUEsQ0FBQTtJQUNBLElBQUEsR0FBTyxJQUFJLElBQUosQ0FBUyxJQUFUO0lBQ1AsSUFBSSxDQUFDLEdBQUwsQ0FBQSxFQTNCSiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuIyMjXG5cbnNsYXNoICA9IHJlcXVpcmUgJ2tzbGFzaCdcbmtzdHIgICA9IHJlcXVpcmUgJ2tzdHInXG5rbG9yICAgPSByZXF1aXJlICdrbG9yJ1xua2FyZyAgID0gcmVxdWlyZSAna2FyZydcbmNoaWxkcCA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG5wcmludCAgPSByZXF1aXJlICcuL3ByaW50J1xucGtnICAgID0gcmVxdWlyZSBcIiN7X19kaXJuYW1lfS8uLi9wYWNrYWdlXCJcblxueyBlbXB0eSwgcmVnaXN0ZXIgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmtsb3Iua29sb3IuZ2xvYmFsaXplKClcblxuY2xhc3MgS29kZVxuXG4gICAgQDogKEBhcmdzKSAtPlxuXG4gICAgICAgIEB2ZXJzaW9uID0gcGtnLnZlcnNpb25cbiAgICAgICAgXG4gICAgICAgIEBhcmdzID89IHt9XG5cbiAgICAgICAgaWYgQGFyZ3MudmVyYm9zZSB0aGVuIEBhcmdzLmRlYnVnID0gQGFyZ3MuYmxvY2sgPSBAYXJncy50b2tlbnMgPSBAYXJncy5wYXJzZSA9IHRydWVcblxuICAgICAgICBMZXhlciAgICAgPSByZXF1aXJlICcuL2xleGVyJ1xuICAgICAgICBQYXJzZXIgICAgPSByZXF1aXJlICcuL3BhcnNlcidcbiAgICAgICAgU2NvcGVyICAgID0gcmVxdWlyZSAnLi9zY29wZXInXG4gICAgICAgIFN0cmlwb2wgICA9IHJlcXVpcmUgJy4vc3RyaXBvbCdcbiAgICAgICAgUmV0dXJuZXIgID0gcmVxdWlyZSAnLi9yZXR1cm5lcidcbiAgICAgICAgUmVuZGVyZXIgID0gcmVxdWlyZSAnLi9yZW5kZXJlcidcblxuICAgICAgICBAbGV4ZXIgICAgPSBuZXcgTGV4ZXIgICAgQFxuICAgICAgICBAcGFyc2VyICAgPSBuZXcgUGFyc2VyICAgQFxuICAgICAgICBAc2NvcGVyICAgPSBuZXcgU2NvcGVyICAgQFxuICAgICAgICBAc3RyaXBvbCAgPSBuZXcgU3RyaXBvbCAgQFxuICAgICAgICBAcmV0dXJuZXIgPSBuZXcgUmV0dXJuZXIgQFxuICAgICAgICBAcmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIgQFxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwXG5cbiAgICBAY29tcGlsZTogKHRleHQsIG9wdD17fSkgLT4gKG5ldyBLb2RlIG9wdCkuY29tcGlsZSB0ZXh0XG4gICAgY29tcGlsZTogKHRleHQsIGZpbGUpIC0+XG5cbiAgICAgICAgcmV0dXJuICcnIGlmIGVtcHR5IGtzdHIuc3RyaXAgdGV4dFxuXG4gICAgICAgIGFzdCA9IEBhc3QgdGV4dFxuXG4gICAgICAgIGlmIEBhcmdzLnBhcnNlIHRoZW4gcHJpbnQuYXN0ICdhc3QnIGFzdFxuICAgICAgICBpZiBAYXJncy5hc3RyICB0aGVuIGxvZyBwcmludC5hc3RyIGFzdCwgQGFyZ3Muc2NvcGVcblxuICAgICAgICBqcyA9IEByZW5kZXJlci5yZW5kZXIgYXN0LCBmaWxlXG5cbiAgICAgICAgaWYgQGFyZ3MuanMgb3IgQGFyZ3MuZGVidWdcbiAgICAgICAgICAgIHByaW50LmNvZGUgJ2pzJyBqcyBcbiAgICAgICAganNcblxuICAgIGFzdDogKHRleHQpIC0+XG5cbiAgICAgICAgdGV4dCArPSAnXFxuJyBpZiBub3QgdGV4dFstMV0gPT0gJ1xcbidcblxuICAgICAgICBwcmludC5jb2RlICdrb2RlJyB0ZXh0LCAnY29mZmVlJyBpZiBAYXJncy52ZXJib3NlIG9yIEBhcmdzLmRlYnVnIG9yIEBhcmdzLmtvZGVcblxuICAgICAgICB0b2tlbnMgPSBAbGV4ZXIudG9rZW5pemUgdGV4dFxuXG4gICAgICAgIGlmIEBhcmdzLnJhdyAgICB0aGVuIHByaW50Lm5vb24gJ3JhdyB0b2tlbnMnIHRva2Vuc1xuICAgICAgICBpZiBAYXJncy50b2tlbnMgdGhlbiBwcmludC50b2tlbnMgJ3Rva2VucycgdG9rZW5zXG5cbiAgICAgICAgYmxvY2sgPSBAbGV4ZXIuYmxvY2tpZnkgdG9rZW5zXG5cbiAgICAgICAgaWYgQGFyZ3MucmF3ICAgdGhlbiBwcmludC5ub29uICdyYXcgYmxvY2snIGJsb2NrXG4gICAgICAgIGlmIEBhcmdzLmJsb2NrIHRoZW4gcHJpbnQuYmxvY2sgJ3RsIGJsb2NrJyBibG9ja1xuXG4gICAgICAgIEByZXR1cm5lci5jb2xsZWN0IEBzY29wZXIuY29sbGVjdCBAc3RyaXBvbC5jb2xsZWN0IEBwYXJzZXIucGFyc2UgYmxvY2tcblxuICAgIGFzdHI6ICh0ZXh0LCBzY29wZXMpIC0+IHByaW50LmFzdHIgQGFzdCh0ZXh0KSwgc2NvcGVzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAwICAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgZXZhbDogKHRleHQsIGZpbGUpIC0+XG5cbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IHRleHRcblxuICAgICAgICB2bSA9IHJlcXVpcmUgJ3ZtJ1xuXG4gICAgICAgIHNhbmRib3ggPSB2bS5jcmVhdGVDb250ZXh0KClcbiAgICAgICAgc2FuZGJveC5nbG9iYWwgPSBnbG9iYWxcblxuICAgICAgICBzYW5kYm94Ll9fZmlsZW5hbWUgPSBmaWxlID8gJ2V2YWwnXG4gICAgICAgIHNhbmRib3guX19kaXJuYW1lICA9IHNsYXNoLmRpciBzYW5kYm94Ll9fZmlsZW5hbWVcbiAgICAgICAgc2FuZGJveC5jb25zb2xlICAgID0gY29uc29sZVxuXG4gICAgICAgIGlmIG5vdCAoc2FuZGJveC5tb2R1bGUgb3Igc2FuZGJveC5yZXF1aXJlKSBvciBmaWxlXG4gICAgICAgICAgICBNb2R1bGUgPSByZXF1aXJlICdtb2R1bGUnXG4gICAgICAgICAgICBzYW5kYm94Lm1vZHVsZSAgPSBfbW9kdWxlICA9IG5ldyBNb2R1bGUgJ2V2YWwnXG4gICAgICAgICAgICBzYW5kYm94LnJlcXVpcmUgPSBfcmVxdWlyZSA9IChmaWxlKSAtPiBNb2R1bGUuX2xvYWQgZmlsZSwgX21vZHVsZSwgdHJ1ZVxuICAgICAgICAgICAgX21vZHVsZS5maWxlbmFtZSA9IHNhbmRib3guX19maWxlbmFtZVxuICAgICAgICAgICAgZm9yIHIgaW4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgcmVxdWlyZVxuICAgICAgICAgICAgICAgIGlmIHIgbm90IGluIFsncGF0aHMnICdhcmd1bWVudHMnICdjYWxsZXInXVxuICAgICAgICAgICAgICAgICAgICBfcmVxdWlyZVtyXSA9IHJlcXVpcmVbcl1cblxuICAgICAgICAgICAgX3JlcXVpcmUucGF0aHMgPSBfbW9kdWxlLnBhdGhzID0gTW9kdWxlLl9ub2RlTW9kdWxlUGF0aHMgcHJvY2Vzcy5jd2QoKVxuICAgICAgICAgICAgX3JlcXVpcmUucmVzb2x2ZSA9IChyZXF1ZXN0KSAtPiBNb2R1bGUuX3Jlc29sdmVGaWxlbmFtZSByZXF1ZXN0LCBfbW9kdWxlXG5cbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBqcyA9IEBjb21waWxlIHRleHQsIGZpbGVcbiAgICAgICAgICAgIHZtLnJ1bkluQ29udGV4dCBqcywgc2FuZGJveFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGVycm9yIGVyciwgdGV4dFxuICAgICAgICAgICAgdGhyb3cgZXJyXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDBcblxuICAgIGNsaTogLT5cblxuICAgICAgICBpZiBAYXJncy5jb21waWxlXG4gICAgICAgICAgICBsb2cgQGNvbXBpbGUgQGFyZ3MuY29tcGlsZVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQGFyZ3MuZXZhbFxuICAgICAgICAgICAgbG9nIEBldmFsIEBhcmdzLmV2YWxcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHJldHVybiBpZiBub3QgQGFyZ3MuZmlsZXMubGVuZ3RoXG5cbiAgICAgICAgZm9yIGZpbGUgaW4gQGFyZ3MuZmlsZXNcblxuICAgICAgICAgICAgZmlsZSA9IHNsYXNoLnJlc29sdmUgZmlsZVxuICAgICAgICAgICAgbG9nIGdyYXkgZmlsZSBpZiBAYXJncy52ZXJib3NlXG5cbiAgICAgICAgICAgIHRleHQgPSBzbGFzaC5yZWFkVGV4dCBmaWxlXG5cbiAgICAgICAgICAgIGlmIGVtcHR5IHRleHQgdGhlbiBlcnJvciBZNCByMiBcImNhbid0IHJlYWQgI3tSMyB5NSBmaWxlfVwiOyBjb250aW51ZVxuXG4gICAgICAgICAgICBpZiBAYXJncy5vdXRkaXJcbiAgICAgICAgICAgICAgICBqcyAgPSBAY29tcGlsZSB0ZXh0LCBmaWxlXG4gICAgICAgICAgICAgICAgb3V0ID0gc2xhc2gucmVzb2x2ZSBAYXJncy5vdXRkaXIsIHNsYXNoLmZpbGUgZmlsZVxuICAgICAgICAgICAgICAgIG91dCA9IHNsYXNoLnN3YXBFeHQgb3V0LCAnanMnXG4gICAgICAgICAgICAgICAgaWYgbm90IHNsYXNoLndyaXRlVGV4dCBvdXQsIGpzXG4gICAgICAgICAgICAgICAgICAgIGVycm9yIFIyIHkzIFwiY2FuJ3Qgd3JpdGUgI3tSMyB5NiBvdXR9XCJcbiAgICAgICAgICAgIGVsc2UgaWYgQGFyZ3MuanNcbiAgICAgICAgICAgICAgICBAY29tcGlsZSB0ZXh0LCBmaWxlXG4gICAgICAgICAgICBlbHNlIGlmIEBhcmdzLnJ1blxuICAgICAgICAgICAgICAgIEBldmFsIHRleHQsIGZpbGVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsb2cgQGNvbXBpbGUgdGV4dFxuICAgICAgICAgICAgXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcblxubW9kdWxlLmV4cG9ydHMgPSBLb2RlXG5cbmlmIG5vdCBtb2R1bGUucGFyZW50IG9yIHNsYXNoLnJlc29sdmUobW9kdWxlLnBhcmVudC5wYXRoKS5lbmRzV2l0aCAnL2tvZGUvYmluJ1xuXG4gICAgYXJncyA9IGthcmcgXCJcIlwiXG4gICAgICAgIGtvZGUgb3B0aW9uXG4gICAgICAgICAgICBmaWxlcyAgICAgICAuICoqXG4gICAgICAgICAgICBldmFsICAgICAgICAuID8gZXZhbHVhdGUgYSBzdHJpbmcgYW5kIHByaW50IHRoZSByZXN1bHRcbiAgICAgICAgICAgIGNvbXBpbGUgICAgIC4gPyBjb21waWxlIGEgc3RyaW5nIGFuZCBwcmludCB0aGUgcmVzdWx0XG4gICAgICAgICAgICBvdXRkaXIgICAgICAuID8gb3V0cHV0IGRpcmVjdG9yeSBmb3IgdHJhbnNwaWxlZCBmaWxlc1xuICAgICAgICAgICAgcnVuICAgICAgICAgLiA/IGV4ZWN1dGUgZmlsZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gdHJ1ZVxuICAgICAgICAgICAgbWFwICAgICAgICAgLiA/IGdlbmVyYXRlIGlubGluZSBzb3VyY2UgbWFwcyAgICAgICAgICAgICAuID0gdHJ1ZVxuICAgICAgICAgICAga29kZSAgICAgICAgLiA/IHByZXR0eSBwcmludCBpbnB1dCBjb2RlICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgICAgIGpzICAgICAgICAgIC4gPyBwcmV0dHkgcHJpbnQgdHJhbnNwaWxlZCBqcyBjb2RlICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgICAgICBoZWFkZXIgICAgICAuID8gcHJlcGVuZCBvdXRwdXQgd2l0aCB2ZXJzaW9uIGhlYWRlciAgICAgIC4gPSBmYWxzZSAgLiAtIEhcbiAgICAgICAgICAgIHRva2VucyAgICAgIC4gPyBwcmludCB0b2tlbnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gVFxuICAgICAgICAgICAgYmxvY2sgICAgICAgLiA/IHByaW50IGJsb2NrIHRyZWUgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBCXG4gICAgICAgICAgICBwYXJzZSAgICAgICAuID8gcHJpbnQgcGFyc2UgdHJlZSAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIFBcbiAgICAgICAgICAgIGFzdHIgICAgICAgIC4gPyBwcmludCBwYXJzZSB0cmVlIGFzIHN0cmluZyAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gQVxuICAgICAgICAgICAgc2NvcGUgICAgICAgLiA/IHByaW50IHNjb3BlcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBTXG4gICAgICAgICAgICB2ZXJib3NlICAgICAuID8gbG9nIG1vcmUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICAgICAgZGVidWcgICAgICAgLiA/IGxvZyBkZWJ1ZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgICAgIHJhdyAgICAgICAgIC4gPyBsb2cgcmF3ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gUlxuXG4gICAgICAgIHZlcnNpb24gICN7cGtnLnZlcnNpb259XG4gICAgICAgIFwiXCJcIlxuXG4gICAgcmVnaXN0ZXIoKVxuICAgIGtvZGUgPSBuZXcgS29kZSBhcmdzXG4gICAga29kZS5jbGkoKVxuIl19
//# sourceURL=../coffee/kode.coffee