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

    Kode.prototype.compile = function(text, file) {
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
        js = this.renderer.render(ast, file);
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

    Kode.prototype["eval"] = function(text, file) {
        var Module, _module, _require, err, i, js, len, r, ref1, sandbox, vm;
        if (empty(text)) {
            return;
        }
        vm = require('vm');
        sandbox = vm.createContext();
        sandbox.global = global;
        sandbox.__filename = file != null ? file : 'eval';
        sandbox.__dirname = slash.dir(sandbox.__filename);
        sandbox.console = console;
        if (!(sandbox.module || sandbox.require) || file) {
            Module = require('module');
            sandbox.module = _module = new Module('eval');
            sandbox.require = _require = function(file) {
                return Module._load(file, _module, true);
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
        }
        try {
            js = this.compile(text, file);
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
            } else if (this.args.js) {
                results.push(this.compile(text));
            } else if (this.args.run) {
                results.push(this["eval"](text, file));
            } else {
                results.push(console.log(this.compile(text)));
            }
        }
        return results;
    };

    return Kode;

})();

module.exports = Kode;

if (!module.parent || slash.resolve(module.parent.path).endsWith('/kode/bin')) {
    args = karg("kode option\n    files       . **\n    eval        . ? evaluate a string and print the result\n    compile     . ? compile a string and print the result\n    outdir      . ? output directory for transpiled files\n    run         . ? execute file                            . = true\n    map         . ? generate inline source maps             . = true\n    kode        . ? pretty print input code                 . = false\n    js          . ? pretty print transpiled js code         . = false\n    header      . ? prepend output with version header      . = false  . - H\n    tokens      . ? print tokens                            . = false  . - T\n    block       . ? print block tree                        . = false  . - B\n    parse       . ? print parse tree                        . = false  . - P\n    astr        . ? print parse tree as string              . = false  . - A\n    scope       . ? print scopes                            . = false  . - S\n    verbose     . ? log more                                . = false\n    debug       . ? log debug                               . = false\n    raw         . ? log raw                                 . = false  . - R\n\nversion  " + pkg.version);
    register();
    kode = new Kode(args);
    kode.cli();
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29kZS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImtvZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEtBQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxNQUFBLEdBQVMsT0FBQSxDQUFRLGVBQVI7O0FBQ1QsS0FBQSxHQUFTLE9BQUEsQ0FBUSxTQUFSOztBQUNULEdBQUEsR0FBUyxPQUFBLENBQVcsU0FBRCxHQUFXLGFBQXJCOztBQUVULE1BQXNCLE9BQUEsQ0FBUSxTQUFSLENBQXRCLEVBQUUsaUJBQUYsRUFBUzs7QUFFVCxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVgsQ0FBQTs7QUFFTTtJQUVDLGNBQUMsS0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsT0FBRDs7WUFFQSxJQUFDLENBQUE7O1lBQUQsSUFBQyxDQUFBLE9BQVE7O1FBRVQsSUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQVQ7WUFBc0IsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLEdBQWMsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLEdBQWMsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLEdBQWUsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLEdBQWMsS0FBL0U7O1FBRUEsS0FBQSxHQUFZLE9BQUEsQ0FBUSxTQUFSO1FBQ1osTUFBQSxHQUFZLE9BQUEsQ0FBUSxVQUFSO1FBQ1osTUFBQSxHQUFZLE9BQUEsQ0FBUSxVQUFSO1FBQ1osT0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSO1FBQ1osUUFBQSxHQUFZLE9BQUEsQ0FBUSxZQUFSO1FBQ1osUUFBQSxHQUFZLE9BQUEsQ0FBUSxZQUFSO1FBRVosSUFBQyxDQUFBLEtBQUQsR0FB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QUFBLE1BRUEsSUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQVQ7NkJBQ0QsSUFBQyxFQUFBLElBQUEsRUFBRCxDQUFNLElBQU4sRUFBWSxJQUFaLEdBREM7YUFBQSxNQUFBOzZCQUdGLE9BQUEsQ0FBQyxHQUFELENBQUssSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULENBQUwsR0FIRTs7QUFsQlQ7O0lBZEM7Ozs7OztBQTJDVCxNQUFNLENBQUMsT0FBUCxHQUFpQjs7QUFFakIsSUFBRyxDQUFJLE1BQU0sQ0FBQyxNQUFYLElBQXFCLEtBQUssQ0FBQyxPQUFOLENBQWMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUE1QixDQUFpQyxDQUFDLFFBQWxDLENBQTJDLFdBQTNDLENBQXhCO0lBRUksSUFBQSxHQUFPLElBQUEsQ0FBSyw0cUNBQUEsR0FvQkcsR0FBRyxDQUFDLE9BcEJaO0lBdUJQLFFBQUEsQ0FBQTtJQUNBLElBQUEsR0FBTyxJQUFJLElBQUosQ0FBUyxJQUFUO0lBQ1AsSUFBSSxDQUFDLEdBQUwsQ0FBQSxFQTNCSiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuIyMjXG5cbnNsYXNoICA9IHJlcXVpcmUgJ2tzbGFzaCdcbmtzdHIgICA9IHJlcXVpcmUgJ2tzdHInXG5rbG9yICAgPSByZXF1aXJlICdrbG9yJ1xua2FyZyAgID0gcmVxdWlyZSAna2FyZydcbmNoaWxkcCA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG5wcmludCAgPSByZXF1aXJlICcuL3ByaW50J1xucGtnICAgID0gcmVxdWlyZSBcIiN7X19kaXJuYW1lfS8uLi9wYWNrYWdlXCJcblxueyBlbXB0eSwgcmVnaXN0ZXIgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmtsb3Iua29sb3IuZ2xvYmFsaXplKClcblxuY2xhc3MgS29kZVxuXG4gICAgQDogKEBhcmdzKSAtPlxuXG4gICAgICAgIEBhcmdzID89IHt9XG5cbiAgICAgICAgaWYgQGFyZ3MudmVyYm9zZSB0aGVuIEBhcmdzLmRlYnVnID0gQGFyZ3MuYmxvY2sgPSBAYXJncy50b2tlbnMgPSBAYXJncy5wYXJzZSA9IHRydWVcblxuICAgICAgICBMZXhlciAgICAgPSByZXF1aXJlICcuL2xleGVyJ1xuICAgICAgICBQYXJzZXIgICAgPSByZXF1aXJlICcuL3BhcnNlcidcbiAgICAgICAgU2NvcGVyICAgID0gcmVxdWlyZSAnLi9zY29wZXInXG4gICAgICAgIFN0cmlwb2wgICA9IHJlcXVpcmUgJy4vc3RyaXBvbCdcbiAgICAgICAgUmV0dXJuZXIgID0gcmVxdWlyZSAnLi9yZXR1cm5lcidcbiAgICAgICAgUmVuZGVyZXIgID0gcmVxdWlyZSAnLi9yZW5kZXJlcidcblxuICAgICAgICBAbGV4ZXIgICAgPSBuZXcgTGV4ZXIgICAgQFxuICAgICAgICBAcGFyc2VyICAgPSBuZXcgUGFyc2VyICAgQFxuICAgICAgICBAc2NvcGVyICAgPSBuZXcgU2NvcGVyICAgQFxuICAgICAgICBAc3RyaXBvbCAgPSBuZXcgU3RyaXBvbCAgQFxuICAgICAgICBAcmV0dXJuZXIgPSBuZXcgUmV0dXJuZXIgQFxuICAgICAgICBAcmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIgQFxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwXG5cbiAgICBAY29tcGlsZTogKHRleHQsIG9wdD17fSkgLT4gKG5ldyBLb2RlIG9wdCkuY29tcGlsZSB0ZXh0XG4gICAgY29tcGlsZTogKHRleHQsIGZpbGUpIC0+XG5cbiAgICAgICAgcmV0dXJuICcnIGlmIGVtcHR5IGtzdHIuc3RyaXAgdGV4dFxuXG4gICAgICAgIGFzdCA9IEBhc3QgdGV4dFxuXG4gICAgICAgIGlmIEBhcmdzLnBhcnNlIHRoZW4gcHJpbnQuYXN0ICdhc3QnIGFzdFxuICAgICAgICBpZiBAYXJncy5hc3RyICB0aGVuIGxvZyBwcmludC5hc3RyIGFzdCwgQGFyZ3Muc2NvcGVcblxuICAgICAgICBqcyA9IEByZW5kZXJlci5yZW5kZXIgYXN0LCBmaWxlXG5cbiAgICAgICAgaWYgQGFyZ3MuaGVhZGVyIGFuZCBrc3RyLnN0cmlwKGpzKS5sZW5ndGhcbiAgICAgICAgICAgIGpzID0gXCIvLyBtb25zdGVya29kaS9rb2RlICN7cGtnLnZlcnNpb259XFxuXFxuXCIgKyBqc1xuXG4gICAgICAgIGlmIEBhcmdzLmpzIG9yIEBhcmdzLmRlYnVnXG4gICAgICAgICAgICBwcmludC5jb2RlICdqcycganMgXG4gICAgICAgIGpzXG5cbiAgICBhc3Q6ICh0ZXh0KSAtPlxuXG4gICAgICAgIHRleHQgKz0gJ1xcbicgaWYgbm90IHRleHRbLTFdID09ICdcXG4nXG5cbiAgICAgICAgcHJpbnQuY29kZSAna29kZScgdGV4dCwgJ2NvZmZlZScgaWYgQGFyZ3MudmVyYm9zZSBvciBAYXJncy5kZWJ1ZyBvciBAYXJncy5rb2RlXG5cbiAgICAgICAgdG9rZW5zID0gQGxleGVyLnRva2VuaXplIHRleHRcblxuICAgICAgICBpZiBAYXJncy5yYXcgICAgdGhlbiBwcmludC5ub29uICdyYXcgdG9rZW5zJyB0b2tlbnNcbiAgICAgICAgaWYgQGFyZ3MudG9rZW5zIHRoZW4gcHJpbnQudG9rZW5zICd0b2tlbnMnIHRva2Vuc1xuXG4gICAgICAgIGJsb2NrID0gQGxleGVyLmJsb2NraWZ5IHRva2Vuc1xuXG4gICAgICAgIGlmIEBhcmdzLnJhdyAgIHRoZW4gcHJpbnQubm9vbiAncmF3IGJsb2NrJyBibG9ja1xuICAgICAgICBpZiBAYXJncy5ibG9jayB0aGVuIHByaW50LmJsb2NrICd0bCBibG9jaycgYmxvY2tcblxuICAgICAgICBAcmV0dXJuZXIuY29sbGVjdCBAc2NvcGVyLmNvbGxlY3QgQHN0cmlwb2wuY29sbGVjdCBAcGFyc2VyLnBhcnNlIGJsb2NrXG5cbiAgICBhc3RyOiAodGV4dCwgc2NvcGVzKSAtPiBwcmludC5hc3RyIEBhc3QodGV4dCksIHNjb3Blc1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwMCAgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGV2YWw6ICh0ZXh0LCBmaWxlKSAtPlxuXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0ZXh0XG5cbiAgICAgICAgdm0gPSByZXF1aXJlICd2bSdcblxuICAgICAgICBzYW5kYm94ID0gdm0uY3JlYXRlQ29udGV4dCgpXG4gICAgICAgIHNhbmRib3guZ2xvYmFsID0gZ2xvYmFsXG5cbiAgICAgICAgc2FuZGJveC5fX2ZpbGVuYW1lID0gZmlsZSA/ICdldmFsJ1xuICAgICAgICBzYW5kYm94Ll9fZGlybmFtZSAgPSBzbGFzaC5kaXIgc2FuZGJveC5fX2ZpbGVuYW1lXG4gICAgICAgIHNhbmRib3guY29uc29sZSAgICA9IGNvbnNvbGVcblxuICAgICAgICBpZiBub3QgKHNhbmRib3gubW9kdWxlIG9yIHNhbmRib3gucmVxdWlyZSkgb3IgZmlsZVxuICAgICAgICAgICAgTW9kdWxlID0gcmVxdWlyZSAnbW9kdWxlJ1xuICAgICAgICAgICAgc2FuZGJveC5tb2R1bGUgID0gX21vZHVsZSAgPSBuZXcgTW9kdWxlICdldmFsJ1xuICAgICAgICAgICAgc2FuZGJveC5yZXF1aXJlID0gX3JlcXVpcmUgPSAoZmlsZSkgLT4gTW9kdWxlLl9sb2FkIGZpbGUsIF9tb2R1bGUsIHRydWVcbiAgICAgICAgICAgIF9tb2R1bGUuZmlsZW5hbWUgPSBzYW5kYm94Ll9fZmlsZW5hbWVcbiAgICAgICAgICAgIGZvciByIGluIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHJlcXVpcmVcbiAgICAgICAgICAgICAgICBpZiByIG5vdCBpbiBbJ3BhdGhzJyAnYXJndW1lbnRzJyAnY2FsbGVyJ11cbiAgICAgICAgICAgICAgICAgICAgX3JlcXVpcmVbcl0gPSByZXF1aXJlW3JdXG5cbiAgICAgICAgICAgIF9yZXF1aXJlLnBhdGhzID0gX21vZHVsZS5wYXRocyA9IE1vZHVsZS5fbm9kZU1vZHVsZVBhdGhzIHByb2Nlc3MuY3dkKClcbiAgICAgICAgICAgIF9yZXF1aXJlLnJlc29sdmUgPSAocmVxdWVzdCkgLT4gTW9kdWxlLl9yZXNvbHZlRmlsZW5hbWUgcmVxdWVzdCwgX21vZHVsZVxuXG4gICAgICAgIHRyeVxuICAgICAgICAgICAganMgPSBAY29tcGlsZSB0ZXh0LCBmaWxlXG4gICAgICAgICAgICB2bS5ydW5JbkNvbnRleHQganMsIHNhbmRib3hcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBlcnJvciBlcnIsIHRleHRcbiAgICAgICAgICAgIHRocm93IGVyclxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwXG5cbiAgICBjbGk6IC0+XG5cbiAgICAgICAgIyBpZiBAYXJncy5kZWJ1ZyB0aGVuIHByaW50Lm5vb24gJ2FyZ3MnIEBhcmdzXG5cbiAgICAgICAgaWYgQGFyZ3MuY29tcGlsZVxuICAgICAgICAgICAgbG9nIEBjb21waWxlIEBhcmdzLmNvbXBpbGVcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBhcmdzLmV2YWxcbiAgICAgICAgICAgIGxvZyBAZXZhbCBAYXJncy5ldmFsXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICByZXR1cm4gaWYgbm90IEBhcmdzLmZpbGVzLmxlbmd0aFxuXG4gICAgICAgIGZvciBmaWxlIGluIEBhcmdzLmZpbGVzXG5cbiAgICAgICAgICAgIGZpbGUgPSBzbGFzaC5yZXNvbHZlIGZpbGVcbiAgICAgICAgICAgIGxvZyBncmF5IGZpbGUgaWYgQGFyZ3MudmVyYm9zZVxuXG4gICAgICAgICAgICB0ZXh0ID0gc2xhc2gucmVhZFRleHQgZmlsZVxuXG4gICAgICAgICAgICBpZiBlbXB0eSB0ZXh0IHRoZW4gZXJyb3IgWTQgcjIgXCJjYW4ndCByZWFkICN7UjMgeTUgZmlsZX1cIjsgY29udGludWVcblxuICAgICAgICAgICAgaWYgQGFyZ3Mub3V0ZGlyXG4gICAgICAgICAgICAgICAganMgPSBAY29tcGlsZSB0ZXh0XG4gICAgICAgICAgICAgICAgb3V0ID0gc2xhc2gucmVzb2x2ZSBAYXJncy5vdXRkaXIsIHNsYXNoLmZpbGUgZmlsZVxuICAgICAgICAgICAgICAgIG91dCA9IHNsYXNoLnN3YXBFeHQgb3V0LCAnanMnXG4gICAgICAgICAgICAgICAganMgID0gXCIvLyBrb2RlICN7cGtnLnZlcnNpb259XFxuXFxuXCIgKyBqc1xuICAgICAgICAgICAgICAgIGlmIG5vdCBzbGFzaC53cml0ZVRleHQgb3V0LCBqc1xuICAgICAgICAgICAgICAgICAgICBlcnJvciBSMiB5MyBcImNhbid0IHdyaXRlICN7UjMgeTYgb3V0fVwiXG4gICAgICAgICAgICBlbHNlIGlmIEBhcmdzLmpzXG4gICAgICAgICAgICAgICAgQGNvbXBpbGUgdGV4dFxuICAgICAgICAgICAgZWxzZSBpZiBAYXJncy5ydW5cbiAgICAgICAgICAgICAgICBAZXZhbCB0ZXh0LCBmaWxlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbG9nIEBjb21waWxlIHRleHRcbiAgICAgICAgICAgIFxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG5cbm1vZHVsZS5leHBvcnRzID0gS29kZVxuXG5pZiBub3QgbW9kdWxlLnBhcmVudCBvciBzbGFzaC5yZXNvbHZlKG1vZHVsZS5wYXJlbnQucGF0aCkuZW5kc1dpdGggJy9rb2RlL2JpbidcblxuICAgIGFyZ3MgPSBrYXJnIFwiXCJcIlxuICAgICAgICBrb2RlIG9wdGlvblxuICAgICAgICAgICAgZmlsZXMgICAgICAgLiAqKlxuICAgICAgICAgICAgZXZhbCAgICAgICAgLiA/IGV2YWx1YXRlIGEgc3RyaW5nIGFuZCBwcmludCB0aGUgcmVzdWx0XG4gICAgICAgICAgICBjb21waWxlICAgICAuID8gY29tcGlsZSBhIHN0cmluZyBhbmQgcHJpbnQgdGhlIHJlc3VsdFxuICAgICAgICAgICAgb3V0ZGlyICAgICAgLiA/IG91dHB1dCBkaXJlY3RvcnkgZm9yIHRyYW5zcGlsZWQgZmlsZXNcbiAgICAgICAgICAgIHJ1biAgICAgICAgIC4gPyBleGVjdXRlIGZpbGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IHRydWVcbiAgICAgICAgICAgIG1hcCAgICAgICAgIC4gPyBnZW5lcmF0ZSBpbmxpbmUgc291cmNlIG1hcHMgICAgICAgICAgICAgLiA9IHRydWVcbiAgICAgICAgICAgIGtvZGUgICAgICAgIC4gPyBwcmV0dHkgcHJpbnQgaW5wdXQgY29kZSAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgICAgICBqcyAgICAgICAgICAuID8gcHJldHR5IHByaW50IHRyYW5zcGlsZWQganMgY29kZSAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICAgICAgaGVhZGVyICAgICAgLiA/IHByZXBlbmQgb3V0cHV0IHdpdGggdmVyc2lvbiBoZWFkZXIgICAgICAuID0gZmFsc2UgIC4gLSBIXG4gICAgICAgICAgICB0b2tlbnMgICAgICAuID8gcHJpbnQgdG9rZW5zICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIFRcbiAgICAgICAgICAgIGJsb2NrICAgICAgIC4gPyBwcmludCBibG9jayB0cmVlICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gQlxuICAgICAgICAgICAgcGFyc2UgICAgICAgLiA/IHByaW50IHBhcnNlIHRyZWUgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBQXG4gICAgICAgICAgICBhc3RyICAgICAgICAuID8gcHJpbnQgcGFyc2UgdHJlZSBhcyBzdHJpbmcgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIEFcbiAgICAgICAgICAgIHNjb3BlICAgICAgIC4gPyBwcmludCBzY29wZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gU1xuICAgICAgICAgICAgdmVyYm9zZSAgICAgLiA/IGxvZyBtb3JlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgICAgIGRlYnVnICAgICAgIC4gPyBsb2cgZGVidWcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgICAgICByYXcgICAgICAgICAuID8gbG9nIHJhdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIFJcblxuICAgICAgICB2ZXJzaW9uICAje3BrZy52ZXJzaW9ufVxuICAgICAgICBcIlwiXCJcblxuICAgIHJlZ2lzdGVyKClcbiAgICBrb2RlID0gbmV3IEtvZGUgYXJnc1xuICAgIGtvZGUuY2xpKClcbiJdfQ==
//# sourceURL=../coffee/kode.coffee