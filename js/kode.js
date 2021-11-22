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
            print.block('block', block);
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
    args = karg("kode option\n    files       . **\n    eval        . ? evaluate a string and print the result\n    compile     . ? compile a string and print the result\n    outdir      . ? output directory for transpiled files\n    map         . ? generate inline source maps             . = true\n    js          . ? print js code                           . = false\n    bare        . ? no top-level function wrapper           . = false\n    tokens      . ? print tokens                            . = false  . - T\n    block       . ? print block tree                        . = false  . - B\n    parse       . ? print parse tree                        . = false  . - P\n    fragments   . ? print fragments                         . = false  . - F\n    debug       . ? log debug                               . = false  . - D\n    raw         . ? log raw                                 . = false  . - R\n    verbose     . ? log more                                . = false\n\nversion  " + pkg.version);
    kode = new Kode(args);
    kode.cli();
}

module.exports = Kode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29kZS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImtvZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEtBQUEsR0FBVyxPQUFBLENBQVEsUUFBUjs7QUFDWCxJQUFBLEdBQVcsT0FBQSxDQUFRLE1BQVI7O0FBQ1gsSUFBQSxHQUFXLE9BQUEsQ0FBUSxNQUFSOztBQUNYLElBQUEsR0FBVyxPQUFBLENBQVEsTUFBUjs7QUFDWCxNQUFBLEdBQVcsT0FBQSxDQUFRLGVBQVI7O0FBQ1gsS0FBQSxHQUFXLE9BQUEsQ0FBUSxTQUFSOztBQUNYLEdBQUEsR0FBVyxPQUFBLENBQVcsU0FBRCxHQUFXLGFBQXJCOztBQUNYLEtBQUEsR0FBVyxTQUFDLENBQUQ7V0FBTyxDQUFBLENBQUEsS0FBTSxFQUFOLElBQUEsQ0FBQSxLQUFTLElBQVQsSUFBQSxDQUFBLEtBQWMsUUFBZCxDQUFBLElBQTRCLENBQUMsT0FBTyxDQUFQLEtBQWEsUUFBYixJQUEwQixNQUFNLENBQUMsSUFBUCxDQUFZLENBQVosQ0FBYyxDQUFDLE1BQWYsS0FBeUIsQ0FBcEQ7QUFBbkM7O0FBRVgsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFYLENBQUE7O0FBRU07SUFFQyxjQUFDLEtBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7O1lBRUEsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFROztRQUVULElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFUO1lBQXNCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixHQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLEtBQS9FOztRQUVBLEtBQUEsR0FBWSxPQUFBLENBQVEsU0FBUjtRQUNaLE1BQUEsR0FBWSxPQUFBLENBQVEsVUFBUjtR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a0I7bUJBQ2xCLEVBQUUsQ0FBQyxZQUFILENBQWdCLEVBQWhCLEVBQW9CLE9BQXBCLEVBRko7U0FBQSxhQUFBO1lBR007WUFDSCxPQUFBLENBQUMsS0FBRCxDQUFPLEdBQVAsRUFBWSxJQUFaO0FBQ0Msa0JBQU0sSUFMVjs7SUEzQkU7Ozs7OztBQXdDVixJQUFHLENBQUksTUFBTSxDQUFDLE1BQVgsSUFBcUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBbkIsQ0FBNEIsV0FBNUIsQ0FBeEI7SUFFSSxJQUFBLEdBQU8sSUFBQSxDQUFLLGk5QkFBQSxHQWlCRyxHQUFHLENBQUMsT0FqQlo7SUFvQlAsSUFBQSxHQUFPLElBQUksSUFBSixDQUFTLElBQVQ7SUFDUCxJQUFJLENBQUMsR0FBTCxDQUFBLEVBdkJKOzs7QUF5QkEsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbjAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcbiMjI1xuXG5zbGFzaCAgICA9IHJlcXVpcmUgJ2tzbGFzaCdcbmtzdHIgICAgID0gcmVxdWlyZSAna3N0cidcbmtsb3IgICAgID0gcmVxdWlyZSAna2xvcidcbmthcmcgICAgID0gcmVxdWlyZSAna2FyZydcbmNoaWxkcCAgID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbnByaW50ICAgID0gcmVxdWlyZSAnLi9wcmludCdcbnBrZyAgICAgID0gcmVxdWlyZSBcIiN7X19kaXJuYW1lfS8uLi9wYWNrYWdlXCJcbmVtcHR5ICAgID0gKGEpIC0+IGEgaW4gWycnIG51bGwgdW5kZWZpbmVkXSBvciAodHlwZW9mKGEpID09ICdvYmplY3QnIGFuZCBPYmplY3Qua2V5cyhhKS5sZW5ndGggPT0gMClcblxua2xvci5rb2xvci5nbG9iYWxpemUoKVxuXG5jbGFzcyBLb2RlXG5cbiAgICBAOiAoQGFyZ3MpIC0+XG5cbiAgICAgICAgQGFyZ3MgPz0ge31cbiAgICAgICAgXG4gICAgICAgIGlmIEBhcmdzLnZlcmJvc2UgdGhlbiBAYXJncy5kZWJ1ZyA9IEBhcmdzLmJsb2NrID0gQGFyZ3MudG9rZW5zID0gQGFyZ3MucGFyc2UgPSB0cnVlXG4gICAgICAgIFxuICAgICAgICBMZXhlciAgICAgPSByZXF1aXJlICcuL2xleGVyJ1xuICAgICAgICBQYXJzZXIgICAgPSByZXF1aXJlICcuL3BhcnNlcidcbiAgICAgICAgUmVuZGVyZXIgID0gcmVxdWlyZSAnLi9yZW5kZXJlcidcbiAgICAgICAgXG4gICAgICAgIEBsZXhlciAgICA9IG5ldyBMZXhlclxuICAgICAgICBAcGFyc2VyICAgPSBuZXcgUGFyc2VyICAgQGFyZ3NcbiAgICAgICAgQHJlbmRlcmVyID0gbmV3IFJlbmRlcmVyIEBcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMFxuXG4gICAgY2xpOiAtPlxuXG4gICAgICAgICMgaWYgQGFyZ3MuZGVidWcgdGhlbiBwcmludC5ub29uICdhcmdzJyBAYXJnc1xuICAgICAgICBcbiAgICAgICAgaWYgQGFyZ3MuY29tcGlsZVxuICAgICAgICAgICAgbG9nIEBjb21waWxlIEBhcmdzLmNvbXBpbGVcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBpZiBAYXJncy5ldmFsXG4gICAgICAgICAgICBsb2cgQGV2YWwgQGFyZ3MuZXZhbFxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAYXJncy5maWxlcy5sZW5ndGhcblxuICAgICAgICBmb3IgZmlsZSBpbiBAYXJncy5maWxlc1xuXG4gICAgICAgICAgICBmaWxlID0gc2xhc2gucmVzb2x2ZSBmaWxlXG4gICAgICAgICAgICBsb2cgZ3JheSBmaWxlIGlmIEBhcmdzLnZlcmJvc2VcblxuICAgICAgICAgICAgdGV4dCA9IHNsYXNoLnJlYWRUZXh0IGZpbGVcblxuICAgICAgICAgICAgaWYgZW1wdHkgdGV4dCB0aGVuIGVycm9yIFk0IHIyIFwiY2FuJ3QgcmVhZCAje1IzIHk1IGZpbGV9XCI7IGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGNvZGUgPSBAY29tcGlsZSB0ZXh0XG5cbiAgICAgICAgICAgIGlmIEBhcmdzLm91dHB1dFxuICAgICAgICAgICAgICAgIG91dCA9IHNsYXNoLmpvaW4gQGFyZ3Mub3V0cHV0LCBzbGFzaC5maWxlIGZpbGVcbiAgICAgICAgICAgICAgICBvdXQgPSBzbGFzaC5zd2FwRXh0IG91dCwgJ2pzJ1xuICAgICAgICAgICAgICAgIGxvZyAnb3V0JyBvdXQgaWYgQGFyZ3MudmVyYm9zZVxuICAgICAgICAgICAgICAgIHNsYXNoLndyaXRlVGV4dCBvdXQsIGNvZGVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsb2cgY29kZVxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwXG5cbiAgICBAY29tcGlsZTogKHRleHQpIC0+IChuZXcgS29kZSB7fSkuY29tcGlsZSB0ZXh0XG4gICAgY29tcGlsZTogKHRleHQpIC0+XG5cbiAgICAgICAgcmV0dXJuICcnIGlmIGVtcHR5IGtzdHIuc3RyaXAgdGV4dFxuICAgICAgICBcbiAgICAgICAgYXN0ID0gQGFzdCB0ZXh0XG5cbiAgICAgICAgaWYgQGFyZ3MucGFyc2UgdGhlbiBwcmludC5hc3QgJ2FzdCcgYXN0XG5cbiAgICAgICAganMgPSBAcmVuZGVyZXIucmVuZGVyIGFzdFxuXG4gICAgICAgIHByaW50LmNvZGUgJ2pzJyBqcyBpZiBAYXJncy5qcyBvciBAYXJncy52ZXJib3NlIG9yIEBhcmdzLmRlYnVnXG5cbiAgICAgICAganNcbiAgICAgICAgXG4gICAgYXN0OiAodGV4dCkgLT5cbiAgICAgICAgXG4gICAgICAgIHRleHQgKz0gJ1xcbicgaWYgbm90IHRleHRbLTFdID09ICdcXG4nXG5cbiAgICAgICAgcHJpbnQuY29kZSAnY29mZmVlJyB0ZXh0LCAnY29mZmVlJyBpZiBAYXJncy52ZXJib3NlIG9yIEBhcmdzLmRlYnVnXG5cbiAgICAgICAgdG9rZW5zID0gQGxleGVyLnRva2VuaXplIHRleHRcblxuICAgICAgICBpZiBAYXJncy5yYXcgICAgdGhlbiBwcmludC5ub29uICdyYXcgdG9rZW5zJyB0b2tlbnNcbiAgICAgICAgaWYgQGFyZ3MudG9rZW5zIHRoZW4gcHJpbnQudG9rZW5zICd0b2tlbnMnIHRva2Vuc1xuXG4gICAgICAgIGJsb2NrID0gQGxleGVyLmJsb2NraWZ5IHRva2Vuc1xuXG4gICAgICAgIGlmIEBhcmdzLnJhdyAgIHRoZW4gcHJpbnQubm9vbiAncmF3IGJsb2NrJyBibG9ja1xuICAgICAgICBpZiBAYXJncy5ibG9jayB0aGVuIHByaW50LmJsb2NrICdibG9jaycgYmxvY2tcblxuICAgICAgICBAcGFyc2VyLnBhcnNlIGJsb2NrXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgZXZhbDogKHRleHQpIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgdGV4dFxuICAgICAgICBcbiAgICAgICAgdm0gPSByZXF1aXJlICd2bSdcbiAgICAgICAgXG4gICAgICAgIHNhbmRib3ggPSB2bS5jcmVhdGVDb250ZXh0KClcbiAgICAgICAgc2FuZGJveC5nbG9iYWwgPSBzYW5kYm94LnJvb3QgPSBzYW5kYm94LkdMT0JBTCA9IHNhbmRib3hcblxuICAgICAgICBzYW5kYm94Ll9fZmlsZW5hbWUgPSAnZXZhbCdcbiAgICAgICAgc2FuZGJveC5fX2Rpcm5hbWUgID0gc2xhc2guZGlyIHNhbmRib3guX19maWxlbmFtZVxuICAgICAgICBcbiAgICAgICAgIyBkZWZpbmUgbW9kdWxlL3JlcXVpcmUgb25seSBpZiB0aGV5IGNob3NlIG5vdCB0byBzcGVjaWZ5IHRoZWlyIG93blxuICAgICAgICB1bmxlc3Mgc2FuZGJveCAhPSBnbG9iYWwgb3Igc2FuZGJveC5tb2R1bGUgb3Igc2FuZGJveC5yZXF1aXJlXG4gICAgICAgICAgICBNb2R1bGUgPSByZXF1aXJlICdtb2R1bGUnXG4gICAgICAgICAgICBzYW5kYm94Lm1vZHVsZSAgPSBfbW9kdWxlICA9IG5ldyBNb2R1bGUgJ2V2YWwnXG4gICAgICAgICAgICBzYW5kYm94LnJlcXVpcmUgPSBfcmVxdWlyZSA9IChwYXRoKSAtPiAgTW9kdWxlLl9sb2FkIHBhdGgsIF9tb2R1bGUsIHRydWVcbiAgICAgICAgICAgIF9tb2R1bGUuZmlsZW5hbWUgPSBzYW5kYm94Ll9fZmlsZW5hbWVcbiAgICAgICAgICAgIGZvciByIGluIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHJlcXVpcmUgXG4gICAgICAgICAgICAgICAgaWYgciBub3QgaW4gWydwYXRocycgJ2FyZ3VtZW50cycgJ2NhbGxlciddXG4gICAgICAgICAgICAgICAgICAgIF9yZXF1aXJlW3JdID0gcmVxdWlyZVtyXVxuICAgICAgICAgICAgIyB1c2UgdGhlIHNhbWUgaGFjayBub2RlIGN1cnJlbnRseSB1c2VzIGZvciB0aGVpciBvd24gUkVQTFxuICAgICAgICAgICAgX3JlcXVpcmUucGF0aHMgPSBfbW9kdWxlLnBhdGhzID0gTW9kdWxlLl9ub2RlTW9kdWxlUGF0aHMgcHJvY2Vzcy5jd2QoKVxuICAgICAgICAgICAgX3JlcXVpcmUucmVzb2x2ZSA9IChyZXF1ZXN0KSAtPiBNb2R1bGUuX3Jlc29sdmVGaWxlbmFtZSByZXF1ZXN0LCBfbW9kdWxlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGpzID0gQGNvbXBpbGUgdGV4dFxuICAgICAgICBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBzYW5kYm94LmNvbnNvbGUgPSBjb25zb2xlXG4gICAgICAgICAgICB2bS5ydW5JbkNvbnRleHQganMsIHNhbmRib3hcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBlcnJvciBlcnIsIHRleHRcbiAgICAgICAgICAgIHRocm93IGVyclxuXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcblxuaWYgbm90IG1vZHVsZS5wYXJlbnQgb3IgbW9kdWxlLnBhcmVudC5wYXRoLmVuZHNXaXRoICcva29kZS9iaW4nXG5cbiAgICBhcmdzID0ga2FyZyBcIlwiXCJcbiAgICAgICAga29kZSBvcHRpb25cbiAgICAgICAgICAgIGZpbGVzICAgICAgIC4gKipcbiAgICAgICAgICAgIGV2YWwgICAgICAgIC4gPyBldmFsdWF0ZSBhIHN0cmluZyBhbmQgcHJpbnQgdGhlIHJlc3VsdFxuICAgICAgICAgICAgY29tcGlsZSAgICAgLiA/IGNvbXBpbGUgYSBzdHJpbmcgYW5kIHByaW50IHRoZSByZXN1bHRcbiAgICAgICAgICAgIG91dGRpciAgICAgIC4gPyBvdXRwdXQgZGlyZWN0b3J5IGZvciB0cmFuc3BpbGVkIGZpbGVzXG4gICAgICAgICAgICBtYXAgICAgICAgICAuID8gZ2VuZXJhdGUgaW5saW5lIHNvdXJjZSBtYXBzICAgICAgICAgICAgIC4gPSB0cnVlXG4gICAgICAgICAgICBqcyAgICAgICAgICAuID8gcHJpbnQganMgY29kZSAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICAgICAgYmFyZSAgICAgICAgLiA/IG5vIHRvcC1sZXZlbCBmdW5jdGlvbiB3cmFwcGVyICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgICAgIHRva2VucyAgICAgIC4gPyBwcmludCB0b2tlbnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gVFxuICAgICAgICAgICAgYmxvY2sgICAgICAgLiA/IHByaW50IGJsb2NrIHRyZWUgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBCXG4gICAgICAgICAgICBwYXJzZSAgICAgICAuID8gcHJpbnQgcGFyc2UgdHJlZSAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIFBcbiAgICAgICAgICAgIGZyYWdtZW50cyAgIC4gPyBwcmludCBmcmFnbWVudHMgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gRlxuICAgICAgICAgICAgZGVidWcgICAgICAgLiA/IGxvZyBkZWJ1ZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBEXG4gICAgICAgICAgICByYXcgICAgICAgICAuID8gbG9nIHJhdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIFJcbiAgICAgICAgICAgIHZlcmJvc2UgICAgIC4gPyBsb2cgbW9yZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG5cbiAgICAgICAgdmVyc2lvbiAgI3twa2cudmVyc2lvbn1cbiAgICAgICAgXCJcIlwiXG5cbiAgICBrb2RlID0gbmV3IEtvZGUgYXJnc1xuICAgIGtvZGUuY2xpKClcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gS29kZVxuXG4iXX0=
//# sourceURL=../coffee/kode.coffee