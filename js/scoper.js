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
        var ref, ref1, ref2;
        this.kode = kode;
        this.verbose = (ref = this.kode.args) != null ? ref.verbose : void 0;
        this.debug = (ref1 = this.kode.args) != null ? ref1.debug : void 0;
        this.raw = (ref2 = this.kode.args) != null ? ref2.raw : void 0;
    }

    Scoper.prototype.vars = function(tl) {
        this.stack = [];
        this.scope(tl);
        return tl;
    };

    Scoper.prototype.scope = function(body) {
        var e, i, len, ref;
        this.stack.push({});
        ref = body.exps;
        for (i = 0, len = ref.length; i < len; i++) {
            e = ref[i];
            this.exp(e);
        }
        body.vars = Object.keys(this.stack.pop());
        return body.vars;
    };

    Scoper.prototype.exp = function(e) {};

    Scoper.prototype.verb = function() {
        if (this.verbose) {
            return console.log.apply(console.log, arguments);
        }
    };

    return Scoper;

})();

module.exports = Scoper;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGVyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsic2NvcGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRTTtJQUVDLGdCQUFDLElBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7UUFFQSxJQUFDLENBQUEsT0FBRCx1Q0FBc0IsQ0FBRTtRQUN4QixJQUFDLENBQUEsS0FBRCx5Q0FBc0IsQ0FBRTtRQUN4QixJQUFDLENBQUEsR0FBRCx5Q0FBc0IsQ0FBRTtJQUp6Qjs7cUJBTUgsSUFBQSxHQUFNLFNBQUMsRUFBRDtRQUVGLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFDVCxJQUFDLENBQUEsS0FBRCxDQUFPLEVBQVA7ZUFDQTtJQUpFOztxQkFNTixLQUFBLEdBQU8sU0FBQyxJQUFEO0FBRUgsWUFBQTtRQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZLEVBQVo7QUFDQTtBQUFBLGFBQUEscUNBQUE7O1lBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMO0FBQUE7UUFDQSxJQUFJLENBQUMsSUFBTCxHQUFZLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQUEsQ0FBWjtlQUVaLElBQUksQ0FBQztJQU5GOztxQkFRUCxHQUFBLEdBQUssU0FBQyxDQUFELEdBQUE7O3FCQUlMLElBQUEsR0FBTSxTQUFBO1FBQUcsSUFBRyxJQUFDLENBQUEsT0FBSjttQkFBaUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFaLENBQWtCLE9BQU8sQ0FBQyxHQUExQixFQUErQixTQUEvQixFQUFqQjs7SUFBSDs7Ozs7O0FBRVYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCBcbjAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG5jbGFzcyBTY29wZXJcblxuICAgIEA6IChAa29kZSkgLT5cblxuICAgICAgICBAdmVyYm9zZSAgPSBAa29kZS5hcmdzPy52ZXJib3NlXG4gICAgICAgIEBkZWJ1ZyAgICA9IEBrb2RlLmFyZ3M/LmRlYnVnXG4gICAgICAgIEByYXcgICAgICA9IEBrb2RlLmFyZ3M/LnJhd1xuICAgICAgICBcbiAgICB2YXJzOiAodGwpIC0+XG4gICAgICAgIFxuICAgICAgICBAc3RhY2sgPSBbXVxuICAgICAgICBAc2NvcGUgdGxcbiAgICAgICAgdGxcblxuICAgIHNjb3BlOiAoYm9keSkgLT4gXG4gICAgICAgIFxuICAgICAgICBAc3RhY2sucHVzaCB7fVxuICAgICAgICBAZXhwIGUgZm9yIGUgaW4gYm9keS5leHBzXG4gICAgICAgIGJvZHkudmFycyA9IE9iamVjdC5rZXlzIEBzdGFjay5wb3AoKVxuICAgICAgICAjIGxvZyAnc2NvcGVyOicgYm9keS52YXJzXG4gICAgICAgIGJvZHkudmFyc1xuICAgICAgICBcbiAgICBleHA6IChlKSAtPlxuICAgICAgICBcbiAgICAgICAgIyBsb2coZSlcbiAgICAgICAgXG4gICAgdmVyYjogLT4gaWYgQHZlcmJvc2UgdGhlbiBjb25zb2xlLmxvZy5hcHBseSBjb25zb2xlLmxvZywgYXJndW1lbnRzIFxuXG5tb2R1bGUuZXhwb3J0cyA9IFNjb3BlclxuIl19
//# sourceURL=../coffee/scoper.coffee