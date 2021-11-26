// koffee 1.20.0
var cmp;

cmp = require('./test_utils').cmp;

describe('class', function() {
    return it('class', function() {
        cmp("class A", "class A\n{}");
        cmp("class B\n    @: ->", "class B\n{\n    constructor ()\n    {}\n}");
        cmp("class C\n    @a: ->\n    b: ->", "class C\n{\n    static a ()\n    {}\n    b ()\n    {}\n}");
        cmp("class D\n    a: =>", "class D\n{\n    constructor ()\n    {\n        this.a = this.a.bind(this);\n    }\n    a ()\n    {}\n}");
        cmp("class X\n    @: -> \n        '@'\n             \n    m: -> 'm'", "class X\n{\n    constructor ()\n    {\n        '@'\n    }\n    m ()\n    {\n        return 'm'\n    }\n}");
        return cmp("class X\n    @: -> '@'\n             \n    m: ->\n        'm'", "class X\n{\n    constructor ()\n    {\n        '@'\n    }\n    m ()\n    {\n        return 'm'\n    }\n}");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9jbGFzcy5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbInRlc3RfY2xhc3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFNQSxJQUFBOztBQUFDLE1BQU8sT0FBQSxDQUFRLGNBQVI7O0FBRVIsUUFBQSxDQUFTLE9BQVQsRUFBaUIsU0FBQTtXQUViLEVBQUEsQ0FBRyxPQUFILEVBQVcsU0FBQTtRQUVQLEdBQUEsQ0FBSSxTQUFKLEVBRVEsYUFGUjtRQU9BLEdBQUEsQ0FBSSxvQkFBSixFQUdRLDJDQUhSO1FBV0EsR0FBQSxDQUFJLGdDQUFKLEVBSVEsMERBSlI7UUFjQSxHQUFBLENBQUksb0JBQUosRUFHUSx3R0FIUjtRQWVBLEdBQUEsQ0FBSSxnRUFBSixFQU1RLDBHQU5SO2VBb0JBLEdBQUEsQ0FBSSwrREFBSixFQU1RLDBHQU5SO0lBckVPLENBQVg7QUFGYSxDQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIiMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwXG4jICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbntjbXB9ID0gcmVxdWlyZSAnLi90ZXN0X3V0aWxzJ1xuXG5kZXNjcmliZSAnY2xhc3MnIC0+XG5cbiAgICBpdCAnY2xhc3MnIC0+XG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgQVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgQVxuICAgICAgICAgICAge31cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGNsYXNzIEJcbiAgICAgICAgICAgICAgICBAOiAtPlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgQlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yICgpXG4gICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGNsYXNzIENcbiAgICAgICAgICAgICAgICBAYTogLT5cbiAgICAgICAgICAgICAgICBiOiAtPlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgQ1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0YXRpYyBhICgpXG4gICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgICAgICBiICgpXG4gICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGNsYXNzIERcbiAgICAgICAgICAgICAgICBhOiA9PlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgRFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yICgpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmEgPSB0aGlzLmEuYmluZCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYSAoKVxuICAgICAgICAgICAgICAgIHt9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBjbGFzcyBYXG4gICAgICAgICAgICAgICAgQDogLT4gXG4gICAgICAgICAgICAgICAgICAgICdAJ1xuICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG06IC0+ICdtJ1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgWFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yICgpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAnQCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbSAoKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdtJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBjbGFzcyBYXG4gICAgICAgICAgICAgICAgQDogLT4gJ0AnXG4gICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbTogLT5cbiAgICAgICAgICAgICAgICAgICAgJ20nXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBjbGFzcyBYXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3IgKClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICdAJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtICgpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ20nXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiJdfQ==
//# sourceURL=../coffee/test_class.coffee