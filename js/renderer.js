// koffee 1.20.0

/*
00000000   00000000  000   000  0000000    00000000  00000000   00000000  00000000
000   000  000       0000  000  000   000  000       000   000  000       000   000
0000000    0000000   000 0 000  000   000  0000000   0000000    0000000   0000000
000   000  000       000  0000  000   000  000       000   000  000       000   000
000   000  00000000  000   000  0000000    00000000  000   000  00000000  000   000
 */
var Renderer, empty, firstLineCol, kstr, lastLineCol, print, ref,
    indexOf = [].indexOf;

kstr = require('kstr');

print = require('./print');

ref = require('./utils'), firstLineCol = ref.firstLineCol, lastLineCol = ref.lastLineCol, empty = ref.empty;

Renderer = (function() {
    function Renderer(kode) {
        var ref1, ref2;
        this.kode = kode;
        this.debug = (ref1 = this.kode.args) != null ? ref1.debug : void 0;
        this.verbose = (ref2 = this.kode.args) != null ? ref2.verbose : void 0;
    }

    Renderer.prototype.render = function(ast) {
        var s;
        this.indent = '';
        s = '';
        s += ast.exps.map((function(_this) {
            return function(s) {
                return _this.node(s);
            };
        })(this)).join('\n');
        return s;
    };

    Renderer.prototype.nodes = function(nodes, sep) {
        var ss;
        if (sep == null) {
            sep = ',';
        }
        ss = nodes.map((function(_this) {
            return function(s) {
                return _this.node(s);
            };
        })(this));
        return ss.join(sep);
    };

    Renderer.prototype.node = function(exp) {
        var a, k, s, v;
        if (!exp) {
            return '';
        }
        if ((exp.type != null) && (exp.text != null)) {
            return this.token(exp);
        }
        if (exp instanceof Array) {
            return ((function() {
                var i, len, results;
                results = [];
                for (i = 0, len = exp.length; i < len; i++) {
                    a = exp[i];
                    results.push(this.node(a));
                }
                return results;
            }).call(this)).join(';\n');
        }
        s = '';
        for (k in exp) {
            v = exp[k];
            s += (function() {
                switch (k) {
                    case 'if':
                        return this["if"](v);
                    case 'for':
                        return this["for"](v);
                    case 'while':
                        return this["while"](v);
                    case 'return':
                        return this["return"](v);
                    case 'class':
                        return this["class"](v);
                    case 'switch':
                        return this["switch"](v);
                    case 'when':
                        return this.when(v);
                    case 'operation':
                        return this.operation(v);
                    case 'incond':
                        return this.incond(v);
                    case 'parens':
                        return this.parens(v);
                    case 'object':
                        return this.object(v);
                    case 'keyval':
                        return this.keyval(v);
                    case 'array':
                        return this.array(v);
                    case 'index':
                        return this.index(v);
                    case 'slice':
                        return this.slice(v);
                    case 'prop':
                        return this.prop(v);
                    case 'func':
                        return this.func(v);
                    case 'call':
                        return this.call(v);
                    case 'var':
                        return v.text;
                    default:
                        console.log(R4("renderer.node unhandled key " + k + " in exp"), exp);
                        return '';
                }
            }).call(this);
        }
        return s;
    };

    Renderer.prototype["class"] = function(n) {
        var i, len, m, mthds, ref1, ref2, ref3, ref4, ref5, ref6, s;
        s = '';
        s += "class " + n.name.text;
        if (n["extends"]) {
            s += " extends " + n["extends"].map(function(e) {
                return e.text;
            }).join(', ');
        }
        s += '\n{';
        mthds = (ref1 = (ref2 = n.body) != null ? (ref3 = ref2.object) != null ? ref3.keyvals : void 0 : void 0) != null ? ref1 : (ref4 = n.body) != null ? (ref5 = ref4[0]) != null ? (ref6 = ref5.object) != null ? ref6.keyvals : void 0 : void 0 : void 0;
        if (mthds != null ? mthds.length : void 0) {
            mthds = this.prepareMethods(mthds);
            this.indent = '    ';
            for (i = 0, len = mthds.length; i < len; i++) {
                m = mthds[i];
                s += '\n';
                s += this.mthd(m);
            }
            s += '\n';
            this.indent = '';
        }
        s += '}';
        return s;
    };

    Renderer.prototype.prepareMethods = function(mthds) {
        var ast, b, base, bind, bn, constructor, i, l, len, len1, m, name, ref1;
        bind = [];
        for (i = 0, len = mthds.length; i < len; i++) {
            m = mthds[i];
            if (!m.keyval) {
                console.log('wtf?', m);
                print.ast('not an method?', m);
                continue;
            }
            name = m.keyval.val.func.name.text;
            if (name === '@' || name === 'constructor') {
                if (constructor) {
                    console.error('more than one constructor?');
                }
                m.keyval.val.func.name.text = 'constructor';
                constructor = m;
            } else if (name.startsWith('@')) {
                m.keyval.val.func.name.text = 'static ' + name.slice(1);
            } else if (((ref1 = m.keyval.val.func) != null ? ref1.arrow.text : void 0) === '=>') {
                bind.push(m);
            }
        }
        if (bind.length && !constructor) {
            ast = this.kode.ast("constructor: ->");
            if (this.debug) {
                print.noon('ast', ast);
            }
            constructor = ast.exps[0].object.keyvals[0];
            constructor.keyval.val.func.name = {
                type: 'name',
                text: 'constructor'
            };
            mthds.unshift(constructor);
            if (this.debug) {
                print.noon('constructor', constructor);
                print.ast('implicit constructor', constructor);
                print.ast('mthds with implicit constructor', mthds);
            }
        }
        if (bind.length) {
            for (l = 0, len1 = bind.length; l < len1; l++) {
                b = bind[l];
                bn = b.keyval.val.func.name.text;
                this.verb('method to bind:', bn);
                if ((base = constructor.keyval.val.func.body).exps != null) {
                    base.exps;
                } else {
                    base.exps = [];
                }
                constructor.keyval.val.func.body.exps.push({
                    type: 'code',
                    text: "this." + bn + " = this." + bn + ".bind(this)"
                });
            }
            if (this.debug) {
                print.ast('constructor after bind', constructor);
            }
        }
        if (this.debug) {
            print.ast('prepared mthds', mthds);
        }
        return mthds;
    };

    Renderer.prototype.mthd = function(n) {
        var s;
        if (n.keyval) {
            s = this.indent + this.func(n.keyval.val.func);
        }
        return s;
    };

    Renderer.prototype.func = function(n) {
        var args, gi, ref1, ref2, ref3, ref4, s, ss, v, vs;
        gi = this.ind();
        s = (ref1 = (ref2 = n.name) != null ? ref2.text : void 0) != null ? ref1 : 'function';
        s += ' (';
        args = (ref3 = n.args) != null ? (ref4 = ref3.parens) != null ? ref4.exps : void 0 : void 0;
        if (args) {
            s += args.map((function(_this) {
                return function(a) {
                    return _this.node(a);
                };
            })(this)).join(', ');
        }
        s += ')\n';
        s += gi + '{';
        if (!empty(n.body.vars)) {
            s += '\n';
            vs = ((function() {
                var i, len, ref5, results;
                ref5 = n.body.vars;
                results = [];
                for (i = 0, len = ref5.length; i < len; i++) {
                    v = ref5[i];
                    results.push(v.text);
                }
                return results;
            })()).join(', ');
            s += this.indent + ("var " + vs + "\n");
        }
        if (!empty(n.body.exps)) {
            s += '\n';
            ss = n.body.exps.map((function(_this) {
                return function(s) {
                    return _this.node(s);
                };
            })(this));
            ss = ss.map((function(_this) {
                return function(s) {
                    return _this.indent + s;
                };
            })(this));
            s += ss.join('\n');
            s += '\n' + gi;
        }
        s += '}';
        this.ded();
        return s;
    };

    Renderer.prototype["return"] = function(n) {
        var s;
        s = 'return';
        s += ' ' + this.node(n.val);
        return kstr.strip(s);
    };

    Renderer.prototype.call = function(p) {
        var ref1;
        if ((ref1 = p.callee.text) === 'log' || ref1 === 'warn' || ref1 === 'error') {
            p.callee.text = "console." + p.callee.text;
        }
        return (this.node(p.callee)) + "(" + (this.nodes(p.args, ',')) + ")";
    };

    Renderer.prototype["if"] = function(n) {
        var e, elif, first, gi, i, l, last, len, len1, len2, len3, q, r, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, s;
        if (!n.then) {
            console.error('if expected then', n);
        }
        first = firstLineCol(n);
        last = lastLineCol(n);
        if (first.line === last.line && n["else"]) {
            return this.ifInline(n);
        }
        gi = this.ind();
        s = '';
        s += "if (" + (this.node(n.exp)) + ")\n";
        s += gi + "{\n";
        ref2 = (ref1 = n.then.exps) != null ? ref1 : [];
        for (i = 0, len = ref2.length; i < len; i++) {
            e = ref2[i];
            s += this.indent + this.node(e) + '\n';
        }
        s += gi + "}";
        ref4 = (ref3 = n.elifs) != null ? ref3 : [];
        for (l = 0, len1 = ref4.length; l < len1; l++) {
            elif = ref4[l];
            s += '\n';
            s += gi + ("else if (" + (this.node(elif.elif.exp)) + ")\n");
            s += gi + "{\n";
            ref6 = (ref5 = elif.elif.then.exps) != null ? ref5 : [];
            for (q = 0, len2 = ref6.length; q < len2; q++) {
                e = ref6[q];
                s += this.indent + this.node(e) + '\n';
            }
            s += gi + "}";
        }
        if (n["else"]) {
            s += '\n';
            s += gi + 'else\n';
            s += gi + "{\n";
            ref8 = (ref7 = n["else"].exps) != null ? ref7 : [];
            for (r = 0, len3 = ref8.length; r < len3; r++) {
                e = ref8[r];
                s += this.indent + this.node(e) + '\n';
            }
            s += gi + "}";
        }
        this.ded();
        return s;
    };

    Renderer.prototype.ifInline = function(n) {
        var e, i, len, ref1, s;
        s = '';
        s += (this.node(n.exp)) + " ? ";
        if (n.then.exps) {
            s += ((function() {
                var i, len, ref1, results;
                ref1 = n.then.exps;
                results = [];
                for (i = 0, len = ref1.length; i < len; i++) {
                    e = ref1[i];
                    results.push(this.node(e));
                }
                return results;
            }).call(this)).join(', ');
        }
        if (n.elifs) {
            ref1 = n.elifs;
            for (i = 0, len = ref1.length; i < len; i++) {
                e = ref1[i];
                s += ' : ';
                s += this.ifInline(e.elif);
            }
        }
        if (n["else"]) {
            s += ' : ';
            if (n["else"].exps.length === 1) {
                s += this.node(n["else"].exps[0]);
            } else {
                s += '(' + ((function() {
                    var l, len1, ref2, results;
                    ref2 = n["else"].exps;
                    results = [];
                    for (l = 0, len1 = ref2.length; l < len1; l++) {
                        e = ref2[l];
                        results.push(this.node(e));
                    }
                    return results;
                }).call(this)).join(', ') + ')';
            }
        }
        return s;
    };

    Renderer.prototype["for"] = function(n) {
        if (!n.then) {
            console.error('for expected then', n);
        }
        switch (n.inof.text) {
            case 'in':
                return this.for_in(n);
            case 'of':
                return this.for_of(n);
            default:
                return console.error('for expected in/of');
        }
    };

    Renderer.prototype.for_in = function(n) {
        var e, gi, i, j, l, len, len1, list, listVar, lv, q, ref1, ref2, ref3, ref4, ref5, results, s, v;
        gi = this.ind();
        list = this.node(n.list);
        if (!list || list === 'undefined') {
            print.noon('no list for', n.list);
            print.ast('no list for', n.list);
        }
        listVar = 'list';
        s = '';
        s += "var " + listVar + " = " + list + "\n";
        if (n.vals.text) {
            s += gi + ("for (var i = 0; i < " + listVar + ".length; i++)\n");
            s += gi + "{\n";
            s += this.indent + ("var " + n.vals.text + " = " + listVar + "[i]\n");
        } else if ((ref1 = n.vals.array) != null ? ref1.items : void 0) {
            s += gi + ("for (var i = 0; i < " + listVar + ".length; i++)\n");
            s += gi + "{\n";
            ref3 = (function() {
                results = [];
                for (var l = 0, ref2 = n.vals.array.items.length; 0 <= ref2 ? l < ref2 : l > ref2; 0 <= ref2 ? l++ : l--){ results.push(l); }
                return results;
            }).apply(this);
            for (i = 0, len = ref3.length; i < len; i++) {
                j = ref3[i];
                v = n.vals.array.items[j];
                s += this.indent + ("var " + v.text + " = " + listVar + "[i][" + j + "]\n");
            }
        } else if (n.vals.length > 1) {
            lv = n.vals[1].text;
            s += gi + ("for (var " + lv + " = 0; " + lv + " < " + listVar + ".length; " + lv + "++)\n");
            s += gi + "{\n";
            s += this.indent + ("var " + n.vals[0].text + " = " + listVar + "[i]\n");
        }
        ref5 = (ref4 = n.then.exps) != null ? ref4 : [];
        for (q = 0, len1 = ref5.length; q < len1; q++) {
            e = ref5[q];
            s += this.indent + this.node(e) + '\n';
        }
        s += gi + "}";
        this.ded();
        return s;
    };

    Renderer.prototype.for_of = function(n) {
        var e, gi, i, key, len, obj, ref1, ref2, ref3, ref4, ref5, s, val;
        gi = this.ind();
        key = (ref1 = n.vals.text) != null ? ref1 : (ref2 = n.vals[0]) != null ? ref2.text : void 0;
        val = (ref3 = n.vals[1]) != null ? ref3.text : void 0;
        obj = this.node(n.list);
        s = '';
        s += "for (" + key + " in " + obj + ")\n";
        s += gi + "{\n";
        if (val) {
            s += this.indent + (val + " = " + obj + "[" + key + "]\n");
        }
        ref5 = (ref4 = n.then.exps) != null ? ref4 : [];
        for (i = 0, len = ref5.length; i < len; i++) {
            e = ref5[i];
            s += this.indent + this.node(e) + '\n';
        }
        s += gi + "}";
        this.ded();
        return s;
    };

    Renderer.prototype["while"] = function(n) {
        var e, gi, i, len, ref1, ref2, s;
        if (!n.then) {
            console.error('when expected then', n);
        }
        gi = this.ind();
        s = '';
        s += "while (" + (this.node(n.cond)) + ")\n";
        s += gi + "{\n";
        ref2 = (ref1 = n.then.exps) != null ? ref1 : [];
        for (i = 0, len = ref2.length; i < len; i++) {
            e = ref2[i];
            s += this.indent + this.node(e) + '\n';
        }
        s += gi + "}";
        this.ded();
        return s;
    };

    Renderer.prototype["switch"] = function(n) {
        var e, gi, i, l, len, len1, ref1, ref2, ref3, s;
        if (!n.match) {
            console.error('switch expected match', n);
        }
        if (!n.whens) {
            console.error('switch expected whens', n);
        }
        gi = this.ind();
        s = '';
        s += "switch (" + (this.node(n.match)) + ")\n";
        s += gi + "{\n";
        ref2 = (ref1 = n.whens) != null ? ref1 : [];
        for (i = 0, len = ref2.length; i < len; i++) {
            e = ref2[i];
            s += gi + this.node(e) + '\n';
        }
        if (n["else"]) {
            s += this.indent + 'default:\n';
            ref3 = n["else"];
            for (l = 0, len1 = ref3.length; l < len1; l++) {
                e = ref3[l];
                s += this.indent + '    ' + this.node(e) + '\n';
            }
        }
        s += gi + "}\n";
        this.ded();
        return s;
    };

    Renderer.prototype.when = function(n) {
        var e, i, l, len, len1, ref1, ref2, ref3, s;
        if (!n.vals) {
            return console.error('when expected vals', n);
        }
        if (!n.then) {
            return console.error('when expected then', n);
        }
        s = '';
        ref1 = n.vals;
        for (i = 0, len = ref1.length; i < len; i++) {
            e = ref1[i];
            s += '    case ' + this.node(e) + ':\n';
        }
        ref3 = (ref2 = n.then.exps) != null ? ref2 : [];
        for (l = 0, len1 = ref3.length; l < len1; l++) {
            e = ref3[l];
            s += this.indent + '    ' + this.node(e) + '\n';
        }
        s += this.indent + '    ' + 'break';
        return s;
    };

    Renderer.prototype.token = function(tok) {
        if (tok.type === 'comment') {
            return this.comment(tok);
        } else if (tok.type === 'this') {
            return 'this';
        } else if (tok.type === 'triple') {
            return '`' + tok.text.slice(3, -3) + '`';
        } else if (tok.type === 'keyword' && tok.text === 'yes') {
            return 'true';
        } else if (tok.type === 'keyword' && tok.text === 'no') {
            return 'false';
        } else {
            return tok.text;
        }
    };

    Renderer.prototype.comment = function(tok) {
        if (tok.text.startsWith('###')) {
            return '/*' + tok.text.slice(3, -3) + '*/' + '\n';
        } else if (tok.text.startsWith('#')) {
            return kstr.pad('', tok.col) + '//' + tok.text.slice(1);
        } else {
            console.error("# comment token expected");
            return '';
        }
    };

    Renderer.prototype.operation = function(op) {
        var close, o, open, opmap, ref1, ref2, ref3, ref4, ro, sep;
        opmap = function(o) {
            var omp, ref1;
            omp = {
                and: '&&',
                or: '||',
                not: '!',
                '==': '===',
                '!=': '!=='
            };
            return (ref1 = omp[o]) != null ? ref1 : o;
        };
        o = opmap(op.operator.text);
        sep = ' ';
        if (!op.lhs || !op.rhs) {
            sep = '';
        }
        if (o === '<' || o === '<=' || o === '===' || o === '!==' || o === '>=' || o === '>') {
            ro = opmap((ref1 = op.rhs) != null ? (ref2 = ref1.operation) != null ? ref2.operator.text : void 0 : void 0);
            if (ro === '<' || ro === '<=' || ro === '===' || ro === '!==' || ro === '>=' || ro === '>') {
                return '(' + this.node(op.lhs) + sep + o + sep + this.node(op.rhs.operation.lhs) + ' && ' + kstr.lstrip(this.node(op.rhs)) + ')';
            }
        }
        open = close = '';
        if (o !== '=' && ((ref3 = op.rhs) != null ? (ref4 = ref3.operation) != null ? ref4.operator.text : void 0 : void 0) === '=') {
            open = '(';
            close = ')';
        }
        return this.node(op.lhs) + sep + o + sep + open + kstr.lstrip(this.node(op.rhs) + close);
    };

    Renderer.prototype.incond = function(p) {
        return (this.node(p.rhs)) + ".indexOf(" + (this.node(p.lhs)) + ") >= 0";
    };

    Renderer.prototype.parens = function(p) {
        return "(" + (this.nodes(p.exps)) + ")";
    };

    Renderer.prototype.object = function(p) {
        return "{" + (this.nodes(p.keyvals, ',')) + "}";
    };

    Renderer.prototype.keyval = function(p) {
        var key, ref1;
        key = this.node(p.key);
        if ((ref1 = key[0], indexOf.call("'\"", ref1) < 0) && /[\.\,\;\*\+\-\/\=\|]/.test(key)) {
            key = "'" + key + "'";
        }
        return key + ":" + (this.node(p.val));
    };

    Renderer.prototype.prop = function(p) {
        return (this.node(p.obj)) + "." + (this.node(p.prop));
    };

    Renderer.prototype.index = function(p) {
        var add, ni, o, ref1;
        if (p.slidx.slice) {
            add = '';
            if (p.slidx.slice.dots.text === '..') {
                add = '+1';
            }
            return (this.node(p.idxee)) + ".slice(" + (this.node(p.slidx.slice.from)) + ", " + (this.node(p.slidx.slice.upto)) + add + ")";
        } else {
            if (p.slidx.operation) {
                o = p.slidx.operation;
                if (o.operator.text === '-' && !o.lhs && ((ref1 = o.rhs) != null ? ref1.type : void 0) === 'num') {
                    ni = parseInt(o.rhs.text);
                    if (ni === 1) {
                        return (this.node(p.idxee)) + ".slice(-" + ni + ")[0]";
                    } else {
                        return (this.node(p.idxee)) + ".slice(-" + ni + ",-" + (ni - 1) + ")[0]";
                    }
                }
            }
            return (this.node(p.idxee)) + "[" + (this.node(p.slidx)) + "]";
        }
    };

    Renderer.prototype.array = function(p) {
        var ref1;
        if ((ref1 = p.items[0]) != null ? ref1.slice : void 0) {
            return this.slice(p.items[0].slice);
        } else {
            return "[" + (this.nodes(p.items, ',')) + "]";
        }
    };

    Renderer.prototype.slice = function(p) {
        var from, o, upto, x;
        if ((p.from.type === 'num' && 'num' === p.upto.type)) {
            from = parseInt(p.from.text);
            upto = parseInt(p.upto.text);
            if (upto - from <= 10) {
                if (p.dots.text === '...') {
                    upto--;
                }
                return '[' + (((function() {
                    var i, ref1, ref2, results;
                    results = [];
                    for (x = i = ref1 = from, ref2 = upto; ref1 <= ref2 ? i <= ref2 : i >= ref2; x = ref1 <= ref2 ? ++i : --i) {
                        results.push(x);
                    }
                    return results;
                })()).join(',')) + ']';
            } else {
                o = p.dots.text === '...' ? '<' : '<=';
                return "(function() { var r = []; for (var i = " + from + "; i " + o + " " + upto + "; i++){ r.push(i); } return r; }).apply(this)";
            }
        } else {
            o = p.dots.text === '...' ? '<' : '<=';
            return "(function() { var r = []; for (var i = " + (this.node(p.from)) + "; i " + o + " " + (this.node(p.upto)) + "; i++){ r.push(i); } return r; }).apply(this)";
        }
    };

    Renderer.prototype.verb = function() {
        if (this.verbose) {
            return console.log.apply(console.log, arguments);
        }
    };

    Renderer.prototype.ind = function() {
        var oi;
        oi = this.indent;
        this.indent += '    ';
        return oi;
    };

    Renderer.prototype.ded = function() {
        return this.indent = this.indent.slice(0, -4);
    };

    return Renderer;

})();

module.exports = Renderer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNERBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQXVDLE9BQUEsQ0FBUSxTQUFSLENBQXZDLEVBQUUsK0JBQUYsRUFBZ0IsNkJBQWhCLEVBQTZCOztBQUV2QjtJQUVDLGtCQUFDLElBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7UUFFQSxJQUFDLENBQUEsS0FBRCx5Q0FBcUIsQ0FBRTtRQUN2QixJQUFDLENBQUEsT0FBRCx5Q0FBcUIsQ0FBRTtJQUh4Qjs7dUJBS0gsTUFBQSxHQUFRLFNBQUMsR0FBRDtBQUVKLFlBQUE7UUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVO1FBQ1YsQ0FBQSxHQUFJO1FBQ0osQ0FBQSxJQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBVCxDQUFhLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsQ0FBRDt1QkFBTyxLQUFDLENBQUEsSUFBRCxDQUFNLENBQU47WUFBUDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBYixDQUE0QixDQUFDLElBQTdCLENBQWtDLElBQWxDO2VBQ0w7SUFMSTs7dUJBT1IsS0FBQSxHQUFPLFNBQUMsS0FBRCxFQUFRLEdBQVI7QUFDSCxZQUFBOztZQURXLE1BQUk7O1FBQ2YsRUFBQSxHQUFLLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxDQUFEO3VCQUFPLEtBQUMsQ0FBQSxJQUFELENBQU0sQ0FBTjtZQUFQO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWO2VBQ0wsRUFBRSxDQUFDLElBQUgsQ0FBUSxHQUFSO0lBRkc7O3VCQVVQLElBQUEsR0FBTSxTQUFD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QUEsSUFBRCxDQUFNLENBQUMsQ0FBQyxJQUFSLENBQUQsQ0FBekMsR0FBdUQsTUFBdkQsR0FBNkQsQ0FBN0QsR0FBK0QsR0FBL0QsR0FBaUUsQ0FBQyxJQUFDLENBQUEsSUFBRCxDQUFNLENBQUMsQ0FBQyxJQUFSLENBQUQsQ0FBakUsR0FBK0UsZ0RBWG5GOztJQUZJOzt1QkFlUixJQUFBLEdBQU0sU0FBQTtRQUFHLElBQUcsSUFBQyxDQUFBLE9BQUo7bUJBQWlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBWixDQUFrQixPQUFPLENBQUMsR0FBMUIsRUFBK0IsU0FBL0IsRUFBakI7O0lBQUg7O3VCQUNOLEdBQUEsR0FBSyxTQUFBO0FBRUQsWUFBQTtRQUFBLEVBQUEsR0FBSyxJQUFDLENBQUE7UUFDTixJQUFDLENBQUEsTUFBRCxJQUFXO2VBQ1g7SUFKQzs7dUJBTUwsR0FBQSxHQUFLLFNBQUE7ZUFFRCxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxNQUFPO0lBRmpCOzs7Ozs7QUFJVCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxua3N0ciAgPSByZXF1aXJlICdrc3RyJ1xucHJpbnQgPSByZXF1aXJlICcuL3ByaW50J1xuXG57IGZpcnN0TGluZUNvbCwgbGFzdExpbmVDb2wsIGVtcHR5IH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5jbGFzcyBSZW5kZXJlclxuXG4gICAgQDogKEBrb2RlKSAtPlxuXG4gICAgICAgIEBkZWJ1ZyAgID0gQGtvZGUuYXJncz8uZGVidWdcbiAgICAgICAgQHZlcmJvc2UgPSBAa29kZS5hcmdzPy52ZXJib3NlXG5cbiAgICByZW5kZXI6IChhc3QpIC0+XG5cbiAgICAgICAgQGluZGVudCA9ICcnXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IGFzdC5leHBzLm1hcCgocykgPT4gQG5vZGUgcykuam9pbiAnXFxuJ1xuICAgICAgICBzXG5cbiAgICBub2RlczogKG5vZGVzLCBzZXA9JywnKSAtPlxuICAgICAgICBzcyA9IG5vZGVzLm1hcCAocykgPT4gQG5vZGUgc1xuICAgICAgICBzcy5qb2luIHNlcFxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcblxuICAgIG5vZGU6IChleHApIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gJycgaWYgbm90IGV4cFxuXG4gICAgICAgIGlmIGV4cC50eXBlPyBhbmQgZXhwLnRleHQ/IHRoZW4gcmV0dXJuIEB0b2tlbiBleHBcblxuICAgICAgICBpZiBleHAgaW5zdGFuY2VvZiBBcnJheSB0aGVuIHJldHVybiAoQG5vZGUoYSkgZm9yIGEgaW4gZXhwKS5qb2luICc7XFxuJ1xuXG4gICAgICAgIHMgPSAnJ1xuXG4gICAgICAgIGZvciBrLHYgb2YgZXhwXG5cbiAgICAgICAgICAgIHMgKz0gc3dpdGNoIGtcbiAgICAgICAgICAgICAgICB3aGVuICdpZicgICAgICAgIHRoZW4gQGlmIHZcbiAgICAgICAgICAgICAgICB3aGVuICdmb3InICAgICAgIHRoZW4gQGZvciB2XG4gICAgICAgICAgICAgICAgd2hlbiAnd2hpbGUnICAgICB0aGVuIEB3aGlsZSB2XG4gICAgICAgICAgICAgICAgd2hlbiAncmV0dXJuJyAgICB0aGVuIEByZXR1cm4gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2NsYXNzJyAgICAgdGhlbiBAY2xhc3MgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3N3aXRjaCcgICAgdGhlbiBAc3dpdGNoIHZcbiAgICAgICAgICAgICAgICB3aGVuICd3aGVuJyAgICAgIHRoZW4gQHdoZW4gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ29wZXJhdGlvbicgdGhlbiBAb3BlcmF0aW9uIHZcbiAgICAgICAgICAgICAgICB3aGVuICdpbmNvbmQnICAgIHRoZW4gQGluY29uZCB2XG4gICAgICAgICAgICAgICAgd2hlbiAncGFyZW5zJyAgICB0aGVuIEBwYXJlbnMgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ29iamVjdCcgICAgdGhlbiBAb2JqZWN0IHZcbiAgICAgICAgICAgICAgICB3aGVuICdrZXl2YWwnICAgIHRoZW4gQGtleXZhbCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnYXJyYXknICAgICB0aGVuIEBhcnJheSB2XG4gICAgICAgICAgICAgICAgd2hlbiAnaW5kZXgnICAgICB0aGVuIEBpbmRleCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnc2xpY2UnICAgICB0aGVuIEBzbGljZSB2XG4gICAgICAgICAgICAgICAgd2hlbiAncHJvcCcgICAgICB0aGVuIEBwcm9wIHZcbiAgICAgICAgICAgICAgICB3aGVuICdmdW5jJyAgICAgIHRoZW4gQGZ1bmMgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2NhbGwnICAgICAgdGhlbiBAY2FsbCB2XG4gICAgICAgICAgICAgICAgd2hlbiAndmFyJyAgICAgICB0aGVuIHYudGV4dFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbG9nIFI0KFwicmVuZGVyZXIubm9kZSB1bmhhbmRsZWQga2V5ICN7a30gaW4gZXhwXCIpLCBleHAgIyBpZiBAZGVidWcgb3IgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICAgICAgJydcbiAgICAgICAgc1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcblxuICAgIGNsYXNzOiAobikgLT5cblxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcImNsYXNzICN7bi5uYW1lLnRleHR9XCJcblxuICAgICAgICBpZiBuLmV4dGVuZHNcbiAgICAgICAgICAgIHMgKz0gXCIgZXh0ZW5kcyBcIiArIG4uZXh0ZW5kcy5tYXAoKGUpIC0+IGUudGV4dCkuam9pbiAnLCAnXG5cbiAgICAgICAgcyArPSAnXFxueydcblxuICAgICAgICBtdGhkcyA9IG4uYm9keT8ub2JqZWN0Py5rZXl2YWxzID8gbi5ib2R5P1swXT8ub2JqZWN0Py5rZXl2YWxzXG4gICAgICAgIFxuICAgICAgICBpZiBtdGhkcz8ubGVuZ3RoXG4gICAgICAgICAgICBtdGhkcyA9IEBwcmVwYXJlTWV0aG9kcyBtdGhkc1xuICAgICAgICAgICAgQGluZGVudCA9ICcgICAgJ1xuICAgICAgICAgICAgZm9yIG0gaW4gbXRoZHNcbiAgICAgICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICAgICAgcyArPSBAbXRoZCBtXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBAaW5kZW50ID0gJydcbiAgICAgICAgcyArPSAnfSdcbiAgICAgICAgc1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4gICAgXG4gICAgcHJlcGFyZU1ldGhvZHM6IChtdGhkcykgLT5cblxuICAgICAgICBiaW5kID0gW11cbiAgICAgICAgZm9yIG0gaW4gbXRoZHNcbiAgICAgICAgICAgIGlmIG5vdCBtLmtleXZhbCBcbiAgICAgICAgICAgICAgICBsb2cgJ3d0Zj8nIG0gXG4gICAgICAgICAgICAgICAgcHJpbnQuYXN0ICdub3QgYW4gbWV0aG9kPycgbVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBuYW1lID0gbS5rZXl2YWwudmFsLmZ1bmMubmFtZS50ZXh0XG4gICAgICAgICAgICBpZiBuYW1lIGluIFsnQCcgJ2NvbnN0cnVjdG9yJ11cbiAgICAgICAgICAgICAgICBpZiBjb25zdHJ1Y3RvciB0aGVuIGVycm9yICdtb3JlIHRoYW4gb25lIGNvbnN0cnVjdG9yPydcbiAgICAgICAgICAgICAgICBtLmtleXZhbC52YWwuZnVuYy5uYW1lLnRleHQgPSAnY29uc3RydWN0b3InXG4gICAgICAgICAgICAgICAgIyBsb2cgJ3ByZXBhcmVNZXRob2RzJyBuYW1lLCBtLmtleXZhbC52YWwuZnVuYy5uYW1lLnRleHRcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvciA9IG1cbiAgICAgICAgICAgIGVsc2UgaWYgbmFtZS5zdGFydHNXaXRoICdAJ1xuICAgICAgICAgICAgICAgIG0ua2V5dmFsLnZhbC5mdW5jLm5hbWUudGV4dCA9ICdzdGF0aWMgJyArIG5hbWVbMS4uXVxuICAgICAgICAgICAgZWxzZSBpZiBtLmtleXZhbC52YWwuZnVuYz8uYXJyb3cudGV4dCA9PSAnPT4nXG4gICAgICAgICAgICAgICAgYmluZC5wdXNoIG1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgYmluZC5sZW5ndGggYW5kIG5vdCBjb25zdHJ1Y3RvciAjIGZvdW5kIHNvbWUgbWV0aG9kcyB0byBiaW5kLCBidXQgbm8gY29uc3RydWN0b3JcbiAgICAgICAgICAgIGFzdCA9IEBrb2RlLmFzdCBcImNvbnN0cnVjdG9yOiAtPlwiICMgY3JlYXRlIG9uZSBmcm9tIHNjcmF0Y2hcbiAgICAgICAgICAgIHByaW50Lm5vb24gJ2FzdCcgYXN0IGlmIEBkZWJ1Z1xuICAgICAgICAgICAgY29uc3RydWN0b3IgPSBhc3QuZXhwc1swXS5vYmplY3Qua2V5dmFsc1swXVxuICAgICAgICAgICAgY29uc3RydWN0b3Iua2V5dmFsLnZhbC5mdW5jLm5hbWUgPSB0eXBlOiduYW1lJyB0ZXh0Oidjb25zdHJ1Y3RvcidcbiAgICAgICAgICAgIG10aGRzLnVuc2hpZnQgY29uc3RydWN0b3JcbiAgICAgICAgICAgIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgIHByaW50Lm5vb24gJ2NvbnN0cnVjdG9yJyBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgICAgIHByaW50LmFzdCAnaW1wbGljaXQgY29uc3RydWN0b3InIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICAgICAgcHJpbnQuYXN0ICdtdGhkcyB3aXRoIGltcGxpY2l0IGNvbnN0cnVjdG9yJyBtdGhkc1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIGJpbmQubGVuZ3RoXG4gICAgICAgICAgICBmb3IgYiBpbiBiaW5kXG4gICAgICAgICAgICAgICAgYm4gPSBiLmtleXZhbC52YWwuZnVuYy5uYW1lLnRleHRcbiAgICAgICAgICAgICAgICBAdmVyYiAnbWV0aG9kIHRvIGJpbmQ6JyBiblxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLmtleXZhbC52YWwuZnVuYy5ib2R5LmV4cHMgPz0gW11cbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5rZXl2YWwudmFsLmZ1bmMuYm9keS5leHBzLnB1c2ggXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjb2RlJ1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcInRoaXMuI3tibn0gPSB0aGlzLiN7Ym59LmJpbmQodGhpcylcIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHByaW50LmFzdCAnY29uc3RydWN0b3IgYWZ0ZXIgYmluZCcgY29uc3RydWN0b3IgaWYgQGRlYnVnXG5cbiAgICAgICAgcHJpbnQuYXN0ICdwcmVwYXJlZCBtdGhkcycgbXRoZHMgaWYgQGRlYnVnXG4gICAgICAgIG10aGRzXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBtdGhkOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG4ua2V5dmFsXG4gICAgICAgICAgICBzID0gQGluZGVudCArIEBmdW5jIG4ua2V5dmFsLnZhbC5mdW5jXG4gICAgICAgIHNcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAgICAgICAgIFxuICAgIGZ1bmM6IChuKSAtPlxuICAgICAgICBcbiAgICAgICAgZ2kgPSBAaW5kKClcbiAgICAgICAgXG4gICAgICAgIHMgPSBuLm5hbWU/LnRleHQgPyAnZnVuY3Rpb24nXG4gICAgICAgIHMgKz0gJyAoJ1xuICAgICAgICBhcmdzID0gbi5hcmdzPy5wYXJlbnM/LmV4cHNcbiAgICAgICAgaWYgYXJnc1xuICAgICAgICAgICAgcyArPSBhcmdzLm1hcCgoYSkgPT4gQG5vZGUgYSkuam9pbiAnLCAnXG4gICAgICAgIHMgKz0gJylcXG4nXG4gICAgICAgIHMgKz0gZ2kgKyAneydcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBlbXB0eSBuLmJvZHkudmFyc1xuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgdnMgPSAodi50ZXh0IGZvciB2IGluIG4uYm9keS52YXJzKS5qb2luICcsICdcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIFwidmFyICN7dnN9XFxuXCJcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBlbXB0eSBuLmJvZHkuZXhwc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzcyA9IG4uYm9keS5leHBzLm1hcCAocykgPT4gQG5vZGUgc1xuICAgICAgICAgICAgc3MgPSBzcy5tYXAgKHMpID0+IEBpbmRlbnQgKyBzXG4gICAgICAgICAgICBzICs9IHNzLmpvaW4gJ1xcbidcbiAgICAgICAgICAgIHMgKz0gJ1xcbicgKyBnaVxuICAgICAgICBzICs9ICd9J1xuICAgICAgICBcbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHJldHVybjogKG4pIC0+XG5cbiAgICAgICAgcyA9ICdyZXR1cm4nXG4gICAgICAgIHMgKz0gJyAnICsgQG5vZGUgbi52YWxcbiAgICAgICAga3N0ci5zdHJpcCBzXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgY2FsbDogKHApIC0+XG4gICAgICAgIGlmIHAuY2FsbGVlLnRleHQgaW4gWydsb2cnJ3dhcm4nJ2Vycm9yJ11cbiAgICAgICAgICAgIHAuY2FsbGVlLnRleHQgPSBcImNvbnNvbGUuI3twLmNhbGxlZS50ZXh0fVwiXG4gICAgICAgIFwiI3tAbm9kZShwLmNhbGxlZSl9KCN7QG5vZGVzIHAuYXJncywgJywnfSlcIlxuICAgICAgICAgICAgXG4gICAgIyAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMFxuXG4gICAgaWY6IChuKSAtPlxuXG4gICAgICAgIGlmIG5vdCBuLnRoZW4gdGhlbiBlcnJvciAnaWYgZXhwZWN0ZWQgdGhlbicgblxuXG4gICAgICAgIGZpcnN0ID0gZmlyc3RMaW5lQ29sIG5cbiAgICAgICAgbGFzdCAgPSBsYXN0TGluZUNvbCBuXG4gICAgICAgIFxuICAgICAgICBpZiBmaXJzdC5saW5lID09IGxhc3QubGluZSBhbmQgbi5lbHNlXG4gICAgICAgICAgICByZXR1cm4gQGlmSW5saW5lIG5cbiAgICAgICAgXG4gICAgICAgIGdpID0gQGluZCgpXG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJpZiAoI3tAbm9kZShuLmV4cCl9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuLmV4cHMgPyBbXVxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgZm9yIGVsaWYgaW4gbi5lbGlmcyA/IFtdXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpICsgXCJlbHNlIGlmICgje0Bub2RlKGVsaWYuZWxpZi5leHApfSlcXG5cIlxuICAgICAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICAgICAgZm9yIGUgaW4gZWxpZi5lbGlmLnRoZW4uZXhwcyA/IFtdXG4gICAgICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIGlmIG4uZWxzZVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaSArICdlbHNlXFxuJ1xuICAgICAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICAgICAgZm9yIGUgaW4gbi5lbHNlLmV4cHMgPyBbXVxuICAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wifVwiXG4gICAgICAgICAgICBcbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAwMDAgIDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGlmSW5saW5lOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBcbiAgICAgICAgcyArPSBcIiN7QG5vZGUobi5leHApfSA/IFwiXG4gICAgICAgIGlmIG4udGhlbi5leHBzXG4gICAgICAgICAgICBzICs9IChAbm9kZShlKSBmb3IgZSBpbiBuLnRoZW4uZXhwcykuam9pbiAnLCAnXG5cbiAgICAgICAgaWYgbi5lbGlmc1xuICAgICAgICAgICAgZm9yIGUgaW4gbi5lbGlmc1xuICAgICAgICAgICAgICAgIHMgKz0gJyA6ICdcbiAgICAgICAgICAgICAgICBzICs9IEBpZklubGluZSBlLmVsaWZcblxuICAgICAgICBpZiBuLmVsc2VcbiAgICAgICAgICAgIHMgKz0gJyA6ICdcbiAgICAgICAgICAgIGlmIG4uZWxzZS5leHBzLmxlbmd0aCA9PSAxXG4gICAgICAgICAgICAgICAgcyArPSBAbm9kZSBuLmVsc2UuZXhwc1swXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHMgKz0gJygnICsgKEBub2RlIGUgZm9yIGUgaW4gbi5lbHNlLmV4cHMpLmpvaW4oJywgJykgKyAnKSdcbiAgICAgICAgc1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGZvcjogKG4pIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3Qgbi50aGVuIHRoZW4gZXJyb3IgJ2ZvciBleHBlY3RlZCB0aGVuJyBuXG5cbiAgICAgICAgc3dpdGNoIG4uaW5vZi50ZXh0IFxuICAgICAgICAgICAgd2hlbiAnaW4nIHRoZW4gQGZvcl9pbiBuXG4gICAgICAgICAgICB3aGVuICdvZicgdGhlbiBAZm9yX29mIG5cbiAgICAgICAgICAgIGVsc2UgZXJyb3IgJ2ZvciBleHBlY3RlZCBpbi9vZidcbiAgICAgICAgXG4gICAgZm9yX2luOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIGdpID0gQGluZCgpXG5cbiAgICAgICAgbGlzdCA9IEBub2RlIG4ubGlzdFxuICAgICAgICBcbiAgICAgICAgaWYgbm90IGxpc3Qgb3IgbGlzdCA9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgcHJpbnQubm9vbiAnbm8gbGlzdCBmb3InIG4ubGlzdFxuICAgICAgICAgICAgcHJpbnQuYXN0ICdubyBsaXN0IGZvcicgbi5saXN0XG4gICAgICAgICAgICBcbiAgICAgICAgbGlzdFZhciA9ICdsaXN0JyAgICBcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJ2YXIgI3tsaXN0VmFyfSA9ICN7bGlzdH1cXG5cIlxuICAgICAgICBpZiBuLnZhbHMudGV4dFxuICAgICAgICAgICAgcyArPSBnaStcImZvciAodmFyIGkgPSAwOyBpIDwgI3tsaXN0VmFyfS5sZW5ndGg7IGkrKylcXG5cIlxuICAgICAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICAgICAgcyArPSBAaW5kZW50K1widmFyICN7bi52YWxzLnRleHR9ID0gI3tsaXN0VmFyfVtpXVxcblwiXG4gICAgICAgIGVsc2UgaWYgbi52YWxzLmFycmF5Py5pdGVtc1xuICAgICAgICAgICAgcyArPSBnaStcImZvciAodmFyIGkgPSAwOyBpIDwgI3tsaXN0VmFyfS5sZW5ndGg7IGkrKylcXG5cIlxuICAgICAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICAgICAgZm9yIGogaW4gMC4uLm4udmFscy5hcnJheS5pdGVtcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB2ID0gbi52YWxzLmFycmF5Lml0ZW1zW2pdXG4gICAgICAgICAgICAgICAgcyArPSBAaW5kZW50K1widmFyICN7di50ZXh0fSA9ICN7bGlzdFZhcn1baV1bI3tqfV1cXG5cIlxuICAgICAgICBlbHNlIGlmIG4udmFscy5sZW5ndGggPiAxXG4gICAgICAgICAgICBsdiA9IG4udmFsc1sxXS50ZXh0XG4gICAgICAgICAgICBzICs9IGdpK1wiZm9yICh2YXIgI3tsdn0gPSAwOyAje2x2fSA8ICN7bGlzdFZhcn0ubGVuZ3RoOyAje2x2fSsrKVxcblwiXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQrXCJ2YXIgI3tuLnZhbHNbMF0udGV4dH0gPSAje2xpc3RWYXJ9W2ldXFxuXCJcbiAgICAgICAgICAgIFxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4uZXhwcyA/IFtdXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcbiAgICAgICAgICAgIFxuICAgICAgICBAZGVkKClcbiAgICAgICAgc1xuICAgICAgICBcbiAgICBmb3Jfb2Y6IChuKSAtPlxuICAgICAgICBcbiAgICAgICAgZ2kgPSBAaW5kKClcblxuICAgICAgICBrZXkgPSBuLnZhbHMudGV4dCA/IG4udmFsc1swXT8udGV4dFxuICAgICAgICB2YWwgPSBuLnZhbHNbMV0/LnRleHRcbiAgICAgICAgXG4gICAgICAgIG9iaiA9IEBub2RlIG4ubGlzdFxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcImZvciAoI3trZXl9IGluICN7b2JqfSlcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIGlmIHZhbFxuICAgICAgICAgICAgcyArPSBAaW5kZW50K1wiI3t2YWx9ID0gI3tvYmp9WyN7a2V5fV1cXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4uZXhwcyA/IFtdXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcbiAgICAgICAgICAgIFxuICAgICAgICBAZGVkKClcbiAgICAgICAgc1xuXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbiAgICB3aGlsZTogKG4pIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3Qgbi50aGVuIHRoZW4gZXJyb3IgJ3doZW4gZXhwZWN0ZWQgdGhlbicgblxuXG4gICAgICAgIGdpID0gQGluZCgpXG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJ3aGlsZSAoI3tAbm9kZSBuLmNvbmR9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuLmV4cHMgPyBbXVxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG4gICAgICAgICAgICBcbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgc3dpdGNoOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBuLm1hdGNoIHRoZW4gZXJyb3IgJ3N3aXRjaCBleHBlY3RlZCBtYXRjaCcgblxuICAgICAgICBpZiBub3Qgbi53aGVucyB0aGVuIGVycm9yICdzd2l0Y2ggZXhwZWN0ZWQgd2hlbnMnIG5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuICAgICAgICBcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJzd2l0Y2ggKCN7QG5vZGUgbi5tYXRjaH0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLndoZW5zID8gW11cbiAgICAgICAgICAgIHMgKz0gZ2krIEBub2RlKGUpICsgJ1xcbicgICAgICAgICAgICBcbiAgICAgICAgaWYgbi5lbHNlXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQrJ2RlZmF1bHQ6XFxuJ1xuICAgICAgICAgICAgZm9yIGUgaW4gbi5lbHNlXG4gICAgICAgICAgICAgICAgcyArPSBAaW5kZW50KycgICAgJysgQG5vZGUoZSkgKyAnXFxuJyAgICAgICAgICAgIFxuICAgICAgICBzICs9IGdpK1wifVxcblwiXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHdoZW46IChuKSAtPlxuXG4gICAgICAgIGlmIG5vdCBuLnZhbHMgdGhlbiByZXR1cm4gZXJyb3IgJ3doZW4gZXhwZWN0ZWQgdmFscycgblxuICAgICAgICBpZiBub3Qgbi50aGVuIHRoZW4gcmV0dXJuIGVycm9yICd3aGVuIGV4cGVjdGVkIHRoZW4nIG5cbiAgICAgICAgXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBmb3IgZSBpbiBuLnZhbHNcbiAgICAgICAgICAgIHMgKz0gJyAgICBjYXNlICcgKyBAbm9kZShlKSArICc6XFxuJ1xuICAgICAgICBmb3IgZSBpbiBuLnRoZW4uZXhwcyA/IFtdXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQgKyAnICAgICcgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIHMgKz0gQGluZGVudCArICcgICAgJyArICdicmVhaydcbiAgICAgICAgc1xuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMDAgIDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMFxuICAgICMgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgdG9rZW46ICh0b2spIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b2sudHlwZSA9PSAnY29tbWVudCdcbiAgICAgICAgICAgIEBjb21tZW50IHRva1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICd0aGlzJyBcbiAgICAgICAgICAgICd0aGlzJ1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICd0cmlwbGUnXG4gICAgICAgICAgICAnYCcgKyB0b2sudGV4dFszLi4tNF0gKyAnYCdcbiAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAna2V5d29yZCcgYW5kIHRvay50ZXh0ID09ICd5ZXMnXG4gICAgICAgICAgICAndHJ1ZSdcbiAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAna2V5d29yZCcgYW5kIHRvay50ZXh0ID09ICdubydcbiAgICAgICAgICAgICdmYWxzZSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdG9rLnRleHRcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG4gICAgY29tbWVudDogKHRvaykgLT5cblxuICAgICAgICBpZiB0b2sudGV4dC5zdGFydHNXaXRoICcjIyMnXG4gICAgICAgICAgICAnLyonICsgdG9rLnRleHRbMy4uLTRdICsgJyovJyArICdcXG4nXG4gICAgICAgIGVsc2UgaWYgdG9rLnRleHQuc3RhcnRzV2l0aCAnIydcbiAgICAgICAgICAgIGtzdHIucGFkKCcnLCB0b2suY29sKSArICcvLycgKyB0b2sudGV4dFsxLi4tMV1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZXJyb3IgXCIjIGNvbW1lbnQgdG9rZW4gZXhwZWN0ZWRcIlxuICAgICAgICAgICAgJydcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxuICAgIG9wZXJhdGlvbjogKG9wKSAtPlxuICAgICAgICBcbiAgICAgICAgb3BtYXAgPSAobykgLT5cbiAgICAgICAgICAgIG9tcCA9XG4gICAgICAgICAgICAgICAgYW5kOiAgICAnJiYnXG4gICAgICAgICAgICAgICAgb3I6ICAgICAnfHwnXG4gICAgICAgICAgICAgICAgbm90OiAgICAnISdcbiAgICAgICAgICAgICAgICAnPT0nOiAgICc9PT0nXG4gICAgICAgICAgICAgICAgJyE9JzogICAnIT09J1xuICAgICAgICAgICAgb21wW29dID8gb1xuXG4gICAgICAgIG8gICA9IG9wbWFwIG9wLm9wZXJhdG9yLnRleHRcbiAgICAgICAgc2VwID0gJyAnXG4gICAgICAgIHNlcCA9ICcnIGlmIG5vdCBvcC5saHMgb3Igbm90IG9wLnJoc1xuICAgICAgICBcbiAgICAgICAgaWYgbyBpbiBbJzwnJzw9Jyc9PT0nJyE9PScnPj0nJz4nXVxuICAgICAgICAgICAgcm8gPSBvcG1hcCBvcC5yaHM/Lm9wZXJhdGlvbj8ub3BlcmF0b3IudGV4dFxuICAgICAgICAgICAgaWYgcm8gaW4gWyc8Jyc8PScnPT09JychPT0nJz49Jyc+J11cbiAgICAgICAgICAgICAgICByZXR1cm4gJygnICsgQG5vZGUob3AubGhzKSArIHNlcCArIG8gKyBzZXAgKyBAbm9kZShvcC5yaHMub3BlcmF0aW9uLmxocykgKyAnICYmICcgKyBrc3RyLmxzdHJpcChAbm9kZShvcC5yaHMpKSArICcpJ1xuXG4gICAgICAgIG9wZW4gPSBjbG9zZSA9ICcnXG4gICAgICAgIGlmIG8gIT0gJz0nIGFuZCBvcC5yaHM/Lm9wZXJhdGlvbj8ub3BlcmF0b3IudGV4dCA9PSAnPSdcbiAgICAgICAgICAgIG9wZW4gPSAnKCdcbiAgICAgICAgICAgIGNsb3NlID0gJyknXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBub2RlKG9wLmxocykgKyBzZXAgKyBvICsgc2VwICsgb3BlbiArIGtzdHIubHN0cmlwIEBub2RlKG9wLnJocykgKyBjbG9zZVxuXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBpbmNvbmQ6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgXCIje0Bub2RlIHAucmhzfS5pbmRleE9mKCN7QG5vZGUgcC5saHN9KSA+PSAwXCJcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgcGFyZW5zOiAocCkgLT4gXCIoI3tAbm9kZXMgcC5leHBzfSlcIlxuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9iamVjdDogKHApIC0+IFwieyN7QG5vZGVzIHAua2V5dmFscywgJywnfX1cIlxuICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBrZXl2YWw6IChwKSAtPiBcbiAgICAgICAga2V5ID0gQG5vZGUgcC5rZXlcbiAgICAgICAgaWYga2V5WzBdIG5vdCBpbiBcIidcXFwiXCIgYW5kIC9bXFwuXFwsXFw7XFwqXFwrXFwtXFwvXFw9XFx8XS8udGVzdCBrZXkgdGhlbiBrZXkgPSBcIicje2tleX0nXCJcbiAgICAgICAgXCIje2tleX06I3tAbm9kZShwLnZhbCl9XCJcbiAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuICAgIFxuICAgIHByb3A6ICAgKHApIC0+IFwiI3tAbm9kZShwLm9iail9LiN7QG5vZGUgcC5wcm9wfVwiXG4gICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpbmRleDogIChwKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIHAuc2xpZHguc2xpY2VcbiAgICAgICAgICAgIGFkZCA9ICcnXG4gICAgICAgICAgICBpZiBwLnNsaWR4LnNsaWNlLmRvdHMudGV4dCA9PSAnLi4nXG4gICAgICAgICAgICAgICAgYWRkID0gJysxJ1xuICAgICAgICAgICAgXCIje0Bub2RlKHAuaWR4ZWUpfS5zbGljZSgje0Bub2RlIHAuc2xpZHguc2xpY2UuZnJvbX0sICN7QG5vZGUgcC5zbGlkeC5zbGljZS51cHRvfSN7YWRkfSlcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBwLnNsaWR4Lm9wZXJhdGlvbiBcbiAgICAgICAgICAgICAgICBvID0gcC5zbGlkeC5vcGVyYXRpb25cbiAgICAgICAgICAgICAgICBpZiBvLm9wZXJhdG9yLnRleHQgPT0gJy0nIGFuZCBub3Qgby5saHMgYW5kIG8ucmhzPy50eXBlID09ICdudW0nXG4gICAgICAgICAgICAgICAgICAgIG5pID0gcGFyc2VJbnQgby5yaHMudGV4dFxuICAgICAgICAgICAgICAgICAgICBpZiBuaSA9PSAxXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCIje0Bub2RlKHAuaWR4ZWUpfS5zbGljZSgtI3tuaX0pWzBdXCJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiI3tAbm9kZShwLmlkeGVlKX0uc2xpY2UoLSN7bml9LC0je25pLTF9KVswXVwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFwiI3tAbm9kZShwLmlkeGVlKX1bI3tAbm9kZSBwLnNsaWR4fV1cIlxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBhcnJheTogKHApIC0+XG5cbiAgICAgICAgaWYgcC5pdGVtc1swXT8uc2xpY2VcbiAgICAgICAgICAgIEBzbGljZSBwLml0ZW1zWzBdLnNsaWNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFwiWyN7QG5vZGVzIHAuaXRlbXMsICcsJ31dXCJcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc2xpY2U6ICAocCkgLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBwLmZyb20udHlwZSA9PSAnbnVtJyA9PSBwLnVwdG8udHlwZVxuICAgICAgICAgICAgZnJvbSA9IHBhcnNlSW50IHAuZnJvbS50ZXh0XG4gICAgICAgICAgICB1cHRvID0gcGFyc2VJbnQgcC51cHRvLnRleHRcbiAgICAgICAgICAgIGlmIHVwdG8tZnJvbSA8PSAxMFxuICAgICAgICAgICAgICAgIGlmIHAuZG90cy50ZXh0ID09ICcuLi4nIHRoZW4gdXB0by0tXG4gICAgICAgICAgICAgICAgJ1snKygoeCBmb3IgeCBpbiBbZnJvbS4udXB0b10pLmpvaW4gJywnKSsnXSdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvID0gaWYgcC5kb3RzLnRleHQgPT0gJy4uLicgdGhlbiAnPCcgZWxzZSAnPD0nXG4gICAgICAgICAgICAgICAgXCIoZnVuY3Rpb24oKSB7IHZhciByID0gW107IGZvciAodmFyIGkgPSAje2Zyb219OyBpICN7b30gI3t1cHRvfTsgaSsrKXsgci5wdXNoKGkpOyB9IHJldHVybiByOyB9KS5hcHBseSh0aGlzKVwiXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBvID0gaWYgcC5kb3RzLnRleHQgPT0gJy4uLicgdGhlbiAnPCcgZWxzZSAnPD0nXG4gICAgICAgICAgICBcIihmdW5jdGlvbigpIHsgdmFyIHIgPSBbXTsgZm9yICh2YXIgaSA9ICN7QG5vZGUgcC5mcm9tfTsgaSAje299ICN7QG5vZGUgcC51cHRvfTsgaSsrKXsgci5wdXNoKGkpOyB9IHJldHVybiByOyB9KS5hcHBseSh0aGlzKVwiXG4gICAgICAgICAgICBcbiAgICB2ZXJiOiAtPiBpZiBAdmVyYm9zZSB0aGVuIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHMgXG4gICAgaW5kOiAtPlxuICAgICAgICBcbiAgICAgICAgb2kgPSBAaW5kZW50XG4gICAgICAgIEBpbmRlbnQgKz0gJyAgICAnXG4gICAgICAgIG9pXG4gICAgICAgIFxuICAgIGRlZDogLT5cbiAgICAgICAgXG4gICAgICAgIEBpbmRlbnQgPSBAaW5kZW50Wy4uLi00XVxuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBSZW5kZXJlclxuIl19
//# sourceURL=../coffee/renderer.coffee