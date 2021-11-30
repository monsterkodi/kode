// koffee 1.14.0

/*
00     00  000   0000000   0000000
000   000  000  000       000
000000000  000  0000000   000
000 0 000  000       000  000
000   000  000  0000000    0000000
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
    return it('in condition', function() {
        cmp("a in l", "l.indexOf(a) >= 0");
        cmp("a in 'xyz'", "'xyz'.indexOf(a) >= 0");
        cmp("a in [1,2,3]", "[1,2,3].indexOf(a) >= 0");
        cmp("a not in b", "!b.indexOf(a) >= 0");
        cmp("a not in [3,4]", "![3,4].indexOf(a) >= 0");
        cmp("if a in l then 1", "if (l.indexOf(a) >= 0)\n{\n    1\n}");
        cmp("if not a in l then 2", "if (!l.indexOf(a) >= 0)\n{\n    2\n}");
        return cmp("if a in l\n    2", "if (l.indexOf(a) >= 0)\n{\n    2\n}");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9taXNjLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsidGVzdF9taXNjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQyxNQUFPLE9BQUEsQ0FBUSxjQUFSOztBQUVSLFFBQUEsQ0FBUyxNQUFULEVBQWdCLFNBQUE7SUFFWixFQUFBLENBQUcsTUFBSCxFQUFVLFNBQUE7UUFFTixHQUFBLENBQUksR0FBSixFQUFhLE1BQWI7UUFDQSxHQUFBLENBQUksSUFBSixFQUFhLFFBQWI7UUFDQSxHQUFBLENBQUksTUFBSixFQUFhLFVBQWI7UUFDQSxHQUFBLENBQUksUUFBSixFQUFhLFlBQWI7UUFDQSxHQUFBLENBQUksT0FBSixFQUFhLFVBQWI7UUFFQSxHQUFBLENBQUksY0FBSixFQUFvQixrQkFBcEI7UUFDQSxHQUFBLENBQUksYUFBSixFQUFtQixrQkFBbkI7UUFFQSxHQUFBLENBQUksYUFBSixFQUdRLHdCQUhSO2VBVUEsR0FBQSxDQUFJLGFBQUosRUFFUSx3QkFGUjtJQXJCTSxDQUFWO0lBb0NBLEVBQUEsQ0FBRyxTQUFILEVBQWEsU0FBQTtRQUVULEdBQUEsQ0FBSSx3QkFBSixFQUFnQyx3QkFBaEM7ZUFDQSxHQUFBLENBQUksa0RBQUosRUFHUSxtREFIUjtJQUhTLENBQWI7SUFpQkEsRUFBQSxDQUFHLFFBQUgsRUFBWSxTQUFBO2VBRVIsR0FBQSxDQUFJLGtDQUFKLEVBR1EsNENBSFI7SUFGUSxDQUFaO0lBa0JBLEVBQUEsQ0FBRyxZQUFILEVBQWdCLFNBQUE7UUFFWixHQUFBLENBQUksZ0JBQUosRUFBc0IsZ0JBQXRCO2VBQ0EsR0FBQSxDQUFJLHdCQUFKLEVBQThCLHlCQUE5QjtJQUhZLENBQWhCO0lBV0EsRUFBQSxDQUFHLFFBQUgsRUFBWSxTQUFBO1FBRVIsR0FBQSxDQUFJLFVBQUosRUFBNEIsV0FBNUI7UUFDQSxHQUFBLENBQUksZUFBSixFQUE0QixlQUE1QjtRQUVBLEdBQUEsQ0FBSSxjQUFKLEVBQTRCLGVBQTVCO1FBQ0EsR0FBQSxDQUFJLG1CQUFKLEVBQTRCLHFCQUE1QjtlQUNBLEdBQUEsQ0FBSSxxQkFBSixFQUE0Qix1QkFBNUI7SUFQUSxDQUFaO1dBZUEsRUFBQSxDQUFHLGNBQUgsRUFBa0IsU0FBQTtRQUVkLEdBQUEsQ0FBSSxRQUFKLEVBQXNCLG1CQUF0QjtRQUNBLEdBQUEsQ0FBSSxZQUFKLEVBQXNCLHVCQUF0QjtRQUNBLEdBQUEsQ0FBSSxjQUFKLEVBQXNCLHlCQUF0QjtRQUNBLEdBQUEsQ0FBSSxZQUFKLEVBQXNCLG9CQUF0QjtRQUNBLEdBQUEsQ0FBSSxnQkFBSixFQUFzQix3QkFBdEI7UUFFQSxHQUFBLENBQUksa0JBQUosRUFFUSxxQ0FGUjtRQVNBLEdBQUEsQ0FBSSxzQkFBSixFQUVRLHNDQUZSO2VBU0EsR0FBQSxDQUFJLGtCQUFKLEVBR1EscUNBSFI7SUExQmMsQ0FBbEI7QUFuR1ksQ0FBaEIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwICAgICAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwXG4wMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMFxuMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDBcbjAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDBcbiMjI1xuXG57Y21wfSA9IHJlcXVpcmUgJy4vdGVzdF91dGlscydcblxuZGVzY3JpYmUgJ21pc2MnIC0+XG5cbiAgICBpdCAndGhpcycgLT5cblxuICAgICAgICBjbXAgJ0AnICAgICAgJ3RoaXMnXG4gICAgICAgIGNtcCAnQGEnICAgICAndGhpcy5hJ1xuICAgICAgICBjbXAgJ0BhLmInICAgJ3RoaXMuYS5iJ1xuICAgICAgICBjbXAgJ0BhLmIoKScgJ3RoaXMuYS5iKCknXG4gICAgICAgIGNtcCAndCA9IEAnICAndCA9IHRoaXMnXG4gICAgICAgIFxuICAgICAgICBjbXAgXCJhLm9uICdiJywgQGNcIiwgXCJhLm9uKCdiJyx0aGlzLmMpXCIgXG4gICAgICAgIGNtcCBcImEub24gJ2InIEBjXCIsIFwiYS5vbignYicsdGhpcy5jKVwiIFxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGlmIEBcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAodGhpcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiBAIHRoZW4gMVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKHRoaXMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG5cbiAgICBpdCAncmVxdWlyZScgLT5cblxuICAgICAgICBjbXAgXCJub29uICA9IHJlcXVpcmUgJ25vb24nXCIgICAgXCJub29uID0gcmVxdWlyZSgnbm9vbicpXCJcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgc2xhc2ggPSByZXF1aXJlICdrc2xhc2gnXG4gICAgICAgICAgICBrc3RyICA9IHJlcXVpcmUgJ2tzdHInXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBzbGFzaCA9IHJlcXVpcmUoJ2tzbGFzaCcpXG4gICAgICAgICAgICBrc3RyID0gcmVxdWlyZSgna3N0cicpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiAgICAjICAgIDAwMCAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgICAgMDAwICAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwXG4gICAgIyAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMFxuXG4gICAgaXQgJ3R5cGVvZicgLT5cblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiB0eXBlb2YgcGF0ID09ICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKHR5cGVvZihwYXQpID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMFxuXG4gICAgaXQgJ2luc3RhbmNlb2YnIC0+XG5cbiAgICAgICAgY21wICdhIGluc3RhbmNlb2YgYicgICdhIGluc3RhbmNlb2YgYidcbiAgICAgICAgY21wICdhIGluc3RhbmNlb2YgYiA9PSB0cnVlJyAgJ2EgaW5zdGFuY2VvZiBiID09PSB0cnVlJ1xuXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwXG5cbiAgICBpdCAnZGVsZXRlJyAtPlxuXG4gICAgICAgIGNtcCAnZGVsZXRlIGEnICAgICAgICAgICAgICAnZGVsZXRlKGEpJ1xuICAgICAgICBjbXAgJ1tkZWxldGUgYSwgYl0nICAgICAgICAgJ1tkZWxldGUoYSksYl0nXG5cbiAgICAgICAgY21wICdkZWxldGUgYS5iLmMnICAgICAgICAgICdkZWxldGUoYS5iLmMpJ1xuICAgICAgICBjbXAgJ1tkZWxldGUgYS5iLCBhOmJdJyAgICAgJ1tkZWxldGUoYS5iKSx7YTpifV0nXG4gICAgICAgIGNtcCAnZGVsZXRlIGEuYiA9PSBmYWxzZScgICAnZGVsZXRlKGEuYikgPT09IGZhbHNlJ1xuXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBpdCAnaW4gY29uZGl0aW9uJyAtPlxuXG4gICAgICAgIGNtcCBcImEgaW4gbFwiICAgICAgICAgIFwibC5pbmRleE9mKGEpID49IDBcIlxuICAgICAgICBjbXAgXCJhIGluICd4eXonXCIgICAgICBcIid4eXonLmluZGV4T2YoYSkgPj0gMFwiXG4gICAgICAgIGNtcCBcImEgaW4gWzEsMiwzXVwiICAgIFwiWzEsMiwzXS5pbmRleE9mKGEpID49IDBcIlxuICAgICAgICBjbXAgXCJhIG5vdCBpbiBiXCIgICAgICBcIiFiLmluZGV4T2YoYSkgPj0gMFwiXG4gICAgICAgIGNtcCBcImEgbm90IGluIFszLDRdXCIgIFwiIVszLDRdLmluZGV4T2YoYSkgPj0gMFwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgYSBpbiBsIHRoZW4gMVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKGwuaW5kZXhPZihhKSA+PSAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGlmIG5vdCBhIGluIGwgdGhlbiAyXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoIWwuaW5kZXhPZihhKSA+PSAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGlmIGEgaW4gbFxuICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGlmIChsLmluZGV4T2YoYSkgPj0gMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAjIGNtcCBcImEgPSAoIGE6MSBiOjIgKSAtPlwiLCAgICAgXCJhID0gZnVuY3Rpb24oYXJnKVwiXG4gICAgICAgICMgY21wIFwiXCJcIlxuICAgICAgICAgICAgIyBzd2l0Y2ggYVxuICAgICAgICAgICAgICAgICMgd2hlbiAxIDIgMyB0aGVuXG4gICAgICAgICAgICAgICAgIyB3aGVuICdhJyAnYicgJ2MnIHRoZW5cbiAgICAgICAgICAgICMgXCJcIlwiLFwiXCJcIlxuICAgICAgICAgICAgIyBzd2l0Y2ggKGEpXG4gICAgICAgICAgICAjIHtcbiAgICAgICAgICAgICAgICAjIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAjIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAjIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgIyBicmVhaztcbiAgICAgICAgICAgICAgICAjIGNhc2UgJ2EnOlxuICAgICAgICAgICAgICAgICMgY2FzZSAnYic6XG4gICAgICAgICAgICAgICAgIyBjYXNlICdjJzpcbiAgICAgICAgICAgICMgfVwiXCJcIlxuICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICAjIGl0ICdudWxsY21wJyAtPlxuXG4gICAgICAgICMgY21wICgnYS5iPy5jLmQ/LmUgPT0gMicpICBcIlwiXCJcbiAgICAgICAgICAgICMgKGEuYiAhPSBudWxsID8gKGEuYi5jLmQgIT0gbnVsbCA/IGEuYi5jLmQuZSA6IG51bGwpIDogbnVsbCkgPT09IDJcbiAgICAgICAgICAgICMgXCJcIlwiXG5cbiAgICAgICAgIyBpZiAoZnVuY3Rpb24ocil7cmV0dXJuIHIgIT0gbnVsbCA/IGZ1bmN0aW9uKHIpe3JldHVybiByICE9IG51bGwgPyAoci5lKSA6IG51bGx9KHIuYygpLmQpIDogbnVsbH0oYSgpLmIpID09PSAyKSB7XG4gICAgICAgICAgICAjIGNvbnNvbGUubG9nKCdZRVMnKTtcbiAgICAgICAgIyB9XG4gICAgICAgICMgY29uc29sZS5sb2cocilcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDBcblxuICAgICMgaXQgJ2NvbW1lbnRzJyAtPlxuXG4gICAgICAgICMgY21wIFwiXCJcIlxuICAgICAgICAgICAgIyAjIGFcbiAgICAgICAgICAgICMgXCJcIlwiXG4gICAgICAgICMgIFwiXCJcIlxuICAgICAgICAgICAgIyAvLyBhXG4gICAgICAgICAgICAjIFwiXCJcIlxuXG4gICAgICAgICMgY21wIFwiXCJcIlxuICAgICAgICAgICAgIyAjIGFcbiAgICAgICAgICAgICMgIyBiXG4gICAgICAgICAgICAjIFwiXCJcIlxuICAgICAgICAjICBcIlwiXCJcbiAgICAgICAgICAgICMgLy8gYVxuICAgICAgICAgICAgIyAvLyBiXG4gICAgICAgICAgICAjIFwiXCJcIlxuXG4gICAgICAgICMgY21wIFwiXCJcIlxuICAgICAgICAgICAgIyAjIGFcbiAgICAgICAgICAgICAgICAjICMgYlxuICAgICAgICAgICAgIyBcIlwiXCJcbiAgICAgICAgIyAgXCJcIlwiXG4gICAgICAgICAgICAjIC8vIGFcbiAgICAgICAgICAgICAgICAjIC8vIGJcbiAgICAgICAgICAgICMgXCJcIlwiXG5cbiAgICAgICAgIyBjbXAgXCJcIlwiXG4gICAgICAgICAgICAjIDEgIyBhXG4gICAgICAgICAgICAjIDIgICAgIyBiXG4gICAgICAgICAgICAjIFwiXCJcIlxuICAgICAgICAjICBcIlwiXCJcbiAgICAgICAgICAgICMgMVxuICAgICAgICAgICAgICAjIC8vIGFcbiAgICAgICAgICAgICMgMlxuICAgICAgICAgICAgICAgICAjIC8vIGJcbiAgICAgICAgICAgICMgXCJcIlwiXG5cbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbiAgICAjIGl0ICdzdHJpbmcgaW50ZXJwb2xhdGlvbiBhcyBvYmplY3Qga2V5cycgLT5cblxuICAgICAgICAjIGNtcCBcIlwiXCJcbiAgICAgICAgICAgICMgaW50ZXJwb2w9J2ZhcmsnXG4gICAgICAgICAgICAjIGxvZyBcXFwiXFxcIlxcXCJcbiAgICAgICAgICAgICMgaGVsbG8gXFwje2ludGVycG9sfVxuICAgICAgICAgICAgIyB3b3JsZFxuICAgICAgICAgICAgIyBcXFwiXFxcIlxcXCI6NVxuICAgICAgICAjIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgICMgdmFyIGludGVycG9sLCBvYmpcbiAgICAgICAgICAgICMgaW50ZXJwb2wgPSAnZmFyaydcbiAgICAgICAgICAgICMgY29uc29sZS5sb2coKFxuICAgICAgICAgICAgICAgICMgb2JqID0ge30sXG4gICAgICAgICAgICAgICAgIyBvYmpbXCJoZWxsbyBcIiArIGludGVycG9sICsgXCJcXG53b3JsZFwiXSA9IDUsXG4gICAgICAgICAgICAgICAgIyBvYmpcbiAgICAgICAgICAgICMgKSlcbiAgICAgICAgIyBcIlwiXCJcblxuXG4gICAgICAgICMgY21wICdsb2cgXCIje2ErMX1cIiwgXCIje2F9XCInLCAgICdjb25zb2xlLmxvZyhcIlwiICsgKGEgKyAxKSwgXCJcIiArIGEpJ1xuICAgICAgICAjIGNtcCAnbG9nIFwiI3thKzF9XCIgXCIje2F9XCInLCAgICAnY29uc29sZS5sb2coXCJcIiArIChhICsgMSksIFwiXCIgKyBhKSdcbiAgICAgICAgICAgICJdfQ==
//# sourceURL=../coffee/test_misc.coffee