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
        this.verb('fixAsserts', s);
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
            return "(function (o) {\n    r = o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}\n    for (k in o)\n    {   \n        var m = (" + (this.node(n.fnc)) + ")(o[k])\n        if (m != null)\n        {\n            r[k] = m\n        }\n    }\n    return o instanceof Array ? r.filter((f) => { return f !== undefined }) : typeof o == 'string' ? r.join('') : r\n})(" + (this.node(n.lhs)) + ")";
        } else if (numArgs) {
            return "(function (o) {\n    r = o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}\n    for (k in o)\n    {   \n        var m = (" + (this.node(n.fnc)) + ")(k, o[k])\n        if (m != null && m[0] != null)\n        {\n            r[m[0]] = m[1]\n        }\n    }\n    return o instanceof Array ? r : typeof o == 'string' ? r.join('') : r\n})(" + (this.node(n.lhs)) + ")";
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

    Renderer.prototype.for_in = function(n, varPrefix, lastPrefix, lastPostfix, lineBreak) {
        var e, eb, g2, gi, iterVar, j, len, len1, list, listVar, nl, postfix, prefix, q, r, ref1, ref2, ref3, ref4, ref5, results, s, v, w;
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
        list = this.node(n.list);
        if (!list || list === 'undefined') {
            print.noon('no list for', n.list);
            print.ast('no list for', n.list);
        }
        listVar = this.freshVar('list');
        iterVar = "_" + n.inof.line + "_" + n.inof.col + "_";
        s = '';
        s += ("var " + listVar + " = " + list) + eb;
        if (n.vals.text) {
            s += gi + ("for (var " + iterVar + " = 0; " + iterVar + " < " + listVar + ".length; " + iterVar + "++)") + nl;
            s += gi + "{" + nl;
            s += g2 + (n.vals.text + " = " + listVar + "[" + iterVar + "]") + eb;
        } else if ((ref1 = n.vals.array) != null ? ref1.items : void 0) {
            s += gi + ("for (var " + iterVar + " = 0; " + iterVar + " < " + listVar + ".length; " + iterVar + "++)") + nl;
            s += gi + "{" + nl;
            ref3 = (function() {
                results = [];
                for (var r = 0, ref2 = n.vals.array.items.length; 0 <= ref2 ? r < ref2 : r > ref2; 0 <= ref2 ? r++ : r--){ results.push(r); }
                return results;
            }).apply(this);
            for (q = 0, len = ref3.length; q < len; q++) {
                j = ref3[q];
                v = n.vals.array.items[j];
                s += g2 + (v.text + " = " + listVar + "[" + iterVar + "][" + j + "]") + eb;
            }
        } else if (n.vals.length > 1) {
            iterVar = n.vals[1].text;
            s += gi + ("for (" + iterVar + " = 0; " + iterVar + " < " + listVar + ".length; " + iterVar + "++)") + nl;
            s += gi + "{" + nl;
            s += g2 + ("" + varPrefix + n.vals[0].text + " = " + listVar + "[" + iterVar + "]") + eb;
        }
        ref5 = (ref4 = n.then) != null ? ref4 : [];
        for (w = 0, len1 = ref5.length; w < len1; w++) {
            e = ref5[w];
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
        return "(function () { var result = []; " + (comp(n["for"])) + " return result })()";
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
        var close, first, keyval, len, o, open, opmap, prfx, q, ref1, ref2, ref3, ref4, ref5, ref6, ro, s, sep;
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
        } else if (((ref4 = op.rhs) != null ? (ref5 = ref4.operation) != null ? ref5.operator.text : void 0 : void 0) === '=') {
            open = '(';
            close = ')';
        }
        first = firstLineCol(op.lhs);
        prfx = first.col === 0 && ((ref6 = op.rhs) != null ? ref6.func : void 0) ? '\n' : '';
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUVBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQThDLE9BQUEsQ0FBUSxTQUFSLENBQTlDLEVBQUUsaUJBQUYsRUFBUyxpQkFBVCxFQUFnQiwrQkFBaEIsRUFBOEI7O0FBRXhCO0lBRUMsa0JBQUMsSUFBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxNQUFELEdBQVU7UUFRVixJQUFDLENBQUEsS0FBRCx5Q0FBcUIsQ0FBRTtRQUN2QixJQUFDLENBQUEsT0FBRCx5Q0FBcUIsQ0FBRTtJQVh4Qjs7dUJBYUgsT0FBQSxHQUFTLFNBQUMsSUFBRDtBQUVMLFlBQUE7UUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O1lBQ1AsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxVQUFXLElBQUk7O2VBQ2hCLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFpQixJQUFqQjtJQUpLOzt1QkFNVCxNQUFBLEdBQVEsU0FBQyxHQUFEO0FBRUosWUFBQTtRQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBQyxHQUFHLENBQUMsSUFBTDtRQUNaLElBQUMsQ0FBQSxNQUFELEdBQVU7UUFDVixDQUFBLEdBQUk7UUFFSixJQUFHLEtBQUEsQ0FBTSxHQUFHLENBQUMsSUFBVixDQUFIO1lBQ0ksRUFBQSxHQUFLOztBQUFDO0FBQUE7cUJBQUEsc0NBQUE7O2lDQUFBLENBQUMsQ0FBQztBQUFGOztnQkFBRCxDQUEwQixDQUFDLElBQTNCLENBQWdDLElBQWhDO1lBQ0wsQ0FBQSxJQUFLLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQSxNQUFBLEdBQU8sRUFB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QUFqQjs7SUFBSDs7dUJBRU4sR0FBQSxHQUFLLFNBQUE7QUFFRCxZQUFBO1FBQUEsRUFBQSxHQUFLLElBQUMsQ0FBQTtRQUNOLElBQUMsQ0FBQSxNQUFELElBQVc7ZUFDWDtJQUpDOzt1QkFNTCxHQUFBLEdBQUssU0FBQTtlQUFHLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLE1BQU87SUFBckI7O3VCQVFMLE9BQUEsR0FBUyxTQUFDLE1BQUQ7QUFFTixZQUFBO1FBQUEsQ0FBQSxHQUFJO0FBQ0osYUFBQSx3Q0FBQTs7WUFDSSxDQUFBLEdBQUksS0FBSyxDQUFDO0FBQ1Ysb0JBQU8sS0FBSyxDQUFDLElBQWI7QUFBQSxxQkFDUyxNQURUO29CQUNzQixDQUFBLElBQUksQ0FBQSxHQUFFO0FBQW5CO0FBRFQscUJBRVMsT0FGVDtvQkFFc0IsQ0FBQSxJQUFJLEdBQUEsR0FBSTtBQUFyQjtBQUZULHFCQUdTLE1BSFQ7b0JBR3NCLENBQUEsSUFBSSxHQUFBLEdBQUksQ0FBSixHQUFNO0FBQXZCO0FBSFQscUJBSVMsTUFKVDtvQkFJc0IsQ0FBQSxJQUFJLElBQUMsQ0FBQSxPQUFELENBQVMsQ0FBVDtBQUoxQjtBQUZKO1FBT0EsQ0FBQSxJQUFLO2VBQ0w7SUFYTTs7Ozs7O0FBYWIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbmtzdHIgID0gcmVxdWlyZSAna3N0cidcbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcblxueyB2YWxpZCwgZW1wdHksIGZpcnN0TGluZUNvbCwgbGFzdExpbmVDb2wgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIFJlbmRlcmVyXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQGhlYWRlciA9IFwiXCJcIlxuICAgICAgICAgICAgY29uc3QgX2tfID0ge1xuICAgICAgICAgICAgICAgIGxpc3Q6ICAgZnVuY3Rpb24gKGwpICAge3JldHVybiAobCAhPSBudWxsID8gdHlwZW9mIGwubGVuZ3RoID09PSAnbnVtYmVyJyA/IGwgOiBbXSA6IFtdKX1cbiAgICAgICAgICAgICAgICBsZW5ndGg6IGZ1bmN0aW9uIChsKSAgIHtyZXR1cm4gKGwgIT0gbnVsbCA/IHR5cGVvZiBsLmxlbmd0aCA9PT0gJ251bWJlcicgPyBsLmxlbmd0aCA6IDAgOiAwKX0sXG4gICAgICAgICAgICAgICAgaW46ICAgICBmdW5jdGlvbiAoYSxsKSB7cmV0dXJuIChsICE9IG51bGwgPyB0eXBlb2YgbC5pbmRleE9mID09PSAnZnVuY3Rpb24nID8gbC5pbmRleE9mKGEpID49IDAgOiBmYWxzZSA6IGZhbHNlKX1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgICAgIEBkZWJ1ZyAgID0gQGtvZGUuYXJncz8uZGVidWdcbiAgICAgICAgQHZlcmJvc2UgPSBAa29kZS5hcmdzPy52ZXJib3NlXG5cbiAgICBjb21waWxlOiAoY29kZSkgLT4gXG4gICAgXG4gICAgICAgIEtvZGUgPSByZXF1aXJlICcuL2tvZGUnXG4gICAgICAgIEBzdWJLb2RlID89IG5ldyBLb2RlIFxuICAgICAgICBAc3ViS29kZS5jb21waWxlIGNvZGVcbiAgICAgICAgXG4gICAgcmVuZGVyOiAoYXN0KSAtPlxuXG4gICAgICAgIEB2YXJzdGFjayA9IFthc3QudmFyc11cbiAgICAgICAgQGluZGVudCA9ICcnXG4gICAgICAgIHMgPSAnJ1xuXG4gICAgICAgIGlmIHZhbGlkIGFzdC52YXJzXG4gICAgICAgICAgICB2cyA9ICh2LnRleHQgZm9yIHYgaW4gYXN0LnZhcnMpLmpvaW4gJywgJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgXCJ2YXIgI3t2c31cXG5cXG5cIlxuXG4gICAgICAgIHMgKz0gQG5vZGVzIGFzdC5leHBzLCAnXFxuJ1xuICAgICAgICBzXG5cbiAgICBub2RlczogKG5vZGVzLCBzZXA9JywnKSAtPlxuXG4gICAgICAgIHNsID0gbm9kZXMubWFwIChzKSA9PiBAYXRvbSBzXG4gICAgICAgIFxuICAgICAgICBpZiBzZXAgPT0gJ1xcbidcbiAgICAgICAgICAgIHNsID0gc2wubWFwIChzKSA9PlxuICAgICAgICAgICAgICAgIHN0cmlwcGVkID0ga3N0ci5sc3RyaXAgc1xuICAgICAgICAgICAgICAgIGlmIHN0cmlwcGVkWzBdIGluICcoWycgdGhlbiAnOycrcyBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIHN0cmlwcGVkLnN0YXJ0c1dpdGggJ2Z1bmN0aW9uJyB0aGVuIFwiKCN7c30pXCJcbiAgICAgICAgICAgICAgICBlbHNlIHNcbiAgICAgICAgICAgIFxuICAgICAgICBzcyA9IHNsLmpvaW4gc2VwXG5cbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcblxuICAgIG5vZGU6IChleHApIC0+XG5cbiAgICAgICAgcmV0dXJuICcnIGlmIG5vdCBleHBcblxuICAgICAgICBpZiBleHAudHlwZT8gYW5kIGV4cC50ZXh0PyB0aGVuIHJldHVybiBAdG9rZW4gZXhwXG5cbiAgICAgICAgaWYgZXhwIGluc3RhbmNlb2YgQXJyYXkgdGhlbiByZXR1cm4gKEBub2RlKGEpIGZvciBhIGluIGV4cCkuam9pbiAnO1xcbidcblxuICAgICAgICBzID0gJydcblxuICAgICAgICBmb3Igayx2IG9mIGV4cFxuXG4gICAgICAgICAgICBzKz0gc3dpdGNoIGtcbiAgICAgICAgICAgICAgICB3aGVuICdpZicgICAgICAgIHRoZW4gQGlmIHZcbiAgICAgICAgICAgICAgICB3aGVuICdmb3InICAgICAgIHRoZW4gQGZvciB2XG4gICAgICAgICAgICAgICAgd2hlbiAnd2hpbGUnICAgICB0aGVuIEB3aGlsZSB2XG4gICAgICAgICAgICAgICAgd2hlbiAncmV0dXJuJyAgICB0aGVuIEByZXR1cm4gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2NsYXNzJyAgICAgdGhlbiBAY2xhc3MgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3N3aXRjaCcgICAgdGhlbiBAc3dpdGNoIHZcbiAgICAgICAgICAgICAgICB3aGVuICd3aGVuJyAgICAgIHRoZW4gQHdoZW4gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2Fzc2VydCcgICAgdGhlbiBAYXNzZXJ0IHZcbiAgICAgICAgICAgICAgICB3aGVuICdxbXJrb3AnICAgIHRoZW4gQHFtcmtvcCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnc3RyaXBvbCcgICB0aGVuIEBzdHJpcG9sIHZcbiAgICAgICAgICAgICAgICB3aGVuICdxbXJrY29sb24nIHRoZW4gQHFtcmtjb2xvbiB2XG4gICAgICAgICAgICAgICAgd2hlbiAnb3BlcmF0aW9uJyB0aGVuIEBvcGVyYXRpb24gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2luY29uZCcgICAgdGhlbiBAaW5jb25kIHZcbiAgICAgICAgICAgICAgICB3aGVuICdwYXJlbnMnICAgIHRoZW4gQHBhcmVucyB2XG4gICAgICAgICAgICAgICAgd2hlbiAnb2JqZWN0JyAgICB0aGVuIEBvYmplY3QgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2tleXZhbCcgICAgdGhlbiBAa2V5dmFsIHZcbiAgICAgICAgICAgICAgICB3aGVuICdhcnJheScgICAgIHRoZW4gQGFycmF5IHZcbiAgICAgICAgICAgICAgICB3aGVuICdsY29tcCcgICAgIHRoZW4gQGxjb21wIHZcbiAgICAgICAgICAgICAgICB3aGVuICdpbmRleCcgICAgIHRoZW4gQGluZGV4IHZcbiAgICAgICAgICAgICAgICB3aGVuICdzbGljZScgICAgIHRoZW4gQHNsaWNlIHZcbiAgICAgICAgICAgICAgICB3aGVuICdwcm9wJyAgICAgIHRoZW4gQHByb3AgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2VhY2gnICAgICAgdGhlbiBAZWFjaCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnZnVuYycgICAgICB0aGVuIEBmdW5jIHZcbiAgICAgICAgICAgICAgICB3aGVuICdjYWxsJyAgICAgIHRoZW4gQGNhbGwgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3RyeScgICAgICAgdGhlbiBAdHJ5IHZcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGxvZyBSNChcInJlbmRlcmVyLm5vZGUgdW5oYW5kbGVkIGtleSAje2t9IGluIGV4cFwiKSwgZXhwICMgaWYgQGRlYnVnIG9yIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgICAgICcnXG4gICAgICAgIHNcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxuICAgIGF0b206IChleHApIC0+XG5cbiAgICAgICAgQGZpeEFzc2VydHMgQG5vZGUgZXhwXG5cbiAgICBhc3NlcnQ6IChwKSAtPlxuXG4gICAgICAgICfilr4nICsgQG5vZGUocC5vYmopICsgXCLilrgje3AucW1yay5saW5lfV8je3AucW1yay5jb2x94peCXCJcbiAgICAgICAgXG4gICAgcW1ya29wOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIHZuID0gXCJfI3twLnFtcmsubGluZX1fI3twLnFtcmsuY29sfV9cIlxuICAgICAgICBcIigoI3t2bn09I3tAYXRvbSBwLmxoc30pICE9IG51bGwgPyAje3ZufSA6ICN7QGF0b20gcC5yaHN9KVwiXG5cbiAgICBxbXJrY29sb246IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgXCIoI3tAYXRvbSBwLmxoc30gPyAje0BhdG9tIHAubWlkfSA6ICN7QGF0b20gcC5yaHN9KVwiXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAgMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAwMDAgICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwXG5cbiAgICBmaXhBc3NlcnRzOiAocykgLT5cblxuICAgICAgICBAdmVyYiAnZml4QXNzZXJ0cycgc1xuICAgICAgICBcbiAgICAgICAgaWYgbm90IHM/XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gJycgaWYgbm90IHM/IG9yIHMubGVuZ3RoID09IDBcblxuICAgICAgICB3aGlsZSBzWzBdID09ICfilr4nIHRoZW4gcyA9IHNbMS4uXSBcbiAgICAgICAgaWYgJ+KWvicgaW4gc1xuICAgICAgICAgICAgaSA9IHMuaW5kZXhPZiAn4pa+J1xuICAgICAgICAgICAgcmV0dXJuIHNbLi4uaV0gKyBAZml4QXNzZXJ0cyBzW2krMS4uXVxuICAgICAgICAgICAgXG4gICAgICAgIGlmICdcXG4nIGluIHNcbiAgICAgICAgICAgIGkgPSBzLmluZGV4T2YgJ1xcbidcbiAgICAgICAgICAgIHJldHVybiBAZml4QXNzZXJ0cyhzWy4uLmldKSArIHNbaS4uXVxuICAgICAgICBcbiAgICAgICAgc3BsdCA9IHMuc3BsaXQgL+KWuFxcZCtfXFxkK+KXgi9cbiAgICAgICAgbXRjaCA9IHMubWF0Y2ggL+KWuFxcZCtfXFxkK+KXgi9nXG5cbiAgICAgICAgaWYgc3BsdC5sZW5ndGggPiAxXG5cbiAgICAgICAgICAgIG10Y2ggPSBtdGNoLm1hcCAobSkgLT4gXCJfI3ttWzEuLi0yXX1fXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc3BsdFstMV0gPT0gJycgIyBhc3NlcnQgZW5kcyB3aXRoID9cbiAgICAgICAgICAgICAgICBpZiBzcGx0Lmxlbmd0aCA+IDJcbiAgICAgICAgICAgICAgICAgICAgc3BsdC5wb3AoKVxuICAgICAgICAgICAgICAgICAgICBtdGNoLnBvcCgpXG4gICAgICAgICAgICAgICAgICAgIHQgPSBzcGx0LnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgc3BsdC5sZW5ndGggICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdCArPSAn4pa4JyttdGNoLnNoaWZ0KClbMS4uLi0xXSsn4peCJ1xuICAgICAgICAgICAgICAgICAgICAgICAgdCArPSBzcGx0LnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgdCA9IEBmaXhBc3NlcnRzIHRcbiAgICAgICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgICAgICB0ID0gc3BsdFswXVxuICAgICAgICAgICAgICAgIHJldHVybiAgXCIoI3t0fSAhPSBudWxsKVwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIGxvZyBzcGx0LCBtdGNoXG5cbiAgICAgICAgICAgIHMgPSAnJ1xuXG4gICAgICAgICAgICBmb3IgaSBpbiAwLi4ubXRjaC5sZW5ndGhcblxuICAgICAgICAgICAgICAgIGlmIG10Y2gubGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgICAgICBsID0gXCIoI3ttdGNoW2ldfT0jeyhpZiBpIHRoZW4gbXRjaFtpLTFdK3NwbHRbaV0gZWxzZSBzcGx0WzBdKX0pXCJcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGwgPSBzcGx0WzBdXG5cbiAgICAgICAgICAgICAgICBpZiBzcGx0W2krMV1bMF0gPT0gJygnXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gXCJ0eXBlb2YgI3tsfSA9PT0gXFxcImZ1bmN0aW9uXFxcIiA/IFwiXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBzICs9IFwiI3tsfSAhPSBudWxsID8gXCJcblxuICAgICAgICAgICAgaWYgbXRjaC5sZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgcyArPSBtdGNoWy0xXStzcGx0Wy0xXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHMgKz0gc3BsdFswXStzcGx0WzFdXG5cbiAgICAgICAgICAgIGZvciBpIGluIDAuLi5tdGNoLmxlbmd0aCB0aGVuIHMgKz0gXCIgOiB1bmRlZmluZWRcIlxuXG4gICAgICAgICAgICBzID0gXCIoI3tzfSlcIlxuICAgICAgICBzXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcblxuICAgIGNsYXNzOiAobikgLT5cblxuICAgICAgICBzID0gJ1xcbidcbiAgICAgICAgcyArPSBcImNsYXNzICN7bi5uYW1lLnRleHR9XCJcblxuICAgICAgICBpZiBuLmV4dGVuZHNcbiAgICAgICAgICAgIHMgKz0gXCIgZXh0ZW5kcyBcIiArIG4uZXh0ZW5kcy5tYXAoKGUpIC0+IGUudGV4dCkuam9pbiAnLCAnXG5cbiAgICAgICAgcyArPSAnXFxueydcblxuICAgICAgICAjIG10aGRzID0gbi5ib2R5Py5vYmplY3Q/LmtleXZhbHMgPyBuLmJvZHk/WzBdPy5vYmplY3Q/LmtleXZhbHNcbiAgICAgICAgbXRoZHMgPSBuLmJvZHlcblxuICAgICAgICBpZiBtdGhkcz8ubGVuZ3RoXG4gICAgICAgICAgICBtdGhkcyA9IEBwcmVwYXJlTWV0aG9kcyBtdGhkc1xuICAgICAgICAgICAgQGluZGVudCA9ICcgICAgJ1xuICAgICAgICAgICAgZm9yIG1pIGluIDAuLi5tdGhkcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBzICs9ICdcXG4nIGlmIG1pXG4gICAgICAgICAgICAgICAgcyArPSBAbXRoZCBtdGhkc1ttaV1cbiAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIEBpbmRlbnQgPSAnJ1xuICAgICAgICBzICs9ICd9XFxuJ1xuICAgICAgICBzXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG5cbiAgICBwcmVwYXJlTWV0aG9kczogKG10aGRzKSAtPlxuXG4gICAgICAgIGJpbmQgPSBbXVxuICAgICAgICBmb3IgbSBpbiBtdGhkc1xuICAgICAgICAgICAgaWYgbm90IG0ua2V5dmFsXG4gICAgICAgICAgICAgICAgcHJpbnQuYXN0ICdub3QgYW4gbWV0aG9kPycgbVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBpZiBub3QgbS5rZXl2YWwudmFsLmZ1bmNcbiAgICAgICAgICAgICAgICBwcmludC5hc3QgJ25vIGZ1bmMgZm9yIG1ldGhvZD8nIG1cbiAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBuYW1lID0gbS5rZXl2YWwudmFsLmZ1bmMubmFtZS50ZXh0XG4gICAgICAgICAgICBpZiBuYW1lIGluIFsnQCcgJ2NvbnN0cnVjdG9yJ11cbiAgICAgICAgICAgICAgICBpZiBjb25zdHJ1Y3RvciB0aGVuIGVycm9yICdtb3JlIHRoYW4gb25lIGNvbnN0cnVjdG9yPydcbiAgICAgICAgICAgICAgICBtLmtleXZhbC52YWwuZnVuYy5uYW1lLnRleHQgPSAnY29uc3RydWN0b3InXG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3IgPSBtXG4gICAgICAgICAgICBlbHNlIGlmIG5hbWUuc3RhcnRzV2l0aCAnQCdcbiAgICAgICAgICAgICAgICBtLmtleXZhbC52YWwuZnVuYy5uYW1lLnRleHQgPSAnc3RhdGljICcgKyBuYW1lWzEuLl1cbiAgICAgICAgICAgIGVsc2UgaWYgbS5rZXl2YWwudmFsLmZ1bmM/LmFycm93LnRleHQgPT0gJz0+J1xuICAgICAgICAgICAgICAgIGJpbmQucHVzaCBtXG5cbiAgICAgICAgaWYgYmluZC5sZW5ndGggYW5kIG5vdCBjb25zdHJ1Y3RvciAjIGZvdW5kIHNvbWUgbWV0aG9kcyB0byBiaW5kLCBidXQgbm8gY29uc3RydWN0b3JcbiAgICAgICAgICAgIGFzdCA9IEBrb2RlLmFzdCBcImNvbnN0cnVjdG9yOiAtPlwiICMgY3JlYXRlIG9uZSBmcm9tIHNjcmF0Y2hcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yID0gYXN0LmV4cHNbMF0ub2JqZWN0LmtleXZhbHNbMF1cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmtleXZhbC52YWwuZnVuYy5uYW1lID0gdHlwZTonbmFtZScgdGV4dDonY29uc3RydWN0b3InXG4gICAgICAgICAgICBtdGhkcy51bnNoaWZ0IGNvbnN0cnVjdG9yXG5cbiAgICAgICAgaWYgYmluZC5sZW5ndGhcbiAgICAgICAgICAgIGZvciBiIGluIGJpbmRcbiAgICAgICAgICAgICAgICBibiA9IGIua2V5dmFsLnZhbC5mdW5jLm5hbWUudGV4dFxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLmtleXZhbC52YWwuZnVuYy5ib2R5LmV4cHMgPz0gW11cbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5rZXl2YWwudmFsLmZ1bmMuYm9keS5leHBzLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NvZGUnXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwidGhpcy4je2JufSA9IHRoaXMuI3tibn0uYmluZCh0aGlzKVwiXG4gICAgICAgIG10aGRzXG5cbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIG10aGQ6IChuKSAtPlxuXG4gICAgICAgIGlmIG4ua2V5dmFsXG4gICAgICAgICAgICBzICA9ICdcXG4nXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAZnVuYyBuLmtleXZhbC52YWwuZnVuY1xuICAgICAgICBzXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcblxuICAgIGZ1bmM6IChuKSAtPlxuXG4gICAgICAgIHJldHVybiAnJyBpZiBub3QgblxuXG4gICAgICAgIGdpID0gQGluZCgpXG5cbiAgICAgICAgcyA9IG4ubmFtZT8udGV4dCA/ICdmdW5jdGlvbidcbiAgICAgICAgcyArPSAnICgnXG5cbiAgICAgICAgYXJncyA9IG4uYXJncz8ucGFyZW5zPy5leHBzXG4gICAgICAgIGlmIGFyZ3NcbiAgICAgICAgICAgIFtzdHIsIHRoc10gPSBAYXJncyBhcmdzXG4gICAgICAgICAgICBzICs9IHN0clxuXG4gICAgICAgIHMgKz0gJylcXG4nXG4gICAgICAgIHMgKz0gZ2kgKyAneydcblxuICAgICAgICBAdmFyc3RhY2sucHVzaCBuLmJvZHkudmFyc1xuXG4gICAgICAgIGlmIHZhbGlkIG4uYm9keS52YXJzXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICB2cyA9ICh2LnRleHQgZm9yIHYgaW4gbi5ib2R5LnZhcnMpLmpvaW4gJywgJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgXCJ2YXIgI3t2c31cXG5cIlxuXG4gICAgICAgIGZvciB0IGluIHRocyA/IFtdXG4gICAgICAgICAgICBzICs9ICdcXG4nICsgQGluZGVudCArIHRoc1xuXG4gICAgICAgIGlmIHZhbGlkIG4uYm9keS5leHBzXG5cbiAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIHNzID0gbi5ib2R5LmV4cHMubWFwIChzKSA9PiBAbm9kZSBzXG4gICAgICAgICAgICBzcyA9IHNzLm1hcCAocykgPT4gQGluZGVudCArIHNcbiAgICAgICAgICAgIHMgKz0gc3Muam9pbiAnXFxuJ1xuICAgICAgICAgICAgcyArPSAnXFxuJyArIGdpXG5cbiAgICAgICAgcyArPSAnfSdcblxuICAgICAgICBAdmFyc3RhY2sucG9wKClcblxuICAgICAgICBAZGVkKClcbiAgICAgICAgc1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMFxuXG4gICAgYXJnczogKGFyZ3MpIC0+XG5cbiAgICAgICAgdGhzICA9IFtdXG4gICAgICAgIHVzZWQgPSB7fVxuXG4gICAgICAgIGZvciBhIGluIGFyZ3NcbiAgICAgICAgICAgIGlmIGEudGV4dCB0aGVuIHVzZWRbYS50ZXh0XSA9IGEudGV4dFxuXG4gICAgICAgIGFyZ3MgPSBhcmdzLm1hcCAoYSkgLT5cbiAgICAgICAgICAgIGlmIGEucHJvcCBhbmQgYS5wcm9wLm9iai50eXBlID09ICd0aGlzJ1xuICAgICAgICAgICAgICAgIHRoaXNWYXIgPSBhLnByb3AucHJvcFxuICAgICAgICAgICAgICAgIGlmIHVzZWRbdGhpc1Zhci50ZXh0XVxuICAgICAgICAgICAgICAgICAgICBmb3IgaSBpbiBbMS4uMTAwXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbm90IHVzZWRbdGhpc1Zhci50ZXh0K2ldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhzLnB1c2ggXCJ0aGlzLiN7dGhpc1Zhci50ZXh0fSA9ICN7dGhpc1Zhci50ZXh0K2l9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzVmFyLnRleHQgPSB0aGlzVmFyLnRleHQraVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZWRbdGhpc1Zhci50ZXh0XSA9IHRoaXNWYXIudGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aHMucHVzaCBcInRoaXMuI3t0aGlzVmFyLnRleHR9ID0gI3t0aGlzVmFyLnRleHR9XCJcblxuICAgICAgICAgICAgICAgIHRoaXNWYXJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhXG5cbiAgICAgICAgc3RyID0gYXJncy5tYXAoKGEpID0+IEBub2RlIGEpLmpvaW4gJywgJ1xuXG4gICAgICAgIFtzdHIsdGhzXVxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuXG4gICAgcmV0dXJuOiAobikgLT5cblxuICAgICAgICBzID0gJ3JldHVybidcbiAgICAgICAgcyArPSAnICcgKyBAbm9kZSBuLnZhbFxuICAgICAgICBrc3RyLnN0cmlwIHNcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwXG5cbiAgICBjYWxsOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHAuY2FsbGVlLnRleHQgaW4gWydsb2cnJ3dhcm4nJ2Vycm9yJ11cbiAgICAgICAgICAgIHAuY2FsbGVlLnRleHQgPSBcImNvbnNvbGUuI3twLmNhbGxlZS50ZXh0fVwiXG4gICAgICAgICAgICBcbiAgICAgICAgY2FsbGVlID0gQG5vZGUgcC5jYWxsZWVcbiAgICAgICAgXG4gICAgICAgIGlmIHAuYXJnc1xuICAgICAgICAgICAgaWYgY2FsbGVlID09ICduZXcnXG4gICAgICAgICAgICAgICAgXCIje2NhbGxlZX0gI3tAbm9kZXMgcC5hcmdzLCAnLCd9XCJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBcIiN7Y2FsbGVlfSgje0Bub2RlcyBwLmFyZ3MsICcsJ30pXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgXCIje2NhbGxlZX0oKVwiXG5cbiAgICAjIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMDAwMFxuICAgICMgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwXG5cbiAgICBpZjogKG4pIC0+XG5cbiAgICAgICAgZmlyc3QgPSBmaXJzdExpbmVDb2wgblxuICAgICAgICBsYXN0ICA9IGxhc3RMaW5lQ29sIG5cblxuICAgICAgICBpZiBmaXJzdC5saW5lID09IGxhc3QubGluZSBhbmQgbi5lbHNlIGFuZCBub3Qgbi5yZXR1cm5zXG4gICAgICAgICAgICByZXR1cm4gQGlmSW5saW5lIG5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwiaWYgKCN7QGF0b20obi5jb25kKX0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgZm9yIGVsaWYgaW4gbi5lbGlmcyA/IFtdXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpICsgXCJlbHNlIGlmICgje0BhdG9tKGVsaWYuZWxpZi5jb25kKX0pXFxuXCJcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgICAgIGZvciBlIGluIGVsaWYuZWxpZi50aGVuID8gW11cbiAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgaWYgbi5lbHNlXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpICsgJ2Vsc2VcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBmb3IgZSBpbiBuLmVsc2UgPyBbXVxuICAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgICMgMDAwICAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcblxuICAgIGlmSW5saW5lOiAobikgLT5cblxuICAgICAgICBzID0gJydcblxuICAgICAgICBzICs9IFwiI3tAYXRvbShuLmNvbmQpfSA/IFwiXG4gICAgICAgIGlmIG4udGhlbj8ubGVuZ3RoXG4gICAgICAgICAgICBzICs9IChAYXRvbShlKSBmb3IgZSBpbiBuLnRoZW4pLmpvaW4gJywgJ1xuXG4gICAgICAgIGlmIG4uZWxpZnNcbiAgICAgICAgICAgIGZvciBlIGluIG4uZWxpZnNcbiAgICAgICAgICAgICAgICBzICs9ICcgOiAnXG4gICAgICAgICAgICAgICAgcyArPSBAaWZJbmxpbmUgZS5lbGlmXG5cbiAgICAgICAgaWYgbi5lbHNlXG4gICAgICAgICAgICBzICs9ICcgOiAnXG4gICAgICAgICAgICBpZiBuLmVsc2UubGVuZ3RoID09IDFcbiAgICAgICAgICAgICAgICBzICs9IEBhdG9tIG4uZWxzZVswXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHMgKz0gJygnICsgKEBhdG9tIGUgZm9yIGUgaW4gbi5lbHNlKS5qb2luKCcsICcpICsgJyknXG4gICAgICAgIHNcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBlYWNoOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIG51bUFyZ3MgPSBuLmZuYy5mdW5jLmFyZ3M/LnBhcmVucy5leHBzLmxlbmd0aFxuICAgICAgICBcbiAgICAgICAgaWYgbnVtQXJncyA9PSAxXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIChmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgICAgIHIgPSBvIGluc3RhbmNlb2YgQXJyYXkgPyBbXSA6IHR5cGVvZiBvID09ICdzdHJpbmcnID8gby5zcGxpdCgnJykgOiB7fVxuICAgICAgICAgICAgICAgIGZvciAoayBpbiBvKVxuICAgICAgICAgICAgICAgIHsgICBcbiAgICAgICAgICAgICAgICAgICAgdmFyIG0gPSAoI3tAbm9kZSBuLmZuY30pKG9ba10pXG4gICAgICAgICAgICAgICAgICAgIGlmIChtICE9IG51bGwpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJba10gPSBtXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG8gaW5zdGFuY2VvZiBBcnJheSA/IHIuZmlsdGVyKChmKSA9PiB7IHJldHVybiBmICE9PSB1bmRlZmluZWQgfSkgOiB0eXBlb2YgbyA9PSAnc3RyaW5nJyA/IHIuam9pbignJykgOiByXG4gICAgICAgICAgICB9KSgje0Bub2RlIG4ubGhzfSlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbHNlIGlmIG51bUFyZ3NcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgKGZ1bmN0aW9uIChvKSB7XG4gICAgICAgICAgICAgICAgciA9IG8gaW5zdGFuY2VvZiBBcnJheSA/IFtdIDogdHlwZW9mIG8gPT0gJ3N0cmluZycgPyBvLnNwbGl0KCcnKSA6IHt9XG4gICAgICAgICAgICAgICAgZm9yIChrIGluIG8pXG4gICAgICAgICAgICAgICAgeyAgIFxuICAgICAgICAgICAgICAgICAgICB2YXIgbSA9ICgje0Bub2RlIG4uZm5jfSkoaywgb1trXSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKG0gIT0gbnVsbCAmJiBtWzBdICE9IG51bGwpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJbbVswXV0gPSBtWzFdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG8gaW5zdGFuY2VvZiBBcnJheSA/IHIgOiB0eXBlb2YgbyA9PSAnc3RyaW5nJyA/IHIuam9pbignJykgOiByXG4gICAgICAgICAgICB9KSgje0Bub2RlIG4ubGhzfSlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgIyByZXR1cm4gbyBpbnN0YW5jZW9mIEFycmF5ID8gci5maWx0ZXIoKGYpID0+IHsgcmV0dXJuIGYgIT09IHVuZGVmaW5lZCB9KSA6IHR5cGVvZiBvID09ICdzdHJpbmcnID8gci5qb2luKCcnKSA6IHJcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlICMgbm8gYXJnc1xuICAgICAgICAgICAgaWYgbi5mbmMuZnVuYy5ib2R5LmV4cHM/Lmxlbmd0aCA+IDAgIyBzb21lIGZ1bmMgYnV0IG5vIGFyZ3NcbiAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgICAgICAgICAgciA9IG8gaW5zdGFuY2VvZiBBcnJheSA/IFtdIDogdHlwZW9mIG8gPT0gJ3N0cmluZycgPyBvLnNwbGl0KCcnKSA6IHt9XG4gICAgICAgICAgICAgICAgICAgIGZvciAoayBpbiBvKVxuICAgICAgICAgICAgICAgICAgICB7ICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbSA9ICgje0Bub2RlIG4uZm5jfSkob1trXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtICE9IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcltrXSA9IG1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbyBpbnN0YW5jZW9mIEFycmF5ID8gci5maWx0ZXIoKGYpID0+IHsgcmV0dXJuIGYgIT09IHVuZGVmaW5lZCB9KSA6IHR5cGVvZiBvID09ICdzdHJpbmcnID8gci5qb2luKCcnKSA6IHJcbiAgICAgICAgICAgICAgICB9KSgje0Bub2RlIG4ubGhzfSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBlbHNlICMgbm8gYXJncyBhbmQgZW1wdHkgZnVuY1xuICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICAgIChmdW5jdGlvbiAobykgeyByZXR1cm4gbyBpbnN0YW5jZW9mIEFycmF5ID8gW10gOiB0eXBlb2YgbyA9PSAnc3RyaW5nJyA/ICcnIDoge30gfSkoI3tAbm9kZSBuLmxoc30pXG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxuICAgIGZvcjogKG4pIC0+XG5cbiAgICAgICAgaWYgbm90IG4udGhlbiB0aGVuIGVycm9yICdmb3IgZXhwZWN0ZWQgdGhlbicgblxuXG4gICAgICAgIHN3aXRjaCBuLmlub2YudGV4dFxuICAgICAgICAgICAgd2hlbiAnaW4nIHRoZW4gQGZvcl9pbiBuXG4gICAgICAgICAgICB3aGVuICdvZicgdGhlbiBAZm9yX29mIG5cbiAgICAgICAgICAgIGVsc2UgZXJyb3IgJ2ZvciBleHBlY3RlZCBpbi9vZidcblxuICAgIGZvcl9pbjogKG4sIHZhclByZWZpeD0nJywgbGFzdFByZWZpeD0nJywgbGFzdFBvc3RmaXg9JycsIGxpbmVCcmVhaykgLT5cblxuICAgICAgICBnaSA9IGxpbmVCcmVhayBvciBAaW5kKClcbiAgICAgICAgbmwgPSBsaW5lQnJlYWsgb3IgJ1xcbidcbiAgICAgICAgZWIgPSBsaW5lQnJlYWsgYW5kICc7JyBvciAnXFxuJ1xuICAgICAgICBcbiAgICAgICAgZzIgPSBpZiBsaW5lQnJlYWsgdGhlbiAnJyBlbHNlIEBpbmRlbnRcbiAgICAgICAgXG4gICAgICAgIGxpc3QgPSBAbm9kZSBuLmxpc3RcblxuICAgICAgICBpZiBub3QgbGlzdCBvciBsaXN0ID09ICd1bmRlZmluZWQnXG4gICAgICAgICAgICBwcmludC5ub29uICdubyBsaXN0IGZvcicgbi5saXN0XG4gICAgICAgICAgICBwcmludC5hc3QgJ25vIGxpc3QgZm9yJyBuLmxpc3RcblxuICAgICAgICBsaXN0VmFyID0gQGZyZXNoVmFyICdsaXN0J1xuICAgICAgICBpdGVyVmFyID0gXCJfI3tuLmlub2YubGluZX1fI3tuLmlub2YuY29sfV9cIlxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcInZhciAje2xpc3RWYXJ9ID0gI3tsaXN0fVwiICsgZWJcbiAgICAgICAgaWYgbi52YWxzLnRleHRcbiAgICAgICAgICAgIHMgKz0gZ2krXCJmb3IgKHZhciAje2l0ZXJWYXJ9ID0gMDsgI3tpdGVyVmFyfSA8ICN7bGlzdFZhcn0ubGVuZ3RoOyAje2l0ZXJWYXJ9KyspXCIgKyBubFxuICAgICAgICAgICAgcyArPSBnaStcIntcIitubFxuICAgICAgICAgICAgcyArPSBnMitcIiN7bi52YWxzLnRleHR9ID0gI3tsaXN0VmFyfVsje2l0ZXJWYXJ9XVwiICsgZWJcbiAgICAgICAgZWxzZSBpZiBuLnZhbHMuYXJyYXk/Lml0ZW1zXG4gICAgICAgICAgICBzICs9IGdpK1wiZm9yICh2YXIgI3tpdGVyVmFyfSA9IDA7ICN7aXRlclZhcn0gPCAje2xpc3RWYXJ9Lmxlbmd0aDsgI3tpdGVyVmFyfSsrKVwiICsgbmxcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XCIrbmxcbiAgICAgICAgICAgIGZvciBqIGluIDAuLi5uLnZhbHMuYXJyYXkuaXRlbXMubGVuZ3RoXG4gICAgICAgICAgICAgICAgdiA9IG4udmFscy5hcnJheS5pdGVtc1tqXVxuICAgICAgICAgICAgICAgIHMgKz0gZzIrXCIje3YudGV4dH0gPSAje2xpc3RWYXJ9WyN7aXRlclZhcn1dWyN7an1dXCIgKyBlYlxuICAgICAgICBlbHNlIGlmIG4udmFscy5sZW5ndGggPiAxXG4gICAgICAgICAgICBpdGVyVmFyID0gbi52YWxzWzFdLnRleHRcbiAgICAgICAgICAgIHMgKz0gZ2krXCJmb3IgKCN7aXRlclZhcn0gPSAwOyAje2l0ZXJWYXJ9IDwgI3tsaXN0VmFyfS5sZW5ndGg7ICN7aXRlclZhcn0rKylcIiArIG5sXG4gICAgICAgICAgICBzICs9IGdpK1wie1wiICsgbmxcbiAgICAgICAgICAgIHMgKz0gZzIrXCIje3ZhclByZWZpeH0je24udmFsc1swXS50ZXh0fSA9ICN7bGlzdFZhcn1bI3tpdGVyVmFyfV1cIiArIGViXG5cbiAgICAgICAgZm9yIGUgaW4gbi50aGVuID8gW11cbiAgICAgICAgICAgIHByZWZpeCA9IGlmIGxhc3RQcmVmaXggYW5kIGUgPT0gbi50aGVuWy0xXSB0aGVuIGxhc3RQcmVmaXggZWxzZSAnJ1xuICAgICAgICAgICAgcG9zdGZpeCA9IGlmIGxhc3RQb3N0Zml4IGFuZCBlID09IG4udGhlblstMV0gdGhlbiBsYXN0UG9zdGZpeCBlbHNlICcnXG4gICAgICAgICAgICBzICs9IGcyICsgcHJlZml4K0Bub2RlKGUpK3Bvc3RmaXggKyBubFxuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgQGRlZCgpIGlmIG5vdCBsaW5lQnJlYWtcbiAgICAgICAgc1xuXG4gICAgZm9yX29mOiAobiwgdmFyUHJlZml4PScnLCBsYXN0UHJlZml4PScnLCBsYXN0UG9zdGZpeD0nJywgbGluZUJyZWFrKSAtPlxuXG4gICAgICAgIGdpID0gbGluZUJyZWFrIG9yIEBpbmQoKVxuICAgICAgICBubCA9IGxpbmVCcmVhayBvciAnXFxuJ1xuICAgICAgICBlYiA9IGxpbmVCcmVhayBhbmQgJzsnIG9yICdcXG4nXG4gICAgICAgIGcyID0gaWYgbGluZUJyZWFrIHRoZW4gJycgZWxzZSBAaW5kZW50XG5cbiAgICAgICAga2V5ID0gbi52YWxzLnRleHQgPyBuLnZhbHNbMF0/LnRleHRcbiAgICAgICAgdmFsID0gbi52YWxzWzFdPy50ZXh0XG5cbiAgICAgICAgb2JqID0gQG5vZGUgbi5saXN0XG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwiZm9yICgje3ZhclByZWZpeH0je2tleX0gaW4gI3tvYmp9KVwiK25sXG4gICAgICAgIHMgKz0gZ2krXCJ7XCIrbmxcbiAgICAgICAgaWYgdmFsXG4gICAgICAgICAgICBzICs9IGcyK1wiI3t2YXJQcmVmaXh9I3t2YWx9ID0gI3tvYmp9WyN7a2V5fV1cIiArIGViXG4gICAgICAgIGZvciBlIGluIG4udGhlbiA/IFtdXG4gICAgICAgICAgICBwcmVmaXggPSBpZiBsYXN0UHJlZml4IGFuZCBlID09IG4udGhlblstMV0gdGhlbiBsYXN0UHJlZml4IGVsc2UgJydcbiAgICAgICAgICAgIHBvc3RmaXggPSBpZiBsYXN0UG9zdGZpeCBhbmQgZSA9PSBuLnRoZW5bLTFdIHRoZW4gbGFzdFBvc3RmaXggZWxzZSAnJ1xuICAgICAgICAgICAgcyArPSBnMisgcHJlZml4K0Bub2RlKGUpK3Bvc3RmaXggKyBubFxuICAgICAgICAgICAgXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcblxuICAgICAgICBAZGVkKCkgaWYgbm90IGxpbmVCcmVha1xuICAgICAgICBzXG4gICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGxjb21wOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIGNvbXAgPSAoZikgPT5cbiAgICAgICAgICAgIHN3aXRjaCBmLmlub2YudGV4dFxuICAgICAgICAgICAgICAgIHdoZW4gJ2luJyB0aGVuIEBmb3JfaW4gZiwgJ3ZhciAnICdyZXN1bHQucHVzaCgnICcpJyAnICdcbiAgICAgICAgICAgICAgICB3aGVuICdvZicgdGhlbiBAZm9yX29mIGYsICd2YXIgJyAncmVzdWx0LnB1c2goJyAnKScgJyAnXG5cbiAgICAgICAgXCIoZnVuY3Rpb24gKCkgeyB2YXIgcmVzdWx0ID0gW107ICN7Y29tcCBuLmZvcn0gcmV0dXJuIHJlc3VsdCB9KSgpXCJcblxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMFxuXG4gICAgd2hpbGU6IChuKSAtPlxuXG4gICAgICAgIGdpID0gQGluZCgpXG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJ3aGlsZSAoI3tAbm9kZSBuLmNvbmR9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuID8gW11cbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgc3dpdGNoOiAobikgLT5cblxuICAgICAgICBpZiBub3Qgbi5tYXRjaCB0aGVuIGVycm9yICdzd2l0Y2ggZXhwZWN0ZWQgbWF0Y2gnIG5cbiAgICAgICAgaWYgbm90IG4ud2hlbnMgdGhlbiBlcnJvciAnc3dpdGNoIGV4cGVjdGVkIHdoZW5zJyBuXG5cbiAgICAgICAgZ2kgPSBAaW5kKClcblxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcInN3aXRjaCAoI3tAbm9kZSBuLm1hdGNofSlcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIFxuICAgICAgICBmb3IgZSBpbiBuLndoZW5zID8gW11cbiAgICAgICAgICAgIHMgKz0gZ2krIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgICAgIFxuICAgICAgICBpZiB2YWxpZCBuLmVsc2VcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCsnZGVmYXVsdDpcXG4nXG4gICAgICAgICAgICBmb3IgZSBpbiBuLmVsc2VcbiAgICAgICAgICAgICAgICBzICs9IEBpbmRlbnQrJyAgICAnKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHMgKz0gZ2krXCJ9XFxuXCJcblxuICAgICAgICBAZGVkKClcbiAgICAgICAgc1xuXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIHdoZW46IChuKSAtPlxuXG4gICAgICAgIGlmIG5vdCBuLnZhbHMgdGhlbiByZXR1cm4gZXJyb3IgJ3doZW4gZXhwZWN0ZWQgdmFscycgblxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBmb3IgZSBpbiBuLnZhbHNcbiAgICAgICAgICAgIGkgPSBlICE9IG4udmFsc1swXSBhbmQgQGluZGVudCBvciAnICAgICdcbiAgICAgICAgICAgIHMgKz0gaSsnY2FzZSAnICsgQG5vZGUoZSkgKyAnOlxcbidcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuID8gW11cbiAgICAgICAgICAgIGdpID0gQGluZCgpXG4gICAgICAgICAgICBzICs9IGdpICsgJyAgICAnICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICAgICAgQGRlZCgpXG4gICAgICAgIGlmIG5vdCAobi50aGVuIGFuZCBuLnRoZW5bLTFdIGFuZCBuLnRoZW5bLTFdLnJldHVybilcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArICcgICAgJyArICdicmVhaycgXG4gICAgICAgIHNcblxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMCAgICAgIDAwMDAwICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICB0cnk6IChuKSAtPlxuICAgICAgICBcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIGdpID0gQGluZCgpXG4gICAgICAgIHMgKz0gJ3RyeVxcbidcbiAgICAgICAgcyArPSBnaSsne1xcbidcbiAgICAgICAgcyArPSBAaW5kZW50K0Bub2RlcyBuLmV4cHMsICdcXG4nK0BpbmRlbnRcbiAgICAgICAgcyArPSBnaSsnXFxuJ1xuICAgICAgICBzICs9IGdpKyd9XFxuJ1xuICAgICAgICBpZiBuLmNhdGNoID8gW11cbiAgICAgICAgICAgIHMgKz0gZ2krXCJjYXRjaCAoI3tAbm9kZSBuLmNhdGNoLmVycnJ9KVxcblwiIFxuICAgICAgICAgICAgcyArPSBnaSsne1xcbidcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCtAbm9kZXMgbi5jYXRjaC5leHBzLCAnXFxuJytAaW5kZW50XG4gICAgICAgICAgICBzICs9IGdpKydcXG4nXG4gICAgICAgICAgICBzICs9IGdpKyd9XFxuJ1xuICAgICAgICBpZiBuLmZpbmFsbHlcbiAgICAgICAgICAgIHMgKz0gZ2krJ2ZpbmFsbHlcXG4nXG4gICAgICAgICAgICBzICs9IGdpKyd7XFxuJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50K0Bub2RlcyBuLmZpbmFsbHksICdcXG4nK0BpbmRlbnRcbiAgICAgICAgICAgIHMgKz0gZ2krJ1xcbidcbiAgICAgICAgICAgIHMgKz0gZ2krJ31cXG4nXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMDAgIDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMFxuICAgICMgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgdG9rZW46ICh0b2spIC0+XG5cbiAgICAgICAgaWYgdG9rLnR5cGUgPT0gJ2NvbW1lbnQnXG4gICAgICAgICAgICBAY29tbWVudCB0b2tcbiAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAndGhpcydcbiAgICAgICAgICAgICd0aGlzJ1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICd0cmlwbGUnXG4gICAgICAgICAgICAnYCcgKyB0b2sudGV4dFszLi4tNF0gKyAnYCdcbiAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAna2V5d29yZCcgYW5kIHRvay50ZXh0ID09ICd5ZXMnXG4gICAgICAgICAgICAndHJ1ZSdcbiAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAna2V5d29yZCcgYW5kIHRvay50ZXh0ID09ICdubydcbiAgICAgICAgICAgICdmYWxzZSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdG9rLnRleHRcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG4gICAgY29tbWVudDogKHRvaykgLT5cblxuICAgICAgICBpZiB0b2sudGV4dC5zdGFydHNXaXRoICcjIyMnXG4gICAgICAgICAgICAnLyonICsgdG9rLnRleHRbMy4uLTRdICsgJyovJyArICdcXG4nXG4gICAgICAgIGVsc2UgaWYgdG9rLnRleHQuc3RhcnRzV2l0aCAnIydcbiAgICAgICAgICAgIGtzdHIucGFkKCcnLCB0b2suY29sKSArICcvLycgKyB0b2sudGV4dFsxLi4tMV1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZXJyb3IgXCIjIGNvbW1lbnQgdG9rZW4gZXhwZWN0ZWRcIlxuICAgICAgICAgICAgJydcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxuICAgIG9wZXJhdGlvbjogKG9wKSAtPlxuXG4gICAgICAgIG9wbWFwID0gKG8pIC0+XG4gICAgICAgICAgICBvbXAgPVxuICAgICAgICAgICAgICAgIGFuZDogICAgJyYmJ1xuICAgICAgICAgICAgICAgIG9yOiAgICAgJ3x8J1xuICAgICAgICAgICAgICAgIG5vdDogICAgJyEnXG4gICAgICAgICAgICAgICAgJz09JzogICAnPT09J1xuICAgICAgICAgICAgICAgICchPSc6ICAgJyE9PSdcbiAgICAgICAgICAgIG9tcFtvXSA/IG9cblxuICAgICAgICBvICAgPSBvcG1hcCBvcC5vcGVyYXRvci50ZXh0XG4gICAgICAgIHNlcCA9ICcgJ1xuICAgICAgICBzZXAgPSAnJyBpZiBub3Qgb3AubGhzIG9yIG5vdCBvcC5yaHNcblxuICAgICAgICBpZiBvIGluIFsnPCcnPD0nJz09PScnIT09Jyc+PScnPiddXG4gICAgICAgICAgICBybyA9IG9wbWFwIG9wLnJocz8ub3BlcmF0aW9uPy5vcGVyYXRvci50ZXh0XG4gICAgICAgICAgICBpZiBybyBpbiBbJzwnJzw9Jyc9PT0nJyE9PScnPj0nJz4nXVxuICAgICAgICAgICAgICAgIHJldHVybiAnKCcgKyBAYXRvbShvcC5saHMpICsgc2VwICsgbyArIHNlcCArIEBhdG9tKG9wLnJocy5vcGVyYXRpb24ubGhzKSArICcgJiYgJyArIGtzdHIubHN0cmlwKEBhdG9tKG9wLnJocykpICsgJyknXG5cbiAgICAgICAgb3BlbiA9IGNsb3NlID0gJydcbiAgICAgICAgXG4gICAgICAgIGlmIG8gPT0gJz0nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9wLmxocy5vYmplY3QgIyBsaHMgaXMgY3VybHksIGVnLiB7eCx5fSA9IHJlcXVpcmUgJydcbiAgICAgICAgICAgICAgICBzID0gJydcbiAgICAgICAgICAgICAgICBmb3Iga2V5dmFsIGluIG9wLmxocy5vYmplY3Qua2V5dmFsc1xuICAgICAgICAgICAgICAgICAgICBzICs9IFwiI3trZXl2YWwudGV4dH0gPSAje0BhdG9tKG9wLnJocyl9LiN7a2V5dmFsLnRleHR9XFxuXCJcbiAgICAgICAgICAgICAgICByZXR1cm4gc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIG9wLnJocz8ub3BlcmF0aW9uPy5vcGVyYXRvci50ZXh0ID09ICc9J1xuICAgICAgICAgICAgb3BlbiA9ICcoJ1xuICAgICAgICAgICAgY2xvc2UgPSAnKSdcblxuICAgICAgICBmaXJzdCA9IGZpcnN0TGluZUNvbCBvcC5saHNcbiAgICAgICAgcHJmeCA9IGlmIGZpcnN0LmNvbCA9PSAwIGFuZCBvcC5yaHM/LmZ1bmMgdGhlbiAnXFxuJyBlbHNlICcnXG4gICAgICAgICAgICBcbiAgICAgICAgcHJmeCArIEBhdG9tKG9wLmxocykgKyBzZXAgKyBvICsgc2VwICsgb3BlbiArIGtzdHIubHN0cmlwIEBhdG9tKG9wLnJocykgKyBjbG9zZVxuXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBpbmNvbmQ6IChwKSAtPlxuXG4gICAgICAgIFwiI3tAbm9kZSBwLnJoc30uaW5kZXhPZigje0BhdG9tIHAubGhzfSkgPj0gMFwiXG5cbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBwYXJlbnM6IChwKSAtPiBcbiAgICAgICAgIyBsb2cgJ3BhcmVucycgcFxuICAgICAgICBcIigje0Bub2RlcyBwLmV4cHN9KVwiXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMFxuXG4gICAgb2JqZWN0OiAocCkgLT4gXG4gICAgICAgIG5vZGVzID0gcC5rZXl2YWxzLm1hcCAocykgPT4gQGF0b20gc1xuICAgICAgICBub2RlcyA9IG5vZGVzLm1hcCAobikgLT4gaWYgJzonIGluIG4gdGhlbiBuIGVsc2UgXCIje259OiN7bn1cIiAgICAgICAgXG4gICAgICAgIFwieyN7bm9kZXMuam9pbiAnLCd9fVwiXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAga2V5dmFsOiAocCkgLT5cbiAgICAgICAga2V5ID0gQG5vZGUgcC5rZXlcbiAgICAgICAgaWYga2V5WzBdIG5vdCBpbiBcIidcXFwiXCIgYW5kIC9bXFwuXFwsXFw7XFwqXFwrXFwtXFwvXFw9XFx8XS8udGVzdCBrZXkgdGhlbiBrZXkgPSBcIicje2tleX0nXCJcbiAgICAgICAgXCIje2tleX06I3tAYXRvbShwLnZhbCl9XCJcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG5cbiAgICBwcm9wOiAgIChwKSAtPlxuXG4gICAgICAgIFwiI3tAbm9kZShwLm9iail9LiN7QG5vZGUgcC5wcm9wfVwiXG5cbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgaW5kZXg6ICAocCkgLT5cblxuICAgICAgICBpZiBzbGljZSA9IHAuc2xpZHguc2xpY2VcblxuICAgICAgICAgICAgZnJvbSA9IGlmIHNsaWNlLmZyb20/IHRoZW4gQG5vZGUgc2xpY2UuZnJvbSBlbHNlICcwJ1xuXG4gICAgICAgICAgICBhZGRPbmUgPSBzbGljZS5kb3RzLnRleHQgPT0gJy4uJ1xuXG4gICAgICAgICAgICBpZiBzbGljZS51cHRvPyB0aGVuIHVwdG8gPSBAbm9kZSBzbGljZS51cHRvXG5cbiAgICAgICAgICAgIGlmIHNsaWNlLnVwdG8/LnR5cGUgPT0gJ251bScgb3Igc2xpY2UudXB0bz8ub3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgdSA9IHBhcnNlSW50IHVwdG9cbiAgICAgICAgICAgICAgICBpZiBOdW1iZXIuaXNGaW5pdGUgdVxuICAgICAgICAgICAgICAgICAgICBpZiB1ID09IC0xIGFuZCBhZGRPbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwcGVyID0gJydcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdSArPSAxIGlmIGFkZE9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgdXBwZXIgPSBcIiwgI3t1fVwiXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB1cHBlciA9IFwiLCAje3VwdG99XCJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBhZGRPbmUgdGhlbiBpZiB1cHRvIHRoZW4gdXBwZXIgPSBcIiwgdHlwZW9mICN7dXB0b30gPT09ICdudW1iZXInICYmICN7dXB0b30rMSB8fCBJbmZpbml0eVwiXG4gICAgICAgICAgICAgICAgZWxzZSAgICAgICAgICAgICAgICAgICAgICAgIHVwcGVyID0gXCIsIHR5cGVvZiAje3VwdG99ID09PSAnbnVtYmVyJyAmJiAje3VwdG99IHx8IC0xXCJcblxuICAgICAgICAgICAgXCIje0BhdG9tKHAuaWR4ZWUpfS5zbGljZSgje2Zyb219I3t1cHBlciA/ICcnfSlcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBwLnNsaWR4LnRleHQ/WzBdID09ICctJ1xuICAgICAgICAgICAgICAgIG5pID0gcGFyc2VJbnQgcC5zbGlkeC50ZXh0XG4gICAgICAgICAgICAgICAgaWYgbmkgPT0gLTFcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiI3tAbm9kZShwLmlkeGVlKX0uc2xpY2UoI3tuaX0pWzBdXCJcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIiN7QG5vZGUocC5pZHhlZSl9LnNsaWNlKCN7bml9LCN7bmkrMX0pWzBdXCJcblxuICAgICAgICAgICAgXCIje0Bub2RlKHAuaWR4ZWUpfVsje0Bub2RlIHAuc2xpZHh9XVwiXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG4gICAgYXJyYXk6IChwKSAtPlxuXG4gICAgICAgIGlmIHAuaXRlbXNbMF0/LnNsaWNlXG4gICAgICAgICAgICBAc2xpY2UgcC5pdGVtc1swXS5zbGljZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBcIlsje0Bub2RlcyBwLml0ZW1zLCAnLCd9XVwiXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMFxuXG4gICAgc2xpY2U6IChwKSAtPlxuXG4gICAgICAgIGlmIHAuZnJvbS50eXBlID09ICdudW0nID09IHAudXB0by50eXBlXG4gICAgICAgICAgICBmcm9tID0gcGFyc2VJbnQgcC5mcm9tLnRleHRcbiAgICAgICAgICAgIHVwdG8gPSBwYXJzZUludCBwLnVwdG8udGV4dFxuICAgICAgICAgICAgaWYgdXB0by1mcm9tIDw9IDEwXG4gICAgICAgICAgICAgICAgaWYgcC5kb3RzLnRleHQgPT0gJy4uLicgdGhlbiB1cHRvLS1cbiAgICAgICAgICAgICAgICAnWycrKCh4IGZvciB4IGluIFtmcm9tLi51cHRvXSkuam9pbiAnLCcpKyddJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG8gPSBpZiBwLmRvdHMudGV4dCA9PSAnLi4uJyB0aGVuICc8JyBlbHNlICc8PSdcbiAgICAgICAgICAgICAgICBcIihmdW5jdGlvbigpIHsgdmFyIHIgPSBbXTsgZm9yICh2YXIgaSA9ICN7ZnJvbX07IGkgI3tvfSAje3VwdG99OyBpKyspeyByLnB1c2goaSk7IH0gcmV0dXJuIHI7IH0pLmFwcGx5KHRoaXMpXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbyA9IGlmIHAuZG90cy50ZXh0ID09ICcuLi4nIHRoZW4gJzwnIGVsc2UgJzw9J1xuICAgICAgICAgICAgXCIoZnVuY3Rpb24oKSB7IHZhciByID0gW107IGZvciAodmFyIGkgPSAje0Bub2RlIHAuZnJvbX07IGkgI3tvfSAje0Bub2RlIHAudXB0b307IGkrKyl7IHIucHVzaChpKTsgfSByZXR1cm4gcjsgfSkuYXBwbHkodGhpcylcIlxuXG4gICAgIyAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgZnJlc2hWYXI6IChuYW1lLCBzdWZmaXg9MCkgLT5cblxuICAgICAgICBmb3IgdmFycyBpbiBAdmFyc3RhY2tcbiAgICAgICAgICAgIGZvciB2IGluIHZhcnNcbiAgICAgICAgICAgICAgICBpZiB2LnRleHQgPT0gbmFtZSArIChzdWZmaXggb3IgJycpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBAZnJlc2hWYXIgbmFtZSwgc3VmZml4KzFcblxuICAgICAgICBAdmFyc3RhY2tbLTFdLnB1c2ggdGV4dDpuYW1lICsgKHN1ZmZpeCBvciAnJylcbiAgICAgICAgbmFtZSArIChzdWZmaXggb3IgJycpXG5cbiAgICB2ZXJiOiAtPiBpZiBAdmVyYm9zZSB0aGVuIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHNcbiAgICBcbiAgICBpbmQ6IC0+XG5cbiAgICAgICAgb2kgPSBAaW5kZW50XG4gICAgICAgIEBpbmRlbnQgKz0gJyAgICAnXG4gICAgICAgIG9pXG5cbiAgICBkZWQ6IC0+IEBpbmRlbnQgPSBAaW5kZW50Wy4uLi00XVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgIFxuICAgIHN0cmlwb2w6IChjaHVua3MpIC0+XG4gICAgICAgIFxuICAgICAgIHMgPSAnYCdcbiAgICAgICBmb3IgY2h1bmsgaW4gY2h1bmtzXG4gICAgICAgICAgIHQgPSBjaHVuay50ZXh0XG4gICAgICAgICAgIHN3aXRjaCBjaHVuay50eXBlXG4gICAgICAgICAgICAgICB3aGVuICdvcGVuJyAgdGhlbiBzKz0gdCsnJHsnXG4gICAgICAgICAgICAgICB3aGVuICdjbG9zZScgdGhlbiBzKz0gJ30nK3RcbiAgICAgICAgICAgICAgIHdoZW4gJ21pZGwnICB0aGVuIHMrPSAnfScrdCsnJHsnXG4gICAgICAgICAgICAgICB3aGVuICdjb2RlJyAgdGhlbiBzKz0gQGNvbXBpbGUgdFxuICAgICAgIHMgKz0gJ2AnXG4gICAgICAgc1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlbmRlcmVyXG4iXX0=
//# sourceURL=../coffee/renderer.coffee