// koffee 1.20.0

/*
0000000     0000000    0000000  000   0000000   0000000  
000   000  000   000  000       000  000       000       
0000000    000000000  0000000   000  000       0000000   
000   000  000   000       000  000  000            000  
0000000    000   000  0000000   000   0000000  0000000
 */
var cmp;

cmp = require('./utils').cmp;

describe('basics', function() {
    it('literals', function() {
        cmp('', '');
        cmp(' ', '');
        cmp('a', 'a');
        cmp('1', '1');
        cmp('2.2', '2.2');
        cmp('""', '""');
        cmp("''", "''");
        cmp('[]', ';[]');
        cmp('()', ';()');
        cmp('{}', '{}');
        cmp('true', 'true');
        cmp('false', 'false');
        cmp('yes', 'true');
        cmp('no', 'false');
        cmp('Infinity', 'Infinity');
        cmp('NaN', 'NaN');
        cmp('null', 'null');
        return cmp('undefined', 'undefined');
    });
    it('prop', function() {
        cmp('a.a', 'a.a');
        cmp('{a:b}.a', '{a:b}.a');
        cmp('a.b.c d', 'a.b.c(d)');
        cmp('a.b.c[d]', 'a.b.c[d]');
        return cmp('[a.b*c[d]]', ';[a.b * c[d]]');
    });
    it('regex', function() {
        cmp('/a/', '/a/');
        cmp('/a|b/', '/a|b/');
        cmp('/(a|b)/', '/(a|b)/');
        cmp('/(a|b)/g', '/(a|b)/g');
        return cmp('/\\//gimsuy', '/\\//gimsuy');
    });
    it('op', function() {
        cmp('a == b', 'a === b');
        cmp('a != b', 'a !== b');
        cmp('a and b', 'a && b');
        cmp('1 and 2 and 3', '1 && 2 && 3');
        cmp('e and (f or g)', 'e && (f || g)');
        cmp('(e and f) or g', ';(e && f) || g');
        cmp("a and b or c", "a && b || c");
        cmp("d and\n    e or f and\n        g or h", "d && e || f && g || h");
        cmp("d and\ne or f and\ng or h", "d && e || f && g || h");
        cmp("a = d and\n    e or f and\n    g or h", "a = d && e || f && g || h");
        cmp("b = 1 <= a < c", "b = (1 <= a && a < c)");
        cmp("x = y > z >= 1", "x = (y > z && z >= 1)");
        cmp("a = b == c == d", "a = (b === c && c === d)");
        return cmp("a = b != c != d", "a = (b !== c && c !== d)");
    });
    it('not', function() {
        return cmp('not true', '!true');
    });
    it('assign', function() {
        cmp('a = b', 'a = b');
        cmp('a = b = c = 1', 'a = b = c = 1');
        cmp("module.exports = sthg\nlog 'ok'", "module.exports = sthg\nconsole.log('ok')");
        cmp("a = b = c = sthg == othr\nlog 'ok'", "a = b = c = sthg === othr\nconsole.log('ok')");
        cmp("d = a and\nb or\n    c", "d = a && b || c");
        cmp("d = a and\n    b or\n        c", "d = a && b || c");
        cmp("d = a and\n    b or\n    c", "d = a && b || c");
        return cmp("r = 1 + p = 2 + 3", "r = 1 + (p = 2 + 3)");
    });
    it('math', function() {
        cmp('a + b', 'a + b');
        cmp('a - b + c - 1', 'a - b + c - 1');
        cmp('-a+-b', '-a + -b');
        cmp('+a+-b', '+a + -b');
        cmp('a + -b', 'a + -b');
        cmp('a+ -b', 'a + -b');
        cmp('a + -(b-c)', 'a + -(b - c)');
        cmp('b --c', 'b(--c)');
        cmp('a + -b --c', 'a + -b(--c)');
        cmp('a -b', 'a(-b)');
        cmp('-a -b', '-a(-b)');
        cmp('-a +b', '-a(+b)');
        return cmp('+a -b', '+a(-b)');
    });
    return it('increment', function() {
        cmp('a++', 'a++');
        cmp('a--', 'a--');
        cmp('++a', '++a');
        cmp('--a', '--a');
        cmp('--a,++b', '--a\n++b');
        cmp('a[1]++', 'a[1]++');
        cmp('a[1]--', 'a[1]--');
        cmp('--a[1]', '--a[1]');
        cmp('++a[1]', '++a[1]');
        cmp('a.b.c++', 'a.b.c++');
        cmp('a.b.c--', 'a.b.c--');
        cmp('a(b).c++', 'a(b).c++');
        cmp('a(b).c--', 'a(b).c--');
        cmp('(--b)', ';(--b)');
        cmp('(++b)', ';(++b)');
        cmp('(b--)', ';(b--)');
        cmp('(b++)', ';(b++)');
        cmp('log(++b)', 'console.log(++b)');
        cmp('log(++{b:1}.b)', 'console.log(++{b:1}.b)');
        if (false) {
            cmp('--a++'(''));
            cmp('--a--'(''));
            cmp('++a++'(''));
            cmp('++a--'(''));
            cmp('++--'(''));
            cmp('++1'(''));
            cmp('1--'(''));
            return cmp('""++'(''));
        }
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzaWNzLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uL2NvZmZlZS90ZXN0Iiwic291cmNlcyI6WyJiYXNpY3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFDLE1BQU8sT0FBQSxDQUFRLFNBQVI7O0FBRVIsUUFBQSxDQUFTLFFBQVQsRUFBa0IsU0FBQTtJQVFkLEVBQUEsQ0FBRyxVQUFILEVBQWMsU0FBQTtRQUVWLEdBQUEsQ0FBSSxFQUFKLEVBQXNCLEVBQXRCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBc0IsRUFBdEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFzQixHQUF0QjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQXNCLEdBQXRCO1FBQ0EsR0FBQSxDQUFJLEtBQUosRUFBc0IsS0FBdEI7UUFDQSxHQUFBLENBQUksSUFBSixFQUFzQixJQUF0QjtRQUNBLEdBQUEsQ0FBSSxJQUFKLEVBQXNCLElBQXRCO1FBQ0EsR0FBQSxDQUFJLElBQUosRUFBc0IsS0FBdEI7UUFDQSxHQUFBLENBQUksSUFBSixFQUFzQixLQUF0QjtRQUNBLEdBQUEsQ0FBSSxJQUFKLEVBQXNCLElBQXRCO1FBQ0EsR0FBQSxDQUFJLE1BQUosRUFBc0IsTUFBdEI7UUFDQSxHQUFBLENBQUksT0FBSixFQUFzQixPQUF0QjtRQUNBLEdBQUEsQ0FBSSxLQUFKLEVBQXNCLE1BQXRCO1FBQ0EsR0FBQSxDQUFJLElBQUosRUFBc0IsT0FBdEI7UUFDQSxHQUFBLENBQUksVUFBSixFQUFzQixVQUF0QjtRQUNBLEdBQUEsQ0FBSSxLQUFKLEVBQXNCLEtBQXRCO1FBQ0EsR0FBQSxDQUFJLE1BQUosRUFBc0IsTUFBdEI7ZUFDQSxHQUFBLENBQUksV0FBSixFQUFzQixXQUF0QjtJQW5CVSxDQUFkO0lBMkJBLEVBQUEsQ0FBRyxNQUFILEVBQVUsU0FBQTtRQUVOLEdBQUEsQ0FBSSxLQUFKLEVBQXNCLEtBQXRCO1FBQ0EsR0FBQSxDQUFJLFNBQUosRUFB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QUFJLFNBQUosRUFBd0IsVUFBeEI7UUFFQSxHQUFBLENBQUksUUFBSixFQUF3QixRQUF4QjtRQUNBLEdBQUEsQ0FBSSxRQUFKLEVBQXdCLFFBQXhCO1FBQ0EsR0FBQSxDQUFJLFFBQUosRUFBd0IsUUFBeEI7UUFDQSxHQUFBLENBQUksUUFBSixFQUF3QixRQUF4QjtRQUVBLEdBQUEsQ0FBSSxTQUFKLEVBQXdCLFNBQXhCO1FBQ0EsR0FBQSxDQUFJLFNBQUosRUFBd0IsU0FBeEI7UUFFQSxHQUFBLENBQUksVUFBSixFQUF3QixVQUF4QjtRQUNBLEdBQUEsQ0FBSSxVQUFKLEVBQXdCLFVBQXhCO1FBRUEsR0FBQSxDQUFJLE9BQUosRUFBd0IsUUFBeEI7UUFDQSxHQUFBLENBQUksT0FBSixFQUF3QixRQUF4QjtRQUNBLEdBQUEsQ0FBSSxPQUFKLEVBQXdCLFFBQXhCO1FBQ0EsR0FBQSxDQUFJLE9BQUosRUFBd0IsUUFBeEI7UUFDQSxHQUFBLENBQUksVUFBSixFQUF3QixrQkFBeEI7UUFDQSxHQUFBLENBQUksZ0JBQUosRUFBd0Isd0JBQXhCO1FBRUEsSUFBRyxLQUFIO1lBQ0ksR0FBQSxDQUFLLE9BQUQsQ0FBcUIsRUFBckIsQ0FBSjtZQUNBLEdBQUEsQ0FBSyxPQUFELENBQXFCLEVBQXJCLENBQUo7WUFDQSxHQUFBLENBQUssT0FBRCxDQUFxQixFQUFyQixDQUFKO1lBQ0EsR0FBQSxDQUFLLE9BQUQsQ0FBcUIsRUFBckIsQ0FBSjtZQUNBLEdBQUEsQ0FBSyxNQUFELENBQXFCLEVBQXJCLENBQUo7WUFDQSxHQUFBLENBQUssS0FBRCxDQUFxQixFQUFyQixDQUFKO1lBQ0EsR0FBQSxDQUFLLEtBQUQsQ0FBcUIsRUFBckIsQ0FBSjttQkFDQSxHQUFBLENBQUssTUFBRCxDQUFxQixFQUFyQixDQUFKLEVBUko7O0lBMUJXLENBQWY7QUFoT2MsQ0FBbEIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwICAgXG4jIyNcblxue2NtcH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5kZXNjcmliZSAnYmFzaWNzJyAtPlxuXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMFxuXG4gICAgaXQgJ2xpdGVyYWxzJyAtPlxuXG4gICAgICAgIGNtcCAnJyAgICAgICAgICAgICAgICAnJ1xuICAgICAgICBjbXAgJyAnICAgICAgICAgICAgICAgJydcbiAgICAgICAgY21wICdhJyAgICAgICAgICAgICAgICdhJ1xuICAgICAgICBjbXAgJzEnICAgICAgICAgICAgICAgJzEnXG4gICAgICAgIGNtcCAnMi4yJyAgICAgICAgICAgICAnMi4yJ1xuICAgICAgICBjbXAgJ1wiXCInICAgICAgICAgICAgICAnXCJcIidcbiAgICAgICAgY21wIFwiJydcIiAgICAgICAgICAgICAgXCInJ1wiXG4gICAgICAgIGNtcCAnW10nICAgICAgICAgICAgICAnO1tdJ1xuICAgICAgICBjbXAgJygpJyAgICAgICAgICAgICAgJzsoKSdcbiAgICAgICAgY21wICd7fScgICAgICAgICAgICAgICd7fSdcbiAgICAgICAgY21wICd0cnVlJyAgICAgICAgICAgICd0cnVlJ1xuICAgICAgICBjbXAgJ2ZhbHNlJyAgICAgICAgICAgJ2ZhbHNlJ1xuICAgICAgICBjbXAgJ3llcycgICAgICAgICAgICAgJ3RydWUnXG4gICAgICAgIGNtcCAnbm8nICAgICAgICAgICAgICAnZmFsc2UnXG4gICAgICAgIGNtcCAnSW5maW5pdHknICAgICAgICAnSW5maW5pdHknXG4gICAgICAgIGNtcCAnTmFOJyAgICAgICAgICAgICAnTmFOJ1xuICAgICAgICBjbXAgJ251bGwnICAgICAgICAgICAgJ251bGwnXG4gICAgICAgIGNtcCAndW5kZWZpbmVkJyAgICAgICAndW5kZWZpbmVkJ1xuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcblxuICAgIGl0ICdwcm9wJyAtPlxuXG4gICAgICAgIGNtcCAnYS5hJyAgICAgICAgICAgICAnYS5hJ1xuICAgICAgICBjbXAgJ3thOmJ9LmEnICAgICAgICAgJ3thOmJ9LmEnXG4gICAgICAgIGNtcCAnYS5iLmMgZCcgICAgICAgICAnYS5iLmMoZCknXG4gICAgICAgIGNtcCAnYS5iLmNbZF0nICAgICAgICAnYS5iLmNbZF0nXG4gICAgICAgIGNtcCAnW2EuYipjW2RdXScgICAgICAnO1thLmIgKiBjW2RdXSdcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgaXQgJ3JlZ2V4JyAtPlxuXG4gICAgICAgIGNtcCAnL2EvJyAgICAgICAgICAgICAnL2EvJ1xuICAgICAgICBjbXAgJy9hfGIvJyAgICAgICAgICAgJy9hfGIvJ1xuICAgICAgICBjbXAgJy8oYXxiKS8nICAgICAgICAgJy8oYXxiKS8nXG4gICAgICAgIGNtcCAnLyhhfGIpL2cnICAgICAgICAnLyhhfGIpL2cnXG4gICAgICAgIGNtcCAnL1xcXFwvL2dpbXN1eScgICAgICcvXFxcXC8vZ2ltc3V5J1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwXG5cbiAgICBpdCAnb3AnIC0+XG5cbiAgICAgICAgY21wICdhID09IGInICAgICAgICAgICdhID09PSBiJ1xuICAgICAgICBjbXAgJ2EgIT0gYicgICAgICAgICAgJ2EgIT09IGInXG5cbiAgICAgICAgY21wICdhIGFuZCBiJyAgICAgICAgICdhICYmIGInXG4gICAgICAgIGNtcCAnMSBhbmQgMiBhbmQgMycgICAnMSAmJiAyICYmIDMnXG4gICAgICAgIGNtcCAnZSBhbmQgKGYgb3IgZyknICAnZSAmJiAoZiB8fCBnKSdcbiAgICAgICAgY21wICcoZSBhbmQgZikgb3IgZycgICc7KGUgJiYgZikgfHwgZydcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhIGFuZCBcXFxuICAgICAgICAgICAgYiBvciBcXFxuICAgICAgICAgICAgY1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSAmJiBiIHx8IGNcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGQgYW5kXG4gICAgICAgICAgICAgICAgZSBvciBmIGFuZFxuICAgICAgICAgICAgICAgICAgICBnIG9yIGhcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGQgJiYgZSB8fCBmICYmIGcgfHwgaFxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZCBhbmRcbiAgICAgICAgICAgIGUgb3IgZiBhbmRcbiAgICAgICAgICAgIGcgb3IgaFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgZCAmJiBlIHx8IGYgJiYgZyB8fCBoXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gZCBhbmRcbiAgICAgICAgICAgICAgICBlIG9yIGYgYW5kXG4gICAgICAgICAgICAgICAgZyBvciBoXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhID0gZCAmJiBlIHx8IGYgJiYgZyB8fCBoXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBiID0gMSA8PSBhIDwgY1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYiA9ICgxIDw9IGEgJiYgYSA8IGMpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICB4ID0geSA+IHogPj0gMVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgeCA9ICh5ID4geiAmJiB6ID49IDEpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gYiA9PSBjID09IGRcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAoYiA9PT0gYyAmJiBjID09PSBkKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSA9IGIgIT0gYyAhPSBkXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhID0gKGIgIT09IGMgJiYgYyAhPT0gZClcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgIFxuICAgIGl0ICdub3QnIC0+XG4gICAgICAgIFxuICAgICAgICBjbXAgJ25vdCB0cnVlJyAnIXRydWUnXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgaXQgJ2Fzc2lnbicgLT5cblxuICAgICAgICBjbXAgJ2EgPSBiJyAgICAgICAgICAgICdhID0gYidcbiAgICAgICAgY21wICdhID0gYiA9IGMgPSAxJyAgICAnYSA9IGIgPSBjID0gMSdcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IHN0aGdcbiAgICAgICAgICAgIGxvZyAnb2snXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IHN0aGdcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvaycpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gYiA9IGMgPSBzdGhnID09IG90aHJcbiAgICAgICAgICAgIGxvZyAnb2snXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhID0gYiA9IGMgPSBzdGhnID09PSBvdGhyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnb2snKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZCA9IGEgYW5kXG4gICAgICAgICAgICBiIG9yXG4gICAgICAgICAgICAgICAgY1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgZCA9IGEgJiYgYiB8fCBjXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBkID0gYSBhbmRcbiAgICAgICAgICAgICAgICBiIG9yXG4gICAgICAgICAgICAgICAgICAgIGNcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGQgPSBhICYmIGIgfHwgY1xuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZCA9IGEgYW5kXG4gICAgICAgICAgICAgICAgYiBvclxuICAgICAgICAgICAgICAgIGNcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGQgPSBhICYmIGIgfHwgY1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgciA9IDEgKyBwID0gMiArIDNcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHIgPSAxICsgKHAgPSAyICsgMylcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuXG4gICAgaXQgJ21hdGgnIC0+XG5cbiAgICAgICAgY21wICdhICsgYicgICAgICAgICAgICAgJ2EgKyBiJ1xuICAgICAgICBjbXAgJ2EgLSBiICsgYyAtIDEnICAgICAnYSAtIGIgKyBjIC0gMSdcbiAgICAgICAgY21wICctYSstYicgICAgICAgICAgICAgJy1hICsgLWInXG4gICAgICAgIGNtcCAnK2ErLWInICAgICAgICAgICAgICcrYSArIC1iJ1xuICAgICAgICBjbXAgJ2EgKyAtYicgICAgICAgICAgICAnYSArIC1iJ1xuICAgICAgICBjbXAgJ2ErIC1iJyAgICAgICAgICAgICAnYSArIC1iJ1xuICAgICAgICBjbXAgJ2EgKyAtKGItYyknICAgICAgICAnYSArIC0oYiAtIGMpJ1xuICAgICAgICBjbXAgJ2IgLS1jJyAgICAgICAgICAgICAnYigtLWMpJ1xuICAgICAgICBjbXAgJ2EgKyAtYiAtLWMnICAgICAgICAnYSArIC1iKC0tYyknXG4gICAgICAgIGNtcCAnYSAtYicgICAgICAgICAgICAgICdhKC1iKSdcbiAgICAgICAgY21wICctYSAtYicgICAgICAgICAgICAgJy1hKC1iKSdcbiAgICAgICAgY21wICctYSArYicgICAgICAgICAgICAgJy1hKCtiKSdcbiAgICAgICAgY21wICcrYSAtYicgICAgICAgICAgICAgJythKC1iKSdcblxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG4gICAgaXQgJ2luY3JlbWVudCcgLT5cblxuICAgICAgICBjbXAgJ2ErKycgICAgICAgICAgICAgICAnYSsrJ1xuICAgICAgICBjbXAgJ2EtLScgICAgICAgICAgICAgICAnYS0tJ1xuICAgICAgICBjbXAgJysrYScgICAgICAgICAgICAgICAnKythJ1xuICAgICAgICBjbXAgJy0tYScgICAgICAgICAgICAgICAnLS1hJ1xuICAgICAgICBjbXAgJy0tYSwrK2InICAgICAgICAgICAnLS1hXFxuKytiJ1xuXG4gICAgICAgIGNtcCAnYVsxXSsrJyAgICAgICAgICAgICdhWzFdKysnXG4gICAgICAgIGNtcCAnYVsxXS0tJyAgICAgICAgICAgICdhWzFdLS0nXG4gICAgICAgIGNtcCAnLS1hWzFdJyAgICAgICAgICAgICctLWFbMV0nXG4gICAgICAgIGNtcCAnKythWzFdJyAgICAgICAgICAgICcrK2FbMV0nXG5cbiAgICAgICAgY21wICdhLmIuYysrJyAgICAgICAgICAgJ2EuYi5jKysnXG4gICAgICAgIGNtcCAnYS5iLmMtLScgICAgICAgICAgICdhLmIuYy0tJ1xuXG4gICAgICAgIGNtcCAnYShiKS5jKysnICAgICAgICAgICdhKGIpLmMrKydcbiAgICAgICAgY21wICdhKGIpLmMtLScgICAgICAgICAgJ2EoYikuYy0tJ1xuXG4gICAgICAgIGNtcCAnKC0tYiknICAgICAgICAgICAgICc7KC0tYiknXG4gICAgICAgIGNtcCAnKCsrYiknICAgICAgICAgICAgICc7KCsrYiknXG4gICAgICAgIGNtcCAnKGItLSknICAgICAgICAgICAgICc7KGItLSknXG4gICAgICAgIGNtcCAnKGIrKyknICAgICAgICAgICAgICc7KGIrKyknXG4gICAgICAgIGNtcCAnbG9nKCsrYiknICAgICAgICAgICdjb25zb2xlLmxvZygrK2IpJ1xuICAgICAgICBjbXAgJ2xvZygrK3tiOjF9LmIpJyAgICAnY29uc29sZS5sb2coKyt7YjoxfS5iKSdcblxuICAgICAgICBpZiBmYWxzZVxuICAgICAgICAgICAgY21wICgnLS1hKysnKSAgICAgICAgICAgICcnXG4gICAgICAgICAgICBjbXAgKCctLWEtLScpICAgICAgICAgICAgJydcbiAgICAgICAgICAgIGNtcCAoJysrYSsrJykgICAgICAgICAgICAnJ1xuICAgICAgICAgICAgY21wICgnKythLS0nKSAgICAgICAgICAgICcnXG4gICAgICAgICAgICBjbXAgKCcrKy0tJykgICAgICAgICAgICAgJydcbiAgICAgICAgICAgIGNtcCAoJysrMScpICAgICAgICAgICAgICAnJ1xuICAgICAgICAgICAgY21wICgnMS0tJykgICAgICAgICAgICAgICcnXG4gICAgICAgICAgICBjbXAgKCdcIlwiKysnKSAgICAgICAgICAgICAnJ1xuICAgICAgICAgICAgIl19
//# sourceURL=../../coffee/test/basics.coffee