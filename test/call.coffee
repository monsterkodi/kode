###
 0000000   0000000   000      000      
000       000   000  000      000      
000       000000000  000      000      
000       000   000  000      000      
 0000000  000   000  0000000  0000000  
###

{cmp} = require './utils'

describe 'call' ->
    
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
            ;(function (a)
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

    # 000       0000000   00     00  0000000    0000000     0000000   
    # 000      000   000  000   000  000   000  000   000  000   000  
    # 000      000000000  000000000  0000000    000   000  000000000  
    # 000      000   000  000 0 000  000   000  000   000  000   000  
    # 0000000  000   000  000   000  0000000    0000000    000   000  
    
    it 'lambda' ->
            
        cmp "a = (-> 1)()",
            """
            a = (function ()
            {
                return 1
            })()
            """

        cmp """
            a = (->
                1)()
            """ """
            a = (function ()
            {
                return 1
            })()
            """
            
    # 00000000    0000000   00000000   00000000  000   000   0000000  
    # 000   000  000   000  000   000  000       0000  000  000       
    # 00000000   000000000  0000000    0000000   000 0 000  0000000   
    # 000        000   000  000   000  000       000  0000       000  
    # 000        000   000  000   000  00000000  000   000  0000000   
    
    it 'parens' ->
            
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
            
    # 0000000    000       0000000    0000000  000   000  
    # 000   000  000      000   000  000       000  000   
    # 0000000    000      000   000  000       0000000    
    # 000   000  000      000   000  000       000  000   
    # 0000000    0000000   0000000    0000000  000   000  
    
    it 'block' ->            

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

    it 'comma' ->
        
        cmp """
            c 1,
              2
            """ """
            c(1,2)
            """