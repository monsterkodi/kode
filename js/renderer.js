// koffee 1.14.0

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
        var len, m, mthds, q, ref1, ref2, ref3, ref4, ref5, ref6, s;
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
            for (q = 0, len = mthds.length; q < len; q++) {
                m = mthds[q];
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
            s = this.indent + this.func(n.keyval.val.func);
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
        if (first.line === last.line && n["else"]) {
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
        ref5 = (ref4 = n.then.exps) != null ? ref4 : [];
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
        ref5 = (ref4 = n.then.exps) != null ? ref4 : [];
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
        if (!n.then) {
            console.error('when expected then', n);
        }
        gi = this.ind();
        s = '';
        s += "while (" + (this.node(n.cond)) + ")\n";
        s += gi + "{\n";
        ref2 = (ref1 = n.then.exps) != null ? ref1 : [];
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
        if (!n.then) {
            return console.error('when expected then', n);
        }
        s = '';
        ref1 = n.vals;
        for (q = 0, len = ref1.length; q < len; q++) {
            e = ref1[q];
            s += '    case ' + this.node(e) + ':\n';
        }
        ref3 = (ref2 = n.then.exps) != null ? ref2 : [];
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
        var c, gi, len, q, ref1, ref2, s;
        s = '';
        gi = this.ind();
        s += 'try\n';
        s += gi + '{\n';
        s += this.indent + this.nodes(n.exps, '\n' + this.indent);
        s += gi + '\n';
        s += gi + '}\n';
        ref2 = (ref1 = n.catches) != null ? ref1 : [];
        for (q = 0, len = ref2.length; q < len; q++) {
            c = ref2[q];
            s += gi + ("catch (" + (this.node(c["catch"].errr)) + ")\n");
            s += gi + '{\n';
            s += this.indent + this.nodes(c["catch"].exps, '\n' + this.indent);
            s += gi + '\n';
            s += gi + '}\n';
        }
        if (n["finally"]) {
            s += gi + 'finally\n';
            s += gi + '{\n';
            s += this.indent + this.nodes(c.fnlly, '\n' + this.indent);
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
                return '(' + this.atom(op.lhs) + sep + o + sep + this.atom(op.rhs.operation.lhs) + ' && ' + kstr.lstrip(this.atom(op.rhs)) + ')';
            }
        }
        open = close = '';
        if (o !== '=' && ((ref3 = op.rhs) != null ? (ref4 = ref3.operation) != null ? ref4.operator.text : void 0 : void 0) === '=') {
            open = '(';
            close = ')';
        }
        return this.atom(op.lhs) + sep + o + sep + open + kstr.lstrip(this.atom(op.rhs) + close);
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

    return Renderer;

})();

module.exports = Renderer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNERBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQXVDLE9BQUEsQ0FBUSxTQUFSLENBQXZDLEVBQUUsaUJBQUYsRUFBUywrQkFBVCxFQUF1Qjs7QUFFakI7SUFFQyxrQkFBQyxJQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxPQUFEO1FBRUEsSUFBQyxDQUFBLEtBQUQseUNBQXFCLENBQUU7UUFDdkIsSUFBQyxDQUFBLE9BQUQseUNBQXFCLENBQUU7SUFIeEI7O3VCQUtILE1BQUEsR0FBUSxTQUFDLEdBQUQ7QUFFSixZQUFBO1FBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxDQUFDLEdBQUcsQ0FBQyxJQUFMO1FBQ1osSUFBQyxDQUFBLE1BQUQsR0FBVTtRQUNWLENBQUEsR0FBSTtRQUVKLElBQUcsQ0FBSSxLQUFBLENBQU0sR0FBRyxDQUFDLElBQVYsQ0FBUDtZQUNJLEVBQUEsR0FBSzs7QUFBQztBQUFBO3FCQUFBLHNDQUFBOztpQ0FBQSxDQUFDLENBQUM7QUFBRjs7Z0JBQUQsQ0FBMEIsQ0FBQyxJQUEzQixDQUFnQyxJQUFoQztZQUNMLENBQUEsSUFBSyxJQUFDLENBQUEsTUFBRCxHQUFVLENBQUEsTUFBQSxHQUFPLEVBQVAsR0FBVSxNQUFWLEVBRm5COztRQUlBLENBQUEsSUFBSyxJQUFDLENBQUEsS0FBRCxDQUFPLEdBQUcsQ0FBQyxJQUFYLEVBQWlCLElBQWpCO2VBQ0w7SUFYSTs7dUJBYVIsS0FBQSxHQUFPLFNBQUMsS0FBRCxFQUFRLEdBQVI7QUFFSCxZQUFBOztZQUZXLE1BQUk7O1FBRWYsRUFBQSxHQUFLLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBQSxT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MDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG5rc3RyICA9IHJlcXVpcmUgJ2tzdHInXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5cbnsgZW1wdHksIGZpcnN0TGluZUNvbCwgbGFzdExpbmVDb2wgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIFJlbmRlcmVyXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQGRlYnVnICAgPSBAa29kZS5hcmdzPy5kZWJ1Z1xuICAgICAgICBAdmVyYm9zZSA9IEBrb2RlLmFyZ3M/LnZlcmJvc2VcblxuICAgIHJlbmRlcjogKGFzdCkgLT5cblxuICAgICAgICBAdmFyc3RhY2sgPSBbYXN0LnZhcnNdXG4gICAgICAgIEBpbmRlbnQgPSAnJ1xuICAgICAgICBzID0gJydcblxuICAgICAgICBpZiBub3QgZW1wdHkgYXN0LnZhcnNcbiAgICAgICAgICAgIHZzID0gKHYudGV4dCBmb3IgdiBpbiBhc3QudmFycykuam9pbiAnLCAnXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBcInZhciAje3ZzfVxcblxcblwiXG5cbiAgICAgICAgcyArPSBAbm9kZXMgYXN0LmV4cHMsICdcXG4nXG4gICAgICAgIHNcblxuICAgIG5vZGVzOiAobm9kZXMsIHNlcD0nLCcpIC0+XG5cbiAgICAgICAgc2wgPSBub2Rlcy5tYXAgKHMpID0+IEBhdG9tIHNcbiAgICAgICAgc3MgPSBzbC5qb2luIHNlcFxuXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG5cbiAgICBub2RlOiAoZXhwKSAtPlxuXG4gICAgICAgIHJldHVybiAnJyBpZiBub3QgZXhwXG5cbiAgICAgICAgaWYgZXhwLnR5cGU/IGFuZCBleHAudGV4dD8gdGhlbiByZXR1cm4gQHRva2VuIGV4cFxuXG4gICAgICAgIGlmIGV4cCBpbnN0YW5jZW9mIEFycmF5IHRoZW4gcmV0dXJuIChAbm9kZShhKSBmb3IgYSBpbiBleHApLmpvaW4gJztcXG4nXG5cbiAgICAgICAgcyA9ICcnXG5cbiAgICAgICAgZm9yIGssdiBvZiBleHBcblxuICAgICAgICAgICAgcys9IHN3aXRjaCBrXG4gICAgICAgICAgICAgICAgd2hlbiAnaWYnICAgICAgICB0aGVuIEBpZiB2XG4gICAgICAgICAgICAgICAgd2hlbiAnZm9yJyAgICAgICB0aGVuIEBmb3IgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3doaWxlJyAgICAgdGhlbiBAd2hpbGUgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3JldHVybicgICAgdGhlbiBAcmV0dXJuIHZcbiAgICAgICAgICAgICAgICB3aGVuICdjbGFzcycgICAgIHRoZW4gQGNsYXNzIHZcbiAgICAgICAgICAgICAgICB3aGVuICdzd2l0Y2gnICAgIHRoZW4gQHN3aXRjaCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnd2hlbicgICAgICB0aGVuIEB3aGVuIHZcbiAgICAgICAgICAgICAgICB3aGVuICdhc3NlcnQnICAgIHRoZW4gQGFzc2VydCB2XG4gICAgICAgICAgICAgICAgd2hlbiAncW1ya29wJyAgICB0aGVuIEBxbXJrb3AgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3Ftcmtjb2xvbicgdGhlbiBAcW1ya2NvbG9uIHZcbiAgICAgICAgICAgICAgICB3aGVuICdvcGVyYXRpb24nIHRoZW4gQG9wZXJhdGlvbiB2XG4gICAgICAgICAgICAgICAgd2hlbiAnaW5jb25kJyAgICB0aGVuIEBpbmNvbmQgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3BhcmVucycgICAgdGhlbiBAcGFyZW5zIHZcbiAgICAgICAgICAgICAgICB3aGVuICdvYmplY3QnICAgIHRoZW4gQG9iamVjdCB2XG4gICAgICAgICAgICAgICAgd2hlbiAna2V5dmFsJyAgICB0aGVuIEBrZXl2YWwgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2FycmF5JyAgICAgdGhlbiBAYXJyYXkgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2luZGV4JyAgICAgdGhlbiBAaW5kZXggdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3NsaWNlJyAgICAgdGhlbiBAc2xpY2UgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3Byb3AnICAgICAgdGhlbiBAcHJvcCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnZnVuYycgICAgICB0aGVuIEBmdW5jIHZcbiAgICAgICAgICAgICAgICB3aGVuICdjYWxsJyAgICAgIHRoZW4gQGNhbGwgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3RyeScgICAgICAgdGhlbiBAdHJ5IHZcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGxvZyBSNChcInJlbmRlcmVyLm5vZGUgdW5oYW5kbGVkIGtleSAje2t9IGluIGV4cFwiKSwgZXhwICMgaWYgQGRlYnVnIG9yIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgICAgICcnXG4gICAgICAgIHNcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxuICAgIGF0b206IChleHApIC0+XG5cbiAgICAgICAgQGZpeEFzc2VydHMgQG5vZGUgZXhwXG5cbiAgICBhc3NlcnQ6IChwKSAtPlxuXG4gICAgICAgIEBub2RlKHAub2JqKSArIFwi4pa4I3twLnFtcmsubGluZX1fI3twLnFtcmsuY29sfeKXglwiXG4gICAgICAgIFxuICAgIHFtcmtvcDogKHApIC0+XG4gICAgICAgIFxuICAgICAgICB2biA9IFwiXyN7cC5xbXJrLmxpbmV9XyN7cC5xbXJrLmNvbH1fXCJcbiAgICAgICAgXCIoKCN7dm59PSN7QGF0b20gcC5saHN9KSAhPSBudWxsID8gI3t2bn0gOiAje0BhdG9tIHAucmhzfSlcIlxuXG4gICAgcW1ya2NvbG9uOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIFwiKCN7QGF0b20gcC5saHN9ID8gI3tAYXRvbSBwLm1pZH0gOiAje0BhdG9tIHAucmhzfSlcIlxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgMDAwICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMFxuXG4gICAgZml4QXNzZXJ0czogKHMpIC0+XG5cbiAgICAgICAgcmV0dXJuIHMgaWYgbm90IHNcblxuICAgICAgICBzcGx0ID0gcy5zcGxpdCAv4pa4XFxkK19cXGQr4peCL1xuICAgICAgICBtdGNoID0gcy5tYXRjaCAv4pa4XFxkK19cXGQr4peCL2dcblxuICAgICAgICBpZiBzcGx0Lmxlbmd0aCA+IDFcblxuICAgICAgICAgICAgbXRjaCA9IG10Y2gubWFwIChtKSAtPiBcIl8je21bMS4uLTJdfV9cIlxuICAgICAgICAgICAgIyBsb2cgc3BsdCwgbXRjaFxuXG4gICAgICAgICAgICBzID0gJydcblxuICAgICAgICAgICAgZm9yIGkgaW4gMC4uLm10Y2gubGVuZ3RoXG5cbiAgICAgICAgICAgICAgICBpZiBtdGNoLmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICAgICAgbCA9IFwiKCN7bXRjaFtpXX09I3soaWYgaSB0aGVuIG10Y2hbaS0xXStzcGx0W2ldIGVsc2Ugc3BsdFswXSl9KVwiXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBsID0gc3BsdFswXVxuXG4gICAgICAgICAgICAgICAgaWYgc3BsdFtpKzFdWzBdID09ICcoJ1xuICAgICAgICAgICAgICAgICAgICBzICs9IFwidHlwZW9mICN7bH0gPT09IFxcXCJmdW5jdGlvblxcXCIgPyBcIlxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcyArPSBcIiN7bH0gIT0gbnVsbCA/IFwiXG5cbiAgICAgICAgICAgIGlmIG10Y2gubGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgIHMgKz0gbXRjaFstMV0rc3BsdFstMV1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzICs9IHNwbHRbMF0rc3BsdFsxXVxuXG4gICAgICAgICAgICBmb3IgaSBpbiAwLi4ubXRjaC5sZW5ndGggdGhlbiBzICs9IFwiIDogdW5kZWZpbmVkXCJcblxuICAgICAgICAgICAgcyA9IFwiKCN7c30pXCJcbiAgICAgICAgc1xuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbiAgICBjbGFzczogKG4pIC0+XG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJjbGFzcyAje24ubmFtZS50ZXh0fVwiXG5cbiAgICAgICAgaWYgbi5leHRlbmRzXG4gICAgICAgICAgICBzICs9IFwiIGV4dGVuZHMgXCIgKyBuLmV4dGVuZHMubWFwKChlKSAtPiBlLnRleHQpLmpvaW4gJywgJ1xuXG4gICAgICAgIHMgKz0gJ1xcbnsnXG5cbiAgICAgICAgbXRoZHMgPSBuLmJvZHk/Lm9iamVjdD8ua2V5dmFscyA/IG4uYm9keT9bMF0/Lm9iamVjdD8ua2V5dmFsc1xuXG4gICAgICAgIGlmIG10aGRzPy5sZW5ndGhcbiAgICAgICAgICAgIG10aGRzID0gQHByZXBhcmVNZXRob2RzIG10aGRzXG4gICAgICAgICAgICBAaW5kZW50ID0gJyAgICAnXG4gICAgICAgICAgICBmb3IgbSBpbiBtdGhkc1xuICAgICAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgICAgICBzICs9IEBtdGhkIG1cbiAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIEBpbmRlbnQgPSAnJ1xuICAgICAgICBzICs9ICd9J1xuICAgICAgICBzXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG5cbiAgICBwcmVwYXJlTWV0aG9kczogKG10aGRzKSAtPlxuXG4gICAgICAgIGJpbmQgPSBbXVxuICAgICAgICBmb3IgbSBpbiBtdGhkc1xuICAgICAgICAgICAgaWYgbm90IG0ua2V5dmFsXG4gICAgICAgICAgICAgICAgcHJpbnQuYXN0ICdub3QgYW4gbWV0aG9kPycgbVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBpZiBub3QgbS5rZXl2YWwudmFsLmZ1bmNcbiAgICAgICAgICAgICAgICBwcmludC5hc3QgJ25vIGZ1bmMgZm9yIG1ldGhvZD8nIG1cbiAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBuYW1lID0gbS5rZXl2YWwudmFsLmZ1bmMubmFtZS50ZXh0XG4gICAgICAgICAgICBpZiBuYW1lIGluIFsnQCcgJ2NvbnN0cnVjdG9yJ11cbiAgICAgICAgICAgICAgICBpZiBjb25zdHJ1Y3RvciB0aGVuIGVycm9yICdtb3JlIHRoYW4gb25lIGNvbnN0cnVjdG9yPydcbiAgICAgICAgICAgICAgICBtLmtleXZhbC52YWwuZnVuYy5uYW1lLnRleHQgPSAnY29uc3RydWN0b3InXG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3IgPSBtXG4gICAgICAgICAgICBlbHNlIGlmIG5hbWUuc3RhcnRzV2l0aCAnQCdcbiAgICAgICAgICAgICAgICBtLmtleXZhbC52YWwuZnVuYy5uYW1lLnRleHQgPSAnc3RhdGljICcgKyBuYW1lWzEuLl1cbiAgICAgICAgICAgIGVsc2UgaWYgbS5rZXl2YWwudmFsLmZ1bmM/LmFycm93LnRleHQgPT0gJz0+J1xuICAgICAgICAgICAgICAgIGJpbmQucHVzaCBtXG5cbiAgICAgICAgaWYgYmluZC5sZW5ndGggYW5kIG5vdCBjb25zdHJ1Y3RvciAjIGZvdW5kIHNvbWUgbWV0aG9kcyB0byBiaW5kLCBidXQgbm8gY29uc3RydWN0b3JcbiAgICAgICAgICAgIGFzdCA9IEBrb2RlLmFzdCBcImNvbnN0cnVjdG9yOiAtPlwiICMgY3JlYXRlIG9uZSBmcm9tIHNjcmF0Y2hcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yID0gYXN0LmV4cHNbMF0ub2JqZWN0LmtleXZhbHNbMF1cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmtleXZhbC52YWwuZnVuYy5uYW1lID0gdHlwZTonbmFtZScgdGV4dDonY29uc3RydWN0b3InXG4gICAgICAgICAgICBtdGhkcy51bnNoaWZ0IGNvbnN0cnVjdG9yXG5cbiAgICAgICAgaWYgYmluZC5sZW5ndGhcbiAgICAgICAgICAgIGZvciBiIGluIGJpbmRcbiAgICAgICAgICAgICAgICBibiA9IGIua2V5dmFsLnZhbC5mdW5jLm5hbWUudGV4dFxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLmtleXZhbC52YWwuZnVuYy5ib2R5LmV4cHMgPz0gW11cbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5rZXl2YWwudmFsLmZ1bmMuYm9keS5leHBzLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NvZGUnXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwidGhpcy4je2JufSA9IHRoaXMuI3tibn0uYmluZCh0aGlzKVwiXG4gICAgICAgIG10aGRzXG5cbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIG10aGQ6IChuKSAtPlxuXG4gICAgICAgIGlmIG4ua2V5dmFsXG4gICAgICAgICAgICBzID0gQGluZGVudCArIEBmdW5jIG4ua2V5dmFsLnZhbC5mdW5jXG4gICAgICAgIHNcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMFxuXG4gICAgZnVuYzogKG4pIC0+XG5cbiAgICAgICAgcmV0dXJuICcnIGlmIG5vdCBuXG5cbiAgICAgICAgZ2kgPSBAaW5kKClcblxuICAgICAgICBzID0gbi5uYW1lPy50ZXh0ID8gJ2Z1bmN0aW9uJ1xuICAgICAgICBzICs9ICcgKCdcblxuICAgICAgICBhcmdzID0gbi5hcmdzPy5wYXJlbnM/LmV4cHNcbiAgICAgICAgaWYgYXJnc1xuICAgICAgICAgICAgW3N0ciwgdGhzXSA9IEBhcmdzIGFyZ3NcbiAgICAgICAgICAgIHMgKz0gc3RyXG5cbiAgICAgICAgcyArPSAnKVxcbidcbiAgICAgICAgcyArPSBnaSArICd7J1xuXG4gICAgICAgIEB2YXJzdGFjay5wdXNoIG4uYm9keS52YXJzXG5cbiAgICAgICAgaWYgbm90IGVtcHR5IG4uYm9keS52YXJzXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICB2cyA9ICh2LnRleHQgZm9yIHYgaW4gbi5ib2R5LnZhcnMpLmpvaW4gJywgJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgXCJ2YXIgI3t2c31cXG5cIlxuXG4gICAgICAgIGZvciB0IGluIHRocyA/IFtdXG4gICAgICAgICAgICBzICs9ICdcXG4nICsgQGluZGVudCArIHRoc1xuXG4gICAgICAgIGlmIG5vdCBlbXB0eSBuLmJvZHkuZXhwc1xuXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzcyA9IG4uYm9keS5leHBzLm1hcCAocykgPT4gQG5vZGUgc1xuICAgICAgICAgICAgc3MgPSBzcy5tYXAgKHMpID0+IEBpbmRlbnQgKyBzXG4gICAgICAgICAgICBzICs9IHNzLmpvaW4gJ1xcbidcbiAgICAgICAgICAgIHMgKz0gJ1xcbicgKyBnaVxuXG4gICAgICAgIHMgKz0gJ30nXG5cbiAgICAgICAgQHZhcnN0YWNrLnBvcCgpXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgMDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcblxuICAgIGFyZ3M6IChhcmdzKSAtPlxuXG4gICAgICAgIHRocyAgPSBbXVxuICAgICAgICB1c2VkID0ge31cblxuICAgICAgICBmb3IgYSBpbiBhcmdzXG4gICAgICAgICAgICBpZiBhLnRleHQgdGhlbiB1c2VkW2EudGV4dF0gPSBhLnRleHRcblxuICAgICAgICBhcmdzID0gYXJncy5tYXAgKGEpIC0+XG4gICAgICAgICAgICBpZiBhLnByb3AgYW5kIGEucHJvcC5vYmoudHlwZSA9PSAndGhpcydcbiAgICAgICAgICAgICAgICB0aGlzVmFyID0gYS5wcm9wLnByb3BcbiAgICAgICAgICAgICAgICBpZiB1c2VkW3RoaXNWYXIudGV4dF1cbiAgICAgICAgICAgICAgICAgICAgZm9yIGkgaW4gWzEuLjEwMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCB1c2VkW3RoaXNWYXIudGV4dCtpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocy5wdXNoIFwidGhpcy4je3RoaXNWYXIudGV4dH0gPSAje3RoaXNWYXIudGV4dCtpfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1Zhci50ZXh0ID0gdGhpc1Zhci50ZXh0K2lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VkW3RoaXNWYXIudGV4dF0gPSB0aGlzVmFyLnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhzLnB1c2ggXCJ0aGlzLiN7dGhpc1Zhci50ZXh0fSA9ICN7dGhpc1Zhci50ZXh0fVwiXG5cbiAgICAgICAgICAgICAgICB0aGlzVmFyXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYVxuXG4gICAgICAgIHN0ciA9IGFyZ3MubWFwKChhKSA9PiBAbm9kZSBhKS5qb2luICcsICdcblxuICAgICAgICBbc3RyLHRoc11cblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAwIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDBcblxuICAgIHJldHVybjogKG4pIC0+XG5cbiAgICAgICAgcyA9ICdyZXR1cm4nXG4gICAgICAgIHMgKz0gJyAnICsgQG5vZGUgbi52YWxcbiAgICAgICAga3N0ci5zdHJpcCBzXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMFxuXG4gICAgY2FsbDogKHApIC0+XG4gICAgICAgIGlmIHAuY2FsbGVlLnRleHQgaW4gWydsb2cnJ3dhcm4nJ2Vycm9yJ11cbiAgICAgICAgICAgIHAuY2FsbGVlLnRleHQgPSBcImNvbnNvbGUuI3twLmNhbGxlZS50ZXh0fVwiXG4gICAgICAgIGNhbGxlZSA9IEBub2RlIHAuY2FsbGVlXG4gICAgICAgIGlmIGNhbGxlZSA9PSAnbmV3J1xuICAgICAgICAgICAgXCIje2NhbGxlZX0gI3tAbm9kZXMgcC5hcmdzLCAnLCd9XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgXCIje2NhbGxlZX0oI3tAbm9kZXMgcC5hcmdzLCAnLCd9KVwiXG5cbiAgICAjIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMDAwMFxuICAgICMgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwXG5cbiAgICBpZjogKG4pIC0+XG5cbiAgICAgICAgaWYgbm90IG4udGhlbiB0aGVuIGVycm9yICdpZiBleHBlY3RlZCB0aGVuJyBuXG5cbiAgICAgICAgZmlyc3QgPSBmaXJzdExpbmVDb2wgblxuICAgICAgICBsYXN0ICA9IGxhc3RMaW5lQ29sIG5cblxuICAgICAgICBpZiBmaXJzdC5saW5lID09IGxhc3QubGluZSBhbmQgbi5lbHNlXG4gICAgICAgICAgICByZXR1cm4gQGlmSW5saW5lIG5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwiaWYgKCN7QGF0b20obi5jb25kKX0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgZm9yIGVsaWYgaW4gbi5lbGlmcyA/IFtdXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpICsgXCJlbHNlIGlmICgje0BhdG9tKGVsaWYuZWxpZi5jb25kKX0pXFxuXCJcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgICAgIGZvciBlIGluIGVsaWYuZWxpZi50aGVuID8gW11cbiAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgaWYgbi5lbHNlXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpICsgJ2Vsc2VcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBmb3IgZSBpbiBuLmVsc2UgPyBbXVxuICAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgICMgMDAwICAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcblxuICAgIGlmSW5saW5lOiAobikgLT5cblxuICAgICAgICBzID0gJydcblxuICAgICAgICBzICs9IFwiI3tAYXRvbShuLmNvbmQpfSA/IFwiXG4gICAgICAgIGlmIG4udGhlbj8ubGVuZ3RoXG4gICAgICAgICAgICBzICs9IChAYXRvbShlKSBmb3IgZSBpbiBuLnRoZW4pLmpvaW4gJywgJ1xuXG4gICAgICAgIGlmIG4uZWxpZnNcbiAgICAgICAgICAgIGZvciBlIGluIG4uZWxpZnNcbiAgICAgICAgICAgICAgICBzICs9ICcgOiAnXG4gICAgICAgICAgICAgICAgcyArPSBAaWZJbmxpbmUgZS5lbGlmXG5cbiAgICAgICAgaWYgbi5lbHNlXG4gICAgICAgICAgICBzICs9ICcgOiAnXG4gICAgICAgICAgICBpZiBuLmVsc2UubGVuZ3RoID09IDFcbiAgICAgICAgICAgICAgICBzICs9IEBhdG9tIG4uZWxzZVswXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHMgKz0gJygnICsgKEBhdG9tIGUgZm9yIGUgaW4gbi5lbHNlKS5qb2luKCcsICcpICsgJyknXG4gICAgICAgIHNcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxuICAgIGZvcjogKG4pIC0+XG5cbiAgICAgICAgaWYgbm90IG4udGhlbiB0aGVuIGVycm9yICdmb3IgZXhwZWN0ZWQgdGhlbicgblxuXG4gICAgICAgIHN3aXRjaCBuLmlub2YudGV4dFxuICAgICAgICAgICAgd2hlbiAnaW4nIHRoZW4gQGZvcl9pbiBuXG4gICAgICAgICAgICB3aGVuICdvZicgdGhlbiBAZm9yX29mIG5cbiAgICAgICAgICAgIGVsc2UgZXJyb3IgJ2ZvciBleHBlY3RlZCBpbi9vZidcblxuICAgIGZvcl9pbjogKG4pIC0+XG5cbiAgICAgICAgZ2kgPSBAaW5kKClcblxuICAgICAgICBsaXN0ID0gQG5vZGUgbi5saXN0XG5cbiAgICAgICAgaWYgbm90IGxpc3Qgb3IgbGlzdCA9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgcHJpbnQubm9vbiAnbm8gbGlzdCBmb3InIG4ubGlzdFxuICAgICAgICAgICAgcHJpbnQuYXN0ICdubyBsaXN0IGZvcicgbi5saXN0XG5cbiAgICAgICAgbGlzdFZhciA9IEBmcmVzaFZhciAnbGlzdCdcbiAgICAgICAgaXRlclZhciA9IEBmcmVzaFZhciAnaSdcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJ2YXIgI3tsaXN0VmFyfSA9ICN7bGlzdH1cXG5cIlxuICAgICAgICBpZiBuLnZhbHMudGV4dFxuICAgICAgICAgICAgcyArPSBnaStcImZvciAodmFyICN7aXRlclZhcn0gPSAwOyAje2l0ZXJWYXJ9IDwgI3tsaXN0VmFyfS5sZW5ndGg7ICN7aXRlclZhcn0rKylcXG5cIlxuICAgICAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICAgICAgcyArPSBAaW5kZW50K1wiI3tuLnZhbHMudGV4dH0gPSAje2xpc3RWYXJ9WyN7aXRlclZhcn1dXFxuXCJcbiAgICAgICAgZWxzZSBpZiBuLnZhbHMuYXJyYXk/Lml0ZW1zXG4gICAgICAgICAgICBzICs9IGdpK1wiZm9yICh2YXIgI3tpdGVyVmFyfSA9IDA7ICN7aXRlclZhcn0gPCAje2xpc3RWYXJ9Lmxlbmd0aDsgI3tpdGVyVmFyfSsrKVxcblwiXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBmb3IgaiBpbiAwLi4ubi52YWxzLmFycmF5Lml0ZW1zLmxlbmd0aFxuICAgICAgICAgICAgICAgIHYgPSBuLnZhbHMuYXJyYXkuaXRlbXNbal1cbiAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQrXCIje3YudGV4dH0gPSAje2xpc3RWYXJ9WyN7aXRlclZhcn1dWyN7an1dXFxuXCJcbiAgICAgICAgZWxzZSBpZiBuLnZhbHMubGVuZ3RoID4gMVxuICAgICAgICAgICAgbHYgPSBuLnZhbHNbMV0udGV4dFxuICAgICAgICAgICAgcyArPSBnaStcImZvciAoI3tsdn0gPSAwOyAje2x2fSA8ICN7bGlzdFZhcn0ubGVuZ3RoOyAje2x2fSsrKVxcblwiXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQrXCIje24udmFsc1swXS50ZXh0fSA9ICN7bGlzdFZhcn1baV1cXG5cIlxuXG4gICAgICAgIGZvciBlIGluIG4udGhlbi5leHBzID8gW11cbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG5cbiAgICBmb3Jfb2Y6IChuKSAtPlxuXG4gICAgICAgIGdpID0gQGluZCgpXG5cbiAgICAgICAga2V5ID0gbi52YWxzLnRleHQgPyBuLnZhbHNbMF0/LnRleHRcbiAgICAgICAgdmFsID0gbi52YWxzWzFdPy50ZXh0XG5cbiAgICAgICAgb2JqID0gQG5vZGUgbi5saXN0XG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwiZm9yICgje2tleX0gaW4gI3tvYmp9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgaWYgdmFsXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQrXCIje3ZhbH0gPSAje29ian1bI3trZXl9XVxcblwiXG4gICAgICAgIGZvciBlIGluIG4udGhlbi5leHBzID8gW11cbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcblxuICAgIHdoaWxlOiAobikgLT5cblxuICAgICAgICBpZiBub3Qgbi50aGVuIHRoZW4gZXJyb3IgJ3doZW4gZXhwZWN0ZWQgdGhlbicgblxuXG4gICAgICAgIGdpID0gQGluZCgpXG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJ3aGlsZSAoI3tAbm9kZSBuLmNvbmR9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuLmV4cHMgPyBbXVxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBzd2l0Y2g6IChuKSAtPlxuXG4gICAgICAgIGlmIG5vdCBuLm1hdGNoIHRoZW4gZXJyb3IgJ3N3aXRjaCBleHBlY3RlZCBtYXRjaCcgblxuICAgICAgICBpZiBub3Qgbi53aGVucyB0aGVuIGVycm9yICdzd2l0Y2ggZXhwZWN0ZWQgd2hlbnMnIG5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwic3dpdGNoICgje0Bub2RlIG4ubWF0Y2h9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi53aGVucyA/IFtdXG4gICAgICAgICAgICBzICs9IGdpKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIGlmIG4uZWxzZVxuICAgICAgICAgICAgcyArPSBAaW5kZW50KydkZWZhdWx0OlxcbidcbiAgICAgICAgICAgIGZvciBlIGluIG4uZWxzZVxuICAgICAgICAgICAgICAgIHMgKz0gQGluZGVudCsnICAgICcrIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBnaStcIn1cXG5cIlxuXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgd2hlbjogKG4pIC0+XG5cbiAgICAgICAgaWYgbm90IG4udmFscyB0aGVuIHJldHVybiBlcnJvciAnd2hlbiBleHBlY3RlZCB2YWxzJyBuXG4gICAgICAgIGlmIG5vdCBuLnRoZW4gdGhlbiByZXR1cm4gZXJyb3IgJ3doZW4gZXhwZWN0ZWQgdGhlbicgblxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBmb3IgZSBpbiBuLnZhbHNcbiAgICAgICAgICAgIHMgKz0gJyAgICBjYXNlICcgKyBAbm9kZShlKSArICc6XFxuJ1xuICAgICAgICBmb3IgZSBpbiBuLnRoZW4uZXhwcyA/IFtdXG4gICAgICAgICAgICBnaSA9IEBpbmQoKVxuICAgICAgICAgICAgcyArPSBnaSArICcgICAgJyArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgICAgIEBkZWQoKVxuICAgICAgICBzICs9IEBpbmRlbnQgKyAnICAgICcgKyAnYnJlYWsnXG4gICAgICAgIHNcblxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMCAgICAgIDAwMDAwICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICB0cnk6IChuKSAtPlxuICAgICAgICBcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIGdpID0gQGluZCgpXG4gICAgICAgIHMgKz0gJ3RyeVxcbidcbiAgICAgICAgcyArPSBnaSsne1xcbidcbiAgICAgICAgcyArPSBAaW5kZW50K0Bub2RlcyBuLmV4cHMsICdcXG4nK0BpbmRlbnRcbiAgICAgICAgcyArPSBnaSsnXFxuJ1xuICAgICAgICBzICs9IGdpKyd9XFxuJ1xuICAgICAgICBmb3IgYyBpbiBuLmNhdGNoZXMgPyBbXVxuICAgICAgICAgICAgcyArPSBnaStcImNhdGNoICgje0Bub2RlIGMuY2F0Y2guZXJycn0pXFxuXCIgXG4gICAgICAgICAgICBzICs9IGdpKyd7XFxuJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50K0Bub2RlcyBjLmNhdGNoLmV4cHMsICdcXG4nK0BpbmRlbnRcbiAgICAgICAgICAgIHMgKz0gZ2krJ1xcbidcbiAgICAgICAgICAgIHMgKz0gZ2krJ31cXG4nXG4gICAgICAgIGlmIG4uZmluYWxseVxuICAgICAgICAgICAgcyArPSBnaSsnZmluYWxseVxcbidcbiAgICAgICAgICAgIHMgKz0gZ2krJ3tcXG4nXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQrQG5vZGVzIGMuZm5sbHksICdcXG4nK0BpbmRlbnRcbiAgICAgICAgICAgIHMgKz0gZ2krJ1xcbidcbiAgICAgICAgICAgIHMgKz0gZ2krJ31cXG4nXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMDAgIDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMFxuICAgICMgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgdG9rZW46ICh0b2spIC0+XG5cbiAgICAgICAgaWYgdG9rLnR5cGUgPT0gJ2NvbW1lbnQnXG4gICAgICAgICAgICBAY29tbWVudCB0b2tcbiAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAndGhpcydcbiAgICAgICAgICAgICd0aGlzJ1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICd0cmlwbGUnXG4gICAgICAgICAgICAnYCcgKyB0b2sudGV4dFszLi4tNF0gKyAnYCdcbiAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAna2V5d29yZCcgYW5kIHRvay50ZXh0ID09ICd5ZXMnXG4gICAgICAgICAgICAndHJ1ZSdcbiAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAna2V5d29yZCcgYW5kIHRvay50ZXh0ID09ICdubydcbiAgICAgICAgICAgICdmYWxzZSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdG9rLnRleHRcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG4gICAgY29tbWVudDogKHRvaykgLT5cblxuICAgICAgICBpZiB0b2sudGV4dC5zdGFydHNXaXRoICcjIyMnXG4gICAgICAgICAgICAnLyonICsgdG9rLnRleHRbMy4uLTRdICsgJyovJyArICdcXG4nXG4gICAgICAgIGVsc2UgaWYgdG9rLnRleHQuc3RhcnRzV2l0aCAnIydcbiAgICAgICAgICAgIGtzdHIucGFkKCcnLCB0b2suY29sKSArICcvLycgKyB0b2sudGV4dFsxLi4tMV1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZXJyb3IgXCIjIGNvbW1lbnQgdG9rZW4gZXhwZWN0ZWRcIlxuICAgICAgICAgICAgJydcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxuICAgIG9wZXJhdGlvbjogKG9wKSAtPlxuXG4gICAgICAgIG9wbWFwID0gKG8pIC0+XG4gICAgICAgICAgICBvbXAgPVxuICAgICAgICAgICAgICAgIGFuZDogICAgJyYmJ1xuICAgICAgICAgICAgICAgIG9yOiAgICAgJ3x8J1xuICAgICAgICAgICAgICAgIG5vdDogICAgJyEnXG4gICAgICAgICAgICAgICAgJz09JzogICAnPT09J1xuICAgICAgICAgICAgICAgICchPSc6ICAgJyE9PSdcbiAgICAgICAgICAgIG9tcFtvXSA/IG9cblxuICAgICAgICBvICAgPSBvcG1hcCBvcC5vcGVyYXRvci50ZXh0XG4gICAgICAgIHNlcCA9ICcgJ1xuICAgICAgICBzZXAgPSAnJyBpZiBub3Qgb3AubGhzIG9yIG5vdCBvcC5yaHNcblxuICAgICAgICBpZiBvIGluIFsnPCcnPD0nJz09PScnIT09Jyc+PScnPiddXG4gICAgICAgICAgICBybyA9IG9wbWFwIG9wLnJocz8ub3BlcmF0aW9uPy5vcGVyYXRvci50ZXh0XG4gICAgICAgICAgICBpZiBybyBpbiBbJzwnJzw9Jyc9PT0nJyE9PScnPj0nJz4nXVxuICAgICAgICAgICAgICAgIHJldHVybiAnKCcgKyBAYXRvbShvcC5saHMpICsgc2VwICsgbyArIHNlcCArIEBhdG9tKG9wLnJocy5vcGVyYXRpb24ubGhzKSArICcgJiYgJyArIGtzdHIubHN0cmlwKEBhdG9tKG9wLnJocykpICsgJyknXG5cbiAgICAgICAgb3BlbiA9IGNsb3NlID0gJydcbiAgICAgICAgaWYgbyAhPSAnPScgYW5kIG9wLnJocz8ub3BlcmF0aW9uPy5vcGVyYXRvci50ZXh0ID09ICc9J1xuICAgICAgICAgICAgb3BlbiA9ICcoJ1xuICAgICAgICAgICAgY2xvc2UgPSAnKSdcblxuICAgICAgICBAYXRvbShvcC5saHMpICsgc2VwICsgbyArIHNlcCArIG9wZW4gKyBrc3RyLmxzdHJpcCBAYXRvbShvcC5yaHMpICsgY2xvc2VcblxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgaW5jb25kOiAocCkgLT5cblxuICAgICAgICBcIiN7QG5vZGUgcC5yaHN9LmluZGV4T2YoI3tAYXRvbSBwLmxoc30pID49IDBcIlxuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgcGFyZW5zOiAocCkgLT4gXCIoI3tAbm9kZXMgcC5leHBzfSlcIlxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDBcblxuICAgIG9iamVjdDogKHApIC0+IFwieyN7QG5vZGVzIHAua2V5dmFscywgJywnfX1cIlxuXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGtleXZhbDogKHApIC0+XG4gICAgICAgIGtleSA9IEBub2RlIHAua2V5XG4gICAgICAgIGlmIGtleVswXSBub3QgaW4gXCInXFxcIlwiIGFuZCAvW1xcLlxcLFxcO1xcKlxcK1xcLVxcL1xcPVxcfF0vLnRlc3Qga2V5IHRoZW4ga2V5ID0gXCInI3trZXl9J1wiXG4gICAgICAgIFwiI3trZXl9OiN7QGF0b20ocC52YWwpfVwiXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMFxuXG4gICAgcHJvcDogICAocCkgLT5cblxuICAgICAgICBcIiN7QG5vZGUocC5vYmopfS4je0Bub2RlIHAucHJvcH1cIlxuXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIGluZGV4OiAgKHApIC0+XG5cbiAgICAgICAgaWYgc2xpY2UgPSBwLnNsaWR4LnNsaWNlXG5cbiAgICAgICAgICAgIGZyb20gPSBpZiBzbGljZS5mcm9tPyB0aGVuIEBub2RlIHNsaWNlLmZyb20gZWxzZSAnMCdcblxuICAgICAgICAgICAgYWRkT25lID0gc2xpY2UuZG90cy50ZXh0ID09ICcuLidcblxuICAgICAgICAgICAgaWYgc2xpY2UudXB0bz8gdGhlbiB1cHRvID0gQG5vZGUgc2xpY2UudXB0b1xuXG4gICAgICAgICAgICBpZiBzbGljZS51cHRvPy50eXBlID09ICdudW0nIG9yIHNsaWNlLnVwdG8/Lm9wZXJhdGlvblxuICAgICAgICAgICAgICAgIHUgPSBwYXJzZUludCB1cHRvXG4gICAgICAgICAgICAgICAgaWYgdSA9PSAtMSBhbmQgYWRkT25lXG4gICAgICAgICAgICAgICAgICAgIHVwcGVyID0gJydcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHUgKz0gMSBpZiBhZGRPbmVcbiAgICAgICAgICAgICAgICAgICAgdXBwZXIgPSBcIiwgI3t1fVwiXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgYWRkT25lIHRoZW4gaWYgdXB0byB0aGVuIHVwcGVyID0gXCIsIHR5cGVvZiAje3VwdG99ID09PSAnbnVtYmVyJyAmJiAje3VwdG99KzEgfHwgSW5maW5pdHlcIlxuICAgICAgICAgICAgICAgIGVsc2UgICAgICAgICAgICAgICAgICAgICAgICB1cHBlciA9IFwiLCB0eXBlb2YgI3t1cHRvfSA9PT0gJ251bWJlcicgJiYgI3t1cHRvfSB8fCAtMVwiXG5cbiAgICAgICAgICAgIFwiI3tAbm9kZShwLmlkeGVlKX0uc2xpY2UoI3tmcm9tfSN7dXBwZXIgPyAnJ30pXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgcC5zbGlkeC50ZXh0P1swXSA9PSAnLSdcbiAgICAgICAgICAgICAgICBuaSA9IHBhcnNlSW50IHAuc2xpZHgudGV4dFxuICAgICAgICAgICAgICAgIGlmIG5pID09IC0xXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIiN7QGF0b20ocC5pZHhlZSl9LnNsaWNlKCN7bml9KVswXVwiXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCIje0BhdG9tKHAuaWR4ZWUpfS5zbGljZSgje25pfSwje25pKzF9KVswXVwiXG5cbiAgICAgICAgICAgIFwiI3tAYXRvbShwLmlkeGVlKX1bI3tAbm9kZSBwLnNsaWR4fV1cIlxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgIDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxuICAgIGFycmF5OiAocCkgLT5cblxuICAgICAgICBpZiBwLml0ZW1zWzBdPy5zbGljZVxuICAgICAgICAgICAgQHNsaWNlIHAuaXRlbXNbMF0uc2xpY2VcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgXCJbI3tAbm9kZXMgcC5pdGVtcywgJywnfV1cIlxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDBcblxuICAgIHNsaWNlOiAocCkgLT5cblxuICAgICAgICBpZiBwLmZyb20udHlwZSA9PSAnbnVtJyA9PSBwLnVwdG8udHlwZVxuICAgICAgICAgICAgZnJvbSA9IHBhcnNlSW50IHAuZnJvbS50ZXh0XG4gICAgICAgICAgICB1cHRvID0gcGFyc2VJbnQgcC51cHRvLnRleHRcbiAgICAgICAgICAgIGlmIHVwdG8tZnJvbSA8PSAxMFxuICAgICAgICAgICAgICAgIGlmIHAuZG90cy50ZXh0ID09ICcuLi4nIHRoZW4gdXB0by0tXG4gICAgICAgICAgICAgICAgJ1snKygoeCBmb3IgeCBpbiBbZnJvbS4udXB0b10pLmpvaW4gJywnKSsnXSdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvID0gaWYgcC5kb3RzLnRleHQgPT0gJy4uLicgdGhlbiAnPCcgZWxzZSAnPD0nXG4gICAgICAgICAgICAgICAgXCIoZnVuY3Rpb24oKSB7IHZhciByID0gW107IGZvciAodmFyIGkgPSAje2Zyb219OyBpICN7b30gI3t1cHRvfTsgaSsrKXsgci5wdXNoKGkpOyB9IHJldHVybiByOyB9KS5hcHBseSh0aGlzKVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG8gPSBpZiBwLmRvdHMudGV4dCA9PSAnLi4uJyB0aGVuICc8JyBlbHNlICc8PSdcbiAgICAgICAgICAgIFwiKGZ1bmN0aW9uKCkgeyB2YXIgciA9IFtdOyBmb3IgKHZhciBpID0gI3tAbm9kZSBwLmZyb219OyBpICN7b30gI3tAbm9kZSBwLnVwdG99OyBpKyspeyByLnB1c2goaSk7IH0gcmV0dXJuIHI7IH0pLmFwcGx5KHRoaXMpXCJcblxuICAgIGZyZXNoVmFyOiAobmFtZSwgc3VmZml4PTApIC0+XG5cbiAgICAgICAgZm9yIHZhcnMgaW4gQHZhcnN0YWNrXG4gICAgICAgICAgICBmb3IgdiBpbiB2YXJzXG4gICAgICAgICAgICAgICAgaWYgdi50ZXh0ID09IG5hbWUgKyAoc3VmZml4IG9yICcnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQGZyZXNoVmFyIG5hbWUsIHN1ZmZpeCsxXG5cbiAgICAgICAgQHZhcnN0YWNrWy0xXS5wdXNoIHRleHQ6bmFtZSArIChzdWZmaXggb3IgJycpXG4gICAgICAgIG5hbWUgKyAoc3VmZml4IG9yICcnKVxuXG4gICAgdmVyYjogLT4gaWYgQHZlcmJvc2UgdGhlbiBjb25zb2xlLmxvZy5hcHBseSBjb25zb2xlLmxvZywgYXJndW1lbnRzXG4gICAgaW5kOiAtPlxuXG4gICAgICAgIG9pID0gQGluZGVudFxuICAgICAgICBAaW5kZW50ICs9ICcgICAgJ1xuICAgICAgICBvaVxuXG4gICAgZGVkOiAtPlxuXG4gICAgICAgIEBpbmRlbnQgPSBAaW5kZW50Wy4uLi00XVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlbmRlcmVyXG4iXX0=
//# sourceURL=../coffee/renderer.coffee