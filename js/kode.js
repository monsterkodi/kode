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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29kZS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImtvZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEtBQUEsR0FBVyxPQUFBLENBQVEsUUFBUjs7QUFDWCxJQUFBLEdBQVcsT0FBQSxDQUFRLE1BQVI7O0FBQ1gsSUFBQSxHQUFXLE9BQUEsQ0FBUSxNQUFSOztBQUNYLElBQUEsR0FBVyxPQUFBLENBQVEsTUFBUjs7QUFDWCxNQUFBLEdBQVcsT0FBQSxDQUFRLGVBQVI7O0FBQ1gsS0FBQSxHQUFXLE9BQUEsQ0FBUSxTQUFSOztBQUNYLEdBQUEsR0FBVyxPQUFBLENBQVcsU0FBRCxHQUFXLGFBQXJCOztBQUNYLEtBQUEsR0FBVyxTQUFDLENBQUQ7V0FBTyxDQUFBLENBQUEsS0FBTSxFQUFOLElBQUEsQ0FBQSxLQUFTLElBQVQsSUFBQSxDQUFBLEtBQWMsUUFBZCxDQUFBLElBQTRCLENBQUMsT0FBTyxDQUFQLEtBQWEsUUFBYixJQUEwQixNQUFNLENBQUMsSUFBUCxDQUFZLENBQVosQ0FBYyxDQUFDLE1BQWYsS0FBeUIsQ0FBcEQ7QUFBbkM7O0FBRVgsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFYLENBQUE7O0FBRU07SUFFQyxjQUFDLEtBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7O1lBRUEsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFROztRQUVULElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFUO1lBQXNCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixHQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLEtBQS9FOztRQUVBLEtBQUEsR0FBWSxPQUFBLENBQVEsU0FBUjtRQUNaLE1BQUEsR0FBWSxPQUFBLENBQVEsVUFBUjtRQUNaLFFBQUEsR0FBWSxPQUFBLENBQVEsWUFBUjtRQUVaLElBQUMsQ0FBQSxLQUFELEdBQVksSUFBSTtRQUNoQixJQUFDLENBQUEsTUFBRCxHQUFZLElBQUksTUFBSixDQUFhLElBQUMsQ0FBQSxJQUFkO1FBQ1osSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLFFBQUosQ0FBYSxJQUFiO0lBWmI7O21CQW9CSCxHQUFBLEdBQUssU0FBQTtBQUlELFlBQUE7UUFBQSxJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBVDtZQUNHLE9BQUEsQ0FBQyxHQUFELENBQUssSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQWYsQ0FBTDtBQUNDLG1CQUZKOztRQUdBLElBQUcsSUFBQyxDQUFBLElBQUksRUFBQyxJQUFELEVBQVI7WUFDRyxPQUFBLENBQUMsR0FBRCxDQUFLLElBQUMsRUFBQSxJQUFBLEVBQUQsQ0FBTSxJQUFDLENBQUEsSUFBSSxFQUFDLElBQUQsRUFBWCxDQUFMO0FBQ0MsbUJBRko7O1FBSUEsSUFBVSxDQUFJLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQTFCO0FBQUEsbUJBQUE7O0FBRUE7QUFBQTthQUFBLHFDQUFBOztZQUVJLElBQUEsR0FBTyxLQUFLLENBQUMsT0FBTixDQUFjLElBQWQ7WUFBa0IsSUFDUixJQUFDLENBQUEsSUFBSSxDQUFDLE9BREU7Z0JBQUEsT0FBQSxDQUN6QixHQUR5QixDQUNyQixJQUFBLENBQUssSUFBTCxDQURxQixFQUFBOztZQUd6QixJQUFBLEdBQU8sS0FBSyxDQUFDLFFBQU4sQ0FBZSxJQUFmO1lBRVAsSUFBRyxLQUFBLENBQU0sSUFBTixDQUFIO2dCQUFZLE9BQUEsQ0FBTyxLQUFQLENBQWEsRUFBQSxDQUFHLEVBQUEsQ0FBRyxhQUFBLEdBQWEsQ0FBQyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUgsQ0FBSCxDQUFELENBQWhCLENBQUgsQ0FBYjtBQUErQyx5QkFBM0Q7O1lBRUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBVDtZQUVQLElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFUO2dCQUNJLEdBQUEsR0FBTSxLQUFLLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBakIsRUFBeUIsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLENBQXpCO2dCQUNOLEdBQUEsR0FBTSxLQUFLLENBQUMsT0FBTixDQUFjLEdBQWQsRUFBbUIsSUFBbkI7Z0JBQXVCLElBQ1osSUFBQyxDQUFBLElBQUksQ0FBQyxPQURNO29CQUFBLE9BQUEsQ0FDN0IsR0FENkIsQ0FDekIsS0FEeUIsRUFDbkIsR0FEbUIsRUFBQTs7NkJBRTdCLEtBQUssQ0FBQyxTQUFOLENBQWdCLEdBQWhCLEVBQXFCLElBQXJCLEdBSko7YUFBQSxNQUFBO3FDQUFBOztBQVhKOztJQWJDOztJQW9DTCxJQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsSUFBRDtlQUFVLENBQUMsSUFBSSxJQUFKLENBQVMsRUFBVCxDQUFELENBQWEsQ0FBQyxPQUFkLENBQXNCLElBQXRCO0lBQVY7O21CQUNWLE9BQUEsR0FBUyxTQUFDLElBQUQ7QUFFTCxZQUFBO1FBQUEsSUFBYSxLQUFBLENBQU0sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYLENBQU4sQ0FBYjtBQUFBLG1CQUFPLEdBQVA7O1FBRUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxHQUFELENBQUssSUFBTDtRQUVOLElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFUO1lBQW9CLEtBQUssQ0FBQyxHQUFOLENBQVUsS0FBVixFQUFnQixHQUFoQixFQUFwQjs7UUFFQSxFQUFBLEdBQUssSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLEdBQWpCO1FBRUwsSUFBc0IsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLElBQVksSUFBQyxDQUFBLElBQUksQ0FBQyxLQUF4QztZQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxFQUFnQixFQUFoQixFQUFBOztlQUVBO0lBWks7O21CQWNULEdBQUEsR0FBSyxTQUFDLElBQUQ7QUFFRCxZQUFBO1FBQUEsSUFBZ0IsQ0FBSSxJQUFLLFVBQUUsQ0FBQSxDQUFBLENBQVgsS0FBZ0IsSUFBaEM7WUFBQSxJQUFBLElBQVEsS0FBUjs7UUFFQSxJQUFzQyxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sSUFBaUIsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUE3RDtZQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsUUFBWCxFQUFvQixJQUFwQixFQUEwQixRQUExQixFQUFBOztRQUVBLE1BQUEsR0FBUyxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVAsQ0FBZ0IsSUFBaEI7UUFFVCxJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBVDtZQUFxQixLQUFLLENBQUMsSUFBTixDQUFXLFlBQVgsRUFBd0IsTUFBeEIsRUFBckI7O1FBQ0EsSUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQVQ7WUFBcUIsS0FBSyxDQUFDLE1BQU4sQ0FBYSxRQUFiLEVBQXNCLE1BQXRCLEVBQXJCOztRQUVBLEtBQUEsR0FBUSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVAsQ0FBZ0IsTUFBaEI7UUFFUixJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBVDtZQUFvQixLQUFLLENBQUMsSUFBTixDQUFXLFdBQVgsRUFBdUIsS0FBdkIsRUFBcEI7O1FBQ0EsSUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQVQ7WUFBb0IsS0FBSyxDQUFDLEtBQU4sQ0FBWSxVQUFaLEVBQXVCLEtBQXZCLEVBQXBCOztlQUVBLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFjLEtBQWQ7SUFoQkM7O29CQXdCTCxNQUFBLEdBQU0sU0FBQyxJQUFEO0FBRUYsWUFBQTtRQUFBLElBQVUsS0FBQSxDQUFNLElBQU4sQ0FBVjtBQUFBLG1CQUFBOztRQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjtRQUVMLE9BQUEsR0FBVSxFQUFFLENBQUMsYUFBSCxDQUFBO1FBQ1YsT0FBTyxDQUFDLE1BQVIsR0FBaUIsT0FBTyxDQUFDLElBQVIsR0FBZSxPQUFPLENBQUMsTUFBUixHQUFpQjtRQUVqRCxPQUFPLENBQUMsVUFBUixHQUFxQjtRQUNyQixPQUFPLENBQUMsU0FBUixHQUFxQixLQUFLLENBQUMsR0FBTixDQUFVLE9BQU8sQ0FBQyxVQUFsQjtRQUdyQixJQUFBLENBQUEsQ0FBTyxPQUFBLEtBQVcsTUFBWCxJQUFxQixPQUFPLENBQUMsTUFBN0IsSUFBdUMsT0FBTyxDQUFDLE9BQXRELENBQUE7WUFDSSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7WUFDVCxPQUFPLENBQUMsTUFBUixHQUFrQixPQUFBLEdBQVcsSUFBSSxNQUFKLENBQVcsTUFBWDtZQUM3QixPQUFPLENBQUMsT0FBUixHQUFrQixRQUFBLEdBQVcsU0FBQyxJQUFEO3VCQUFXLE1BQU0sQ0FBQyxLQUFQLENBQWEsSUFBYixFQUFtQixPQUFuQixFQUE0QixJQUE1QjtZQUFYO1lBQzdCLE9BQU8sQ0FBQyxRQUFSLEdBQW1CLE9BQU8sQ0FBQztBQUMzQjtBQUFBLGlCQUFBLHFDQUFBOztnQkFDSSxJQUFHLENBQUEsS0FBVSxPQUFWLElBQUEsQ0FBQSxLQUFrQixXQUFsQixJQUFBLENBQUEsS0FBOEIsUUFBakM7b0JBQ0ksUUFBUyxDQUFBLENBQUEsQ0FBVCxHQUFjLE9BQVEsQ0FBQSxDQUFBLEVBRDFCOztBQURKO1lBSUEsUUFBUSxDQUFDLEtBQVQsR0FBaUIsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsTUFBTSxDQUFDLGdCQUFQLENBQXdCLE9BQU8sQ0FBQyxHQUFSLENBQUEsQ0FBeEI7WUFDakMsUUFBUSxDQUFDLE9BQVQsR0FBbUIsU0FBQyxPQUFEO3VCQUFhLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixPQUF4QixFQUFpQyxPQUFqQztZQUFiLEVBVnZCOztRQVlBLEVBQUEsR0FBSyxJQUFDLENBQUEsT0FBRCxDQUFTLElBQVQ7QUFFTDtZQUNJLE9BQU8sQ0FBQyxPQUFSLEdBQWtCO21CQUNsQixFQUFFLENBQUMsWUFBSCxDQUFnQixFQUFoQixFQUFvQixPQUFwQixFQUZKO1NBQUEsYUFBQTtZQUdNO1lBQ0gsT0FBQSxDQUFDLEtBQUQsQ0FBTyxHQUFQLEVBQVksSUFBWjtBQUNDLGtCQUFNLElBTFY7O0lBM0JFOzs7Ozs7QUF3Q1YsSUFBRyxDQUFJLE1BQU0sQ0FBQyxNQUFYLElBQXFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQW5CLENBQTRCLFdBQTVCLENBQXhCO0lBRUksSUFBQSxHQUFPLElBQUEsQ0FBSyxrNEJBQUEsR0FnQkcsR0FBRyxDQUFDLE9BaEJaO0lBbUJQLElBQUEsR0FBTyxJQUFJLElBQUosQ0FBUyxJQUFUO0lBQ1AsSUFBSSxDQUFDLEdBQUwsQ0FBQSxFQXRCSjs7O0FBd0JBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4wMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4jIyNcblxuc2xhc2ggICAgPSByZXF1aXJlICdrc2xhc2gnXG5rc3RyICAgICA9IHJlcXVpcmUgJ2tzdHInXG5rbG9yICAgICA9IHJlcXVpcmUgJ2tsb3InXG5rYXJnICAgICA9IHJlcXVpcmUgJ2thcmcnXG5jaGlsZHAgICA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG5wcmludCAgICA9IHJlcXVpcmUgJy4vcHJpbnQnXG5wa2cgICAgICA9IHJlcXVpcmUgXCIje19fZGlybmFtZX0vLi4vcGFja2FnZVwiXG5lbXB0eSAgICA9IChhKSAtPiBhIGluIFsnJyBudWxsIHVuZGVmaW5lZF0gb3IgKHR5cGVvZihhKSA9PSAnb2JqZWN0JyBhbmQgT2JqZWN0LmtleXMoYSkubGVuZ3RoID09IDApXG5cbmtsb3Iua29sb3IuZ2xvYmFsaXplKClcblxuY2xhc3MgS29kZVxuXG4gICAgQDogKEBhcmdzKSAtPlxuXG4gICAgICAgIEBhcmdzID89IHt9XG5cbiAgICAgICAgaWYgQGFyZ3MudmVyYm9zZSB0aGVuIEBhcmdzLmRlYnVnID0gQGFyZ3MuYmxvY2sgPSBAYXJncy50b2tlbnMgPSBAYXJncy5wYXJzZSA9IHRydWVcblxuICAgICAgICBMZXhlciAgICAgPSByZXF1aXJlICcuL2xleGVyJ1xuICAgICAgICBQYXJzZXIgICAgPSByZXF1aXJlICcuL3BhcnNlcidcbiAgICAgICAgUmVuZGVyZXIgID0gcmVxdWlyZSAnLi9yZW5kZXJlcidcblxuICAgICAgICBAbGV4ZXIgICAgPSBuZXcgTGV4ZXJcbiAgICAgICAgQHBhcnNlciAgID0gbmV3IFBhcnNlciAgIEBhcmdzXG4gICAgICAgIEByZW5kZXJlciA9IG5ldyBSZW5kZXJlciBAXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDBcblxuICAgIGNsaTogLT5cblxuICAgICAgICAjIGlmIEBhcmdzLmRlYnVnIHRoZW4gcHJpbnQubm9vbiAnYXJncycgQGFyZ3NcblxuICAgICAgICBpZiBAYXJncy5jb21waWxlXG4gICAgICAgICAgICBsb2cgQGNvbXBpbGUgQGFyZ3MuY29tcGlsZVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGlmIEBhcmdzLmV2YWxcbiAgICAgICAgICAgIGxvZyBAZXZhbCBAYXJncy5ldmFsXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICByZXR1cm4gaWYgbm90IEBhcmdzLmZpbGVzLmxlbmd0aFxuXG4gICAgICAgIGZvciBmaWxlIGluIEBhcmdzLmZpbGVzXG5cbiAgICAgICAgICAgIGZpbGUgPSBzbGFzaC5yZXNvbHZlIGZpbGVcbiAgICAgICAgICAgIGxvZyBncmF5IGZpbGUgaWYgQGFyZ3MudmVyYm9zZVxuXG4gICAgICAgICAgICB0ZXh0ID0gc2xhc2gucmVhZFRleHQgZmlsZVxuXG4gICAgICAgICAgICBpZiBlbXB0eSB0ZXh0IHRoZW4gZXJyb3IgWTQgcjIgXCJjYW4ndCByZWFkICN7UjMgeTUgZmlsZX1cIjsgY29udGludWVcblxuICAgICAgICAgICAgY29kZSA9IEBjb21waWxlIHRleHRcblxuICAgICAgICAgICAgaWYgQGFyZ3Mub3V0cHV0XG4gICAgICAgICAgICAgICAgb3V0ID0gc2xhc2guam9pbiBAYXJncy5vdXRwdXQsIHNsYXNoLmZpbGUgZmlsZVxuICAgICAgICAgICAgICAgIG91dCA9IHNsYXNoLnN3YXBFeHQgb3V0LCAnanMnXG4gICAgICAgICAgICAgICAgbG9nICdvdXQnIG91dCBpZiBAYXJncy52ZXJib3NlXG4gICAgICAgICAgICAgICAgc2xhc2gud3JpdGVUZXh0IG91dCwgY29kZVxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwXG5cbiAgICBAY29tcGlsZTogKHRleHQpIC0+IChuZXcgS29kZSB7fSkuY29tcGlsZSB0ZXh0XG4gICAgY29tcGlsZTogKHRleHQpIC0+XG5cbiAgICAgICAgcmV0dXJuICcnIGlmIGVtcHR5IGtzdHIuc3RyaXAgdGV4dFxuXG4gICAgICAgIGFzdCA9IEBhc3QgdGV4dFxuXG4gICAgICAgIGlmIEBhcmdzLnBhcnNlIHRoZW4gcHJpbnQuYXN0ICdhc3QnIGFzdFxuXG4gICAgICAgIGpzID0gQHJlbmRlcmVyLnJlbmRlciBhc3RcblxuICAgICAgICBwcmludC5jb2RlICdqcycganMgaWYgQGFyZ3MuanMgb3IgQGFyZ3MuZGVidWdcblxuICAgICAgICBqc1xuXG4gICAgYXN0OiAodGV4dCkgLT5cblxuICAgICAgICB0ZXh0ICs9ICdcXG4nIGlmIG5vdCB0ZXh0Wy0xXSA9PSAnXFxuJ1xuXG4gICAgICAgIHByaW50LmNvZGUgJ2NvZmZlZScgdGV4dCwgJ2NvZmZlZScgaWYgQGFyZ3MudmVyYm9zZSBvciBAYXJncy5kZWJ1Z1xuXG4gICAgICAgIHRva2VucyA9IEBsZXhlci50b2tlbml6ZSB0ZXh0XG5cbiAgICAgICAgaWYgQGFyZ3MucmF3ICAgIHRoZW4gcHJpbnQubm9vbiAncmF3IHRva2VucycgdG9rZW5zXG4gICAgICAgIGlmIEBhcmdzLnRva2VucyB0aGVuIHByaW50LnRva2VucyAndG9rZW5zJyB0b2tlbnNcblxuICAgICAgICBibG9jayA9IEBsZXhlci5ibG9ja2lmeSB0b2tlbnNcblxuICAgICAgICBpZiBAYXJncy5yYXcgICB0aGVuIHByaW50Lm5vb24gJ3JhdyBibG9jaycgYmxvY2tcbiAgICAgICAgaWYgQGFyZ3MuYmxvY2sgdGhlbiBwcmludC5ibG9jayAndGwgYmxvY2snIGJsb2NrXG5cbiAgICAgICAgQHBhcnNlci5wYXJzZSBibG9ja1xuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBldmFsOiAodGV4dCkgLT5cblxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgdGV4dFxuXG4gICAgICAgIHZtID0gcmVxdWlyZSAndm0nXG5cbiAgICAgICAgc2FuZGJveCA9IHZtLmNyZWF0ZUNvbnRleHQoKVxuICAgICAgICBzYW5kYm94Lmdsb2JhbCA9IHNhbmRib3gucm9vdCA9IHNhbmRib3guR0xPQkFMID0gc2FuZGJveFxuXG4gICAgICAgIHNhbmRib3guX19maWxlbmFtZSA9ICdldmFsJ1xuICAgICAgICBzYW5kYm94Ll9fZGlybmFtZSAgPSBzbGFzaC5kaXIgc2FuZGJveC5fX2ZpbGVuYW1lXG5cbiAgICAgICAgIyBkZWZpbmUgbW9kdWxlL3JlcXVpcmUgb25seSBpZiB0aGV5IGNob3NlIG5vdCB0byBzcGVjaWZ5IHRoZWlyIG93blxuICAgICAgICB1bmxlc3Mgc2FuZGJveCAhPSBnbG9iYWwgb3Igc2FuZGJveC5tb2R1bGUgb3Igc2FuZGJveC5yZXF1aXJlXG4gICAgICAgICAgICBNb2R1bGUgPSByZXF1aXJlICdtb2R1bGUnXG4gICAgICAgICAgICBzYW5kYm94Lm1vZHVsZSAgPSBfbW9kdWxlICA9IG5ldyBNb2R1bGUgJ2V2YWwnXG4gICAgICAgICAgICBzYW5kYm94LnJlcXVpcmUgPSBfcmVxdWlyZSA9IChwYXRoKSAtPiAgTW9kdWxlLl9sb2FkIHBhdGgsIF9tb2R1bGUsIHRydWVcbiAgICAgICAgICAgIF9tb2R1bGUuZmlsZW5hbWUgPSBzYW5kYm94Ll9fZmlsZW5hbWVcbiAgICAgICAgICAgIGZvciByIGluIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHJlcXVpcmVcbiAgICAgICAgICAgICAgICBpZiByIG5vdCBpbiBbJ3BhdGhzJyAnYXJndW1lbnRzJyAnY2FsbGVyJ11cbiAgICAgICAgICAgICAgICAgICAgX3JlcXVpcmVbcl0gPSByZXF1aXJlW3JdXG4gICAgICAgICAgICAjIHVzZSB0aGUgc2FtZSBoYWNrIG5vZGUgY3VycmVudGx5IHVzZXMgZm9yIHRoZWlyIG93biBSRVBMXG4gICAgICAgICAgICBfcmVxdWlyZS5wYXRocyA9IF9tb2R1bGUucGF0aHMgPSBNb2R1bGUuX25vZGVNb2R1bGVQYXRocyBwcm9jZXNzLmN3ZCgpXG4gICAgICAgICAgICBfcmVxdWlyZS5yZXNvbHZlID0gKHJlcXVlc3QpIC0+IE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lIHJlcXVlc3QsIF9tb2R1bGVcblxuICAgICAgICBqcyA9IEBjb21waWxlIHRleHRcblxuICAgICAgICB0cnlcbiAgICAgICAgICAgIHNhbmRib3guY29uc29sZSA9IGNvbnNvbGVcbiAgICAgICAgICAgIHZtLnJ1bkluQ29udGV4dCBqcywgc2FuZGJveFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGVycm9yIGVyciwgdGV4dFxuICAgICAgICAgICAgdGhyb3cgZXJyXG5cbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuXG5pZiBub3QgbW9kdWxlLnBhcmVudCBvciBtb2R1bGUucGFyZW50LnBhdGguZW5kc1dpdGggJy9rb2RlL2JpbidcblxuICAgIGFyZ3MgPSBrYXJnIFwiXCJcIlxuICAgICAgICBrb2RlIG9wdGlvblxuICAgICAgICAgICAgZmlsZXMgICAgICAgLiAqKlxuICAgICAgICAgICAgZXZhbCAgICAgICAgLiA/IGV2YWx1YXRlIGEgc3RyaW5nIGFuZCBwcmludCB0aGUgcmVzdWx0XG4gICAgICAgICAgICBjb21waWxlICAgICAuID8gY29tcGlsZSBhIHN0cmluZyBhbmQgcHJpbnQgdGhlIHJlc3VsdFxuICAgICAgICAgICAgb3V0ZGlyICAgICAgLiA/IG91dHB1dCBkaXJlY3RvcnkgZm9yIHRyYW5zcGlsZWQgZmlsZXNcbiAgICAgICAgICAgIG1hcCAgICAgICAgIC4gPyBnZW5lcmF0ZSBpbmxpbmUgc291cmNlIG1hcHMgICAgICAgICAgICAgLiA9IHRydWVcbiAgICAgICAgICAgIGpzICAgICAgICAgIC4gPyBwcmludCB0cmFuc3BpbGVkIGpzIGNvZGUgICAgICAgICAgICAgICAgLiA9IHRydWVcbiAgICAgICAgICAgIHJ1biAgICAgICAgIC4gPyBleGVjdXRlIGZpbGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgICAgICB0b2tlbnMgICAgICAuID8gcHJpbnQgdG9rZW5zICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIFRcbiAgICAgICAgICAgIGJsb2NrICAgICAgIC4gPyBwcmludCBibG9jayB0cmVlICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gQlxuICAgICAgICAgICAgcGFyc2UgICAgICAgLiA/IHByaW50IHBhcnNlIHRyZWUgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBQXG4gICAgICAgICAgICBkZWJ1ZyAgICAgICAuID8gbG9nIGRlYnVnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIERcbiAgICAgICAgICAgIHJhdyAgICAgICAgIC4gPyBsb2cgcmF3ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gUlxuICAgICAgICAgICAgdmVyYm9zZSAgICAgLiA/IGxvZyBtb3JlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcblxuICAgICAgICB2ZXJzaW9uICAje3BrZy52ZXJzaW9ufVxuICAgICAgICBcIlwiXCJcblxuICAgIGtvZGUgPSBuZXcgS29kZSBhcmdzXG4gICAga29kZS5jbGkoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEtvZGVcblxuIl19
//# sourceURL=../coffee/kode.coffee