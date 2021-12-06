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

register();

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

    Kode.prototype["eval"] = function(text, filename) {
        var Module, _module, _require, err, i, js, len, r, ref1, sandbox, vm;
        if (empty(text)) {
            return;
        }
        vm = require('vm');
        sandbox = vm.createContext();
        sandbox.global = global;
        sandbox.__filename = filename != null ? filename : 'eval';
        sandbox.__dirname = slash.dir(sandbox.__filename);
        sandbox.console = console;
        Module = require('module');
        sandbox.module = _module = new Module('eval');
        sandbox.require = _require = function(path) {
            return Module._load(path, _module, true);
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
        try {
            js = this.compile(text);
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
                js = this.compile(text);
                out = slash.resolve(this.args.outdir, slash.file(file));
                out = slash.swapExt(out, 'js');
                js = ("// kode " + pkg.version + "\n\n") + js;
                if (!slash.writeText(out, js)) {
                    results.push(console.error(R2(y3("can't write " + (R3(y6(out)))))));
                } else {
                    results.push(void 0);
                }
            } else if (this.args.run) {
                results.push(this["eval"](text, file));
            } else {
                if (!args.js) {
                    results.push(console.log(this.compile(text)));
                } else {
                    results.push(void 0);
                }
            }
        }
        return results;
    };

    return Kode;

})();

module.exports = Kode;

if (!module.parent || slash.resolve(module.parent.path).endsWith('/kode/bin')) {
    args = karg("kode option\n    files       . **\n    eval        . ? evaluate a string and print the result\n    compile     . ? compile a string and print the result\n    outdir      . ? output directory for transpiled files\n    run         . ? execute file                            . = true\n    map         . ? generate inline source maps             . = true\n    kode        . ? pretty print input code                 . = false\n    js          . ? pretty print transpiled js code         . = false\n    header      . ? prepend output with version header      . = false  . - H\n    tokens      . ? print tokens                            . = false  . - T\n    block       . ? print block tree                        . = false  . - B\n    parse       . ? print parse tree                        . = false  . - P\n    astr        . ? print parse tree as string              . = false  . - A\n    scope       . ? print scopes                            . = false  . - S\n    verbose     . ? log more                                . = false\n    debug       . ? log debug                               . = false\n    raw         . ? log raw                                 . = false  . - R\n\nversion  " + pkg.version);
    kode = new Kode(args);
    kode.cli();
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29kZS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImtvZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEtBQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxNQUFBLEdBQVMsT0FBQSxDQUFRLGVBQVI7O0FBQ1QsS0FBQSxHQUFTLE9BQUEsQ0FBUSxTQUFSOztBQUNULEdBQUEsR0FBUyxPQUFBLENBQVcsU0FBRCxHQUFXLGFBQXJCOztBQUVULE1BQXNCLE9BQUEsQ0FBUSxTQUFSLENBQXRCLEVBQUUsaUJBQUYsRUFBUzs7QUFFVCxRQUFBLENBQUE7O0FBQ0EsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFYLENBQUE7O0FBRU07SUFFQyxjQUFDLEtBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7O1lBRUEsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFROztRQUVULElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFUO1lBQXNCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixHQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLEtBQS9FOztRQUVBLEtBQUEsR0FBWSxPQUFBLENBQVEsU0FBUjtRQUNaLE1BQUEsR0FBWSxPQUFBLENBQVEsVUFBUjtRQUNaLE1BQUEsR0FBWSxPQUFBLENBQVEsVUFBUjtRQUNaLE9BQUEsR0FBWSxPQUFBLENBQVEsV0FBUjtRQUNaLFFBQUEsR0FBWSxPQUFBLENBQVEsWUFBUjtRQUNaLFFBQUEsR0FBWSxPQUFBLENBQVEsWUFBUjtRQUVaLElBQUMsQ0FBQSxLQUFELEdBQVksSUFBSSxLQUFKLENBQWEsSUFBYjtRQUNaLElBQUMsQ0FBQSxNQUFELEdBQVksSUFBSSxNQUFKLENBQWEsSUFBYjtRQUNaLElBQUMsQ0FBQSxNQUFELEdBQVksSUFBSSxNQUFKLENBQWEsSUFBYjtRQUNaLElBQUMsQ0FBQSxPQUFELEdBQVksSUFBSSxPQUFKLENBQWEsSUFBYjtRQUNaLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxRQUFKLENBQWEsSUFBYjtRQUNaLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxRQUFKLENBQWEsSUFBYjtJQWxCYjs7SUEwQkgsSUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLElBQUQsRUFBTyxHQUFQOztZQUFPLE1BQUk7O2VBQU8sQ0FBQyxJQUFJLElBQUosQ0FBUyxHQUFULENBQUQsQ0FBYyxDQUFDLE9BQWYsQ0FBdUIsSUFBdkI7SUFBbEI7O21CQUNWLE9BQUEsR0FBUyxTQUFDLElBQUQ7QUFFTCxZQUFBO1FBQUEsSUFBYSxLQUFBLENBQU0sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYLENBQU4sQ0FBYjtBQUFBLG1CQUFPLEdBQVA7O1FBRUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxHQUFELENBQUssSUFBTDtRQUVOLElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFUO1lBQW9CLEtBQUssQ0FBQyxHQUFOLENBQVUsS0FBVixFQUFnQixHQUFoQixFQUFwQjs7UUFDQSxJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBVDtZQUFZLE9BQUEsQ0FBUSxHQUFSLENBQVksS0FBSyxDQUFDLElBQU4sQ0FBVyxHQUFYLEVBQWdCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBdEIsQ0FBWixFQUFaOztRQUVBLEVBQUEsR0FBSyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsR0FBakI7UUFFTCxJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixJQUFpQixJQUFJLENBQUMsS0FBTCxDQUFXLEVBQVgsQ0FBYyxDQUFDLE1BQW5DO1lBQ0ksRUFBQSxHQUFLLENBQUEsc0JBQUEsR0FBdUIsR0FBRyxDQUFDLE9BQTNCLEdBQW1DLE1BQW5DLENBQUEsR0FBMkMsR0FEcEQ7O1FBR0EsSUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLEVBQU4sSUFBWSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQXJCO1lBQ0ksS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLEVBQWdCLEVBQWhCLEVBREo7O2VBRUE7SUFoQks7O21CQWtCVCxHQUFBLEdBQUssU0FBQyxJQUFEO0FBRUQsWUFBQTtRQUFBLElBQWdCLENBQUksSUFBSyxVQUFFLENBQUEsQ0FBQSxDQUFYLEtBQWdCLElBQWhDO1lBQUEsSUFBQSxJQUFRLEtBQVI7O1FBRUEsSUFBb0MsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFOLElBQWlCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBdkIsSUFBZ0MsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUExRTtZQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsTUFBWCxFQUFrQixJQUFsQixFQUF3QixRQUF4QixFQUFBOztRQUVBLE1BQUEsR0FBUyxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVAsQ0FBZ0IsSUFBaEI7UUFFVCxJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBVDtZQUFxQixLQUFLLENBQUMsSUFBTixDQUFXLFlBQVgsRUFBd0IsTUFBeEIsRUFBckI7O1FBQ0EsSUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQVQ7WUFBcUIsS0FBSyxDQUFDLE1BQU4sQ0FBYSxRQUFiLEVBQXNCLE1BQXRCLEVBQXJCOztRQUVBLEtBQUEsR0FBUSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVAsQ0FBZ0IsTUFBaEI7UUFFUixJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBVDtZQUFvQixLQUFLLENBQUMsSUFBTixDQUFXLFdBQVgsRUFBdUIsS0FBdkIsRUFBcEI7O1FBQ0EsSUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQVQ7WUFBb0IsS0FBSyxDQUFDLEtBQU4sQ0FBWSxVQUFaLEVBQXVCLEtBQXZCLEVBQXBCOztlQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFrQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBZ0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFjLEtBQWQsQ0FBakIsQ0FBaEIsQ0FBbEI7SUFoQkM7O21CQWtCTCxJQUFBLEdBQU0sU0FBQyxJQUFELEVBQU8sTUFBUDtlQUFrQixLQUFLLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxHQUFELENBQUssSUFBTCxDQUFYLEVBQXVCLE1BQXZCO0lBQWxCOztvQkFRTixNQUFBLEdBQU0sU0FBQyxJQUFELEVBQU8sUUFBUDtBQUVGLFlBQUE7UUFBQSxJQUFVLEtBQUEsQ0FBTSxJQUFOLENBQVY7QUFBQSxtQkFBQTs7UUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7UUFFTCxPQUFBLEdBQVUsRUFBRSxDQUFDLGFBQUgsQ0FBQTtRQUVWLE9BQU8sQ0FBQyxNQUFSLEdBQWlCO1FBRWpCLE9BQU8sQ0FBQyxVQUFSLHNCQUFxQixXQUFXO1FBQ2hDLE9BQU8sQ0FBQyxTQUFSLEdBQXFCLEtBQUssQ0FBQyxHQUFOLENBQVUsT0FBTyxDQUFDLFVBQWxCO1FBQ3JCLE9BQU8sQ0FBQyxPQUFSLEdBQXFCO1FBRXJCLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjtRQUNULE9BQU8sQ0FBQyxNQUFSLEdBQWtCLE9BQUEsR0FBVyxJQUFJLE1BQUosQ0FBVyxNQUFYO1FBQzdCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLFFBQUEsR0FBVyxTQUFDLElBQUQ7bUJBQVUsTUFBTSxDQUFDLEtBQVAsQ0FBYSxJQUFiLEVBQW1CLE9BQW5CLEVBQTRCLElBQTVCO1FBQVY7UUFDN0IsT0FBTyxDQUFDLFFBQVIsR0FBbUIsT0FBTyxDQUFDO0FBQzNCO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxJQUFHLENBQUEsS0FBVSxPQUFWLElBQUEsQ0FBQSxLQUFrQixXQUFsQixJQUFBLENBQUEsS0FBOEIsUUFBakM7Z0JBQ0ksUUFBUyxDQUFBLENBQUEsQ0FBVCxHQUFjLE9BQVEsQ0FBQSxDQUFBLEVBRDFCOztBQURKO1FBSUEsUUFBUSxDQUFDLEtBQVQsR0FBaUIsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsTUFBTSxDQUFDLGdCQUFQLENBQXdCLE9BQU8sQ0FBQyxHQUFSLENBQUEsQ0FBeEI7UUFDakMsUUFBUSxDQUFDLE9BQVQsR0FBbUIsU0FBQyxPQUFEO21CQUFhLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixPQUF4QixFQUFpQyxPQUFqQztRQUFiO0FBRW5CO1lBQ0ksRUFBQSxHQUFLLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBVDttQkFDTCxFQUFFLENBQUMsWUFBSCxDQUFnQixFQUFoQixFQUFvQixPQUFwQixFQUZKO1NBQUEsYUFBQTtZQUdNO1lBQ0gsT0FBQSxDQUFDLEtBQUQsQ0FBTyxHQUFQLEVBQVksSUFBWjtBQUNDLGtCQUFNLElBTFY7O0lBekJFOzttQkFzQ04sR0FBQSxHQUFLLFNBQUE7QUFJRCxZQUFBO1FBQUEsSUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQVQ7WUFDRyxPQUFBLENBQUMsR0FBRCxDQUFLLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFmLENBQUw7QUFDQyxtQkFGSjs7UUFHQSxJQUFHLElBQUMsQ0FBQSxJQUFJLEVBQUMsSUFBRCxFQUFSO1lBQ0csT0FBQSxDQUFDLEdBQUQsQ0FBSyxJQUFDLEVBQUEsSUFBQSxFQUFELENBQU0sSUFBQyxDQUFBLElBQUksRUFBQyxJQUFELEVBQVgsQ0FBTDtBQUNDLG1CQUZKOztRQUlBLElBQVUsQ0FBSSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUExQjtBQUFBLG1CQUFBOztBQUVBO0FBQUE7YUFBQSxzQ0FBQTs7WUFFSSxJQUFBLEdBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkO1lBQWtCLElBQ1IsSUFBQyxDQUFBLElBQUksQ0FBQyxPQURFO2dCQUFBLE9BQUEsQ0FDekIsR0FEeUIsQ0FDckIsSUFBQSxDQUFLLElBQUwsQ0FEcUIsRUFBQTs7WUFHekIsSUFBQSxHQUFPLEtBQUssQ0FBQyxRQUFOLENBQWUsSUFBZjtZQUVQLElBQUcsS0FBQSxDQUFNLElBQU4sQ0FBSDtnQkFBWSxPQUFBLENBQU8sS0FBUCxDQUFhLEVBQUEsQ0FBRyxFQUFBLENBQUcsYUFBQSxHQUFhLENBQUMsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFILENBQUgsQ0FBRCxDQUFoQixDQUFILENBQWI7QUFBK0MseUJBQTNEOztZQUVBLElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFUO2dCQUNJLEVBQUEsR0FBSyxJQUFDLENBQUEsT0FBRCxDQUFTLElBQVQ7Z0JBQ0wsR0FBQSxHQUFNLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFwQixFQUE0QixLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsQ0FBNUI7Z0JBQ04sR0FBQSxHQUFNLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBZCxFQUFtQixJQUFuQjtnQkFDTixFQUFBLEdBQU0sQ0FBQSxVQUFBLEdBQVcsR0FBRyxDQUFDLE9BQWYsR0FBdUIsTUFBdkIsQ0FBQSxHQUErQjtnQkFDckMsSUFBRyxDQUFJLEtBQUssQ0FBQyxTQUFOLENBQWdCLEdBQWhCLEVBQXFCLEVBQXJCLENBQVA7aUNBQ0csT0FBQSxDQUFDLEtBQUQsQ0FBTyxFQUFBLENBQUcsRUFBQSxDQUFHLGNBQUEsR0FBYyxDQUFDLEVBQUEsQ0FBRyxFQUFBLENBQUcsR0FBSCxDQUFILENBQUQsQ0FBakIsQ0FBSCxDQUFQLEdBREg7aUJBQUEsTUFBQTt5Q0FBQTtpQkFMSjthQUFBLE1BT0ssSUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQVQ7NkJBQ0QsSUFBQyxFQUFBLElBQUEsRUFBRCxDQUFNLElBQU4sRUFBWSxJQUFaLEdBREM7YUFBQSxNQUFBO2dCQUdELElBQUcsQ0FBSSxJQUFJLENBQUMsRUFBWjtpQ0FDRyxPQUFBLENBQUMsR0FBRCxDQUFLLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBVCxDQUFMLEdBREg7aUJBQUEsTUFBQTt5Q0FBQTtpQkFIQzs7QUFoQlQ7O0lBYkM7Ozs7OztBQXlDVCxNQUFNLENBQUMsT0FBUCxHQUFpQjs7QUFFakIsSUFBRyxDQUFJLE1BQU0sQ0FBQyxNQUFYLElBQXFCLEtBQUssQ0FBQyxPQUFOLENBQWMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUE1QixDQUFpQyxDQUFDLFFBQWxDLENBQTJDLFdBQTNDLENBQXhCO0lBRUksSUFBQSxHQUFPLElBQUEsQ0FBSyw0cUNBQUEsR0FvQkcsR0FBRyxDQUFDLE9BcEJaO0lBdUJQLElBQUEsR0FBTyxJQUFJLElBQUosQ0FBUyxJQUFUO0lBQ1AsSUFBSSxDQUFDLEdBQUwsQ0FBQSxFQTFCSiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuIyMjXG5cbnNsYXNoICA9IHJlcXVpcmUgJ2tzbGFzaCdcbmtzdHIgICA9IHJlcXVpcmUgJ2tzdHInXG5rbG9yICAgPSByZXF1aXJlICdrbG9yJ1xua2FyZyAgID0gcmVxdWlyZSAna2FyZydcbmNoaWxkcCA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG5wcmludCAgPSByZXF1aXJlICcuL3ByaW50J1xucGtnICAgID0gcmVxdWlyZSBcIiN7X19kaXJuYW1lfS8uLi9wYWNrYWdlXCJcblxueyBlbXB0eSwgcmVnaXN0ZXIgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbnJlZ2lzdGVyKClcbmtsb3Iua29sb3IuZ2xvYmFsaXplKClcblxuY2xhc3MgS29kZVxuXG4gICAgQDogKEBhcmdzKSAtPlxuXG4gICAgICAgIEBhcmdzID89IHt9XG5cbiAgICAgICAgaWYgQGFyZ3MudmVyYm9zZSB0aGVuIEBhcmdzLmRlYnVnID0gQGFyZ3MuYmxvY2sgPSBAYXJncy50b2tlbnMgPSBAYXJncy5wYXJzZSA9IHRydWVcblxuICAgICAgICBMZXhlciAgICAgPSByZXF1aXJlICcuL2xleGVyJ1xuICAgICAgICBQYXJzZXIgICAgPSByZXF1aXJlICcuL3BhcnNlcidcbiAgICAgICAgU2NvcGVyICAgID0gcmVxdWlyZSAnLi9zY29wZXInXG4gICAgICAgIFN0cmlwb2wgICA9IHJlcXVpcmUgJy4vc3RyaXBvbCdcbiAgICAgICAgUmV0dXJuZXIgID0gcmVxdWlyZSAnLi9yZXR1cm5lcidcbiAgICAgICAgUmVuZGVyZXIgID0gcmVxdWlyZSAnLi9yZW5kZXJlcidcblxuICAgICAgICBAbGV4ZXIgICAgPSBuZXcgTGV4ZXIgICAgQFxuICAgICAgICBAcGFyc2VyICAgPSBuZXcgUGFyc2VyICAgQFxuICAgICAgICBAc2NvcGVyICAgPSBuZXcgU2NvcGVyICAgQFxuICAgICAgICBAc3RyaXBvbCAgPSBuZXcgU3RyaXBvbCAgQFxuICAgICAgICBAcmV0dXJuZXIgPSBuZXcgUmV0dXJuZXIgQFxuICAgICAgICBAcmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIgQFxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwXG5cbiAgICBAY29tcGlsZTogKHRleHQsIG9wdD17fSkgLT4gKG5ldyBLb2RlIG9wdCkuY29tcGlsZSB0ZXh0XG4gICAgY29tcGlsZTogKHRleHQpIC0+XG5cbiAgICAgICAgcmV0dXJuICcnIGlmIGVtcHR5IGtzdHIuc3RyaXAgdGV4dFxuXG4gICAgICAgIGFzdCA9IEBhc3QgdGV4dFxuXG4gICAgICAgIGlmIEBhcmdzLnBhcnNlIHRoZW4gcHJpbnQuYXN0ICdhc3QnIGFzdFxuICAgICAgICBpZiBAYXJncy5hc3RyICB0aGVuIGxvZyBwcmludC5hc3RyIGFzdCwgQGFyZ3Muc2NvcGVcblxuICAgICAgICBqcyA9IEByZW5kZXJlci5yZW5kZXIgYXN0XG5cbiAgICAgICAgaWYgQGFyZ3MuaGVhZGVyIGFuZCBrc3RyLnN0cmlwKGpzKS5sZW5ndGhcbiAgICAgICAgICAgIGpzID0gXCIvLyBtb25zdGVya29kaS9rb2RlICN7cGtnLnZlcnNpb259XFxuXFxuXCIgKyBqc1xuXG4gICAgICAgIGlmIEBhcmdzLmpzIG9yIEBhcmdzLmRlYnVnXG4gICAgICAgICAgICBwcmludC5jb2RlICdqcycganMgXG4gICAgICAgIGpzXG5cbiAgICBhc3Q6ICh0ZXh0KSAtPlxuXG4gICAgICAgIHRleHQgKz0gJ1xcbicgaWYgbm90IHRleHRbLTFdID09ICdcXG4nXG5cbiAgICAgICAgcHJpbnQuY29kZSAna29kZScgdGV4dCwgJ2NvZmZlZScgaWYgQGFyZ3MudmVyYm9zZSBvciBAYXJncy5kZWJ1ZyBvciBAYXJncy5rb2RlXG5cbiAgICAgICAgdG9rZW5zID0gQGxleGVyLnRva2VuaXplIHRleHRcblxuICAgICAgICBpZiBAYXJncy5yYXcgICAgdGhlbiBwcmludC5ub29uICdyYXcgdG9rZW5zJyB0b2tlbnNcbiAgICAgICAgaWYgQGFyZ3MudG9rZW5zIHRoZW4gcHJpbnQudG9rZW5zICd0b2tlbnMnIHRva2Vuc1xuXG4gICAgICAgIGJsb2NrID0gQGxleGVyLmJsb2NraWZ5IHRva2Vuc1xuXG4gICAgICAgIGlmIEBhcmdzLnJhdyAgIHRoZW4gcHJpbnQubm9vbiAncmF3IGJsb2NrJyBibG9ja1xuICAgICAgICBpZiBAYXJncy5ibG9jayB0aGVuIHByaW50LmJsb2NrICd0bCBibG9jaycgYmxvY2tcblxuICAgICAgICBAcmV0dXJuZXIuY29sbGVjdCBAc2NvcGVyLmNvbGxlY3QgQHN0cmlwb2wuY29sbGVjdCBAcGFyc2VyLnBhcnNlIGJsb2NrXG5cbiAgICBhc3RyOiAodGV4dCwgc2NvcGVzKSAtPiBwcmludC5hc3RyIEBhc3QodGV4dCksIHNjb3Blc1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwMCAgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGV2YWw6ICh0ZXh0LCBmaWxlbmFtZSkgLT5cblxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgdGV4dFxuXG4gICAgICAgIHZtID0gcmVxdWlyZSAndm0nXG5cbiAgICAgICAgc2FuZGJveCA9IHZtLmNyZWF0ZUNvbnRleHQoKVxuICAgICAgICAjIHNhbmRib3guZ2xvYmFsID0gc2FuZGJveC5yb290ID0gc2FuZGJveC5HTE9CQUwgPSBzYW5kYm94XG4gICAgICAgIHNhbmRib3guZ2xvYmFsID0gZ2xvYmFsXG5cbiAgICAgICAgc2FuZGJveC5fX2ZpbGVuYW1lID0gZmlsZW5hbWUgPyAnZXZhbCdcbiAgICAgICAgc2FuZGJveC5fX2Rpcm5hbWUgID0gc2xhc2guZGlyIHNhbmRib3guX19maWxlbmFtZVxuICAgICAgICBzYW5kYm94LmNvbnNvbGUgICAgPSBjb25zb2xlXG5cbiAgICAgICAgTW9kdWxlID0gcmVxdWlyZSAnbW9kdWxlJ1xuICAgICAgICBzYW5kYm94Lm1vZHVsZSAgPSBfbW9kdWxlICA9IG5ldyBNb2R1bGUgJ2V2YWwnXG4gICAgICAgIHNhbmRib3gucmVxdWlyZSA9IF9yZXF1aXJlID0gKHBhdGgpIC0+IE1vZHVsZS5fbG9hZCBwYXRoLCBfbW9kdWxlLCB0cnVlXG4gICAgICAgIF9tb2R1bGUuZmlsZW5hbWUgPSBzYW5kYm94Ll9fZmlsZW5hbWVcbiAgICAgICAgZm9yIHIgaW4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgcmVxdWlyZVxuICAgICAgICAgICAgaWYgciBub3QgaW4gWydwYXRocycgJ2FyZ3VtZW50cycgJ2NhbGxlciddXG4gICAgICAgICAgICAgICAgX3JlcXVpcmVbcl0gPSByZXF1aXJlW3JdXG5cbiAgICAgICAgX3JlcXVpcmUucGF0aHMgPSBfbW9kdWxlLnBhdGhzID0gTW9kdWxlLl9ub2RlTW9kdWxlUGF0aHMgcHJvY2Vzcy5jd2QoKVxuICAgICAgICBfcmVxdWlyZS5yZXNvbHZlID0gKHJlcXVlc3QpIC0+IE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lIHJlcXVlc3QsIF9tb2R1bGVcblxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGpzID0gQGNvbXBpbGUgdGV4dFxuICAgICAgICAgICAgdm0ucnVuSW5Db250ZXh0IGpzLCBzYW5kYm94XG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgZXJyb3IgZXJyLCB0ZXh0XG4gICAgICAgICAgICB0aHJvdyBlcnJcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMFxuXG4gICAgY2xpOiAtPlxuXG4gICAgICAgICMgaWYgQGFyZ3MuZGVidWcgdGhlbiBwcmludC5ub29uICdhcmdzJyBAYXJnc1xuXG4gICAgICAgIGlmIEBhcmdzLmNvbXBpbGVcbiAgICAgICAgICAgIGxvZyBAY29tcGlsZSBAYXJncy5jb21waWxlXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgaWYgQGFyZ3MuZXZhbFxuICAgICAgICAgICAgbG9nIEBldmFsIEBhcmdzLmV2YWxcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHJldHVybiBpZiBub3QgQGFyZ3MuZmlsZXMubGVuZ3RoXG5cbiAgICAgICAgZm9yIGZpbGUgaW4gQGFyZ3MuZmlsZXNcblxuICAgICAgICAgICAgZmlsZSA9IHNsYXNoLnJlc29sdmUgZmlsZVxuICAgICAgICAgICAgbG9nIGdyYXkgZmlsZSBpZiBAYXJncy52ZXJib3NlXG5cbiAgICAgICAgICAgIHRleHQgPSBzbGFzaC5yZWFkVGV4dCBmaWxlXG5cbiAgICAgICAgICAgIGlmIGVtcHR5IHRleHQgdGhlbiBlcnJvciBZNCByMiBcImNhbid0IHJlYWQgI3tSMyB5NSBmaWxlfVwiOyBjb250aW51ZVxuXG4gICAgICAgICAgICBpZiBAYXJncy5vdXRkaXJcbiAgICAgICAgICAgICAgICBqcyA9IEBjb21waWxlIHRleHRcbiAgICAgICAgICAgICAgICBvdXQgPSBzbGFzaC5yZXNvbHZlIEBhcmdzLm91dGRpciwgc2xhc2guZmlsZSBmaWxlXG4gICAgICAgICAgICAgICAgb3V0ID0gc2xhc2guc3dhcEV4dCBvdXQsICdqcydcbiAgICAgICAgICAgICAgICBqcyAgPSBcIi8vIGtvZGUgI3twa2cudmVyc2lvbn1cXG5cXG5cIiArIGpzXG4gICAgICAgICAgICAgICAgaWYgbm90IHNsYXNoLndyaXRlVGV4dCBvdXQsIGpzXG4gICAgICAgICAgICAgICAgICAgIGVycm9yIFIyIHkzIFwiY2FuJ3Qgd3JpdGUgI3tSMyB5NiBvdXR9XCJcbiAgICAgICAgICAgIGVsc2UgaWYgQGFyZ3MucnVuXG4gICAgICAgICAgICAgICAgQGV2YWwgdGV4dCwgZmlsZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIG5vdCBhcmdzLmpzXG4gICAgICAgICAgICAgICAgICAgIGxvZyBAY29tcGlsZSB0ZXh0XG4gICAgICAgICAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuXG5tb2R1bGUuZXhwb3J0cyA9IEtvZGVcblxuaWYgbm90IG1vZHVsZS5wYXJlbnQgb3Igc2xhc2gucmVzb2x2ZShtb2R1bGUucGFyZW50LnBhdGgpLmVuZHNXaXRoICcva29kZS9iaW4nXG5cbiAgICBhcmdzID0ga2FyZyBcIlwiXCJcbiAgICAgICAga29kZSBvcHRpb25cbiAgICAgICAgICAgIGZpbGVzICAgICAgIC4gKipcbiAgICAgICAgICAgIGV2YWwgICAgICAgIC4gPyBldmFsdWF0ZSBhIHN0cmluZyBhbmQgcHJpbnQgdGhlIHJlc3VsdFxuICAgICAgICAgICAgY29tcGlsZSAgICAgLiA/IGNvbXBpbGUgYSBzdHJpbmcgYW5kIHByaW50IHRoZSByZXN1bHRcbiAgICAgICAgICAgIG91dGRpciAgICAgIC4gPyBvdXRwdXQgZGlyZWN0b3J5IGZvciB0cmFuc3BpbGVkIGZpbGVzXG4gICAgICAgICAgICBydW4gICAgICAgICAuID8gZXhlY3V0ZSBmaWxlICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSB0cnVlXG4gICAgICAgICAgICBtYXAgICAgICAgICAuID8gZ2VuZXJhdGUgaW5saW5lIHNvdXJjZSBtYXBzICAgICAgICAgICAgIC4gPSB0cnVlXG4gICAgICAgICAgICBrb2RlICAgICAgICAuID8gcHJldHR5IHByaW50IGlucHV0IGNvZGUgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICAgICAganMgICAgICAgICAgLiA/IHByZXR0eSBwcmludCB0cmFuc3BpbGVkIGpzIGNvZGUgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgICAgIGhlYWRlciAgICAgIC4gPyBwcmVwZW5kIG91dHB1dCB3aXRoIHZlcnNpb24gaGVhZGVyICAgICAgLiA9IGZhbHNlICAuIC0gSFxuICAgICAgICAgICAgdG9rZW5zICAgICAgLiA/IHByaW50IHRva2VucyAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBUXG4gICAgICAgICAgICBibG9jayAgICAgICAuID8gcHJpbnQgYmxvY2sgdHJlZSAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIEJcbiAgICAgICAgICAgIHBhcnNlICAgICAgIC4gPyBwcmludCBwYXJzZSB0cmVlICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gUFxuICAgICAgICAgICAgYXN0ciAgICAgICAgLiA/IHByaW50IHBhcnNlIHRyZWUgYXMgc3RyaW5nICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBBXG4gICAgICAgICAgICBzY29wZSAgICAgICAuID8gcHJpbnQgc2NvcGVzICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIFNcbiAgICAgICAgICAgIHZlcmJvc2UgICAgIC4gPyBsb2cgbW9yZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgICAgICBkZWJ1ZyAgICAgICAuID8gbG9nIGRlYnVnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICAgICAgcmF3ICAgICAgICAgLiA/IGxvZyByYXcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBSXG5cbiAgICAgICAgdmVyc2lvbiAgI3twa2cudmVyc2lvbn1cbiAgICAgICAgXCJcIlwiXG5cbiAgICBrb2RlID0gbmV3IEtvZGUgYXJnc1xuICAgIGtvZGUuY2xpKClcbiJdfQ==
//# sourceURL=../coffee/kode.coffee