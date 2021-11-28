###
 0000000   00000000   00000000    0000000   000   000
000   000  000   000  000   000  000   000   000 000
000000000  0000000    0000000    000000000    00000
000   000  000   000  000   000  000   000     000
000   000  000   000  000   000  000   000     000
###

{cmp} = require './test_utils'

describe 'array' ->

    # 000  000   000  0000000    00000000  000   000
    # 000  0000  000  000   000  000        000 000
    # 000  000 0 000  000   000  0000000     00000
    # 000  000  0000  000   000  000        000 000
    # 000  000   000  0000000    00000000  000   000

    it 'index' ->

        cmp 'a[1]'            'a[1]'
        cmp 'a[1][2]'         'a[1][2]'
        cmp 'a[1][2]'         'a[1][2]'
        cmp '[1,2][1]'        '[1,2][1]'
        cmp '{a:1}["a"]'      '{a:1}["a"]'

    it 'index slice' ->

        cmp 'a[0..1]'         'a.slice(0, 1+1)'
        cmp 'a[0...1]'        'a.slice(0, 1)'
        cmp 'a[-1]'           'a.slice(-1)[0]'
        cmp 'a[-2]'           'a.slice(-2,-1)[0]'
        cmp 'a[-100]'         'a.slice(-100,-99)[0]'
        
        cmp """
            blocks[-1].tokens.push block
            blocks.push block
            """ """
            blocks.slice(-1)[0].tokens.push(block)
            blocks.push(block)
            """
            
    # 00000000    0000000   000   000   0000000   00000000
    # 000   000  000   000  0000  000  000        000
    # 0000000    000000000  000 0 000  000  0000  0000000
    # 000   000  000   000  000  0000  000   000  000
    # 000   000  000   000  000   000   0000000   00000000

    it 'range' ->
        
        cmp '[1..10]'         '[1,2,3,4,5,6,7,8,9,10]'
        cmp '[1...10]'        '[1,2,3,4,5,6,7,8,9]'
        cmp 'r = [1..10]'     'r = [1,2,3,4,5,6,7,8,9,10]'
        cmp 'r = [1...10]'    'r = [1,2,3,4,5,6,7,8,9]'

        cmp '[1..100]' "
            (function() { var r = []; for (var i = 1; i <= 100; i++){ r.push(i); } return r; }).apply(this)
            "

        cmp '[1...100]' "
            (function() { var r = []; for (var i = 1; i < 100; i++){ r.push(i); } return r; }).apply(this)
            "

        cmp "a[1..4]"       "a.slice(1, 4+1)"
        cmp "a[1...4]"      "a.slice(1, 4)"
        cmp "a[1...a]"      "a.slice(1, a)"
        cmp "a[1..a]"       "a.slice(1, a+1)"
        cmp "a[1..a.b]"     "a.slice(1, a.b+1)"
        cmp "a[1..a[2]]"    "a.slice(1, a[2]+1)"
        cmp "a[1..a[3].b]"  "a.slice(1, a[3].b+1)"
        
        cmp "b[c...-1]"      "b.slice(c, -1)"
        cmp "b[c.d...-1]"    "b.slice(c.d, -1)"
        cmp "b[c[0]...-1]"   "b.slice(c[0], -1)"
        cmp "b[c[0].d..-1]"  "b.slice(c[0].d, -1+1)"
    
    #  0000000   00000000   00000000    0000000   000   000  
    # 000   000  000   000  000   000  000   000   000 000   
    # 000000000  0000000    0000000    000000000    00000    
    # 000   000  000   000  000   000  000   000     000     
    # 000   000  000   000  000   000  000   000     000     
    
    it 'array' ->

        cmp '[1]'               '[1]'
        cmp '[1 2]'             '[1,2]'
        cmp '[1,2]'             '[1,2]'
        cmp '[a,b]'             '[a,b]'
        cmp '[ "1" ]'           '["1"]'
        cmp "[ '1' ]"           "['1']"
        cmp '["1" "2"]'         '["1","2"]'
        cmp "['1' '2']"         "['1','2']"
        cmp '["1" , "2"]'       '["1","2"]'
        cmp "['1' , '2']"       "['1','2']"
        cmp "[['1'] , [2]]"     "[['1'],[2]]"
        cmp '[[]]'              '[[]]'
        cmp '[{}]'              '[{}]'
        cmp '[[[]]]'            '[[[]]]'
        cmp '[[[] []]]'         '[[[],[]]]'
        cmp '[[[],[]]]'         '[[[],[]]]'
        cmp '[[[][]]]'          '[[[],[]]]'
        cmp '[[[1]], 1]'        '[[[1]],1]'
        cmp '[b(c)]'            '[b(c)]'
        cmp '[b c]'             '[b(c)]'
        
        cmp "['1' , a, true, false, null, undefined]",
            "['1',a,true,false,null,undefined]"
            
        cmp "a = [1 2 - 3 x 4 + 5 'a' b 'c']",  
            "a = [1,2 - 3,x(4 + 5,'a',b('c'))]"
            
        cmp """['1' "2" 3 4.5 [] {} true false null undefined NaN Infinity yes no]""",
            """['1',"2",3,4.5,[],{},true,false,null,undefined,NaN,Infinity,true,false]"""

    #  0000000   0000000          000  00000000   0000000  000000000   0000000  
    # 000   000  000   000        000  000       000          000     000       
    # 000   000  0000000          000  0000000   000          000     0000000   
    # 000   000  000   000  000   000  000       000          000          000  
    #  0000000   0000000     0000000   00000000   0000000     000     0000000   
    
    it 'objects' ->
        
        cmp '[a:b]'             '[{a:b}]'
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
        
    # 00000000  000   000  000   000   0000000  000000000  000   0000000   000   000  
    # 000       000   000  0000  000  000          000     000  000   000  0000  000  
    # 000000    000   000  000 0 000  000          000     000  000   000  000 0 000  
    # 000       000   000  000  0000  000          000     000  000   000  000  0000  
    # 000        0000000   000   000   0000000     000     000   0000000   000   000  
    
    it 'function' ->
        
        cmp '[a -3]'    '[a(-3)]'
            
    # 0000000    000       0000000    0000000  000   000   0000000  
    # 000   000  000      000   000  000       000  000   000       
    # 0000000    000      000   000  000       0000000    0000000   
    # 000   000  000      000   000  000       000  000        000  
    # 0000000    0000000   0000000    0000000  000   000  0000000   
    
    it 'blocks' ->

        cmp """
            [
                1,2
            ]
            """ """
            [1,2]
            """

        cmp """
            [
                1,
                2
            ]
            """ """
            [1,2]
            """

        cmp """
            [
                1
                2
            ]
            """ """
            [1,2]
            """

        cmp """
            [
                [
                    0
                    1
                ]
                2
            ]
            """ """
            [[0,1],2]
            """

        cmp """
            a = [
                    [
                        0
                        1
                    ]
                    2
                ]
            """ """
            a = [[0,1],2]
            """

        cmp """
            a =
                [
                    [
                        0
                        1
                    ]
                    2
                ]
            """ """
            a = [[0,1],2]
            """

        cmp """
            [
                b
                    [
                        0
                        1
                    ]
                2
            ]
            """ """
            [b([0,1]),2]
            """

        cmp """
            a
                [
                    b
                        [
                            0
                            1
                        ]
                    2
                ]
            """ """
            a([b([0,1]),2])
            """

        cmp """
            ->
                [
                    1
                    2
                ]
            """ """
            function ()
            {
                return [1,2]
            }
            """

        cmp """
            l = [
                 1 2 3 'a'
                 c:
                  d:3
                  e:4
                 f:
                  'b'
                 'c'
                 l =
                    1
                ]
            """ """
            l = [1,2,3,'a',{c:{d:3,e:4},f:'b','c',l = 1}]
            """

        cmp """
            l = [ [
              [
                [
                  1
                  2
                ]
                   ]
                ]
                  ]
            """ """
            l = [[[[1,2]]]]
            """

        cmp """
            l = [[1
                   2]]
            """ """
            l = [[1,2]]
            """

        cmp """
            l = [[1
              2]]
            """ """
            l = [[1,2]]
            """

        cmp """
            l = [[1
                2]
                  ]
            """ """
            l = [[1,2]]
            """

        cmp """
            l = [[1 2]
                ]
            """ """
            l = [[1,2]]
            """