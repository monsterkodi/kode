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
                    case 'class':
                        return this["class"](v);
                    case 'switch':
                        return this["switch"](v);
                    case 'when':
                        return this.when(v);
                    case 'incond':
                        return this.incond(v);
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
        var ast, b, base, bind, bn, constructor, i, j, len, len1, m, name, ref;
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
            } else if (name.startsWith('@')) {
                m.keyval.key.text = 'static ' + name.slice(1);
            } else if (((ref = m.keyval.val.func) != null ? ref.arrow.text : void 0) === '=>') {
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
                bn = b.keyval.key.text;
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
        var s;
        if (n.type === 'comment') {
            return this.comment(n);
        }
        if (n.keyval) {
            s = this.func(n.keyval.val.func, n.keyval.key.text);
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
        var e, elif, gi, i, id, j, l, len, len1, len2, len3, q, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, s;
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
            ref6 = (ref5 = elif.elif.then) != null ? ref5 : [];
            for (l = 0, len2 = ref6.length; l < len2; l++) {
                e = ref6[l];
                s += gi + id + this.node(e) + '\n';
            }
            s += gi + "}";
        }
        if (n["else"]) {
            s += '\n';
            s += gi + 'else\n';
            s += gi + "{\n";
            ref7 = n["else"];
            for (q = 0, len3 = ref7.length; q < len3; q++) {
                e = ref7[q];
                s += gi + id + this.node(e) + '\n';
            }
            s += gi + "}";
        }
        this.indent = gi;
        return s;
    };

    Renderer.prototype["for"] = function(n) {
        var e, gi, i, id, len, list, listVar, ref, ref1, ref2, ref3, ref4, s, val;
        if (!n.then) {
            console.error('for expected then', n);
        }
        id = '    ';
        gi = (ref = this.indent) != null ? ref : '';
        this.indent = gi + id;
        val = (ref1 = n.vals.text) != null ? ref1 : (ref2 = n.vals[0]) != null ? ref2.text : void 0;
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
        ref4 = (ref3 = n.then) != null ? ref3 : [];
        for (i = 0, len = ref4.length; i < len; i++) {
            e = ref4[i];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsSUFBQSxHQUFRLE9BQUEsQ0FBUSxNQUFSOztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFDUixLQUFBLEdBQVEsU0FBQyxDQUFEO1dBQU8sQ0FBQSxDQUFBLEtBQU0sRUFBTixJQUFBLENBQUEsS0FBUyxJQUFULElBQUEsQ0FBQSxLQUFjLFFBQWQsQ0FBQSxJQUE0QixDQUFDLE9BQU8sQ0FBUCxLQUFhLFFBQWIsSUFBMEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUFaLENBQWMsQ0FBQyxNQUFmLEtBQXlCLENBQXBEO0FBQW5DOztBQUVSLEtBQUEsR0FDSTtJQUFBLEdBQUEsRUFBUSxJQUFSO0lBQ0EsRUFBQSxFQUFRLElBRFI7SUFFQSxJQUFBLEVBQVEsS0FGUjtJQUdBLElBQUEsRUFBUSxLQUhSOzs7QUFLRTtJQUVDLGtCQUFDLElBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7UUFFQSxJQUFDLENBQUEsS0FBRCx1Q0FBcUIsQ0FBRTtRQUN2QixJQUFDLENBQUEsT0FBRCx5Q0FBcUIsQ0FBRTtJQUh4Qjs7dUJBS0gsTUFBQSxHQUFRLFNBQUMsR0FBRDtBQUVKLFlBQUE7UUFBQSxDQUFBLEdBQUk7UUFDSixDQUFBLElBQUssSUFBQyxDQUFBLEtBQUQsQ0FBTyxHQUFQO2VBQ0w7SUFKSTs7dUJBTVIsS0FBQSxHQUFPLFNBQUMsS0FBRDtlQUVILEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxDQUFEO3VCQUFPLEtBQUMsQ0FBQSxJQUFELENBQU0sQ0FBTjtZQUFQO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsSUFBL0I7SUFGRzs7dUJBSVAs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dkQsR0FBNkQsQ0FBN0QsR0FBK0QsR0FBL0QsR0FBaUUsQ0FBQyxJQUFDLENBQUEsSUFBRCxDQUFNLENBQUMsQ0FBQyxJQUFSLENBQUQsQ0FBakUsR0FBK0UsZ0RBWG5GOztJQUZJOzs7Ozs7QUFlWixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxua3N0ciAgPSByZXF1aXJlICdrc3RyJ1xucHJpbnQgPSByZXF1aXJlICcuL3ByaW50J1xuZW1wdHkgPSAoYSkgLT4gYSBpbiBbJycgbnVsbCB1bmRlZmluZWRdIG9yICh0eXBlb2YoYSkgPT0gJ29iamVjdCcgYW5kIE9iamVjdC5rZXlzKGEpLmxlbmd0aCA9PSAwKVxuXG5vcG1hcCA9XG4gICAgYW5kOiAgICAnJiYnXG4gICAgb3I6ICAgICAnfHwnXG4gICAgJz09JzogICAnPT09J1xuICAgICchPSc6ICAgJyE9PSdcblxuY2xhc3MgUmVuZGVyZXJcblxuICAgIEA6IChAa29kZSkgLT5cblxuICAgICAgICBAZGVidWcgICA9IEBrb2RlLmFyZ3M/LmRlYnVnXG4gICAgICAgIEB2ZXJib3NlID0gQGtvZGUuYXJncz8udmVyYm9zZVxuXG4gICAgcmVuZGVyOiAoYXN0KSAtPlxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IEBibG9jayBhc3RcbiAgICAgICAgc1xuXG4gICAgYmxvY2s6IChub2RlcykgLT5cblxuICAgICAgICBub2Rlcy5tYXAoKHMpID0+IEBub2RlIHMpLmpvaW4gJ1xcbidcbiAgICAgICAgXG4gICAgbm9kZXM6IChub2Rlcywgc2VwPSc7JykgLT5cbiAgICAgICAgc3MgPSBub2Rlcy5tYXAgKHMpID0+IEBub2RlIHNcbiAgICAgICAgc3Muam9pbiBzZXBcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG5cbiAgICBub2RlOiAoZXhwKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuICcnIGlmIG5vdCBleHBcblxuICAgICAgICBpZiBleHAudHlwZT8gYW5kIGV4cC50ZXh0PyB0aGVuIHJldHVybiBAdG9rZW4gZXhwXG5cbiAgICAgICAgaWYgZXhwIGluc3RhbmNlb2YgQXJyYXkgdGhlbiByZXR1cm4gKEBub2RlKGEpIGZvciBhIGluIGV4cCkuam9pbiAnO1xcbidcblxuICAgICAgICBzID0gJydcbiAgICAgICAgZm9yIGssdiBvZiBleHBcblxuICAgICAgICAgICAgcyArPSBzd2l0Y2gga1xuICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyAgICAgICAgdGhlbiBAaWYgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2ZvcicgICAgICAgdGhlbiBAZm9yIHZcbiAgICAgICAgICAgICAgICB3aGVuICd3aGlsZScgICAgIHRoZW4gQHdoaWxlIHZcbiAgICAgICAgICAgICAgICB3aGVuICdjbGFzcycgICAgIHRoZW4gQGNsYXNzIHZcbiAgICAgICAgICAgICAgICB3aGVuICdzd2l0Y2gnICAgIHRoZW4gQHN3aXRjaCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnd2hlbicgICAgICB0aGVuIEB3aGVuIHZcbiAgICAgICAgICAgICAgICB3aGVuICdpbmNvbmQnICAgIHRoZW4gQGluY29uZCB2XG4gICAgICAgICAgICAgICAgIyB3aGVuICd0b2tlbicgICAgIHRoZW4gQHRva2VuIHZcbiAgICAgICAgICAgICAgICB3aGVuICdvcGVyYXRpb24nIHRoZW4gQG9wZXJhdGlvbiB2XG4gICAgICAgICAgICAgICAgd2hlbiAncGFyZW5zJyAgICB0aGVuIEBwYXJlbnMgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2FycmF5JyAgICAgdGhlbiBAYXJyYXkgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ29iamVjdCcgICAgdGhlbiBAb2JqZWN0IHZcbiAgICAgICAgICAgICAgICB3aGVuICdrZXl2YWwnICAgIHRoZW4gQGtleXZhbCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnY2FsbCcgICAgICB0aGVuIEBjYWxsIHZcbiAgICAgICAgICAgICAgICB3aGVuICdwcm9wJyAgICAgIHRoZW4gQHByb3AgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2luZGV4JyAgICAgdGhlbiBAaW5kZXggdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3NsaWNlJyAgICAgdGhlbiBAc2xpY2UgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3ZhcicgICAgICAgdGhlbiB2LnRleHRcbiAgICAgICAgICAgICAgICB3aGVuICdmdW5jJyAgICAgIHRoZW4gQGZ1bmMgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3JldHVybicgICAgdGhlbiBAcmV0dXJuIHZcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGxvZyBSNCgncmVuZGVyZXIubm9kZSB1bmhhbmRsZWQgZXhwJyksIGV4cCAjIGlmIEBkZWJ1ZyBvciBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICAnJ1xuICAgICAgICBzXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuXG4gICAgY2xhc3M6IChuKSAtPlxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwiY2xhc3MgI3tuLm5hbWUudGV4dH1cIlxuXG4gICAgICAgIGlmIG4uZXh0ZW5kc1xuICAgICAgICAgICAgcyArPSBcIiBleHRlbmRzIFwiICsgbi5leHRlbmRzLm1hcCgoZSkgLT4gZS50ZXh0KS5qb2luICcsICdcblxuICAgICAgICBzICs9ICdcXG57J1xuXG4gICAgICAgIG10aGRzID0gbi5ib2R5Py5vYmplY3Q/LmtleXZhbHMgPyBuLmJvZHk/WzBdPy5vYmplY3Q/LmtleXZhbHNcbiAgICAgICAgXG4gICAgICAgIGlmIG10aGRzPy5sZW5ndGhcbiAgICAgICAgICAgIG10aGRzID0gQHByZXBhcmVNZXRob2RzIG10aGRzXG4gICAgICAgICAgICBAaW5kZW50ID0gJyAgICAnXG4gICAgICAgICAgICBmb3IgbSBpbiBtdGhkc1xuICAgICAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgICAgICBzICs9IEBtdGhkIG1cbiAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIEBpbmRlbnQgPSAnJ1xuICAgICAgICBzICs9ICd9J1xuICAgICAgICBzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbiAgICBcbiAgICBwcmVwYXJlTWV0aG9kczogKG10aGRzKSAtPlxuXG4gICAgICAgIGJpbmQgPSBbXVxuICAgICAgICBmb3IgbSBpbiBtdGhkc1xuICAgICAgICAgICAgaWYgbm90IG0ua2V5dmFsIFxuICAgICAgICAgICAgICAgIGlmIG5vdCBtLnR5cGUgPT0gJ2NvbW1lbnQnXG4gICAgICAgICAgICAgICAgICAgIGxvZyAnd3RmPycgbSBcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQuYXN0ICdub3QgYW4gbWV0aG9kPycgbVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBuYW1lID0gbS5rZXl2YWwua2V5LnRleHRcbiAgICAgICAgICAgIGlmIG5hbWUgaW4gWydAJyAnY29uc3RydWN0b3InXVxuICAgICAgICAgICAgICAgIGlmIGNvbnN0cnVjdG9yIHRoZW4gZXJyb3IgJ21vcmUgdGhhbiBvbmUgY29uc3RydWN0b3I/J1xuICAgICAgICAgICAgICAgIG0ua2V5dmFsLmtleS50ZXh0PSAnY29uc3RydWN0b3InXG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3IgPSBtXG4gICAgICAgICAgICBlbHNlIGlmIG5hbWUuc3RhcnRzV2l0aCAnQCdcbiAgICAgICAgICAgICAgICBtLmtleXZhbC5rZXkudGV4dCA9ICdzdGF0aWMgJyArIG5hbWVbMS4uXVxuICAgICAgICAgICAgZWxzZSBpZiBtLmtleXZhbC52YWwuZnVuYz8uYXJyb3cudGV4dCA9PSAnPT4nXG4gICAgICAgICAgICAgICAgYmluZC5wdXNoIG1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgYmluZC5sZW5ndGggYW5kIG5vdCBjb25zdHJ1Y3RvciAjIGZvdW5kIHNvbWUgbWV0aG9kcyB0byBiaW5kLCBidXQgbm8gY29uc3RydWN0b3JcbiAgICAgICAgICAgIGFzdCA9IEBrb2RlLmFzdCBcImNvbnN0cnVjdG9yOiAtPlwiICMgY3JlYXRlIG9uZSBmcm9tIHNjcmF0Y2hcbiAgICAgICAgICAgIHByaW50Lm5vb24gJ2FzdCcgYXN0IGlmIEBkZWJ1Z1xuICAgICAgICAgICAgY29uc3RydWN0b3IgPSBhc3RbMF0ub2JqZWN0LmtleXZhbHNbMF1cbiAgICAgICAgICAgIG10aGRzLnVuc2hpZnQgY29uc3RydWN0b3JcbiAgICAgICAgICAgIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgIHByaW50Lm5vb24gJ2NvbnN0cnVjdG9yJyBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgICAgIHByaW50LmFzdCAnaW1wbGljaXQgY29uc3RydWN0b3InIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICAgICAgcHJpbnQuYXN0ICdtdGhkcyB3aXRoIGltcGxpY2l0IGNvbnN0cnVjb3RyJyBtdGhkc1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIGJpbmQubGVuZ3RoXG4gICAgICAgICAgICBmb3IgYiBpbiBiaW5kXG4gICAgICAgICAgICAgICAgYm4gPSBiLmtleXZhbC5rZXkudGV4dFxuICAgICAgICAgICAgICAgIGxvZyAnbWV0aG9kIHRvIGJpbmQ6JyBibiBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLmtleXZhbC52YWwuZnVuYy5ib2R5ID89IFtdXG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3Iua2V5dmFsLnZhbC5mdW5jLmJvZHkucHVzaCBcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NvZGUnXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwidGhpcy4je2JufSA9IHRoaXMuI3tibn0uYmluZCh0aGlzKTtcIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHByaW50LmFzdCAnY29uc3RydWN0b3IgYWZ0ZXIgYmluZCcgY29uc3RydWN0b3IgaWYgQGRlYnVnXG5cbiAgICAgICAgcHJpbnQuYXN0ICdwcmVwYXJlZCBtdGhkcycgbXRoZHMgaWYgQGRlYnVnXG4gICAgICAgIG10aGRzXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBtdGhkOiAobikgLT5cblxuICAgICAgICBpZiBuLnR5cGUgPT0gJ2NvbW1lbnQnXG4gICAgICAgICAgICByZXR1cm4gQGNvbW1lbnQgblxuICAgICAgICBcbiAgICAgICAgaWYgbi5rZXl2YWxcbiAgICAgICAgICAgIHMgPSBAZnVuYyBuLmtleXZhbC52YWwuZnVuYywgbi5rZXl2YWwua2V5LnRleHRcbiAgICAgICAgc1xuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGZ1bmM6IChuLCBuYW1lPSdmdW5jdGlvbicpIC0+XG4gICAgICAgIFxuICAgICAgICBpZCA9ICcgICAgJ1xuICAgICAgICBnaSA9IEBpbmRlbnQgPyAnJ1xuICAgICAgICBcbiAgICAgICAgcyA9IGdpICsgbmFtZVxuICAgICAgICBzICs9ICcgKCdcbiAgICAgICAgYXJncyA9IG4uYXJncz8ucGFyZW5zPy5leHBzXG4gICAgICAgIGlmIGFyZ3NcbiAgICAgICAgICAgIHMgKz0gYXJncy5tYXAoKGEpID0+IEBub2RlIGEpLmpvaW4gJywgJ1xuICAgICAgICBzICs9ICcpXFxuJ1xuICAgICAgICBzICs9IGdpICsgJ3snXG4gICAgICAgIFxuICAgICAgICAjIHByaW50Lm5vb24gJ2Z1bmMnIG4gaWYgQHZlcmJvc2VcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBlbXB0eSBuLmJvZHlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGluZGVudCA9IGdpICsgaWRcbiAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIHNzID0gbi5ib2R5Lm1hcCAocykgPT4gQG5vZGUgc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBub3Qgc3NbLTFdLnN0YXJ0c1dpdGgoJ3JldHVybicpIGFuZCBuYW1lICE9ICdjb25zdHJ1Y3RvcidcbiAgICAgICAgICAgICAgICBzcy5wdXNoICdyZXR1cm4gJyArIGtzdHIubHN0cmlwIHNzLnBvcCgpXG4gICAgICAgICAgICBzcyA9IHNzLm1hcCAocykgPT4gQGluZGVudCArIHNcbiAgICAgICAgICAgIHMgKz0gc3Muam9pbiAnO1xcbidcbiAgICAgICAgICAgIHMgKz0gJ1xcbicgKyBnaVxuICAgICAgICAgICAgQGluZGVudCA9IGdpXG4gICAgICAgIHMgKz0gJ30nXG4gICAgICAgIHNcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHJldHVybjogKG4pIC0+XG5cbiAgICAgICAgcyA9ICdyZXR1cm4gJ1xuICAgICAgICBzICs9IGtzdHIubHN0cmlwIEBub2RlIG4udmFsXG4gICAgICAgIHNcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBjYWxsOiAocCkgLT5cbiAgICAgICAgaWYgcC5jYWxsZWUudGV4dCBpbiBbJ2xvZycnd2FybicnZXJyb3InXVxuICAgICAgICAgICAgcC5jYWxsZWUudGV4dCA9IFwiY29uc29sZS4je3AuY2FsbGVlLnRleHR9XCJcbiAgICAgICAgXCIje0Bub2RlKHAuY2FsbGVlKX0oI3tAbm9kZXMgcC5hcmdzLCAnLCd9KVwiXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMDAwMFxuICAgICMgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwXG5cbiAgICBpZjogKG4pIC0+XG5cbiAgICAgICAgaWYgbm90IG4udGhlbiB0aGVuIGVycm9yICdpZiBleHBlY3RlZCB0aGVuJyBuXG5cbiAgICAgICAgaWQgPSAnICAgICdcbiAgICAgICAgZ2kgPSBAaW5kZW50ID8gJydcbiAgICAgICAgQGluZGVudCA9IGdpICsgaWRcblxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcImlmICgje0Bub2RlKG4uZXhwKX0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgcyArPSBnaSArIGlkICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgZm9yIGVsaWYgaW4gbi5lbGlmcyA/IFtdXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpICsgXCJlbHNlIGlmICgje0Bub2RlKGVsaWYuZWxpZi5leHApfSlcXG5cIlxuICAgICAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICAgICAgZm9yIGUgaW4gZWxpZi5lbGlmLnRoZW4gPyBbXVxuICAgICAgICAgICAgICAgIHMgKz0gZ2kgKyBpZCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ9XCJcblxuICAgICAgICBpZiBuLmVsc2VcbiAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIHMgKz0gZ2kgKyAnZWxzZVxcbidcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgICAgIGZvciBlIGluIG4uZWxzZVxuICAgICAgICAgICAgICAgICBzICs9IGdpICsgaWQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wifVwiXG4gICAgICAgICAgICBcbiAgICAgICAgQGluZGVudCA9IGdpXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBmb3I6IChuKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IG4udGhlbiB0aGVuIGVycm9yICdmb3IgZXhwZWN0ZWQgdGhlbicgblxuXG4gICAgICAgIGlkID0gJyAgICAnXG4gICAgICAgIGdpID0gQGluZGVudCA/ICcnXG4gICAgICAgIEBpbmRlbnQgPSBnaStpZFxuXG4gICAgICAgIHZhbCA9IG4udmFscy50ZXh0ID8gbi52YWxzWzBdPy50ZXh0XG4gICAgICAgIGxpc3QgPSBAbm9kZSBuLmxpc3RcbiAgICAgICAgaWYgbm90IGxpc3Qgb3IgbGlzdCA9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgcHJpbnQubm9vbiAnbm8gbGlzdCBmb3InIG4ubGlzdFxuICAgICAgICAgICAgcHJpbnQuYXN0ICdubyBsaXN0IGZvcicgbi5saXN0XG4gICAgICAgIGxpc3RWYXIgPSAnbGlzdCcgICAgXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwidmFyICN7bGlzdFZhcn0gPSAje2xpc3R9XFxuXCJcbiAgICAgICAgcyArPSBcImZvciAodmFyIGkgPSAwOyBpIDwgI3tsaXN0VmFyfS5sZW5ndGg7IGkrKylcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIHMgKz0gZ2kraWQrXCIje3ZhbH0gPSAje2xpc3RWYXJ9W2ldXFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuID8gW11cbiAgICAgICAgICAgIHMgKz0gZ2kraWQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcbiAgICAgICAgICAgIFxuICAgICAgICBAaW5kZW50ID0gZ2lcbiAgICAgICAgc1xuXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbiAgICB3aGlsZTogKG4pIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3Qgbi50aGVuIHRoZW4gZXJyb3IgJ3doZW4gZXhwZWN0ZWQgdGhlbicgblxuXG4gICAgICAgIGlkID0gJyAgICAnXG4gICAgICAgIGdpID0gQGluZGVudCA/ICcnXG4gICAgICAgIEBpbmRlbnQgPSBnaStpZFxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwid2hpbGUgKCN7QG5vZGUgbi5jb25kfSlcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIGZvciBlIGluIG4udGhlbiA/IFtdXG4gICAgICAgICAgICBzICs9IGdpK2lkICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG4gICAgICAgICAgICBcbiAgICAgICAgQGluZGVudCA9IGdpXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgc3dpdGNoOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBuLm1hdGNoIHRoZW4gZXJyb3IgJ3N3aXRjaCBleHBlY3RlZCBtYXRjaCcgblxuICAgICAgICBpZiBub3Qgbi53aGVucyB0aGVuIGVycm9yICdzd2l0Y2ggZXhwZWN0ZWQgd2hlbnMnIG5cblxuICAgICAgICBpZCA9ICcgICAgJ1xuICAgICAgICBnaSA9IEBpbmRlbnQgPyAnJ1xuICAgICAgICBAaW5kZW50ID0gZ2kraWRcbiAgICAgICAgXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwic3dpdGNoICgje0Bub2RlIG4ubWF0Y2h9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi53aGVucyA/IFtdXG4gICAgICAgICAgICBzICs9IGdpKyBAbm9kZShlKSArICdcXG4nICAgICAgICAgICAgXG4gICAgICAgIGlmIG4uZWxzZVxuICAgICAgICAgICAgcyArPSBnaStpZCsnZGVmYXVsdDpcXG4nXG4gICAgICAgICAgICBmb3IgZSBpbiBuLmVsc2VcbiAgICAgICAgICAgICAgICBzICs9IGdpK2lkK2lkKyBAbm9kZShlKSArICdcXG4nICAgICAgICAgICAgXG4gICAgICAgIHMgKz0gZ2krXCJ9XFxuXCJcblxuICAgICAgICBAaW5kZW50ID0gZ2lcbiAgICAgICAgc1xuXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgd2hlbjogKG4pIC0+XG5cbiAgICAgICAgaWYgbm90IG4udmFscyB0aGVuIHJldHVybiBlcnJvciAnd2hlbiBleHBlY3RlZCB2YWxzJyBuXG4gICAgICAgIGlmIG5vdCBuLnRoZW4gdGhlbiByZXR1cm4gZXJyb3IgJ3doZW4gZXhwZWN0ZWQgdGhlbicgblxuICAgICAgICBcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIGZvciBlIGluIG4udmFsc1xuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgJ2Nhc2UgJyArIEBub2RlKGUpICsgJzpcXG4nXG4gICAgICAgIGZvciBlIGluIG4udGhlblxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgJyAgICAnICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IEBpbmRlbnQgKyAnICAgICcgKyAnYnJlYWsnXG4gICAgICAgIHNcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAwICAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDBcbiAgICAjICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIHRva2VuOiAodG9rKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rLnR5cGUgPT0gJ2NvbW1lbnQnXG4gICAgICAgICAgICBAY29tbWVudCB0b2tcbiAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAndHJpcGxlJ1xuICAgICAgICAgICAgJ2AnICsgdG9rLnRleHRbMy4uLTRdICsgJ2AnXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ2tleXdvcmQnIGFuZCB0b2sudGV4dCA9PSAneWVzJ1xuICAgICAgICAgICAgJ3RydWUnXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ2tleXdvcmQnIGFuZCB0b2sudGV4dCA9PSAnbm8nXG4gICAgICAgICAgICAnZmFsc2UnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRvay50ZXh0XG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxuICAgIGNvbW1lbnQ6ICh0b2spIC0+XG5cbiAgICAgICAgaWYgdG9rLnRleHQuc3RhcnRzV2l0aCAnIyMjJ1xuICAgICAgICAgICAgJy8qJyArIHRvay50ZXh0WzMuLi00XSArICcqLycgKyAnXFxuJ1xuICAgICAgICBlbHNlIGlmIHRvay50ZXh0LnN0YXJ0c1dpdGggJyMnXG4gICAgICAgICAgICBrc3RyLnBhZCgnJywgdG9rLmNvbCkgKyAnLy8nICsgdG9rLnRleHRbMS4uLTFdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVycm9yIFwiIyBjb21tZW50IHRva2VuIGV4cGVjdGVkXCJcbiAgICAgICAgICAgICcnXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBvcGVyYXRpb246IChvcCkgLT5cblxuICAgICAgICBvICAgPSBvcG1hcFtvcC5vcGVyYXRvci50ZXh0XSA/IG9wLm9wZXJhdG9yLnRleHRcbiAgICAgICAgc2VwID0gJyAnXG4gICAgICAgIHNlcCA9ICcnIGlmIG5vdCBvcC5saHMgb3Igbm90IG9wLnJoc1xuICAgICAgICBcbiAgICAgICAgaWYgbyBpbiBbJzwnJzw9Jyc9PT0nJyE9PScnPj0nJz4nXVxuICAgICAgICAgICAgcm8gPSBvcG1hcFtvcC5yaHM/Lm9wZXJhdGlvbj8ub3BlcmF0b3IudGV4dF0gPyBvcC5yaHM/Lm9wZXJhdGlvbj8ub3BlcmF0b3IudGV4dFxuICAgICAgICAgICAgaWYgcm8gaW4gWyc8Jyc8PScnPT09JychPT0nJz49Jyc+J11cbiAgICAgICAgICAgICAgICByZXR1cm4gJygnICsgQG5vZGUob3AubGhzKSArIHNlcCArIG8gKyBzZXAgKyBAbm9kZShvcC5yaHMub3BlcmF0aW9uLmxocykgKyAnICYmICcgKyBrc3RyLmxzdHJpcChAbm9kZShvcC5yaHMpKSArICcpJ1xuXG4gICAgICAgIEBub2RlKG9wLmxocykgKyBzZXAgKyBvICsgc2VwICsga3N0ci5sc3RyaXAgQG5vZGUob3AucmhzKVxuXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBpbmNvbmQ6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgXCIje0Bub2RlIHAucmhzfS5pbmRleE9mKCN7QG5vZGUgcC5saHN9KSA+PSAwXCJcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgcGFyZW5zOiAocCkgLT4gXCIoI3tAbm9kZXMgcC5leHBzfSlcIlxuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9iamVjdDogKHApIC0+IFwieyN7QG5vZGVzIHAua2V5dmFscywgJywnfX1cIlxuICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBrZXl2YWw6IChwKSAtPiBcIiN7QG5vZGUocC5rZXkpfToje0Bub2RlKHAudmFsKX1cIlxuICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgcHJvcDogICAocCkgLT4gXCIje0Bub2RlKHAub2JqKX0uI3tAbm9kZSBwLnByb3B9XCJcbiAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGluZGV4OiAgKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgaWYgcC5zbGlkeC5zbGljZVxuICAgICAgICAgICAgYWRkID0gJydcbiAgICAgICAgICAgIGlmIHAuc2xpZHguc2xpY2UuZG90cy50ZXh0ID09ICcuLidcbiAgICAgICAgICAgICAgICBhZGQgPSAnKzEnXG4gICAgICAgICAgICBcIiN7QG5vZGUocC5pZHhlZSl9LnNsaWNlKCN7QG5vZGUgcC5zbGlkeC5zbGljZS5mcm9tfSwgI3tAbm9kZSBwLnNsaWR4LnNsaWNlLnVwdG99I3thZGR9KVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHAuc2xpZHgub3BlcmF0aW9uIFxuICAgICAgICAgICAgICAgIG8gPSBwLnNsaWR4Lm9wZXJhdGlvblxuICAgICAgICAgICAgICAgIGlmIG8ub3BlcmF0b3IudGV4dCA9PSAnLScgYW5kIG5vdCBvLmxocyBhbmQgby5yaHM/LnR5cGUgPT0gJ251bSdcbiAgICAgICAgICAgICAgICAgICAgbmkgPSBwYXJzZUludCBvLnJocy50ZXh0XG4gICAgICAgICAgICAgICAgICAgIGlmIG5pID09IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcIiN7QG5vZGUocC5pZHhlZSl9LnNsaWNlKC0je25pfSlbMF1cIlxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCIje0Bub2RlKHAuaWR4ZWUpfS5zbGljZSgtI3tuaX0sLSN7bmktMX0pWzBdXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXCIje0Bub2RlKHAuaWR4ZWUpfVsje0Bub2RlIHAuc2xpZHh9XVwiXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgIDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGFycmF5OiAocCkgLT5cblxuICAgICAgICBpZiBwLml0ZW1zWzBdPy5zbGljZVxuICAgICAgICAgICAgQHNsaWNlIHAuaXRlbXNbMF0uc2xpY2VcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgXCJbI3tAbm9kZXMgcC5pdGVtcywgJywnfV1cIlxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzbGljZTogIChwKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIHAuZnJvbS50eXBlID09ICdudW0nID09IHAudXB0by50eXBlXG4gICAgICAgICAgICBmcm9tID0gcGFyc2VJbnQgcC5mcm9tLnRleHRcbiAgICAgICAgICAgIHVwdG8gPSBwYXJzZUludCBwLnVwdG8udGV4dFxuICAgICAgICAgICAgaWYgdXB0by1mcm9tIDw9IDEwXG4gICAgICAgICAgICAgICAgaWYgcC5kb3RzLnRleHQgPT0gJy4uLicgdGhlbiB1cHRvLS1cbiAgICAgICAgICAgICAgICAnWycrKCh4IGZvciB4IGluIFtmcm9tLi51cHRvXSkuam9pbiAnLCcpKyddJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG8gPSBpZiBwLmRvdHMudGV4dCA9PSAnLi4uJyB0aGVuICc8JyBlbHNlICc8PSdcbiAgICAgICAgICAgICAgICBcIihmdW5jdGlvbigpIHsgdmFyIHIgPSBbXTsgZm9yICh2YXIgaSA9ICN7ZnJvbX07IGkgI3tvfSAje3VwdG99OyBpKyspeyByLnB1c2goaSk7IH0gcmV0dXJuIHI7IH0pLmFwcGx5KHRoaXMpXCJcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIG8gPSBpZiBwLmRvdHMudGV4dCA9PSAnLi4uJyB0aGVuICc8JyBlbHNlICc8PSdcbiAgICAgICAgICAgIFwiKGZ1bmN0aW9uKCkgeyB2YXIgciA9IFtdOyBmb3IgKHZhciBpID0gI3tAbm9kZSBwLmZyb219OyBpICN7b30gI3tAbm9kZSBwLnVwdG99OyBpKyspeyByLnB1c2goaSk7IH0gcmV0dXJuIHI7IH0pLmFwcGx5KHRoaXMpXCJcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBSZW5kZXJlclxuIl19
//# sourceURL=../coffee/renderer.coffee