// koffee 1.20.0

/*
 0000000  000       0000000    0000000   0000000
000       000      000   000  000       000
000       000      000000000  0000000   0000000
000       000      000   000       000       000
 0000000  0000000  000   000  0000000   0000000
 */
var cmp, evl, ref;

ref = require('./utils'), cmp = ref.cmp, evl = ref.evl;

describe('class', function() {
    it('class', function() {
        cmp("class A", "class A\n{}\n");
        cmp("class B\n    @: ->", "class B\n{\n    constructor ()\n    {}\n}\n");
        cmp("class C\n    @a: ->\n    b: ->", "class C\n{\n    static a ()\n    {}\n\n    b ()\n    {}\n}\n");
        cmp("class D\n    a: =>", "class D\n{\n    constructor ()\n    {\n        this.a = this.a.bind(this)\n    }\n\n    a ()\n    {}\n}\n");
        cmp("class E\n    @f: ->\n    @g: ->", "class E\n{\n    static f ()\n    {}\n\n    static g ()\n    {}\n}\n");
        cmp("class F\n    @f: ->\n    @g: ->\n    @h: ->", "class F\n{\n    static f ()\n    {}\n\n    static g ()\n    {}\n\n    static h ()\n    {}\n}\n");
        cmp("class X\n    @: ->\n        '@'\n\n    m: -> 'm'", "class X\n{\n    constructor ()\n    {\n        '@'\n    }\n\n    m ()\n    {\n        return 'm'\n    }\n}\n");
        return cmp("class Y\n    @: -> '@'\n\n    m: ->\n        'm'", "class Y\n{\n    constructor ()\n    {\n        '@'\n    }\n\n    m ()\n    {\n        return 'm'\n    }\n}\n");
    });
    it('bind', function() {
        return cmp("class A\n    @: -> @f()\n    b: => log 'hello'\n    f: ->\n        g = => @b()\n        g()", "class A\n{\n    constructor ()\n    {\n        this.b = this.b.bind(this)\n        this.f()\n    }\n\n    b ()\n    {\n        console.log('hello')\n    }\n\n    f ()\n    {\n        var g\n\n        g = (function ()\n        {\n            return this.b()\n        }).bind(this)\n        return g()\n    }\n}\n");
    });
    return it('old school', function() {
        return evl("function T1\n    \n    f: (a) -> 1 + a\n\nfunction T2 extends T1\n\n    f: (a) -> super(a) + 40\n    \n(new T2).f 1", 42);
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3MuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vY29mZmVlL3Rlc3QiLCJzb3VyY2VzIjpbImNsYXNzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUFlLE9BQUEsQ0FBUSxTQUFSLENBQWYsRUFBRSxhQUFGLEVBQU87O0FBRVAsUUFBQSxDQUFTLE9BQVQsRUFBaUIsU0FBQTtJQUViLEVBQUEsQ0FBRyxPQUFILEVBQVcsU0FBQTtRQUVQLEdBQUEsQ0FBSSxTQUFKLEVBRVEsZUFGUjtRQVFBLEdBQUEsQ0FBSSxvQkFBSixFQUdRLDZDQUhSO1FBWUEsR0FBQSxDQUFJLGdDQUFKLEVBSVEsOERBSlI7UUFnQkEsR0FBQSxDQUFJLG9CQUFKLEVBR1EsMkdBSFI7UUFpQkEsR0FBQSxDQUFJLGlDQUFKLEVBSVEscUVBSlI7UUFnQkEsR0FBQSxDQUFJLDZDQUFKLEVBS1EsZ0dBTFI7UUFvQkEsR0FBQSxDQUFJLGtEQUFKLEVBTVEsOEdBTlI7ZUFzQkEsR0FBQSxDQUFJLGtEQUFKLEVBTVEsOEdBTlI7SUFqSE8sQ0FBWDtJQTZJQSxFQUFBLENBQUcsTUFBSCxFQUFVLFNBQUE7ZUFFTixHQUFBLENBQUksNkZBQUosRUFPUSx5VEFQUjtJQUZNLENBQVY7V0FxQ0EsRUFBQSxDQUFHLFlBQUgsRUFBZ0IsU0FBQTtlQUVaLEdBQUEsQ0FBSSxxSEFBSixFQVVRLEVBVlI7SUFGWSxDQUFoQjtBQXBMYSxDQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwXG4wMDAgICAgICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwXG4gMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuIyMjXG5cbnsgY21wLCBldmwgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmRlc2NyaWJlICdjbGFzcycgLT5cblxuICAgIGl0ICdjbGFzcycgLT5cblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBjbGFzcyBBXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBjbGFzcyBBXG4gICAgICAgICAgICB7fVxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBjbGFzcyBCXG4gICAgICAgICAgICAgICAgQDogLT5cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGNsYXNzIEJcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvciAoKVxuICAgICAgICAgICAgICAgIHt9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGNsYXNzIENcbiAgICAgICAgICAgICAgICBAYTogLT5cbiAgICAgICAgICAgICAgICBiOiAtPlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgQ1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0YXRpYyBhICgpXG4gICAgICAgICAgICAgICAge31cblxuICAgICAgICAgICAgICAgIGIgKClcbiAgICAgICAgICAgICAgICB7fVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBjbGFzcyBEXG4gICAgICAgICAgICAgICAgYTogPT5cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGNsYXNzIERcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvciAoKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hID0gdGhpcy5hLmJpbmQodGhpcylcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhICgpXG4gICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgRVxuICAgICAgICAgICAgICAgIEBmOiAtPlxuICAgICAgICAgICAgICAgIEBnOiAtPlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgRVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0YXRpYyBmICgpXG4gICAgICAgICAgICAgICAge31cblxuICAgICAgICAgICAgICAgIHN0YXRpYyBnICgpXG4gICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgRlxuICAgICAgICAgICAgICAgIEBmOiAtPlxuICAgICAgICAgICAgICAgIEBnOiAtPlxuICAgICAgICAgICAgICAgIEBoOiAtPlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgRlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0YXRpYyBmICgpXG4gICAgICAgICAgICAgICAge31cblxuICAgICAgICAgICAgICAgIHN0YXRpYyBnICgpXG4gICAgICAgICAgICAgICAge31cblxuICAgICAgICAgICAgICAgIHN0YXRpYyBoICgpXG4gICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgWFxuICAgICAgICAgICAgICAgIEA6IC0+XG4gICAgICAgICAgICAgICAgICAgICdAJ1xuXG4gICAgICAgICAgICAgICAgbTogLT4gJ20nXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBjbGFzcyBYXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3IgKClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICdAJ1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG0gKClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnbSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGNsYXNzIFlcbiAgICAgICAgICAgICAgICBAOiAtPiAnQCdcblxuICAgICAgICAgICAgICAgIG06IC0+XG4gICAgICAgICAgICAgICAgICAgICdtJ1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgWVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yICgpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAnQCdcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBtICgpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ20nXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgaXQgJ2JpbmQnIC0+XG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgQVxuICAgICAgICAgICAgICAgIEA6IC0+IEBmKClcbiAgICAgICAgICAgICAgICBiOiA9PiBsb2cgJ2hlbGxvJ1xuICAgICAgICAgICAgICAgIGY6IC0+XG4gICAgICAgICAgICAgICAgICAgIGcgPSA9PiBAYigpXG4gICAgICAgICAgICAgICAgICAgIGcoKVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgY2xhc3MgQVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yICgpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmIgPSB0aGlzLmIuYmluZCh0aGlzKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmYoKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGIgKClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdoZWxsbycpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZiAoKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGdcblxuICAgICAgICAgICAgICAgICAgICBnID0gKGZ1bmN0aW9uICgpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmIoKVxuICAgICAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgaXQgJ29sZCBzY2hvb2wnIC0+XG4gICAgICAgIFxuICAgICAgICBldmwgXCJcIlwiXG4gICAgICAgICAgICBmdW5jdGlvbiBUMVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGY6IChhKSAtPiAxICsgYVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBmdW5jdGlvbiBUMiBleHRlbmRzIFQxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmOiAoYSkgLT4gc3VwZXIoYSkgKyA0MFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgKG5ldyBUMikuZiAxXG4gICAgICAgICAgICBcIlwiXCIgNDJcbiJdfQ==
//# sourceURL=../../coffee/test/class.coffee