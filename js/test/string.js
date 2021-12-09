// monsterkodi/kode 0.66.0

var _k_ = {list:   function (l)   {return (l != null ? typeof l.length === 'number' ? l : [] : [])},             length: function (l)   {return (l != null ? typeof l.length === 'number' ? l.length : 0 : 0)},             in:     function (a,l) {return (l != null ? typeof l.indexOf === 'function' ? l.indexOf(a) >= 0 : false : false)},             extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var cmp, evl

cmp = require('./utils').cmp
evl = require('./utils').evl

describe('string',function ()
{
    it('triple',function ()
    {
        cmp(`log \"\"\"
    hello
    \"\"\"`,`console.log(`hello`)`)
        evl(`a =\"\"\"
    hello
    \"\"\"`,'hello')
        evl(`a =\"\"\"
hello
    \"\"\"`,'hello')
        evl(`a =\"\"\"hello\"\"\"`,'hello')
        evl(`a =\"\"\"   hello\"\"\"`,'   hello')
        evl(`a =\"\"\"   hello   \"\"\"`,'   hello   ')
        evl(`a =\"\"\"
    hello
world
    \"\"\"`,'    hello\nworld')
        evl(`a =\"\"\"
        hello
    world
    \"\"\"`,'    hello\nworld')
        evl(`a =\"\"\"
        hello
    world
            ugga
    \"\"\"`,`    hello
world
        ugga`)
        evl(`a =\"\"\"heLlo world\"\"\"`,`heLlo world`)
        evl(`a =\"\"\" helLo world\"\"\"`,` helLo world`)
        evl(`a =\"\"\"   hellO world   \"\"\"`,`   hellO world   `)
        return evl(`a =\"\"\"   hello World
\"\"\"`,`   hello World`)
    })
    return it('interpolation',function ()
    {
        cmp(`'${}'`,`'${}'`)
        cmp('"#{}"',"`${}`")
        cmp('"#{1}"',"`${1}`")
        cmp('"#{a}"',"`${a}`")
        cmp('"01234\#{}890"',"`01234${}890`")
        cmp('"01234#{}890"',"`01234${}890`")
        cmp('log "#{a+1}", "#{a}"','console.log(`${a + 1}`,`${a}`)')
        cmp('"#{b+2}" ; "#{b}"','`${b + 2}`\n`${b}`')
        cmp('log "- #{c+3} - #{c}"','console.log(`- ${c + 3} - ${c}`)')
        cmp('"""tri#{triple}ple""" ; "dou#{double}ble"','`tri${triple}ple`\n`dou${double}ble`')
        cmp('"#{\'a\'}"',"`${'a'}`")
        cmp('"""#{"a"}"""','`${"a"}`')
        cmp('"nullcheck in #{stripol ? 123}"',"`nullcheck in ${(stripol != null ? stripol : 123)}`")
        return cmp('"""{ok#} #{"well" + "1+\'2\' #{\'omg\'}" + is kinda fukked}"""',"`{ok#} ${\"well\" + `1+'2' ${'omg'}` + is(kinda(fukked))}`")
    })
})