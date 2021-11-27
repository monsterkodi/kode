
#  0000000    0000000  000000000  
# 000   000  000          000     
# 000000000  0000000      000     
# 000   000       000     000     
# 000   000  0000000      000     

{ast} = require './test_utils'

describe 'ast' ->

    it 'simple' ->
        
        ast 'a'  'a'
        ast '1'  '1'
        ast 'no' 'no'
        ast '1;2' '1\n2'
        
    it 'operation' ->
        
        ast 'a and b', 
            """
            operation
                lhs
                    a
                operator
                    and
                rhs
                    b
            """
            
        ast '1 + 2',
            """
            operation
                lhs
                    1
                operator
                    +
                rhs
                    2
            """
            
        ast '++a',
            """
            operation
                operator
                    ++
                rhs
                    a
            """

        ast 'not a',
            """
            operation
                operator
                    not
                rhs
                    a
            """
            
        ast 'a = b + 1',
            """
            operation
                lhs
                    a
                operator
                    =
                rhs
                    operation
                        lhs
                            b
                        operator
                            +
                        rhs
                            1
            """

        ast 'a = b = c',
            """
            operation
                lhs
                    a
                operator
                    =
                rhs
                    operation
                        lhs
                            b
                        operator
                            =
                        rhs
                            c
            """
            
        ast 'for a in l then a',
            """
            for
                vals
                    a
                inof
                    in
                list
                    l
                then
                    a
            """
            