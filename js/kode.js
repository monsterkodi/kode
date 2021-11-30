// koffee 1.14.0

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
        var err, js, sandbox, vm;
        if (empty(text)) {
            return;
        }
        vm = require('vm');
        sandbox = vm.createContext();
        sandbox.__filename = 'eval';
        sandbox.__dirname = slash.dir(sandbox.__filename);
        sandbox.console = console;
        try {
            js = this.compile(text);
            return vm.runInContext(js, sandbox);
        } catch (error) {
            err = error;
            console.error(err, text);
            throw err;
        }
    };

    return Kode;

})();

if (!module.parent || slash.resolve(module.parent.path).endsWith('/kode/bin')) {
    args = karg("kode option\n    files       . **\n    eval        . ? evaluate a string and print the result\n    compile     . ? compile a string and print the result\n    outdir      . ? output directory for transpiled files\n    map         . ? generate inline source maps             . = true\n    kode        . ? pretty print input code                 . = false\n    js          . ? pretty print transpiled js code         . = false\n    run         . ? execute file                            . = false\n    tokens      . ? print tokens                            . = false  . - T\n    block       . ? print block tree                        . = false  . - B\n    parse       . ? print parse tree                        . = false  . - P\n    astr        . ? print parse tree as string              . = false  . - A\n    scope       . ? print scopes                            . = false  . - S\n    verbose     . ? log more                                . = false\n    debug       . ? log debug                               . = false\n    raw         . ? log raw                                 . = false  . - R\n\nversion  " + pkg.version);
    kode = new Kode(args);
    kode.cli();
}

module.exports = Kode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29kZS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImtvZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEtBQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxNQUFBLEdBQVMsT0FBQSxDQUFRLGVBQVI7O0FBQ1QsS0FBQSxHQUFTLE9BQUEsQ0FBUSxTQUFSOztBQUNULEdBQUEsR0FBUyxPQUFBLENBQVcsU0FBRCxHQUFXLGFBQXJCOztBQUVQLFFBQVUsT0FBQSxDQUFRLFNBQVI7O0FBRVosSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFYLENBQUE7O0FBRU07SUFFQyxjQUFDLEtBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7O1lBRUEsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFROztRQUVULElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFUO1lBQXNCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixHQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLEtBQS9FOztRQUVBLEtBQUEsR0FBWSxPQUFBLENBQVEsU0FBUjtRQUNaLE1BQUEsR0FBWSxPQUFBLENBQVEsVUFBUjtRQUNaLE1BQUEsR0FBWSxPQUFBLENBQVEsVUFBUjtRQUNaLFFBQUEsR0FBWSxPQUFBLENBQVEsWUFBUjtRQUNaLFFBQUEsR0FBWSxPQUFBLENBQVEsWUFBUjtRQUVaLElBQUMsQ0FBQSxLQUFELEdBQVksSUFBSSxLQUFKLENBQWEsSUFBYjtRQUNaLElBQUMsQ0FBQSxNQUFELEdBQVksSUFBSSxN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QTJDLFdBQTNDLENBQXhCO0lBRUksSUFBQSxHQUFPLElBQUEsQ0FBSywrbENBQUEsR0FtQkcsR0FBRyxDQUFDLE9BbkJaO0lBc0JQLElBQUEsR0FBTyxJQUFJLElBQUosQ0FBUyxJQUFUO0lBQ1AsSUFBSSxDQUFDLEdBQUwsQ0FBQSxFQXpCSjs7O0FBMkJBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4wMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4jIyNcblxuc2xhc2ggID0gcmVxdWlyZSAna3NsYXNoJ1xua3N0ciAgID0gcmVxdWlyZSAna3N0cidcbmtsb3IgICA9IHJlcXVpcmUgJ2tsb3InXG5rYXJnICAgPSByZXF1aXJlICdrYXJnJ1xuY2hpbGRwID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbnByaW50ICA9IHJlcXVpcmUgJy4vcHJpbnQnXG5wa2cgICAgPSByZXF1aXJlIFwiI3tfX2Rpcm5hbWV9Ly4uL3BhY2thZ2VcIlxuXG57IGVtcHR5IH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5rbG9yLmtvbG9yLmdsb2JhbGl6ZSgpXG5cbmNsYXNzIEtvZGVcblxuICAgIEA6IChAYXJncykgLT5cblxuICAgICAgICBAYXJncyA/PSB7fVxuXG4gICAgICAgIGlmIEBhcmdzLnZlcmJvc2UgdGhlbiBAYXJncy5kZWJ1ZyA9IEBhcmdzLmJsb2NrID0gQGFyZ3MudG9rZW5zID0gQGFyZ3MucGFyc2UgPSB0cnVlXG5cbiAgICAgICAgTGV4ZXIgICAgID0gcmVxdWlyZSAnLi9sZXhlcidcbiAgICAgICAgUGFyc2VyICAgID0gcmVxdWlyZSAnLi9wYXJzZXInXG4gICAgICAgIFNjb3BlciAgICA9IHJlcXVpcmUgJy4vc2NvcGVyJ1xuICAgICAgICBSZXR1cm5lciAgPSByZXF1aXJlICcuL3JldHVybmVyJ1xuICAgICAgICBSZW5kZXJlciAgPSByZXF1aXJlICcuL3JlbmRlcmVyJ1xuXG4gICAgICAgIEBsZXhlciAgICA9IG5ldyBMZXhlciAgICBAXG4gICAgICAgIEBwYXJzZXIgICA9IG5ldyBQYXJzZXIgICBAXG4gICAgICAgIEBzY29wZXIgICA9IG5ldyBTY29wZXIgICBAXG4gICAgICAgIEByZXR1cm5lciA9IG5ldyBSZXR1cm5lciBAXG4gICAgICAgIEByZW5kZXJlciA9IG5ldyBSZW5kZXJlciBAXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDBcblxuICAgIGNsaTogLT5cblxuICAgICAgICAjIGlmIEBhcmdzLmRlYnVnIHRoZW4gcHJpbnQubm9vbiAnYXJncycgQGFyZ3NcblxuICAgICAgICBpZiBAYXJncy5jb21waWxlXG4gICAgICAgICAgICBsb2cgQGNvbXBpbGUgQGFyZ3MuY29tcGlsZVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGlmIEBhcmdzLmV2YWxcbiAgICAgICAgICAgIGxvZyBAZXZhbCBAYXJncy5ldmFsXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICByZXR1cm4gaWYgbm90IEBhcmdzLmZpbGVzLmxlbmd0aFxuXG4gICAgICAgIGZvciBmaWxlIGluIEBhcmdzLmZpbGVzXG5cbiAgICAgICAgICAgIGZpbGUgPSBzbGFzaC5yZXNvbHZlIGZpbGVcbiAgICAgICAgICAgIGxvZyBncmF5IGZpbGUgaWYgQGFyZ3MudmVyYm9zZVxuXG4gICAgICAgICAgICB0ZXh0ID0gc2xhc2gucmVhZFRleHQgZmlsZVxuXG4gICAgICAgICAgICBpZiBlbXB0eSB0ZXh0IHRoZW4gZXJyb3IgWTQgcjIgXCJjYW4ndCByZWFkICN7UjMgeTUgZmlsZX1cIjsgY29udGludWVcblxuICAgICAgICAgICAganMgPSBAY29tcGlsZSB0ZXh0XG5cbiAgICAgICAgICAgIGlmIEBhcmdzLm91dGRpclxuICAgICAgICAgICAgICAgIG91dCA9IHNsYXNoLnJlc29sdmUgQGFyZ3Mub3V0ZGlyLCBzbGFzaC5maWxlIGZpbGVcbiAgICAgICAgICAgICAgICBvdXQgPSBzbGFzaC5zd2FwRXh0IG91dCwgJ2pzJ1xuICAgICAgICAgICAgICAgIGpzICA9IFwiLy8ga29kZSAje3BrZy52ZXJzaW9ufVxcblxcblwiICsganNcbiAgICAgICAgICAgICAgICBpZiBub3Qgc2xhc2gud3JpdGVUZXh0IG91dCwganNcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgUjIgeTMgXCJjYW4ndCB3cml0ZSAje1IzIHk2IG91dH1cIlxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIG5vdCBhcmdzLmpzXG4gICAgICAgICAgICAgICAgICAgIGxvZyBqc1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwXG5cbiAgICBAY29tcGlsZTogKHRleHQpIC0+IChuZXcgS29kZSB7fSkuY29tcGlsZSB0ZXh0XG4gICAgY29tcGlsZTogKHRleHQpIC0+XG5cbiAgICAgICAgcmV0dXJuICcnIGlmIGVtcHR5IGtzdHIuc3RyaXAgdGV4dFxuXG4gICAgICAgIGFzdCA9IEBhc3QgdGV4dFxuXG4gICAgICAgIGlmIEBhcmdzLnBhcnNlIHRoZW4gcHJpbnQuYXN0ICdhc3QnIGFzdFxuICAgICAgICBpZiBAYXJncy5hc3RyICB0aGVuIGxvZyBwcmludC5hc3RyIGFzdCwgQGFyZ3Muc2NvcGVcblxuICAgICAgICBqcyA9IEByZW5kZXJlci5yZW5kZXIgYXN0XG5cbiAgICAgICAgaWYgQGFyZ3MuanMgb3IgQGFyZ3MuZGVidWdcbiAgICAgICAgICAgIHByaW50LmNvZGUgJ2pzJyBqcyBcbiAgICAgICAganNcblxuICAgIGFzdDogKHRleHQpIC0+XG5cbiAgICAgICAgdGV4dCArPSAnXFxuJyBpZiBub3QgdGV4dFstMV0gPT0gJ1xcbidcblxuICAgICAgICBwcmludC5jb2RlICdrb2RlJyB0ZXh0LCAnY29mZmVlJyBpZiBAYXJncy52ZXJib3NlIG9yIEBhcmdzLmRlYnVnIG9yIEBhcmdzLmtvZGVcblxuICAgICAgICB0b2tlbnMgPSBAbGV4ZXIudG9rZW5pemUgdGV4dFxuXG4gICAgICAgIGlmIEBhcmdzLnJhdyAgICB0aGVuIHByaW50Lm5vb24gJ3JhdyB0b2tlbnMnIHRva2Vuc1xuICAgICAgICBpZiBAYXJncy50b2tlbnMgdGhlbiBwcmludC50b2tlbnMgJ3Rva2VucycgdG9rZW5zXG5cbiAgICAgICAgYmxvY2sgPSBAbGV4ZXIuYmxvY2tpZnkgdG9rZW5zXG5cbiAgICAgICAgaWYgQGFyZ3MucmF3ICAgdGhlbiBwcmludC5ub29uICdyYXcgYmxvY2snIGJsb2NrXG4gICAgICAgIGlmIEBhcmdzLmJsb2NrIHRoZW4gcHJpbnQuYmxvY2sgJ3RsIGJsb2NrJyBibG9ja1xuXG4gICAgICAgIEByZXR1cm5lci5jb2xsZWN0IEBzY29wZXIuY29sbGVjdCBAcGFyc2VyLnBhcnNlIGJsb2NrXG5cbiAgICBhc3RyOiAodGV4dCwgc2NvcGVzKSAtPiBwcmludC5hc3RyIEBhc3QodGV4dCksIHNjb3Blc1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwMCAgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGV2YWw6ICh0ZXh0KSAtPlxuXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0ZXh0XG5cbiAgICAgICAgdm0gPSByZXF1aXJlICd2bSdcblxuICAgICAgICBzYW5kYm94ID0gdm0uY3JlYXRlQ29udGV4dCgpXG4gICAgICAgICMgc2FuZGJveC5nbG9iYWwgPSBzYW5kYm94LnJvb3QgPSBzYW5kYm94LkdMT0JBTCA9IHNhbmRib3hcblxuICAgICAgICBzYW5kYm94Ll9fZmlsZW5hbWUgPSAnZXZhbCdcbiAgICAgICAgc2FuZGJveC5fX2Rpcm5hbWUgID0gc2xhc2guZGlyIHNhbmRib3guX19maWxlbmFtZVxuICAgICAgICBzYW5kYm94LmNvbnNvbGUgICAgPSBjb25zb2xlXG5cbiAgICAgICAgIyBkZWZpbmUgbW9kdWxlL3JlcXVpcmUgb25seSBpZiB0aGV5IGNob3NlIG5vdCB0byBzcGVjaWZ5IHRoZWlyIG93blxuICAgICAgICAjIGlmIG5vdCAoc2FuZGJveCAhPSBnbG9iYWwgb3Igc2FuZGJveC5tb2R1bGUgb3Igc2FuZGJveC5yZXF1aXJlKVxuICAgICAgICAgICAgIyBNb2R1bGUgPSByZXF1aXJlICdtb2R1bGUnXG4gICAgICAgICAgICAjIHNhbmRib3gubW9kdWxlICA9IF9tb2R1bGUgID0gbmV3IE1vZHVsZSAnZXZhbCdcbiAgICAgICAgICAgICMgc2FuZGJveC5yZXF1aXJlID0gX3JlcXVpcmUgPSAocGF0aCkgLT4gIE1vZHVsZS5fbG9hZCBwYXRoLCBfbW9kdWxlLCB0cnVlXG4gICAgICAgICAgICAjIF9tb2R1bGUuZmlsZW5hbWUgPSBzYW5kYm94Ll9fZmlsZW5hbWVcbiAgICAgICAgICAgICMgZm9yIHIgaW4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgcmVxdWlyZVxuICAgICAgICAgICAgICAgICMgaWYgciBub3QgaW4gWydwYXRocycgJ2FyZ3VtZW50cycgJ2NhbGxlciddXG4gICAgICAgICAgICAgICAgICAgICMgX3JlcXVpcmVbcl0gPSByZXF1aXJlW3JdXG4gICAgICAgICAgICAjICMgdXNlIHRoZSBzYW1lIGhhY2sgbm9kZSBjdXJyZW50bHkgdXNlcyBmb3IgdGhlaXIgb3duIFJFUExcbiAgICAgICAgICAgICMgX3JlcXVpcmUucGF0aHMgPSBfbW9kdWxlLnBhdGhzID0gTW9kdWxlLl9ub2RlTW9kdWxlUGF0aHMgcHJvY2Vzcy5jd2QoKVxuICAgICAgICAgICAgIyBfcmVxdWlyZS5yZXNvbHZlID0gKHJlcXVlc3QpIC0+IE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lIHJlcXVlc3QsIF9tb2R1bGVcblxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGpzID0gQGNvbXBpbGUgdGV4dFxuICAgICAgICAgICAgdm0ucnVuSW5Db250ZXh0IGpzLCBzYW5kYm94XG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgZXJyb3IgZXJyLCB0ZXh0XG4gICAgICAgICAgICB0aHJvdyBlcnJcblxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG5cbmlmIG5vdCBtb2R1bGUucGFyZW50IG9yIHNsYXNoLnJlc29sdmUobW9kdWxlLnBhcmVudC5wYXRoKS5lbmRzV2l0aCAnL2tvZGUvYmluJ1xuXG4gICAgYXJncyA9IGthcmcgXCJcIlwiXG4gICAgICAgIGtvZGUgb3B0aW9uXG4gICAgICAgICAgICBmaWxlcyAgICAgICAuICoqXG4gICAgICAgICAgICBldmFsICAgICAgICAuID8gZXZhbHVhdGUgYSBzdHJpbmcgYW5kIHByaW50IHRoZSByZXN1bHRcbiAgICAgICAgICAgIGNvbXBpbGUgICAgIC4gPyBjb21waWxlIGEgc3RyaW5nIGFuZCBwcmludCB0aGUgcmVzdWx0XG4gICAgICAgICAgICBvdXRkaXIgICAgICAuID8gb3V0cHV0IGRpcmVjdG9yeSBmb3IgdHJhbnNwaWxlZCBmaWxlc1xuICAgICAgICAgICAgbWFwICAgICAgICAgLiA/IGdlbmVyYXRlIGlubGluZSBzb3VyY2UgbWFwcyAgICAgICAgICAgICAuID0gdHJ1ZVxuICAgICAgICAgICAga29kZSAgICAgICAgLiA/IHByZXR0eSBwcmludCBpbnB1dCBjb2RlICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgICAgIGpzICAgICAgICAgIC4gPyBwcmV0dHkgcHJpbnQgdHJhbnNwaWxlZCBqcyBjb2RlICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgICAgICBydW4gICAgICAgICAuID8gZXhlY3V0ZSBmaWxlICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICAgICAgdG9rZW5zICAgICAgLiA/IHByaW50IHRva2VucyAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBUXG4gICAgICAgICAgICBibG9jayAgICAgICAuID8gcHJpbnQgYmxvY2sgdHJlZSAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIEJcbiAgICAgICAgICAgIHBhcnNlICAgICAgIC4gPyBwcmludCBwYXJzZSB0cmVlICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlICAuIC0gUFxuICAgICAgICAgICAgYXN0ciAgICAgICAgLiA/IHByaW50IHBhcnNlIHRyZWUgYXMgc3RyaW5nICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBBXG4gICAgICAgICAgICBzY29wZSAgICAgICAuID8gcHJpbnQgc2NvcGVzICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAgLiAtIFNcbiAgICAgICAgICAgIHZlcmJvc2UgICAgIC4gPyBsb2cgbW9yZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgICAgICBkZWJ1ZyAgICAgICAuID8gbG9nIGRlYnVnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICAgICAgcmF3ICAgICAgICAgLiA/IGxvZyByYXcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgIC4gLSBSXG5cbiAgICAgICAgdmVyc2lvbiAgI3twa2cudmVyc2lvbn1cbiAgICAgICAgXCJcIlwiXG5cbiAgICBrb2RlID0gbmV3IEtvZGUgYXJnc1xuICAgIGtvZGUuY2xpKClcblxubW9kdWxlLmV4cG9ydHMgPSBLb2RlXG5cbiJdfQ==
//# sourceURL=../coffee/kode.coffee