###
 0000000   0000000          000  00000000   0000000  000000000
000   000  000   000        000  000       000          000
000   000  0000000          000  0000000   000          000
000   000  000   000  000   000  000       000          000
 0000000   0000000     0000000   00000000   0000000     000
###

{cmp} = require './test_utils'

describe 'object' ->
        

    it 'object' ->

        cmp 'a:1'           '{a:1}'
        cmp '{a:1}'         '{a:1}'
        cmp 'a:1 b:2'       '{a:1,b:2}'
        cmp '{a:3 b:4}'     '{a:3,b:4}'
        cmp 'a:b:c'         '{a:{b:c}}'
        cmp 'a:b:c,d:e:f'   '{a:{b:c,d:{e:f}}}'
        cmp 'a:b c'         '{a:b(c)}'
        cmp 'a:b:c d:e:f'   '{a:{b:c({d:{e:f}})}}'

        cmp 'o = { a:1 b:2 c: d:4 e:5 }' 'o = {a:1,b:2,c:{d:4,e:5}}'

        cmp """
            a
                {
                    a:1
                }
            """ """
            a({a:1})
            """

        cmp """
            a =
                {
                    a:1
                }
            """ """
            a = {a:1}
            """

        cmp """
            {a:1}
            log 3
            """ """
            {a:1}
            console.log(3)
            """

        cmp """
            o={a:1}
            log o
            """ """
            o = {a:1}
            console.log(o)
            """

        cmp """
            i = y:1
            log i
            """ """
            i = {y:1}
            console.log(i)
            """

        cmp """
            i = y:1 z:2
            log i
            """ """
            i = {y:1,z:2}
            console.log(i)
            """

        cmp """
            i = y:1 z:2; z=a:1
            log i
            """ """
            i = {y:1,z:2}
            z = {a:1}
            console.log(i)
            """

        cmp """
            a = [{
                    a:1
                    b:2
                    c:3
                }{
                    x:1
                    y:2
                    z:3
                }]
            """ """
            a = [{a:1,b:2,c:3},{x:1,y:2,z:3}]
            """

        cmp """
            a = [
                    a:4
                    b:5
                ,
                    x:6
                    y:7
                ]
            """ """
            a = [{a:4,b:5},{x:6,y:7}]
            """
