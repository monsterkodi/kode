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

ref = require('./utils'), empty = ref.empty, firstLineCol = ref.firstLineCol, lastLineCol = ref.lastLineCol;

Renderer = (function() {
    function Renderer(kode) {
        var ref1, ref2;
        this.kode = kode;
        this.header = "const _k_ = {\n    list:   function (l)   {return (l != null ? typeof l.length === 'number' ? l : [] : [])}\n    length: function (l)   {return (l != null ? typeof l.length === 'number' ? l.length : 0 : 0)},\n    in:     function (a,l) {return (l != null ? typeof l.indexOf === 'function' ? l.indexOf(a) >= 0 : false : false)}\n    }";
        this.debug = (ref1 = this.kode.args) != null ? ref1.debug : void 0;
        this.verbose = (ref2 = this.kode.args) != null ? ref2.verbose : void 0;
    }

    Renderer.prototype.render = function(ast) {
        var s, v, vs;
        this.varstack = [ast.vars];
        this.indent = '';
        s = '';
        if (!empty(ast.vars)) {
            vs = ((function() {
                var len, q, ref1, results;
                ref1 = ast.vars;
                results = [];
                for (q = 0, len = ref1.length; q < len; q++) {
                    v = ref1[q];
                    results.push(v.text);
                }
                return results;
            })()).join(', ');
            s += this.indent + ("var " + vs + "\n\n");
        }
        s += this.nodes(ast.exps, '\n');
        return s;
    };

    Renderer.prototype.nodes = function(nodes, sep) {
        var sl, ss;
        if (sep == null) {
            sep = ',';
        }
        sl = nodes.map((function(_this) {
            return function(s) {
                return _this.atom(s);
            };
        })(this));
        return ss = sl.join(sep);
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
                var len, q, results;
                results = [];
                for (q = 0, len = exp.length; q < len; q++) {
                    a = exp[q];
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
                    case 'assert':
                        return this.assert(v);
                    case 'qmrkop':
                        return this.qmrkop(v);
                    case 'stripol':
                        return this.stripol(v);
                    case 'qmrkcolon':
                        return this.qmrkcolon(v);
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
                    case 'try':
                        return this["try"](v);
                    default:
                        console.log(R4("renderer.node unhandled key " + k + " in exp"), exp);
                        return '';
                }
            }).call(this);
        }
        return s;
    };

    Renderer.prototype.atom = function(exp) {
        return this.fixAsserts(this.node(exp));
    };

    Renderer.prototype.assert = function(p) {
        return this.node(p.obj) + ("▸" + p.qmrk.line + "_" + p.qmrk.col + "◂");
    };

    Renderer.prototype.qmrkop = function(p) {
        var vn;
        vn = "_" + p.qmrk.line + "_" + p.qmrk.col + "_";
        return "((" + vn + "=" + (this.atom(p.lhs)) + ") != null ? " + vn + " : " + (this.atom(p.rhs)) + ")";
    };

    Renderer.prototype.qmrkcolon = function(p) {
        return "(" + (this.atom(p.lhs)) + " ? " + (this.atom(p.mid)) + " : " + (this.atom(p.rhs)) + ")";
    };

    Renderer.prototype.fixAsserts = function(s) {
        var i, l, len, len1, mtch, q, r, ref1, ref2, ref3, ref4, results, results1, splt, w, y;
        if (!s) {
            return s;
        }
        splt = s.split(/▸\d+_\d+◂/);
        mtch = s.match(/▸\d+_\d+◂/g);
        if (splt.length > 1) {
            mtch = mtch.map(function(m) {
                return "_" + m.slice(1, -1) + "_";
            });
            s = '';
            ref2 = (function() {
                results = [];
                for (var r = 0, ref1 = mtch.length; 0 <= ref1 ? r < ref1 : r > ref1; 0 <= ref1 ? r++ : r--){ results.push(r); }
                return results;
            }).apply(this);
            for (q = 0, len = ref2.length; q < len; q++) {
                i = ref2[q];
                if (mtch.length > 1) {
                    l = "(" + mtch[i] + "=" + (i ? mtch[i - 1] + splt[i] : splt[0]) + ")";
                } else {
                    l = splt[0];
                }
                if (splt[i + 1][0] === '(') {
                    s += "typeof " + l + " === \"function\" ? ";
                } else {
                    s += l + " != null ? ";
                }
            }
            if (mtch.length > 1) {
                s += mtch.slice(-1)[0] + splt.slice(-1)[0];
            } else {
                s += splt[0] + splt[1];
            }
            ref4 = (function() {
                results1 = [];
                for (var y = 0, ref3 = mtch.length; 0 <= ref3 ? y < ref3 : y > ref3; 0 <= ref3 ? y++ : y--){ results1.push(y); }
                return results1;
            }).apply(this);
            for (w = 0, len1 = ref4.length; w < len1; w++) {
                i = ref4[w];
                s += " : undefined";
            }
            s = "(" + s + ")";
        }
        return s;
    };

    Renderer.prototype["class"] = function(n) {
        var len, mi, mthds, q, r, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, results, s;
        s = '\n';
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
            ref8 = (function() {
                results = [];
                for (var r = 0, ref7 = mthds.length; 0 <= ref7 ? r < ref7 : r > ref7; 0 <= ref7 ? r++ : r--){ results.push(r); }
                return results;
            }).apply(this);
            for (q = 0, len = ref8.length; q < len; q++) {
                mi = ref8[q];
                if (mi) {
                    s += '\n';
                }
                s += this.mthd(mthds[mi]);
            }
            s += '\n';
            this.indent = '';
        }
        s += '}\n';
        return s;
    };

    Renderer.prototype.prepareMethods = function(mthds) {
        var ast, b, base, bind, bn, constructor, len, len1, m, name, q, r, ref1;
        bind = [];
        for (q = 0, len = mthds.length; q < len; q++) {
            m = mthds[q];
            if (!m.keyval) {
                print.ast('not an method?', m);
                continue;
            }
            if (!m.keyval.val.func) {
                print.ast('no func for method?', m);
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
            constructor = ast.exps[0].object.keyvals[0];
            constructor.keyval.val.func.name = {
                type: 'name',
                text: 'constructor'
            };
            mthds.unshift(constructor);
        }
        if (bind.length) {
            for (r = 0, len1 = bind.length; r < len1; r++) {
                b = bind[r];
                bn = b.keyval.val.func.name.text;
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
        }
        return mthds;
    };

    Renderer.prototype.mthd = function(n) {
        var s;
        if (n.keyval) {
            s = '\n';
            s += this.indent + this.func(n.keyval.val.func);
        }
        return s;
    };

    Renderer.prototype.func = function(n) {
        var args, gi, len, q, ref1, ref2, ref3, ref4, ref5, ref6, s, ss, str, t, ths, v, vs;
        if (!n) {
            return '';
        }
        gi = this.ind();
        s = (ref1 = (ref2 = n.name) != null ? ref2.text : void 0) != null ? ref1 : 'function';
        s += ' (';
        args = (ref3 = n.args) != null ? (ref4 = ref3.parens) != null ? ref4.exps : void 0 : void 0;
        if (args) {
            ref5 = this.args(args), str = ref5[0], ths = ref5[1];
            s += str;
        }
        s += ')\n';
        s += gi + '{';
        this.varstack.push(n.body.vars);
        if (!empty(n.body.vars)) {
            s += '\n';
            vs = ((function() {
                var len, q, ref6, results;
                ref6 = n.body.vars;
                results = [];
                for (q = 0, len = ref6.length; q < len; q++) {
                    v = ref6[q];
                    results.push(v.text);
                }
                return results;
            })()).join(', ');
            s += this.indent + ("var " + vs + "\n");
        }
        ref6 = ths != null ? ths : [];
        for (q = 0, len = ref6.length; q < len; q++) {
            t = ref6[q];
            s += '\n' + this.indent + ths;
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
        this.varstack.pop();
        this.ded();
        return s;
    };

    Renderer.prototype.args = function(args) {
        var a, len, q, str, ths, used;
        ths = [];
        used = {};
        for (q = 0, len = args.length; q < len; q++) {
            a = args[q];
            if (a.text) {
                used[a.text] = a.text;
            }
        }
        args = args.map(function(a) {
            var i, r, thisVar;
            if (a.prop && a.prop.obj.type === 'this') {
                thisVar = a.prop.prop;
                if (used[thisVar.text]) {
                    for (i = r = 1; r <= 100; i = ++r) {
                        if (!used[thisVar.text + i]) {
                            ths.push("this." + thisVar.text + " = " + (thisVar.text + i));
                            thisVar.text = thisVar.text + i;
                            used[thisVar.text] = thisVar.text;
                            break;
                        }
                    }
                } else {
                    ths.push("this." + thisVar.text + " = " + thisVar.text);
                }
                return thisVar;
            } else {
                return a;
            }
        });
        str = args.map((function(_this) {
            return function(a) {
                return _this.node(a);
            };
        })(this)).join(', ');
        return [str, ths];
    };

    Renderer.prototype["return"] = function(n) {
        var s;
        s = 'return';
        s += ' ' + this.node(n.val);
        return kstr.strip(s);
    };

    Renderer.prototype.call = function(p) {
        var callee, ref1;
        if ((ref1 = p.callee.text) === 'log' || ref1 === 'warn' || ref1 === 'error') {
            p.callee.text = "console." + p.callee.text;
        }
        callee = this.node(p.callee);
        if (callee === 'new') {
            return callee + " " + (this.nodes(p.args, ','));
        } else {
            return callee + "(" + (this.nodes(p.args, ',')) + ")";
        }
    };

    Renderer.prototype["if"] = function(n) {
        var e, elif, first, gi, last, len, len1, len2, len3, q, r, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, s, w, y;
        if (!n.then) {
            console.error('if expected then', n);
        }
        first = firstLineCol(n);
        last = lastLineCol(n);
        if (first.line === last.line && n["else"] && !n.returns) {
            return this.ifInline(n);
        }
        gi = this.ind();
        s = '';
        s += "if (" + (this.atom(n.cond)) + ")\n";
        s += gi + "{\n";
        ref2 = (ref1 = n.then) != null ? ref1 : [];
        for (q = 0, len = ref2.length; q < len; q++) {
            e = ref2[q];
            s += this.indent + this.node(e) + '\n';
        }
        s += gi + "}";
        ref4 = (ref3 = n.elifs) != null ? ref3 : [];
        for (r = 0, len1 = ref4.length; r < len1; r++) {
            elif = ref4[r];
            s += '\n';
            s += gi + ("else if (" + (this.atom(elif.elif.cond)) + ")\n");
            s += gi + "{\n";
            ref6 = (ref5 = elif.elif.then) != null ? ref5 : [];
            for (w = 0, len2 = ref6.length; w < len2; w++) {
                e = ref6[w];
                s += this.indent + this.node(e) + '\n';
            }
            s += gi + "}";
        }
        if (n["else"]) {
            s += '\n';
            s += gi + 'else\n';
            s += gi + "{\n";
            ref8 = (ref7 = n["else"]) != null ? ref7 : [];
            for (y = 0, len3 = ref8.length; y < len3; y++) {
                e = ref8[y];
                s += this.indent + this.node(e) + '\n';
            }
            s += gi + "}";
        }
        this.ded();
        return s;
    };

    Renderer.prototype.ifInline = function(n) {
        var e, len, q, ref1, ref2, s;
        s = '';
        s += (this.atom(n.cond)) + " ? ";
        if ((ref1 = n.then) != null ? ref1.length : void 0) {
            s += ((function() {
                var len, q, ref2, results;
                ref2 = n.then;
                results = [];
                for (q = 0, len = ref2.length; q < len; q++) {
                    e = ref2[q];
                    results.push(this.atom(e));
                }
                return results;
            }).call(this)).join(', ');
        }
        if (n.elifs) {
            ref2 = n.elifs;
            for (q = 0, len = ref2.length; q < len; q++) {
                e = ref2[q];
                s += ' : ';
                s += this.ifInline(e.elif);
            }
        }
        if (n["else"]) {
            s += ' : ';
            if (n["else"].length === 1) {
                s += this.atom(n["else"][0]);
            } else {
                s += '(' + ((function() {
                    var len1, r, ref3, results;
                    ref3 = n["else"];
                    results = [];
                    for (r = 0, len1 = ref3.length; r < len1; r++) {
                        e = ref3[r];
                        results.push(this.atom(e));
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
        var e, gi, iterVar, j, len, len1, list, listVar, lv, q, r, ref1, ref2, ref3, ref4, ref5, results, s, v, w;
        gi = this.ind();
        list = this.node(n.list);
        if (!list || list === 'undefined') {
            print.noon('no list for', n.list);
            print.ast('no list for', n.list);
        }
        listVar = this.freshVar('list');
        iterVar = this.freshVar('i');
        s = '';
        s += "var " + listVar + " = " + list + "\n";
        if (n.vals.text) {
            s += gi + ("for (var " + iterVar + " = 0; " + iterVar + " < " + listVar + ".length; " + iterVar + "++)\n");
            s += gi + "{\n";
            s += this.indent + (n.vals.text + " = " + listVar + "[" + iterVar + "]\n");
        } else if ((ref1 = n.vals.array) != null ? ref1.items : void 0) {
            s += gi + ("for (var " + iterVar + " = 0; " + iterVar + " < " + listVar + ".length; " + iterVar + "++)\n");
            s += gi + "{\n";
            ref3 = (function() {
                results = [];
                for (var r = 0, ref2 = n.vals.array.items.length; 0 <= ref2 ? r < ref2 : r > ref2; 0 <= ref2 ? r++ : r--){ results.push(r); }
                return results;
            }).apply(this);
            for (q = 0, len = ref3.length; q < len; q++) {
                j = ref3[q];
                v = n.vals.array.items[j];
                s += this.indent + (v.text + " = " + listVar + "[" + iterVar + "][" + j + "]\n");
            }
        } else if (n.vals.length > 1) {
            lv = n.vals[1].text;
            s += gi + ("for (" + lv + " = 0; " + lv + " < " + listVar + ".length; " + lv + "++)\n");
            s += gi + "{\n";
            s += this.indent + (n.vals[0].text + " = " + listVar + "[i]\n");
        }
        ref5 = (ref4 = n.then) != null ? ref4 : [];
        for (w = 0, len1 = ref5.length; w < len1; w++) {
            e = ref5[w];
            s += this.indent + this.node(e) + '\n';
        }
        s += gi + "}";
        this.ded();
        return s;
    };

    Renderer.prototype.for_of = function(n) {
        var e, gi, key, len, obj, q, ref1, ref2, ref3, ref4, ref5, s, val;
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
        ref5 = (ref4 = n.then) != null ? ref4 : [];
        for (q = 0, len = ref5.length; q < len; q++) {
            e = ref5[q];
            s += this.indent + this.node(e) + '\n';
        }
        s += gi + "}";
        this.ded();
        return s;
    };

    Renderer.prototype["while"] = function(n) {
        var e, gi, len, q, ref1, ref2, s;
        gi = this.ind();
        s = '';
        s += "while (" + (this.node(n.cond)) + ")\n";
        s += gi + "{\n";
        ref2 = (ref1 = n.then) != null ? ref1 : [];
        for (q = 0, len = ref2.length; q < len; q++) {
            e = ref2[q];
            s += this.indent + this.node(e) + '\n';
        }
        s += gi + "}";
        this.ded();
        return s;
    };

    Renderer.prototype["switch"] = function(n) {
        var e, gi, len, len1, q, r, ref1, ref2, ref3, s;
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
        for (q = 0, len = ref2.length; q < len; q++) {
            e = ref2[q];
            s += gi + this.node(e) + '\n';
        }
        if (n["else"]) {
            s += this.indent + 'default:\n';
            ref3 = n["else"];
            for (r = 0, len1 = ref3.length; r < len1; r++) {
                e = ref3[r];
                s += this.indent + '    ' + this.node(e) + '\n';
            }
        }
        s += gi + "}\n";
        this.ded();
        return s;
    };

    Renderer.prototype.when = function(n) {
        var e, gi, len, len1, q, r, ref1, ref2, ref3, s;
        if (!n.vals) {
            return console.error('when expected vals', n);
        }
        s = '';
        ref1 = n.vals;
        for (q = 0, len = ref1.length; q < len; q++) {
            e = ref1[q];
            s += '    case ' + this.node(e) + ':\n';
        }
        ref3 = (ref2 = n.then) != null ? ref2 : [];
        for (r = 0, len1 = ref3.length; r < len1; r++) {
            e = ref3[r];
            gi = this.ind();
            s += gi + '    ' + this.node(e) + '\n';
            this.ded();
        }
        s += this.indent + '    ' + 'break';
        return s;
    };

    Renderer.prototype["try"] = function(n) {
        var gi, ref1, s;
        s = '';
        gi = this.ind();
        s += 'try\n';
        s += gi + '{\n';
        s += this.indent + this.nodes(n.exps, '\n' + this.indent);
        s += gi + '\n';
        s += gi + '}\n';
        if ((ref1 = n["catch"]) != null ? ref1 : []) {
            s += gi + ("catch (" + (this.node(n["catch"].errr)) + ")\n");
            s += gi + '{\n';
            s += this.indent + this.nodes(n["catch"].exps, '\n' + this.indent);
            s += gi + '\n';
            s += gi + '}\n';
        }
        if (n["finally"]) {
            s += gi + 'finally\n';
            s += gi + '{\n';
            s += this.indent + this.nodes(n["finally"], '\n' + this.indent);
            s += gi + '\n';
            s += gi + '}\n';
        }
        this.ded();
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
        var close, first, o, open, opmap, prfx, ref1, ref2, ref3, ref4, ref5, ro, sep;
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
                return '(' + this.atom(op.lhs) + sep + o + sep + this.atom(op.rhs.operation.lhs) + ' && ' + kstr.lstrip(this.atom(op.rhs)) + ')';
            }
        }
        open = close = '';
        if (o !== '=' && ((ref3 = op.rhs) != null ? (ref4 = ref3.operation) != null ? ref4.operator.text : void 0 : void 0) === '=') {
            open = '(';
            close = ')';
        }
        first = firstLineCol(op.lhs);
        prfx = first.col === 0 && ((ref5 = op.rhs) != null ? ref5.func : void 0) ? '\n' : '';
        return prfx + this.atom(op.lhs) + sep + o + sep + open + kstr.lstrip(this.atom(op.rhs) + close);
    };

    Renderer.prototype.incond = function(p) {
        return (this.node(p.rhs)) + ".indexOf(" + (this.atom(p.lhs)) + ") >= 0";
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
        return key + ":" + (this.atom(p.val));
    };

    Renderer.prototype.prop = function(p) {
        return (this.node(p.obj)) + "." + (this.node(p.prop));
    };

    Renderer.prototype.index = function(p) {
        var addOne, from, ni, ref1, ref2, ref3, slice, u, upper, upto;
        if (slice = p.slidx.slice) {
            from = slice.from != null ? this.node(slice.from) : '0';
            addOne = slice.dots.text === '..';
            if (slice.upto != null) {
                upto = this.node(slice.upto);
            }
            if (((ref1 = slice.upto) != null ? ref1.type : void 0) === 'num' || ((ref2 = slice.upto) != null ? ref2.operation : void 0)) {
                u = parseInt(upto);
                if (u === -1 && addOne) {
                    upper = '';
                } else {
                    if (addOne) {
                        u += 1;
                    }
                    upper = ", " + u;
                }
            } else {
                if (addOne) {
                    if (upto) {
                        upper = ", typeof " + upto + " === 'number' && " + upto + "+1 || Infinity";
                    }
                } else {
                    upper = ", typeof " + upto + " === 'number' && " + upto + " || -1";
                }
            }
            return (this.node(p.idxee)) + ".slice(" + from + (upper != null ? upper : '') + ")";
        } else {
            if (((ref3 = p.slidx.text) != null ? ref3[0] : void 0) === '-') {
                ni = parseInt(p.slidx.text);
                if (ni === -1) {
                    return (this.atom(p.idxee)) + ".slice(" + ni + ")[0]";
                } else {
                    return (this.atom(p.idxee)) + ".slice(" + ni + "," + (ni + 1) + ")[0]";
                }
            }
            return (this.atom(p.idxee)) + "[" + (this.node(p.slidx)) + "]";
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
                    var q, ref1, ref2, results;
                    results = [];
                    for (x = q = ref1 = from, ref2 = upto; ref1 <= ref2 ? q <= ref2 : q >= ref2; x = ref1 <= ref2 ? ++q : --q) {
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

    Renderer.prototype.freshVar = function(name, suffix) {
        var len, len1, q, r, ref1, v, vars;
        if (suffix == null) {
            suffix = 0;
        }
        ref1 = this.varstack;
        for (q = 0, len = ref1.length; q < len; q++) {
            vars = ref1[q];
            for (r = 0, len1 = vars.length; r < len1; r++) {
                v = vars[r];
                if (v.text === name + (suffix || '')) {
                    return this.freshVar(name, suffix + 1);
                }
            }
        }
        this.varstack.slice(-1)[0].push({
            text: name + (suffix || '')
        });
        return name + (suffix || '');
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

    Renderer.prototype.stripol = function(chunks) {
        var chunk, len, q, s, t;
        s = '`';
        for (q = 0, len = chunks.length; q < len; q++) {
            chunk = chunks[q];
            t = chunk.text;
            switch (chunk.type) {
                case 'open':
                    s += t + '${';
                    break;
                case 'close':
                    s += '}' + t;
                    break;
                case 'midl':
                    s += '}' + t + '${';
                    break;
                case 'code':
                    s += this.kode.compile(t);
            }
        }
        s += '`';
        return s;
    };

    return Renderer;

})();

module.exports = Renderer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNERBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQXVDLE9BQUEsQ0FBUSxTQUFSLENBQXZDLEVBQUUsaUJBQUYsRUFBUywrQkFBVCxFQUF1Qjs7QUFFakI7SUFFQyxrQkFBQyxJQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxPQUFEO1FBRUEsSUFBQyxDQUFBLE1BQUQsR0FBVTtRQVFWLElBQUMsQ0FBQSxLQUFELHlDQUFxQixDQUFFO1FBQ3ZCLElBQUMsQ0FBQSxPQUFELHlDQUFxQixDQUFFO0lBWHhCOzt1QkFhSCxNQUFBLEdBQVEsU0FBQyxHQUFEO0FBRUosWUFBQTtRQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBQyxHQUFHLENBQUMsSUFBTDtRQUNaLElBQUMsQ0FBQSxNQUFELEdBQVU7UUFDVixDQUFBLEdBQUk7UUFFSixJQUFHLENBQUksS0FBQSxDQUFNLEdBQUcsQ0FBQyxJQUFWLENBQVA7WUFDSSxFQUFBLEdBQUs7O0FBQUM7QUFBQTtxQkFBQSxzQ0FBQTs7aUNBQUEsQ0FBQyxDQUFDO0FBQUY7O2dCQUFELENBQTBCLENBQUMsSUFBM0IsQ0FBZ0MsSUFBaEM7WUFDTCxDQUFBLElBQUssSUFBQyxDQUFBLE1BQUQsR0FBVSxDQUFBLE1BQUEsR0FBTyxFQUFQLEdBQVUsTUFBVixFQUZuQjs7UUFJQSxDQUFBLElBQUssSUFBQyxDQUFBLEtBQUQsQ0FBTyxHQUFHLENBQUMsSUFBWCxFQUFpQixJQUFqQjtlQUNMO0lBWEk7O3VCQWFSLEtBQUEsR0FBTyxTQUFDLEtBQUQsRUFBUSxHQUFSO0FBRUgsWUFBQTs7WUFGVyxNQUFJOztRQUVmLEVBQUEsR0FBSyxL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QyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsTUFBTztJQUFyQjs7dUJBUUwsT0FBQSxHQUFTLFNBQUMsTUFBRDtBQUVOLFlBQUE7UUFBQSxDQUFBLEdBQUk7QUFDSixhQUFBLHdDQUFBOztZQUNJLENBQUEsR0FBSSxLQUFLLENBQUM7QUFDVixvQkFBTyxLQUFLLENBQUMsSUFBYjtBQUFBLHFCQUNTLE1BRFQ7b0JBQ3NCLENBQUEsSUFBSSxDQUFBLEdBQUU7QUFBbkI7QUFEVCxxQkFFUyxPQUZUO29CQUVzQixDQUFBLElBQUksR0FBQSxHQUFJO0FBQXJCO0FBRlQscUJBR1MsTUFIVDtvQkFHc0IsQ0FBQSxJQUFJLEdBQUEsR0FBSSxDQUFKLEdBQU07QUFBdkI7QUFIVCxxQkFJUyxNQUpUO29CQUtRLENBQUEsSUFBSSxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBYyxDQUFkO0FBTFo7QUFGSjtRQVFBLENBQUEsSUFBSztlQUNMO0lBWk07Ozs7OztBQWNiLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG5rc3RyICA9IHJlcXVpcmUgJ2tzdHInXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5cbnsgZW1wdHksIGZpcnN0TGluZUNvbCwgbGFzdExpbmVDb2wgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIFJlbmRlcmVyXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQGhlYWRlciA9IFwiXCJcIlxuICAgICAgICAgICAgY29uc3QgX2tfID0ge1xuICAgICAgICAgICAgICAgIGxpc3Q6ICAgZnVuY3Rpb24gKGwpICAge3JldHVybiAobCAhPSBudWxsID8gdHlwZW9mIGwubGVuZ3RoID09PSAnbnVtYmVyJyA/IGwgOiBbXSA6IFtdKX1cbiAgICAgICAgICAgICAgICBsZW5ndGg6IGZ1bmN0aW9uIChsKSAgIHtyZXR1cm4gKGwgIT0gbnVsbCA/IHR5cGVvZiBsLmxlbmd0aCA9PT0gJ251bWJlcicgPyBsLmxlbmd0aCA6IDAgOiAwKX0sXG4gICAgICAgICAgICAgICAgaW46ICAgICBmdW5jdGlvbiAoYSxsKSB7cmV0dXJuIChsICE9IG51bGwgPyB0eXBlb2YgbC5pbmRleE9mID09PSAnZnVuY3Rpb24nID8gbC5pbmRleE9mKGEpID49IDAgOiBmYWxzZSA6IGZhbHNlKX1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgICAgIEBkZWJ1ZyAgID0gQGtvZGUuYXJncz8uZGVidWdcbiAgICAgICAgQHZlcmJvc2UgPSBAa29kZS5hcmdzPy52ZXJib3NlXG5cbiAgICByZW5kZXI6IChhc3QpIC0+XG5cbiAgICAgICAgQHZhcnN0YWNrID0gW2FzdC52YXJzXVxuICAgICAgICBAaW5kZW50ID0gJydcbiAgICAgICAgcyA9ICcnXG5cbiAgICAgICAgaWYgbm90IGVtcHR5IGFzdC52YXJzXG4gICAgICAgICAgICB2cyA9ICh2LnRleHQgZm9yIHYgaW4gYXN0LnZhcnMpLmpvaW4gJywgJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgXCJ2YXIgI3t2c31cXG5cXG5cIlxuXG4gICAgICAgIHMgKz0gQG5vZGVzIGFzdC5leHBzLCAnXFxuJ1xuICAgICAgICBzXG5cbiAgICBub2RlczogKG5vZGVzLCBzZXA9JywnKSAtPlxuXG4gICAgICAgIHNsID0gbm9kZXMubWFwIChzKSA9PiBAYXRvbSBzXG4gICAgICAgIHNzID0gc2wuam9pbiBzZXBcblxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuXG4gICAgbm9kZTogKGV4cCkgLT5cblxuICAgICAgICByZXR1cm4gJycgaWYgbm90IGV4cFxuXG4gICAgICAgIGlmIGV4cC50eXBlPyBhbmQgZXhwLnRleHQ/IHRoZW4gcmV0dXJuIEB0b2tlbiBleHBcblxuICAgICAgICBpZiBleHAgaW5zdGFuY2VvZiBBcnJheSB0aGVuIHJldHVybiAoQG5vZGUoYSkgZm9yIGEgaW4gZXhwKS5qb2luICc7XFxuJ1xuXG4gICAgICAgIHMgPSAnJ1xuXG4gICAgICAgIGZvciBrLHYgb2YgZXhwXG5cbiAgICAgICAgICAgIHMrPSBzd2l0Y2gga1xuICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyAgICAgICAgdGhlbiBAaWYgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2ZvcicgICAgICAgdGhlbiBAZm9yIHZcbiAgICAgICAgICAgICAgICB3aGVuICd3aGlsZScgICAgIHRoZW4gQHdoaWxlIHZcbiAgICAgICAgICAgICAgICB3aGVuICdyZXR1cm4nICAgIHRoZW4gQHJldHVybiB2XG4gICAgICAgICAgICAgICAgd2hlbiAnY2xhc3MnICAgICB0aGVuIEBjbGFzcyB2XG4gICAgICAgICAgICAgICAgd2hlbiAnc3dpdGNoJyAgICB0aGVuIEBzd2l0Y2ggdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3doZW4nICAgICAgdGhlbiBAd2hlbiB2XG4gICAgICAgICAgICAgICAgd2hlbiAnYXNzZXJ0JyAgICB0aGVuIEBhc3NlcnQgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3FtcmtvcCcgICAgdGhlbiBAcW1ya29wIHZcbiAgICAgICAgICAgICAgICB3aGVuICdzdHJpcG9sJyAgIHRoZW4gQHN0cmlwb2wgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3Ftcmtjb2xvbicgdGhlbiBAcW1ya2NvbG9uIHZcbiAgICAgICAgICAgICAgICB3aGVuICdvcGVyYXRpb24nIHRoZW4gQG9wZXJhdGlvbiB2XG4gICAgICAgICAgICAgICAgd2hlbiAnaW5jb25kJyAgICB0aGVuIEBpbmNvbmQgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3BhcmVucycgICAgdGhlbiBAcGFyZW5zIHZcbiAgICAgICAgICAgICAgICB3aGVuICdvYmplY3QnICAgIHRoZW4gQG9iamVjdCB2XG4gICAgICAgICAgICAgICAgd2hlbiAna2V5dmFsJyAgICB0aGVuIEBrZXl2YWwgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2FycmF5JyAgICAgdGhlbiBAYXJyYXkgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2luZGV4JyAgICAgdGhlbiBAaW5kZXggdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3NsaWNlJyAgICAgdGhlbiBAc2xpY2UgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3Byb3AnICAgICAgdGhlbiBAcHJvcCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnZnVuYycgICAgICB0aGVuIEBmdW5jIHZcbiAgICAgICAgICAgICAgICB3aGVuICdjYWxsJyAgICAgIHRoZW4gQGNhbGwgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3RyeScgICAgICAgdGhlbiBAdHJ5IHZcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGxvZyBSNChcInJlbmRlcmVyLm5vZGUgdW5oYW5kbGVkIGtleSAje2t9IGluIGV4cFwiKSwgZXhwICMgaWYgQGRlYnVnIG9yIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgICAgICcnXG4gICAgICAgIHNcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxuICAgIGF0b206IChleHApIC0+XG5cbiAgICAgICAgQGZpeEFzc2VydHMgQG5vZGUgZXhwXG5cbiAgICBhc3NlcnQ6IChwKSAtPlxuXG4gICAgICAgIEBub2RlKHAub2JqKSArIFwi4pa4I3twLnFtcmsubGluZX1fI3twLnFtcmsuY29sfeKXglwiXG4gICAgICAgIFxuICAgIHFtcmtvcDogKHApIC0+XG4gICAgICAgIFxuICAgICAgICB2biA9IFwiXyN7cC5xbXJrLmxpbmV9XyN7cC5xbXJrLmNvbH1fXCJcbiAgICAgICAgXCIoKCN7dm59PSN7QGF0b20gcC5saHN9KSAhPSBudWxsID8gI3t2bn0gOiAje0BhdG9tIHAucmhzfSlcIlxuXG4gICAgcW1ya2NvbG9uOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIFwiKCN7QGF0b20gcC5saHN9ID8gI3tAYXRvbSBwLm1pZH0gOiAje0BhdG9tIHAucmhzfSlcIlxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgMDAwICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMFxuXG4gICAgZml4QXNzZXJ0czogKHMpIC0+XG5cbiAgICAgICAgcmV0dXJuIHMgaWYgbm90IHNcblxuICAgICAgICBzcGx0ID0gcy5zcGxpdCAv4pa4XFxkK19cXGQr4peCL1xuICAgICAgICBtdGNoID0gcy5tYXRjaCAv4pa4XFxkK19cXGQr4peCL2dcblxuICAgICAgICBpZiBzcGx0Lmxlbmd0aCA+IDFcblxuICAgICAgICAgICAgbXRjaCA9IG10Y2gubWFwIChtKSAtPiBcIl8je21bMS4uLTJdfV9cIlxuICAgICAgICAgICAgIyBsb2cgc3BsdCwgbXRjaFxuXG4gICAgICAgICAgICBzID0gJydcblxuICAgICAgICAgICAgZm9yIGkgaW4gMC4uLm10Y2gubGVuZ3RoXG5cbiAgICAgICAgICAgICAgICBpZiBtdGNoLmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICAgICAgbCA9IFwiKCN7bXRjaFtpXX09I3soaWYgaSB0aGVuIG10Y2hbaS0xXStzcGx0W2ldIGVsc2Ugc3BsdFswXSl9KVwiXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBsID0gc3BsdFswXVxuXG4gICAgICAgICAgICAgICAgaWYgc3BsdFtpKzFdWzBdID09ICcoJ1xuICAgICAgICAgICAgICAgICAgICBzICs9IFwidHlwZW9mICN7bH0gPT09IFxcXCJmdW5jdGlvblxcXCIgPyBcIlxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcyArPSBcIiN7bH0gIT0gbnVsbCA/IFwiXG5cbiAgICAgICAgICAgIGlmIG10Y2gubGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgIHMgKz0gbXRjaFstMV0rc3BsdFstMV1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzICs9IHNwbHRbMF0rc3BsdFsxXVxuXG4gICAgICAgICAgICBmb3IgaSBpbiAwLi4ubXRjaC5sZW5ndGggdGhlbiBzICs9IFwiIDogdW5kZWZpbmVkXCJcblxuICAgICAgICAgICAgcyA9IFwiKCN7c30pXCJcbiAgICAgICAgc1xuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbiAgICBjbGFzczogKG4pIC0+XG5cbiAgICAgICAgcyA9ICdcXG4nXG4gICAgICAgIHMgKz0gXCJjbGFzcyAje24ubmFtZS50ZXh0fVwiXG5cbiAgICAgICAgaWYgbi5leHRlbmRzXG4gICAgICAgICAgICBzICs9IFwiIGV4dGVuZHMgXCIgKyBuLmV4dGVuZHMubWFwKChlKSAtPiBlLnRleHQpLmpvaW4gJywgJ1xuXG4gICAgICAgIHMgKz0gJ1xcbnsnXG5cbiAgICAgICAgbXRoZHMgPSBuLmJvZHk/Lm9iamVjdD8ua2V5dmFscyA/IG4uYm9keT9bMF0/Lm9iamVjdD8ua2V5dmFsc1xuXG4gICAgICAgIGlmIG10aGRzPy5sZW5ndGhcbiAgICAgICAgICAgIG10aGRzID0gQHByZXBhcmVNZXRob2RzIG10aGRzXG4gICAgICAgICAgICBAaW5kZW50ID0gJyAgICAnXG4gICAgICAgICAgICBmb3IgbWkgaW4gMC4uLm10aGRzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHMgKz0gJ1xcbicgaWYgbWlcbiAgICAgICAgICAgICAgICBzICs9IEBtdGhkIG10aGRzW21pXVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgQGluZGVudCA9ICcnXG4gICAgICAgIHMgKz0gJ31cXG4nXG4gICAgICAgIHNcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcblxuICAgIHByZXBhcmVNZXRob2RzOiAobXRoZHMpIC0+XG5cbiAgICAgICAgYmluZCA9IFtdXG4gICAgICAgIGZvciBtIGluIG10aGRzXG4gICAgICAgICAgICBpZiBub3QgbS5rZXl2YWxcbiAgICAgICAgICAgICAgICBwcmludC5hc3QgJ25vdCBhbiBtZXRob2Q/JyBtXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIGlmIG5vdCBtLmtleXZhbC52YWwuZnVuY1xuICAgICAgICAgICAgICAgIHByaW50LmFzdCAnbm8gZnVuYyBmb3IgbWV0aG9kPycgbVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIG5hbWUgPSBtLmtleXZhbC52YWwuZnVuYy5uYW1lLnRleHRcbiAgICAgICAgICAgIGlmIG5hbWUgaW4gWydAJyAnY29uc3RydWN0b3InXVxuICAgICAgICAgICAgICAgIGlmIGNvbnN0cnVjdG9yIHRoZW4gZXJyb3IgJ21vcmUgdGhhbiBvbmUgY29uc3RydWN0b3I/J1xuICAgICAgICAgICAgICAgIG0ua2V5dmFsLnZhbC5mdW5jLm5hbWUudGV4dCA9ICdjb25zdHJ1Y3RvcidcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvciA9IG1cbiAgICAgICAgICAgIGVsc2UgaWYgbmFtZS5zdGFydHNXaXRoICdAJ1xuICAgICAgICAgICAgICAgIG0ua2V5dmFsLnZhbC5mdW5jLm5hbWUudGV4dCA9ICdzdGF0aWMgJyArIG5hbWVbMS4uXVxuICAgICAgICAgICAgZWxzZSBpZiBtLmtleXZhbC52YWwuZnVuYz8uYXJyb3cudGV4dCA9PSAnPT4nXG4gICAgICAgICAgICAgICAgYmluZC5wdXNoIG1cblxuICAgICAgICBpZiBiaW5kLmxlbmd0aCBhbmQgbm90IGNvbnN0cnVjdG9yICMgZm91bmQgc29tZSBtZXRob2RzIHRvIGJpbmQsIGJ1dCBubyBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgYXN0ID0gQGtvZGUuYXN0IFwiY29uc3RydWN0b3I6IC0+XCIgIyBjcmVhdGUgb25lIGZyb20gc2NyYXRjaFxuICAgICAgICAgICAgY29uc3RydWN0b3IgPSBhc3QuZXhwc1swXS5vYmplY3Qua2V5dmFsc1swXVxuICAgICAgICAgICAgY29uc3RydWN0b3Iua2V5dmFsLnZhbC5mdW5jLm5hbWUgPSB0eXBlOiduYW1lJyB0ZXh0Oidjb25zdHJ1Y3RvcidcbiAgICAgICAgICAgIG10aGRzLnVuc2hpZnQgY29uc3RydWN0b3JcblxuICAgICAgICBpZiBiaW5kLmxlbmd0aFxuICAgICAgICAgICAgZm9yIGIgaW4gYmluZFxuICAgICAgICAgICAgICAgIGJuID0gYi5rZXl2YWwudmFsLmZ1bmMubmFtZS50ZXh0XG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3Iua2V5dmFsLnZhbC5mdW5jLmJvZHkuZXhwcyA/PSBbXVxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLmtleXZhbC52YWwuZnVuYy5ib2R5LmV4cHMucHVzaFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY29kZSdcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJ0aGlzLiN7Ym59ID0gdGhpcy4je2JufS5iaW5kKHRoaXMpXCJcbiAgICAgICAgbXRoZHNcblxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgbXRoZDogKG4pIC0+XG5cbiAgICAgICAgaWYgbi5rZXl2YWxcbiAgICAgICAgICAgIHMgID0gJ1xcbidcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIEBmdW5jIG4ua2V5dmFsLnZhbC5mdW5jXG4gICAgICAgIHNcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMFxuXG4gICAgZnVuYzogKG4pIC0+XG5cbiAgICAgICAgcmV0dXJuICcnIGlmIG5vdCBuXG5cbiAgICAgICAgZ2kgPSBAaW5kKClcblxuICAgICAgICBzID0gbi5uYW1lPy50ZXh0ID8gJ2Z1bmN0aW9uJ1xuICAgICAgICBzICs9ICcgKCdcblxuICAgICAgICBhcmdzID0gbi5hcmdzPy5wYXJlbnM/LmV4cHNcbiAgICAgICAgaWYgYXJnc1xuICAgICAgICAgICAgW3N0ciwgdGhzXSA9IEBhcmdzIGFyZ3NcbiAgICAgICAgICAgIHMgKz0gc3RyXG5cbiAgICAgICAgcyArPSAnKVxcbidcbiAgICAgICAgcyArPSBnaSArICd7J1xuXG4gICAgICAgIEB2YXJzdGFjay5wdXNoIG4uYm9keS52YXJzXG5cbiAgICAgICAgaWYgbm90IGVtcHR5IG4uYm9keS52YXJzXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICB2cyA9ICh2LnRleHQgZm9yIHYgaW4gbi5ib2R5LnZhcnMpLmpvaW4gJywgJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgXCJ2YXIgI3t2c31cXG5cIlxuXG4gICAgICAgIGZvciB0IGluIHRocyA/IFtdXG4gICAgICAgICAgICBzICs9ICdcXG4nICsgQGluZGVudCArIHRoc1xuXG4gICAgICAgIGlmIG5vdCBlbXB0eSBuLmJvZHkuZXhwc1xuXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzcyA9IG4uYm9keS5leHBzLm1hcCAocykgPT4gQG5vZGUgc1xuICAgICAgICAgICAgc3MgPSBzcy5tYXAgKHMpID0+IEBpbmRlbnQgKyBzXG4gICAgICAgICAgICBzICs9IHNzLmpvaW4gJ1xcbidcbiAgICAgICAgICAgIHMgKz0gJ1xcbicgKyBnaVxuXG4gICAgICAgIHMgKz0gJ30nXG5cbiAgICAgICAgQHZhcnN0YWNrLnBvcCgpXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgMDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcblxuICAgIGFyZ3M6IChhcmdzKSAtPlxuXG4gICAgICAgIHRocyAgPSBbXVxuICAgICAgICB1c2VkID0ge31cblxuICAgICAgICBmb3IgYSBpbiBhcmdzXG4gICAgICAgICAgICBpZiBhLnRleHQgdGhlbiB1c2VkW2EudGV4dF0gPSBhLnRleHRcblxuICAgICAgICBhcmdzID0gYXJncy5tYXAgKGEpIC0+XG4gICAgICAgICAgICBpZiBhLnByb3AgYW5kIGEucHJvcC5vYmoudHlwZSA9PSAndGhpcydcbiAgICAgICAgICAgICAgICB0aGlzVmFyID0gYS5wcm9wLnByb3BcbiAgICAgICAgICAgICAgICBpZiB1c2VkW3RoaXNWYXIudGV4dF1cbiAgICAgICAgICAgICAgICAgICAgZm9yIGkgaW4gWzEuLjEwMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCB1c2VkW3RoaXNWYXIudGV4dCtpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocy5wdXNoIFwidGhpcy4je3RoaXNWYXIudGV4dH0gPSAje3RoaXNWYXIudGV4dCtpfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1Zhci50ZXh0ID0gdGhpc1Zhci50ZXh0K2lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VkW3RoaXNWYXIudGV4dF0gPSB0aGlzVmFyLnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhzLnB1c2ggXCJ0aGlzLiN7dGhpc1Zhci50ZXh0fSA9ICN7dGhpc1Zhci50ZXh0fVwiXG5cbiAgICAgICAgICAgICAgICB0aGlzVmFyXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYVxuXG4gICAgICAgIHN0ciA9IGFyZ3MubWFwKChhKSA9PiBAbm9kZSBhKS5qb2luICcsICdcblxuICAgICAgICBbc3RyLHRoc11cblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAwIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDBcblxuICAgIHJldHVybjogKG4pIC0+XG5cbiAgICAgICAgcyA9ICdyZXR1cm4nXG4gICAgICAgIHMgKz0gJyAnICsgQG5vZGUgbi52YWxcbiAgICAgICAga3N0ci5zdHJpcCBzXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMFxuXG4gICAgY2FsbDogKHApIC0+XG4gICAgICAgIGlmIHAuY2FsbGVlLnRleHQgaW4gWydsb2cnJ3dhcm4nJ2Vycm9yJ11cbiAgICAgICAgICAgIHAuY2FsbGVlLnRleHQgPSBcImNvbnNvbGUuI3twLmNhbGxlZS50ZXh0fVwiXG4gICAgICAgIGNhbGxlZSA9IEBub2RlIHAuY2FsbGVlXG4gICAgICAgIGlmIGNhbGxlZSA9PSAnbmV3J1xuICAgICAgICAgICAgXCIje2NhbGxlZX0gI3tAbm9kZXMgcC5hcmdzLCAnLCd9XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgXCIje2NhbGxlZX0oI3tAbm9kZXMgcC5hcmdzLCAnLCd9KVwiXG5cbiAgICAjIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMDAwMFxuICAgICMgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwXG5cbiAgICBpZjogKG4pIC0+XG5cbiAgICAgICAgaWYgbm90IG4udGhlbiB0aGVuIGVycm9yICdpZiBleHBlY3RlZCB0aGVuJyBuXG5cbiAgICAgICAgZmlyc3QgPSBmaXJzdExpbmVDb2wgblxuICAgICAgICBsYXN0ICA9IGxhc3RMaW5lQ29sIG5cblxuICAgICAgICBpZiBmaXJzdC5saW5lID09IGxhc3QubGluZSBhbmQgbi5lbHNlIGFuZCBub3Qgbi5yZXR1cm5zXG4gICAgICAgICAgICByZXR1cm4gQGlmSW5saW5lIG5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwiaWYgKCN7QGF0b20obi5jb25kKX0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgZm9yIGVsaWYgaW4gbi5lbGlmcyA/IFtdXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpICsgXCJlbHNlIGlmICgje0BhdG9tKGVsaWYuZWxpZi5jb25kKX0pXFxuXCJcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgICAgIGZvciBlIGluIGVsaWYuZWxpZi50aGVuID8gW11cbiAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgaWYgbi5lbHNlXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpICsgJ2Vsc2VcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBmb3IgZSBpbiBuLmVsc2UgPyBbXVxuICAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgICMgMDAwICAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcblxuICAgIGlmSW5saW5lOiAobikgLT5cblxuICAgICAgICBzID0gJydcblxuICAgICAgICBzICs9IFwiI3tAYXRvbShuLmNvbmQpfSA/IFwiXG4gICAgICAgIGlmIG4udGhlbj8ubGVuZ3RoXG4gICAgICAgICAgICBzICs9IChAYXRvbShlKSBmb3IgZSBpbiBuLnRoZW4pLmpvaW4gJywgJ1xuXG4gICAgICAgIGlmIG4uZWxpZnNcbiAgICAgICAgICAgIGZvciBlIGluIG4uZWxpZnNcbiAgICAgICAgICAgICAgICBzICs9ICcgOiAnXG4gICAgICAgICAgICAgICAgcyArPSBAaWZJbmxpbmUgZS5lbGlmXG5cbiAgICAgICAgaWYgbi5lbHNlXG4gICAgICAgICAgICBzICs9ICcgOiAnXG4gICAgICAgICAgICBpZiBuLmVsc2UubGVuZ3RoID09IDFcbiAgICAgICAgICAgICAgICBzICs9IEBhdG9tIG4uZWxzZVswXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHMgKz0gJygnICsgKEBhdG9tIGUgZm9yIGUgaW4gbi5lbHNlKS5qb2luKCcsICcpICsgJyknXG4gICAgICAgIHNcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxuICAgIGZvcjogKG4pIC0+XG5cbiAgICAgICAgaWYgbm90IG4udGhlbiB0aGVuIGVycm9yICdmb3IgZXhwZWN0ZWQgdGhlbicgblxuXG4gICAgICAgIHN3aXRjaCBuLmlub2YudGV4dFxuICAgICAgICAgICAgd2hlbiAnaW4nIHRoZW4gQGZvcl9pbiBuXG4gICAgICAgICAgICB3aGVuICdvZicgdGhlbiBAZm9yX29mIG5cbiAgICAgICAgICAgIGVsc2UgZXJyb3IgJ2ZvciBleHBlY3RlZCBpbi9vZidcblxuICAgIGZvcl9pbjogKG4pIC0+XG5cbiAgICAgICAgZ2kgPSBAaW5kKClcblxuICAgICAgICBsaXN0ID0gQG5vZGUgbi5saXN0XG5cbiAgICAgICAgaWYgbm90IGxpc3Qgb3IgbGlzdCA9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgcHJpbnQubm9vbiAnbm8gbGlzdCBmb3InIG4ubGlzdFxuICAgICAgICAgICAgcHJpbnQuYXN0ICdubyBsaXN0IGZvcicgbi5saXN0XG5cbiAgICAgICAgbGlzdFZhciA9IEBmcmVzaFZhciAnbGlzdCdcbiAgICAgICAgaXRlclZhciA9IEBmcmVzaFZhciAnaSdcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJ2YXIgI3tsaXN0VmFyfSA9ICN7bGlzdH1cXG5cIlxuICAgICAgICBpZiBuLnZhbHMudGV4dFxuICAgICAgICAgICAgcyArPSBnaStcImZvciAodmFyICN7aXRlclZhcn0gPSAwOyAje2l0ZXJWYXJ9IDwgI3tsaXN0VmFyfS5sZW5ndGg7ICN7aXRlclZhcn0rKylcXG5cIlxuICAgICAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICAgICAgcyArPSBAaW5kZW50K1wiI3tuLnZhbHMudGV4dH0gPSAje2xpc3RWYXJ9WyN7aXRlclZhcn1dXFxuXCJcbiAgICAgICAgZWxzZSBpZiBuLnZhbHMuYXJyYXk/Lml0ZW1zXG4gICAgICAgICAgICBzICs9IGdpK1wiZm9yICh2YXIgI3tpdGVyVmFyfSA9IDA7ICN7aXRlclZhcn0gPCAje2xpc3RWYXJ9Lmxlbmd0aDsgI3tpdGVyVmFyfSsrKVxcblwiXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBmb3IgaiBpbiAwLi4ubi52YWxzLmFycmF5Lml0ZW1zLmxlbmd0aFxuICAgICAgICAgICAgICAgIHYgPSBuLnZhbHMuYXJyYXkuaXRlbXNbal1cbiAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQrXCIje3YudGV4dH0gPSAje2xpc3RWYXJ9WyN7aXRlclZhcn1dWyN7an1dXFxuXCJcbiAgICAgICAgZWxzZSBpZiBuLnZhbHMubGVuZ3RoID4gMVxuICAgICAgICAgICAgbHYgPSBuLnZhbHNbMV0udGV4dFxuICAgICAgICAgICAgcyArPSBnaStcImZvciAoI3tsdn0gPSAwOyAje2x2fSA8ICN7bGlzdFZhcn0ubGVuZ3RoOyAje2x2fSsrKVxcblwiXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQrXCIje24udmFsc1swXS50ZXh0fSA9ICN7bGlzdFZhcn1baV1cXG5cIlxuXG4gICAgICAgIGZvciBlIGluIG4udGhlbiA/IFtdXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcblxuICAgICAgICBAZGVkKClcbiAgICAgICAgc1xuXG4gICAgZm9yX29mOiAobikgLT5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIGtleSA9IG4udmFscy50ZXh0ID8gbi52YWxzWzBdPy50ZXh0XG4gICAgICAgIHZhbCA9IG4udmFsc1sxXT8udGV4dFxuXG4gICAgICAgIG9iaiA9IEBub2RlIG4ubGlzdFxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcImZvciAoI3trZXl9IGluICN7b2JqfSlcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIGlmIHZhbFxuICAgICAgICAgICAgcyArPSBAaW5kZW50K1wiI3t2YWx9ID0gI3tvYmp9WyN7a2V5fV1cXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMFxuXG4gICAgd2hpbGU6IChuKSAtPlxuXG4gICAgICAgIGdpID0gQGluZCgpXG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJ3aGlsZSAoI3tAbm9kZSBuLmNvbmR9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuID8gW11cbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgc3dpdGNoOiAobikgLT5cblxuICAgICAgICBpZiBub3Qgbi5tYXRjaCB0aGVuIGVycm9yICdzd2l0Y2ggZXhwZWN0ZWQgbWF0Y2gnIG5cbiAgICAgICAgaWYgbm90IG4ud2hlbnMgdGhlbiBlcnJvciAnc3dpdGNoIGV4cGVjdGVkIHdoZW5zJyBuXG5cbiAgICAgICAgZ2kgPSBAaW5kKClcblxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcInN3aXRjaCAoI3tAbm9kZSBuLm1hdGNofSlcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIGZvciBlIGluIG4ud2hlbnMgPyBbXVxuICAgICAgICAgICAgcyArPSBnaSsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBpZiBuLmVsc2VcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCsnZGVmYXVsdDpcXG4nXG4gICAgICAgICAgICBmb3IgZSBpbiBuLmVsc2VcbiAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQrJyAgICAnKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIHMgKz0gZ2krXCJ9XFxuXCJcblxuICAgICAgICBAZGVkKClcbiAgICAgICAgc1xuXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIHdoZW46IChuKSAtPlxuXG4gICAgICAgIGlmIG5vdCBuLnZhbHMgdGhlbiByZXR1cm4gZXJyb3IgJ3doZW4gZXhwZWN0ZWQgdmFscycgblxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBmb3IgZSBpbiBuLnZhbHNcbiAgICAgICAgICAgIHMgKz0gJyAgICBjYXNlICcgKyBAbm9kZShlKSArICc6XFxuJ1xuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgZ2kgPSBAaW5kKClcbiAgICAgICAgICAgIHMgKz0gZ2kgKyAnICAgICcgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBAZGVkKClcbiAgICAgICAgcyArPSBAaW5kZW50ICsgJyAgICAnICsgJ2JyZWFrJ1xuICAgICAgICBzXG5cbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgICAwMDAwMCAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgdHJ5OiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBnaSA9IEBpbmQoKVxuICAgICAgICBzICs9ICd0cnlcXG4nXG4gICAgICAgIHMgKz0gZ2krJ3tcXG4nXG4gICAgICAgIHMgKz0gQGluZGVudCtAbm9kZXMgbi5leHBzLCAnXFxuJytAaW5kZW50XG4gICAgICAgIHMgKz0gZ2krJ1xcbidcbiAgICAgICAgcyArPSBnaSsnfVxcbidcbiAgICAgICAgaWYgbi5jYXRjaCA/IFtdXG4gICAgICAgICAgICBzICs9IGdpK1wiY2F0Y2ggKCN7QG5vZGUgbi5jYXRjaC5lcnJyfSlcXG5cIiBcbiAgICAgICAgICAgIHMgKz0gZ2krJ3tcXG4nXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQrQG5vZGVzIG4uY2F0Y2guZXhwcywgJ1xcbicrQGluZGVudFxuICAgICAgICAgICAgcyArPSBnaSsnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaSsnfVxcbidcbiAgICAgICAgaWYgbi5maW5hbGx5XG4gICAgICAgICAgICBzICs9IGdpKydmaW5hbGx5XFxuJ1xuICAgICAgICAgICAgcyArPSBnaSsne1xcbidcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCtAbm9kZXMgbi5maW5hbGx5LCAnXFxuJytAaW5kZW50XG4gICAgICAgICAgICBzICs9IGdpKydcXG4nXG4gICAgICAgICAgICBzICs9IGdpKyd9XFxuJ1xuICAgICAgICBAZGVkKClcbiAgICAgICAgc1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAwICAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDBcbiAgICAjICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIHRva2VuOiAodG9rKSAtPlxuXG4gICAgICAgIGlmIHRvay50eXBlID09ICdjb21tZW50J1xuICAgICAgICAgICAgQGNvbW1lbnQgdG9rXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ3RoaXMnXG4gICAgICAgICAgICAndGhpcydcbiAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAndHJpcGxlJ1xuICAgICAgICAgICAgJ2AnICsgdG9rLnRleHRbMy4uLTRdICsgJ2AnXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ2tleXdvcmQnIGFuZCB0b2sudGV4dCA9PSAneWVzJ1xuICAgICAgICAgICAgJ3RydWUnXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ2tleXdvcmQnIGFuZCB0b2sudGV4dCA9PSAnbm8nXG4gICAgICAgICAgICAnZmFsc2UnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRvay50ZXh0XG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxuICAgIGNvbW1lbnQ6ICh0b2spIC0+XG5cbiAgICAgICAgaWYgdG9rLnRleHQuc3RhcnRzV2l0aCAnIyMjJ1xuICAgICAgICAgICAgJy8qJyArIHRvay50ZXh0WzMuLi00XSArICcqLycgKyAnXFxuJ1xuICAgICAgICBlbHNlIGlmIHRvay50ZXh0LnN0YXJ0c1dpdGggJyMnXG4gICAgICAgICAgICBrc3RyLnBhZCgnJywgdG9rLmNvbCkgKyAnLy8nICsgdG9rLnRleHRbMS4uLTFdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVycm9yIFwiIyBjb21tZW50IHRva2VuIGV4cGVjdGVkXCJcbiAgICAgICAgICAgICcnXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBvcGVyYXRpb246IChvcCkgLT5cblxuICAgICAgICBvcG1hcCA9IChvKSAtPlxuICAgICAgICAgICAgb21wID1cbiAgICAgICAgICAgICAgICBhbmQ6ICAgICcmJidcbiAgICAgICAgICAgICAgICBvcjogICAgICd8fCdcbiAgICAgICAgICAgICAgICBub3Q6ICAgICchJ1xuICAgICAgICAgICAgICAgICc9PSc6ICAgJz09PSdcbiAgICAgICAgICAgICAgICAnIT0nOiAgICchPT0nXG4gICAgICAgICAgICBvbXBbb10gPyBvXG5cbiAgICAgICAgbyAgID0gb3BtYXAgb3Aub3BlcmF0b3IudGV4dFxuICAgICAgICBzZXAgPSAnICdcbiAgICAgICAgc2VwID0gJycgaWYgbm90IG9wLmxocyBvciBub3Qgb3AucmhzXG5cbiAgICAgICAgaWYgbyBpbiBbJzwnJzw9Jyc9PT0nJyE9PScnPj0nJz4nXVxuICAgICAgICAgICAgcm8gPSBvcG1hcCBvcC5yaHM/Lm9wZXJhdGlvbj8ub3BlcmF0b3IudGV4dFxuICAgICAgICAgICAgaWYgcm8gaW4gWyc8Jyc8PScnPT09JychPT0nJz49Jyc+J11cbiAgICAgICAgICAgICAgICByZXR1cm4gJygnICsgQGF0b20ob3AubGhzKSArIHNlcCArIG8gKyBzZXAgKyBAYXRvbShvcC5yaHMub3BlcmF0aW9uLmxocykgKyAnICYmICcgKyBrc3RyLmxzdHJpcChAYXRvbShvcC5yaHMpKSArICcpJ1xuXG4gICAgICAgIG9wZW4gPSBjbG9zZSA9ICcnXG4gICAgICAgIGlmIG8gIT0gJz0nIGFuZCBvcC5yaHM/Lm9wZXJhdGlvbj8ub3BlcmF0b3IudGV4dCA9PSAnPSdcbiAgICAgICAgICAgIG9wZW4gPSAnKCdcbiAgICAgICAgICAgIGNsb3NlID0gJyknXG5cbiAgICAgICAgZmlyc3QgPSBmaXJzdExpbmVDb2wgb3AubGhzXG4gICAgICAgIHByZnggPSBpZiBmaXJzdC5jb2wgPT0gMCBhbmQgb3AucmhzPy5mdW5jIHRoZW4gJ1xcbicgZWxzZSAnJ1xuICAgICAgICAgICAgXG4gICAgICAgIHByZnggKyBAYXRvbShvcC5saHMpICsgc2VwICsgbyArIHNlcCArIG9wZW4gKyBrc3RyLmxzdHJpcCBAYXRvbShvcC5yaHMpICsgY2xvc2VcblxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgaW5jb25kOiAocCkgLT5cblxuICAgICAgICBcIiN7QG5vZGUgcC5yaHN9LmluZGV4T2YoI3tAYXRvbSBwLmxoc30pID49IDBcIlxuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgcGFyZW5zOiAocCkgLT4gXCIoI3tAbm9kZXMgcC5leHBzfSlcIlxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDBcblxuICAgIG9iamVjdDogKHApIC0+IFwieyN7QG5vZGVzIHAua2V5dmFscywgJywnfX1cIlxuXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGtleXZhbDogKHApIC0+XG4gICAgICAgIGtleSA9IEBub2RlIHAua2V5XG4gICAgICAgIGlmIGtleVswXSBub3QgaW4gXCInXFxcIlwiIGFuZCAvW1xcLlxcLFxcO1xcKlxcK1xcLVxcL1xcPVxcfF0vLnRlc3Qga2V5IHRoZW4ga2V5ID0gXCInI3trZXl9J1wiXG4gICAgICAgIFwiI3trZXl9OiN7QGF0b20ocC52YWwpfVwiXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMFxuXG4gICAgcHJvcDogICAocCkgLT5cblxuICAgICAgICBcIiN7QG5vZGUocC5vYmopfS4je0Bub2RlIHAucHJvcH1cIlxuXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIGluZGV4OiAgKHApIC0+XG5cbiAgICAgICAgaWYgc2xpY2UgPSBwLnNsaWR4LnNsaWNlXG5cbiAgICAgICAgICAgIGZyb20gPSBpZiBzbGljZS5mcm9tPyB0aGVuIEBub2RlIHNsaWNlLmZyb20gZWxzZSAnMCdcblxuICAgICAgICAgICAgYWRkT25lID0gc2xpY2UuZG90cy50ZXh0ID09ICcuLidcblxuICAgICAgICAgICAgaWYgc2xpY2UudXB0bz8gdGhlbiB1cHRvID0gQG5vZGUgc2xpY2UudXB0b1xuXG4gICAgICAgICAgICBpZiBzbGljZS51cHRvPy50eXBlID09ICdudW0nIG9yIHNsaWNlLnVwdG8/Lm9wZXJhdGlvblxuICAgICAgICAgICAgICAgIHUgPSBwYXJzZUludCB1cHRvXG4gICAgICAgICAgICAgICAgaWYgdSA9PSAtMSBhbmQgYWRkT25lXG4gICAgICAgICAgICAgICAgICAgIHVwcGVyID0gJydcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHUgKz0gMSBpZiBhZGRPbmVcbiAgICAgICAgICAgICAgICAgICAgdXBwZXIgPSBcIiwgI3t1fVwiXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgYWRkT25lIHRoZW4gaWYgdXB0byB0aGVuIHVwcGVyID0gXCIsIHR5cGVvZiAje3VwdG99ID09PSAnbnVtYmVyJyAmJiAje3VwdG99KzEgfHwgSW5maW5pdHlcIlxuICAgICAgICAgICAgICAgIGVsc2UgICAgICAgICAgICAgICAgICAgICAgICB1cHBlciA9IFwiLCB0eXBlb2YgI3t1cHRvfSA9PT0gJ251bWJlcicgJiYgI3t1cHRvfSB8fCAtMVwiXG5cbiAgICAgICAgICAgIFwiI3tAbm9kZShwLmlkeGVlKX0uc2xpY2UoI3tmcm9tfSN7dXBwZXIgPyAnJ30pXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgcC5zbGlkeC50ZXh0P1swXSA9PSAnLSdcbiAgICAgICAgICAgICAgICBuaSA9IHBhcnNlSW50IHAuc2xpZHgudGV4dFxuICAgICAgICAgICAgICAgIGlmIG5pID09IC0xXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIiN7QGF0b20ocC5pZHhlZSl9LnNsaWNlKCN7bml9KVswXVwiXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCIje0BhdG9tKHAuaWR4ZWUpfS5zbGljZSgje25pfSwje25pKzF9KVswXVwiXG5cbiAgICAgICAgICAgIFwiI3tAYXRvbShwLmlkeGVlKX1bI3tAbm9kZSBwLnNsaWR4fV1cIlxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgIDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxuICAgIGFycmF5OiAocCkgLT5cblxuICAgICAgICBpZiBwLml0ZW1zWzBdPy5zbGljZVxuICAgICAgICAgICAgQHNsaWNlIHAuaXRlbXNbMF0uc2xpY2VcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgXCJbI3tAbm9kZXMgcC5pdGVtcywgJywnfV1cIlxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDBcblxuICAgIHNsaWNlOiAocCkgLT5cblxuICAgICAgICBpZiBwLmZyb20udHlwZSA9PSAnbnVtJyA9PSBwLnVwdG8udHlwZVxuICAgICAgICAgICAgZnJvbSA9IHBhcnNlSW50IHAuZnJvbS50ZXh0XG4gICAgICAgICAgICB1cHRvID0gcGFyc2VJbnQgcC51cHRvLnRleHRcbiAgICAgICAgICAgIGlmIHVwdG8tZnJvbSA8PSAxMFxuICAgICAgICAgICAgICAgIGlmIHAuZG90cy50ZXh0ID09ICcuLi4nIHRoZW4gdXB0by0tXG4gICAgICAgICAgICAgICAgJ1snKygoeCBmb3IgeCBpbiBbZnJvbS4udXB0b10pLmpvaW4gJywnKSsnXSdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvID0gaWYgcC5kb3RzLnRleHQgPT0gJy4uLicgdGhlbiAnPCcgZWxzZSAnPD0nXG4gICAgICAgICAgICAgICAgXCIoZnVuY3Rpb24oKSB7IHZhciByID0gW107IGZvciAodmFyIGkgPSAje2Zyb219OyBpICN7b30gI3t1cHRvfTsgaSsrKXsgci5wdXNoKGkpOyB9IHJldHVybiByOyB9KS5hcHBseSh0aGlzKVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG8gPSBpZiBwLmRvdHMudGV4dCA9PSAnLi4uJyB0aGVuICc8JyBlbHNlICc8PSdcbiAgICAgICAgICAgIFwiKGZ1bmN0aW9uKCkgeyB2YXIgciA9IFtdOyBmb3IgKHZhciBpID0gI3tAbm9kZSBwLmZyb219OyBpICN7b30gI3tAbm9kZSBwLnVwdG99OyBpKyspeyByLnB1c2goaSk7IH0gcmV0dXJuIHI7IH0pLmFwcGx5KHRoaXMpXCJcblxuICAgIGZyZXNoVmFyOiAobmFtZSwgc3VmZml4PTApIC0+XG5cbiAgICAgICAgZm9yIHZhcnMgaW4gQHZhcnN0YWNrXG4gICAgICAgICAgICBmb3IgdiBpbiB2YXJzXG4gICAgICAgICAgICAgICAgaWYgdi50ZXh0ID09IG5hbWUgKyAoc3VmZml4IG9yICcnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQGZyZXNoVmFyIG5hbWUsIHN1ZmZpeCsxXG5cbiAgICAgICAgQHZhcnN0YWNrWy0xXS5wdXNoIHRleHQ6bmFtZSArIChzdWZmaXggb3IgJycpXG4gICAgICAgIG5hbWUgKyAoc3VmZml4IG9yICcnKVxuXG4gICAgdmVyYjogLT4gaWYgQHZlcmJvc2UgdGhlbiBjb25zb2xlLmxvZy5hcHBseSBjb25zb2xlLmxvZywgYXJndW1lbnRzXG4gICAgXG4gICAgaW5kOiAtPlxuXG4gICAgICAgIG9pID0gQGluZGVudFxuICAgICAgICBAaW5kZW50ICs9ICcgICAgJ1xuICAgICAgICBvaVxuXG4gICAgZGVkOiAtPiBAaW5kZW50ID0gQGluZGVudFsuLi4tNF1cbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICBcbiAgICBzdHJpcG9sOiAoY2h1bmtzKSAtPlxuICAgICAgICBcbiAgICAgICBzID0gJ2AnXG4gICAgICAgZm9yIGNodW5rIGluIGNodW5rc1xuICAgICAgICAgICB0ID0gY2h1bmsudGV4dFxuICAgICAgICAgICBzd2l0Y2ggY2h1bmsudHlwZVxuICAgICAgICAgICAgICAgd2hlbiAnb3BlbicgIHRoZW4gcys9IHQrJyR7J1xuICAgICAgICAgICAgICAgd2hlbiAnY2xvc2UnIHRoZW4gcys9ICd9Jyt0XG4gICAgICAgICAgICAgICB3aGVuICdtaWRsJyAgdGhlbiBzKz0gJ30nK3QrJyR7J1xuICAgICAgICAgICAgICAgd2hlbiAnY29kZScgIFxuICAgICAgICAgICAgICAgICAgIHMrPSBAa29kZS5jb21waWxlIHRcbiAgICAgICBzICs9ICdgJ1xuICAgICAgIHNcblxubW9kdWxlLmV4cG9ydHMgPSBSZW5kZXJlclxuIl19
//# sourceURL=../coffee/renderer.coffee