// koffee 1.20.0

/*
00000000  000   000  000   000   0000000
000       000   000  0000  000  000
000000    000   000  000 0 000  000
000       000   000  000  0000  000
000        0000000   000   000   0000000
 */
var cmp;

cmp = require('./utils').cmp;

describe('func', function() {
    it('func', function() {
        cmp('->', '(function ()\n{})');
        cmp('(a) ->', '(function (a)\n{})');
        cmp('(a,b,c) ->', '(function (a, b, c)\n{})');
        cmp('a = (a,b) ->', '\na = function (a, b)\n{}');
        cmp("-> return 1", "(function ()\n{\n    return 1\n})");
        cmp("->\n    1\n    2", "(function ()\n{\n    1\n    return 2\n})");
        cmp("->\n    return 1\n    2", "(function ()\n{\n    return 1\n    return 2\n})");
        cmp("->\n    1\n    return 2", "(function ()\n{\n    1\n    return 2\n})");
        cmp("a = (a,b,c) -> d", "\na = function (a, b, c)\n{\n    return d\n}");
        cmp("a.x = (y,z) -> q", "\na.x = function (y, z)\n{\n    return q\n}");
        cmp("a = ->\n    b = ->", "\na = function ()\n{\n    var b\n\n    return b = function ()\n    {}\n}");
        cmp("a = (b,c) ->\n    b = (e, f) -> g\n    b", "\na = function (b, c)\n{\n    var b\n\n    b = function (e, f)\n    {\n        return g\n    }\n    return b\n}");
        cmp("a = (b,c) ->\n    b = (e, f) -> h", "\na = function (b, c)\n{\n    var b\n\n    return b = function (e, f)\n    {\n        return h\n    }\n}");
        cmp("a = (b,c) ->\n    (e, f) -> j", "\na = function (b, c)\n{\n    return function (e, f)\n    {\n        return j\n    }\n}");
        cmp("f = ->\n    (a) -> 1", "\nf = function ()\n{\n    return function (a)\n    {\n        return 1\n    }\n}");
        cmp("a = ->\n    'a'\n1\n", "\na = function ()\n{\n    return 'a'\n}\n1");
        cmp("a = ->\n    log 'a'\n\nb = ->\n    log 'b'", "\na = function ()\n{\n    console.log('a')\n}\n\nb = function ()\n{\n    console.log('b')\n}");
        cmp("a = ( a, b=1 c=2 ) ->", "\na = function (a, b = 1, c = 2)\n{}");
        cmp("if 1 then return", "if (1)\n{\n    return\n}");
        cmp("if x then return\na", "if (x)\n{\n    return\n}\na");
        cmp("-> @a", "(function ()\n{\n    return this.a\n})");
        cmp("(@a) -> @a", "(function (a)\n{\n    this.a = a\n    return this.a\n})");
        return cmp("(@a,a) -> log @a", "(function (a1, a)\n{\n    this.a = a1\n    console.log(this.a)\n})");
    });
    it('return', function() {
        cmp("f = =>\n    if 2 then return", "\nf = function ()\n{\n    if (2)\n    {\n        return\n    }\n}");
        cmp("f = ->\n    if 3\n        log '42'", "\nf = function ()\n{\n    if (3)\n    {\n        console.log('42')\n    }\n}");
        cmp("f = ->\n    if 4\n        '42'", "\nf = function ()\n{\n    if (4)\n    {\n        return '42'\n    }\n}");
        cmp("->\n    if 1 then h\n    else if 2\n        if 3 then j else k\n    else l", "(function ()\n{\n    if (1)\n    {\n        return h\n    }\n    else if (2)\n    {\n        if (3)\n        {\n            return j\n        }\n        else\n        {\n            return k\n        }\n    }\n    else\n    {\n        return l\n    }\n})");
        return cmp("return 'Q' if t == 'W'", "if (t === 'W')\n{\n    return 'Q'\n}");
    });
    return it('calls', function() {
        cmp('a(b)', 'a(b)');
        cmp('a(b,c)', 'a(b,c)');
        cmp('a(1,null,"2")', 'a(1,null,"2")');
        cmp('a[1](b)', 'a[1](b)');
        cmp("f 'b', (a) ->", "f('b',function (a)\n{})");
        cmp("a('1' 2 3.4 true false null undefined NaN Infinity)", "a('1',2,3.4,true,false,null,undefined,NaN,Infinity)");
        cmp("a b:c[1], d:2", "a({b:c[1],d:2})");
        cmp("a b:c[2], d:3\n4", "a({b:c[2],d:3})\n4");
        cmp("a(\n    '1'\n    2\n    3.4\n    true\n    [\n        null\n        undefined\n    ]\n)", "a('1',2,3.4,true,[null,undefined])");
        cmp("a '1'\nb  2\nc  3.4\nd  true", "a('1')\nb(2)\nc(3.4)\nd(true)");
        cmp("a b 1\nc d 2", "a(b(1))\nc(d(2))");
        cmp("a\n    b\n        3\nc\n    d\n        4", "a(b(3))\nc(d(4))");
        cmp("a\n    b\n    1\nc\n    d\n    2", "a(b,1)\nc(d,2)");
        cmp("a 'b' -> c", "a('b',function ()\n{\n    return c\n})");
        cmp('l = pat.map ->', 'l = pat.map(function ()\n{})');
        cmp("((a) -> 1)", ";(function (a)\n{\n    return 1\n})");
        cmp("l = a (i) -> 0", "l = a(function (i)\n{\n    return 0\n})");
        cmp("l = timer ((i) -> 1)", "l = timer((function (i)\n{\n    return 1\n}))");
        cmp("l = timer ((i) -> i), y", "l = timer((function (i)\n{\n    return i\n}),y)");
        cmp("a.b c:2\nx = y", "a.b({c:2})\nx = y");
        cmp("a = (-> 1)()", "a = (function ()\n{\n    return 1\n})()");
        return cmp("a = (->\n    1)()", "a = (function ()\n{\n    return 1\n})()");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuYy5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi9jb2ZmZWUvdGVzdCIsInNvdXJjZXMiOlsiZnVuYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUMsTUFBTyxPQUFBLENBQVEsU0FBUjs7QUFFUixRQUFBLENBQVMsTUFBVCxFQUFnQixTQUFBO0lBRVosRUFBQSxDQUFHLE1BQUgsRUFBVSxTQUFBO1FBRU4sR0FBQSxDQUFJLElBQUosRUFBdUIsbUJBQXZCO1FBQ0EsR0FBQSxDQUFJLFFBQUosRUFBdUIsb0JBQXZCO1FBQ0EsR0FBQSxDQUFJLFlBQUosRUFBdUIsMEJBQXZCO1FBQ0EsR0FBQSxDQUFJLGNBQUosRUFBdUIsMkJBQXZCO1FBRUEsR0FBQSxDQUFJLGFBQUosRUFFUSxtQ0FGUjtRQVNBLEdBQUEsQ0FBSSxrQkFBSixFQUlRLDBDQUpSO1FBWUEsR0FBQSxDQUFJLHlCQUFKLEVBSVEsaURBSlI7UUFZQSxHQUFBLENBQUkseUJBQUosRUFJUSwwQ0FKUjtRQVlBLEdBQUEsQ0FBSSxrQkFBSixFQUVRLDhDQUZSO1FBVUEsR0FBQSxDQUFJLGtCQUFKLEVBRVEsNkNBRlI7UUFVQSxHQUFBLENBQUksb0JBQUosRUFHUSwwRUFIUjtRQWNBLEdBQUEsQ0FBSSwwQ0FBSixFQUlRLGlIQUpSO1FBa0JBLEdBQUEsQ0FBSSxtQ0FBSixFQUdRLDBHQUhSO1FBZ0JBLEdBQUEsQ0FBSSwrQkFBSixFQUdRLHlGQUhSO1FBY0EsR0FBQSxDQUFJLHNCQUFKLEVBR1Esa0ZBSFI7UUFjQSxHQUFBLENBQUksc0JBQUosRUFLUSw0Q0FMUjtRQWNBLEdBQUEsQ0FBSSw0Q0FBSixFQU1RLDhGQU5SO1FBbUJBLEdBQUEsQ0FBSSx1QkFBSixFQUE4QixzQ0FBOUI7UUFFQSxHQUFBLENBQUksa0JBQUosRUFFUSwwQkFGUjtRQVNBLEdBQUEsQ0FBSSxxQkFBSixFQUdRLDZCQUhSO1FBV0EsR0FBQSxDQUFJLE9BQUosRUFDSSx3Q0FESjtRQVFBLEdBQUEsQ0FBSSxZQUFKLEVBQ0kseURBREo7ZUFTQSxHQUFBLENBQUksa0JBQUosRUFDSSxvRUFESjtJQTVOTSxDQUFWO0lBMk9BLEVBQUEsQ0FBRyxRQUFILEVBQVksU0FBQTtRQUVSLEdBQUEsQ0FBSSw4QkFBSixFQUdRLG1FQUhSO1FBY0EsR0FBQSxDQUFJLG9DQUFKLEVBSVEsOEVBSlI7UUFlQSxHQUFBLENBQUksZ0NBQUosRUFJUSx3RUFKUjtRQWVBLEdBQUEsQ0FBSSw0RUFBSixFQU1RLGdRQU5SO2VBK0JBLEdBQUEsQ0FBSSx3QkFBSixFQUVRLHNDQUZSO0lBN0VRLENBQVo7V0E0RkEsRUFBQSxDQUFHLE9BQUgsRUFBVyxTQUFBO1FBRVAsR0FBQSxDQUFJLE1BQUosRUFBc0IsTUFBdEI7UUFDQSxHQUFBLENBQUksUUFBSixFQUFzQixRQUF0QjtRQUNBLEdBQUEsQ0FBSSxlQUFKLEVBQXNCLGVBQXRCO1FBQ0EsR0FBQSxDQUFJLFNBQUosRUFBc0IsU0FBdEI7UUFDQSxHQUFBLENBQUksZUFBSixFQUFzQix5QkFBdEI7UUFDQSxHQUFBLENBQUkscURBQUosRUFDSSxxREFESjtRQUdBLEdBQUEsQ0FBSSxlQUFKLEVBRVEsaUJBRlI7UUFNQSxHQUFBLENBQUksa0JBQUosRUFHUSxvQkFIUjtRQVFBLEdBQUEsQ0FBSSx5RkFBSixFQVdRLG9DQVhSO1FBZUEsR0FBQSxDQUFJLDhCQUFKLEVBS1EsK0JBTFI7UUFZQSxHQUFBLENBQUksY0FBSixFQUdRLGtCQUhSO1FBUUEsR0FBQSxDQUFJLDBDQUFKLEVBT1Esa0JBUFI7UUFZQSxHQUFBLENBQUksa0NBQUosRUFPUSxnQkFQUjtRQVlBLEdBQUEsQ0FBSSxZQUFKLEVBQ0ksd0NBREo7UUFRQSxHQUFBLENBQUksZ0JBQUosRUFBcUIsOEJBQXJCO1FBRUEsR0FBQSxDQUFJLFlBQUosRUFFUSxxQ0FGUjtRQVNBLEdBQUEsQ0FBSSxnQkFBSixFQUVRLHlDQUZSO1FBU0EsR0FBQSxDQUFJLHNCQUFKLEVBRVEsK0NBRlI7UUFTQSxHQUFBLENBQUkseUJBQUosRUFFUSxpREFGUjtRQVNBLEdBQUEsQ0FBSSxnQkFBSixFQUdRLG1CQUhSO1FBUUEsR0FBQSxDQUFJLGNBQUosRUFDSSx5Q0FESjtlQVFBLEdBQUEsQ0FBSSxtQkFBSixFQUdRLHlDQUhSO0lBakpPLENBQVg7QUF6VVksQ0FBaEIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwXG4wMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbjAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiMjI1xuXG57Y21wfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmRlc2NyaWJlICdmdW5jJyAtPlxuXG4gICAgaXQgJ2Z1bmMnIC0+XG5cbiAgICAgICAgY21wICctPicgICAgICAgICAgICAgICAnKGZ1bmN0aW9uICgpXFxue30pJ1xuICAgICAgICBjbXAgJyhhKSAtPicgICAgICAgICAgICcoZnVuY3Rpb24gKGEpXFxue30pJ1xuICAgICAgICBjbXAgJyhhLGIsYykgLT4nICAgICAgICcoZnVuY3Rpb24gKGEsIGIsIGMpXFxue30pJ1xuICAgICAgICBjbXAgJ2EgPSAoYSxiKSAtPicgICAgICdcXG5hID0gZnVuY3Rpb24gKGEsIGIpXFxue30nXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgLT4gcmV0dXJuIDFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgLT5cbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgKGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgLT5cbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICAtPlxuICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgKGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSA9IChhLGIsYykgLT4gZFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuXG4gICAgICAgICAgICBhID0gZnVuY3Rpb24gKGEsIGIsIGMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEueCA9ICh5LHopIC0+IHFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcblxuICAgICAgICAgICAgYS54ID0gZnVuY3Rpb24gKHksIHopXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAtPlxuICAgICAgICAgICAgICAgIGIgPSAtPlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuXG4gICAgICAgICAgICBhID0gZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgYlxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGIgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAgICAgIHt9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gKGIsYykgLT5cbiAgICAgICAgICAgICAgICBiID0gKGUsIGYpIC0+IGdcbiAgICAgICAgICAgICAgICBiXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG5cbiAgICAgICAgICAgIGEgPSBmdW5jdGlvbiAoYiwgYylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgYlxuXG4gICAgICAgICAgICAgICAgYiA9IGZ1bmN0aW9uIChlLCBmKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAoYixjKSAtPlxuICAgICAgICAgICAgICAgIGIgPSAoZSwgZikgLT4gaFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuXG4gICAgICAgICAgICBhID0gZnVuY3Rpb24gKGIsIGMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIGJcblxuICAgICAgICAgICAgICAgIHJldHVybiBiID0gZnVuY3Rpb24gKGUsIGYpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAoYixjKSAtPlxuICAgICAgICAgICAgICAgIChlLCBmKSAtPiBqXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG5cbiAgICAgICAgICAgIGEgPSBmdW5jdGlvbiAoYiwgYylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGUsIGYpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4galxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGYgPSAtPlxuICAgICAgICAgICAgICAgIChhKSAtPiAxXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG5cbiAgICAgICAgICAgIGYgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoYSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSA9IC0+XG4gICAgICAgICAgICAgICAgJ2EnXG4gICAgICAgICAgICAxXG5cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcblxuICAgICAgICAgICAgYSA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdhJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgMVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSA9IC0+XG4gICAgICAgICAgICAgICAgbG9nICdhJ1xuXG4gICAgICAgICAgICBiID0gLT5cbiAgICAgICAgICAgICAgICBsb2cgJ2InXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG5cbiAgICAgICAgICAgIGEgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhJylcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYiA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2InKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiYSA9ICggYSwgYj0xIGM9MiApIC0+XCIsICBcIlxcbmEgPSBmdW5jdGlvbiAoYSwgYiA9IDEsIGMgPSAyKVxcbnt9XCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiAxIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoMSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGlmIHggdGhlbiByZXR1cm5cbiAgICAgICAgICAgIGFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGlmICh4KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiLT4gQGFcIixcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgKGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIihAYSkgLT4gQGFcIixcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgKGZ1bmN0aW9uIChhKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMuYSA9IGFcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiKEBhLGEpIC0+IGxvZyBAYVwiLFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAoZnVuY3Rpb24gKGExLCBhKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMuYSA9IGExXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5hKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuXG4gICAgaXQgJ3JldHVybicgLT5cblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBmID0gPT5cbiAgICAgICAgICAgICAgICBpZiAyIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG5cbiAgICAgICAgICAgIGYgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICgyKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZiA9IC0+XG4gICAgICAgICAgICAgICAgaWYgM1xuICAgICAgICAgICAgICAgICAgICBsb2cgJzQyJ1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuXG4gICAgICAgICAgICBmID0gZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoMylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCc0MicpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZiA9IC0+XG4gICAgICAgICAgICAgICAgaWYgNFxuICAgICAgICAgICAgICAgICAgICAnNDInXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG5cbiAgICAgICAgICAgIGYgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICg0KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc0MidcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICAtPlxuICAgICAgICAgICAgICAgIGlmIDEgdGhlbiBoXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAyXG4gICAgICAgICAgICAgICAgICAgIGlmIDMgdGhlbiBqIGVsc2Uga1xuICAgICAgICAgICAgICAgIGVsc2UgbFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgKGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKDEpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICgyKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKDMpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBqXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ga1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIHJldHVybiAnUScgaWYgdCA9PSAnVydcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGlmICh0ID09PSAnVycpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdRJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwXG5cbiAgICBpdCAnY2FsbHMnIC0+XG5cbiAgICAgICAgY21wICdhKGIpJyAgICAgICAgICAgICdhKGIpJ1xuICAgICAgICBjbXAgJ2EoYixjKScgICAgICAgICAgJ2EoYixjKSdcbiAgICAgICAgY21wICdhKDEsbnVsbCxcIjJcIiknICAgJ2EoMSxudWxsLFwiMlwiKSdcbiAgICAgICAgY21wICdhWzFdKGIpJyAgICAgICAgICdhWzFdKGIpJ1xuICAgICAgICBjbXAgXCJmICdiJywgKGEpIC0+XCIgICBcImYoJ2InLGZ1bmN0aW9uIChhKVxcbnt9KVwiXG4gICAgICAgIGNtcCBcImEoJzEnIDIgMy40IHRydWUgZmFsc2UgbnVsbCB1bmRlZmluZWQgTmFOIEluZmluaXR5KVwiLFxuICAgICAgICAgICAgXCJhKCcxJywyLDMuNCx0cnVlLGZhbHNlLG51bGwsdW5kZWZpbmVkLE5hTixJbmZpbml0eSlcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgYjpjWzFdLCBkOjJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEoe2I6Y1sxXSxkOjJ9KVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSBiOmNbMl0sIGQ6M1xuICAgICAgICAgICAgNFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSh7YjpjWzJdLGQ6M30pXG4gICAgICAgICAgICA0XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhKFxuICAgICAgICAgICAgICAgICcxJ1xuICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgICAgICAzLjRcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEoJzEnLDIsMy40LHRydWUsW251bGwsdW5kZWZpbmVkXSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgJzEnXG4gICAgICAgICAgICBiICAyXG4gICAgICAgICAgICBjICAzLjRcbiAgICAgICAgICAgIGQgIHRydWVcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEoJzEnKVxuICAgICAgICAgICAgYigyKVxuICAgICAgICAgICAgYygzLjQpXG4gICAgICAgICAgICBkKHRydWUpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhIGIgMVxuICAgICAgICAgICAgYyBkIDJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEoYigxKSlcbiAgICAgICAgICAgIGMoZCgyKSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGFcbiAgICAgICAgICAgICAgICBiXG4gICAgICAgICAgICAgICAgICAgIDNcbiAgICAgICAgICAgIGNcbiAgICAgICAgICAgICAgICBkXG4gICAgICAgICAgICAgICAgICAgIDRcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEoYigzKSlcbiAgICAgICAgICAgIGMoZCg0KSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGFcbiAgICAgICAgICAgICAgICBiXG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgY1xuICAgICAgICAgICAgICAgIGRcbiAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhKGIsMSlcbiAgICAgICAgICAgIGMoZCwyKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiYSAnYicgLT4gY1wiLFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBhKCdiJyxmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBjXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wICdsID0gcGF0Lm1hcCAtPicgJ2wgPSBwYXQubWFwKGZ1bmN0aW9uICgpXFxue30pJ1xuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgICgoYSkgLT4gMSlcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIDsoZnVuY3Rpb24gKGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBsID0gYSAoaSkgLT4gMFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgbCA9IGEoZnVuY3Rpb24gKGkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBsID0gdGltZXIgKChpKSAtPiAxKVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgbCA9IHRpbWVyKChmdW5jdGlvbiAoaSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBsID0gdGltZXIgKChpKSAtPiBpKSwgeVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgbCA9IHRpbWVyKChmdW5jdGlvbiAoaSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaVxuICAgICAgICAgICAgfSkseSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEuYiBjOjJcbiAgICAgICAgICAgIHggPSB5XG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhLmIoe2M6Mn0pXG4gICAgICAgICAgICB4ID0geVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiYSA9ICgtPiAxKSgpXCIsXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAoZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgfSkoKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSA9ICgtPlxuICAgICAgICAgICAgICAgIDEpKClcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAoZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgfSkoKVxuICAgICAgICAgICAgXCJcIlwiXG4iXX0=
//# sourceURL=../../coffee/test/func.coffee