// koffee 1.20.0

/*
 0000000  000       0000000    0000000   0000000
000       000      000   000  000       000
000       000      000000000  0000000   0000000
000       000      000   000       000       000
 0000000  0000000  000   000  0000000   0000000
 */
var cmp;

cmp = require('./utils').cmp;

describe('class', function() {
    return it('class', function() {
        cmp("class A", "\nclass A\n{}\n");
        cmp("class B\n    @: ->", "\nclass B\n{\n    constructor ()\n    {}\n}\n");
        cmp("class C\n    @a: ->\n    b: ->", "\nclass C\n{\n    static a ()\n    {}\n\n    b ()\n    {}\n}\n");
        cmp("class D\n    a: =>", "\nclass D\n{\n    constructor ()\n    {\n        this.a = this.a.bind(this)\n    }\n\n    a ()\n    {}\n}\n");
        cmp("class E\n    @f: ->\n    @g: ->", "\nclass E\n{\n    static f ()\n    {}\n\n    static g ()\n    {}\n}\n");
        cmp("class F\n    @f: ->\n    @g: ->\n    @h: ->", "\nclass F\n{\n    static f ()\n    {}\n\n    static g ()\n    {}\n\n    static h ()\n    {}\n}\n");
        cmp("class X\n    @: -> \n        '@'\n             \n    m: -> 'm'", "\nclass X\n{\n    constructor ()\n    {\n        '@'\n    }\n\n    m ()\n    {\n        return 'm'\n    }\n}\n");
        return cmp("class Y\n    @: -> '@'\n             \n    m: ->\n        'm'", "\nclass Y\n{\n    constructor ()\n    {\n        '@'\n    }\n\n    m ()\n    {\n        return 'm'\n    }\n}\n");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3MuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vY29mZmVlL3Rlc3QiLCJzb3VyY2VzIjpbImNsYXNzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQyxNQUFPLE9BQUEsQ0FBUSxTQUFSOztBQUVSLFFBQUEsQ0FBUyxPQUFULEVBQWlCLFNBQUE7V0FFYixFQUFBLENBQUcsT0FBSCxFQUFXLFNBQUE7UUFFUCxHQUFBLENBQUksU0FBSixFQUVRLGlCQUZSO1FBU0EsR0FBQSxDQUFJLG9CQUFKLEVBR1EsK0NBSFI7UUFhQSxHQUFBLENBQUksZ0NBQUosRUFJUSxnRUFKUjtRQWlCQSxHQUFBLENBQUksb0JBQUosRUFHUSw2R0FIUjtRQWtCQSxHQUFBLENBQUksaUNBQUosRUFJUSx1RUFKUjtRQWlCQSxHQUFBLENBQUksNkNBQUosRUFLUSxrR0FMUjtRQXFCQSxHQUFBLENBQUksZ0VBQUosRUFNUSxnSEFOUjtlQXVCQSxHQUFBLENBQUksK0RBQUosRUFNUSxnSEFOUjtJQXhITyxDQUFYO0FBRmEsQ0FBakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMFxuMDAwICAgICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMFxuIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcbiMjI1xuXG57Y21wfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmRlc2NyaWJlICdjbGFzcycgLT5cblxuICAgIGl0ICdjbGFzcycgLT5cblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBjbGFzcyBBXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG5cbiAgICAgICAgICAgIGNsYXNzIEFcbiAgICAgICAgICAgIHt9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGNsYXNzIEJcbiAgICAgICAgICAgICAgICBAOiAtPlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuXG4gICAgICAgICAgICBjbGFzcyBCXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3IgKClcbiAgICAgICAgICAgICAgICB7fVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBjbGFzcyBDXG4gICAgICAgICAgICAgICAgQGE6IC0+XG4gICAgICAgICAgICAgICAgYjogLT5cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2xhc3MgQ1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0YXRpYyBhICgpXG4gICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGIgKClcbiAgICAgICAgICAgICAgICB7fVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBjbGFzcyBEXG4gICAgICAgICAgICAgICAgYTogPT5cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2xhc3MgRFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yICgpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmEgPSB0aGlzLmEuYmluZCh0aGlzKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGEgKClcbiAgICAgICAgICAgICAgICB7fVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBjbGFzcyBFXG4gICAgICAgICAgICAgICAgQGY6IC0+XG4gICAgICAgICAgICAgICAgQGc6IC0+XG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNsYXNzIEVcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzdGF0aWMgZiAoKVxuICAgICAgICAgICAgICAgIHt9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBzdGF0aWMgZyAoKVxuICAgICAgICAgICAgICAgIHt9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGNsYXNzIEZcbiAgICAgICAgICAgICAgICBAZjogLT5cbiAgICAgICAgICAgICAgICBAZzogLT5cbiAgICAgICAgICAgICAgICBAaDogLT5cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2xhc3MgRlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0YXRpYyBmICgpXG4gICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHN0YXRpYyBnICgpXG4gICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHN0YXRpYyBoICgpXG4gICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgWFxuICAgICAgICAgICAgICAgIEA6IC0+IFxuICAgICAgICAgICAgICAgICAgICAnQCdcbiAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBtOiAtPiAnbSdcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2xhc3MgWFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yICgpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAnQCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBtICgpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ20nXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgWVxuICAgICAgICAgICAgICAgIEA6IC0+ICdAJ1xuICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG06IC0+XG4gICAgICAgICAgICAgICAgICAgICdtJ1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjbGFzcyBZXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3IgKClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICdAJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG0gKClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnbSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFwiXCJcIlxuXG4iXX0=
//# sourceURL=../../coffee/test/class.coffee