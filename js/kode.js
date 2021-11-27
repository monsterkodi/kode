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
        return this.scoper.collect(this.parser.parse(block));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29kZS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImtvZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEtBQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxNQUFBLEdBQVMsT0FBQSxDQUFRLGVBQVI7O0FBQ1QsS0FBQSxHQUFTLE9BQUEsQ0FBUSxTQUFSOztBQUNULEdBQUEsR0FBUyxPQUFBLENBQVcsU0FBRCxHQUFXLGFBQXJCOztBQUNULEtBQUEsR0FBUyxTQUFDLENBQUQ7V0FBTyxDQUFBLENBQUEsS0FBTSxFQUFOLElBQUEsQ0FBQSxLQUFTLElBQVQsSUFBQSxDQUFBLEtBQWMsUUFBZCxDQUFBLElBQTRCLENBQUMsT0FBTyxDQUFQLEtBQWEsUUFBYixJQUEwQixNQUFNLENBQUMsSUFBUCxDQUFZLENBQVosQ0FBYyxDQUFDLE1BQWYsS0FBeUIsQ0FBcEQ7QUFBbkM7O0FBRVQsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFYLENBQUE7O0FBRU07SUFFQyxjQUFDLEtBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7O1lBRUEsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFROztRQUVULElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFUO1lBQXNCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixHQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLEtBQS9FOztRQUVBLEtBQUEsR0FBWSxPQUFBLENBQVEsU0FBUjtRQUNaLE1BQUEsR0FBWSxPQUFBLENBQVEsVUFBUjtR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QVQsR0FBYyxPQUFRLENBQUEsQ0FBQSxFQUQxQjs7QUFESjtZQUlBLFFBQVEsQ0FBQyxLQUFULEdBQWlCLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixPQUFPLENBQUMsR0FBUixDQUFBLENBQXhCO1lBQ2pDLFFBQVEsQ0FBQyxPQUFULEdBQW1CLFNBQUMsT0FBRDt1QkFBYSxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsT0FBeEIsRUFBaUMsT0FBakM7WUFBYixFQVZ2Qjs7UUFZQSxFQUFBLEdBQUssSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFUO0FBRUw7WUFDSSxPQUFPLENBQUMsT0FBUixHQUFrQjttQkFDbEIsRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsRUFBaEIsRUFBb0IsT0FBcEIsRUFGSjtTQUFBLGFBQUE7WUFHTTtZQUNILE9BQUEsQ0FBQyxLQUFELENBQU8sR0FBUCxFQUFZLElBQVo7QUFDQyxrQkFBTSxJQUxWOztJQTNCRTs7Ozs7O0FBd0NWLElBQUcsQ0FBSSxNQUFNLENBQUMsTUFBWCxJQUFxQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFuQixDQUE0QixXQUE1QixDQUF4QjtJQUVJLElBQUEsR0FBTyxJQUFBLENBQUssOGhDQUFBLEdBa0JHLEdBQUcsQ0FBQyxPQWxCWjtJQXFCUCxJQUFBLEdBQU8sSUFBSSxJQUFKLENBQVMsSUFBVDtJQUNQLElBQUksQ0FBQyxHQUFMLENBQUEsRUF4Qko7OztBQTBCQSxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuIyMjXG5cbnNsYXNoICA9IHJlcXVpcmUgJ2tzbGFzaCdcbmtzdHIgICA9IHJlcXVpcmUgJ2tzdHInXG5rbG9yICAgPSByZXF1aXJlICdrbG9yJ1xua2FyZyAgID0gcmVxdWlyZSAna2FyZydcbmNoaWxkcCA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG5wcmludCAgPSByZXF1aXJlICcuL3ByaW50J1xucGtnICAgID0gcmVxdWlyZSBcIiN7X19kaXJuYW1lfS8uLi9wYWNrYWdlXCJcbmVtcHR5ICA9IChhKSAtPiBhIGluIFsnJyBudWxsIHVuZGVmaW5lZF0gb3IgKHR5cGVvZihhKSA9PSAnb2JqZWN0JyBhbmQgT2JqZWN0LmtleXMoYSkubGVuZ3RoID09IDApXG5cbmtsb3Iua29sb3IuZ2xvYmFsaXplKClcblxuY2xhc3MgS29kZVxuXG4gICAgQDogKEBhcmdzKSAtPlxuXG4gICAgICAgIEBhcmdzID89IHt9XG5cbiAgICAgICAgaWYgQGFyZ3MudmVyYm9zZSB0aGVuIEBhcmdzLmRlYnVnID0gQGFyZ3MuYmxvY2sgPSBAYXJncy50b2tlbnMgPSBAYXJncy5wYXJzZSA9IHRydWVcblxuICAgICAgICBMZXhlciAgICAgPSByZXF1aXJlICcuL2xleGVyJ1xuICAgICAgICBQYXJzZXIgICAgPSByZXF1aXJlICcuL3BhcnNlcidcbiAgICAgICAgU2NvcGVyICAgID0gcmVxdWlyZSAnLi9zY29wZXInXG4gICAgICAgIFJlbmRlcmVyICA9IHJlcXVpcmUgJy4vcmVuZGVyZXInXG5cbiAgICAgICAgQGxleGVyICAgID0gbmV3IExleGVyICAgIEBcbiAgICAgICAgQHBhcnNlciAgID0gbmV3IFBhcnNlciAgIEBcbiAgICAgICAgQHNjb3BlciAgID0gbmV3IFNjb3BlciAgIEBcbiAgICAgICAgQHJlbmRlcmVyID0gbmV3IFJlbmRlcmVyIEBcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMFxuXG4gICAgY2xpOiAtPlxuXG4gICAgICAgICMgaWYgQGFyZ3MuZGVidWcgdGhlbiBwcmludC5ub29uICdhcmdzJyBAYXJnc1xuXG4gICAgICAgIGlmIEBhcmdzLmNvbXBpbGVcbiAgICAgICAgICAgIGxvZyBAY29tcGlsZSBAYXJncy5jb21waWxlXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgaWYgQGFyZ3MuZXZhbFxuICAgICAgICAgICAgbG9nIEBldmFsIEBhcmdzLmV2YWxcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHJldHVybiBpZiBub3QgQGFyZ3MuZmlsZXMubGVuZ3RoXG5cbiAgICAgICAgZm9yIGZpbGUgaW4gQGFyZ3MuZmlsZXNcblxuICAgICAgICAgICAgZmlsZSA9IHNsYXNoLnJlc29sdmUgZmlsZVxuICAgICAgICAgICAgbG9nIGdyYXkgZmlsZSBpZiBAYXJncy52ZXJib3NlXG5cbiAgICAgICAgICAgIHRleHQgPSBzbGFzaC5yZWFkVGV4dCBmaWxlXG5cbiAgICAgICAgICAgIGlmIGVtcHR5IHRleHQgdGhlbiBlcnJvciBZNCByMiBcImNhbid0IHJlYWQgI3tSMyB5NSBmaWxlfVwiOyBjb250aW51ZVxuXG4gICAgICAgICAgICBjb2RlID0gQGNvbXBpbGUgdGV4dFxuXG4gICAgICAgICAgICBpZiBAYXJncy5vdXRwdXRcbiAgICAgICAgICAgICAgICBvdXQgPSBzbGFzaC5qb2luIEBhcmdzLm91dHB1dCwgc2xhc2guZmlsZSBmaWxlXG4gICAgICAgICAgICAgICAgb3V0ID0gc2xhc2guc3dhcEV4dCBvdXQsICdqcydcbiAgICAgICAgICAgICAgICBsb2cgJ291dCcgb3V0IGlmIEBhcmdzLnZlcmJvc2VcbiAgICAgICAgICAgICAgICBzbGFzaC53cml0ZVRleHQgb3V0LCBjb2RlXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcblxuICAgIEBjb21waWxlOiAodGV4dCkgLT4gKG5ldyBLb2RlIHt9KS5jb21waWxlIHRleHRcbiAgICBjb21waWxlOiAodGV4dCkgLT5cblxuICAgICAgICByZXR1cm4gJycgaWYgZW1wdHkga3N0ci5zdHJpcCB0ZXh0XG5cbiAgICAgICAgYXN0ID0gQGFzdCB0ZXh0XG5cbiAgICAgICAgaWYgQGFyZ3MucGFyc2UgdGhlbiBwcmludC5hc3QgJ2FzdCcgYXN0XG4gICAgICAgIGlmIEBhcmdzLmFzdHIgIHRoZW4gbG9nIHByaW50LmFzdHIgYXN0LCBAYXJncy5zY29wZVxuXG4gICAgICAgIGpzID0gQHJlbmRlcmVyLnJlbmRlciBhc3RcblxuICAgICAgICBwcmludC5jb2RlICdqcycganMgaWYgQGFyZ3MuanMgb3IgQGFyZ3MuZGVidWdcblxuICAgICAgICBqc1xuXG4gICAgYXN0OiAodGV4dCkgLT5cblxuICAgICAgICB0ZXh0ICs9ICdcXG4nIGlmIG5vdCB0ZXh0Wy0xXSA9PSAnXFxuJ1xuXG4gICAgICAgIHByaW50LmNvZGUgJ2NvZmZlZScgdGV4dCwgJ2NvZmZlZScgaWYgQGFyZ3MudmVyYm9zZSBvciBAYXJncy5kZWJ1Z1xuXG4gICAgICAgIHRva2VucyA9IEBsZXhlci50b2tlbml6ZSB0ZXh0XG5cbiAgICAgICAgaWYgQGFyZ3MucmF3ICAgIHRoZW4gcHJpbnQubm9vbiAncmF3IHRva2VucycgdG9rZW5zXG4gICAgICAgIGlmIEBhcmdzLnRva2VucyB0aGVuIHByaW50LnRva2VucyAndG9rZW5zJyB0b2tlbnNcblxuICAgICAgICBibG9jayA9IEBsZXhlci5ibG9ja2lmeSB0b2tlbnNcblxuICAgICAgICBpZiBAYXJncy5yYXcgICB0aGVuIHByaW50Lm5vb24gJ3JhdyBibG9jaycgYmxvY2tcbiAgICAgICAgaWYgQGFyZ3MuYmxvY2sgdGhlbiBwcmludC5ibG9jayAndGwgYmxvY2snIGJsb2NrXG5cbiAgICAgICAgQHNjb3Blci5jb2xsZWN0IEBwYXJzZXIucGFyc2UgYmxvY2tcblxuICAgIGFzdHI6ICh0ZXh0LCBzY29wZXMpIC0+IHByaW50LmFzdHIgQGFzdCh0ZXh0KSwgc2NvcGVzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAwICAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgZXZhbDogKHRleHQpIC0+XG5cbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IHRleHRcblxuICAgICAgICB2bSA9IHJlcXVpcmUgJ3ZtJ1xuXG4gICAgICAgIHNhbmRib3ggPSB2bS5jcmVhdGVDb250ZXh0KClcbiAgICAgICAgc2FuZGJveC5nbG9iYWwgPSBzYW5kYm94LnJvb3QgPSBzYW5kYm94LkdMT0JBTCA9IHNhbmRib3hcblxuICAgICAgICBzYW5kYm94Ll9fZmlsZW5hbWUgPSAnZXZhbCdcbiAgICAgICAgc2FuZGJveC5fX2Rpcm5hbWUgID0gc2xhc2guZGlyIHNhbmRib3guX19maWxlbmFtZVxuXG4gICAgICAgICMgZGVmaW5lIG1vZHVsZS9yZXF1aXJlIG9ubHkgaWYgdGhleSBjaG9zZSBub3QgdG8gc3BlY2lmeSB0aGVpciBvd25cbiAgICAgICAgdW5sZXNzIHNhbmRib3ggIT0gZ2xvYmFsIG9yIHNhbmRib3gubW9kdWxlIG9yIHNhbmRib3gucmVxdWlyZVxuICAgICAgICAgICAgTW9kdWxlID0gcmVxdWlyZSAnbW9kdWxlJ1xuICAgICAgICAgICAgc2FuZGJveC5tb2R1bGUgID0gX21vZHVsZSAgPSBuZXcgTW9kdWxlICdldmFsJ1xuICAgICAgICAgICAgc2FuZGJveC5yZXF1aXJlID0gX3JlcXVpcmUgPSAocGF0aCkgLT4gIE1vZHVsZS5fbG9hZCBwYXRoLCBfbW9kdWxlLCB0cnVlXG4gICAgICAgICAgICBfbW9kdWxlLmZpbGVuYW1lID0gc2FuZGJveC5fX2ZpbGVuYW1lXG4gICAgICAgICAgICBmb3IgciBpbiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyByZXF1aXJlXG4gICAgICAgICAgICAgICAgaWYgciBub3QgaW4gWydwYXRocycgJ2FyZ3VtZW50cycgJ2NhbGxlciddXG4gICAgICAgICAgICAgICAgICAgIF9yZXF1aXJlW3JdID0gcmVxdWlyZVtyXVxuICAgICAgICAgICAgIyB1c2UgdGhlIHNhbWUgaGFjayBub2RlIGN1cnJlbnRseSB1c2VzIGZvciB0aGVpciBvd24gUkVQTFxuICAgICAgICAgICAgX3JlcXVpcmUucGF0aHMgPSBfbW9kdWxlLnBhdGhzID0gTW9kdWxlLl9ub2RlTW9kdWxlUGF0aHMgcHJvY2Vzcy5jd2QoKVxuICAgICAgICAgICAgX3JlcXVpcmUucmVzb2x2ZSA9IChyZXF1ZXN0KSAtPiBNb2R1bGUuX3Jlc29sdmVGaWxlbmFtZSByZXF1ZXN0LCBfbW9kdWxlXG5cbiAgICAgICAganMgPSBAY29tcGlsZSB0ZXh0XG5cbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBzYW5kYm94LmNvbnNvbGUgPSBjb25zb2xlXG4gICAgICAgICAgICB2bS5ydW5JbkNvbnRleHQganMsIHNhbmRib3hcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBlcnJvciBlcnIsIHRleHRcbiAgICAgICAgICAgIHRocm93IGVyclxuXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcblxuaWYgbm90IG1vZHVsZS5wYXJlbnQgb3IgbW9kdWxlLnBhcmVudC5wYXRoLmVuZHNXaXRoICcva29kZS9iaW4nXG5cbiAgICBhcmdzID0ga2FyZyBcIlwiXCJcbiAgICAgICAga29kZSBvcHRpb25cbiAgICAgICAgICAgIGZpbGVzICAgICAgIC4gKipcbiAgICAgICAgICAgIGV2YWwgICAgICAgIC4gPyBldmFsdWF0ZSBhIHN0cmluZyBhbmQgcHJpbnQgdGhlIHJlc3VsdFxuICAgICAgICAgICAgY29tcGlsZSAgICAgLiA/IGNvbXBpbGUgYSBzdHJpbmcgYW5kIHByaW50IHRoZSByZXN1bHRcbiAgICAgICAgICAgIG91dGRpciAgICAgIC4gPyBvdXRwdXQgZGlyZWN0b3J5IGZvciB0cmFuc3BpbGVkIGZpbGVzXG4gICAgICAgICAgICBtYXAgICAgICAgICAuID8gZ2VuZXJhdGUgaW5saW5lIHNvdXJjZSBtYXBzICAgICAgICAgICAgIC4gPSB0cnVlXG4gICAgICAgICAgICBqcyAgICAgICAgICAuID8gcHJpbnQgdHJhbnNwaWxlZCBqcyBjb2RlICAgICAgICAgICAgICAgIC4gPSB0cnVlXG4gICAgICAgICAgICBydW4gICAgICAgICAuID8gZXhlY3V0ZSBmaWxlICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICAgICAgdG9rZW5zICAgICAgLiA/IHByaW50IHRva2VucyAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBUXG4gICAgICAgICAgICBibG9jayAgICAgICAuID8gcHJpbnQgYmxvY2sgdHJlZSAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIEJcbiAgICAgICAgICAgIHBhcnNlICAgICAgIC4gPyBwcmludCBwYXJzZSB0cmVlICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gUFxuICAgICAgICAgICAgYXN0ciAgICAgICAgLiA/IHByaW50IHBhcnNlIHRyZWUgYXMgc3RyaW5nICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBBXG4gICAgICAgICAgICBzY29wZSAgICAgICAuID8gcHJpbnQgc2NvcGVzICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIFNcbiAgICAgICAgICAgIHZlcmJvc2UgICAgIC4gPyBsb2cgbW9yZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgICAgICBkZWJ1ZyAgICAgICAuID8gbG9nIGRlYnVnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIERcbiAgICAgICAgICAgIHJhdyAgICAgICAgIC4gPyBsb2cgcmF3ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gUlxuXG4gICAgICAgIHZlcnNpb24gICN7cGtnLnZlcnNpb259XG4gICAgICAgIFwiXCJcIlxuXG4gICAga29kZSA9IG5ldyBLb2RlIGFyZ3NcbiAgICBrb2RlLmNsaSgpXG5cbm1vZHVsZS5leHBvcnRzID0gS29kZVxuXG4iXX0=
//# sourceURL=../coffee/kode.coffee