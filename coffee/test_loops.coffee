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
                var t = list[i]
                t
            }
            """

        cmp """
            for a in [1,2,3] then log a
            """ """
            var list = [1,2,3]
            for (var i = 0; i < list.length; i++)
            {
                var a = list[i]
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
                var a = list[i]
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
                var a = list[i]
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
            for (var i = 0; i < list.length; i++)
            {
                var v = list[i]
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
                var a = list[i][0]
                var b = list[i][1]
                console.log(a,b)
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
