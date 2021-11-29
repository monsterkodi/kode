// koffee 1.20.0

/*
00000000   00000000  000000000  000   000  00000000   000   000  00000000  00000000   
000   000  000          000     000   000  000   000  0000  000  000       000   000  
0000000    0000000      000     000   000  0000000    000 0 000  0000000   0000000    
000   000  000          000     000   000  000   000  000  0000  000       000   000  
000   000  00000000     000      0000000   000   000  000   000  00000000  000   000
 */

/*
    walks through an abstract syntax tree and inserts implicit return statements
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
                } else if (lst.call) {
                    if ((ref5 = lst.call.callee.text) !== 'log' && ref5 !== 'warn' && ref5 !== 'error') {
                        insert();
                    }
                } else if (lst.func) {
                    insert();
                } else if (lst.array) {
                    insert();
                } else if (lst.operation) {
                    insert();
                } else if (lst.prop) {
                    insert();
                } else if (lst.index) {
                    insert();
                } else if (lst["return"]) {
                    null;
                } else {
                    console.log('returner?', lst);
                }
            }
            return this.scope(f.body);
        }
    };

    Returner.prototype.exp = function(e) {
        var i, k, key, len, results, results1, v, val;
        if (!e) {
            return;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV0dXJuZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZXR1cm5lci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7QUFRQTs7O0FBUkEsSUFBQTs7QUFZTTtJQUVDLGtCQUFDLElBQUQ7UUFBQyxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBQyxDQUFBLEtBQUQsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztJQUh2Qjs7dUJBS0gsT0FBQSxHQUFTLFNBQUMsRUFBRDtlQUFRLElBQUMsQ0FBQSxLQUFELENBQU8sRUFBUDtJQUFSOzt1QkFFVCxLQUFBLEdBQU8sU0FBQyxJQUFEO0FBRUgsWUFBQTtRQUFBLGtEQUFhLENBQUUsd0JBQWY7QUFDSTtBQUFBLGlCQUFBLHNDQUFBOztnQkFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUw7QUFBQSxhQURKOztlQUVBO0lBSkc7O3VCQU1QLElBQUEsR0FBTSxTQUFDLENBQUQ7QUFFRixZQUFBO1FBQUEsSUFBZSxDQUFDLENBQUMsSUFBakI7WUFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUMsQ0FBQyxJQUFQLEVBQUE7O1FBRUEsNkRBQWUsQ0FBRSx3QkFBakI7WUFFSSwwQ0FBUyxDQUFFLGNBQVIsS0FBcUIsR0FBckIsSUFBQSxJQUFBLEtBQXlCLGFBQTVCO2dCQUVJLEdBQUEsR0FBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUssVUFBRSxDQUFBLENBQUE7Z0JBRXBCLE1BQUEsR0FBUyxTQUFBOzJCQUNMLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQVosQ0FBaUI7d0JBQUEsQ0FBQSxNQUFBLENBQUEsRUFDYjs0QkFBQSxHQUFBLEVBQUs7Z0NBQUEsSUFBQSxFQUFLLFNBQUw7Z0NBQWUsSUFBQSxFQUFLLFFBQXBCOzZCQUFM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IDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbiMjI1xuICAgIHdhbGtzIHRocm91Z2ggYW4gYWJzdHJhY3Qgc3ludGF4IHRyZWUgYW5kIGluc2VydHMgaW1wbGljaXQgcmV0dXJuIHN0YXRlbWVudHNcbiMjI1xuXG5jbGFzcyBSZXR1cm5lclxuXG4gICAgQDogKEBrb2RlKSAtPlxuXG4gICAgICAgIEB2ZXJib3NlID0gQGtvZGUuYXJncy52ZXJib3NlXG4gICAgICAgIEBkZWJ1ZyAgID0gQGtvZGUuYXJncy5kZWJ1Z1xuICAgICAgICBcbiAgICBjb2xsZWN0OiAodGwpIC0+IEBzY29wZSB0bFxuXG4gICAgc2NvcGU6IChib2R5KSAtPlxuXG4gICAgICAgIGlmIGJvZHk/LmV4cHM/Lmxlbmd0aFxuICAgICAgICAgICAgQGV4cCBlIGZvciBlIGluIGJvZHkuZXhwc1xuICAgICAgICBib2R5XG4gICAgICAgIFxuICAgIGZ1bmM6IChmKSAtPlxuICAgICAgICBcbiAgICAgICAgQGV4cCBmLmFyZ3MgaWYgZi5hcmdzXG4gICAgICAgIFxuICAgICAgICBpZiBmLmJvZHk/LmV4cHM/Lmxlbmd0aFxuXG4gICAgICAgICAgICBpZiBmLm5hbWU/LnRleHQgbm90IGluIFsnQCcgJ2NvbnN0cnVjdG9yJ11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsc3QgPSBmLmJvZHkuZXhwc1stMV1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpbnNlcnQgPSAtPiBcbiAgICAgICAgICAgICAgICAgICAgZi5ib2R5LmV4cHMucHVzaCByZXR1cm46XG4gICAgICAgICAgICAgICAgICAgICAgICByZXQ6IHR5cGU6J2tleXdvcmQnIHRleHQ6J3JldHVybidcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbDogZi5ib2R5LmV4cHMucG9wKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBsc3QudHlwZSBpbiBbJ3ZhcicgJ251bScgJ3NpbmdsZScgJ2RvdWJsZScgJ3RyaXBsZSddIHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5jYWxsIHRoZW4gaWYgbHN0LmNhbGwuY2FsbGVlLnRleHQgbm90IGluIFsnbG9nJyAnd2FybicgJ2Vycm9yJ10gdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LmZ1bmMgdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LmFycmF5IHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5vcGVyYXRpb24gdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LnByb3AgdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LmluZGV4IHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5yZXR1cm4gdGhlbiBudWxsXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBsb2cgJ3JldHVybmVyPycgbHN0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBzY29wZSBmLmJvZHkgXG4gICAgICAgIFxuICAgIGV4cDogKGUpIC0+XG5cbiAgICAgICAgaWYgbm90IGUgdGhlbiByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBpZiBlLnR5cGUgICAgICAgICAgICAgICAgICAgdGhlbiByZXR1cm5cbiAgICAgICAgZWxzZSBpZiBlIGluc3RhbmNlb2YgQXJyYXkgIHRoZW4gQGV4cCB2IGZvciB2IGluIGUgaWYgZS5sZW5ndGhcbiAgICAgICAgZWxzZSBpZiBlIGluc3RhbmNlb2YgT2JqZWN0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGUuZnVuY1xuICAgICAgICAgICAgICAgIEBmdW5jIGUuZnVuY1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZvciBrZXksdmFsIG9mIGVcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB2YWwudHlwZSB0aGVuIEBleHAgdmFsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGV4cCB2IGZvciB2IGluIHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGV4cCB2IGZvciBrLHYgb2YgdmFsXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxvZyAnZGFmdWs/JyBlXG4gICAgICAgIFxuICAgIHZlcmI6IC0+IGlmIEB2ZXJib3NlIHRoZW4gY29uc29sZS5sb2cuYXBwbHkgY29uc29sZS5sb2csIGFyZ3VtZW50cyBcblxubW9kdWxlLmV4cG9ydHMgPSBSZXR1cm5lclxuIl19
//# sourceURL=../coffee/returner.coffee