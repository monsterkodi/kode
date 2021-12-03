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

    Renderer.prototype.compile = function(code) {
        var Kode;
        Kode = require('./kode');
        if (this.subKode != null) {
            this.subKode;
        } else {
            this.subKode = new Kode;
        }
        return this.subKode.compile(code);
    };

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
        var i, l, len, len1, mtch, q, r, ref1, ref2, ref3, ref4, results, results1, splt, t, w, y;
        if (!s) {
            return s;
        }
        splt = s.split(/▸\d+_\d+◂/);
        mtch = s.match(/▸\d+_\d+◂/g);
        if (splt.length > 1) {
            mtch = mtch.map(function(m) {
                return "_" + m.slice(1, -1) + "_";
            });
            if (splt.slice(-1)[0] === '') {
                if (splt.length > 2) {
                    splt.pop();
                    mtch.pop();
                    t = splt.shift();
                    while (splt.length) {
                        t += '▸' + mtch.shift().slice(1, -1) + '◂';
                        t += splt.shift();
                    }
                    t = this.fixAsserts(t);
                } else {
                    t = splt[0];
                }
                return "(" + t + " != null)";
            }
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
        var nodes;
        nodes = p.keyvals.map((function(_this) {
            return function(s) {
                return _this.atom(s);
            };
        })(this));
        nodes = nodes.map(function(n) {
            if (indexOf.call(n, ':') >= 0) {
                return n;
            } else {
                return n + ":" + n;
            }
        });
        return "{" + (nodes.join(',')) + "}";
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
                if (Number.isFinite(u)) {
                    if (u === -1 && addOne) {
                        upper = '';
                    } else {
                        if (addOne) {
                            u += 1;
                        }
                        upper = ", " + u;
                    }
                } else {
                    upper = ", " + upto;
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
                    s += this.compile(t);
            }
        }
        s += '`';
        return s;
    };

    return Renderer;

})();

module.exports = Renderer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNERBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQXVDLE9BQUEsQ0FBUSxTQUFSLENBQXZDLEVBQUUsaUJBQUYsRUFBUywrQkFBVCxFQUF1Qjs7QUFFakI7SUFFQyxrQkFBQyxJQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxPQUFEO1FBRUEsSUFBQyxDQUFBLE1BQUQsR0FBVTtRQVFWLElBQUMsQ0FBQSxLQUFELHlDQUFxQixDQUFFO1FBQ3ZCLElBQUMsQ0FBQSxPQUFELHlDQUFxQixDQUFFO0lBWHhCOzt1QkFhSCxPQUFBLEdBQVMsU0FBQyxJQUFEO0FBRUwsWUFBQTtRQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7WUFDUCxJQUFDLENBQUE7O1lBQUQsSUFBQyxDQUFBLFVBQVcsSUFBSTs7ZUFDaEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQWlCLElBQWpCO0lBSks7O3VCQU1ULE1BQUEsR0FBUSxTQUFDLEdBQUQ7QUFFSixZQUFBO1FBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxDQUFDLEdBQUcsQ0FBQyxJQUFMO1FBQ1osSUFBQyxDQUFBLE1BQUQsR0FBVTtRQUNWLENBQUEsR0FBSTtRQUVKLElBQUcsQ0FBSSxLQUFBLENBQU0sR0FBRyxDQUFDLElBQVYsQ0FBUDtZQUNJLEVBQUEsR0FBSzs7QUFBQztBQUFBO3FCQUFBLHNDQUFBOztpQ0FBQSxDQUFDLENBQUM7QUFBRjs7Z0JBQUQsQ0FBMEIsQ0FBQyxJQUEzQixDQUFnQyxJQUFoQztZQUNMLENBQUEsSUFBSyxJQUFDLENBQUEsTUFBRCxHQUFVLENBQUEsTUFBQSxHQUFPLEVBQVAsR0FBVSxN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QUMsQ0FBQSxNQUFPO0lBQXJCOzt1QkFRTCxPQUFBLEdBQVMsU0FBQyxNQUFEO0FBRU4sWUFBQTtRQUFBLENBQUEsR0FBSTtBQUNKLGFBQUEsd0NBQUE7O1lBQ0ksQ0FBQSxHQUFJLEtBQUssQ0FBQztBQUNWLG9CQUFPLEtBQUssQ0FBQyxJQUFiO0FBQUEscUJBQ1MsTUFEVDtvQkFDc0IsQ0FBQSxJQUFJLENBQUEsR0FBRTtBQUFuQjtBQURULHFCQUVTLE9BRlQ7b0JBRXNCLENBQUEsSUFBSSxHQUFBLEdBQUk7QUFBckI7QUFGVCxxQkFHUyxNQUhUO29CQUdzQixDQUFBLElBQUksR0FBQSxHQUFJLENBQUosR0FBTTtBQUF2QjtBQUhULHFCQUlTLE1BSlQ7b0JBSXNCLENBQUEsSUFBSSxJQUFDLENBQUEsT0FBRCxDQUFTLENBQVQ7QUFKMUI7QUFGSjtRQU9BLENBQUEsSUFBSztlQUNMO0lBWE07Ozs7OztBQWFiLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG5rc3RyICA9IHJlcXVpcmUgJ2tzdHInXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5cbnsgZW1wdHksIGZpcnN0TGluZUNvbCwgbGFzdExpbmVDb2wgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIFJlbmRlcmVyXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQGhlYWRlciA9IFwiXCJcIlxuICAgICAgICAgICAgY29uc3QgX2tfID0ge1xuICAgICAgICAgICAgICAgIGxpc3Q6ICAgZnVuY3Rpb24gKGwpICAge3JldHVybiAobCAhPSBudWxsID8gdHlwZW9mIGwubGVuZ3RoID09PSAnbnVtYmVyJyA/IGwgOiBbXSA6IFtdKX1cbiAgICAgICAgICAgICAgICBsZW5ndGg6IGZ1bmN0aW9uIChsKSAgIHtyZXR1cm4gKGwgIT0gbnVsbCA/IHR5cGVvZiBsLmxlbmd0aCA9PT0gJ251bWJlcicgPyBsLmxlbmd0aCA6IDAgOiAwKX0sXG4gICAgICAgICAgICAgICAgaW46ICAgICBmdW5jdGlvbiAoYSxsKSB7cmV0dXJuIChsICE9IG51bGwgPyB0eXBlb2YgbC5pbmRleE9mID09PSAnZnVuY3Rpb24nID8gbC5pbmRleE9mKGEpID49IDAgOiBmYWxzZSA6IGZhbHNlKX1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgICAgIEBkZWJ1ZyAgID0gQGtvZGUuYXJncz8uZGVidWdcbiAgICAgICAgQHZlcmJvc2UgPSBAa29kZS5hcmdzPy52ZXJib3NlXG5cbiAgICBjb21waWxlOiAoY29kZSkgLT4gXG4gICAgXG4gICAgICAgIEtvZGUgPSByZXF1aXJlICcuL2tvZGUnXG4gICAgICAgIEBzdWJLb2RlID89IG5ldyBLb2RlIFxuICAgICAgICBAc3ViS29kZS5jb21waWxlIGNvZGVcbiAgICAgICAgXG4gICAgcmVuZGVyOiAoYXN0KSAtPlxuXG4gICAgICAgIEB2YXJzdGFjayA9IFthc3QudmFyc11cbiAgICAgICAgQGluZGVudCA9ICcnXG4gICAgICAgIHMgPSAnJ1xuXG4gICAgICAgIGlmIG5vdCBlbXB0eSBhc3QudmFyc1xuICAgICAgICAgICAgdnMgPSAodi50ZXh0IGZvciB2IGluIGFzdC52YXJzKS5qb2luICcsICdcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIFwidmFyICN7dnN9XFxuXFxuXCJcblxuICAgICAgICBzICs9IEBub2RlcyBhc3QuZXhwcywgJ1xcbidcbiAgICAgICAgc1xuXG4gICAgbm9kZXM6IChub2Rlcywgc2VwPScsJykgLT5cblxuICAgICAgICBzbCA9IG5vZGVzLm1hcCAocykgPT4gQGF0b20gc1xuICAgICAgICBzcyA9IHNsLmpvaW4gc2VwXG5cbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcblxuICAgIG5vZGU6IChleHApIC0+XG5cbiAgICAgICAgcmV0dXJuICcnIGlmIG5vdCBleHBcblxuICAgICAgICBpZiBleHAudHlwZT8gYW5kIGV4cC50ZXh0PyB0aGVuIHJldHVybiBAdG9rZW4gZXhwXG5cbiAgICAgICAgaWYgZXhwIGluc3RhbmNlb2YgQXJyYXkgdGhlbiByZXR1cm4gKEBub2RlKGEpIGZvciBhIGluIGV4cCkuam9pbiAnO1xcbidcblxuICAgICAgICBzID0gJydcblxuICAgICAgICBmb3Igayx2IG9mIGV4cFxuXG4gICAgICAgICAgICBzKz0gc3dpdGNoIGtcbiAgICAgICAgICAgICAgICB3aGVuICdpZicgICAgICAgIHRoZW4gQGlmIHZcbiAgICAgICAgICAgICAgICB3aGVuICdmb3InICAgICAgIHRoZW4gQGZvciB2XG4gICAgICAgICAgICAgICAgd2hlbiAnd2hpbGUnICAgICB0aGVuIEB3aGlsZSB2XG4gICAgICAgICAgICAgICAgd2hlbiAncmV0dXJuJyAgICB0aGVuIEByZXR1cm4gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2NsYXNzJyAgICAgdGhlbiBAY2xhc3MgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3N3aXRjaCcgICAgdGhlbiBAc3dpdGNoIHZcbiAgICAgICAgICAgICAgICB3aGVuICd3aGVuJyAgICAgIHRoZW4gQHdoZW4gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2Fzc2VydCcgICAgdGhlbiBAYXNzZXJ0IHZcbiAgICAgICAgICAgICAgICB3aGVuICdxbXJrb3AnICAgIHRoZW4gQHFtcmtvcCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnc3RyaXBvbCcgICB0aGVuIEBzdHJpcG9sIHZcbiAgICAgICAgICAgICAgICB3aGVuICdxbXJrY29sb24nIHRoZW4gQHFtcmtjb2xvbiB2XG4gICAgICAgICAgICAgICAgd2hlbiAnb3BlcmF0aW9uJyB0aGVuIEBvcGVyYXRpb24gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2luY29uZCcgICAgdGhlbiBAaW5jb25kIHZcbiAgICAgICAgICAgICAgICB3aGVuICdwYXJlbnMnICAgIHRoZW4gQHBhcmVucyB2XG4gICAgICAgICAgICAgICAgd2hlbiAnb2JqZWN0JyAgICB0aGVuIEBvYmplY3QgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2tleXZhbCcgICAgdGhlbiBAa2V5dmFsIHZcbiAgICAgICAgICAgICAgICB3aGVuICdhcnJheScgICAgIHRoZW4gQGFycmF5IHZcbiAgICAgICAgICAgICAgICB3aGVuICdpbmRleCcgICAgIHRoZW4gQGluZGV4IHZcbiAgICAgICAgICAgICAgICB3aGVuICdzbGljZScgICAgIHRoZW4gQHNsaWNlIHZcbiAgICAgICAgICAgICAgICB3aGVuICdwcm9wJyAgICAgIHRoZW4gQHByb3AgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2Z1bmMnICAgICAgdGhlbiBAZnVuYyB2XG4gICAgICAgICAgICAgICAgd2hlbiAnY2FsbCcgICAgICB0aGVuIEBjYWxsIHZcbiAgICAgICAgICAgICAgICB3aGVuICd0cnknICAgICAgIHRoZW4gQHRyeSB2XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBsb2cgUjQoXCJyZW5kZXJlci5ub2RlIHVuaGFuZGxlZCBrZXkgI3trfSBpbiBleHBcIiksIGV4cCAjIGlmIEBkZWJ1ZyBvciBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICAnJ1xuICAgICAgICBzXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBhdG9tOiAoZXhwKSAtPlxuXG4gICAgICAgIEBmaXhBc3NlcnRzIEBub2RlIGV4cFxuXG4gICAgYXNzZXJ0OiAocCkgLT5cblxuICAgICAgICBAbm9kZShwLm9iaikgKyBcIuKWuCN7cC5xbXJrLmxpbmV9XyN7cC5xbXJrLmNvbH3il4JcIlxuICAgICAgICBcbiAgICBxbXJrb3A6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgdm4gPSBcIl8je3AucW1yay5saW5lfV8je3AucW1yay5jb2x9X1wiXG4gICAgICAgIFwiKCgje3ZufT0je0BhdG9tIHAubGhzfSkgIT0gbnVsbCA/ICN7dm59IDogI3tAYXRvbSBwLnJoc30pXCJcblxuICAgIHFtcmtjb2xvbjogKHApIC0+XG4gICAgICAgIFxuICAgICAgICBcIigje0BhdG9tIHAubGhzfSA/ICN7QGF0b20gcC5taWR9IDogI3tAYXRvbSBwLnJoc30pXCJcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwMDAwICAgIDAwMCAgICAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDBcblxuICAgIGZpeEFzc2VydHM6IChzKSAtPlxuXG4gICAgICAgIHJldHVybiBzIGlmIG5vdCBzXG5cbiAgICAgICAgc3BsdCA9IHMuc3BsaXQgL+KWuFxcZCtfXFxkK+KXgi9cbiAgICAgICAgbXRjaCA9IHMubWF0Y2ggL+KWuFxcZCtfXFxkK+KXgi9nXG5cbiAgICAgICAgaWYgc3BsdC5sZW5ndGggPiAxXG5cbiAgICAgICAgICAgIG10Y2ggPSBtdGNoLm1hcCAobSkgLT4gXCJfI3ttWzEuLi0yXX1fXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc3BsdFstMV0gPT0gJycgIyBhc3NlcnQgZW5kcyB3aXRoID9cbiAgICAgICAgICAgICAgICBpZiBzcGx0Lmxlbmd0aCA+IDJcbiAgICAgICAgICAgICAgICAgICAgc3BsdC5wb3AoKVxuICAgICAgICAgICAgICAgICAgICBtdGNoLnBvcCgpXG4gICAgICAgICAgICAgICAgICAgIHQgPSBzcGx0LnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgc3BsdC5sZW5ndGggICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdCArPSAn4pa4JyttdGNoLnNoaWZ0KClbMS4uLi0xXSsn4peCJ1xuICAgICAgICAgICAgICAgICAgICAgICAgdCArPSBzcGx0LnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgdCA9IEBmaXhBc3NlcnRzIHRcbiAgICAgICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgICAgICB0ID0gc3BsdFswXVxuICAgICAgICAgICAgICAgIHJldHVybiAgXCIoI3t0fSAhPSBudWxsKVwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIGxvZyBzcGx0LCBtdGNoXG5cbiAgICAgICAgICAgIHMgPSAnJ1xuXG4gICAgICAgICAgICBmb3IgaSBpbiAwLi4ubXRjaC5sZW5ndGhcblxuICAgICAgICAgICAgICAgIGlmIG10Y2gubGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgICAgICBsID0gXCIoI3ttdGNoW2ldfT0jeyhpZiBpIHRoZW4gbXRjaFtpLTFdK3NwbHRbaV0gZWxzZSBzcGx0WzBdKX0pXCJcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGwgPSBzcGx0WzBdXG5cbiAgICAgICAgICAgICAgICBpZiBzcGx0W2krMV1bMF0gPT0gJygnXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gXCJ0eXBlb2YgI3tsfSA9PT0gXFxcImZ1bmN0aW9uXFxcIiA/IFwiXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBzICs9IFwiI3tsfSAhPSBudWxsID8gXCJcblxuICAgICAgICAgICAgaWYgbXRjaC5sZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgcyArPSBtdGNoWy0xXStzcGx0Wy0xXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHMgKz0gc3BsdFswXStzcGx0WzFdXG5cbiAgICAgICAgICAgIGZvciBpIGluIDAuLi5tdGNoLmxlbmd0aCB0aGVuIHMgKz0gXCIgOiB1bmRlZmluZWRcIlxuXG4gICAgICAgICAgICBzID0gXCIoI3tzfSlcIlxuICAgICAgICBzXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcblxuICAgIGNsYXNzOiAobikgLT5cblxuICAgICAgICBzID0gJ1xcbidcbiAgICAgICAgcyArPSBcImNsYXNzICN7bi5uYW1lLnRleHR9XCJcblxuICAgICAgICBpZiBuLmV4dGVuZHNcbiAgICAgICAgICAgIHMgKz0gXCIgZXh0ZW5kcyBcIiArIG4uZXh0ZW5kcy5tYXAoKGUpIC0+IGUudGV4dCkuam9pbiAnLCAnXG5cbiAgICAgICAgcyArPSAnXFxueydcblxuICAgICAgICBtdGhkcyA9IG4uYm9keT8ub2JqZWN0Py5rZXl2YWxzID8gbi5ib2R5P1swXT8ub2JqZWN0Py5rZXl2YWxzXG5cbiAgICAgICAgaWYgbXRoZHM/Lmxlbmd0aFxuICAgICAgICAgICAgbXRoZHMgPSBAcHJlcGFyZU1ldGhvZHMgbXRoZHNcbiAgICAgICAgICAgIEBpbmRlbnQgPSAnICAgICdcbiAgICAgICAgICAgIGZvciBtaSBpbiAwLi4ubXRoZHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgcyArPSAnXFxuJyBpZiBtaVxuICAgICAgICAgICAgICAgIHMgKz0gQG10aGQgbXRoZHNbbWldXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBAaW5kZW50ID0gJydcbiAgICAgICAgcyArPSAnfVxcbidcbiAgICAgICAgc1xuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuXG4gICAgcHJlcGFyZU1ldGhvZHM6IChtdGhkcykgLT5cblxuICAgICAgICBiaW5kID0gW11cbiAgICAgICAgZm9yIG0gaW4gbXRoZHNcbiAgICAgICAgICAgIGlmIG5vdCBtLmtleXZhbFxuICAgICAgICAgICAgICAgIHByaW50LmFzdCAnbm90IGFuIG1ldGhvZD8nIG1cbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgaWYgbm90IG0ua2V5dmFsLnZhbC5mdW5jXG4gICAgICAgICAgICAgICAgcHJpbnQuYXN0ICdubyBmdW5jIGZvciBtZXRob2Q/JyBtXG4gICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgbmFtZSA9IG0ua2V5dmFsLnZhbC5mdW5jLm5hbWUudGV4dFxuICAgICAgICAgICAgaWYgbmFtZSBpbiBbJ0AnICdjb25zdHJ1Y3RvciddXG4gICAgICAgICAgICAgICAgaWYgY29uc3RydWN0b3IgdGhlbiBlcnJvciAnbW9yZSB0aGFuIG9uZSBjb25zdHJ1Y3Rvcj8nXG4gICAgICAgICAgICAgICAgbS5rZXl2YWwudmFsLmZ1bmMubmFtZS50ZXh0ID0gJ2NvbnN0cnVjdG9yJ1xuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yID0gbVxuICAgICAgICAgICAgZWxzZSBpZiBuYW1lLnN0YXJ0c1dpdGggJ0AnXG4gICAgICAgICAgICAgICAgbS5rZXl2YWwudmFsLmZ1bmMubmFtZS50ZXh0ID0gJ3N0YXRpYyAnICsgbmFtZVsxLi5dXG4gICAgICAgICAgICBlbHNlIGlmIG0ua2V5dmFsLnZhbC5mdW5jPy5hcnJvdy50ZXh0ID09ICc9PidcbiAgICAgICAgICAgICAgICBiaW5kLnB1c2ggbVxuXG4gICAgICAgIGlmIGJpbmQubGVuZ3RoIGFuZCBub3QgY29uc3RydWN0b3IgIyBmb3VuZCBzb21lIG1ldGhvZHMgdG8gYmluZCwgYnV0IG5vIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICBhc3QgPSBAa29kZS5hc3QgXCJjb25zdHJ1Y3RvcjogLT5cIiAjIGNyZWF0ZSBvbmUgZnJvbSBzY3JhdGNoXG4gICAgICAgICAgICBjb25zdHJ1Y3RvciA9IGFzdC5leHBzWzBdLm9iamVjdC5rZXl2YWxzWzBdXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5rZXl2YWwudmFsLmZ1bmMubmFtZSA9IHR5cGU6J25hbWUnIHRleHQ6J2NvbnN0cnVjdG9yJ1xuICAgICAgICAgICAgbXRoZHMudW5zaGlmdCBjb25zdHJ1Y3RvclxuXG4gICAgICAgIGlmIGJpbmQubGVuZ3RoXG4gICAgICAgICAgICBmb3IgYiBpbiBiaW5kXG4gICAgICAgICAgICAgICAgYm4gPSBiLmtleXZhbC52YWwuZnVuYy5uYW1lLnRleHRcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5rZXl2YWwudmFsLmZ1bmMuYm9keS5leHBzID89IFtdXG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3Iua2V5dmFsLnZhbC5mdW5jLmJvZHkuZXhwcy5wdXNoXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjb2RlJ1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcInRoaXMuI3tibn0gPSB0aGlzLiN7Ym59LmJpbmQodGhpcylcIlxuICAgICAgICBtdGhkc1xuXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBtdGhkOiAobikgLT5cblxuICAgICAgICBpZiBuLmtleXZhbFxuICAgICAgICAgICAgcyAgPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQGZ1bmMgbi5rZXl2YWwudmFsLmZ1bmNcbiAgICAgICAgc1xuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwXG5cbiAgICBmdW5jOiAobikgLT5cblxuICAgICAgICByZXR1cm4gJycgaWYgbm90IG5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIHMgPSBuLm5hbWU/LnRleHQgPyAnZnVuY3Rpb24nXG4gICAgICAgIHMgKz0gJyAoJ1xuXG4gICAgICAgIGFyZ3MgPSBuLmFyZ3M/LnBhcmVucz8uZXhwc1xuICAgICAgICBpZiBhcmdzXG4gICAgICAgICAgICBbc3RyLCB0aHNdID0gQGFyZ3MgYXJnc1xuICAgICAgICAgICAgcyArPSBzdHJcblxuICAgICAgICBzICs9ICcpXFxuJ1xuICAgICAgICBzICs9IGdpICsgJ3snXG5cbiAgICAgICAgQHZhcnN0YWNrLnB1c2ggbi5ib2R5LnZhcnNcblxuICAgICAgICBpZiBub3QgZW1wdHkgbi5ib2R5LnZhcnNcbiAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIHZzID0gKHYudGV4dCBmb3IgdiBpbiBuLmJvZHkudmFycykuam9pbiAnLCAnXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBcInZhciAje3ZzfVxcblwiXG5cbiAgICAgICAgZm9yIHQgaW4gdGhzID8gW11cbiAgICAgICAgICAgIHMgKz0gJ1xcbicgKyBAaW5kZW50ICsgdGhzXG5cbiAgICAgICAgaWYgbm90IGVtcHR5IG4uYm9keS5leHBzXG5cbiAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIHNzID0gbi5ib2R5LmV4cHMubWFwIChzKSA9PiBAbm9kZSBzXG4gICAgICAgICAgICBzcyA9IHNzLm1hcCAocykgPT4gQGluZGVudCArIHNcbiAgICAgICAgICAgIHMgKz0gc3Muam9pbiAnXFxuJ1xuICAgICAgICAgICAgcyArPSAnXFxuJyArIGdpXG5cbiAgICAgICAgcyArPSAnfSdcblxuICAgICAgICBAdmFyc3RhY2sucG9wKClcblxuICAgICAgICBAZGVkKClcbiAgICAgICAgc1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMFxuXG4gICAgYXJnczogKGFyZ3MpIC0+XG5cbiAgICAgICAgdGhzICA9IFtdXG4gICAgICAgIHVzZWQgPSB7fVxuXG4gICAgICAgIGZvciBhIGluIGFyZ3NcbiAgICAgICAgICAgIGlmIGEudGV4dCB0aGVuIHVzZWRbYS50ZXh0XSA9IGEudGV4dFxuXG4gICAgICAgIGFyZ3MgPSBhcmdzLm1hcCAoYSkgLT5cbiAgICAgICAgICAgIGlmIGEucHJvcCBhbmQgYS5wcm9wLm9iai50eXBlID09ICd0aGlzJ1xuICAgICAgICAgICAgICAgIHRoaXNWYXIgPSBhLnByb3AucHJvcFxuICAgICAgICAgICAgICAgIGlmIHVzZWRbdGhpc1Zhci50ZXh0XVxuICAgICAgICAgICAgICAgICAgICBmb3IgaSBpbiBbMS4uMTAwXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbm90IHVzZWRbdGhpc1Zhci50ZXh0K2ldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhzLnB1c2ggXCJ0aGlzLiN7dGhpc1Zhci50ZXh0fSA9ICN7dGhpc1Zhci50ZXh0K2l9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzVmFyLnRleHQgPSB0aGlzVmFyLnRleHQraVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZWRbdGhpc1Zhci50ZXh0XSA9IHRoaXNWYXIudGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aHMucHVzaCBcInRoaXMuI3t0aGlzVmFyLnRleHR9ID0gI3t0aGlzVmFyLnRleHR9XCJcblxuICAgICAgICAgICAgICAgIHRoaXNWYXJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhXG5cbiAgICAgICAgc3RyID0gYXJncy5tYXAoKGEpID0+IEBub2RlIGEpLmpvaW4gJywgJ1xuXG4gICAgICAgIFtzdHIsdGhzXVxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuXG4gICAgcmV0dXJuOiAobikgLT5cblxuICAgICAgICBzID0gJ3JldHVybidcbiAgICAgICAgcyArPSAnICcgKyBAbm9kZSBuLnZhbFxuICAgICAgICBrc3RyLnN0cmlwIHNcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwXG5cbiAgICBjYWxsOiAocCkgLT5cbiAgICAgICAgaWYgcC5jYWxsZWUudGV4dCBpbiBbJ2xvZycnd2FybicnZXJyb3InXVxuICAgICAgICAgICAgcC5jYWxsZWUudGV4dCA9IFwiY29uc29sZS4je3AuY2FsbGVlLnRleHR9XCJcbiAgICAgICAgY2FsbGVlID0gQG5vZGUgcC5jYWxsZWVcbiAgICAgICAgaWYgY2FsbGVlID09ICduZXcnXG4gICAgICAgICAgICBcIiN7Y2FsbGVlfSAje0Bub2RlcyBwLmFyZ3MsICcsJ31cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBcIiN7Y2FsbGVlfSgje0Bub2RlcyBwLmFyZ3MsICcsJ30pXCJcblxuICAgICMgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwMDAwXG4gICAgIyAwMDAgIDAwMFxuICAgICMgMDAwICAwMDBcblxuICAgIGlmOiAobikgLT5cblxuICAgICAgICBmaXJzdCA9IGZpcnN0TGluZUNvbCBuXG4gICAgICAgIGxhc3QgID0gbGFzdExpbmVDb2wgblxuXG4gICAgICAgIGlmIGZpcnN0LmxpbmUgPT0gbGFzdC5saW5lIGFuZCBuLmVsc2UgYW5kIG5vdCBuLnJldHVybnNcbiAgICAgICAgICAgIHJldHVybiBAaWZJbmxpbmUgblxuXG4gICAgICAgIGdpID0gQGluZCgpXG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJpZiAoI3tAYXRvbShuLmNvbmQpfSlcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIGZvciBlIGluIG4udGhlbiA/IFtdXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcblxuICAgICAgICBmb3IgZWxpZiBpbiBuLmVsaWZzID8gW11cbiAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIHMgKz0gZ2kgKyBcImVsc2UgaWYgKCN7QGF0b20oZWxpZi5lbGlmLmNvbmQpfSlcXG5cIlxuICAgICAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICAgICAgZm9yIGUgaW4gZWxpZi5lbGlmLnRoZW4gPyBbXVxuICAgICAgICAgICAgICAgIHMgKz0gQGluZGVudCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ9XCJcblxuICAgICAgICBpZiBuLmVsc2VcbiAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIHMgKz0gZ2kgKyAnZWxzZVxcbidcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgICAgIGZvciBlIGluIG4uZWxzZSA/IFtdXG4gICAgICAgICAgICAgICAgIHMgKz0gQGluZGVudCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ9XCJcblxuICAgICAgICBAZGVkKClcbiAgICAgICAgc1xuXG4gICAgIyAwMDAgIDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAwICAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMFxuXG4gICAgaWZJbmxpbmU6IChuKSAtPlxuXG4gICAgICAgIHMgPSAnJ1xuXG4gICAgICAgIHMgKz0gXCIje0BhdG9tKG4uY29uZCl9ID8gXCJcbiAgICAgICAgaWYgbi50aGVuPy5sZW5ndGhcbiAgICAgICAgICAgIHMgKz0gKEBhdG9tKGUpIGZvciBlIGluIG4udGhlbikuam9pbiAnLCAnXG5cbiAgICAgICAgaWYgbi5lbGlmc1xuICAgICAgICAgICAgZm9yIGUgaW4gbi5lbGlmc1xuICAgICAgICAgICAgICAgIHMgKz0gJyA6ICdcbiAgICAgICAgICAgICAgICBzICs9IEBpZklubGluZSBlLmVsaWZcblxuICAgICAgICBpZiBuLmVsc2VcbiAgICAgICAgICAgIHMgKz0gJyA6ICdcbiAgICAgICAgICAgIGlmIG4uZWxzZS5sZW5ndGggPT0gMVxuICAgICAgICAgICAgICAgIHMgKz0gQGF0b20gbi5lbHNlWzBdXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcyArPSAnKCcgKyAoQGF0b20gZSBmb3IgZSBpbiBuLmVsc2UpLmpvaW4oJywgJykgKyAnKSdcbiAgICAgICAgc1xuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgZm9yOiAobikgLT5cblxuICAgICAgICBpZiBub3Qgbi50aGVuIHRoZW4gZXJyb3IgJ2ZvciBleHBlY3RlZCB0aGVuJyBuXG5cbiAgICAgICAgc3dpdGNoIG4uaW5vZi50ZXh0XG4gICAgICAgICAgICB3aGVuICdpbicgdGhlbiBAZm9yX2luIG5cbiAgICAgICAgICAgIHdoZW4gJ29mJyB0aGVuIEBmb3Jfb2YgblxuICAgICAgICAgICAgZWxzZSBlcnJvciAnZm9yIGV4cGVjdGVkIGluL29mJ1xuXG4gICAgZm9yX2luOiAobikgLT5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIGxpc3QgPSBAbm9kZSBuLmxpc3RcblxuICAgICAgICBpZiBub3QgbGlzdCBvciBsaXN0ID09ICd1bmRlZmluZWQnXG4gICAgICAgICAgICBwcmludC5ub29uICdubyBsaXN0IGZvcicgbi5saXN0XG4gICAgICAgICAgICBwcmludC5hc3QgJ25vIGxpc3QgZm9yJyBuLmxpc3RcblxuICAgICAgICBsaXN0VmFyID0gQGZyZXNoVmFyICdsaXN0J1xuICAgICAgICBpdGVyVmFyID0gQGZyZXNoVmFyICdpJ1xuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcInZhciAje2xpc3RWYXJ9ID0gI3tsaXN0fVxcblwiXG4gICAgICAgIGlmIG4udmFscy50ZXh0XG4gICAgICAgICAgICBzICs9IGdpK1wiZm9yICh2YXIgI3tpdGVyVmFyfSA9IDA7ICN7aXRlclZhcn0gPCAje2xpc3RWYXJ9Lmxlbmd0aDsgI3tpdGVyVmFyfSsrKVxcblwiXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQrXCIje24udmFscy50ZXh0fSA9ICN7bGlzdFZhcn1bI3tpdGVyVmFyfV1cXG5cIlxuICAgICAgICBlbHNlIGlmIG4udmFscy5hcnJheT8uaXRlbXNcbiAgICAgICAgICAgIHMgKz0gZ2krXCJmb3IgKHZhciAje2l0ZXJWYXJ9ID0gMDsgI3tpdGVyVmFyfSA8ICN7bGlzdFZhcn0ubGVuZ3RoOyAje2l0ZXJWYXJ9KyspXFxuXCJcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgICAgIGZvciBqIGluIDAuLi5uLnZhbHMuYXJyYXkuaXRlbXMubGVuZ3RoXG4gICAgICAgICAgICAgICAgdiA9IG4udmFscy5hcnJheS5pdGVtc1tqXVxuICAgICAgICAgICAgICAgIHMgKz0gQGluZGVudCtcIiN7di50ZXh0fSA9ICN7bGlzdFZhcn1bI3tpdGVyVmFyfV1bI3tqfV1cXG5cIlxuICAgICAgICBlbHNlIGlmIG4udmFscy5sZW5ndGggPiAxXG4gICAgICAgICAgICBsdiA9IG4udmFsc1sxXS50ZXh0XG4gICAgICAgICAgICBzICs9IGdpK1wiZm9yICgje2x2fSA9IDA7ICN7bHZ9IDwgI3tsaXN0VmFyfS5sZW5ndGg7ICN7bHZ9KyspXFxuXCJcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCtcIiN7bi52YWxzWzBdLnRleHR9ID0gI3tsaXN0VmFyfVtpXVxcblwiXG5cbiAgICAgICAgZm9yIGUgaW4gbi50aGVuID8gW11cbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG5cbiAgICBmb3Jfb2Y6IChuKSAtPlxuXG4gICAgICAgIGdpID0gQGluZCgpXG5cbiAgICAgICAga2V5ID0gbi52YWxzLnRleHQgPyBuLnZhbHNbMF0/LnRleHRcbiAgICAgICAgdmFsID0gbi52YWxzWzFdPy50ZXh0XG5cbiAgICAgICAgb2JqID0gQG5vZGUgbi5saXN0XG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwiZm9yICgje2tleX0gaW4gI3tvYmp9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgaWYgdmFsXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQrXCIje3ZhbH0gPSAje29ian1bI3trZXl9XVxcblwiXG4gICAgICAgIGZvciBlIGluIG4udGhlbiA/IFtdXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcblxuICAgICAgICBAZGVkKClcbiAgICAgICAgc1xuXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwXG5cbiAgICB3aGlsZTogKG4pIC0+XG5cbiAgICAgICAgZ2kgPSBAaW5kKClcblxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcIndoaWxlICgje0Bub2RlIG4uY29uZH0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBzd2l0Y2g6IChuKSAtPlxuXG4gICAgICAgIGlmIG5vdCBuLm1hdGNoIHRoZW4gZXJyb3IgJ3N3aXRjaCBleHBlY3RlZCBtYXRjaCcgblxuICAgICAgICBpZiBub3Qgbi53aGVucyB0aGVuIGVycm9yICdzd2l0Y2ggZXhwZWN0ZWQgd2hlbnMnIG5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwic3dpdGNoICgje0Bub2RlIG4ubWF0Y2h9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi53aGVucyA/IFtdXG4gICAgICAgICAgICBzICs9IGdpKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIGlmIG4uZWxzZVxuICAgICAgICAgICAgcyArPSBAaW5kZW50KydkZWZhdWx0OlxcbidcbiAgICAgICAgICAgIGZvciBlIGluIG4uZWxzZVxuICAgICAgICAgICAgICAgIHMgKz0gQGluZGVudCsnICAgICcrIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBnaStcIn1cXG5cIlxuXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgd2hlbjogKG4pIC0+XG5cbiAgICAgICAgaWYgbm90IG4udmFscyB0aGVuIHJldHVybiBlcnJvciAnd2hlbiBleHBlY3RlZCB2YWxzJyBuXG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIGZvciBlIGluIG4udmFsc1xuICAgICAgICAgICAgcyArPSAnICAgIGNhc2UgJyArIEBub2RlKGUpICsgJzpcXG4nXG4gICAgICAgIGZvciBlIGluIG4udGhlbiA/IFtdXG4gICAgICAgICAgICBnaSA9IEBpbmQoKVxuICAgICAgICAgICAgcyArPSBnaSArICcgICAgJyArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgICAgIEBkZWQoKVxuICAgICAgICBzICs9IEBpbmRlbnQgKyAnICAgICcgKyAnYnJlYWsnXG4gICAgICAgIHNcblxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMCAgICAgIDAwMDAwICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICB0cnk6IChuKSAtPlxuICAgICAgICBcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIGdpID0gQGluZCgpXG4gICAgICAgIHMgKz0gJ3RyeVxcbidcbiAgICAgICAgcyArPSBnaSsne1xcbidcbiAgICAgICAgcyArPSBAaW5kZW50K0Bub2RlcyBuLmV4cHMsICdcXG4nK0BpbmRlbnRcbiAgICAgICAgcyArPSBnaSsnXFxuJ1xuICAgICAgICBzICs9IGdpKyd9XFxuJ1xuICAgICAgICBpZiBuLmNhdGNoID8gW11cbiAgICAgICAgICAgIHMgKz0gZ2krXCJjYXRjaCAoI3tAbm9kZSBuLmNhdGNoLmVycnJ9KVxcblwiIFxuICAgICAgICAgICAgcyArPSBnaSsne1xcbidcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCtAbm9kZXMgbi5jYXRjaC5leHBzLCAnXFxuJytAaW5kZW50XG4gICAgICAgICAgICBzICs9IGdpKydcXG4nXG4gICAgICAgICAgICBzICs9IGdpKyd9XFxuJ1xuICAgICAgICBpZiBuLmZpbmFsbHlcbiAgICAgICAgICAgIHMgKz0gZ2krJ2ZpbmFsbHlcXG4nXG4gICAgICAgICAgICBzICs9IGdpKyd7XFxuJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50K0Bub2RlcyBuLmZpbmFsbHksICdcXG4nK0BpbmRlbnRcbiAgICAgICAgICAgIHMgKz0gZ2krJ1xcbidcbiAgICAgICAgICAgIHMgKz0gZ2krJ31cXG4nXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMDAgIDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMFxuICAgICMgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgdG9rZW46ICh0b2spIC0+XG5cbiAgICAgICAgaWYgdG9rLnR5cGUgPT0gJ2NvbW1lbnQnXG4gICAgICAgICAgICBAY29tbWVudCB0b2tcbiAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAndGhpcydcbiAgICAgICAgICAgICd0aGlzJ1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICd0cmlwbGUnXG4gICAgICAgICAgICAnYCcgKyB0b2sudGV4dFszLi4tNF0gKyAnYCdcbiAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAna2V5d29yZCcgYW5kIHRvay50ZXh0ID09ICd5ZXMnXG4gICAgICAgICAgICAndHJ1ZSdcbiAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAna2V5d29yZCcgYW5kIHRvay50ZXh0ID09ICdubydcbiAgICAgICAgICAgICdmYWxzZSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdG9rLnRleHRcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG4gICAgY29tbWVudDogKHRvaykgLT5cblxuICAgICAgICBpZiB0b2sudGV4dC5zdGFydHNXaXRoICcjIyMnXG4gICAgICAgICAgICAnLyonICsgdG9rLnRleHRbMy4uLTRdICsgJyovJyArICdcXG4nXG4gICAgICAgIGVsc2UgaWYgdG9rLnRleHQuc3RhcnRzV2l0aCAnIydcbiAgICAgICAgICAgIGtzdHIucGFkKCcnLCB0b2suY29sKSArICcvLycgKyB0b2sudGV4dFsxLi4tMV1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZXJyb3IgXCIjIGNvbW1lbnQgdG9rZW4gZXhwZWN0ZWRcIlxuICAgICAgICAgICAgJydcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxuICAgIG9wZXJhdGlvbjogKG9wKSAtPlxuXG4gICAgICAgIG9wbWFwID0gKG8pIC0+XG4gICAgICAgICAgICBvbXAgPVxuICAgICAgICAgICAgICAgIGFuZDogICAgJyYmJ1xuICAgICAgICAgICAgICAgIG9yOiAgICAgJ3x8J1xuICAgICAgICAgICAgICAgIG5vdDogICAgJyEnXG4gICAgICAgICAgICAgICAgJz09JzogICAnPT09J1xuICAgICAgICAgICAgICAgICchPSc6ICAgJyE9PSdcbiAgICAgICAgICAgIG9tcFtvXSA/IG9cblxuICAgICAgICBvICAgPSBvcG1hcCBvcC5vcGVyYXRvci50ZXh0XG4gICAgICAgIHNlcCA9ICcgJ1xuICAgICAgICBzZXAgPSAnJyBpZiBub3Qgb3AubGhzIG9yIG5vdCBvcC5yaHNcblxuICAgICAgICBpZiBvIGluIFsnPCcnPD0nJz09PScnIT09Jyc+PScnPiddXG4gICAgICAgICAgICBybyA9IG9wbWFwIG9wLnJocz8ub3BlcmF0aW9uPy5vcGVyYXRvci50ZXh0XG4gICAgICAgICAgICBpZiBybyBpbiBbJzwnJzw9Jyc9PT0nJyE9PScnPj0nJz4nXVxuICAgICAgICAgICAgICAgIHJldHVybiAnKCcgKyBAYXRvbShvcC5saHMpICsgc2VwICsgbyArIHNlcCArIEBhdG9tKG9wLnJocy5vcGVyYXRpb24ubGhzKSArICcgJiYgJyArIGtzdHIubHN0cmlwKEBhdG9tKG9wLnJocykpICsgJyknXG5cbiAgICAgICAgb3BlbiA9IGNsb3NlID0gJydcbiAgICAgICAgaWYgbyAhPSAnPScgYW5kIG9wLnJocz8ub3BlcmF0aW9uPy5vcGVyYXRvci50ZXh0ID09ICc9J1xuICAgICAgICAgICAgb3BlbiA9ICcoJ1xuICAgICAgICAgICAgY2xvc2UgPSAnKSdcblxuICAgICAgICBmaXJzdCA9IGZpcnN0TGluZUNvbCBvcC5saHNcbiAgICAgICAgcHJmeCA9IGlmIGZpcnN0LmNvbCA9PSAwIGFuZCBvcC5yaHM/LmZ1bmMgdGhlbiAnXFxuJyBlbHNlICcnXG4gICAgICAgICAgICBcbiAgICAgICAgcHJmeCArIEBhdG9tKG9wLmxocykgKyBzZXAgKyBvICsgc2VwICsgb3BlbiArIGtzdHIubHN0cmlwIEBhdG9tKG9wLnJocykgKyBjbG9zZVxuXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBpbmNvbmQ6IChwKSAtPlxuXG4gICAgICAgIFwiI3tAbm9kZSBwLnJoc30uaW5kZXhPZigje0BhdG9tIHAubGhzfSkgPj0gMFwiXG5cbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBwYXJlbnM6IChwKSAtPiBcIigje0Bub2RlcyBwLmV4cHN9KVwiXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMFxuXG4gICAgb2JqZWN0OiAocCkgLT4gXG4gICAgICAgIG5vZGVzID0gcC5rZXl2YWxzLm1hcCAocykgPT4gQGF0b20gc1xuICAgICAgICBub2RlcyA9IG5vZGVzLm1hcCAobikgLT4gaWYgJzonIGluIG4gdGhlbiBuIGVsc2UgXCIje259OiN7bn1cIiAgICAgICAgXG4gICAgICAgIFwieyN7bm9kZXMuam9pbiAnLCd9fVwiXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAga2V5dmFsOiAocCkgLT5cbiAgICAgICAga2V5ID0gQG5vZGUgcC5rZXlcbiAgICAgICAgaWYga2V5WzBdIG5vdCBpbiBcIidcXFwiXCIgYW5kIC9bXFwuXFwsXFw7XFwqXFwrXFwtXFwvXFw9XFx8XS8udGVzdCBrZXkgdGhlbiBrZXkgPSBcIicje2tleX0nXCJcbiAgICAgICAgXCIje2tleX06I3tAYXRvbShwLnZhbCl9XCJcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG5cbiAgICBwcm9wOiAgIChwKSAtPlxuXG4gICAgICAgIFwiI3tAbm9kZShwLm9iail9LiN7QG5vZGUgcC5wcm9wfVwiXG5cbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgaW5kZXg6ICAocCkgLT5cblxuICAgICAgICBpZiBzbGljZSA9IHAuc2xpZHguc2xpY2VcblxuICAgICAgICAgICAgZnJvbSA9IGlmIHNsaWNlLmZyb20/IHRoZW4gQG5vZGUgc2xpY2UuZnJvbSBlbHNlICcwJ1xuXG4gICAgICAgICAgICBhZGRPbmUgPSBzbGljZS5kb3RzLnRleHQgPT0gJy4uJ1xuXG4gICAgICAgICAgICBpZiBzbGljZS51cHRvPyB0aGVuIHVwdG8gPSBAbm9kZSBzbGljZS51cHRvXG5cbiAgICAgICAgICAgIGlmIHNsaWNlLnVwdG8/LnR5cGUgPT0gJ251bScgb3Igc2xpY2UudXB0bz8ub3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgdSA9IHBhcnNlSW50IHVwdG9cbiAgICAgICAgICAgICAgICBpZiBOdW1iZXIuaXNGaW5pdGUgdVxuICAgICAgICAgICAgICAgICAgICBpZiB1ID09IC0xIGFuZCBhZGRPbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwcGVyID0gJydcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdSArPSAxIGlmIGFkZE9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgdXBwZXIgPSBcIiwgI3t1fVwiXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB1cHBlciA9IFwiLCAje3VwdG99XCJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBhZGRPbmUgdGhlbiBpZiB1cHRvIHRoZW4gdXBwZXIgPSBcIiwgdHlwZW9mICN7dXB0b30gPT09ICdudW1iZXInICYmICN7dXB0b30rMSB8fCBJbmZpbml0eVwiXG4gICAgICAgICAgICAgICAgZWxzZSAgICAgICAgICAgICAgICAgICAgICAgIHVwcGVyID0gXCIsIHR5cGVvZiAje3VwdG99ID09PSAnbnVtYmVyJyAmJiAje3VwdG99IHx8IC0xXCJcblxuICAgICAgICAgICAgXCIje0Bub2RlKHAuaWR4ZWUpfS5zbGljZSgje2Zyb219I3t1cHBlciA/ICcnfSlcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBwLnNsaWR4LnRleHQ/WzBdID09ICctJ1xuICAgICAgICAgICAgICAgIG5pID0gcGFyc2VJbnQgcC5zbGlkeC50ZXh0XG4gICAgICAgICAgICAgICAgaWYgbmkgPT0gLTFcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiI3tAYXRvbShwLmlkeGVlKX0uc2xpY2UoI3tuaX0pWzBdXCJcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIiN7QGF0b20ocC5pZHhlZSl9LnNsaWNlKCN7bml9LCN7bmkrMX0pWzBdXCJcblxuICAgICAgICAgICAgXCIje0BhdG9tKHAuaWR4ZWUpfVsje0Bub2RlIHAuc2xpZHh9XVwiXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG4gICAgYXJyYXk6IChwKSAtPlxuXG4gICAgICAgIGlmIHAuaXRlbXNbMF0/LnNsaWNlXG4gICAgICAgICAgICBAc2xpY2UgcC5pdGVtc1swXS5zbGljZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBcIlsje0Bub2RlcyBwLml0ZW1zLCAnLCd9XVwiXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMFxuXG4gICAgc2xpY2U6IChwKSAtPlxuXG4gICAgICAgIGlmIHAuZnJvbS50eXBlID09ICdudW0nID09IHAudXB0by50eXBlXG4gICAgICAgICAgICBmcm9tID0gcGFyc2VJbnQgcC5mcm9tLnRleHRcbiAgICAgICAgICAgIHVwdG8gPSBwYXJzZUludCBwLnVwdG8udGV4dFxuICAgICAgICAgICAgaWYgdXB0by1mcm9tIDw9IDEwXG4gICAgICAgICAgICAgICAgaWYgcC5kb3RzLnRleHQgPT0gJy4uLicgdGhlbiB1cHRvLS1cbiAgICAgICAgICAgICAgICAnWycrKCh4IGZvciB4IGluIFtmcm9tLi51cHRvXSkuam9pbiAnLCcpKyddJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG8gPSBpZiBwLmRvdHMudGV4dCA9PSAnLi4uJyB0aGVuICc8JyBlbHNlICc8PSdcbiAgICAgICAgICAgICAgICBcIihmdW5jdGlvbigpIHsgdmFyIHIgPSBbXTsgZm9yICh2YXIgaSA9ICN7ZnJvbX07IGkgI3tvfSAje3VwdG99OyBpKyspeyByLnB1c2goaSk7IH0gcmV0dXJuIHI7IH0pLmFwcGx5KHRoaXMpXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbyA9IGlmIHAuZG90cy50ZXh0ID09ICcuLi4nIHRoZW4gJzwnIGVsc2UgJzw9J1xuICAgICAgICAgICAgXCIoZnVuY3Rpb24oKSB7IHZhciByID0gW107IGZvciAodmFyIGkgPSAje0Bub2RlIHAuZnJvbX07IGkgI3tvfSAje0Bub2RlIHAudXB0b307IGkrKyl7IHIucHVzaChpKTsgfSByZXR1cm4gcjsgfSkuYXBwbHkodGhpcylcIlxuXG4gICAgZnJlc2hWYXI6IChuYW1lLCBzdWZmaXg9MCkgLT5cblxuICAgICAgICBmb3IgdmFycyBpbiBAdmFyc3RhY2tcbiAgICAgICAgICAgIGZvciB2IGluIHZhcnNcbiAgICAgICAgICAgICAgICBpZiB2LnRleHQgPT0gbmFtZSArIChzdWZmaXggb3IgJycpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBAZnJlc2hWYXIgbmFtZSwgc3VmZml4KzFcblxuICAgICAgICBAdmFyc3RhY2tbLTFdLnB1c2ggdGV4dDpuYW1lICsgKHN1ZmZpeCBvciAnJylcbiAgICAgICAgbmFtZSArIChzdWZmaXggb3IgJycpXG5cbiAgICB2ZXJiOiAtPiBpZiBAdmVyYm9zZSB0aGVuIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHNcbiAgICBcbiAgICBpbmQ6IC0+XG5cbiAgICAgICAgb2kgPSBAaW5kZW50XG4gICAgICAgIEBpbmRlbnQgKz0gJyAgICAnXG4gICAgICAgIG9pXG5cbiAgICBkZWQ6IC0+IEBpbmRlbnQgPSBAaW5kZW50Wy4uLi00XVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgIFxuICAgIHN0cmlwb2w6IChjaHVua3MpIC0+XG4gICAgICAgIFxuICAgICAgIHMgPSAnYCdcbiAgICAgICBmb3IgY2h1bmsgaW4gY2h1bmtzXG4gICAgICAgICAgIHQgPSBjaHVuay50ZXh0XG4gICAgICAgICAgIHN3aXRjaCBjaHVuay50eXBlXG4gICAgICAgICAgICAgICB3aGVuICdvcGVuJyAgdGhlbiBzKz0gdCsnJHsnXG4gICAgICAgICAgICAgICB3aGVuICdjbG9zZScgdGhlbiBzKz0gJ30nK3RcbiAgICAgICAgICAgICAgIHdoZW4gJ21pZGwnICB0aGVuIHMrPSAnfScrdCsnJHsnXG4gICAgICAgICAgICAgICB3aGVuICdjb2RlJyAgdGhlbiBzKz0gQGNvbXBpbGUgdFxuICAgICAgIHMgKz0gJ2AnXG4gICAgICAgc1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlbmRlcmVyXG4iXX0=
//# sourceURL=../coffee/renderer.coffee