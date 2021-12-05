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
        push = (function(_this) {
            return function(type, text) {
                var exps;
                if (type === 'code') {
                    exps = _this.kode.ast(text).exps;
                    return chunks.push({
                        type: type,
                        exps: exps,
                        line: line,
                        col: col + c
                    });
                } else {
                    return chunks.push({
                        type: type,
                        text: text,
                        line: line,
                        col: col + c
                    });
                }
            };
        })(this);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaXBvbC5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbInN0cmlwb2wuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFFLFFBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1osS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUlGO0lBRUMsaUJBQUMsSUFBRDtRQUFDLElBQUMsQ0FBQSxPQUFEO1FBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFDLENBQUEsS0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUMsQ0FBQSxHQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7SUFKdkI7O3NCQVlILE9BQUEsR0FBUyxTQUFDLEVBQUQ7UUFFTCxJQUFDLENBQUEsS0FBRCxDQUFPLEVBQVA7ZUFDQTtJQUhLOztzQkFXVCxLQUFBLEdBQU8sU0FBQyxJQUFEO0FBRUgsWUFBQTtBQUFBO0FBQUE7YUFBQSw4Q0FBQTs7eUJBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxJQUFJLENBQUMsSUFBVixFQUFlLENBQWYsRUFBaUIsQ0FBakI7QUFBQTs7SUFGRzs7c0JBVVAsR0FBQSxHQUFLLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQO0FBRUQsWUFBQTtRQUFBLElBQUcsQ0FBSSxDQUFQO0FBQWMsbUJBQWQ7O1FBRUEsSUFBRyxDQUFDLENBQUMsSUFBTDtZQUNJLFdBQUcsQ0FBQyxDQUFDLEtBQUYsS0FBVyxRQUFYLElBQUEsR0FBQSxLQUFvQixRQUF2QjtnQkFDSSxDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQU8sSUFBQyxDQUFBLE1BQUQsQ0FBUSxDQUFSLEVBRFg7YUFESjtTQUFBLE1BS0ssSUFBRyxDQUFBLFlBQWEsS0FBaEI7WUFBNEIsSUFBNkIsQ0FBQyxDQUFDLE1BQS9C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LDZCQUt1QixRQUx2Qjs0QkFNSSxDQUFBLElBQUssS0FBQSxHQUFNO21DQUNYO0FBUEo7NEJBU0csT0FBQSxDQUFDLEdBQUQsQ0FBSyxZQUFMLEVBQWtCLE9BQVEsQ0FBQSxDQUFBLENBQTFCOzRCQUNDLENBQUEsSUFBSyxLQUFBLEdBQU07bUNBQ1g7QUFYSjs7Z0JBWUosSUFBUyxDQUFUO0FBQUEsMEJBQUE7O1lBaENKO1FBYko7ZUErQ0E7SUExREs7O3NCQTREVCxJQUFBLEdBQU0sU0FBQTtRQUFHLElBQUcsSUFBQyxDQUFBLE9BQUo7bUJBQWlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBWixDQUFrQixPQUFPLENBQUMsR0FBMUIsRUFBK0IsU0FBL0IsRUFBakI7O0lBQUg7Ozs7OztBQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgXG4wMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIyNcblxueyBlbXB0eSB9ID0gcmVxdWlyZSAnLi91dGlscydcbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcblxuIyB3YWxrcyB0aHJvdWdoIGFuIGFic3RyYWN0IHN5bnRheCB0cmVlIGFuZCBwYXJzZXMgc3RyaW5nIGludGVycG9sYXRpb25zXG5cbmNsYXNzIFN0cmlwb2xcblxuICAgIEA6IChAa29kZSkgLT5cblxuICAgICAgICBAdmVyYm9zZSA9IEBrb2RlLmFyZ3MudmVyYm9zZVxuICAgICAgICBAZGVidWcgICA9IEBrb2RlLmFyZ3MuZGVidWdcbiAgICAgICAgQHJhdyAgICAgPSBAa29kZS5hcmdzLnJhd1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBjb2xsZWN0OiAodGwpIC0+XG4gICAgICAgIFxuICAgICAgICBAc2NvcGUgdGxcbiAgICAgICAgdGxcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNjb3BlOiAoYm9keSkgLT5cblxuICAgICAgICBAZXhwIGJvZHkuZXhwcyxrLGUgZm9yIGUsayBpbiBib2R5LmV4cHMgPyBbXVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGV4cDogKHAsIGssIGUpIC0+XG5cbiAgICAgICAgaWYgbm90IGUgdGhlbiByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBpZiBlLnR5cGUgXG4gICAgICAgICAgICBpZiBlLnR5cGUgaW4gWydkb3VibGUnICd0cmlwbGUnXVxuICAgICAgICAgICAgICAgIHBba10gPSBAc3RyaW5nIGVcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIGVsc2UgaWYgZSBpbnN0YW5jZW9mIEFycmF5ICB0aGVuIEBleHAgZSwgaywgdiBmb3IgdixrIGluIGUgaWYgZS5sZW5ndGhcbiAgICAgICAgZWxzZSBpZiBlIGluc3RhbmNlb2YgT2JqZWN0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciBrZXksdmFsIG9mIGVcbiAgICAgICAgICAgICAgICBpZiB2YWxcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsLnR5cGUgdGhlbiBAZXhwIGUsIGtleSwgdmFsXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbCBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGV4cCB2YWwsIGssIHYgZm9yIHYsayBpbiB2YWwgaWYgdmFsLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBleHAgdmFsLCBrLCB2IGZvciBrLHYgb2YgdmFsXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgc3RyaW5nOiAoZSkgLT5cbiAgICAgICAgcyA9IGlmIGUudHlwZSA9PSAndHJpcGxlJyB0aGVuIGUudGV4dFszLi4uLTNdIGVsc2UgZS50ZXh0WzEuLi4tMV1cbiAgICAgICAgY2h1bmtzID0gQGRpc3NlY3QgcywgZS5saW5lLCBlLmNvbFxuICAgICAgICBpZiBjaHVua3MubGVuZ3RoID4gMVxuICAgICAgICAgICAgaWYgY2h1bmtzWy0xXS50eXBlICE9ICdjbG9zZSdcbiAgICAgICAgICAgICAgICBjaHVua3MucHVzaCB0eXBlOidjbG9zZScgdGV4dDonJyBsaW5lOmUubGluZSwgY29sOmUuY29sK3MubGVuZ3RoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gc3RyaXBvbDpjaHVua3NcbiAgICAgICAgZVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBkaXNzZWN0OiAocywgbGluZSwgY29sKSAtPlxuXG4gICAgICAgIGMgPSAwOyBjaHVua3MgPSBbXVxuICAgICAgICAgICAgXG4gICAgICAgIHB1c2ggPSAodHlwZSx0ZXh0KSA9PiBcbiAgICAgICAgICAgIGlmIHR5cGUgPT0gJ2NvZGUnXG4gICAgICAgICAgICAgICAgZXhwcyA9IEBrb2RlLmFzdCh0ZXh0KS5leHBzXG4gICAgICAgICAgICAgICAgY2h1bmtzLnB1c2ggdHlwZTp0eXBlLCBleHBzOmV4cHMsIGxpbmU6bGluZSwgY29sOmNvbCtjXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY2h1bmtzLnB1c2ggdHlwZTp0eXBlLCB0ZXh0OnRleHQsIGxpbmU6bGluZSwgY29sOmNvbCtjXG4gICAgICAgIFxuICAgICAgICB3aGlsZSBjIDwgcy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdCA9IHNbYy4uXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBub3QgbSA9IC8oPzwhXFxcXCkjey8uZXhlYyB0XG4gICAgICAgICAgICAgICAgcHVzaCAnY2xvc2UnIHRcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBwdXNoIGVtcHR5KGNodW5rcykgYW5kICdvcGVuJyBvciAnbWlkbCcsIHRbLi4ubS5pbmRleF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYyArPSBtLmluZGV4KzJcbiAgICAgICAgICAgIGljID0gY1xuXG4gICAgICAgICAgICB3aGlsZSBjIDwgcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0ID0gc1tjLi5dXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmdzID0gXG4gICAgICAgICAgICAgICAgICAgIHRyaXBsZTogIC9cIlwiXCIoPzoufFxcbikqP1wiXCJcIi8gICAgIFxuICAgICAgICAgICAgICAgICAgICBkb3VibGU6ICAvXCIoPzpcXFxcW1wiXFxcXF18W15cXG5cIl0pKlwiL1xuICAgICAgICAgICAgICAgICAgICBzaW5nbGU6ICAvJyg/OlxcXFxbJ1xcXFxdfFteXFxuJ10pKicvXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQ6IC8jLyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIG9wZW46ICAgIC97LyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGNsb3NlOiAgIC99LyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbWF0Y2hlcyA9IChbaywgci5leGVjIHRdIGZvciBrLHIgb2YgcmdzKVxuICAgICAgICAgICAgICAgIG1hdGNoZXMgPSBtYXRjaGVzLmZpbHRlciAobSkgLT4gbVsxXT9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBtYXRjaGVzLnNvcnQgKGEsYikgLT4gYVsxXS5pbmRleCAtIGJbMV0uaW5kZXhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsZW5ndGggPSBtYXRjaGVzWzBdWzFdWzBdLmxlbmd0aFxuICAgICAgICAgICAgICAgIGluZGV4ICA9IG1hdGNoZXNbMF1bMV0uaW5kZXhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBiID0gc3dpdGNoIG1hdGNoZXNbMF1bMF1cbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnY2xvc2UnXG4gICAgICAgICAgICAgICAgICAgICAgICBwdXNoICdjb2RlJyBzW2ljLi4uYytpbmRleF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gaW5kZXgrbGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3RyaXBsZScgJ2RvdWJsZScgJ3NpbmdsZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gaW5kZXgrbGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cgJ3VuaGFuZGxlZD8nIG1hdGNoZXNbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gaW5kZXgrbGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgYlxuICAgICAgICAgICAgXG4gICAgICAgIGNodW5rc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICB2ZXJiOiAtPiBpZiBAdmVyYm9zZSB0aGVuIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHMgXG5cbm1vZHVsZS5leHBvcnRzID0gU3RyaXBvbFxuIl19
//# sourceURL=../coffee/stripol.coffee