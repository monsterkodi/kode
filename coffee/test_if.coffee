###
000  00000000      000000000  000   000  00000000  000   000
000  000              000     000   000  000       0000  000
000  000000           000     000000000  0000000   000 0 000
000  000              000     000   000  000       000  0000
000  000              000     000   000  00000000  000   000
###

{cmp} = require './test_utils'

describe 'if' ->

    # 000000000  000   000  00000000  000   000  
    #    000     000   000  000       0000  000  
    #    000     000000000  0000000   000 0 000  
    #    000     000   000  000       000  0000  
    #    000     000   000  00000000  000   000  
    
    it 'then' ->

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
            if op not in ['--''++']
                incr
            """ """
            if (!['--','++'].indexOf(op) >= 0)
            {
                incr
            }
            """          

    # 000  000   000  000      000  000   000  00000000  
    # 000  0000  000  000      000  0000  000  000       
    # 000  000 0 000  000      000  000 0 000  0000000   
    # 000  000  0000  000      000  000  0000  000       
    # 000  000   000  0000000  000  000   000  00000000  
    
    it 'inline' ->
        
        cmp "v = if k == 1 then 2 else 3" "v = k === 1 ? 2 : 3"
            
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
                log 'YES'
            else if no
                false
            else
                log 'NO'
            log 'end'
            """ """
            if (1)
            {
                console.log('YES')
            }
            else if (false)
            {
                false
            }
            else
            {
                console.log('NO')
            }
            console.log('end')
            """

        cmp """
            if a in l
                log 'YES'
            else
                log 'NO'
            log 'END'
            """ """
            if (l.indexOf(a) >= 0)
            {
                console.log('YES')
            }
            else
            {
                console.log('NO')
            }
            console.log('END')
            """
            
            