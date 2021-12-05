###
00     00  000   0000000   0000000
000   000  000  000       000
000000000  000  0000000   000
000 0 000  000       000  000
000   000  000  0000000    0000000
###

{cmp} = require './utils'

describe 'misc' ->

    # 000000000  000   000  000   0000000  
    #    000     000   000  000  000       
    #    000     000000000  000  0000000   
    #    000     000   000  000       000  
    #    000     000   000  000  0000000   
    
    it 'this' ->

        cmp '@'      'this'
        cmp '@a'     'this.a'
        cmp '@a.b'   'this.a.b'
        cmp '@a.b()' 'this.a.b()'
        cmp 't = @'  't = this'
        
        cmp "a.on 'b', @c", "a.on('b',this.c)" 
        cmp "a.on 'b' @c", "a.on('b',this.c)" 

        cmp """
            if @
                1
            """ """
            if (this)
            {
                1
            }
            """

        cmp """
            if @ then 1
            """ """
            if (this)
            {
                1
            }
            """
            
    it 'try' ->
        
        cmp """
            try 
                something
            catch err
                error err
            """ """
            try
            {
                something
            }
            catch (err)
            {
                console.error(err)
            }\n
            """

        cmp """
            try 
                sthelse
            catch err
                error err
            finally
                cleanup
            """ """
            try
            {
                sthelse
            }
            catch (err)
            {
                console.error(err)
            }
            finally
            {
                cleanup
            }\n
            """
            
    # 00000000   00000000   0000000   000   000  000  00000000   00000000
    # 000   000  000       000   000  000   000  000  000   000  000
    # 0000000    0000000   000 00 00  000   000  000  0000000    0000000
    # 000   000  000       000 0000   000   000  000  000   000  000
    # 000   000  00000000   00000 00   0000000   000  000   000  00000000

    it 'require' ->

        cmp "noon  = require 'noon'"    "noon = require('noon')"
        cmp """
            slash = require 'kslash'
            kstr  = require 'kstr'
            """ """
            slash = require('kslash')
            kstr = require('kstr')
            """

    # 000000000  000   000  00000000   00000000   0000000   00000000
    #    000      000 000   000   000  000       000   000  000
    #    000       00000    00000000   0000000   000   000  000000
    #    000        000     000        000       000   000  000
    #    000        000     000        00000000   0000000   000

    it 'typeof' ->

        cmp """
            if typeof pat == 'string'
                1
            """ """
            if (typeof(pat) === 'string')
            {
                1
            }
            """

    # 000  000   000   0000000  000000000   0000000   000   000   0000000  00000000   0000000   00000000
    # 000  0000  000  000          000     000   000  0000  000  000       000       000   000  000
    # 000  000 0 000  0000000      000     000000000  000 0 000  000       0000000   000   000  000000
    # 000  000  0000       000     000     000   000  000  0000  000       000       000   000  000
    # 000  000   000  0000000      000     000   000  000   000   0000000  00000000   0000000   000

    it 'instanceof' ->

        cmp 'a instanceof b'  'a instanceof b'
        cmp 'a instanceof b == true'  'a instanceof b === true'

    # 0000000    00000000  000      00000000  000000000  00000000
    # 000   000  000       000      000          000     000
    # 000   000  0000000   000      0000000      000     0000000
    # 000   000  000       000      000          000     000
    # 0000000    00000000  0000000  00000000     000     00000000

    it 'delete' ->

        cmp 'delete a'              'delete(a)'
        cmp '[delete a, b]'         ';[delete(a),b]'

        cmp 'delete a.b.c'          'delete(a.b.c)'
        cmp '[delete a.b, a:b]'     ';[delete(a.b),{a:b}]'
        cmp 'delete a.b == false'   'delete(a.b) === false'

    # 000  000   000         0000000   0000000   000   000  0000000    000  000000000  000   0000000   000   000
    # 000  0000  000        000       000   000  0000  000  000   000  000     000     000  000   000  0000  000
    # 000  000 0 000        000       000   000  000 0 000  000   000  000     000     000  000   000  000 0 000
    # 000  000  0000        000       000   000  000  0000  000   000  000     000     000  000   000  000  0000
    # 000  000   000         0000000   0000000   000   000  0000000    000     000     000   0000000   000   000

    it 'in condition' ->

        cmp "a in l"          "l.indexOf(a) >= 0"
        cmp "a in 'xyz'"      "'xyz'.indexOf(a) >= 0"
        cmp "a in [1,2,3]"    ";[1,2,3].indexOf(a) >= 0"
        cmp "a not in b"      "!(b.indexOf(a) >= 0)"
        cmp "a not in [3,4]"  "!([3,4].indexOf(a) >= 0)"

        cmp """
            if a in l then 1
            """ """
            if (l.indexOf(a) >= 0)
            {
                1
            }
            """

        cmp """
            if not a in l then 2
            """ """
            if (!(l.indexOf(a) >= 0))
            {
                2
            }
            """
            
        cmp """
            if a in l
                2
            """ """
            if (l.indexOf(a) >= 0)
            {
                2
            }
            """
            
        # cmp "a = ( a:1 b:2 ) ->",     "a = function(arg)"
                                
    #  0000000   0000000   00     00  00     00  00000000  000   000  000000000   0000000
    # 000       000   000  000   000  000   000  000       0000  000     000     000
    # 000       000   000  000000000  000000000  0000000   000 0 000     000     0000000
    # 000       000   000  000 0 000  000 0 000  000       000  0000     000          000
    #  0000000   0000000   000   000  000   000  00000000  000   000     000     0000000

    # it 'comments' ->

        # cmp """
            # # a
            # """
        #  """
            # // a
            # """

        # cmp """
            # # a
            # # b
            # """
        #  """
            # // a
            # // b
            # """

        # cmp """
            # # a
                # # b
            # """
        #  """
            # // a
                # // b
            # """

        # cmp """
            # 1 # a
            # 2    # b
            # """
        #  """
            # 1
              # // a
            # 2
                 # // b
            # """

        