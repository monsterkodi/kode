// koffee 1.20.0

/*
00000000   00000000  000   000  0000000    00000000  00000000   00000000  00000000
000   000  000       0000  000  000   000  000       000   000  000       000   000
0000000    0000000   000 0 000  000   000  0000000   0000000    0000000   0000000
000   000  000       000  0000  000   000  000       000   000  000       000   000
000   000  00000000  000   000  0000000    00000000  000   000  00000000  000   000
 */
var Renderer, empty, kstr, opmap, print;

kstr = require('kstr');

print = require('./print');

empty = function(a) {
    return (a === '' || a === null || a === (void 0)) || (typeof a === 'object' && Object.keys(a).length === 0);
};

opmap = {
    and: '&&',
    or: '||',
    '==': '===',
    '!=': '!=='
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
        s += this.block(ast);
        return s;
    };

    Renderer.prototype.block = function(nodes) {
        return nodes.map((function(_this) {
            return function(s) {
                return _this.node(s);
            };
        })(this)).join('\n');
    };

    Renderer.prototype.nodes = function(nodes, sep) {
        var ss;
        if (sep == null) {
            sep = ';';
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
        if (exp.type != null) {
            return exp.text;
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
                    case 'class':
                        return this["class"](v);
                    case 'switch':
                        return this["switch"](v);
                    case 'when':
                        return this.when(v);
                    case 'incond':
                        return this.incond(v);
                    case 'token':
                        return this.token(v);
                    case 'operation':
                        return this.operation(v);
                    case 'parens':
                        return this.parens(v);
                    case 'array':
                        return this.array(v);
                    case 'object':
                        return this.object(v);
                    case 'keyval':
                        return this.keyval(v);
                    case 'call':
                        return this.call(v);
                    case 'prop':
                        return this.prop(v);
                    case 'index':
                        return this.index(v);
                    case 'slice':
                        return this.slice(v);
                    case 'var':
                        return v.text;
                    case 'func':
                        return this.func(v);
                    case 'return':
                        return this["return"](v);
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
        var ast, b, base, bind, bn, constructor, i, j, len, len1, m, name, ref, ref1;
        bind = [];
        for (i = 0, len = mthds.length; i < len; i++) {
            m = mthds[i];
            if (!m.keyval) {
                if (!((ref = m.token) != null ? ref.type : void 0) === 'comment') {
                    console.log('wtf?', m);
                    print.ast('not an method?', m);
                }
                continue;
            }
            name = m.keyval.key.token.text;
            if (name === '@' || name === 'constructor') {
                if (constructor) {
                    console.error('more than one constructor?');
                }
                m.keyval.key.token.text = 'constructor';
                constructor = m;
            } else if (name.startsWith('@')) {
                m.keyval.key.token.text = 'static ' + name.slice(1);
            } else if (((ref1 = m.keyval.val.func) != null ? ref1.arrow.text : void 0) === '=>') {
                bind.push(m);
            }
        }
        if (bind.length && !constructor) {
            ast = this.kode.ast("constructor: ->");
            if (this.debug) {
                print.noon('ast', ast);
            }
            constructor = ast[0].object.keyvals[0];
            mthds.unshift(constructor);
            if (this.debug) {
                print.noon('constructor', constructor);
                print.ast('implicit constructor', constructor);
                print.ast('mthds with implicit construcotr', mthds);
            }
        }
        if (bind.length) {
            for (j = 0, len1 = bind.length; j < len1; j++) {
                b = bind[j];
                bn = b.keyval.key.token.text;
                if (this.verbose) {
                    console.log('method to bind:', bn);
                }
                if ((base = constructor.keyval.val.func).body != null) {
                    base.body;
                } else {
                    base.body = [];
                }
                constructor.keyval.val.func.body.push({
                    type: 'code',
                    text: "this." + bn + " = this." + bn + ".bind(this);"
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
        var ref, s;
        if (((ref = n.token) != null ? ref.type : void 0) === 'comment') {
            return this.comment(n.token);
        }
        if (n.keyval) {
            s = this.func(n.keyval.val.func, n.keyval.key.token.text);
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
        s = gi + name;
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
        if (!empty(n.body)) {
            this.indent = gi + id;
            s += '\n';
            ss = n.body.map((function(_this) {
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
            s += ss.join(';\n');
            s += '\n' + gi;
            this.indent = gi;
        }
        s += '}';
        return s;
    };

    Renderer.prototype["return"] = function(n) {
        var s;
        s = 'return ';
        s += kstr.lstrip(this.node(n.val));
        return s;
    };

    Renderer.prototype.call = function(p) {
        var ref;
        if ((ref = p.callee.text) === 'log' || ref === 'warn' || ref === 'error') {
            p.callee.text = "console." + p.callee.text;
        }
        return (this.node(p.callee)) + "(" + (this.nodes(p.args, ',')) + ")";
    };

    Renderer.prototype["if"] = function(n) {
        var e, elif, gi, i, id, j, l, len, len1, len2, len3, q, ref, ref1, ref2, ref3, ref4, ref5, ref6, s;
        if (!n.then) {
            console.error('if expected then', n);
        }
        id = '    ';
        gi = (ref = this.indent) != null ? ref : '';
        this.indent = gi + id;
        s = '';
        s += "if (" + (this.node(n.exp)) + ")\n";
        s += gi + "{\n";
        ref2 = (ref1 = n.then) != null ? ref1 : [];
        for (i = 0, len = ref2.length; i < len; i++) {
            e = ref2[i];
            s += gi + id + this.node(e) + '\n';
        }
        s += gi + "}";
        ref4 = (ref3 = n.elifs) != null ? ref3 : [];
        for (j = 0, len1 = ref4.length; j < len1; j++) {
            elif = ref4[j];
            s += '\n';
            s += gi + ("else if (" + (this.node(elif.elif.exp)) + ")\n");
            s += gi + "{\n";
            ref5 = elif.elif.then;
            for (l = 0, len2 = ref5.length; l < len2; l++) {
                e = ref5[l];
                s += gi + id + this.node(e) + '\n';
            }
            s += gi + "}";
        }
        if (n["else"]) {
            s += '\n';
            s += gi + 'else\n';
            s += gi + "{\n";
            ref6 = n["else"];
            for (q = 0, len3 = ref6.length; q < len3; q++) {
                e = ref6[q];
                s += gi + id + this.node(e) + '\n';
            }
            s += gi + "}";
        }
        this.indent = gi;
        return s;
    };

    Renderer.prototype["for"] = function(n) {
        var e, gi, i, id, len, list, listVar, ref, ref1, ref2, ref3, ref4, ref5, ref6, s, val;
        if (!n.then) {
            console.error('for expected then', n);
        }
        id = '    ';
        gi = (ref = this.indent) != null ? ref : '';
        this.indent = gi + id;
        val = (ref1 = (ref2 = n.vals.token) != null ? ref2.text : void 0) != null ? ref1 : (ref3 = n.vals[0]) != null ? (ref4 = ref3.token) != null ? ref4.text : void 0 : void 0;
        list = this.node(n.list);
        if (!list || list === 'undefined') {
            print.noon('no list for', n.list);
            print.ast('no list for', n.list);
        }
        listVar = 'list';
        s = '';
        s += "var " + listVar + " = " + list + "\n";
        s += "for (var i = 0; i < " + listVar + ".length; i++)\n";
        s += gi + "{\n";
        s += gi + id + (val + " = " + listVar + "[i]\n");
        ref6 = (ref5 = n.then) != null ? ref5 : [];
        for (i = 0, len = ref6.length; i < len; i++) {
            e = ref6[i];
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
        ref2 = (ref1 = n.then) != null ? ref1 : [];
        for (i = 0, len = ref2.length; i < len; i++) {
            e = ref2[i];
            s += gi + id + this.node(e) + '\n';
        }
        s += gi + "}";
        this.indent = gi;
        return s;
    };

    Renderer.prototype["switch"] = function(n) {
        var e, gi, i, id, j, len, len1, ref, ref1, ref2, ref3, s;
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
            for (j = 0, len1 = ref3.length; j < len1; j++) {
                e = ref3[j];
                s += gi + id + id + this.node(e) + '\n';
            }
        }
        s += gi + "}\n";
        this.indent = gi;
        return s;
    };

    Renderer.prototype.when = function(n) {
        var e, i, j, len, len1, ref, ref1, s;
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
            s += this.indent + 'case ' + this.node(e) + ':\n';
        }
        ref1 = n.then;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
            e = ref1[j];
            s += this.indent + '    ' + this.node(e) + '\n';
        }
        s += this.indent + '    ' + 'break';
        return s;
    };

    Renderer.prototype.token = function(tok) {
        if (tok.type === 'comment') {
            return this.comment(tok);
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
        var o, ref, ref1, ref2, ref3, ref4, ref5, ro, sep;
        o = (ref = opmap[op.operator.text]) != null ? ref : op.operator.text;
        sep = ' ';
        if (!op.lhs || !op.rhs) {
            sep = '';
        }
        if (o === '<' || o === '<=' || o === '===' || o === '!==' || o === '>=' || o === '>') {
            ro = (ref1 = opmap[(ref2 = op.rhs) != null ? (ref3 = ref2.operation) != null ? ref3.operator.text : void 0 : void 0]) != null ? ref1 : (ref4 = op.rhs) != null ? (ref5 = ref4.operation) != null ? ref5.operator.text : void 0 : void 0;
            if (ro === '<' || ro === '<=' || ro === '===' || ro === '!==' || ro === '>=' || ro === '>') {
                return '(' + this.node(op.lhs) + sep + o + sep + this.node(op.rhs.operation.lhs) + ' && ' + kstr.lstrip(this.node(op.rhs)) + ')';
            }
        }
        return this.node(op.lhs) + sep + o + sep + kstr.lstrip(this.node(op.rhs));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsSUFBQSxHQUFRLE9BQUEsQ0FBUSxNQUFSOztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFDUixLQUFBLEdBQVEsU0FBQyxDQUFEO1dBQU8sQ0FBQSxDQUFBLEtBQU0sRUFBTixJQUFBLENBQUEsS0FBUyxJQUFULElBQUEsQ0FBQSxLQUFjLFFBQWQsQ0FBQSxJQUE0QixDQUFDLE9BQU8sQ0FBUCxLQUFhLFFBQWIsSUFBMEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUFaLENBQWMsQ0FBQyxNQUFmLEtBQXlCLENBQXBEO0FBQW5DOztBQUVSLEtBQUEsR0FDSTtJQUFBLEdBQUEsRUFBUSxJQUFSO0lBQ0EsRUFBQSxFQUFRLElBRFI7SUFFQSxJQUFBLEVBQVEsS0FGUjtJQUdBLElBQUEsRUFBUSxLQUhSOzs7QUFLRTtJQUVDLGtCQUFDLElBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7UUFFQSxJQUFDLENBQUEsS0FBRCx1Q0FBcUIsQ0FBRTtRQUN2QixJQUFDLENBQUEsT0FBRCx5Q0FBcUIsQ0FBRTtJQUh4Qjs7dUJBS0gsTUFBQSxHQUFRLFNBQUMsR0FBRDtBQUVKLFlBQUE7UUFBQSxDQUFBLEdBQUk7UUFDSixDQUFBLElBQUssSUFBQyxDQUFBLEtBQUQsQ0FBTyxHQUFQO2VBQ0w7SUFKSTs7dUJBTVIsS0FBQSxHQUFPLFNBQUMsS0FBRDtlQUVILEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxDQUFEO3VCQUFPLEtBQUMsQ0FBQSxJQUFELENBQU0sQ0FBTjtZQUFQO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsSUFBL0I7SUFGRzs7dUJBSVAsS0FBQSxHQUFPLFNBQUMsS0FBRCxFQUFRLEdBQVI7QUFDSCxZQUFBOztZQURXLE1BQUk7O1FBQ2YsRUFBQSxHQUFLLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxDQUFEO3VCQUFPLEtBQUMsQ0FBQSxJQUFELENBQU0sQ0FBTjtZQUFQO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWO2VBQ0wsRUFBRSxDQUFDLElBQUgsQ0FBUSxHQUFSO0lBRkc7O3VCQVVQLElBQUEsR0FBTSxTQUFDLEdBQUQ7QUFFRixZQUFBO1FBQUEsSUFBYSxDQUFJLEdBQWpCO0FBQUEsbUJBQU8sR0FBUDs7UUFFQSxJQUFHLGdCQUFIO0FBQWtCLG1CQUFPLEdBQUcsQ0FBQyxLQUE3Qjs7UUFFQSxJQUFHLEdBQUEsWUFBZSxLQUFsQjtBQUE2QixtQkFBTzs7QUFBQztxQkFBQSxxQ0FBQTs7aUNBQUEsSUFBQyxDQUFBLElBQUQsQ0FBTSxDQUFOO0FBQUE7O3lCQUFELENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsS0FBN0IsRUFBcEM7O1FBRUEsQ0FBQSxHQUFJO0FBQ0osYUFBQSxRQUFBOztZQUVJLENBQUE7QUFBSyx3QkFBTyxDQUFQO0FBQUEseUJBQ0ksSUFESjsrQkFDcUIsSUFBQyxFQUFBLEVBQUEsRUFBRCxDQUFJLENBQUo7QUFEckIseUJBRUksS0FGSjsrQkFFcUIsSUFBQyxFQUFBLEdBQUEsRUFBRCxDQUFLLENBQUw7QUFGckIseUJBR0ksT0FISjsrQkFHcUIsSUFBQyxFQUFBLEtBQUEsRUFBRCxDQUFPLENBQVA7QUFIckIseUJBSUksT0FKSjsrQkFJcUIsSUFBQyxFQUFBLEtBQUEsRUFBRCxDQUFPLENBQVA7QUFKckIseUJBS0ksUUFMSjsrQkFLcUIsSUFBQyxFQUFBLE1BQUEsRUFBRCxDQUFRLENBQVI7QUFMckIseUJBTUksTUFOSjsrQkFNcUIsSUFBQyxDQUFBLElBQUQsQ0FBTSxDQUFOO0FBTnJCLHlCQU9JLFFBUEo7K0JBT3FCLElBQUMsQ0FBQSxNQUFELENBQVEsQ0FBUjtBQVByQix5QkFRSSxPQVJKOytCQVFxQixJQUFDLENBQUEsS0FBRCxDQUFPLENBQVA7QUFSckIseUJBU0ksV0FUSjsrQkFTcUIsSUFBQyxDQUFBLFNBQUQsQ0FBVyxDQUFYO0FBVHJCLHlCQVVJLFFBVko7K0JBVXFCLElBQUMsQ0FBQSxNQUFELENBQVEsQ0FBUjtBQVZyQix5QkFXSSxPQVhKOytCQVdxQixJQUFDLENBQUEsS0FBRCxDQUFPLENBQVA7QUFYckIseUJBWUksUUFaSjsrQkFZcUIsSUFBQyxDQUFBLE1BQUQsQ0FBUSxDQUFSO0FBWnJCLHlCQWFJLFFBYko7K0JBYXFCLElBQUMsQ0FBQSxNQUFELENBQVEsQ0FBUjtBQWJyQix5QkFjSSxNQWRKOytCQWNxQixJQUFDLENBQUEsSUFBRCxDQUFNLENBQU47QUFkckIseUJBZUksTUFmSjsrQkFlcUIsSUFBQyxDQUFBLElBQUQsQ0FBTSxDQUFOO0FBZnJCLHlCQWdCSSxPQWhCSjsrQkFnQnFCLElBQUMsQ0FBQSxLQUFELENBQU8sQ0FBUDtBQWhCckIseUJBaUJJLE9BakJKOytCQWlCcUIsSUFBQyxDQUFBLEtBQUQsQ0FBTyxDQUFQO0FBakJyQix5QkFrQkksS0FsQko7K0JBa0JxQixDQUFDLENBQUM7QUFsQnZCLHlCQW1CSSxNQW5CSjsrQkFtQnFCLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBTjtBQW5CckIseUJBb0JJLFFBcEJKOytCQW9CcUIsSUFBQyxFQUFBLE1BQUEsRUFBRCxDQUFRLENBQVI7QUFwQnJCO3dCQXNCRSxPQUFBLENBQUMsR0FBRCxDQUFLLEVBQUEsQ0FBRyw2QkFBSCxDQUFMLEVBQXdDLEdBQXhDOytCQUNDO0FBdkJIOztBQUZUO2VBMEJBO0lBbkNFOzt3QkEyQ04sT0FBQSxHQUFPLFNBQUMsQ0FBRDtBQUVILFlBQUE7UUFBQSxDQUFBLEdBQUk7UUFDSixDQUFBLElBQUssUUFBQSxHQUFTLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFckIsSUFBRyxDQUFDLEVBQUMsT0FBRCxFQUFKO1lBQ0ksQ0FBQSxJQUFLLFdBQUEsR0FBYyxDQUFDLEVBQUMsT0FBRCxFQUFRLENBQUMsR0FBVixDQUFjLFNBQUMsQ0FBRDt1QkFBTyxDQUFDLENBQUM7WUFBVCxDQUFkLENBQTRCLENBQUMsSUFBN0IsQ0FBa0MsSUFBbEMsRUFEdkI7O1FBR0EsQ0FBQSxJQUFLO1FBRUwsS0FBQSwyTUFBb0QsQ0FBRTtRQUV0RCxvQkFBRyxLQUFLLENBQUUsZUFBVjtZQUNJLEtBQUEsR0FBUSxJQUFDLENBQUEsY0FBRCxDQUFnQixLQUFoQjtZQUNSLElBQUMsQ0FBQSxNQUFELEdBQVU7QUFDVixpQkFBQSx1Q0FBQTs7Z0JBQ0ksQ0FBQSxJQUFLO2dCQUNMLENBQUEsSUFBSyxJQUFDLENBQUEsSUFBRCxDQUFNLENBQU47QUFGVDtZQUdBLENBQUEsSUFBSztZQUNMLElBQUMsQ0FBQSxNQUFELEdBQVUsR0FQZDs7UUFRQSxDQUFBLElBQUs7ZUFDTDtJQXJCRzs7dUJBNkJQLGNBQUEsR0FBZ0IsU0FBQyxLQUFEO0FBRVosWUFBQTtRQUFBLElBQUEsR0FBTztBQUNQLGFBQUEsdUNBQUE7O1lBQ0ksSUFBRyxDQUFJLENBQUMsQ0FBQyxNQUFUO2dCQUNJLElBQUcsK0JBQVcsQ0FBRSxjQUFiLEtBQXFCLFNBQXhCO29CQUNHLE9BQUEsQ0FBQyxHQUFELENBQUssTUFBTCxFQUFZLENBQVo7b0JBQ0MsS0FBSyxDQUFDLEdBQU4sQ0FBVSxnQkFBVixFQUEyQixDQUEzQixFQUZKOztBQUdBLHlCQUpKOztZQUtBLElBQUEsR0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFDMUIsSUFBRyxJQUFBLEtBQVMsR0FBVCxJQUFBLElBQUEsS0FBYSxhQUFoQjtnQkFDSSxJQUFHLFdBQUg7b0JBQWEsT0FBQSxDQUFPLEtBQVAsQ0FBYSw0QkFBYixFQUFiOztnQkFDQSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBbkIsR0FBeUI7Z0JBQ3pCLFdBQUEsR0FBYyxFQUhsQjthQUFBLE1BSUssSUFBRyxJQUFJLENBQUMsVUFBTCxDQUFnQixHQUFoQixDQUFIO2dCQUNELENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFuQixHQUEwQixTQUFBLEdBQVksSUFBSyxVQUQxQzthQUFBLE1BRUEsOENBQW9CLENBQUUsS0FBSyxDQUFDLGNBQXpCLEtBQWlDLElBQXBDO2dCQUNELElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBVixFQURDOztBQWJUO1FBZ0JBLElBQUcsSUFBSSxDQUFDLE1BQUwsSUFBZ0IsQ0FBSSxXQUF2QjtZQUNJLEdBQUEsR0FBTSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxpQkFBVjtZQUNOLElBQXdCLElBQUMsQ0FBQSxLQUF6QjtnQkFBQSxLQUFLLENBQUMsSUFBTixDQUFXLEtBQVgsRUFBaUIsR0FBakIsRUFBQTs7WUFDQSxXQUFBLEdBQWMsR0FBSSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFRLENBQUEsQ0FBQTtZQUNwQyxLQUFLLENBQUMsT0FBTixDQUFjLFdBQWQ7WUFDQSxJQUFHLElBQUMsQ0FBQSxLQUFKO2dCQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsYUFBWCxFQUF5QixXQUF6QjtnQkFDQSxLQUFLLENBQUMsR0FBTixDQUFVLHNCQUFWLEVBQWlDLFdBQWpDO2dCQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsaUNBQVYsRUFBNEMsS0FBNUMsRUFISjthQUxKOztRQVVBLElBQUcsSUFBSSxDQUFDLE1BQVI7QUFDSSxpQkFBQSx3Q0FBQTs7Z0JBQ0ksRUFBQSxHQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztnQkFBSSxJQUNBLElBQUMsQ0FBQSxPQUREO29CQUFBLE9BQUEsQ0FDNUIsR0FENEIsQ0FDeEIsaUJBRHdCLEVBQ04sRUFETSxFQUFBOzs7d0JBRUQsQ0FBQzs7d0JBQUQsQ0FBQyxPQUFROztnQkFDcEMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFqQyxDQUNJO29CQUFBLElBQUEsRUFBTSxNQUFOO29CQUNBLElBQUEsRUFBTSxPQUFBLEdBQVEsRUFBUixHQUFXLFVBQVgsR0FBcUIsRUFBckIsR0FBd0IsY0FEOUI7aUJBREo7QUFKSjtZQVFBLElBQWtELElBQUMsQ0FBQSxLQUFuRDtnQkFBQSxLQUFLLENBQUMsR0FBTixDQUFVLHdCQUFWLEVBQW1DLFdBQW5DLEVBQUE7YUFUSjs7UUFXQSxJQUFvQyxJQUFDLENBQUEsS0FBckM7WUFBQSxLQUFLLENBQUMsR0FBTixDQUFVLGdCQUFWLEVBQTJCLEtBQTNCLEVBQUE7O2VBQ0E7SUF6Q1k7O3VCQWlEaEIsSUFBQSxHQUFNLFNBQUMsQ0FBRDtBQUVGLFlBQUE7UUFBQSxrQ0FBVSxDQUFFLGNBQVQsS0FBaUIsU0FBcEI7QUFDSSxtQkFBTyxJQUFDLENBQUEsT0FBRCxDQUFTLENBQUMsQ0FBQyxLQUFYLEVBRFg7O1FBR0EsSUFBRyxDQUFDLENBQUMsTUFBTDtZQUNJLENBQUEsR0FBSSxJQUFDLENBQUEsSUFBRCxDQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQW5CLEVBQXlCLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUE1QyxFQURSOztlQUVBO0lBUEU7O3VCQWVOLElBQUEsR0FBTSxTQUFDLENBQUQsRUFBSSxJQUFKO0FBRUYsWUFBQTs7WUFGTSxPQUFLOztRQUVYLEVBQUEsR0FBSztRQUNMLEVBQUEsdUNBQWU7UUFFZixDQUFBLEdBQUksRUFBQSxHQUFLO1FBQ1QsQ0FBQSxJQUFLO1FBQ0wsSUFBQSxnRUFBcUIsQ0FBRTtRQUN2QixJQUFHLElBQUg7WUFDSSxDQUFBLElBQUssSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFBLFNBQUEsS0FBQTt1QkFBQSxTQUFDLENBQUQ7MkJBQU8sS0FBQyxDQUFBLElBQUQsQ0FBTSxDQUFOO2dCQUFQO1lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFULENBQXdCLENBQUMsSUFBekIsQ0FBOEIsSUFBOUIsRUFEVDs7UUFFQSxDQUFBLElBQUs7UUFDTCxDQUFBLElBQUssRUFBQSxHQUFLO1FBSVYsSUFBRyxDQUFJLEtBQUEsQ0FBTSxDQUFDLENBQUMsSUFBUixDQUFQO1lBRUksSUFBQyxDQUFBLE1BQUQsR0FBVSxFQUFBLEdBQUs7WUFDZixDQUFBLElBQUs7WUFDTCxFQUFBLEdBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFQLENBQVcsQ0FBQSxTQUFBLEtBQUE7dUJBQUEsU0FBQyxDQUFEOzJCQUFPLEtBQUMsQ0FBQSxJQUFELENBQU0sQ0FBTjtnQkFBUDtZQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWDtZQUVMLElBQUcsQ0FBSSxFQUFHLFVBQUUsQ0FBQSxDQUFBLENBQUMsQ0FBQyxVQUFQLENBQWtCLFFBQWxCLENBQUosSUFBb0MsSUFBQSxLQUFRLGFBQS9DO2dCQUNJLEVBQUUsQ0FBQyxJQUFILENBQVEsU0FBQSxHQUFZLElBQUksQ0FBQyxNQUFMLENBQVksRUFBRSxDQUFDLEdBQUgsQ0FBQSxDQUFaLENBQXBCLEVBREo7O1lBRUEsRUFBQSxHQUFLLEVBQUUsQ0FBQyxHQUFILENBQU8sQ0FBQSxTQUFBLEtBQUE7dUJBQUEsU0FBQyxDQUFEOzJCQUFPLEtBQUMsQ0FBQSxNQUFELEdBQVU7Z0JBQWpCO1lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFQO1lBQ0wsQ0FBQSxJQUFLLEVBQUUsQ0FBQyxJQUFILENBQVEsS0FBUjtZQUNMLENBQUEsSUFBSyxJQUFBLEdBQU87WUFDWixJQUFDLENBQUEsTUFBRCxHQUFVLEdBWGQ7O1FBWUEsQ0FBQSxJQUFLO2VBQ0w7SUE1QkU7O3dCQW9DTixRQUFBLEdBQVEsU0FBQyxDQUFEO0FBRUosWUFBQTtRQUFBLENBQUEsR0FBSTtRQUNKLENBQUEsSUFBSyxJQUFJLENBQUMsTUFBTCxDQUFZLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQyxDQUFDLEdBQVIsQ0FBWjtlQUNMO0lBSkk7O3VCQVlSLElBQUEsR0FBTSxTQUFDLENBQUQ7QUFDRixZQUFBO1FBQUEsV0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQVQsS0FBa0IsS0FBbEIsSUFBQSxHQUFBLEtBQXVCLE1BQXZCLElBQUEsR0FBQSxLQUE2QixPQUFoQztZQUNJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBVCxHQUFnQixVQUFBLEdBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUR4Qzs7ZUFFRSxDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQyxDQUFDLE1BQVIsQ0FBRCxDQUFBLEdBQWlCLEdBQWpCLEdBQW1CLENBQUMsSUFBQyxDQUFBLEtBQUQsQ0FBTyxDQUFDLENBQUMsSUFBVCxFQUFlLEdBQWYsQ0FBRCxDQUFuQixHQUF1QztJQUh2Qzs7d0JBV04sSUFBQSxHQUFJLFNBQUMsQ0FBRDtBQUVBLFlBQUE7UUFBQSxJQUFHLENBQUksQ0FBQyxDQUFDLElBQVQ7WUFBWSxPQUFBLENBQU8sS0FBUCxDQUFhLGtCQUFiLEVBQWdDLENBQWhDLEVBQVo7O1FBRUEsRUFBQSxHQUFLO1FBQ0wsRUFBQSx1Q0FBZTtRQUNmLElBQUMsQ0FBQSxNQUFELEdBQVUsRUFBQSxHQUFLO1FBRWYsQ0FBQSxHQUFJO1FBQ0osQ0FBQSxJQUFLLE1BQUEsR0FBTSxDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQyxDQUFDLEdBQVIsQ0FBRCxDQUFOLEdBQW9CO1FBQ3pCLENBQUEsSUFBSyxFQUFBLEdBQUc7QUFDUjtBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksQ0FBQSxJQUFLLEVBQUEsR0FBSyxFQUFMLEdBQVUsSUFBQyxDQUFBLElBQUQsQ0FBTSxDQUFOLENBQVYsR0FBcUI7QUFEOUI7UUFFQSxDQUFBLElBQUssRUFBQSxHQUFHO0FBRVI7QUFBQSxhQUFBLHdDQUFBOztZQUNJLENBQUEsSUFBSztZQUNMLENBQUEsSUFBSyxFQUFBLEdBQUssQ0FBQSxXQUFBLEdBQVcsQ0FBQyxJQUFDLENBQUEsSUFBRCxDQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBaEIsQ0FBRCxDQUFYLEdBQWlDLEtBQWpDO1lBQ1YsQ0FBQSxJQUFLLEVBQUEsR0FBRztBQUNSO0FBQUEsaUJBQUEsd0NBQUE7O2dCQUNJLENBQUEsSUFBSyxFQUFBLEdBQUssRUFBTCxHQUFVLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBTixDQUFWLEdBQXFCO0FBRDlCO1lBRUEsQ0FBQSxJQUFLLEVBQUEsR0FBRztBQU5aO1FBUUEsSUFBRyxDQUFDLEVBQUMsSUFBRCxFQUFKO1lBQ0ksQ0FBQSxJQUFLO1lBQ0wsQ0FBQSxJQUFLLEVBQUEsR0FBSztZQUNWLENBQUEsSUFBSyxFQUFBLEdBQUc7QUFDUjtBQUFBLGlCQUFBLHdDQUFBOztnQkFDSyxDQUFBLElBQUssRUFBQSxHQUFLLEVBQUwsR0FBVSxJQUFDLENBQUEsSUFBRCxDQUFNLENBQU4sQ0FBVixHQUFxQjtBQUQvQjtZQUVBLENBQUEsSUFBSyxFQUFBLEdBQUcsSUFOWjs7UUFRQSxJQUFDLENBQUEsTUFBRCxHQUFVO2VBQ1Y7SUFoQ0E7O3dCQXdDSixLQUFBLEdBQUssU0FBQyxDQUFEO0FBRUQsWUFBQTtRQUFBLElBQUcsQ0FBSSxDQUFDLENBQUMsSUFBVDtZQUFZLE9BQUEsQ0FBTyxLQUFQLENBQWEsbUJBQWIsRUFBaUMsQ0FBakMsRUFBWjs7UUFFQSxFQUFBLEdBQUs7UUFDTCxFQUFBLHVDQUFlO1FBQ2YsSUFBQyxDQUFBLE1BQUQsR0FBVSxFQUFBLEdBQUc7UUFFYixHQUFBLCtJQUEyQyxDQUFFO1FBQzdDLElBQUEsR0FBTyxJQUFDLENBQUEsSUFBRCxDQUFNLENBQUMsQ0FBQyxJQUFSO1FBQ1AsSUFBRyxDQUFJLElBQUosSUFBWSxJQUFBLEtBQVEsV0FBdkI7WUFDSSxLQUFLLENBQUMsSUFBTixDQUFXLGFBQVgsRUFBeUIsQ0FBQyxDQUFDLElBQTNCO1lBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVSxhQUFWLEVBQXdCLENBQUMsQ0FBQyxJQUExQixFQUZKOztRQUdBLE9BQUEsR0FBVTtRQUNWLENBQUEsR0FBSTtRQUNKLENBQUEsSUFBSyxNQUFBLEdBQU8sT0FBUCxHQUFlLEtBQWYsR0FBb0IsSUFBcEIsR0FBeUI7UUFDOUIsQ0FBQSxJQUFLLHNCQUFBLEdBQXVCLE9BQXZCLEdBQStCO1FBQ3BDLENBQUEsSUFBSyxFQUFBLEdBQUc7UUFDUixDQUFBLElBQUssRUFBQSxHQUFHLEVBQUgsR0FBTSxDQUFHLEdBQUQsR0FBSyxLQUFMLEdBQVUsT0FBVixHQUFrQixPQUFwQjtBQUNYO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxDQUFBLElBQUssRUFBQSxHQUFHLEVBQUgsR0FBUSxJQUFDLENBQUEsSUFBRCxDQUFNLENBQU4sQ0FBUixHQUFtQjtBQUQ1QjtRQUVBLENBQUEsSUFBSyxFQUFBLEdBQUc7UUFFUixJQUFDLENBQUEsTUFBRCxHQUFVO2VBQ1Y7SUF4QkM7O3dCQWdDTCxPQUFBLEdBQU8sU0FBQyxDQUFEO0FBRUgsWUFBQTtRQUFBLElBQUcsQ0FBSSxDQUFDLENBQUMsSUFBVDtZQUFZLE9BQUEsQ0FBTyxLQUFQLENBQWEsb0JBQWIsRUFBa0MsQ0FBbEMsRUFBWjs7UUFFQSxFQUFBLEdBQUs7UUFDTCxFQUFBLHVDQUFlO1FBQ2YsSUFBQyxDQUFBLE1BQUQsR0FBVSxFQUFBLEdBQUc7UUFFYixDQUFBLEdBQUk7UUFDSixDQUFBLElBQUssU0FBQSxHQUFTLENBQUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxDQUFDLENBQUMsSUFBUixDQUFELENBQVQsR0FBdUI7UUFDNUIsQ0FBQSxJQUFLLEVBQUEsR0FBRztBQUNSO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxDQUFBLElBQUssRUFBQSxHQUFHLEVBQUgsR0FBUSxJQUFDLENBQUEsSUFBRCxDQUFNLENBQU4sQ0FBUixHQUFtQjtBQUQ1QjtRQUVBLENBQUEsSUFBSyxFQUFBLEdBQUc7UUFFUixJQUFDLENBQUEsTUFBRCxHQUFVO2VBQ1Y7SUFoQkc7O3dCQXdCUCxRQUFBLEdBQVEsU0FBQyxDQUFEO0FBRUosWUFBQTtRQUFBLElBQUcsQ0FBSSxDQUFDLENBQUMsS0FBVDtZQUFhLE9BQUEsQ0FBTyxLQUFQLENBQWEsdUJBQWIsRUFBcUMsQ0FBckMsRUFBYjs7UUFDQSxJQUFHLENBQUksQ0FBQyxDQUFDLEtBQVQ7WUFBYSxPQUFBLENBQU8sS0FBUCxDQUFhLHVCQUFiLEVBQXFDLENBQXJDLEVBQWI7O1FBRUEsRUFBQSxHQUFLO1FBQ0wsRUFBQSx1Q0FBZTtRQUNmLElBQUMsQ0FBQSxNQUFELEdBQVUsRUFBQSxHQUFHO1FBRWIsQ0FBQSxHQUFJO1FBQ0osQ0FBQSxJQUFLLFVBQUEsR0FBVSxDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQyxDQUFDLEtBQVIsQ0FBRCxDQUFWLEdBQXlCO1FBQzlCLENBQUEsSUFBSyxFQUFBLEdBQUc7QUFDUjtBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksQ0FBQSxJQUFLLEVBQUEsR0FBSSxJQUFDLENBQUEsSUFBRCxDQUFNLENBQU4sQ0FBSixHQUFlO0FBRHhCO1FBRUEsSUFBRyxDQUFDLEVBQUMsSUFBRCxFQUFKO1lBQ0ksQ0FBQSxJQUFLLEVBQUEsR0FBRyxFQUFILEdBQU07QUFDWDtBQUFBLGlCQUFBLHdDQUFBOztnQkFDSSxDQUFBLElBQUssRUFBQSxHQUFHLEVBQUgsR0FBTSxFQUFOLEdBQVUsSUFBQyxDQUFBLElBQUQsQ0FBTSxDQUFOLENBQVYsR0FBcUI7QUFEOUIsYUFGSjs7UUFJQSxDQUFBLElBQUssRUFBQSxHQUFHO1FBRVIsSUFBQyxDQUFBLE1BQUQsR0FBVTtlQUNWO0lBckJJOzt1QkE2QlIsSUFBQSxHQUFNLFNBQUMsQ0FBRDtBQUVGLFlBQUE7UUFBQSxJQUFHLENBQUksQ0FBQyxDQUFDLElBQVQ7QUFBbUIsbUJBQUssT0FBQSxDQUFFLEtBQUYsQ0FBUSxvQkFBUixFQUE2QixDQUE3QixFQUF4Qjs7UUFDQSxJQUFHLENBQUksQ0FBQyxDQUFDLElBQVQ7QUFBbUIsbUJBQUssT0FBQSxDQUFFLEtBQUYsQ0FBUSxvQkFBUixFQUE2QixDQUE3QixFQUF4Qjs7UUFFQSxDQUFBLEdBQUk7QUFDSjtBQUFBLGFBQUEscUNBQUE7O1lBQ0ksQ0FBQSxJQUFLLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBVixHQUFvQixJQUFDLENBQUEsSUFBRCxDQUFNLENBQU4sQ0FBcEIsR0FBK0I7QUFEeEM7QUFFQTtBQUFBLGFBQUEsd0NBQUE7O1lBQ0ksQ0FBQSxJQUFLLElBQUMsQ0FBQSxNQUFELEdBQVUsTUFBVixHQUFtQixJQUFDLENBQUEsSUFBRCxDQUFNLENBQU4sQ0FBbkIsR0FBOEI7QUFEdkM7UUFFQSxDQUFBLElBQUssSUFBQyxDQUFBLE1BQUQsR0FBVSxNQUFWLEdBQW1CO2VBQ3hCO0lBWEU7O3VCQW1CTixLQUFBLEdBQU8sU0FBQyxHQUFEO1FBRUgsSUFBRyxHQUFHLENBQUMsSUFBSixLQUFZLFNBQWY7bUJBQ0ksSUFBQyxDQUFBLE9BQUQsQ0FBUyxHQUFULEVBREo7U0FBQSxNQUVLLElBQUcsR0FBRyxDQUFDLElBQUosS0FBWSxRQUFmO21CQUNELEdBQUEsR0FBTSxHQUFHLENBQUMsSUFBSyxhQUFmLEdBQXdCLElBRHZCO1NBQUEsTUFFQSxJQUFHLEdBQUcsQ0FBQyxJQUFKLEtBQVksU0FBWixJQUEwQixHQUFHLENBQUMsSUFBSixLQUFZLEtBQXpDO21CQUNELE9BREM7U0FBQSxNQUVBLElBQUcsR0FBRyxDQUFDLElBQUosS0FBWSxTQUFaLElBQTBCLEdBQUcsQ0FBQyxJQUFKLEtBQVksSUFBekM7bUJBQ0QsUUFEQztTQUFBLE1BQUE7bUJBR0QsR0FBRyxDQUFDLEtBSEg7O0lBUkY7O3VCQW1CUCxPQUFBLEdBQVMsU0FBQyxHQUFEO1FBRUwsSUFBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVQsQ0FBb0IsS0FBcEIsQ0FBSDttQkFDSSxJQUFBLEdBQU8sR0FBRyxDQUFDLElBQUssYUFBaEIsR0FBeUIsSUFBekIsR0FBZ0MsS0FEcEM7U0FBQSxNQUVLLElBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFULENBQW9CLEdBQXBCLENBQUg7bUJBQ0QsSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFULEVBQWEsR0FBRyxDQUFDLEdBQWpCLENBQUEsR0FBd0IsSUFBeEIsR0FBK0IsR0FBRyxDQUFDLElBQUssVUFEdkM7U0FBQSxNQUFBO1lBR0YsT0FBQSxDQUFDLEtBQUQsQ0FBTywwQkFBUDttQkFDQyxHQUpDOztJQUpBOzt1QkFnQlQsU0FBQSxHQUFXLFNBQUMsRUFBRDtBQUVQLFlBQUE7UUFBQSxDQUFBLG1EQUFnQyxFQUFFLENBQUMsUUFBUSxDQUFDO1FBQzVDLEdBQUEsR0FBTTtRQUNOLElBQVksQ0FBSSxFQUFFLENBQUMsR0FBUCxJQUFjLENBQUksRUFBRSxDQUFDLEdBQWpDO1lBQUEsR0FBQSxHQUFNLEdBQU47O1FBRUEsSUFBRyxDQUFBLEtBQU0sR0FBTixJQUFBLENBQUEsS0FBUyxJQUFULElBQUEsQ0FBQSxLQUFhLEtBQWIsSUFBQSxDQUFBLEtBQWtCLEtBQWxCLElBQUEsQ0FBQSxLQUF1QixJQUF2QixJQUFBLENBQUEsS0FBMkIsR0FBOUI7WUFDSSxFQUFBLHFNQUFnRSxDQUFFLFFBQVEsQ0FBQztZQUMzRSxJQUFHLEVBQUEsS0FBTyxHQUFQLElBQUEsRUFBQSxLQUFVLElBQVYsSUFBQSxFQUFBLEtBQWMsS0FBZCxJQUFBLEVBQUEsS0FBbUIsS0FBbkIsSUFBQSxFQUFBLEtBQXdCLElBQXhCLElBQUEsRUFBQSxLQUE0QixHQUEvQjtBQUNJLHVCQUFPLEdBQUEsR0FBTSxJQUFDLENBQUEsSUFBRCxDQUFNLEVBQUUsQ0FBQyxHQUFULENBQU4sR0FBc0IsR0FBdEIsR0FBNEIsQ0FBNUIsR0FBZ0MsR0FBaEMsR0FBc0MsSUFBQyxDQUFBLElBQUQsQ0FBTSxFQUFFLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUF2QixDQUF0QyxHQUFvRSxNQUFwRSxHQUE2RSxJQUFJLENBQUMsTUFBTCxDQUFZLElBQUMsQ0FBQSxJQUFELENBQU0sRUFBRSxDQUFDLEdBQVQsQ0FBWixDQUE3RSxHQUEwRyxJQURySDthQUZKOztlQUtBLElBQUMsQ0FBQSxJQUFELENBQU0sRUFBRSxDQUFDLEdBQVQsQ0FBQSxHQUFnQixHQUFoQixHQUFzQixDQUF0QixHQUEwQixHQUExQixHQUFnQyxJQUFJLENBQUMsTUFBTCxDQUFZLElBQUMsQ0FBQSxJQUFELENBQU0sRUFBRSxDQUFDLEdBQVQsQ0FBWjtJQVh6Qjs7dUJBbUJYLE1BQUEsR0FBUSxTQUFDLENBQUQ7ZUFFRixDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQyxDQUFDLEdBQVIsQ0FBRCxDQUFBLEdBQWEsV0FBYixHQUF1QixDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQyxDQUFDLEdBQVIsQ0FBRCxDQUF2QixHQUFvQztJQUZsQzs7dUJBVVIsTUFBQSxHQUFRLFNBQUMsQ0FBRDtlQUFPLEdBQUEsR0FBRyxDQUFDLElBQUMsQ0FBQSxLQUFELENBQU8sQ0FBQyxDQUFDLElBQVQsQ0FBRCxDQUFILEdBQWtCO0lBQXpCOzt1QkFRUixNQUFBLEdBQVEsU0FBQyxDQUFEO2VBQU8sR0FBQSxHQUFHLENBQUMsSUFBQyxDQUFBLEtBQUQsQ0FBTyxDQUFDLENBQUMsT0FBVCxFQUFrQixHQUFsQixDQUFELENBQUgsR0FBMEI7SUFBakM7O3VCQVFSLE1BQUEsR0FBUSxTQUFDLENBQUQ7ZUFBUyxDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQyxDQUFDLEdBQVIsQ0FBRCxDQUFBLEdBQWMsR0FBZCxHQUFnQixDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQyxDQUFDLEdBQVIsQ0FBRDtJQUF6Qjs7dUJBUVIsSUFBQSxHQUFRLFNBQUMsQ0FBRDtlQUFTLENBQUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxDQUFDLENBQUMsR0FBUixDQUFELENBQUEsR0FBYyxHQUFkLEdBQWdCLENBQUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxDQUFDLENBQUMsSUFBUixDQUFEO0lBQXpCOzt1QkFRUixLQUFBLEdBQVEsU0FBQyxDQUFEO0FBRUosWUFBQTtRQUFBLElBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFYO1lBQ0ksR0FBQSxHQUFNO1lBQ04sSUFBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBbkIsS0FBMkIsSUFBOUI7Z0JBQ0ksR0FBQSxHQUFNLEtBRFY7O21CQUVFLENBQUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxDQUFDLENBQUMsS0FBUixDQUFELENBQUEsR0FBZ0IsU0FBaEIsR0FBd0IsQ0FBQyxJQUFDLENBQUEsSUFBRCxDQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQXBCLENBQUQsQ0FBeEIsR0FBa0QsSUFBbEQsR0FBcUQsQ0FBQyxJQUFDLENBQUEsSUFBRCxDQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQXBCLENBQUQsQ0FBckQsR0FBaUYsR0FBakYsR0FBcUYsSUFKM0Y7U0FBQSxNQUFBO1lBTUksSUFBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVg7Z0JBQ0ksQ0FBQSxHQUFJLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQ1osSUFBRyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQVgsS0FBbUIsR0FBbkIsSUFBMkIsQ0FBSSxDQUFDLENBQUMsR0FBakMsZ0NBQThDLENBQUUsY0FBUCxLQUFlLEtBQTNEO29CQUNJLEVBQUEsR0FBSyxRQUFBLENBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFmO29CQUNMLElBQUcsRUFBQSxLQUFNLENBQVQ7QUFDSSwrQkFBUyxDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQyxDQUFDLEtBQVIsQ0FBRCxDQUFBLEdBQWdCLFVBQWhCLEdBQTBCLEVBQTFCLEdBQTZCLE9BRDFDO3FCQUFBLE1BQUE7QUFHSSwrQkFBUyxDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQyxDQUFDLEtBQVIsQ0FBRCxDQUFBLEdBQWdCLFVBQWhCLEdBQTBCLEVBQTFCLEdBQTZCLElBQTdCLEdBQWdDLENBQUMsRUFBQSxHQUFHLENBQUosQ0FBaEMsR0FBc0MsT0FIbkQ7cUJBRko7aUJBRko7O21CQVNFLENBQUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxDQUFDLENBQUMsS0FBUixDQUFELENBQUEsR0FBZ0IsR0FBaEIsR0FBa0IsQ0FBQyxJQUFDLENBQUEsSUFBRCxDQUFNLENBQUMsQ0FBQyxLQUFSLENBQUQsQ0FBbEIsR0FBaUMsSUFmdkM7O0lBRkk7O3VCQXlCUixLQUFBLEdBQU8sU0FBQyxDQUFEO0FBRUgsWUFBQTtRQUFBLG9DQUFhLENBQUUsY0FBZjttQkFDSSxJQUFDLENBQUEsS0FBRCxDQUFPLENBQUMsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBbEIsRUFESjtTQUFBLE1BQUE7bUJBR0ksR0FBQSxHQUFHLENBQUMsSUFBQyxDQUFBLEtBQUQsQ0FBTyxDQUFDLENBQUMsS0FBVCxFQUFnQixHQUFoQixDQUFELENBQUgsR0FBd0IsSUFINUI7O0lBRkc7O3VCQWFQLEtBQUEsR0FBUSxTQUFDLENBQUQ7QUFFSixZQUFBO1FBQUEsSUFBRyxDQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBUCxLQUFlLEtBQWYsSUFBZSxLQUFmLEtBQXdCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBL0IsQ0FBSDtZQUNJLElBQUEsR0FBTyxRQUFBLENBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFoQjtZQUNQLElBQUEsR0FBTyxRQUFBLENBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFoQjtZQUNQLElBQUcsSUFBQSxHQUFLLElBQUwsSUFBYSxFQUFoQjtnQkFDSSxJQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBUCxLQUFlLEtBQWxCO29CQUE2QixJQUFBLEdBQTdCOzt1QkFDQSxHQUFBLEdBQUksQ0FBQzs7QUFBQzt5QkFBVyxpR0FBWDtxQ0FBQTtBQUFBOztvQkFBRCxDQUF5QixDQUFDLElBQTFCLENBQStCLEdBQS9CLENBQUQsQ0FBSixHQUF5QyxJQUY3QzthQUFBLE1BQUE7Z0JBSUksQ0FBQSxHQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBUCxLQUFlLEtBQWxCLEdBQTZCLEdBQTdCLEdBQXNDO3VCQUMxQyx5Q0FBQSxHQUEwQyxJQUExQyxHQUErQyxNQUEvQyxHQUFxRCxDQUFyRCxHQUF1RCxHQUF2RCxHQUEwRCxJQUExRCxHQUErRCxnREFMbkU7YUFISjtTQUFBLE1BQUE7WUFVSSxDQUFBLEdBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFQLEtBQWUsS0FBbEIsR0FBNkIsR0FBN0IsR0FBc0M7bUJBQzFDLHlDQUFBLEdBQXlDLENBQUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxDQUFDLENBQUMsSUFBUixDQUFELENBQXpDLEdBQXVELE1BQXZELEdBQTZELENBQTdELEdBQStELEdBQS9ELEdBQWlFLENBQUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxDQUFDLENBQUMsSUFBUixDQUFELENBQWpFLEdBQStFLGdEQVhuRjs7SUFGSTs7Ozs7O0FBZVosTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbmtzdHIgID0gcmVxdWlyZSAna3N0cidcbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcbmVtcHR5ID0gKGEpIC0+IGEgaW4gWycnIG51bGwgdW5kZWZpbmVkXSBvciAodHlwZW9mKGEpID09ICdvYmplY3QnIGFuZCBPYmplY3Qua2V5cyhhKS5sZW5ndGggPT0gMClcblxub3BtYXAgPVxuICAgIGFuZDogICAgJyYmJ1xuICAgIG9yOiAgICAgJ3x8J1xuICAgICc9PSc6ICAgJz09PSdcbiAgICAnIT0nOiAgICchPT0nXG5cbmNsYXNzIFJlbmRlcmVyXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQGRlYnVnICAgPSBAa29kZS5hcmdzPy5kZWJ1Z1xuICAgICAgICBAdmVyYm9zZSA9IEBrb2RlLmFyZ3M/LnZlcmJvc2VcblxuICAgIHJlbmRlcjogKGFzdCkgLT5cblxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBAYmxvY2sgYXN0XG4gICAgICAgIHNcblxuICAgIGJsb2NrOiAobm9kZXMpIC0+XG5cbiAgICAgICAgbm9kZXMubWFwKChzKSA9PiBAbm9kZSBzKS5qb2luICdcXG4nXG4gICAgICAgIFxuICAgIG5vZGVzOiAobm9kZXMsIHNlcD0nOycpIC0+XG4gICAgICAgIHNzID0gbm9kZXMubWFwIChzKSA9PiBAbm9kZSBzXG4gICAgICAgIHNzLmpvaW4gc2VwXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuXG4gICAgbm9kZTogKGV4cCkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiAnJyBpZiBub3QgZXhwXG5cbiAgICAgICAgaWYgZXhwLnR5cGU/IHRoZW4gcmV0dXJuIGV4cC50ZXh0XG5cbiAgICAgICAgaWYgZXhwIGluc3RhbmNlb2YgQXJyYXkgdGhlbiByZXR1cm4gKEBub2RlKGEpIGZvciBhIGluIGV4cCkuam9pbiAnO1xcbidcblxuICAgICAgICBzID0gJydcbiAgICAgICAgZm9yIGssdiBvZiBleHBcblxuICAgICAgICAgICAgcyArPSBzd2l0Y2gga1xuICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyAgICAgICAgdGhlbiBAaWYgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2ZvcicgICAgICAgdGhlbiBAZm9yIHZcbiAgICAgICAgICAgICAgICB3aGVuICd3aGlsZScgICAgIHRoZW4gQHdoaWxlIHZcbiAgICAgICAgICAgICAgICB3aGVuICdjbGFzcycgICAgIHRoZW4gQGNsYXNzIHZcbiAgICAgICAgICAgICAgICB3aGVuICdzd2l0Y2gnICAgIHRoZW4gQHN3aXRjaCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnd2hlbicgICAgICB0aGVuIEB3aGVuIHZcbiAgICAgICAgICAgICAgICB3aGVuICdpbmNvbmQnICAgIHRoZW4gQGluY29uZCB2XG4gICAgICAgICAgICAgICAgd2hlbiAndG9rZW4nICAgICB0aGVuIEB0b2tlbiB2XG4gICAgICAgICAgICAgICAgd2hlbiAnb3BlcmF0aW9uJyB0aGVuIEBvcGVyYXRpb24gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3BhcmVucycgICAgdGhlbiBAcGFyZW5zIHZcbiAgICAgICAgICAgICAgICB3aGVuICdhcnJheScgICAgIHRoZW4gQGFycmF5IHZcbiAgICAgICAgICAgICAgICB3aGVuICdvYmplY3QnICAgIHRoZW4gQG9iamVjdCB2XG4gICAgICAgICAgICAgICAgd2hlbiAna2V5dmFsJyAgICB0aGVuIEBrZXl2YWwgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2NhbGwnICAgICAgdGhlbiBAY2FsbCB2XG4gICAgICAgICAgICAgICAgd2hlbiAncHJvcCcgICAgICB0aGVuIEBwcm9wIHZcbiAgICAgICAgICAgICAgICB3aGVuICdpbmRleCcgICAgIHRoZW4gQGluZGV4IHZcbiAgICAgICAgICAgICAgICB3aGVuICdzbGljZScgICAgIHRoZW4gQHNsaWNlIHZcbiAgICAgICAgICAgICAgICB3aGVuICd2YXInICAgICAgIHRoZW4gdi50ZXh0XG4gICAgICAgICAgICAgICAgd2hlbiAnZnVuYycgICAgICB0aGVuIEBmdW5jIHZcbiAgICAgICAgICAgICAgICB3aGVuICdyZXR1cm4nICAgIHRoZW4gQHJldHVybiB2XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBsb2cgUjQoJ3JlbmRlcmVyLm5vZGUgdW5oYW5kbGVkIGV4cCcpLCBleHAgIyBpZiBAZGVidWcgb3IgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICAgICAgJydcbiAgICAgICAgc1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcblxuICAgIGNsYXNzOiAobikgLT5cblxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcImNsYXNzICN7bi5uYW1lLnRleHR9XCJcblxuICAgICAgICBpZiBuLmV4dGVuZHNcbiAgICAgICAgICAgIHMgKz0gXCIgZXh0ZW5kcyBcIiArIG4uZXh0ZW5kcy5tYXAoKGUpIC0+IGUudGV4dCkuam9pbiAnLCAnXG5cbiAgICAgICAgcyArPSAnXFxueydcblxuICAgICAgICBtdGhkcyA9IG4uYm9keT8ub2JqZWN0Py5rZXl2YWxzID8gbi5ib2R5P1swXT8ub2JqZWN0Py5rZXl2YWxzXG4gICAgICAgIFxuICAgICAgICBpZiBtdGhkcz8ubGVuZ3RoXG4gICAgICAgICAgICBtdGhkcyA9IEBwcmVwYXJlTWV0aG9kcyBtdGhkc1xuICAgICAgICAgICAgQGluZGVudCA9ICcgICAgJ1xuICAgICAgICAgICAgZm9yIG0gaW4gbXRoZHNcbiAgICAgICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICAgICAgcyArPSBAbXRoZCBtXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBAaW5kZW50ID0gJydcbiAgICAgICAgcyArPSAnfSdcbiAgICAgICAgc1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4gICAgXG4gICAgcHJlcGFyZU1ldGhvZHM6IChtdGhkcykgLT5cblxuICAgICAgICBiaW5kID0gW11cbiAgICAgICAgZm9yIG0gaW4gbXRoZHNcbiAgICAgICAgICAgIGlmIG5vdCBtLmtleXZhbCBcbiAgICAgICAgICAgICAgICBpZiBub3QgbS50b2tlbj8udHlwZSA9PSAnY29tbWVudCdcbiAgICAgICAgICAgICAgICAgICAgbG9nICd3dGY/JyBtIFxuICAgICAgICAgICAgICAgICAgICBwcmludC5hc3QgJ25vdCBhbiBtZXRob2Q/JyBtXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIG5hbWUgPSBtLmtleXZhbC5rZXkudG9rZW4udGV4dFxuICAgICAgICAgICAgaWYgbmFtZSBpbiBbJ0AnICdjb25zdHJ1Y3RvciddXG4gICAgICAgICAgICAgICAgaWYgY29uc3RydWN0b3IgdGhlbiBlcnJvciAnbW9yZSB0aGFuIG9uZSBjb25zdHJ1Y3Rvcj8nXG4gICAgICAgICAgICAgICAgbS5rZXl2YWwua2V5LnRva2VuLnRleHQ9ICdjb25zdHJ1Y3RvcidcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvciA9IG1cbiAgICAgICAgICAgIGVsc2UgaWYgbmFtZS5zdGFydHNXaXRoICdAJ1xuICAgICAgICAgICAgICAgIG0ua2V5dmFsLmtleS50b2tlbi50ZXh0ID0gJ3N0YXRpYyAnICsgbmFtZVsxLi5dXG4gICAgICAgICAgICBlbHNlIGlmIG0ua2V5dmFsLnZhbC5mdW5jPy5hcnJvdy50ZXh0ID09ICc9PidcbiAgICAgICAgICAgICAgICBiaW5kLnB1c2ggbVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBiaW5kLmxlbmd0aCBhbmQgbm90IGNvbnN0cnVjdG9yICMgZm91bmQgc29tZSBtZXRob2RzIHRvIGJpbmQsIGJ1dCBubyBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgYXN0ID0gQGtvZGUuYXN0IFwiY29uc3RydWN0b3I6IC0+XCIgIyBjcmVhdGUgb25lIGZyb20gc2NyYXRjaFxuICAgICAgICAgICAgcHJpbnQubm9vbiAnYXN0JyBhc3QgaWYgQGRlYnVnXG4gICAgICAgICAgICBjb25zdHJ1Y3RvciA9IGFzdFswXS5vYmplY3Qua2V5dmFsc1swXVxuICAgICAgICAgICAgbXRoZHMudW5zaGlmdCBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgaWYgQGRlYnVnXG4gICAgICAgICAgICAgICAgcHJpbnQubm9vbiAnY29uc3RydWN0b3InIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICAgICAgcHJpbnQuYXN0ICdpbXBsaWNpdCBjb25zdHJ1Y3RvcicgY29uc3RydWN0b3JcbiAgICAgICAgICAgICAgICBwcmludC5hc3QgJ210aGRzIHdpdGggaW1wbGljaXQgY29uc3RydWNvdHInIG10aGRzXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgYmluZC5sZW5ndGhcbiAgICAgICAgICAgIGZvciBiIGluIGJpbmRcbiAgICAgICAgICAgICAgICBibiA9IGIua2V5dmFsLmtleS50b2tlbi50ZXh0XG4gICAgICAgICAgICAgICAgbG9nICdtZXRob2QgdG8gYmluZDonIGJuIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3Iua2V5dmFsLnZhbC5mdW5jLmJvZHkgPz0gW11cbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5rZXl2YWwudmFsLmZ1bmMuYm9keS5wdXNoIFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY29kZSdcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJ0aGlzLiN7Ym59ID0gdGhpcy4je2JufS5iaW5kKHRoaXMpO1wiXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJpbnQuYXN0ICdjb25zdHJ1Y3RvciBhZnRlciBiaW5kJyBjb25zdHJ1Y3RvciBpZiBAZGVidWdcblxuICAgICAgICBwcmludC5hc3QgJ3ByZXBhcmVkIG10aGRzJyBtdGhkcyBpZiBAZGVidWdcbiAgICAgICAgbXRoZHNcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIG10aGQ6IChuKSAtPlxuXG4gICAgICAgIGlmIG4udG9rZW4/LnR5cGUgPT0gJ2NvbW1lbnQnXG4gICAgICAgICAgICByZXR1cm4gQGNvbW1lbnQgbi50b2tlblxuICAgICAgICBcbiAgICAgICAgaWYgbi5rZXl2YWxcbiAgICAgICAgICAgIHMgPSBAZnVuYyBuLmtleXZhbC52YWwuZnVuYywgbi5rZXl2YWwua2V5LnRva2VuLnRleHRcbiAgICAgICAgc1xuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGZ1bmM6IChuLCBuYW1lPSdmdW5jdGlvbicpIC0+XG4gICAgICAgIFxuICAgICAgICBpZCA9ICcgICAgJ1xuICAgICAgICBnaSA9IEBpbmRlbnQgPyAnJ1xuICAgICAgICBcbiAgICAgICAgcyA9IGdpICsgbmFtZVxuICAgICAgICBzICs9ICcgKCdcbiAgICAgICAgYXJncyA9IG4uYXJncz8ucGFyZW5zPy5leHBzXG4gICAgICAgIGlmIGFyZ3NcbiAgICAgICAgICAgIHMgKz0gYXJncy5tYXAoKGEpID0+IEBub2RlIGEpLmpvaW4gJywgJ1xuICAgICAgICBzICs9ICcpXFxuJ1xuICAgICAgICBzICs9IGdpICsgJ3snXG4gICAgICAgIFxuICAgICAgICAjIHByaW50Lm5vb24gJ2Z1bmMnIG4gaWYgQHZlcmJvc2VcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBlbXB0eSBuLmJvZHlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGluZGVudCA9IGdpICsgaWRcbiAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIHNzID0gbi5ib2R5Lm1hcCAocykgPT4gQG5vZGUgc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBub3Qgc3NbLTFdLnN0YXJ0c1dpdGgoJ3JldHVybicpIGFuZCBuYW1lICE9ICdjb25zdHJ1Y3RvcidcbiAgICAgICAgICAgICAgICBzcy5wdXNoICdyZXR1cm4gJyArIGtzdHIubHN0cmlwIHNzLnBvcCgpXG4gICAgICAgICAgICBzcyA9IHNzLm1hcCAocykgPT4gQGluZGVudCArIHNcbiAgICAgICAgICAgIHMgKz0gc3Muam9pbiAnO1xcbidcbiAgICAgICAgICAgIHMgKz0gJ1xcbicgKyBnaVxuICAgICAgICAgICAgQGluZGVudCA9IGdpXG4gICAgICAgIHMgKz0gJ30nXG4gICAgICAgIHNcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHJldHVybjogKG4pIC0+XG5cbiAgICAgICAgcyA9ICdyZXR1cm4gJ1xuICAgICAgICBzICs9IGtzdHIubHN0cmlwIEBub2RlIG4udmFsXG4gICAgICAgIHNcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBjYWxsOiAocCkgLT5cbiAgICAgICAgaWYgcC5jYWxsZWUudGV4dCBpbiBbJ2xvZycnd2FybicnZXJyb3InXVxuICAgICAgICAgICAgcC5jYWxsZWUudGV4dCA9IFwiY29uc29sZS4je3AuY2FsbGVlLnRleHR9XCJcbiAgICAgICAgXCIje0Bub2RlKHAuY2FsbGVlKX0oI3tAbm9kZXMgcC5hcmdzLCAnLCd9KVwiXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMDAwMFxuICAgICMgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwXG5cbiAgICBpZjogKG4pIC0+XG5cbiAgICAgICAgaWYgbm90IG4udGhlbiB0aGVuIGVycm9yICdpZiBleHBlY3RlZCB0aGVuJyBuXG5cbiAgICAgICAgaWQgPSAnICAgICdcbiAgICAgICAgZ2kgPSBAaW5kZW50ID8gJydcbiAgICAgICAgQGluZGVudCA9IGdpICsgaWRcblxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcImlmICgje0Bub2RlKG4uZXhwKX0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgcyArPSBnaSArIGlkICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgZm9yIGVsaWYgaW4gbi5lbGlmcyA/IFtdXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpICsgXCJlbHNlIGlmICgje0Bub2RlKGVsaWYuZWxpZi5leHApfSlcXG5cIlxuICAgICAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICAgICAgZm9yIGUgaW4gZWxpZi5lbGlmLnRoZW5cbiAgICAgICAgICAgICAgICBzICs9IGdpICsgaWQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgaWYgbi5lbHNlXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpICsgJ2Vsc2VcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBmb3IgZSBpbiBuLmVsc2VcbiAgICAgICAgICAgICAgICAgcyArPSBnaSArIGlkICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaStcIn1cIlxuICAgICAgICAgICAgXG4gICAgICAgIEBpbmRlbnQgPSBnaVxuICAgICAgICBzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgZm9yOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBuLnRoZW4gdGhlbiBlcnJvciAnZm9yIGV4cGVjdGVkIHRoZW4nIG5cblxuICAgICAgICBpZCA9ICcgICAgJ1xuICAgICAgICBnaSA9IEBpbmRlbnQgPyAnJ1xuICAgICAgICBAaW5kZW50ID0gZ2kraWRcblxuICAgICAgICB2YWwgPSBuLnZhbHMudG9rZW4/LnRleHQgPyBuLnZhbHNbMF0/LnRva2VuPy50ZXh0XG4gICAgICAgIGxpc3QgPSBAbm9kZSBuLmxpc3RcbiAgICAgICAgaWYgbm90IGxpc3Qgb3IgbGlzdCA9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgcHJpbnQubm9vbiAnbm8gbGlzdCBmb3InIG4ubGlzdFxuICAgICAgICAgICAgcHJpbnQuYXN0ICdubyBsaXN0IGZvcicgbi5saXN0XG4gICAgICAgIGxpc3RWYXIgPSAnbGlzdCcgICAgXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwidmFyICN7bGlzdFZhcn0gPSAje2xpc3R9XFxuXCJcbiAgICAgICAgcyArPSBcImZvciAodmFyIGkgPSAwOyBpIDwgI3tsaXN0VmFyfS5sZW5ndGg7IGkrKylcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIHMgKz0gZ2kraWQrXCIje3ZhbH0gPSAje2xpc3RWYXJ9W2ldXFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuID8gW11cbiAgICAgICAgICAgIHMgKz0gZ2kraWQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcbiAgICAgICAgICAgIFxuICAgICAgICBAaW5kZW50ID0gZ2lcbiAgICAgICAgc1xuXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbiAgICB3aGlsZTogKG4pIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3Qgbi50aGVuIHRoZW4gZXJyb3IgJ3doZW4gZXhwZWN0ZWQgdGhlbicgblxuXG4gICAgICAgIGlkID0gJyAgICAnXG4gICAgICAgIGdpID0gQGluZGVudCA/ICcnXG4gICAgICAgIEBpbmRlbnQgPSBnaStpZFxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwid2hpbGUgKCN7QG5vZGUgbi5jb25kfSlcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIGZvciBlIGluIG4udGhlbiA/IFtdXG4gICAgICAgICAgICBzICs9IGdpK2lkICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG4gICAgICAgICAgICBcbiAgICAgICAgQGluZGVudCA9IGdpXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgc3dpdGNoOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBuLm1hdGNoIHRoZW4gZXJyb3IgJ3N3aXRjaCBleHBlY3RlZCBtYXRjaCcgblxuICAgICAgICBpZiBub3Qgbi53aGVucyB0aGVuIGVycm9yICdzd2l0Y2ggZXhwZWN0ZWQgd2hlbnMnIG5cblxuICAgICAgICBpZCA9ICcgICAgJ1xuICAgICAgICBnaSA9IEBpbmRlbnQgPyAnJ1xuICAgICAgICBAaW5kZW50ID0gZ2kraWRcbiAgICAgICAgXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwic3dpdGNoICgje0Bub2RlIG4ubWF0Y2h9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi53aGVucyA/IFtdXG4gICAgICAgICAgICBzICs9IGdpKyBAbm9kZShlKSArICdcXG4nICAgICAgICAgICAgXG4gICAgICAgIGlmIG4uZWxzZVxuICAgICAgICAgICAgcyArPSBnaStpZCsnZGVmYXVsdDpcXG4nXG4gICAgICAgICAgICBmb3IgZSBpbiBuLmVsc2VcbiAgICAgICAgICAgICAgICBzICs9IGdpK2lkK2lkKyBAbm9kZShlKSArICdcXG4nICAgICAgICAgICAgXG4gICAgICAgIHMgKz0gZ2krXCJ9XFxuXCJcblxuICAgICAgICBAaW5kZW50ID0gZ2lcbiAgICAgICAgc1xuXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgd2hlbjogKG4pIC0+XG5cbiAgICAgICAgaWYgbm90IG4udmFscyB0aGVuIHJldHVybiBlcnJvciAnd2hlbiBleHBlY3RlZCB2YWxzJyBuXG4gICAgICAgIGlmIG5vdCBuLnRoZW4gdGhlbiByZXR1cm4gZXJyb3IgJ3doZW4gZXhwZWN0ZWQgdGhlbicgblxuICAgICAgICBcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIGZvciBlIGluIG4udmFsc1xuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgJ2Nhc2UgJyArIEBub2RlKGUpICsgJzpcXG4nXG4gICAgICAgIGZvciBlIGluIG4udGhlblxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgJyAgICAnICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IEBpbmRlbnQgKyAnICAgICcgKyAnYnJlYWsnXG4gICAgICAgIHNcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAwICAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDBcbiAgICAjICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIHRva2VuOiAodG9rKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rLnR5cGUgPT0gJ2NvbW1lbnQnXG4gICAgICAgICAgICBAY29tbWVudCB0b2tcbiAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAndHJpcGxlJ1xuICAgICAgICAgICAgJ2AnICsgdG9rLnRleHRbMy4uLTRdICsgJ2AnXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ2tleXdvcmQnIGFuZCB0b2sudGV4dCA9PSAneWVzJ1xuICAgICAgICAgICAgJ3RydWUnXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ2tleXdvcmQnIGFuZCB0b2sudGV4dCA9PSAnbm8nXG4gICAgICAgICAgICAnZmFsc2UnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRvay50ZXh0XG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxuICAgIGNvbW1lbnQ6ICh0b2spIC0+XG5cbiAgICAgICAgaWYgdG9rLnRleHQuc3RhcnRzV2l0aCAnIyMjJ1xuICAgICAgICAgICAgJy8qJyArIHRvay50ZXh0WzMuLi00XSArICcqLycgKyAnXFxuJ1xuICAgICAgICBlbHNlIGlmIHRvay50ZXh0LnN0YXJ0c1dpdGggJyMnXG4gICAgICAgICAgICBrc3RyLnBhZCgnJywgdG9rLmNvbCkgKyAnLy8nICsgdG9rLnRleHRbMS4uLTFdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVycm9yIFwiIyBjb21tZW50IHRva2VuIGV4cGVjdGVkXCJcbiAgICAgICAgICAgICcnXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBvcGVyYXRpb246IChvcCkgLT5cblxuICAgICAgICBvICAgPSBvcG1hcFtvcC5vcGVyYXRvci50ZXh0XSA/IG9wLm9wZXJhdG9yLnRleHRcbiAgICAgICAgc2VwID0gJyAnXG4gICAgICAgIHNlcCA9ICcnIGlmIG5vdCBvcC5saHMgb3Igbm90IG9wLnJoc1xuICAgICAgICBcbiAgICAgICAgaWYgbyBpbiBbJzwnJzw9Jyc9PT0nJyE9PScnPj0nJz4nXVxuICAgICAgICAgICAgcm8gPSBvcG1hcFtvcC5yaHM/Lm9wZXJhdGlvbj8ub3BlcmF0b3IudGV4dF0gPyBvcC5yaHM/Lm9wZXJhdGlvbj8ub3BlcmF0b3IudGV4dFxuICAgICAgICAgICAgaWYgcm8gaW4gWyc8Jyc8PScnPT09JychPT0nJz49Jyc+J11cbiAgICAgICAgICAgICAgICByZXR1cm4gJygnICsgQG5vZGUob3AubGhzKSArIHNlcCArIG8gKyBzZXAgKyBAbm9kZShvcC5yaHMub3BlcmF0aW9uLmxocykgKyAnICYmICcgKyBrc3RyLmxzdHJpcChAbm9kZShvcC5yaHMpKSArICcpJ1xuXG4gICAgICAgIEBub2RlKG9wLmxocykgKyBzZXAgKyBvICsgc2VwICsga3N0ci5sc3RyaXAgQG5vZGUob3AucmhzKVxuXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBpbmNvbmQ6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgXCIje0Bub2RlIHAucmhzfS5pbmRleE9mKCN7QG5vZGUgcC5saHN9KSA+PSAwXCJcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgcGFyZW5zOiAocCkgLT4gXCIoI3tAbm9kZXMgcC5leHBzfSlcIlxuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9iamVjdDogKHApIC0+IFwieyN7QG5vZGVzIHAua2V5dmFscywgJywnfX1cIlxuICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBrZXl2YWw6IChwKSAtPiBcIiN7QG5vZGUocC5rZXkpfToje0Bub2RlKHAudmFsKX1cIlxuICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgcHJvcDogICAocCkgLT4gXCIje0Bub2RlKHAub2JqKX0uI3tAbm9kZSBwLnByb3B9XCJcbiAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGluZGV4OiAgKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgaWYgcC5zbGlkeC5zbGljZVxuICAgICAgICAgICAgYWRkID0gJydcbiAgICAgICAgICAgIGlmIHAuc2xpZHguc2xpY2UuZG90cy50ZXh0ID09ICcuLidcbiAgICAgICAgICAgICAgICBhZGQgPSAnKzEnXG4gICAgICAgICAgICBcIiN7QG5vZGUocC5pZHhlZSl9LnNsaWNlKCN7QG5vZGUgcC5zbGlkeC5zbGljZS5mcm9tfSwgI3tAbm9kZSBwLnNsaWR4LnNsaWNlLnVwdG99I3thZGR9KVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHAuc2xpZHgub3BlcmF0aW9uIFxuICAgICAgICAgICAgICAgIG8gPSBwLnNsaWR4Lm9wZXJhdGlvblxuICAgICAgICAgICAgICAgIGlmIG8ub3BlcmF0b3IudGV4dCA9PSAnLScgYW5kIG5vdCBvLmxocyBhbmQgby5yaHM/LnR5cGUgPT0gJ251bSdcbiAgICAgICAgICAgICAgICAgICAgbmkgPSBwYXJzZUludCBvLnJocy50ZXh0XG4gICAgICAgICAgICAgICAgICAgIGlmIG5pID09IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcIiN7QG5vZGUocC5pZHhlZSl9LnNsaWNlKC0je25pfSlbMF1cIlxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCIje0Bub2RlKHAuaWR4ZWUpfS5zbGljZSgtI3tuaX0sLSN7bmktMX0pWzBdXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXCIje0Bub2RlKHAuaWR4ZWUpfVsje0Bub2RlIHAuc2xpZHh9XVwiXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgIDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGFycmF5OiAocCkgLT5cblxuICAgICAgICBpZiBwLml0ZW1zWzBdPy5zbGljZVxuICAgICAgICAgICAgQHNsaWNlIHAuaXRlbXNbMF0uc2xpY2VcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgXCJbI3tAbm9kZXMgcC5pdGVtcywgJywnfV1cIlxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzbGljZTogIChwKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIHAuZnJvbS50eXBlID09ICdudW0nID09IHAudXB0by50eXBlXG4gICAgICAgICAgICBmcm9tID0gcGFyc2VJbnQgcC5mcm9tLnRleHRcbiAgICAgICAgICAgIHVwdG8gPSBwYXJzZUludCBwLnVwdG8udGV4dFxuICAgICAgICAgICAgaWYgdXB0by1mcm9tIDw9IDEwXG4gICAgICAgICAgICAgICAgaWYgcC5kb3RzLnRleHQgPT0gJy4uLicgdGhlbiB1cHRvLS1cbiAgICAgICAgICAgICAgICAnWycrKCh4IGZvciB4IGluIFtmcm9tLi51cHRvXSkuam9pbiAnLCcpKyddJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG8gPSBpZiBwLmRvdHMudGV4dCA9PSAnLi4uJyB0aGVuICc8JyBlbHNlICc8PSdcbiAgICAgICAgICAgICAgICBcIihmdW5jdGlvbigpIHsgdmFyIHIgPSBbXTsgZm9yICh2YXIgaSA9ICN7ZnJvbX07IGkgI3tvfSAje3VwdG99OyBpKyspeyByLnB1c2goaSk7IH0gcmV0dXJuIHI7IH0pLmFwcGx5KHRoaXMpXCJcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIG8gPSBpZiBwLmRvdHMudGV4dCA9PSAnLi4uJyB0aGVuICc8JyBlbHNlICc8PSdcbiAgICAgICAgICAgIFwiKGZ1bmN0aW9uKCkgeyB2YXIgciA9IFtdOyBmb3IgKHZhciBpID0gI3tAbm9kZSBwLmZyb219OyBpICN7b30gI3tAbm9kZSBwLnVwdG99OyBpKyspeyByLnB1c2goaSk7IH0gcmV0dXJuIHI7IH0pLmFwcGx5KHRoaXMpXCJcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBSZW5kZXJlclxuIl19
//# sourceURL=../coffee/renderer.coffee