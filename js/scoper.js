// koffee 1.20.0

/*
 0000000   0000000   0000000   00000000   00000000  00000000 
000       000       000   000  000   000  000       000   000
0000000   000       000   000  00000000   0000000   0000000  
     000  000       000   000  000        000       000   000
0000000    0000000   0000000   000        00000000  000   000
 */
var Scoper;

Scoper = (function() {
    function Scoper(kode) {
        this.kode = kode;
        this.verbose = this.kode.args.verbose;
        this.debug = this.kode.args.debug;
        this.raw = this.kode.args.raw;
    }

    Scoper.prototype.collect = function(tl) {
        this.maps = [];
        this.vars = [];
        this.scope(tl);
        return tl;
    };

    Scoper.prototype.scope = function(body) {
        var e, i, len, ref;
        this.maps.push({});
        this.vars.push(body.vars);
        ref = body.exps;
        for (i = 0, len = ref.length; i < len; i++) {
            e = ref[i];
            this.exp(e);
        }
        this.maps.pop();
        this.vars.pop();
        return body;
    };

    Scoper.prototype.exp = function(e) {
        var i, insert, k, key, len, ref, ref1, ref2, ref3, results, v, val, vals;
        insert = (function(_this) {
            return function(v, t) {
                _this.verb(yellow(v), red(t));
                if (!_this.maps.slice(-1)[0][v]) {
                    _this.vars.slice(-1)[0].push({
                        text: v,
                        type: t
                    });
                    return _this.maps.slice(-1)[0][v] = t;
                }
            };
        })(this);
        if (e.type === 'var') {
            return this.verb(gray(e.type), green(e.text));
        } else if (e.type) {
            return this.verb(gray(e.type), blue(e.text));
        } else {
            if (e.operation && ((ref = e.operation.lhs) != null ? ref.text : void 0) && e.operation.operator.text === '=') {
                insert(e.operation.lhs.text, e.operation.operator.text);
            }
            if (e["for"]) {
                if (e["for"].vals.text) {
                    insert(e["for"].vals.text, 'for');
                } else {
                    vals = (ref1 = (ref2 = e["for"].vals.array) != null ? ref2.items : void 0) != null ? ref1 : e["for"].vals;
                    ref3 = vals != null ? vals : [];
                    for (i = 0, len = ref3.length; i < len; i++) {
                        v = ref3[i];
                        if (v.text) {
                            insert(v.text, 'for');
                        }
                    }
                }
            }
            results = [];
            for (key in e) {
                val = e[key];
                if (val.type != null) {
                    results.push(this.exp(val));
                } else {
                    if (val instanceof Array) {
                        results.push((function() {
                            var j, len1, results1;
                            results1 = [];
                            for (j = 0, len1 = val.length; j < len1; j++) {
                                v = val[j];
                                results1.push(this.exp(v));
                            }
                            return results1;
                        }).call(this));
                    } else {
                        results.push((function() {
                            var results1;
                            results1 = [];
                            for (k in val) {
                                v = val[k];
                                results1.push(this.exp(v));
                            }
                            return results1;
                        }).call(this));
                    }
                }
            }
            return results;
        }
    };

    Scoper.prototype.verb = function() {
        if (this.verbose) {
            return console.log.apply(console.log, arguments);
        }
    };

    return Scoper;

})();

module.exports = Scoper;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGVyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsic2NvcGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRTTtJQUVDLGdCQUFDLElBQUQ7UUFBQyxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBQyxDQUFBLEtBQUQsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFDLENBQUEsR0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO0lBSnZCOztxQkFNSCxPQUFBLEdBQVMsU0FBQyxFQUFEO1FBRUwsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLElBQUMsQ0FBQSxJQUFELEdBQVE7UUFDUixJQUFDLENBQUEsS0FBRCxDQUFPLEVBQVA7ZUFDQTtJQUxLOztxQkFPVCxLQUFBLEdBQU8sU0FBQyxJQUFEO0FBRUgsWUFBQTtRQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLEVBQVg7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxJQUFJLENBQUMsSUFBaEI7QUFDQTtBQUFBLGFBQUEscUNBQUE7O1lBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMO0FBQUE7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBQTtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFBO2VBQ0E7SUFQRzs7cUJBU1AsR0FBQSxHQUFLLFNBQUMsQ0FBRDtBQUVELFlBQUE7UUFBQSxNQUFBLEdBQVMsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxDQUFELEVBQUcsQ0FBSDtnQkFDTCxLQUFDLENBQUEsSUFBRCxDQUFNLE1BQUEsQ0FBTyxDQUFQLENBQU4sRUFBaUIsR0FBQSxDQUFJLENBQUosQ0FBakI7Z0JBQ0EsSUFBRyxDQUFJLEtBQUMsQ0FBQSxJQUFLLFVBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFBLENBQWpCO29CQUNJLEtBQUMsQ0FBQSxJQUFLLFVBQUUsQ0FBQSxDQUFBLENBQUMsQ0FBQyxJQUFWLENBQWU7d0JBQUEsSUFBQSxFQUFLLENBQUw7d0JBQVEsSUFBQSxFQUFLLENBQWI7cUJBQWY7MkJBQ0EsS0FBQyxDQUFBLElBQUssVUFBRSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUEsQ0FBVixHQUFlLEVBRm5COztZQUZLO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtRQU1ULElBQUcsQ0FBQyxDQUFDLElBQUYsS0FBVSxLQUFiO21CQUNJLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBQSxDQUFLLENBQUMsQ0FBQyxJQUFQLENBQU4sRUFBb0IsS0FBQSxDQUFNLENBQUMsQ0FBQyxJQUFSLENBQXBCLEVBREo7U0FBQSxNQUVLLElBQUcsQ0FBQyxDQUFDLElBQUw7bUJBQ0QsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFBLENBQUssQ0FBQyxDQUFDLElBQVAsQ0FBTixFQUFvQixJQUFBLENBQUssQ0FBQyxDQUFDLElBQVAsQ0FBcEIsRUFEQztTQUFBLE1BQUE7WUFJRCxJQUFHLENBQUMsQ0FBQyxTQUFGLDBDQUErQixDQUFFLGNBQWpDLElBQTBDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQXJCLEtBQTZCLEdBQTFFO2dCQUNJLE1BQUEsQ0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUF2QixFQUE2QixDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFsRCxFQURKOztZQUdBLElBQUcsQ0FBQyxFQUFDLEdBQUQsRUFBSjtnQkFDSSxJQUFHLENBQUMsRUFBQyxHQUFELEVBQUksQ0FBQyxJQUFJLENBQUMsSUFBZDtvQkFDSSxNQUFBLENBQU8sQ0FBQyxFQUFDLEdBQUQsRUFBSSxDQUFDLElBQUksQ0FBQyxJQUFsQixFQUF3QixLQUF4QixFQURKO2lCQUFBLE1BQUE7b0JBR0ksSUFBQSx3RkFBaUMsQ0FBQyxFQUFDLEdBQUQsRUFBSSxDQUFDO0FBQ3ZDO0FBQUEseUJBQUEsc0NBQUE7O3dCQUNJLElBQXdCLENBQUMsQ0FBQyxJQUExQjs0QkFBQSxNQUFBLENBQU8sQ0FBQyxDQUFDLElBQVQsRUFBZSxLQUFmLEVBQUE7O0FBREoscUJBSko7aUJBREo7O0FBUUE7aUJBQUEsUUFBQTs7Z0JBQ0ksSUFBRyxnQkFBSDtpQ0FBa0IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxHQUFMLEdBQWxCO2lCQUFBLE1BQUE7b0JBRUksSUFBRyxHQUFBLFlBQWUsS0FBbEI7OztBQUNJO2lDQUFBLHVDQUFBOzs4Q0FBQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUw7QUFBQTs7dUNBREo7cUJBQUEsTUFBQTs7O0FBR0k7aUNBQUEsUUFBQTs7OENBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMO0FBQUE7O3VDQUhKO3FCQUZKOztBQURKOzJCQWZDOztJQVZKOztxQkFpQ0wsSUFBQSxHQUFNLFNBQUE7UUFBRyxJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUFpQixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBTyxDQUFDLEdBQTFCLEVBQStCLFNBQS9CLEVBQWpCOztJQUFIOzs7Ozs7QUFFVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwIFxuMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbmNsYXNzIFNjb3BlclxuXG4gICAgQDogKEBrb2RlKSAtPlxuXG4gICAgICAgIEB2ZXJib3NlID0gQGtvZGUuYXJncy52ZXJib3NlXG4gICAgICAgIEBkZWJ1ZyAgID0gQGtvZGUuYXJncy5kZWJ1Z1xuICAgICAgICBAcmF3ICAgICA9IEBrb2RlLmFyZ3MucmF3XG4gICAgICAgIFxuICAgIGNvbGxlY3Q6ICh0bCkgLT5cbiAgICAgICAgXG4gICAgICAgIEBtYXBzID0gW11cbiAgICAgICAgQHZhcnMgPSBbXVxuICAgICAgICBAc2NvcGUgdGxcbiAgICAgICAgdGxcblxuICAgIHNjb3BlOiAoYm9keSkgLT5cblxuICAgICAgICBAbWFwcy5wdXNoIHt9XG4gICAgICAgIEB2YXJzLnB1c2ggYm9keS52YXJzXG4gICAgICAgIEBleHAgZSBmb3IgZSBpbiBib2R5LmV4cHNcbiAgICAgICAgQG1hcHMucG9wKClcbiAgICAgICAgQHZhcnMucG9wKClcbiAgICAgICAgYm9keVxuICAgICAgICBcbiAgICBleHA6IChlKSAtPlxuXG4gICAgICAgIGluc2VydCA9ICh2LHQpID0+IFxuICAgICAgICAgICAgQHZlcmIgeWVsbG93KHYpLCByZWQodClcbiAgICAgICAgICAgIGlmIG5vdCBAbWFwc1stMV1bdl1cbiAgICAgICAgICAgICAgICBAdmFyc1stMV0ucHVzaCB0ZXh0OnYsIHR5cGU6dFxuICAgICAgICAgICAgICAgIEBtYXBzWy0xXVt2XSA9IHRcbiAgICAgICAgXG4gICAgICAgIGlmIGUudHlwZSA9PSAndmFyJ1xuICAgICAgICAgICAgQHZlcmIgZ3JheShlLnR5cGUpLCBncmVlbihlLnRleHQpXG4gICAgICAgIGVsc2UgaWYgZS50eXBlXG4gICAgICAgICAgICBAdmVyYiBncmF5KGUudHlwZSksIGJsdWUoZS50ZXh0KVxuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLm9wZXJhdGlvbiBhbmQgZS5vcGVyYXRpb24ubGhzPy50ZXh0IGFuZCBlLm9wZXJhdGlvbi5vcGVyYXRvci50ZXh0ID09ICc9J1xuICAgICAgICAgICAgICAgIGluc2VydCBlLm9wZXJhdGlvbi5saHMudGV4dCwgZS5vcGVyYXRpb24ub3BlcmF0b3IudGV4dFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGUuZm9yXG4gICAgICAgICAgICAgICAgaWYgZS5mb3IudmFscy50ZXh0XG4gICAgICAgICAgICAgICAgICAgIGluc2VydCBlLmZvci52YWxzLnRleHQsICdmb3InXG4gICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgdmFscyA9IGUuZm9yLnZhbHMuYXJyYXk/Lml0ZW1zID8gZS5mb3IudmFsc1xuICAgICAgICAgICAgICAgICAgICBmb3IgdiBpbiB2YWxzID8gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydCB2LnRleHQsICdmb3InIGlmIHYudGV4dFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciBrZXksdmFsIG9mIGVcbiAgICAgICAgICAgICAgICBpZiB2YWwudHlwZT8gdGhlbiBAZXhwIHZhbFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgIEBleHAgdiBmb3IgdiBpbiB2YWxcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgQGV4cCB2IGZvciBrLHYgb2YgdmFsXG4gICAgICAgIFxuICAgIHZlcmI6IC0+IGlmIEB2ZXJib3NlIHRoZW4gY29uc29sZS5sb2cuYXBwbHkgY29uc29sZS5sb2csIGFyZ3VtZW50cyBcblxubW9kdWxlLmV4cG9ydHMgPSBTY29wZXJcbiJdfQ==
//# sourceURL=../coffee/scoper.coffee