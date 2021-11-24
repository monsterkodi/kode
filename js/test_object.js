// koffee 1.20.0

/*
 0000000   0000000          000  00000000   0000000  000000000
000   000  000   000        000  000       000          000
000   000  0000000          000  0000000   000          000
000   000  000   000  000   000  000       000          000
 0000000   0000000     0000000   00000000   0000000     000
 */
var cmp;

cmp = require('./test_utils').cmp;

describe('object', function() {
    return it('object', function() {
        cmp('a:1', '{a:1}');
        cmp('{a:1}', '{a:1}');
        cmp('a:1 b:2', '{a:1,b:2}');
        cmp('{a:3 b:4}', '{a:3,b:4}');
        cmp('a:b:c', '{a:{b:c}}');
        cmp('a:b:c,d:e:f', '{a:{b:c,d:{e:f}}}');
        cmp('a:b c', '{a:b(c)}');
        cmp('a:b:c d:e:f', '{a:{b:c({d:{e:f}})}}');
        cmp('o = { a:1 b:2 c: d:4 e:5 }', 'o = {a:1,b:2,c:{d:4,e:5}}');
        cmp("a\n    {\n        a:1\n    }", "a({a:1})");
        cmp("a =\n    {\n        a:1\n    }", "a = {a:1}");
        cmp("{a:1}\nlog 3", "{a:1}\nconsole.log(3)");
        cmp("o={a:1}\nlog o", "o = {a:1}\nconsole.log(o)");
        cmp("i = y:1\nlog i", "i = {y:1}\nconsole.log(i)");
        cmp("i = y:1 z:2\nlog i", "i = {y:1,z:2}\nconsole.log(i)");
        return cmp("i = y:1 z:2; z=a:1\nlog i", "i = {y:1,z:2}\nz = {a:1}\nconsole.log(i)");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9vYmplY3QuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJ0ZXN0X29iamVjdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUMsTUFBTyxPQUFBLENBQVEsY0FBUjs7QUFFUixRQUFBLENBQVMsUUFBVCxFQUFrQixTQUFBO1dBR2QsRUFBQSxDQUFHLFFBQUgsRUFBWSxTQUFBO1FBRVIsR0FBQSxDQUFJLEtBQUosRUFBb0IsT0FBcEI7UUFDQSxHQUFBLENBQUksT0FBSixFQUFvQixPQUFwQjtRQUNBLEdBQUEsQ0FBSSxTQUFKLEVBQW9CLFdBQXBCO1FBQ0EsR0FBQSxDQUFJLFdBQUosRUFBb0IsV0FBcEI7UUFDQSxHQUFBLENBQUksT0FBSixFQUFvQixXQUFwQjtRQUNBLEdBQUEsQ0FBSSxhQUFKLEVBQW9CLG1CQUFwQjtRQUNBLEdBQUEsQ0FBSSxPQUFKLEVBQW9CLFVBQXBCO1FBQ0EsR0FBQSxDQUFJLGFBQUosRUFBb0Isc0JBQXBCO1FBRUEsR0FBQSxDQUFJLDRCQUFKLEVBQWlDLDJCQUFqQztRQUVBLEdBQUEsQ0FBSSw4QkFBSixFQUtRLFVBTFI7UUFTQSxHQUFBLENBQUksZ0NBQUosRUFLUSxXQUxSO1FBU0EsR0FBQSxDQUFJLGNBQUosRUFHUSx1QkFIUjtRQVFBLEdBQUEsQ0FBSSxnQkFBSixFQUdRLDJCQUhSO1FBUUEsR0FBQSxDQUFJLGdCQUFKLEVBR1EsMkJBSFI7UUFRQSxHQUFBLENBQUksb0JBQUosRUFHUSwrQkFIUjtlQVFBLEdBQUEsQ0FBSSwyQkFBSixFQUdRLDBDQUhSO0lBL0RRLENBQVo7QUFIYyxDQUFsQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4wMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwXG4jIyNcblxue2NtcH0gPSByZXF1aXJlICcuL3Rlc3RfdXRpbHMnXG5cbmRlc2NyaWJlICdvYmplY3QnIC0+XG4gICAgICAgIFxuXG4gICAgaXQgJ29iamVjdCcgLT5cblxuICAgICAgICBjbXAgJ2E6MScgICAgICAgICAgICd7YToxfSdcbiAgICAgICAgY21wICd7YToxfScgICAgICAgICAne2E6MX0nXG4gICAgICAgIGNtcCAnYToxIGI6MicgICAgICAgJ3thOjEsYjoyfSdcbiAgICAgICAgY21wICd7YTozIGI6NH0nICAgICAne2E6MyxiOjR9J1xuICAgICAgICBjbXAgJ2E6YjpjJyAgICAgICAgICd7YTp7YjpjfX0nXG4gICAgICAgIGNtcCAnYTpiOmMsZDplOmYnICAgJ3thOntiOmMsZDp7ZTpmfX19J1xuICAgICAgICBjbXAgJ2E6YiBjJyAgICAgICAgICd7YTpiKGMpfSdcbiAgICAgICAgY21wICdhOmI6YyBkOmU6ZicgICAne2E6e2I6Yyh7ZDp7ZTpmfX0pfX0nXG5cbiAgICAgICAgY21wICdvID0geyBhOjEgYjoyIGM6IGQ6NCBlOjUgfScgJ28gPSB7YToxLGI6MixjOntkOjQsZTo1fX0nXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYToxXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSh7YToxfSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYToxXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSA9IHthOjF9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICB7YToxfVxuICAgICAgICAgICAgbG9nIDNcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHthOjF9XG4gICAgICAgICAgICBjb25zb2xlLmxvZygzKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgbz17YToxfVxuICAgICAgICAgICAgbG9nIG9cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIG8gPSB7YToxfVxuICAgICAgICAgICAgY29uc29sZS5sb2cobylcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGkgPSB5OjFcbiAgICAgICAgICAgIGxvZyBpXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpID0ge3k6MX1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGkpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpID0geToxIHo6MlxuICAgICAgICAgICAgbG9nIGlcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGkgPSB7eToxLHo6Mn1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGkpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpID0geToxIHo6Mjsgej1hOjFcbiAgICAgICAgICAgIGxvZyBpXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpID0ge3k6MSx6OjJ9XG4gICAgICAgICAgICB6ID0ge2E6MX1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGkpXG4gICAgICAgICAgICBcIlwiXCJcbiJdfQ==
//# sourceURL=../coffee/test_object.coffee