// koffee 1.20.0

/*
000000000  00000000   0000000  000000000        00     00  000   0000000   0000000
   000     000       000          000           000   000  000  000       000
   000     0000000   0000000      000           000000000  000  0000000   000
   000     000            000     000           000 0 000  000       000  000
   000     00000000  0000000      000           000   000  000  0000000    0000000
 */
var cmp;

cmp = require('./test_utils').cmp;

describe('misc', function() {
    it('this', function() {
        cmp('@', 'this');
        cmp('@a', 'this.a');
        cmp('@a.b', 'this.a.b');
        cmp('@a.b()', 'this.a.b()');
        cmp('t = @', 't = this');
        cmp("a.on 'b', @c", "a.on('b',this.c)");
        cmp("a.on 'b' @c", "a.on('b',this.c)");
        cmp("if @\n    1", "if (this)\n{\n    1\n}");
        return cmp("if @ then 1", "if (this)\n{\n    1\n}");
    });
    it('require', function() {
        cmp("noon  = require 'noon'", "noon = require('noon')");
        return cmp("slash = require 'kslash'\nkstr  = require 'kstr'", "slash = require('kslash')\nkstr = require('kstr')");
    });
    it('typeof', function() {
        return cmp("if typeof pat == 'string'\n    1", "if (typeof(pat) === 'string')\n{\n    1\n}");
    });
    it('instanceof', function() {
        cmp('a instanceof b', 'a instanceof b');
        return cmp('a instanceof b == true', 'a instanceof b === true');
    });
    it('delete', function() {
        cmp('delete a', 'delete(a)');
        cmp('[delete a, b]', '[delete(a),b]');
        cmp('delete a.b.c', 'delete(a.b.c)');
        cmp('[delete a.b, a:b]', '[delete(a.b),{a:b}]');
        return cmp('delete a.b == false', 'delete(a.b) === false');
    });
    it('in condition', function() {
        cmp("a in l", "l.indexOf(a) >= 0");
        cmp("a in 'xyz'", "'xyz'.indexOf(a) >= 0");
        cmp("a in [1,2,3]", "[1,2,3].indexOf(a) >= 0");
        cmp("if a in l then 1", "if (l.indexOf(a) >= 0)\n{\n    1\n}");
        return cmp("if a in l\n    2", "if (l.indexOf(a) >= 0)\n{\n    2\n}");
    });
    return it('nullcmp', function() {});
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9taXNjLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsidGVzdF9taXNjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQyxNQUFPLE9BQUEsQ0FBUSxjQUFSOztBQUVSLFFBQUEsQ0FBUyxNQUFULEVBQWdCLFNBQUE7SUFFWixFQUFBLENBQUcsTUFBSCxFQUFVLFNBQUE7UUFFTixHQUFBLENBQUksR0FBSixFQUFhLE1BQWI7UUFDQSxHQUFBLENBQUksSUFBSixFQUFhLFFBQWI7UUFDQSxHQUFBLENBQUksTUFBSixFQUFhLFVBQWI7UUFDQSxHQUFBLENBQUksUUFBSixFQUFhLFlBQWI7UUFDQSxHQUFBLENBQUksT0FBSixFQUFhLFVBQWI7UUFFQSxHQUFBLENBQUksY0FBSixFQUFvQixrQkFBcEI7UUFDQSxHQUFBLENBQUksYUFBSixFQUFtQixrQkFBbkI7UUFFQSxHQUFBLENBQUksYUFBSixFQUdRLHdCQUhSO2VBVUEsR0FBQSxDQUFJLGFBQUosRUFFUSx3QkFGUjtJQXJCTSxDQUFWO0lBb0NBLEVBQUEsQ0FBRyxTQUFILEVBQWEsU0FBQTtRQUVULEdBQUEsQ0FBSSx3QkFBSixFQUFnQyx3QkFBaEM7ZUFDQSxHQUFBLENBQUksa0RBQUosRUFHUSxtREFIUjtJQUhTLENBQWI7SUFpQkEsRUFBQSxDQUFHLFFBQUgsRUFBWSxTQUFBO2VBRVIsR0FBQSxDQUFJLGtDQUFKLEVBR1EsNENBSFI7SUFGUSxDQUFaO0lBa0JBLEVBQUEsQ0FBRyxZQUFILEVBQWdCLFNBQUE7UUFFWixHQUFBLENBQUksZ0JBQUosRUFBc0IsZ0JBQXRCO2VBQ0EsR0FBQSxDQUFJLHdCQUFKLEVBQThCLHlCQUE5QjtJQUhZLENBQWhCO0lBV0EsRUFBQSxDQUFHLFFBQUgsRUFBWSxTQUFBO1FBRVIsR0FBQSxDQUFJLFVBQUosRUFBNEIsV0FBNUI7UUFDQSxHQUFBLENBQUksZUFBSixFQUE0QixlQUE1QjtRQUVBLEdBQUEsQ0FBSSxjQUFKLEVBQTRCLGVBQTVCO1FBQ0EsR0FBQSxDQUFJLG1CQUFKLEVBQTRCLHFCQUE1QjtlQUNBLEdBQUEsQ0FBSSxxQkFBSixFQUE0Qix1QkFBNUI7SUFQUSxDQUFaO0lBZUEsRUFBQSxDQUFHLGNBQUgsRUFBa0IsU0FBQTtRQUVkLEdBQUEsQ0FBSSxRQUFKLEVBQXNCLG1CQUF0QjtRQUNBLEdBQUEsQ0FBSSxZQUFKLEVBQXNCLHVCQUF0QjtRQUNBLEdBQUEsQ0FBSSxjQUFKLEVBQXNCLHlCQUF0QjtRQUVBLEdBQUEsQ0FBSSxrQkFBSixFQUVRLHFDQUZSO2VBU0EsR0FBQSxDQUFJLGtCQUFKLEVBR1EscUNBSFI7SUFmYyxDQUFsQjtXQStCQSxFQUFBLENBQUcsU0FBSCxFQUFhLFNBQUEsR0FBQSxDQUFiO0FBbElZLENBQWhCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAgICAgICAwMCAgICAgMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgICAgICAgICAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAwMDBcbiAgIDAwMCAgICAgMDAwICAgICAgICAgICAgMDAwICAgICAwMDAgICAgICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwXG4gICAwMDAgICAgIDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwXG4jIyNcblxue2NtcH0gPSByZXF1aXJlICcuL3Rlc3RfdXRpbHMnXG5cbmRlc2NyaWJlICdtaXNjJyAtPlxuXG4gICAgaXQgJ3RoaXMnIC0+XG5cbiAgICAgICAgY21wICdAJyAgICAgICd0aGlzJ1xuICAgICAgICBjbXAgJ0BhJyAgICAgJ3RoaXMuYSdcbiAgICAgICAgY21wICdAYS5iJyAgICd0aGlzLmEuYidcbiAgICAgICAgY21wICdAYS5iKCknICd0aGlzLmEuYigpJ1xuICAgICAgICBjbXAgJ3QgPSBAJyAgJ3QgPSB0aGlzJ1xuICAgICAgICBcbiAgICAgICAgY21wIFwiYS5vbiAnYicsIEBjXCIsIFwiYS5vbignYicsdGhpcy5jKVwiIFxuICAgICAgICBjbXAgXCJhLm9uICdiJyBAY1wiLCBcImEub24oJ2InLHRoaXMuYylcIiBcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiBAXG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKHRoaXMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgQCB0aGVuIDFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGlmICh0aGlzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAwIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMFxuXG4gICAgaXQgJ3JlcXVpcmUnIC0+XG5cbiAgICAgICAgY21wIFwibm9vbiAgPSByZXF1aXJlICdub29uJ1wiICAgIFwibm9vbiA9IHJlcXVpcmUoJ25vb24nKVwiXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIHNsYXNoID0gcmVxdWlyZSAna3NsYXNoJ1xuICAgICAgICAgICAga3N0ciAgPSByZXF1aXJlICdrc3RyJ1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgc2xhc2ggPSByZXF1aXJlKCdrc2xhc2gnKVxuICAgICAgICAgICAga3N0ciA9IHJlcXVpcmUoJ2tzdHInKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwXG4gICAgIyAgICAwMDAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjICAgIDAwMCAgICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMFxuICAgICMgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDBcblxuICAgIGl0ICd0eXBlb2YnIC0+XG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgdHlwZW9mIHBhdCA9PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGlmICh0eXBlb2YocGF0KSA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMFxuICAgICMgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDBcblxuICAgIGl0ICdpbnN0YW5jZW9mJyAtPlxuXG4gICAgICAgIGNtcCAnYSBpbnN0YW5jZW9mIGInICAnYSBpbnN0YW5jZW9mIGInXG4gICAgICAgIGNtcCAnYSBpbnN0YW5jZW9mIGIgPT0gdHJ1ZScgICdhIGluc3RhbmNlb2YgYiA9PT0gdHJ1ZSdcblxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMFxuXG4gICAgaXQgJ2RlbGV0ZScgLT5cblxuICAgICAgICBjbXAgJ2RlbGV0ZSBhJyAgICAgICAgICAgICAgJ2RlbGV0ZShhKSdcbiAgICAgICAgY21wICdbZGVsZXRlIGEsIGJdJyAgICAgICAgICdbZGVsZXRlKGEpLGJdJ1xuXG4gICAgICAgIGNtcCAnZGVsZXRlIGEuYi5jJyAgICAgICAgICAnZGVsZXRlKGEuYi5jKSdcbiAgICAgICAgY21wICdbZGVsZXRlIGEuYiwgYTpiXScgICAgICdbZGVsZXRlKGEuYikse2E6Yn1dJ1xuICAgICAgICBjbXAgJ2RlbGV0ZSBhLmIgPT0gZmFsc2UnICAgJ2RlbGV0ZShhLmIpID09PSBmYWxzZSdcblxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAgMCAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuICAgICMgMDAwICAwMDAgIDAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgaXQgJ2luIGNvbmRpdGlvbicgLT5cblxuICAgICAgICBjbXAgXCJhIGluIGxcIiAgICAgICAgICBcImwuaW5kZXhPZihhKSA+PSAwXCJcbiAgICAgICAgY21wIFwiYSBpbiAneHl6J1wiICAgICAgXCIneHl6Jy5pbmRleE9mKGEpID49IDBcIlxuICAgICAgICBjbXAgXCJhIGluIFsxLDIsM11cIiAgICBcIlsxLDIsM10uaW5kZXhPZihhKSA+PSAwXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiBhIGluIGwgdGhlbiAxXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAobC5pbmRleE9mKGEpID49IDApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgYSBpbiBsXG4gICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKGwuaW5kZXhPZihhKSA+PSAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBpdCAnbnVsbGNtcCcgLT5cblxuICAgICAgICAjIGNtcCAoJ2EuYj8uYy5kPy5lID09IDInKSAgXCJcIlwiXG4gICAgICAgICAgICAjIChhLmIgIT0gbnVsbCA/IChhLmIuYy5kICE9IG51bGwgPyBhLmIuYy5kLmUgOiBudWxsKSA6IG51bGwpID09PSAyXG4gICAgICAgICAgICAjIFwiXCJcIlxuXG4gICAgICAgICMgaWYgKGZ1bmN0aW9uKHIpe3JldHVybiByICE9IG51bGwgPyBmdW5jdGlvbihyKXtyZXR1cm4gciAhPSBudWxsID8gKHIuZSkgOiBudWxsfShyLmMoKS5kKSA6IG51bGx9KGEoKS5iKSA9PT0gMikge1xuICAgICAgICAgICAgIyBjb25zb2xlLmxvZygnWUVTJyk7XG4gICAgICAgICMgfVxuICAgICAgICAjIGNvbnNvbGUubG9nKHIpXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwXG5cbiAgICAjIGl0ICdjb21tZW50cycgLT5cblxuICAgICAgICAjIGNtcCBcIlwiXCJcbiAgICAgICAgICAgICMgIyBhXG4gICAgICAgICAgICAjIFwiXCJcIlxuICAgICAgICAjICBcIlwiXCJcbiAgICAgICAgICAgICMgLy8gYVxuICAgICAgICAgICAgIyBcIlwiXCJcblxuICAgICAgICAjIGNtcCBcIlwiXCJcbiAgICAgICAgICAgICMgIyBhXG4gICAgICAgICAgICAjICMgYlxuICAgICAgICAgICAgIyBcIlwiXCJcbiAgICAgICAgIyAgXCJcIlwiXG4gICAgICAgICAgICAjIC8vIGFcbiAgICAgICAgICAgICMgLy8gYlxuICAgICAgICAgICAgIyBcIlwiXCJcblxuICAgICAgICAjIGNtcCBcIlwiXCJcbiAgICAgICAgICAgICMgIyBhXG4gICAgICAgICAgICAgICAgIyAjIGJcbiAgICAgICAgICAgICMgXCJcIlwiXG4gICAgICAgICMgIFwiXCJcIlxuICAgICAgICAgICAgIyAvLyBhXG4gICAgICAgICAgICAgICAgIyAvLyBiXG4gICAgICAgICAgICAjIFwiXCJcIlxuXG4gICAgICAgICMgY21wIFwiXCJcIlxuICAgICAgICAgICAgIyAxICMgYVxuICAgICAgICAgICAgIyAyICAgICMgYlxuICAgICAgICAgICAgIyBcIlwiXCJcbiAgICAgICAgIyAgXCJcIlwiXG4gICAgICAgICAgICAjIDFcbiAgICAgICAgICAgICAgIyAvLyBhXG4gICAgICAgICAgICAjIDJcbiAgICAgICAgICAgICAgICAgIyAvLyBiXG4gICAgICAgICAgICAjIFwiXCJcIlxuXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMFxuXG4gICAgIyBpdCAnc3RyaW5nIGludGVycG9sYXRpb24gYXMgb2JqZWN0IGtleXMnIC0+XG5cbiAgICAgICAgIyBjbXAgXCJcIlwiXG4gICAgICAgICAgICAjIGludGVycG9sPSdmYXJrJ1xuICAgICAgICAgICAgIyBsb2cgXFxcIlxcXCJcXFwiXG4gICAgICAgICAgICAjIGhlbGxvIFxcI3tpbnRlcnBvbH1cbiAgICAgICAgICAgICMgd29ybGRcbiAgICAgICAgICAgICMgXFxcIlxcXCJcXFwiOjVcbiAgICAgICAgIyBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICAjIHZhciBpbnRlcnBvbCwgb2JqXG4gICAgICAgICAgICAjIGludGVycG9sID0gJ2ZhcmsnXG4gICAgICAgICAgICAjIGNvbnNvbGUubG9nKChcbiAgICAgICAgICAgICAgICAjIG9iaiA9IHt9LFxuICAgICAgICAgICAgICAgICMgb2JqW1wiaGVsbG8gXCIgKyBpbnRlcnBvbCArIFwiXFxud29ybGRcIl0gPSA1LFxuICAgICAgICAgICAgICAgICMgb2JqXG4gICAgICAgICAgICAjICkpXG4gICAgICAgICMgXCJcIlwiXG5cbiJdfQ==
//# sourceURL=../coffee/test_misc.coffee