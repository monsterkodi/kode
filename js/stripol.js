// koffee 1.20.0

/*
 0000000  000000000  00000000   000  00000000    0000000   000        
000          000     000   000  000  000   000  000   000  000        
0000000      000     0000000    000  00000000   000   000  000        
     000     000     000   000  000  000        000   000  000        
0000000      000     000   000  000  000         0000000   0000000
 */
var Stripol, empty, print;

empty = require('./utils').empty;

print = require('./print');

Stripol = (function() {
    function Stripol(kode) {
        this.kode = kode;
        this.verbose = this.kode.args.verbose;
        this.debug = this.kode.args.debug;
        this.raw = this.kode.args.raw;
    }

    Stripol.prototype.collect = function(tl) {
        this.scope(tl);
        return tl;
    };

    Stripol.prototype.scope = function(body) {
        var e, i, k, len, ref, ref1, results;
        ref1 = (ref = body.exps) != null ? ref : [];
        results = [];
        for (k = i = 0, len = ref1.length; i < len; k = ++i) {
            e = ref1[k];
            results.push(this.exp(body.exps, k, e));
        }
        return results;
    };

    Stripol.prototype.exp = function(p, k, e) {
        var i, key, len, ref, results, results1, v, val;
        if (!e) {
            return;
        }
        if (e.type) {
            if ((ref = e.type) === 'double' || ref === 'triple') {
                p[k] = this.string(e);
            }
        } else if (e instanceof Array) {
            if (e.length) {
                results = [];
                for (k = i = 0, len = e.length; i < len; k = ++i) {
                    v = e[k];
                    results.push(this.exp(e, k, v));
                }
                return results;
            }
        } else if (e instanceof Object) {
            results1 = [];
            for (key in e) {
                val = e[key];
                if (val) {
                    if (val.type) {
                        results1.push(this.exp(e, key, val));
                    } else {
                        if (val instanceof Array) {
                            if (val.length) {
                                results1.push((function() {
                                    var j, len1, results2;
                                    results2 = [];
                                    for (k = j = 0, len1 = val.length; j < len1; k = ++j) {
                                        v = val[k];
                                        results2.push(this.exp(val, k, v));
                                    }
                                    return results2;
                                }).call(this));
                            } else {
                                results1.push(void 0);
                            }
                        } else {
                            results1.push((function() {
                                var results2;
                                results2 = [];
                                for (k in val) {
                                    v = val[k];
                                    results2.push(this.exp(val, k, v));
                                }
                                return results2;
                            }).call(this));
                        }
                    }
                } else {
                    results1.push(void 0);
                }
            }
            return results1;
        }
    };

    Stripol.prototype.string = function(e) {
        var chunks, s;
        s = e.type === 'triple' ? e.text.slice(3, -3) : e.text.slice(1, -1);
        chunks = this.dissect(s, e.line, e.col);
        if (chunks.length > 1) {
            if (chunks.slice(-1)[0].type !== 'close') {
                chunks.push({
                    type: 'close',
                    text: '',
                    line: e.line,
                    col: e.col + s.length
                });
            }
            return {
                stripol: chunks
            };
        }
        return e;
    };

    Stripol.prototype.dissect = function(s, line, col) {
        var b, c, chunks, ic, index, k, length, m, matches, push, r, rgs, t;
        c = 0;
        chunks = [];
        push = function(type, text) {
            return chunks.push({
                type: type,
                text: text,
                line: line,
                col: col + c
            });
        };
        while (c < s.length) {
            t = s.slice(c);
            if (!(m = /(?<!\\)#{/.exec(t))) {
                push('close', t);
                break;
            }
            push(empty(chunks) && 'open' || 'midl', t.slice(0, m.index));
            c += m.index + 2;
            ic = c;
            while (c < s.length) {
                t = s.slice(c);
                rgs = {
                    triple: /"""(?:.|\n)*?"""/,
                    double: /"(?:\\["\\]|[^\n"])*"/,
                    single: /'(?:\\['\\]|[^\n'])*'/,
                    comment: /#/,
                    open: /{/,
                    close: /}/
                };
                matches = (function() {
                    var results;
                    results = [];
                    for (k in rgs) {
                        r = rgs[k];
                        results.push([k, r.exec(t)]);
                    }
                    return results;
                })();
                matches = matches.filter(function(m) {
                    return m[1] != null;
                });
                matches.sort(function(a, b) {
                    return a[1].index - b[1].index;
                });
                length = matches[0][1][0].length;
                index = matches[0][1].index;
                b = (function() {
                    switch (matches[0][0]) {
                        case 'close':
                            push('code', s.slice(ic, c + index));
                            c += index + length;
                            return true;
                        case 'triple':
                        case 'double':
                        case 'single':
                            c += index + length;
                            return false;
                        default:
                            console.log('unhandled?', matches[0]);
                            c += index + length;
                            return true;
                    }
                })();
                if (b) {
                    break;
                }
            }
        }
        return chunks;
    };

    Stripol.prototype.verb = function() {
        if (this.verbose) {
            return console.log.apply(console.log, arguments);
        }
    };

    return Stripol;

})();

module.exports = Stripol;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaXBvbC5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbInN0cmlwb2wuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFFLFFBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1osS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUlGO0lBRUMsaUJBQUMsSUFBRDtRQUFDLElBQUMsQ0FBQSxPQUFEO1FBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFDLENBQUEsS0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUMsQ0FBQSxHQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7SUFKdkI7O3NCQVlILE9BQUEsR0FBUyxTQUFDLEVBQUQ7UUFFTCxJQUFDLENBQUEsS0FBRCxDQUFPLEVBQVA7ZUFDQTtJQUhLOztzQkFXVCxLQUFBLEdBQU8sU0FBQyxJQUFEO0FBRUgsWUFBQTtBQUFBO0FBQUE7YUFBQSw4Q0FBQTs7eUJBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxJQUFJLENBQUMsSUFBVixFQUFlLENBQWYsRUFBaUIsQ0FBakI7QUFBQTs7SUFGRzs7c0JBVVAsR0FBQSxHQUFLLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQO0FBRUQsWUFBQTtRQUFBLElBQUcsQ0FBSSxDQUFQO0FBQWMsbUJBQWQ7O1FBRUEsSUFBRyxDQUFDLENBQUMsSUFBTDtZQUNJLFdBQUcsQ0FBQyxDQUFDLEtBQUYsS0FBVyxRQUFYLElBQUEsR0FBQSxLQUFvQixRQUF2QjtnQkFDSSxDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQU8sSUFBQyxDQUFBLE1BQUQsQ0FBUSxDQUFSLEVBRFg7YUFESjtTQUFBLE1BS0ssSUFBRyxDQUFBLFlBQWEsS0FBaEI7WUFBNEIsSUFBNkIsQ0FBQyxDQUFDLE1BQS9C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LEVBQStCLFNBQS9CLEVBQWpCOztJQUFIOzs7Ozs7QUFFVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyMjXG5cbnsgZW1wdHkgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5cbiMgd2Fsa3MgdGhyb3VnaCBhbiBhYnN0cmFjdCBzeW50YXggdHJlZSBhbmQgcGFyc2VzIHN0cmluZyBpbnRlcnBvbGF0aW9uc1xuXG5jbGFzcyBTdHJpcG9sXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQHZlcmJvc2UgPSBAa29kZS5hcmdzLnZlcmJvc2VcbiAgICAgICAgQGRlYnVnICAgPSBAa29kZS5hcmdzLmRlYnVnXG4gICAgICAgIEByYXcgICAgID0gQGtvZGUuYXJncy5yYXdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgY29sbGVjdDogKHRsKSAtPlxuICAgICAgICBcbiAgICAgICAgQHNjb3BlIHRsXG4gICAgICAgIHRsXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzY29wZTogKGJvZHkpIC0+XG5cbiAgICAgICAgQGV4cCBib2R5LmV4cHMsayxlIGZvciBlLGsgaW4gYm9keS5leHBzID8gW11cbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICBleHA6IChwLCBrLCBlKSAtPlxuXG4gICAgICAgIGlmIG5vdCBlIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgZS50eXBlIFxuICAgICAgICAgICAgaWYgZS50eXBlIGluIFsnZG91YmxlJyAndHJpcGxlJ11cbiAgICAgICAgICAgICAgICBwW2tdID0gQHN0cmluZyBlXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIGUgaW5zdGFuY2VvZiBBcnJheSAgdGhlbiBAZXhwIGUsIGssIHYgZm9yIHYsayBpbiBlIGlmIGUubGVuZ3RoXG4gICAgICAgIGVsc2UgaWYgZSBpbnN0YW5jZW9mIE9iamVjdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3Iga2V5LHZhbCBvZiBlXG4gICAgICAgICAgICAgICAgaWYgdmFsXG4gICAgICAgICAgICAgICAgICAgIGlmIHZhbC50eXBlIHRoZW4gQGV4cCBlLCBrZXksIHZhbFxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB2YWwgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBleHAgdmFsLCBrLCB2IGZvciB2LGsgaW4gdmFsIGlmIHZhbC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZXhwIHZhbCwgaywgdiBmb3Igayx2IG9mIHZhbFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIHN0cmluZzogKGUpIC0+XG4gICAgICAgIHMgPSBpZiBlLnR5cGUgPT0gJ3RyaXBsZScgdGhlbiBlLnRleHRbMy4uLi0zXSBlbHNlIGUudGV4dFsxLi4uLTFdXG4gICAgICAgIGNodW5rcyA9IEBkaXNzZWN0IHMsIGUubGluZSwgZS5jb2xcbiAgICAgICAgaWYgY2h1bmtzLmxlbmd0aCA+IDFcbiAgICAgICAgICAgIGlmIGNodW5rc1stMV0udHlwZSAhPSAnY2xvc2UnXG4gICAgICAgICAgICAgICAgY2h1bmtzLnB1c2ggdHlwZTonY2xvc2UnIHRleHQ6JycgbGluZTplLmxpbmUsIGNvbDplLmNvbCtzLmxlbmd0aFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHN0cmlwb2w6Y2h1bmtzXG4gICAgICAgIGVcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgZGlzc2VjdDogKHMsIGxpbmUsIGNvbCkgLT5cblxuICAgICAgICBjID0gMDsgY2h1bmtzID0gW11cbiAgICAgICAgICAgIFxuICAgICAgICBwdXNoID0gKHR5cGUsdGV4dCkgLT4gY2h1bmtzLnB1c2ggdHlwZTp0eXBlLCB0ZXh0OnRleHQsIGxpbmU6bGluZSwgY29sOmNvbCtjXG4gICAgICAgIFxuICAgICAgICB3aGlsZSBjIDwgcy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdCA9IHNbYy4uXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBub3QgbSA9IC8oPzwhXFxcXCkjey8uZXhlYyB0XG4gICAgICAgICAgICAgICAgcHVzaCAnY2xvc2UnIHRcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBwdXNoIGVtcHR5KGNodW5rcykgYW5kICdvcGVuJyBvciAnbWlkbCcsIHRbLi4ubS5pbmRleF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYyArPSBtLmluZGV4KzJcbiAgICAgICAgICAgIGljID0gY1xuXG4gICAgICAgICAgICB3aGlsZSBjIDwgcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0ID0gc1tjLi5dXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmdzID0gXG4gICAgICAgICAgICAgICAgICAgIHRyaXBsZTogIC9cIlwiXCIoPzoufFxcbikqP1wiXCJcIi8gICAgIFxuICAgICAgICAgICAgICAgICAgICBkb3VibGU6ICAvXCIoPzpcXFxcW1wiXFxcXF18W15cXG5cIl0pKlwiL1xuICAgICAgICAgICAgICAgICAgICBzaW5nbGU6ICAvJyg/OlxcXFxbJ1xcXFxdfFteXFxuJ10pKicvXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQ6IC8jLyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIG9wZW46ICAgIC97LyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGNsb3NlOiAgIC99LyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbWF0Y2hlcyA9IChbaywgci5leGVjIHRdIGZvciBrLHIgb2YgcmdzKVxuICAgICAgICAgICAgICAgIG1hdGNoZXMgPSBtYXRjaGVzLmZpbHRlciAobSkgLT4gbVsxXT9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBtYXRjaGVzLnNvcnQgKGEsYikgLT4gYVsxXS5pbmRleCAtIGJbMV0uaW5kZXhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsZW5ndGggPSBtYXRjaGVzWzBdWzFdWzBdLmxlbmd0aFxuICAgICAgICAgICAgICAgIGluZGV4ICA9IG1hdGNoZXNbMF1bMV0uaW5kZXhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBiID0gc3dpdGNoIG1hdGNoZXNbMF1bMF1cbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnY2xvc2UnXG4gICAgICAgICAgICAgICAgICAgICAgICBwdXNoICdjb2RlJyBzW2ljLi4uYytpbmRleF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gaW5kZXgrbGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3RyaXBsZScgJ2RvdWJsZScgJ3NpbmdsZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gaW5kZXgrbGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cgJ3VuaGFuZGxlZD8nIG1hdGNoZXNbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gaW5kZXgrbGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgYlxuICAgICAgICAgICAgXG4gICAgICAgIGNodW5rc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICB2ZXJiOiAtPiBpZiBAdmVyYm9zZSB0aGVuIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHMgXG5cbm1vZHVsZS5leHBvcnRzID0gU3RyaXBvbFxuIl19
//# sourceURL=../coffee/stripol.coffee