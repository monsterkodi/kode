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
        var Lexer, Parser, Renderer;
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
        Renderer = require('./renderer');
        this.lexer = new Lexer;
        this.parser = new Parser(this.args);
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
                results.push(console.log(code));
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
        js = this.renderer.render(ast);
        if (this.args.js || this.args.verbose || this.args.debug) {
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
        return this.parser.parse(block);
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
    args = karg("kode option\n    files       . **\n    eval        . ? evaluate a string and print the result\n    compile     . ? compile a string and print the result\n    outdir      . ? output directory for transpiled files\n    map         . ? generate inline source maps             . = true\n    js          . ? print js code                           . = false\n    tokens      . ? print tokens                            . = false  . - T\n    block       . ? print block tree                        . = false  . - B\n    parse       . ? print parse tree                        . = false  . - P\n    debug       . ? log debug                               . = false  . - D\n    raw         . ? log raw                                 . = false  . - R\n    verbose     . ? log more                                . = false\n\nversion  " + pkg.version);
    kode = new Kode(args);
    kode.cli();
}

module.exports = Kode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29kZS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImtvZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEtBQUEsR0FBVyxPQUFBLENBQVEsUUFBUjs7QUFDWCxJQUFBLEdBQVcsT0FBQSxDQUFRLE1BQVI7O0FBQ1gsSUFBQSxHQUFXLE9BQUEsQ0FBUSxNQUFSOztBQUNYLElBQUEsR0FBVyxPQUFBLENBQVEsTUFBUjs7QUFDWCxNQUFBLEdBQVcsT0FBQSxDQUFRLGVBQVI7O0FBQ1gsS0FBQSxHQUFXLE9BQUEsQ0FBUSxTQUFSOztBQUNYLEdBQUEsR0FBVyxPQUFBLENBQVcsU0FBRCxHQUFXLGFBQXJCOztBQUNYLEtBQUEsR0FBVyxTQUFDLENBQUQ7V0FBTyxDQUFBLENBQUEsS0FBTSxFQUFOLElBQUEsQ0FBQSxLQUFTLElBQVQsSUFBQSxDQUFBLEtBQWMsUUFBZCxDQUFBLElBQTRCLENBQUMsT0FBTyxDQUFQLEtBQWEsUUFBYixJQUEwQixNQUFNLENBQUMsSUFBUCxDQUFZLENBQVosQ0FBYyxDQUFDLE1BQWYsS0FBeUIsQ0FBcEQ7QUFBbkM7O0FBRVgsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFYLENBQUE7O0FBRU07SUFFQyxjQUFDLEtBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7O1lBRUEsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFROztRQUVULElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFUO1lBQXNCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixHQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLEtBQS9FOztRQUVBLEtBQUEsR0FBWSxPQUFBLENBQVEsU0FBUjtRQUNaLE1BQUEsR0FBWSxPQUFBLENBQVEsVUFBUjtR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a0I7bUJBQ2xCLEVBQUUsQ0FBQyxZQUFILENBQWdCLEVBQWhCLEVBQW9CLE9BQXBCLEVBRko7U0FBQSxhQUFBO1lBR007WUFDSCxPQUFBLENBQUMsS0FBRCxDQUFPLEdBQVAsRUFBWSxJQUFaO0FBQ0Msa0JBQU0sSUFMVjs7SUEzQkU7Ozs7OztBQXdDVixJQUFHLENBQUksTUFBTSxDQUFDLE1BQVgsSUFBcUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBbkIsQ0FBNEIsV0FBNUIsQ0FBeEI7SUFFSSxJQUFBLEdBQU8sSUFBQSxDQUFLLDR6QkFBQSxHQWVHLEdBQUcsQ0FBQyxPQWZaO0lBa0JQLElBQUEsR0FBTyxJQUFJLElBQUosQ0FBUyxJQUFUO0lBQ1AsSUFBSSxDQUFDLEdBQUwsQ0FBQSxFQXJCSjs7O0FBdUJBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4wMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4jIyNcblxuc2xhc2ggICAgPSByZXF1aXJlICdrc2xhc2gnXG5rc3RyICAgICA9IHJlcXVpcmUgJ2tzdHInXG5rbG9yICAgICA9IHJlcXVpcmUgJ2tsb3InXG5rYXJnICAgICA9IHJlcXVpcmUgJ2thcmcnXG5jaGlsZHAgICA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG5wcmludCAgICA9IHJlcXVpcmUgJy4vcHJpbnQnXG5wa2cgICAgICA9IHJlcXVpcmUgXCIje19fZGlybmFtZX0vLi4vcGFja2FnZVwiXG5lbXB0eSAgICA9IChhKSAtPiBhIGluIFsnJyBudWxsIHVuZGVmaW5lZF0gb3IgKHR5cGVvZihhKSA9PSAnb2JqZWN0JyBhbmQgT2JqZWN0LmtleXMoYSkubGVuZ3RoID09IDApXG5cbmtsb3Iua29sb3IuZ2xvYmFsaXplKClcblxuY2xhc3MgS29kZVxuXG4gICAgQDogKEBhcmdzKSAtPlxuXG4gICAgICAgIEBhcmdzID89IHt9XG5cbiAgICAgICAgaWYgQGFyZ3MudmVyYm9zZSB0aGVuIEBhcmdzLmRlYnVnID0gQGFyZ3MuYmxvY2sgPSBAYXJncy50b2tlbnMgPSBAYXJncy5wYXJzZSA9IHRydWVcblxuICAgICAgICBMZXhlciAgICAgPSByZXF1aXJlICcuL2xleGVyJ1xuICAgICAgICBQYXJzZXIgICAgPSByZXF1aXJlICcuL3BhcnNlcidcbiAgICAgICAgUmVuZGVyZXIgID0gcmVxdWlyZSAnLi9yZW5kZXJlcidcblxuICAgICAgICBAbGV4ZXIgICAgPSBuZXcgTGV4ZXJcbiAgICAgICAgQHBhcnNlciAgID0gbmV3IFBhcnNlciAgIEBhcmdzXG4gICAgICAgIEByZW5kZXJlciA9IG5ldyBSZW5kZXJlciBAXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDBcblxuICAgIGNsaTogLT5cblxuICAgICAgICAjIGlmIEBhcmdzLmRlYnVnIHRoZW4gcHJpbnQubm9vbiAnYXJncycgQGFyZ3NcblxuICAgICAgICBpZiBAYXJncy5jb21waWxlXG4gICAgICAgICAgICBsb2cgQGNvbXBpbGUgQGFyZ3MuY29tcGlsZVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGlmIEBhcmdzLmV2YWxcbiAgICAgICAgICAgIGxvZyBAZXZhbCBAYXJncy5ldmFsXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICByZXR1cm4gaWYgbm90IEBhcmdzLmZpbGVzLmxlbmd0aFxuXG4gICAgICAgIGZvciBmaWxlIGluIEBhcmdzLmZpbGVzXG5cbiAgICAgICAgICAgIGZpbGUgPSBzbGFzaC5yZXNvbHZlIGZpbGVcbiAgICAgICAgICAgIGxvZyBncmF5IGZpbGUgaWYgQGFyZ3MudmVyYm9zZVxuXG4gICAgICAgICAgICB0ZXh0ID0gc2xhc2gucmVhZFRleHQgZmlsZVxuXG4gICAgICAgICAgICBpZiBlbXB0eSB0ZXh0IHRoZW4gZXJyb3IgWTQgcjIgXCJjYW4ndCByZWFkICN7UjMgeTUgZmlsZX1cIjsgY29udGludWVcblxuICAgICAgICAgICAgY29kZSA9IEBjb21waWxlIHRleHRcblxuICAgICAgICAgICAgaWYgQGFyZ3Mub3V0cHV0XG4gICAgICAgICAgICAgICAgb3V0ID0gc2xhc2guam9pbiBAYXJncy5vdXRwdXQsIHNsYXNoLmZpbGUgZmlsZVxuICAgICAgICAgICAgICAgIG91dCA9IHNsYXNoLnN3YXBFeHQgb3V0LCAnanMnXG4gICAgICAgICAgICAgICAgbG9nICdvdXQnIG91dCBpZiBAYXJncy52ZXJib3NlXG4gICAgICAgICAgICAgICAgc2xhc2gud3JpdGVUZXh0IG91dCwgY29kZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxvZyBjb2RlXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcblxuICAgIEBjb21waWxlOiAodGV4dCkgLT4gKG5ldyBLb2RlIHt9KS5jb21waWxlIHRleHRcbiAgICBjb21waWxlOiAodGV4dCkgLT5cblxuICAgICAgICByZXR1cm4gJycgaWYgZW1wdHkga3N0ci5zdHJpcCB0ZXh0XG5cbiAgICAgICAgYXN0ID0gQGFzdCB0ZXh0XG5cbiAgICAgICAgaWYgQGFyZ3MucGFyc2UgdGhlbiBwcmludC5hc3QgJ2FzdCcgYXN0XG5cbiAgICAgICAganMgPSBAcmVuZGVyZXIucmVuZGVyIGFzdFxuXG4gICAgICAgIHByaW50LmNvZGUgJ2pzJyBqcyBpZiBAYXJncy5qcyBvciBAYXJncy52ZXJib3NlIG9yIEBhcmdzLmRlYnVnXG5cbiAgICAgICAganNcblxuICAgIGFzdDogKHRleHQpIC0+XG5cbiAgICAgICAgdGV4dCArPSAnXFxuJyBpZiBub3QgdGV4dFstMV0gPT0gJ1xcbidcblxuICAgICAgICBwcmludC5jb2RlICdjb2ZmZWUnIHRleHQsICdjb2ZmZWUnIGlmIEBhcmdzLnZlcmJvc2Ugb3IgQGFyZ3MuZGVidWdcblxuICAgICAgICB0b2tlbnMgPSBAbGV4ZXIudG9rZW5pemUgdGV4dFxuXG4gICAgICAgIGlmIEBhcmdzLnJhdyAgICB0aGVuIHByaW50Lm5vb24gJ3JhdyB0b2tlbnMnIHRva2Vuc1xuICAgICAgICBpZiBAYXJncy50b2tlbnMgdGhlbiBwcmludC50b2tlbnMgJ3Rva2VucycgdG9rZW5zXG5cbiAgICAgICAgYmxvY2sgPSBAbGV4ZXIuYmxvY2tpZnkgdG9rZW5zXG5cbiAgICAgICAgaWYgQGFyZ3MucmF3ICAgdGhlbiBwcmludC5ub29uICdyYXcgYmxvY2snIGJsb2NrXG4gICAgICAgIGlmIEBhcmdzLmJsb2NrIHRoZW4gcHJpbnQuYmxvY2sgJ3RsIGJsb2NrJyBibG9ja1xuXG4gICAgICAgIEBwYXJzZXIucGFyc2UgYmxvY2tcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAwICAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgZXZhbDogKHRleHQpIC0+XG5cbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IHRleHRcblxuICAgICAgICB2bSA9IHJlcXVpcmUgJ3ZtJ1xuXG4gICAgICAgIHNhbmRib3ggPSB2bS5jcmVhdGVDb250ZXh0KClcbiAgICAgICAgc2FuZGJveC5nbG9iYWwgPSBzYW5kYm94LnJvb3QgPSBzYW5kYm94LkdMT0JBTCA9IHNhbmRib3hcblxuICAgICAgICBzYW5kYm94Ll9fZmlsZW5hbWUgPSAnZXZhbCdcbiAgICAgICAgc2FuZGJveC5fX2Rpcm5hbWUgID0gc2xhc2guZGlyIHNhbmRib3guX19maWxlbmFtZVxuXG4gICAgICAgICMgZGVmaW5lIG1vZHVsZS9yZXF1aXJlIG9ubHkgaWYgdGhleSBjaG9zZSBub3QgdG8gc3BlY2lmeSB0aGVpciBvd25cbiAgICAgICAgdW5sZXNzIHNhbmRib3ggIT0gZ2xvYmFsIG9yIHNhbmRib3gubW9kdWxlIG9yIHNhbmRib3gucmVxdWlyZVxuICAgICAgICAgICAgTW9kdWxlID0gcmVxdWlyZSAnbW9kdWxlJ1xuICAgICAgICAgICAgc2FuZGJveC5tb2R1bGUgID0gX21vZHVsZSAgPSBuZXcgTW9kdWxlICdldmFsJ1xuICAgICAgICAgICAgc2FuZGJveC5yZXF1aXJlID0gX3JlcXVpcmUgPSAocGF0aCkgLT4gIE1vZHVsZS5fbG9hZCBwYXRoLCBfbW9kdWxlLCB0cnVlXG4gICAgICAgICAgICBfbW9kdWxlLmZpbGVuYW1lID0gc2FuZGJveC5fX2ZpbGVuYW1lXG4gICAgICAgICAgICBmb3IgciBpbiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyByZXF1aXJlXG4gICAgICAgICAgICAgICAgaWYgciBub3QgaW4gWydwYXRocycgJ2FyZ3VtZW50cycgJ2NhbGxlciddXG4gICAgICAgICAgICAgICAgICAgIF9yZXF1aXJlW3JdID0gcmVxdWlyZVtyXVxuICAgICAgICAgICAgIyB1c2UgdGhlIHNhbWUgaGFjayBub2RlIGN1cnJlbnRseSB1c2VzIGZvciB0aGVpciBvd24gUkVQTFxuICAgICAgICAgICAgX3JlcXVpcmUucGF0aHMgPSBfbW9kdWxlLnBhdGhzID0gTW9kdWxlLl9ub2RlTW9kdWxlUGF0aHMgcHJvY2Vzcy5jd2QoKVxuICAgICAgICAgICAgX3JlcXVpcmUucmVzb2x2ZSA9IChyZXF1ZXN0KSAtPiBNb2R1bGUuX3Jlc29sdmVGaWxlbmFtZSByZXF1ZXN0LCBfbW9kdWxlXG5cbiAgICAgICAganMgPSBAY29tcGlsZSB0ZXh0XG5cbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBzYW5kYm94LmNvbnNvbGUgPSBjb25zb2xlXG4gICAgICAgICAgICB2bS5ydW5JbkNvbnRleHQganMsIHNhbmRib3hcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBlcnJvciBlcnIsIHRleHRcbiAgICAgICAgICAgIHRocm93IGVyclxuXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcblxuaWYgbm90IG1vZHVsZS5wYXJlbnQgb3IgbW9kdWxlLnBhcmVudC5wYXRoLmVuZHNXaXRoICcva29kZS9iaW4nXG5cbiAgICBhcmdzID0ga2FyZyBcIlwiXCJcbiAgICAgICAga29kZSBvcHRpb25cbiAgICAgICAgICAgIGZpbGVzICAgICAgIC4gKipcbiAgICAgICAgICAgIGV2YWwgICAgICAgIC4gPyBldmFsdWF0ZSBhIHN0cmluZyBhbmQgcHJpbnQgdGhlIHJlc3VsdFxuICAgICAgICAgICAgY29tcGlsZSAgICAgLiA/IGNvbXBpbGUgYSBzdHJpbmcgYW5kIHByaW50IHRoZSByZXN1bHRcbiAgICAgICAgICAgIG91dGRpciAgICAgIC4gPyBvdXRwdXQgZGlyZWN0b3J5IGZvciB0cmFuc3BpbGVkIGZpbGVzXG4gICAgICAgICAgICBtYXAgICAgICAgICAuID8gZ2VuZXJhdGUgaW5saW5lIHNvdXJjZSBtYXBzICAgICAgICAgICAgIC4gPSB0cnVlXG4gICAgICAgICAgICBqcyAgICAgICAgICAuID8gcHJpbnQganMgY29kZSAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICAgICAgdG9rZW5zICAgICAgLiA/IHByaW50IHRva2VucyAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBUXG4gICAgICAgICAgICBibG9jayAgICAgICAuID8gcHJpbnQgYmxvY2sgdHJlZSAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIEJcbiAgICAgICAgICAgIHBhcnNlICAgICAgIC4gPyBwcmludCBwYXJzZSB0cmVlICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gUFxuICAgICAgICAgICAgZGVidWcgICAgICAgLiA/IGxvZyBkZWJ1ZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBEXG4gICAgICAgICAgICByYXcgICAgICAgICAuID8gbG9nIHJhdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIFJcbiAgICAgICAgICAgIHZlcmJvc2UgICAgIC4gPyBsb2cgbW9yZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG5cbiAgICAgICAgdmVyc2lvbiAgI3twa2cudmVyc2lvbn1cbiAgICAgICAgXCJcIlwiXG5cbiAgICBrb2RlID0gbmV3IEtvZGUgYXJnc1xuICAgIGtvZGUuY2xpKClcblxubW9kdWxlLmV4cG9ydHMgPSBLb2RlXG5cbiJdfQ==
//# sourceURL=../coffee/kode.coffee