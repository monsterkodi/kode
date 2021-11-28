// koffee 1.20.0

/*
000   000   0000000   0000000    00000000
000  000   000   000  000   000  000
0000000    000   000  000   000  0000000
000  000   000   000  000   000  000
000   000   0000000   0000000    00000000
 */
var Kode, args, childp, empty, karg, klor, kode, kstr, pkg, print, slash;

slash = require('kslash');

kstr = require('kstr');

klor = require('klor');

karg = require('karg');

childp = require('child_process');

print = require('./print');

pkg = require(__dirname + "/../package");

empty = require('./utils').empty;

klor.kolor.globalize();

Kode = (function() {
    function Kode(args1) {
        var Lexer, Parser, Renderer, Returner, Scoper;
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
        Returner = require('./returner');
        Renderer = require('./renderer');
        this.lexer = new Lexer(this);
        this.parser = new Parser(this);
        this.scoper = new Scoper(this);
        this.returner = new Returner(this);
        this.renderer = new Renderer(this);
    }

    Kode.prototype.cli = function() {
        var code, file, i, len, out, ref, results, text;
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
        ref = this.args.files;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
            file = ref[i];
            file = slash.resolve(file);
            if (this.args.verbose) {
                console.log(gray(file));
            }
            text = slash.readText(file);
            if (empty(text)) {
                console.error(Y4(r2("can't read " + (R3(y5(file))))));
                continue;
            }
            code = this.compile(text);
            if (this.args.output) {
                out = slash.join(this.args.output, slash.file(file));
                out = slash.swapExt(out, 'js');
                if (this.args.verbose) {
                    console.log('out', out);
                }
                results.push(slash.writeText(out, code));
            } else {
                results.push(void 0);
            }
        }
        return results;
    };

    Kode.compile = function(text) {
        return (new Kode({})).compile(text);
    };

    Kode.prototype.compile = function(text) {
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
        js = this.renderer.render(ast);
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
        if (this.args.verbose || this.args.debug) {
            print.code('coffee', text, 'coffee');
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
        return this.returner.collect(this.scoper.collect(this.parser.parse(block)));
    };

    Kode.prototype.astr = function(text, scopes) {
        return print.astr(this.ast(text), scopes);
    };

    Kode.prototype["eval"] = function(text) {
        var Module, _module, _require, err, i, js, len, r, ref, sandbox, vm;
        if (empty(text)) {
            return;
        }
        vm = require('vm');
        sandbox = vm.createContext();
        sandbox.global = sandbox.root = sandbox.GLOBAL = sandbox;
        sandbox.__filename = 'eval';
        sandbox.__dirname = slash.dir(sandbox.__filename);
        if (!(sandbox !== global || sandbox.module || sandbox.require)) {
            Module = require('module');
            sandbox.module = _module = new Module('eval');
            sandbox.require = _require = function(path) {
                return Module._load(path, _module, true);
            };
            _module.filename = sandbox.__filename;
            ref = Object.getOwnPropertyNames(require);
            for (i = 0, len = ref.length; i < len; i++) {
                r = ref[i];
                if (r !== 'paths' && r !== 'arguments' && r !== 'caller') {
                    _require[r] = require[r];
                }
            }
            _require.paths = _module.paths = Module._nodeModulePaths(process.cwd());
            _require.resolve = function(request) {
                return Module._resolveFilename(request, _module);
            };
        }
        js = this.compile(text);
        try {
            sandbox.console = console;
            return vm.runInContext(js, sandbox);
        } catch (error) {
            err = error;
            console.error(err, text);
            throw err;
        }
    };

    return Kode;

})();

if (!module.parent || module.parent.path.endsWith('/kode/bin')) {
    args = karg("kode option\n    files       . **\n    eval        . ? evaluate a string and print the result\n    compile     . ? compile a string and print the result\n    outdir      . ? output directory for transpiled files\n    map         . ? generate inline source maps             . = true\n    js          . ? print transpiled js code                . = true\n    run         . ? execute file                            . = false\n    tokens      . ? print tokens                            . = false  . - T\n    block       . ? print block tree                        . = false  . - B\n    parse       . ? print parse tree                        . = false  . - P\n    astr        . ? print parse tree as string              . = false  . - A\n    scope       . ? print scopes                            . = false  . - S\n    verbose     . ? log more                                . = false\n    debug       . ? log debug                               . = false\n    raw         . ? log raw                                 . = false  . - R\n\nversion  " + pkg.version);
    kode = new Kode(args);
    kode.cli();
}

module.exports = Kode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29kZS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImtvZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEtBQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxNQUFBLEdBQVMsT0FBQSxDQUFRLGVBQVI7O0FBQ1QsS0FBQSxHQUFTLE9BQUEsQ0FBUSxTQUFSOztBQUNULEdBQUEsR0FBUyxPQUFBLENBQVcsU0FBRCxHQUFXLGFBQXJCOztBQUVQLFFBQVUsT0FBQSxDQUFRLFNBQVI7O0FBRVosSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFYLENBQUE7O0FBRU07SUFFQyxjQUFDLEtBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7O1lBRUEsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFROztRQUVULElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFUO1lBQXNCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixHQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLEtBQS9FOztRQUVBLEtBQUEsR0FBWSxPQUFBLENBQVEsU0FBUjtRQUNaLE1BQUEsR0FBWSxPQUFBLENBQVEsVUFBUjtRQUNaLE1BQUEsR0FBWSxPQUFBLENBQVEsVUFBUjtRQUNaLFFBQUEsR0FBWSxPQUFBLENBQVEsWUFBUjtRQUNaLFFBQUEsR0FBWSxPQUFBLENBQVEsWUFBUjtRQUVaLElBQUMsQ0FBQSxLQUFELEdBQVksSUFBSSxLQUFKLENBQWEsSUFBYjtRQUNaLElBQUMsQ0FBQSxNQUFELEdBQVksSUFBSSxN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QVQsR0FBaUIsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsTUFBTSxDQUFDLGdCQUFQLENBQXdCLE9BQU8sQ0FBQyxHQUFSLENBQUEsQ0FBeEI7WUFDakMsUUFBUSxDQUFDLE9BQVQsR0FBbUIsU0FBQyxPQUFEO3VCQUFhLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixPQUF4QixFQUFpQyxPQUFqQztZQUFiLEVBVnZCOztRQVlBLEVBQUEsR0FBSyxJQUFDLENBQUEsT0FBRCxDQUFTLElBQVQ7QUFFTDtZQUNJLE9BQU8sQ0FBQyxPQUFSLEdBQWtCO21CQUNsQixFQUFFLENBQUMsWUFBSCxDQUFnQixFQUFoQixFQUFvQixPQUFwQixFQUZKO1NBQUEsYUFBQTtZQUdNO1lBQ0gsT0FBQSxDQUFDLEtBQUQsQ0FBTyxHQUFQLEVBQVksSUFBWjtBQUNDLGtCQUFNLElBTFY7O0lBM0JFOzs7Ozs7QUF3Q1YsSUFBRyxDQUFJLE1BQU0sQ0FBQyxNQUFYLElBQXFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQW5CLENBQTRCLFdBQTVCLENBQXhCO0lBRUksSUFBQSxHQUFPLElBQUEsQ0FBSyx1aENBQUEsR0FrQkcsR0FBRyxDQUFDLE9BbEJaO0lBcUJQLElBQUEsR0FBTyxJQUFJLElBQUosQ0FBUyxJQUFUO0lBQ1AsSUFBSSxDQUFDLEdBQUwsQ0FBQSxFQXhCSjs7O0FBMEJBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4wMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4jIyNcblxuc2xhc2ggID0gcmVxdWlyZSAna3NsYXNoJ1xua3N0ciAgID0gcmVxdWlyZSAna3N0cidcbmtsb3IgICA9IHJlcXVpcmUgJ2tsb3InXG5rYXJnICAgPSByZXF1aXJlICdrYXJnJ1xuY2hpbGRwID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbnByaW50ICA9IHJlcXVpcmUgJy4vcHJpbnQnXG5wa2cgICAgPSByZXF1aXJlIFwiI3tfX2Rpcm5hbWV9Ly4uL3BhY2thZ2VcIlxuXG57IGVtcHR5IH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5rbG9yLmtvbG9yLmdsb2JhbGl6ZSgpXG5cbmNsYXNzIEtvZGVcblxuICAgIEA6IChAYXJncykgLT5cblxuICAgICAgICBAYXJncyA/PSB7fVxuXG4gICAgICAgIGlmIEBhcmdzLnZlcmJvc2UgdGhlbiBAYXJncy5kZWJ1ZyA9IEBhcmdzLmJsb2NrID0gQGFyZ3MudG9rZW5zID0gQGFyZ3MucGFyc2UgPSB0cnVlXG5cbiAgICAgICAgTGV4ZXIgICAgID0gcmVxdWlyZSAnLi9sZXhlcidcbiAgICAgICAgUGFyc2VyICAgID0gcmVxdWlyZSAnLi9wYXJzZXInXG4gICAgICAgIFNjb3BlciAgICA9IHJlcXVpcmUgJy4vc2NvcGVyJ1xuICAgICAgICBSZXR1cm5lciAgPSByZXF1aXJlICcuL3JldHVybmVyJ1xuICAgICAgICBSZW5kZXJlciAgPSByZXF1aXJlICcuL3JlbmRlcmVyJ1xuXG4gICAgICAgIEBsZXhlciAgICA9IG5ldyBMZXhlciAgICBAXG4gICAgICAgIEBwYXJzZXIgICA9IG5ldyBQYXJzZXIgICBAXG4gICAgICAgIEBzY29wZXIgICA9IG5ldyBTY29wZXIgICBAXG4gICAgICAgIEByZXR1cm5lciA9IG5ldyBSZXR1cm5lciBAXG4gICAgICAgIEByZW5kZXJlciA9IG5ldyBSZW5kZXJlciBAXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDBcblxuICAgIGNsaTogLT5cblxuICAgICAgICAjIGlmIEBhcmdzLmRlYnVnIHRoZW4gcHJpbnQubm9vbiAnYXJncycgQGFyZ3NcblxuICAgICAgICBpZiBAYXJncy5jb21waWxlXG4gICAgICAgICAgICBsb2cgQGNvbXBpbGUgQGFyZ3MuY29tcGlsZVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGlmIEBhcmdzLmV2YWxcbiAgICAgICAgICAgIGxvZyBAZXZhbCBAYXJncy5ldmFsXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICByZXR1cm4gaWYgbm90IEBhcmdzLmZpbGVzLmxlbmd0aFxuXG4gICAgICAgIGZvciBmaWxlIGluIEBhcmdzLmZpbGVzXG5cbiAgICAgICAgICAgIGZpbGUgPSBzbGFzaC5yZXNvbHZlIGZpbGVcbiAgICAgICAgICAgIGxvZyBncmF5IGZpbGUgaWYgQGFyZ3MudmVyYm9zZVxuXG4gICAgICAgICAgICB0ZXh0ID0gc2xhc2gucmVhZFRleHQgZmlsZVxuXG4gICAgICAgICAgICBpZiBlbXB0eSB0ZXh0IHRoZW4gZXJyb3IgWTQgcjIgXCJjYW4ndCByZWFkICN7UjMgeTUgZmlsZX1cIjsgY29udGludWVcblxuICAgICAgICAgICAgY29kZSA9IEBjb21waWxlIHRleHRcblxuICAgICAgICAgICAgaWYgQGFyZ3Mub3V0cHV0XG4gICAgICAgICAgICAgICAgb3V0ID0gc2xhc2guam9pbiBAYXJncy5vdXRwdXQsIHNsYXNoLmZpbGUgZmlsZVxuICAgICAgICAgICAgICAgIG91dCA9IHNsYXNoLnN3YXBFeHQgb3V0LCAnanMnXG4gICAgICAgICAgICAgICAgbG9nICdvdXQnIG91dCBpZiBAYXJncy52ZXJib3NlXG4gICAgICAgICAgICAgICAgc2xhc2gud3JpdGVUZXh0IG91dCwgY29kZVxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwXG5cbiAgICBAY29tcGlsZTogKHRleHQpIC0+IChuZXcgS29kZSB7fSkuY29tcGlsZSB0ZXh0XG4gICAgY29tcGlsZTogKHRleHQpIC0+XG5cbiAgICAgICAgcmV0dXJuICcnIGlmIGVtcHR5IGtzdHIuc3RyaXAgdGV4dFxuXG4gICAgICAgIGFzdCA9IEBhc3QgdGV4dFxuXG4gICAgICAgIGlmIEBhcmdzLnBhcnNlIHRoZW4gcHJpbnQuYXN0ICdhc3QnIGFzdFxuICAgICAgICBpZiBAYXJncy5hc3RyICB0aGVuIGxvZyBwcmludC5hc3RyIGFzdCwgQGFyZ3Muc2NvcGVcblxuICAgICAgICBqcyA9IEByZW5kZXJlci5yZW5kZXIgYXN0XG5cbiAgICAgICAgcHJpbnQuY29kZSAnanMnIGpzIGlmIEBhcmdzLmpzIG9yIEBhcmdzLmRlYnVnXG5cbiAgICAgICAganNcblxuICAgIGFzdDogKHRleHQpIC0+XG5cbiAgICAgICAgdGV4dCArPSAnXFxuJyBpZiBub3QgdGV4dFstMV0gPT0gJ1xcbidcblxuICAgICAgICBwcmludC5jb2RlICdjb2ZmZWUnIHRleHQsICdjb2ZmZWUnIGlmIEBhcmdzLnZlcmJvc2Ugb3IgQGFyZ3MuZGVidWdcblxuICAgICAgICB0b2tlbnMgPSBAbGV4ZXIudG9rZW5pemUgdGV4dFxuXG4gICAgICAgIGlmIEBhcmdzLnJhdyAgICB0aGVuIHByaW50Lm5vb24gJ3JhdyB0b2tlbnMnIHRva2Vuc1xuICAgICAgICBpZiBAYXJncy50b2tlbnMgdGhlbiBwcmludC50b2tlbnMgJ3Rva2VucycgdG9rZW5zXG5cbiAgICAgICAgYmxvY2sgPSBAbGV4ZXIuYmxvY2tpZnkgdG9rZW5zXG5cbiAgICAgICAgaWYgQGFyZ3MucmF3ICAgdGhlbiBwcmludC5ub29uICdyYXcgYmxvY2snIGJsb2NrXG4gICAgICAgIGlmIEBhcmdzLmJsb2NrIHRoZW4gcHJpbnQuYmxvY2sgJ3RsIGJsb2NrJyBibG9ja1xuXG4gICAgICAgIEByZXR1cm5lci5jb2xsZWN0IEBzY29wZXIuY29sbGVjdCBAcGFyc2VyLnBhcnNlIGJsb2NrXG5cbiAgICBhc3RyOiAodGV4dCwgc2NvcGVzKSAtPiBwcmludC5hc3RyIEBhc3QodGV4dCksIHNjb3Blc1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwMCAgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGV2YWw6ICh0ZXh0KSAtPlxuXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0ZXh0XG5cbiAgICAgICAgdm0gPSByZXF1aXJlICd2bSdcblxuICAgICAgICBzYW5kYm94ID0gdm0uY3JlYXRlQ29udGV4dCgpXG4gICAgICAgIHNhbmRib3guZ2xvYmFsID0gc2FuZGJveC5yb290ID0gc2FuZGJveC5HTE9CQUwgPSBzYW5kYm94XG5cbiAgICAgICAgc2FuZGJveC5fX2ZpbGVuYW1lID0gJ2V2YWwnXG4gICAgICAgIHNhbmRib3guX19kaXJuYW1lICA9IHNsYXNoLmRpciBzYW5kYm94Ll9fZmlsZW5hbWVcblxuICAgICAgICAjIGRlZmluZSBtb2R1bGUvcmVxdWlyZSBvbmx5IGlmIHRoZXkgY2hvc2Ugbm90IHRvIHNwZWNpZnkgdGhlaXIgb3duXG4gICAgICAgIHVubGVzcyBzYW5kYm94ICE9IGdsb2JhbCBvciBzYW5kYm94Lm1vZHVsZSBvciBzYW5kYm94LnJlcXVpcmVcbiAgICAgICAgICAgIE1vZHVsZSA9IHJlcXVpcmUgJ21vZHVsZSdcbiAgICAgICAgICAgIHNhbmRib3gubW9kdWxlICA9IF9tb2R1bGUgID0gbmV3IE1vZHVsZSAnZXZhbCdcbiAgICAgICAgICAgIHNhbmRib3gucmVxdWlyZSA9IF9yZXF1aXJlID0gKHBhdGgpIC0+ICBNb2R1bGUuX2xvYWQgcGF0aCwgX21vZHVsZSwgdHJ1ZVxuICAgICAgICAgICAgX21vZHVsZS5maWxlbmFtZSA9IHNhbmRib3guX19maWxlbmFtZVxuICAgICAgICAgICAgZm9yIHIgaW4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgcmVxdWlyZVxuICAgICAgICAgICAgICAgIGlmIHIgbm90IGluIFsncGF0aHMnICdhcmd1bWVudHMnICdjYWxsZXInXVxuICAgICAgICAgICAgICAgICAgICBfcmVxdWlyZVtyXSA9IHJlcXVpcmVbcl1cbiAgICAgICAgICAgICMgdXNlIHRoZSBzYW1lIGhhY2sgbm9kZSBjdXJyZW50bHkgdXNlcyBmb3IgdGhlaXIgb3duIFJFUExcbiAgICAgICAgICAgIF9yZXF1aXJlLnBhdGhzID0gX21vZHVsZS5wYXRocyA9IE1vZHVsZS5fbm9kZU1vZHVsZVBhdGhzIHByb2Nlc3MuY3dkKClcbiAgICAgICAgICAgIF9yZXF1aXJlLnJlc29sdmUgPSAocmVxdWVzdCkgLT4gTW9kdWxlLl9yZXNvbHZlRmlsZW5hbWUgcmVxdWVzdCwgX21vZHVsZVxuXG4gICAgICAgIGpzID0gQGNvbXBpbGUgdGV4dFxuXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgc2FuZGJveC5jb25zb2xlID0gY29uc29sZVxuICAgICAgICAgICAgdm0ucnVuSW5Db250ZXh0IGpzLCBzYW5kYm94XG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgZXJyb3IgZXJyLCB0ZXh0XG4gICAgICAgICAgICB0aHJvdyBlcnJcblxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG5cbmlmIG5vdCBtb2R1bGUucGFyZW50IG9yIG1vZHVsZS5wYXJlbnQucGF0aC5lbmRzV2l0aCAnL2tvZGUvYmluJ1xuXG4gICAgYXJncyA9IGthcmcgXCJcIlwiXG4gICAgICAgIGtvZGUgb3B0aW9uXG4gICAgICAgICAgICBmaWxlcyAgICAgICAuICoqXG4gICAgICAgICAgICBldmFsICAgICAgICAuID8gZXZhbHVhdGUgYSBzdHJpbmcgYW5kIHByaW50IHRoZSByZXN1bHRcbiAgICAgICAgICAgIGNvbXBpbGUgICAgIC4gPyBjb21waWxlIGEgc3RyaW5nIGFuZCBwcmludCB0aGUgcmVzdWx0XG4gICAgICAgICAgICBvdXRkaXIgICAgICAuID8gb3V0cHV0IGRpcmVjdG9yeSBmb3IgdHJhbnNwaWxlZCBmaWxlc1xuICAgICAgICAgICAgbWFwICAgICAgICAgLiA/IGdlbmVyYXRlIGlubGluZSBzb3VyY2UgbWFwcyAgICAgICAgICAgICAuID0gdHJ1ZVxuICAgICAgICAgICAganMgICAgICAgICAgLiA/IHByaW50IHRyYW5zcGlsZWQganMgY29kZSAgICAgICAgICAgICAgICAuID0gdHJ1ZVxuICAgICAgICAgICAgcnVuICAgICAgICAgLiA/IGV4ZWN1dGUgZmlsZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgICAgIHRva2VucyAgICAgIC4gPyBwcmludCB0b2tlbnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gVFxuICAgICAgICAgICAgYmxvY2sgICAgICAgLiA/IHByaW50IGJsb2NrIHRyZWUgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBCXG4gICAgICAgICAgICBwYXJzZSAgICAgICAuID8gcHJpbnQgcGFyc2UgdHJlZSAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIFBcbiAgICAgICAgICAgIGFzdHIgICAgICAgIC4gPyBwcmludCBwYXJzZSB0cmVlIGFzIHN0cmluZyAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gQVxuICAgICAgICAgICAgc2NvcGUgICAgICAgLiA/IHByaW50IHNjb3BlcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBTXG4gICAgICAgICAgICB2ZXJib3NlICAgICAuID8gbG9nIG1vcmUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICAgICAgZGVidWcgICAgICAgLiA/IGxvZyBkZWJ1ZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgICAgIHJhdyAgICAgICAgIC4gPyBsb2cgcmF3ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gUlxuXG4gICAgICAgIHZlcnNpb24gICN7cGtnLnZlcnNpb259XG4gICAgICAgIFwiXCJcIlxuXG4gICAga29kZSA9IG5ldyBLb2RlIGFyZ3NcbiAgICBrb2RlLmNsaSgpXG5cbm1vZHVsZS5leHBvcnRzID0gS29kZVxuXG4iXX0=
//# sourceURL=../coffee/kode.coffee