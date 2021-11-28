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

empty = function(a) {
    return (a === '' || a === null || a === (void 0)) || (typeof a === 'object' && Object.keys(a).length === 0);
};

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29kZS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImtvZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEtBQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxNQUFBLEdBQVMsT0FBQSxDQUFRLGVBQVI7O0FBQ1QsS0FBQSxHQUFTLE9BQUEsQ0FBUSxTQUFSOztBQUNULEdBQUEsR0FBUyxPQUFBLENBQVcsU0FBRCxHQUFXLGFBQXJCOztBQUNULEtBQUEsR0FBUyxTQUFDLENBQUQ7V0FBTyxDQUFBLENBQUEsS0FBTSxFQUFOLElBQUEsQ0FBQSxLQUFTLElBQVQsSUFBQSxDQUFBLEtBQWMsUUFBZCxDQUFBLElBQTRCLENBQUMsT0FBTyxDQUFQLEtBQWEsUUFBYixJQUEwQixNQUFNLENBQUMsSUFBUCxDQUFZLENBQVosQ0FBYyxDQUFDLE1BQWYsS0FBeUIsQ0FBcEQ7QUFBbkM7O0FBRVQsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFYLENBQUE7O0FBRU07SUFFQyxjQUFDLEtBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7O1lBRUEsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFROztRQUVULElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFUO1lBQXNCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixHQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLEtBQS9FOztRQUVBLEtBQUEsR0FBWSxPQUFBLENBQVEsU0FBUjtRQUNaLE1BQUEsR0FBWSxPQUFBLENBQVEsVUFBUjtR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QjtBQUFBLGlCQUFBLHFDQUFBOztnQkFDSSxJQUFHLENBQUEsS0FBVSxPQUFWLElBQUEsQ0FBQSxLQUFrQixXQUFsQixJQUFBLENBQUEsS0FBOEIsUUFBakM7b0JBQ0ksUUFBUyxDQUFBLENBQUEsQ0FBVCxHQUFjLE9BQVEsQ0FBQSxDQUFBLEVBRDFCOztBQURKO1lBSUEsUUFBUSxDQUFDLEtBQVQsR0FBaUIsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsTUFBTSxDQUFDLGdCQUFQLENBQXdCLE9BQU8sQ0FBQyxHQUFSLENBQUEsQ0FBeEI7WUFDakMsUUFBUSxDQUFDLE9BQVQsR0FBbUIsU0FBQyxPQUFEO3VCQUFhLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixPQUF4QixFQUFpQyxPQUFqQztZQUFiLEVBVnZCOztRQVlBLEVBQUEsR0FBSyxJQUFDLENBQUEsT0FBRCxDQUFTLElBQVQ7QUFFTDtZQUNJLE9BQU8sQ0FBQyxPQUFSLEdBQWtCO21CQUNsQixFQUFFLENBQUMsWUFBSCxDQUFnQixFQUFoQixFQUFvQixPQUFwQixFQUZKO1NBQUEsYUFBQTtZQUdNO1lBQ0gsT0FBQSxDQUFDLEtBQUQsQ0FBTyxHQUFQLEVBQVksSUFBWjtBQUNDLGtCQUFNLElBTFY7O0lBM0JFOzs7Ozs7QUF3Q1YsSUFBRyxDQUFJLE1BQU0sQ0FBQyxNQUFYLElBQXFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQW5CLENBQTRCLFdBQTVCLENBQXhCO0lBRUksSUFBQSxHQUFPLElBQUEsQ0FBSyx1aENBQUEsR0FrQkcsR0FBRyxDQUFDLE9BbEJaO0lBcUJQLElBQUEsR0FBTyxJQUFJLElBQUosQ0FBUyxJQUFUO0lBQ1AsSUFBSSxDQUFDLEdBQUwsQ0FBQSxFQXhCSjs7O0FBMEJBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4wMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4jIyNcblxuc2xhc2ggID0gcmVxdWlyZSAna3NsYXNoJ1xua3N0ciAgID0gcmVxdWlyZSAna3N0cidcbmtsb3IgICA9IHJlcXVpcmUgJ2tsb3InXG5rYXJnICAgPSByZXF1aXJlICdrYXJnJ1xuY2hpbGRwID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbnByaW50ICA9IHJlcXVpcmUgJy4vcHJpbnQnXG5wa2cgICAgPSByZXF1aXJlIFwiI3tfX2Rpcm5hbWV9Ly4uL3BhY2thZ2VcIlxuZW1wdHkgID0gKGEpIC0+IGEgaW4gWycnIG51bGwgdW5kZWZpbmVkXSBvciAodHlwZW9mKGEpID09ICdvYmplY3QnIGFuZCBPYmplY3Qua2V5cyhhKS5sZW5ndGggPT0gMClcblxua2xvci5rb2xvci5nbG9iYWxpemUoKVxuXG5jbGFzcyBLb2RlXG5cbiAgICBAOiAoQGFyZ3MpIC0+XG5cbiAgICAgICAgQGFyZ3MgPz0ge31cblxuICAgICAgICBpZiBAYXJncy52ZXJib3NlIHRoZW4gQGFyZ3MuZGVidWcgPSBAYXJncy5ibG9jayA9IEBhcmdzLnRva2VucyA9IEBhcmdzLnBhcnNlID0gdHJ1ZVxuXG4gICAgICAgIExleGVyICAgICA9IHJlcXVpcmUgJy4vbGV4ZXInXG4gICAgICAgIFBhcnNlciAgICA9IHJlcXVpcmUgJy4vcGFyc2VyJ1xuICAgICAgICBTY29wZXIgICAgPSByZXF1aXJlICcuL3Njb3BlcidcbiAgICAgICAgUmV0dXJuZXIgID0gcmVxdWlyZSAnLi9yZXR1cm5lcidcbiAgICAgICAgUmVuZGVyZXIgID0gcmVxdWlyZSAnLi9yZW5kZXJlcidcblxuICAgICAgICBAbGV4ZXIgICAgPSBuZXcgTGV4ZXIgICAgQFxuICAgICAgICBAcGFyc2VyICAgPSBuZXcgUGFyc2VyICAgQFxuICAgICAgICBAc2NvcGVyICAgPSBuZXcgU2NvcGVyICAgQFxuICAgICAgICBAcmV0dXJuZXIgPSBuZXcgUmV0dXJuZXIgQFxuICAgICAgICBAcmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIgQFxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwXG5cbiAgICBjbGk6IC0+XG5cbiAgICAgICAgIyBpZiBAYXJncy5kZWJ1ZyB0aGVuIHByaW50Lm5vb24gJ2FyZ3MnIEBhcmdzXG5cbiAgICAgICAgaWYgQGFyZ3MuY29tcGlsZVxuICAgICAgICAgICAgbG9nIEBjb21waWxlIEBhcmdzLmNvbXBpbGVcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBpZiBAYXJncy5ldmFsXG4gICAgICAgICAgICBsb2cgQGV2YWwgQGFyZ3MuZXZhbFxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAYXJncy5maWxlcy5sZW5ndGhcblxuICAgICAgICBmb3IgZmlsZSBpbiBAYXJncy5maWxlc1xuXG4gICAgICAgICAgICBmaWxlID0gc2xhc2gucmVzb2x2ZSBmaWxlXG4gICAgICAgICAgICBsb2cgZ3JheSBmaWxlIGlmIEBhcmdzLnZlcmJvc2VcblxuICAgICAgICAgICAgdGV4dCA9IHNsYXNoLnJlYWRUZXh0IGZpbGVcblxuICAgICAgICAgICAgaWYgZW1wdHkgdGV4dCB0aGVuIGVycm9yIFk0IHIyIFwiY2FuJ3QgcmVhZCAje1IzIHk1IGZpbGV9XCI7IGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGNvZGUgPSBAY29tcGlsZSB0ZXh0XG5cbiAgICAgICAgICAgIGlmIEBhcmdzLm91dHB1dFxuICAgICAgICAgICAgICAgIG91dCA9IHNsYXNoLmpvaW4gQGFyZ3Mub3V0cHV0LCBzbGFzaC5maWxlIGZpbGVcbiAgICAgICAgICAgICAgICBvdXQgPSBzbGFzaC5zd2FwRXh0IG91dCwgJ2pzJ1xuICAgICAgICAgICAgICAgIGxvZyAnb3V0JyBvdXQgaWYgQGFyZ3MudmVyYm9zZVxuICAgICAgICAgICAgICAgIHNsYXNoLndyaXRlVGV4dCBvdXQsIGNvZGVcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMFxuXG4gICAgQGNvbXBpbGU6ICh0ZXh0KSAtPiAobmV3IEtvZGUge30pLmNvbXBpbGUgdGV4dFxuICAgIGNvbXBpbGU6ICh0ZXh0KSAtPlxuXG4gICAgICAgIHJldHVybiAnJyBpZiBlbXB0eSBrc3RyLnN0cmlwIHRleHRcblxuICAgICAgICBhc3QgPSBAYXN0IHRleHRcblxuICAgICAgICBpZiBAYXJncy5wYXJzZSB0aGVuIHByaW50LmFzdCAnYXN0JyBhc3RcbiAgICAgICAgaWYgQGFyZ3MuYXN0ciAgdGhlbiBsb2cgcHJpbnQuYXN0ciBhc3QsIEBhcmdzLnNjb3BlXG5cbiAgICAgICAganMgPSBAcmVuZGVyZXIucmVuZGVyIGFzdFxuXG4gICAgICAgIHByaW50LmNvZGUgJ2pzJyBqcyBpZiBAYXJncy5qcyBvciBAYXJncy5kZWJ1Z1xuXG4gICAgICAgIGpzXG5cbiAgICBhc3Q6ICh0ZXh0KSAtPlxuXG4gICAgICAgIHRleHQgKz0gJ1xcbicgaWYgbm90IHRleHRbLTFdID09ICdcXG4nXG5cbiAgICAgICAgcHJpbnQuY29kZSAnY29mZmVlJyB0ZXh0LCAnY29mZmVlJyBpZiBAYXJncy52ZXJib3NlIG9yIEBhcmdzLmRlYnVnXG5cbiAgICAgICAgdG9rZW5zID0gQGxleGVyLnRva2VuaXplIHRleHRcblxuICAgICAgICBpZiBAYXJncy5yYXcgICAgdGhlbiBwcmludC5ub29uICdyYXcgdG9rZW5zJyB0b2tlbnNcbiAgICAgICAgaWYgQGFyZ3MudG9rZW5zIHRoZW4gcHJpbnQudG9rZW5zICd0b2tlbnMnIHRva2Vuc1xuXG4gICAgICAgIGJsb2NrID0gQGxleGVyLmJsb2NraWZ5IHRva2Vuc1xuXG4gICAgICAgIGlmIEBhcmdzLnJhdyAgIHRoZW4gcHJpbnQubm9vbiAncmF3IGJsb2NrJyBibG9ja1xuICAgICAgICBpZiBAYXJncy5ibG9jayB0aGVuIHByaW50LmJsb2NrICd0bCBibG9jaycgYmxvY2tcblxuICAgICAgICBAcmV0dXJuZXIuY29sbGVjdCBAc2NvcGVyLmNvbGxlY3QgQHBhcnNlci5wYXJzZSBibG9ja1xuXG4gICAgYXN0cjogKHRleHQsIHNjb3BlcykgLT4gcHJpbnQuYXN0ciBAYXN0KHRleHQpLCBzY29wZXNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBldmFsOiAodGV4dCkgLT5cblxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgdGV4dFxuXG4gICAgICAgIHZtID0gcmVxdWlyZSAndm0nXG5cbiAgICAgICAgc2FuZGJveCA9IHZtLmNyZWF0ZUNvbnRleHQoKVxuICAgICAgICBzYW5kYm94Lmdsb2JhbCA9IHNhbmRib3gucm9vdCA9IHNhbmRib3guR0xPQkFMID0gc2FuZGJveFxuXG4gICAgICAgIHNhbmRib3guX19maWxlbmFtZSA9ICdldmFsJ1xuICAgICAgICBzYW5kYm94Ll9fZGlybmFtZSAgPSBzbGFzaC5kaXIgc2FuZGJveC5fX2ZpbGVuYW1lXG5cbiAgICAgICAgIyBkZWZpbmUgbW9kdWxlL3JlcXVpcmUgb25seSBpZiB0aGV5IGNob3NlIG5vdCB0byBzcGVjaWZ5IHRoZWlyIG93blxuICAgICAgICB1bmxlc3Mgc2FuZGJveCAhPSBnbG9iYWwgb3Igc2FuZGJveC5tb2R1bGUgb3Igc2FuZGJveC5yZXF1aXJlXG4gICAgICAgICAgICBNb2R1bGUgPSByZXF1aXJlICdtb2R1bGUnXG4gICAgICAgICAgICBzYW5kYm94Lm1vZHVsZSAgPSBfbW9kdWxlICA9IG5ldyBNb2R1bGUgJ2V2YWwnXG4gICAgICAgICAgICBzYW5kYm94LnJlcXVpcmUgPSBfcmVxdWlyZSA9IChwYXRoKSAtPiAgTW9kdWxlLl9sb2FkIHBhdGgsIF9tb2R1bGUsIHRydWVcbiAgICAgICAgICAgIF9tb2R1bGUuZmlsZW5hbWUgPSBzYW5kYm94Ll9fZmlsZW5hbWVcbiAgICAgICAgICAgIGZvciByIGluIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHJlcXVpcmVcbiAgICAgICAgICAgICAgICBpZiByIG5vdCBpbiBbJ3BhdGhzJyAnYXJndW1lbnRzJyAnY2FsbGVyJ11cbiAgICAgICAgICAgICAgICAgICAgX3JlcXVpcmVbcl0gPSByZXF1aXJlW3JdXG4gICAgICAgICAgICAjIHVzZSB0aGUgc2FtZSBoYWNrIG5vZGUgY3VycmVudGx5IHVzZXMgZm9yIHRoZWlyIG93biBSRVBMXG4gICAgICAgICAgICBfcmVxdWlyZS5wYXRocyA9IF9tb2R1bGUucGF0aHMgPSBNb2R1bGUuX25vZGVNb2R1bGVQYXRocyBwcm9jZXNzLmN3ZCgpXG4gICAgICAgICAgICBfcmVxdWlyZS5yZXNvbHZlID0gKHJlcXVlc3QpIC0+IE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lIHJlcXVlc3QsIF9tb2R1bGVcblxuICAgICAgICBqcyA9IEBjb21waWxlIHRleHRcblxuICAgICAgICB0cnlcbiAgICAgICAgICAgIHNhbmRib3guY29uc29sZSA9IGNvbnNvbGVcbiAgICAgICAgICAgIHZtLnJ1bkluQ29udGV4dCBqcywgc2FuZGJveFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGVycm9yIGVyciwgdGV4dFxuICAgICAgICAgICAgdGhyb3cgZXJyXG5cbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuXG5pZiBub3QgbW9kdWxlLnBhcmVudCBvciBtb2R1bGUucGFyZW50LnBhdGguZW5kc1dpdGggJy9rb2RlL2JpbidcblxuICAgIGFyZ3MgPSBrYXJnIFwiXCJcIlxuICAgICAgICBrb2RlIG9wdGlvblxuICAgICAgICAgICAgZmlsZXMgICAgICAgLiAqKlxuICAgICAgICAgICAgZXZhbCAgICAgICAgLiA/IGV2YWx1YXRlIGEgc3RyaW5nIGFuZCBwcmludCB0aGUgcmVzdWx0XG4gICAgICAgICAgICBjb21waWxlICAgICAuID8gY29tcGlsZSBhIHN0cmluZyBhbmQgcHJpbnQgdGhlIHJlc3VsdFxuICAgICAgICAgICAgb3V0ZGlyICAgICAgLiA/IG91dHB1dCBkaXJlY3RvcnkgZm9yIHRyYW5zcGlsZWQgZmlsZXNcbiAgICAgICAgICAgIG1hcCAgICAgICAgIC4gPyBnZW5lcmF0ZSBpbmxpbmUgc291cmNlIG1hcHMgICAgICAgICAgICAgLiA9IHRydWVcbiAgICAgICAgICAgIGpzICAgICAgICAgIC4gPyBwcmludCB0cmFuc3BpbGVkIGpzIGNvZGUgICAgICAgICAgICAgICAgLiA9IHRydWVcbiAgICAgICAgICAgIHJ1biAgICAgICAgIC4gPyBleGVjdXRlIGZpbGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgICAgICB0b2tlbnMgICAgICAuID8gcHJpbnQgdG9rZW5zICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIFRcbiAgICAgICAgICAgIGJsb2NrICAgICAgIC4gPyBwcmludCBibG9jayB0cmVlICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gQlxuICAgICAgICAgICAgcGFyc2UgICAgICAgLiA/IHByaW50IHBhcnNlIHRyZWUgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBQXG4gICAgICAgICAgICBhc3RyICAgICAgICAuID8gcHJpbnQgcGFyc2UgdHJlZSBhcyBzdHJpbmcgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIEFcbiAgICAgICAgICAgIHNjb3BlICAgICAgIC4gPyBwcmludCBzY29wZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gU1xuICAgICAgICAgICAgdmVyYm9zZSAgICAgLiA/IGxvZyBtb3JlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgICAgIGRlYnVnICAgICAgIC4gPyBsb2cgZGVidWcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgICAgICByYXcgICAgICAgICAuID8gbG9nIHJhdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIFJcblxuICAgICAgICB2ZXJzaW9uICAje3BrZy52ZXJzaW9ufVxuICAgICAgICBcIlwiXCJcblxuICAgIGtvZGUgPSBuZXcgS29kZSBhcmdzXG4gICAga29kZS5jbGkoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEtvZGVcblxuIl19
//# sourceURL=../coffee/kode.coffee