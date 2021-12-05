// koffee 1.20.0

/*
00000000   00000000  000   000  0000000    00000000  00000000   00000000  00000000
000   000  000       0000  000  000   000  000       000   000  000       000   000
0000000    0000000   000 0 000  000   000  0000000   0000000    0000000   0000000
000   000  000       000  0000  000   000  000       000   000  000       000   000
000   000  00000000  000   000  0000000    00000000  000   000  00000000  000   000
 */
var Renderer, empty, firstLineCol, kstr, lastLineCol, print, ref, valid,
    indexOf = [].indexOf;

kstr = require('kstr');

print = require('./print');

ref = require('./utils'), valid = ref.valid, empty = ref.empty, firstLineCol = ref.firstLineCol, lastLineCol = ref.lastLineCol;

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
        if (valid(ast.vars)) {
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
        if (sep === '\n') {
            sl = sl.map((function(_this) {
                return function(s) {
                    var ref1, stripped;
                    stripped = kstr.lstrip(s);
                    if (ref1 = stripped[0], indexOf.call('([', ref1) >= 0) {
                        return ';' + s;
                    } else if (stripped.startsWith('function')) {
                        return "(" + s + ")";
                    } else {
                        return s;
                    }
                };
            })(this));
        }
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

    Renderer.prototype.qmrkop = function(p) {
        var lhs, vn;
        if (p.lhs.type === 'var' || !p.qmrk) {
            lhs = this.atom(p.lhs);
            return "(" + lhs + " != null ? " + lhs + " : " + (this.atom(p.rhs)) + ")";
        } else {
            vn = "_" + p.qmrk.line + "_" + p.qmrk.col + "_";
            return "((" + vn + "=" + (this.atom(p.lhs)) + ") != null ? " + vn + " : " + (this.atom(p.rhs)) + ")";
        }
    };

    Renderer.prototype.qmrkcolon = function(p) {
        return "(" + (this.atom(p.lhs)) + " ? " + (this.atom(p.mid)) + " : " + (this.atom(p.rhs)) + ")";
    };

    Renderer.prototype.assert = function(p) {
        this.verb('fix', p);
        if (p.obj.type !== 'var' && !p.obj.index) {
            return '▾' + this.node(p.obj) + ("▸" + p.qmrk.line + "_" + p.qmrk.col + "◂");
        } else {
            return '▾' + this.node(p.obj) + ("▸" + 0 + "_" + 0 + "◂");
        }
    };

    Renderer.prototype.fixAsserts = function(s) {
        var i, l, len, len1, mtch, q, r, ref1, ref2, ref3, ref4, results, results1, rhs, splt, t, w, y;
        this.verb('fixAsserts', s);
        if (s == null) {
            return;
        }
        if ((s == null) || s.length === 0) {
            return '';
        }
        if (s === '▾' || s === "'▾'" || s === '"▾"') {
            return s;
        }
        while (s[0] === '▾') {
            s = s.slice(1);
        }
        if (/(?<!['"])▾/.test(s)) {
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
                    rhs = i ? (mtch[i - 1] !== "_0_0_" ? mtch[i - 1] : l) + splt[i] : splt[0];
                    if (mtch[i] !== "_0_0_") {
                        l = "(" + mtch[i] + "=" + rhs + ")";
                    } else {
                        l = rhs;
                    }
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
                if (mtch.slice(-1)[0] !== "_0_0_") {
                    s += mtch.slice(-1)[0] + splt.slice(-1)[0];
                } else {
                    s += l + splt.slice(-1)[0];
                }
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
        var len, mi, mthds, q, r, ref1, ref2, results, s;
        s = '\n';
        s += "class " + n.name.text;
        if (n["extends"]) {
            s += " extends " + n["extends"].map(function(e) {
                return e.text;
            }).join(', ');
        }
        s += '\n{';
        mthds = n.body;
        if (mthds != null ? mthds.length : void 0) {
            mthds = this.prepareMethods(mthds);
            this.indent = '    ';
            ref2 = (function() {
                results = [];
                for (var r = 0, ref1 = mthds.length; 0 <= ref1 ? r < ref1 : r > ref1; 0 <= ref1 ? r++ : r--){ results.push(r); }
                return results;
            }).apply(this);
            for (q = 0, len = ref2.length; q < len; q++) {
                mi = ref2[q];
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
        if (valid(n.body.vars)) {
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
        if (valid(n.body.exps)) {
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
        if (n.arrow.text === '=>' && !n.name) {
            s = "(" + s + ").bind(this)";
        }
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
        if (p.args) {
            if (callee === 'new') {
                return callee + " " + (this.nodes(p.args, ','));
            } else {
                return callee + "(" + (this.nodes(p.args, ',')) + ")";
            }
        } else {
            return callee + "()";
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
            return "(function (o) {\n    r = o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}\n    for (k in o)\n    {   \n        var m = (" + (this.node(n.fnc)) + ")(o[k])\n        if (m != null)\n        {\n            r[k] = m\n        }\n    }\n    return typeof o == 'string' ? r.join('') : r\n})(" + (this.node(n.lhs)) + ")";
        } else if (numArgs) {
            return "(function (o) {\n    r = o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}\n    for (k in o)\n    {   \n        var m = (" + (this.node(n.fnc)) + ")(k, o[k])\n        if (m != null && m[0] != null)\n        {\n            r[m[0]] = m[1]\n        }\n    }\n    return typeof o == 'string' ? r.join('') : r\n})(" + (this.node(n.lhs)) + ")";
        } else {
            if (((ref2 = n.fnc.func.body.exps) != null ? ref2.length : void 0) > 0) {
                return "(function (o) {\n    r = o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}\n    for (k in o)\n    {   \n        var m = (" + (this.node(n.fnc)) + ")(o[k])\n        if (m != null)\n        {\n            r[k] = m\n        }\n    }\n    return typeof o == 'string' ? r.join('') : r\n})(" + (this.node(n.lhs)) + ")\n    ";
            } else {
                return "(function (o) { return o instanceof Array ? [] : typeof o == 'string' ? '' : {} })(" + (this.node(n.lhs)) + ")";
            }
        }
    };

    Renderer.prototype["for"] = function(n) {
        if (!n.then) {
            this.verb('for expected then', n);
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

    Renderer.prototype.for_in = function(n, varPrefix, lastPrefix, lastPostfix, lineBreak) {
        var e, eb, g2, gi, iterVar, j, len, len1, list, listVar, nl, postfix, prefix, q, r, ref1, ref2, ref3, ref4, ref5, ref6, ref7, results, s, v, w;
        if (varPrefix == null) {
            varPrefix = '';
        }
        if (lastPrefix == null) {
            lastPrefix = '';
        }
        if (lastPostfix == null) {
            lastPostfix = '';
        }
        if (!n.list.qmrkop && !n.list.array && !n.list.slice) {
            list = this.node({
                qmrkop: {
                    lhs: n.list,
                    rhs: {
                        type: 'array',
                        text: '[]'
                    }
                }
            });
        } else {
            if (((ref1 = n.list.array) != null ? (ref2 = ref1.items[0]) != null ? ref2.slice : void 0 : void 0) || n.list.slice) {
                return this.for_in_range(n, varPrefix, lastPrefix, lastPostfix, lineBreak);
            }
            list = this.node(n.list);
        }
        if (!list || list === 'undefined') {
            print.noon('no list for', n.list);
            print.ast('no list for', n.list);
        }
        gi = lineBreak || this.ind();
        nl = lineBreak || '\n';
        eb = lineBreak && ';' || '\n';
        g2 = lineBreak ? '' : this.indent;
        listVar = this.freshVar('list');
        iterVar = "_" + n.inof.line + "_" + n.inof.col + "_";
        s = '';
        s += ("var " + listVar + " = " + list) + eb;
        if (n.vals.text) {
            s += gi + ("for (var " + iterVar + " = 0; " + iterVar + " < " + listVar + ".length; " + iterVar + "++)") + nl;
            s += gi + "{" + nl;
            s += g2 + (n.vals.text + " = " + listVar + "[" + iterVar + "]") + eb;
        } else if ((ref3 = n.vals.array) != null ? ref3.items : void 0) {
            s += gi + ("for (var " + iterVar + " = 0; " + iterVar + " < " + listVar + ".length; " + iterVar + "++)") + nl;
            s += gi + "{" + nl;
            ref5 = (function() {
                results = [];
                for (var r = 0, ref4 = n.vals.array.items.length; 0 <= ref4 ? r < ref4 : r > ref4; 0 <= ref4 ? r++ : r--){ results.push(r); }
                return results;
            }).apply(this);
            for (q = 0, len = ref5.length; q < len; q++) {
                j = ref5[q];
                v = n.vals.array.items[j];
                s += g2 + (v.text + " = " + listVar + "[" + iterVar + "][" + j + "]") + eb;
            }
        } else if (n.vals.length > 1) {
            iterVar = n.vals[1].text;
            s += gi + ("for (" + iterVar + " = 0; " + iterVar + " < " + listVar + ".length; " + iterVar + "++)") + nl;
            s += gi + "{" + nl;
            s += g2 + ("" + varPrefix + n.vals[0].text + " = " + listVar + "[" + iterVar + "]") + eb;
        }
        ref7 = (ref6 = n.then) != null ? ref6 : [];
        for (w = 0, len1 = ref7.length; w < len1; w++) {
            e = ref7[w];
            prefix = lastPrefix && e === n.then.slice(-1)[0] ? lastPrefix : '';
            postfix = lastPostfix && e === n.then.slice(-1)[0] ? lastPostfix : '';
            s += g2 + prefix + this.node(e) + postfix + nl;
        }
        s += gi + "}";
        if (!lineBreak) {
            this.ded();
        }
        return s;
    };

    Renderer.prototype.for_in_range = function(n, varPrefix, lastPrefix, lastPostfix, lineBreak) {
        var e, eb, end, g2, gi, iterCmp, iterDir, iterEnd, iterStart, iterVar, len, nl, postfix, prefix, q, ref1, ref2, ref3, ref4, ref5, ref6, s, slice, start;
        slice = (ref1 = (ref2 = n.list.array) != null ? (ref3 = ref2.items[0]) != null ? ref3.slice : void 0 : void 0) != null ? ref1 : n.list.slice;
        gi = lineBreak || this.ind();
        nl = lineBreak || '\n';
        eb = lineBreak && ';' || '\n';
        g2 = lineBreak ? '' : this.indent;
        iterVar = (ref4 = n.vals.text) != null ? ref4 : n.vals[0].text;
        iterStart = this.node(slice.from);
        iterEnd = this.node(slice.upto);
        start = parseInt(iterStart);
        end = parseInt(iterEnd);
        iterCmp = slice.dots.text === '...' ? '<' : '<=';
        iterDir = '++';
        if (Number.isFinite(start) && Number.isFinite(end)) {
            if (start > end) {
                iterCmp = slice.dots.text === '...' ? '>' : '>=';
                iterDir = '--';
            }
        }
        s = '';
        s += ("for (" + iterVar + " = " + iterStart + "; " + iterVar + " " + iterCmp + " " + iterEnd + "; " + iterVar + iterDir + ")") + nl;
        s += gi + "{" + nl;
        ref6 = (ref5 = n.then) != null ? ref5 : [];
        for (q = 0, len = ref6.length; q < len; q++) {
            e = ref6[q];
            prefix = lastPrefix && e === n.then.slice(-1)[0] ? lastPrefix : '';
            postfix = lastPostfix && e === n.then.slice(-1)[0] ? lastPostfix : '';
            s += g2 + prefix + this.node(e) + postfix + nl;
        }
        s += gi + "}";
        if (!lineBreak) {
            this.ded();
        }
        return s;
    };

    Renderer.prototype.for_of = function(n, varPrefix, lastPrefix, lastPostfix, lineBreak) {
        var e, eb, g2, gi, key, len, nl, obj, postfix, prefix, q, ref1, ref2, ref3, ref4, ref5, s, val;
        if (varPrefix == null) {
            varPrefix = '';
        }
        if (lastPrefix == null) {
            lastPrefix = '';
        }
        if (lastPostfix == null) {
            lastPostfix = '';
        }
        gi = lineBreak || this.ind();
        nl = lineBreak || '\n';
        eb = lineBreak && ';' || '\n';
        g2 = lineBreak ? '' : this.indent;
        key = (ref1 = n.vals.text) != null ? ref1 : (ref2 = n.vals[0]) != null ? ref2.text : void 0;
        val = (ref3 = n.vals[1]) != null ? ref3.text : void 0;
        obj = this.node(n.list);
        s = '';
        s += ("for (" + varPrefix + key + " in " + obj + ")") + nl;
        s += gi + "{" + nl;
        if (val) {
            s += g2 + ("" + varPrefix + val + " = " + obj + "[" + key + "]") + eb;
        }
        ref5 = (ref4 = n.then) != null ? ref4 : [];
        for (q = 0, len = ref5.length; q < len; q++) {
            e = ref5[q];
            prefix = lastPrefix && e === n.then.slice(-1)[0] ? lastPrefix : '';
            postfix = lastPostfix && e === n.then.slice(-1)[0] ? lastPostfix : '';
            s += g2 + prefix + this.node(e) + postfix + nl;
        }
        s += gi + "}";
        if (!lineBreak) {
            this.ded();
        }
        return s;
    };

    Renderer.prototype.lcomp = function(n) {
        var comp;
        comp = (function(_this) {
            return function(f) {
                switch (f.inof.text) {
                    case 'in':
                        return _this.for_in(f, 'var ', 'result.push(', ')', ' ');
                    case 'of':
                        return _this.for_of(f, 'var ', 'result.push(', ')', ' ');
                }
            };
        })(this);
        return "(function () { var result = []; " + (comp(n["for"])) + " return result }).bind(this)()";
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
        if (valid(n["else"])) {
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
        var e, gi, i, len, len1, q, r, ref1, ref2, ref3, s;
        if (!n.vals) {
            return console.error('when expected vals', n);
        }
        s = '';
        ref1 = n.vals;
        for (q = 0, len = ref1.length; q < len; q++) {
            e = ref1[q];
            i = e !== n.vals[0] && this.indent || '    ';
            s += i + 'case ' + this.node(e) + ':\n';
        }
        ref3 = (ref2 = n.then) != null ? ref2 : [];
        for (r = 0, len1 = ref3.length; r < len1; r++) {
            e = ref3[r];
            gi = this.ind();
            s += gi + '    ' + this.node(e) + '\n';
            this.ded();
        }
        if (!(n.then && n.then.slice(-1)[0] && n.then.slice(-1)[0]["return"])) {
            s += this.indent + '    ' + 'break';
        }
        return s;
    };

    Renderer.prototype["try"] = function(n) {
        var gi, ref1, s;
        s = '';
        gi = this.ind();
        s += 'try\n';
        s += gi + '{\n';
        s += this.indent + this.nodes(n.exps, '\n' + this.indent);
        s += '\n';
        s += gi + '}';
        if ((ref1 = n["catch"]) != null ? ref1 : []) {
            s += '\n';
            s += gi + ("catch (" + (this.node(n["catch"].errr)) + ")\n");
            s += gi + '{\n';
            s += this.indent + this.nodes(n["catch"].exps, '\n' + this.indent);
            s += '\n';
            s += gi + '}';
        }
        if (n["finally"]) {
            s += '\n';
            s += gi + 'finally\n';
            s += gi + '{\n';
            s += this.indent + this.nodes(n["finally"], '\n' + this.indent);
            s += '\n';
            s += gi + '}';
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
        var close, first, keyval, len, o, open, opmap, prfx, q, ref1, ref10, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, ro, s, sep;
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
        if (o === '=') {
            if (op.lhs.object) {
                s = '';
                ref3 = op.lhs.object.keyvals;
                for (q = 0, len = ref3.length; q < len; q++) {
                    keyval = ref3[q];
                    s += keyval.text + " = " + (this.atom(op.rhs)) + "." + keyval.text + "\n";
                }
                return s;
            }
        } else if (o === '!') {
            if (((ref4 = op.rhs) != null ? ref4.incond : void 0) || ((ref5 = op.rhs) != null ? (ref6 = ref5.operation) != null ? (ref7 = ref6.operator) != null ? ref7.text : void 0 : void 0 : void 0) === '=') {
                open = '(';
                close = ')';
            }
        } else if (((ref8 = op.rhs) != null ? (ref9 = ref8.operation) != null ? ref9.operator.text : void 0 : void 0) === '=') {
            open = '(';
            close = ')';
        }
        first = firstLineCol(op.lhs);
        prfx = first.col === 0 && ((ref10 = op.rhs) != null ? ref10.func : void 0) ? '\n' : '';
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
            upto = slice.upto != null ? this.node(slice.upto) : '-1';
            if (((ref1 = slice.upto) != null ? ref1.type : void 0) === 'num' || ((ref2 = slice.upto) != null ? ref2.operation : void 0) || upto === '-1') {
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
                        upper = ", typeof " + upto + " === 'number' ? " + upto + "+1 : Infinity";
                    }
                } else {
                    upper = ", typeof " + upto + " === 'number' ? " + upto + " : -1";
                }
            }
            return (this.atom(p.idxee)) + ".slice(" + from + (upper != null ? upper : '') + ")";
        } else {
            if (((ref3 = p.slidx.text) != null ? ref3[0] : void 0) === '-') {
                ni = parseInt(p.slidx.text);
                if (ni === -1) {
                    return (this.node(p.idxee)) + ".slice(" + ni + ")[0]";
                } else {
                    return (this.node(p.idxee)) + ".slice(" + ni + "," + (ni + 1) + ")[0]";
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
        var from, o, ref1, upto, x;
        if ((p.from.type === 'num' && 'num' === ((ref1 = p.upto) != null ? ref1.type : void 0))) {
            from = parseInt(p.from.text);
            upto = parseInt(p.upto.text);
            if (upto - from <= 10) {
                if (p.dots.text === '...') {
                    upto--;
                }
                return '[' + (((function() {
                    var q, ref2, ref3, results;
                    results = [];
                    for (x = q = ref2 = from, ref3 = upto; ref2 <= ref3 ? q <= ref3 : q >= ref3; x = ref2 <= ref3 ? ++q : --q) {
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
        var c, chunk, len, q, s, t;
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
                    c = this.compile(t);
                    if (c[0] === ';') {
                        c = c.slice(1);
                    }
                    s += c;
            }
        }
        s += '`';
        return s;
    };

    return Renderer;

})();

module.exports = Renderer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUVBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQThDLE9BQUEsQ0FBUSxTQUFSLENBQTlDLEVBQUUsaUJBQUYsRUFBUyxpQkFBVCxFQUFnQiwrQkFBaEIsRUFBOEI7O0FBRXhCO0lBRUMsa0JBQUMsSUFBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxNQUFELEdBQVU7UUFRVixJQUFDLENBQUEsS0FBRCx5Q0FBcUIsQ0FBRTtRQUN2QixJQUFDLENBQUEsT0FBRCx5Q0FBcUIsQ0FBRTtJQVh4Qjs7dUJBYUgsT0FBQSxHQUFTLFNBQUMsSUFBRDtBQUVMLFlBQUE7UUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O1lBQ1AsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxVQUFXLElBQUk7O2VBQ2hCLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFpQixJQUFqQjtJQUpLOzt1QkFNVCxNQUFBLEdBQVEsU0FBQyxHQUFEO0FBRUosWUFBQTtRQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBQyxHQUFHLENBQUMsSUFBTDtRQUNaLElBQUMsQ0FBQSxNQUFELEdBQVU7UUFDVixDQUFBLEdBQUk7UUFFSixJQUFHLEtBQUEsQ0FBTSxHQUFHLENBQUMsSUFBVixDQUFIO1lBQ0ksRUFBQSxHQUFLOztBQUFDO0FBQUE7cUJBQUEsc0NBQUE7O2lDQUFBLENBQUMsQ0FBQztBQUFGOztnQkFBRCxDQUEwQixDQUFDLElBQTNCLENBQWdDLElBQWhDO1lBQ0wsQ0FBQSxJQUFLLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQSxNQUFBLEdBQU8sRUFB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Ozs7OztBQWdCYixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxua3N0ciAgPSByZXF1aXJlICdrc3RyJ1xucHJpbnQgPSByZXF1aXJlICcuL3ByaW50J1xuXG57IHZhbGlkLCBlbXB0eSwgZmlyc3RMaW5lQ29sLCBsYXN0TGluZUNvbCB9ID0gcmVxdWlyZSAnLi91dGlscydcblxuY2xhc3MgUmVuZGVyZXJcblxuICAgIEA6IChAa29kZSkgLT5cblxuICAgICAgICBAaGVhZGVyID0gXCJcIlwiXG4gICAgICAgICAgICBjb25zdCBfa18gPSB7XG4gICAgICAgICAgICAgICAgbGlzdDogICBmdW5jdGlvbiAobCkgICB7cmV0dXJuIChsICE9IG51bGwgPyB0eXBlb2YgbC5sZW5ndGggPT09ICdudW1iZXInID8gbCA6IFtdIDogW10pfVxuICAgICAgICAgICAgICAgIGxlbmd0aDogZnVuY3Rpb24gKGwpICAge3JldHVybiAobCAhPSBudWxsID8gdHlwZW9mIGwubGVuZ3RoID09PSAnbnVtYmVyJyA/IGwubGVuZ3RoIDogMCA6IDApfSxcbiAgICAgICAgICAgICAgICBpbjogICAgIGZ1bmN0aW9uIChhLGwpIHtyZXR1cm4gKGwgIT0gbnVsbCA/IHR5cGVvZiBsLmluZGV4T2YgPT09ICdmdW5jdGlvbicgPyBsLmluZGV4T2YoYSkgPj0gMCA6IGZhbHNlIDogZmFsc2UpfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgQGRlYnVnICAgPSBAa29kZS5hcmdzPy5kZWJ1Z1xuICAgICAgICBAdmVyYm9zZSA9IEBrb2RlLmFyZ3M/LnZlcmJvc2VcblxuICAgIGNvbXBpbGU6IChjb2RlKSAtPiBcbiAgICBcbiAgICAgICAgS29kZSA9IHJlcXVpcmUgJy4va29kZSdcbiAgICAgICAgQHN1YktvZGUgPz0gbmV3IEtvZGUgXG4gICAgICAgIEBzdWJLb2RlLmNvbXBpbGUgY29kZVxuICAgICAgICBcbiAgICByZW5kZXI6IChhc3QpIC0+XG5cbiAgICAgICAgQHZhcnN0YWNrID0gW2FzdC52YXJzXVxuICAgICAgICBAaW5kZW50ID0gJydcbiAgICAgICAgcyA9ICcnXG5cbiAgICAgICAgaWYgdmFsaWQgYXN0LnZhcnNcbiAgICAgICAgICAgIHZzID0gKHYudGV4dCBmb3IgdiBpbiBhc3QudmFycykuam9pbiAnLCAnXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBcInZhciAje3ZzfVxcblxcblwiXG5cbiAgICAgICAgcyArPSBAbm9kZXMgYXN0LmV4cHMsICdcXG4nXG4gICAgICAgIHNcblxuICAgIG5vZGVzOiAobm9kZXMsIHNlcD0nLCcpIC0+XG5cbiAgICAgICAgc2wgPSBub2Rlcy5tYXAgKHMpID0+IEBhdG9tIHNcbiAgICAgICAgXG4gICAgICAgIGlmIHNlcCA9PSAnXFxuJ1xuICAgICAgICAgICAgc2wgPSBzbC5tYXAgKHMpID0+XG4gICAgICAgICAgICAgICAgc3RyaXBwZWQgPSBrc3RyLmxzdHJpcCBzXG4gICAgICAgICAgICAgICAgaWYgc3RyaXBwZWRbMF0gaW4gJyhbJyB0aGVuICc7JytzIFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgc3RyaXBwZWQuc3RhcnRzV2l0aCAnZnVuY3Rpb24nIHRoZW4gXCIoI3tzfSlcIlxuICAgICAgICAgICAgICAgIGVsc2Ugc1xuICAgICAgICAgICAgXG4gICAgICAgIHNzID0gc2wuam9pbiBzZXBcblxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuXG4gICAgbm9kZTogKGV4cCkgLT5cblxuICAgICAgICByZXR1cm4gJycgaWYgbm90IGV4cFxuXG4gICAgICAgIGlmIGV4cC50eXBlPyBhbmQgZXhwLnRleHQ/IHRoZW4gcmV0dXJuIEB0b2tlbiBleHBcblxuICAgICAgICBpZiBleHAgaW5zdGFuY2VvZiBBcnJheSB0aGVuIHJldHVybiAoQG5vZGUoYSkgZm9yIGEgaW4gZXhwKS5qb2luICc7XFxuJ1xuXG4gICAgICAgIHMgPSAnJ1xuXG4gICAgICAgIGZvciBrLHYgb2YgZXhwXG5cbiAgICAgICAgICAgIHMrPSBzd2l0Y2gga1xuICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyAgICAgICAgdGhlbiBAaWYgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2ZvcicgICAgICAgdGhlbiBAZm9yIHZcbiAgICAgICAgICAgICAgICB3aGVuICd3aGlsZScgICAgIHRoZW4gQHdoaWxlIHZcbiAgICAgICAgICAgICAgICB3aGVuICdyZXR1cm4nICAgIHRoZW4gQHJldHVybiB2XG4gICAgICAgICAgICAgICAgd2hlbiAnY2xhc3MnICAgICB0aGVuIEBjbGFzcyB2XG4gICAgICAgICAgICAgICAgd2hlbiAnc3dpdGNoJyAgICB0aGVuIEBzd2l0Y2ggdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3doZW4nICAgICAgdGhlbiBAd2hlbiB2XG4gICAgICAgICAgICAgICAgd2hlbiAnYXNzZXJ0JyAgICB0aGVuIEBhc3NlcnQgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3FtcmtvcCcgICAgdGhlbiBAcW1ya29wIHZcbiAgICAgICAgICAgICAgICB3aGVuICdzdHJpcG9sJyAgIHRoZW4gQHN0cmlwb2wgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3Ftcmtjb2xvbicgdGhlbiBAcW1ya2NvbG9uIHZcbiAgICAgICAgICAgICAgICB3aGVuICdvcGVyYXRpb24nIHRoZW4gQG9wZXJhdGlvbiB2XG4gICAgICAgICAgICAgICAgd2hlbiAnaW5jb25kJyAgICB0aGVuIEBpbmNvbmQgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3BhcmVucycgICAgdGhlbiBAcGFyZW5zIHZcbiAgICAgICAgICAgICAgICB3aGVuICdvYmplY3QnICAgIHRoZW4gQG9iamVjdCB2XG4gICAgICAgICAgICAgICAgd2hlbiAna2V5dmFsJyAgICB0aGVuIEBrZXl2YWwgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2FycmF5JyAgICAgdGhlbiBAYXJyYXkgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2xjb21wJyAgICAgdGhlbiBAbGNvbXAgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2luZGV4JyAgICAgdGhlbiBAaW5kZXggdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3NsaWNlJyAgICAgdGhlbiBAc2xpY2UgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3Byb3AnICAgICAgdGhlbiBAcHJvcCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnZWFjaCcgICAgICB0aGVuIEBlYWNoIHZcbiAgICAgICAgICAgICAgICB3aGVuICdmdW5jJyAgICAgIHRoZW4gQGZ1bmMgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2NhbGwnICAgICAgdGhlbiBAY2FsbCB2XG4gICAgICAgICAgICAgICAgd2hlbiAndHJ5JyAgICAgICB0aGVuIEB0cnkgdlxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbG9nIFI0KFwicmVuZGVyZXIubm9kZSB1bmhhbmRsZWQga2V5ICN7a30gaW4gZXhwXCIpLCBleHAgIyBpZiBAZGVidWcgb3IgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICAgICAgJydcbiAgICAgICAgc1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgYXRvbTogKGV4cCkgLT5cblxuICAgICAgICBAZml4QXNzZXJ0cyBAbm9kZSBleHBcbiAgICAgICAgXG4gICAgcW1ya29wOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHAubGhzLnR5cGUgPT0gJ3Zhcicgb3Igbm90IHAucW1ya1xuICAgICAgICAgICAgbGhzID0gQGF0b20gcC5saHNcbiAgICAgICAgICAgIFwiKCN7bGhzfSAhPSBudWxsID8gI3tsaHN9IDogI3tAYXRvbSBwLnJoc30pXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdm4gPSBcIl8je3AucW1yay5saW5lfV8je3AucW1yay5jb2x9X1wiXG4gICAgICAgICAgICBcIigoI3t2bn09I3tAYXRvbSBwLmxoc30pICE9IG51bGwgPyAje3ZufSA6ICN7QGF0b20gcC5yaHN9KVwiXG5cbiAgICBxbXJrY29sb246IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgXCIoI3tAYXRvbSBwLmxoc30gPyAje0BhdG9tIHAubWlkfSA6ICN7QGF0b20gcC5yaHN9KVwiXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAgMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAwMDAgICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwXG5cbiAgICBhc3NlcnQ6IChwKSAtPlxuXG4gICAgICAgIEB2ZXJiICdmaXgnIHBcbiAgICAgICAgaWYgcC5vYmoudHlwZSAhPSAndmFyJyBhbmQgbm90IHAub2JqLmluZGV4XG4gICAgICAgICAgICAn4pa+JyArIEBub2RlKHAub2JqKSArIFwi4pa4I3twLnFtcmsubGluZX1fI3twLnFtcmsuY29sfeKXglwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgICfilr4nICsgQG5vZGUocC5vYmopICsgXCLilrgjezB9XyN7MH3il4JcIiAjIGhpbnQgZml4QXNzZXJ0IHRvIG5vdCB1c2UgZ2VuZXJhdGVkIHZhclxuICAgIFxuICAgIGZpeEFzc2VydHM6IChzKSAtPlxuXG4gICAgICAgIEB2ZXJiICdmaXhBc3NlcnRzJyBzXG4gICAgICAgIFxuICAgICAgICBpZiBub3Qgcz9cbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiAnJyBpZiBub3Qgcz8gb3Igcy5sZW5ndGggPT0gMFxuICAgICAgICByZXR1cm4gcyBpZiBzIGluIFsn4pa+JyBcIifilr4nXCIgJ1wi4pa+XCInXVxuXG4gICAgICAgIHdoaWxlIHNbMF0gPT0gJ+KWvicgdGhlbiBzID0gc1sxLi5dXG4gICAgICAgIGlmIC8oPzwhWydcIl0p4pa+Ly50ZXN0IHNcbiAgICAgICAgICAgIGkgPSBzLmluZGV4T2YgJ+KWvidcbiAgICAgICAgICAgIHJldHVybiBzWy4uLmldICsgQGZpeEFzc2VydHMgc1tpKzEuLl1cbiAgICAgICAgICAgIFxuICAgICAgICBpZiAnXFxuJyBpbiBzXG4gICAgICAgICAgICBpID0gcy5pbmRleE9mICdcXG4nXG4gICAgICAgICAgICByZXR1cm4gQGZpeEFzc2VydHMoc1suLi5pXSkgKyBzW2kuLl1cbiAgICAgICAgXG4gICAgICAgIHNwbHQgPSBzLnNwbGl0IC/ilrhcXGQrX1xcZCvil4IvXG4gICAgICAgIG10Y2ggPSBzLm1hdGNoIC/ilrhcXGQrX1xcZCvil4IvZ1xuXG4gICAgICAgIGlmIHNwbHQubGVuZ3RoID4gMVxuXG4gICAgICAgICAgICBtdGNoID0gbXRjaC5tYXAgKG0pIC0+IFwiXyN7bVsxLi4tMl19X1wiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHNwbHRbLTFdID09ICcnICMgYXNzZXJ0IGVuZHMgd2l0aCA/XG4gICAgICAgICAgICAgICAgaWYgc3BsdC5sZW5ndGggPiAyXG4gICAgICAgICAgICAgICAgICAgIHNwbHQucG9wKClcbiAgICAgICAgICAgICAgICAgICAgbXRjaC5wb3AoKVxuICAgICAgICAgICAgICAgICAgICB0ID0gc3BsdC5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIHNwbHQubGVuZ3RoICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHQgKz0gJ+KWuCcrbXRjaC5zaGlmdCgpWzEuLi4tMV0rJ+KXgidcbiAgICAgICAgICAgICAgICAgICAgICAgIHQgKz0gc3BsdC5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIHQgPSBAZml4QXNzZXJ0cyB0XG4gICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgdCA9IHNwbHRbMF1cbiAgICAgICAgICAgICAgICByZXR1cm4gIFwiKCN7dH0gIT0gbnVsbClcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBsb2cgc3BsdCwgbXRjaFxuXG4gICAgICAgICAgICBzID0gJydcblxuICAgICAgICAgICAgZm9yIGkgaW4gMC4uLm10Y2gubGVuZ3RoXG5cbiAgICAgICAgICAgICAgICBpZiBtdGNoLmxlbmd0aCA+IDEgXG4gICAgICAgICAgICAgICAgICAgIHJocyA9IGlmIGkgdGhlbiAoaWYgbXRjaFtpLTFdICE9IFwiXzBfMF9cIiB0aGVuIG10Y2hbaS0xXSBlbHNlIGwpK3NwbHRbaV0gZWxzZSBzcGx0WzBdXG4gICAgICAgICAgICAgICAgICAgIGlmIG10Y2hbaV0gIT0gXCJfMF8wX1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBsID0gXCIoI3ttdGNoW2ldfT0je3Joc30pXCJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgbCA9IHJoc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbCA9IHNwbHRbMF1cblxuICAgICAgICAgICAgICAgIGlmIHNwbHRbaSsxXVswXSA9PSAnKCdcbiAgICAgICAgICAgICAgICAgICAgcyArPSBcInR5cGVvZiAje2x9ID09PSBcXFwiZnVuY3Rpb25cXFwiID8gXCJcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gXCIje2x9ICE9IG51bGwgPyBcIlxuXG4gICAgICAgICAgICBpZiBtdGNoLmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICBpZiBtdGNoWy0xXSAhPSBcIl8wXzBfXCJcbiAgICAgICAgICAgICAgICAgICAgcyArPSBtdGNoWy0xXStzcGx0Wy0xXVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcyArPSBsK3NwbHRbLTFdXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcyArPSBzcGx0WzBdK3NwbHRbMV1cblxuICAgICAgICAgICAgZm9yIGkgaW4gMC4uLm10Y2gubGVuZ3RoIHRoZW4gcyArPSBcIiA6IHVuZGVmaW5lZFwiXG5cbiAgICAgICAgICAgIHMgPSBcIigje3N9KVwiXG4gICAgICAgIHNcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuXG4gICAgY2xhc3M6IChuKSAtPlxuXG4gICAgICAgIHMgPSAnXFxuJ1xuICAgICAgICBzICs9IFwiY2xhc3MgI3tuLm5hbWUudGV4dH1cIlxuXG4gICAgICAgIGlmIG4uZXh0ZW5kc1xuICAgICAgICAgICAgcyArPSBcIiBleHRlbmRzIFwiICsgbi5leHRlbmRzLm1hcCgoZSkgLT4gZS50ZXh0KS5qb2luICcsICdcblxuICAgICAgICBzICs9ICdcXG57J1xuXG4gICAgICAgIG10aGRzID0gbi5ib2R5XG5cbiAgICAgICAgaWYgbXRoZHM/Lmxlbmd0aFxuICAgICAgICAgICAgbXRoZHMgPSBAcHJlcGFyZU1ldGhvZHMgbXRoZHNcbiAgICAgICAgICAgIEBpbmRlbnQgPSAnICAgICdcbiAgICAgICAgICAgIGZvciBtaSBpbiAwLi4ubXRoZHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgcyArPSAnXFxuJyBpZiBtaVxuICAgICAgICAgICAgICAgIHMgKz0gQG10aGQgbXRoZHNbbWldXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBAaW5kZW50ID0gJydcbiAgICAgICAgcyArPSAnfVxcbidcbiAgICAgICAgc1xuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuXG4gICAgcHJlcGFyZU1ldGhvZHM6IChtdGhkcykgLT5cblxuICAgICAgICBiaW5kID0gW11cbiAgICAgICAgZm9yIG0gaW4gbXRoZHNcbiAgICAgICAgICAgIGlmIG5vdCBtLmtleXZhbFxuICAgICAgICAgICAgICAgIHByaW50LmFzdCAnbm90IGFuIG1ldGhvZD8nIG1cbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgaWYgbm90IG0ua2V5dmFsLnZhbC5mdW5jXG4gICAgICAgICAgICAgICAgcHJpbnQuYXN0ICdubyBmdW5jIGZvciBtZXRob2Q/JyBtXG4gICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgbmFtZSA9IG0ua2V5dmFsLnZhbC5mdW5jLm5hbWUudGV4dFxuICAgICAgICAgICAgaWYgbmFtZSBpbiBbJ0AnICdjb25zdHJ1Y3RvciddXG4gICAgICAgICAgICAgICAgaWYgY29uc3RydWN0b3IgdGhlbiBlcnJvciAnbW9yZSB0aGFuIG9uZSBjb25zdHJ1Y3Rvcj8nXG4gICAgICAgICAgICAgICAgbS5rZXl2YWwudmFsLmZ1bmMubmFtZS50ZXh0ID0gJ2NvbnN0cnVjdG9yJ1xuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yID0gbVxuICAgICAgICAgICAgZWxzZSBpZiBuYW1lLnN0YXJ0c1dpdGggJ0AnXG4gICAgICAgICAgICAgICAgbS5rZXl2YWwudmFsLmZ1bmMubmFtZS50ZXh0ID0gJ3N0YXRpYyAnICsgbmFtZVsxLi5dXG4gICAgICAgICAgICBlbHNlIGlmIG0ua2V5dmFsLnZhbC5mdW5jPy5hcnJvdy50ZXh0ID09ICc9PidcbiAgICAgICAgICAgICAgICBiaW5kLnB1c2ggbVxuXG4gICAgICAgIGlmIGJpbmQubGVuZ3RoIGFuZCBub3QgY29uc3RydWN0b3IgIyBmb3VuZCBzb21lIG1ldGhvZHMgdG8gYmluZCwgYnV0IG5vIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICBhc3QgPSBAa29kZS5hc3QgXCJjb25zdHJ1Y3RvcjogLT5cIiAjIGNyZWF0ZSBvbmUgZnJvbSBzY3JhdGNoXG4gICAgICAgICAgICBjb25zdHJ1Y3RvciA9IGFzdC5leHBzWzBdLm9iamVjdC5rZXl2YWxzWzBdXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5rZXl2YWwudmFsLmZ1bmMubmFtZSA9IHR5cGU6J25hbWUnIHRleHQ6J2NvbnN0cnVjdG9yJ1xuICAgICAgICAgICAgbXRoZHMudW5zaGlmdCBjb25zdHJ1Y3RvclxuXG4gICAgICAgIGlmIGJpbmQubGVuZ3RoXG4gICAgICAgICAgICBmb3IgYiBpbiBiaW5kXG4gICAgICAgICAgICAgICAgYm4gPSBiLmtleXZhbC52YWwuZnVuYy5uYW1lLnRleHRcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5rZXl2YWwudmFsLmZ1bmMuYm9keS5leHBzID89IFtdXG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3Iua2V5dmFsLnZhbC5mdW5jLmJvZHkuZXhwcy5wdXNoXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjb2RlJ1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcInRoaXMuI3tibn0gPSB0aGlzLiN7Ym59LmJpbmQodGhpcylcIlxuICAgICAgICBtdGhkc1xuXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBtdGhkOiAobikgLT5cblxuICAgICAgICBpZiBuLmtleXZhbFxuICAgICAgICAgICAgcyAgPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQGZ1bmMgbi5rZXl2YWwudmFsLmZ1bmNcbiAgICAgICAgc1xuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwXG5cbiAgICBmdW5jOiAobikgLT5cblxuICAgICAgICByZXR1cm4gJycgaWYgbm90IG5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIHMgPSBuLm5hbWU/LnRleHQgPyAnZnVuY3Rpb24nXG4gICAgICAgIHMgKz0gJyAoJ1xuXG4gICAgICAgIGFyZ3MgPSBuLmFyZ3M/LnBhcmVucz8uZXhwc1xuICAgICAgICBpZiBhcmdzXG4gICAgICAgICAgICBbc3RyLCB0aHNdID0gQGFyZ3MgYXJnc1xuICAgICAgICAgICAgcyArPSBzdHJcblxuICAgICAgICBzICs9ICcpXFxuJ1xuICAgICAgICBzICs9IGdpICsgJ3snXG5cbiAgICAgICAgQHZhcnN0YWNrLnB1c2ggbi5ib2R5LnZhcnNcblxuICAgICAgICBpZiB2YWxpZCBuLmJvZHkudmFyc1xuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgdnMgPSAodi50ZXh0IGZvciB2IGluIG4uYm9keS52YXJzKS5qb2luICcsICdcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIFwidmFyICN7dnN9XFxuXCJcblxuICAgICAgICBmb3IgdCBpbiB0aHMgPyBbXVxuICAgICAgICAgICAgcyArPSAnXFxuJyArIEBpbmRlbnQgKyB0aHNcblxuICAgICAgICBpZiB2YWxpZCBuLmJvZHkuZXhwc1xuXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzcyA9IG4uYm9keS5leHBzLm1hcCAocykgPT4gQG5vZGUgc1xuICAgICAgICAgICAgc3MgPSBzcy5tYXAgKHMpID0+IEBpbmRlbnQgKyBzXG4gICAgICAgICAgICBzICs9IHNzLmpvaW4gJ1xcbidcbiAgICAgICAgICAgIHMgKz0gJ1xcbicgKyBnaVxuXG4gICAgICAgIHMgKz0gJ30nXG5cbiAgICAgICAgQHZhcnN0YWNrLnBvcCgpXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIFxuICAgICAgICBpZiBuLmFycm93LnRleHQgPT0gJz0+JyBhbmQgbm90IG4ubmFtZVxuICAgICAgICAgICAgcyA9IFwiKCN7c30pLmJpbmQodGhpcylcIlxuICAgICAgICBcbiAgICAgICAgc1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMFxuXG4gICAgYXJnczogKGFyZ3MpIC0+XG5cbiAgICAgICAgdGhzICA9IFtdXG4gICAgICAgIHVzZWQgPSB7fVxuXG4gICAgICAgIGZvciBhIGluIGFyZ3NcbiAgICAgICAgICAgIGlmIGEudGV4dCB0aGVuIHVzZWRbYS50ZXh0XSA9IGEudGV4dFxuXG4gICAgICAgIGFyZ3MgPSBhcmdzLm1hcCAoYSkgLT5cbiAgICAgICAgICAgIGlmIGEucHJvcCBhbmQgYS5wcm9wLm9iai50eXBlID09ICd0aGlzJ1xuICAgICAgICAgICAgICAgIHRoaXNWYXIgPSBhLnByb3AucHJvcFxuICAgICAgICAgICAgICAgIGlmIHVzZWRbdGhpc1Zhci50ZXh0XVxuICAgICAgICAgICAgICAgICAgICBmb3IgaSBpbiBbMS4uMTAwXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbm90IHVzZWRbdGhpc1Zhci50ZXh0K2ldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhzLnB1c2ggXCJ0aGlzLiN7dGhpc1Zhci50ZXh0fSA9ICN7dGhpc1Zhci50ZXh0K2l9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzVmFyLnRleHQgPSB0aGlzVmFyLnRleHQraVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZWRbdGhpc1Zhci50ZXh0XSA9IHRoaXNWYXIudGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aHMucHVzaCBcInRoaXMuI3t0aGlzVmFyLnRleHR9ID0gI3t0aGlzVmFyLnRleHR9XCJcblxuICAgICAgICAgICAgICAgIHRoaXNWYXJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhXG5cbiAgICAgICAgc3RyID0gYXJncy5tYXAoKGEpID0+IEBub2RlIGEpLmpvaW4gJywgJ1xuXG4gICAgICAgIFtzdHIsdGhzXVxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuXG4gICAgcmV0dXJuOiAobikgLT5cblxuICAgICAgICBzID0gJ3JldHVybidcbiAgICAgICAgcyArPSAnICcgKyBAbm9kZSBuLnZhbFxuICAgICAgICBrc3RyLnN0cmlwIHNcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwXG5cbiAgICBjYWxsOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHAuY2FsbGVlLnRleHQgaW4gWydsb2cnJ3dhcm4nJ2Vycm9yJ11cbiAgICAgICAgICAgIHAuY2FsbGVlLnRleHQgPSBcImNvbnNvbGUuI3twLmNhbGxlZS50ZXh0fVwiXG4gICAgICAgICAgICBcbiAgICAgICAgY2FsbGVlID0gQG5vZGUgcC5jYWxsZWVcbiAgICAgICAgXG4gICAgICAgIGlmIHAuYXJnc1xuICAgICAgICAgICAgaWYgY2FsbGVlID09ICduZXcnXG4gICAgICAgICAgICAgICAgXCIje2NhbGxlZX0gI3tAbm9kZXMgcC5hcmdzLCAnLCd9XCJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBcIiN7Y2FsbGVlfSgje0Bub2RlcyBwLmFyZ3MsICcsJ30pXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgXCIje2NhbGxlZX0oKVwiXG5cbiAgICAjIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMDAwMFxuICAgICMgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwXG5cbiAgICBpZjogKG4pIC0+XG5cbiAgICAgICAgZmlyc3QgPSBmaXJzdExpbmVDb2wgblxuICAgICAgICBsYXN0ICA9IGxhc3RMaW5lQ29sIG5cblxuICAgICAgICBpZiBmaXJzdC5saW5lID09IGxhc3QubGluZSBhbmQgbi5lbHNlIGFuZCBub3Qgbi5yZXR1cm5zXG4gICAgICAgICAgICByZXR1cm4gQGlmSW5saW5lIG5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwiaWYgKCN7QGF0b20obi5jb25kKX0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgZm9yIGVsaWYgaW4gbi5lbGlmcyA/IFtdXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpICsgXCJlbHNlIGlmICgje0BhdG9tKGVsaWYuZWxpZi5jb25kKX0pXFxuXCJcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgICAgIGZvciBlIGluIGVsaWYuZWxpZi50aGVuID8gW11cbiAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgaWYgbi5lbHNlXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpICsgJ2Vsc2VcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBmb3IgZSBpbiBuLmVsc2UgPyBbXVxuICAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgICMgMDAwICAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcblxuICAgIGlmSW5saW5lOiAobikgLT5cblxuICAgICAgICBzID0gJydcblxuICAgICAgICBzICs9IFwiI3tAYXRvbShuLmNvbmQpfSA/IFwiXG4gICAgICAgIGlmIG4udGhlbj8ubGVuZ3RoXG4gICAgICAgICAgICBzICs9IChAYXRvbShlKSBmb3IgZSBpbiBuLnRoZW4pLmpvaW4gJywgJ1xuXG4gICAgICAgIGlmIG4uZWxpZnNcbiAgICAgICAgICAgIGZvciBlIGluIG4uZWxpZnNcbiAgICAgICAgICAgICAgICBzICs9ICcgOiAnXG4gICAgICAgICAgICAgICAgcyArPSBAaWZJbmxpbmUgZS5lbGlmXG5cbiAgICAgICAgaWYgbi5lbHNlXG4gICAgICAgICAgICBzICs9ICcgOiAnXG4gICAgICAgICAgICBpZiBuLmVsc2UubGVuZ3RoID09IDFcbiAgICAgICAgICAgICAgICBzICs9IEBhdG9tIG4uZWxzZVswXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHMgKz0gJygnICsgKEBhdG9tIGUgZm9yIGUgaW4gbi5lbHNlKS5qb2luKCcsICcpICsgJyknXG4gICAgICAgIHNcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBlYWNoOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIG51bUFyZ3MgPSBuLmZuYy5mdW5jLmFyZ3M/LnBhcmVucy5leHBzLmxlbmd0aFxuICAgICAgICBcbiAgICAgICAgaWYgbnVtQXJncyA9PSAxXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIChmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgICAgIHIgPSBvIGluc3RhbmNlb2YgQXJyYXkgPyBbXSA6IHR5cGVvZiBvID09ICdzdHJpbmcnID8gby5zcGxpdCgnJykgOiB7fVxuICAgICAgICAgICAgICAgIGZvciAoayBpbiBvKVxuICAgICAgICAgICAgICAgIHsgICBcbiAgICAgICAgICAgICAgICAgICAgdmFyIG0gPSAoI3tAbm9kZSBuLmZuY30pKG9ba10pXG4gICAgICAgICAgICAgICAgICAgIGlmIChtICE9IG51bGwpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJba10gPSBtXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBvID09ICdzdHJpbmcnID8gci5qb2luKCcnKSA6IHJcbiAgICAgICAgICAgIH0pKCN7QG5vZGUgbi5saHN9KVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVsc2UgaWYgbnVtQXJnc1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAoZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgICAgICByID0gbyBpbnN0YW5jZW9mIEFycmF5ID8gW10gOiB0eXBlb2YgbyA9PSAnc3RyaW5nJyA/IG8uc3BsaXQoJycpIDoge31cbiAgICAgICAgICAgICAgICBmb3IgKGsgaW4gbylcbiAgICAgICAgICAgICAgICB7ICAgXG4gICAgICAgICAgICAgICAgICAgIHZhciBtID0gKCN7QG5vZGUgbi5mbmN9KShrLCBvW2tdKVxuICAgICAgICAgICAgICAgICAgICBpZiAobSAhPSBudWxsICYmIG1bMF0gIT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgclttWzBdXSA9IG1bMV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIG8gPT0gJ3N0cmluZycgPyByLmpvaW4oJycpIDogclxuICAgICAgICAgICAgfSkoI3tAbm9kZSBuLmxoc30pXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlICMgbm8gYXJnc1xuICAgICAgICAgICAgaWYgbi5mbmMuZnVuYy5ib2R5LmV4cHM/Lmxlbmd0aCA+IDAgIyBzb21lIGZ1bmMgYnV0IG5vIGFyZ3NcbiAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgICAgICAgICAgciA9IG8gaW5zdGFuY2VvZiBBcnJheSA/IFtdIDogdHlwZW9mIG8gPT0gJ3N0cmluZycgPyBvLnNwbGl0KCcnKSA6IHt9XG4gICAgICAgICAgICAgICAgICAgIGZvciAoayBpbiBvKVxuICAgICAgICAgICAgICAgICAgICB7ICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbSA9ICgje0Bub2RlIG4uZm5jfSkob1trXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtICE9IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcltrXSA9IG1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIG8gPT0gJ3N0cmluZycgPyByLmpvaW4oJycpIDogclxuICAgICAgICAgICAgICAgIH0pKCN7QG5vZGUgbi5saHN9KVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGVsc2UgIyBubyBhcmdzIGFuZCBlbXB0eSBmdW5jXG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgICAgKGZ1bmN0aW9uIChvKSB7IHJldHVybiBvIGluc3RhbmNlb2YgQXJyYXkgPyBbXSA6IHR5cGVvZiBvID09ICdzdHJpbmcnID8gJycgOiB7fSB9KSgje0Bub2RlIG4ubGhzfSlcbiAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgZm9yOiAobikgLT5cblxuICAgICAgICBpZiBub3Qgbi50aGVuIHRoZW4gQHZlcmIgJ2ZvciBleHBlY3RlZCB0aGVuJyBuXG5cbiAgICAgICAgc3dpdGNoIG4uaW5vZi50ZXh0XG4gICAgICAgICAgICB3aGVuICdpbicgdGhlbiBAZm9yX2luIG5cbiAgICAgICAgICAgIHdoZW4gJ29mJyB0aGVuIEBmb3Jfb2YgblxuICAgICAgICAgICAgZWxzZSBlcnJvciAnZm9yIGV4cGVjdGVkIGluL29mJ1xuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBmb3JfaW46IChuLCB2YXJQcmVmaXg9JycsIGxhc3RQcmVmaXg9JycsIGxhc3RQb3N0Zml4PScnLCBsaW5lQnJlYWspIC0+XG5cbiAgICAgICAgaWYgbm90IG4ubGlzdC5xbXJrb3AgYW5kIG5vdCBuLmxpc3QuYXJyYXkgYW5kIG5vdCBuLmxpc3Quc2xpY2VcbiAgICAgICAgICAgIGxpc3QgPSBAbm9kZSBxbXJrb3A6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGhzOiBuLmxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByaHM6IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYXJyYXknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdbXSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgbi5saXN0LmFycmF5Py5pdGVtc1swXT8uc2xpY2Ugb3Igbi5saXN0LnNsaWNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIEBmb3JfaW5fcmFuZ2UgbiwgdmFyUHJlZml4LCBsYXN0UHJlZml4LCBsYXN0UG9zdGZpeCwgbGluZUJyZWFrXG4gICAgICAgICAgICBsaXN0ID0gQG5vZGUgbi5saXN0XG5cbiAgICAgICAgaWYgbm90IGxpc3Qgb3IgbGlzdCA9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgcHJpbnQubm9vbiAnbm8gbGlzdCBmb3InIG4ubGlzdFxuICAgICAgICAgICAgcHJpbnQuYXN0ICdubyBsaXN0IGZvcicgbi5saXN0XG5cbiAgICAgICAgZ2kgPSBsaW5lQnJlYWsgb3IgQGluZCgpXG4gICAgICAgIG5sID0gbGluZUJyZWFrIG9yICdcXG4nXG4gICAgICAgIGViID0gbGluZUJyZWFrIGFuZCAnOycgb3IgJ1xcbidcbiAgICAgICAgXG4gICAgICAgIGcyID0gaWYgbGluZUJyZWFrIHRoZW4gJycgZWxzZSBAaW5kZW50XG4gICAgICAgIFxuICAgICAgICBsaXN0VmFyID0gQGZyZXNoVmFyICdsaXN0J1xuICAgICAgICBpdGVyVmFyID0gXCJfI3tuLmlub2YubGluZX1fI3tuLmlub2YuY29sfV9cIlxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcInZhciAje2xpc3RWYXJ9ID0gI3tsaXN0fVwiICsgZWJcbiAgICAgICAgaWYgbi52YWxzLnRleHRcbiAgICAgICAgICAgIHMgKz0gZ2krXCJmb3IgKHZhciAje2l0ZXJWYXJ9ID0gMDsgI3tpdGVyVmFyfSA8ICN7bGlzdFZhcn0ubGVuZ3RoOyAje2l0ZXJWYXJ9KyspXCIgKyBubFxuICAgICAgICAgICAgcyArPSBnaStcIntcIitubFxuICAgICAgICAgICAgcyArPSBnMitcIiN7bi52YWxzLnRleHR9ID0gI3tsaXN0VmFyfVsje2l0ZXJWYXJ9XVwiICsgZWJcbiAgICAgICAgZWxzZSBpZiBuLnZhbHMuYXJyYXk/Lml0ZW1zXG4gICAgICAgICAgICBzICs9IGdpK1wiZm9yICh2YXIgI3tpdGVyVmFyfSA9IDA7ICN7aXRlclZhcn0gPCAje2xpc3RWYXJ9Lmxlbmd0aDsgI3tpdGVyVmFyfSsrKVwiICsgbmxcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XCIrbmxcbiAgICAgICAgICAgIGZvciBqIGluIDAuLi5uLnZhbHMuYXJyYXkuaXRlbXMubGVuZ3RoXG4gICAgICAgICAgICAgICAgdiA9IG4udmFscy5hcnJheS5pdGVtc1tqXVxuICAgICAgICAgICAgICAgIHMgKz0gZzIrXCIje3YudGV4dH0gPSAje2xpc3RWYXJ9WyN7aXRlclZhcn1dWyN7an1dXCIgKyBlYlxuICAgICAgICBlbHNlIGlmIG4udmFscy5sZW5ndGggPiAxXG4gICAgICAgICAgICBpdGVyVmFyID0gbi52YWxzWzFdLnRleHRcbiAgICAgICAgICAgIHMgKz0gZ2krXCJmb3IgKCN7aXRlclZhcn0gPSAwOyAje2l0ZXJWYXJ9IDwgI3tsaXN0VmFyfS5sZW5ndGg7ICN7aXRlclZhcn0rKylcIiArIG5sXG4gICAgICAgICAgICBzICs9IGdpK1wie1wiICsgbmxcbiAgICAgICAgICAgIHMgKz0gZzIrXCIje3ZhclByZWZpeH0je24udmFsc1swXS50ZXh0fSA9ICN7bGlzdFZhcn1bI3tpdGVyVmFyfV1cIiArIGViXG5cbiAgICAgICAgZm9yIGUgaW4gbi50aGVuID8gW11cbiAgICAgICAgICAgIHByZWZpeCA9IGlmIGxhc3RQcmVmaXggYW5kIGUgPT0gbi50aGVuWy0xXSB0aGVuIGxhc3RQcmVmaXggZWxzZSAnJ1xuICAgICAgICAgICAgcG9zdGZpeCA9IGlmIGxhc3RQb3N0Zml4IGFuZCBlID09IG4udGhlblstMV0gdGhlbiBsYXN0UG9zdGZpeCBlbHNlICcnXG4gICAgICAgICAgICBzICs9IGcyICsgcHJlZml4K0Bub2RlKGUpK3Bvc3RmaXggKyBubFxuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgQGRlZCgpIGlmIG5vdCBsaW5lQnJlYWtcbiAgICAgICAgc1xuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAwMDAwICAwMDAgICAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgICAgMDAwICAwMDAgMCAwMDAgICAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAwMDAgIDAwMDAgICAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgZm9yX2luX3JhbmdlOiAobiwgdmFyUHJlZml4LCBsYXN0UHJlZml4LCBsYXN0UG9zdGZpeCwgbGluZUJyZWFrKSAtPlxuICAgICAgICBcbiAgICAgICAgc2xpY2UgPSBuLmxpc3QuYXJyYXk/Lml0ZW1zWzBdPy5zbGljZSA/IG4ubGlzdC5zbGljZVxuXG4gICAgICAgICMgbG9nICdmb3JfaW5fcmFuZ2UnIHNsaWNlXG4gICAgICAgIFxuICAgICAgICBnaSA9IGxpbmVCcmVhayBvciBAaW5kKClcbiAgICAgICAgbmwgPSBsaW5lQnJlYWsgb3IgJ1xcbidcbiAgICAgICAgZWIgPSBsaW5lQnJlYWsgYW5kICc7JyBvciAnXFxuJ1xuICAgICAgICBcbiAgICAgICAgZzIgPSBpZiBsaW5lQnJlYWsgdGhlbiAnJyBlbHNlIEBpbmRlbnRcbiAgICAgICAgXG4gICAgICAgIGl0ZXJWYXIgICA9IG4udmFscy50ZXh0ID8gbi52YWxzWzBdLnRleHRcbiAgICAgICAgXG4gICAgICAgIGl0ZXJTdGFydCA9IEBub2RlIHNsaWNlLmZyb21cbiAgICAgICAgaXRlckVuZCAgID0gQG5vZGUgc2xpY2UudXB0b1xuICAgICAgICBcbiAgICAgICAgc3RhcnQgPSBwYXJzZUludCBpdGVyU3RhcnRcbiAgICAgICAgZW5kICAgPSBwYXJzZUludCBpdGVyRW5kXG4gICAgICAgIFxuICAgICAgICBpdGVyQ21wID0gaWYgc2xpY2UuZG90cy50ZXh0ID09ICcuLi4nIHRoZW4gJzwnIGVsc2UgJzw9J1xuICAgICAgICBpdGVyRGlyID0gJysrJ1xuICAgICAgICBcbiAgICAgICAgaWYgTnVtYmVyLmlzRmluaXRlKHN0YXJ0KSBhbmQgTnVtYmVyLmlzRmluaXRlKGVuZClcbiAgICAgICAgICAgIGlmIHN0YXJ0ID4gZW5kXG4gICAgICAgICAgICAgICAgaXRlckNtcCA9IGlmIHNsaWNlLmRvdHMudGV4dCA9PSAnLi4uJyB0aGVuICc+JyBlbHNlICc+PSdcbiAgICAgICAgICAgICAgICBpdGVyRGlyID0gJy0tJ1xuICAgICAgICAgICAgXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwiZm9yICgje2l0ZXJWYXJ9ID0gI3tpdGVyU3RhcnR9OyAje2l0ZXJWYXJ9ICN7aXRlckNtcH0gI3tpdGVyRW5kfTsgI3tpdGVyVmFyfSN7aXRlckRpcn0pXCIgKyBubFxuICAgICAgICBzICs9IGdpK1wie1wiK25sXG4gICAgICAgIGZvciBlIGluIG4udGhlbiA/IFtdXG4gICAgICAgICAgICBwcmVmaXggPSBpZiBsYXN0UHJlZml4IGFuZCBlID09IG4udGhlblstMV0gdGhlbiBsYXN0UHJlZml4IGVsc2UgJydcbiAgICAgICAgICAgIHBvc3RmaXggPSBpZiBsYXN0UG9zdGZpeCBhbmQgZSA9PSBuLnRoZW5bLTFdIHRoZW4gbGFzdFBvc3RmaXggZWxzZSAnJ1xuICAgICAgICAgICAgcyArPSBnMiArIHByZWZpeCtAbm9kZShlKStwb3N0Zml4ICsgbmxcbiAgICAgICAgcyArPSBnaStcIn1cIlxuICAgICAgICAgICAgXG4gICAgICAgIEBkZWQoKSBpZiBub3QgbGluZUJyZWFrXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgXG4gICAgXG4gICAgZm9yX29mOiAobiwgdmFyUHJlZml4PScnLCBsYXN0UHJlZml4PScnLCBsYXN0UG9zdGZpeD0nJywgbGluZUJyZWFrKSAtPlxuXG4gICAgICAgIGdpID0gbGluZUJyZWFrIG9yIEBpbmQoKVxuICAgICAgICBubCA9IGxpbmVCcmVhayBvciAnXFxuJ1xuICAgICAgICBlYiA9IGxpbmVCcmVhayBhbmQgJzsnIG9yICdcXG4nXG4gICAgICAgIGcyID0gaWYgbGluZUJyZWFrIHRoZW4gJycgZWxzZSBAaW5kZW50XG5cbiAgICAgICAga2V5ID0gbi52YWxzLnRleHQgPyBuLnZhbHNbMF0/LnRleHRcbiAgICAgICAgdmFsID0gbi52YWxzWzFdPy50ZXh0XG5cbiAgICAgICAgb2JqID0gQG5vZGUgbi5saXN0XG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwiZm9yICgje3ZhclByZWZpeH0je2tleX0gaW4gI3tvYmp9KVwiK25sXG4gICAgICAgIHMgKz0gZ2krXCJ7XCIrbmxcbiAgICAgICAgaWYgdmFsXG4gICAgICAgICAgICBzICs9IGcyK1wiI3t2YXJQcmVmaXh9I3t2YWx9ID0gI3tvYmp9WyN7a2V5fV1cIiArIGViXG4gICAgICAgIGZvciBlIGluIG4udGhlbiA/IFtdXG4gICAgICAgICAgICBwcmVmaXggPSBpZiBsYXN0UHJlZml4IGFuZCBlID09IG4udGhlblstMV0gdGhlbiBsYXN0UHJlZml4IGVsc2UgJydcbiAgICAgICAgICAgIHBvc3RmaXggPSBpZiBsYXN0UG9zdGZpeCBhbmQgZSA9PSBuLnRoZW5bLTFdIHRoZW4gbGFzdFBvc3RmaXggZWxzZSAnJ1xuICAgICAgICAgICAgcyArPSBnMisgcHJlZml4K0Bub2RlKGUpK3Bvc3RmaXggKyBubFxuICAgICAgICAgICAgXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcblxuICAgICAgICBAZGVkKCkgaWYgbm90IGxpbmVCcmVha1xuICAgICAgICBzXG4gICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGxjb21wOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIGNvbXAgPSAoZikgPT5cbiAgICAgICAgICAgIHN3aXRjaCBmLmlub2YudGV4dFxuICAgICAgICAgICAgICAgIHdoZW4gJ2luJyB0aGVuIEBmb3JfaW4gZiwgJ3ZhciAnICdyZXN1bHQucHVzaCgnICcpJyAnICdcbiAgICAgICAgICAgICAgICB3aGVuICdvZicgdGhlbiBAZm9yX29mIGYsICd2YXIgJyAncmVzdWx0LnB1c2goJyAnKScgJyAnXG5cbiAgICAgICAgXCIoZnVuY3Rpb24gKCkgeyB2YXIgcmVzdWx0ID0gW107ICN7Y29tcCBuLmZvcn0gcmV0dXJuIHJlc3VsdCB9KS5iaW5kKHRoaXMpKClcIlxuXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwXG5cbiAgICB3aGlsZTogKG4pIC0+XG5cbiAgICAgICAgZ2kgPSBAaW5kKClcblxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcIndoaWxlICgje0Bub2RlIG4uY29uZH0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBzd2l0Y2g6IChuKSAtPlxuXG4gICAgICAgIGlmIG5vdCBuLm1hdGNoIHRoZW4gZXJyb3IgJ3N3aXRjaCBleHBlY3RlZCBtYXRjaCcgblxuICAgICAgICBpZiBub3Qgbi53aGVucyB0aGVuIGVycm9yICdzd2l0Y2ggZXhwZWN0ZWQgd2hlbnMnIG5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwic3dpdGNoICgje0Bub2RlIG4ubWF0Y2h9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgXG4gICAgICAgIGZvciBlIGluIG4ud2hlbnMgPyBbXVxuICAgICAgICAgICAgcyArPSBnaSsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIHZhbGlkIG4uZWxzZVxuICAgICAgICAgICAgcyArPSBAaW5kZW50KydkZWZhdWx0OlxcbidcbiAgICAgICAgICAgIGZvciBlIGluIG4uZWxzZVxuICAgICAgICAgICAgICAgIHMgKz0gQGluZGVudCsnICAgICcrIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcyArPSBnaStcIn1cXG5cIlxuXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgd2hlbjogKG4pIC0+XG5cbiAgICAgICAgaWYgbm90IG4udmFscyB0aGVuIHJldHVybiBlcnJvciAnd2hlbiBleHBlY3RlZCB2YWxzJyBuXG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIGZvciBlIGluIG4udmFsc1xuICAgICAgICAgICAgaSA9IGUgIT0gbi52YWxzWzBdIGFuZCBAaW5kZW50IG9yICcgICAgJ1xuICAgICAgICAgICAgcyArPSBpKydjYXNlICcgKyBAbm9kZShlKSArICc6XFxuJ1xuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgZ2kgPSBAaW5kKClcbiAgICAgICAgICAgIHMgKz0gZ2kgKyAnICAgICcgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBAZGVkKClcbiAgICAgICAgaWYgbm90IChuLnRoZW4gYW5kIG4udGhlblstMV0gYW5kIG4udGhlblstMV0ucmV0dXJuKVxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgJyAgICAnICsgJ2JyZWFrJyBcbiAgICAgICAgc1xuXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgICAgMDAwMDAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHRyeTogKG4pIC0+XG4gICAgICAgIFxuICAgICAgICBzID0gJydcbiAgICAgICAgZ2kgPSBAaW5kKClcbiAgICAgICAgcyArPSAndHJ5XFxuJ1xuICAgICAgICBzICs9IGdpKyd7XFxuJ1xuICAgICAgICBzICs9IEBpbmRlbnQrQG5vZGVzIG4uZXhwcywgJ1xcbicrQGluZGVudFxuICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgIHMgKz0gZ2krJ30nXG4gICAgICAgIGlmIG4uY2F0Y2ggPyBbXVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaStcImNhdGNoICgje0Bub2RlIG4uY2F0Y2guZXJycn0pXFxuXCIgXG4gICAgICAgICAgICBzICs9IGdpKyd7XFxuJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50K0Bub2RlcyBuLmNhdGNoLmV4cHMsICdcXG4nK0BpbmRlbnRcbiAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIHMgKz0gZ2krJ30nXG4gICAgICAgIGlmIG4uZmluYWxseVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaSsnZmluYWxseVxcbidcbiAgICAgICAgICAgIHMgKz0gZ2krJ3tcXG4nXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQrQG5vZGVzIG4uZmluYWxseSwgJ1xcbicrQGluZGVudFxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaSsnfSdcbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwMCAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwXG4gICAgIyAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICB0b2tlbjogKHRvaykgLT5cblxuICAgICAgICBpZiB0b2sudHlwZSA9PSAnY29tbWVudCdcbiAgICAgICAgICAgIEBjb21tZW50IHRva1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICd0aGlzJ1xuICAgICAgICAgICAgJ3RoaXMnXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ3RyaXBsZSdcbiAgICAgICAgICAgICdgJyArIHRvay50ZXh0WzMuLi00XSArICdgJ1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgPT0gJ3llcydcbiAgICAgICAgICAgICd0cnVlJ1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgPT0gJ25vJ1xuICAgICAgICAgICAgJ2ZhbHNlJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0b2sudGV4dFxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbiAgICBjb21tZW50OiAodG9rKSAtPlxuXG4gICAgICAgIGlmIHRvay50ZXh0LnN0YXJ0c1dpdGggJyMjIydcbiAgICAgICAgICAgICcvKicgKyB0b2sudGV4dFszLi4tNF0gKyAnKi8nICsgJ1xcbidcbiAgICAgICAgZWxzZSBpZiB0b2sudGV4dC5zdGFydHNXaXRoICcjJ1xuICAgICAgICAgICAga3N0ci5wYWQoJycsIHRvay5jb2wpICsgJy8vJyArIHRvay50ZXh0WzEuLi0xXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlcnJvciBcIiMgY29tbWVudCB0b2tlbiBleHBlY3RlZFwiXG4gICAgICAgICAgICAnJ1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgb3BlcmF0aW9uOiAob3ApIC0+XG5cbiAgICAgICAgb3BtYXAgPSAobykgLT5cbiAgICAgICAgICAgIG9tcCA9XG4gICAgICAgICAgICAgICAgYW5kOiAgICAnJiYnXG4gICAgICAgICAgICAgICAgb3I6ICAgICAnfHwnXG4gICAgICAgICAgICAgICAgbm90OiAgICAnISdcbiAgICAgICAgICAgICAgICAnPT0nOiAgICc9PT0nXG4gICAgICAgICAgICAgICAgJyE9JzogICAnIT09J1xuICAgICAgICAgICAgb21wW29dID8gb1xuXG4gICAgICAgIG8gICA9IG9wbWFwIG9wLm9wZXJhdG9yLnRleHRcbiAgICAgICAgc2VwID0gJyAnXG4gICAgICAgIHNlcCA9ICcnIGlmIG5vdCBvcC5saHMgb3Igbm90IG9wLnJoc1xuXG4gICAgICAgIGlmIG8gaW4gWyc8Jyc8PScnPT09JychPT0nJz49Jyc+J11cbiAgICAgICAgICAgIHJvID0gb3BtYXAgb3AucmhzPy5vcGVyYXRpb24/Lm9wZXJhdG9yLnRleHRcbiAgICAgICAgICAgIGlmIHJvIGluIFsnPCcnPD0nJz09PScnIT09Jyc+PScnPiddXG4gICAgICAgICAgICAgICAgcmV0dXJuICcoJyArIEBhdG9tKG9wLmxocykgKyBzZXAgKyBvICsgc2VwICsgQGF0b20ob3AucmhzLm9wZXJhdGlvbi5saHMpICsgJyAmJiAnICsga3N0ci5sc3RyaXAoQGF0b20ob3AucmhzKSkgKyAnKSdcblxuICAgICAgICBvcGVuID0gY2xvc2UgPSAnJ1xuICAgICAgICBcbiAgICAgICAgaWYgbyA9PSAnPSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb3AubGhzLm9iamVjdCAjIGxocyBpcyBjdXJseSwgZWcuIHt4LHl9ID0gcmVxdWlyZSAnJ1xuICAgICAgICAgICAgICAgIHMgPSAnJ1xuICAgICAgICAgICAgICAgIGZvciBrZXl2YWwgaW4gb3AubGhzLm9iamVjdC5rZXl2YWxzXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gXCIje2tleXZhbC50ZXh0fSA9ICN7QGF0b20ob3AucmhzKX0uI3trZXl2YWwudGV4dH1cXG5cIlxuICAgICAgICAgICAgICAgIHJldHVybiBzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGVsc2UgaWYgbyA9PSAnISdcblxuICAgICAgICAgICAgaWYgb3AucmhzPy5pbmNvbmQgb3Igb3AucmhzPy5vcGVyYXRpb24/Lm9wZXJhdG9yPy50ZXh0ID09ICc9J1xuICAgICAgICAgICAgICAgICAgICBvcGVuID0gJygnXG4gICAgICAgICAgICAgICAgICAgIGNsb3NlID0gJyknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGVsc2UgaWYgb3AucmhzPy5vcGVyYXRpb24/Lm9wZXJhdG9yLnRleHQgPT0gJz0nXG4gICAgICAgICAgICBvcGVuID0gJygnXG4gICAgICAgICAgICBjbG9zZSA9ICcpJ1xuICAgICAgICAgICAgXG4gICAgICAgIGZpcnN0ID0gZmlyc3RMaW5lQ29sIG9wLmxoc1xuICAgICAgICBwcmZ4ID0gaWYgZmlyc3QuY29sID09IDAgYW5kIG9wLnJocz8uZnVuYyB0aGVuICdcXG4nIGVsc2UgJydcbiAgICAgICAgICAgIFxuICAgICAgICBwcmZ4ICsgQGF0b20ob3AubGhzKSArIHNlcCArIG8gKyBzZXAgKyBvcGVuICsga3N0ci5sc3RyaXAgQGF0b20ob3AucmhzKSArIGNsb3NlXG5cbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGluY29uZDogKHApIC0+XG5cbiAgICAgICAgXCIje0Bub2RlIHAucmhzfS5pbmRleE9mKCN7QGF0b20gcC5saHN9KSA+PSAwXCJcblxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIHBhcmVuczogKHApIC0+IFxuICAgICAgICAjIGxvZyAncGFyZW5zJyBwXG4gICAgICAgIFwiKCN7QG5vZGVzIHAuZXhwc30pXCJcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwXG5cbiAgICBvYmplY3Q6IChwKSAtPiBcbiAgICAgICAgbm9kZXMgPSBwLmtleXZhbHMubWFwIChzKSA9PiBAYXRvbSBzXG4gICAgICAgIG5vZGVzID0gbm9kZXMubWFwIChuKSAtPiBpZiAnOicgaW4gbiB0aGVuIG4gZWxzZSBcIiN7bn06I3tufVwiICAgICAgICBcbiAgICAgICAgXCJ7I3tub2Rlcy5qb2luICcsJ319XCJcblxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBrZXl2YWw6IChwKSAtPlxuICAgICAgICBrZXkgPSBAbm9kZSBwLmtleVxuICAgICAgICBpZiBrZXlbMF0gbm90IGluIFwiJ1xcXCJcIiBhbmQgL1tcXC5cXCxcXDtcXCpcXCtcXC1cXC9cXD1cXHxdLy50ZXN0IGtleSB0aGVuIGtleSA9IFwiJyN7a2V5fSdcIlxuICAgICAgICBcIiN7a2V5fToje0BhdG9tKHAudmFsKX1cIlxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcblxuICAgIHByb3A6ICAgKHApIC0+XG5cbiAgICAgICAgXCIje0Bub2RlKHAub2JqKX0uI3tAbm9kZSBwLnByb3B9XCJcblxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBpbmRleDogIChwKSAtPlxuXG4gICAgICAgIGlmIHNsaWNlID0gcC5zbGlkeC5zbGljZVxuXG4gICAgICAgICAgICBmcm9tID0gaWYgc2xpY2UuZnJvbT8gdGhlbiBAbm9kZSBzbGljZS5mcm9tIGVsc2UgJzAnXG5cbiAgICAgICAgICAgIGFkZE9uZSA9IHNsaWNlLmRvdHMudGV4dCA9PSAnLi4nXG5cbiAgICAgICAgICAgIHVwdG8gPSBpZiBzbGljZS51cHRvPyB0aGVuIEBub2RlIHNsaWNlLnVwdG8gZWxzZSAnLTEnXG5cbiAgICAgICAgICAgIGlmIHNsaWNlLnVwdG8/LnR5cGUgPT0gJ251bScgb3Igc2xpY2UudXB0bz8ub3BlcmF0aW9uIG9yIHVwdG8gPT0gJy0xJ1xuICAgICAgICAgICAgICAgIHUgPSBwYXJzZUludCB1cHRvXG4gICAgICAgICAgICAgICAgaWYgTnVtYmVyLmlzRmluaXRlIHVcbiAgICAgICAgICAgICAgICAgICAgaWYgdSA9PSAtMSBhbmQgYWRkT25lXG4gICAgICAgICAgICAgICAgICAgICAgICB1cHBlciA9ICcnXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHUgKz0gMSBpZiBhZGRPbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwcGVyID0gXCIsICN7dX1cIlxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdXBwZXIgPSBcIiwgI3t1cHRvfVwiXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgYWRkT25lIHRoZW4gaWYgdXB0byB0aGVuIHVwcGVyID0gXCIsIHR5cGVvZiAje3VwdG99ID09PSAnbnVtYmVyJyA/ICN7dXB0b30rMSA6IEluZmluaXR5XCJcbiAgICAgICAgICAgICAgICBlbHNlICAgICAgICAgICAgICAgICAgICAgICAgdXBwZXIgPSBcIiwgdHlwZW9mICN7dXB0b30gPT09ICdudW1iZXInID8gI3t1cHRvfSA6IC0xXCJcblxuICAgICAgICAgICAgXCIje0BhdG9tKHAuaWR4ZWUpfS5zbGljZSgje2Zyb219I3t1cHBlciA/ICcnfSlcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBwLnNsaWR4LnRleHQ/WzBdID09ICctJ1xuICAgICAgICAgICAgICAgIG5pID0gcGFyc2VJbnQgcC5zbGlkeC50ZXh0XG4gICAgICAgICAgICAgICAgaWYgbmkgPT0gLTFcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiI3tAbm9kZShwLmlkeGVlKX0uc2xpY2UoI3tuaX0pWzBdXCJcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIiN7QG5vZGUocC5pZHhlZSl9LnNsaWNlKCN7bml9LCN7bmkrMX0pWzBdXCJcblxuICAgICAgICAgICAgXCIje0Bub2RlKHAuaWR4ZWUpfVsje0Bub2RlIHAuc2xpZHh9XVwiXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG4gICAgYXJyYXk6IChwKSAtPlxuXG4gICAgICAgIGlmIHAuaXRlbXNbMF0/LnNsaWNlXG4gICAgICAgICAgICBAc2xpY2UgcC5pdGVtc1swXS5zbGljZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBcIlsje0Bub2RlcyBwLml0ZW1zLCAnLCd9XVwiXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMFxuXG4gICAgc2xpY2U6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgcC5mcm9tLnR5cGUgPT0gJ251bScgPT0gcC51cHRvPy50eXBlXG4gICAgICAgICAgICBmcm9tID0gcGFyc2VJbnQgcC5mcm9tLnRleHRcbiAgICAgICAgICAgIHVwdG8gPSBwYXJzZUludCBwLnVwdG8udGV4dFxuICAgICAgICAgICAgaWYgdXB0by1mcm9tIDw9IDEwXG4gICAgICAgICAgICAgICAgaWYgcC5kb3RzLnRleHQgPT0gJy4uLicgdGhlbiB1cHRvLS1cbiAgICAgICAgICAgICAgICAnWycrKCh4IGZvciB4IGluIFtmcm9tLi51cHRvXSkuam9pbiAnLCcpKyddJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG8gPSBpZiBwLmRvdHMudGV4dCA9PSAnLi4uJyB0aGVuICc8JyBlbHNlICc8PSdcbiAgICAgICAgICAgICAgICBcIihmdW5jdGlvbigpIHsgdmFyIHIgPSBbXTsgZm9yICh2YXIgaSA9ICN7ZnJvbX07IGkgI3tvfSAje3VwdG99OyBpKyspeyByLnB1c2goaSk7IH0gcmV0dXJuIHI7IH0pLmFwcGx5KHRoaXMpXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbyA9IGlmIHAuZG90cy50ZXh0ID09ICcuLi4nIHRoZW4gJzwnIGVsc2UgJzw9J1xuICAgICAgICAgICAgXCIoZnVuY3Rpb24oKSB7IHZhciByID0gW107IGZvciAodmFyIGkgPSAje0Bub2RlIHAuZnJvbX07IGkgI3tvfSAje0Bub2RlIHAudXB0b307IGkrKyl7IHIucHVzaChpKTsgfSByZXR1cm4gcjsgfSkuYXBwbHkodGhpcylcIlxuXG4gICAgIyAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgZnJlc2hWYXI6IChuYW1lLCBzdWZmaXg9MCkgLT5cblxuICAgICAgICBmb3IgdmFycyBpbiBAdmFyc3RhY2tcbiAgICAgICAgICAgIGZvciB2IGluIHZhcnNcbiAgICAgICAgICAgICAgICBpZiB2LnRleHQgPT0gbmFtZSArIChzdWZmaXggb3IgJycpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBAZnJlc2hWYXIgbmFtZSwgc3VmZml4KzFcblxuICAgICAgICBAdmFyc3RhY2tbLTFdLnB1c2ggdGV4dDpuYW1lICsgKHN1ZmZpeCBvciAnJylcbiAgICAgICAgbmFtZSArIChzdWZmaXggb3IgJycpXG5cbiAgICB2ZXJiOiAtPiBpZiBAdmVyYm9zZSB0aGVuIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHNcbiAgICBcbiAgICBpbmQ6IC0+XG5cbiAgICAgICAgb2kgPSBAaW5kZW50XG4gICAgICAgIEBpbmRlbnQgKz0gJyAgICAnXG4gICAgICAgIG9pXG5cbiAgICBkZWQ6IC0+IEBpbmRlbnQgPSBAaW5kZW50Wy4uLi00XVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgIFxuICAgIHN0cmlwb2w6IChjaHVua3MpIC0+XG4gICAgICAgIFxuICAgICAgIHMgPSAnYCdcbiAgICAgICBmb3IgY2h1bmsgaW4gY2h1bmtzXG4gICAgICAgICAgIHQgPSBjaHVuay50ZXh0XG4gICAgICAgICAgIHN3aXRjaCBjaHVuay50eXBlXG4gICAgICAgICAgICAgICB3aGVuICdvcGVuJyAgdGhlbiBzKz0gdCsnJHsnXG4gICAgICAgICAgICAgICB3aGVuICdjbG9zZScgdGhlbiBzKz0gJ30nK3RcbiAgICAgICAgICAgICAgIHdoZW4gJ21pZGwnICB0aGVuIHMrPSAnfScrdCsnJHsnXG4gICAgICAgICAgICAgICB3aGVuICdjb2RlJyAgXG4gICAgICAgICAgICAgICAgICAgYyA9IEBjb21waWxlIHRcbiAgICAgICAgICAgICAgICAgICBpZiBjWzBdID09ICc7JyB0aGVuIGMgPSBjWzEuLl1cbiAgICAgICAgICAgICAgICAgICBzKz0gY1xuICAgICAgIHMgKz0gJ2AnXG4gICAgICAgc1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlbmRlcmVyXG4iXX0=
//# sourceURL=../coffee/renderer.coffee