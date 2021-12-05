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
                    case 'function':
                        return this["function"](v);
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
        if (/(?<!['"\[])[▾]/.test(s)) {
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
        var b, base, bind, bn, constructor, len, len1, mi, mthds, q, r, ref1, ref2, ref3, results, s, w;
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
            ref1 = this.prepareMethods(mthds), constructor = ref1[0], bind = ref1[1];
            if (bind.length) {
                for (q = 0, len = bind.length; q < len; q++) {
                    b = bind[q];
                    bn = b.keyval.val.func.name.text;
                    if ((base = constructor.keyval.val.func.body).exps != null) {
                        base.exps;
                    } else {
                        base.exps = [];
                    }
                    constructor.keyval.val.func.body.exps.unshift({
                        type: 'code',
                        text: "this." + bn + " = this." + bn + ".bind(this)"
                    });
                }
            }
            this.indent = '    ';
            ref3 = (function() {
                results = [];
                for (var w = 0, ref2 = mthds.length; 0 <= ref2 ? w < ref2 : w > ref2; 0 <= ref2 ? w++ : w--){ results.push(w); }
                return results;
            }).apply(this);
            for (r = 0, len1 = ref3.length; r < len1; r++) {
                mi = ref3[r];
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

    Renderer.prototype.mthd = function(n) {
        var s;
        if (n.keyval) {
            s = '\n';
            s += this.indent + this.func(n.keyval.val.func);
        }
        return s;
    };

    Renderer.prototype["function"] = function(n) {
        var b, base, bind, bn, constructor, len, len1, mi, mthds, q, r, ref1, ref2, ref3, results, s, w;
        s = '\n';
        s += n.name.text + " = (function ()\n";
        s += '{\n';
        mthds = n.body;
        if (mthds != null ? mthds.length : void 0) {
            ref1 = this.prepareMethods(mthds), constructor = ref1[0], bind = ref1[1];
            if (bind.length) {
                for (q = 0, len = bind.length; q < len; q++) {
                    b = bind[q];
                    bn = b.keyval.val.func.name.text;
                    if ((base = constructor.keyval.val.func.body).exps != null) {
                        base.exps;
                    } else {
                        base.exps = [];
                    }
                    constructor.keyval.val.func.body.exps.unshift({
                        type: 'code',
                        text: "this[\"" + bn + "\"] = this[\"" + bn + "\"].bind(this)"
                    });
                }
            }
            this.indent = '    ';
            ref3 = (function() {
                results = [];
                for (var w = 0, ref2 = mthds.length; 0 <= ref2 ? w < ref2 : w > ref2; 0 <= ref2 ? w++ : w--){ results.push(w); }
                return results;
            }).apply(this);
            for (r = 0, len1 = ref3.length; r < len1; r++) {
                mi = ref3[r];
                s += this.funcs(mthds[mi], n.name.text);
                s += '\n';
            }
            this.indent = '';
        }
        s += "    return " + n.name.text + "\n";
        s += '})()\n';
        return s;
    };

    Renderer.prototype.funcs = function(n, className) {
        var f, s;
        s = '';
        if (n.keyval) {
            f = n.keyval.val.func;
            if (f.name.text === 'constructor') {
                s = this.indent + this.func(f, 'function ' + className);
                s += '\n';
            } else if (f.name.text.startsWith('static')) {
                s = this.indent + this.func(f, className + "[\"" + f.name.text.slice(7) + "\"] = function");
                s += '\n';
            } else {
                s = this.indent + this.func(f, className + ".prototype[\"" + f.name.text + "\"] = function");
                s += '\n';
            }
        }
        return s;
    };

    Renderer.prototype.prepareMethods = function(mthds) {
        var ast, bind, constructor, len, m, name, q, ref1;
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
        return [constructor, bind];
    };

    Renderer.prototype.func = function(n, name) {
        var args, gi, len, q, ref1, ref2, ref3, ref4, ref5, ref6, s, ss, str, t, ths, v, vs;
        if (!n) {
            return '';
        }
        gi = this.ind();
        if (name != null) {
            name;
        } else {
            name = (ref1 = (ref2 = n.name) != null ? ref2.text : void 0) != null ? ref1 : 'function';
        }
        s = name;
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
        var close, first, i, keyval, len, len1, o, open, opmap, prfx, q, r, ref1, ref10, ref11, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, ro, s, sep, val;
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
            if (op.lhs.array) {
                s = '';
                ref4 = op.lhs.array.items;
                for (r = 0, len1 = ref4.length; r < len1; r++) {
                    val = ref4[r];
                    i = op.lhs.array.items.indexOf(val);
                    s += val.text + " = " + (this.atom(op.rhs)) + "[" + i + "]\n";
                }
                return s;
            }
        } else if (o === '!') {
            if (((ref5 = op.rhs) != null ? ref5.incond : void 0) || ((ref6 = op.rhs) != null ? (ref7 = ref6.operation) != null ? (ref8 = ref7.operator) != null ? ref8.text : void 0 : void 0 : void 0) === '=') {
                open = '(';
                close = ')';
            }
        } else if (((ref9 = op.rhs) != null ? (ref10 = ref9.operation) != null ? ref10.operator.text : void 0 : void 0) === '=') {
            open = '(';
            close = ')';
        }
        first = firstLineCol(op.lhs);
        prfx = first.col === 0 && ((ref11 = op.rhs) != null ? ref11.func : void 0) ? '\n' : '';
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUVBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQThDLE9BQUEsQ0FBUSxTQUFSLENBQTlDLEVBQUUsaUJBQUYsRUFBUyxpQkFBVCxFQUFnQiwrQkFBaEIsRUFBOEI7O0FBRXhCO0lBRUMsa0JBQUMsSUFBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxNQUFELEdBQVU7UUFRVixJQUFDLENBQUEsS0FBRCx5Q0FBcUIsQ0FBRTtRQUN2QixJQUFDLENBQUEsT0FBRCx5Q0FBcUIsQ0FBRTtJQVh4Qjs7dUJBYUgsT0FBQSxHQUFTLFNBQUMsSUFBRDtBQUVMLFlBQUE7UUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O1lBQ1AsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxVQUFXLElBQUk7O2VBQ2hCLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFpQixJQUFqQjtJQUpLOzt1QkFNVCxNQUFBLEdBQVEsU0FBQyxHQUFEO0FBRUosWUFBQTtRQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBQyxHQUFHLENBQUMsSUFBTDtRQUNaLElBQUMsQ0FBQSxNQUFELEdBQVU7UUFDVixDQUFBLEdBQUk7UUFFSixJQUFHLEtBQUEsQ0FBTSxHQUFHLENBQUMsSUFBVixDQUFIO1lBQ0ksRUFBQSxHQUFLOztBQUFDO0FBQUE7cUJBQUEsc0NBQUE7O2lDQUFBLENBQUMsQ0FBQztBQUFGOztnQkFBRCxDQUEwQixDQUFDLElBQTNCLENBQWdDLElBQWhDO1lBQ0wsQ0FBQSxJQUFLLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQSxNQUFBLEdBQU8sRUFB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LENBQVQ7b0JBQ0osSUFBRyxDQUFFLENBQUEsQ0FBQSxDQUFGLEtBQVEsR0FBWDt3QkFBb0IsQ0FBQSxHQUFJLENBQUUsVUFBMUI7O29CQUNBLENBQUEsSUFBSTtBQVBaO0FBRko7UUFVQSxDQUFBLElBQUs7ZUFDTDtJQWRNOzs7Ozs7QUFnQmIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbmtzdHIgID0gcmVxdWlyZSAna3N0cidcbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcblxueyB2YWxpZCwgZW1wdHksIGZpcnN0TGluZUNvbCwgbGFzdExpbmVDb2wgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIFJlbmRlcmVyXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQGhlYWRlciA9IFwiXCJcIlxuICAgICAgICAgICAgY29uc3QgX2tfID0ge1xuICAgICAgICAgICAgICAgIGxpc3Q6ICAgZnVuY3Rpb24gKGwpICAge3JldHVybiAobCAhPSBudWxsID8gdHlwZW9mIGwubGVuZ3RoID09PSAnbnVtYmVyJyA/IGwgOiBbXSA6IFtdKX1cbiAgICAgICAgICAgICAgICBsZW5ndGg6IGZ1bmN0aW9uIChsKSAgIHtyZXR1cm4gKGwgIT0gbnVsbCA/IHR5cGVvZiBsLmxlbmd0aCA9PT0gJ251bWJlcicgPyBsLmxlbmd0aCA6IDAgOiAwKX0sXG4gICAgICAgICAgICAgICAgaW46ICAgICBmdW5jdGlvbiAoYSxsKSB7cmV0dXJuIChsICE9IG51bGwgPyB0eXBlb2YgbC5pbmRleE9mID09PSAnZnVuY3Rpb24nID8gbC5pbmRleE9mKGEpID49IDAgOiBmYWxzZSA6IGZhbHNlKX1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgICAgIEBkZWJ1ZyAgID0gQGtvZGUuYXJncz8uZGVidWdcbiAgICAgICAgQHZlcmJvc2UgPSBAa29kZS5hcmdzPy52ZXJib3NlXG5cbiAgICBjb21waWxlOiAoY29kZSkgLT4gXG4gICAgXG4gICAgICAgIEtvZGUgPSByZXF1aXJlICcuL2tvZGUnXG4gICAgICAgIEBzdWJLb2RlID89IG5ldyBLb2RlIFxuICAgICAgICBAc3ViS29kZS5jb21waWxlIGNvZGVcbiAgICAgICAgXG4gICAgcmVuZGVyOiAoYXN0KSAtPlxuXG4gICAgICAgIEB2YXJzdGFjayA9IFthc3QudmFyc11cbiAgICAgICAgQGluZGVudCA9ICcnXG4gICAgICAgIHMgPSAnJ1xuXG4gICAgICAgIGlmIHZhbGlkIGFzdC52YXJzXG4gICAgICAgICAgICB2cyA9ICh2LnRleHQgZm9yIHYgaW4gYXN0LnZhcnMpLmpvaW4gJywgJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgXCJ2YXIgI3t2c31cXG5cXG5cIlxuXG4gICAgICAgIHMgKz0gQG5vZGVzIGFzdC5leHBzLCAnXFxuJ1xuICAgICAgICBzXG5cbiAgICBub2RlczogKG5vZGVzLCBzZXA9JywnKSAtPlxuXG4gICAgICAgIHNsID0gbm9kZXMubWFwIChzKSA9PiBAYXRvbSBzXG4gICAgICAgIFxuICAgICAgICBpZiBzZXAgPT0gJ1xcbidcbiAgICAgICAgICAgIHNsID0gc2wubWFwIChzKSA9PlxuICAgICAgICAgICAgICAgIHN0cmlwcGVkID0ga3N0ci5sc3RyaXAgc1xuICAgICAgICAgICAgICAgIGlmIHN0cmlwcGVkWzBdIGluICcoWycgdGhlbiAnOycrcyBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIHN0cmlwcGVkLnN0YXJ0c1dpdGggJ2Z1bmN0aW9uJyB0aGVuIFwiKCN7c30pXCJcbiAgICAgICAgICAgICAgICBlbHNlIHNcbiAgICAgICAgICAgIFxuICAgICAgICBzcyA9IHNsLmpvaW4gc2VwXG5cbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcblxuICAgIG5vZGU6IChleHApIC0+XG5cbiAgICAgICAgcmV0dXJuICcnIGlmIG5vdCBleHBcblxuICAgICAgICBpZiBleHAudHlwZT8gYW5kIGV4cC50ZXh0PyB0aGVuIHJldHVybiBAdG9rZW4gZXhwXG5cbiAgICAgICAgaWYgZXhwIGluc3RhbmNlb2YgQXJyYXkgdGhlbiByZXR1cm4gKEBub2RlKGEpIGZvciBhIGluIGV4cCkuam9pbiAnO1xcbidcblxuICAgICAgICBzID0gJydcblxuICAgICAgICBmb3Igayx2IG9mIGV4cFxuXG4gICAgICAgICAgICBzKz0gc3dpdGNoIGtcbiAgICAgICAgICAgICAgICB3aGVuICdpZicgICAgICAgIHRoZW4gQGlmIHZcbiAgICAgICAgICAgICAgICB3aGVuICdmb3InICAgICAgIHRoZW4gQGZvciB2XG4gICAgICAgICAgICAgICAgd2hlbiAnd2hpbGUnICAgICB0aGVuIEB3aGlsZSB2XG4gICAgICAgICAgICAgICAgd2hlbiAncmV0dXJuJyAgICB0aGVuIEByZXR1cm4gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2NsYXNzJyAgICAgdGhlbiBAY2xhc3MgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2Z1bmN0aW9uJyAgdGhlbiBAZnVuY3Rpb24gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3N3aXRjaCcgICAgdGhlbiBAc3dpdGNoIHZcbiAgICAgICAgICAgICAgICB3aGVuICd3aGVuJyAgICAgIHRoZW4gQHdoZW4gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2Fzc2VydCcgICAgdGhlbiBAYXNzZXJ0IHZcbiAgICAgICAgICAgICAgICB3aGVuICdxbXJrb3AnICAgIHRoZW4gQHFtcmtvcCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnc3RyaXBvbCcgICB0aGVuIEBzdHJpcG9sIHZcbiAgICAgICAgICAgICAgICB3aGVuICdxbXJrY29sb24nIHRoZW4gQHFtcmtjb2xvbiB2XG4gICAgICAgICAgICAgICAgd2hlbiAnb3BlcmF0aW9uJyB0aGVuIEBvcGVyYXRpb24gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2luY29uZCcgICAgdGhlbiBAaW5jb25kIHZcbiAgICAgICAgICAgICAgICB3aGVuICdwYXJlbnMnICAgIHRoZW4gQHBhcmVucyB2XG4gICAgICAgICAgICAgICAgd2hlbiAnb2JqZWN0JyAgICB0aGVuIEBvYmplY3QgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2tleXZhbCcgICAgdGhlbiBAa2V5dmFsIHZcbiAgICAgICAgICAgICAgICB3aGVuICdhcnJheScgICAgIHRoZW4gQGFycmF5IHZcbiAgICAgICAgICAgICAgICB3aGVuICdsY29tcCcgICAgIHRoZW4gQGxjb21wIHZcbiAgICAgICAgICAgICAgICB3aGVuICdpbmRleCcgICAgIHRoZW4gQGluZGV4IHZcbiAgICAgICAgICAgICAgICB3aGVuICdzbGljZScgICAgIHRoZW4gQHNsaWNlIHZcbiAgICAgICAgICAgICAgICB3aGVuICdwcm9wJyAgICAgIHRoZW4gQHByb3AgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2VhY2gnICAgICAgdGhlbiBAZWFjaCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnZnVuYycgICAgICB0aGVuIEBmdW5jIHZcbiAgICAgICAgICAgICAgICB3aGVuICdjYWxsJyAgICAgIHRoZW4gQGNhbGwgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3RyeScgICAgICAgdGhlbiBAdHJ5IHZcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGxvZyBSNChcInJlbmRlcmVyLm5vZGUgdW5oYW5kbGVkIGtleSAje2t9IGluIGV4cFwiKSwgZXhwICMgaWYgQGRlYnVnIG9yIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgICAgICcnXG4gICAgICAgIHNcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxuICAgIGF0b206IChleHApIC0+XG5cbiAgICAgICAgQGZpeEFzc2VydHMgQG5vZGUgZXhwXG4gICAgICAgIFxuICAgIHFtcmtvcDogKHApIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBwLmxocy50eXBlID09ICd2YXInIG9yIG5vdCBwLnFtcmtcbiAgICAgICAgICAgIGxocyA9IEBhdG9tIHAubGhzXG4gICAgICAgICAgICBcIigje2xoc30gIT0gbnVsbCA/ICN7bGhzfSA6ICN7QGF0b20gcC5yaHN9KVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHZuID0gXCJfI3twLnFtcmsubGluZX1fI3twLnFtcmsuY29sfV9cIlxuICAgICAgICAgICAgXCIoKCN7dm59PSN7QGF0b20gcC5saHN9KSAhPSBudWxsID8gI3t2bn0gOiAje0BhdG9tIHAucmhzfSlcIlxuXG4gICAgcW1ya2NvbG9uOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIFwiKCN7QGF0b20gcC5saHN9ID8gI3tAYXRvbSBwLm1pZH0gOiAje0BhdG9tIHAucmhzfSlcIlxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgMDAwICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMFxuXG4gICAgYXNzZXJ0OiAocCkgLT5cblxuICAgICAgICBAdmVyYiAnZml4JyBwXG4gICAgICAgIGlmIHAub2JqLnR5cGUgIT0gJ3ZhcicgYW5kIG5vdCBwLm9iai5pbmRleFxuICAgICAgICAgICAgJ+KWvicgKyBAbm9kZShwLm9iaikgKyBcIuKWuCN7cC5xbXJrLmxpbmV9XyN7cC5xbXJrLmNvbH3il4JcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAn4pa+JyArIEBub2RlKHAub2JqKSArIFwi4pa4I3swfV8jezB94peCXCIgIyBoaW50IGZpeEFzc2VydCB0byBub3QgdXNlIGdlbmVyYXRlZCB2YXJcbiAgICBcbiAgICBmaXhBc3NlcnRzOiAocykgLT5cblxuICAgICAgICBAdmVyYiAnZml4QXNzZXJ0cycgc1xuICAgICAgICBcbiAgICAgICAgaWYgbm90IHM/XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gJycgaWYgbm90IHM/IG9yIHMubGVuZ3RoID09IDBcbiAgICAgICAgcmV0dXJuIHMgaWYgcyBpbiBbJ+KWvicgXCIn4pa+J1wiICdcIuKWvlwiJ11cblxuICAgICAgICB3aGlsZSBzWzBdID09ICfilr4nIHRoZW4gcyA9IHNbMS4uXVxuICAgICAgICBpZiAvKD88IVsnXCJcXFtdKVvilr5dLy50ZXN0IHNcbiAgICAgICAgICAgIGkgPSBzLmluZGV4T2YgJ+KWvidcbiAgICAgICAgICAgIHJldHVybiBzWy4uLmldICsgQGZpeEFzc2VydHMgc1tpKzEuLl1cbiAgICAgICAgICAgIFxuICAgICAgICBpZiAnXFxuJyBpbiBzXG4gICAgICAgICAgICBpID0gcy5pbmRleE9mICdcXG4nXG4gICAgICAgICAgICAjIGxvZyAnTkVXTElORSEnIGksIHMubGVuZ3RoLCBcIj4+PiN7c1suLi5pXX08PDxcIiwgXCI+Pj4je3NbaS4uXX08PDxcIiwgc1suLi5pXSA9PSBzLCBzW2kuLl0ubGVuZ3RoXG4gICAgICAgICAgICByZXR1cm4gQGZpeEFzc2VydHMoc1suLi5pXSkgKyBzW2kuLl1cbiAgICAgICAgXG4gICAgICAgIHNwbHQgPSBzLnNwbGl0IC/ilrhcXGQrX1xcZCvil4IvXG4gICAgICAgIG10Y2ggPSBzLm1hdGNoIC/ilrhcXGQrX1xcZCvil4IvZ1xuXG4gICAgICAgIGlmIHNwbHQubGVuZ3RoID4gMVxuXG4gICAgICAgICAgICBtdGNoID0gbXRjaC5tYXAgKG0pIC0+IFwiXyN7bVsxLi4tMl19X1wiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHNwbHRbLTFdID09ICcnICMgYXNzZXJ0IGVuZHMgd2l0aCA/XG4gICAgICAgICAgICAgICAgaWYgc3BsdC5sZW5ndGggPiAyXG4gICAgICAgICAgICAgICAgICAgIHNwbHQucG9wKClcbiAgICAgICAgICAgICAgICAgICAgbXRjaC5wb3AoKVxuICAgICAgICAgICAgICAgICAgICB0ID0gc3BsdC5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIHNwbHQubGVuZ3RoICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHQgKz0gJ+KWuCcrbXRjaC5zaGlmdCgpWzEuLi4tMV0rJ+KXgidcbiAgICAgICAgICAgICAgICAgICAgICAgIHQgKz0gc3BsdC5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIHQgPSBAZml4QXNzZXJ0cyB0XG4gICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgdCA9IHNwbHRbMF1cbiAgICAgICAgICAgICAgICByZXR1cm4gIFwiKCN7dH0gIT0gbnVsbClcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBsb2cgc3BsdCwgbXRjaFxuXG4gICAgICAgICAgICBzID0gJydcblxuICAgICAgICAgICAgZm9yIGkgaW4gMC4uLm10Y2gubGVuZ3RoXG5cbiAgICAgICAgICAgICAgICBpZiBtdGNoLmxlbmd0aCA+IDEgXG4gICAgICAgICAgICAgICAgICAgIHJocyA9IGlmIGkgdGhlbiAoaWYgbXRjaFtpLTFdICE9IFwiXzBfMF9cIiB0aGVuIG10Y2hbaS0xXSBlbHNlIGwpK3NwbHRbaV0gZWxzZSBzcGx0WzBdXG4gICAgICAgICAgICAgICAgICAgIGlmIG10Y2hbaV0gIT0gXCJfMF8wX1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBsID0gXCIoI3ttdGNoW2ldfT0je3Joc30pXCJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgbCA9IHJoc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbCA9IHNwbHRbMF1cblxuICAgICAgICAgICAgICAgIGlmIHNwbHRbaSsxXVswXSA9PSAnKCdcbiAgICAgICAgICAgICAgICAgICAgcyArPSBcInR5cGVvZiAje2x9ID09PSBcXFwiZnVuY3Rpb25cXFwiID8gXCJcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gXCIje2x9ICE9IG51bGwgPyBcIlxuXG4gICAgICAgICAgICBpZiBtdGNoLmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICBpZiBtdGNoWy0xXSAhPSBcIl8wXzBfXCJcbiAgICAgICAgICAgICAgICAgICAgcyArPSBtdGNoWy0xXStzcGx0Wy0xXVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcyArPSBsK3NwbHRbLTFdXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcyArPSBzcGx0WzBdK3NwbHRbMV1cblxuICAgICAgICAgICAgZm9yIGkgaW4gMC4uLm10Y2gubGVuZ3RoIHRoZW4gcyArPSBcIiA6IHVuZGVmaW5lZFwiXG5cbiAgICAgICAgICAgIHMgPSBcIigje3N9KVwiXG4gICAgICAgIHNcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuXG4gICAgY2xhc3M6IChuKSAtPlxuXG4gICAgICAgIHMgPSAnXFxuJ1xuICAgICAgICBzICs9IFwiY2xhc3MgI3tuLm5hbWUudGV4dH1cIlxuXG4gICAgICAgIGlmIG4uZXh0ZW5kc1xuICAgICAgICAgICAgcyArPSBcIiBleHRlbmRzIFwiICsgbi5leHRlbmRzLm1hcCgoZSkgLT4gZS50ZXh0KS5qb2luICcsICdcblxuICAgICAgICBzICs9ICdcXG57J1xuXG4gICAgICAgIG10aGRzID0gbi5ib2R5XG5cbiAgICAgICAgaWYgbXRoZHM/Lmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBbY29uc3RydWN0b3IsIGJpbmRdID0gQHByZXBhcmVNZXRob2RzIG10aGRzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGJpbmQubGVuZ3RoXG4gICAgICAgICAgICAgICAgZm9yIGIgaW4gYmluZFxuICAgICAgICAgICAgICAgICAgICBibiA9IGIua2V5dmFsLnZhbC5mdW5jLm5hbWUudGV4dFxuICAgICAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5rZXl2YWwudmFsLmZ1bmMuYm9keS5leHBzID89IFtdXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLmtleXZhbC52YWwuZnVuYy5ib2R5LmV4cHMudW5zaGlmdFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NvZGUnXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcInRoaXMuI3tibn0gPSB0aGlzLiN7Ym59LmJpbmQodGhpcylcIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAaW5kZW50ID0gJyAgICAnXG4gICAgICAgICAgICBmb3IgbWkgaW4gMC4uLm10aGRzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHMgKz0gJ1xcbicgaWYgbWlcbiAgICAgICAgICAgICAgICBzICs9IEBtdGhkIG10aGRzW21pXVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgQGluZGVudCA9ICcnXG4gICAgICAgIHMgKz0gJ31cXG4nXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBtdGhkOiAobikgLT5cblxuICAgICAgICBpZiBuLmtleXZhbFxuICAgICAgICAgICAgcyAgPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQGZ1bmMgbi5rZXl2YWwudmFsLmZ1bmNcbiAgICAgICAgc1xuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBmdW5jdGlvbjogKG4pIC0+XG5cbiAgICAgICAgcyA9ICdcXG4nXG4gICAgICAgIHMgKz0gXCIje24ubmFtZS50ZXh0fSA9IChmdW5jdGlvbiAoKVxcblwiXG4gICAgICAgIHMgKz0gJ3tcXG4nXG5cbiAgICAgICAgIyBpZiBuLmV4dGVuZHNcbiAgICAgICAgICAgICMgcyArPSBcIiBleHRlbmRzIFwiICsgbi5leHRlbmRzLm1hcCgoZSkgLT4gZS50ZXh0KS5qb2luICcsICdcblxuICAgICAgICBtdGhkcyA9IG4uYm9keVxuXG4gICAgICAgIGlmIG10aGRzPy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgW2NvbnN0cnVjdG9yLCBiaW5kXSA9IEBwcmVwYXJlTWV0aG9kcyBtdGhkc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBiaW5kLmxlbmd0aFxuICAgICAgICAgICAgICAgIGZvciBiIGluIGJpbmRcbiAgICAgICAgICAgICAgICAgICAgYm4gPSBiLmtleXZhbC52YWwuZnVuYy5uYW1lLnRleHRcbiAgICAgICAgICAgICAgICAgICAgY29uc3RydWN0b3Iua2V5dmFsLnZhbC5mdW5jLmJvZHkuZXhwcyA/PSBbXVxuICAgICAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5rZXl2YWwudmFsLmZ1bmMuYm9keS5leHBzLnVuc2hpZnRcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjb2RlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJ0aGlzW1xcXCIje2JufVxcXCJdID0gdGhpc1tcXFwiI3tibn1cXFwiXS5iaW5kKHRoaXMpXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGluZGVudCA9ICcgICAgJ1xuICAgICAgICAgICAgZm9yIG1pIGluIDAuLi5tdGhkcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBzICs9IEBmdW5jcyBtdGhkc1ttaV0sIG4ubmFtZS50ZXh0XG4gICAgICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgQGluZGVudCA9ICcnXG4gICAgICAgICAgICBcbiAgICAgICAgcyArPSBcIiAgICByZXR1cm4gI3tuLm5hbWUudGV4dH1cXG5cIlxuICAgICAgICBzICs9ICd9KSgpXFxuJ1xuICAgICAgICBzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGZ1bmNzOiAobiwgY2xhc3NOYW1lKSAtPlxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBpZiBuLmtleXZhbFxuICAgICAgICAgICAgZiA9IG4ua2V5dmFsLnZhbC5mdW5jXG4gICAgICAgICAgICBpZiBmLm5hbWUudGV4dCA9PSAnY29uc3RydWN0b3InXG4gICAgICAgICAgICAgICAgcyA9IEBpbmRlbnQgKyBAZnVuYyBmLCAnZnVuY3Rpb24gJyArIGNsYXNzTmFtZVxuICAgICAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIGVsc2UgaWYgZi5uYW1lLnRleHQuc3RhcnRzV2l0aCAnc3RhdGljJ1xuICAgICAgICAgICAgICAgIHMgPSBAaW5kZW50ICsgQGZ1bmMgZiwgXCIje2NsYXNzTmFtZX1bXFxcIiN7Zi5uYW1lLnRleHRbNy4uXX1cXFwiXSA9IGZ1bmN0aW9uXCJcbiAgICAgICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcyA9IEBpbmRlbnQgKyBAZnVuYyBmLCBcIiN7Y2xhc3NOYW1lfS5wcm90b3R5cGVbXFxcIiN7Zi5uYW1lLnRleHR9XFxcIl0gPSBmdW5jdGlvblwiXG4gICAgICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICBzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcblxuICAgIHByZXBhcmVNZXRob2RzOiAobXRoZHMpIC0+XG5cbiAgICAgICAgYmluZCA9IFtdXG4gICAgICAgIGZvciBtIGluIG10aGRzXG4gICAgICAgICAgICBpZiBub3QgbS5rZXl2YWxcbiAgICAgICAgICAgICAgICBwcmludC5hc3QgJ25vdCBhbiBtZXRob2Q/JyBtXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIGlmIG5vdCBtLmtleXZhbC52YWwuZnVuY1xuICAgICAgICAgICAgICAgIHByaW50LmFzdCAnbm8gZnVuYyBmb3IgbWV0aG9kPycgbVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIG5hbWUgPSBtLmtleXZhbC52YWwuZnVuYy5uYW1lLnRleHRcbiAgICAgICAgICAgIGlmIG5hbWUgaW4gWydAJyAnY29uc3RydWN0b3InXVxuICAgICAgICAgICAgICAgIGlmIGNvbnN0cnVjdG9yIHRoZW4gZXJyb3IgJ21vcmUgdGhhbiBvbmUgY29uc3RydWN0b3I/J1xuICAgICAgICAgICAgICAgIG0ua2V5dmFsLnZhbC5mdW5jLm5hbWUudGV4dCA9ICdjb25zdHJ1Y3RvcidcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvciA9IG1cbiAgICAgICAgICAgIGVsc2UgaWYgbmFtZS5zdGFydHNXaXRoICdAJ1xuICAgICAgICAgICAgICAgIG0ua2V5dmFsLnZhbC5mdW5jLm5hbWUudGV4dCA9ICdzdGF0aWMgJyArIG5hbWVbMS4uXVxuICAgICAgICAgICAgZWxzZSBpZiBtLmtleXZhbC52YWwuZnVuYz8uYXJyb3cudGV4dCA9PSAnPT4nXG4gICAgICAgICAgICAgICAgYmluZC5wdXNoIG1cblxuICAgICAgICBpZiBiaW5kLmxlbmd0aCBhbmQgbm90IGNvbnN0cnVjdG9yICMgZm91bmQgc29tZSBtZXRob2RzIHRvIGJpbmQsIGJ1dCBubyBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgYXN0ID0gQGtvZGUuYXN0IFwiY29uc3RydWN0b3I6IC0+XCIgIyBjcmVhdGUgb25lIGZyb20gc2NyYXRjaFxuICAgICAgICAgICAgY29uc3RydWN0b3IgPSBhc3QuZXhwc1swXS5vYmplY3Qua2V5dmFsc1swXVxuICAgICAgICAgICAgY29uc3RydWN0b3Iua2V5dmFsLnZhbC5mdW5jLm5hbWUgPSB0eXBlOiduYW1lJyB0ZXh0Oidjb25zdHJ1Y3RvcidcbiAgICAgICAgICAgIG10aGRzLnVuc2hpZnQgY29uc3RydWN0b3JcblxuICAgICAgICBbY29uc3RydWN0b3IsIGJpbmRdXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMFxuXG4gICAgZnVuYzogKG4sIG5hbWUpIC0+XG5cbiAgICAgICAgcmV0dXJuICcnIGlmIG5vdCBuXG5cbiAgICAgICAgZ2kgPSBAaW5kKClcbiAgICAgICAgXG4gICAgICAgIG5hbWUgPz0gbi5uYW1lPy50ZXh0ID8gJ2Z1bmN0aW9uJ1xuXG4gICAgICAgIHMgPSBuYW1lXG4gICAgICAgIHMgKz0gJyAoJ1xuXG4gICAgICAgIGFyZ3MgPSBuLmFyZ3M/LnBhcmVucz8uZXhwc1xuICAgICAgICBpZiBhcmdzXG4gICAgICAgICAgICBbc3RyLCB0aHNdID0gQGFyZ3MgYXJnc1xuICAgICAgICAgICAgcyArPSBzdHJcblxuICAgICAgICBzICs9ICcpXFxuJ1xuICAgICAgICBzICs9IGdpICsgJ3snXG5cbiAgICAgICAgQHZhcnN0YWNrLnB1c2ggbi5ib2R5LnZhcnNcblxuICAgICAgICBpZiB2YWxpZCBuLmJvZHkudmFyc1xuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgdnMgPSAodi50ZXh0IGZvciB2IGluIG4uYm9keS52YXJzKS5qb2luICcsICdcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIFwidmFyICN7dnN9XFxuXCJcblxuICAgICAgICBmb3IgdCBpbiB0aHMgPyBbXVxuICAgICAgICAgICAgcyArPSAnXFxuJyArIEBpbmRlbnQgKyB0aHNcblxuICAgICAgICBpZiB2YWxpZCBuLmJvZHkuZXhwc1xuXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzcyA9IG4uYm9keS5leHBzLm1hcCAocykgPT4gQG5vZGUgc1xuICAgICAgICAgICAgc3MgPSBzcy5tYXAgKHMpID0+IEBpbmRlbnQgKyBzXG4gICAgICAgICAgICBzICs9IHNzLmpvaW4gJ1xcbidcbiAgICAgICAgICAgIHMgKz0gJ1xcbicgKyBnaVxuXG4gICAgICAgIHMgKz0gJ30nXG5cbiAgICAgICAgQHZhcnN0YWNrLnBvcCgpXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIFxuICAgICAgICBpZiBuLmFycm93LnRleHQgPT0gJz0+JyBhbmQgbm90IG4ubmFtZVxuICAgICAgICAgICAgcyA9IFwiKCN7c30pLmJpbmQodGhpcylcIlxuICAgICAgICBcbiAgICAgICAgc1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMFxuXG4gICAgYXJnczogKGFyZ3MpIC0+XG5cbiAgICAgICAgdGhzICA9IFtdXG4gICAgICAgIHVzZWQgPSB7fVxuXG4gICAgICAgIGZvciBhIGluIGFyZ3NcbiAgICAgICAgICAgIGlmIGEudGV4dCB0aGVuIHVzZWRbYS50ZXh0XSA9IGEudGV4dFxuXG4gICAgICAgIGFyZ3MgPSBhcmdzLm1hcCAoYSkgLT5cbiAgICAgICAgICAgIGlmIGEucHJvcCBhbmQgYS5wcm9wLm9iai50eXBlID09ICd0aGlzJ1xuICAgICAgICAgICAgICAgIHRoaXNWYXIgPSBhLnByb3AucHJvcFxuICAgICAgICAgICAgICAgIGlmIHVzZWRbdGhpc1Zhci50ZXh0XVxuICAgICAgICAgICAgICAgICAgICBmb3IgaSBpbiBbMS4uMTAwXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbm90IHVzZWRbdGhpc1Zhci50ZXh0K2ldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhzLnB1c2ggXCJ0aGlzLiN7dGhpc1Zhci50ZXh0fSA9ICN7dGhpc1Zhci50ZXh0K2l9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzVmFyLnRleHQgPSB0aGlzVmFyLnRleHQraVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZWRbdGhpc1Zhci50ZXh0XSA9IHRoaXNWYXIudGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aHMucHVzaCBcInRoaXMuI3t0aGlzVmFyLnRleHR9ID0gI3t0aGlzVmFyLnRleHR9XCJcblxuICAgICAgICAgICAgICAgIHRoaXNWYXJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhXG5cbiAgICAgICAgc3RyID0gYXJncy5tYXAoKGEpID0+IEBub2RlIGEpLmpvaW4gJywgJ1xuXG4gICAgICAgIFtzdHIsdGhzXVxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuXG4gICAgcmV0dXJuOiAobikgLT5cblxuICAgICAgICBzID0gJ3JldHVybidcbiAgICAgICAgcyArPSAnICcgKyBAbm9kZSBuLnZhbFxuICAgICAgICBrc3RyLnN0cmlwIHNcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwXG5cbiAgICBjYWxsOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHAuY2FsbGVlLnRleHQgaW4gWydsb2cnJ3dhcm4nJ2Vycm9yJ11cbiAgICAgICAgICAgIHAuY2FsbGVlLnRleHQgPSBcImNvbnNvbGUuI3twLmNhbGxlZS50ZXh0fVwiXG4gICAgICAgICAgICBcbiAgICAgICAgY2FsbGVlID0gQG5vZGUgcC5jYWxsZWVcbiAgICAgICAgXG4gICAgICAgIGlmIHAuYXJnc1xuICAgICAgICAgICAgaWYgY2FsbGVlID09ICduZXcnXG4gICAgICAgICAgICAgICAgXCIje2NhbGxlZX0gI3tAbm9kZXMgcC5hcmdzLCAnLCd9XCJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBcIiN7Y2FsbGVlfSgje0Bub2RlcyBwLmFyZ3MsICcsJ30pXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgXCIje2NhbGxlZX0oKVwiXG5cbiAgICAjIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMDAwMFxuICAgICMgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwXG5cbiAgICBpZjogKG4pIC0+XG5cbiAgICAgICAgZmlyc3QgPSBmaXJzdExpbmVDb2wgblxuICAgICAgICBsYXN0ICA9IGxhc3RMaW5lQ29sIG5cblxuICAgICAgICBpZiBmaXJzdC5saW5lID09IGxhc3QubGluZSBhbmQgbi5lbHNlIGFuZCBub3Qgbi5yZXR1cm5zXG4gICAgICAgICAgICByZXR1cm4gQGlmSW5saW5lIG5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwiaWYgKCN7QGF0b20obi5jb25kKX0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgZm9yIGVsaWYgaW4gbi5lbGlmcyA/IFtdXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpICsgXCJlbHNlIGlmICgje0BhdG9tKGVsaWYuZWxpZi5jb25kKX0pXFxuXCJcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgICAgIGZvciBlIGluIGVsaWYuZWxpZi50aGVuID8gW11cbiAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgaWYgbi5lbHNlXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpICsgJ2Vsc2VcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBmb3IgZSBpbiBuLmVsc2UgPyBbXVxuICAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgICMgMDAwICAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcblxuICAgIGlmSW5saW5lOiAobikgLT5cblxuICAgICAgICBzID0gJydcblxuICAgICAgICBzICs9IFwiI3tAYXRvbShuLmNvbmQpfSA/IFwiXG4gICAgICAgIGlmIG4udGhlbj8ubGVuZ3RoXG4gICAgICAgICAgICBzICs9IChAYXRvbShlKSBmb3IgZSBpbiBuLnRoZW4pLmpvaW4gJywgJ1xuXG4gICAgICAgIGlmIG4uZWxpZnNcbiAgICAgICAgICAgIGZvciBlIGluIG4uZWxpZnNcbiAgICAgICAgICAgICAgICBzICs9ICcgOiAnXG4gICAgICAgICAgICAgICAgcyArPSBAaWZJbmxpbmUgZS5lbGlmXG5cbiAgICAgICAgaWYgbi5lbHNlXG4gICAgICAgICAgICBzICs9ICcgOiAnXG4gICAgICAgICAgICBpZiBuLmVsc2UubGVuZ3RoID09IDFcbiAgICAgICAgICAgICAgICBzICs9IEBhdG9tIG4uZWxzZVswXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHMgKz0gJygnICsgKEBhdG9tIGUgZm9yIGUgaW4gbi5lbHNlKS5qb2luKCcsICcpICsgJyknXG4gICAgICAgIHNcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBlYWNoOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIG51bUFyZ3MgPSBuLmZuYy5mdW5jLmFyZ3M/LnBhcmVucy5leHBzLmxlbmd0aFxuICAgICAgICBcbiAgICAgICAgaWYgbnVtQXJncyA9PSAxXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIChmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgICAgIHIgPSBvIGluc3RhbmNlb2YgQXJyYXkgPyBbXSA6IHR5cGVvZiBvID09ICdzdHJpbmcnID8gby5zcGxpdCgnJykgOiB7fVxuICAgICAgICAgICAgICAgIGZvciAoayBpbiBvKVxuICAgICAgICAgICAgICAgIHsgICBcbiAgICAgICAgICAgICAgICAgICAgdmFyIG0gPSAoI3tAbm9kZSBuLmZuY30pKG9ba10pXG4gICAgICAgICAgICAgICAgICAgIGlmIChtICE9IG51bGwpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJba10gPSBtXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBvID09ICdzdHJpbmcnID8gci5qb2luKCcnKSA6IHJcbiAgICAgICAgICAgIH0pKCN7QG5vZGUgbi5saHN9KVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVsc2UgaWYgbnVtQXJnc1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAoZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgICAgICByID0gbyBpbnN0YW5jZW9mIEFycmF5ID8gW10gOiB0eXBlb2YgbyA9PSAnc3RyaW5nJyA/IG8uc3BsaXQoJycpIDoge31cbiAgICAgICAgICAgICAgICBmb3IgKGsgaW4gbylcbiAgICAgICAgICAgICAgICB7ICAgXG4gICAgICAgICAgICAgICAgICAgIHZhciBtID0gKCN7QG5vZGUgbi5mbmN9KShrLCBvW2tdKVxuICAgICAgICAgICAgICAgICAgICBpZiAobSAhPSBudWxsICYmIG1bMF0gIT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgclttWzBdXSA9IG1bMV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIG8gPT0gJ3N0cmluZycgPyByLmpvaW4oJycpIDogclxuICAgICAgICAgICAgfSkoI3tAbm9kZSBuLmxoc30pXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlICMgbm8gYXJnc1xuICAgICAgICAgICAgaWYgbi5mbmMuZnVuYy5ib2R5LmV4cHM/Lmxlbmd0aCA+IDAgIyBzb21lIGZ1bmMgYnV0IG5vIGFyZ3NcbiAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgICAgICAgICAgciA9IG8gaW5zdGFuY2VvZiBBcnJheSA/IFtdIDogdHlwZW9mIG8gPT0gJ3N0cmluZycgPyBvLnNwbGl0KCcnKSA6IHt9XG4gICAgICAgICAgICAgICAgICAgIGZvciAoayBpbiBvKVxuICAgICAgICAgICAgICAgICAgICB7ICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbSA9ICgje0Bub2RlIG4uZm5jfSkob1trXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtICE9IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcltrXSA9IG1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIG8gPT0gJ3N0cmluZycgPyByLmpvaW4oJycpIDogclxuICAgICAgICAgICAgICAgIH0pKCN7QG5vZGUgbi5saHN9KVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGVsc2UgIyBubyBhcmdzIGFuZCBlbXB0eSBmdW5jXG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgICAgKGZ1bmN0aW9uIChvKSB7IHJldHVybiBvIGluc3RhbmNlb2YgQXJyYXkgPyBbXSA6IHR5cGVvZiBvID09ICdzdHJpbmcnID8gJycgOiB7fSB9KSgje0Bub2RlIG4ubGhzfSlcbiAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgZm9yOiAobikgLT5cblxuICAgICAgICBpZiBub3Qgbi50aGVuIHRoZW4gQHZlcmIgJ2ZvciBleHBlY3RlZCB0aGVuJyBuXG5cbiAgICAgICAgc3dpdGNoIG4uaW5vZi50ZXh0XG4gICAgICAgICAgICB3aGVuICdpbicgdGhlbiBAZm9yX2luIG5cbiAgICAgICAgICAgIHdoZW4gJ29mJyB0aGVuIEBmb3Jfb2YgblxuICAgICAgICAgICAgZWxzZSBlcnJvciAnZm9yIGV4cGVjdGVkIGluL29mJ1xuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBmb3JfaW46IChuLCB2YXJQcmVmaXg9JycsIGxhc3RQcmVmaXg9JycsIGxhc3RQb3N0Zml4PScnLCBsaW5lQnJlYWspIC0+XG5cbiAgICAgICAgaWYgbm90IG4ubGlzdC5xbXJrb3AgYW5kIG5vdCBuLmxpc3QuYXJyYXkgYW5kIG5vdCBuLmxpc3Quc2xpY2VcbiAgICAgICAgICAgIGxpc3QgPSBAbm9kZSBxbXJrb3A6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGhzOiBuLmxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByaHM6IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYXJyYXknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdbXSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgbi5saXN0LmFycmF5Py5pdGVtc1swXT8uc2xpY2Ugb3Igbi5saXN0LnNsaWNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIEBmb3JfaW5fcmFuZ2UgbiwgdmFyUHJlZml4LCBsYXN0UHJlZml4LCBsYXN0UG9zdGZpeCwgbGluZUJyZWFrXG4gICAgICAgICAgICBsaXN0ID0gQG5vZGUgbi5saXN0XG5cbiAgICAgICAgaWYgbm90IGxpc3Qgb3IgbGlzdCA9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgcHJpbnQubm9vbiAnbm8gbGlzdCBmb3InIG4ubGlzdFxuICAgICAgICAgICAgcHJpbnQuYXN0ICdubyBsaXN0IGZvcicgbi5saXN0XG5cbiAgICAgICAgZ2kgPSBsaW5lQnJlYWsgb3IgQGluZCgpXG4gICAgICAgIG5sID0gbGluZUJyZWFrIG9yICdcXG4nXG4gICAgICAgIGViID0gbGluZUJyZWFrIGFuZCAnOycgb3IgJ1xcbidcbiAgICAgICAgXG4gICAgICAgIGcyID0gaWYgbGluZUJyZWFrIHRoZW4gJycgZWxzZSBAaW5kZW50XG4gICAgICAgIFxuICAgICAgICBsaXN0VmFyID0gQGZyZXNoVmFyICdsaXN0J1xuICAgICAgICBpdGVyVmFyID0gXCJfI3tuLmlub2YubGluZX1fI3tuLmlub2YuY29sfV9cIlxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcInZhciAje2xpc3RWYXJ9ID0gI3tsaXN0fVwiICsgZWJcbiAgICAgICAgaWYgbi52YWxzLnRleHRcbiAgICAgICAgICAgIHMgKz0gZ2krXCJmb3IgKHZhciAje2l0ZXJWYXJ9ID0gMDsgI3tpdGVyVmFyfSA8ICN7bGlzdFZhcn0ubGVuZ3RoOyAje2l0ZXJWYXJ9KyspXCIgKyBubFxuICAgICAgICAgICAgcyArPSBnaStcIntcIitubFxuICAgICAgICAgICAgcyArPSBnMitcIiN7bi52YWxzLnRleHR9ID0gI3tsaXN0VmFyfVsje2l0ZXJWYXJ9XVwiICsgZWJcbiAgICAgICAgZWxzZSBpZiBuLnZhbHMuYXJyYXk/Lml0ZW1zXG4gICAgICAgICAgICBzICs9IGdpK1wiZm9yICh2YXIgI3tpdGVyVmFyfSA9IDA7ICN7aXRlclZhcn0gPCAje2xpc3RWYXJ9Lmxlbmd0aDsgI3tpdGVyVmFyfSsrKVwiICsgbmxcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XCIrbmxcbiAgICAgICAgICAgIGZvciBqIGluIDAuLi5uLnZhbHMuYXJyYXkuaXRlbXMubGVuZ3RoXG4gICAgICAgICAgICAgICAgdiA9IG4udmFscy5hcnJheS5pdGVtc1tqXVxuICAgICAgICAgICAgICAgIHMgKz0gZzIrXCIje3YudGV4dH0gPSAje2xpc3RWYXJ9WyN7aXRlclZhcn1dWyN7an1dXCIgKyBlYlxuICAgICAgICBlbHNlIGlmIG4udmFscy5sZW5ndGggPiAxXG4gICAgICAgICAgICBpdGVyVmFyID0gbi52YWxzWzFdLnRleHRcbiAgICAgICAgICAgIHMgKz0gZ2krXCJmb3IgKCN7aXRlclZhcn0gPSAwOyAje2l0ZXJWYXJ9IDwgI3tsaXN0VmFyfS5sZW5ndGg7ICN7aXRlclZhcn0rKylcIiArIG5sXG4gICAgICAgICAgICBzICs9IGdpK1wie1wiICsgbmxcbiAgICAgICAgICAgIHMgKz0gZzIrXCIje3ZhclByZWZpeH0je24udmFsc1swXS50ZXh0fSA9ICN7bGlzdFZhcn1bI3tpdGVyVmFyfV1cIiArIGViXG5cbiAgICAgICAgZm9yIGUgaW4gbi50aGVuID8gW11cbiAgICAgICAgICAgIHByZWZpeCA9IGlmIGxhc3RQcmVmaXggYW5kIGUgPT0gbi50aGVuWy0xXSB0aGVuIGxhc3RQcmVmaXggZWxzZSAnJ1xuICAgICAgICAgICAgcG9zdGZpeCA9IGlmIGxhc3RQb3N0Zml4IGFuZCBlID09IG4udGhlblstMV0gdGhlbiBsYXN0UG9zdGZpeCBlbHNlICcnXG4gICAgICAgICAgICBzICs9IGcyICsgcHJlZml4K0Bub2RlKGUpK3Bvc3RmaXggKyBubFxuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgQGRlZCgpIGlmIG5vdCBsaW5lQnJlYWtcbiAgICAgICAgc1xuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAwMDAwICAwMDAgICAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgICAgMDAwICAwMDAgMCAwMDAgICAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAwMDAgIDAwMDAgICAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgZm9yX2luX3JhbmdlOiAobiwgdmFyUHJlZml4LCBsYXN0UHJlZml4LCBsYXN0UG9zdGZpeCwgbGluZUJyZWFrKSAtPlxuICAgICAgICBcbiAgICAgICAgc2xpY2UgPSBuLmxpc3QuYXJyYXk/Lml0ZW1zWzBdPy5zbGljZSA/IG4ubGlzdC5zbGljZVxuXG4gICAgICAgICMgbG9nICdmb3JfaW5fcmFuZ2UnIHNsaWNlXG4gICAgICAgIFxuICAgICAgICBnaSA9IGxpbmVCcmVhayBvciBAaW5kKClcbiAgICAgICAgbmwgPSBsaW5lQnJlYWsgb3IgJ1xcbidcbiAgICAgICAgZWIgPSBsaW5lQnJlYWsgYW5kICc7JyBvciAnXFxuJ1xuICAgICAgICBcbiAgICAgICAgZzIgPSBpZiBsaW5lQnJlYWsgdGhlbiAnJyBlbHNlIEBpbmRlbnRcbiAgICAgICAgXG4gICAgICAgIGl0ZXJWYXIgICA9IG4udmFscy50ZXh0ID8gbi52YWxzWzBdLnRleHRcbiAgICAgICAgXG4gICAgICAgIGl0ZXJTdGFydCA9IEBub2RlIHNsaWNlLmZyb21cbiAgICAgICAgaXRlckVuZCAgID0gQG5vZGUgc2xpY2UudXB0b1xuICAgICAgICBcbiAgICAgICAgc3RhcnQgPSBwYXJzZUludCBpdGVyU3RhcnRcbiAgICAgICAgZW5kICAgPSBwYXJzZUludCBpdGVyRW5kXG4gICAgICAgIFxuICAgICAgICBpdGVyQ21wID0gaWYgc2xpY2UuZG90cy50ZXh0ID09ICcuLi4nIHRoZW4gJzwnIGVsc2UgJzw9J1xuICAgICAgICBpdGVyRGlyID0gJysrJ1xuICAgICAgICBcbiAgICAgICAgaWYgTnVtYmVyLmlzRmluaXRlKHN0YXJ0KSBhbmQgTnVtYmVyLmlzRmluaXRlKGVuZClcbiAgICAgICAgICAgIGlmIHN0YXJ0ID4gZW5kXG4gICAgICAgICAgICAgICAgaXRlckNtcCA9IGlmIHNsaWNlLmRvdHMudGV4dCA9PSAnLi4uJyB0aGVuICc+JyBlbHNlICc+PSdcbiAgICAgICAgICAgICAgICBpdGVyRGlyID0gJy0tJ1xuICAgICAgICAgICAgXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwiZm9yICgje2l0ZXJWYXJ9ID0gI3tpdGVyU3RhcnR9OyAje2l0ZXJWYXJ9ICN7aXRlckNtcH0gI3tpdGVyRW5kfTsgI3tpdGVyVmFyfSN7aXRlckRpcn0pXCIgKyBubFxuICAgICAgICBzICs9IGdpK1wie1wiK25sXG4gICAgICAgIGZvciBlIGluIG4udGhlbiA/IFtdXG4gICAgICAgICAgICBwcmVmaXggPSBpZiBsYXN0UHJlZml4IGFuZCBlID09IG4udGhlblstMV0gdGhlbiBsYXN0UHJlZml4IGVsc2UgJydcbiAgICAgICAgICAgIHBvc3RmaXggPSBpZiBsYXN0UG9zdGZpeCBhbmQgZSA9PSBuLnRoZW5bLTFdIHRoZW4gbGFzdFBvc3RmaXggZWxzZSAnJ1xuICAgICAgICAgICAgcyArPSBnMiArIHByZWZpeCtAbm9kZShlKStwb3N0Zml4ICsgbmxcbiAgICAgICAgcyArPSBnaStcIn1cIlxuICAgICAgICAgICAgXG4gICAgICAgIEBkZWQoKSBpZiBub3QgbGluZUJyZWFrXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgXG4gICAgXG4gICAgZm9yX29mOiAobiwgdmFyUHJlZml4PScnLCBsYXN0UHJlZml4PScnLCBsYXN0UG9zdGZpeD0nJywgbGluZUJyZWFrKSAtPlxuXG4gICAgICAgIGdpID0gbGluZUJyZWFrIG9yIEBpbmQoKVxuICAgICAgICBubCA9IGxpbmVCcmVhayBvciAnXFxuJ1xuICAgICAgICBlYiA9IGxpbmVCcmVhayBhbmQgJzsnIG9yICdcXG4nXG4gICAgICAgIGcyID0gaWYgbGluZUJyZWFrIHRoZW4gJycgZWxzZSBAaW5kZW50XG5cbiAgICAgICAga2V5ID0gbi52YWxzLnRleHQgPyBuLnZhbHNbMF0/LnRleHRcbiAgICAgICAgdmFsID0gbi52YWxzWzFdPy50ZXh0XG5cbiAgICAgICAgb2JqID0gQG5vZGUgbi5saXN0XG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwiZm9yICgje3ZhclByZWZpeH0je2tleX0gaW4gI3tvYmp9KVwiK25sXG4gICAgICAgIHMgKz0gZ2krXCJ7XCIrbmxcbiAgICAgICAgaWYgdmFsXG4gICAgICAgICAgICBzICs9IGcyK1wiI3t2YXJQcmVmaXh9I3t2YWx9ID0gI3tvYmp9WyN7a2V5fV1cIiArIGViXG4gICAgICAgIGZvciBlIGluIG4udGhlbiA/IFtdXG4gICAgICAgICAgICBwcmVmaXggPSBpZiBsYXN0UHJlZml4IGFuZCBlID09IG4udGhlblstMV0gdGhlbiBsYXN0UHJlZml4IGVsc2UgJydcbiAgICAgICAgICAgIHBvc3RmaXggPSBpZiBsYXN0UG9zdGZpeCBhbmQgZSA9PSBuLnRoZW5bLTFdIHRoZW4gbGFzdFBvc3RmaXggZWxzZSAnJ1xuICAgICAgICAgICAgcyArPSBnMisgcHJlZml4K0Bub2RlKGUpK3Bvc3RmaXggKyBubFxuICAgICAgICAgICAgXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcblxuICAgICAgICBAZGVkKCkgaWYgbm90IGxpbmVCcmVha1xuICAgICAgICBzXG4gICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGxjb21wOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIGNvbXAgPSAoZikgPT5cbiAgICAgICAgICAgIHN3aXRjaCBmLmlub2YudGV4dFxuICAgICAgICAgICAgICAgIHdoZW4gJ2luJyB0aGVuIEBmb3JfaW4gZiwgJ3ZhciAnICdyZXN1bHQucHVzaCgnICcpJyAnICdcbiAgICAgICAgICAgICAgICB3aGVuICdvZicgdGhlbiBAZm9yX29mIGYsICd2YXIgJyAncmVzdWx0LnB1c2goJyAnKScgJyAnXG5cbiAgICAgICAgXCIoZnVuY3Rpb24gKCkgeyB2YXIgcmVzdWx0ID0gW107ICN7Y29tcCBuLmZvcn0gcmV0dXJuIHJlc3VsdCB9KS5iaW5kKHRoaXMpKClcIlxuXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwXG5cbiAgICB3aGlsZTogKG4pIC0+XG5cbiAgICAgICAgZ2kgPSBAaW5kKClcblxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcIndoaWxlICgje0Bub2RlIG4uY29uZH0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBzd2l0Y2g6IChuKSAtPlxuXG4gICAgICAgIGlmIG5vdCBuLm1hdGNoIHRoZW4gZXJyb3IgJ3N3aXRjaCBleHBlY3RlZCBtYXRjaCcgblxuICAgICAgICBpZiBub3Qgbi53aGVucyB0aGVuIGVycm9yICdzd2l0Y2ggZXhwZWN0ZWQgd2hlbnMnIG5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwic3dpdGNoICgje0Bub2RlIG4ubWF0Y2h9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgXG4gICAgICAgIGZvciBlIGluIG4ud2hlbnMgPyBbXVxuICAgICAgICAgICAgcyArPSBnaSsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIHZhbGlkIG4uZWxzZVxuICAgICAgICAgICAgcyArPSBAaW5kZW50KydkZWZhdWx0OlxcbidcbiAgICAgICAgICAgIGZvciBlIGluIG4uZWxzZVxuICAgICAgICAgICAgICAgIHMgKz0gQGluZGVudCsnICAgICcrIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcyArPSBnaStcIn1cXG5cIlxuXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgd2hlbjogKG4pIC0+XG5cbiAgICAgICAgaWYgbm90IG4udmFscyB0aGVuIHJldHVybiBlcnJvciAnd2hlbiBleHBlY3RlZCB2YWxzJyBuXG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIGZvciBlIGluIG4udmFsc1xuICAgICAgICAgICAgaSA9IGUgIT0gbi52YWxzWzBdIGFuZCBAaW5kZW50IG9yICcgICAgJ1xuICAgICAgICAgICAgcyArPSBpKydjYXNlICcgKyBAbm9kZShlKSArICc6XFxuJ1xuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgZ2kgPSBAaW5kKClcbiAgICAgICAgICAgIHMgKz0gZ2kgKyAnICAgICcgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBAZGVkKClcbiAgICAgICAgaWYgbm90IChuLnRoZW4gYW5kIG4udGhlblstMV0gYW5kIG4udGhlblstMV0ucmV0dXJuKVxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgJyAgICAnICsgJ2JyZWFrJyBcbiAgICAgICAgc1xuXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgICAgMDAwMDAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHRyeTogKG4pIC0+XG4gICAgICAgIFxuICAgICAgICBzID0gJydcbiAgICAgICAgZ2kgPSBAaW5kKClcbiAgICAgICAgcyArPSAndHJ5XFxuJ1xuICAgICAgICBzICs9IGdpKyd7XFxuJ1xuICAgICAgICBzICs9IEBpbmRlbnQrQG5vZGVzIG4uZXhwcywgJ1xcbicrQGluZGVudFxuICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgIHMgKz0gZ2krJ30nXG4gICAgICAgIGlmIG4uY2F0Y2ggPyBbXVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaStcImNhdGNoICgje0Bub2RlIG4uY2F0Y2guZXJycn0pXFxuXCIgXG4gICAgICAgICAgICBzICs9IGdpKyd7XFxuJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50K0Bub2RlcyBuLmNhdGNoLmV4cHMsICdcXG4nK0BpbmRlbnRcbiAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIHMgKz0gZ2krJ30nXG4gICAgICAgIGlmIG4uZmluYWxseVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaSsnZmluYWxseVxcbidcbiAgICAgICAgICAgIHMgKz0gZ2krJ3tcXG4nXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQrQG5vZGVzIG4uZmluYWxseSwgJ1xcbicrQGluZGVudFxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaSsnfSdcbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwMCAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwXG4gICAgIyAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICB0b2tlbjogKHRvaykgLT5cblxuICAgICAgICBpZiB0b2sudHlwZSA9PSAnY29tbWVudCdcbiAgICAgICAgICAgIEBjb21tZW50IHRva1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICd0aGlzJ1xuICAgICAgICAgICAgJ3RoaXMnXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ3RyaXBsZSdcbiAgICAgICAgICAgICdgJyArIHRvay50ZXh0WzMuLi00XSArICdgJ1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgPT0gJ3llcydcbiAgICAgICAgICAgICd0cnVlJ1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgPT0gJ25vJ1xuICAgICAgICAgICAgJ2ZhbHNlJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0b2sudGV4dFxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbiAgICBjb21tZW50OiAodG9rKSAtPlxuXG4gICAgICAgIGlmIHRvay50ZXh0LnN0YXJ0c1dpdGggJyMjIydcbiAgICAgICAgICAgICcvKicgKyB0b2sudGV4dFszLi4tNF0gKyAnKi8nICsgJ1xcbidcbiAgICAgICAgZWxzZSBpZiB0b2sudGV4dC5zdGFydHNXaXRoICcjJ1xuICAgICAgICAgICAga3N0ci5wYWQoJycsIHRvay5jb2wpICsgJy8vJyArIHRvay50ZXh0WzEuLi0xXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlcnJvciBcIiMgY29tbWVudCB0b2tlbiBleHBlY3RlZFwiXG4gICAgICAgICAgICAnJ1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgb3BlcmF0aW9uOiAob3ApIC0+XG5cbiAgICAgICAgb3BtYXAgPSAobykgLT5cbiAgICAgICAgICAgIG9tcCA9XG4gICAgICAgICAgICAgICAgYW5kOiAgICAnJiYnXG4gICAgICAgICAgICAgICAgb3I6ICAgICAnfHwnXG4gICAgICAgICAgICAgICAgbm90OiAgICAnISdcbiAgICAgICAgICAgICAgICAnPT0nOiAgICc9PT0nXG4gICAgICAgICAgICAgICAgJyE9JzogICAnIT09J1xuICAgICAgICAgICAgb21wW29dID8gb1xuXG4gICAgICAgIG8gICA9IG9wbWFwIG9wLm9wZXJhdG9yLnRleHRcbiAgICAgICAgc2VwID0gJyAnXG4gICAgICAgIHNlcCA9ICcnIGlmIG5vdCBvcC5saHMgb3Igbm90IG9wLnJoc1xuXG4gICAgICAgIGlmIG8gaW4gWyc8Jyc8PScnPT09JychPT0nJz49Jyc+J11cbiAgICAgICAgICAgIHJvID0gb3BtYXAgb3AucmhzPy5vcGVyYXRpb24/Lm9wZXJhdG9yLnRleHRcbiAgICAgICAgICAgIGlmIHJvIGluIFsnPCcnPD0nJz09PScnIT09Jyc+PScnPiddXG4gICAgICAgICAgICAgICAgcmV0dXJuICcoJyArIEBhdG9tKG9wLmxocykgKyBzZXAgKyBvICsgc2VwICsgQGF0b20ob3AucmhzLm9wZXJhdGlvbi5saHMpICsgJyAmJiAnICsga3N0ci5sc3RyaXAoQGF0b20ob3AucmhzKSkgKyAnKSdcblxuICAgICAgICBvcGVuID0gY2xvc2UgPSAnJ1xuICAgICAgICBcbiAgICAgICAgaWYgbyA9PSAnPSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb3AubGhzLm9iamVjdCAjIGxocyBpcyBjdXJseSwgZWcuIHt4LHl9ID0gcmVxdWlyZSAnJ1xuICAgICAgICAgICAgICAgIHMgPSAnJ1xuICAgICAgICAgICAgICAgIGZvciBrZXl2YWwgaW4gb3AubGhzLm9iamVjdC5rZXl2YWxzXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gXCIje2tleXZhbC50ZXh0fSA9ICN7QGF0b20ob3AucmhzKX0uI3trZXl2YWwudGV4dH1cXG5cIlxuICAgICAgICAgICAgICAgIHJldHVybiBzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvcC5saHMuYXJyYXkgIyBsaHMgaXMgYXJheSwgZWcuIFt4LHldID0gcmVxdWlyZSAnJ1xuICAgICAgICAgICAgICAgIHMgPSAnJ1xuICAgICAgICAgICAgICAgIGZvciB2YWwgaW4gb3AubGhzLmFycmF5Lml0ZW1zXG4gICAgICAgICAgICAgICAgICAgIGkgPSBvcC5saHMuYXJyYXkuaXRlbXMuaW5kZXhPZiB2YWxcbiAgICAgICAgICAgICAgICAgICAgcyArPSBcIiN7dmFsLnRleHR9ID0gI3tAYXRvbShvcC5yaHMpfVsje2l9XVxcblwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZWxzZSBpZiBvID09ICchJ1xuXG4gICAgICAgICAgICBpZiBvcC5yaHM/LmluY29uZCBvciBvcC5yaHM/Lm9wZXJhdGlvbj8ub3BlcmF0b3I/LnRleHQgPT0gJz0nXG4gICAgICAgICAgICAgICAgICAgIG9wZW4gPSAnKCdcbiAgICAgICAgICAgICAgICAgICAgY2xvc2UgPSAnKSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgZWxzZSBpZiBvcC5yaHM/Lm9wZXJhdGlvbj8ub3BlcmF0b3IudGV4dCA9PSAnPSdcbiAgICAgICAgICAgIG9wZW4gPSAnKCdcbiAgICAgICAgICAgIGNsb3NlID0gJyknXG4gICAgICAgICAgICBcbiAgICAgICAgZmlyc3QgPSBmaXJzdExpbmVDb2wgb3AubGhzXG4gICAgICAgIHByZnggPSBpZiBmaXJzdC5jb2wgPT0gMCBhbmQgb3AucmhzPy5mdW5jIHRoZW4gJ1xcbicgZWxzZSAnJ1xuICAgICAgICAgICAgXG4gICAgICAgIHByZnggKyBAYXRvbShvcC5saHMpICsgc2VwICsgbyArIHNlcCArIG9wZW4gKyBrc3RyLmxzdHJpcCBAYXRvbShvcC5yaHMpICsgY2xvc2VcblxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgaW5jb25kOiAocCkgLT5cblxuICAgICAgICBcIiN7QG5vZGUgcC5yaHN9LmluZGV4T2YoI3tAYXRvbSBwLmxoc30pID49IDBcIlxuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgcGFyZW5zOiAocCkgLT4gXG4gICAgICAgICMgbG9nICdwYXJlbnMnIHBcbiAgICAgICAgXCIoI3tAbm9kZXMgcC5leHBzfSlcIlxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDBcblxuICAgIG9iamVjdDogKHApIC0+IFxuICAgICAgICBub2RlcyA9IHAua2V5dmFscy5tYXAgKHMpID0+IEBhdG9tIHNcbiAgICAgICAgbm9kZXMgPSBub2Rlcy5tYXAgKG4pIC0+IGlmICc6JyBpbiBuIHRoZW4gbiBlbHNlIFwiI3tufToje259XCIgICAgICAgIFxuICAgICAgICBcInsje25vZGVzLmpvaW4gJywnfX1cIlxuXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGtleXZhbDogKHApIC0+XG4gICAgICAgIGtleSA9IEBub2RlIHAua2V5XG4gICAgICAgIGlmIGtleVswXSBub3QgaW4gXCInXFxcIlwiIGFuZCAvW1xcLlxcLFxcO1xcKlxcK1xcLVxcL1xcPVxcfF0vLnRlc3Qga2V5IHRoZW4ga2V5ID0gXCInI3trZXl9J1wiXG4gICAgICAgIFwiI3trZXl9OiN7QGF0b20ocC52YWwpfVwiXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMFxuXG4gICAgcHJvcDogICAocCkgLT5cblxuICAgICAgICBcIiN7QG5vZGUocC5vYmopfS4je0Bub2RlIHAucHJvcH1cIlxuXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIGluZGV4OiAgKHApIC0+XG5cbiAgICAgICAgaWYgc2xpY2UgPSBwLnNsaWR4LnNsaWNlXG5cbiAgICAgICAgICAgIGZyb20gPSBpZiBzbGljZS5mcm9tPyB0aGVuIEBub2RlIHNsaWNlLmZyb20gZWxzZSAnMCdcblxuICAgICAgICAgICAgYWRkT25lID0gc2xpY2UuZG90cy50ZXh0ID09ICcuLidcblxuICAgICAgICAgICAgdXB0byA9IGlmIHNsaWNlLnVwdG8/IHRoZW4gQG5vZGUgc2xpY2UudXB0byBlbHNlICctMSdcblxuICAgICAgICAgICAgaWYgc2xpY2UudXB0bz8udHlwZSA9PSAnbnVtJyBvciBzbGljZS51cHRvPy5vcGVyYXRpb24gb3IgdXB0byA9PSAnLTEnXG4gICAgICAgICAgICAgICAgdSA9IHBhcnNlSW50IHVwdG9cbiAgICAgICAgICAgICAgICBpZiBOdW1iZXIuaXNGaW5pdGUgdVxuICAgICAgICAgICAgICAgICAgICBpZiB1ID09IC0xIGFuZCBhZGRPbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwcGVyID0gJydcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdSArPSAxIGlmIGFkZE9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgdXBwZXIgPSBcIiwgI3t1fVwiXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB1cHBlciA9IFwiLCAje3VwdG99XCJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBhZGRPbmUgdGhlbiBpZiB1cHRvIHRoZW4gdXBwZXIgPSBcIiwgdHlwZW9mICN7dXB0b30gPT09ICdudW1iZXInID8gI3t1cHRvfSsxIDogSW5maW5pdHlcIlxuICAgICAgICAgICAgICAgIGVsc2UgICAgICAgICAgICAgICAgICAgICAgICB1cHBlciA9IFwiLCB0eXBlb2YgI3t1cHRvfSA9PT0gJ251bWJlcicgPyAje3VwdG99IDogLTFcIlxuXG4gICAgICAgICAgICBcIiN7QGF0b20ocC5pZHhlZSl9LnNsaWNlKCN7ZnJvbX0je3VwcGVyID8gJyd9KVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHAuc2xpZHgudGV4dD9bMF0gPT0gJy0nXG4gICAgICAgICAgICAgICAgbmkgPSBwYXJzZUludCBwLnNsaWR4LnRleHRcbiAgICAgICAgICAgICAgICBpZiBuaSA9PSAtMVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCIje0Bub2RlKHAuaWR4ZWUpfS5zbGljZSgje25pfSlbMF1cIlxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiI3tAbm9kZShwLmlkeGVlKX0uc2xpY2UoI3tuaX0sI3tuaSsxfSlbMF1cIlxuXG4gICAgICAgICAgICBcIiN7QG5vZGUocC5pZHhlZSl9WyN7QG5vZGUgcC5zbGlkeH1dXCJcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbiAgICBhcnJheTogKHApIC0+XG5cbiAgICAgICAgaWYgcC5pdGVtc1swXT8uc2xpY2VcbiAgICAgICAgICAgIEBzbGljZSBwLml0ZW1zWzBdLnNsaWNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFwiWyN7QG5vZGVzIHAuaXRlbXMsICcsJ31dXCJcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwXG5cbiAgICBzbGljZTogKHApIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBwLmZyb20udHlwZSA9PSAnbnVtJyA9PSBwLnVwdG8/LnR5cGVcbiAgICAgICAgICAgIGZyb20gPSBwYXJzZUludCBwLmZyb20udGV4dFxuICAgICAgICAgICAgdXB0byA9IHBhcnNlSW50IHAudXB0by50ZXh0XG4gICAgICAgICAgICBpZiB1cHRvLWZyb20gPD0gMTBcbiAgICAgICAgICAgICAgICBpZiBwLmRvdHMudGV4dCA9PSAnLi4uJyB0aGVuIHVwdG8tLVxuICAgICAgICAgICAgICAgICdbJysoKHggZm9yIHggaW4gW2Zyb20uLnVwdG9dKS5qb2luICcsJykrJ10nXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbyA9IGlmIHAuZG90cy50ZXh0ID09ICcuLi4nIHRoZW4gJzwnIGVsc2UgJzw9J1xuICAgICAgICAgICAgICAgIFwiKGZ1bmN0aW9uKCkgeyB2YXIgciA9IFtdOyBmb3IgKHZhciBpID0gI3tmcm9tfTsgaSAje299ICN7dXB0b307IGkrKyl7IHIucHVzaChpKTsgfSByZXR1cm4gcjsgfSkuYXBwbHkodGhpcylcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvID0gaWYgcC5kb3RzLnRleHQgPT0gJy4uLicgdGhlbiAnPCcgZWxzZSAnPD0nXG4gICAgICAgICAgICBcIihmdW5jdGlvbigpIHsgdmFyIHIgPSBbXTsgZm9yICh2YXIgaSA9ICN7QG5vZGUgcC5mcm9tfTsgaSAje299ICN7QG5vZGUgcC51cHRvfTsgaSsrKXsgci5wdXNoKGkpOyB9IHJldHVybiByOyB9KS5hcHBseSh0aGlzKVwiXG5cbiAgICAjIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBmcmVzaFZhcjogKG5hbWUsIHN1ZmZpeD0wKSAtPlxuXG4gICAgICAgIGZvciB2YXJzIGluIEB2YXJzdGFja1xuICAgICAgICAgICAgZm9yIHYgaW4gdmFyc1xuICAgICAgICAgICAgICAgIGlmIHYudGV4dCA9PSBuYW1lICsgKHN1ZmZpeCBvciAnJylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEBmcmVzaFZhciBuYW1lLCBzdWZmaXgrMVxuXG4gICAgICAgIEB2YXJzdGFja1stMV0ucHVzaCB0ZXh0Om5hbWUgKyAoc3VmZml4IG9yICcnKVxuICAgICAgICBuYW1lICsgKHN1ZmZpeCBvciAnJylcblxuICAgIHZlcmI6IC0+IGlmIEB2ZXJib3NlIHRoZW4gY29uc29sZS5sb2cuYXBwbHkgY29uc29sZS5sb2csIGFyZ3VtZW50c1xuICAgIFxuICAgIGluZDogLT5cblxuICAgICAgICBvaSA9IEBpbmRlbnRcbiAgICAgICAgQGluZGVudCArPSAnICAgICdcbiAgICAgICAgb2lcblxuICAgIGRlZDogLT4gQGluZGVudCA9IEBpbmRlbnRbLi4uLTRdXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgXG4gICAgc3RyaXBvbDogKGNodW5rcykgLT5cbiAgICAgICAgXG4gICAgICAgcyA9ICdgJ1xuICAgICAgIGZvciBjaHVuayBpbiBjaHVua3NcbiAgICAgICAgICAgdCA9IGNodW5rLnRleHRcbiAgICAgICAgICAgc3dpdGNoIGNodW5rLnR5cGVcbiAgICAgICAgICAgICAgIHdoZW4gJ29wZW4nICB0aGVuIHMrPSB0KyckeydcbiAgICAgICAgICAgICAgIHdoZW4gJ2Nsb3NlJyB0aGVuIHMrPSAnfScrdFxuICAgICAgICAgICAgICAgd2hlbiAnbWlkbCcgIHRoZW4gcys9ICd9Jyt0KyckeydcbiAgICAgICAgICAgICAgIHdoZW4gJ2NvZGUnICBcbiAgICAgICAgICAgICAgICAgICBjID0gQGNvbXBpbGUgdFxuICAgICAgICAgICAgICAgICAgIGlmIGNbMF0gPT0gJzsnIHRoZW4gYyA9IGNbMS4uXVxuICAgICAgICAgICAgICAgICAgIHMrPSBjXG4gICAgICAgcyArPSAnYCdcbiAgICAgICBzXG5cbm1vZHVsZS5leHBvcnRzID0gUmVuZGVyZXJcbiJdfQ==
//# sourceURL=../coffee/renderer.coffee