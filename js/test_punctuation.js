// koffee 1.20.0

/*
00000000   000   000  000   000   0000000  000000000  000   000   0000000   000000000  000   0000000   000   000  
000   000  000   000  0000  000  000          000     000   000  000   000     000     000  000   000  0000  000  
00000000   000   000  000 0 000  000          000     000   000  000000000     000     000  000   000  000 0 000  
000        000   000  000  0000  000          000     000   000  000   000     000     000  000   000  000  0000  
000         0000000   000   000   0000000     000      0000000   000   000     000     000   0000000   000   000
 */
var cmp;

cmp = require('./test_utils').cmp;

describe('punctuation', function() {
    it('parens', function() {
        cmp('(b c)', '(b(c))');
        cmp('(b --c)', '(b(--c))');
        return cmp('a + (b --c)', 'a + (b(--c))');
    });
    return it('optional commata', function() {
        cmp("a = -1", "a = -1");
        cmp("a = [ 1 2 3 ]", "a = [1,2,3]");
        cmp("a = [-1 2 3 ]", "a = [-1,2,3]");
        cmp("a = [ 1 -2 3 ]", "a = [1,-2,3]");
        cmp("a = [-1 -2 -3]", "a = [-1,-2,-3]");
        cmp("a = [ 1 +2 -3]", "a = [1,+2,-3]");
        cmp("a = [+1 -2 +3]", "a = [+1,-2,+3]");
        cmp("a = [1 a]", "a = [1,a]");
        cmp("a = [1 -b]", "a = [1,-b]");
        cmp("a = ['0' -2 'c' -3]", "a = ['0',-2,'c',-3]");
        cmp("a = [-1 - 2 - 3]", "a = [-1 - 2 - 3]");
        cmp("a = [-1-2-3]", "a = [-1 - 2 - 3]");
        cmp("a = { a:1 b:2 }", "a = {a:1,b:2}");
        cmp("a = a:1 b:2", "a = {a:1,b:2}");
        cmp("a = ['a' 'b' 'c']", "a = ['a','b','c']");
        cmp("a = ['a''b''c']", "a = ['a','b','c']");
        cmp("a = { a:{a:1}, b:{b:2} }", "a = {a:{a:1},b:{b:2}}");
        cmp("a = { a:{a:3} b:{b:4} }", "a = {a:{a:3},b:{b:4}}");
        cmp("a = [ {a:5} {b:6} ]", "a = [{a:5},{b:6}]");
        cmp("a = [ {a:1 b:2} ]", "a = [{a:1,b:2}]");
        cmp("a = [ [] [] ]", "a = [[],[]]");
        cmp("a = [[] []]", "a = [[],[]]");
        cmp("a = [[[[[] []] [[] []]]]]", "a = [[[[[],[]],[[],[]]]]]");
        cmp("a = [ [1 2] [3 '4'] ]", "a = [[1,2],[3,'4']]");
        cmp("a = [ [-1 -2] [-3 '4' -5] ]", "a = [[-1,-2],[-3,'4',-5]]");
        cmp("a.on 'b' c", "a.on('b',c)");
        cmp("describe 'test' ->", "describe('test',function ()\n{})");
        cmp('log "hello" 1 "world"', 'console.log("hello",1,"world")');
        cmp('log 1 2 3', 'console.log(1,2,3)');
        return cmp("a = ['a' 1 2.3 null undefined true false yes no]", "a = ['a',1,2.3,null,undefined,true,false,true,false]");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9wdW5jdHVhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbInRlc3RfcHVuY3R1YXRpb24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFFLE1BQU8sT0FBQSxDQUFRLGNBQVI7O0FBRVQsUUFBQSxDQUFTLGFBQVQsRUFBdUIsU0FBQTtJQVFuQixFQUFBLENBQUcsUUFBSCxFQUFZLFNBQUE7UUFFUixHQUFBLENBQUksT0FBSixFQUFrQyxRQUFsQztRQUNBLEdBQUEsQ0FBSSxTQUFKLEVBQWtDLFVBQWxDO2VBQ0EsR0FBQSxDQUFJLGFBQUosRUFBa0MsY0FBbEM7SUFKUSxDQUFaO1dBWUEsRUFBQSxDQUFHLGtCQUFILEVBQXNCLFNBQUE7UUFFbEIsR0FBQSxDQUFJLFFBQUosRUFBa0MsUUFBbEM7UUFDQSxHQUFBLENBQUksZUFBSixFQUFrQyxhQUFsQztRQUNBLEdBQUEsQ0FBSSxlQUFKLEVBQWtDLGNBQWxDO1FBQ0EsR0FBQSxDQUFJLGdCQUFKLEVBQWtDLGNBQWxDO1FBQ0EsR0FBQSxDQUFJLGdCQUFKLEVBQWtDLGdCQUFsQztRQUNBLEdBQUEsQ0FBSSxnQkFBSixFQUFrQyxlQUFsQztRQUNBLEdBQUEsQ0FBSSxnQkFBSixFQUFrQyxnQkFBbEM7UUFDQSxHQUFBLENBQUksV0FBSixFQUFrQyxXQUFsQztRQUNBLEdBQUEsQ0FBSSxZQUFKLEVBQWtDLFlBQWxDO1FBQ0EsR0FBQSxDQUFJLHFCQUFKLEVBQWtDLHFCQUFsQztRQUNBLEdBQUEsQ0FBSSxrQkFBSixFQUFrQyxrQkFBbEM7UUFDQSxHQUFBLENBQUksY0FBSixFQUFrQyxrQkFBbEM7UUFDQSxHQUFBLENBQUksaUJBQUosRUFBa0MsZUFBbEM7UUFDQSxHQUFBLENBQUksYUFBSixFQUFrQyxlQUFsQztRQUNBLEdBQUEsQ0FBSSxtQkFBSixFQUFrQyxtQkFBbEM7UUFDQSxHQUFBLENBQUksaUJBQUosRUFBa0MsbUJBQWxDO1FBQ0EsR0FBQSxDQUFJLDBCQUFKLEVBQWtDLHVCQUFsQztRQUNBLEdBQUEsQ0FBSSx5QkFBSixFQUFrQyx1QkFBbEM7UUFDQSxHQUFBLENBQUkscUJBQUosRUFBa0MsbUJBQWxDO1FBQ0EsR0FBQSxDQUFJLG1CQUFKLEVBQWtDLGlCQUFsQztRQUNBLEdBQUEsQ0FBSSxlQUFKLEVBQWtDLGFBQWxDO1FBQ0EsR0FBQSxDQUFJLGFBQUosRUFBa0MsYUFBbEM7UUFDQSxHQUFBLENBQUksMkJBQUosRUFBa0MsMkJBQWxDO1FBQ0EsR0FBQSxDQUFJLHVCQUFKLEVBQWtDLHFCQUFsQztRQUNBLEdBQUEsQ0FBSSw2QkFBSixFQUFrQywyQkFBbEM7UUFDQSxHQUFBLENBQUksWUFBSixFQUFrQyxhQUFsQztRQUNBLEdBQUEsQ0FBSSxvQkFBSixFQUFrQyxrQ0FBbEM7UUFDQSxHQUFBLENBQUksdUJBQUosRUFBa0MsZ0NBQWxDO1FBQ0EsR0FBQSxDQUFJLFdBQUosRUFBa0Msb0JBQWxDO2VBRUEsR0FBQSxDQUFJLGtEQUFKLEVBQ00sc0RBRE47SUFoQ2tCLENBQXRCO0FBcEJtQixDQUF2QiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbjAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4wMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMjI1xuXG57IGNtcCB9PSByZXF1aXJlICcuL3Rlc3RfdXRpbHMnXG5cbmRlc2NyaWJlICdwdW5jdHVhdGlvbicgLT5cblxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGl0ICdwYXJlbnMnIC0+XG5cbiAgICAgICAgY21wICcoYiBjKScgICAgICAgICAgICAgICAgICAgICAgICcoYihjKSknXG4gICAgICAgIGNtcCAnKGIgLS1jKScgICAgICAgICAgICAgICAgICAgICAnKGIoLS1jKSknXG4gICAgICAgIGNtcCAnYSArIChiIC0tYyknICAgICAgICAgICAgICAgICAnYSArIChiKC0tYykpJ1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ29wdGlvbmFsIGNvbW1hdGEnIC0+XG4gICAgICAgIFxuICAgICAgICBjbXAgXCJhID0gLTFcIiAgICAgICAgICAgICAgICAgICAgICBcImEgPSAtMVwiIFxuICAgICAgICBjbXAgXCJhID0gWyAxIDIgMyBdXCIgICAgICAgICAgICAgICBcImEgPSBbMSwyLDNdXCIgXG4gICAgICAgIGNtcCBcImEgPSBbLTEgMiAzIF1cIiAgICAgICAgICAgICAgIFwiYSA9IFstMSwyLDNdXCIgXG4gICAgICAgIGNtcCBcImEgPSBbIDEgLTIgMyBdXCIgICAgICAgICAgICAgIFwiYSA9IFsxLC0yLDNdXCIgXG4gICAgICAgIGNtcCBcImEgPSBbLTEgLTIgLTNdXCIgICAgICAgICAgICAgIFwiYSA9IFstMSwtMiwtM11cIiBcbiAgICAgICAgY21wIFwiYSA9IFsgMSArMiAtM11cIiAgICAgICAgICAgICAgXCJhID0gWzEsKzIsLTNdXCIgXG4gICAgICAgIGNtcCBcImEgPSBbKzEgLTIgKzNdXCIgICAgICAgICAgICAgIFwiYSA9IFsrMSwtMiwrM11cIiBcbiAgICAgICAgY21wIFwiYSA9IFsxIGFdXCIgICAgICAgICAgICAgICAgICAgXCJhID0gWzEsYV1cIiBcbiAgICAgICAgY21wIFwiYSA9IFsxIC1iXVwiICAgICAgICAgICAgICAgICAgXCJhID0gWzEsLWJdXCIgXG4gICAgICAgIGNtcCBcImEgPSBbJzAnIC0yICdjJyAtM11cIiAgICAgICAgIFwiYSA9IFsnMCcsLTIsJ2MnLC0zXVwiIFxuICAgICAgICBjbXAgXCJhID0gWy0xIC0gMiAtIDNdXCIgICAgICAgICAgICBcImEgPSBbLTEgLSAyIC0gM11cIiBcbiAgICAgICAgY21wIFwiYSA9IFstMS0yLTNdXCIgICAgICAgICAgICAgICAgXCJhID0gWy0xIC0gMiAtIDNdXCIgXG4gICAgICAgIGNtcCBcImEgPSB7IGE6MSBiOjIgfVwiICAgICAgICAgICAgIFwiYSA9IHthOjEsYjoyfVwiXG4gICAgICAgIGNtcCBcImEgPSBhOjEgYjoyXCIgICAgICAgICAgICAgICAgIFwiYSA9IHthOjEsYjoyfVwiXG4gICAgICAgIGNtcCBcImEgPSBbJ2EnICdiJyAnYyddXCIgICAgICAgICAgIFwiYSA9IFsnYScsJ2InLCdjJ11cIlxuICAgICAgICBjbXAgXCJhID0gWydhJydiJydjJ11cIiAgICAgICAgICAgICBcImEgPSBbJ2EnLCdiJywnYyddXCJcbiAgICAgICAgY21wIFwiYSA9IHsgYTp7YToxfSwgYjp7YjoyfSB9XCIgICAgXCJhID0ge2E6e2E6MX0sYjp7YjoyfX1cIlxuICAgICAgICBjbXAgXCJhID0geyBhOnthOjN9IGI6e2I6NH0gfVwiICAgICBcImEgPSB7YTp7YTozfSxiOntiOjR9fVwiXG4gICAgICAgIGNtcCBcImEgPSBbIHthOjV9IHtiOjZ9IF1cIiAgICAgICAgIFwiYSA9IFt7YTo1fSx7Yjo2fV1cIlxuICAgICAgICBjbXAgXCJhID0gWyB7YToxIGI6Mn0gXVwiICAgICAgICAgICBcImEgPSBbe2E6MSxiOjJ9XVwiXG4gICAgICAgIGNtcCBcImEgPSBbIFtdIFtdIF1cIiAgICAgICAgICAgICAgIFwiYSA9IFtbXSxbXV1cIlxuICAgICAgICBjbXAgXCJhID0gW1tdIFtdXVwiICAgICAgICAgICAgICAgICBcImEgPSBbW10sW11dXCJcbiAgICAgICAgY21wIFwiYSA9IFtbW1tbXSBbXV0gW1tdIFtdXV1dXVwiICAgXCJhID0gW1tbW1tdLFtdXSxbW10sW11dXV1dXCJcbiAgICAgICAgY21wIFwiYSA9IFsgWzEgMl0gWzMgJzQnXSBdXCIgICAgICAgXCJhID0gW1sxLDJdLFszLCc0J11dXCJcbiAgICAgICAgY21wIFwiYSA9IFsgWy0xIC0yXSBbLTMgJzQnIC01XSBdXCIgXCJhID0gW1stMSwtMl0sWy0zLCc0JywtNV1dXCJcbiAgICAgICAgY21wIFwiYS5vbiAnYicgY1wiICAgICAgICAgICAgICAgICAgXCJhLm9uKCdiJyxjKVwiIFxuICAgICAgICBjbXAgXCJkZXNjcmliZSAndGVzdCcgLT5cIiAgICAgICAgICBcImRlc2NyaWJlKCd0ZXN0JyxmdW5jdGlvbiAoKVxcbnt9KVwiXG4gICAgICAgIGNtcCAnbG9nIFwiaGVsbG9cIiAxIFwid29ybGRcIicgICAgICAgJ2NvbnNvbGUubG9nKFwiaGVsbG9cIiwxLFwid29ybGRcIiknXG4gICAgICAgIGNtcCAnbG9nIDEgMiAzJyAgICAgICAgICAgICAgICAgICAnY29uc29sZS5sb2coMSwyLDMpJ1xuICAgICAgICBcbiAgICAgICAgY21wIFwiYSA9IFsnYScgMSAyLjMgbnVsbCB1bmRlZmluZWQgdHJ1ZSBmYWxzZSB5ZXMgbm9dXCIsIFxuICAgICAgICAgICAgICBcImEgPSBbJ2EnLDEsMi4zLG51bGwsdW5kZWZpbmVkLHRydWUsZmFsc2UsdHJ1ZSxmYWxzZV1cIlxuICAgICAgICAgICAgICBcbiAgICAgICAgIyBjbXAgXCJhID0gKCBhLCBiPTEgYz0yICkgLT5cIiwgIFwiYSA9IGZ1bmN0aW9uKGEsYj0xLGM9MSlcIlxuICAgICAgICAjIGNtcCBcImEgPSAoIGE6MSBiOjIgKSAtPlwiLCAgICAgXCJhID0gZnVuY3Rpb24oYXJnKVwiXG4gICAgICAgICMgY21wICdsb2cgXCIje2ErMX1cIiwgXCIje2F9XCInLCAgICdjb25zb2xlLmxvZyhcIlwiICsgKGEgKyAxKSwgXCJcIiArIGEpJ1xuICAgICAgICAjIGNtcCAnbG9nIFwiI3thKzF9XCIgXCIje2F9XCInLCAgICAnY29uc29sZS5sb2coXCJcIiArIChhICsgMSksIFwiXCIgKyBhKSdcbiAgICAgICAgIyBjbXAgXCJhID0gWzEgMiAtIDMgeCA0ICsgNSAnYScgYiAnYyddXCIsIFwiYSA9IFsxLDIgLSAzLHgoNCArIDUsJ2EnLGIoJ2MnKSldXCJcbiAgICAgICAgICAgIFxuICAgICAgICAjIGNtcCBcIlwiXCJcbiAgICAgICAgICAgICMgc3dpdGNoIGFcbiAgICAgICAgICAgICAgICAjIHdoZW4gMSAyIDMgdGhlblxuICAgICAgICAgICAgICAgICMgd2hlbiAnYScgJ2InICdjJyB0aGVuXG4gICAgICAgICAgICAjIFwiXCJcIixcIlwiXCJcbiAgICAgICAgICAgICMgc3dpdGNoIChhKVxuICAgICAgICAgICAgIyB7XG4gICAgICAgICAgICAgICAgIyBjYXNlIDE6XG4gICAgICAgICAgICAgICAgIyBjYXNlIDI6XG4gICAgICAgICAgICAgICAgIyBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgICMgYnJlYWs7XG4gICAgICAgICAgICAgICAgIyBjYXNlICdhJzpcbiAgICAgICAgICAgICAgICAjIGNhc2UgJ2InOlxuICAgICAgICAgICAgICAgICMgY2FzZSAnYyc6XG4gICAgICAgICAgICAjIH1cIlwiXCJcbiAgICBcbiAgICAgICAgIyBjbXAgXCJhID0gWyBbYToyXSBbYjonNCddIFtjOltdXSBdXCIsIFwiXCJcIlxuICAgICAgICAgICAgIyBhID0gW1xuICAgICAgICAgICAgICAgICMgW1xuICAgICAgICAgICAgICAgICAgICAjIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICMgYTogMlxuICAgICAgICAgICAgICAgICAgICAjIH1cbiAgICAgICAgICAgICAgICAjIF0sIFtcbiAgICAgICAgICAgICAgICAgICAgIyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAjIGI6ICc0J1xuICAgICAgICAgICAgICAgICAgICAjIH1cbiAgICAgICAgICAgICAgICAjIF0sIFtcbiAgICAgICAgICAgICAgICAgICAgIyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAjIGM6IFtdXG4gICAgICAgICAgICAgICAgICAgICMgfVxuICAgICAgICAgICAgICAgICMgXVxuICAgICAgICAgICAgIyBdO1wiXCJcIiAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAjIGNtcCBcIkBjXCIsIFwidGhpcy5jXCIgXG4gICAgICAgICMgY21wIFwiYS5vbiAnYicsIEBjXCIsIFwiYS5vbignYicsIHRoaXMuYylcIiBcbiAgICAgICAgIyBjbXAgXCJhLm9uICdiJyBAY1wiLCBcImEub24oJ2InLCB0aGlzLmMpXCIgXG4gICAgICAgICMgY21wIFwiZiAnYicsIChhKSAtPlwiLCBcImYoJ2InLGZ1bmN0aW9uKGEpXFxue30pXCIgXG4gICAgICAgICMgY21wIFwiZiAnYScgKGIpIC0+XCIsIFwiZignYScsZnVuY3Rpb24oYilcXG57fSlcIiBcbiAgICAgICAgIyBjbXAgXCJmICdiJyBub3QgYVwiLCBcImYoJ2InLCAhYSlcIiAiXX0=
//# sourceURL=../coffee/test_punctuation.coffee