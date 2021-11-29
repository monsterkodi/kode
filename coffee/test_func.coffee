###
00000000  000   000  000   000   0000000
000       000   000  0000  000  000
000000    000   000  000 0 000  000
000       000   000  000  0000  000
000        0000000   000   000   0000000
###

{cmp} = require './test_utils'

describe 'func' ->

    it 'func' ->

        cmp '->'               'function ()\n{}'
        cmp '(a) ->'           'function (a)\n{}'
        cmp '(a,b,c) ->'       'function (a, b, c)\n{}'
        cmp 'a = (a,b,c) ->'   'a = function (a, b, c)\n{}'

        cmp """
            -> return 1
            """ """
            function ()
            {
                return 1
            }
            """

        cmp """
            ->
                1
                2
            """ """
            function ()
            {
                1
                return 2
            }
            """

        cmp """
            ->
                return 1
                2
            """ """
            function ()
            {
                return 1
                return 2
            }
            """

        cmp """
            ->
                1
                return 2
            """ """
            function ()
            {
                1
                return 2
            }
            """

        cmp """
            a = (a,b,c) -> d
            """ """
            a = function (a, b, c)
            {
                return d
            }
            """

        cmp """
            a.x = (y,z) -> q
            """ """
            a.x = function (y, z)
            {
                return q
            }
            """

        cmp """
            a = ->
                b = ->
            """ """
            a = function ()
            {
                var b

                return b = function ()
                {}
            }
            """

        cmp """
            a = (b,c) ->
                b = (e, f) -> g
                b
            """ """
            a = function (b, c)
            {
                var b

                b = function (e, f)
                {
                    return g
                }
                return b
            }
            """

        cmp """
            a = (b,c) ->
                b = (e, f) -> h
            """ """
            a = function (b, c)
            {
                var b

                return b = function (e, f)
                {
                    return h
                }
            }
            """

        cmp """
            a = (b,c) ->
                (e, f) -> j
            """ """
            a = function (b, c)
            {
                return function (e, f)
                {
                    return j
                }
            }
            """

        cmp """
            f = ->
                (a) -> 1
            """ """
            f = function ()
            {
                return function (a)
                {
                    return 1
                }
            }
            """

        cmp """
            a = ->
                'a'
            1
            """ """
            a = function ()
            {
                return 'a'
            }
            1
            """

        cmp """
            a = ->
                log 'a'

            b = ->
                log 'b'
            """ """
            a = function ()
            {
                console.log('a')
            }
            b = function ()
            {
                console.log('b')
            }
            """

        cmp "a = ( a, b=1 c=2 ) ->",  "a = function (a, b = 1, c = 2)\n{}"

        cmp """
            if true then return
            """ """
            if (true)
            {
                return
            }
            """

        cmp """
            if x then return
            a
            """ """
            if (x)
            {
                return
            }
            a
            """

        cmp "-> @a",
            """
            function ()
            {
                return this.a
            }
            """

        cmp "(@a) -> @a",
            """
            function (a)
            {
                this.a = a
                return this.a
            }
            """

        cmp "(@a,a) -> log @a",
            """
            function (a1, a)
            {
                this.a = a1
                console.log(this.a)
            }
            """

    # 00000000   00000000  000000000  000   000  00000000   000   000
    # 000   000  000          000     000   000  000   000  0000  000
    # 0000000    0000000      000     000   000  0000000    000 0 000
    # 000   000  000          000     000   000  000   000  000  0000
    # 000   000  00000000     000      0000000   000   000  000   000

    it 'return' ->

        cmp """
            f = =>
                if true then return
            """ """
            f = function ()
            {
                if (true)
                {
                    return
                }
            }
            """

        cmp """
            f = ->
                if yes
                    log '42'
            """ """
            f = function ()
            {
                if (true)
                {
                    console.log('42')
                }
            }
            """
            
        # cmp """
            # f = ->
                # if yes
                    # '42'
            # """ """
            # f = function ()
            # {
                # if (true)
                # {
                    # return '42'
                # }
            # }
            # """

    #  0000000   0000000   000      000       0000000
    # 000       000   000  000      000      000
    # 000       000000000  000      000      0000000
    # 000       000   000  000      000           000
    #  0000000  000   000  0000000  0000000  0000000

    it 'calls' ->

        cmp 'a(b)'            'a(b)'
        cmp 'a(b,c)'          'a(b,c)'
        cmp 'a(1,null,"2")'   'a(1,null,"2")'
        cmp 'a[1](b)'         'a[1](b)'
        cmp "f 'b', (a) ->"   "f('b',function (a)\n{})"
        cmp "a('1' 2 3.4 true false null undefined NaN Infinity)",
            "a('1',2,3.4,true,false,null,undefined,NaN,Infinity)"

        cmp """
            a b:c[1], d:2
            """ """
            a({b:c[1],d:2})
            """

        cmp """
            a b:c[2], d:3
            4
            """ """
            a({b:c[2],d:3})
            4
            """

        cmp """
            a(
                '1'
                2
                3.4
                true
                [
                    null
                    undefined
                ]
            )
            """ """
            a('1',2,3.4,true,[null,undefined])
            """

        cmp """
            a '1'
            b  2
            c  3.4
            d  true
            """ """
            a('1')
            b(2)
            c(3.4)
            d(true)
            """

        cmp """
            a b 1
            c d 2
            """ """
            a(b(1))
            c(d(2))
            """

        cmp """
            a
                b
                    3
            c
                d
                    4
            """ """
            a(b(3))
            c(d(4))
            """

        cmp """
            a
                b
                1
            c
                d
                2
            """ """
            a(b,1)
            c(d,2)
            """

        cmp "a 'b' -> c",
            """
            a('b',function ()
            {
                return c
            })
            """

        cmp 'l = pat.map ->' 'l = pat.map(function ()\n{})'

        cmp """
            ((a) -> 1)
            """ """
            (function (a)
            {
                return 1
            })
            """

        cmp """
            l = a (i) -> 0
            """ """
            l = a(function (i)
            {
                return 0
            })
            """

        cmp """
            l = timer ((i) -> 1)
            """ """
            l = timer((function (i)
            {
                return 1
            }))
            """

        cmp """
            l = timer ((i) -> i), y
            """ """
            l = timer((function (i)
            {
                return i
            }),y)
            """

        cmp """
            a.b c:2
            x = y
            """ """
            a.b({c:2})
            x = y
            """
