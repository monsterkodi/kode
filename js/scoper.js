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
        var k, key, ref, results, v, val;
        if (e.type === 'var') {
            return this.verb(gray(e.type), green(e.text));
        } else if (e.type) {
            return this.verb(gray(e.type), blue(e.text));
        } else {
            if (e.operation && ((ref = e.operation.lhs) != null ? ref.text : void 0) && e.operation.operator.text === '=') {
                this.verb(yellow(e.operation.lhs.text), red(e.operation.operator.text));
                if (!this.maps.slice(-1)[0][e.operation.lhs.text]) {
                    this.vars.slice(-1)[0].push({
                        text: e.operation.lhs.text,
                        type: e.operation.operator.text
                    });
                    this.maps.slice(-1)[0][e.operation.lhs.text] = e.operation.operator.text;
                }
            }
            console.log('scoper node', e);
            results = [];
            for (key in e) {
                val = e[key];
                if (val.type != null) {
                    results.push(this.exp(val));
                } else {
                    if (val instanceof Array) {
                        results.push((function() {
                            var i, len, results1;
                            results1 = [];
                            for (i = 0, len = val.length; i < len; i++) {
                                v = val[i];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGVyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsic2NvcGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRTTtJQUVDLGdCQUFDLElBQUQ7UUFBQyxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBQyxDQUFBLEtBQUQsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFDLENBQUEsR0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO0lBSnZCOztxQkFNSCxPQUFBLEdBQVMsU0FBQyxFQUFEO1FBRUwsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLElBQUMsQ0FBQSxJQUFELEdBQVE7UUFDUixJQUFDLENBQUEsS0FBRCxDQUFPLEVBQVA7ZUFDQTtJQUxLOztxQkFPVCxLQUFBLEdBQU8sU0FBQyxJQUFEO0FBR0gsWUFBQTtRQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLEVBQVg7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxJQUFJLENBQUMsSUFBaEI7QUFDQTtBQUFBLGFBQUEscUNBQUE7O1lBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMO0FBQUE7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBQTtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFBO2VBRUE7SUFURzs7cUJBV1AsR0FBQSxHQUFLLFNBQUMsQ0FBRDtBQUdELFlBQUE7UUFBQSxJQUFHLENBQUMsQ0FBQyxJQUFGLEtBQVUsS0FBYjttQkFDSSxJQUFDLENBQUEsSUFBRCxDQUFNLElBQUEsQ0FBSyxDQUFDLENBQUMsSUFBUCxDQUFOLEVBQW9CLEtBQUEsQ0FBTSxDQUFDLENBQUMsSUFBUixDQUFwQixFQURKO1NBQUEsTUFFSyxJQUFHLENBQUMsQ0FBQyxJQUFMO21CQUNELElBQUMsQ0FBQSxJQUFELENBQU0sSUFBQSxDQUFLLENBQUMsQ0FBQyxJQUFQLENBQU4sRUFBb0IsSUFBQSxDQUFLLENBQUMsQ0FBQyxJQUFQLENBQXBCLEVBREM7U0FBQSxNQUFBO1lBR0QsSUFBRyxDQUFDLENBQUMsU0FBRiwwQ0FBK0IsQ0FBRSxjQUFqQyxJQUEwQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFyQixLQUE2QixHQUExRTtnQkFDSSxJQUFDLENBQUEsSUFBRCxDQUFNLE1BQUEsQ0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUF2QixDQUFOLEVBQW9DLEdBQUEsQ0FBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUF6QixDQUFwQztnQkFDQSxJQUFHLENBQUksSUFBQyxDQUFBLElBQUssVUFBRSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQWhCLENBQWpCO29CQUNJLElBQUMsQ0FBQSxJQUFLLFVBQUUsQ0FBQSxDQUFBLENBQUMsQ0FBQyxJQUFWLENBQWU7d0JBQUEsSUFBQSxFQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQXJCO3dCQUEyQixJQUFBLEVBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBckQ7cUJBQWY7b0JBQ0EsSUFBQyxDQUFBLElBQUssVUFBRSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQWhCLENBQVYsR0FBa0MsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FGM0Q7aUJBRko7O1lBTUEsT0FBQSxDQUFBLEdBQUEsQ0FBSSxhQUFKLEVBQWtCLENBQWxCO0FBQ0E7aUJBQUEsUUFBQTs7Z0JBQ0ksSUFBRyxnQkFBSDtpQ0FBa0IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxHQUFMLEdBQWxCO2lCQUFBLE1BQUE7b0JBRUksSUFBRyxHQUFBLFlBQWUsS0FBbEI7OztBQUNJO2lDQUFBLHFDQUFBOzs4Q0FBQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUw7QUFBQTs7dUNBREo7cUJBQUEsTUFBQTs7O0FBR0k7aUNBQUEsUUFBQTs7OENBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMO0FBQUE7O3VDQUhKO3FCQUZKOztBQURKOzJCQVZDOztJQUxKOztxQkF1QkwsSUFBQSxHQUFNLFNBQUE7UUFBRyxJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUFpQixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBTyxDQUFDLEdBQTFCLEVBQStCLFNBQS9CLEVBQWpCOztJQUFIOzs7Ozs7QUFFVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwIFxuMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbmNsYXNzIFNjb3BlclxuXG4gICAgQDogKEBrb2RlKSAtPlxuXG4gICAgICAgIEB2ZXJib3NlID0gQGtvZGUuYXJncy52ZXJib3NlXG4gICAgICAgIEBkZWJ1ZyAgID0gQGtvZGUuYXJncy5kZWJ1Z1xuICAgICAgICBAcmF3ICAgICA9IEBrb2RlLmFyZ3MucmF3XG4gICAgICAgIFxuICAgIGNvbGxlY3Q6ICh0bCkgLT5cbiAgICAgICAgXG4gICAgICAgIEBtYXBzID0gW11cbiAgICAgICAgQHZhcnMgPSBbXVxuICAgICAgICBAc2NvcGUgdGxcbiAgICAgICAgdGxcblxuICAgIHNjb3BlOiAoYm9keSkgLT5cblxuICAgICAgICAjIGxvZyAnU2NvcGVyIHNjb3BlJyBib2R5XG4gICAgICAgIEBtYXBzLnB1c2gge31cbiAgICAgICAgQHZhcnMucHVzaCBib2R5LnZhcnNcbiAgICAgICAgQGV4cCBlIGZvciBlIGluIGJvZHkuZXhwc1xuICAgICAgICBAbWFwcy5wb3AoKVxuICAgICAgICBAdmFycy5wb3AoKVxuICAgICAgICAjIGxvZyAnc2NvcGVyOicgYm9keSAjaWYgYm9keS52YXJzLmxlbmd0aFxuICAgICAgICBib2R5XG4gICAgICAgIFxuICAgIGV4cDogKGUpIC0+XG5cbiAgICAgICAgIyBsb2cgZVxuICAgICAgICBpZiBlLnR5cGUgPT0gJ3ZhcidcbiAgICAgICAgICAgIEB2ZXJiIGdyYXkoZS50eXBlKSwgZ3JlZW4oZS50ZXh0KVxuICAgICAgICBlbHNlIGlmIGUudHlwZVxuICAgICAgICAgICAgQHZlcmIgZ3JheShlLnR5cGUpLCBibHVlKGUudGV4dClcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIGlmIGUub3BlcmF0aW9uIGFuZCBlLm9wZXJhdGlvbi5saHM/LnRleHQgYW5kIGUub3BlcmF0aW9uLm9wZXJhdG9yLnRleHQgPT0gJz0nXG4gICAgICAgICAgICAgICAgQHZlcmIgeWVsbG93KGUub3BlcmF0aW9uLmxocy50ZXh0KSwgcmVkKGUub3BlcmF0aW9uLm9wZXJhdG9yLnRleHQpXG4gICAgICAgICAgICAgICAgaWYgbm90IEBtYXBzWy0xXVtlLm9wZXJhdGlvbi5saHMudGV4dF1cbiAgICAgICAgICAgICAgICAgICAgQHZhcnNbLTFdLnB1c2ggdGV4dDplLm9wZXJhdGlvbi5saHMudGV4dCwgdHlwZTplLm9wZXJhdGlvbi5vcGVyYXRvci50ZXh0XG4gICAgICAgICAgICAgICAgICAgIEBtYXBzWy0xXVtlLm9wZXJhdGlvbi5saHMudGV4dF0gPSBlLm9wZXJhdGlvbi5vcGVyYXRvci50ZXh0XG4gICAgICAgICAgICAgICAgICAgICMgbG9nICdpbnNlcnQnIEB2YXJzLCBAbWFwc1xuICAgICAgICAgICAgbG9nICdzY29wZXIgbm9kZScgZVxuICAgICAgICAgICAgZm9yIGtleSx2YWwgb2YgZVxuICAgICAgICAgICAgICAgIGlmIHZhbC50eXBlPyB0aGVuIEBleHAgdmFsXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiB2YWwgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgQGV4cCB2IGZvciB2IGluIHZhbFxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAZXhwIHYgZm9yIGssdiBvZiB2YWxcbiAgICAgICAgXG4gICAgdmVyYjogLT4gaWYgQHZlcmJvc2UgdGhlbiBjb25zb2xlLmxvZy5hcHBseSBjb25zb2xlLmxvZywgYXJndW1lbnRzIFxuXG5tb2R1bGUuZXhwb3J0cyA9IFNjb3BlclxuIl19
//# sourceURL=../coffee/scoper.coffee