// koffee 1.20.0

/*
00000000   00000000  000   000  0000000    00000000  00000000   00000000  00000000
000   000  000       0000  000  000   000  000       000   000  000       000   000
0000000    0000000   000 0 000  000   000  0000000   0000000    0000000   0000000
000   000  000       000  0000  000   000  000       000   000  000       000   000
000   000  00000000  000   000  0000000    00000000  000   000  00000000  000   000
 */
var Renderer, empty, kstr, print;

kstr = require('kstr');

print = require('./print');

empty = function(a) {
    return (a === '' || a === null || a === (void 0)) || (typeof a === 'object' && Object.keys(a).length === 0);
};

Renderer = (function() {
    function Renderer(kode) {
        var ref, ref1;
        this.kode = kode;
        this.debug = (ref = this.kode.args) != null ? ref.debug : void 0;
        this.verbose = (ref1 = this.kode.args) != null ? ref1.verbose : void 0;
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
                        console.log(R4('renderer.node unhandled exp'), exp);
                        return '';
                }
            }).call(this);
        }
        return s;
    };

    Renderer.prototype["class"] = function(n) {
        var i, len, m, mthds, ref, ref1, ref2, ref3, ref4, ref5, s;
        s = '';
        s += "class " + n.name.text;
        if (n["extends"]) {
            s += " extends " + n["extends"].map(function(e) {
                return e.text;
            }).join(', ');
        }
        s += '\n{';
        mthds = (ref = (ref1 = n.body) != null ? (ref2 = ref1.object) != null ? ref2.keyvals : void 0 : void 0) != null ? ref : (ref3 = n.body) != null ? (ref4 = ref3[0]) != null ? (ref5 = ref4.object) != null ? ref5.keyvals : void 0 : void 0 : void 0;
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
        var ast, b, base, bind, bn, constructor, i, l, len, len1, m, name, ref;
        bind = [];
        for (i = 0, len = mthds.length; i < len; i++) {
            m = mthds[i];
            if (!m.keyval) {
                if (!m.type === 'comment') {
                    console.log('wtf?', m);
                    print.ast('not an method?', m);
                }
                continue;
            }
            name = m.keyval.key.text;
            if (name === '@' || name === 'constructor') {
                if (constructor) {
                    console.error('more than one constructor?');
                }
                m.keyval.key.text = 'constructor';
                constructor = m;
            } else if (name.startsWith("'this.")) {
                m.keyval.key.text = 'static ' + name.slice(6, -1);
            } else if (((ref = m.keyval.val.func) != null ? ref.arrow.text : void 0) === '=>') {
                bind.push(m);
            }
        }
        if (bind.length && !constructor) {
            ast = this.kode.ast("constructor: ->");
            if (this.debug) {
                print.noon('ast', ast);
            }
            constructor = ast.exps[0].object.keyvals[0];
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
                bn = b.keyval.key.text;
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
            s = this.indent + this.func(n.keyval.val.func, n.keyval.key.text);
        }
        return s;
    };

    Renderer.prototype.func = function(n, name) {
        var args, gi, ref, ref1, s, ss, v, vs;
        if (name == null) {
            name = 'function';
        }
        gi = this.ind();
        s = name;
        s += ' (';
        args = (ref = n.args) != null ? (ref1 = ref.parens) != null ? ref1.exps : void 0 : void 0;
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
                var i, len, ref2, results;
                ref2 = n.body.vars;
                results = [];
                for (i = 0, len = ref2.length; i < len; i++) {
                    v = ref2[i];
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
            if (!ss.slice(-1)[0].startsWith('return') && name !== 'constructor') {
                ss.push('return ' + kstr.lstrip(ss.pop()));
            }
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
        var ref;
        if ((ref = p.callee.text) === 'log' || ref === 'warn' || ref === 'error') {
            p.callee.text = "console." + p.callee.text;
        }
        return (this.node(p.callee)) + "(" + (this.nodes(p.args, ',')) + ")";
    };

    Renderer.prototype["if"] = function(n) {
        var e, elif, gi, i, l, len, len1, len2, len3, q, r, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, s;
        if (!n.then) {
            console.error('if expected then', n);
        }
        gi = this.ind();
        s = '';
        s += "if (" + (this.node(n.exp)) + ")\n";
        s += gi + "{\n";
        ref1 = (ref = n.then.exps) != null ? ref : [];
        for (i = 0, len = ref1.length; i < len; i++) {
            e = ref1[i];
            s += this.indent + this.node(e) + '\n';
        }
        s += gi + "}";
        ref3 = (ref2 = n.elifs) != null ? ref2 : [];
        for (l = 0, len1 = ref3.length; l < len1; l++) {
            elif = ref3[l];
            s += '\n';
            s += gi + ("else if (" + (this.node(elif.elif.exp)) + ")\n");
            s += gi + "{\n";
            ref5 = (ref4 = elif.elif.then.exps) != null ? ref4 : [];
            for (q = 0, len2 = ref5.length; q < len2; q++) {
                e = ref5[q];
                s += this.indent + this.node(e) + '\n';
            }
            s += gi + "}";
        }
        if (n["else"]) {
            s += '\n';
            s += gi + 'else\n';
            s += gi + "{\n";
            ref7 = (ref6 = n["else"].exps) != null ? ref6 : [];
            for (r = 0, len3 = ref7.length; r < len3; r++) {
                e = ref7[r];
                s += this.indent + this.node(e) + '\n';
            }
            s += gi + "}";
        }
        this.ded();
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
        var e, gi, i, j, l, len, len1, list, listVar, lv, q, ref, ref1, ref2, ref3, ref4, results, s, v;
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
        } else if ((ref = n.vals.array) != null ? ref.items : void 0) {
            s += gi + ("for (var i = 0; i < " + listVar + ".length; i++)\n");
            s += gi + "{\n";
            ref2 = (function() {
                results = [];
                for (var l = 0, ref1 = n.vals.array.items.length; 0 <= ref1 ? l < ref1 : l > ref1; 0 <= ref1 ? l++ : l--){ results.push(l); }
                return results;
            }).apply(this);
            for (i = 0, len = ref2.length; i < len; i++) {
                j = ref2[i];
                v = n.vals.array.items[j];
                s += this.indent + ("var " + v.text + " = " + listVar + "[i][" + j + "]\n");
            }
        } else if (n.vals.length > 1) {
            lv = n.vals[1].text;
            s += gi + ("for (var " + lv + " = 0; " + lv + " < " + listVar + ".length; " + lv + "++)\n");
            s += gi + "{\n";
            s += this.indent + ("var " + n.vals[0].text + " = " + listVar + "[i]\n");
        }
        ref4 = (ref3 = n.then.exps) != null ? ref3 : [];
        for (q = 0, len1 = ref4.length; q < len1; q++) {
            e = ref4[q];
            s += this.indent + this.node(e) + '\n';
        }
        s += gi + "}";
        this.ded();
        return s;
    };

    Renderer.prototype.for_of = function(n) {
        var e, gi, i, key, len, obj, ref, ref1, ref2, ref3, ref4, s, val;
        gi = this.ind();
        key = (ref = n.vals.text) != null ? ref : (ref1 = n.vals[0]) != null ? ref1.text : void 0;
        val = (ref2 = n.vals[1]) != null ? ref2.text : void 0;
        obj = this.node(n.list);
        s = '';
        s += "for (" + key + " in " + obj + ")\n";
        s += gi + "{\n";
        if (val) {
            s += this.indent + (val + " = " + obj + "[" + key + "]\n");
        }
        ref4 = (ref3 = n.then.exps) != null ? ref3 : [];
        for (i = 0, len = ref4.length; i < len; i++) {
            e = ref4[i];
            s += this.indent + this.node(e) + '\n';
        }
        s += gi + "}";
        this.ded();
        return s;
    };

    Renderer.prototype["while"] = function(n) {
        var e, gi, i, len, ref, ref1, s;
        if (!n.then) {
            console.error('when expected then', n);
        }
        gi = this.ind();
        s = '';
        s += "while (" + (this.node(n.cond)) + ")\n";
        s += gi + "{\n";
        ref1 = (ref = n.then.exps) != null ? ref : [];
        for (i = 0, len = ref1.length; i < len; i++) {
            e = ref1[i];
            s += this.indent + this.node(e) + '\n';
        }
        s += gi + "}";
        this.ded();
        return s;
    };

    Renderer.prototype["switch"] = function(n) {
        var e, gi, i, l, len, len1, ref, ref1, ref2, s;
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
        ref1 = (ref = n.whens) != null ? ref : [];
        for (i = 0, len = ref1.length; i < len; i++) {
            e = ref1[i];
            s += gi + this.node(e) + '\n';
        }
        if (n["else"]) {
            s += this.indent + 'default:\n';
            ref2 = n["else"];
            for (l = 0, len1 = ref2.length; l < len1; l++) {
                e = ref2[l];
                s += this.indent + '    ' + this.node(e) + '\n';
            }
        }
        s += gi + "}\n";
        this.ded();
        return s;
    };

    Renderer.prototype.when = function(n) {
        var e, i, l, len, len1, ref, ref1, ref2, s;
        if (!n.vals) {
            return console.error('when expected vals', n);
        }
        if (!n.then) {
            return console.error('when expected then', n);
        }
        s = '';
        ref = n.vals;
        for (i = 0, len = ref.length; i < len; i++) {
            e = ref[i];
            s += '    case ' + this.node(e) + ':\n';
        }
        ref2 = (ref1 = n.then.exps) != null ? ref1 : [];
        for (l = 0, len1 = ref2.length; l < len1; l++) {
            e = ref2[l];
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
        var close, o, open, opmap, ref, ref1, ref2, ref3, ro, sep;
        opmap = function(o) {
            var omp, ref;
            omp = {
                and: '&&',
                or: '||',
                not: '!',
                '==': '===',
                '!=': '!=='
            };
            return (ref = omp[o]) != null ? ref : o;
        };
        o = opmap(op.operator.text);
        sep = ' ';
        if (!op.lhs || !op.rhs) {
            sep = '';
        }
        if (o === '<' || o === '<=' || o === '===' || o === '!==' || o === '>=' || o === '>') {
            ro = opmap((ref = op.rhs) != null ? (ref1 = ref.operation) != null ? ref1.operator.text : void 0 : void 0);
            if (ro === '<' || ro === '<=' || ro === '===' || ro === '!==' || ro === '>=' || ro === '>') {
                return '(' + this.node(op.lhs) + sep + o + sep + this.node(op.rhs.operation.lhs) + ' && ' + kstr.lstrip(this.node(op.rhs)) + ')';
            }
        }
        open = close = '';
        if (o !== '=' && ((ref2 = op.rhs) != null ? (ref3 = ref2.operation) != null ? ref3.operator.text : void 0 : void 0) === '=') {
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
        return (this.node(p.key)) + ":" + (this.node(p.val));
    };

    Renderer.prototype.prop = function(p) {
        return (this.node(p.obj)) + "." + (this.node(p.prop));
    };

    Renderer.prototype.index = function(p) {
        var add, ni, o, ref;
        if (p.slidx.slice) {
            add = '';
            if (p.slidx.slice.dots.text === '..') {
                add = '+1';
            }
            return (this.node(p.idxee)) + ".slice(" + (this.node(p.slidx.slice.from)) + ", " + (this.node(p.slidx.slice.upto)) + add + ")";
        } else {
            if (p.slidx.operation) {
                o = p.slidx.operation;
                if (o.operator.text === '-' && !o.lhs && ((ref = o.rhs) != null ? ref.type : void 0) === 'num') {
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
        var ref;
        if ((ref = p.items[0]) != null ? ref.slice : void 0) {
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
                    var i, ref, ref1, results;
                    results = [];
                    for (x = i = ref = from, ref1 = upto; ref <= ref1 ? i <= ref1 : i >= ref1; x = ref <= ref1 ? ++i : --i) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsSUFBQSxHQUFRLE9BQUEsQ0FBUSxNQUFSOztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFDUixLQUFBLEdBQVEsU0FBQyxDQUFEO1dBQU8sQ0FBQSxDQUFBLEtBQU0sRUFBTixJQUFBLENBQUEsS0FBUyxJQUFULElBQUEsQ0FBQSxLQUFjLFFBQWQsQ0FBQSxJQUE0QixDQUFDLE9BQU8sQ0FBUCxLQUFhLFFBQWIsSUFBMEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUFaLENBQWMsQ0FBQyxNQUFmLEtBQXlCLENBQXBEO0FBQW5DOztBQUVGO0lBRUMsa0JBQUMsSUFBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxLQUFELHVDQUFxQixDQUFFO1FBQ3ZCLElBQUMsQ0FBQSxPQUFELHlDQUFxQixDQUFFO0lBSHhCOzt1QkFLSCxNQUFBLEdBQVEsU0FBQyxHQUFEO0FBRUosWUFBQTtRQUFBLElBQUMsQ0FBQSxNQUFELEdBQVU7UUFDVixDQUFBLEdBQUk7UUFDSixDQUFBLElBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFULENBQWEsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxDQUFEO3VCQUFPLEtBQUMsQ0FBQSxJQUFELENBQU0sQ0FBTjtZQUFQO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFiLENBQTRCLENBQUMsSUFBN0IsQ0FBa0MsSUFBbEM7ZUFDTDtJQUxJOzt1QkFPUixLQUFBLEdBQU8sU0FBQyxLQUFELEVBQVEsR0FBUjtBQUNILFlBQUE7O1lBRFcsTUFBSTs7UUFDZixFQUFBLEdBQUssS0FBSyxDQUFDLEdBQU4sQ0FBVSxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLENBQUQ7dUJBQU8s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RCxDQUFNLENBQUMsQ0FBQyxJQUFSLENBQUQsQ0FBekMsR0FBdUQsTUFBdkQsR0FBNkQsQ0FBN0QsR0FBK0QsR0FBL0QsR0FBaUUsQ0FBQyxJQUFDLENBQUEsSUFBRCxDQUFNLENBQUMsQ0FBQyxJQUFSLENBQUQsQ0FBakUsR0FBK0UsZ0RBWG5GOztJQUZJOzt1QkFlUixJQUFBLEdBQU0sU0FBQTtRQUFHLElBQUcsSUFBQyxDQUFBLE9BQUo7bUJBQWlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBWixDQUFrQixPQUFPLENBQUMsR0FBMUIsRUFBK0IsU0FBL0IsRUFBakI7O0lBQUg7O3VCQUNOLEdBQUEsR0FBSyxTQUFBO0FBRUQsWUFBQTtRQUFBLEVBQUEsR0FBSyxJQUFDLENBQUE7UUFDTixJQUFDLENBQUEsTUFBRCxJQUFXO2VBQ1g7SUFKQzs7dUJBTUwsR0FBQSxHQUFLLFNBQUE7ZUFFRCxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxNQUFPO0lBRmpCOzs7Ozs7QUFJVCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxua3N0ciAgPSByZXF1aXJlICdrc3RyJ1xucHJpbnQgPSByZXF1aXJlICcuL3ByaW50J1xuZW1wdHkgPSAoYSkgLT4gYSBpbiBbJycgbnVsbCB1bmRlZmluZWRdIG9yICh0eXBlb2YoYSkgPT0gJ29iamVjdCcgYW5kIE9iamVjdC5rZXlzKGEpLmxlbmd0aCA9PSAwKVxuXG5jbGFzcyBSZW5kZXJlclxuXG4gICAgQDogKEBrb2RlKSAtPlxuXG4gICAgICAgIEBkZWJ1ZyAgID0gQGtvZGUuYXJncz8uZGVidWdcbiAgICAgICAgQHZlcmJvc2UgPSBAa29kZS5hcmdzPy52ZXJib3NlXG5cbiAgICByZW5kZXI6IChhc3QpIC0+XG5cbiAgICAgICAgQGluZGVudCA9ICcnXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IGFzdC5leHBzLm1hcCgocykgPT4gQG5vZGUgcykuam9pbiAnXFxuJ1xuICAgICAgICBzXG5cbiAgICBub2RlczogKG5vZGVzLCBzZXA9JywnKSAtPlxuICAgICAgICBzcyA9IG5vZGVzLm1hcCAocykgPT4gQG5vZGUgc1xuICAgICAgICBzcy5qb2luIHNlcFxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcblxuICAgIG5vZGU6IChleHApIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gJycgaWYgbm90IGV4cFxuXG4gICAgICAgIGlmIGV4cC50eXBlPyBhbmQgZXhwLnRleHQ/IHRoZW4gcmV0dXJuIEB0b2tlbiBleHBcblxuICAgICAgICBpZiBleHAgaW5zdGFuY2VvZiBBcnJheSB0aGVuIHJldHVybiAoQG5vZGUoYSkgZm9yIGEgaW4gZXhwKS5qb2luICc7XFxuJ1xuXG4gICAgICAgIHMgPSAnJ1xuXG4gICAgICAgIGZvciBrLHYgb2YgZXhwXG5cbiAgICAgICAgICAgIHMgKz0gc3dpdGNoIGtcbiAgICAgICAgICAgICAgICB3aGVuICdpZicgICAgICAgIHRoZW4gQGlmIHZcbiAgICAgICAgICAgICAgICB3aGVuICdmb3InICAgICAgIHRoZW4gQGZvciB2XG4gICAgICAgICAgICAgICAgd2hlbiAnd2hpbGUnICAgICB0aGVuIEB3aGlsZSB2XG4gICAgICAgICAgICAgICAgd2hlbiAncmV0dXJuJyAgICB0aGVuIEByZXR1cm4gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2NsYXNzJyAgICAgdGhlbiBAY2xhc3MgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3N3aXRjaCcgICAgdGhlbiBAc3dpdGNoIHZcbiAgICAgICAgICAgICAgICB3aGVuICd3aGVuJyAgICAgIHRoZW4gQHdoZW4gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ29wZXJhdGlvbicgdGhlbiBAb3BlcmF0aW9uIHZcbiAgICAgICAgICAgICAgICB3aGVuICdpbmNvbmQnICAgIHRoZW4gQGluY29uZCB2XG4gICAgICAgICAgICAgICAgd2hlbiAncGFyZW5zJyAgICB0aGVuIEBwYXJlbnMgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ29iamVjdCcgICAgdGhlbiBAb2JqZWN0IHZcbiAgICAgICAgICAgICAgICB3aGVuICdrZXl2YWwnICAgIHRoZW4gQGtleXZhbCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnYXJyYXknICAgICB0aGVuIEBhcnJheSB2XG4gICAgICAgICAgICAgICAgd2hlbiAnaW5kZXgnICAgICB0aGVuIEBpbmRleCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnc2xpY2UnICAgICB0aGVuIEBzbGljZSB2XG4gICAgICAgICAgICAgICAgd2hlbiAncHJvcCcgICAgICB0aGVuIEBwcm9wIHZcbiAgICAgICAgICAgICAgICB3aGVuICdmdW5jJyAgICAgIHRoZW4gQGZ1bmMgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2NhbGwnICAgICAgdGhlbiBAY2FsbCB2XG4gICAgICAgICAgICAgICAgd2hlbiAndmFyJyAgICAgICB0aGVuIHYudGV4dFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbG9nIFI0KCdyZW5kZXJlci5ub2RlIHVuaGFuZGxlZCBleHAnKSwgZXhwICMgaWYgQGRlYnVnIG9yIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgICAgICcnXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbiAgICBjbGFzczogKG4pIC0+XG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJjbGFzcyAje24ubmFtZS50ZXh0fVwiXG5cbiAgICAgICAgaWYgbi5leHRlbmRzXG4gICAgICAgICAgICBzICs9IFwiIGV4dGVuZHMgXCIgKyBuLmV4dGVuZHMubWFwKChlKSAtPiBlLnRleHQpLmpvaW4gJywgJ1xuXG4gICAgICAgIHMgKz0gJ1xcbnsnXG5cbiAgICAgICAgbXRoZHMgPSBuLmJvZHk/Lm9iamVjdD8ua2V5dmFscyA/IG4uYm9keT9bMF0/Lm9iamVjdD8ua2V5dmFsc1xuICAgICAgICBcbiAgICAgICAgaWYgbXRoZHM/Lmxlbmd0aFxuICAgICAgICAgICAgbXRoZHMgPSBAcHJlcGFyZU1ldGhvZHMgbXRoZHNcbiAgICAgICAgICAgIEBpbmRlbnQgPSAnICAgICdcbiAgICAgICAgICAgIGZvciBtIGluIG10aGRzXG4gICAgICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgICAgIHMgKz0gQG10aGQgbVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgQGluZGVudCA9ICcnXG4gICAgICAgIHMgKz0gJ30nXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuICAgIFxuICAgIHByZXBhcmVNZXRob2RzOiAobXRoZHMpIC0+XG5cbiAgICAgICAgYmluZCA9IFtdXG4gICAgICAgIGZvciBtIGluIG10aGRzXG4gICAgICAgICAgICBpZiBub3QgbS5rZXl2YWwgXG4gICAgICAgICAgICAgICAgaWYgbm90IG0udHlwZSA9PSAnY29tbWVudCdcbiAgICAgICAgICAgICAgICAgICAgbG9nICd3dGY/JyBtIFxuICAgICAgICAgICAgICAgICAgICBwcmludC5hc3QgJ25vdCBhbiBtZXRob2Q/JyBtXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIG5hbWUgPSBtLmtleXZhbC5rZXkudGV4dFxuICAgICAgICAgICAgaWYgbmFtZSBpbiBbJ0AnICdjb25zdHJ1Y3RvciddXG4gICAgICAgICAgICAgICAgaWYgY29uc3RydWN0b3IgdGhlbiBlcnJvciAnbW9yZSB0aGFuIG9uZSBjb25zdHJ1Y3Rvcj8nXG4gICAgICAgICAgICAgICAgbS5rZXl2YWwua2V5LnRleHQ9ICdjb25zdHJ1Y3RvcidcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvciA9IG1cbiAgICAgICAgICAgIGVsc2UgaWYgbmFtZS5zdGFydHNXaXRoIFwiJ3RoaXMuXCIgIydAJ1xuICAgICAgICAgICAgICAgIG0ua2V5dmFsLmtleS50ZXh0ID0gJ3N0YXRpYyAnICsgbmFtZVs2Li4tMl1cbiAgICAgICAgICAgIGVsc2UgaWYgbS5rZXl2YWwudmFsLmZ1bmM/LmFycm93LnRleHQgPT0gJz0+J1xuICAgICAgICAgICAgICAgIGJpbmQucHVzaCBtXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGJpbmQubGVuZ3RoIGFuZCBub3QgY29uc3RydWN0b3IgIyBmb3VuZCBzb21lIG1ldGhvZHMgdG8gYmluZCwgYnV0IG5vIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICBhc3QgPSBAa29kZS5hc3QgXCJjb25zdHJ1Y3RvcjogLT5cIiAjIGNyZWF0ZSBvbmUgZnJvbSBzY3JhdGNoXG4gICAgICAgICAgICBwcmludC5ub29uICdhc3QnIGFzdCBpZiBAZGVidWdcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yID0gYXN0LmV4cHNbMF0ub2JqZWN0LmtleXZhbHNbMF1cbiAgICAgICAgICAgIG10aGRzLnVuc2hpZnQgY29uc3RydWN0b3JcbiAgICAgICAgICAgIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgIHByaW50Lm5vb24gJ2NvbnN0cnVjdG9yJyBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgICAgIHByaW50LmFzdCAnaW1wbGljaXQgY29uc3RydWN0b3InIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICAgICAgcHJpbnQuYXN0ICdtdGhkcyB3aXRoIGltcGxpY2l0IGNvbnN0cnVjdG9yJyBtdGhkc1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIGJpbmQubGVuZ3RoXG4gICAgICAgICAgICBmb3IgYiBpbiBiaW5kXG4gICAgICAgICAgICAgICAgYm4gPSBiLmtleXZhbC5rZXkudGV4dFxuICAgICAgICAgICAgICAgIEB2ZXJiICdtZXRob2QgdG8gYmluZDonIGJuXG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3Iua2V5dmFsLnZhbC5mdW5jLmJvZHkuZXhwcyA/PSBbXVxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLmtleXZhbC52YWwuZnVuYy5ib2R5LmV4cHMucHVzaCBcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NvZGUnXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwidGhpcy4je2JufSA9IHRoaXMuI3tibn0uYmluZCh0aGlzKVwiXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJpbnQuYXN0ICdjb25zdHJ1Y3RvciBhZnRlciBiaW5kJyBjb25zdHJ1Y3RvciBpZiBAZGVidWdcblxuICAgICAgICBwcmludC5hc3QgJ3ByZXBhcmVkIG10aGRzJyBtdGhkcyBpZiBAZGVidWdcbiAgICAgICAgbXRoZHNcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIG10aGQ6IChuKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbi5rZXl2YWxcbiAgICAgICAgICAgIHMgPSBAaW5kZW50ICsgQGZ1bmMgbi5rZXl2YWwudmFsLmZ1bmMsIG4ua2V5dmFsLmtleS50ZXh0XG4gICAgICAgIHNcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAgICAgICAgIFxuICAgIGZ1bmM6IChuLCBuYW1lPSdmdW5jdGlvbicpIC0+XG4gICAgICAgIFxuICAgICAgICBnaSA9IEBpbmQoKVxuICAgICAgICBcbiAgICAgICAgcyA9IG5hbWVcbiAgICAgICAgcyArPSAnICgnXG4gICAgICAgIGFyZ3MgPSBuLmFyZ3M/LnBhcmVucz8uZXhwc1xuICAgICAgICBpZiBhcmdzXG4gICAgICAgICAgICBzICs9IGFyZ3MubWFwKChhKSA9PiBAbm9kZSBhKS5qb2luICcsICdcbiAgICAgICAgcyArPSAnKVxcbidcbiAgICAgICAgcyArPSBnaSArICd7J1xuICAgICAgICBcbiAgICAgICAgaWYgbm90IGVtcHR5IG4uYm9keS52YXJzXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICB2cyA9ICh2LnRleHQgZm9yIHYgaW4gbi5ib2R5LnZhcnMpLmpvaW4gJywgJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgXCJ2YXIgI3t2c31cXG5cIlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IGVtcHR5IG4uYm9keS5leHBzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIHNzID0gbi5ib2R5LmV4cHMubWFwIChzKSA9PiBAbm9kZSBzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG5vdCBzc1stMV0uc3RhcnRzV2l0aCgncmV0dXJuJykgYW5kIG5hbWUgIT0gJ2NvbnN0cnVjdG9yJ1xuICAgICAgICAgICAgICAgIHNzLnB1c2ggJ3JldHVybiAnICsga3N0ci5sc3RyaXAgc3MucG9wKClcbiAgICAgICAgICAgIHNzID0gc3MubWFwIChzKSA9PiBAaW5kZW50ICsgc1xuICAgICAgICAgICAgcyArPSBzcy5qb2luICdcXG4nXG4gICAgICAgICAgICBzICs9ICdcXG4nICsgZ2lcbiAgICAgICAgcyArPSAnfSdcbiAgICAgICAgXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICByZXR1cm46IChuKSAtPlxuXG4gICAgICAgIHMgPSAncmV0dXJuJ1xuICAgICAgICBzICs9ICcgJyArIEBub2RlIG4udmFsXG4gICAgICAgIGtzdHIuc3RyaXAgc1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGNhbGw6IChwKSAtPlxuICAgICAgICBpZiBwLmNhbGxlZS50ZXh0IGluIFsnbG9nJyd3YXJuJydlcnJvciddXG4gICAgICAgICAgICBwLmNhbGxlZS50ZXh0ID0gXCJjb25zb2xlLiN7cC5jYWxsZWUudGV4dH1cIlxuICAgICAgICBcIiN7QG5vZGUocC5jYWxsZWUpfSgje0Bub2RlcyBwLmFyZ3MsICcsJ30pXCJcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwMDAwXG4gICAgIyAwMDAgIDAwMFxuICAgICMgMDAwICAwMDBcblxuICAgIGlmOiAobikgLT5cblxuICAgICAgICBpZiBub3Qgbi50aGVuIHRoZW4gZXJyb3IgJ2lmIGV4cGVjdGVkIHRoZW4nIG5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwiaWYgKCN7QG5vZGUobi5leHApfSlcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIGZvciBlIGluIG4udGhlbi5leHBzID8gW11cbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIGZvciBlbGlmIGluIG4uZWxpZnMgPyBbXVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaSArIFwiZWxzZSBpZiAoI3tAbm9kZShlbGlmLmVsaWYuZXhwKX0pXFxuXCJcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgICAgIGZvciBlIGluIGVsaWYuZWxpZi50aGVuLmV4cHMgPyBbXVxuICAgICAgICAgICAgICAgIHMgKz0gQGluZGVudCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ9XCJcblxuICAgICAgICBpZiBuLmVsc2VcbiAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIHMgKz0gZ2kgKyAnZWxzZVxcbidcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgICAgIGZvciBlIGluIG4uZWxzZS5leHBzID8gW11cbiAgICAgICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaStcIn1cIlxuICAgICAgICAgICAgXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgZm9yOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBuLnRoZW4gdGhlbiBlcnJvciAnZm9yIGV4cGVjdGVkIHRoZW4nIG5cblxuICAgICAgICBzd2l0Y2ggbi5pbm9mLnRleHQgXG4gICAgICAgICAgICB3aGVuICdpbicgdGhlbiBAZm9yX2luIG5cbiAgICAgICAgICAgIHdoZW4gJ29mJyB0aGVuIEBmb3Jfb2YgblxuICAgICAgICAgICAgZWxzZSBlcnJvciAnZm9yIGV4cGVjdGVkIGluL29mJ1xuICAgICAgICBcbiAgICBmb3JfaW46IChuKSAtPlxuICAgICAgICBcbiAgICAgICAgZ2kgPSBAaW5kKClcblxuICAgICAgICBsaXN0ID0gQG5vZGUgbi5saXN0XG4gICAgICAgIFxuICAgICAgICBpZiBub3QgbGlzdCBvciBsaXN0ID09ICd1bmRlZmluZWQnXG4gICAgICAgICAgICBwcmludC5ub29uICdubyBsaXN0IGZvcicgbi5saXN0XG4gICAgICAgICAgICBwcmludC5hc3QgJ25vIGxpc3QgZm9yJyBuLmxpc3RcbiAgICAgICAgICAgIFxuICAgICAgICBsaXN0VmFyID0gJ2xpc3QnICAgIFxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcInZhciAje2xpc3RWYXJ9ID0gI3tsaXN0fVxcblwiXG4gICAgICAgIGlmIG4udmFscy50ZXh0XG4gICAgICAgICAgICBzICs9IGdpK1wiZm9yICh2YXIgaSA9IDA7IGkgPCAje2xpc3RWYXJ9Lmxlbmd0aDsgaSsrKVxcblwiXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQrXCJ2YXIgI3tuLnZhbHMudGV4dH0gPSAje2xpc3RWYXJ9W2ldXFxuXCJcbiAgICAgICAgZWxzZSBpZiBuLnZhbHMuYXJyYXk/Lml0ZW1zXG4gICAgICAgICAgICBzICs9IGdpK1wiZm9yICh2YXIgaSA9IDA7IGkgPCAje2xpc3RWYXJ9Lmxlbmd0aDsgaSsrKVxcblwiXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBmb3IgaiBpbiAwLi4ubi52YWxzLmFycmF5Lml0ZW1zLmxlbmd0aFxuICAgICAgICAgICAgICAgIHYgPSBuLnZhbHMuYXJyYXkuaXRlbXNbal1cbiAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQrXCJ2YXIgI3t2LnRleHR9ID0gI3tsaXN0VmFyfVtpXVsje2p9XVxcblwiXG4gICAgICAgIGVsc2UgaWYgbi52YWxzLmxlbmd0aCA+IDFcbiAgICAgICAgICAgIGx2ID0gbi52YWxzWzFdLnRleHRcbiAgICAgICAgICAgIHMgKz0gZ2krXCJmb3IgKHZhciAje2x2fSA9IDA7ICN7bHZ9IDwgI3tsaXN0VmFyfS5sZW5ndGg7ICN7bHZ9KyspXFxuXCJcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCtcInZhciAje24udmFsc1swXS50ZXh0fSA9ICN7bGlzdFZhcn1baV1cXG5cIlxuICAgICAgICAgICAgXG4gICAgICAgIGZvciBlIGluIG4udGhlbi5leHBzID8gW11cbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBnaStcIn1cIlxuICAgICAgICAgICAgXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG4gICAgICAgIFxuICAgIGZvcl9vZjogKG4pIC0+XG4gICAgICAgIFxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIGtleSA9IG4udmFscy50ZXh0ID8gbi52YWxzWzBdPy50ZXh0XG4gICAgICAgIHZhbCA9IG4udmFsc1sxXT8udGV4dFxuICAgICAgICBcbiAgICAgICAgb2JqID0gQG5vZGUgbi5saXN0XG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwiZm9yICgje2tleX0gaW4gI3tvYmp9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgaWYgdmFsXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQrXCIje3ZhbH0gPSAje29ian1bI3trZXl9XVxcblwiXG4gICAgICAgIGZvciBlIGluIG4udGhlbi5leHBzID8gW11cbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBnaStcIn1cIlxuICAgICAgICAgICAgXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxuICAgIHdoaWxlOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBuLnRoZW4gdGhlbiBlcnJvciAnd2hlbiBleHBlY3RlZCB0aGVuJyBuXG5cbiAgICAgICAgZ2kgPSBAaW5kKClcblxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcIndoaWxlICgje0Bub2RlIG4uY29uZH0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4uZXhwcyA/IFtdXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcbiAgICAgICAgICAgIFxuICAgICAgICBAZGVkKClcbiAgICAgICAgc1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzd2l0Y2g6IChuKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IG4ubWF0Y2ggdGhlbiBlcnJvciAnc3dpdGNoIGV4cGVjdGVkIG1hdGNoJyBuXG4gICAgICAgIGlmIG5vdCBuLndoZW5zIHRoZW4gZXJyb3IgJ3N3aXRjaCBleHBlY3RlZCB3aGVucycgblxuXG4gICAgICAgIGdpID0gQGluZCgpXG4gICAgICAgIFxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcInN3aXRjaCAoI3tAbm9kZSBuLm1hdGNofSlcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIGZvciBlIGluIG4ud2hlbnMgPyBbXVxuICAgICAgICAgICAgcyArPSBnaSsgQG5vZGUoZSkgKyAnXFxuJyAgICAgICAgICAgIFxuICAgICAgICBpZiBuLmVsc2VcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCsnZGVmYXVsdDpcXG4nXG4gICAgICAgICAgICBmb3IgZSBpbiBuLmVsc2VcbiAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQrJyAgICAnKyBAbm9kZShlKSArICdcXG4nICAgICAgICAgICAgXG4gICAgICAgIHMgKz0gZ2krXCJ9XFxuXCJcblxuICAgICAgICBAZGVkKClcbiAgICAgICAgc1xuXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgd2hlbjogKG4pIC0+XG5cbiAgICAgICAgaWYgbm90IG4udmFscyB0aGVuIHJldHVybiBlcnJvciAnd2hlbiBleHBlY3RlZCB2YWxzJyBuXG4gICAgICAgIGlmIG5vdCBuLnRoZW4gdGhlbiByZXR1cm4gZXJyb3IgJ3doZW4gZXhwZWN0ZWQgdGhlbicgblxuICAgICAgICBcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIGZvciBlIGluIG4udmFsc1xuICAgICAgICAgICAgcyArPSAnICAgIGNhc2UgJyArIEBub2RlKGUpICsgJzpcXG4nXG4gICAgICAgIGZvciBlIGluIG4udGhlbi5leHBzID8gW11cbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArICcgICAgJyArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBAaW5kZW50ICsgJyAgICAnICsgJ2JyZWFrJ1xuICAgICAgICBzXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwMCAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwXG4gICAgIyAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICB0b2tlbjogKHRvaykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRvay50eXBlID09ICdjb21tZW50J1xuICAgICAgICAgICAgQGNvbW1lbnQgdG9rXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ3RoaXMnIFxuICAgICAgICAgICAgJ3RoaXMnXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ3RyaXBsZSdcbiAgICAgICAgICAgICdgJyArIHRvay50ZXh0WzMuLi00XSArICdgJ1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgPT0gJ3llcydcbiAgICAgICAgICAgICd0cnVlJ1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgPT0gJ25vJ1xuICAgICAgICAgICAgJ2ZhbHNlJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0b2sudGV4dFxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbiAgICBjb21tZW50OiAodG9rKSAtPlxuXG4gICAgICAgIGlmIHRvay50ZXh0LnN0YXJ0c1dpdGggJyMjIydcbiAgICAgICAgICAgICcvKicgKyB0b2sudGV4dFszLi4tNF0gKyAnKi8nICsgJ1xcbidcbiAgICAgICAgZWxzZSBpZiB0b2sudGV4dC5zdGFydHNXaXRoICcjJ1xuICAgICAgICAgICAga3N0ci5wYWQoJycsIHRvay5jb2wpICsgJy8vJyArIHRvay50ZXh0WzEuLi0xXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlcnJvciBcIiMgY29tbWVudCB0b2tlbiBleHBlY3RlZFwiXG4gICAgICAgICAgICAnJ1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgb3BlcmF0aW9uOiAob3ApIC0+XG4gICAgICAgIFxuICAgICAgICBvcG1hcCA9IChvKSAtPlxuICAgICAgICAgICAgb21wID1cbiAgICAgICAgICAgICAgICBhbmQ6ICAgICcmJidcbiAgICAgICAgICAgICAgICBvcjogICAgICd8fCdcbiAgICAgICAgICAgICAgICBub3Q6ICAgICchJ1xuICAgICAgICAgICAgICAgICc9PSc6ICAgJz09PSdcbiAgICAgICAgICAgICAgICAnIT0nOiAgICchPT0nXG4gICAgICAgICAgICBvbXBbb10gPyBvXG5cbiAgICAgICAgbyAgID0gb3BtYXAgb3Aub3BlcmF0b3IudGV4dFxuICAgICAgICBzZXAgPSAnICdcbiAgICAgICAgc2VwID0gJycgaWYgbm90IG9wLmxocyBvciBub3Qgb3AucmhzXG4gICAgICAgIFxuICAgICAgICBpZiBvIGluIFsnPCcnPD0nJz09PScnIT09Jyc+PScnPiddXG4gICAgICAgICAgICBybyA9IG9wbWFwIG9wLnJocz8ub3BlcmF0aW9uPy5vcGVyYXRvci50ZXh0XG4gICAgICAgICAgICBpZiBybyBpbiBbJzwnJzw9Jyc9PT0nJyE9PScnPj0nJz4nXVxuICAgICAgICAgICAgICAgIHJldHVybiAnKCcgKyBAbm9kZShvcC5saHMpICsgc2VwICsgbyArIHNlcCArIEBub2RlKG9wLnJocy5vcGVyYXRpb24ubGhzKSArICcgJiYgJyArIGtzdHIubHN0cmlwKEBub2RlKG9wLnJocykpICsgJyknXG5cbiAgICAgICAgb3BlbiA9IGNsb3NlID0gJydcbiAgICAgICAgaWYgbyAhPSAnPScgYW5kIG9wLnJocz8ub3BlcmF0aW9uPy5vcGVyYXRvci50ZXh0ID09ICc9J1xuICAgICAgICAgICAgb3BlbiA9ICcoJ1xuICAgICAgICAgICAgY2xvc2UgPSAnKSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQG5vZGUob3AubGhzKSArIHNlcCArIG8gKyBzZXAgKyBvcGVuICsga3N0ci5sc3RyaXAgQG5vZGUob3AucmhzKSArIGNsb3NlXG5cbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGluY29uZDogKHApIC0+XG4gICAgICAgIFxuICAgICAgICBcIiN7QG5vZGUgcC5yaHN9LmluZGV4T2YoI3tAbm9kZSBwLmxoc30pID49IDBcIlxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBwYXJlbnM6IChwKSAtPiBcIigje0Bub2RlcyBwLmV4cHN9KVwiXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgb2JqZWN0OiAocCkgLT4gXCJ7I3tAbm9kZXMgcC5rZXl2YWxzLCAnLCd9fVwiXG4gICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGtleXZhbDogKHApIC0+IFwiI3tAbm9kZShwLmtleSl9OiN7QG5vZGUocC52YWwpfVwiXG4gICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICBcbiAgICBcbiAgICBwcm9wOiAgIChwKSAtPiBcIiN7QG5vZGUocC5vYmopfS4je0Bub2RlIHAucHJvcH1cIlxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaW5kZXg6ICAocCkgLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBwLnNsaWR4LnNsaWNlXG4gICAgICAgICAgICBhZGQgPSAnJ1xuICAgICAgICAgICAgaWYgcC5zbGlkeC5zbGljZS5kb3RzLnRleHQgPT0gJy4uJ1xuICAgICAgICAgICAgICAgIGFkZCA9ICcrMSdcbiAgICAgICAgICAgIFwiI3tAbm9kZShwLmlkeGVlKX0uc2xpY2UoI3tAbm9kZSBwLnNsaWR4LnNsaWNlLmZyb219LCAje0Bub2RlIHAuc2xpZHguc2xpY2UudXB0b30je2FkZH0pXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgcC5zbGlkeC5vcGVyYXRpb24gXG4gICAgICAgICAgICAgICAgbyA9IHAuc2xpZHgub3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgaWYgby5vcGVyYXRvci50ZXh0ID09ICctJyBhbmQgbm90IG8ubGhzIGFuZCBvLnJocz8udHlwZSA9PSAnbnVtJ1xuICAgICAgICAgICAgICAgICAgICBuaSA9IHBhcnNlSW50IG8ucmhzLnRleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgbmkgPT0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiI3tAbm9kZShwLmlkeGVlKX0uc2xpY2UoLSN7bml9KVswXVwiXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcIiN7QG5vZGUocC5pZHhlZSl9LnNsaWNlKC0je25pfSwtI3tuaS0xfSlbMF1cIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcIiN7QG5vZGUocC5pZHhlZSl9WyN7QG5vZGUgcC5zbGlkeH1dXCJcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgYXJyYXk6IChwKSAtPlxuXG4gICAgICAgIGlmIHAuaXRlbXNbMF0/LnNsaWNlXG4gICAgICAgICAgICBAc2xpY2UgcC5pdGVtc1swXS5zbGljZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBcIlsje0Bub2RlcyBwLml0ZW1zLCAnLCd9XVwiXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNsaWNlOiAgKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgaWYgcC5mcm9tLnR5cGUgPT0gJ251bScgPT0gcC51cHRvLnR5cGVcbiAgICAgICAgICAgIGZyb20gPSBwYXJzZUludCBwLmZyb20udGV4dFxuICAgICAgICAgICAgdXB0byA9IHBhcnNlSW50IHAudXB0by50ZXh0XG4gICAgICAgICAgICBpZiB1cHRvLWZyb20gPD0gMTBcbiAgICAgICAgICAgICAgICBpZiBwLmRvdHMudGV4dCA9PSAnLi4uJyB0aGVuIHVwdG8tLVxuICAgICAgICAgICAgICAgICdbJysoKHggZm9yIHggaW4gW2Zyb20uLnVwdG9dKS5qb2luICcsJykrJ10nXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbyA9IGlmIHAuZG90cy50ZXh0ID09ICcuLi4nIHRoZW4gJzwnIGVsc2UgJzw9J1xuICAgICAgICAgICAgICAgIFwiKGZ1bmN0aW9uKCkgeyB2YXIgciA9IFtdOyBmb3IgKHZhciBpID0gI3tmcm9tfTsgaSAje299ICN7dXB0b307IGkrKyl7IHIucHVzaChpKTsgfSByZXR1cm4gcjsgfSkuYXBwbHkodGhpcylcIlxuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgbyA9IGlmIHAuZG90cy50ZXh0ID09ICcuLi4nIHRoZW4gJzwnIGVsc2UgJzw9J1xuICAgICAgICAgICAgXCIoZnVuY3Rpb24oKSB7IHZhciByID0gW107IGZvciAodmFyIGkgPSAje0Bub2RlIHAuZnJvbX07IGkgI3tvfSAje0Bub2RlIHAudXB0b307IGkrKyl7IHIucHVzaChpKTsgfSByZXR1cm4gcjsgfSkuYXBwbHkodGhpcylcIlxuICAgICAgICAgICAgXG4gICAgdmVyYjogLT4gaWYgQHZlcmJvc2UgdGhlbiBjb25zb2xlLmxvZy5hcHBseSBjb25zb2xlLmxvZywgYXJndW1lbnRzIFxuICAgIGluZDogLT5cbiAgICAgICAgXG4gICAgICAgIG9pID0gQGluZGVudFxuICAgICAgICBAaW5kZW50ICs9ICcgICAgJ1xuICAgICAgICBvaVxuICAgICAgICBcbiAgICBkZWQ6IC0+XG4gICAgICAgIFxuICAgICAgICBAaW5kZW50ID0gQGluZGVudFsuLi4tNF1cbiAgICBcbm1vZHVsZS5leHBvcnRzID0gUmVuZGVyZXJcbiJdfQ==
//# sourceURL=../coffee/renderer.coffee