// koffee 1.20.0

/*
 0000000  000       0000000    0000000   0000000
000       000      000   000  000       000
000       000      000000000  0000000   0000000
000       000      000   000       000       000
 0000000  0000000  000   000  0000000   0000000
 */
var cmp;

cmp = require('./test_utils').cmp;

describe('class', function() {
    return it('class', function() {
        cmp("class A", "class A\n{}");
        cmp("class B\n    @: ->", "class B\n{\n    constructor ()\n    {}\n}");
        cmp("class C\n    @a: ->\n    b: ->", "class C\n{\n    static a ()\n    {}\n    b ()\n    {}\n}");
        cmp("class D\n    a: =>", "class D\n{\n    constructor ()\n    {\n        this.a = this.a.bind(this)\n    }\n    a ()\n    {}\n}");
        cmp("class X\n    @: -> \n        '@'\n             \n    m: -> 'm'", "class X\n{\n    constructor ()\n    {\n        '@'\n    }\n    m ()\n    {\n        return 'm'\n    }\n}");
        return cmp("class Y\n    @: -> '@'\n             \n    m: ->\n        'm'", "class Y\n{\n    constructor ()\n    {\n        '@'\n    }\n    m ()\n    {\n        return 'm'\n    }\n}");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9jbGFzcy5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbInRlc3RfY2xhc3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFDLE1BQU8sT0FBQSxDQUFRLGNBQVI7O0FBRVIsUUFBQSxDQUFTLE9BQVQsRUFBaUIsU0FBQTtXQUViLEVBQUEsQ0FBRyxPQUFILEVBQVcsU0FBQTtRQUVQLEdBQUEsQ0FBSSxTQUFKLEVBRVEsYUFGUjtRQU9BLEdBQUEsQ0FBSSxvQkFBSixFQUdRLDJDQUhSO1FBV0EsR0FBQSxDQUFJLGdDQUFKLEVBSVEsMERBSlI7UUFjQSxHQUFBLENBQUksb0JBQUosRUFHUSx1R0FIUjtRQWVBLEdBQUEsQ0FBSSxnRUFBSixFQU1RLDBHQU5SO2VBb0JBLEdBQUEsQ0FBSSwrREFBSixFQU1RLDBHQU5SO0lBckVPLENBQVg7QUFGYSxDQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwXG4wMDAgICAgICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwXG4gMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuIyMjXG5cbntjbXB9ID0gcmVxdWlyZSAnLi90ZXN0X3V0aWxzJ1xuXG5kZXNjcmliZSAnY2xhc3MnIC0+XG5cbiAgICBpdCAnY2xhc3MnIC0+XG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgQVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgQVxuICAgICAgICAgICAge31cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGNsYXNzIEJcbiAgICAgICAgICAgICAgICBAOiAtPlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgQlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yICgpXG4gICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGNsYXNzIENcbiAgICAgICAgICAgICAgICBAYTogLT5cbiAgICAgICAgICAgICAgICBiOiAtPlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgQ1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0YXRpYyBhICgpXG4gICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgICAgICBiICgpXG4gICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGNsYXNzIERcbiAgICAgICAgICAgICAgICBhOiA9PlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgRFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yICgpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmEgPSB0aGlzLmEuYmluZCh0aGlzKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhICgpXG4gICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGNsYXNzIFhcbiAgICAgICAgICAgICAgICBAOiAtPiBcbiAgICAgICAgICAgICAgICAgICAgJ0AnXG4gICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbTogLT4gJ20nXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBjbGFzcyBYXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3IgKClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICdAJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtICgpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ20nXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGNsYXNzIFlcbiAgICAgICAgICAgICAgICBAOiAtPiAnQCdcbiAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBtOiAtPlxuICAgICAgICAgICAgICAgICAgICAnbSdcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGNsYXNzIFlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvciAoKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgJ0AnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG0gKClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnbSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuIl19
//# sourceURL=../coffee/test_class.coffee