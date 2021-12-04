###
000       0000000    0000000   00000000    0000000
000      000   000  000   000  000   000  000
000      000   000  000   000  00000000   0000000
000      000   000  000   000  000             000
0000000   0000000    0000000   000        0000000
###

{ cmp, evl } = require './test_utils'

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
            for (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)
            {
                t = list[_1_6_]
                t
            }
            """

        cmp """
            for a in [1,2,3] then log a
            """ """
            var list = [1,2,3]
            for (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)
            {
                a = list[_1_6_]
                console.log(a)
            }
            """

        cmp """
            for a in [1,2,3] then log a
            log a
            """ """
            var list = [1,2,3]
            for (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)
            {
                a = list[_1_6_]
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
            for (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)
            {
                a = list[_1_6_]
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
            for (var _1_10_ = 0; _1_10_ < list.length; _1_10_++)
            {
                a = list[_1_10_][0]
                b = list[_1_10_][1]
                console.log(a,b)
            }
            """

        cmp """
            for a in [1..2] then for b in [1..3] then c = 1; d = 1
            """ """
            var list = [1,2]
            for (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)
            {
                a = list[_1_6_]
                var list1 = [1,2,3]
                for (var _1_27_ = 0; _1_27_ < list1.length; _1_27_++)
                {
                    b = list1[_1_27_]
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
            for (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)
            {
                a = list[_1_6_]
                var list1 = [1,2,3,4,5,6,7,8,9]
                for (var _1_27_ = 0; _1_27_ < list1.length; _1_27_++)
                {
                    b = list1[_1_27_]
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
            for (var _1_10_ = 0; _1_10_ < list.length; _1_10_++)
            {
                e = list[_1_10_]
                f(e)
            }
            """
            
    # 000       0000000   0000000   00     00  00000000   
    # 000      000       000   000  000   000  000   000  
    # 000      000       000   000  000000000  00000000   
    # 000      000       000   000  000 0 000  000        
    # 0000000   0000000   0000000   000   000  000        
    
    it 'list comprehension' ->
        
        cmp "m = ([k, r.exec t] for k,r of rgs)",
            """
            m = (function ()
            {
                var result = []
                for (k in rgs)
                {
                    var r = rgs[k]
                    result.push([k,r.exec(t)])
                }
                return result
            })()
            """

        cmp "m = ([i, k] for k,i in rgs)",
            """
            m = (function ()
            {
                var result = []
                var list = rgs
                for (i = 0; i < list.length; i++)
                {
                    var k = list[i]
                    result.push([i,k])
                }
                return result
            })()
            """
            
        evl "1"                                 1
        evl "'abc'"                             'abc'
        evl "[1,2,3]"                           [1,2,3]
        evl "[i for i in [1,2,3]]"              [ 1, 2, 3 ]
        evl "(i for i in [1,2,3])"              [ 1, 2, 3 ]
        evl "[i*2 for i in [1,2,3]]"            [ 2, 4, 6 ]
        evl "(i+3 for i in [1,2,3])"            [ 4, 5, 6 ]
        evl "(k for k of {a:1,b:2,c:3})"        [ 'a' 'b' 'c' ]
        evl "(v*v for k,v of {a:1,b:2,c:3})"    [ 1 4 9 ]
        evl "(''+i+' '+v for i,v of [5,4,3])"   [ '0 5' '1 4' '2 3' ]
        evl '((-> (a={})[v]=k; a)() for k,v of {a:1,b:2,c:3})'  [ {'1':'a'} {'2':'b'} {'3':'c'} ]

    # 00000000   0000000    0000000  000   000  
    # 000       000   000  000       000   000  
    # 0000000   000000000  000       000000000  
    # 000       000   000  000       000   000  
    # 00000000  000   000   0000000  000   000  
    
    it 'each' ->
        
        cmp "{a:1,b:2}"                                     "{a:1,b:2}"

        evl "a = {a:1,b:2}"                                 {a:1,b:2}
        evl "a = {a:1,b:2} each (k,v) -> [k, v*3]"          {a:3,b:6}
        evl "a = {a:1,b:2} each (k,v) -> ['▸'+k, v]"        {'▸a':1,'▸b':2}
        
        evl "a = [1,2,3] each (i,v) -> [i, v]"              [1,2,3]
        evl "a = [1,2,3] each (i,v) -> [4-i, v]"            [3,2,1]
        evl "a = ['3''2''1'] each (i,v) -> [i, v+'▸'+i]"    ['3▸0' '2▸1' '1▸2']
        evl "a = 'hello' each (i,c) -> [i,c+c]"             "hheelllloo"
        evl "a = 'hello world' each (i,c) -> [i,i%2 and c.toUpperCase() or c]"    "hElLo wOrLd"
        
    it 'each single' ->
        
        evl "a = '' each ->"                                ''
        evl "a = {} each ->"                                {}
        evl "a = [] each ->"                                []
        evl "a = [1,2] each -> 'a'"                         ['a''a']
        evl "a = [1,2] each ->"                             []
        evl "a = [1,2,3] each (v) -> v"                     [1,2,3]
        evl "a = {a:1,b:2} each (v) -> v*3"                 {a:3,b:6}
            
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
