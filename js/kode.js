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
        var file, i, js, len, out, ref, results, text;
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
            js = this.compile(text);
            if (this.args.outdir) {
                out = slash.resolve(this.args.outdir, slash.file(file));
                out = slash.swapExt(out, 'js');
                js = ("// kode " + pkg.version + "\n\n") + js;
                if (!slash.writeText(out, js)) {
                    results.push(console.error(R2(y3("can't write " + (R3(y6(out)))))));
                } else {
                    results.push(void 0);
                }
            } else {
                if (!args.js) {
                    results.push(console.log(js));
                } else {
                    results.push(void 0);
                }
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
    args = karg("kode option\n    files       . **\n    eval        . ? evaluate a string and print the result\n    compile     . ? compile a string and print the result\n    outdir      . ? output directory for transpiled files\n    map         . ? generate inline source maps             . = true\n    js          . ? pretty print transpiled js code         . = false\n    kode        . ? pretty print input code                 . = false\n    run         . ? execute file                            . = false\n    tokens      . ? print tokens                            . = false  . - T\n    block       . ? print block tree                        . = false  . - B\n    parse       . ? print parse tree                        . = false  . - P\n    astr        . ? print parse tree as string              . = false  . - A\n    scope       . ? print scopes                            . = false  . - S\n    verbose     . ? log more                                . = false\n    debug       . ? log debug                               . = false\n    raw         . ? log raw                                 . = false  . - R\n\nversion  " + pkg.version);
    kode = new Kode(args);
    kode.cli();
}

module.exports = Kode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29kZS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImtvZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEtBQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxNQUFBLEdBQVMsT0FBQSxDQUFRLGVBQVI7O0FBQ1QsS0FBQSxHQUFTLE9BQUEsQ0FBUSxTQUFSOztBQUNULEdBQUEsR0FBUyxPQUFBLENBQVcsU0FBRCxHQUFXLGFBQXJCOztBQUVQLFFBQVUsT0FBQSxDQUFRLFNBQVI7O0FBRVosSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFYLENBQUE7O0FBRU07SUFFQyxjQUFDLEtBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7O1lBRUEsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFROztRQUVULElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFUO1lBQXNCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixHQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLEtBQS9FOztRQUVBLEtBQUEsR0FBWSxPQUFBLENBQVEsU0FBUjtRQUNaLE1BQUEsR0FBWSxPQUFBLENBQVEsVUFBUjtRQUNaLE1BQUEsR0FBWSxPQUFBLENBQVEsVUFBUjtRQUNaLFFBQUEsR0FBWSxPQUFBLENBQVEsWUFBUjtRQUNaLFFBQUEsR0FBWSxPQUFBLENBQVEsWUFBUjtRQUVaLElBQUMsQ0FBQSxLQUFELEdBQVksSUFBSSxLQUFKLENBQWEsSUFBYjtRQUNaLElBQUMsQ0FBQSxNQUFELEdBQVksSUFBSSxNQUFKLENBQWEsSUFBYjtRQUNaLElBQUMsQ0FBQSxNQUFELEdBQVksSUFBSSxNQUFKLENBQWEsSUFBYjtRQUNaLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxRQUFKLENBQWEsSUFBYjtRQUNaLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxRQUFKLENBQWEsSUFBYjtJQWhCYjs7bUJBd0JILEdBQUEsR0FBSyxTQUFBO0FBSUQsWUFBQTtRQUFBLElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFUO1lBQ0csT0FBQSxDQUFDLEdBQUQsQ0FBSyxJQUFDLENBQUEsT0FBRCxDQUFTLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBZixDQUFMO0FBQ0MsbUJBRko7O1FBR0EsSUFBRyxJQUFDLENBQUEsSUFBSSxFQUFDLElBQUQsRUFBUjtZQUNHLE9BQUEsQ0FBQyxHQUFELENBQUssSUFBQyxFQUFBLElBQUEsRUFBRCxDQUFNLElBQUMsQ0FBQSxJQUFJLEVBQUMsSUFBRCxFQUFYLENBQUw7QUFDQyxtQkFGSjs7UUFJQSxJQUFVLENBQUksSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBMUI7QUFBQSxtQkFBQTs7QUFFQTtBQUFBO2FBQUEscUNBQUE7O1lBRUksSUFBQSxHQUFPLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZDtZQUFrQixJQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FERTtnQkFBQSxPQUFBLENBQ3pCLEdBRHlCLENBQ3JCLElBQUEsQ0FBSyxJQUFMLENBRHFCLEVBQUE7O1lBR3pCLElBQUEsR0FBTyxLQUFLLENBQUMsUUFBTixDQUFlLElBQWY7WUFFUCxJQUFHLEtBQUEsQ0FBTSxJQUFOLENBQUg7Z0JBQVksT0FBQSxDQUFPLEtBQVAsQ0FBYSxFQUFBLENBQUcsRUFBQSxDQUFHLGFBQUEsR0FBYSxDQUFDLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBSCxDQUFILENBQUQsQ0FBaEIsQ0FBSCxDQUFiO0FBQStDLHlCQUEzRDs7WUFFQSxFQUFBLEdBQUssSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFUO1lBRUwsSUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQVQ7Z0JBQ0ksR0FBQSxHQUFNLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFwQixFQUE0QixLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsQ0FBNUI7Z0JBQ04sR0FBQSxHQUFNLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBZCxFQUFtQixJQUFuQjtnQkFDTixFQUFBLEdBQU0sQ0FBQSxVQUFBLEdBQVcsR0FBRyxDQUFDLE9BQWYsR0FBdUIsTUFBdkIsQ0FBQSxHQUErQjtnQkFDckMsSUFBRyxDQUFJLEtBQUssQ0FBQyxTQUFOLENBQWdCLEdBQWhCLEVBQXFCLEVBQXJCLENBQVA7aUNBQ0csT0FBQSxDQUFDLEtBQUQsQ0FBTyxFQUFBLENBQUcsRUFBQSxDQUFHLGNBQUEsR0FBYyxDQUFDLEVBQUEsQ0FBRyxFQUFBLENBQUcsR0FBSCxDQUFILENBQUQsQ0FBakIsQ0FBSCxDQUFQLEdBREg7aUJBQUEsTUFBQTt5Q0FBQTtpQkFKSjthQUFBLE1BQUE7Z0JBT0ksSUFBRyxDQUFJLElBQUksQ0FBQyxFQUFaO2lDQUNHLE9BQUEsQ0FBQyxHQUFELENBQUssRUFBTCxHQURIO2lCQUFBLE1BQUE7eUNBQUE7aUJBUEo7O0FBWEo7O0lBYkM7O0lBd0NMLElBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxJQUFEO2VBQVUsQ0FBQyxJQUFJLElBQUosQ0FBUyxFQUFULENBQUQsQ0FBYSxDQUFDLE9BQWQsQ0FBc0IsSUFBdEI7SUFBVjs7bUJBQ1YsT0FBQSxHQUFTLFNBQUMsSUFBRDtBQUVMLFlBQUE7UUFBQSxJQUFhLEtBQUEsQ0FBTSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsQ0FBTixDQUFiO0FBQUEsbUJBQU8sR0FBUDs7UUFFQSxHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUQsQ0FBSyxJQUFMO1FBRU4sSUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQVQ7WUFBb0IsS0FBSyxDQUFDLEdBQU4sQ0FBVSxLQUFWLEVBQWdCLEdBQWhCLEVBQXBCOztRQUNBLElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFUO1lBQVksT0FBQSxDQUFRLEdBQVIsQ0FBWSxLQUFLLENBQUMsSUFBTixDQUFXLEdBQVgsRUFBZ0IsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUF0QixDQUFaLEVBQVo7O1FBRUEsRUFBQSxHQUFLLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixHQUFqQjtRQUVMLElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLElBQVksSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFyQjtZQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxFQUFnQixFQUFoQixFQURKOztlQUVBO0lBYks7O21CQWVULEdBQUEsR0FBSyxTQUFDLElBQUQ7QUFFRCxZQUFBO1FBQUEsSUFBZ0IsQ0FBSSxJQUFLLFVBQUUsQ0FBQSxDQUFBLENBQVgsS0FBZ0IsSUFBaEM7WUFBQSxJQUFBLElBQVEsS0FBUjs7UUFFQSxJQUFvQyxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sSUFBaUIsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUF2QixJQUFnQyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQTFFO1lBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxNQUFYLEVBQWtCLElBQWxCLEVBQXdCLFFBQXhCLEVBQUE7O1FBRUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBUCxDQUFnQixJQUFoQjtRQUVULElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFUO1lBQXFCLEtBQUssQ0FBQyxJQUFOLENBQVcsWUFBWCxFQUF3QixNQUF4QixFQUFyQjs7UUFDQSxJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBVDtZQUFxQixLQUFLLENBQUMsTUFBTixDQUFhLFFBQWIsRUFBc0IsTUFBdEIsRUFBckI7O1FBRUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBUCxDQUFnQixNQUFoQjtRQUVSLElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFUO1lBQW9CLEtBQUssQ0FBQyxJQUFOLENBQVcsV0FBWCxFQUF1QixLQUF2QixFQUFwQjs7UUFDQSxJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBVDtZQUFvQixLQUFLLENBQUMsS0FBTixDQUFZLFVBQVosRUFBdUIsS0FBdkIsRUFBcEI7O2VBRUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFWLENBQWtCLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFnQixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBYyxLQUFkLENBQWhCLENBQWxCO0lBaEJDOzttQkFrQkwsSUFBQSxHQUFNLFNBQUMsSUFBRCxFQUFPLE1BQVA7ZUFBa0IsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFDLENBQUEsR0FBRCxDQUFLLElBQUwsQ0FBWCxFQUF1QixNQUF2QjtJQUFsQjs7b0JBUU4sTUFBQSxHQUFNLFNBQUMsSUFBRDtBQUVGLFlBQUE7UUFBQSxJQUFVLEtBQUEsQ0FBTSxJQUFOLENBQVY7QUFBQSxtQkFBQTs7UUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7UUFFTCxPQUFBLEdBQVUsRUFBRSxDQUFDLGFBQUgsQ0FBQTtRQUNWLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLE9BQU8sQ0FBQyxJQUFSLEdBQWUsT0FBTyxDQUFDLE1BQVIsR0FBaUI7UUFFakQsT0FBTyxDQUFDLFVBQVIsR0FBcUI7UUFDckIsT0FBTyxDQUFDLFNBQVIsR0FBcUIsS0FBSyxDQUFDLEdBQU4sQ0FBVSxPQUFPLENBQUMsVUFBbEI7UUFHckIsSUFBQSxDQUFBLENBQU8sT0FBQSxLQUFXLE1BQVgsSUFBcUIsT0FBTyxDQUFDLE1BQTdCLElBQXVDLE9BQU8sQ0FBQyxPQUF0RCxDQUFBO1lBQ0ksTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSO1lBQ1QsT0FBTyxDQUFDLE1BQVIsR0FBa0IsT0FBQSxHQUFXLElBQUksTUFBSixDQUFXLE1BQVg7WUFDN0IsT0FBTyxDQUFDLE9BQVIsR0FBa0IsUUFBQSxHQUFXLFNBQUMsSUFBRDt1QkFBVyxNQUFNLENBQUMsS0FBUCxDQUFhLElBQWIsRUFBbUIsT0FBbkIsRUFBNEIsSUFBNUI7WUFBWDtZQUM3QixPQUFPLENBQUMsUUFBUixHQUFtQixPQUFPLENBQUM7QUFDM0I7QUFBQSxpQkFBQSxxQ0FBQTs7Z0JBQ0ksSUFBRyxDQUFBLEtBQVUsT0FBVixJQUFBLENBQUEsS0FBa0IsV0FBbEIsSUFBQSxDQUFBLEtBQThCLFFBQWpDO29CQUNJLFFBQVMsQ0FBQSxDQUFBLENBQVQsR0FBYyxPQUFRLENBQUEsQ0FBQSxFQUQxQjs7QUFESjtZQUlBLFFBQVEsQ0FBQyxLQUFULEdBQWlCLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixPQUFPLENBQUMsR0FBUixDQUFBLENBQXhCO1lBQ2pDLFFBQVEsQ0FBQyxPQUFULEdBQW1CLFNBQUMsT0FBRDt1QkFBYSxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsT0FBeEIsRUFBaUMsT0FBakM7WUFBYixFQVZ2Qjs7UUFZQSxFQUFBLEdBQUssSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFUO0FBRUw7WUFDSSxPQUFPLENBQUMsT0FBUixHQUFrQjttQkFDbEIsRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsRUFBaEIsRUFBb0IsT0FBcEIsRUFGSjtTQUFBLGFBQUE7WUFHTTtZQUNILE9BQUEsQ0FBQyxLQUFELENBQU8sR0FBUCxFQUFZLElBQVo7QUFDQyxrQkFBTSxJQUxWOztJQTNCRTs7Ozs7O0FBd0NWLElBQUcsQ0FBSSxNQUFNLENBQUMsTUFBWCxJQUFxQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFuQixDQUE0QixXQUE1QixDQUF4QjtJQUVJLElBQUEsR0FBTyxJQUFBLENBQUssK2xDQUFBLEdBbUJHLEdBQUcsQ0FBQyxPQW5CWjtJQXNCUCxJQUFBLEdBQU8sSUFBSSxJQUFKLENBQVMsSUFBVDtJQUNQLElBQUksQ0FBQyxHQUFMLENBQUEsRUF6Qko7OztBQTJCQSxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuIyMjXG5cbnNsYXNoICA9IHJlcXVpcmUgJ2tzbGFzaCdcbmtzdHIgICA9IHJlcXVpcmUgJ2tzdHInXG5rbG9yICAgPSByZXF1aXJlICdrbG9yJ1xua2FyZyAgID0gcmVxdWlyZSAna2FyZydcbmNoaWxkcCA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG5wcmludCAgPSByZXF1aXJlICcuL3ByaW50J1xucGtnICAgID0gcmVxdWlyZSBcIiN7X19kaXJuYW1lfS8uLi9wYWNrYWdlXCJcblxueyBlbXB0eSB9ID0gcmVxdWlyZSAnLi91dGlscydcblxua2xvci5rb2xvci5nbG9iYWxpemUoKVxuXG5jbGFzcyBLb2RlXG5cbiAgICBAOiAoQGFyZ3MpIC0+XG5cbiAgICAgICAgQGFyZ3MgPz0ge31cblxuICAgICAgICBpZiBAYXJncy52ZXJib3NlIHRoZW4gQGFyZ3MuZGVidWcgPSBAYXJncy5ibG9jayA9IEBhcmdzLnRva2VucyA9IEBhcmdzLnBhcnNlID0gdHJ1ZVxuXG4gICAgICAgIExleGVyICAgICA9IHJlcXVpcmUgJy4vbGV4ZXInXG4gICAgICAgIFBhcnNlciAgICA9IHJlcXVpcmUgJy4vcGFyc2VyJ1xuICAgICAgICBTY29wZXIgICAgPSByZXF1aXJlICcuL3Njb3BlcidcbiAgICAgICAgUmV0dXJuZXIgID0gcmVxdWlyZSAnLi9yZXR1cm5lcidcbiAgICAgICAgUmVuZGVyZXIgID0gcmVxdWlyZSAnLi9yZW5kZXJlcidcblxuICAgICAgICBAbGV4ZXIgICAgPSBuZXcgTGV4ZXIgICAgQFxuICAgICAgICBAcGFyc2VyICAgPSBuZXcgUGFyc2VyICAgQFxuICAgICAgICBAc2NvcGVyICAgPSBuZXcgU2NvcGVyICAgQFxuICAgICAgICBAcmV0dXJuZXIgPSBuZXcgUmV0dXJuZXIgQFxuICAgICAgICBAcmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIgQFxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwXG5cbiAgICBjbGk6IC0+XG5cbiAgICAgICAgIyBpZiBAYXJncy5kZWJ1ZyB0aGVuIHByaW50Lm5vb24gJ2FyZ3MnIEBhcmdzXG5cbiAgICAgICAgaWYgQGFyZ3MuY29tcGlsZVxuICAgICAgICAgICAgbG9nIEBjb21waWxlIEBhcmdzLmNvbXBpbGVcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBpZiBAYXJncy5ldmFsXG4gICAgICAgICAgICBsb2cgQGV2YWwgQGFyZ3MuZXZhbFxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAYXJncy5maWxlcy5sZW5ndGhcblxuICAgICAgICBmb3IgZmlsZSBpbiBAYXJncy5maWxlc1xuXG4gICAgICAgICAgICBmaWxlID0gc2xhc2gucmVzb2x2ZSBmaWxlXG4gICAgICAgICAgICBsb2cgZ3JheSBmaWxlIGlmIEBhcmdzLnZlcmJvc2VcblxuICAgICAgICAgICAgdGV4dCA9IHNsYXNoLnJlYWRUZXh0IGZpbGVcblxuICAgICAgICAgICAgaWYgZW1wdHkgdGV4dCB0aGVuIGVycm9yIFk0IHIyIFwiY2FuJ3QgcmVhZCAje1IzIHk1IGZpbGV9XCI7IGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGpzID0gQGNvbXBpbGUgdGV4dFxuXG4gICAgICAgICAgICBpZiBAYXJncy5vdXRkaXJcbiAgICAgICAgICAgICAgICBvdXQgPSBzbGFzaC5yZXNvbHZlIEBhcmdzLm91dGRpciwgc2xhc2guZmlsZSBmaWxlXG4gICAgICAgICAgICAgICAgb3V0ID0gc2xhc2guc3dhcEV4dCBvdXQsICdqcydcbiAgICAgICAgICAgICAgICBqcyAgPSBcIi8vIGtvZGUgI3twa2cudmVyc2lvbn1cXG5cXG5cIiArIGpzXG4gICAgICAgICAgICAgICAgaWYgbm90IHNsYXNoLndyaXRlVGV4dCBvdXQsIGpzXG4gICAgICAgICAgICAgICAgICAgIGVycm9yIFIyIHkzIFwiY2FuJ3Qgd3JpdGUgI3tSMyB5NiBvdXR9XCJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBub3QgYXJncy5qc1xuICAgICAgICAgICAgICAgICAgICBsb2cganNcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMFxuXG4gICAgQGNvbXBpbGU6ICh0ZXh0KSAtPiAobmV3IEtvZGUge30pLmNvbXBpbGUgdGV4dFxuICAgIGNvbXBpbGU6ICh0ZXh0KSAtPlxuXG4gICAgICAgIHJldHVybiAnJyBpZiBlbXB0eSBrc3RyLnN0cmlwIHRleHRcblxuICAgICAgICBhc3QgPSBAYXN0IHRleHRcblxuICAgICAgICBpZiBAYXJncy5wYXJzZSB0aGVuIHByaW50LmFzdCAnYXN0JyBhc3RcbiAgICAgICAgaWYgQGFyZ3MuYXN0ciAgdGhlbiBsb2cgcHJpbnQuYXN0ciBhc3QsIEBhcmdzLnNjb3BlXG5cbiAgICAgICAganMgPSBAcmVuZGVyZXIucmVuZGVyIGFzdFxuXG4gICAgICAgIGlmIEBhcmdzLmpzIG9yIEBhcmdzLmRlYnVnXG4gICAgICAgICAgICBwcmludC5jb2RlICdqcycganMgXG4gICAgICAgIGpzXG5cbiAgICBhc3Q6ICh0ZXh0KSAtPlxuXG4gICAgICAgIHRleHQgKz0gJ1xcbicgaWYgbm90IHRleHRbLTFdID09ICdcXG4nXG5cbiAgICAgICAgcHJpbnQuY29kZSAna29kZScgdGV4dCwgJ2NvZmZlZScgaWYgQGFyZ3MudmVyYm9zZSBvciBAYXJncy5kZWJ1ZyBvciBAYXJncy5rb2RlXG5cbiAgICAgICAgdG9rZW5zID0gQGxleGVyLnRva2VuaXplIHRleHRcblxuICAgICAgICBpZiBAYXJncy5yYXcgICAgdGhlbiBwcmludC5ub29uICdyYXcgdG9rZW5zJyB0b2tlbnNcbiAgICAgICAgaWYgQGFyZ3MudG9rZW5zIHRoZW4gcHJpbnQudG9rZW5zICd0b2tlbnMnIHRva2Vuc1xuXG4gICAgICAgIGJsb2NrID0gQGxleGVyLmJsb2NraWZ5IHRva2Vuc1xuXG4gICAgICAgIGlmIEBhcmdzLnJhdyAgIHRoZW4gcHJpbnQubm9vbiAncmF3IGJsb2NrJyBibG9ja1xuICAgICAgICBpZiBAYXJncy5ibG9jayB0aGVuIHByaW50LmJsb2NrICd0bCBibG9jaycgYmxvY2tcblxuICAgICAgICBAcmV0dXJuZXIuY29sbGVjdCBAc2NvcGVyLmNvbGxlY3QgQHBhcnNlci5wYXJzZSBibG9ja1xuXG4gICAgYXN0cjogKHRleHQsIHNjb3BlcykgLT4gcHJpbnQuYXN0ciBAYXN0KHRleHQpLCBzY29wZXNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBldmFsOiAodGV4dCkgLT5cblxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgdGV4dFxuXG4gICAgICAgIHZtID0gcmVxdWlyZSAndm0nXG5cbiAgICAgICAgc2FuZGJveCA9IHZtLmNyZWF0ZUNvbnRleHQoKVxuICAgICAgICBzYW5kYm94Lmdsb2JhbCA9IHNhbmRib3gucm9vdCA9IHNhbmRib3guR0xPQkFMID0gc2FuZGJveFxuXG4gICAgICAgIHNhbmRib3guX19maWxlbmFtZSA9ICdldmFsJ1xuICAgICAgICBzYW5kYm94Ll9fZGlybmFtZSAgPSBzbGFzaC5kaXIgc2FuZGJveC5fX2ZpbGVuYW1lXG5cbiAgICAgICAgIyBkZWZpbmUgbW9kdWxlL3JlcXVpcmUgb25seSBpZiB0aGV5IGNob3NlIG5vdCB0byBzcGVjaWZ5IHRoZWlyIG93blxuICAgICAgICB1bmxlc3Mgc2FuZGJveCAhPSBnbG9iYWwgb3Igc2FuZGJveC5tb2R1bGUgb3Igc2FuZGJveC5yZXF1aXJlXG4gICAgICAgICAgICBNb2R1bGUgPSByZXF1aXJlICdtb2R1bGUnXG4gICAgICAgICAgICBzYW5kYm94Lm1vZHVsZSAgPSBfbW9kdWxlICA9IG5ldyBNb2R1bGUgJ2V2YWwnXG4gICAgICAgICAgICBzYW5kYm94LnJlcXVpcmUgPSBfcmVxdWlyZSA9IChwYXRoKSAtPiAgTW9kdWxlLl9sb2FkIHBhdGgsIF9tb2R1bGUsIHRydWVcbiAgICAgICAgICAgIF9tb2R1bGUuZmlsZW5hbWUgPSBzYW5kYm94Ll9fZmlsZW5hbWVcbiAgICAgICAgICAgIGZvciByIGluIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHJlcXVpcmVcbiAgICAgICAgICAgICAgICBpZiByIG5vdCBpbiBbJ3BhdGhzJyAnYXJndW1lbnRzJyAnY2FsbGVyJ11cbiAgICAgICAgICAgICAgICAgICAgX3JlcXVpcmVbcl0gPSByZXF1aXJlW3JdXG4gICAgICAgICAgICAjIHVzZSB0aGUgc2FtZSBoYWNrIG5vZGUgY3VycmVudGx5IHVzZXMgZm9yIHRoZWlyIG93biBSRVBMXG4gICAgICAgICAgICBfcmVxdWlyZS5wYXRocyA9IF9tb2R1bGUucGF0aHMgPSBNb2R1bGUuX25vZGVNb2R1bGVQYXRocyBwcm9jZXNzLmN3ZCgpXG4gICAgICAgICAgICBfcmVxdWlyZS5yZXNvbHZlID0gKHJlcXVlc3QpIC0+IE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lIHJlcXVlc3QsIF9tb2R1bGVcblxuICAgICAgICBqcyA9IEBjb21waWxlIHRleHRcblxuICAgICAgICB0cnlcbiAgICAgICAgICAgIHNhbmRib3guY29uc29sZSA9IGNvbnNvbGVcbiAgICAgICAgICAgIHZtLnJ1bkluQ29udGV4dCBqcywgc2FuZGJveFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGVycm9yIGVyciwgdGV4dFxuICAgICAgICAgICAgdGhyb3cgZXJyXG5cbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuXG5pZiBub3QgbW9kdWxlLnBhcmVudCBvciBtb2R1bGUucGFyZW50LnBhdGguZW5kc1dpdGggJy9rb2RlL2JpbidcblxuICAgIGFyZ3MgPSBrYXJnIFwiXCJcIlxuICAgICAgICBrb2RlIG9wdGlvblxuICAgICAgICAgICAgZmlsZXMgICAgICAgLiAqKlxuICAgICAgICAgICAgZXZhbCAgICAgICAgLiA/IGV2YWx1YXRlIGEgc3RyaW5nIGFuZCBwcmludCB0aGUgcmVzdWx0XG4gICAgICAgICAgICBjb21waWxlICAgICAuID8gY29tcGlsZSBhIHN0cmluZyBhbmQgcHJpbnQgdGhlIHJlc3VsdFxuICAgICAgICAgICAgb3V0ZGlyICAgICAgLiA/IG91dHB1dCBkaXJlY3RvcnkgZm9yIHRyYW5zcGlsZWQgZmlsZXNcbiAgICAgICAgICAgIG1hcCAgICAgICAgIC4gPyBnZW5lcmF0ZSBpbmxpbmUgc291cmNlIG1hcHMgICAgICAgICAgICAgLiA9IHRydWVcbiAgICAgICAgICAgIGpzICAgICAgICAgIC4gPyBwcmV0dHkgcHJpbnQgdHJhbnNwaWxlZCBqcyBjb2RlICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgICAgICBrb2RlICAgICAgICAuID8gcHJldHR5IHByaW50IGlucHV0IGNvZGUgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICAgICAgcnVuICAgICAgICAgLiA/IGV4ZWN1dGUgZmlsZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgICAgIHRva2VucyAgICAgIC4gPyBwcmludCB0b2tlbnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gVFxuICAgICAgICAgICAgYmxvY2sgICAgICAgLiA/IHByaW50IGJsb2NrIHRyZWUgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBCXG4gICAgICAgICAgICBwYXJzZSAgICAgICAuID8gcHJpbnQgcGFyc2UgdHJlZSAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIFBcbiAgICAgICAgICAgIGFzdHIgICAgICAgIC4gPyBwcmludCBwYXJzZSB0cmVlIGFzIHN0cmluZyAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gQVxuICAgICAgICAgICAgc2NvcGUgICAgICAgLiA/IHByaW50IHNjb3BlcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBTXG4gICAgICAgICAgICB2ZXJib3NlICAgICAuID8gbG9nIG1vcmUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICAgICAgZGVidWcgICAgICAgLiA/IGxvZyBkZWJ1ZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgICAgIHJhdyAgICAgICAgIC4gPyBsb2cgcmF3ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gUlxuXG4gICAgICAgIHZlcnNpb24gICN7cGtnLnZlcnNpb259XG4gICAgICAgIFwiXCJcIlxuXG4gICAga29kZSA9IG5ldyBLb2RlIGFyZ3NcbiAgICBrb2RlLmNsaSgpXG5cbm1vZHVsZS5leHBvcnRzID0gS29kZVxuXG4iXX0=
//# sourceURL=../coffee/kode.coffee