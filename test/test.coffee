assert = require 'assert'
chai   = require 'chai'
path   = require 'path'
fs     = require 'fs'
koffee = require 'koffee'
Kode   = require '../'
# expect = chai.expect
chai.should()

kode = new Kode()

lexer    = kode.lexer
parser   = kode.parser
renderer = kode.renderer

# 000      00000000  000   000  00000000  00000000
# 000      000        000 000   000       000   000
# 000      0000000     00000    0000000   0000000
# 000      000        000 000   000       000   000
# 0000000  00000000  000   000  00000000  000   000

describe 'modules' ->

    it 'tokenize' ->

        lexer.tokenize 'a=b'
        .should.eql [
                col: 0
                line: 1
                text: 'a'
                type: 'var'
            ,
                col: 1
                line: 1
                text: '='
                type: 'op'
            ,
                col: 2
                line: 1
                text: 'b'
                type: 'var'
            ]

    it 'blockify' ->

        lexer.blockify lexer.tokenize """
            if 1
                a=b
            """
        .should.eql
            type: 'block'
            tokens:
                [
                    type: 'keyword' text: 'if' line: 1 col: 0
                ,
                    type: 'num' text: '1' line: 1 col: 3
                ,
                    type:  'block'
                    indent: '    '
                    tokens:
                        [
                            col:  4
                            line: 2
                            text: 'a'
                            type: 'var'
                        ,
                            col:  5
                            line: 2
                            text: '='
                            type: 'op'
                        ,
                            col:  6
                            line: 2
                            text: 'b'
                            type: 'var'
                        ]
                    line: 2
                    last: 2
                    col:  4
                ]
            indent: ''
            line:   1
            last:   1
            col:    0

    # 00000000    0000000   00000000    0000000  00000000  00000000
    # 000   000  000   000  000   000  000       000       000   000
    # 00000000   000000000  0000000    0000000   0000000   0000000
    # 000        000   000  000   000       000  000       000   000
    # 000        000   000  000   000  0000000   00000000  000   000

    it 'parse' ->

        parser.parse lexer.blockify lexer.tokenize """
            if a then b else c
            """
        .should.eql [
            if:
                exp:
                    token:
                        col: 3
                        line: 1
                        text: "a"
                        type: "var"
                else:
                    [
                        token:
                            col: 17
                            line: 1
                            text: 'c'
                            type: 'var'
                    ]
                then:
                    [
                        token:
                            col: 10
                            line: 1
                            text: 'b'
                            type: 'var'
                    ]
            ]

    # 00000000   00000000  000   000  0000000    00000000  00000000
    # 000   000  000       0000  000  000   000  000       000   000
    # 0000000    0000000   000 0 000  000   000  0000000   0000000
    # 000   000  000       000  0000  000   000  000       000   000
    # 000   000  00000000  000   000  0000000    00000000  000   000

    it 'render' ->

        renderer.render parser.parse lexer.blockify lexer.tokenize """
            if a then b else c"""
        .should.eql """
            if (a)
            {
                b
            }
            else
            {
                c
            }"""

###
 0000000   0000000   00     00  00000000   000  000      00000000
000       000   000  000   000  000   000  000  000      000
000       000   000  000000000  00000000   000  000      0000000
000       000   000  000 0 000  000        000  000      000
 0000000   0000000   000   000  000        000  0000000  00000000
###

describe 'compile' ->

    # 000      000  000000000  00000000  00000000    0000000   000       0000000
    # 000      000     000     000       000   000  000   000  000      000
    # 000      000     000     0000000   0000000    000000000  000      0000000
    # 000      000     000     000       000   000  000   000  000           000
    # 0000000  000     000     00000000  000   000  000   000  0000000  0000000

    it 'literals' ->

        kode.compile('')         .should.eql ''
        kode.compile(' ')        .should.eql ''
        kode.compile('a')        .should.eql 'a'
        kode.compile('1')        .should.eql '1'
        kode.compile('2.2')      .should.eql '2.2'
        kode.compile('""')       .should.eql '""'
        kode.compile("''")       .should.eql "''"
        kode.compile('[]')       .should.eql '[]'
        kode.compile('{}')       .should.eql '{}'
        kode.compile('true')     .should.eql 'true'
        kode.compile('false')    .should.eql 'false'
        kode.compile('yes')      .should.eql 'true'
        kode.compile('no')       .should.eql 'false'
        kode.compile('Infinity') .should.eql 'Infinity'
        kode.compile('NaN')      .should.eql 'NaN'
        kode.compile('null')     .should.eql 'null'
        kode.compile('undefined').should.eql 'undefined'

    # 00000000   00000000    0000000   00000000
    # 000   000  000   000  000   000  000   000
    # 00000000   0000000    000   000  00000000
    # 000        000   000  000   000  000
    # 000        000   000   0000000   000

    it 'prop' ->

        kode.compile('a.a')        .should.eql 'a.a'
        kode.compile('{a:b}.a')    .should.eql '{a:b}.a'
        kode.compile('a.b.c d')    .should.eql 'a.b.c(d)'
        kode.compile('a.b.c[d]')   .should.eql 'a.b.c[d]'
        kode.compile('[a.b*c[d]]') .should.eql '[a.b * c[d]]'

    # 00000000   00000000   0000000   00000000  000   000
    # 000   000  000       000        000        000 000
    # 0000000    0000000   000  0000  0000000     00000
    # 000   000  000       000   000  000        000 000
    # 000   000  00000000   0000000   00000000  000   000

    it 'regex' ->

        kode.compile('/a/')         .should.eql '/a/'
        kode.compile('/a|b/')       .should.eql '/a|b/'
        kode.compile('/(a|b)/')     .should.eql '/(a|b)/'
        kode.compile('/(a|b)/g')    .should.eql '/(a|b)/g'
        kode.compile('/\\//gimsuy') .should.eql '/\\//gimsuy'

    #  0000000   00000000
    # 000   000  000   000
    # 000   000  00000000
    # 000   000  000
    #  0000000   000

    it 'op' ->

        kode.compile('a == b')          .should.eql 'a === b'
        kode.compile('a != b')          .should.eql 'a !== b'

        kode.compile('a and b')         .should.eql 'a && b'
        kode.compile('1 and 2 and 3')   .should.eql '1 && 2 && 3'
        kode.compile('e and (f or g)')  .should.eql 'e && (f || g)'
        kode.compile('(e and f) or g')  .should.eql '(e && f) || g'

        kode.compile """
            a and \
            b or \
            c
            """
        .should.eql "a && b || c"

        kode.compile """
            d and
                e or f and
                    g or h
            """
        .should.eql "d && e || f && g || h"

        kode.compile """
            d and
            e or f and
            g or h
            """
        .should.eql "d && e || f && g || h"

        kode.compile """
            b = 1 <= a < c
            """
        .should.eql """
            b = (1 <= a && a < c)
            """

        kode.compile """
            x = y > z >= 1
            """
        .should.eql """
            x = (y > z && z >= 1)
            """

        kode.compile """
            a = b == c == d
            """
        .should.eql """
            a = (b === c && c === d)
            """

        kode.compile """
            a = b != c != d
            """
        .should.eql """
            a = (b !== c && c !== d)
            """

    #  0000000    0000000   0000000  000   0000000   000   000
    # 000   000  000       000       000  000        0000  000
    # 000000000  0000000   0000000   000  000  0000  000 0 000
    # 000   000       000       000  000  000   000  000  0000
    # 000   000  0000000   0000000   000   0000000   000   000

    it 'assign' ->

        kode.compile('a = b')           .should.eql 'a = b'
        kode.compile('a = b = c = 1')   .should.eql 'a = b = c = 1'

        kode.compile """
            module.exports = sthg
            log 'ok'
            """
        .should.eql """
            module.exports = sthg
            console.log('ok')
            """

        kode.compile """
            a = b = c = sthg == othr
            log 'ok'
            """
        .should.eql """
            a = b = c = sthg === othr
            console.log('ok')
            """

        kode.compile """
            d = a and
            b or
                c
            """
        .should.eql "d = a && b || c"

        kode.compile """
            d = a and
                b or
                    c
            """
        .should.eql "d = a && b || c"

        kode.compile """
            d = a and
                b or
                c
            """
        .should.eql "d = a && b || c"

    # 00     00   0000000   000000000  000   000
    # 000   000  000   000     000     000   000
    # 000000000  000000000     000     000000000
    # 000 0 000  000   000     000     000   000
    # 000   000  000   000     000     000   000

    it 'math' ->

        kode.compile('a + b')           .should.eql 'a + b'
        kode.compile('a - b + c - 1')   .should.eql 'a - b + c - 1'
        kode.compile('-a +b')           .should.eql '-a + b'
        kode.compile('-a -b')           .should.eql '-a - b'
        kode.compile('-a +-b')          .should.eql '-a + -b'
        kode.compile('+a -b')           .should.eql '+a - b'
        kode.compile('+a +-b')          .should.eql '+a + -b'
        kode.compile('a + -b')          .should.eql 'a + -b'
        kode.compile('a+ -b')           .should.eql 'a + -b'
        kode.compile('a + -(b-c)')      .should.eql 'a + -(b - c)'
        kode.compile('b --c')           .should.eql 'b(--c)'
        kode.compile('a + -b --c')      .should.eql 'a + -b(--c)'

    # 000  000   000   0000000  00000000   00000000  00     00  00000000  000   000  000000000
    # 000  0000  000  000       000   000  000       000   000  000       0000  000     000
    # 000  000 0 000  000       0000000    0000000   000000000  0000000   000 0 000     000
    # 000  000  0000  000       000   000  000       000 0 000  000       000  0000     000
    # 000  000   000   0000000  000   000  00000000  000   000  00000000  000   000     000

    it 'increment' ->

        kode.compile('a++')             .should.eql 'a++'
        kode.compile('a--')             .should.eql 'a--'
        kode.compile('++a')             .should.eql '++a'
        kode.compile('--a')             .should.eql '--a'
        kode.compile('--a,++b')         .should.eql '--a\n++b'

        kode.compile('a[1]++')          .should.eql 'a[1]++'
        kode.compile('a[1]--')          .should.eql 'a[1]--'
        kode.compile('--a[1]')          .should.eql '--a[1]'
        kode.compile('++a[1]')          .should.eql '++a[1]'

        kode.compile('a.b.c++')         .should.eql 'a.b.c++'
        kode.compile('a.b.c--')         .should.eql 'a.b.c--'

        kode.compile('a(b).c++')        .should.eql 'a(b).c++'
        kode.compile('a(b).c--')        .should.eql 'a(b).c--'

        if false
            kode.compile('--a++')           .should.eql ''
            kode.compile('--a--')           .should.eql ''
            kode.compile('++a++')           .should.eql ''
            kode.compile('++a--')           .should.eql ''
            kode.compile('++--')            .should.eql ''
            kode.compile('++1')             .should.eql ''
            kode.compile('1--')             .should.eql ''
            kode.compile('""++')            .should.eql ''

        kode.compile('(--b)')           .should.eql '(--b)'
        kode.compile('(++b)')           .should.eql '(++b)'
        kode.compile('(b--)')           .should.eql '(b--)'
        kode.compile('(b++)')           .should.eql '(b++)'
        kode.compile('log(++b)')        .should.eql 'console.log(++b)'
        kode.compile('log(++{b:1}.b)')  .should.eql 'console.log(++{b:1}.b)'

    # 00000000    0000000   00000000   00000000  000   000   0000000
    # 000   000  000   000  000   000  000       0000  000  000
    # 00000000   000000000  0000000    0000000   000 0 000  0000000
    # 000        000   000  000   000  000       000  0000       000
    # 000        000   000  000   000  00000000  000   000  0000000

    it 'parens' ->

        kode.compile('(b c)')           .should.eql '(b(c))'
        kode.compile('(b --c)')         .should.eql '(b(--c))'
        kode.compile('a + (b --c)')     .should.eql 'a + (b(--c))'

    #  0000000   00000000   00000000    0000000   000   000   0000000
    # 000   000  000   000  000   000  000   000   000 000   000
    # 000000000  0000000    0000000    000000000    00000    0000000
    # 000   000  000   000  000   000  000   000     000          000
    # 000   000  000   000  000   000  000   000     000     0000000

    it 'arrays' ->
        return
        kode.compile('[1]')          .should.eql '[1]'
        kode.compile('[1 2]')        .should.eql '[1,2]'
        kode.compile('[1,2]')        .should.eql '[1,2]'
        kode.compile('[a,b]')        .should.eql '[a,b]'
        kode.compile('[ "1" ]')      .should.eql '["1"]'
        kode.compile("[ '1' ]")      .should.eql "['1']"
        kode.compile('["1" "2"]')    .should.eql '["1","2"]'
        kode.compile("['1' '2']")    .should.eql "['1','2']"
        kode.compile('["1" , "2"]')  .should.eql '["1","2"]'
        kode.compile("['1' , '2']")  .should.eql "['1','2']"
        kode.compile('[[]]')         .should.eql '[[]]'
        kode.compile('[{}]')         .should.eql '[{}]'
        kode.compile('[[[]]]')       .should.eql '[[[]]]'
        kode.compile('[[[] []]]')    .should.eql '[[[],[]]]'
        kode.compile('[[[],[]]]')    .should.eql '[[[],[]]]'
        kode.compile('[[[][]]]')     .should.eql '[[[],[]]]'
        kode.compile("[['1'] , [2]]").should.eql "[['1'],[2]]"
        kode.compile("['1' , a, true, false, null, undefined]").should.eql "['1',a,true,false,null,undefined]"
        kode.compile("""['1' "2" 3 4.5 [] {} true false null undefined NaN Infinity yes no]""").should.eql """['1',"2",3,4.5,[],{},true,false,null,undefined,NaN,Infinity,true,false]"""

    it 'array nl' ->
        return
        kode.compile """
            [
                1,2
            ]
            """
        .should.eql """[1,2]"""

        kode.compile """
            [
                1,
                2
            ]
            """
        .should.eql """[1,2]"""

        kode.compile """
            [
                1
                2
            ]
            """
        .should.eql """[1,2]"""

        kode.compile """
            [
                [
                    0
                    1
                ]
                2
            ]
            """
        .should.eql """[[0,1],2]"""

        kode.compile """
            a = [
                    [
                        0
                        1
                    ]
                    2
                ]
            """
        .should.eql """a = [[0,1],2]"""

        kode.compile """
            a =
                [
                    [
                        0
                        1
                    ]
                    2
                ]
            """
        .should.eql """a = [[0,1],2]"""

        kode.compile """
            a
                [
                    b
                        [
                            0
                            1
                        ]
                    2
                ]
            """
        .should.eql """a([b([0,1]),2])"""

        kode.compile """
            ->
                [
                    1
                    2
                ]
            """
        .should.eql """
            function ()
            {
                return [1,2]
            }
            """

    # 00000000  000   000  000   000   0000000
    # 000       000   000  0000  000  000
    # 000000    000   000  000 0 000  000
    # 000       000   000  000  0000  000
    # 000        0000000   000   000   0000000

    it 'func' ->

        kode.compile('->')              .should.eql "function ()\n{}"
        kode.compile('(a) ->')          .should.eql "function (a)\n{}"
        kode.compile('(a,b,c) ->')      .should.eql "function (a, b, c)\n{}"
        kode.compile('a = (a,b,c) ->')  .should.eql "a = function (a, b, c)\n{}"

        kode.compile """
            -> return 1
            """
        .should.eql """
            function ()
            {
                return 1
            }
            """

        kode.compile """
            ->
                1
                2
            """
        .should.eql """
            function ()
            {
                1;
                return 2
            }
            """

        kode.compile """
            ->
                return 1
                2
            """
        .should.eql """
            function ()
            {
                return 1;
                return 2
            }
            """

        kode.compile """
            ->
                1
                return 2
            """
        .should.eql """
            function ()
            {
                1;
                return 2
            }
            """

        kode.compile('a = (a,b,c) -> d')
        .should.eql """
            a = function (a, b, c)
            {
                return d
            }
            """

        kode.compile """
            a = (b,c) ->
                b = (e, f) -> g
            """
        .should.eql """
            a = function (b, c)
            {
                return b = function (e, f)
                {
                    return g
                }
            }
            """

        kode.compile """
            a = (b,c) ->
                (e, f) -> g
            """
        .should.eql """
            a = function (b, c)
            {
                return function (e, f)
                {
                    return g
                }
            }
            """

        kode.compile """
            f = ->
                (a) -> 1
            """
        .should.eql """
            f = function ()
            {
                return function (a)
                {
                    return 1
                }
            }
            """

    #  0000000   0000000          000  00000000   0000000  000000000
    # 000   000  000   000        000  000       000          000
    # 000   000  0000000          000  0000000   000          000
    # 000   000  000   000  000   000  000       000          000
    #  0000000   0000000     0000000   00000000   0000000     000

    it 'object' ->

        kode.compile('a:1')          .should.eql "{a:1}"
        kode.compile('{a:1}')        .should.eql "{a:1}"
        kode.compile('a:1 b:2')      .should.eql "{a:1,b:2}"
        kode.compile('{a:1 b:2}')    .should.eql "{a:1,b:2}"
        kode.compile('a:b:c')        .should.eql "{a:{b:c}}"
        kode.compile('a:b:c,d:e:f')  .should.eql "{a:{b:c,d:{e:f}}}"
        kode.compile('a:b c')        .should.eql "{a:b(c)}"
        kode.compile('a:b:c d:e:f')  .should.eql "{a:{b:c({d:{e:f}})}}"

        kode.compile """
            a
                {
                    a:1
                }
            """
        .should.eql """a({a:1})"""

        kode.compile """
            a =
                {
                    a:1
                }
            """
        .should.eql """a = {a:1}"""

        kode.compile """
            {a:1}
            log 3
            """
        .should.eql """
            {a:1}
            console.log(3)
            """

        kode.compile """
            o={a:1}
            log o
            """
        .should.eql """
            o = {a:1}
            console.log(o)
            """

        kode.compile """
            i = y:1
            log i
            """
        .should.eql """
            i = {y:1}
            console.log(i)
            """

        kode.compile """
            i = y:1 z:2
            log i
            """
        .should.eql """
            i = {y:1,z:2}
            console.log(i)
            """

        kode.compile """
            i = y:1 z:2; z=a:1
            log i
            """
        .should.eql """
            i = {y:1,z:2}
            z = {a:1}
            console.log(i)
            """

    # 000  000   000  0000000    00000000  000   000
    # 000  0000  000  000   000  000        000 000
    # 000  000 0 000  000   000  0000000     00000
    # 000  000  0000  000   000  000        000 000
    # 000  000   000  0000000    00000000  000   000

    it 'index' ->

        kode.compile('a[1]')          .should.eql 'a[1]'
        kode.compile('a[1][2]')       .should.eql 'a[1][2]'
        kode.compile('a[1][2]')       .should.eql 'a[1][2]'
        kode.compile('[1,2][1]')      .should.eql '[1,2][1]'
        kode.compile("{a:1}['a']")    .should.eql "{a:1}['a']"

    it 'index slice' ->

        kode.compile('a[0..1]')       .should.eql 'a.slice(0, 1+1)'
        kode.compile('a[0...1]')      .should.eql 'a.slice(0, 1)'

    # 00000000    0000000   000   000   0000000   00000000
    # 000   000  000   000  0000  000  000        000
    # 0000000    000000000  000 0 000  000  0000  0000000
    # 000   000  000   000  000  0000  000   000  000
    # 000   000  000   000  000   000   0000000   00000000

    it 'range' ->
        kode.compile('[1..10]')       .should.eql '[1,2,3,4,5,6,7,8,9,10]'
        kode.compile('[1...10]')      .should.eql '[1,2,3,4,5,6,7,8,9]'
        kode.compile('r = [1..10]')   .should.eql 'r = [1,2,3,4,5,6,7,8,9,10]'
        kode.compile('r = [1...10]')  .should.eql 'r = [1,2,3,4,5,6,7,8,9]'

        kode.compile('[1..100]').should.eql """
            (function() { var r = []; for (var i = 1; i <= 100; i++){ r.push(i); } return r; }).apply(this)
            """

    #  0000000   0000000   000      000       0000000
    # 000       000   000  000      000      000
    # 000       000000000  000      000      0000000
    # 000       000   000  000      000           000
    #  0000000  000   000  0000000  0000000  0000000

    it 'calls' ->

        kode.compile('a(b)')          .should.eql 'a(b)'
        kode.compile('a(b,c)')        .should.eql 'a(b,c)'
        kode.compile('a(1,null,"2")') .should.eql 'a(1,null,"2")'
        kode.compile('a[1](b)')       .should.eql 'a[1](b)'

        kode.compile "a('1' 2 3.4 true false null undefined NaN Infinity)"
        .should.eql  "a('1',2,3.4,true,false,null,undefined,NaN,Infinity)"

        kode.compile """
            a(
                '1'
                2
                3.4
                true
                [
                    null
                    undefined
                ]
            )"""
        .should.eql "a('1',2,3.4,true,[null,undefined])"

        kode.compile """
            a '1'
            b  2
            c  3.4
            d  true
            """
        .should.eql """
            a('1')
            b(2)
            c(3.4)
            d(true)
            """

        kode.compile """
            a b 1
            c d 2
            """
        .should.eql """
            a(b(1))
            c(d(2))
            """

        kode.compile """
            a
                b
                    1
            c
                d
                    2
            """
        .should.eql """
            a(b(1))
            c(d(2))
            """

        kode.compile """
            a
                b
                1
            c
                d
                2
            """
        .should.eql """
            a(b,1)
            c(d,2)
            """

    # 00000000   00000000   0000000   000   000  000  00000000   00000000
    # 000   000  000       000   000  000   000  000  000   000  000
    # 0000000    0000000   000 00 00  000   000  000  0000000    0000000
    # 000   000  000       000 0000   000   000  000  000   000  000
    # 000   000  00000000   00000 00   0000000   000  000   000  00000000

    it 'require' ->

        kode.compile("noon  = require 'noon'") .should.eql "noon = require('noon')"
        kode.compile """
            slash = require 'kslash'
            kstr  = require 'kstr'
            """
        .should.eql """
            slash = require('kslash')
            kstr = require('kstr')
        """

    # 000  00000000      000000000  000   000  00000000  000   000
    # 000  000              000     000   000  000       0000  000
    # 000  000000           000     000000000  0000000   000 0 000
    # 000  000              000     000   000  000       000  0000
    # 000  000              000     000   000  00000000  000   000

    it 'if' ->

        kode.compile('if false then true').should.eql """
        if (false)
        {
            true
        }"""

        kode.compile """
            if false
                true
            """
        .should.eql """
        if (false)
        {
            true
        }"""

        kode.compile """
            if false
                true
            a = 1
            """
        .should.eql """
        if (false)
        {
            true
        }
        a = 1"""

        kode.compile """
            if false then true else no
            a = 1
            """
        .should.eql """
        if (false)
        {
            true
        }
        else
        {
            false
        }
        a = 1"""

        kode.compile """
            if false then log no
            log yes
            """
        .should.eql """
            if (false)
            {
                console.log(false)
            }
            console.log(true)
            """

        kode.compile """
            if false
                log no
            log yes
            """
        .should.eql """
            if (false)
            {
                console.log(false)
            }
            console.log(true)
            """

        kode.compile """
            if false then true else log no
            log yes
            """
        .should.eql """
            if (false)
            {
                true
            }
            else
            {
                console.log(false)
            }
            console.log(true)
            """

        kode.compile """
            a = if 0 then if 1 then if 2 then 3 else if 4 then 5 else 6 else if 7 then 8 else 9 else if 10 then 11 else 12
            """
        .should.eql """
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
            }"""

    # 00000000   0000000   00000000         000  000   000
    # 000       000   000  000   000        000  0000  000
    # 000000    000   000  0000000          000  000 0 000
    # 000       000   000  000   000        000  000  0000
    # 000        0000000   000   000        000  000   000

    it 'for in' ->

        kode.compile """
            for t in l
                t
            """
        .should.eql """
            var list = l
            for (var i = 0; i < list.length; i++)
            {
                t = list[i]
                t
            }
            """

        kode.compile """for a in [1,2,3] then log a"""
        .should.eql """
            var list = [1,2,3]
            for (var i = 0; i < list.length; i++)
            {
                a = list[i]
                console.log(a)
            }
            """

        kode.compile """
            for a in [1,2,3] then log a
            log a
            """
        .should.eql """
            var list = [1,2,3]
            for (var i = 0; i < list.length; i++)
            {
                a = list[i]
                console.log(a)
            }
            console.log(a)
            """

    # 000   000  000   000  000  000      00000000
    # 000 0 000  000   000  000  000      000
    # 000000000  000000000  000  000      0000000
    # 000   000  000   000  000  000      000
    # 00     00  000   000  000  0000000  00000000

    it 'while' ->

        kode.compile """
            while true
                log true
            """
        .should.eql """
            while (true)
            {
                console.log(true)
            }
            """

        kode.compile """
            while true then log true
            """
        .should.eql """
            while (true)
            {
                console.log(true)
            }
            """

        kode.compile """
            while a == b then log c; log d
            log e
            """
        .should.eql """
            while (a === b)
            {
                console.log(c)
                console.log(d)
            }
            console.log(e)
            """

    #  0000000  000       0000000    0000000   0000000
    # 000       000      000   000  000       000
    # 000       000      000000000  0000000   0000000
    # 000       000      000   000       000       000
    #  0000000  0000000  000   000  0000000   0000000

    it 'class' ->

        kode.compile """
            class A
            """
        .should.eql """
            class A
            {}
            """

        kode.compile """
            class B
                @: ->
            """
        .should.eql """
            class B
            {
                constructor ()
                {}
            }
            """

        kode.compile """
            class C
                @a: ->
                b: ->
            """
        .should.eql """
            class C
            {
                static a ()
                {}
                b ()
                {}
            }
            """

        kode.compile """
            class D
                a: =>
            """
        .should.eql """
            class D
            {
                constructor ()
                {
                    this.a = this.a.bind(this);
                }
                a ()
                {}
            }
            """

    it 'switch' ->

        kode.compile """
            switch a
                when 1 then 2
            """
        .should.eql """
            switch (a)
            {
                case 1:
                    2
                    break
            }\n"""

    # 000  000   000  000000000  00000000  00000000   00000000    0000000   000
    # 000  0000  000     000     000       000   000  000   000  000   000  000
    # 000  000 0 000     000     0000000   0000000    00000000   000   000  000
    # 000  000  0000     000     000       000   000  000        000   000  000
    # 000  000   000     000     00000000  000   000  000         0000000   0000000

    # it 'string interpolation as object keys' ->

        # kode.compile """
            # interpol='fark'
            # log \"\"\"
            # hello \#{interpol}
            # world
            # \"\"\":5
        # """.should.eql """
            # var interpol, obj
            # interpol = 'fark'
            # console.log((
                # obj = {},
                # obj["hello " + interpol + "\nworld"] = 5,
                # obj
            # ))
        # """
