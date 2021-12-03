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
        return '▾' + this.node(p.obj) + ("▸" + p.qmrk.line + "_" + p.qmrk.col + "◂");
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
        if (s == null) {
            return;
        }
        if ((s == null) || s.length === 0) {
            return '';
        }
        while (s[0] === '▾') {
            s = s.slice(1);
        }
        if (indexOf.call(s, '▾') >= 0) {
            i = s.indexOf('▾');
            return s.slice(0, i) + this.fixAsserts(s.slice(i + 1));
        }
        if (indexOf.call(s, '\n') >= 0) {
            i = s.indexOf('\n');
            return this.fixAsserts(s.slice(0, i)) + s.slice(i);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNERBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQXVDLE9BQUEsQ0FBUSxTQUFSLENBQXZDLEVBQUUsaUJBQUYsRUFBUywrQkFBVCxFQUF1Qjs7QUFFakI7SUFFQyxrQkFBQyxJQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxPQUFEO1FBRUEsSUFBQyxDQUFBLE1BQUQsR0FBVTtRQVFWLElBQUMsQ0FBQSxLQUFELHlDQUFxQixDQUFFO1FBQ3ZCLElBQUMsQ0FBQSxPQUFELHlDQUFxQixDQUFFO0lBWHhCOzt1QkFhSCxPQUFBLEdBQVMsU0FBQyxJQUFEO0FBRUwsWUFBQTtRQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7WUFDUCxJQUFDLENBQUE7O1lBQUQsSUFBQyxDQUFBLFVBQVcsSUFBSTs7ZUFDaEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQWlCLElBQWpCO0lBSks7O3VCQU1ULE1BQUEsR0FBUSxTQUFDLEdBQUQ7QUFFSixZQUFBO1FBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxDQUFDLEdBQUcsQ0FBQyxJQUFMO1FBQ1osSUFBQyxDQUFBLE1BQUQsR0FBVTtRQUNWLENBQUEsR0FBSTtRQUVKLElBQUcsQ0FBSSxLQUFBLENBQU0sR0FBRyxDQUFDLElBQVYsQ0FBUDtZQUNJLEVBQUEsR0FBSzs7QUFBQztBQUFBO3FCQUFBLHNDQUFBOztpQ0FBQSxDQUFDLENBQUM7QUFBRjs7Z0JBQUQsQ0FBMEIsQ0FBQyxJQUEzQixDQUFnQyxJQUFoQztZQUNMLENBQUEsSUFBSyxJQUFDLENBQUEsTUFBRCxHQUFVLENBQUEsTUFBQSxHQUFPLEVBQVAsR0FBVSxN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LENBQUEsUUFBUyxVQUFFLENBQUEsQ0FBQSxDQUFDLENBQUMsSUFBZCxDQUFtQjtZQUFBLElBQUEsRUFBSyxJQUFBLEdBQU8sQ0FBQyxNQUFBLElBQVUsRUFBWCxDQUFaO1NBQW5CO2VBQ0EsSUFBQSxHQUFPLENBQUMsTUFBQSxJQUFVLEVBQVg7SUFSRDs7dUJBVVYsSUFBQSxHQUFNLFNBQUE7UUFBRyxJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUFpQixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBTyxDQUFDLEdBQTFCLEVBQStCLFNBQS9CLEVBQWpCOztJQUFIOzt1QkFFTixHQUFBLEdBQUssU0FBQTtBQUVELFlBQUE7UUFBQSxFQUFBLEdBQUssSUFBQyxDQUFBO1FBQ04sSUFBQyxDQUFBLE1BQUQsSUFBVztlQUNYO0lBSkM7O3VCQU1MLEdBQUEsR0FBSyxTQUFBO2VBQUcsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsTUFBTztJQUFyQjs7dUJBUUwsT0FBQSxHQUFTLFNBQUMsTUFBRDtBQUVOLFlBQUE7UUFBQSxDQUFBLEdBQUk7QUFDSixhQUFBLHdDQUFBOztZQUNJLENBQUEsR0FBSSxLQUFLLENBQUM7QUFDVixvQkFBTyxLQUFLLENBQUMsSUFBYjtBQUFBLHFCQUNTLE1BRFQ7b0JBQ3NCLENBQUEsSUFBSSxDQUFBLEdBQUU7QUFBbkI7QUFEVCxxQkFFUyxPQUZUO29CQUVzQixDQUFBLElBQUksR0FBQSxHQUFJO0FBQXJCO0FBRlQscUJBR1MsTUFIVDtvQkFHc0IsQ0FBQSxJQUFJLEdBQUEsR0FBSSxDQUFKLEdBQU07QUFBdkI7QUFIVCxxQkFJUyxNQUpUO29CQUlzQixDQUFBLElBQUksSUFBQyxDQUFBLE9BQUQsQ0FBUyxDQUFUO0FBSjFCO0FBRko7UUFPQSxDQUFBLElBQUs7ZUFDTDtJQVhNOzs7Ozs7QUFhYixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxua3N0ciAgPSByZXF1aXJlICdrc3RyJ1xucHJpbnQgPSByZXF1aXJlICcuL3ByaW50J1xuXG57IGVtcHR5LCBmaXJzdExpbmVDb2wsIGxhc3RMaW5lQ29sIH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5jbGFzcyBSZW5kZXJlclxuXG4gICAgQDogKEBrb2RlKSAtPlxuXG4gICAgICAgIEBoZWFkZXIgPSBcIlwiXCJcbiAgICAgICAgICAgIGNvbnN0IF9rXyA9IHtcbiAgICAgICAgICAgICAgICBsaXN0OiAgIGZ1bmN0aW9uIChsKSAgIHtyZXR1cm4gKGwgIT0gbnVsbCA/IHR5cGVvZiBsLmxlbmd0aCA9PT0gJ251bWJlcicgPyBsIDogW10gOiBbXSl9XG4gICAgICAgICAgICAgICAgbGVuZ3RoOiBmdW5jdGlvbiAobCkgICB7cmV0dXJuIChsICE9IG51bGwgPyB0eXBlb2YgbC5sZW5ndGggPT09ICdudW1iZXInID8gbC5sZW5ndGggOiAwIDogMCl9LFxuICAgICAgICAgICAgICAgIGluOiAgICAgZnVuY3Rpb24gKGEsbCkge3JldHVybiAobCAhPSBudWxsID8gdHlwZW9mIGwuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJyA/IGwuaW5kZXhPZihhKSA+PSAwIDogZmFsc2UgOiBmYWxzZSl9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBAZGVidWcgICA9IEBrb2RlLmFyZ3M/LmRlYnVnXG4gICAgICAgIEB2ZXJib3NlID0gQGtvZGUuYXJncz8udmVyYm9zZVxuXG4gICAgY29tcGlsZTogKGNvZGUpIC0+IFxuICAgIFxuICAgICAgICBLb2RlID0gcmVxdWlyZSAnLi9rb2RlJ1xuICAgICAgICBAc3ViS29kZSA/PSBuZXcgS29kZSBcbiAgICAgICAgQHN1YktvZGUuY29tcGlsZSBjb2RlXG4gICAgICAgIFxuICAgIHJlbmRlcjogKGFzdCkgLT5cblxuICAgICAgICBAdmFyc3RhY2sgPSBbYXN0LnZhcnNdXG4gICAgICAgIEBpbmRlbnQgPSAnJ1xuICAgICAgICBzID0gJydcblxuICAgICAgICBpZiBub3QgZW1wdHkgYXN0LnZhcnNcbiAgICAgICAgICAgIHZzID0gKHYudGV4dCBmb3IgdiBpbiBhc3QudmFycykuam9pbiAnLCAnXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBcInZhciAje3ZzfVxcblxcblwiXG5cbiAgICAgICAgcyArPSBAbm9kZXMgYXN0LmV4cHMsICdcXG4nXG4gICAgICAgIHNcblxuICAgIG5vZGVzOiAobm9kZXMsIHNlcD0nLCcpIC0+XG5cbiAgICAgICAgc2wgPSBub2Rlcy5tYXAgKHMpID0+IEBhdG9tIHNcbiAgICAgICAgc3MgPSBzbC5qb2luIHNlcFxuXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG5cbiAgICBub2RlOiAoZXhwKSAtPlxuXG4gICAgICAgIHJldHVybiAnJyBpZiBub3QgZXhwXG5cbiAgICAgICAgaWYgZXhwLnR5cGU/IGFuZCBleHAudGV4dD8gdGhlbiByZXR1cm4gQHRva2VuIGV4cFxuXG4gICAgICAgIGlmIGV4cCBpbnN0YW5jZW9mIEFycmF5IHRoZW4gcmV0dXJuIChAbm9kZShhKSBmb3IgYSBpbiBleHApLmpvaW4gJztcXG4nXG5cbiAgICAgICAgcyA9ICcnXG5cbiAgICAgICAgZm9yIGssdiBvZiBleHBcblxuICAgICAgICAgICAgcys9IHN3aXRjaCBrXG4gICAgICAgICAgICAgICAgd2hlbiAnaWYnICAgICAgICB0aGVuIEBpZiB2XG4gICAgICAgICAgICAgICAgd2hlbiAnZm9yJyAgICAgICB0aGVuIEBmb3IgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3doaWxlJyAgICAgdGhlbiBAd2hpbGUgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3JldHVybicgICAgdGhlbiBAcmV0dXJuIHZcbiAgICAgICAgICAgICAgICB3aGVuICdjbGFzcycgICAgIHRoZW4gQGNsYXNzIHZcbiAgICAgICAgICAgICAgICB3aGVuICdzd2l0Y2gnICAgIHRoZW4gQHN3aXRjaCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnd2hlbicgICAgICB0aGVuIEB3aGVuIHZcbiAgICAgICAgICAgICAgICB3aGVuICdhc3NlcnQnICAgIHRoZW4gQGFzc2VydCB2XG4gICAgICAgICAgICAgICAgd2hlbiAncW1ya29wJyAgICB0aGVuIEBxbXJrb3AgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3N0cmlwb2wnICAgdGhlbiBAc3RyaXBvbCB2XG4gICAgICAgICAgICAgICAgd2hlbiAncW1ya2NvbG9uJyB0aGVuIEBxbXJrY29sb24gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ29wZXJhdGlvbicgdGhlbiBAb3BlcmF0aW9uIHZcbiAgICAgICAgICAgICAgICB3aGVuICdpbmNvbmQnICAgIHRoZW4gQGluY29uZCB2XG4gICAgICAgICAgICAgICAgd2hlbiAncGFyZW5zJyAgICB0aGVuIEBwYXJlbnMgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ29iamVjdCcgICAgdGhlbiBAb2JqZWN0IHZcbiAgICAgICAgICAgICAgICB3aGVuICdrZXl2YWwnICAgIHRoZW4gQGtleXZhbCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnYXJyYXknICAgICB0aGVuIEBhcnJheSB2XG4gICAgICAgICAgICAgICAgd2hlbiAnaW5kZXgnICAgICB0aGVuIEBpbmRleCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnc2xpY2UnICAgICB0aGVuIEBzbGljZSB2XG4gICAgICAgICAgICAgICAgd2hlbiAncHJvcCcgICAgICB0aGVuIEBwcm9wIHZcbiAgICAgICAgICAgICAgICB3aGVuICdmdW5jJyAgICAgIHRoZW4gQGZ1bmMgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2NhbGwnICAgICAgdGhlbiBAY2FsbCB2XG4gICAgICAgICAgICAgICAgd2hlbiAndHJ5JyAgICAgICB0aGVuIEB0cnkgdlxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbG9nIFI0KFwicmVuZGVyZXIubm9kZSB1bmhhbmRsZWQga2V5ICN7a30gaW4gZXhwXCIpLCBleHAgIyBpZiBAZGVidWcgb3IgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICAgICAgJydcbiAgICAgICAgc1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgYXRvbTogKGV4cCkgLT5cblxuICAgICAgICBAZml4QXNzZXJ0cyBAbm9kZSBleHBcblxuICAgIGFzc2VydDogKHApIC0+XG5cbiAgICAgICAgJ+KWvicgKyBAbm9kZShwLm9iaikgKyBcIuKWuCN7cC5xbXJrLmxpbmV9XyN7cC5xbXJrLmNvbH3il4JcIlxuICAgICAgICBcbiAgICBxbXJrb3A6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgdm4gPSBcIl8je3AucW1yay5saW5lfV8je3AucW1yay5jb2x9X1wiXG4gICAgICAgIFwiKCgje3ZufT0je0BhdG9tIHAubGhzfSkgIT0gbnVsbCA/ICN7dm59IDogI3tAYXRvbSBwLnJoc30pXCJcblxuICAgIHFtcmtjb2xvbjogKHApIC0+XG4gICAgICAgIFxuICAgICAgICBcIigje0BhdG9tIHAubGhzfSA/ICN7QGF0b20gcC5taWR9IDogI3tAYXRvbSBwLnJoc30pXCJcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwMDAwICAgIDAwMCAgICAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDBcblxuICAgIGZpeEFzc2VydHM6IChzKSAtPlxuXG4gICAgICAgIGlmIG5vdCBzP1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuICcnIGlmIG5vdCBzPyBvciBzLmxlbmd0aCA9PSAwXG5cbiAgICAgICAgd2hpbGUgc1swXSA9PSAn4pa+JyB0aGVuIHMgPSBzWzEuLl0gXG4gICAgICAgIGlmICfilr4nIGluIHNcbiAgICAgICAgICAgIGkgPSBzLmluZGV4T2YgJ+KWvidcbiAgICAgICAgICAgIHJldHVybiBzWy4uLmldICsgQGZpeEFzc2VydHMgc1tpKzEuLl1cbiAgICAgICAgICAgIFxuICAgICAgICBpZiAnXFxuJyBpbiBzXG4gICAgICAgICAgICBpID0gcy5pbmRleE9mICdcXG4nXG4gICAgICAgICAgICByZXR1cm4gQGZpeEFzc2VydHMoc1suLi5pXSkgKyBzW2kuLl1cbiAgICAgICAgXG4gICAgICAgIHNwbHQgPSBzLnNwbGl0IC/ilrhcXGQrX1xcZCvil4IvXG4gICAgICAgIG10Y2ggPSBzLm1hdGNoIC/ilrhcXGQrX1xcZCvil4IvZ1xuXG4gICAgICAgIGlmIHNwbHQubGVuZ3RoID4gMVxuXG4gICAgICAgICAgICBtdGNoID0gbXRjaC5tYXAgKG0pIC0+IFwiXyN7bVsxLi4tMl19X1wiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHNwbHRbLTFdID09ICcnICMgYXNzZXJ0IGVuZHMgd2l0aCA/XG4gICAgICAgICAgICAgICAgaWYgc3BsdC5sZW5ndGggPiAyXG4gICAgICAgICAgICAgICAgICAgIHNwbHQucG9wKClcbiAgICAgICAgICAgICAgICAgICAgbXRjaC5wb3AoKVxuICAgICAgICAgICAgICAgICAgICB0ID0gc3BsdC5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIHNwbHQubGVuZ3RoICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHQgKz0gJ+KWuCcrbXRjaC5zaGlmdCgpWzEuLi4tMV0rJ+KXgidcbiAgICAgICAgICAgICAgICAgICAgICAgIHQgKz0gc3BsdC5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIHQgPSBAZml4QXNzZXJ0cyB0XG4gICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgdCA9IHNwbHRbMF1cbiAgICAgICAgICAgICAgICByZXR1cm4gIFwiKCN7dH0gIT0gbnVsbClcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBsb2cgc3BsdCwgbXRjaFxuXG4gICAgICAgICAgICBzID0gJydcblxuICAgICAgICAgICAgZm9yIGkgaW4gMC4uLm10Y2gubGVuZ3RoXG5cbiAgICAgICAgICAgICAgICBpZiBtdGNoLmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICAgICAgbCA9IFwiKCN7bXRjaFtpXX09I3soaWYgaSB0aGVuIG10Y2hbaS0xXStzcGx0W2ldIGVsc2Ugc3BsdFswXSl9KVwiXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBsID0gc3BsdFswXVxuXG4gICAgICAgICAgICAgICAgaWYgc3BsdFtpKzFdWzBdID09ICcoJ1xuICAgICAgICAgICAgICAgICAgICBzICs9IFwidHlwZW9mICN7bH0gPT09IFxcXCJmdW5jdGlvblxcXCIgPyBcIlxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcyArPSBcIiN7bH0gIT0gbnVsbCA/IFwiXG5cbiAgICAgICAgICAgIGlmIG10Y2gubGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgIHMgKz0gbXRjaFstMV0rc3BsdFstMV1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzICs9IHNwbHRbMF0rc3BsdFsxXVxuXG4gICAgICAgICAgICBmb3IgaSBpbiAwLi4ubXRjaC5sZW5ndGggdGhlbiBzICs9IFwiIDogdW5kZWZpbmVkXCJcblxuICAgICAgICAgICAgcyA9IFwiKCN7c30pXCJcbiAgICAgICAgc1xuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbiAgICBjbGFzczogKG4pIC0+XG5cbiAgICAgICAgcyA9ICdcXG4nXG4gICAgICAgIHMgKz0gXCJjbGFzcyAje24ubmFtZS50ZXh0fVwiXG5cbiAgICAgICAgaWYgbi5leHRlbmRzXG4gICAgICAgICAgICBzICs9IFwiIGV4dGVuZHMgXCIgKyBuLmV4dGVuZHMubWFwKChlKSAtPiBlLnRleHQpLmpvaW4gJywgJ1xuXG4gICAgICAgIHMgKz0gJ1xcbnsnXG5cbiAgICAgICAgbXRoZHMgPSBuLmJvZHk/Lm9iamVjdD8ua2V5dmFscyA/IG4uYm9keT9bMF0/Lm9iamVjdD8ua2V5dmFsc1xuXG4gICAgICAgIGlmIG10aGRzPy5sZW5ndGhcbiAgICAgICAgICAgIG10aGRzID0gQHByZXBhcmVNZXRob2RzIG10aGRzXG4gICAgICAgICAgICBAaW5kZW50ID0gJyAgICAnXG4gICAgICAgICAgICBmb3IgbWkgaW4gMC4uLm10aGRzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHMgKz0gJ1xcbicgaWYgbWlcbiAgICAgICAgICAgICAgICBzICs9IEBtdGhkIG10aGRzW21pXVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgQGluZGVudCA9ICcnXG4gICAgICAgIHMgKz0gJ31cXG4nXG4gICAgICAgIHNcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcblxuICAgIHByZXBhcmVNZXRob2RzOiAobXRoZHMpIC0+XG5cbiAgICAgICAgYmluZCA9IFtdXG4gICAgICAgIGZvciBtIGluIG10aGRzXG4gICAgICAgICAgICBpZiBub3QgbS5rZXl2YWxcbiAgICAgICAgICAgICAgICBwcmludC5hc3QgJ25vdCBhbiBtZXRob2Q/JyBtXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIGlmIG5vdCBtLmtleXZhbC52YWwuZnVuY1xuICAgICAgICAgICAgICAgIHByaW50LmFzdCAnbm8gZnVuYyBmb3IgbWV0aG9kPycgbVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIG5hbWUgPSBtLmtleXZhbC52YWwuZnVuYy5uYW1lLnRleHRcbiAgICAgICAgICAgIGlmIG5hbWUgaW4gWydAJyAnY29uc3RydWN0b3InXVxuICAgICAgICAgICAgICAgIGlmIGNvbnN0cnVjdG9yIHRoZW4gZXJyb3IgJ21vcmUgdGhhbiBvbmUgY29uc3RydWN0b3I/J1xuICAgICAgICAgICAgICAgIG0ua2V5dmFsLnZhbC5mdW5jLm5hbWUudGV4dCA9ICdjb25zdHJ1Y3RvcidcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvciA9IG1cbiAgICAgICAgICAgIGVsc2UgaWYgbmFtZS5zdGFydHNXaXRoICdAJ1xuICAgICAgICAgICAgICAgIG0ua2V5dmFsLnZhbC5mdW5jLm5hbWUudGV4dCA9ICdzdGF0aWMgJyArIG5hbWVbMS4uXVxuICAgICAgICAgICAgZWxzZSBpZiBtLmtleXZhbC52YWwuZnVuYz8uYXJyb3cudGV4dCA9PSAnPT4nXG4gICAgICAgICAgICAgICAgYmluZC5wdXNoIG1cblxuICAgICAgICBpZiBiaW5kLmxlbmd0aCBhbmQgbm90IGNvbnN0cnVjdG9yICMgZm91bmQgc29tZSBtZXRob2RzIHRvIGJpbmQsIGJ1dCBubyBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgYXN0ID0gQGtvZGUuYXN0IFwiY29uc3RydWN0b3I6IC0+XCIgIyBjcmVhdGUgb25lIGZyb20gc2NyYXRjaFxuICAgICAgICAgICAgY29uc3RydWN0b3IgPSBhc3QuZXhwc1swXS5vYmplY3Qua2V5dmFsc1swXVxuICAgICAgICAgICAgY29uc3RydWN0b3Iua2V5dmFsLnZhbC5mdW5jLm5hbWUgPSB0eXBlOiduYW1lJyB0ZXh0Oidjb25zdHJ1Y3RvcidcbiAgICAgICAgICAgIG10aGRzLnVuc2hpZnQgY29uc3RydWN0b3JcblxuICAgICAgICBpZiBiaW5kLmxlbmd0aFxuICAgICAgICAgICAgZm9yIGIgaW4gYmluZFxuICAgICAgICAgICAgICAgIGJuID0gYi5rZXl2YWwudmFsLmZ1bmMubmFtZS50ZXh0XG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3Iua2V5dmFsLnZhbC5mdW5jLmJvZHkuZXhwcyA/PSBbXVxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLmtleXZhbC52YWwuZnVuYy5ib2R5LmV4cHMucHVzaFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY29kZSdcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJ0aGlzLiN7Ym59ID0gdGhpcy4je2JufS5iaW5kKHRoaXMpXCJcbiAgICAgICAgbXRoZHNcblxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgbXRoZDogKG4pIC0+XG5cbiAgICAgICAgaWYgbi5rZXl2YWxcbiAgICAgICAgICAgIHMgID0gJ1xcbidcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIEBmdW5jIG4ua2V5dmFsLnZhbC5mdW5jXG4gICAgICAgIHNcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMFxuXG4gICAgZnVuYzogKG4pIC0+XG5cbiAgICAgICAgcmV0dXJuICcnIGlmIG5vdCBuXG5cbiAgICAgICAgZ2kgPSBAaW5kKClcblxuICAgICAgICBzID0gbi5uYW1lPy50ZXh0ID8gJ2Z1bmN0aW9uJ1xuICAgICAgICBzICs9ICcgKCdcblxuICAgICAgICBhcmdzID0gbi5hcmdzPy5wYXJlbnM/LmV4cHNcbiAgICAgICAgaWYgYXJnc1xuICAgICAgICAgICAgW3N0ciwgdGhzXSA9IEBhcmdzIGFyZ3NcbiAgICAgICAgICAgIHMgKz0gc3RyXG5cbiAgICAgICAgcyArPSAnKVxcbidcbiAgICAgICAgcyArPSBnaSArICd7J1xuXG4gICAgICAgIEB2YXJzdGFjay5wdXNoIG4uYm9keS52YXJzXG5cbiAgICAgICAgaWYgbm90IGVtcHR5IG4uYm9keS52YXJzXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICB2cyA9ICh2LnRleHQgZm9yIHYgaW4gbi5ib2R5LnZhcnMpLmpvaW4gJywgJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgXCJ2YXIgI3t2c31cXG5cIlxuXG4gICAgICAgIGZvciB0IGluIHRocyA/IFtdXG4gICAgICAgICAgICBzICs9ICdcXG4nICsgQGluZGVudCArIHRoc1xuXG4gICAgICAgIGlmIG5vdCBlbXB0eSBuLmJvZHkuZXhwc1xuXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzcyA9IG4uYm9keS5leHBzLm1hcCAocykgPT4gQG5vZGUgc1xuICAgICAgICAgICAgc3MgPSBzcy5tYXAgKHMpID0+IEBpbmRlbnQgKyBzXG4gICAgICAgICAgICBzICs9IHNzLmpvaW4gJ1xcbidcbiAgICAgICAgICAgIHMgKz0gJ1xcbicgKyBnaVxuXG4gICAgICAgIHMgKz0gJ30nXG5cbiAgICAgICAgQHZhcnN0YWNrLnBvcCgpXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgMDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcblxuICAgIGFyZ3M6IChhcmdzKSAtPlxuXG4gICAgICAgIHRocyAgPSBbXVxuICAgICAgICB1c2VkID0ge31cblxuICAgICAgICBmb3IgYSBpbiBhcmdzXG4gICAgICAgICAgICBpZiBhLnRleHQgdGhlbiB1c2VkW2EudGV4dF0gPSBhLnRleHRcblxuICAgICAgICBhcmdzID0gYXJncy5tYXAgKGEpIC0+XG4gICAgICAgICAgICBpZiBhLnByb3AgYW5kIGEucHJvcC5vYmoudHlwZSA9PSAndGhpcydcbiAgICAgICAgICAgICAgICB0aGlzVmFyID0gYS5wcm9wLnByb3BcbiAgICAgICAgICAgICAgICBpZiB1c2VkW3RoaXNWYXIudGV4dF1cbiAgICAgICAgICAgICAgICAgICAgZm9yIGkgaW4gWzEuLjEwMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCB1c2VkW3RoaXNWYXIudGV4dCtpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocy5wdXNoIFwidGhpcy4je3RoaXNWYXIudGV4dH0gPSAje3RoaXNWYXIudGV4dCtpfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1Zhci50ZXh0ID0gdGhpc1Zhci50ZXh0K2lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VkW3RoaXNWYXIudGV4dF0gPSB0aGlzVmFyLnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhzLnB1c2ggXCJ0aGlzLiN7dGhpc1Zhci50ZXh0fSA9ICN7dGhpc1Zhci50ZXh0fVwiXG5cbiAgICAgICAgICAgICAgICB0aGlzVmFyXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYVxuXG4gICAgICAgIHN0ciA9IGFyZ3MubWFwKChhKSA9PiBAbm9kZSBhKS5qb2luICcsICdcblxuICAgICAgICBbc3RyLHRoc11cblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAwIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDBcblxuICAgIHJldHVybjogKG4pIC0+XG5cbiAgICAgICAgcyA9ICdyZXR1cm4nXG4gICAgICAgIHMgKz0gJyAnICsgQG5vZGUgbi52YWxcbiAgICAgICAga3N0ci5zdHJpcCBzXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMFxuXG4gICAgY2FsbDogKHApIC0+XG4gICAgICAgIGlmIHAuY2FsbGVlLnRleHQgaW4gWydsb2cnJ3dhcm4nJ2Vycm9yJ11cbiAgICAgICAgICAgIHAuY2FsbGVlLnRleHQgPSBcImNvbnNvbGUuI3twLmNhbGxlZS50ZXh0fVwiXG4gICAgICAgIGNhbGxlZSA9IEBub2RlIHAuY2FsbGVlXG4gICAgICAgIGlmIGNhbGxlZSA9PSAnbmV3J1xuICAgICAgICAgICAgXCIje2NhbGxlZX0gI3tAbm9kZXMgcC5hcmdzLCAnLCd9XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgXCIje2NhbGxlZX0oI3tAbm9kZXMgcC5hcmdzLCAnLCd9KVwiXG5cbiAgICAjIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMDAwMFxuICAgICMgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwXG5cbiAgICBpZjogKG4pIC0+XG5cbiAgICAgICAgZmlyc3QgPSBmaXJzdExpbmVDb2wgblxuICAgICAgICBsYXN0ICA9IGxhc3RMaW5lQ29sIG5cblxuICAgICAgICBpZiBmaXJzdC5saW5lID09IGxhc3QubGluZSBhbmQgbi5lbHNlIGFuZCBub3Qgbi5yZXR1cm5zXG4gICAgICAgICAgICByZXR1cm4gQGlmSW5saW5lIG5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwiaWYgKCN7QGF0b20obi5jb25kKX0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgZm9yIGVsaWYgaW4gbi5lbGlmcyA/IFtdXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpICsgXCJlbHNlIGlmICgje0BhdG9tKGVsaWYuZWxpZi5jb25kKX0pXFxuXCJcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgICAgIGZvciBlIGluIGVsaWYuZWxpZi50aGVuID8gW11cbiAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgaWYgbi5lbHNlXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpICsgJ2Vsc2VcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBmb3IgZSBpbiBuLmVsc2UgPyBbXVxuICAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgICMgMDAwICAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcblxuICAgIGlmSW5saW5lOiAobikgLT5cblxuICAgICAgICBzID0gJydcblxuICAgICAgICBzICs9IFwiI3tAYXRvbShuLmNvbmQpfSA/IFwiXG4gICAgICAgIGlmIG4udGhlbj8ubGVuZ3RoXG4gICAgICAgICAgICBzICs9IChAYXRvbShlKSBmb3IgZSBpbiBuLnRoZW4pLmpvaW4gJywgJ1xuXG4gICAgICAgIGlmIG4uZWxpZnNcbiAgICAgICAgICAgIGZvciBlIGluIG4uZWxpZnNcbiAgICAgICAgICAgICAgICBzICs9ICcgOiAnXG4gICAgICAgICAgICAgICAgcyArPSBAaWZJbmxpbmUgZS5lbGlmXG5cbiAgICAgICAgaWYgbi5lbHNlXG4gICAgICAgICAgICBzICs9ICcgOiAnXG4gICAgICAgICAgICBpZiBuLmVsc2UubGVuZ3RoID09IDFcbiAgICAgICAgICAgICAgICBzICs9IEBhdG9tIG4uZWxzZVswXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHMgKz0gJygnICsgKEBhdG9tIGUgZm9yIGUgaW4gbi5lbHNlKS5qb2luKCcsICcpICsgJyknXG4gICAgICAgIHNcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxuICAgIGZvcjogKG4pIC0+XG5cbiAgICAgICAgaWYgbm90IG4udGhlbiB0aGVuIGVycm9yICdmb3IgZXhwZWN0ZWQgdGhlbicgblxuXG4gICAgICAgIHN3aXRjaCBuLmlub2YudGV4dFxuICAgICAgICAgICAgd2hlbiAnaW4nIHRoZW4gQGZvcl9pbiBuXG4gICAgICAgICAgICB3aGVuICdvZicgdGhlbiBAZm9yX29mIG5cbiAgICAgICAgICAgIGVsc2UgZXJyb3IgJ2ZvciBleHBlY3RlZCBpbi9vZidcblxuICAgIGZvcl9pbjogKG4pIC0+XG5cbiAgICAgICAgZ2kgPSBAaW5kKClcblxuICAgICAgICBsaXN0ID0gQG5vZGUgbi5saXN0XG5cbiAgICAgICAgaWYgbm90IGxpc3Qgb3IgbGlzdCA9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgcHJpbnQubm9vbiAnbm8gbGlzdCBmb3InIG4ubGlzdFxuICAgICAgICAgICAgcHJpbnQuYXN0ICdubyBsaXN0IGZvcicgbi5saXN0XG5cbiAgICAgICAgbGlzdFZhciA9IEBmcmVzaFZhciAnbGlzdCdcbiAgICAgICAgaXRlclZhciA9IEBmcmVzaFZhciAnaSdcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJ2YXIgI3tsaXN0VmFyfSA9ICN7bGlzdH1cXG5cIlxuICAgICAgICBpZiBuLnZhbHMudGV4dFxuICAgICAgICAgICAgcyArPSBnaStcImZvciAodmFyICN7aXRlclZhcn0gPSAwOyAje2l0ZXJWYXJ9IDwgI3tsaXN0VmFyfS5sZW5ndGg7ICN7aXRlclZhcn0rKylcXG5cIlxuICAgICAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICAgICAgcyArPSBAaW5kZW50K1wiI3tuLnZhbHMudGV4dH0gPSAje2xpc3RWYXJ9WyN7aXRlclZhcn1dXFxuXCJcbiAgICAgICAgZWxzZSBpZiBuLnZhbHMuYXJyYXk/Lml0ZW1zXG4gICAgICAgICAgICBzICs9IGdpK1wiZm9yICh2YXIgI3tpdGVyVmFyfSA9IDA7ICN7aXRlclZhcn0gPCAje2xpc3RWYXJ9Lmxlbmd0aDsgI3tpdGVyVmFyfSsrKVxcblwiXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBmb3IgaiBpbiAwLi4ubi52YWxzLmFycmF5Lml0ZW1zLmxlbmd0aFxuICAgICAgICAgICAgICAgIHYgPSBuLnZhbHMuYXJyYXkuaXRlbXNbal1cbiAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQrXCIje3YudGV4dH0gPSAje2xpc3RWYXJ9WyN7aXRlclZhcn1dWyN7an1dXFxuXCJcbiAgICAgICAgZWxzZSBpZiBuLnZhbHMubGVuZ3RoID4gMVxuICAgICAgICAgICAgbHYgPSBuLnZhbHNbMV0udGV4dFxuICAgICAgICAgICAgcyArPSBnaStcImZvciAoI3tsdn0gPSAwOyAje2x2fSA8ICN7bGlzdFZhcn0ubGVuZ3RoOyAje2x2fSsrKVxcblwiXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQrXCIje24udmFsc1swXS50ZXh0fSA9ICN7bGlzdFZhcn1baV1cXG5cIlxuXG4gICAgICAgIGZvciBlIGluIG4udGhlbiA/IFtdXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcblxuICAgICAgICBAZGVkKClcbiAgICAgICAgc1xuXG4gICAgZm9yX29mOiAobikgLT5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIGtleSA9IG4udmFscy50ZXh0ID8gbi52YWxzWzBdPy50ZXh0XG4gICAgICAgIHZhbCA9IG4udmFsc1sxXT8udGV4dFxuXG4gICAgICAgIG9iaiA9IEBub2RlIG4ubGlzdFxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcImZvciAoI3trZXl9IGluICN7b2JqfSlcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIGlmIHZhbFxuICAgICAgICAgICAgcyArPSBAaW5kZW50K1wiI3t2YWx9ID0gI3tvYmp9WyN7a2V5fV1cXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMFxuXG4gICAgd2hpbGU6IChuKSAtPlxuXG4gICAgICAgIGdpID0gQGluZCgpXG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJ3aGlsZSAoI3tAbm9kZSBuLmNvbmR9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuID8gW11cbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgc3dpdGNoOiAobikgLT5cblxuICAgICAgICBpZiBub3Qgbi5tYXRjaCB0aGVuIGVycm9yICdzd2l0Y2ggZXhwZWN0ZWQgbWF0Y2gnIG5cbiAgICAgICAgaWYgbm90IG4ud2hlbnMgdGhlbiBlcnJvciAnc3dpdGNoIGV4cGVjdGVkIHdoZW5zJyBuXG5cbiAgICAgICAgZ2kgPSBAaW5kKClcblxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcInN3aXRjaCAoI3tAbm9kZSBuLm1hdGNofSlcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIGZvciBlIGluIG4ud2hlbnMgPyBbXVxuICAgICAgICAgICAgcyArPSBnaSsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBpZiBuLmVsc2VcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCsnZGVmYXVsdDpcXG4nXG4gICAgICAgICAgICBmb3IgZSBpbiBuLmVsc2VcbiAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQrJyAgICAnKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIHMgKz0gZ2krXCJ9XFxuXCJcblxuICAgICAgICBAZGVkKClcbiAgICAgICAgc1xuXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIHdoZW46IChuKSAtPlxuXG4gICAgICAgIGlmIG5vdCBuLnZhbHMgdGhlbiByZXR1cm4gZXJyb3IgJ3doZW4gZXhwZWN0ZWQgdmFscycgblxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBmb3IgZSBpbiBuLnZhbHNcbiAgICAgICAgICAgIHMgKz0gJyAgICBjYXNlICcgKyBAbm9kZShlKSArICc6XFxuJ1xuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgZ2kgPSBAaW5kKClcbiAgICAgICAgICAgIHMgKz0gZ2kgKyAnICAgICcgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBAZGVkKClcbiAgICAgICAgcyArPSBAaW5kZW50ICsgJyAgICAnICsgJ2JyZWFrJ1xuICAgICAgICBzXG5cbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgICAwMDAwMCAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgdHJ5OiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBnaSA9IEBpbmQoKVxuICAgICAgICBzICs9ICd0cnlcXG4nXG4gICAgICAgIHMgKz0gZ2krJ3tcXG4nXG4gICAgICAgIHMgKz0gQGluZGVudCtAbm9kZXMgbi5leHBzLCAnXFxuJytAaW5kZW50XG4gICAgICAgIHMgKz0gZ2krJ1xcbidcbiAgICAgICAgcyArPSBnaSsnfVxcbidcbiAgICAgICAgaWYgbi5jYXRjaCA/IFtdXG4gICAgICAgICAgICBzICs9IGdpK1wiY2F0Y2ggKCN7QG5vZGUgbi5jYXRjaC5lcnJyfSlcXG5cIiBcbiAgICAgICAgICAgIHMgKz0gZ2krJ3tcXG4nXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQrQG5vZGVzIG4uY2F0Y2guZXhwcywgJ1xcbicrQGluZGVudFxuICAgICAgICAgICAgcyArPSBnaSsnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaSsnfVxcbidcbiAgICAgICAgaWYgbi5maW5hbGx5XG4gICAgICAgICAgICBzICs9IGdpKydmaW5hbGx5XFxuJ1xuICAgICAgICAgICAgcyArPSBnaSsne1xcbidcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCtAbm9kZXMgbi5maW5hbGx5LCAnXFxuJytAaW5kZW50XG4gICAgICAgICAgICBzICs9IGdpKydcXG4nXG4gICAgICAgICAgICBzICs9IGdpKyd9XFxuJ1xuICAgICAgICBAZGVkKClcbiAgICAgICAgc1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAwICAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDBcbiAgICAjICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIHRva2VuOiAodG9rKSAtPlxuXG4gICAgICAgIGlmIHRvay50eXBlID09ICdjb21tZW50J1xuICAgICAgICAgICAgQGNvbW1lbnQgdG9rXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ3RoaXMnXG4gICAgICAgICAgICAndGhpcydcbiAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAndHJpcGxlJ1xuICAgICAgICAgICAgJ2AnICsgdG9rLnRleHRbMy4uLTRdICsgJ2AnXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ2tleXdvcmQnIGFuZCB0b2sudGV4dCA9PSAneWVzJ1xuICAgICAgICAgICAgJ3RydWUnXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ2tleXdvcmQnIGFuZCB0b2sudGV4dCA9PSAnbm8nXG4gICAgICAgICAgICAnZmFsc2UnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRvay50ZXh0XG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxuICAgIGNvbW1lbnQ6ICh0b2spIC0+XG5cbiAgICAgICAgaWYgdG9rLnRleHQuc3RhcnRzV2l0aCAnIyMjJ1xuICAgICAgICAgICAgJy8qJyArIHRvay50ZXh0WzMuLi00XSArICcqLycgKyAnXFxuJ1xuICAgICAgICBlbHNlIGlmIHRvay50ZXh0LnN0YXJ0c1dpdGggJyMnXG4gICAgICAgICAgICBrc3RyLnBhZCgnJywgdG9rLmNvbCkgKyAnLy8nICsgdG9rLnRleHRbMS4uLTFdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVycm9yIFwiIyBjb21tZW50IHRva2VuIGV4cGVjdGVkXCJcbiAgICAgICAgICAgICcnXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBvcGVyYXRpb246IChvcCkgLT5cblxuICAgICAgICBvcG1hcCA9IChvKSAtPlxuICAgICAgICAgICAgb21wID1cbiAgICAgICAgICAgICAgICBhbmQ6ICAgICcmJidcbiAgICAgICAgICAgICAgICBvcjogICAgICd8fCdcbiAgICAgICAgICAgICAgICBub3Q6ICAgICchJ1xuICAgICAgICAgICAgICAgICc9PSc6ICAgJz09PSdcbiAgICAgICAgICAgICAgICAnIT0nOiAgICchPT0nXG4gICAgICAgICAgICBvbXBbb10gPyBvXG5cbiAgICAgICAgbyAgID0gb3BtYXAgb3Aub3BlcmF0b3IudGV4dFxuICAgICAgICBzZXAgPSAnICdcbiAgICAgICAgc2VwID0gJycgaWYgbm90IG9wLmxocyBvciBub3Qgb3AucmhzXG5cbiAgICAgICAgaWYgbyBpbiBbJzwnJzw9Jyc9PT0nJyE9PScnPj0nJz4nXVxuICAgICAgICAgICAgcm8gPSBvcG1hcCBvcC5yaHM/Lm9wZXJhdGlvbj8ub3BlcmF0b3IudGV4dFxuICAgICAgICAgICAgaWYgcm8gaW4gWyc8Jyc8PScnPT09JychPT0nJz49Jyc+J11cbiAgICAgICAgICAgICAgICByZXR1cm4gJygnICsgQGF0b20ob3AubGhzKSArIHNlcCArIG8gKyBzZXAgKyBAYXRvbShvcC5yaHMub3BlcmF0aW9uLmxocykgKyAnICYmICcgKyBrc3RyLmxzdHJpcChAYXRvbShvcC5yaHMpKSArICcpJ1xuXG4gICAgICAgIG9wZW4gPSBjbG9zZSA9ICcnXG4gICAgICAgIGlmIG8gIT0gJz0nIGFuZCBvcC5yaHM/Lm9wZXJhdGlvbj8ub3BlcmF0b3IudGV4dCA9PSAnPSdcbiAgICAgICAgICAgIG9wZW4gPSAnKCdcbiAgICAgICAgICAgIGNsb3NlID0gJyknXG5cbiAgICAgICAgZmlyc3QgPSBmaXJzdExpbmVDb2wgb3AubGhzXG4gICAgICAgIHByZnggPSBpZiBmaXJzdC5jb2wgPT0gMCBhbmQgb3AucmhzPy5mdW5jIHRoZW4gJ1xcbicgZWxzZSAnJ1xuICAgICAgICAgICAgXG4gICAgICAgIHByZnggKyBAYXRvbShvcC5saHMpICsgc2VwICsgbyArIHNlcCArIG9wZW4gKyBrc3RyLmxzdHJpcCBAYXRvbShvcC5yaHMpICsgY2xvc2VcblxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgaW5jb25kOiAocCkgLT5cblxuICAgICAgICBcIiN7QG5vZGUgcC5yaHN9LmluZGV4T2YoI3tAYXRvbSBwLmxoc30pID49IDBcIlxuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgcGFyZW5zOiAocCkgLT4gXCIoI3tAbm9kZXMgcC5leHBzfSlcIlxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDBcblxuICAgIG9iamVjdDogKHApIC0+IFxuICAgICAgICBub2RlcyA9IHAua2V5dmFscy5tYXAgKHMpID0+IEBhdG9tIHNcbiAgICAgICAgbm9kZXMgPSBub2Rlcy5tYXAgKG4pIC0+IGlmICc6JyBpbiBuIHRoZW4gbiBlbHNlIFwiI3tufToje259XCIgICAgICAgIFxuICAgICAgICBcInsje25vZGVzLmpvaW4gJywnfX1cIlxuXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGtleXZhbDogKHApIC0+XG4gICAgICAgIGtleSA9IEBub2RlIHAua2V5XG4gICAgICAgIGlmIGtleVswXSBub3QgaW4gXCInXFxcIlwiIGFuZCAvW1xcLlxcLFxcO1xcKlxcK1xcLVxcL1xcPVxcfF0vLnRlc3Qga2V5IHRoZW4ga2V5ID0gXCInI3trZXl9J1wiXG4gICAgICAgIFwiI3trZXl9OiN7QGF0b20ocC52YWwpfVwiXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMFxuXG4gICAgcHJvcDogICAocCkgLT5cblxuICAgICAgICBcIiN7QG5vZGUocC5vYmopfS4je0Bub2RlIHAucHJvcH1cIlxuXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIGluZGV4OiAgKHApIC0+XG5cbiAgICAgICAgaWYgc2xpY2UgPSBwLnNsaWR4LnNsaWNlXG5cbiAgICAgICAgICAgIGZyb20gPSBpZiBzbGljZS5mcm9tPyB0aGVuIEBub2RlIHNsaWNlLmZyb20gZWxzZSAnMCdcblxuICAgICAgICAgICAgYWRkT25lID0gc2xpY2UuZG90cy50ZXh0ID09ICcuLidcblxuICAgICAgICAgICAgaWYgc2xpY2UudXB0bz8gdGhlbiB1cHRvID0gQG5vZGUgc2xpY2UudXB0b1xuXG4gICAgICAgICAgICBpZiBzbGljZS51cHRvPy50eXBlID09ICdudW0nIG9yIHNsaWNlLnVwdG8/Lm9wZXJhdGlvblxuICAgICAgICAgICAgICAgIHUgPSBwYXJzZUludCB1cHRvXG4gICAgICAgICAgICAgICAgaWYgTnVtYmVyLmlzRmluaXRlIHVcbiAgICAgICAgICAgICAgICAgICAgaWYgdSA9PSAtMSBhbmQgYWRkT25lXG4gICAgICAgICAgICAgICAgICAgICAgICB1cHBlciA9ICcnXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHUgKz0gMSBpZiBhZGRPbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwcGVyID0gXCIsICN7dX1cIlxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdXBwZXIgPSBcIiwgI3t1cHRvfVwiXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgYWRkT25lIHRoZW4gaWYgdXB0byB0aGVuIHVwcGVyID0gXCIsIHR5cGVvZiAje3VwdG99ID09PSAnbnVtYmVyJyAmJiAje3VwdG99KzEgfHwgSW5maW5pdHlcIlxuICAgICAgICAgICAgICAgIGVsc2UgICAgICAgICAgICAgICAgICAgICAgICB1cHBlciA9IFwiLCB0eXBlb2YgI3t1cHRvfSA9PT0gJ251bWJlcicgJiYgI3t1cHRvfSB8fCAtMVwiXG5cbiAgICAgICAgICAgIFwiI3tAbm9kZShwLmlkeGVlKX0uc2xpY2UoI3tmcm9tfSN7dXBwZXIgPyAnJ30pXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgcC5zbGlkeC50ZXh0P1swXSA9PSAnLSdcbiAgICAgICAgICAgICAgICBuaSA9IHBhcnNlSW50IHAuc2xpZHgudGV4dFxuICAgICAgICAgICAgICAgIGlmIG5pID09IC0xXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIiN7QGF0b20ocC5pZHhlZSl9LnNsaWNlKCN7bml9KVswXVwiXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCIje0BhdG9tKHAuaWR4ZWUpfS5zbGljZSgje25pfSwje25pKzF9KVswXVwiXG5cbiAgICAgICAgICAgIFwiI3tAYXRvbShwLmlkeGVlKX1bI3tAbm9kZSBwLnNsaWR4fV1cIlxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgIDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxuICAgIGFycmF5OiAocCkgLT5cblxuICAgICAgICBpZiBwLml0ZW1zWzBdPy5zbGljZVxuICAgICAgICAgICAgQHNsaWNlIHAuaXRlbXNbMF0uc2xpY2VcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgXCJbI3tAbm9kZXMgcC5pdGVtcywgJywnfV1cIlxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDBcblxuICAgIHNsaWNlOiAocCkgLT5cblxuICAgICAgICBpZiBwLmZyb20udHlwZSA9PSAnbnVtJyA9PSBwLnVwdG8udHlwZVxuICAgICAgICAgICAgZnJvbSA9IHBhcnNlSW50IHAuZnJvbS50ZXh0XG4gICAgICAgICAgICB1cHRvID0gcGFyc2VJbnQgcC51cHRvLnRleHRcbiAgICAgICAgICAgIGlmIHVwdG8tZnJvbSA8PSAxMFxuICAgICAgICAgICAgICAgIGlmIHAuZG90cy50ZXh0ID09ICcuLi4nIHRoZW4gdXB0by0tXG4gICAgICAgICAgICAgICAgJ1snKygoeCBmb3IgeCBpbiBbZnJvbS4udXB0b10pLmpvaW4gJywnKSsnXSdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvID0gaWYgcC5kb3RzLnRleHQgPT0gJy4uLicgdGhlbiAnPCcgZWxzZSAnPD0nXG4gICAgICAgICAgICAgICAgXCIoZnVuY3Rpb24oKSB7IHZhciByID0gW107IGZvciAodmFyIGkgPSAje2Zyb219OyBpICN7b30gI3t1cHRvfTsgaSsrKXsgci5wdXNoKGkpOyB9IHJldHVybiByOyB9KS5hcHBseSh0aGlzKVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG8gPSBpZiBwLmRvdHMudGV4dCA9PSAnLi4uJyB0aGVuICc8JyBlbHNlICc8PSdcbiAgICAgICAgICAgIFwiKGZ1bmN0aW9uKCkgeyB2YXIgciA9IFtdOyBmb3IgKHZhciBpID0gI3tAbm9kZSBwLmZyb219OyBpICN7b30gI3tAbm9kZSBwLnVwdG99OyBpKyspeyByLnB1c2goaSk7IH0gcmV0dXJuIHI7IH0pLmFwcGx5KHRoaXMpXCJcblxuICAgIGZyZXNoVmFyOiAobmFtZSwgc3VmZml4PTApIC0+XG5cbiAgICAgICAgZm9yIHZhcnMgaW4gQHZhcnN0YWNrXG4gICAgICAgICAgICBmb3IgdiBpbiB2YXJzXG4gICAgICAgICAgICAgICAgaWYgdi50ZXh0ID09IG5hbWUgKyAoc3VmZml4IG9yICcnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQGZyZXNoVmFyIG5hbWUsIHN1ZmZpeCsxXG5cbiAgICAgICAgQHZhcnN0YWNrWy0xXS5wdXNoIHRleHQ6bmFtZSArIChzdWZmaXggb3IgJycpXG4gICAgICAgIG5hbWUgKyAoc3VmZml4IG9yICcnKVxuXG4gICAgdmVyYjogLT4gaWYgQHZlcmJvc2UgdGhlbiBjb25zb2xlLmxvZy5hcHBseSBjb25zb2xlLmxvZywgYXJndW1lbnRzXG4gICAgXG4gICAgaW5kOiAtPlxuXG4gICAgICAgIG9pID0gQGluZGVudFxuICAgICAgICBAaW5kZW50ICs9ICcgICAgJ1xuICAgICAgICBvaVxuXG4gICAgZGVkOiAtPiBAaW5kZW50ID0gQGluZGVudFsuLi4tNF1cbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICBcbiAgICBzdHJpcG9sOiAoY2h1bmtzKSAtPlxuICAgICAgICBcbiAgICAgICBzID0gJ2AnXG4gICAgICAgZm9yIGNodW5rIGluIGNodW5rc1xuICAgICAgICAgICB0ID0gY2h1bmsudGV4dFxuICAgICAgICAgICBzd2l0Y2ggY2h1bmsudHlwZVxuICAgICAgICAgICAgICAgd2hlbiAnb3BlbicgIHRoZW4gcys9IHQrJyR7J1xuICAgICAgICAgICAgICAgd2hlbiAnY2xvc2UnIHRoZW4gcys9ICd9Jyt0XG4gICAgICAgICAgICAgICB3aGVuICdtaWRsJyAgdGhlbiBzKz0gJ30nK3QrJyR7J1xuICAgICAgICAgICAgICAgd2hlbiAnY29kZScgIHRoZW4gcys9IEBjb21waWxlIHRcbiAgICAgICBzICs9ICdgJ1xuICAgICAgIHNcblxubW9kdWxlLmV4cG9ydHMgPSBSZW5kZXJlclxuIl19
//# sourceURL=../coffee/renderer.coffee