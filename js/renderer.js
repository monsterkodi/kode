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
        var e, eb, g2, gi, iterVar, j, len, len1, list, listVar, lv, nl, postfix, prefix, q, r, ref1, ref2, ref3, ref4, ref5, results, s, v, w;
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
            lv = n.vals[1].text;
            s += gi + ("for (" + lv + " = 0; " + lv + " < " + listVar + ".length; " + lv + "++)") + nl;
            s += gi + "{" + nl;
            s += g2 + ("" + varPrefix + n.vals[0].text + " = " + listVar + "[i]") + eb;
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
        s += ("for (" + key + " in " + obj + ")") + nl;
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
            console.log('n.else', n["else"]);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUVBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQThDLE9BQUEsQ0FBUSxTQUFSLENBQTlDLEVBQUUsaUJBQUYsRUFBUyxpQkFBVCxFQUFnQiwrQkFBaEIsRUFBOEI7O0FBRXhCO0lBRUMsa0JBQUMsSUFBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxNQUFELEdBQVU7UUFRVixJQUFDLENBQUEsS0FBRCx5Q0FBcUIsQ0FBRTtRQUN2QixJQUFDLENBQUEsT0FBRCx5Q0FBcUIsQ0FBRTtJQVh4Qjs7dUJBYUgsT0FBQSxHQUFTLFNBQUMsSUFBRDtBQUVMLFlBQUE7UUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O1lBQ1AsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxVQUFXLElBQUk7O2VBQ2hCLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFpQixJQUFqQjtJQUpLOzt1QkFNVCxNQUFBLEdBQVEsU0FBQyxHQUFEO0FBRUosWUFBQTtRQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBQyxHQUFHLENBQUMsSUFBTDtRQUNaLElBQUMsQ0FBQSxNQUFELEdBQVU7UUFDVixDQUFBLEdBQUk7UUFFSixJQUFHLEtBQUEsQ0FBTSxHQUFHLENBQUMsSUFBVixDQUFIO1lBQ0ksRUFBQSxHQUFLOztBQUFDO0FBQUE7cUJBQUEsc0NBQUE7O2lDQUFBLENBQUMsQ0FBQztBQUFGOztnQkFBRCxDQUEwQixDQUFDLElBQTNCLENBQWdDLElBQWhDO1lBQ0wsQ0FBQSxJQUFLLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQSxNQUFBLEdBQU8sRUFB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R0FBMUIsRUFBK0IsU0FBL0IsRUFBakI7O0lBQUg7O3VCQUVOLEdBQUEsR0FBSyxTQUFBO0FBRUQsWUFBQTtRQUFBLEVBQUEsR0FBSyxJQUFDLENBQUE7UUFDTixJQUFDLENBQUEsTUFBRCxJQUFXO2VBQ1g7SUFKQzs7dUJBTUwsR0FBQSxHQUFLLFNBQUE7ZUFBRyxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxNQUFPO0lBQXJCOzt1QkFRTCxPQUFBLEdBQVMsU0FBQyxNQUFEO0FBRU4sWUFBQTtRQUFBLENBQUEsR0FBSTtBQUNKLGFBQUEsd0NBQUE7O1lBQ0ksQ0FBQSxHQUFJLEtBQUssQ0FBQztBQUNWLG9CQUFPLEtBQUssQ0FBQyxJQUFiO0FBQUEscUJBQ1MsTUFEVDtvQkFDc0IsQ0FBQSxJQUFJLENBQUEsR0FBRTtBQUFuQjtBQURULHFCQUVTLE9BRlQ7b0JBRXNCLENBQUEsSUFBSSxHQUFBLEdBQUk7QUFBckI7QUFGVCxxQkFHUyxNQUhUO29CQUdzQixDQUFBLElBQUksR0FBQSxHQUFJLENBQUosR0FBTTtBQUF2QjtBQUhULHFCQUlTLE1BSlQ7b0JBSXNCLENBQUEsSUFBSSxJQUFDLENBQUEsT0FBRCxDQUFTLENBQVQ7QUFKMUI7QUFGSjtRQU9BLENBQUEsSUFBSztlQUNMO0lBWE07Ozs7OztBQWFiLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG5rc3RyICA9IHJlcXVpcmUgJ2tzdHInXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5cbnsgdmFsaWQsIGVtcHR5LCBmaXJzdExpbmVDb2wsIGxhc3RMaW5lQ29sIH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5jbGFzcyBSZW5kZXJlclxuXG4gICAgQDogKEBrb2RlKSAtPlxuXG4gICAgICAgIEBoZWFkZXIgPSBcIlwiXCJcbiAgICAgICAgICAgIGNvbnN0IF9rXyA9IHtcbiAgICAgICAgICAgICAgICBsaXN0OiAgIGZ1bmN0aW9uIChsKSAgIHtyZXR1cm4gKGwgIT0gbnVsbCA/IHR5cGVvZiBsLmxlbmd0aCA9PT0gJ251bWJlcicgPyBsIDogW10gOiBbXSl9XG4gICAgICAgICAgICAgICAgbGVuZ3RoOiBmdW5jdGlvbiAobCkgICB7cmV0dXJuIChsICE9IG51bGwgPyB0eXBlb2YgbC5sZW5ndGggPT09ICdudW1iZXInID8gbC5sZW5ndGggOiAwIDogMCl9LFxuICAgICAgICAgICAgICAgIGluOiAgICAgZnVuY3Rpb24gKGEsbCkge3JldHVybiAobCAhPSBudWxsID8gdHlwZW9mIGwuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJyA/IGwuaW5kZXhPZihhKSA+PSAwIDogZmFsc2UgOiBmYWxzZSl9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBAZGVidWcgICA9IEBrb2RlLmFyZ3M/LmRlYnVnXG4gICAgICAgIEB2ZXJib3NlID0gQGtvZGUuYXJncz8udmVyYm9zZVxuXG4gICAgY29tcGlsZTogKGNvZGUpIC0+IFxuICAgIFxuICAgICAgICBLb2RlID0gcmVxdWlyZSAnLi9rb2RlJ1xuICAgICAgICBAc3ViS29kZSA/PSBuZXcgS29kZSBcbiAgICAgICAgQHN1YktvZGUuY29tcGlsZSBjb2RlXG4gICAgICAgIFxuICAgIHJlbmRlcjogKGFzdCkgLT5cblxuICAgICAgICBAdmFyc3RhY2sgPSBbYXN0LnZhcnNdXG4gICAgICAgIEBpbmRlbnQgPSAnJ1xuICAgICAgICBzID0gJydcblxuICAgICAgICBpZiB2YWxpZCBhc3QudmFyc1xuICAgICAgICAgICAgdnMgPSAodi50ZXh0IGZvciB2IGluIGFzdC52YXJzKS5qb2luICcsICdcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIFwidmFyICN7dnN9XFxuXFxuXCJcblxuICAgICAgICBzICs9IEBub2RlcyBhc3QuZXhwcywgJ1xcbidcbiAgICAgICAgc1xuXG4gICAgbm9kZXM6IChub2Rlcywgc2VwPScsJykgLT5cblxuICAgICAgICBzbCA9IG5vZGVzLm1hcCAocykgPT4gQGF0b20gc1xuICAgICAgICBcbiAgICAgICAgaWYgc2VwID09ICdcXG4nXG4gICAgICAgICAgICBzbCA9IHNsLm1hcCAocykgPT5cbiAgICAgICAgICAgICAgICBzdHJpcHBlZCA9IGtzdHIubHN0cmlwIHNcbiAgICAgICAgICAgICAgICBpZiBzdHJpcHBlZFswXSBpbiAnKFsnIHRoZW4gJzsnK3MgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBzdHJpcHBlZC5zdGFydHNXaXRoICdmdW5jdGlvbicgdGhlbiBcIigje3N9KVwiXG4gICAgICAgICAgICAgICAgZWxzZSBzXG4gICAgICAgICAgICBcbiAgICAgICAgc3MgPSBzbC5qb2luIHNlcFxuXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG5cbiAgICBub2RlOiAoZXhwKSAtPlxuXG4gICAgICAgIHJldHVybiAnJyBpZiBub3QgZXhwXG5cbiAgICAgICAgaWYgZXhwLnR5cGU/IGFuZCBleHAudGV4dD8gdGhlbiByZXR1cm4gQHRva2VuIGV4cFxuXG4gICAgICAgIGlmIGV4cCBpbnN0YW5jZW9mIEFycmF5IHRoZW4gcmV0dXJuIChAbm9kZShhKSBmb3IgYSBpbiBleHApLmpvaW4gJztcXG4nXG5cbiAgICAgICAgcyA9ICcnXG5cbiAgICAgICAgZm9yIGssdiBvZiBleHBcblxuICAgICAgICAgICAgcys9IHN3aXRjaCBrXG4gICAgICAgICAgICAgICAgd2hlbiAnaWYnICAgICAgICB0aGVuIEBpZiB2XG4gICAgICAgICAgICAgICAgd2hlbiAnZm9yJyAgICAgICB0aGVuIEBmb3IgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3doaWxlJyAgICAgdGhlbiBAd2hpbGUgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3JldHVybicgICAgdGhlbiBAcmV0dXJuIHZcbiAgICAgICAgICAgICAgICB3aGVuICdjbGFzcycgICAgIHRoZW4gQGNsYXNzIHZcbiAgICAgICAgICAgICAgICB3aGVuICdzd2l0Y2gnICAgIHRoZW4gQHN3aXRjaCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnd2hlbicgICAgICB0aGVuIEB3aGVuIHZcbiAgICAgICAgICAgICAgICB3aGVuICdhc3NlcnQnICAgIHRoZW4gQGFzc2VydCB2XG4gICAgICAgICAgICAgICAgd2hlbiAncW1ya29wJyAgICB0aGVuIEBxbXJrb3AgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3N0cmlwb2wnICAgdGhlbiBAc3RyaXBvbCB2XG4gICAgICAgICAgICAgICAgd2hlbiAncW1ya2NvbG9uJyB0aGVuIEBxbXJrY29sb24gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ29wZXJhdGlvbicgdGhlbiBAb3BlcmF0aW9uIHZcbiAgICAgICAgICAgICAgICB3aGVuICdpbmNvbmQnICAgIHRoZW4gQGluY29uZCB2XG4gICAgICAgICAgICAgICAgd2hlbiAncGFyZW5zJyAgICB0aGVuIEBwYXJlbnMgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ29iamVjdCcgICAgdGhlbiBAb2JqZWN0IHZcbiAgICAgICAgICAgICAgICB3aGVuICdrZXl2YWwnICAgIHRoZW4gQGtleXZhbCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnYXJyYXknICAgICB0aGVuIEBhcnJheSB2XG4gICAgICAgICAgICAgICAgd2hlbiAnbGNvbXAnICAgICB0aGVuIEBsY29tcCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnaW5kZXgnICAgICB0aGVuIEBpbmRleCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnc2xpY2UnICAgICB0aGVuIEBzbGljZSB2XG4gICAgICAgICAgICAgICAgd2hlbiAncHJvcCcgICAgICB0aGVuIEBwcm9wIHZcbiAgICAgICAgICAgICAgICB3aGVuICdlYWNoJyAgICAgIHRoZW4gQGVhY2ggdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2Z1bmMnICAgICAgdGhlbiBAZnVuYyB2XG4gICAgICAgICAgICAgICAgd2hlbiAnY2FsbCcgICAgICB0aGVuIEBjYWxsIHZcbiAgICAgICAgICAgICAgICB3aGVuICd0cnknICAgICAgIHRoZW4gQHRyeSB2XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBsb2cgUjQoXCJyZW5kZXJlci5ub2RlIHVuaGFuZGxlZCBrZXkgI3trfSBpbiBleHBcIiksIGV4cCAjIGlmIEBkZWJ1ZyBvciBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICAnJ1xuICAgICAgICBzXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBhdG9tOiAoZXhwKSAtPlxuXG4gICAgICAgIEBmaXhBc3NlcnRzIEBub2RlIGV4cFxuXG4gICAgYXNzZXJ0OiAocCkgLT5cblxuICAgICAgICAn4pa+JyArIEBub2RlKHAub2JqKSArIFwi4pa4I3twLnFtcmsubGluZX1fI3twLnFtcmsuY29sfeKXglwiXG4gICAgICAgIFxuICAgIHFtcmtvcDogKHApIC0+XG4gICAgICAgIFxuICAgICAgICB2biA9IFwiXyN7cC5xbXJrLmxpbmV9XyN7cC5xbXJrLmNvbH1fXCJcbiAgICAgICAgXCIoKCN7dm59PSN7QGF0b20gcC5saHN9KSAhPSBudWxsID8gI3t2bn0gOiAje0BhdG9tIHAucmhzfSlcIlxuXG4gICAgcW1ya2NvbG9uOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIFwiKCN7QGF0b20gcC5saHN9ID8gI3tAYXRvbSBwLm1pZH0gOiAje0BhdG9tIHAucmhzfSlcIlxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgMDAwICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMFxuXG4gICAgZml4QXNzZXJ0czogKHMpIC0+XG5cbiAgICAgICAgQHZlcmIgJ2ZpeEFzc2VydHMnIHNcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBzP1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuICcnIGlmIG5vdCBzPyBvciBzLmxlbmd0aCA9PSAwXG5cbiAgICAgICAgd2hpbGUgc1swXSA9PSAn4pa+JyB0aGVuIHMgPSBzWzEuLl0gXG4gICAgICAgIGlmICfilr4nIGluIHNcbiAgICAgICAgICAgIGkgPSBzLmluZGV4T2YgJ+KWvidcbiAgICAgICAgICAgIHJldHVybiBzWy4uLmldICsgQGZpeEFzc2VydHMgc1tpKzEuLl1cbiAgICAgICAgICAgIFxuICAgICAgICBpZiAnXFxuJyBpbiBzXG4gICAgICAgICAgICBpID0gcy5pbmRleE9mICdcXG4nXG4gICAgICAgICAgICByZXR1cm4gQGZpeEFzc2VydHMoc1suLi5pXSkgKyBzW2kuLl1cbiAgICAgICAgXG4gICAgICAgIHNwbHQgPSBzLnNwbGl0IC/ilrhcXGQrX1xcZCvil4IvXG4gICAgICAgIG10Y2ggPSBzLm1hdGNoIC/ilrhcXGQrX1xcZCvil4IvZ1xuXG4gICAgICAgIGlmIHNwbHQubGVuZ3RoID4gMVxuXG4gICAgICAgICAgICBtdGNoID0gbXRjaC5tYXAgKG0pIC0+IFwiXyN7bVsxLi4tMl19X1wiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHNwbHRbLTFdID09ICcnICMgYXNzZXJ0IGVuZHMgd2l0aCA/XG4gICAgICAgICAgICAgICAgaWYgc3BsdC5sZW5ndGggPiAyXG4gICAgICAgICAgICAgICAgICAgIHNwbHQucG9wKClcbiAgICAgICAgICAgICAgICAgICAgbXRjaC5wb3AoKVxuICAgICAgICAgICAgICAgICAgICB0ID0gc3BsdC5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIHNwbHQubGVuZ3RoICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHQgKz0gJ+KWuCcrbXRjaC5zaGlmdCgpWzEuLi4tMV0rJ+KXgidcbiAgICAgICAgICAgICAgICAgICAgICAgIHQgKz0gc3BsdC5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIHQgPSBAZml4QXNzZXJ0cyB0XG4gICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgdCA9IHNwbHRbMF1cbiAgICAgICAgICAgICAgICByZXR1cm4gIFwiKCN7dH0gIT0gbnVsbClcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBsb2cgc3BsdCwgbXRjaFxuXG4gICAgICAgICAgICBzID0gJydcblxuICAgICAgICAgICAgZm9yIGkgaW4gMC4uLm10Y2gubGVuZ3RoXG5cbiAgICAgICAgICAgICAgICBpZiBtdGNoLmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICAgICAgbCA9IFwiKCN7bXRjaFtpXX09I3soaWYgaSB0aGVuIG10Y2hbaS0xXStzcGx0W2ldIGVsc2Ugc3BsdFswXSl9KVwiXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBsID0gc3BsdFswXVxuXG4gICAgICAgICAgICAgICAgaWYgc3BsdFtpKzFdWzBdID09ICcoJ1xuICAgICAgICAgICAgICAgICAgICBzICs9IFwidHlwZW9mICN7bH0gPT09IFxcXCJmdW5jdGlvblxcXCIgPyBcIlxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcyArPSBcIiN7bH0gIT0gbnVsbCA/IFwiXG5cbiAgICAgICAgICAgIGlmIG10Y2gubGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgIHMgKz0gbXRjaFstMV0rc3BsdFstMV1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzICs9IHNwbHRbMF0rc3BsdFsxXVxuXG4gICAgICAgICAgICBmb3IgaSBpbiAwLi4ubXRjaC5sZW5ndGggdGhlbiBzICs9IFwiIDogdW5kZWZpbmVkXCJcblxuICAgICAgICAgICAgcyA9IFwiKCN7c30pXCJcbiAgICAgICAgc1xuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbiAgICBjbGFzczogKG4pIC0+XG5cbiAgICAgICAgcyA9ICdcXG4nXG4gICAgICAgIHMgKz0gXCJjbGFzcyAje24ubmFtZS50ZXh0fVwiXG5cbiAgICAgICAgaWYgbi5leHRlbmRzXG4gICAgICAgICAgICBzICs9IFwiIGV4dGVuZHMgXCIgKyBuLmV4dGVuZHMubWFwKChlKSAtPiBlLnRleHQpLmpvaW4gJywgJ1xuXG4gICAgICAgIHMgKz0gJ1xcbnsnXG5cbiAgICAgICAgIyBtdGhkcyA9IG4uYm9keT8ub2JqZWN0Py5rZXl2YWxzID8gbi5ib2R5P1swXT8ub2JqZWN0Py5rZXl2YWxzXG4gICAgICAgIG10aGRzID0gbi5ib2R5XG5cbiAgICAgICAgaWYgbXRoZHM/Lmxlbmd0aFxuICAgICAgICAgICAgbXRoZHMgPSBAcHJlcGFyZU1ldGhvZHMgbXRoZHNcbiAgICAgICAgICAgIEBpbmRlbnQgPSAnICAgICdcbiAgICAgICAgICAgIGZvciBtaSBpbiAwLi4ubXRoZHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgcyArPSAnXFxuJyBpZiBtaVxuICAgICAgICAgICAgICAgIHMgKz0gQG10aGQgbXRoZHNbbWldXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBAaW5kZW50ID0gJydcbiAgICAgICAgcyArPSAnfVxcbidcbiAgICAgICAgc1xuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuXG4gICAgcHJlcGFyZU1ldGhvZHM6IChtdGhkcykgLT5cblxuICAgICAgICBiaW5kID0gW11cbiAgICAgICAgZm9yIG0gaW4gbXRoZHNcbiAgICAgICAgICAgIGlmIG5vdCBtLmtleXZhbFxuICAgICAgICAgICAgICAgIHByaW50LmFzdCAnbm90IGFuIG1ldGhvZD8nIG1cbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgaWYgbm90IG0ua2V5dmFsLnZhbC5mdW5jXG4gICAgICAgICAgICAgICAgcHJpbnQuYXN0ICdubyBmdW5jIGZvciBtZXRob2Q/JyBtXG4gICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgbmFtZSA9IG0ua2V5dmFsLnZhbC5mdW5jLm5hbWUudGV4dFxuICAgICAgICAgICAgaWYgbmFtZSBpbiBbJ0AnICdjb25zdHJ1Y3RvciddXG4gICAgICAgICAgICAgICAgaWYgY29uc3RydWN0b3IgdGhlbiBlcnJvciAnbW9yZSB0aGFuIG9uZSBjb25zdHJ1Y3Rvcj8nXG4gICAgICAgICAgICAgICAgbS5rZXl2YWwudmFsLmZ1bmMubmFtZS50ZXh0ID0gJ2NvbnN0cnVjdG9yJ1xuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yID0gbVxuICAgICAgICAgICAgZWxzZSBpZiBuYW1lLnN0YXJ0c1dpdGggJ0AnXG4gICAgICAgICAgICAgICAgbS5rZXl2YWwudmFsLmZ1bmMubmFtZS50ZXh0ID0gJ3N0YXRpYyAnICsgbmFtZVsxLi5dXG4gICAgICAgICAgICBlbHNlIGlmIG0ua2V5dmFsLnZhbC5mdW5jPy5hcnJvdy50ZXh0ID09ICc9PidcbiAgICAgICAgICAgICAgICBiaW5kLnB1c2ggbVxuXG4gICAgICAgIGlmIGJpbmQubGVuZ3RoIGFuZCBub3QgY29uc3RydWN0b3IgIyBmb3VuZCBzb21lIG1ldGhvZHMgdG8gYmluZCwgYnV0IG5vIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICBhc3QgPSBAa29kZS5hc3QgXCJjb25zdHJ1Y3RvcjogLT5cIiAjIGNyZWF0ZSBvbmUgZnJvbSBzY3JhdGNoXG4gICAgICAgICAgICBjb25zdHJ1Y3RvciA9IGFzdC5leHBzWzBdLm9iamVjdC5rZXl2YWxzWzBdXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5rZXl2YWwudmFsLmZ1bmMubmFtZSA9IHR5cGU6J25hbWUnIHRleHQ6J2NvbnN0cnVjdG9yJ1xuICAgICAgICAgICAgbXRoZHMudW5zaGlmdCBjb25zdHJ1Y3RvclxuXG4gICAgICAgIGlmIGJpbmQubGVuZ3RoXG4gICAgICAgICAgICBmb3IgYiBpbiBiaW5kXG4gICAgICAgICAgICAgICAgYm4gPSBiLmtleXZhbC52YWwuZnVuYy5uYW1lLnRleHRcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5rZXl2YWwudmFsLmZ1bmMuYm9keS5leHBzID89IFtdXG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3Iua2V5dmFsLnZhbC5mdW5jLmJvZHkuZXhwcy5wdXNoXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjb2RlJ1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcInRoaXMuI3tibn0gPSB0aGlzLiN7Ym59LmJpbmQodGhpcylcIlxuICAgICAgICBtdGhkc1xuXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBtdGhkOiAobikgLT5cblxuICAgICAgICBpZiBuLmtleXZhbFxuICAgICAgICAgICAgcyAgPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQGZ1bmMgbi5rZXl2YWwudmFsLmZ1bmNcbiAgICAgICAgc1xuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwXG5cbiAgICBmdW5jOiAobikgLT5cblxuICAgICAgICByZXR1cm4gJycgaWYgbm90IG5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIHMgPSBuLm5hbWU/LnRleHQgPyAnZnVuY3Rpb24nXG4gICAgICAgIHMgKz0gJyAoJ1xuXG4gICAgICAgIGFyZ3MgPSBuLmFyZ3M/LnBhcmVucz8uZXhwc1xuICAgICAgICBpZiBhcmdzXG4gICAgICAgICAgICBbc3RyLCB0aHNdID0gQGFyZ3MgYXJnc1xuICAgICAgICAgICAgcyArPSBzdHJcblxuICAgICAgICBzICs9ICcpXFxuJ1xuICAgICAgICBzICs9IGdpICsgJ3snXG5cbiAgICAgICAgQHZhcnN0YWNrLnB1c2ggbi5ib2R5LnZhcnNcblxuICAgICAgICBpZiB2YWxpZCBuLmJvZHkudmFyc1xuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgdnMgPSAodi50ZXh0IGZvciB2IGluIG4uYm9keS52YXJzKS5qb2luICcsICdcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIFwidmFyICN7dnN9XFxuXCJcblxuICAgICAgICBmb3IgdCBpbiB0aHMgPyBbXVxuICAgICAgICAgICAgcyArPSAnXFxuJyArIEBpbmRlbnQgKyB0aHNcblxuICAgICAgICBpZiB2YWxpZCBuLmJvZHkuZXhwc1xuXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzcyA9IG4uYm9keS5leHBzLm1hcCAocykgPT4gQG5vZGUgc1xuICAgICAgICAgICAgc3MgPSBzcy5tYXAgKHMpID0+IEBpbmRlbnQgKyBzXG4gICAgICAgICAgICBzICs9IHNzLmpvaW4gJ1xcbidcbiAgICAgICAgICAgIHMgKz0gJ1xcbicgKyBnaVxuXG4gICAgICAgIHMgKz0gJ30nXG5cbiAgICAgICAgQHZhcnN0YWNrLnBvcCgpXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgMDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcblxuICAgIGFyZ3M6IChhcmdzKSAtPlxuXG4gICAgICAgIHRocyAgPSBbXVxuICAgICAgICB1c2VkID0ge31cblxuICAgICAgICBmb3IgYSBpbiBhcmdzXG4gICAgICAgICAgICBpZiBhLnRleHQgdGhlbiB1c2VkW2EudGV4dF0gPSBhLnRleHRcblxuICAgICAgICBhcmdzID0gYXJncy5tYXAgKGEpIC0+XG4gICAgICAgICAgICBpZiBhLnByb3AgYW5kIGEucHJvcC5vYmoudHlwZSA9PSAndGhpcydcbiAgICAgICAgICAgICAgICB0aGlzVmFyID0gYS5wcm9wLnByb3BcbiAgICAgICAgICAgICAgICBpZiB1c2VkW3RoaXNWYXIudGV4dF1cbiAgICAgICAgICAgICAgICAgICAgZm9yIGkgaW4gWzEuLjEwMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCB1c2VkW3RoaXNWYXIudGV4dCtpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocy5wdXNoIFwidGhpcy4je3RoaXNWYXIudGV4dH0gPSAje3RoaXNWYXIudGV4dCtpfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1Zhci50ZXh0ID0gdGhpc1Zhci50ZXh0K2lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VkW3RoaXNWYXIudGV4dF0gPSB0aGlzVmFyLnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhzLnB1c2ggXCJ0aGlzLiN7dGhpc1Zhci50ZXh0fSA9ICN7dGhpc1Zhci50ZXh0fVwiXG5cbiAgICAgICAgICAgICAgICB0aGlzVmFyXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYVxuXG4gICAgICAgIHN0ciA9IGFyZ3MubWFwKChhKSA9PiBAbm9kZSBhKS5qb2luICcsICdcblxuICAgICAgICBbc3RyLHRoc11cblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAwIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDBcblxuICAgIHJldHVybjogKG4pIC0+XG5cbiAgICAgICAgcyA9ICdyZXR1cm4nXG4gICAgICAgIHMgKz0gJyAnICsgQG5vZGUgbi52YWxcbiAgICAgICAga3N0ci5zdHJpcCBzXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMFxuXG4gICAgY2FsbDogKHApIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBwLmNhbGxlZS50ZXh0IGluIFsnbG9nJyd3YXJuJydlcnJvciddXG4gICAgICAgICAgICBwLmNhbGxlZS50ZXh0ID0gXCJjb25zb2xlLiN7cC5jYWxsZWUudGV4dH1cIlxuICAgICAgICAgICAgXG4gICAgICAgIGNhbGxlZSA9IEBub2RlIHAuY2FsbGVlXG4gICAgICAgIFxuICAgICAgICBpZiBwLmFyZ3NcbiAgICAgICAgICAgIGlmIGNhbGxlZSA9PSAnbmV3J1xuICAgICAgICAgICAgICAgIFwiI3tjYWxsZWV9ICN7QG5vZGVzIHAuYXJncywgJywnfVwiXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgXCIje2NhbGxlZX0oI3tAbm9kZXMgcC5hcmdzLCAnLCd9KVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFwiI3tjYWxsZWV9KClcIlxuXG4gICAgIyAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMFxuXG4gICAgaWY6IChuKSAtPlxuXG4gICAgICAgIGZpcnN0ID0gZmlyc3RMaW5lQ29sIG5cbiAgICAgICAgbGFzdCAgPSBsYXN0TGluZUNvbCBuXG5cbiAgICAgICAgaWYgZmlyc3QubGluZSA9PSBsYXN0LmxpbmUgYW5kIG4uZWxzZSBhbmQgbm90IG4ucmV0dXJuc1xuICAgICAgICAgICAgcmV0dXJuIEBpZklubGluZSBuXG5cbiAgICAgICAgZ2kgPSBAaW5kKClcblxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcImlmICgje0BhdG9tKG4uY29uZCl9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuID8gW11cbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIGZvciBlbGlmIGluIG4uZWxpZnMgPyBbXVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaSArIFwiZWxzZSBpZiAoI3tAYXRvbShlbGlmLmVsaWYuY29uZCl9KVxcblwiXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBmb3IgZSBpbiBlbGlmLmVsaWYudGhlbiA/IFtdXG4gICAgICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIGlmIG4uZWxzZVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaSArICdlbHNlXFxuJ1xuICAgICAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICAgICAgZm9yIGUgaW4gbi5lbHNlID8gW11cbiAgICAgICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG5cbiAgICAjIDAwMCAgMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG5cbiAgICBpZklubGluZTogKG4pIC0+XG5cbiAgICAgICAgcyA9ICcnXG5cbiAgICAgICAgcyArPSBcIiN7QGF0b20obi5jb25kKX0gPyBcIlxuICAgICAgICBpZiBuLnRoZW4/Lmxlbmd0aFxuICAgICAgICAgICAgcyArPSAoQGF0b20oZSkgZm9yIGUgaW4gbi50aGVuKS5qb2luICcsICdcblxuICAgICAgICBpZiBuLmVsaWZzXG4gICAgICAgICAgICBmb3IgZSBpbiBuLmVsaWZzXG4gICAgICAgICAgICAgICAgcyArPSAnIDogJ1xuICAgICAgICAgICAgICAgIHMgKz0gQGlmSW5saW5lIGUuZWxpZlxuXG4gICAgICAgIGlmIG4uZWxzZVxuICAgICAgICAgICAgcyArPSAnIDogJ1xuICAgICAgICAgICAgaWYgbi5lbHNlLmxlbmd0aCA9PSAxXG4gICAgICAgICAgICAgICAgcyArPSBAYXRvbSBuLmVsc2VbMF1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzICs9ICcoJyArIChAYXRvbSBlIGZvciBlIGluIG4uZWxzZSkuam9pbignLCAnKSArICcpJ1xuICAgICAgICBzXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgZWFjaDogKG4pIC0+XG4gICAgICAgIFxuICAgICAgICBudW1BcmdzID0gbi5mbmMuZnVuYy5hcmdzPy5wYXJlbnMuZXhwcy5sZW5ndGhcbiAgICAgICAgXG4gICAgICAgIGlmIG51bUFyZ3MgPT0gMVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAoZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgICAgICByID0gbyBpbnN0YW5jZW9mIEFycmF5ID8gW10gOiB0eXBlb2YgbyA9PSAnc3RyaW5nJyA/IG8uc3BsaXQoJycpIDoge31cbiAgICAgICAgICAgICAgICBmb3IgKGsgaW4gbylcbiAgICAgICAgICAgICAgICB7ICAgXG4gICAgICAgICAgICAgICAgICAgIHZhciBtID0gKCN7QG5vZGUgbi5mbmN9KShvW2tdKVxuICAgICAgICAgICAgICAgICAgICBpZiAobSAhPSBudWxsKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByW2tdID0gbVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBvIGluc3RhbmNlb2YgQXJyYXkgPyByLmZpbHRlcigoZikgPT4geyByZXR1cm4gZiAhPT0gdW5kZWZpbmVkIH0pIDogdHlwZW9mIG8gPT0gJ3N0cmluZycgPyByLmpvaW4oJycpIDogclxuICAgICAgICAgICAgfSkoI3tAbm9kZSBuLmxoc30pXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZWxzZSBpZiBudW1BcmdzXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIChmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgICAgIHIgPSBvIGluc3RhbmNlb2YgQXJyYXkgPyBbXSA6IHR5cGVvZiBvID09ICdzdHJpbmcnID8gby5zcGxpdCgnJykgOiB7fVxuICAgICAgICAgICAgICAgIGZvciAoayBpbiBvKVxuICAgICAgICAgICAgICAgIHsgICBcbiAgICAgICAgICAgICAgICAgICAgdmFyIG0gPSAoI3tAbm9kZSBuLmZuY30pKGssIG9ba10pXG4gICAgICAgICAgICAgICAgICAgIGlmIChtICE9IG51bGwgJiYgbVswXSAhPSBudWxsKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByW21bMF1dID0gbVsxXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBvIGluc3RhbmNlb2YgQXJyYXkgPyByIDogdHlwZW9mIG8gPT0gJ3N0cmluZycgPyByLmpvaW4oJycpIDogclxuICAgICAgICAgICAgfSkoI3tAbm9kZSBuLmxoc30pXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICMgcmV0dXJuIG8gaW5zdGFuY2VvZiBBcnJheSA/IHIuZmlsdGVyKChmKSA9PiB7IHJldHVybiBmICE9PSB1bmRlZmluZWQgfSkgOiB0eXBlb2YgbyA9PSAnc3RyaW5nJyA/IHIuam9pbignJykgOiByXG4gICAgICAgICAgICBcbiAgICAgICAgZWxzZSAjIG5vIGFyZ3NcbiAgICAgICAgICAgIGlmIG4uZm5jLmZ1bmMuYm9keS5leHBzPy5sZW5ndGggPiAwICMgc29tZSBmdW5jIGJ1dCBubyBhcmdzXG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgICAgKGZ1bmN0aW9uIChvKSB7XG4gICAgICAgICAgICAgICAgICAgIHIgPSBvIGluc3RhbmNlb2YgQXJyYXkgPyBbXSA6IHR5cGVvZiBvID09ICdzdHJpbmcnID8gby5zcGxpdCgnJykgOiB7fVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGsgaW4gbylcbiAgICAgICAgICAgICAgICAgICAgeyAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG0gPSAoI3tAbm9kZSBuLmZuY30pKG9ba10pXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobSAhPSBudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJba10gPSBtXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG8gaW5zdGFuY2VvZiBBcnJheSA/IHIuZmlsdGVyKChmKSA9PiB7IHJldHVybiBmICE9PSB1bmRlZmluZWQgfSkgOiB0eXBlb2YgbyA9PSAnc3RyaW5nJyA/IHIuam9pbignJykgOiByXG4gICAgICAgICAgICAgICAgfSkoI3tAbm9kZSBuLmxoc30pXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgZWxzZSAjIG5vIGFyZ3MgYW5kIGVtcHR5IGZ1bmNcbiAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKG8pIHsgcmV0dXJuIG8gaW5zdGFuY2VvZiBBcnJheSA/IFtdIDogdHlwZW9mIG8gPT0gJ3N0cmluZycgPyAnJyA6IHt9IH0pKCN7QG5vZGUgbi5saHN9KVxuICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBmb3I6IChuKSAtPlxuXG4gICAgICAgIGlmIG5vdCBuLnRoZW4gdGhlbiBlcnJvciAnZm9yIGV4cGVjdGVkIHRoZW4nIG5cblxuICAgICAgICBzd2l0Y2ggbi5pbm9mLnRleHRcbiAgICAgICAgICAgIHdoZW4gJ2luJyB0aGVuIEBmb3JfaW4gblxuICAgICAgICAgICAgd2hlbiAnb2YnIHRoZW4gQGZvcl9vZiBuXG4gICAgICAgICAgICBlbHNlIGVycm9yICdmb3IgZXhwZWN0ZWQgaW4vb2YnXG5cbiAgICBmb3JfaW46IChuLCB2YXJQcmVmaXg9JycsIGxhc3RQcmVmaXg9JycsIGxhc3RQb3N0Zml4PScnLCBsaW5lQnJlYWspIC0+XG5cbiAgICAgICAgZ2kgPSBsaW5lQnJlYWsgb3IgQGluZCgpXG4gICAgICAgIG5sID0gbGluZUJyZWFrIG9yICdcXG4nXG4gICAgICAgIGViID0gbGluZUJyZWFrIGFuZCAnOycgb3IgJ1xcbidcbiAgICAgICAgXG4gICAgICAgIGcyID0gaWYgbGluZUJyZWFrIHRoZW4gJycgZWxzZSBAaW5kZW50XG4gICAgICAgIFxuICAgICAgICBsaXN0ID0gQG5vZGUgbi5saXN0XG5cbiAgICAgICAgaWYgbm90IGxpc3Qgb3IgbGlzdCA9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgcHJpbnQubm9vbiAnbm8gbGlzdCBmb3InIG4ubGlzdFxuICAgICAgICAgICAgcHJpbnQuYXN0ICdubyBsaXN0IGZvcicgbi5saXN0XG5cbiAgICAgICAgbGlzdFZhciA9IEBmcmVzaFZhciAnbGlzdCdcbiAgICAgICAgaXRlclZhciA9IFwiXyN7bi5pbm9mLmxpbmV9XyN7bi5pbm9mLmNvbH1fXCJcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJ2YXIgI3tsaXN0VmFyfSA9ICN7bGlzdH1cIiArIGViXG4gICAgICAgIGlmIG4udmFscy50ZXh0XG4gICAgICAgICAgICBzICs9IGdpK1wiZm9yICh2YXIgI3tpdGVyVmFyfSA9IDA7ICN7aXRlclZhcn0gPCAje2xpc3RWYXJ9Lmxlbmd0aDsgI3tpdGVyVmFyfSsrKVwiICsgbmxcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XCIrbmxcbiAgICAgICAgICAgIHMgKz0gZzIrXCIje24udmFscy50ZXh0fSA9ICN7bGlzdFZhcn1bI3tpdGVyVmFyfV1cIiArIGViXG4gICAgICAgIGVsc2UgaWYgbi52YWxzLmFycmF5Py5pdGVtc1xuICAgICAgICAgICAgcyArPSBnaStcImZvciAodmFyICN7aXRlclZhcn0gPSAwOyAje2l0ZXJWYXJ9IDwgI3tsaXN0VmFyfS5sZW5ndGg7ICN7aXRlclZhcn0rKylcIiArIG5sXG4gICAgICAgICAgICBzICs9IGdpK1wie1wiK25sXG4gICAgICAgICAgICBmb3IgaiBpbiAwLi4ubi52YWxzLmFycmF5Lml0ZW1zLmxlbmd0aFxuICAgICAgICAgICAgICAgIHYgPSBuLnZhbHMuYXJyYXkuaXRlbXNbal1cbiAgICAgICAgICAgICAgICBzICs9IGcyK1wiI3t2LnRleHR9ID0gI3tsaXN0VmFyfVsje2l0ZXJWYXJ9XVsje2p9XVwiICsgZWJcbiAgICAgICAgZWxzZSBpZiBuLnZhbHMubGVuZ3RoID4gMVxuICAgICAgICAgICAgbHYgPSBuLnZhbHNbMV0udGV4dFxuICAgICAgICAgICAgcyArPSBnaStcImZvciAoI3tsdn0gPSAwOyAje2x2fSA8ICN7bGlzdFZhcn0ubGVuZ3RoOyAje2x2fSsrKVwiICsgbmxcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XCIgKyBubFxuICAgICAgICAgICAgcyArPSBnMitcIiN7dmFyUHJlZml4fSN7bi52YWxzWzBdLnRleHR9ID0gI3tsaXN0VmFyfVtpXVwiICsgZWJcblxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgcHJlZml4ID0gaWYgbGFzdFByZWZpeCBhbmQgZSA9PSBuLnRoZW5bLTFdIHRoZW4gbGFzdFByZWZpeCBlbHNlICcnXG4gICAgICAgICAgICBwb3N0Zml4ID0gaWYgbGFzdFBvc3RmaXggYW5kIGUgPT0gbi50aGVuWy0xXSB0aGVuIGxhc3RQb3N0Zml4IGVsc2UgJydcbiAgICAgICAgICAgIHMgKz0gZzIgKyBwcmVmaXgrQG5vZGUoZSkrcG9zdGZpeCArIG5sXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcblxuICAgICAgICBAZGVkKCkgaWYgbm90IGxpbmVCcmVha1xuICAgICAgICBzXG5cbiAgICBmb3Jfb2Y6IChuLCB2YXJQcmVmaXg9JycsIGxhc3RQcmVmaXg9JycsIGxhc3RQb3N0Zml4PScnLCBsaW5lQnJlYWspIC0+XG5cbiAgICAgICAgZ2kgPSBsaW5lQnJlYWsgb3IgQGluZCgpXG4gICAgICAgIG5sID0gbGluZUJyZWFrIG9yICdcXG4nXG4gICAgICAgIGViID0gbGluZUJyZWFrIGFuZCAnOycgb3IgJ1xcbidcbiAgICAgICAgZzIgPSBpZiBsaW5lQnJlYWsgdGhlbiAnJyBlbHNlIEBpbmRlbnRcblxuICAgICAgICBrZXkgPSBuLnZhbHMudGV4dCA/IG4udmFsc1swXT8udGV4dFxuICAgICAgICB2YWwgPSBuLnZhbHNbMV0/LnRleHRcblxuICAgICAgICBvYmogPSBAbm9kZSBuLmxpc3RcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJmb3IgKCN7a2V5fSBpbiAje29ian0pXCIrbmxcbiAgICAgICAgcyArPSBnaStcIntcIitubFxuICAgICAgICBpZiB2YWxcbiAgICAgICAgICAgIHMgKz0gZzIrXCIje3ZhclByZWZpeH0je3ZhbH0gPSAje29ian1bI3trZXl9XVwiICsgZWJcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuID8gW11cbiAgICAgICAgICAgIHByZWZpeCA9IGlmIGxhc3RQcmVmaXggYW5kIGUgPT0gbi50aGVuWy0xXSB0aGVuIGxhc3RQcmVmaXggZWxzZSAnJ1xuICAgICAgICAgICAgcG9zdGZpeCA9IGlmIGxhc3RQb3N0Zml4IGFuZCBlID09IG4udGhlblstMV0gdGhlbiBsYXN0UG9zdGZpeCBlbHNlICcnXG4gICAgICAgICAgICBzICs9IGcyKyBwcmVmaXgrQG5vZGUoZSkrcG9zdGZpeCArIG5sXG4gICAgICAgICAgICBcbiAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIEBkZWQoKSBpZiBub3QgbGluZUJyZWFrXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgbGNvbXA6IChuKSAtPlxuICAgICAgICBcbiAgICAgICAgY29tcCA9IChmKSA9PlxuICAgICAgICAgICAgc3dpdGNoIGYuaW5vZi50ZXh0XG4gICAgICAgICAgICAgICAgd2hlbiAnaW4nIHRoZW4gQGZvcl9pbiBmLCAndmFyICcgJ3Jlc3VsdC5wdXNoKCcgJyknICcgJ1xuICAgICAgICAgICAgICAgIHdoZW4gJ29mJyB0aGVuIEBmb3Jfb2YgZiwgJ3ZhciAnICdyZXN1bHQucHVzaCgnICcpJyAnICdcblxuICAgICAgICBcIihmdW5jdGlvbiAoKSB7IHZhciByZXN1bHQgPSBbXTsgI3tjb21wIG4uZm9yfSByZXR1cm4gcmVzdWx0IH0pKClcIlxuXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwXG5cbiAgICB3aGlsZTogKG4pIC0+XG5cbiAgICAgICAgZ2kgPSBAaW5kKClcblxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcIndoaWxlICgje0Bub2RlIG4uY29uZH0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBzd2l0Y2g6IChuKSAtPlxuXG4gICAgICAgIGlmIG5vdCBuLm1hdGNoIHRoZW4gZXJyb3IgJ3N3aXRjaCBleHBlY3RlZCBtYXRjaCcgblxuICAgICAgICBpZiBub3Qgbi53aGVucyB0aGVuIGVycm9yICdzd2l0Y2ggZXhwZWN0ZWQgd2hlbnMnIG5cblxuICAgICAgICBnaSA9IEBpbmQoKVxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwic3dpdGNoICgje0Bub2RlIG4ubWF0Y2h9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgXG4gICAgICAgIGZvciBlIGluIG4ud2hlbnMgPyBbXVxuICAgICAgICAgICAgcyArPSBnaSsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIHZhbGlkIG4uZWxzZVxuICAgICAgICAgICAgcyArPSBAaW5kZW50KydkZWZhdWx0OlxcbidcbiAgICAgICAgICAgIGxvZyAnbi5lbHNlJyBuLmVsc2VcbiAgICAgICAgICAgIGZvciBlIGluIG4uZWxzZVxuICAgICAgICAgICAgICAgIHMgKz0gQGluZGVudCsnICAgICcrIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcyArPSBnaStcIn1cXG5cIlxuXG4gICAgICAgIEBkZWQoKVxuICAgICAgICBzXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgd2hlbjogKG4pIC0+XG5cbiAgICAgICAgaWYgbm90IG4udmFscyB0aGVuIHJldHVybiBlcnJvciAnd2hlbiBleHBlY3RlZCB2YWxzJyBuXG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIGZvciBlIGluIG4udmFsc1xuICAgICAgICAgICAgaSA9IGUgIT0gbi52YWxzWzBdIGFuZCBAaW5kZW50IG9yICcgICAgJ1xuICAgICAgICAgICAgcyArPSBpKydjYXNlICcgKyBAbm9kZShlKSArICc6XFxuJ1xuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgZ2kgPSBAaW5kKClcbiAgICAgICAgICAgIHMgKz0gZ2kgKyAnICAgICcgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBAZGVkKClcbiAgICAgICAgaWYgbm90IChuLnRoZW4gYW5kIG4udGhlblstMV0gYW5kIG4udGhlblstMV0ucmV0dXJuKVxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgJyAgICAnICsgJ2JyZWFrJyBcbiAgICAgICAgc1xuXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgICAgMDAwMDAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHRyeTogKG4pIC0+XG4gICAgICAgIFxuICAgICAgICBzID0gJydcbiAgICAgICAgZ2kgPSBAaW5kKClcbiAgICAgICAgcyArPSAndHJ5XFxuJ1xuICAgICAgICBzICs9IGdpKyd7XFxuJ1xuICAgICAgICBzICs9IEBpbmRlbnQrQG5vZGVzIG4uZXhwcywgJ1xcbicrQGluZGVudFxuICAgICAgICBzICs9IGdpKydcXG4nXG4gICAgICAgIHMgKz0gZ2krJ31cXG4nXG4gICAgICAgIGlmIG4uY2F0Y2ggPyBbXVxuICAgICAgICAgICAgcyArPSBnaStcImNhdGNoICgje0Bub2RlIG4uY2F0Y2guZXJycn0pXFxuXCIgXG4gICAgICAgICAgICBzICs9IGdpKyd7XFxuJ1xuICAgICAgICAgICAgcyArPSBAaW5kZW50K0Bub2RlcyBuLmNhdGNoLmV4cHMsICdcXG4nK0BpbmRlbnRcbiAgICAgICAgICAgIHMgKz0gZ2krJ1xcbidcbiAgICAgICAgICAgIHMgKz0gZ2krJ31cXG4nXG4gICAgICAgIGlmIG4uZmluYWxseVxuICAgICAgICAgICAgcyArPSBnaSsnZmluYWxseVxcbidcbiAgICAgICAgICAgIHMgKz0gZ2krJ3tcXG4nXG4gICAgICAgICAgICBzICs9IEBpbmRlbnQrQG5vZGVzIG4uZmluYWxseSwgJ1xcbicrQGluZGVudFxuICAgICAgICAgICAgcyArPSBnaSsnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaSsnfVxcbidcbiAgICAgICAgQGRlZCgpXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwMCAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwXG4gICAgIyAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICB0b2tlbjogKHRvaykgLT5cblxuICAgICAgICBpZiB0b2sudHlwZSA9PSAnY29tbWVudCdcbiAgICAgICAgICAgIEBjb21tZW50IHRva1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICd0aGlzJ1xuICAgICAgICAgICAgJ3RoaXMnXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ3RyaXBsZSdcbiAgICAgICAgICAgICdgJyArIHRvay50ZXh0WzMuLi00XSArICdgJ1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgPT0gJ3llcydcbiAgICAgICAgICAgICd0cnVlJ1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgPT0gJ25vJ1xuICAgICAgICAgICAgJ2ZhbHNlJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0b2sudGV4dFxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbiAgICBjb21tZW50OiAodG9rKSAtPlxuXG4gICAgICAgIGlmIHRvay50ZXh0LnN0YXJ0c1dpdGggJyMjIydcbiAgICAgICAgICAgICcvKicgKyB0b2sudGV4dFszLi4tNF0gKyAnKi8nICsgJ1xcbidcbiAgICAgICAgZWxzZSBpZiB0b2sudGV4dC5zdGFydHNXaXRoICcjJ1xuICAgICAgICAgICAga3N0ci5wYWQoJycsIHRvay5jb2wpICsgJy8vJyArIHRvay50ZXh0WzEuLi0xXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlcnJvciBcIiMgY29tbWVudCB0b2tlbiBleHBlY3RlZFwiXG4gICAgICAgICAgICAnJ1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgb3BlcmF0aW9uOiAob3ApIC0+XG5cbiAgICAgICAgb3BtYXAgPSAobykgLT5cbiAgICAgICAgICAgIG9tcCA9XG4gICAgICAgICAgICAgICAgYW5kOiAgICAnJiYnXG4gICAgICAgICAgICAgICAgb3I6ICAgICAnfHwnXG4gICAgICAgICAgICAgICAgbm90OiAgICAnISdcbiAgICAgICAgICAgICAgICAnPT0nOiAgICc9PT0nXG4gICAgICAgICAgICAgICAgJyE9JzogICAnIT09J1xuICAgICAgICAgICAgb21wW29dID8gb1xuXG4gICAgICAgIG8gICA9IG9wbWFwIG9wLm9wZXJhdG9yLnRleHRcbiAgICAgICAgc2VwID0gJyAnXG4gICAgICAgIHNlcCA9ICcnIGlmIG5vdCBvcC5saHMgb3Igbm90IG9wLnJoc1xuXG4gICAgICAgIGlmIG8gaW4gWyc8Jyc8PScnPT09JychPT0nJz49Jyc+J11cbiAgICAgICAgICAgIHJvID0gb3BtYXAgb3AucmhzPy5vcGVyYXRpb24/Lm9wZXJhdG9yLnRleHRcbiAgICAgICAgICAgIGlmIHJvIGluIFsnPCcnPD0nJz09PScnIT09Jyc+PScnPiddXG4gICAgICAgICAgICAgICAgcmV0dXJuICcoJyArIEBhdG9tKG9wLmxocykgKyBzZXAgKyBvICsgc2VwICsgQGF0b20ob3AucmhzLm9wZXJhdGlvbi5saHMpICsgJyAmJiAnICsga3N0ci5sc3RyaXAoQGF0b20ob3AucmhzKSkgKyAnKSdcblxuICAgICAgICBvcGVuID0gY2xvc2UgPSAnJ1xuICAgICAgICBcbiAgICAgICAgaWYgbyA9PSAnPSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb3AubGhzLm9iamVjdCAjIGxocyBpcyBjdXJseSwgZWcuIHt4LHl9ID0gcmVxdWlyZSAnJ1xuICAgICAgICAgICAgICAgIHMgPSAnJ1xuICAgICAgICAgICAgICAgIGZvciBrZXl2YWwgaW4gb3AubGhzLm9iamVjdC5rZXl2YWxzXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gXCIje2tleXZhbC50ZXh0fSA9ICN7QGF0b20ob3AucmhzKX0uI3trZXl2YWwudGV4dH1cXG5cIlxuICAgICAgICAgICAgICAgIHJldHVybiBzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGVsc2UgaWYgb3AucmhzPy5vcGVyYXRpb24/Lm9wZXJhdG9yLnRleHQgPT0gJz0nXG4gICAgICAgICAgICBvcGVuID0gJygnXG4gICAgICAgICAgICBjbG9zZSA9ICcpJ1xuXG4gICAgICAgIGZpcnN0ID0gZmlyc3RMaW5lQ29sIG9wLmxoc1xuICAgICAgICBwcmZ4ID0gaWYgZmlyc3QuY29sID09IDAgYW5kIG9wLnJocz8uZnVuYyB0aGVuICdcXG4nIGVsc2UgJydcbiAgICAgICAgICAgIFxuICAgICAgICBwcmZ4ICsgQGF0b20ob3AubGhzKSArIHNlcCArIG8gKyBzZXAgKyBvcGVuICsga3N0ci5sc3RyaXAgQGF0b20ob3AucmhzKSArIGNsb3NlXG5cbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGluY29uZDogKHApIC0+XG5cbiAgICAgICAgXCIje0Bub2RlIHAucmhzfS5pbmRleE9mKCN7QGF0b20gcC5saHN9KSA+PSAwXCJcblxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIHBhcmVuczogKHApIC0+IFxuICAgICAgICAjIGxvZyAncGFyZW5zJyBwXG4gICAgICAgIFwiKCN7QG5vZGVzIHAuZXhwc30pXCJcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwXG5cbiAgICBvYmplY3Q6IChwKSAtPiBcbiAgICAgICAgbm9kZXMgPSBwLmtleXZhbHMubWFwIChzKSA9PiBAYXRvbSBzXG4gICAgICAgIG5vZGVzID0gbm9kZXMubWFwIChuKSAtPiBpZiAnOicgaW4gbiB0aGVuIG4gZWxzZSBcIiN7bn06I3tufVwiICAgICAgICBcbiAgICAgICAgXCJ7I3tub2Rlcy5qb2luICcsJ319XCJcblxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBrZXl2YWw6IChwKSAtPlxuICAgICAgICBrZXkgPSBAbm9kZSBwLmtleVxuICAgICAgICBpZiBrZXlbMF0gbm90IGluIFwiJ1xcXCJcIiBhbmQgL1tcXC5cXCxcXDtcXCpcXCtcXC1cXC9cXD1cXHxdLy50ZXN0IGtleSB0aGVuIGtleSA9IFwiJyN7a2V5fSdcIlxuICAgICAgICBcIiN7a2V5fToje0BhdG9tKHAudmFsKX1cIlxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcblxuICAgIHByb3A6ICAgKHApIC0+XG5cbiAgICAgICAgXCIje0Bub2RlKHAub2JqKX0uI3tAbm9kZSBwLnByb3B9XCJcblxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBpbmRleDogIChwKSAtPlxuXG4gICAgICAgIGlmIHNsaWNlID0gcC5zbGlkeC5zbGljZVxuXG4gICAgICAgICAgICBmcm9tID0gaWYgc2xpY2UuZnJvbT8gdGhlbiBAbm9kZSBzbGljZS5mcm9tIGVsc2UgJzAnXG5cbiAgICAgICAgICAgIGFkZE9uZSA9IHNsaWNlLmRvdHMudGV4dCA9PSAnLi4nXG5cbiAgICAgICAgICAgIGlmIHNsaWNlLnVwdG8/IHRoZW4gdXB0byA9IEBub2RlIHNsaWNlLnVwdG9cblxuICAgICAgICAgICAgaWYgc2xpY2UudXB0bz8udHlwZSA9PSAnbnVtJyBvciBzbGljZS51cHRvPy5vcGVyYXRpb25cbiAgICAgICAgICAgICAgICB1ID0gcGFyc2VJbnQgdXB0b1xuICAgICAgICAgICAgICAgIGlmIE51bWJlci5pc0Zpbml0ZSB1XG4gICAgICAgICAgICAgICAgICAgIGlmIHUgPT0gLTEgYW5kIGFkZE9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgdXBwZXIgPSAnJ1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB1ICs9IDEgaWYgYWRkT25lXG4gICAgICAgICAgICAgICAgICAgICAgICB1cHBlciA9IFwiLCAje3V9XCJcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHVwcGVyID0gXCIsICN7dXB0b31cIlxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIGFkZE9uZSB0aGVuIGlmIHVwdG8gdGhlbiB1cHBlciA9IFwiLCB0eXBlb2YgI3t1cHRvfSA9PT0gJ251bWJlcicgJiYgI3t1cHRvfSsxIHx8IEluZmluaXR5XCJcbiAgICAgICAgICAgICAgICBlbHNlICAgICAgICAgICAgICAgICAgICAgICAgdXBwZXIgPSBcIiwgdHlwZW9mICN7dXB0b30gPT09ICdudW1iZXInICYmICN7dXB0b30gfHwgLTFcIlxuXG4gICAgICAgICAgICBcIiN7QGF0b20ocC5pZHhlZSl9LnNsaWNlKCN7ZnJvbX0je3VwcGVyID8gJyd9KVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHAuc2xpZHgudGV4dD9bMF0gPT0gJy0nXG4gICAgICAgICAgICAgICAgbmkgPSBwYXJzZUludCBwLnNsaWR4LnRleHRcbiAgICAgICAgICAgICAgICBpZiBuaSA9PSAtMVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCIje0Bub2RlKHAuaWR4ZWUpfS5zbGljZSgje25pfSlbMF1cIlxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiI3tAbm9kZShwLmlkeGVlKX0uc2xpY2UoI3tuaX0sI3tuaSsxfSlbMF1cIlxuXG4gICAgICAgICAgICBcIiN7QG5vZGUocC5pZHhlZSl9WyN7QG5vZGUgcC5zbGlkeH1dXCJcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbiAgICBhcnJheTogKHApIC0+XG5cbiAgICAgICAgaWYgcC5pdGVtc1swXT8uc2xpY2VcbiAgICAgICAgICAgIEBzbGljZSBwLml0ZW1zWzBdLnNsaWNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFwiWyN7QG5vZGVzIHAuaXRlbXMsICcsJ31dXCJcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwXG5cbiAgICBzbGljZTogKHApIC0+XG5cbiAgICAgICAgaWYgcC5mcm9tLnR5cGUgPT0gJ251bScgPT0gcC51cHRvLnR5cGVcbiAgICAgICAgICAgIGZyb20gPSBwYXJzZUludCBwLmZyb20udGV4dFxuICAgICAgICAgICAgdXB0byA9IHBhcnNlSW50IHAudXB0by50ZXh0XG4gICAgICAgICAgICBpZiB1cHRvLWZyb20gPD0gMTBcbiAgICAgICAgICAgICAgICBpZiBwLmRvdHMudGV4dCA9PSAnLi4uJyB0aGVuIHVwdG8tLVxuICAgICAgICAgICAgICAgICdbJysoKHggZm9yIHggaW4gW2Zyb20uLnVwdG9dKS5qb2luICcsJykrJ10nXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbyA9IGlmIHAuZG90cy50ZXh0ID09ICcuLi4nIHRoZW4gJzwnIGVsc2UgJzw9J1xuICAgICAgICAgICAgICAgIFwiKGZ1bmN0aW9uKCkgeyB2YXIgciA9IFtdOyBmb3IgKHZhciBpID0gI3tmcm9tfTsgaSAje299ICN7dXB0b307IGkrKyl7IHIucHVzaChpKTsgfSByZXR1cm4gcjsgfSkuYXBwbHkodGhpcylcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvID0gaWYgcC5kb3RzLnRleHQgPT0gJy4uLicgdGhlbiAnPCcgZWxzZSAnPD0nXG4gICAgICAgICAgICBcIihmdW5jdGlvbigpIHsgdmFyIHIgPSBbXTsgZm9yICh2YXIgaSA9ICN7QG5vZGUgcC5mcm9tfTsgaSAje299ICN7QG5vZGUgcC51cHRvfTsgaSsrKXsgci5wdXNoKGkpOyB9IHJldHVybiByOyB9KS5hcHBseSh0aGlzKVwiXG5cbiAgICAjIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBmcmVzaFZhcjogKG5hbWUsIHN1ZmZpeD0wKSAtPlxuXG4gICAgICAgIGZvciB2YXJzIGluIEB2YXJzdGFja1xuICAgICAgICAgICAgZm9yIHYgaW4gdmFyc1xuICAgICAgICAgICAgICAgIGlmIHYudGV4dCA9PSBuYW1lICsgKHN1ZmZpeCBvciAnJylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEBmcmVzaFZhciBuYW1lLCBzdWZmaXgrMVxuXG4gICAgICAgIEB2YXJzdGFja1stMV0ucHVzaCB0ZXh0Om5hbWUgKyAoc3VmZml4IG9yICcnKVxuICAgICAgICBuYW1lICsgKHN1ZmZpeCBvciAnJylcblxuICAgIHZlcmI6IC0+IGlmIEB2ZXJib3NlIHRoZW4gY29uc29sZS5sb2cuYXBwbHkgY29uc29sZS5sb2csIGFyZ3VtZW50c1xuICAgIFxuICAgIGluZDogLT5cblxuICAgICAgICBvaSA9IEBpbmRlbnRcbiAgICAgICAgQGluZGVudCArPSAnICAgICdcbiAgICAgICAgb2lcblxuICAgIGRlZDogLT4gQGluZGVudCA9IEBpbmRlbnRbLi4uLTRdXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgXG4gICAgc3RyaXBvbDogKGNodW5rcykgLT5cbiAgICAgICAgXG4gICAgICAgcyA9ICdgJ1xuICAgICAgIGZvciBjaHVuayBpbiBjaHVua3NcbiAgICAgICAgICAgdCA9IGNodW5rLnRleHRcbiAgICAgICAgICAgc3dpdGNoIGNodW5rLnR5cGVcbiAgICAgICAgICAgICAgIHdoZW4gJ29wZW4nICB0aGVuIHMrPSB0KyckeydcbiAgICAgICAgICAgICAgIHdoZW4gJ2Nsb3NlJyB0aGVuIHMrPSAnfScrdFxuICAgICAgICAgICAgICAgd2hlbiAnbWlkbCcgIHRoZW4gcys9ICd9Jyt0KyckeydcbiAgICAgICAgICAgICAgIHdoZW4gJ2NvZGUnICB0aGVuIHMrPSBAY29tcGlsZSB0XG4gICAgICAgcyArPSAnYCdcbiAgICAgICBzXG5cbm1vZHVsZS5leHBvcnRzID0gUmVuZGVyZXJcbiJdfQ==
//# sourceURL=../coffee/renderer.coffee