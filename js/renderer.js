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
                if (this.verbose) {
                    console.log('method to bind:', bn);
                }
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
        var args, gi, id, ref, ref1, ref2, s, ss;
        if (name == null) {
            name = 'function';
        }
        id = '    ';
        gi = (ref = this.indent) != null ? ref : '';
        s = name;
        s += ' (';
        args = (ref1 = n.args) != null ? (ref2 = ref1.parens) != null ? ref2.exps : void 0 : void 0;
        if (args) {
            s += args.map((function(_this) {
                return function(a) {
                    return _this.node(a);
                };
            })(this)).join(', ');
        }
        s += ')\n';
        s += gi + '{';
        if (!empty(n.body.exps)) {
            this.indent = gi + id;
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
            this.indent = gi;
        }
        s += '}';
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
        var e, elif, gi, i, id, l, len, len1, len2, len3, q, r, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, s;
        if (!n.then) {
            console.error('if expected then', n);
        }
        id = '    ';
        gi = (ref = this.indent) != null ? ref : '';
        this.indent = gi + id;
        s = '';
        s += "if (" + (this.node(n.exp)) + ")\n";
        s += gi + "{\n";
        ref2 = (ref1 = n.then.exps) != null ? ref1 : [];
        for (i = 0, len = ref2.length; i < len; i++) {
            e = ref2[i];
            s += gi + id + this.node(e) + '\n';
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
                s += gi + id + this.node(e) + '\n';
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
                s += gi + id + this.node(e) + '\n';
            }
            s += gi + "}";
        }
        this.indent = gi;
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
        var e, gi, i, id, j, l, len, len1, list, listVar, lv, q, ref, ref1, ref2, ref3, ref4, ref5, results, s, v;
        id = '    ';
        gi = (ref = this.indent) != null ? ref : '';
        this.indent = gi + id;
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
            s += gi + id + ("var " + n.vals.text + " = " + listVar + "[i]\n");
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
                s += gi + id + ("var " + v.text + " = " + listVar + "[i][" + j + "]\n");
            }
        } else if (n.vals.length > 1) {
            lv = n.vals[1].text;
            s += gi + ("for (var " + lv + " = 0; " + lv + " < " + listVar + ".length; " + lv + "++)\n");
            s += gi + "{\n";
            s += gi + id + ("var " + n.vals[0].text + " = " + listVar + "[i]\n");
        }
        ref5 = (ref4 = n.then.exps) != null ? ref4 : [];
        for (q = 0, len1 = ref5.length; q < len1; q++) {
            e = ref5[q];
            s += gi + id + this.node(e) + '\n';
        }
        s += gi + "}";
        this.indent = gi;
        return s;
    };

    Renderer.prototype.for_of = function(n) {
        var e, gi, i, id, key, len, obj, ref, ref1, ref2, ref3, ref4, ref5, s, val;
        id = '    ';
        gi = (ref = this.indent) != null ? ref : '';
        this.indent = gi + id;
        key = (ref1 = n.vals.text) != null ? ref1 : (ref2 = n.vals[0]) != null ? ref2.text : void 0;
        val = (ref3 = n.vals[1]) != null ? ref3.text : void 0;
        obj = this.node(n.list);
        s = '';
        s += "for (" + key + " in " + obj + ")\n";
        s += gi + "{\n";
        if (val) {
            s += gi + id + (val + " = " + obj + "[" + key + "]\n");
        }
        ref5 = (ref4 = n.then.exps) != null ? ref4 : [];
        for (i = 0, len = ref5.length; i < len; i++) {
            e = ref5[i];
            s += gi + id + this.node(e) + '\n';
        }
        s += gi + "}";
        this.indent = gi;
        return s;
    };

    Renderer.prototype["while"] = function(n) {
        var e, gi, i, id, len, ref, ref1, ref2, s;
        if (!n.then) {
            console.error('when expected then', n);
        }
        id = '    ';
        gi = (ref = this.indent) != null ? ref : '';
        this.indent = gi + id;
        s = '';
        s += "while (" + (this.node(n.cond)) + ")\n";
        s += gi + "{\n";
        ref2 = (ref1 = n.then.exps) != null ? ref1 : [];
        for (i = 0, len = ref2.length; i < len; i++) {
            e = ref2[i];
            s += gi + id + this.node(e) + '\n';
        }
        s += gi + "}";
        this.indent = gi;
        return s;
    };

    Renderer.prototype["switch"] = function(n) {
        var e, gi, i, id, l, len, len1, ref, ref1, ref2, ref3, s;
        if (!n.match) {
            console.error('switch expected match', n);
        }
        if (!n.whens) {
            console.error('switch expected whens', n);
        }
        id = '    ';
        gi = (ref = this.indent) != null ? ref : '';
        this.indent = gi + id;
        s = '';
        s += "switch (" + (this.node(n.match)) + ")\n";
        s += gi + "{\n";
        ref2 = (ref1 = n.whens) != null ? ref1 : [];
        for (i = 0, len = ref2.length; i < len; i++) {
            e = ref2[i];
            s += gi + this.node(e) + '\n';
        }
        if (n["else"]) {
            s += gi + id + 'default:\n';
            ref3 = n["else"];
            for (l = 0, len1 = ref3.length; l < len1; l++) {
                e = ref3[l];
                s += gi + id + id + this.node(e) + '\n';
            }
        }
        s += gi + "}\n";
        this.indent = gi;
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

    return Renderer;

})();

module.exports = Renderer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsSUFBQSxHQUFRLE9BQUEsQ0FBUSxNQUFSOztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFDUixLQUFBLEdBQVEsU0FBQyxDQUFEO1dBQU8sQ0FBQSxDQUFBLEtBQU0sRUFBTixJQUFBLENBQUEsS0FBUyxJQUFULElBQUEsQ0FBQSxLQUFjLFFBQWQsQ0FBQSxJQUE0QixDQUFDLE9BQU8sQ0FBUCxLQUFhLFFBQWIsSUFBMEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUFaLENBQWMsQ0FBQyxNQUFmLEtBQXlCLENBQXBEO0FBQW5DOztBQUVGO0lBRUMsa0JBQUMsSUFBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxLQUFELHVDQUFxQixDQUFFO1FBQ3ZCLElBQUMsQ0FBQSxPQUFELHlDQUFxQixDQUFFO0lBSHhCOzt1QkFLSCxNQUFBLEdBQVEsU0FBQyxHQUFEO0FBRUosWUFBQTtRQUFBLENBQUEsR0FBSTtRQUNKLENBQUEsSUFBSyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQVQsQ0FBYSxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLENBQUQ7dUJBQU8sS0FBQyxDQUFBLElBQUQsQ0FBTSxDQUFOO1lBQVA7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWIsQ0FBNEIsQ0FBQyxJQUE3QixDQUFrQyxJQUFsQztlQUNMO0lBSkk7O3VCQU1SLEtBQUEsR0FBTyxTQUFDLEtBQUQsRUFBUSxHQUFSO0FBQ0gsWUFBQTs7WUFEVyxNQUFJOztRQUNmLEVBQUEsR0FBSyxLQUFLLENBQUMsR0FBTixDQUFVLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsQ0FBRDt1QkFBTyxLQUFDLENBQUEsSUFBRCxDQUFNLENBQU47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LENBQTdELEdBQStELEdBQS9ELEdBQWlFLENBQUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxDQUFDLENBQUMsSUFBUixDQUFELENBQWpFLEdBQStFLGdEQVhuRjs7SUFGSTs7Ozs7O0FBZVosTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbmtzdHIgID0gcmVxdWlyZSAna3N0cidcbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcbmVtcHR5ID0gKGEpIC0+IGEgaW4gWycnIG51bGwgdW5kZWZpbmVkXSBvciAodHlwZW9mKGEpID09ICdvYmplY3QnIGFuZCBPYmplY3Qua2V5cyhhKS5sZW5ndGggPT0gMClcblxuY2xhc3MgUmVuZGVyZXJcblxuICAgIEA6IChAa29kZSkgLT5cblxuICAgICAgICBAZGVidWcgICA9IEBrb2RlLmFyZ3M/LmRlYnVnXG4gICAgICAgIEB2ZXJib3NlID0gQGtvZGUuYXJncz8udmVyYm9zZVxuXG4gICAgcmVuZGVyOiAoYXN0KSAtPlxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IGFzdC5leHBzLm1hcCgocykgPT4gQG5vZGUgcykuam9pbiAnXFxuJ1xuICAgICAgICBzXG5cbiAgICBub2RlczogKG5vZGVzLCBzZXA9JywnKSAtPlxuICAgICAgICBzcyA9IG5vZGVzLm1hcCAocykgPT4gQG5vZGUgc1xuICAgICAgICBzcy5qb2luIHNlcFxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcblxuICAgIG5vZGU6IChleHApIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gJycgaWYgbm90IGV4cFxuXG4gICAgICAgIGlmIGV4cC50eXBlPyBhbmQgZXhwLnRleHQ/IHRoZW4gcmV0dXJuIEB0b2tlbiBleHBcblxuICAgICAgICBpZiBleHAgaW5zdGFuY2VvZiBBcnJheSB0aGVuIHJldHVybiAoQG5vZGUoYSkgZm9yIGEgaW4gZXhwKS5qb2luICc7XFxuJ1xuXG4gICAgICAgIHMgPSAnJ1xuXG4gICAgICAgIGZvciBrLHYgb2YgZXhwXG5cbiAgICAgICAgICAgIHMgKz0gc3dpdGNoIGtcbiAgICAgICAgICAgICAgICB3aGVuICdpZicgICAgICAgIHRoZW4gQGlmIHZcbiAgICAgICAgICAgICAgICB3aGVuICdmb3InICAgICAgIHRoZW4gQGZvciB2XG4gICAgICAgICAgICAgICAgd2hlbiAnd2hpbGUnICAgICB0aGVuIEB3aGlsZSB2XG4gICAgICAgICAgICAgICAgd2hlbiAncmV0dXJuJyAgICB0aGVuIEByZXR1cm4gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2NsYXNzJyAgICAgdGhlbiBAY2xhc3MgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3N3aXRjaCcgICAgdGhlbiBAc3dpdGNoIHZcbiAgICAgICAgICAgICAgICB3aGVuICd3aGVuJyAgICAgIHRoZW4gQHdoZW4gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ29wZXJhdGlvbicgdGhlbiBAb3BlcmF0aW9uIHZcbiAgICAgICAgICAgICAgICB3aGVuICdpbmNvbmQnICAgIHRoZW4gQGluY29uZCB2XG4gICAgICAgICAgICAgICAgd2hlbiAncGFyZW5zJyAgICB0aGVuIEBwYXJlbnMgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ29iamVjdCcgICAgdGhlbiBAb2JqZWN0IHZcbiAgICAgICAgICAgICAgICB3aGVuICdrZXl2YWwnICAgIHRoZW4gQGtleXZhbCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnYXJyYXknICAgICB0aGVuIEBhcnJheSB2XG4gICAgICAgICAgICAgICAgd2hlbiAnaW5kZXgnICAgICB0aGVuIEBpbmRleCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnc2xpY2UnICAgICB0aGVuIEBzbGljZSB2XG4gICAgICAgICAgICAgICAgd2hlbiAncHJvcCcgICAgICB0aGVuIEBwcm9wIHZcbiAgICAgICAgICAgICAgICB3aGVuICdmdW5jJyAgICAgIHRoZW4gQGZ1bmMgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2NhbGwnICAgICAgdGhlbiBAY2FsbCB2XG4gICAgICAgICAgICAgICAgd2hlbiAndmFyJyAgICAgICB0aGVuIHYudGV4dFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbG9nIFI0KCdyZW5kZXJlci5ub2RlIHVuaGFuZGxlZCBleHAnKSwgZXhwICMgaWYgQGRlYnVnIG9yIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgICAgICcnXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbiAgICBjbGFzczogKG4pIC0+XG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJjbGFzcyAje24ubmFtZS50ZXh0fVwiXG5cbiAgICAgICAgaWYgbi5leHRlbmRzXG4gICAgICAgICAgICBzICs9IFwiIGV4dGVuZHMgXCIgKyBuLmV4dGVuZHMubWFwKChlKSAtPiBlLnRleHQpLmpvaW4gJywgJ1xuXG4gICAgICAgIHMgKz0gJ1xcbnsnXG5cbiAgICAgICAgbXRoZHMgPSBuLmJvZHk/Lm9iamVjdD8ua2V5dmFscyA/IG4uYm9keT9bMF0/Lm9iamVjdD8ua2V5dmFsc1xuICAgICAgICBcbiAgICAgICAgaWYgbXRoZHM/Lmxlbmd0aFxuICAgICAgICAgICAgbXRoZHMgPSBAcHJlcGFyZU1ldGhvZHMgbXRoZHNcbiAgICAgICAgICAgIEBpbmRlbnQgPSAnICAgICdcbiAgICAgICAgICAgIGZvciBtIGluIG10aGRzXG4gICAgICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgICAgIHMgKz0gQG10aGQgbVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgQGluZGVudCA9ICcnXG4gICAgICAgIHMgKz0gJ30nXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuICAgIFxuICAgIHByZXBhcmVNZXRob2RzOiAobXRoZHMpIC0+XG5cbiAgICAgICAgYmluZCA9IFtdXG4gICAgICAgIGZvciBtIGluIG10aGRzXG4gICAgICAgICAgICBpZiBub3QgbS5rZXl2YWwgXG4gICAgICAgICAgICAgICAgaWYgbm90IG0udHlwZSA9PSAnY29tbWVudCdcbiAgICAgICAgICAgICAgICAgICAgbG9nICd3dGY/JyBtIFxuICAgICAgICAgICAgICAgICAgICBwcmludC5hc3QgJ25vdCBhbiBtZXRob2Q/JyBtXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIG5hbWUgPSBtLmtleXZhbC5rZXkudGV4dFxuICAgICAgICAgICAgaWYgbmFtZSBpbiBbJ0AnICdjb25zdHJ1Y3RvciddXG4gICAgICAgICAgICAgICAgaWYgY29uc3RydWN0b3IgdGhlbiBlcnJvciAnbW9yZSB0aGFuIG9uZSBjb25zdHJ1Y3Rvcj8nXG4gICAgICAgICAgICAgICAgbS5rZXl2YWwua2V5LnRleHQ9ICdjb25zdHJ1Y3RvcidcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvciA9IG1cbiAgICAgICAgICAgIGVsc2UgaWYgbmFtZS5zdGFydHNXaXRoIFwiJ3RoaXMuXCIgIydAJ1xuICAgICAgICAgICAgICAgIG0ua2V5dmFsLmtleS50ZXh0ID0gJ3N0YXRpYyAnICsgbmFtZVs2Li4tMl1cbiAgICAgICAgICAgIGVsc2UgaWYgbS5rZXl2YWwudmFsLmZ1bmM/LmFycm93LnRleHQgPT0gJz0+J1xuICAgICAgICAgICAgICAgIGJpbmQucHVzaCBtXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGJpbmQubGVuZ3RoIGFuZCBub3QgY29uc3RydWN0b3IgIyBmb3VuZCBzb21lIG1ldGhvZHMgdG8gYmluZCwgYnV0IG5vIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICBhc3QgPSBAa29kZS5hc3QgXCJjb25zdHJ1Y3RvcjogLT5cIiAjIGNyZWF0ZSBvbmUgZnJvbSBzY3JhdGNoXG4gICAgICAgICAgICBwcmludC5ub29uICdhc3QnIGFzdCBpZiBAZGVidWdcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yID0gYXN0LmV4cHNbMF0ub2JqZWN0LmtleXZhbHNbMF1cbiAgICAgICAgICAgIG10aGRzLnVuc2hpZnQgY29uc3RydWN0b3JcbiAgICAgICAgICAgIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgIHByaW50Lm5vb24gJ2NvbnN0cnVjdG9yJyBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgICAgIHByaW50LmFzdCAnaW1wbGljaXQgY29uc3RydWN0b3InIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICAgICAgcHJpbnQuYXN0ICdtdGhkcyB3aXRoIGltcGxpY2l0IGNvbnN0cnVjdG9yJyBtdGhkc1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIGJpbmQubGVuZ3RoXG4gICAgICAgICAgICBmb3IgYiBpbiBiaW5kXG4gICAgICAgICAgICAgICAgYm4gPSBiLmtleXZhbC5rZXkudGV4dFxuICAgICAgICAgICAgICAgIGxvZyAnbWV0aG9kIHRvIGJpbmQ6JyBibiBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLmtleXZhbC52YWwuZnVuYy5ib2R5LmV4cHMgPz0gW11cbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5rZXl2YWwudmFsLmZ1bmMuYm9keS5leHBzLnB1c2ggXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjb2RlJ1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcInRoaXMuI3tibn0gPSB0aGlzLiN7Ym59LmJpbmQodGhpcylcIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHByaW50LmFzdCAnY29uc3RydWN0b3IgYWZ0ZXIgYmluZCcgY29uc3RydWN0b3IgaWYgQGRlYnVnXG5cbiAgICAgICAgcHJpbnQuYXN0ICdwcmVwYXJlZCBtdGhkcycgbXRoZHMgaWYgQGRlYnVnXG4gICAgICAgIG10aGRzXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBtdGhkOiAobikgLT5cblxuICAgICAgICAjIGlmIG4udHlwZSA9PSAnY29tbWVudCdcbiAgICAgICAgICAgICMgcmV0dXJuIEBjb21tZW50IG5cbiAgICAgICAgXG4gICAgICAgIGlmIG4ua2V5dmFsXG4gICAgICAgICAgICBzID0gQGluZGVudCArIEBmdW5jIG4ua2V5dmFsLnZhbC5mdW5jLCBuLmtleXZhbC5rZXkudGV4dFxuICAgICAgICBzXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgXG4gICAgZnVuYzogKG4sIG5hbWU9J2Z1bmN0aW9uJykgLT5cbiAgICAgICAgXG4gICAgICAgIGlkID0gJyAgICAnXG4gICAgICAgIGdpID0gQGluZGVudCA/ICcnXG4gICAgICAgIFxuICAgICAgICBzID0gbmFtZVxuICAgICAgICBzICs9ICcgKCdcbiAgICAgICAgYXJncyA9IG4uYXJncz8ucGFyZW5zPy5leHBzXG4gICAgICAgIGlmIGFyZ3NcbiAgICAgICAgICAgIHMgKz0gYXJncy5tYXAoKGEpID0+IEBub2RlIGEpLmpvaW4gJywgJ1xuICAgICAgICBzICs9ICcpXFxuJ1xuICAgICAgICBzICs9IGdpICsgJ3snXG4gICAgICAgIFxuICAgICAgICAjIHByaW50Lm5vb24gJ2Z1bmMnIG4gaWYgQHZlcmJvc2VcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBlbXB0eSBuLmJvZHkuZXhwc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBAaW5kZW50ID0gZ2kgKyBpZFxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgc3MgPSBuLmJvZHkuZXhwcy5tYXAgKHMpID0+IEBub2RlIHNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbm90IHNzWy0xXS5zdGFydHNXaXRoKCdyZXR1cm4nKSBhbmQgbmFtZSAhPSAnY29uc3RydWN0b3InXG4gICAgICAgICAgICAgICAgc3MucHVzaCAncmV0dXJuICcgKyBrc3RyLmxzdHJpcCBzcy5wb3AoKVxuICAgICAgICAgICAgc3MgPSBzcy5tYXAgKHMpID0+IEBpbmRlbnQgKyBzXG4gICAgICAgICAgICBzICs9IHNzLmpvaW4gJ1xcbidcbiAgICAgICAgICAgIHMgKz0gJ1xcbicgKyBnaVxuICAgICAgICAgICAgQGluZGVudCA9IGdpXG4gICAgICAgIHMgKz0gJ30nXG4gICAgICAgIHNcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHJldHVybjogKG4pIC0+XG5cbiAgICAgICAgcyA9ICdyZXR1cm4nXG4gICAgICAgIHMgKz0gJyAnICsgQG5vZGUgbi52YWxcbiAgICAgICAga3N0ci5zdHJpcCBzXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgY2FsbDogKHApIC0+XG4gICAgICAgIGlmIHAuY2FsbGVlLnRleHQgaW4gWydsb2cnJ3dhcm4nJ2Vycm9yJ11cbiAgICAgICAgICAgIHAuY2FsbGVlLnRleHQgPSBcImNvbnNvbGUuI3twLmNhbGxlZS50ZXh0fVwiXG4gICAgICAgIFwiI3tAbm9kZShwLmNhbGxlZSl9KCN7QG5vZGVzIHAuYXJncywgJywnfSlcIlxuICAgICAgICAgICAgXG4gICAgIyAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMFxuXG4gICAgaWY6IChuKSAtPlxuXG4gICAgICAgIGlmIG5vdCBuLnRoZW4gdGhlbiBlcnJvciAnaWYgZXhwZWN0ZWQgdGhlbicgblxuXG4gICAgICAgIGlkID0gJyAgICAnXG4gICAgICAgIGdpID0gQGluZGVudCA/ICcnXG4gICAgICAgIEBpbmRlbnQgPSBnaSArIGlkXG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJpZiAoI3tAbm9kZShuLmV4cCl9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuLmV4cHMgPyBbXVxuICAgICAgICAgICAgcyArPSBnaSArIGlkICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgZm9yIGVsaWYgaW4gbi5lbGlmcyA/IFtdXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpICsgXCJlbHNlIGlmICgje0Bub2RlKGVsaWYuZWxpZi5leHApfSlcXG5cIlxuICAgICAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICAgICAgZm9yIGUgaW4gZWxpZi5lbGlmLnRoZW4uZXhwcyA/IFtdXG4gICAgICAgICAgICAgICAgcyArPSBnaSArIGlkICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIGlmIG4uZWxzZVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaSArICdlbHNlXFxuJ1xuICAgICAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICAgICAgZm9yIGUgaW4gbi5lbHNlLmV4cHMgPyBbXVxuICAgICAgICAgICAgICAgICBzICs9IGdpICsgaWQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wifVwiXG4gICAgICAgICAgICBcbiAgICAgICAgQGluZGVudCA9IGdpXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBmb3I6IChuKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IG4udGhlbiB0aGVuIGVycm9yICdmb3IgZXhwZWN0ZWQgdGhlbicgblxuXG4gICAgICAgIHN3aXRjaCBuLmlub2YudGV4dCBcbiAgICAgICAgICAgIHdoZW4gJ2luJyB0aGVuIEBmb3JfaW4gblxuICAgICAgICAgICAgd2hlbiAnb2YnIHRoZW4gQGZvcl9vZiBuXG4gICAgICAgICAgICBlbHNlIGVycm9yICdmb3IgZXhwZWN0ZWQgaW4vb2YnXG4gICAgICAgIFxuICAgIGZvcl9pbjogKG4pIC0+XG4gICAgICAgIFxuICAgICAgICBpZCA9ICcgICAgJ1xuICAgICAgICBnaSA9IEBpbmRlbnQgPyAnJ1xuICAgICAgICBAaW5kZW50ID0gZ2kraWRcblxuICAgICAgICBsaXN0ID0gQG5vZGUgbi5saXN0XG4gICAgICAgIFxuICAgICAgICBpZiBub3QgbGlzdCBvciBsaXN0ID09ICd1bmRlZmluZWQnXG4gICAgICAgICAgICBwcmludC5ub29uICdubyBsaXN0IGZvcicgbi5saXN0XG4gICAgICAgICAgICBwcmludC5hc3QgJ25vIGxpc3QgZm9yJyBuLmxpc3RcbiAgICAgICAgICAgIFxuICAgICAgICBsaXN0VmFyID0gJ2xpc3QnICAgIFxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcInZhciAje2xpc3RWYXJ9ID0gI3tsaXN0fVxcblwiXG4gICAgICAgIGlmIG4udmFscy50ZXh0XG4gICAgICAgICAgICBzICs9IGdpK1wiZm9yICh2YXIgaSA9IDA7IGkgPCAje2xpc3RWYXJ9Lmxlbmd0aDsgaSsrKVxcblwiXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBzICs9IGdpK2lkK1widmFyICN7bi52YWxzLnRleHR9ID0gI3tsaXN0VmFyfVtpXVxcblwiXG4gICAgICAgIGVsc2UgaWYgbi52YWxzLmFycmF5Py5pdGVtc1xuICAgICAgICAgICAgcyArPSBnaStcImZvciAodmFyIGkgPSAwOyBpIDwgI3tsaXN0VmFyfS5sZW5ndGg7IGkrKylcXG5cIlxuICAgICAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICAgICAgZm9yIGogaW4gMC4uLm4udmFscy5hcnJheS5pdGVtcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB2ID0gbi52YWxzLmFycmF5Lml0ZW1zW2pdXG4gICAgICAgICAgICAgICAgcyArPSBnaStpZCtcInZhciAje3YudGV4dH0gPSAje2xpc3RWYXJ9W2ldWyN7an1dXFxuXCJcbiAgICAgICAgZWxzZSBpZiBuLnZhbHMubGVuZ3RoID4gMVxuICAgICAgICAgICAgbHYgPSBuLnZhbHNbMV0udGV4dFxuICAgICAgICAgICAgcyArPSBnaStcImZvciAodmFyICN7bHZ9ID0gMDsgI3tsdn0gPCAje2xpc3RWYXJ9Lmxlbmd0aDsgI3tsdn0rKylcXG5cIlxuICAgICAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICAgICAgcyArPSBnaStpZCtcInZhciAje24udmFsc1swXS50ZXh0fSA9ICN7bGlzdFZhcn1baV1cXG5cIlxuICAgICAgICAgICAgXG4gICAgICAgIGZvciBlIGluIG4udGhlbi5leHBzID8gW11cbiAgICAgICAgICAgIHMgKz0gZ2kraWQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcbiAgICAgICAgICAgIFxuICAgICAgICBAaW5kZW50ID0gZ2lcbiAgICAgICAgc1xuICAgICAgICBcbiAgICBmb3Jfb2Y6IChuKSAtPlxuICAgICAgICBcbiAgICAgICAgaWQgPSAnICAgICdcbiAgICAgICAgZ2kgPSBAaW5kZW50ID8gJydcbiAgICAgICAgQGluZGVudCA9IGdpK2lkXG5cbiAgICAgICAga2V5ID0gbi52YWxzLnRleHQgPyBuLnZhbHNbMF0/LnRleHRcbiAgICAgICAgdmFsID0gbi52YWxzWzFdPy50ZXh0XG4gICAgICAgIFxuICAgICAgICBvYmogPSBAbm9kZSBuLmxpc3RcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJmb3IgKCN7a2V5fSBpbiAje29ian0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBpZiB2YWxcbiAgICAgICAgICAgIHMgKz0gZ2kraWQrXCIje3ZhbH0gPSAje29ian1bI3trZXl9XVxcblwiXG4gICAgICAgIGZvciBlIGluIG4udGhlbi5leHBzID8gW11cbiAgICAgICAgICAgIHMgKz0gZ2kraWQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcbiAgICAgICAgICAgIFxuICAgICAgICBAaW5kZW50ID0gZ2lcbiAgICAgICAgc1xuXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbiAgICB3aGlsZTogKG4pIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3Qgbi50aGVuIHRoZW4gZXJyb3IgJ3doZW4gZXhwZWN0ZWQgdGhlbicgblxuXG4gICAgICAgIGlkID0gJyAgICAnXG4gICAgICAgIGdpID0gQGluZGVudCA/ICcnXG4gICAgICAgIEBpbmRlbnQgPSBnaStpZFxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwid2hpbGUgKCN7QG5vZGUgbi5jb25kfSlcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIGZvciBlIGluIG4udGhlbi5leHBzID8gW11cbiAgICAgICAgICAgIHMgKz0gZ2kraWQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcbiAgICAgICAgICAgIFxuICAgICAgICBAaW5kZW50ID0gZ2lcbiAgICAgICAgc1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzd2l0Y2g6IChuKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IG4ubWF0Y2ggdGhlbiBlcnJvciAnc3dpdGNoIGV4cGVjdGVkIG1hdGNoJyBuXG4gICAgICAgIGlmIG5vdCBuLndoZW5zIHRoZW4gZXJyb3IgJ3N3aXRjaCBleHBlY3RlZCB3aGVucycgblxuXG4gICAgICAgIGlkID0gJyAgICAnXG4gICAgICAgIGdpID0gQGluZGVudCA/ICcnXG4gICAgICAgIEBpbmRlbnQgPSBnaStpZFxuICAgICAgICBcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJzd2l0Y2ggKCN7QG5vZGUgbi5tYXRjaH0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLndoZW5zID8gW11cbiAgICAgICAgICAgIHMgKz0gZ2krIEBub2RlKGUpICsgJ1xcbicgICAgICAgICAgICBcbiAgICAgICAgaWYgbi5lbHNlXG4gICAgICAgICAgICBzICs9IGdpK2lkKydkZWZhdWx0OlxcbidcbiAgICAgICAgICAgIGZvciBlIGluIG4uZWxzZVxuICAgICAgICAgICAgICAgIHMgKz0gZ2kraWQraWQrIEBub2RlKGUpICsgJ1xcbicgICAgICAgICAgICBcbiAgICAgICAgcyArPSBnaStcIn1cXG5cIlxuXG4gICAgICAgIEBpbmRlbnQgPSBnaVxuICAgICAgICBzXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICB3aGVuOiAobikgLT5cblxuICAgICAgICBpZiBub3Qgbi52YWxzIHRoZW4gcmV0dXJuIGVycm9yICd3aGVuIGV4cGVjdGVkIHZhbHMnIG5cbiAgICAgICAgaWYgbm90IG4udGhlbiB0aGVuIHJldHVybiBlcnJvciAnd2hlbiBleHBlY3RlZCB0aGVuJyBuXG4gICAgICAgIFxuICAgICAgICBzID0gJydcbiAgICAgICAgZm9yIGUgaW4gbi52YWxzXG4gICAgICAgICAgICBzICs9ICcgICAgY2FzZSAnICsgQG5vZGUoZSkgKyAnOlxcbidcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuLmV4cHMgPyBbXVxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgJyAgICAnICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IEBpbmRlbnQgKyAnICAgICcgKyAnYnJlYWsnXG4gICAgICAgIHNcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAwICAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDBcbiAgICAjICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIHRva2VuOiAodG9rKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rLnR5cGUgPT0gJ2NvbW1lbnQnXG4gICAgICAgICAgICBAY29tbWVudCB0b2tcbiAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAndGhpcycgXG4gICAgICAgICAgICAndGhpcydcbiAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAndHJpcGxlJ1xuICAgICAgICAgICAgJ2AnICsgdG9rLnRleHRbMy4uLTRdICsgJ2AnXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ2tleXdvcmQnIGFuZCB0b2sudGV4dCA9PSAneWVzJ1xuICAgICAgICAgICAgJ3RydWUnXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ2tleXdvcmQnIGFuZCB0b2sudGV4dCA9PSAnbm8nXG4gICAgICAgICAgICAnZmFsc2UnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRvay50ZXh0XG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxuICAgIGNvbW1lbnQ6ICh0b2spIC0+XG5cbiAgICAgICAgaWYgdG9rLnRleHQuc3RhcnRzV2l0aCAnIyMjJ1xuICAgICAgICAgICAgJy8qJyArIHRvay50ZXh0WzMuLi00XSArICcqLycgKyAnXFxuJ1xuICAgICAgICBlbHNlIGlmIHRvay50ZXh0LnN0YXJ0c1dpdGggJyMnXG4gICAgICAgICAgICBrc3RyLnBhZCgnJywgdG9rLmNvbCkgKyAnLy8nICsgdG9rLnRleHRbMS4uLTFdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVycm9yIFwiIyBjb21tZW50IHRva2VuIGV4cGVjdGVkXCJcbiAgICAgICAgICAgICcnXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBvcGVyYXRpb246IChvcCkgLT5cbiAgICAgICAgXG4gICAgICAgIG9wbWFwID0gKG8pIC0+XG4gICAgICAgICAgICBvbXAgPVxuICAgICAgICAgICAgICAgIGFuZDogICAgJyYmJ1xuICAgICAgICAgICAgICAgIG9yOiAgICAgJ3x8J1xuICAgICAgICAgICAgICAgIG5vdDogICAgJyEnXG4gICAgICAgICAgICAgICAgJz09JzogICAnPT09J1xuICAgICAgICAgICAgICAgICchPSc6ICAgJyE9PSdcbiAgICAgICAgICAgIG9tcFtvXSA/IG9cblxuICAgICAgICBvICAgPSBvcG1hcCBvcC5vcGVyYXRvci50ZXh0XG4gICAgICAgIHNlcCA9ICcgJ1xuICAgICAgICBzZXAgPSAnJyBpZiBub3Qgb3AubGhzIG9yIG5vdCBvcC5yaHNcbiAgICAgICAgXG4gICAgICAgIGlmIG8gaW4gWyc8Jyc8PScnPT09JychPT0nJz49Jyc+J11cbiAgICAgICAgICAgIHJvID0gb3BtYXAgb3AucmhzPy5vcGVyYXRpb24/Lm9wZXJhdG9yLnRleHRcbiAgICAgICAgICAgIGlmIHJvIGluIFsnPCcnPD0nJz09PScnIT09Jyc+PScnPiddXG4gICAgICAgICAgICAgICAgcmV0dXJuICcoJyArIEBub2RlKG9wLmxocykgKyBzZXAgKyBvICsgc2VwICsgQG5vZGUob3AucmhzLm9wZXJhdGlvbi5saHMpICsgJyAmJiAnICsga3N0ci5sc3RyaXAoQG5vZGUob3AucmhzKSkgKyAnKSdcblxuICAgICAgICBvcGVuID0gY2xvc2UgPSAnJ1xuICAgICAgICBpZiBvICE9ICc9JyBhbmQgb3AucmhzPy5vcGVyYXRpb24/Lm9wZXJhdG9yLnRleHQgPT0gJz0nXG4gICAgICAgICAgICBvcGVuID0gJygnXG4gICAgICAgICAgICBjbG9zZSA9ICcpJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAbm9kZShvcC5saHMpICsgc2VwICsgbyArIHNlcCArIG9wZW4gKyBrc3RyLmxzdHJpcCBAbm9kZShvcC5yaHMpICsgY2xvc2VcblxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgaW5jb25kOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIFwiI3tAbm9kZSBwLnJoc30uaW5kZXhPZigje0Bub2RlIHAubGhzfSkgPj0gMFwiXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIHBhcmVuczogKHApIC0+IFwiKCN7QG5vZGVzIHAuZXhwc30pXCJcbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvYmplY3Q6IChwKSAtPiBcInsje0Bub2RlcyBwLmtleXZhbHMsICcsJ319XCJcbiAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAga2V5dmFsOiAocCkgLT4gXCIje0Bub2RlKHAua2V5KX06I3tAbm9kZShwLnZhbCl9XCJcbiAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuICAgIFxuICAgIHByb3A6ICAgKHApIC0+IFwiI3tAbm9kZShwLm9iail9LiN7QG5vZGUgcC5wcm9wfVwiXG4gICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpbmRleDogIChwKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIHAuc2xpZHguc2xpY2VcbiAgICAgICAgICAgIGFkZCA9ICcnXG4gICAgICAgICAgICBpZiBwLnNsaWR4LnNsaWNlLmRvdHMudGV4dCA9PSAnLi4nXG4gICAgICAgICAgICAgICAgYWRkID0gJysxJ1xuICAgICAgICAgICAgXCIje0Bub2RlKHAuaWR4ZWUpfS5zbGljZSgje0Bub2RlIHAuc2xpZHguc2xpY2UuZnJvbX0sICN7QG5vZGUgcC5zbGlkeC5zbGljZS51cHRvfSN7YWRkfSlcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBwLnNsaWR4Lm9wZXJhdGlvbiBcbiAgICAgICAgICAgICAgICBvID0gcC5zbGlkeC5vcGVyYXRpb25cbiAgICAgICAgICAgICAgICBpZiBvLm9wZXJhdG9yLnRleHQgPT0gJy0nIGFuZCBub3Qgby5saHMgYW5kIG8ucmhzPy50eXBlID09ICdudW0nXG4gICAgICAgICAgICAgICAgICAgIG5pID0gcGFyc2VJbnQgby5yaHMudGV4dFxuICAgICAgICAgICAgICAgICAgICBpZiBuaSA9PSAxXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCIje0Bub2RlKHAuaWR4ZWUpfS5zbGljZSgtI3tuaX0pWzBdXCJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiI3tAbm9kZShwLmlkeGVlKX0uc2xpY2UoLSN7bml9LC0je25pLTF9KVswXVwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFwiI3tAbm9kZShwLmlkeGVlKX1bI3tAbm9kZSBwLnNsaWR4fV1cIlxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBhcnJheTogKHApIC0+XG5cbiAgICAgICAgaWYgcC5pdGVtc1swXT8uc2xpY2VcbiAgICAgICAgICAgIEBzbGljZSBwLml0ZW1zWzBdLnNsaWNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFwiWyN7QG5vZGVzIHAuaXRlbXMsICcsJ31dXCJcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc2xpY2U6ICAocCkgLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBwLmZyb20udHlwZSA9PSAnbnVtJyA9PSBwLnVwdG8udHlwZVxuICAgICAgICAgICAgZnJvbSA9IHBhcnNlSW50IHAuZnJvbS50ZXh0XG4gICAgICAgICAgICB1cHRvID0gcGFyc2VJbnQgcC51cHRvLnRleHRcbiAgICAgICAgICAgIGlmIHVwdG8tZnJvbSA8PSAxMFxuICAgICAgICAgICAgICAgIGlmIHAuZG90cy50ZXh0ID09ICcuLi4nIHRoZW4gdXB0by0tXG4gICAgICAgICAgICAgICAgJ1snKygoeCBmb3IgeCBpbiBbZnJvbS4udXB0b10pLmpvaW4gJywnKSsnXSdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvID0gaWYgcC5kb3RzLnRleHQgPT0gJy4uLicgdGhlbiAnPCcgZWxzZSAnPD0nXG4gICAgICAgICAgICAgICAgXCIoZnVuY3Rpb24oKSB7IHZhciByID0gW107IGZvciAodmFyIGkgPSAje2Zyb219OyBpICN7b30gI3t1cHRvfTsgaSsrKXsgci5wdXNoKGkpOyB9IHJldHVybiByOyB9KS5hcHBseSh0aGlzKVwiXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBvID0gaWYgcC5kb3RzLnRleHQgPT0gJy4uLicgdGhlbiAnPCcgZWxzZSAnPD0nXG4gICAgICAgICAgICBcIihmdW5jdGlvbigpIHsgdmFyIHIgPSBbXTsgZm9yICh2YXIgaSA9ICN7QG5vZGUgcC5mcm9tfTsgaSAje299ICN7QG5vZGUgcC51cHRvfTsgaSsrKXsgci5wdXNoKGkpOyB9IHJldHVybiByOyB9KS5hcHBseSh0aGlzKVwiXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gUmVuZGVyZXJcbiJdfQ==
//# sourceURL=../coffee/renderer.coffee