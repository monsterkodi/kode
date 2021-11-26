###
000       0000000    0000000   00000000    0000000    
000      000   000  000   000  000   000  000         
000      000   000  000   000  00000000   0000000     
000      000   000  000   000  000             000    
0000000   0000000    0000000   000        0000000     
###

{cmp} = require './test_utils'

describe 'loops' ->

    # 000  00000000      000000000  000   000  00000000  000   000
    # 000  000              000     000   000  000       0000  000
    # 000  000000           000     000000000  0000000   000 0 000
    # 000  000              000     000   000  000       000  0000
    # 000  000              000     000   000  00000000  000   000

    it 'if' ->

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
            if false then true else no
            a = 1
            """ """
            if (false)
            {
                true
            }
            else
            {
                false
            }
            a = 1
            """

        cmp """
            if false then log no
            log yes
            """ """
            if (false)
            {
                console.log(false)
            }
            console.log(true)
            """

        cmp """
            if false
                log no
            log yes
            """ """
            if (false)
            {
                console.log(false)
            }
            console.log(true)
            """

        cmp """
            if false then true else log no
            log yes
            """ """
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

        cmp """
            a = if 0 then if 1 then if 2 then 3 else if 4 then 5 else 6 else if 7 then 8 else 9 else if 10 then 11 else 12
            """ """
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
            """

        cmp """
            if 1 then a.b c
            """ """
            if (1)
            {
                a.b(c)
            }
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

    # 00000000   0000000   00000000         000  000   000
    # 000       000   000  000   000        000  0000  000
    # 000000    000   000  0000000          000  000 0 000
    # 000       000   000  000   000        000  000  0000
    # 000        0000000   000   000        000  000   000

    it 'for in' ->

        cmp """
            for t in l
                t
            """ """
            var list = l
            for (var i = 0; i < list.length; i++)
            {
                t = list[i]
                t
            }
            """

        cmp """
            for a in [1,2,3] then log a
            """ """
            var list = [1,2,3]
            for (var i = 0; i < list.length; i++)
            {
                a = list[i]
                console.log(a)
            }
            """

        cmp """
            for a in [1,2,3] then log a
            log a
            """ """
            var list = [1,2,3]
            for (var i = 0; i < list.length; i++)
            {
                a = list[i]
                console.log(a)
            }
            console.log(a)
            """

        cmp """
            for a in [1,2,3]
                log '1' a
                log '2' a
            log '3' a
            """ """
            var list = [1,2,3]
            for (var i = 0; i < list.length; i++)
            {
                a = list[i]
                console.log('1',a)
                console.log('2',a)
            }
            console.log('3',a)
            """
            
    # 00000000   0000000   00000000          0000000   00000000  
    # 000       000   000  000   000        000   000  000       
    # 000000    000   000  0000000          000   000  000000    
    # 000       000   000  000   000        000   000  000       
    # 000        0000000   000   000         0000000   000       
    
    it 'for of' ->
        
        cmp """
            for key,val of @patterns
                log key, val
            """ """
            for (key in this.patterns)
            {
                val = this.patterns[key]
                console.log(key,val)
            }
            """
            
    # 000   000  000   000  000  000      00000000
    # 000 0 000  000   000  000  000      000
    # 000000000  000000000  000  000      0000000
    # 000   000  000   000  000  000      000
    # 00     00  000   000  000  0000000  00000000

    it 'while' ->

        cmp """
            while true
                log true
            """ """
            while (true)
            {
                console.log(true)
            }
            """

        cmp """
            while true then log true
            """ """
            while (true)
            {
                console.log(true)
            }
            """

        cmp """
            while a == b then log c; log d
            log e
            """ """
            while (a === b)
            {
                console.log(c)
                console.log(d)
            }
            console.log(e)
            """
            
    #  0000000  000   000  000  000000000   0000000  000   000  
    # 000       000 0 000  000     000     000       000   000  
    # 0000000   000000000  000     000     000       000000000  
    #      000  000   000  000     000     000       000   000  
    # 0000000   00     00  000     000      0000000  000   000  
    
    it 'switch' ->

        cmp """
            switch a
                when 1 then 2
            """ """
            switch (a)
            {
                case 1:
                    2
                    break
            }\n"""
            