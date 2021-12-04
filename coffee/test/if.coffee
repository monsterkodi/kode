###
000  00000000      000000000  000   000  00000000  000   000
000  000              000     000   000  000       0000  000
000  000000           000     000000000  0000000   000 0 000
000  000              000     000   000  000       000  0000
000  000              000     000   000  00000000  000   000
###

{ cmp, sme } = require './utils'

describe 'if' ->

    # 000000000  000   000  00000000  000   000  
    #    000     000   000  000       0000  000  
    #    000     000000000  0000000   000 0 000  
    #    000     000   000  000       000  0000  
    #    000     000   000  00000000  000   000  
    
    it 'then' ->
        
        cmp """
            if n
                b 
            """ """
            if (n)
            {
                b
            }
            """

        cmp """
            if undefined == null
                no
            """ """
            if (undefined === null)
            {
                false
            }
            """

        cmp """
            if 2
                c = 0
                1
            """ """
            if (2)
            {
                c = 0
                1
            }
            """

        cmp 'if false then true',
            """
            if (false)
            {
                true
            }
            """

        cmp """
            if false
                true
            """ """
            if (false)
            {
                true
            }"""

        cmp """
            if false
                true
            a = 1
            """ """
            if (false)
            {
                true
            }
            a = 1
            """
            
        cmp """
            if false
                log 2.1
            log 2
            """ """
            if (false)
            {
                console.log(2.1)
            }
            console.log(2)
            """
            
        cmp """
            if 2
                a.b c
            """ """
            if (2)
            {
                a.b(c)
            }
            """
            
        cmp """
            if 3
                a.b c
                a.b c
            """ """
            if (3)
            {
                a.b(c)
                a.b(c)
            }
            """          

        cmp """
            if not op in ['--''++']
                decr
            """ """
            if (!['--','++'].indexOf(op) >= 0)
            {
                decr
            }
            """          
            
        cmp """
            if op not in ['--''++']
                incr
            """ """
            if (!['--','++'].indexOf(op) >= 0)
            {
                incr
            }
            """       
            
        cmp """
            if 1
                if 2
                    a
                if 3
                    if 4
                        b
                    else 
                        c
                log 'yes1'
            """ """
            if (1)
            {
                if (2)
                {
                    a
                }
                if (3)
                {
                    if (4)
                    {
                        b
                    }
                    else
                    {
                        c
                    }
                }
                console.log('yes1')
            }
            """
            
        cmp """
            if e then 1
            if 2 then f
            """ """
            if (e)
            {
                1
            }
            if (2)
            {
                f
            }
            """
            
        cmp """
            ->
                if not e then return
                    
                if 1
                    if 2 in a
                        3
                    return
            """ """
            (function ()
            {
                if (!e)
                {
                    return
                }
                if (1)
                {
                    if (a.indexOf(2) >= 0)
                    {
                        3
                    }
                    return
                }
            })
            """
            
    # 0000000    000       0000000    0000000  000   000  
    # 000   000  000      000   000  000       000  000   
    # 0000000    000      000   000  000       0000000    
    # 000   000  000      000   000  000       000  000   
    # 0000000    0000000   0000000    0000000  000   000  
    
    it 'block' ->
        
        cmp """
            if
                1 then 2
            """ """
            if (1)
            {
                2
            }
            """

        cmp """
            if
                10
                    20
            """ """
            if (10)
            {
                20
            }
            """

        cmp """
            if
                100
                    200
                300
                    400
                500
                    600
                else
                    700
            """ """
            if (100)
            {
                200
            }
            else if (300)
            {
                400
            }
            else if (500)
            {
                600
            }
            else
            {
                700
            }
            """
            
        cmp """
            if 
                a 'x' ➜ X
                b 'y' ➜ Y
                else    Z
            """ """
            if (a('x'))
            {
                X
            }
            else if (b('y'))
            {
                Y
            }
            else
            {
                Z
            }
            """

        cmp """
            if 
                a 'x' ➜ X
                b 'y' ➜ Y
                      ➜ Z
            """ """
            if (a('x'))
            {
                X
            }
            else if (b('y'))
            {
                Y
            }
            else
            {
                Z
            }
            """

        cmp """
            if 
                a ➜ P
                ➜   Q
            """ """
            if (a)
            {
                P
            }
            else
            {
                Q
            }
            """

        cmp """
            if 
                a    ➜ P
                else ➜ Q
            """ """
            if (a)
            {
                P
            }
            else
            {
                Q
            }
            """
            
    # 000  000   000  000      000  000   000  00000000  
    # 000  0000  000  000      000  0000  000  000       
    # 000  000 0 000  000      000  000 0 000  0000000   
    # 000  000  0000  000      000  000  0000  000       
    # 000  000   000  0000000  000  000   000  00000000  
    
    it 'inline' ->
        
        cmp "v = if k == 1 then 2 else 3" "v = k === 1 ? 2 : 3"
        
        cmp "i = 1 if i == 0",             
            """
            if (i === 0)
            {
                i = 1
            }
            """

        cmp "if a then i = 10 if i == 10",
            """
            if (a)
            {
                if (i === 10)
                {
                    i = 10
                }
            }
            """
            
        cmp """
            if false then true else no
            a = 1
            """ """
            false ? true : false
            a = 1
            """

        cmp """
            if false then log 1.1
            log 1
            """ """
            if (false)
            {
                console.log(1.1)
            }
            console.log(1)
            """

        cmp """
            if false then true else log 3.3
            log 3
            """ """
            false ? true : console.log(3.3)
            console.log(3)
            """
            
        cmp """
            if 1 then a.b c
            """ """
            if (1)
            {
                a.b(c)
            }
            """
            
        cmp "a = if 1 then 2 else if 3 then 4 else if 5 then 6 else 7" "a = 1 ? 2 : 3 ? 4 : 5 ? 6 : 7"
        
        cmp """
            a = if 0 then if 1 then if 2 then 3 else if 4 then 5 else 6 else if 7 then 8 else 9 else if 10 then 11 else 12
            """ """
            a = 0 ? 1 ? 2 ? 3 : 4 ? 5 : 6 : 7 ? 8 : 9 : 10 ? 11 : 12
            """
        ###
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
            }
        ###

    # 00000000  000       0000000  00000000        000  00000000  
    # 000       000      000       000             000  000       
    # 0000000   000      0000000   0000000         000  000000    
    # 000       000           000  000             000  000       
    # 00000000  0000000  0000000   00000000        000  000       
    
    it 'else if' ->
        
        cmp """
            if 1
                log 'yes2'
            else if no
                false
            else
                log 'no2'
            log 'end'
            """ """
            if (1)
            {
                console.log('yes2')
            }
            else if (false)
            {
                false
            }
            else
            {
                console.log('no2')
            }
            console.log('end')
            """

        cmp """
            if a in l
                log 'yes3'
            else
                log 'no3'
            log 'END'
            """ """
            if (l.indexOf(a) >= 0)
            {
                console.log('yes3')
            }
            else
            {
                console.log('no3')
            }
            console.log('END')
            """
            
    # 00000000   00000000  000000000  000   000  00000000   000   000   0000000  
    # 000   000  000          000     000   000  000   000  0000  000  000       
    # 0000000    0000000      000     000   000  0000000    000 0 000  0000000   
    # 000   000  000          000     000   000  000   000  000  0000       000  
    # 000   000  00000000     000      0000000   000   000  000   000  0000000   
    
    it 'returns' ->
        
        cmp """
            -> if false then true
            """ """
            (function ()
            {
                if (false)
                {
                    return true
                }
            })
            """

        cmp """
            -> if 1 then 2 else 3
            """ """
            (function ()
            {
                if (1)
                {
                    return 2
                }
                else
                {
                    return 3
                }
            })
            """            
            
    # 000000000   0000000   000  000      
    #    000     000   000  000  000      
    #    000     000000000  000  000      
    #    000     000   000  000  000      
    #    000     000   000  000  0000000  
    
    it 'tail' ->
        
        cmp """
            a if b
            """ """
            if (b)
            {
                a
            }
            """

        cmp """
            a if b if c
            """ """
            if (c)
            {
                if (b)
                {
                    a
                }
            }
            """
            
        cmp """
            log 'msg' if dbg
            """ """
            if (dbg)
            {
                console.log('msg')
            }
            """
            
        cmp "if 1 then 2"   "if (1)\n{\n    2\n}"
        
        sme "if 1 then 2"         "if 1 then 2"
        sme "if 1 ➜ 2 else 3"        "if 1 then 2 else 3"
        # sme "1 ➜ 2 ➜ 3"           "if 1 then 2 else 3"
        # sme "1 ➜ 2 ➜ 3 ➜ 4 ➜ 5"   "if 1 then 2 else if 3 then 4 else 5"

    # 000   000  000   0000000  00000000  00000000   
    # 0000  000  000  000       000       000   000  
    # 000 0 000  000  000       0000000   0000000    
    # 000  0000  000  000       000       000   000  
    # 000   000  000   0000000  00000000  000   000  
    
    it 'nicer' ->
              
        cmp """
            if
                x       ➜ 1
                a == 5  ➜ 2
                'hello' ➜ 3
                        ➜ fark
            """ """
            if (x)
            {
                1
            }
            else if (a === 5)
            {
                2
            }
            else if ('hello')
            {
                3
            }
            else
            {
                fark
            }
            """

        cmp """
            if
                x       ➜ 1
                a == 5  ➜ 2
                'hello' ➜ 3
                else
                    fark
            """ """
            if (x)
            {
                1
            }
            else if (a === 5)
            {
                2
            }
            else if ('hello')
            {
                3
            }
            else
            {
                fark
            }
            """

        cmp """
            if  
                x       ➜ 1
                a == 5  ➜ 2
                'hello' ➜ 3
                else   fark
            """ """
            if (x)
            {
                1
            }
            else if (a === 5)
            {
                2
            }
            else if ('hello')
            {
                3
            }
            else
            {
                fark
            }
            """

        cmp """
            if  x  ➜ 1
                y  ➜ 2
            """ """
            if (x)
            {
                1
            }
            else if (y)
            {
                2
            }
            """