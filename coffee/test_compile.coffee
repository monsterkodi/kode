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
                1;
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
                return 1;
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
                1;
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
            a = (b,c) ->
                b = (e, f) -> g
            """ """
            a = function (b, c)
            {
                return b = function (e, f)
                {
                    return g
                }
            }
            """

        cmp """
            a = (b,c) ->
                (e, f) -> g
            """ """
            a = function (b, c)
            {
                return function (e, f)
                {
                    return g
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

        cmp "a('1' 2 3.4 true false null undefined NaN Infinity)",
            "a('1',2,3.4,true,false,null,undefined,NaN,Infinity)"

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
            