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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaXBvbC5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbInN0cmlwb2wuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFFLFFBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1osS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUlGO0lBRUMsaUJBQUMsSUFBRDtRQUFDLElBQUMsQ0FBQSxPQUFEO1FBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFDLENBQUEsS0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUMsQ0FBQSxHQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7SUFKdkI7O3NCQVlILE9BQUEsR0FBUyxTQUFDLEVBQUQ7UUFFTCxJQUFDLENBQUEsS0FBRCxDQUFPLEVBQVA7ZUFDQTtJQUhLOztzQkFXVCxLQUFBLEdBQU8sU0FBQyxJQUFEO0FBRUgsWUFBQTtBQUFBO0FBQUE7YUFBQSw4Q0FBQTs7eUJBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxJQUFJLENBQUMsSUFBVixFQUFnQixDQUFoQixFQUFtQixDQUFuQjtBQUFBOztJQUZHOztzQkFVUCxHQUFBLEdBQUssU0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVA7QUFFRCxZQUFBO1FBQUEsSUFBRyxDQUFJLENBQVA7QUFBYyxtQkFBZDs7UUFFQSxJQUFHLENBQUMsQ0FBQyxJQUFMO1lBQ0ksV0FBRyxDQUFDLENBQUMsS0FBRixLQUFXLFFBQVgsSUFBQSxHQUFBLEtBQW9CLFFBQXZCO2dCQUNJLENBQUUsQ0FBQSxDQUFBLENBQUYsR0FBTyxJQUFDLENBQUEsTUFBRCxDQUFRLENBQVIsRUFEWDthQURKO1NBQUEsTUFLSyxJQUFHLENBQUEsWUFBYSxLQUFoQjtZQUE0QixJQUE2QixDQUFDLENBQUMsTUFB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MUIsRUFBK0IsU0FBL0IsRUFBakI7O0lBQUg7Ozs7OztBQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgXG4wMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIyNcblxueyBlbXB0eSB9ID0gcmVxdWlyZSAnLi91dGlscydcbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcblxuIyB3YWxrcyB0aHJvdWdoIGFuIGFic3RyYWN0IHN5bnRheCB0cmVlIGFuZCBwYXJzZXMgc3RyaW5nIGludGVycG9sYXRpb25zXG5cbmNsYXNzIFN0cmlwb2xcblxuICAgIEA6IChAa29kZSkgLT5cblxuICAgICAgICBAdmVyYm9zZSA9IEBrb2RlLmFyZ3MudmVyYm9zZVxuICAgICAgICBAZGVidWcgICA9IEBrb2RlLmFyZ3MuZGVidWdcbiAgICAgICAgQHJhdyAgICAgPSBAa29kZS5hcmdzLnJhd1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBjb2xsZWN0OiAodGwpIC0+XG4gICAgICAgIFxuICAgICAgICBAc2NvcGUgdGxcbiAgICAgICAgdGxcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNjb3BlOiAoYm9keSkgLT5cblxuICAgICAgICBAZXhwIGJvZHkuZXhwcywgaywgZSBmb3IgZSxrIGluIGJvZHkuZXhwcyA/IFtdXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgZXhwOiAocCwgaywgZSkgLT5cblxuICAgICAgICBpZiBub3QgZSB0aGVuIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGUudHlwZSBcbiAgICAgICAgICAgIGlmIGUudHlwZSBpbiBbJ2RvdWJsZScgJ3RyaXBsZSddXG4gICAgICAgICAgICAgICAgcFtrXSA9IEBzdHJpbmcgZVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgZWxzZSBpZiBlIGluc3RhbmNlb2YgQXJyYXkgIHRoZW4gQGV4cCBlLCBrLCB2IGZvciB2LGsgaW4gZSBpZiBlLmxlbmd0aFxuICAgICAgICBlbHNlIGlmIGUgaW5zdGFuY2VvZiBPYmplY3RcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIGtleSx2YWwgb2YgZVxuICAgICAgICAgICAgICAgIGlmIHZhbFxuICAgICAgICAgICAgICAgICAgICBpZiB2YWwudHlwZSB0aGVuIEBleHAgZSwga2V5LCB2YWxcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZXhwIHZhbCwgaywgdiBmb3IgdixrIGluIHZhbCBpZiB2YWwubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGV4cCB2YWwsIGssIHYgZm9yIGssdiBvZiB2YWxcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBzdHJpbmc6IChlKSAtPlxuICAgICAgICBzID0gaWYgZS50eXBlID09ICd0cmlwbGUnIHRoZW4gZS50ZXh0WzMuLi4tM10gZWxzZSBlLnRleHRbMS4uLi0xXVxuICAgICAgICBjaHVua3MgPSBAZGlzc2VjdCBzLCBlLmxpbmUsIGUuY29sXG4gICAgICAgIGlmIGNodW5rcy5sZW5ndGggPiAxXG4gICAgICAgICAgICBpZiBjaHVua3NbLTFdLnR5cGUgIT0gJ2Nsb3NlJ1xuICAgICAgICAgICAgICAgIGNodW5rcy5wdXNoIHR5cGU6J2Nsb3NlJyB0ZXh0OicnIGxpbmU6ZS5saW5lLCBjb2w6ZS5jb2wrcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBzdHJpcG9sOmNodW5rc1xuICAgICAgICBlXG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGRpc3NlY3Q6IChzLCBsaW5lLCBjb2wpIC0+XG5cbiAgICAgICAgYyA9IDA7IGNodW5rcyA9IFtdXG4gICAgICAgICAgICBcbiAgICAgICAgcHVzaCA9ICh0eXBlLHRleHQpIC0+IGNodW5rcy5wdXNoIHR5cGU6dHlwZSwgdGV4dDp0ZXh0LCBsaW5lOmxpbmUsIGNvbDpjb2wrY1xuICAgICAgICBcbiAgICAgICAgd2hpbGUgYyA8IHMubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHQgPSBzW2MuLl1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbm90IG0gPSAvKD88IVxcXFwpI3svLmV4ZWMgdFxuICAgICAgICAgICAgICAgIHB1c2ggJ2Nsb3NlJyB0XG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgcHVzaCBlbXB0eShjaHVua3MpIGFuZCAnb3Blbicgb3IgJ21pZGwnLCB0Wy4uLm0uaW5kZXhdIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjICs9IG0uaW5kZXgrMlxuICAgICAgICAgICAgaWMgPSBjXG5cbiAgICAgICAgICAgIHdoaWxlIGMgPCBzLmxlbmd0aFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHQgPSBzW2MuLl1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZ3MgPSBcbiAgICAgICAgICAgICAgICAgICAgdHJpcGxlOiAgL1wiXCJcIig/Oi58XFxuKSo/XCJcIlwiLyAgICAgXG4gICAgICAgICAgICAgICAgICAgIGRvdWJsZTogIC9cIig/OlxcXFxbXCJcXFxcXXxbXlxcblwiXSkqXCIvXG4gICAgICAgICAgICAgICAgICAgIHNpbmdsZTogIC8nKD86XFxcXFsnXFxcXF18W15cXG4nXSkqJy9cbiAgICAgICAgICAgICAgICAgICAgY29tbWVudDogLyMvICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgb3BlbjogICAgL3svICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICAgL30vICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBtYXRjaGVzID0gKFtrLCByLmV4ZWMgdF0gZm9yIGssciBvZiByZ3MpXG4gICAgICAgICAgICAgICAgbWF0Y2hlcyA9IG1hdGNoZXMuZmlsdGVyIChtKSAtPiBtWzFdP1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgaWYgZW1wdHkgbWF0Y2hlc1xuICAgICAgICAgICAgICAgICAgICAjIGxvZyAnSU5ORVIgTUlETCdcbiAgICAgICAgICAgICAgICAgICAgIyBwdXNoICdtaWRsJyBzW2MuLl1cbiAgICAgICAgICAgICAgICAgICAgIyBjID0gcy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgIyBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG1hdGNoZXMuc29ydCAoYSxiKSAtPiBhWzFdLmluZGV4IC0gYlsxXS5pbmRleFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxlbmd0aCA9IG1hdGNoZXNbMF1bMV1bMF0ubGVuZ3RoXG4gICAgICAgICAgICAgICAgaW5kZXggID0gbWF0Y2hlc1swXVsxXS5pbmRleFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGIgPSBzd2l0Y2ggbWF0Y2hlc1swXVswXVxuICAgICAgICAgICAgICAgICAgICB3aGVuICdjbG9zZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1c2ggJ2NvZGUnIHNbaWMuLi5jK2luZGV4XVxuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSBpbmRleCtsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAndHJpcGxlJyAnZG91YmxlJyAnc2luZ2xlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSBpbmRleCtsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZyAndW5oYW5kbGVkPycgbWF0Y2hlc1swXVxuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSBpbmRleCtsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICBicmVhayBpZiBiXG4gICAgICAgICAgICBcbiAgICAgICAgY2h1bmtzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIHZlcmI6IC0+IGlmIEB2ZXJib3NlIHRoZW4gY29uc29sZS5sb2cuYXBwbHkgY29uc29sZS5sb2csIGFyZ3VtZW50cyBcblxubW9kdWxlLmV4cG9ydHMgPSBTdHJpcG9sXG4iXX0=
//# sourceURL=../coffee/stripol.coffee