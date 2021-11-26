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
        var Lexer, Parser, Renderer, Scoper;
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
        Renderer = require('./renderer');
        this.lexer = new Lexer(this);
        this.parser = new Parser(this);
        this.scoper = new Scoper(this);
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
        return this.scoper.vars(this.parser.parse(block));
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
    args = karg("kode option\n    files       . **\n    eval        . ? evaluate a string and print the result\n    compile     . ? compile a string and print the result\n    outdir      . ? output directory for transpiled files\n    map         . ? generate inline source maps             . = true\n    js          . ? print transpiled js code                . = true\n    run         . ? execute file                            . = false\n    tokens      . ? print tokens                            . = false  . - T\n    block       . ? print block tree                        . = false  . - B\n    parse       . ? print parse tree                        . = false  . - P\n    astr        . ? print parse tree as string              . = false  . - A\n    scope       . ? print scopes                            . = false  . - S\n    verbose     . ? log more                                . = false\n    debug       . ? log debug                               . = false  . - D\n    raw         . ? log raw                                 . = false  . - R\n\nversion  " + pkg.version);
    kode = new Kode(args);
    kode.cli();
}

module.exports = Kode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29kZS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImtvZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEtBQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxNQUFBLEdBQVMsT0FBQSxDQUFRLGVBQVI7O0FBQ1QsS0FBQSxHQUFTLE9BQUEsQ0FBUSxTQUFSOztBQUNULEdBQUEsR0FBUyxPQUFBLENBQVcsU0FBRCxHQUFXLGFBQXJCOztBQUNULEtBQUEsR0FBUyxTQUFDLENBQUQ7V0FBTyxDQUFBLENBQUEsS0FBTSxFQUFOLElBQUEsQ0FBQSxLQUFTLElBQVQsSUFBQSxDQUFBLEtBQWMsUUFBZCxDQUFBLElBQTRCLENBQUMsT0FBTyxDQUFQLEtBQWEsUUFBYixJQUEwQixNQUFNLENBQUMsSUFBUCxDQUFZLENBQVosQ0FBYyxDQUFDLE1BQWYsS0FBeUIsQ0FBcEQ7QUFBbkM7O0FBRVQsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFYLENBQUE7O0FBRU07SUFFQyxjQUFDLEtBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7O1lBRUEsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFROztRQUVULElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFUO1lBQXNCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixHQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLEtBQS9FOztRQUVBLEtBQUEsR0FBWSxPQUFBLENBQVEsU0FBUjtRQUNaLE1BQUEsR0FBWSxPQUFBLENBQVEsVUFBUjtR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LEdBQWMsT0FBUSxDQUFBLENBQUEsRUFEMUI7O0FBREo7WUFJQSxRQUFRLENBQUMsS0FBVCxHQUFpQixPQUFPLENBQUMsS0FBUixHQUFnQixNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsT0FBTyxDQUFDLEdBQVIsQ0FBQSxDQUF4QjtZQUNqQyxRQUFRLENBQUMsT0FBVCxHQUFtQixTQUFDLE9BQUQ7dUJBQWEsTUFBTSxDQUFDLGdCQUFQLENBQXdCLE9BQXhCLEVBQWlDLE9BQWpDO1lBQWIsRUFWdkI7O1FBWUEsRUFBQSxHQUFLLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBVDtBQUVMO1lBQ0ksT0FBTyxDQUFDLE9BQVIsR0FBa0I7bUJBQ2xCLEVBQUUsQ0FBQyxZQUFILENBQWdCLEVBQWhCLEVBQW9CLE9BQXBCLEVBRko7U0FBQSxhQUFBO1lBR007WUFDSCxPQUFBLENBQUMsS0FBRCxDQUFPLEdBQVAsRUFBWSxJQUFaO0FBQ0Msa0JBQU0sSUFMVjs7SUEzQkU7Ozs7OztBQXdDVixJQUFHLENBQUksTUFBTSxDQUFDLE1BQVgsSUFBcUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBbkIsQ0FBNEIsV0FBNUIsQ0FBeEI7SUFFSSxJQUFBLEdBQU8sSUFBQSxDQUFLLDhoQ0FBQSxHQWtCRyxHQUFHLENBQUMsT0FsQlo7SUFxQlAsSUFBQSxHQUFPLElBQUksSUFBSixDQUFTLElBQVQ7SUFDUCxJQUFJLENBQUMsR0FBTCxDQUFBLEVBeEJKOzs7QUEwQkEsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbjAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcbiMjI1xuXG5zbGFzaCAgPSByZXF1aXJlICdrc2xhc2gnXG5rc3RyICAgPSByZXF1aXJlICdrc3RyJ1xua2xvciAgID0gcmVxdWlyZSAna2xvcidcbmthcmcgICA9IHJlcXVpcmUgJ2thcmcnXG5jaGlsZHAgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xucHJpbnQgID0gcmVxdWlyZSAnLi9wcmludCdcbnBrZyAgICA9IHJlcXVpcmUgXCIje19fZGlybmFtZX0vLi4vcGFja2FnZVwiXG5lbXB0eSAgPSAoYSkgLT4gYSBpbiBbJycgbnVsbCB1bmRlZmluZWRdIG9yICh0eXBlb2YoYSkgPT0gJ29iamVjdCcgYW5kIE9iamVjdC5rZXlzKGEpLmxlbmd0aCA9PSAwKVxuXG5rbG9yLmtvbG9yLmdsb2JhbGl6ZSgpXG5cbmNsYXNzIEtvZGVcblxuICAgIEA6IChAYXJncykgLT5cblxuICAgICAgICBAYXJncyA/PSB7fVxuXG4gICAgICAgIGlmIEBhcmdzLnZlcmJvc2UgdGhlbiBAYXJncy5kZWJ1ZyA9IEBhcmdzLmJsb2NrID0gQGFyZ3MudG9rZW5zID0gQGFyZ3MucGFyc2UgPSB0cnVlXG5cbiAgICAgICAgTGV4ZXIgICAgID0gcmVxdWlyZSAnLi9sZXhlcidcbiAgICAgICAgUGFyc2VyICAgID0gcmVxdWlyZSAnLi9wYXJzZXInXG4gICAgICAgIFNjb3BlciAgICA9IHJlcXVpcmUgJy4vc2NvcGVyJ1xuICAgICAgICBSZW5kZXJlciAgPSByZXF1aXJlICcuL3JlbmRlcmVyJ1xuXG4gICAgICAgIEBsZXhlciAgICA9IG5ldyBMZXhlciAgICBAXG4gICAgICAgIEBwYXJzZXIgICA9IG5ldyBQYXJzZXIgICBAXG4gICAgICAgIEBzY29wZXIgICA9IG5ldyBTY29wZXIgICBAXG4gICAgICAgIEByZW5kZXJlciA9IG5ldyBSZW5kZXJlciBAXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDBcblxuICAgIGNsaTogLT5cblxuICAgICAgICAjIGlmIEBhcmdzLmRlYnVnIHRoZW4gcHJpbnQubm9vbiAnYXJncycgQGFyZ3NcblxuICAgICAgICBpZiBAYXJncy5jb21waWxlXG4gICAgICAgICAgICBsb2cgQGNvbXBpbGUgQGFyZ3MuY29tcGlsZVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGlmIEBhcmdzLmV2YWxcbiAgICAgICAgICAgIGxvZyBAZXZhbCBAYXJncy5ldmFsXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICByZXR1cm4gaWYgbm90IEBhcmdzLmZpbGVzLmxlbmd0aFxuXG4gICAgICAgIGZvciBmaWxlIGluIEBhcmdzLmZpbGVzXG5cbiAgICAgICAgICAgIGZpbGUgPSBzbGFzaC5yZXNvbHZlIGZpbGVcbiAgICAgICAgICAgIGxvZyBncmF5IGZpbGUgaWYgQGFyZ3MudmVyYm9zZVxuXG4gICAgICAgICAgICB0ZXh0ID0gc2xhc2gucmVhZFRleHQgZmlsZVxuXG4gICAgICAgICAgICBpZiBlbXB0eSB0ZXh0IHRoZW4gZXJyb3IgWTQgcjIgXCJjYW4ndCByZWFkICN7UjMgeTUgZmlsZX1cIjsgY29udGludWVcblxuICAgICAgICAgICAgY29kZSA9IEBjb21waWxlIHRleHRcblxuICAgICAgICAgICAgaWYgQGFyZ3Mub3V0cHV0XG4gICAgICAgICAgICAgICAgb3V0ID0gc2xhc2guam9pbiBAYXJncy5vdXRwdXQsIHNsYXNoLmZpbGUgZmlsZVxuICAgICAgICAgICAgICAgIG91dCA9IHNsYXNoLnN3YXBFeHQgb3V0LCAnanMnXG4gICAgICAgICAgICAgICAgbG9nICdvdXQnIG91dCBpZiBAYXJncy52ZXJib3NlXG4gICAgICAgICAgICAgICAgc2xhc2gud3JpdGVUZXh0IG91dCwgY29kZVxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwXG5cbiAgICBAY29tcGlsZTogKHRleHQpIC0+IChuZXcgS29kZSB7fSkuY29tcGlsZSB0ZXh0XG4gICAgY29tcGlsZTogKHRleHQpIC0+XG5cbiAgICAgICAgcmV0dXJuICcnIGlmIGVtcHR5IGtzdHIuc3RyaXAgdGV4dFxuXG4gICAgICAgIGFzdCA9IEBhc3QgdGV4dFxuXG4gICAgICAgIGlmIEBhcmdzLnBhcnNlIHRoZW4gcHJpbnQuYXN0ICdhc3QnIGFzdFxuICAgICAgICBpZiBAYXJncy5hc3RyICB0aGVuIGxvZyBwcmludC5hc3RyIGFzdCwgQGFyZ3Muc2NvcGVcblxuICAgICAgICBqcyA9IEByZW5kZXJlci5yZW5kZXIgYXN0XG5cbiAgICAgICAgcHJpbnQuY29kZSAnanMnIGpzIGlmIEBhcmdzLmpzIG9yIEBhcmdzLmRlYnVnXG5cbiAgICAgICAganNcblxuICAgIGFzdDogKHRleHQpIC0+XG5cbiAgICAgICAgdGV4dCArPSAnXFxuJyBpZiBub3QgdGV4dFstMV0gPT0gJ1xcbidcblxuICAgICAgICBwcmludC5jb2RlICdjb2ZmZWUnIHRleHQsICdjb2ZmZWUnIGlmIEBhcmdzLnZlcmJvc2Ugb3IgQGFyZ3MuZGVidWdcblxuICAgICAgICB0b2tlbnMgPSBAbGV4ZXIudG9rZW5pemUgdGV4dFxuXG4gICAgICAgIGlmIEBhcmdzLnJhdyAgICB0aGVuIHByaW50Lm5vb24gJ3JhdyB0b2tlbnMnIHRva2Vuc1xuICAgICAgICBpZiBAYXJncy50b2tlbnMgdGhlbiBwcmludC50b2tlbnMgJ3Rva2VucycgdG9rZW5zXG5cbiAgICAgICAgYmxvY2sgPSBAbGV4ZXIuYmxvY2tpZnkgdG9rZW5zXG5cbiAgICAgICAgaWYgQGFyZ3MucmF3ICAgdGhlbiBwcmludC5ub29uICdyYXcgYmxvY2snIGJsb2NrXG4gICAgICAgIGlmIEBhcmdzLmJsb2NrIHRoZW4gcHJpbnQuYmxvY2sgJ3RsIGJsb2NrJyBibG9ja1xuXG4gICAgICAgIEBzY29wZXIudmFycyBAcGFyc2VyLnBhcnNlIGJsb2NrXG5cbiAgICBhc3RyOiAodGV4dCwgc2NvcGVzKSAtPiBwcmludC5hc3RyIEBhc3QodGV4dCksIHNjb3Blc1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwMCAgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGV2YWw6ICh0ZXh0KSAtPlxuXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0ZXh0XG5cbiAgICAgICAgdm0gPSByZXF1aXJlICd2bSdcblxuICAgICAgICBzYW5kYm94ID0gdm0uY3JlYXRlQ29udGV4dCgpXG4gICAgICAgIHNhbmRib3guZ2xvYmFsID0gc2FuZGJveC5yb290ID0gc2FuZGJveC5HTE9CQUwgPSBzYW5kYm94XG5cbiAgICAgICAgc2FuZGJveC5fX2ZpbGVuYW1lID0gJ2V2YWwnXG4gICAgICAgIHNhbmRib3guX19kaXJuYW1lICA9IHNsYXNoLmRpciBzYW5kYm94Ll9fZmlsZW5hbWVcblxuICAgICAgICAjIGRlZmluZSBtb2R1bGUvcmVxdWlyZSBvbmx5IGlmIHRoZXkgY2hvc2Ugbm90IHRvIHNwZWNpZnkgdGhlaXIgb3duXG4gICAgICAgIHVubGVzcyBzYW5kYm94ICE9IGdsb2JhbCBvciBzYW5kYm94Lm1vZHVsZSBvciBzYW5kYm94LnJlcXVpcmVcbiAgICAgICAgICAgIE1vZHVsZSA9IHJlcXVpcmUgJ21vZHVsZSdcbiAgICAgICAgICAgIHNhbmRib3gubW9kdWxlICA9IF9tb2R1bGUgID0gbmV3IE1vZHVsZSAnZXZhbCdcbiAgICAgICAgICAgIHNhbmRib3gucmVxdWlyZSA9IF9yZXF1aXJlID0gKHBhdGgpIC0+ICBNb2R1bGUuX2xvYWQgcGF0aCwgX21vZHVsZSwgdHJ1ZVxuICAgICAgICAgICAgX21vZHVsZS5maWxlbmFtZSA9IHNhbmRib3guX19maWxlbmFtZVxuICAgICAgICAgICAgZm9yIHIgaW4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgcmVxdWlyZVxuICAgICAgICAgICAgICAgIGlmIHIgbm90IGluIFsncGF0aHMnICdhcmd1bWVudHMnICdjYWxsZXInXVxuICAgICAgICAgICAgICAgICAgICBfcmVxdWlyZVtyXSA9IHJlcXVpcmVbcl1cbiAgICAgICAgICAgICMgdXNlIHRoZSBzYW1lIGhhY2sgbm9kZSBjdXJyZW50bHkgdXNlcyBmb3IgdGhlaXIgb3duIFJFUExcbiAgICAgICAgICAgIF9yZXF1aXJlLnBhdGhzID0gX21vZHVsZS5wYXRocyA9IE1vZHVsZS5fbm9kZU1vZHVsZVBhdGhzIHByb2Nlc3MuY3dkKClcbiAgICAgICAgICAgIF9yZXF1aXJlLnJlc29sdmUgPSAocmVxdWVzdCkgLT4gTW9kdWxlLl9yZXNvbHZlRmlsZW5hbWUgcmVxdWVzdCwgX21vZHVsZVxuXG4gICAgICAgIGpzID0gQGNvbXBpbGUgdGV4dFxuXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgc2FuZGJveC5jb25zb2xlID0gY29uc29sZVxuICAgICAgICAgICAgdm0ucnVuSW5Db250ZXh0IGpzLCBzYW5kYm94XG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgZXJyb3IgZXJyLCB0ZXh0XG4gICAgICAgICAgICB0aHJvdyBlcnJcblxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG5cbmlmIG5vdCBtb2R1bGUucGFyZW50IG9yIG1vZHVsZS5wYXJlbnQucGF0aC5lbmRzV2l0aCAnL2tvZGUvYmluJ1xuXG4gICAgYXJncyA9IGthcmcgXCJcIlwiXG4gICAgICAgIGtvZGUgb3B0aW9uXG4gICAgICAgICAgICBmaWxlcyAgICAgICAuICoqXG4gICAgICAgICAgICBldmFsICAgICAgICAuID8gZXZhbHVhdGUgYSBzdHJpbmcgYW5kIHByaW50IHRoZSByZXN1bHRcbiAgICAgICAgICAgIGNvbXBpbGUgICAgIC4gPyBjb21waWxlIGEgc3RyaW5nIGFuZCBwcmludCB0aGUgcmVzdWx0XG4gICAgICAgICAgICBvdXRkaXIgICAgICAuID8gb3V0cHV0IGRpcmVjdG9yeSBmb3IgdHJhbnNwaWxlZCBmaWxlc1xuICAgICAgICAgICAgbWFwICAgICAgICAgLiA/IGdlbmVyYXRlIGlubGluZSBzb3VyY2UgbWFwcyAgICAgICAgICAgICAuID0gdHJ1ZVxuICAgICAgICAgICAganMgICAgICAgICAgLiA/IHByaW50IHRyYW5zcGlsZWQganMgY29kZSAgICAgICAgICAgICAgICAuID0gdHJ1ZVxuICAgICAgICAgICAgcnVuICAgICAgICAgLiA/IGV4ZWN1dGUgZmlsZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgICAgIHRva2VucyAgICAgIC4gPyBwcmludCB0b2tlbnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gVFxuICAgICAgICAgICAgYmxvY2sgICAgICAgLiA/IHByaW50IGJsb2NrIHRyZWUgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBCXG4gICAgICAgICAgICBwYXJzZSAgICAgICAuID8gcHJpbnQgcGFyc2UgdHJlZSAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIFBcbiAgICAgICAgICAgIGFzdHIgICAgICAgIC4gPyBwcmludCBwYXJzZSB0cmVlIGFzIHN0cmluZyAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gQVxuICAgICAgICAgICAgc2NvcGUgICAgICAgLiA/IHByaW50IHNjb3BlcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBTXG4gICAgICAgICAgICB2ZXJib3NlICAgICAuID8gbG9nIG1vcmUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICAgICAgZGVidWcgICAgICAgLiA/IGxvZyBkZWJ1ZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBEXG4gICAgICAgICAgICByYXcgICAgICAgICAuID8gbG9nIHJhdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIFJcblxuICAgICAgICB2ZXJzaW9uICAje3BrZy52ZXJzaW9ufVxuICAgICAgICBcIlwiXCJcblxuICAgIGtvZGUgPSBuZXcgS29kZSBhcmdzXG4gICAga29kZS5jbGkoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEtvZGVcblxuIl19
//# sourceURL=../coffee/kode.coffee