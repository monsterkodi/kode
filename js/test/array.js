// monsterkodi/kode 0.93.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}, each_r: function (o) {return o instanceof Array ? [] : typeof o == 'string' ? o.split('') : {}}}

var kc, ke

kc = require('./utils').kc
ke = require('./utils').ke

module.exports["array"] = function ()
{
    section("index", function ()
    {
        compare(kc('a[1]'),'a[1]')
        compare(kc('a[1][2]'),'a[1][2]')
        compare(kc('a[1][2]'),'a[1][2]')
        compare(kc('[1,2][1]'),';[1,2][1]')
        compare(kc('{a:1}["a"]'),'{a:1}["a"]')
    })
    section("index slice", function ()
    {
        compare(kc('a[0..1]'),'a.slice(0, 2)')
        compare(kc('a[0...1]'),'a.slice(0, 1)')
        compare(kc('a[-1]'),'a.slice(-1)[0]')
        compare(kc('a[-2]'),'a.slice(-2,-1)[0]')
        compare(kc('a[-100]'),'a.slice(-100,-99)[0]')
        compare(kc(`blocks[-1].tokens.push block
blocks.push block`),`blocks.slice(-1)[0].tokens.push(block)
blocks.push(block)`)
    })
    section("range", function ()
    {
        compare(kc('[1..10]'),';[1,2,3,4,5,6,7,8,9,10]')
        compare(kc('[1...10]'),';[1,2,3,4,5,6,7,8,9]')
        compare(kc('r = [1..10]'),'r = [1,2,3,4,5,6,7,8,9,10]')
        compare(kc('r = [1...10]'),'r = [1,2,3,4,5,6,7,8,9]')
        compare(kc('[1..100]'),`;(function() { var r = []; for (var i = 1; i <= 100; i++){ r.push(i); } return r; }).apply(this)`)
        compare(kc('[1...100]'),`;(function() { var r = []; for (var i = 1; i < 100; i++){ r.push(i); } return r; }).apply(this)`)
        compare(kc('[-3..3]'),';[-3,-2,-1,0,1,2,3]')
    })
    section("slice", function ()
    {
        compare(kc("a[1..4]"),"a.slice(1, 5)")
        compare(kc("a[1...4]"),"a.slice(1, 4)")
        compare(kc("a[1...a]"),"a.slice(1, typeof a === 'number' ? a : -1)")
        compare(kc("a[1..a]"),"a.slice(1, typeof a === 'number' ? a+1 : Infinity)")
        compare(kc("a[1..a.b]"),"a.slice(1, typeof a.b === 'number' ? a.b+1 : Infinity)")
        compare(kc("a[1..a[2]]"),"a.slice(1, typeof a[2] === 'number' ? a[2]+1 : Infinity)")
        compare(kc("a[1..a[3].b]"),"a.slice(1, typeof a[3].b === 'number' ? a[3].b+1 : Infinity)")
        compare(kc("b[c...-1]"),"b.slice(c, -1)")
        compare(kc("b[c.d...-1]"),"b.slice(c.d, -1)")
        compare(kc("b[c[0]...-1]"),"b.slice(c[0], -1)")
        compare(kc("b[c[0].d..-1]"),"b.slice(c[0].d)")
        compare(kc("s[i+1..]"),"s.slice(i + 1)")
        compare(kc("s[i+1...]"),"s.slice(i + 1, -1)")
        compare(kc("o[0..-1]"),"o.slice(0)")
        compare(kc("q[..-1]"),"q.slice(0)")
        compare(kc("p[0..]"),"p.slice(0)")
        compare(kc("r[..]"),"r.slice(0)")
        compare(kc("s[ic...c+index]"),"s.slice(ic, c + index)")
        compare(kc("s[...i] + s[i+1..]"),"s.slice(0, typeof i === 'number' ? i : -1) + s.slice(i + 1)")
        compare(ke("'abc'[0..1]"),"ab")
        compare(ke("'abc'[0..2]"),"abc")
        compare(ke("'xyz'[0..]"),"xyz")
        compare(ke("'uvw'[0...]"),"uv")
    })
    section("array", function ()
    {
        compare(kc('[1]'),';[1]')
        compare(kc('[1 2]'),';[1,2]')
        compare(kc('[1,2]'),';[1,2]')
        compare(kc('[a,b]'),';[a,b]')
        compare(kc('[ "1" ]'),';["1"]')
        compare(kc("[ '1' ]"),";['1']")
        compare(kc('["1" "2"]'),';["1","2"]')
        compare(kc("['1' '2']"),";['1','2']")
        compare(kc('["1" , "2"]'),';["1","2"]')
        compare(kc("['1' , '2']"),";['1','2']")
        compare(kc("[['1'] , [2]]"),";[['1'],[2]]")
        compare(kc('[[]]'),';[[]]')
        compare(kc('[{}]'),';[{}]')
        compare(kc('[[[]]]'),';[[[]]]')
        compare(kc('[[[] []]]'),';[[[],[]]]')
        compare(kc('[[[],[]]]'),';[[[],[]]]')
        compare(kc('[[[][]]]'),';[[[],[]]]')
        compare(kc('[[[1]], 1]'),';[[[1]],1]')
        compare(kc('[b(c)]'),';[b(c)]')
        compare(kc('[b c]'),';[b(c)]')
        compare(kc("['1' , a, true, false, null, undefined]"),";['1',a,true,false,null,undefined]")
        compare(kc("a = [1 2 - 3 x 4 + 5 'a' b 'c']"),"a = [1,2 - 3,x(4 + 5,'a',b('c'))]")
        compare(kc(`['1' "2" 3 4.5 [] {} true false null undefined NaN Infinity yes no]`),`;['1',"2",3,4.5,[],{},true,false,null,undefined,NaN,Infinity,true,false]`)
    })
    section("objects", function ()
    {
        compare(kc('[a:b]'),';[{a:b}]')
        compare(kc(`a = [{
        a:1
        b:2
        c:3
    }{
        x:1
        y:2
        z:3
    }]`),`a = [{a:1,b:2,c:3},{x:1,y:2,z:3}]`)
        compare(kc(`a = [
        a:4
        b:5
    ,
        x:6
        y:7
    ]`),`a = [{a:4,b:5},{x:6,y:7}]`)
    })
    section("function", function ()
    {
        compare(kc('[a -3]'),';[a(-3)]')
    })
    section("assign", function ()
    {
        compare(kc('[l, r] = a'),'l = a[0]\nr = a[1]\n')
    })
    section("blocks", function ()
    {
        compare(kc(`[
    1,2
]`),`;[1,2]`)
        compare(kc(`[
    1,
    2
]`),`;[1,2]`)
        compare(kc(`[
    1
    2
]`),`;[1,2]`)
        compare(kc(`[
    [
        0
        1
    ]
    2
]`),`;[[0,1],2]`)
        compare(kc(`a = [
        [
            0
            1
        ]
        2
    ]`),`a = [[0,1],2]`)
        compare(kc(`a =
    [
        [
            0
            1
        ]
        2
    ]`),`a = [[0,1],2]`)
        compare(kc(`[
    b
        [
            0
            1
        ]
    2
]`),`;[b([0,1]),2]`)
        compare(kc(`a
    [
        b
            [
                0
                1
            ]
        2
    ]`),`a([b([0,1]),2])`)
        compare(kc(`->
    [
        1
        2
    ]`),`(function ()
{
    return [1,2]
})`)
        compare(kc(`l = [
     1 2 3 'a'
     c:
      d:3
      e:4
     f:
      'b'
     'c'
     l =
        1
    ]`),`l = [1,2,3,'a',{c:{d:3,e:4},f:'b'},'c',l = 1]`)
        compare(kc(`l = [[ [
        [[
          1
          2
          ]
         ]
        ]]   ]`),`l = [[[[[1,2]]]]]`)
        compare(kc(`l = [[1
       2]]`),`l = [[1,2]]`)
        compare(kc(`l = [[1
  2]]`),`l = [[1,2]]`)
        compare(kc(`l = [[1
    2]
      ]`),`l = [[1,2]]`)
        compare(kc(`l = [[1 2]
    ]`),`l = [[1,2]]`)
    })
}
module.exports["array"]._section_ = true
module.exports
