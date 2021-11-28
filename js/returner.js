// koffee 1.20.0

/*
00000000   00000000  000000000  000   000  00000000   000   000  00000000  00000000   
000   000  000          000     000   000  000   000  0000  000  000       000   000  
0000000    0000000      000     000   000  0000000    000 0 000  0000000   0000000    
000   000  000          000     000   000  000   000  000  0000  000       000   000  
000   000  00000000     000      0000000   000   000  000   000  00000000  000   000
 */
var Returner;

Returner = (function() {
    function Returner(kode) {
        this.kode = kode;
        this.verbose = this.kode.args.verbose;
        this.debug = this.kode.args.debug;
    }

    Returner.prototype.collect = function(tl) {
        return this.scope(tl);
    };

    Returner.prototype.scope = function(body) {
        var e, i, len, ref, ref1;
        if (body != null ? (ref = body.exps) != null ? ref.length : void 0 : void 0) {
            ref1 = body.exps;
            for (i = 0, len = ref1.length; i < len; i++) {
                e = ref1[i];
                this.exp(e);
            }
        }
        return body;
    };

    Returner.prototype.func = function(f) {
        var insert, lst, ref, ref1, ref2, ref3, ref4, ref5;
        if (f.args) {
            this.exp(f.args);
        }
        if ((ref = f.body) != null ? (ref1 = ref.exps) != null ? ref1.length : void 0 : void 0) {
            if ((ref2 = (ref3 = f.name) != null ? ref3.text : void 0) !== '@' && ref2 !== 'constructor') {
                lst = f.body.exps.slice(-1)[0];
                insert = function() {
                    return f.body.exps.push({
                        "return": {
                            ret: {
                                type: 'keyword',
                                text: 'return'
                            },
                            val: f.body.exps.pop()
                        }
                    });
                };
                if ((ref4 = lst.type) === 'var' || ref4 === 'num' || ref4 === 'single' || ref4 === 'double' || ref4 === 'triple') {
                    insert();
                } else if (lst.call && ((ref5 = lst.call.callee.text) !== 'log' && ref5 !== 'warn' && ref5 !== 'error')) {
                    insert();
                } else if (lst.func) {
                    insert();
                } else if (lst.array) {
                    insert();
                } else if (lst.operation) {
                    insert();
                }
            }
            return this.scope(f.body);
        }
    };

    Returner.prototype.exp = function(e) {
        var i, k, key, len, results, results1, v, val;
        if (!e) {
            return console.log('dafuk!');
        }
        if (e.type) {

        } else if (e instanceof Array) {
            if (e.length) {
                results = [];
                for (i = 0, len = e.length; i < len; i++) {
                    v = e[i];
                    results.push(this.exp(v));
                }
                return results;
            }
        } else if (e instanceof Object) {
            if (e.func) {
                return this.func(e.func);
            } else {
                results1 = [];
                for (key in e) {
                    val = e[key];
                    if (val) {
                        if (val.type) {
                            results1.push(this.exp(val));
                        } else {
                            if (val instanceof Array) {
                                if (val.length) {
                                    results1.push((function() {
                                        var j, len1, results2;
                                        results2 = [];
                                        for (j = 0, len1 = val.length; j < len1; j++) {
                                            v = val[j];
                                            results2.push(this.exp(v));
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
                                        results2.push(this.exp(v));
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
        } else {
            return console.log('dafuk?', e);
        }
    };

    Returner.prototype.verb = function() {
        if (this.verbose) {
            return console.log.apply(console.log, arguments);
        }
    };

    return Returner;

})();

module.exports = Returner;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV0dXJuZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZXR1cm5lci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUU07SUFFQyxrQkFBQyxJQUFEO1FBQUMsSUFBQyxDQUFBLE9BQUQ7UUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUMsQ0FBQSxLQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7SUFIdkI7O3VCQUtILE9BQUEsR0FBUyxTQUFDLEVBQUQ7ZUFBUSxJQUFDLENBQUEsS0FBRCxDQUFPLEVBQVA7SUFBUjs7dUJBRVQsS0FBQSxHQUFPLFNBQUMsSUFBRDtBQUVILFlBQUE7UUFBQSxrREFBYSxDQUFFLHdCQUFmO0FBQ0k7QUFBQSxpQkFBQSxzQ0FBQTs7Z0JBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMO0FBQUEsYUFESjs7ZUFFQTtJQUpHOzt1QkFNUCxJQUFBLEdBQU0sU0FBQyxDQUFEO0FBRUYsWUFBQTtRQUFBLElBQWUsQ0FBQyxDQUFDLElBQWpCO1lBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFDLENBQUMsSUFBUCxFQUFBOztRQUVBLDZEQUFlLENBQUUsd0JBQWpCO1lBRUksMENBQVMsQ0FBRSxjQUFSLEtBQXFCLEdBQXJCLElBQUEsSUFBQSxLQUF5QixhQUE1QjtnQkFFSSxHQUFBLEdBQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFLLFVBQUUsQ0FBQSxDQUFBO2dCQUdwQixNQUFBLEdBQVMsU0FBQTsyQkFDTCxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFaLENBQWlCO3dCQUFBLENBQUEsTUFBQSxDQUFBLEVBQ2I7NEJBQUEsR0FBQSxFQUFLO2dDQUFBLElBQUEsRUFBSyxTQUFMO2dDQUFlLElBQUEsRUFBSyxRQUFwQjs2QkFBTDs0QkFDQSxHQUFBLEVBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBWixDQUFBLENBREw7eUJBRGE7cUJBQWpCO2dCQURLO2dCQUtULFlBQUcsR0FBRyxDQUFDLEtBQUosS0FBYSxLQUFiLElBQUEsSUFBQSxLQUFtQixLQUFuQixJQUFBLElBQUEsS0FBeUIsUUFBekIsSUFBQSxJQUFBLEtBQWtDLFFBQWxDLElBQUEsSUFBQSxLQUEyQyxRQUE5QztvQkFBNkQsTUFBQSxDQUFBLEVBQTdEO2lCQUFBLE1BQ0ssSUFBRyxHQUFHLENBQUMsSUFBSixJQUFhLFNBQUEsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBaEIsS0FBNkIsS0FBN0IsSUFBQSxJQUFBLEtBQW1DLE1BQW5DLElBQUEsSUFBQSxLQUEwQyxPQUExQyxDQUFoQjtvQkFBd0UsTUFBQSxDQUFBLEVBQXhFO2lCQUFBLE1BQ0EsSUFBRyxHQUFHLENBQUMsSUFBUDtvQkFBaUIsTUFBQSxDQUFBLEVBQWpCO2lCQUFBLE1BQ0EsSUFBRyxHQUFHLENBQUMsS0FBUDtvQkFBa0IsTUFBQSxDQUFBLEVBQWxCO2lCQUFBLE1BQ0EsSUFBRyxHQUFHLENBQUMsU0FBUDtvQkFBc0IsTUFBQSxDQUFBLEVBQXRCO2lCQWRUOzttQkFnQkEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxDQUFDLENBQUMsSUFBVCxFQWxCSjs7SUFKRTs7dUJBd0JOLEdBQUEsR0FBSyxTQUFDLENBQUQ7QUFFRCxZQUFBO1FBQUEsSUFBRyxDQUFJLENBQVA7QUFBYyxtQkFBSyxPQUFBLENBQUUsR0FBRixDQUFNLFFBQU4sRUFBbkI7O1FBRUEsSUFBRyxDQUFDLENBQUMsSUFBTDtBQUFBO1NBQUEsTUFDSyxJQUFHLENBQUEsWUFBYSxLQUFoQjtZQUE0QixJQUFxQixDQUFDLENBQUMsTUFBdkI7QUFBQTtxQkFBQSxtQ0FBQTs7aUNBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMO0FBQUE7K0JBQUE7YUFBNUI7U0FBQSxNQUNBLElBQUcsQ0FBQSxZQUFhLE1BQWhCO1lBRUQsSUFBRyxDQUFDLENBQUMsSUFBTDt1QkFDSSxJQUFDLENBQUEsSUFBRCxDQUFNLENBQUMsQ0FBQyxJQUFSLEVBREo7YUFBQSxNQUFBO0FBR0k7cUJBQUEsUUFBQTs7b0JBQ0ksSUFBRyxHQUFIO3dCQUNJLElBQUcsR0FBRyxDQUFDLElBQVA7MENBQWlCLElBQUMsQ0FBQSxHQUFELENBQUssR0FBTCxHQUFqQjt5QkFBQSxNQUFBOzRCQUVJLElBQUcsR0FBQSxZQUFlLEtBQWxCO2dDQUNJLElBQUcsR0FBRyxDQUFDLE1BQVA7OztBQUNJOzZDQUFBLHVDQUFBOzswREFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUw7QUFBQTs7bURBREo7aUNBQUEsTUFBQTswREFBQTtpQ0FESjs2QkFBQSxNQUFBOzs7QUFJSTt5Q0FBQSxRQUFBOztzREFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUw7QUFBQTs7K0NBSko7NkJBRko7eUJBREo7cUJBQUEsTUFBQTs4Q0FBQTs7QUFESjtnQ0FISjthQUZDO1NBQUEsTUFBQTttQkFlRixPQUFBLENBQUMsR0FBRCxDQUFLLFFBQUwsRUFBYyxDQUFkLEVBZkU7O0lBTko7O3VCQXVCTCxJQUFBLEdBQU0sU0FBQTtRQUFHLElBQUcsSUFBQyxDQUFBLE9BQUo7bUJBQWlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBWixDQUFrQixPQUFPLENBQUMsR0FBMUIsRUFBK0IsU0FBL0IsRUFBakI7O0lBQUg7Ozs7OztBQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiMjI1xuXG5jbGFzcyBSZXR1cm5lclxuXG4gICAgQDogKEBrb2RlKSAtPlxuXG4gICAgICAgIEB2ZXJib3NlID0gQGtvZGUuYXJncy52ZXJib3NlXG4gICAgICAgIEBkZWJ1ZyAgID0gQGtvZGUuYXJncy5kZWJ1Z1xuICAgICAgICBcbiAgICBjb2xsZWN0OiAodGwpIC0+IEBzY29wZSB0bFxuXG4gICAgc2NvcGU6IChib2R5KSAtPlxuXG4gICAgICAgIGlmIGJvZHk/LmV4cHM/Lmxlbmd0aFxuICAgICAgICAgICAgQGV4cCBlIGZvciBlIGluIGJvZHkuZXhwc1xuICAgICAgICBib2R5XG4gICAgICAgIFxuICAgIGZ1bmM6IChmKSAtPlxuICAgICAgICBcbiAgICAgICAgQGV4cCBmLmFyZ3MgaWYgZi5hcmdzXG4gICAgICAgIFxuICAgICAgICBpZiBmLmJvZHk/LmV4cHM/Lmxlbmd0aFxuXG4gICAgICAgICAgICBpZiBmLm5hbWU/LnRleHQgbm90IGluIFsnQCcgJ2NvbnN0cnVjdG9yJ11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsc3QgPSBmLmJvZHkuZXhwc1stMV1cbiAgICAgICAgICAgICAgICAjIGxvZyBmLmFycm93LmxpbmUsIGYuYXJyb3cudGV4dCwgbHN0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaW5zZXJ0ID0gLT4gXG4gICAgICAgICAgICAgICAgICAgIGYuYm9keS5leHBzLnB1c2ggcmV0dXJuOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0OiB0eXBlOidrZXl3b3JkJyB0ZXh0OidyZXR1cm4nXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWw6IGYuYm9keS5leHBzLnBvcCgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbHN0LnR5cGUgaW4gWyd2YXInICdudW0nICdzaW5nbGUnICdkb3VibGUnICd0cmlwbGUnXSB0aGVuIGluc2VydCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QuY2FsbCBhbmQgbHN0LmNhbGwuY2FsbGVlLnRleHQgbm90IGluIFsnbG9nJyAnd2FybicgJ2Vycm9yJ10gdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LmZ1bmMgdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LmFycmF5IHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5vcGVyYXRpb24gdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAc2NvcGUgZi5ib2R5IFxuICAgICAgICBcbiAgICBleHA6IChlKSAtPlxuXG4gICAgICAgIGlmIG5vdCBlIHRoZW4gcmV0dXJuIGxvZyAnZGFmdWshJ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIGUudHlwZSAgICAgICAgICAgICAgICAgICB0aGVuIHJldHVyblxuICAgICAgICBlbHNlIGlmIGUgaW5zdGFuY2VvZiBBcnJheSAgdGhlbiBAZXhwIHYgZm9yIHYgaW4gZSBpZiBlLmxlbmd0aFxuICAgICAgICBlbHNlIGlmIGUgaW5zdGFuY2VvZiBPYmplY3RcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZS5mdW5jXG4gICAgICAgICAgICAgICAgQGZ1bmMgZS5mdW5jXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZm9yIGtleSx2YWwgb2YgZVxuICAgICAgICAgICAgICAgICAgICBpZiB2YWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbC50eXBlIHRoZW4gQGV4cCB2YWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiB2YWwgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiB2YWwubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZXhwIHYgZm9yIHYgaW4gdmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZXhwIHYgZm9yIGssdiBvZiB2YWxcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbG9nICdkYWZ1az8nIGVcbiAgICAgICAgXG4gICAgdmVyYjogLT4gaWYgQHZlcmJvc2UgdGhlbiBjb25zb2xlLmxvZy5hcHBseSBjb25zb2xlLmxvZywgYXJndW1lbnRzIFxuXG5tb2R1bGUuZXhwb3J0cyA9IFJldHVybmVyXG4iXX0=
//# sourceURL=../coffee/returner.coffee