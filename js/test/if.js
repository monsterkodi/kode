// koffee 1.20.0

/*
000  00000000      000000000  000   000  00000000  000   000
000  000              000     000   000  000       0000  000
000  000000           000     000000000  0000000   000 0 000
000  000              000     000   000  000       000  0000
000  000              000     000   000  00000000  000   000
 */
var cmp, ref, sme;

ref = require('./utils'), cmp = ref.cmp, sme = ref.sme;

describe('if', function() {
    it('then', function() {
        cmp("if n\n    b ", "if (n)\n{\n    b\n}");
        cmp("if undefined == null\n    no", "if (undefined === null)\n{\n    false\n}");
        cmp("if 2\n    c = 0\n    1", "if (2)\n{\n    c = 0\n    1\n}");
        cmp('if false then true', "if (false)\n{\n    true\n}");
        cmp("if false\n    true", "if (false)\n{\n    true\n}");
        cmp("if false\n    true\na = 1", "if (false)\n{\n    true\n}\na = 1");
        cmp("if false\n    log 2.1\nlog 2", "if (false)\n{\n    console.log(2.1)\n}\nconsole.log(2)");
        cmp("if 2\n    a.b c", "if (2)\n{\n    a.b(c)\n}");
        cmp("if 3\n    a.b c\n    a.b c", "if (3)\n{\n    a.b(c)\n    a.b(c)\n}");
        cmp("if not op in ['--''++']\n    decr", "if (!(['--','++'].indexOf(op) >= 0))\n{\n    decr\n}");
        cmp("if op not in ['--''++']\n    incr", "if (!(['--','++'].indexOf(op) >= 0))\n{\n    incr\n}");
        cmp("if 1\n    if 2\n        a\n    if 3\n        if 4\n            b\n        else \n            c\n    log 'yes1'", "if (1)\n{\n    if (2)\n    {\n        a\n    }\n    if (3)\n    {\n        if (4)\n        {\n            b\n        }\n        else\n        {\n            c\n        }\n    }\n    console.log('yes1')\n}");
        cmp("if e then 1\nif 2 then f", "if (e)\n{\n    1\n}\nif (2)\n{\n    f\n}");
        return cmp("->\n    if not e then return\n        \n    if 1\n        if 2 in a\n            3\n        return", "(function ()\n{\n    if (!e)\n    {\n        return\n    }\n    if (1)\n    {\n        if (a.indexOf(2) >= 0)\n        {\n            3\n        }\n        return\n    }\n})");
    });
    it('block', function() {
        cmp("if\n    1 then 2", "if (1)\n{\n    2\n}");
        cmp("if\n    10\n        20", "if (10)\n{\n    20\n}");
        return cmp("if\n    100\n        200\n    300\n        400\n    500\n        600\n    else\n        700", "if (100)\n{\n    200\n}\nelse if (300)\n{\n    400\n}\nelse if (500)\n{\n    600\n}\nelse\n{\n    700\n}");
    });
    it('inline', function() {
        cmp("v = if k == 1 then 2 else 3", "v = k === 1 ? 2 : 3");
        cmp("i = 1 if i == 0", "if (i === 0)\n{\n    i = 1\n}");
        cmp("if a then i = 10 if i == 10", "if (a)\n{\n    if (i === 10)\n    {\n        i = 10\n    }\n}");
        cmp("if false then true else no\na = 1", "false ? true : false\na = 1");
        cmp("if false then log 1.1\nlog 1", "if (false)\n{\n    console.log(1.1)\n}\nconsole.log(1)");
        cmp("if false then true else log 3.3\nlog 3", "false ? true : console.log(3.3)\nconsole.log(3)");
        cmp("if 1 then a.b c", "if (1)\n{\n    a.b(c)\n}");
        cmp("j = ->\n    for m in ms then if bla then blub\n    nextline", "\nj = function ()\n{\n    var m\n\n    var list = (ms != null ? ms : [])\n    for (var _2_10_ = 0; _2_10_ < list.length; _2_10_++)\n    {\n        m = list[_2_10_]\n        if (bla)\n        {\n            blub\n        }\n    }\n    return nextline\n}");
        cmp("if c then return f a\nnextline", "if (c)\n{\n    return f(a)\n}\nnextline");
        cmp("h = if w then f g else '0'", "h = w ? f(g) : '0'");
        cmp("a = if 1 then 2 else if 3 then 4 else if 5 then 6 else 7", "a = 1 ? 2 : 3 ? 4 : 5 ? 6 : 7");
        return cmp("a = if 0 then if 1 then if 2 then 3 else if 4 then 5 else 6 else if 7 then 8 else 9 else if 10 then 11 else 12", "a = 0 ? 1 ? 2 ? 3 : 4 ? 5 : 6 : 7 ? 8 : 9 : 10 ? 11 : 12");

        /*
            a = if (0)
            {
                if (1)
                {
                    if (2)
                    {
                        3
                    }
                    else if (4)
                    {
                        5
                    }
                    else
                    {
                        6
                    }
                }
                else if (7)
                {
                    8
                }
                else
                {
                    9
                }
            }
            else if (10)
            {
                11
            }
            else
            {
                12
            }
         */
    });
    it('else if', function() {
        cmp("if 1\n    log 'yes2'\nelse if no\n    false\nelse\n    log 'no2'\nlog 'end'", "if (1)\n{\n    console.log('yes2')\n}\nelse if (false)\n{\n    false\n}\nelse\n{\n    console.log('no2')\n}\nconsole.log('end')");
        return cmp("if a in l\n    log 'yes3'\nelse\n    log 'no3'\nlog 'END'", "if (l.indexOf(a) >= 0)\n{\n    console.log('yes3')\n}\nelse\n{\n    console.log('no3')\n}\nconsole.log('END')");
    });
    it('returns', function() {
        cmp("-> if false then true", "(function ()\n{\n    if (false)\n    {\n        return true\n    }\n})");
        cmp("-> if 1 then 2 else 3", "(function ()\n{\n    if (1)\n    {\n        return 2\n    }\n    else\n    {\n        return 3\n    }\n})");
        return cmp("->    \n    if a\n        e.push\n            key:\n                key: val", "(function ()\n{\n    if (a)\n    {\n        return e.push({key:{key:val}})\n    }\n})");
    });
    it('tail', function() {
        cmp("a if b", "if (b)\n{\n    a\n}");
        cmp("a if b if c", "if (c)\n{\n    if (b)\n    {\n        a\n    }\n}");
        cmp("log 'msg' if dbg", "if (dbg)\n{\n    console.log('msg')\n}");
        cmp("if 1 then 2", "if (1)\n{\n    2\n}");
        sme("if 1 then 2", "if 1 then 2");
        return sme("if 1 ➜ 2 else 3", "if 1 then 2 else 3");
    });
    return it('nicer', function() {
        cmp("if\n    x       ➜ 1\n    a == 5  ➜ 2\n    'hello' ➜ 3\n            ➜ fark", "if (x)\n{\n    1\n}\nelse if (a === 5)\n{\n    2\n}\nelse if ('hello')\n{\n    3\n}\nelse\n{\n    fark\n}");
        cmp("if\n    x       ➜ 1\n    a == 5  ➜ 2\n    'hello' ➜ 3\n    else\n        fark", "if (x)\n{\n    1\n}\nelse if (a === 5)\n{\n    2\n}\nelse if ('hello')\n{\n    3\n}\nelse\n{\n    fark\n}");
        cmp("if  \n    x       ➜ 1\n    a == 5  ➜ 2\n    'hello' ➜ 3\n    else   fark", "if (x)\n{\n    1\n}\nelse if (a === 5)\n{\n    2\n}\nelse if ('hello')\n{\n    3\n}\nelse\n{\n    fark\n}");
        cmp("if  x  ➜ 1\n    y  ➜ 2", "if (x)\n{\n    1\n}\nelse if (y)\n{\n    2\n}");
        cmp("if  a 'x' ➜ X\n    b 'y' ➜ Y\n    else    Z", "if (a('x'))\n{\n    X\n}\nelse if (b('y'))\n{\n    Y\n}\nelse\n{\n    Z\n}");
        cmp("if  a 'x' ➜ X\n    b 'y' ➜ Y\n          ➜ Z", "if (a('x'))\n{\n    X\n}\nelse if (b('y'))\n{\n    Y\n}\nelse\n{\n    Z\n}");
        cmp("if  b   ➜ R\n        ➜ S", "if (b)\n{\n    R\n}\nelse\n{\n    S\n}");
        return cmp("if  a ➜ P\n    ➜   Q", "if (a)\n{\n    P\n}\nelse\n{\n    Q\n}");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWYuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vY29mZmVlL3Rlc3QiLCJzb3VyY2VzIjpbImlmLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUFlLE9BQUEsQ0FBUSxTQUFSLENBQWYsRUFBRSxhQUFGLEVBQU87O0FBRVAsUUFBQSxDQUFTLElBQVQsRUFBYyxTQUFBO0lBUVYsRUFBQSxDQUFHLE1BQUgsRUFBVSxTQUFBO1FBRU4sR0FBQSxDQUFJLGNBQUosRUFHUSxxQkFIUjtRQVVBLEdBQUEsQ0FBSSw4QkFBSixFQUdRLDBDQUhSO1FBVUEsR0FBQSxDQUFJLHdCQUFKLEVBSVEsZ0NBSlI7UUFZQSxHQUFBLENBQUksb0JBQUosRUFDSSw0QkFESjtRQVFBLEdBQUEsQ0FBSSxvQkFBSixFQUdRLDRCQUhSO1FBU0EsR0FBQSxDQUFJLDJCQUFKLEVBSVEsbUNBSlI7UUFZQSxHQUFBLENBQUksOEJBQUosRUFJUSx3REFKUjtRQVlBLEdBQUEsQ0FBSSxpQkFBSixFQUdRLDBCQUhSO1FBVUEsR0FBQSxDQUFJLDRCQUFKLEVBSVEsc0NBSlI7UUFZQSxHQUFBLENBQUksbUNBQUosRUFHUSxzREFIUjtRQVVBLEdBQUEsQ0FBSSxtQ0FBSixFQUdRLHNEQUhSO1FBVUEsR0FBQSxDQUFJLGdIQUFKLEVBVVEsOE1BVlI7UUFnQ0EsR0FBQSxDQUFJLDBCQUFKLEVBR1EsMENBSFI7ZUFjQSxHQUFBLENBQUksb0dBQUosRUFRUSwrS0FSUjtJQW5LTSxDQUFWO0lBbU1BLEVBQUEsQ0FBRyxPQUFILEVBQVcsU0FBQTtRQUVQLEdBQUEsQ0FBSSxrQkFBSixFQUdRLHFCQUhSO1FBVUEsR0FBQSxDQUFJLHdCQUFKLEVBSVEsdUJBSlI7ZUFXQSxHQUFBLENBQUksNkZBQUosRUFVUSwwR0FWUjtJQXZCTyxDQUFYO0lBMERBLEVBQUEsQ0FBRyxRQUFILEVBQVksU0FBQTtRQUVSLEdBQUEsQ0FBSSw2QkFBSixFQUFrQyxxQkFBbEM7UUFFQSxHQUFBLENBQUksaUJBQUosRUFDSSwrQkFESjtRQVFBLEdBQUEsQ0FBSSw2QkFBSixFQUNJLCtEQURKO1FBV0EsR0FBQSxDQUFJLG1DQUFKLEVBR1EsNkJBSFI7UUFRQSxHQUFBLENBQUksOEJBQUosRUFHUSx3REFIUjtRQVdBLEdBQUEsQ0FBSSx3Q0FBSixFQUdRLGlEQUhSO1FBUUEsR0FBQSxDQUFJLGlCQUFKLEVBRVEsMEJBRlI7UUFTQSxHQUFBLENBQUksNkRBQUosRUFJUSw4UEFKUjtRQXVCQSxHQUFBLENBQUksZ0NBQUosRUFHUSx5Q0FIUjtRQVdBLEdBQUEsQ0FBSSw0QkFBSixFQUFpQyxvQkFBakM7UUFFQSxHQUFBLENBQUksMERBQUosRUFBK0QsK0JBQS9EO2VBRUEsR0FBQSxDQUFJLGdIQUFKLEVBRVEsMERBRlI7O0FBS0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQXRHUSxDQUFaO0lBaUpBLEVBQUEsQ0FBRyxTQUFILEVBQWEsU0FBQTtRQUVULEdBQUEsQ0FBSSw2RUFBSixFQVFRLGlJQVJSO2VBd0JBLEdBQUEsQ0FBSSwyREFBSixFQU1RLCtHQU5SO0lBMUJTLENBQWI7SUFrREEsRUFBQSxDQUFHLFNBQUgsRUFBYSxTQUFBO1FBRVQsR0FBQSxDQUFJLHVCQUFKLEVBRVEsd0VBRlI7UUFZQSxHQUFBLENBQUksdUJBQUosRUFFUSwyR0FGUjtlQWdCQSxHQUFBLENBQUksOEVBQUosRUFNUSx1RkFOUjtJQTlCUyxDQUFiO0lBb0RBLEVBQUEsQ0FBRyxNQUFILEVBQVUsU0FBQTtRQUVOLEdBQUEsQ0FBSSxRQUFKLEVBRVEscUJBRlI7UUFTQSxHQUFBLENBQUksYUFBSixFQUVRLG1EQUZSO1FBWUEsR0FBQSxDQUFJLGtCQUFKLEVBRVEsd0NBRlI7UUFTQSxHQUFBLENBQUksYUFBSixFQUFvQixxQkFBcEI7UUFFQSxHQUFBLENBQUksYUFBSixFQUEwQixhQUExQjtlQUNBLEdBQUEsQ0FBSSxpQkFBSixFQUE2QixvQkFBN0I7SUFuQ00sQ0FBVjtXQTZDQSxFQUFBLENBQUcsT0FBSCxFQUFXLFNBQUE7UUFFUCxHQUFBLENBQUksMkVBQUosRUFNUSwyR0FOUjtRQXlCQSxHQUFBLENBQUksK0VBQUosRUFPUSwyR0FQUjtRQTBCQSxHQUFBLENBQUksMEVBQUosRUFNUSwyR0FOUjtRQXlCQSxHQUFBLENBQUksd0JBQUosRUFHUSwrQ0FIUjtRQWNBLEdBQUEsQ0FBSSw2Q0FBSixFQUlRLDRFQUpSO1FBbUJBLEdBQUEsQ0FBSSw2Q0FBSixFQUlRLDRFQUpSO1FBbUJBLEdBQUEsQ0FBSSwwQkFBSixFQUdRLHdDQUhSO2VBY0EsR0FBQSxDQUFJLHNCQUFKLEVBR1Esd0NBSFI7SUFoSk8sQ0FBWDtBQXppQlUsQ0FBZCIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAwMDAwMDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4wMDAgIDAwMCAgICAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDBcbjAwMCAgMDAwMDAwICAgICAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMFxuMDAwICAwMDAgICAgICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwXG4wMDAgIDAwMCAgICAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IGNtcCwgc21lIH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5kZXNjcmliZSAnaWYnIC0+XG5cbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpdCAndGhlbicgLT5cbiAgICAgICAgXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGlmIG5cbiAgICAgICAgICAgICAgICBiIFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKG4pXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgdW5kZWZpbmVkID09IG51bGxcbiAgICAgICAgICAgICAgICBub1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKHVuZGVmaW5lZCA9PT0gbnVsbClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgMlxuICAgICAgICAgICAgICAgIGMgPSAwXG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKDIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYyA9IDBcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgJ2lmIGZhbHNlIHRoZW4gdHJ1ZScsXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGlmIChmYWxzZSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiBmYWxzZVxuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGlmIChmYWxzZSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICB9XCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgZmFsc2VcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBhID0gMVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKGZhbHNlKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGEgPSAxXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiBmYWxzZVxuICAgICAgICAgICAgICAgIGxvZyAyLjFcbiAgICAgICAgICAgIGxvZyAyXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoZmFsc2UpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coMi4xKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coMilcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGlmIDJcbiAgICAgICAgICAgICAgICBhLmIgY1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKDIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYS5iKGMpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiAzXG4gICAgICAgICAgICAgICAgYS5iIGNcbiAgICAgICAgICAgICAgICBhLmIgY1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKDMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYS5iKGMpXG4gICAgICAgICAgICAgICAgYS5iKGMpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCIgICAgICAgICAgXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgbm90IG9wIGluIFsnLS0nJysrJ11cbiAgICAgICAgICAgICAgICBkZWNyXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoIShbJy0tJywnKysnXS5pbmRleE9mKG9wKSA+PSAwKSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBkZWNyXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCIgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgb3Agbm90IGluIFsnLS0nJysrJ11cbiAgICAgICAgICAgICAgICBpbmNyXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoIShbJy0tJywnKysnXS5pbmRleE9mKG9wKSA+PSAwKSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpbmNyXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCIgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgMVxuICAgICAgICAgICAgICAgIGlmIDJcbiAgICAgICAgICAgICAgICAgICAgYVxuICAgICAgICAgICAgICAgIGlmIDNcbiAgICAgICAgICAgICAgICAgICAgaWYgNFxuICAgICAgICAgICAgICAgICAgICAgICAgYlxuICAgICAgICAgICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgICAgICAgICAgY1xuICAgICAgICAgICAgICAgIGxvZyAneWVzMSdcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGlmICgxKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICgyKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoMylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlmICg0KVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3llczEnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgZSB0aGVuIDFcbiAgICAgICAgICAgIGlmIDIgdGhlbiBmXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoZSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoMilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICAtPlxuICAgICAgICAgICAgICAgIGlmIG5vdCBlIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIDFcbiAgICAgICAgICAgICAgICAgICAgaWYgMiBpbiBhXG4gICAgICAgICAgICAgICAgICAgICAgICAzXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgKGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKCFlKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgxKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGEuaW5kZXhPZigyKSA+PSAwKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAzXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ2Jsb2NrJyAtPlxuICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWZcbiAgICAgICAgICAgICAgICAxIHRoZW4gMlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKDEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWZcbiAgICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgICAgICAgICAyMFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKDEwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIDIwXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZlxuICAgICAgICAgICAgICAgIDEwMFxuICAgICAgICAgICAgICAgICAgICAyMDBcbiAgICAgICAgICAgICAgICAzMDBcbiAgICAgICAgICAgICAgICAgICAgNDAwXG4gICAgICAgICAgICAgICAgNTAwXG4gICAgICAgICAgICAgICAgICAgIDYwMFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgNzAwXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoMTAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIDIwMFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoMzAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIDQwMFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoNTAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIDYwMFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIDcwMFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ2lubGluZScgLT5cbiAgICAgICAgXG4gICAgICAgIGNtcCBcInYgPSBpZiBrID09IDEgdGhlbiAyIGVsc2UgM1wiIFwidiA9IGsgPT09IDEgPyAyIDogM1wiXG4gICAgICAgIFxuICAgICAgICBjbXAgXCJpID0gMSBpZiBpID09IDBcIiwgICAgICAgICAgICAgXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGlmIChpID09PSAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGkgPSAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJpZiBhIHRoZW4gaSA9IDEwIGlmIGkgPT0gMTBcIixcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgaWYgKGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IDEwKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaSA9IDEwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgZmFsc2UgdGhlbiB0cnVlIGVsc2Ugbm9cbiAgICAgICAgICAgIGEgPSAxXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBmYWxzZSA/IHRydWUgOiBmYWxzZVxuICAgICAgICAgICAgYSA9IDFcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGlmIGZhbHNlIHRoZW4gbG9nIDEuMVxuICAgICAgICAgICAgbG9nIDFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGlmIChmYWxzZSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygxLjEpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZygxKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgZmFsc2UgdGhlbiB0cnVlIGVsc2UgbG9nIDMuM1xuICAgICAgICAgICAgbG9nIDNcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGZhbHNlID8gdHJ1ZSA6IGNvbnNvbGUubG9nKDMuMylcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKDMpXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiAxIHRoZW4gYS5iIGNcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGlmICgxKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGEuYihjKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaiA9IC0+XG4gICAgICAgICAgICAgICAgZm9yIG0gaW4gbXMgdGhlbiBpZiBibGEgdGhlbiBibHViXG4gICAgICAgICAgICAgICAgbmV4dGxpbmVcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaiA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIG1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBsaXN0ID0gKG1zICE9IG51bGwgPyBtcyA6IFtdKVxuICAgICAgICAgICAgICAgIGZvciAodmFyIF8yXzEwXyA9IDA7IF8yXzEwXyA8IGxpc3QubGVuZ3RoOyBfMl8xMF8rKylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG0gPSBsaXN0W18yXzEwX11cbiAgICAgICAgICAgICAgICAgICAgaWYgKGJsYSlcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmx1YlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXh0bGluZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgYyB0aGVuIHJldHVybiBmIGFcbiAgICAgICAgICAgIG5leHRsaW5lXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoYylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZihhKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV4dGxpbmVcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGNtcCBcImggPSBpZiB3IHRoZW4gZiBnIGVsc2UgJzAnXCIgXCJoID0gdyA/IGYoZykgOiAnMCdcIlxuICAgICAgICAgICAgXG4gICAgICAgIGNtcCBcImEgPSBpZiAxIHRoZW4gMiBlbHNlIGlmIDMgdGhlbiA0IGVsc2UgaWYgNSB0aGVuIDYgZWxzZSA3XCIgXCJhID0gMSA/IDIgOiAzID8gNCA6IDUgPyA2IDogN1wiXG4gICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gaWYgMCB0aGVuIGlmIDEgdGhlbiBpZiAyIHRoZW4gMyBlbHNlIGlmIDQgdGhlbiA1IGVsc2UgNiBlbHNlIGlmIDcgdGhlbiA4IGVsc2UgOSBlbHNlIGlmIDEwIHRoZW4gMTEgZWxzZSAxMlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSA9IDAgPyAxID8gMiA/IDMgOiA0ID8gNSA6IDYgOiA3ID8gOCA6IDkgOiAxMCA/IDExIDogMTJcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAjIyNcbiAgICAgICAgICAgIGEgPSBpZiAoMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoMSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgyKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAzXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoNClcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgNVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgNlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKDcpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICA4XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIDlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICgxMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAxMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIDEyXG4gICAgICAgICAgICB9XG4gICAgICAgICMjI1xuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgIDAwMDAwMDAwICAgICAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgMDAwICAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgICAgICAwMDAgIDAwMCAgICAgICAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgIFxuICAgIGl0ICdlbHNlIGlmJyAtPlxuICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgMVxuICAgICAgICAgICAgICAgIGxvZyAneWVzMidcbiAgICAgICAgICAgIGVsc2UgaWYgbm9cbiAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxvZyAnbm8yJ1xuICAgICAgICAgICAgbG9nICdlbmQnXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoMSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygneWVzMicpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChmYWxzZSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdubzInKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2VuZCcpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiBhIGluIGxcbiAgICAgICAgICAgICAgICBsb2cgJ3llczMnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbG9nICdubzMnXG4gICAgICAgICAgICBsb2cgJ0VORCdcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGlmIChsLmluZGV4T2YoYSkgPj0gMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygneWVzMycpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ25vMycpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRU5EJylcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdyZXR1cm5zJyAtPlxuICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgLT4gaWYgZmFsc2UgdGhlbiB0cnVlXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICAoZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoZmFsc2UpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICAtPiBpZiAxIHRoZW4gMiBlbHNlIDNcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICgxKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXCJcIlwiICAgXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgLT4gICAgXG4gICAgICAgICAgICAgICAgaWYgYVxuICAgICAgICAgICAgICAgICAgICBlLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IHZhbFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgKGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKGEpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS5wdXNoKHtrZXk6e2tleTp2YWx9fSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ3RhaWwnIC0+XG4gICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhIGlmIGJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGlmIChiKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgaWYgYiBpZiBjXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoYylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoYilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGFcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBsb2cgJ21zZycgaWYgZGJnXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoZGJnKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdtc2cnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiaWYgMSB0aGVuIDJcIiAgIFwiaWYgKDEpXFxue1xcbiAgICAyXFxufVwiXG4gICAgICAgIFxuICAgICAgICBzbWUgXCJpZiAxIHRoZW4gMlwiICAgICAgICAgXCJpZiAxIHRoZW4gMlwiXG4gICAgICAgIHNtZSBcImlmIDEg4p6cIDIgZWxzZSAzXCIgICAgICAgIFwiaWYgMSB0aGVuIDIgZWxzZSAzXCJcbiAgICAgICAgIyBzbWUgXCIxIOKenCAyIOKenCAzXCIgICAgICAgICAgIFwiaWYgMSB0aGVuIDIgZWxzZSAzXCJcbiAgICAgICAgIyBzbWUgXCIxIOKenCAyIOKenCAzIOKenCA0IOKenCA1XCIgICBcImlmIDEgdGhlbiAyIGVsc2UgaWYgMyB0aGVuIDQgZWxzZSA1XCJcblxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ25pY2VyJyAtPlxuICAgICAgICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWZcbiAgICAgICAgICAgICAgICB4ICAgICAgIOKenCAxXG4gICAgICAgICAgICAgICAgYSA9PSA1ICDinpwgMlxuICAgICAgICAgICAgICAgICdoZWxsbycg4p6cIDNcbiAgICAgICAgICAgICAgICAgICAgICAgIOKenCBmYXJrXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoeClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhID09PSA1KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCdoZWxsbycpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgM1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZhcmtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGlmXG4gICAgICAgICAgICAgICAgeCAgICAgICDinpwgMVxuICAgICAgICAgICAgICAgIGEgPT0gNSAg4p6cIDJcbiAgICAgICAgICAgICAgICAnaGVsbG8nIOKenCAzXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBmYXJrXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoeClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhID09PSA1KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCdoZWxsbycpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgM1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZhcmtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGlmICBcbiAgICAgICAgICAgICAgICB4ICAgICAgIOKenCAxXG4gICAgICAgICAgICAgICAgYSA9PSA1ICDinpwgMlxuICAgICAgICAgICAgICAgICdoZWxsbycg4p6cIDNcbiAgICAgICAgICAgICAgICBlbHNlICAgZmFya1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKHgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYSA9PT0gNSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICgnaGVsbG8nKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIDNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmYXJrXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiAgeCAg4p6cIDFcbiAgICAgICAgICAgICAgICB5ICDinpwgMlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKHgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoeSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiAgYSAneCcg4p6cIFhcbiAgICAgICAgICAgICAgICBiICd5JyDinpwgWVxuICAgICAgICAgICAgICAgIGVsc2UgICAgWlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKGEoJ3gnKSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBYXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChiKCd5JykpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgWVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFpcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGlmICBhICd4JyDinpwgWFxuICAgICAgICAgICAgICAgIGIgJ3knIOKenCBZXG4gICAgICAgICAgICAgICAgICAgICAg4p6cIFpcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGlmIChhKCd4JykpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgWFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYigneScpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBaXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiAgYiAgIOKenCBSXG4gICAgICAgICAgICAgICAgICAgIOKenCBTXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoYilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBSXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgU1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgIGEg4p6cIFBcbiAgICAgICAgICAgICAgICDinpwgICBRXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoYSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBQXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgUVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAiXX0=
//# sourceURL=../../coffee/test/if.coffee