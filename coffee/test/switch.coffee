###
 0000000  000   000  000  000000000   0000000  000   000
000       000 0 000  000     000     000       000   000
0000000   000000000  000     000     000       000000000
     000  000   000  000     000     000       000   000
0000000   00     00  000     000      0000000  000   000
###

{cmp} = require './utils'

describe 'switch' ->

    it 'switches' ->

        cmp """
            switch a
                when 1 then 2
            """ """
            switch (a)
            {
                case 1:
                    2
                    break
            }\n
            """

        cmp """
            switch a
                when 11 then 22; 33
            """ """
            switch (a)
            {
                case 11:
                    22
                    33
                    break
            }\n
            """

        cmp """
            switch a
                when 'a'   then i++ ; j = 1 if k == 0
            """ """
            switch (a)
            {
                case 'a':
                    i++
                    if (k === 0)
                    {
                        j = 1
                    }
                    break
            }\n
            """

        cmp """
            switch a
                when 'a'   then i++ ; j = 0 if k == 1
                when 'b'   then l++ ; m = 2 if p == 3
            """ """
            switch (a)
            {
                case 'a':
                    i++
                    if (k === 1)
                    {
                        j = 0
                    }
                    break
                case 'b':
                    l++
                    if (p === 3)
                    {
                        m = 2
                    }
                    break
            }\n
            """

        cmp """
            switch a
                when 'a'   then i++ ; i = 1 if i == 0
                when 'b'   then f++ ; f = 1 if f == 0
                when 'c'
                    i++ if f != 'f'
            """ """
            switch (a)
            {
                case 'a':
                    i++
                    if (i === 0)
                    {
                        i = 1
                    }
                    break
                case 'b':
                    f++
                    if (f === 0)
                    {
                        f = 1
                    }
                    break
                case 'c':
                    if (f !== 'f')
                    {
                        i++
                    }
                    break
            }\n
            """
            
        cmp """
            switch a
                when 111 222 333 then
                when 'a' 'b' 'c' then
            """ """
            switch (a)
            {
                case 111:
                case 222:
                case 333:
                    break
                case 'a':
                case 'b':
                case 'c':
                    break
            }\n
            """

        cmp """
            switch a
                when 111 222 333
                when 'a' 'b' 'c'
            """ """
            switch (a)
            {
                case 111:
                case 222:
                case 333:
                    break
                case 'a':
                case 'b':
                case 'c':
                    break
            }\n
            """
            
    #  0000000    0000000   0000000  000   0000000   000   000  
    # 000   000  000       000       000  000        0000  000  
    # 000000000  0000000   0000000   000  000  0000  000 0 000  
    # 000   000       000       000  000  000   000  000  0000  
    # 000   000  0000000   0000000   000   0000000   000   000  
    
    it 'assign' ->
         
        cmp """
            b = switch c
                when 'c'
                    true
                when 'd'
                    false
            """ """
            b = (function ()
            {
                switch (c)
                {
                    case 'c':
                        return true
            
                    case 'd':
                        return false
            
                }
            
            })()
            """

        cmp """
            b = switch matches[0][0]
                when 'close'
                    c += index+length
                    true
                when 'triple' 'double' 'single'
                    c += index+length
                    false
                else
                    log 'unhandled?' matches[0]
                    c += index+length
                    true
            """ """
            b = (function ()
            {
                switch (matches[0][0])
                {
                    case 'close':
                        c += index + length
                        return true
            
                    case 'triple':
                    case 'double':
                    case 'single':
                        c += index + length
                        return false
            
                    default:
                        console.log('unhandled?',matches[0])
                        c += index + length
                        return true
                }
            
            })()
            """
            
    # 000   000  000   0000000  00000000  00000000   
    # 0000  000  000  000       000       000   000  
    # 000 0 000  000  000       0000000   0000000    
    # 000  0000  000  000       000       000   000  
    # 000   000  000   0000000  00000000  000   000  
    
    it 'nicer' ->
             
        cmp """
            switch x
                'bla'   ➜ bla
                'hello' ➜ blub
                        ➜ fork
            """ """
            switch (x)
            {
                case 'bla':
                    bla
                    break
                case 'hello':
                    blub
                    break
                default:
                    fork
            }\n
            """

        cmp """
            switch x
                'x' 
                1 2 3
                'bla'   ➜ bla
                'a' 'b'
                'hello' ➜ blub
                        ➜ fork
            """ """
            switch (x)
            {
                case 'x':
                case 1:
                case 2:
                case 3:
                case 'bla':
                    bla
                    break
                case 'a':
                case 'b':
                case 'hello':
                    blub
                    break
                default:
                    fork
            }\n
            """
                        