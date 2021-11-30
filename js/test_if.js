// koffee 1.20.0

/*
000  00000000      000000000  000   000  00000000  000   000
000  000              000     000   000  000       0000  000
000  000000           000     000000000  0000000   000 0 000
000  000              000     000   000  000       000  0000
000  000              000     000   000  00000000  000   000
 */
var cmp;

cmp = require('./test_utils').cmp;

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
        cmp("if not op in ['--''++']\n    decr", "if (!['--','++'].indexOf(op) >= 0)\n{\n    decr\n}");
        return cmp("if op not in ['--''++']\n    incr", "if (!['--','++'].indexOf(op) >= 0)\n{\n    incr\n}");
    });
    it('inline', function() {
        cmp("v = if k == 1 then 2 else 3", "v = k === 1 ? 2 : 3");
        cmp("i = 1 if i == 0", "if (i === 0)\n{\n    i = 1\n}");
        cmp("if a then i = 10 if i == 10", "if (a)\n{\n    if (i === 10)\n    {\n        i = 10\n    }\n}");
        cmp("if false then true else no\na = 1", "false ? true : false\na = 1");
        cmp("if false then log 1.1\nlog 1", "if (false)\n{\n    console.log(1.1)\n}\nconsole.log(1)");
        cmp("if false then true else log 3.3\nlog 3", "false ? true : console.log(3.3)\nconsole.log(3)");
        cmp("if 1 then a.b c", "if (1)\n{\n    a.b(c)\n}");
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
    return it('else if', function() {
        cmp("if 1\n    log 'YES'\nelse if no\n    false\nelse\n    log 'NO'\nlog 'end'", "if (1)\n{\n    console.log('YES')\n}\nelse if (false)\n{\n    false\n}\nelse\n{\n    console.log('NO')\n}\nconsole.log('end')");
        return cmp("if a in l\n    log 'YES'\nelse\n    log 'NO'\nlog 'END'", "if (l.indexOf(a) >= 0)\n{\n    console.log('YES')\n}\nelse\n{\n    console.log('NO')\n}\nconsole.log('END')");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9pZi5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbInRlc3RfaWYuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFFLE1BQVEsT0FBQSxDQUFRLGNBQVI7O0FBRVYsUUFBQSxDQUFTLElBQVQsRUFBYyxTQUFBO0lBUVYsRUFBQSxDQUFHLE1BQUgsRUFBVSxTQUFBO1FBRU4sR0FBQSxDQUFJLGNBQUosRUFHUSxxQkFIUjtRQVVBLEdBQUEsQ0FBSSw4QkFBSixFQUdRLDBDQUhSO1FBVUEsR0FBQSxDQUFJLHdCQUFKLEVBSVEsZ0NBSlI7UUFZQSxHQUFBLENBQUksb0JBQUosRUFDSSw0QkFESjtRQVFBLEdBQUEsQ0FBSSxvQkFBSixFQUdRLDRCQUhSO1FBU0EsR0FBQSxDQUFJLDJCQUFKLEVBSVEsbUNBSlI7UUFZQSxHQUFBLENBQUksOEJBQUosRUFJUSx3REFKUjtRQVlBLEdBQUEsQ0FBSSxpQkFBSixFQUdRLDBCQUhSO1FBVUEsR0FBQSxDQUFJLDRCQUFKLEVBSVEsc0NBSlI7UUFZQSxHQUFBLENBQUksbUNBQUosRUFHUSxvREFIUjtlQVVBLEdBQUEsQ0FBSSxtQ0FBSixFQUdRLG9EQUhSO0lBM0dNLENBQVY7SUEySEEsRUFBQSxDQUFHLFFBQUgsRUFBWSxTQUFBO1FBRVIsR0FBQSxDQUFJLDZCQUFKLEVBQWtDLHFCQUFsQztRQUVBLEdBQUEsQ0FBSSxpQkFBSixFQUNJLCtCQURKO1FBUUEsR0FBQSxDQUFJLDZCQUFKLEVBQ0ksK0RBREo7UUFXQSxHQUFBLENBQUksbUNBQUosRUFHUSw2QkFIUjtRQVFBLEdBQUEsQ0FBSSw4QkFBSixFQUdRLHdEQUhSO1FBV0EsR0FBQSxDQUFJLHdDQUFKLEVBR1EsaURBSFI7UUFRQSxHQUFBLENBQUksaUJBQUosRUFFUSwwQkFGUjtRQVNBLEdBQUEsQ0FBSSwwREFBSixFQUErRCwrQkFBL0Q7ZUFFQSxHQUFBLENBQUksZ0hBQUosRUFFUSwwREFGUjs7QUFLQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBbEVRLENBQVo7V0E2R0EsRUFBQSxDQUFHLFNBQUgsRUFBYSxTQUFBO1FBRVQsR0FBQSxDQUFJLDJFQUFKLEVBUVEsK0hBUlI7ZUF3QkEsR0FBQSxDQUFJLHlEQUFKLEVBTVEsNkdBTlI7SUExQlMsQ0FBYjtBQWhQVSxDQUFkIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgIDAwMDAwMDAwICAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbjAwMCAgMDAwICAgICAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMFxuMDAwICAwMDAwMDAgICAgICAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwXG4wMDAgIDAwMCAgICAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDBcbjAwMCAgMDAwICAgICAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgY21wIH0gPSByZXF1aXJlICcuL3Rlc3RfdXRpbHMnXG5cbmRlc2NyaWJlICdpZicgLT5cblxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICd0aGVuJyAtPlxuICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgblxuICAgICAgICAgICAgICAgIGIgXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAobilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBiXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiB1bmRlZmluZWQgPT0gbnVsbFxuICAgICAgICAgICAgICAgIG5vXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAodW5kZWZpbmVkID09PSBudWxsKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiAyXG4gICAgICAgICAgICAgICAgYyA9IDBcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoMilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjID0gMFxuICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCAnaWYgZmFsc2UgdGhlbiB0cnVlJyxcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgaWYgKGZhbHNlKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGlmIGZhbHNlXG4gICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKGZhbHNlKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIH1cIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiBmYWxzZVxuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIGEgPSAxXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoZmFsc2UpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYSA9IDFcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGlmIGZhbHNlXG4gICAgICAgICAgICAgICAgbG9nIDIuMVxuICAgICAgICAgICAgbG9nIDJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGlmIChmYWxzZSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygyLjEpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZygyKVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgMlxuICAgICAgICAgICAgICAgIGEuYiBjXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoMilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhLmIoYylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGlmIDNcbiAgICAgICAgICAgICAgICBhLmIgY1xuICAgICAgICAgICAgICAgIGEuYiBjXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoMylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhLmIoYylcbiAgICAgICAgICAgICAgICBhLmIoYylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIiAgICAgICAgICBcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiBub3Qgb3AgaW4gWyctLScnKysnXVxuICAgICAgICAgICAgICAgIGRlY3JcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGlmICghWyctLScsJysrJ10uaW5kZXhPZihvcCkgPj0gMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBkZWNyXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCIgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgb3Agbm90IGluIFsnLS0nJysrJ11cbiAgICAgICAgICAgICAgICBpbmNyXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoIVsnLS0nLCcrKyddLmluZGV4T2Yob3ApID49IDApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaW5jclxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiICAgICAgICAgIFxuXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGl0ICdpbmxpbmUnIC0+XG4gICAgICAgIFxuICAgICAgICBjbXAgXCJ2ID0gaWYgayA9PSAxIHRoZW4gMiBlbHNlIDNcIiBcInYgPSBrID09PSAxID8gMiA6IDNcIlxuICAgICAgICBcbiAgICAgICAgY21wIFwiaSA9IDEgaWYgaSA9PSAwXCIsICAgICAgICAgICAgIFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBpZiAoaSA9PT0gMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpID0gMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiaWYgYSB0aGVuIGkgPSAxMCBpZiBpID09IDEwXCIsXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGlmIChhKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmIChpID09PSAxMClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGkgPSAxMFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGlmIGZhbHNlIHRoZW4gdHJ1ZSBlbHNlIG5vXG4gICAgICAgICAgICBhID0gMVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgZmFsc2UgPyB0cnVlIDogZmFsc2VcbiAgICAgICAgICAgIGEgPSAxXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiBmYWxzZSB0aGVuIGxvZyAxLjFcbiAgICAgICAgICAgIGxvZyAxXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoZmFsc2UpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coMS4xKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coMSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGlmIGZhbHNlIHRoZW4gdHJ1ZSBlbHNlIGxvZyAzLjNcbiAgICAgICAgICAgIGxvZyAzXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBmYWxzZSA/IHRydWUgOiBjb25zb2xlLmxvZygzLjMpXG4gICAgICAgICAgICBjb25zb2xlLmxvZygzKVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgMSB0aGVuIGEuYiBjXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoMSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhLmIoYylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGNtcCBcImEgPSBpZiAxIHRoZW4gMiBlbHNlIGlmIDMgdGhlbiA0IGVsc2UgaWYgNSB0aGVuIDYgZWxzZSA3XCIgXCJhID0gMSA/IDIgOiAzID8gNCA6IDUgPyA2IDogN1wiXG4gICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gaWYgMCB0aGVuIGlmIDEgdGhlbiBpZiAyIHRoZW4gMyBlbHNlIGlmIDQgdGhlbiA1IGVsc2UgNiBlbHNlIGlmIDcgdGhlbiA4IGVsc2UgOSBlbHNlIGlmIDEwIHRoZW4gMTEgZWxzZSAxMlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSA9IDAgPyAxID8gMiA/IDMgOiA0ID8gNSA6IDYgOiA3ID8gOCA6IDkgOiAxMCA/IDExIDogMTJcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAjIyNcbiAgICAgICAgICAgIGEgPSBpZiAoMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoMSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgyKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAzXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoNClcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgNVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgNlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKDcpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICA4XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIDlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICgxMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAxMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIDEyXG4gICAgICAgICAgICB9XG4gICAgICAgICMjI1xuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgIDAwMDAwMDAwICAgICAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgMDAwICAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgICAgICAwMDAgIDAwMCAgICAgICAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgIFxuICAgIGl0ICdlbHNlIGlmJyAtPlxuICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgMVxuICAgICAgICAgICAgICAgIGxvZyAnWUVTJ1xuICAgICAgICAgICAgZWxzZSBpZiBub1xuICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbG9nICdOTydcbiAgICAgICAgICAgIGxvZyAnZW5kJ1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKDEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1lFUycpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChmYWxzZSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOTycpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZW5kJylcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGlmIGEgaW4gbFxuICAgICAgICAgICAgICAgIGxvZyAnWUVTJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxvZyAnTk8nXG4gICAgICAgICAgICBsb2cgJ0VORCdcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGlmIChsLmluZGV4T2YoYSkgPj0gMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnWUVTJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTk8nKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0VORCcpXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIl19
//# sourceURL=../coffee/test_if.coffee