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
    args = karg("kode option\n    files       . **\n    eval        . ? evaluate a string and print the result\n    compile     . ? compile a string and print the result\n    outdir      . ? output directory for transpiled files\n    map         . ? generate inline source maps             . = true\n    js          . ? print transpiled js code                . = true\n    run         . ? execute file                            . = false\n    tokens      . ? print tokens                            . = false  . - T\n    block       . ? print block tree                        . = false  . - B\n    parse       . ? print parse tree                        . = false  . - P\n    debug       . ? log debug                               . = false  . - D\n    raw         . ? log raw                                 . = false  . - R\n    verbose     . ? log more                                . = false\n\nversion  " + pkg.version);
    kode = new Kode(args);
    kode.cli();
}

module.exports = Kode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29kZS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImtvZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEtBQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxNQUFBLEdBQVMsT0FBQSxDQUFRLGVBQVI7O0FBQ1QsS0FBQSxHQUFTLE9BQUEsQ0FBUSxTQUFSOztBQUNULEdBQUEsR0FBUyxPQUFBLENBQVcsU0FBRCxHQUFXLGFBQXJCOztBQUNULEtBQUEsR0FBUyxTQUFDLENBQUQ7V0FBTyxDQUFBLENBQUEsS0FBTSxFQUFOLElBQUEsQ0FBQSxLQUFTLElBQVQsSUFBQSxDQUFBLEtBQWMsUUFBZCxDQUFBLElBQTRCLENBQUMsT0FBTyxDQUFQLEtBQWEsUUFBYixJQUEwQixNQUFNLENBQUMsSUFBUCxDQUFZLENBQVosQ0FBYyxDQUFDLE1BQWYsS0FBeUIsQ0FBcEQ7QUFBbkM7O0FBRVQsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFYLENBQUE7O0FBRU07SUFFQyxjQUFDLEtBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7O1lBRUEsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFROztRQUVULElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFUO1lBQXNCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixHQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLEtBQS9FOztRQUVBLEtBQUEsR0FBWSxPQUFBLENBQVEsU0FBUjtRQUNaLE1BQUEsR0FBWSxPQUFBLENBQVEsVUFBUjtR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QTtZQUdNO1lBQ0gsT0FBQSxDQUFDLEtBQUQsQ0FBTyxHQUFQLEVBQVksSUFBWjtBQUNDLGtCQUFNLElBTFY7O0lBM0JFOzs7Ozs7QUF3Q1YsSUFBRyxDQUFJLE1BQU0sQ0FBQyxNQUFYLElBQXFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQW5CLENBQTRCLFdBQTVCLENBQXhCO0lBRUksSUFBQSxHQUFPLElBQUEsQ0FBSyxrNEJBQUEsR0FnQkcsR0FBRyxDQUFDLE9BaEJaO0lBbUJQLElBQUEsR0FBTyxJQUFJLElBQUosQ0FBUyxJQUFUO0lBQ1AsSUFBSSxDQUFDLEdBQUwsQ0FBQSxFQXRCSjs7O0FBd0JBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4wMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4jIyNcblxuc2xhc2ggID0gcmVxdWlyZSAna3NsYXNoJ1xua3N0ciAgID0gcmVxdWlyZSAna3N0cidcbmtsb3IgICA9IHJlcXVpcmUgJ2tsb3InXG5rYXJnICAgPSByZXF1aXJlICdrYXJnJ1xuY2hpbGRwID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbnByaW50ICA9IHJlcXVpcmUgJy4vcHJpbnQnXG5wa2cgICAgPSByZXF1aXJlIFwiI3tfX2Rpcm5hbWV9Ly4uL3BhY2thZ2VcIlxuZW1wdHkgID0gKGEpIC0+IGEgaW4gWycnIG51bGwgdW5kZWZpbmVkXSBvciAodHlwZW9mKGEpID09ICdvYmplY3QnIGFuZCBPYmplY3Qua2V5cyhhKS5sZW5ndGggPT0gMClcblxua2xvci5rb2xvci5nbG9iYWxpemUoKVxuXG5jbGFzcyBLb2RlXG5cbiAgICBAOiAoQGFyZ3MpIC0+XG5cbiAgICAgICAgQGFyZ3MgPz0ge31cblxuICAgICAgICBpZiBAYXJncy52ZXJib3NlIHRoZW4gQGFyZ3MuZGVidWcgPSBAYXJncy5ibG9jayA9IEBhcmdzLnRva2VucyA9IEBhcmdzLnBhcnNlID0gdHJ1ZVxuXG4gICAgICAgIExleGVyICAgICA9IHJlcXVpcmUgJy4vbGV4ZXInXG4gICAgICAgIFBhcnNlciAgICA9IHJlcXVpcmUgJy4vcGFyc2VyJ1xuICAgICAgICBSZW5kZXJlciAgPSByZXF1aXJlICcuL3JlbmRlcmVyJ1xuXG4gICAgICAgIEBsZXhlciAgICA9IG5ldyBMZXhlclxuICAgICAgICBAcGFyc2VyICAgPSBuZXcgUGFyc2VyICAgQGFyZ3NcbiAgICAgICAgQHJlbmRlcmVyID0gbmV3IFJlbmRlcmVyIEBcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMFxuXG4gICAgY2xpOiAtPlxuXG4gICAgICAgICMgaWYgQGFyZ3MuZGVidWcgdGhlbiBwcmludC5ub29uICdhcmdzJyBAYXJnc1xuXG4gICAgICAgIGlmIEBhcmdzLmNvbXBpbGVcbiAgICAgICAgICAgIGxvZyBAY29tcGlsZSBAYXJncy5jb21waWxlXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgaWYgQGFyZ3MuZXZhbFxuICAgICAgICAgICAgbG9nIEBldmFsIEBhcmdzLmV2YWxcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHJldHVybiBpZiBub3QgQGFyZ3MuZmlsZXMubGVuZ3RoXG5cbiAgICAgICAgZm9yIGZpbGUgaW4gQGFyZ3MuZmlsZXNcblxuICAgICAgICAgICAgZmlsZSA9IHNsYXNoLnJlc29sdmUgZmlsZVxuICAgICAgICAgICAgbG9nIGdyYXkgZmlsZSBpZiBAYXJncy52ZXJib3NlXG5cbiAgICAgICAgICAgIHRleHQgPSBzbGFzaC5yZWFkVGV4dCBmaWxlXG5cbiAgICAgICAgICAgIGlmIGVtcHR5IHRleHQgdGhlbiBlcnJvciBZNCByMiBcImNhbid0IHJlYWQgI3tSMyB5NSBmaWxlfVwiOyBjb250aW51ZVxuXG4gICAgICAgICAgICBjb2RlID0gQGNvbXBpbGUgdGV4dFxuXG4gICAgICAgICAgICBpZiBAYXJncy5vdXRwdXRcbiAgICAgICAgICAgICAgICBvdXQgPSBzbGFzaC5qb2luIEBhcmdzLm91dHB1dCwgc2xhc2guZmlsZSBmaWxlXG4gICAgICAgICAgICAgICAgb3V0ID0gc2xhc2guc3dhcEV4dCBvdXQsICdqcydcbiAgICAgICAgICAgICAgICBsb2cgJ291dCcgb3V0IGlmIEBhcmdzLnZlcmJvc2VcbiAgICAgICAgICAgICAgICBzbGFzaC53cml0ZVRleHQgb3V0LCBjb2RlXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcblxuICAgIEBjb21waWxlOiAodGV4dCkgLT4gKG5ldyBLb2RlIHt9KS5jb21waWxlIHRleHRcbiAgICBjb21waWxlOiAodGV4dCkgLT5cblxuICAgICAgICByZXR1cm4gJycgaWYgZW1wdHkga3N0ci5zdHJpcCB0ZXh0XG5cbiAgICAgICAgYXN0ID0gQGFzdCB0ZXh0XG5cbiAgICAgICAgaWYgQGFyZ3MucGFyc2UgdGhlbiBwcmludC5hc3QgJ2FzdCcgYXN0XG5cbiAgICAgICAganMgPSBAcmVuZGVyZXIucmVuZGVyIGFzdFxuXG4gICAgICAgIHByaW50LmNvZGUgJ2pzJyBqcyBpZiBAYXJncy5qcyBvciBAYXJncy5kZWJ1Z1xuXG4gICAgICAgIGpzXG5cbiAgICBhc3Q6ICh0ZXh0KSAtPlxuXG4gICAgICAgIHRleHQgKz0gJ1xcbicgaWYgbm90IHRleHRbLTFdID09ICdcXG4nXG5cbiAgICAgICAgcHJpbnQuY29kZSAnY29mZmVlJyB0ZXh0LCAnY29mZmVlJyBpZiBAYXJncy52ZXJib3NlIG9yIEBhcmdzLmRlYnVnXG5cbiAgICAgICAgdG9rZW5zID0gQGxleGVyLnRva2VuaXplIHRleHRcblxuICAgICAgICBpZiBAYXJncy5yYXcgICAgdGhlbiBwcmludC5ub29uICdyYXcgdG9rZW5zJyB0b2tlbnNcbiAgICAgICAgaWYgQGFyZ3MudG9rZW5zIHRoZW4gcHJpbnQudG9rZW5zICd0b2tlbnMnIHRva2Vuc1xuXG4gICAgICAgIGJsb2NrID0gQGxleGVyLmJsb2NraWZ5IHRva2Vuc1xuXG4gICAgICAgIGlmIEBhcmdzLnJhdyAgIHRoZW4gcHJpbnQubm9vbiAncmF3IGJsb2NrJyBibG9ja1xuICAgICAgICBpZiBAYXJncy5ibG9jayB0aGVuIHByaW50LmJsb2NrICd0bCBibG9jaycgYmxvY2tcblxuICAgICAgICBAcGFyc2VyLnBhcnNlIGJsb2NrXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwMCAgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGV2YWw6ICh0ZXh0KSAtPlxuXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0ZXh0XG5cbiAgICAgICAgdm0gPSByZXF1aXJlICd2bSdcblxuICAgICAgICBzYW5kYm94ID0gdm0uY3JlYXRlQ29udGV4dCgpXG4gICAgICAgIHNhbmRib3guZ2xvYmFsID0gc2FuZGJveC5yb290ID0gc2FuZGJveC5HTE9CQUwgPSBzYW5kYm94XG5cbiAgICAgICAgc2FuZGJveC5fX2ZpbGVuYW1lID0gJ2V2YWwnXG4gICAgICAgIHNhbmRib3guX19kaXJuYW1lICA9IHNsYXNoLmRpciBzYW5kYm94Ll9fZmlsZW5hbWVcblxuICAgICAgICAjIGRlZmluZSBtb2R1bGUvcmVxdWlyZSBvbmx5IGlmIHRoZXkgY2hvc2Ugbm90IHRvIHNwZWNpZnkgdGhlaXIgb3duXG4gICAgICAgIHVubGVzcyBzYW5kYm94ICE9IGdsb2JhbCBvciBzYW5kYm94Lm1vZHVsZSBvciBzYW5kYm94LnJlcXVpcmVcbiAgICAgICAgICAgIE1vZHVsZSA9IHJlcXVpcmUgJ21vZHVsZSdcbiAgICAgICAgICAgIHNhbmRib3gubW9kdWxlICA9IF9tb2R1bGUgID0gbmV3IE1vZHVsZSAnZXZhbCdcbiAgICAgICAgICAgIHNhbmRib3gucmVxdWlyZSA9IF9yZXF1aXJlID0gKHBhdGgpIC0+ICBNb2R1bGUuX2xvYWQgcGF0aCwgX21vZHVsZSwgdHJ1ZVxuICAgICAgICAgICAgX21vZHVsZS5maWxlbmFtZSA9IHNhbmRib3guX19maWxlbmFtZVxuICAgICAgICAgICAgZm9yIHIgaW4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgcmVxdWlyZVxuICAgICAgICAgICAgICAgIGlmIHIgbm90IGluIFsncGF0aHMnICdhcmd1bWVudHMnICdjYWxsZXInXVxuICAgICAgICAgICAgICAgICAgICBfcmVxdWlyZVtyXSA9IHJlcXVpcmVbcl1cbiAgICAgICAgICAgICMgdXNlIHRoZSBzYW1lIGhhY2sgbm9kZSBjdXJyZW50bHkgdXNlcyBmb3IgdGhlaXIgb3duIFJFUExcbiAgICAgICAgICAgIF9yZXF1aXJlLnBhdGhzID0gX21vZHVsZS5wYXRocyA9IE1vZHVsZS5fbm9kZU1vZHVsZVBhdGhzIHByb2Nlc3MuY3dkKClcbiAgICAgICAgICAgIF9yZXF1aXJlLnJlc29sdmUgPSAocmVxdWVzdCkgLT4gTW9kdWxlLl9yZXNvbHZlRmlsZW5hbWUgcmVxdWVzdCwgX21vZHVsZVxuXG4gICAgICAgIGpzID0gQGNvbXBpbGUgdGV4dFxuXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgc2FuZGJveC5jb25zb2xlID0gY29uc29sZVxuICAgICAgICAgICAgdm0ucnVuSW5Db250ZXh0IGpzLCBzYW5kYm94XG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgZXJyb3IgZXJyLCB0ZXh0XG4gICAgICAgICAgICB0aHJvdyBlcnJcblxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG5cbmlmIG5vdCBtb2R1bGUucGFyZW50IG9yIG1vZHVsZS5wYXJlbnQucGF0aC5lbmRzV2l0aCAnL2tvZGUvYmluJ1xuXG4gICAgYXJncyA9IGthcmcgXCJcIlwiXG4gICAgICAgIGtvZGUgb3B0aW9uXG4gICAgICAgICAgICBmaWxlcyAgICAgICAuICoqXG4gICAgICAgICAgICBldmFsICAgICAgICAuID8gZXZhbHVhdGUgYSBzdHJpbmcgYW5kIHByaW50IHRoZSByZXN1bHRcbiAgICAgICAgICAgIGNvbXBpbGUgICAgIC4gPyBjb21waWxlIGEgc3RyaW5nIGFuZCBwcmludCB0aGUgcmVzdWx0XG4gICAgICAgICAgICBvdXRkaXIgICAgICAuID8gb3V0cHV0IGRpcmVjdG9yeSBmb3IgdHJhbnNwaWxlZCBmaWxlc1xuICAgICAgICAgICAgbWFwICAgICAgICAgLiA/IGdlbmVyYXRlIGlubGluZSBzb3VyY2UgbWFwcyAgICAgICAgICAgICAuID0gdHJ1ZVxuICAgICAgICAgICAganMgICAgICAgICAgLiA/IHByaW50IHRyYW5zcGlsZWQganMgY29kZSAgICAgICAgICAgICAgICAuID0gdHJ1ZVxuICAgICAgICAgICAgcnVuICAgICAgICAgLiA/IGV4ZWN1dGUgZmlsZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgICAgIHRva2VucyAgICAgIC4gPyBwcmludCB0b2tlbnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gVFxuICAgICAgICAgICAgYmxvY2sgICAgICAgLiA/IHByaW50IGJsb2NrIHRyZWUgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBCXG4gICAgICAgICAgICBwYXJzZSAgICAgICAuID8gcHJpbnQgcGFyc2UgdHJlZSAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIFBcbiAgICAgICAgICAgIGRlYnVnICAgICAgIC4gPyBsb2cgZGVidWcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gRFxuICAgICAgICAgICAgcmF3ICAgICAgICAgLiA/IGxvZyByYXcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBSXG4gICAgICAgICAgICB2ZXJib3NlICAgICAuID8gbG9nIG1vcmUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuXG4gICAgICAgIHZlcnNpb24gICN7cGtnLnZlcnNpb259XG4gICAgICAgIFwiXCJcIlxuXG4gICAga29kZSA9IG5ldyBLb2RlIGFyZ3NcbiAgICBrb2RlLmNsaSgpXG5cbm1vZHVsZS5leHBvcnRzID0gS29kZVxuXG4iXX0=
//# sourceURL=../coffee/kode.coffee