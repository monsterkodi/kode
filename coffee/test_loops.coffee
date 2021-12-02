###
000       0000000    0000000   00000000    0000000
000      000   000  000   000  000   000  000
000      000   000  000   000  00000000   0000000
000      000   000  000   000  000             000
0000000   0000000    0000000   000        0000000
###

{cmp} = require './test_utils'

describe 'loops' ->

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

        cmp """
            for v,i in @regs
                log i,v
            """ """
            var list = this.regs
            for (i = 0; i < list.length; i++)
            {
                v = list[i]
                console.log(i,v)
            }
            """

        cmp """
            for [a,b] in @regs
                log a,b
            """ """
            var list = this.regs
            for (var i = 0; i < list.length; i++)
            {
                a = list[i][0]
                b = list[i][1]
                console.log(a,b)
            }
            """

        cmp """
            for a in [1..2] then for b in [1..3] then c = 1; d = 1
            """ """
            var list = [1,2]
            for (var i = 0; i < list.length; i++)
            {
                a = list[i]
                var list1 = [1,2,3]
                for (var i1 = 0; i1 < list1.length; i1++)
                {
                    b = list1[i1]
                    c = 1
                    d = 1
                }
            }
            """

        cmp """
            for a in [1..9] then for b in [1..9]
                c = 3
                d:
                    e: 1
            """ """
            var list = [1,2,3,4,5,6,7,8,9]
            for (var i = 0; i < list.length; i++)
            {
                a = list[i]
                var list1 = [1,2,3,4,5,6,7,8,9]
                for (var i1 = 0; i1 < list1.length; i1++)
                {
                    b = list1[i1]
                    c = 3
                    {d:{e:1}}
                }
            }
            """
            
        cmp """
            empty = (a) -> a in ['' null undefined] or b
            """ """
            
            empty = function (a)
            {
                return ['',null,undefined].indexOf(a) >= 0 || b
            }
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
            
    # 00000000   0000000   00000000         000000000   0000000   000  000      
    # 000       000   000  000   000           000     000   000  000  000      
    # 000000    000   000  0000000             000     000000000  000  000      
    # 000       000   000  000   000           000     000   000  000  000      
    # 000        0000000   000   000           000     000   000  000  0000000  
    
    it 'for tail' ->
        
        cmp """
            f e for e in l ? []
            """ """
            var list = ((_1_15_=l) != null ? _1_15_ : [])
            for (var i = 0; i < list.length; i++)
            {
                e = list[i]
                f(e)
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
                log 4
            """ """
            while (true)
            {
                console.log(4)
            }
            """

        cmp """
            while true then log 5
            """ """
            while (true)
            {
                console.log(5)
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
