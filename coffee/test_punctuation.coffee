###
00000000   000   000  000   000   0000000  000000000  000   000   0000000   000000000  000   0000000   000   000  
000   000  000   000  0000  000  000          000     000   000  000   000     000     000  000   000  0000  000  
00000000   000   000  000 0 000  000          000     000   000  000000000     000     000  000   000  000 0 000  
000        000   000  000  0000  000          000     000   000  000   000     000     000  000   000  000  0000  
000         0000000   000   000   0000000     000      0000000   000   000     000     000   0000000   000   000  
###

{ cmp }= require './test_utils'

describe 'punctuation' ->

    # 00000000    0000000   00000000   00000000  000   000   0000000
    # 000   000  000   000  000   000  000       0000  000  000
    # 00000000   000000000  0000000    0000000   000 0 000  0000000
    # 000        000   000  000   000  000       000  0000       000
    # 000        000   000  000   000  00000000  000   000  0000000

    it 'parens' ->

        cmp '(b c)'                       '(b(c))'
        cmp '(b --c)'                     '(b(--c))'
        cmp 'a + (b --c)'                 'a + (b(--c))'

    #  0000000   0000000   00     00  00     00   0000000   000000000   0000000   
    # 000       000   000  000   000  000   000  000   000     000     000   000  
    # 000       000   000  000000000  000000000  000000000     000     000000000  
    # 000       000   000  000 0 000  000 0 000  000   000     000     000   000  
    #  0000000   0000000   000   000  000   000  000   000     000     000   000  
    
    it 'optional commata' ->
        
        cmp "a = -1"                      "a = -1" 
        cmp "a = [ 1 2 3 ]"               "a = [1,2,3]" 
        cmp "a = [-1 2 3 ]"               "a = [-1,2,3]" 
        cmp "a = [ 1 -2 3 ]"              "a = [1,-2,3]" 
        cmp "a = [-1 -2 -3]"              "a = [-1,-2,-3]" 
        cmp "a = [ 1 +2 -3]"              "a = [1,+2,-3]" 
        cmp "a = [+1 -2 +3]"              "a = [+1,-2,+3]" 
        cmp "a = [1 a]"                   "a = [1,a]" 
        cmp "a = [1 -b]"                  "a = [1,-b]" 
        cmp "a = ['0' -2 'c' -3]"         "a = ['0',-2,'c',-3]" 
        cmp "a = [-1 - 2 - 3]"            "a = [-1 - 2 - 3]" 
        cmp "a = [-1-2-3]"                "a = [-1 - 2 - 3]" 
        cmp "a = { a:1 b:2 }"             "a = {a:1,b:2}"
        cmp "a = a:1 b:2"                 "a = {a:1,b:2}"
        cmp "a = ['a' 'b' 'c']"           "a = ['a','b','c']"
        cmp "a = ['a''b''c']"             "a = ['a','b','c']"
        cmp "a = { a:{a:1}, b:{b:2} }"    "a = {a:{a:1},b:{b:2}}"
        cmp "a = { a:{a:3} b:{b:4} }"     "a = {a:{a:3},b:{b:4}}"
        cmp "a = [ {a:5} {b:6} ]"         "a = [{a:5},{b:6}]"
        cmp "a = [ {a:1 b:2} ]"           "a = [{a:1,b:2}]"
        cmp "a = [ [] [] ]"               "a = [[],[]]"
        cmp "a = [[] []]"                 "a = [[],[]]"
        cmp "a = [[[[[] []] [[] []]]]]"   "a = [[[[[],[]],[[],[]]]]]"
        cmp "a = [ [1 2] [3 '4'] ]"       "a = [[1,2],[3,'4']]"
        cmp "a = [ [-1 -2] [-3 '4' -5] ]" "a = [[-1,-2],[-3,'4',-5]]"
        cmp "a.on 'b' c"                  "a.on('b',c)" 
        cmp "describe 'test' ->"          "describe('test',function ()\n{})"
        cmp 'log "hello" 1 "world"'       'console.log("hello",1,"world")'
        cmp 'log 1 2 3'                   'console.log(1,2,3)'
        
        cmp "a = ['a' 1 2.3 null undefined true false yes no]", 
              "a = ['a',1,2.3,null,undefined,true,false,true,false]"
              
        # cmp "a = ( a, b=1 c=2 ) ->",  "a = function(a,b=1,c=1)"
        # cmp "a = ( a:1 b:2 ) ->",     "a = function(arg)"
        # cmp 'log "#{a+1}", "#{a}"',   'console.log("" + (a + 1), "" + a)'
        # cmp 'log "#{a+1}" "#{a}"',    'console.log("" + (a + 1), "" + a)'
        # cmp "a = [1 2 - 3 x 4 + 5 'a' b 'c']", "a = [1,2 - 3,x(4 + 5,'a',b('c'))]"
            
        # cmp """
            # switch a
                # when 1 2 3 then
                # when 'a' 'b' 'c' then
            # ""","""
            # switch (a)
            # {
                # case 1:
                # case 2:
                # case 3:
                    # break;
                # case 'a':
                # case 'b':
                # case 'c':
            # }"""
    
        # cmp "a = [ [a:2] [b:'4'] [c:[]] ]", """
            # a = [
                # [
                    # {
                        # a: 2
                    # }
                # ], [
                    # {
                        # b: '4'
                    # }
                # ], [
                    # {
                        # c: []
                    # }
                # ]
            # ];"""    
            
        # cmp "@c", "this.c" 
        # cmp "a.on 'b', @c", "a.on('b', this.c)" 
        # cmp "a.on 'b' @c", "a.on('b', this.c)" 
        # cmp "f 'b', (a) ->", "f('b',function(a)\n{})" 
        # cmp "f 'a' (b) ->", "f('a',function(b)\n{})" 
        # cmp "f 'b' not a", "f('b', !a)" 