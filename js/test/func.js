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
        cmp("f = ->\n    if 232 then return", "\nf = function ()\n{\n    if (232)\n    {\n        return\n    }\n}");
        cmp("f = ->\n    if 3\n        log '42'", "\nf = function ()\n{\n    if (3)\n    {\n        console.log('42')\n    }\n}");
        cmp("f = ->\n    if 4\n        '42'", "\nf = function ()\n{\n    if (4)\n    {\n        return '42'\n    }\n}");
        cmp("->\n    if 1 then h\n    else if 2\n        if 3 then j else k\n    else l", "(function ()\n{\n    if (1)\n    {\n        return h\n    }\n    else if (2)\n    {\n        if (3)\n        {\n            return j\n        }\n        else\n        {\n            return k\n        }\n    }\n    else\n    {\n        return l\n    }\n})");
        cmp("return 'Q' if t == 'W'", "if (t === 'W')\n{\n    return 'Q'\n}");
        cmp("return if not XXX", "if (!XXX)\n{\n    return\n}");
        return cmp("f = ->\n    try\n        'return me!'\n    catch e\n        error e", "\nf = function ()\n{\n    try\n    {\n        return 'return me!'\n    }\n    catch (e)\n    {\n        console.error(e)\n    }\n}");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuYy5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi9jb2ZmZWUvdGVzdCIsInNvdXJjZXMiOlsiZnVuYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUMsTUFBTyxPQUFBLENBQVEsU0FBUjs7QUFFUixRQUFBLENBQVMsTUFBVCxFQUFnQixTQUFBO0lBRVosRUFBQSxDQUFHLE1BQUgsRUFBVSxTQUFBO1FBRU4sR0FBQSxDQUFJLElBQUosRUFBdUIsbUJBQXZCO1FBQ0EsR0FBQSxDQUFJLFFBQUosRUFBdUIsb0JBQXZCO1FBQ0EsR0FBQSxDQUFJLFlBQUosRUFBdUIsMEJBQXZCO1FBQ0EsR0FBQSxDQUFJLGNBQUosRUFBdUIsMkJBQXZCO1FBRUEsR0FBQSxDQUFJLGFBQUosRUFFUSxtQ0FGUjtRQVNBLEdBQUEsQ0FBSSxrQkFBSixFQUlRLDBDQUpSO1FBWUEsR0FBQSxDQUFJLHlCQUFKLEVBSVEsaURBSlI7UUFZQSxHQUFBLENBQUkseUJBQUosRUFJUSwwQ0FKUjtRQVlBLEdBQUEsQ0FBSSxrQkFBSixFQUVRLDhDQUZSO1FBVUEsR0FBQSxDQUFJLGtCQUFKLEVBRVEsNkNBRlI7UUFVQSxHQUFBLENBQUksb0JBQUosRUFHUSwwRUFIUjtRQWNBLEdBQUEsQ0FBSSwwQ0FBSixFQUlRLGlIQUpSO1FBa0JBLEdBQUEsQ0FBSSxtQ0FBSixFQUdRLDBHQUhSO1FBZ0JBLEdBQUEsQ0FBSSwrQkFBSixFQUdRLHlGQUhSO1FBY0EsR0FBQSxDQUFJLHNCQUFKLEVBR1Esa0ZBSFI7UUFjQSxHQUFBLENBQUksc0JBQUosRUFLUSw0Q0FMUjtRQWNBLEdBQUEsQ0FBSSw0Q0FBSixFQU1RLDhGQU5SO1FBbUJBLEdBQUEsQ0FBSSx1QkFBSixFQUE4QixzQ0FBOUI7UUFFQSxHQUFBLENBQUksa0JBQUosRUFFUSwwQkFGUjtRQVNBLEdBQUEsQ0FBSSxxQkFBSixFQUdRLDZCQUhSO1FBV0EsR0FBQSxDQUFJLE9BQUosRUFDSSx3Q0FESjtRQVFBLEdBQUEsQ0FBSSxZQUFKLEVBQ0kseURBREo7ZUFTQSxHQUFBLENBQUksa0JBQUosRUFDSSxvRUFESjtJQTVOTSxDQUFWO0lBMk9BLEVBQUEsQ0FBRyxRQUFILEVBQVksU0FBQTtRQUVSLEdBQUEsQ0FBSSxnQ0FBSixFQUdRLHFFQUhSO1FBY0EsR0FBQSxDQUFJLG9DQUFKLEVBSVEsOEVBSlI7UUFlQSxHQUFBLENBQUksZ0NBQUosRUFJUSx3RUFKUjtRQWVBLEdBQUEsQ0FBSSw0RUFBSixFQU1RLGdRQU5SO1FBK0JBLEdBQUEsQ0FBSSx3QkFBSixFQUVRLHNDQUZSO1FBU0EsR0FBQSxDQUFJLG1CQUFKLEVBRVEsNkJBRlI7ZUFTQSxHQUFBLENBQUkscUVBQUosRUFNUSxvSUFOUjtJQS9GUSxDQUFaO1dBMEhBLEVBQUEsQ0FBRyxPQUFILEVBQVcsU0FBQTtRQUVQLEdBQUEsQ0FBSSxNQUFKLEVBQXNCLE1BQXRCO1FBQ0EsR0FBQSxDQUFJLFFBQUosRUFBc0IsUUFBdEI7UUFDQSxHQUFBLENBQUksZUFBSixFQUFzQixlQUF0QjtRQUNBLEdBQUEsQ0FBSSxTQUFKLEVBQXNCLFNBQXRCO1FBQ0EsR0FBQSxDQUFJLGVBQUosRUFBc0IseUJBQXRCO1FBQ0EsR0FBQSxDQUFJLHFEQUFKLEVBQ0kscURBREo7UUFHQSxHQUFBLENBQUksZUFBSixFQUVRLGlCQUZSO1FBTUEsR0FBQSxDQUFJLGtCQUFKLEVBR1Esb0JBSFI7UUFRQSxHQUFBLENBQUkseUZBQUosRUFXUSxvQ0FYUjtRQWVBLEdBQUEsQ0FBSSw4QkFBSixFQUtRLCtCQUxSO1FBWUEsR0FBQSxDQUFJLGNBQUosRUFHUSxrQkFIUjtRQVFBLEdBQUEsQ0FBSSwwQ0FBSixFQU9RLGtCQVBSO1FBWUEsR0FBQSxDQUFJLGtDQUFKLEVBT1EsZ0JBUFI7UUFZQSxHQUFBLENBQUksWUFBSixFQUNJLHdDQURKO1FBUUEsR0FBQSxDQUFJLGdCQUFKLEVBQXFCLDhCQUFyQjtRQUVBLEdBQUEsQ0FBSSxZQUFKLEVBRVEscUNBRlI7UUFTQSxHQUFBLENBQUksZ0JBQUosRUFFUSx5Q0FGUjtRQVNBLEdBQUEsQ0FBSSxzQkFBSixFQUVRLCtDQUZSO1FBU0EsR0FBQSxDQUFJLHlCQUFKLEVBRVEsaURBRlI7UUFTQSxHQUFBLENBQUksZ0JBQUosRUFHUSxtQkFIUjtRQVFBLEdBQUEsQ0FBSSxjQUFKLEVBQ0kseUNBREo7ZUFRQSxHQUFBLENBQUksbUJBQUosRUFHUSx5Q0FIUjtJQWpKTyxDQUFYO0FBdldZLENBQWhCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMFxuMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4wMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwXG4jIyNcblxue2NtcH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5kZXNjcmliZSAnZnVuYycgLT5cblxuICAgIGl0ICdmdW5jJyAtPlxuXG4gICAgICAgIGNtcCAnLT4nICAgICAgICAgICAgICAgJyhmdW5jdGlvbiAoKVxcbnt9KSdcbiAgICAgICAgY21wICcoYSkgLT4nICAgICAgICAgICAnKGZ1bmN0aW9uIChhKVxcbnt9KSdcbiAgICAgICAgY21wICcoYSxiLGMpIC0+JyAgICAgICAnKGZ1bmN0aW9uIChhLCBiLCBjKVxcbnt9KSdcbiAgICAgICAgY21wICdhID0gKGEsYikgLT4nICAgICAnXFxuYSA9IGZ1bmN0aW9uIChhLCBiKVxcbnt9J1xuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIC0+IHJldHVybiAxXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICAoZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIC0+XG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIC0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICAoZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgLT5cbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAoYSxiLGMpIC0+IGRcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcblxuICAgICAgICAgICAgYSA9IGZ1bmN0aW9uIChhLCBiLCBjKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhLnggPSAoeSx6KSAtPiBxXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG5cbiAgICAgICAgICAgIGEueCA9IGZ1bmN0aW9uICh5LCB6KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gLT5cbiAgICAgICAgICAgICAgICBiID0gLT5cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcblxuICAgICAgICAgICAgYSA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIGJcblxuICAgICAgICAgICAgICAgIHJldHVybiBiID0gZnVuY3Rpb24gKClcbiAgICAgICAgICAgICAgICB7fVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSA9IChiLGMpIC0+XG4gICAgICAgICAgICAgICAgYiA9IChlLCBmKSAtPiBnXG4gICAgICAgICAgICAgICAgYlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuXG4gICAgICAgICAgICBhID0gZnVuY3Rpb24gKGIsIGMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIGJcblxuICAgICAgICAgICAgICAgIGIgPSBmdW5jdGlvbiAoZSwgZilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBiXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gKGIsYykgLT5cbiAgICAgICAgICAgICAgICBiID0gKGUsIGYpIC0+IGhcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcblxuICAgICAgICAgICAgYSA9IGZ1bmN0aW9uIChiLCBjKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBiXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gYiA9IGZ1bmN0aW9uIChlLCBmKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gKGIsYykgLT5cbiAgICAgICAgICAgICAgICAoZSwgZikgLT4galxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuXG4gICAgICAgICAgICBhID0gZnVuY3Rpb24gKGIsIGMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlLCBmKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGpcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBmID0gLT5cbiAgICAgICAgICAgICAgICAoYSkgLT4gMVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuXG4gICAgICAgICAgICBmID0gZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGEpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAtPlxuICAgICAgICAgICAgICAgICdhJ1xuICAgICAgICAgICAgMVxuXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG5cbiAgICAgICAgICAgIGEgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiAnYSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDFcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAtPlxuICAgICAgICAgICAgICAgIGxvZyAnYSdcblxuICAgICAgICAgICAgYiA9IC0+XG4gICAgICAgICAgICAgICAgbG9nICdiJ1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuXG4gICAgICAgICAgICBhID0gZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYScpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGIgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdiJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcImEgPSAoIGEsIGI9MSBjPTIgKSAtPlwiLCAgXCJcXG5hID0gZnVuY3Rpb24gKGEsIGIgPSAxLCBjID0gMilcXG57fVwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgMSB0aGVuIHJldHVyblxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKDEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiB4IHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBhXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoeClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIi0+IEBhXCIsXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCIoQGEpIC0+IEBhXCIsXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIChmdW5jdGlvbiAoYSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLmEgPSBhXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIihAYSxhKSAtPiBsb2cgQGFcIixcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgKGZ1bmN0aW9uIChhMSwgYSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLmEgPSBhMVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuYSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAwIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDBcblxuICAgIGl0ICdyZXR1cm4nIC0+XG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZiA9IC0+XG4gICAgICAgICAgICAgICAgaWYgMjMyIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG5cbiAgICAgICAgICAgIGYgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICgyMzIpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBmID0gLT5cbiAgICAgICAgICAgICAgICBpZiAzXG4gICAgICAgICAgICAgICAgICAgIGxvZyAnNDInXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG5cbiAgICAgICAgICAgIGYgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICgzKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJzQyJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBmID0gLT5cbiAgICAgICAgICAgICAgICBpZiA0XG4gICAgICAgICAgICAgICAgICAgICc0MidcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcblxuICAgICAgICAgICAgZiA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKDQpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzQyJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIC0+XG4gICAgICAgICAgICAgICAgaWYgMSB0aGVuIGhcbiAgICAgICAgICAgICAgICBlbHNlIGlmIDJcbiAgICAgICAgICAgICAgICAgICAgaWYgMyB0aGVuIGogZWxzZSBrXG4gICAgICAgICAgICAgICAgZWxzZSBsXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICAoZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoMSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKDIpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpZiAoMylcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGpcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBrXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgcmV0dXJuICdRJyBpZiB0ID09ICdXJ1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKHQgPT09ICdXJylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ1EnXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICByZXR1cm4gaWYgbm90IFhYWFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKCFYWFgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBmID0gLT5cbiAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgJ3JldHVybiBtZSEnXG4gICAgICAgICAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgICAgICAgICBlcnJvciBlXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGYgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdyZXR1cm4gbWUhJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDBcblxuICAgIGl0ICdjYWxscycgLT5cblxuICAgICAgICBjbXAgJ2EoYiknICAgICAgICAgICAgJ2EoYiknXG4gICAgICAgIGNtcCAnYShiLGMpJyAgICAgICAgICAnYShiLGMpJ1xuICAgICAgICBjbXAgJ2EoMSxudWxsLFwiMlwiKScgICAnYSgxLG51bGwsXCIyXCIpJ1xuICAgICAgICBjbXAgJ2FbMV0oYiknICAgICAgICAgJ2FbMV0oYiknXG4gICAgICAgIGNtcCBcImYgJ2InLCAoYSkgLT5cIiAgIFwiZignYicsZnVuY3Rpb24gKGEpXFxue30pXCJcbiAgICAgICAgY21wIFwiYSgnMScgMiAzLjQgdHJ1ZSBmYWxzZSBudWxsIHVuZGVmaW5lZCBOYU4gSW5maW5pdHkpXCIsXG4gICAgICAgICAgICBcImEoJzEnLDIsMy40LHRydWUsZmFsc2UsbnVsbCx1bmRlZmluZWQsTmFOLEluZmluaXR5KVwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSBiOmNbMV0sIGQ6MlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSh7YjpjWzFdLGQ6Mn0pXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhIGI6Y1syXSwgZDozXG4gICAgICAgICAgICA0XG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhKHtiOmNbMl0sZDozfSlcbiAgICAgICAgICAgIDRcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEoXG4gICAgICAgICAgICAgICAgJzEnXG4gICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgICAgIDMuNFxuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSgnMScsMiwzLjQsdHJ1ZSxbbnVsbCx1bmRlZmluZWRdKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSAnMSdcbiAgICAgICAgICAgIGIgIDJcbiAgICAgICAgICAgIGMgIDMuNFxuICAgICAgICAgICAgZCAgdHJ1ZVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSgnMScpXG4gICAgICAgICAgICBiKDIpXG4gICAgICAgICAgICBjKDMuNClcbiAgICAgICAgICAgIGQodHJ1ZSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgYiAxXG4gICAgICAgICAgICBjIGQgMlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYShiKDEpKVxuICAgICAgICAgICAgYyhkKDIpKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYVxuICAgICAgICAgICAgICAgIGJcbiAgICAgICAgICAgICAgICAgICAgM1xuICAgICAgICAgICAgY1xuICAgICAgICAgICAgICAgIGRcbiAgICAgICAgICAgICAgICAgICAgNFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYShiKDMpKVxuICAgICAgICAgICAgYyhkKDQpKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYVxuICAgICAgICAgICAgICAgIGJcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICBjXG4gICAgICAgICAgICAgICAgZFxuICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEoYiwxKVxuICAgICAgICAgICAgYyhkLDIpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJhICdiJyAtPiBjXCIsXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGEoJ2InLGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgJ2wgPSBwYXQubWFwIC0+JyAnbCA9IHBhdC5tYXAoZnVuY3Rpb24gKClcXG57fSknXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgKChhKSAtPiAxKVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgOyhmdW5jdGlvbiAoYSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGwgPSBhIChpKSAtPiAwXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBsID0gYShmdW5jdGlvbiAoaSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGwgPSB0aW1lciAoKGkpIC0+IDEpXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBsID0gdGltZXIoKGZ1bmN0aW9uIChpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICB9KSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGwgPSB0aW1lciAoKGkpIC0+IGkpLCB5XG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBsID0gdGltZXIoKGZ1bmN0aW9uIChpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBpXG4gICAgICAgICAgICB9KSx5KVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYS5iIGM6MlxuICAgICAgICAgICAgeCA9IHlcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEuYih7YzoyfSlcbiAgICAgICAgICAgIHggPSB5XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJhID0gKC0+IDEpKClcIixcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgYSA9IChmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICB9KSgpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gKC0+XG4gICAgICAgICAgICAgICAgMSkoKVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSA9IChmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICB9KSgpXG4gICAgICAgICAgICBcIlwiXCJcbiJdfQ==
//# sourceURL=../../coffee/test/func.coffee