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
                    case 'lcomp':
                        return this.lcomp(v);
                    case 'index':
                        return this.index(v);
                    case 'slice':
                        return this.slice(v);
                    case 'prop':
                        return this.prop(v);
                    case 'each':
                        return this.each(v);
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

    Renderer.prototype.each = function(n) {
        var numArgs, ref1, ref2;
        numArgs = (ref1 = n.fnc.func.args) != null ? ref1.parens.exps.length : void 0;
        if (numArgs === 1) {
            return "(function (o) {\n    r = o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}\n    for (k in o)\n    {   \n        var m = (" + (this.node(n.fnc)) + ")(o[k])\n        if (m != null)\n        {\n            r[k] = m\n        }\n    }\n    return o instanceof Array ? r.filter((f) => { return f !== undefined }) : typeof o == 'string' ? r.join('') : r\n})(" + (this.node(n.lhs)) + ")";
        } else if (numArgs) {
            return "(function (o) {\n    r = o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}\n    for (k in o)\n    {   \n        var m = (" + (this.node(n.fnc)) + ")(k, o[k])\n        if (m != null && m[0] != null)\n        {\n            r[m[0]] = m[1]\n        }\n    }\n    return o instanceof Array ? r.filter((f) => { return f !== undefined }) : typeof o == 'string' ? r.join('') : r\n})(" + (this.node(n.lhs)) + ")";
        } else {
            if (((ref2 = n.fnc.func.body.exps) != null ? ref2.length : void 0) > 0) {
                return "(function (o) {\n    r = o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}\n    for (k in o)\n    {   \n        var m = (" + (this.node(n.fnc)) + ")(o[k])\n        if (m != null)\n        {\n            r[k] = m\n        }\n    }\n    return o instanceof Array ? r.filter((f) => { return f !== undefined }) : typeof o == 'string' ? r.join('') : r\n})(" + (this.node(n.lhs)) + ")\n    ";
            } else {
                return "(function (o) { return o instanceof Array ? [] : typeof o == 'string' ? '' : {} })(" + (this.node(n.lhs)) + ")";
            }
        }
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

    Renderer.prototype.for_in = function(n, varPrefix, lastPrefix, lastPostfix) {
        var e, gi, iterVar, j, len, len1, list, listVar, lv, postfix, prefix, q, r, ref1, ref2, ref3, ref4, ref5, results, s, v, w;
        if (varPrefix == null) {
            varPrefix = '';
        }
        if (lastPrefix == null) {
            lastPrefix = '';
        }
        gi = this.ind();
        list = this.node(n.list);
        if (!list || list === 'undefined') {
            print.noon('no list for', n.list);
            print.ast('no list for', n.list);
        }
        listVar = this.freshVar('list');
        iterVar = "_" + n.inof.line + "_" + n.inof.col + "_";
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
            s += this.indent + ("" + varPrefix + n.vals[0].text + " = " + listVar + "[i]\n");
        }
        ref5 = (ref4 = n.then) != null ? ref4 : [];
        for (w = 0, len1 = ref5.length; w < len1; w++) {
            e = ref5[w];
            prefix = lastPrefix && e === n.then.slice(-1)[0] ? lastPrefix : '';
            postfix = lastPostfix && e === n.then.slice(-1)[0] ? lastPostfix : '';
            s += this.indent + prefix + this.node(e) + postfix + '\n';
        }
        s += gi + "}";
        this.ded();
        return s;
    };

    Renderer.prototype.for_of = function(n, varPrefix, lastPrefix, lastPostfix) {
        var e, gi, key, len, obj, postfix, prefix, q, ref1, ref2, ref3, ref4, ref5, s, val;
        if (varPrefix == null) {
            varPrefix = '';
        }
        if (lastPrefix == null) {
            lastPrefix = '';
        }
        gi = this.ind();
        key = (ref1 = n.vals.text) != null ? ref1 : (ref2 = n.vals[0]) != null ? ref2.text : void 0;
        val = (ref3 = n.vals[1]) != null ? ref3.text : void 0;
        obj = this.node(n.list);
        s = '';
        s += "for (" + key + " in " + obj + ")\n";
        s += gi + "{\n";
        if (val) {
            s += this.indent + ("" + varPrefix + val + " = " + obj + "[" + key + "]\n");
        }
        ref5 = (ref4 = n.then) != null ? ref4 : [];
        for (q = 0, len = ref5.length; q < len; q++) {
            e = ref5[q];
            prefix = lastPrefix && e === n.then.slice(-1)[0] ? lastPrefix : '';
            postfix = lastPostfix && e === n.then.slice(-1)[0] ? lastPostfix : '';
            s += this.indent + prefix + this.node(e) + postfix + '\n';
        }
        s += gi + "}";
        this.ded();
        return s;
    };

    Renderer.prototype.lcomp = function(n) {
        var comp, t;
        comp = (function(_this) {
            return function(f) {
                switch (f.inof.text) {
                    case 'in':
                        return _this.for_in(f, 'var ', 'result.push(', ')');
                    case 'of':
                        return _this.for_of(f, 'var ', 'result.push(', ')');
                }
            };
        })(this);
        this.ind();
        t = "(function ()\n{\n    var result = []\n    " + (comp(n["for"])) + "\n    return result\n})()";
        this.ded();
        return t;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNERBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQXVDLE9BQUEsQ0FBUSxTQUFSLENBQXZDLEVBQUUsaUJBQUYsRUFBUywrQkFBVCxFQUF1Qjs7QUFFakI7SUFFQyxrQkFBQyxJQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxPQUFEO1FBRUEsSUFBQyxDQUFBLE1BQUQsR0FBVTtRQVFWLElBQUMsQ0FBQSxLQUFELHlDQUFxQixDQUFFO1FBQ3ZCLElBQUMsQ0FBQSxPQUFELHlDQUFxQixDQUFFO0lBWHhCOzt1QkFhSCxPQUFBLEdBQVMsU0FBQyxJQUFEO0FBRUwsWUFBQTtRQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7WUFDUCxJQUFDLENBQUE7O1lBQUQsSUFBQyxDQUFBLFVBQVcsSUFBSTs7ZUFDaEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQWlCLElBQWpCO0lBSks7O3VCQU1ULE1BQUEsR0FBUSxTQUFDLEdBQUQ7QUFFSixZQUFBO1FBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxDQUFDLEdBQUcsQ0FBQyxJQUFMO1FBQ1osSUFBQyxDQUFBLE1BQUQsR0FBVTtRQUNWLENBQUEsR0FBSTtRQUVKLElBQUcsQ0FBSSxLQUFBLENBQU0sR0FBRyxDQUFDLElBQVYsQ0FBUDtZQUNJLEVBQUEsR0FBSzs7QUFBQztBQUFBO3FCQUFBLHNDQUFBOztpQ0FBQSxDQUFDLENBQUM7QUFBRjs7Z0JBQUQsQ0FBMEIsQ0FBQyxJQUEzQixDQUFnQyxJQUFoQztZQUNMLENBQUEsSUFBSyxJQUFDLENBQUEsTUFBRCxHQUFVLENBQUEsTUFBQSxHQUFPLEVBQVAsR0FBVSxN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SjtRQU9BLENBQUEsSUFBSztlQUNMO0lBWE07Ozs7OztBQWFiLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG5rc3RyICA9IHJlcXVpcmUgJ2tzdHInXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5cbnsgZW1wdHksIGZpcnN0TGluZUNvbCwgbGFzdExpbmVDb2wgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIFJlbmRlcmVyXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQGhlYWRlciA9IFwiXCJcIlxuICAgICAgICAgICAgY29uc3QgX2tfID0ge1xuICAgICAgICAgICAgICAgIGxpc3Q6ICAgZnVuY3Rpb24gKGwpICAge3JldHVybiAobCAhPSBudWxsID8gdHlwZW9mIGwubGVuZ3RoID09PSAnbnVtYmVyJyA/IGwgOiBbXSA6IFtdKX1cbiAgICAgICAgICAgICAgICBsZW5ndGg6IGZ1bmN0aW9uIChsKSAgIHtyZXR1cm4gKGwgIT0gbnVsbCA/IHR5cGVvZiBsLmxlbmd0aCA9PT0gJ251bWJlcicgPyBsLmxlbmd0aCA6IDAgOiAwKX0sXG4gICAgICAgICAgICAgICAgaW46ICAgICBmdW5jdGlvbiAoYSxsKSB7cmV0dXJuIChsICE9IG51bGwgPyB0eXBlb2YgbC5pbmRleE9mID09PSAnZnVuY3Rpb24nID8gbC5pbmRleE9mKGEpID49IDAgOiBmYWxzZSA6IGZhbHNlKX1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgICAgIEBkZWJ1ZyAgID0gQGtvZGUuYXJncz8uZGVidWdcbiAgICAgICAgQHZlcmJvc2UgPSBAa29kZS5hcmdzPy52ZXJib3NlXG5cbiAgICBjb21waWxlOiAoY29kZSkgLT4gXG4gICAgXG4gICAgICAgIEtvZGUgPSByZXF1aXJlICcuL2tvZGUnXG4gICAgICAgIEBzdWJLb2RlID89IG5ldyBLb2RlIFxuICAgICAgICBAc3ViS29kZS5jb21waWxlIGNvZGVcbiAgICAgICAgXG4gICAgcmVuZGVyOiAoYXN0KSAtPlxuXG4gICAgICAgIEB2YXJzdGFjayA9IFthc3QudmFyc11cbiAgICAgICAgQGluZGVudCA9ICcnXG4gICAgICAgIHMgPSAnJ1xuXG4gICAgICAgIGlmIG5vdCBlbXB0eSBhc3QudmFyc1xuICAgICAgICAgICAgdnMgPSAodi50ZXh0IGZvciB2IGluIGFzdC52YXJzKS5qb2luICcsICdcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIFwidmFyICN7dnN9XFxuXFxuXCJcblxuICAgICAgICBzICs9IEBub2RlcyBhc3QuZXhwcywgJ1xcbidcbiAgICAgICAgc1xuXG4gICAgbm9kZXM6IChub2Rlcywgc2VwPScsJykgLT5cblxuICAgICAgICBzbCA9IG5vZGVzLm1hcCAocykgPT4gQGF0b20gc1xuICAgICAgICBzcyA9IHNsLmpvaW4gc2VwXG5cbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcblxuICAgIG5vZGU6IChleHApIC0+XG5cbiAgICAgICAgcmV0dXJuICcnIGlmIG5vdCBleHBcblxuICAgICAgICBpZiBleHAudHlwZT8gYW5kIGV4cC50ZXh0PyB0aGVuIHJldHVybiBAdG9rZW4gZXhwXG5cbiAgICAgICAgaWYgZXhwIGluc3RhbmNlb2YgQXJyYXkgdGhlbiByZXR1cm4gKEBub2RlKGEpIGZvciBhIGluIGV4cCkuam9pbiAnO1xcbidcblxuICAgICAgICBzID0gJydcblxuICAgICAgICBmb3Igayx2IG9mIGV4cFxuXG4gICAgICAgICAgICBzKz0gc3dpdGNoIGtcbiAgICAgICAgICAgICAgICB3aGVuICdpZicgICAgICAgIHRoZW4gQGlmIHZcbiAgICAgICAgICAgICAgICB3aGVuICdmb3InICAgICAgIHRoZW4gQGZvciB2XG4gICAgICAgICAgICAgICAgd2hlbiAnd2hpbGUnICAgICB0aGVuIEB3aGlsZSB2XG4gICAgICAgICAgICAgICAgd2hlbiAncmV0dXJuJyAgICB0aGVuIEByZXR1cm4gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2NsYXNzJyAgICAgdGhlbiBAY2xhc3MgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3N3aXRjaCcgICAgdGhlbiBAc3dpdGNoIHZcbiAgICAgICAgICAgICAgICB3aGVuICd3aGVuJyAgICAgIHRoZW4gQHdoZW4gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2Fzc2VydCcgICAgdGhlbiBAYXNzZXJ0IHZcbiAgICAgICAgICAgICAgICB3aGVuICdxbXJrb3AnICAgIHRoZW4gQHFtcmtvcCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnc3RyaXBvbCcgICB0aGVuIEBzdHJpcG9sIHZcbiAgICAgICAgICAgICAgICB3aGVuICdxbXJrY29sb24nIHRoZW4gQHFtcmtjb2xvbiB2XG4gICAgICAgICAgICAgICAgd2hlbiAnb3BlcmF0aW9uJyB0aGVuIEBvcGVyYXRpb24gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2luY29uZCcgICAgdGhlbiBAaW5jb25kIHZcbiAgICAgICAgICAgICAgICB3aGVuICdwYXJlbnMnICAgIHRoZW4gQHBhcmVucyB2XG4gICAgICAgICAgICAgICAgd2hlbiAnb2JqZWN0JyAgICB0aGVuIEBvYmplY3QgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2tleXZhbCcgICAgdGhlbiBAa2V5dmFsIHZcbiAgICAgICAgICAgICAgICB3aGVuICdhcnJheScgICAgIHRoZW4gQGFycmF5IHZcbiAgICAgICAgICAgICAgICB3aGVuICdsY29tcCcgICAgIHRoZW4gQGxjb21wIHZcbiAgICAgICAgICAgICAgICB3aGVuICdpbmRleCcgICAgIHRoZW4gQGluZGV4IHZcbiAgICAgICAgICAgICAgICB3aGVuICdzbGljZScgICAgIHRoZW4gQHNsaWNlIHZcbiAgICAgICAgICAgICAgICB3aGVuICdwcm9wJyAgICAgIHRoZW4gQHByb3AgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2VhY2gnICAgICAgdGhlbiBAZWFjaCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnZnVuYycgICAgICB0aGVuIEBmdW5jIHZcbiAgICAgICAgICAgICAgICB3aGVuICdjYWxsJyAgICAgIHRoZW4gQGNhbGwgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3RyeScgICAgICAgdGhlbiBAdHJ5IHZcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGxvZyBSNChcInJlbmRlcmVyLm5vZGUgdW5oYW5kbGVkIGtleSAje2t9IGluIGV4cFwiKSwgZXhwICMgaWYgQGRlYnVnIG9yIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgICAgICcnXG4gICAgICAgIHNcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxuICAgIGF0b206IChleHApIC0+XG5cbiAgICAgICAgQGZpeEFzc2VydHMgQG5vZGUgZXhwXG5cbiAgICBhc3NlcnQ6IChwKSAtPlxuXG4gICAgICAgICfilr4nICsgQG5vZGUocC5vYmopICsgXCLilrgje3AucW1yay5saW5lfV8je3AucW1yay5jb2x94peCXCJcbiAgICAgICAgXG4gICAgcW1ya29wOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIHZuID0gXCJfI3twLnFtcmsubGluZX1fI3twLnFtcmsuY29sfV9cIlxuICAgICAgICBcIigoI3t2bn09I3tAYXRvbSBwLmxoc30pICE9IG51bGwgPyAje3ZufSA6ICN7QGF0b20gcC5yaHN9KVwiXG5cbiAgICBxbXJrY29sb246IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgXCIoI3tAYXRvbSBwLmxoc30gPyAje0BhdG9tIHAubWlkfSA6ICN7QGF0b20gcC5yaHN9KVwiXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAgMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAwMDAgICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwXG5cbiAgICBmaXhBc3NlcnRzOiAocykgLT5cblxuICAgICAgICBpZiBub3Qgcz9cbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiAnJyBpZiBub3Qgcz8gb3Igcy5sZW5ndGggPT0gMFxuXG4gICAgICAgIHdoaWxlIHNbMF0gPT0gJ+KWvicgdGhlbiBzID0gc1sxLi5dIFxuICAgICAgICBpZiAn4pa+JyBpbiBzXG4gICAgICAgICAgICBpID0gcy5pbmRleE9mICfilr4nXG4gICAgICAgICAgICByZXR1cm4gc1suLi5pXSArIEBmaXhBc3NlcnRzIHNbaSsxLi5dXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgJ1xcbicgaW4gc1xuICAgICAgICAgICAgaSA9IHMuaW5kZXhPZiAnXFxuJ1xuICAgICAgICAgICAgcmV0dXJuIEBmaXhBc3NlcnRzKHNbLi4uaV0pICsgc1tpLi5dXG4gICAgICAgIFxuICAgICAgICBzcGx0ID0gcy5zcGxpdCAv4pa4XFxkK19cXGQr4peCL1xuICAgICAgICBtdGNoID0gcy5tYXRjaCAv4pa4XFxkK19cXGQr4peCL2dcblxuICAgICAgICBpZiBzcGx0Lmxlbmd0aCA+IDFcblxuICAgICAgICAgICAgbXRjaCA9IG10Y2gubWFwIChtKSAtPiBcIl8je21bMS4uLTJdfV9cIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBzcGx0Wy0xXSA9PSAnJyAjIGFzc2VydCBlbmRzIHdpdGggP1xuICAgICAgICAgICAgICAgIGlmIHNwbHQubGVuZ3RoID4gMlxuICAgICAgICAgICAgICAgICAgICBzcGx0LnBvcCgpXG4gICAgICAgICAgICAgICAgICAgIG10Y2gucG9wKClcbiAgICAgICAgICAgICAgICAgICAgdCA9IHNwbHQuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICB3aGlsZSBzcGx0Lmxlbmd0aCAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB0ICs9ICfilrgnK210Y2guc2hpZnQoKVsxLi4uLTFdKyfil4InXG4gICAgICAgICAgICAgICAgICAgICAgICB0ICs9IHNwbHQuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICB0ID0gQGZpeEFzc2VydHMgdFxuICAgICAgICAgICAgICAgIGVsc2UgXG4gICAgICAgICAgICAgICAgICAgIHQgPSBzcGx0WzBdXG4gICAgICAgICAgICAgICAgcmV0dXJuICBcIigje3R9ICE9IG51bGwpXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgbG9nIHNwbHQsIG10Y2hcblxuICAgICAgICAgICAgcyA9ICcnXG5cbiAgICAgICAgICAgIGZvciBpIGluIDAuLi5tdGNoLmxlbmd0aFxuXG4gICAgICAgICAgICAgICAgaWYgbXRjaC5sZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgICAgIGwgPSBcIigje210Y2hbaV19PSN7KGlmIGkgdGhlbiBtdGNoW2ktMV0rc3BsdFtpXSBlbHNlIHNwbHRbMF0pfSlcIlxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbCA9IHNwbHRbMF1cblxuICAgICAgICAgICAgICAgIGlmIHNwbHRbaSsxXVswXSA9PSAnKCdcbiAgICAgICAgICAgICAgICAgICAgcyArPSBcInR5cGVvZiAje2x9ID09PSBcXFwiZnVuY3Rpb25cXFwiID8gXCJcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gXCIje2x9ICE9IG51bGwgPyBcIlxuXG4gICAgICAgICAgICBpZiBtdGNoLmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICBzICs9IG10Y2hbLTFdK3NwbHRbLTFdXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcyArPSBzcGx0WzBdK3NwbHRbMV1cblxuICAgICAgICAgICAgZm9yIGkgaW4gMC4uLm10Y2gubGVuZ3RoIHRoZW4gcyArPSBcIiA6IHVuZGVmaW5lZFwiXG5cbiAgICAgICAgICAgIHMgPSBcIigje3N9KVwiXG4gICAgICAgIHNcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuXG4gICAgY2xhc3M6IChuKSAtPlxuXG4gICAgICAgIHMgPSAnXFxuJ1xuICAgICAgICBzICs9IFwiY2xhc3MgI3tuLm5hbWUudGV4dH1cIlxuXG4gICAgICAgIGlmIG4uZXh0ZW5kc1xuICAgICAgICAgICAgcyArPSBcIiBleHRlbmRzIFwiICsgbi5leHRlbmRzLm1hcCgoZSkgLT4gZS50ZXh0KS5qb2luICcsICdcblxuICAgICAgICBzICs9ICdcXG57J1xuXG4gICAgICAgIG10aGRzID0gbi5ib2R5Py5vYmplY3Q/LmtleXZhbHMgPyBuLmJvZHk/WzBdPy5vYmplY3Q/LmtleXZhbHNcblxuICAgICAgICBpZiBtdGhkcz8ubGVuZ3RoXG4gICAgICAgICAgICBtdGhkcyA9IEBwcmVwYXJlTWV0aG9kcyBtdGhkc1xuICAgICAgICAgICAgQGluZGVudCA9ICcgICAgJ1xuICAgICAgICAgICAgZm9yIG1pIGluIDAuLi5tdGhkcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBzICs9ICdcXG4nIGlmIG1pXG4gICAgICAgICAgICAgICAgcyArPSBAbXRoZCBtdGhkc1ttaV1cbiAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIEBpbmRlbnQgPSAnJ1xuICAgICAgICBzICs9ICd9XFxuJ1xuICAgICAgICBzXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG5cbiAgICBwcmVwYXJlTWV0aG9kczogKG10aGRzKSAtPlxuXG4gICAgICAgIGJpbmQgPSBbXVxuICAgICAgICBmb3IgbSBpbiBtdGhkc1xuICAgICAgICAgICAgaWYgbm90IG0ua2V5dmFsXG4gICAgICAgICAgICAgICAgcHJpbnQuYXN0ICdub3QgYW4gbWV0aG9kPycgbVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBpZiBub3QgbS5rZXl2YWwudmFsLmZ1bmNcbiAgICAgICAgICAgICAgICBwcmludC5hc3QgJ25vIGZ1bmMgZm9yIG1ldGhvZD8nIG1cbiAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBuYW1lID0gbS5rZXl2YWwudmFsLmZ1bmMubmFtZS50ZXh0XG4gICAgICAgICAgICBpZiBuYW1lIGluIFsnQCcgJ2NvbnN0cnVjdG9yJ11cbiAgICAgICAgICAgICAgICBpZiBjb25zdHJ1Y3RvciB0aGVuIGVycm9yICdtb3JlIHRoYW4gb25lIGNvbnN0cnVjdG9yPydcbiAgICAgICAgICAgICAgICBtLmtleXZhbC52YWwuZnVuYy5uYW1lLnRleHQgPSAnY29uc3RydWN0b3InXG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3IgPSBtXG4gICAgICAgICAgICBlbHNlIGlmIG5hbWUuc3RhcnRzV2l0aCAnQCdcbiAgICAgICAgICAgICAgICBtLmtleXZhbC52YWwuZnVuYy5uYW1lLnRleHQgPSAnc3RhdGljICcgKyBuYW1lWzEuLl1cbiAgICAgICAgICAgIGVsc2UgaWYgbS5rZXl2YWwudmFsLmZ1bmM/LmFycm93LnRleHQgPT0gJz0+J1xuICAgICAgICAgICAgICAgIGJpbmQucHVzaCBtXG5cbiAgICAgICAgaWYgYmluZC5sZW5ndGggYW5kIG5vdCBjb25zdHJ1Y3RvciAjIGZvdW5kIHNvbWUgbWV0aG9kcyB0byBiaW5kLCBidXQgbm8gY29uc3RydWN0b3JcbiAgICAgICAgICAgIGFzdCA9IEBrb2RlLmFzdCBcImNvbnN0cnVjdG9yOiAtPlwiICMgY3JlYXRlIG9uZSBmcm9tIHNjcmF0Y2hcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yID0gYXN0LmV4cHNbMF0ub2JqZWN0LmtleXZhbHNbMF1cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmtleXZhbC52YWwuZnVuYy5uYW1lID0gdHlwZTonbmFtZScgdGV4dDonY29uc3RydWN0b3InXG4gICAgICAgICAgICBtdGhkcy51bnNoaWZ0IGNvbnN0cnVjdG9yXG5cbiAgICAgICAgaWYgYmluZC5sZW5ndGhcbiAgICAgICAgICAgIGZvciBiIGluIGJpbmRcbiAgICAgICAgICAgICAgICBibiA9IGIua2V5dmFsLnZhbC5mdW5jLm5hbWUudGV4dFxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLmtleXZhbC52YWwuZnVuYy5ib2R5LmV4cHMgPz0gW11cbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5rZXl2YWwudmFsLmZ1bmMuYm9keS5leHBzLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NvZGUnXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwidGhpcy4je2JufSA9IHRoaXMuI3tibn0uYmluZCh0aGlzKVwiXG4gICAgICAgIG10aGRzXG5cbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIG10aGQ6IChuKSAtPlxuXG4gICAgICAgIGlmIG4ua2V5dmFsXG4gICAgICAgICAgICBzICA9ICdcXG4nXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAZnVuYyBuLmtleXZhbC52YWwuZnVuY1xuICAgICAgICBzXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcblxuICAgIGZ1bmM6IChuKSAtPlxuXG4gICAgICAgIHJldHVybiAnJyBpZiBub3QgblxuXG4gICAgICAgIGdpID0gQGluZCgpXG5cbiAgICAgICAgcyA9IG4ubmFtZT8udGV4dCA/ICdmdW5jdGlvbidcbiAgICAgICAgcyArPSAnICgnXG5cbiAgICAgICAgYXJncyA9IG4uYXJncz8ucGFyZW5zPy5leHBzXG4gICAgICAgIGlmIGFyZ3NcbiAgICAgICAgICAgIFtzdHIsIHRoc10gPSBAYXJncyBhcmdzXG4gICAgICAgICAgICBzICs9IHN0clxuXG4gICAgICAgIHMgKz0gJylcXG4nXG4gICAgICAgIHMgKz0gZ2kgKyAneydcblxuICAgICAgICBAdmFyc3RhY2sucHVzaCBuLmJvZHkudmFyc1xuXG4gICAgICAgIGlmIG5vdCBlbXB0eSBuLmJvZHkudmFyc1xuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgdnMgPSAodi50ZXh0IGZvciB2IGluIG4uYm9keS52YXJzKS5qb2luICcsICdcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIFwidmFyICN7dnN9XFxuXCJcblxuICAgICAgICBmb3IgdCBpbiB0aHMgPyBbXVxuICAgICAgICAgICAgcyArPSAnXFxuJyArIEBpbmRlbnQgKyB0aHNcblxuICAgICAgICBpZiBub3QgZW1wdHkgbi5ib2R5LmV4cHNcblxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgc3MgPSBuLmJvZHkuZXhwcy5tYXAgKHMpID0+IEBub2RlIHNcbiAgICAgICAgICAgIHNzID0gc3MubWFwIChzKSA9PiBAaW5kZW50ICsgc1xuICAgICAgICAgICAgcyArPSBzcy5qb2luICdcXG4nXG4gICAgICAgICAgICBzICs9ICdcXG4nICsgZ2lcblxuICAgICAgICBzICs9ICd9J1xuXG4gICAgICAgIEB2YXJzdGFjay5wb3AoKVxuXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgIDAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbiAgICBhcmdzOiAoYXJncykgLT5cblxuICAgICAgICB0aHMgID0gW11cbiAgICAgICAgdXNlZCA9IHt9XG5cbiAgICAgICAgZm9yIGEgaW4gYXJnc1xuICAgICAgICAgICAgaWYgYS50ZXh0IHRoZW4gdXNlZFthLnRleHRdID0gYS50ZXh0XG5cbiAgICAgICAgYXJncyA9IGFyZ3MubWFwIChhKSAtPlxuICAgICAgICAgICAgaWYgYS5wcm9wIGFuZCBhLnByb3Aub2JqLnR5cGUgPT0gJ3RoaXMnXG4gICAgICAgICAgICAgICAgdGhpc1ZhciA9IGEucHJvcC5wcm9wXG4gICAgICAgICAgICAgICAgaWYgdXNlZFt0aGlzVmFyLnRleHRdXG4gICAgICAgICAgICAgICAgICAgIGZvciBpIGluIFsxLi4xMDBdXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBub3QgdXNlZFt0aGlzVmFyLnRleHQraV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHMucHVzaCBcInRoaXMuI3t0aGlzVmFyLnRleHR9ID0gI3t0aGlzVmFyLnRleHQraX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNWYXIudGV4dCA9IHRoaXNWYXIudGV4dCtpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlZFt0aGlzVmFyLnRleHRdID0gdGhpc1Zhci50ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRocy5wdXNoIFwidGhpcy4je3RoaXNWYXIudGV4dH0gPSAje3RoaXNWYXIudGV4dH1cIlxuXG4gICAgICAgICAgICAgICAgdGhpc1ZhclxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGFcblxuICAgICAgICBzdHIgPSBhcmdzLm1hcCgoYSkgPT4gQG5vZGUgYSkuam9pbiAnLCAnXG5cbiAgICAgICAgW3N0cix0aHNdXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG5cbiAgICByZXR1cm46IChuKSAtPlxuXG4gICAgICAgIHMgPSAncmV0dXJuJ1xuICAgICAgICBzICs9ICcgJyArIEBub2RlIG4udmFsXG4gICAgICAgIGtzdHIuc3RyaXAgc1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDBcblxuICAgIGNhbGw6IChwKSAtPlxuICAgICAgICBpZiBwLmNhbGxlZS50ZXh0IGluIFsnbG9nJyd3YXJuJydlcnJvciddXG4gICAgICAgICAgICBwLmNhbGxlZS50ZXh0ID0gXCJjb25zb2xlLiN7cC5jYWxsZWUudGV4dH1cIlxuICAgICAgICBjYWxsZWUgPSBAbm9kZSBwLmNhbGxlZVxuICAgICAgICBpZiBjYWxsZWUgPT0gJ25ldydcbiAgICAgICAgICAgIFwiI3tjYWxsZWV9ICN7QG5vZGVzIHAuYXJncywgJywnfVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFwiI3tjYWxsZWV9KCN7QG5vZGVzIHAuYXJncywgJywnfSlcIlxuXG4gICAgIyAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMFxuXG4gICAgaWY6IChuKSAtPlxuXG4gICAgICAgIGZpcnN0ID0gZmlyc3RMaW5lQ29sIG5cbiAgICAgICAgbGFzdCAgPSBsYXN0TGluZUNvbCBuXG5cbiAgICAgICAgaWYgZmlyc3QubGluZSA9PSBsYXN0LmxpbmUgYW5kIG4uZWxzZSBhbmQgbm90IG4ucmV0dXJuc1xuICAgICAgICAgICAgcmV0dXJuIEBpZklubGluZSBuXG5cbiAgICAgICAgZ2kgPSBAaW5kKClcblxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcImlmICgje0BhdG9tKG4uY29uZCl9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuID8gW11cbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIGZvciBlbGlmIGluIG4uZWxpZnMgPyBbXVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaSArIFwiZWxzZSBpZiAoI3tAYXRvbShlbGlmLmVsaWYuY29uZCl9KVxcblwiXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBmb3IgZSBpbiBlbGlmLmVsaWYudGhlbiA/IFtdXG4gICAgICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIGlmIG4uZWxzZVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaSArICdlbHNlXFxuJ1xuICAgICAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICAgICAgZm9yIGUgaW4gbi5lbHNlID8gW11cbiAgICAgICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG5cbiAgICAjIDAwMCAgMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG5cbiAgICBpZklubGluZTogKG4pIC0+XG5cbiAgICAgICAgcyA9ICcnXG5cbiAgICAgICAgcyArPSBcIiN7QGF0b20obi5jb25kKX0gPyBcIlxuICAgICAgICBpZiBuLnRoZW4/Lmxlbmd0aFxuICAgICAgICAgICAgcyArPSAoQGF0b20oZSkgZm9yIGUgaW4gbi50aGVuKS5qb2luICcsICdcblxuICAgICAgICBpZiBuLmVsaWZzXG4gICAgICAgICAgICBmb3IgZSBpbiBuLmVsaWZzXG4gICAgICAgICAgICAgICAgcyArPSAnIDogJ1xuICAgICAgICAgICAgICAgIHMgKz0gQGlmSW5saW5lIGUuZWxpZlxuXG4gICAgICAgIGlmIG4uZWxzZVxuICAgICAgICAgICAgcyArPSAnIDogJ1xuICAgICAgICAgICAgaWYgbi5lbHNlLmxlbmd0aCA9PSAxXG4gICAgICAgICAgICAgICAgcyArPSBAYXRvbSBuLmVsc2VbMF1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzICs9ICcoJyArIChAYXRvbSBlIGZvciBlIGluIG4uZWxzZSkuam9pbignLCAnKSArICcpJ1xuICAgICAgICBzXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgZWFjaDogKG4pIC0+XG4gICAgICAgIFxuICAgICAgICBudW1BcmdzID0gbi5mbmMuZnVuYy5hcmdzPy5wYXJlbnMuZXhwcy5sZW5ndGhcbiAgICAgICAgXG4gICAgICAgIGlmIG51bUFyZ3MgPT0gMVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAoZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgICAgICByID0gbyBpbnN0YW5jZW9mIEFycmF5ID8gW10gOiB0eXBlb2YgbyA9PSAnc3RyaW5nJyA/IG8uc3BsaXQoJycpIDoge31cbiAgICAgICAgICAgICAgICBmb3IgKGsgaW4gbylcbiAgICAgICAgICAgICAgICB7ICAgXG4gICAgICAgICAgICAgICAgICAgIHZhciBtID0gKCN7QG5vZGUgbi5mbmN9KShvW2tdKVxuICAgICAgICAgICAgICAgICAgICBpZiAobSAhPSBudWxsKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByW2tdID0gbVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBvIGluc3RhbmNlb2YgQXJyYXkgPyByLmZpbHRlcigoZikgPT4geyByZXR1cm4gZiAhPT0gdW5kZWZpbmVkIH0pIDogdHlwZW9mIG8gPT0gJ3N0cmluZycgPyByLmpvaW4oJycpIDogclxuICAgICAgICAgICAgfSkoI3tAbm9kZSBuLmxoc30pXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZWxzZSBpZiBudW1BcmdzXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIChmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgICAgIHIgPSBvIGluc3RhbmNlb2YgQXJyYXkgPyBbXSA6IHR5cGVvZiBvID09ICdzdHJpbmcnID8gby5zcGxpdCgnJykgOiB7fVxuICAgICAgICAgICAgICAgIGZvciAoayBpbiBvKVxuICAgICAgICAgICAgICAgIHsgICBcbiAgICAgICAgICAgICAgICAgICAgdmFyIG0gPSAoI3tAbm9kZSBuLmZuY30pKGssIG9ba10pXG4gICAgICAgICAgICAgICAgICAgIGlmIChtICE9IG51bGwgJiYgbVswXSAhPSBudWxsKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByW21bMF1dID0gbVsxXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBvIGluc3RhbmNlb2YgQXJyYXkgPyByLmZpbHRlcigoZikgPT4geyByZXR1cm4gZiAhPT0gdW5kZWZpbmVkIH0pIDogdHlwZW9mIG8gPT0gJ3N0cmluZycgPyByLmpvaW4oJycpIDogclxuICAgICAgICAgICAgfSkoI3tAbm9kZSBuLmxoc30pXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZWxzZSAjIG5vIGFyZ3NcbiAgICAgICAgICAgIGlmIG4uZm5jLmZ1bmMuYm9keS5leHBzPy5sZW5ndGggPiAwICMgc29tZSBmdW5jIGJ1dCBubyBhcmdzXG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgICAgKGZ1bmN0aW9uIChvKSB7XG4gICAgICAgICAgICAgICAgICAgIHIgPSBvIGluc3RhbmNlb2YgQXJyYXkgPyBbXSA6IHR5cGVvZiBvID09ICdzdHJpbmcnID8gby5zcGxpdCgnJykgOiB7fVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGsgaW4gbylcbiAgICAgICAgICAgICAgICAgICAgeyAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG0gPSAoI3tAbm9kZSBuLmZuY30pKG9ba10pXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobSAhPSBudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJba10gPSBtXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG8gaW5zdGFuY2VvZiBBcnJheSA/IHIuZmlsdGVyKChmKSA9PiB7IHJldHVybiBmICE9PSB1bmRlZmluZWQgfSkgOiB0eXBlb2YgbyA9PSAnc3RyaW5nJyA/IHIuam9pbignJykgOiByXG4gICAgICAgICAgICAgICAgfSkoI3tAbm9kZSBuLmxoc30pXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgZWxzZSAjIG5vIGFyZ3MgYW5kIGVtcHR5IGZ1bmNcbiAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKG8pIHsgcmV0dXJuIG8gaW5zdGFuY2VvZiBBcnJheSA/IFtdIDogdHlwZW9mIG8gPT0gJ3N0cmluZycgPyAnJyA6IHt9IH0pKCN7QG5vZGUgbi5saHN9KVxuICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBmb3I6IChuKSAtPlxuXG4gICAgICAgIGlmIG5vdCBuLnRoZW4gdGhlbiBlcnJvciAnZm9yIGV4cGVjdGVkIHRoZW4nIG5cblxuICAgICAgICBzd2l0Y2ggbi5pbm9mLnRleHRcbiAgICAgICAgICAgIHdoZW4gJ2luJyB0aGVuIEBmb3JfaW4gblxuICAgICAgICAgICAgd2hlbiAnb2YnIHRoZW4gQGZvcl9vZiBuXG4gICAgICAgICAgICBlbHNlIGVycm9yICdmb3IgZXhwZWN0ZWQgaW4vb2YnXG5cbiAgICBmb3JfaW46IChuLCB2YXJQcmVmaXg9JycsIGxhc3RQcmVmaXg9JycsIGxhc3RQb3N0Zml4KSAtPlxuXG4gICAgICAgIGdpID0gQGluZCgpXG5cbiAgICAgICAgbGlzdCA9IEBub2RlIG4ubGlzdFxuXG4gICAgICAgIGlmIG5vdCBsaXN0IG9yIGxpc3QgPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgIHByaW50Lm5vb24gJ25vIGxpc3QgZm9yJyBuLmxpc3RcbiAgICAgICAgICAgIHByaW50LmFzdCAnbm8gbGlzdCBmb3InIG4ubGlzdFxuXG4gICAgICAgIGxpc3RWYXIgPSBAZnJlc2hWYXIgJ2xpc3QnXG4gICAgICAgICMgaXRlclZhciA9IEBmcmVzaFZhciAnaSdcbiAgICAgICAgaXRlclZhciA9IFwiXyN7bi5pbm9mLmxpbmV9XyN7bi5pbm9mLmNvbH1fXCJcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJ2YXIgI3tsaXN0VmFyfSA9ICN7bGlzdH1cXG5cIlxuICAgICAgICBpZiBuLnZhbHMudGV4dFxuICAgICAgICAgICAgcyArPSBnaStcImZvciAodmFyICN7aXRlclZhcn0gPSAwOyAje2l0ZXJWYXJ9IDwgI3tsaXN0VmFyfS5sZW5ndGg7ICN7aXRlclZhcn0rKylcXG5cIlxuICAgICAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICAgICAgcyArPSBAaW5kZW50K1wiI3tuLnZhbHMudGV4dH0gPSAje2xpc3RWYXJ9WyN7aXRlclZhcn1dXFxuXCJcbiAgICAgICAgZWxzZSBpZiBuLnZhbHMuYXJyYXk/Lml0ZW1zXG4gICAgICAgICAgICBzICs9IGdpK1wiZm9yICh2YXIgI3tpdGVyVmFyfSA9IDA7ICN7aXRlclZhcn0gPCAje2xpc3RWYXJ9Lmxlbmd0aDsgI3tpdGVyVmFyfSsrKVxcblwiXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBmb3IgaiBpbiAwLi4ubi52YWxzLmFycmF5Lml0ZW1zLmxlbmd0aFxuICAgICAgICAgICAgICAgIHYgPSBuLnZhbHMuYXJyYXkuaXRlbXNbal1cbiAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQrXCIje3YudGV4dH0gPSAje2xpc3RWYXJ9WyN7aXRlclZhcn1dWyN7an1dXFxuXCJcbiAgICAgICAgZWxzZSBpZiBuLnZhbHMubGVuZ3RoID4gMVxuICAgICAgICAgICAgbHYgPSBuLnZhbHNbMV0udGV4dFxuICAgICAgICAgICAgcyArPSBnaStcImZvciAoI3tsdn0gPSAwOyAje2x2fSA8ICN7bGlzdFZhcn0ubGVuZ3RoOyAje2x2fSsrKVxcblwiXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQrXCIje3ZhclByZWZpeH0je24udmFsc1swXS50ZXh0fSA9ICN7bGlzdFZhcn1baV1cXG5cIlxuXG4gICAgICAgIGZvciBlIGluIG4udGhlbiA/IFtdXG4gICAgICAgICAgICBwcmVmaXggPSBpZiBsYXN0UHJlZml4IGFuZCBlID09IG4udGhlblstMV0gdGhlbiBsYXN0UHJlZml4IGVsc2UgJydcbiAgICAgICAgICAgIHBvc3RmaXggPSBpZiBsYXN0UG9zdGZpeCBhbmQgZSA9PSBuLnRoZW5bLTFdIHRoZW4gbGFzdFBvc3RmaXggZWxzZSAnJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgcHJlZml4K0Bub2RlKGUpK3Bvc3RmaXggKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgIGZvcl9vZjogKG4sIHZhclByZWZpeD0nJywgbGFzdFByZWZpeD0nJywgbGFzdFBvc3RmaXgpIC0+XG5cbiAgICAgICAgZ2kgPSBAaW5kKClcblxuICAgICAgICBrZXkgPSBuLnZhbHMudGV4dCA/IG4udmFsc1swXT8udGV4dFxuICAgICAgICB2YWwgPSBuLnZhbHNbMV0/LnRleHRcblxuICAgICAgICBvYmogPSBAbm9kZSBuLmxpc3RcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJmb3IgKCN7a2V5fSBpbiAje29ian0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBpZiB2YWxcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCtcIiN7dmFyUHJlZml4fSN7dmFsfSA9ICN7b2JqfVsje2tleX1dXFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuID8gW11cbiAgICAgICAgICAgIHByZWZpeCA9IGlmIGxhc3RQcmVmaXggYW5kIGUgPT0gbi50aGVuWy0xXSB0aGVuIGxhc3RQcmVmaXggZWxzZSAnJ1xuICAgICAgICAgICAgcG9zdGZpeCA9IGlmIGxhc3RQb3N0Zml4IGFuZCBlID09IG4udGhlblstMV0gdGhlbiBsYXN0UG9zdGZpeCBlbHNlICcnXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBwcmVmaXgrQG5vZGUoZSkrcG9zdGZpeCArICdcXG4nXG4gICAgICAgICAgICBcbiAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG4gICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGxjb21wOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIGNvbXAgPSAoZikgPT5cbiAgICAgICAgICAgIHN3aXRjaCBmLmlub2YudGV4dFxuICAgICAgICAgICAgICAgIHdoZW4gJ2luJyB0aGVuIEBmb3JfaW4gZiwgJ3ZhciAnICdyZXN1bHQucHVzaCgnICcpJ1xuICAgICAgICAgICAgICAgIHdoZW4gJ29mJyB0aGVuIEBmb3Jfb2YgZiwgJ3ZhciAnICdyZXN1bHQucHVzaCgnICcpJ1xuXG4gICAgICAgIEBpbmQoKVxuICAgICAgICB0ID0gXCJcIlwiXG4gICAgICAgICAgICAoZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gW11cbiAgICAgICAgICAgICAgICAje2NvbXAgbi5mb3J9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICAgICAgfSkoKVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIEBkZWQoKVxuICAgICAgICB0XG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcblxuICAgIHdoaWxlOiAobikgLT5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwid2hpbGUgKCN7QG5vZGUgbi5jb25kfSlcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIGZvciBlIGluIG4udGhlbiA/IFtdXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcblxuICAgICAgICBAZGVkKClcbiAgICAgICAgc1xuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIHN3aXRjaDogKG4pIC0+XG5cbiAgICAgICAgaWYgbm90IG4ubWF0Y2ggdGhlbiBlcnJvciAnc3dpdGNoIGV4cGVjdGVkIG1hdGNoJyBuXG4gICAgICAgIGlmIG5vdCBuLndoZW5zIHRoZW4gZXJyb3IgJ3N3aXRjaCBleHBlY3RlZCB3aGVucycgblxuXG4gICAgICAgIGdpID0gQGluZCgpXG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJzd2l0Y2ggKCN7QG5vZGUgbi5tYXRjaH0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLndoZW5zID8gW11cbiAgICAgICAgICAgIHMgKz0gZ2krIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgaWYgbi5lbHNlXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQrJ2RlZmF1bHQ6XFxuJ1xuICAgICAgICAgICAgZm9yIGUgaW4gbi5lbHNlXG4gICAgICAgICAgICAgICAgcyArPSBAaW5kZW50KycgICAgJysgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVxcblwiXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICB3aGVuOiAobikgLT5cblxuICAgICAgICBpZiBub3Qgbi52YWxzIHRoZW4gcmV0dXJuIGVycm9yICd3aGVuIGV4cGVjdGVkIHZhbHMnIG5cblxuICAgICAgICBzID0gJydcbiAgICAgICAgZm9yIGUgaW4gbi52YWxzXG4gICAgICAgICAgICBzICs9ICcgICAgY2FzZSAnICsgQG5vZGUoZSkgKyAnOlxcbidcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuID8gW11cbiAgICAgICAgICAgIGdpID0gQGluZCgpXG4gICAgICAgICAgICBzICs9IGdpICsgJyAgICAnICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICAgICAgQGRlZCgpXG4gICAgICAgIHMgKz0gQGluZGVudCArICcgICAgJyArICdicmVhaydcbiAgICAgICAgc1xuXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgICAgMDAwMDAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHRyeTogKG4pIC0+XG4gICAgICAgIFxuICAgICAgICBzID0gJydcbiAgICAgICAgZ2kgPSBAaW5kKClcbiAgICAgICAgcyArPSAndHJ5XFxuJ1xuICAgICAgICBzICs9IGdpKyd7XFxuJ1xuICAgICAgICBzICs9IEBpbmRlbnQrQG5vZGVzIG4uZXhwcywgJ1xcbicrQGluZGVudFxuICAgICAgICBzICs9IGdpKydcXG4nXG4gICAgICAgIHMgKz0gZ2krJ31cXG4nXG4gICAgICAgIGlmIG4uY2F0Y2ggPyBbXVxuICAgICAgICAgICAgcyArPSBnaStcImNhdGNoICgje0Bub2RlIG4uY2F0Y2guZXJycn0pXFxuXCIgXG4gICAgICAgICAgICBzICs9IGdpKyd7XFxuJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50K0Bub2RlcyBuLmNhdGNoLmV4cHMsICdcXG4nK0BpbmRlbnRcbiAgICAgICAgICAgIHMgKz0gZ2krJ1xcbidcbiAgICAgICAgICAgIHMgKz0gZ2krJ31cXG4nXG4gICAgICAgIGlmIG4uZmluYWxseVxuICAgICAgICAgICAgcyArPSBnaSsnZmluYWxseVxcbidcbiAgICAgICAgICAgIHMgKz0gZ2krJ3tcXG4nXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQrQG5vZGVzIG4uZmluYWxseSwgJ1xcbicrQGluZGVudFxuICAgICAgICAgICAgcyArPSBnaSsnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaSsnfVxcbidcbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwMCAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwXG4gICAgIyAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICB0b2tlbjogKHRvaykgLT5cblxuICAgICAgICBpZiB0b2sudHlwZSA9PSAnY29tbWVudCdcbiAgICAgICAgICAgIEBjb21tZW50IHRva1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICd0aGlzJ1xuICAgICAgICAgICAgJ3RoaXMnXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ3RyaXBsZSdcbiAgICAgICAgICAgICdgJyArIHRvay50ZXh0WzMuLi00XSArICdgJ1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgPT0gJ3llcydcbiAgICAgICAgICAgICd0cnVlJ1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgPT0gJ25vJ1xuICAgICAgICAgICAgJ2ZhbHNlJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0b2sudGV4dFxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbiAgICBjb21tZW50OiAodG9rKSAtPlxuXG4gICAgICAgIGlmIHRvay50ZXh0LnN0YXJ0c1dpdGggJyMjIydcbiAgICAgICAgICAgICcvKicgKyB0b2sudGV4dFszLi4tNF0gKyAnKi8nICsgJ1xcbidcbiAgICAgICAgZWxzZSBpZiB0b2sudGV4dC5zdGFydHNXaXRoICcjJ1xuICAgICAgICAgICAga3N0ci5wYWQoJycsIHRvay5jb2wpICsgJy8vJyArIHRvay50ZXh0WzEuLi0xXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlcnJvciBcIiMgY29tbWVudCB0b2tlbiBleHBlY3RlZFwiXG4gICAgICAgICAgICAnJ1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgb3BlcmF0aW9uOiAob3ApIC0+XG5cbiAgICAgICAgb3BtYXAgPSAobykgLT5cbiAgICAgICAgICAgIG9tcCA9XG4gICAgICAgICAgICAgICAgYW5kOiAgICAnJiYnXG4gICAgICAgICAgICAgICAgb3I6ICAgICAnfHwnXG4gICAgICAgICAgICAgICAgbm90OiAgICAnISdcbiAgICAgICAgICAgICAgICAnPT0nOiAgICc9PT0nXG4gICAgICAgICAgICAgICAgJyE9JzogICAnIT09J1xuICAgICAgICAgICAgb21wW29dID8gb1xuXG4gICAgICAgIG8gICA9IG9wbWFwIG9wLm9wZXJhdG9yLnRleHRcbiAgICAgICAgc2VwID0gJyAnXG4gICAgICAgIHNlcCA9ICcnIGlmIG5vdCBvcC5saHMgb3Igbm90IG9wLnJoc1xuXG4gICAgICAgIGlmIG8gaW4gWyc8Jyc8PScnPT09JychPT0nJz49Jyc+J11cbiAgICAgICAgICAgIHJvID0gb3BtYXAgb3AucmhzPy5vcGVyYXRpb24/Lm9wZXJhdG9yLnRleHRcbiAgICAgICAgICAgIGlmIHJvIGluIFsnPCcnPD0nJz09PScnIT09Jyc+PScnPiddXG4gICAgICAgICAgICAgICAgcmV0dXJuICcoJyArIEBhdG9tKG9wLmxocykgKyBzZXAgKyBvICsgc2VwICsgQGF0b20ob3AucmhzLm9wZXJhdGlvbi5saHMpICsgJyAmJiAnICsga3N0ci5sc3RyaXAoQGF0b20ob3AucmhzKSkgKyAnKSdcblxuICAgICAgICBvcGVuID0gY2xvc2UgPSAnJ1xuICAgICAgICBpZiBvICE9ICc9JyBhbmQgb3AucmhzPy5vcGVyYXRpb24/Lm9wZXJhdG9yLnRleHQgPT0gJz0nXG4gICAgICAgICAgICBvcGVuID0gJygnXG4gICAgICAgICAgICBjbG9zZSA9ICcpJ1xuXG4gICAgICAgIGZpcnN0ID0gZmlyc3RMaW5lQ29sIG9wLmxoc1xuICAgICAgICBwcmZ4ID0gaWYgZmlyc3QuY29sID09IDAgYW5kIG9wLnJocz8uZnVuYyB0aGVuICdcXG4nIGVsc2UgJydcbiAgICAgICAgICAgIFxuICAgICAgICBwcmZ4ICsgQGF0b20ob3AubGhzKSArIHNlcCArIG8gKyBzZXAgKyBvcGVuICsga3N0ci5sc3RyaXAgQGF0b20ob3AucmhzKSArIGNsb3NlXG5cbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGluY29uZDogKHApIC0+XG5cbiAgICAgICAgXCIje0Bub2RlIHAucmhzfS5pbmRleE9mKCN7QGF0b20gcC5saHN9KSA+PSAwXCJcblxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIHBhcmVuczogKHApIC0+IFwiKCN7QG5vZGVzIHAuZXhwc30pXCJcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwXG5cbiAgICBvYmplY3Q6IChwKSAtPiBcbiAgICAgICAgbm9kZXMgPSBwLmtleXZhbHMubWFwIChzKSA9PiBAYXRvbSBzXG4gICAgICAgIG5vZGVzID0gbm9kZXMubWFwIChuKSAtPiBpZiAnOicgaW4gbiB0aGVuIG4gZWxzZSBcIiN7bn06I3tufVwiICAgICAgICBcbiAgICAgICAgXCJ7I3tub2Rlcy5qb2luICcsJ319XCJcblxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBrZXl2YWw6IChwKSAtPlxuICAgICAgICBrZXkgPSBAbm9kZSBwLmtleVxuICAgICAgICBpZiBrZXlbMF0gbm90IGluIFwiJ1xcXCJcIiBhbmQgL1tcXC5cXCxcXDtcXCpcXCtcXC1cXC9cXD1cXHxdLy50ZXN0IGtleSB0aGVuIGtleSA9IFwiJyN7a2V5fSdcIlxuICAgICAgICBcIiN7a2V5fToje0BhdG9tKHAudmFsKX1cIlxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcblxuICAgIHByb3A6ICAgKHApIC0+XG5cbiAgICAgICAgXCIje0Bub2RlKHAub2JqKX0uI3tAbm9kZSBwLnByb3B9XCJcblxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBpbmRleDogIChwKSAtPlxuXG4gICAgICAgIGlmIHNsaWNlID0gcC5zbGlkeC5zbGljZVxuXG4gICAgICAgICAgICBmcm9tID0gaWYgc2xpY2UuZnJvbT8gdGhlbiBAbm9kZSBzbGljZS5mcm9tIGVsc2UgJzAnXG5cbiAgICAgICAgICAgIGFkZE9uZSA9IHNsaWNlLmRvdHMudGV4dCA9PSAnLi4nXG5cbiAgICAgICAgICAgIGlmIHNsaWNlLnVwdG8/IHRoZW4gdXB0byA9IEBub2RlIHNsaWNlLnVwdG9cblxuICAgICAgICAgICAgaWYgc2xpY2UudXB0bz8udHlwZSA9PSAnbnVtJyBvciBzbGljZS51cHRvPy5vcGVyYXRpb25cbiAgICAgICAgICAgICAgICB1ID0gcGFyc2VJbnQgdXB0b1xuICAgICAgICAgICAgICAgIGlmIE51bWJlci5pc0Zpbml0ZSB1XG4gICAgICAgICAgICAgICAgICAgIGlmIHUgPT0gLTEgYW5kIGFkZE9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgdXBwZXIgPSAnJ1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB1ICs9IDEgaWYgYWRkT25lXG4gICAgICAgICAgICAgICAgICAgICAgICB1cHBlciA9IFwiLCAje3V9XCJcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHVwcGVyID0gXCIsICN7dXB0b31cIlxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIGFkZE9uZSB0aGVuIGlmIHVwdG8gdGhlbiB1cHBlciA9IFwiLCB0eXBlb2YgI3t1cHRvfSA9PT0gJ251bWJlcicgJiYgI3t1cHRvfSsxIHx8IEluZmluaXR5XCJcbiAgICAgICAgICAgICAgICBlbHNlICAgICAgICAgICAgICAgICAgICAgICAgdXBwZXIgPSBcIiwgdHlwZW9mICN7dXB0b30gPT09ICdudW1iZXInICYmICN7dXB0b30gfHwgLTFcIlxuXG4gICAgICAgICAgICBcIiN7QG5vZGUocC5pZHhlZSl9LnNsaWNlKCN7ZnJvbX0je3VwcGVyID8gJyd9KVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHAuc2xpZHgudGV4dD9bMF0gPT0gJy0nXG4gICAgICAgICAgICAgICAgbmkgPSBwYXJzZUludCBwLnNsaWR4LnRleHRcbiAgICAgICAgICAgICAgICBpZiBuaSA9PSAtMVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCIje0BhdG9tKHAuaWR4ZWUpfS5zbGljZSgje25pfSlbMF1cIlxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiI3tAYXRvbShwLmlkeGVlKX0uc2xpY2UoI3tuaX0sI3tuaSsxfSlbMF1cIlxuXG4gICAgICAgICAgICBcIiN7QGF0b20ocC5pZHhlZSl9WyN7QG5vZGUgcC5zbGlkeH1dXCJcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbiAgICBhcnJheTogKHApIC0+XG5cbiAgICAgICAgaWYgcC5pdGVtc1swXT8uc2xpY2VcbiAgICAgICAgICAgIEBzbGljZSBwLml0ZW1zWzBdLnNsaWNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFwiWyN7QG5vZGVzIHAuaXRlbXMsICcsJ31dXCJcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwXG5cbiAgICBzbGljZTogKHApIC0+XG5cbiAgICAgICAgaWYgcC5mcm9tLnR5cGUgPT0gJ251bScgPT0gcC51cHRvLnR5cGVcbiAgICAgICAgICAgIGZyb20gPSBwYXJzZUludCBwLmZyb20udGV4dFxuICAgICAgICAgICAgdXB0byA9IHBhcnNlSW50IHAudXB0by50ZXh0XG4gICAgICAgICAgICBpZiB1cHRvLWZyb20gPD0gMTBcbiAgICAgICAgICAgICAgICBpZiBwLmRvdHMudGV4dCA9PSAnLi4uJyB0aGVuIHVwdG8tLVxuICAgICAgICAgICAgICAgICdbJysoKHggZm9yIHggaW4gW2Zyb20uLnVwdG9dKS5qb2luICcsJykrJ10nXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbyA9IGlmIHAuZG90cy50ZXh0ID09ICcuLi4nIHRoZW4gJzwnIGVsc2UgJzw9J1xuICAgICAgICAgICAgICAgIFwiKGZ1bmN0aW9uKCkgeyB2YXIgciA9IFtdOyBmb3IgKHZhciBpID0gI3tmcm9tfTsgaSAje299ICN7dXB0b307IGkrKyl7IHIucHVzaChpKTsgfSByZXR1cm4gcjsgfSkuYXBwbHkodGhpcylcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvID0gaWYgcC5kb3RzLnRleHQgPT0gJy4uLicgdGhlbiAnPCcgZWxzZSAnPD0nXG4gICAgICAgICAgICBcIihmdW5jdGlvbigpIHsgdmFyIHIgPSBbXTsgZm9yICh2YXIgaSA9ICN7QG5vZGUgcC5mcm9tfTsgaSAje299ICN7QG5vZGUgcC51cHRvfTsgaSsrKXsgci5wdXNoKGkpOyB9IHJldHVybiByOyB9KS5hcHBseSh0aGlzKVwiXG5cbiAgICBmcmVzaFZhcjogKG5hbWUsIHN1ZmZpeD0wKSAtPlxuXG4gICAgICAgIGZvciB2YXJzIGluIEB2YXJzdGFja1xuICAgICAgICAgICAgZm9yIHYgaW4gdmFyc1xuICAgICAgICAgICAgICAgIGlmIHYudGV4dCA9PSBuYW1lICsgKHN1ZmZpeCBvciAnJylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEBmcmVzaFZhciBuYW1lLCBzdWZmaXgrMVxuXG4gICAgICAgIEB2YXJzdGFja1stMV0ucHVzaCB0ZXh0Om5hbWUgKyAoc3VmZml4IG9yICcnKVxuICAgICAgICBuYW1lICsgKHN1ZmZpeCBvciAnJylcblxuICAgIHZlcmI6IC0+IGlmIEB2ZXJib3NlIHRoZW4gY29uc29sZS5sb2cuYXBwbHkgY29uc29sZS5sb2csIGFyZ3VtZW50c1xuICAgIFxuICAgIGluZDogLT5cblxuICAgICAgICBvaSA9IEBpbmRlbnRcbiAgICAgICAgQGluZGVudCArPSAnICAgICdcbiAgICAgICAgb2lcblxuICAgIGRlZDogLT4gQGluZGVudCA9IEBpbmRlbnRbLi4uLTRdXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgXG4gICAgc3RyaXBvbDogKGNodW5rcykgLT5cbiAgICAgICAgXG4gICAgICAgcyA9ICdgJ1xuICAgICAgIGZvciBjaHVuayBpbiBjaHVua3NcbiAgICAgICAgICAgdCA9IGNodW5rLnRleHRcbiAgICAgICAgICAgc3dpdGNoIGNodW5rLnR5cGVcbiAgICAgICAgICAgICAgIHdoZW4gJ29wZW4nICB0aGVuIHMrPSB0KyckeydcbiAgICAgICAgICAgICAgIHdoZW4gJ2Nsb3NlJyB0aGVuIHMrPSAnfScrdFxuICAgICAgICAgICAgICAgd2hlbiAnbWlkbCcgIHRoZW4gcys9ICd9Jyt0KyckeydcbiAgICAgICAgICAgICAgIHdoZW4gJ2NvZGUnICB0aGVuIHMrPSBAY29tcGlsZSB0XG4gICAgICAgcyArPSAnYCdcbiAgICAgICBzXG5cbm1vZHVsZS5leHBvcnRzID0gUmVuZGVyZXJcbiJdfQ==
//# sourceURL=../coffee/renderer.coffee