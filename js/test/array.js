// monsterkodi/kode 0.68.0

var _k_ = {list:   function (l)   {return (l != null ? typeof l.length === 'number' ? l : [] : [])},             length: function (l)   {return (l != null ? typeof l.length === 'number' ? l.length : 0 : 0)},             in:     function (a,l) {return (l != null ? typeof l.indexOf === 'function' ? l.indexOf(a) >= 0 : false : false)},             extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var cmp, evl

cmp = require('./utils').cmp
evl = require('./utils').evl

describe('array',function ()
{
    it('index',function ()
    {
        cmp('a[1]','a[1]')
        cmp('a[1][2]','a[1][2]')
        cmp('a[1][2]','a[1][2]')
        cmp('[1,2][1]',';[1,2][1]')
        return cmp('{a:1}["a"]','{a:1}["a"]')
    })
    it('index slice',function ()
    {
        cmp('a[0..1]','a.slice(0, 2)')
        cmp('a[0...1]','a.slice(0, 1)')
        cmp('a[-1]','a.slice(-1)[0]')
        cmp('a[-2]','a.slice(-2,-1)[0]')
        cmp('a[-100]','a.slice(-100,-99)[0]')
        return cmp(`blocks[-1].tokens.push block
blocks.push block`,`blocks.slice(-1)[0].tokens.push(block)
blocks.push(block)`)
    })
    it('range',function ()
    {
        cmp('[1..10]',';[1,2,3,4,5,6,7,8,9,10]')
        cmp('[1...10]',';[1,2,3,4,5,6,7,8,9]')
        cmp('r = [1..10]','r = [1,2,3,4,5,6,7,8,9,10]')
        cmp('r = [1...10]','r = [1,2,3,4,5,6,7,8,9]')
        cmp('[1..100]',`;(function() { var r = []; for (var i = 1; i <= 100; i++){ r.push(i); } return r; }).apply(this)`)
        cmp('[1...100]',`;(function() { var r = []; for (var i = 1; i < 100; i++){ r.push(i); } return r; }).apply(this)`)
        return cmp('[-3..3]',';[-3,-2,-1,0,1,2,3]')
    })
    it('slice',function ()
    {
        cmp("a[1..4]","a.slice(1, 5)")
        cmp("a[1...4]","a.slice(1, 4)")
        cmp("a[1...a]","a.slice(1, typeof a === 'number' ? a : -1)")
        cmp("a[1..a]","a.slice(1, typeof a === 'number' ? a+1 : Infinity)")
        cmp("a[1..a.b]","a.slice(1, typeof a.b === 'number' ? a.b+1 : Infinity)")
        cmp("a[1..a[2]]","a.slice(1, typeof a[2] === 'number' ? a[2]+1 : Infinity)")
        cmp("a[1..a[3].b]","a.slice(1, typeof a[3].b === 'number' ? a[3].b+1 : Infinity)")
        cmp("b[c...-1]","b.slice(c, -1)")
        cmp("b[c.d...-1]","b.slice(c.d, -1)")
        cmp("b[c[0]...-1]","b.slice(c[0], -1)")
        cmp("b[c[0].d..-1]","b.slice(c[0].d)")
        cmp("s[i+1..]","s.slice(i + 1)")
        cmp("s[i+1...]","s.slice(i + 1, -1)")
        cmp("o[0..-1]","o.slice(0)")
        cmp("q[..-1]","q.slice(0)")
        cmp("p[0..]","p.slice(0)")
        cmp("r[..]","r.slice(0)")
        cmp("s[ic...c+index]","s.slice(ic, c + index)")
        cmp("s[...i] + s[i+1..]","s.slice(0, typeof i === 'number' ? i : -1) + s.slice(i + 1)")
        evl("'abc'[0..1]","ab")
        evl("'abc'[0..2]","abc")
        evl("'xyz'[0..]","xyz")
        return evl("'uvw'[0...]","uv")
    })
    it('array',function ()
    {
        cmp('[1]',';[1]')
        cmp('[1 2]',';[1,2]')
        cmp('[1,2]',';[1,2]')
        cmp('[a,b]',';[a,b]')
        cmp('[ "1" ]',';["1"]')
        cmp("[ '1' ]",";['1']")
        cmp('["1" "2"]',';["1","2"]')
        cmp("['1' '2']",";['1','2']")
        cmp('["1" , "2"]',';["1","2"]')
        cmp("['1' , '2']",";['1','2']")
        cmp("[['1'] , [2]]",";[['1'],[2]]")
        cmp('[[]]',';[[]]')
        cmp('[{}]',';[{}]')
        cmp('[[[]]]',';[[[]]]')
        cmp('[[[] []]]',';[[[],[]]]')
        cmp('[[[],[]]]',';[[[],[]]]')
        cmp('[[[][]]]',';[[[],[]]]')
        cmp('[[[1]], 1]',';[[[1]],1]')
        cmp('[b(c)]',';[b(c)]')
        cmp('[b c]',';[b(c)]')
        cmp("['1' , a, true, false, null, undefined]",";['1',a,true,false,null,undefined]")
        cmp("a = [1 2 - 3 x 4 + 5 'a' b 'c']","a = [1,2 - 3,x(4 + 5,'a',b('c'))]")
        return cmp(`['1' "2" 3 4.5 [] {} true false null undefined NaN Infinity yes no]`,`;['1',"2",3,4.5,[],{},true,false,null,undefined,NaN,Infinity,true,false]`)
    })
    it('objects',function ()
    {
        cmp('[a:b]',';[{a:b}]')
        cmp(`a = [{
        a:1
        b:2
        c:3
    }{
        x:1
        y:2
        z:3
    }]`,`a = [{a:1,b:2,c:3},{x:1,y:2,z:3}]`)
        return cmp(`a = [
        a:4
        b:5
    ,
        x:6
        y:7
    ]`,`a = [{a:4,b:5},{x:6,y:7}]`)
    })
    it('function',function ()
    {
        return cmp('[a -3]',';[a(-3)]')
    })
    it('assign',function ()
    {
        return cmp('[l, r] = a','l = a[0]\nr = a[1]\n')
    })
    return it('blocks',function ()
    {
        cmp(`[
    1,2
]`,`;[1,2]`)
        cmp(`[
    1,
    2
]`,`;[1,2]`)
        cmp(`[
    1
    2
]`,`;[1,2]`)
        cmp(`[
    [
        0
        1
    ]
    2
]`,`;[[0,1],2]`)
        cmp(`a = [
        [
            0
            1
        ]
        2
    ]`,`a = [[0,1],2]`)
        cmp(`a =
    [
        [
            0
            1
        ]
        2
    ]`,`a = [[0,1],2]`)
        cmp(`[
    b
        [
            0
            1
        ]
    2
]`,`;[b([0,1]),2]`)
        cmp(`a
    [
        b
            [
                0
                1
            ]
        2
    ]`,`a([b([0,1]),2])`)
        cmp(`->
    [
        1
        2
    ]`,`(function ()
{
    return [1,2]
})`)
        cmp(`l = [
     1 2 3 'a'
     c:
      d:3
      e:4
     f:
      'b'
     'c'
     l =
        1
    ]`,`l = [1,2,3,'a',{c:{d:3,e:4},f:'b'},'c',l = 1]`)
        cmp(`l = [[ [
        [[
          1
          2
          ]
         ]
        ]]   ]`,`l = [[[[[1,2]]]]]`)
        cmp(`l = [[1
       2]]`,`l = [[1,2]]`)
        cmp(`l = [[1
  2]]`,`l = [[1,2]]`)
        cmp(`l = [[1
    2]
      ]`,`l = [[1,2]]`)
        return cmp(`l = [[1 2]
    ]`,`l = [[1,2]]`)
    })
})