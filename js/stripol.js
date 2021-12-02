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


/*
    walks through an abstract syntax tree and parses string interpolations
 */

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
                if (empty(matches)) {
                    console.log('INNER MIDL');
                    push('midl', s.slice(c));
                    c = s.length;
                    break;
                }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaXBvbC5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbInN0cmlwb2wuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFFLFFBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1osS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOzs7QUFFUjs7OztBQUlNO0lBRUMsaUJBQUMsSUFBRDtRQUFDLElBQUMsQ0FBQSxPQUFEO1FBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFDLENBQUEsS0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUMsQ0FBQSxHQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7SUFKdkI7O3NCQVlILE9BQUEsR0FBUyxTQUFDLEVBQUQ7UUFFTCxJQUFDLENBQUEsS0FBRCxDQUFPLEVBQVA7ZUFDQTtJQUhLOztzQkFXVCxLQUFBLEdBQU8sU0FBQyxJQUFEO0FBRUgsWUFBQTtBQUFBO0FBQUE7YUFBQSw4Q0FBQTs7eUJBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxJQUFJLENBQUMsSUFBVixFQUFnQixDQUFoQixFQUFtQixDQUFuQjtBQUFBOztJQUZHOztzQkFVUCxHQUFBLEdBQUssU0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVA7QUFFRCxZQUFBO1FBQUEsSUFBRyxDQUFJLENBQVA7QUFBYyxtQkFBZDs7UUFFQSxJQUFHLENBQUMsQ0FBQyxJQUFMO1lBQ0ksV0FBRyxDQUFDLENBQUMsS0FBRixLQUFXLFFBQVgsSUFBQSxHQUFBLEtBQW9CLFFBQXZCO2dCQUNJLENBQUUsQ0FBQSxDQUFBLENBQUYsR0FBTyxJQUFDLENBQUEsTUFBRCxDQUFRLENBQVIsRUFEWDthQURKO1NBQUEsTUFLSyxJQUFHLENBQUEsWUFBYSxLQUFoQjtZQUE0QixJQUE2QixDQUFDLENBQUMsTUFBL0I7QUFBQTtxQkFBQSwyQ0FBQTs7aUNBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMLEVBQVEsQ0FBUixFQUFXLENBQVg7QUFBQTsrQkFBQTthQUE1QjtTQUFBLE1BQ0EsSUFBRyxDQUFBLFlBQWEsTUFBaEI7QUFFRDtpQkFBQSxRQUFBOztnQkFDSSxJQUFHLEdBQUg7b0JBQ0ksSUFBRyxHQUFHLENBQUMsSUFBUDtzQ0FBaUIsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMLEVBQVEsR0FBUixFQUFhLEdBQWIsR0FBakI7cUJBQUEsTUFBQTt3QkFFSSxJQUFHLEdBQUEsWUFBZSxLQUFsQjs0QkFDSSxJQUFpQyxHQUFHLENBQUMsTUFBckM7OztBQUFBO3lDQUFBLCtDQUFBOztzREFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLEdBQUwsRUFBVSxDQUFWLEVBQWEsQ0FBYjtBQUFBOzsrQ0FBQTs2QkFBQSxNQUFBO3NEQUFBOzZCQURKO3lCQUFBLE1BQUE7OztBQUdJO3FDQUFBLFFBQUE7O2tEQUFBLElBQUMsQ0FBQSxHQUFELENBQUssR0FBTCxFQUFVLENBQVYsRUFBYSxDQUFiO0FBQUE7OzJDQUhKO3lCQUZKO3FCQURKO2lCQUFBLE1BQUE7MENBQUE7O0FBREo7NEJBRkM7O0lBVko7O3NCQTJCTCxNQUFBLEdBQVEsU0FBQyxDQUFEO0FBQ0osWUFBQTtRQUFBLENBQUEsR0FBTyxDQUFDLENBQUMsSUFBRixLQUFVLFFBQWIsR0FBMkIsQ0FBQyxDQUFDLElBQUssYUFBbEMsR0FBK0MsQ0FBQyxDQUFDLElBQUs7UUFDMUQsTUFBQSxHQUFTLElBQUMsQ0FBQSxPQUFELENBQVMsQ0FBVCxFQUFZLENBQUMsQ0FBQyxJQUFkLEVBQW9CLENBQUMsQ0FBQyxHQUF0QjtRQUNULElBQUcsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBbkI7WUFHSSxJQUFHLE1BQU8sVUFBRSxDQUFBLENBQUEsQ0FBQyxDQUFDLElBQVgsS0FBbUIsT0FBdEI7Z0JBQ0ksTUFBTSxDQUFDLElBQVAsQ0FBWTtvQkFBQSxJQUFBLEVBQUssT0FBTDtvQkFBYSxJQUFBLEVBQUssRUFBbEI7b0JBQXFCLElBQUEsRUFBSyxDQUFDLENBQUMsSUFBNUI7b0JBQWtDLEdBQUEsRUFBSSxDQUFDLENBQUMsR0FBRixHQUFNLENBQUMsQ0FBQyxNQUE5QztpQkFBWixFQURKOztBQUdBLG1CQUFPO2dCQUFBLE9BQUEsRUFBUSxNQUFSO2NBTlg7O2VBT0E7SUFWSTs7c0JBa0JSLE9BQUEsR0FBUyxTQUFDLENBQUQsRUFBSSxJQUFKLEVBQVUsR0FBVjtBQUVMLFlBQUE7UUFBQSxDQUFBLEdBQUk7UUFBRyxNQUFBLEdBQVM7UUFFaEIsSUFBQSxHQUFPLFNBQUMsSUFBRCxFQUFNLElBQU47bUJBQ0gsTUFBTSxDQUFDLElBQVAsQ0FBWTtnQkFBQSxJQUFBLEVBQUssSUFBTDtnQkFBVyxJQUFBLEVBQUssSUFBaEI7Z0JBQXNCLElBQUEsRUFBSyxJQUEzQjtnQkFBaUMsR0FBQSxFQUFJLEdBQUEsR0FBSSxDQUF6QzthQUFaO1FBREc7QUFRUCxlQUFNLENBQUEsR0FBSSxDQUFDLENBQUMsTUFBWjtZQUVJLENBQUEsR0FBSSxDQUFFO1lBSU4sSUFBRyxDQUFJLENBQUEsQ0FBQSxHQUFJLFdBQVcsQ0FBQyxJQUFaLENBQWlCLENBQWpCLENBQUosQ0FBUDtnQkFDSSxJQUFBLENBQUssT0FBTCxFQUFhLENBQWI7QUFDQSxzQkFGSjs7WUFJQSxJQUFBLENBQUssS0FBQSxDQUFNLE1BQU4sQ0FBQSxJQUFrQixNQUFsQixJQUE0QixNQUFqQyxFQUF5QyxDQUFFLGtCQUEzQztZQUVBLENBQUEsSUFBSyxDQUFDLENBQUMsS0FBRixHQUFRO1lBQ2IsRUFBQSxHQUFLO0FBRUwsbUJBQU0sQ0FBQSxHQUFJLENBQUMsQ0FBQyxNQUFaO2dCQUVJLENBQUEsR0FBSSxDQUFFO2dCQUlOLEdBQUEsR0FDSTtvQkFBQSxNQUFBLEVBQVMsa0JBQVQ7b0JBQ0EsTUFBQSxFQUFTLHVCQURUO29CQUVBLE1BQUEsRUFBUyx1QkFGVDtvQkFHQSxPQUFBLEVBQVMsR0FIVDtvQkFJQSxJQUFBLEVBQVMsR0FKVDtvQkFLQSxLQUFBLEVBQVMsR0FMVDs7Z0JBT0osT0FBQTs7QUFBVzt5QkFBQSxRQUFBOztxQ0FBQSxDQUFDLENBQUQsRUFBSSxDQUFDLENBQUMsSUFBRixDQUFPLENBQVAsQ0FBSjtBQUFBOzs7Z0JBQ1gsT0FBQSxHQUFVLE9BQU8sQ0FBQyxNQUFSLENBQWUsU0FBQyxDQUFEOzJCQUFPO2dCQUFQLENBQWY7Z0JBRVYsSUFBRyxLQUFBLENBQU0sT0FBTixDQUFIO29CQUNHLE9BQUEsQ0FBQyxHQUFELENBQUssWUFBTDtvQkFDQyxJQUFBLENBQUssTUFBTCxFQUFZLENBQUUsU0FBZDtvQkFDQSxDQUFBLEdBQUksQ0FBQyxDQUFDO0FBQ04sMEJBSko7O2dCQU1BLE9BQU8sQ0FBQyxJQUFSLENBQWEsU0FBQyxDQUFELEVBQUcsQ0FBSDsyQkFBUyxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBTCxHQUFhLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQztnQkFBM0IsQ0FBYjtnQkFFQSxNQUFBLEdBQVMsT0FBUSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBRSxDQUFDO2dCQUMxQixLQUFBLEdBQVMsT0FBUSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBRSxDQUFDO2dCQUV2QixDQUFBO0FBQUksNEJBQU8sT0FBUSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBbEI7QUFBQSw2QkFDSyxPQURMOzRCQUVJLElBQUEsQ0FBSyxNQUFMLEVBQVksQ0FBRSxxQkFBZDs0QkFDQSxDQUFBLElBQUssS0FBQSxHQUFNO21DQUNYO0FBSkosNkJBS0ssUUFMTDtBQUFBLDZCQUtjLFFBTGQ7QUFBQSw2QkFLdUIsUUFMdkI7NEJBT0ksQ0FBQSxJQUFLLEtBQUEsR0FBTTttQ0FDWDtBQVJKOzRCQVVHLE9BQUEsQ0FBQyxHQUFELENBQUssWUFBTCxFQUFrQixPQUFRLENBQUEsQ0FBQSxDQUExQjs0QkFDQyxDQUFBLElBQUssS0FBQSxHQUFNO21DQUNYO0FBWko7O2dCQWFKLElBQVMsQ0FBVDtBQUFBLDBCQUFBOztZQXpDSjtRQWZKO2VBMERBO0lBdEVLOztzQkF3RVQsSUFBQSxHQUFNLFNBQUE7UUFBRyxJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUFpQixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBTyxDQUFDLEdBQTFCLEVBQStCLFNBQS9CLEVBQWpCOztJQUFIOzs7Ozs7QUFFVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyMjXG5cbnsgZW1wdHkgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5cbiMjI1xuICAgIHdhbGtzIHRocm91Z2ggYW4gYWJzdHJhY3Qgc3ludGF4IHRyZWUgYW5kIHBhcnNlcyBzdHJpbmcgaW50ZXJwb2xhdGlvbnNcbiMjI1xuXG5jbGFzcyBTdHJpcG9sXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQHZlcmJvc2UgPSBAa29kZS5hcmdzLnZlcmJvc2VcbiAgICAgICAgQGRlYnVnICAgPSBAa29kZS5hcmdzLmRlYnVnXG4gICAgICAgIEByYXcgICAgID0gQGtvZGUuYXJncy5yYXdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgY29sbGVjdDogKHRsKSAtPlxuICAgICAgICBcbiAgICAgICAgQHNjb3BlIHRsXG4gICAgICAgIHRsXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzY29wZTogKGJvZHkpIC0+XG5cbiAgICAgICAgQGV4cCBib2R5LmV4cHMsIGssIGUgZm9yIGUsayBpbiBib2R5LmV4cHMgPyBbXVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGV4cDogKHAsIGssIGUpIC0+XG5cbiAgICAgICAgaWYgbm90IGUgdGhlbiByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBpZiBlLnR5cGUgXG4gICAgICAgICAgICBpZiBlLnR5cGUgaW4gWydkb3VibGUnICd0cmlwbGUnXVxuICAgICAgICAgICAgICAgIHBba10gPSBAc3RyaW5nIGVcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIGVsc2UgaWYgZSBpbnN0YW5jZW9mIEFycmF5ICB0aGVuIEBleHAgZSwgaywgdiBmb3IgdixrIGluIGUgaWYgZS5sZW5ndGhcbiAgICAgICAgZWxzZSBpZiBlIGluc3RhbmNlb2YgT2JqZWN0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciBrZXksdmFsIG9mIGVcbiAgICAgICAgICAgICAgICBpZiB2YWxcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsLnR5cGUgdGhlbiBAZXhwIGUsIGtleSwgdmFsXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbCBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGV4cCB2YWwsIGssIHYgZm9yIHYsayBpbiB2YWwgaWYgdmFsLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBleHAgdmFsLCBrLCB2IGZvciBrLHYgb2YgdmFsXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgc3RyaW5nOiAoZSkgLT5cbiAgICAgICAgcyA9IGlmIGUudHlwZSA9PSAndHJpcGxlJyB0aGVuIGUudGV4dFszLi4uLTNdIGVsc2UgZS50ZXh0WzEuLi4tMV1cbiAgICAgICAgY2h1bmtzID0gQGRpc3NlY3QgcywgZS5saW5lLCBlLmNvbFxuICAgICAgICBpZiBjaHVua3MubGVuZ3RoID4gMVxuICAgICAgICAgICAgIyBsb2cgcmVkKGUudGV4dCksIGdyZWVuIHNcbiAgICAgICAgICAgICMgcHJpbnQubm9vbiAnY2h1bmtzJyBjaHVua3NcbiAgICAgICAgICAgIGlmIGNodW5rc1stMV0udHlwZSAhPSAnY2xvc2UnXG4gICAgICAgICAgICAgICAgY2h1bmtzLnB1c2ggdHlwZTonY2xvc2UnIHRleHQ6JycgbGluZTplLmxpbmUsIGNvbDplLmNvbCtzLmxlbmd0aFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHN0cmlwb2w6Y2h1bmtzXG4gICAgICAgIGVcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgZGlzc2VjdDogKHMsIGxpbmUsIGNvbCkgLT5cblxuICAgICAgICBjID0gMDsgY2h1bmtzID0gW11cbiAgICAgICAgICAgIFxuICAgICAgICBwdXNoID0gKHR5cGUsdGV4dCkgLT4gXG4gICAgICAgICAgICBjaHVua3MucHVzaCB0eXBlOnR5cGUsIHRleHQ6dGV4dCwgbGluZTpsaW5lLCBjb2w6Y29sK2NcbiAgICAgICAgICAgICMgc3dpdGNoIHR5cGVcbiAgICAgICAgICAgICAgICAjIHdoZW4gJ29wZW4nICB0aGVuIGxvZyBtNignb3BlbicpLCAgZzQgdGV4dFxuICAgICAgICAgICAgICAgICMgd2hlbiAnY29kZScgIHRoZW4gbG9nIG02KCdjb2RlJyksICB3OCB0ZXh0XG4gICAgICAgICAgICAgICAgIyB3aGVuICdtaWRsJyAgdGhlbiBsb2cgbTYoJ21pZGwnKSwgIGc0IHRleHRcbiAgICAgICAgICAgICAgICAjIHdoZW4gJ2Nsb3NlJyB0aGVuIGxvZyBtNignY2xvc2UnKSwgZzQgdGV4dFxuICAgICAgICBcbiAgICAgICAgd2hpbGUgYyA8IHMubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHQgPSBzW2MuLl1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBsb2cgcjUoXCJvdXRlclwiKSwgYjgoYyksIGczKHQpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG5vdCBtID0gLyg/PCFcXFxcKSN7Ly5leGVjIHRcbiAgICAgICAgICAgICAgICBwdXNoICdjbG9zZScgdFxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIHB1c2ggZW1wdHkoY2h1bmtzKSBhbmQgJ29wZW4nIG9yICdtaWRsJywgdFsuLi5tLmluZGV4XSBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYyArPSBtLmluZGV4KzJcbiAgICAgICAgICAgIGljID0gY1xuXG4gICAgICAgICAgICB3aGlsZSBjIDwgcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0ID0gc1tjLi5dXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBsb2cgcjMoXCJpbm5lclwiKSwgYjgoYyksIGcyKHQpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmdzID0gXG4gICAgICAgICAgICAgICAgICAgIHRyaXBsZTogIC9cIlwiXCIoPzoufFxcbikqP1wiXCJcIi8gICAgIFxuICAgICAgICAgICAgICAgICAgICBkb3VibGU6ICAvXCIoPzpcXFxcW1wiXFxcXF18W15cXG5cIl0pKlwiL1xuICAgICAgICAgICAgICAgICAgICBzaW5nbGU6ICAvJyg/OlxcXFxbJ1xcXFxdfFteXFxuJ10pKicvXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQ6IC8jLyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIG9wZW46ICAgIC97LyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGNsb3NlOiAgIC99LyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbWF0Y2hlcyA9IChbaywgci5leGVjIHRdIGZvciBrLHIgb2YgcmdzKVxuICAgICAgICAgICAgICAgIG1hdGNoZXMgPSBtYXRjaGVzLmZpbHRlciAobSkgLT4gbVsxXT9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBlbXB0eSBtYXRjaGVzXG4gICAgICAgICAgICAgICAgICAgIGxvZyAnSU5ORVIgTUlETCdcbiAgICAgICAgICAgICAgICAgICAgcHVzaCAnbWlkbCcgc1tjLi5dXG4gICAgICAgICAgICAgICAgICAgIGMgPSBzLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG1hdGNoZXMuc29ydCAoYSxiKSAtPiBhWzFdLmluZGV4IC0gYlsxXS5pbmRleFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxlbmd0aCA9IG1hdGNoZXNbMF1bMV1bMF0ubGVuZ3RoXG4gICAgICAgICAgICAgICAgaW5kZXggID0gbWF0Y2hlc1swXVsxXS5pbmRleFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGIgPSBzd2l0Y2ggbWF0Y2hlc1swXVswXVxuICAgICAgICAgICAgICAgICAgICB3aGVuICdjbG9zZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1c2ggJ2NvZGUnIHNbaWMuLi5jK2luZGV4XVxuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSBpbmRleCtsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAndHJpcGxlJyAnZG91YmxlJyAnc2luZ2xlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBsb2cgJ3N0cicgc1tpYy4uLmMraW5kZXgrbGVuZ3RoXVxuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSBpbmRleCtsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZyAndW5oYW5kbGVkPycgbWF0Y2hlc1swXVxuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSBpbmRleCtsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICBicmVhayBpZiBiXG4gICAgICAgICAgICBcbiAgICAgICAgY2h1bmtzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIHZlcmI6IC0+IGlmIEB2ZXJib3NlIHRoZW4gY29uc29sZS5sb2cuYXBwbHkgY29uc29sZS5sb2csIGFyZ3VtZW50cyBcblxubW9kdWxlLmV4cG9ydHMgPSBTdHJpcG9sXG4iXX0=
//# sourceURL=../coffee/stripol.coffee