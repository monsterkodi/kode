###
0000000     0000000    0000000  000   0000000   0000000  
000   000  000   000  000       000  000       000       
0000000    000000000  0000000   000  000       0000000   
000   000  000   000       000  000  000            000  
0000000    000   000  0000000   000   0000000  0000000   
###

{cmp} = require './test_utils'

describe 'basics' ->

    # 000      000  000000000  00000000  00000000    0000000   000       0000000
    # 000      000     000     000       000   000  000   000  000      000
    # 000      000     000     0000000   0000000    000000000  000      0000000
    # 000      000     000     000       000   000  000   000  000           000
    # 0000000  000     000     00000000  000   000  000   000  0000000  0000000

    it 'literals' ->

        cmp ''                ''
        cmp ' '               ''
        cmp 'a'               'a'
        cmp '1'               '1'
        cmp '2.2'             '2.2'
        cmp '""'              '""'
        cmp "''"              "''"
        cmp '[]'              '[]'
        cmp '{}'              '{}'
        cmp 'true'            'true'
        cmp 'false'           'false'
        cmp 'yes'             'true'
        cmp 'no'              'false'
        cmp 'Infinity'        'Infinity'
        cmp 'NaN'             'NaN'
        cmp 'null'            'null'
        cmp 'undefined'       'undefined'

    # 00000000   00000000    0000000   00000000
    # 000   000  000   000  000   000  000   000
    # 00000000   0000000    000   000  00000000
    # 000        000   000  000   000  000
    # 000        000   000   0000000   000

    it 'prop' ->

        cmp 'a.a'             'a.a'
        cmp '{a:b}.a'         '{a:b}.a'
        cmp 'a.b.c d'         'a.b.c(d)'
        cmp 'a.b.c[d]'        'a.b.c[d]'
        cmp '[a.b*c[d]]'      '[a.b * c[d]]'

    # 00000000   00000000   0000000   00000000  000   000
    # 000   000  000       000        000        000 000
    # 0000000    0000000   000  0000  0000000     00000
    # 000   000  000       000   000  000        000 000
    # 000   000  00000000   0000000   00000000  000   000

    it 'regex' ->

        cmp '/a/'             '/a/'
        cmp '/a|b/'           '/a|b/'
        cmp '/(a|b)/'         '/(a|b)/'
        cmp '/(a|b)/g'        '/(a|b)/g'
        cmp '/\\//gimsuy'     '/\\//gimsuy'

    #  0000000   00000000
    # 000   000  000   000
    # 000   000  00000000
    # 000   000  000
    #  0000000   000

    it 'op' ->

        cmp 'a == b'          'a === b'
        cmp 'a != b'          'a !== b'

        cmp 'a and b'         'a && b'
        cmp '1 and 2 and 3'   '1 && 2 && 3'
        cmp 'e and (f or g)'  'e && (f || g)'
        cmp '(e and f) or g'  '(e && f) || g'

        cmp """
            a and \
            b or \
            c
            """ """
            a && b || c
            """

        cmp """
            d and
                e or f and
                    g or h
            """ """
            d && e || f && g || h
            """

        cmp """
            d and
            e or f and
            g or h
            """ """
            d && e || f && g || h
            """

        cmp """
            a = d and
                e or f and
                g or h
            """ """
            a = d && e || f && g || h
            """

        cmp """
            b = 1 <= a < c
            """ """
            b = (1 <= a && a < c)
            """

        cmp """
            x = y > z >= 1
            """ """
            x = (y > z && z >= 1)
            """

        cmp """
            a = b == c == d
            """ """
            a = (b === c && c === d)
            """

        cmp """
            a = b != c != d
            """ """
            a = (b !== c && c !== d)
            """

    # 000   000   0000000   000000000  
    # 0000  000  000   000     000     
    # 000 0 000  000   000     000     
    # 000  0000  000   000     000     
    # 000   000   0000000      000     
    
    it 'not' ->
        
        cmp 'not true' '!true'
            
    #  0000000    0000000   0000000  000   0000000   000   000
    # 000   000  000       000       000  000        0000  000
    # 000000000  0000000   0000000   000  000  0000  000 0 000
    # 000   000       000       000  000  000   000  000  0000
    # 000   000  0000000   0000000   000   0000000   000   000

    it 'assign' ->

        cmp 'a = b'            'a = b'
        cmp 'a = b = c = 1'    'a = b = c = 1'

        cmp """
            module.exports = sthg
            log 'ok'
            """ """
            module.exports = sthg
            console.log('ok')
            """

        cmp """
            a = b = c = sthg == othr
            log 'ok'
            """ """
            a = b = c = sthg === othr
            console.log('ok')
            """

        cmp """
            d = a and
            b or
                c
            """ """
            d = a && b || c
            """

        cmp """
            d = a and
                b or
                    c
            """ """
            d = a && b || c
            """

        cmp """
            d = a and
                b or
                c
            """ """
            d = a && b || c
            """
            
        cmp """
            r = 1 + p = 2 + 3
            """ """
            r = 1 + (p = 2 + 3)
            """

    # 00     00   0000000   000000000  000   000
    # 000   000  000   000     000     000   000
    # 000000000  000000000     000     000000000
    # 000 0 000  000   000     000     000   000
    # 000   000  000   000     000     000   000

    it 'math' ->

        cmp 'a + b'             'a + b'
        cmp 'a - b + c - 1'     'a - b + c - 1'
        cmp '-a+-b'             '-a + -b'
        cmp '+a+-b'             '+a + -b'
        cmp 'a + -b'            'a + -b'
        cmp 'a+ -b'             'a + -b'
        cmp 'a + -(b-c)'        'a + -(b - c)'
        cmp 'b --c'             'b(--c)'
        cmp 'a + -b --c'        'a + -b(--c)'
        cmp 'a -b'              'a(-b)'
        cmp '-a -b'             '-a(-b)'
        cmp '-a +b'             '-a(+b)'
        cmp '+a -b'             '+a(-b)'

    # 000  000   000   0000000  00000000   00000000  00     00  00000000  000   000  000000000
    # 000  0000  000  000       000   000  000       000   000  000       0000  000     000
    # 000  000 0 000  000       0000000    0000000   000000000  0000000   000 0 000     000
    # 000  000  0000  000       000   000  000       000 0 000  000       000  0000     000
    # 000  000   000   0000000  000   000  00000000  000   000  00000000  000   000     000

    it 'increment' ->

        cmp 'a++'               'a++'
        cmp 'a--'               'a--'
        cmp '++a'               '++a'
        cmp '--a'               '--a'
        cmp '--a,++b'           '--a\n++b'

        cmp 'a[1]++'            'a[1]++'
        cmp 'a[1]--'            'a[1]--'
        cmp '--a[1]'            '--a[1]'
        cmp '++a[1]'            '++a[1]'

        cmp 'a.b.c++'           'a.b.c++'
        cmp 'a.b.c--'           'a.b.c--'

        cmp 'a(b).c++'          'a(b).c++'
        cmp 'a(b).c--'          'a(b).c--'

        cmp '(--b)'             '(--b)'
        cmp '(++b)'             '(++b)'
        cmp '(b--)'             '(b--)'
        cmp '(b++)'             '(b++)'
        cmp 'log(++b)'          'console.log(++b)'
        cmp 'log(++{b:1}.b)'    'console.log(++{b:1}.b)'

        if false
            cmp ('--a++')            ''
            cmp ('--a--')            ''
            cmp ('++a++')            ''
            cmp ('++a--')            ''
            cmp ('++--')             ''
            cmp ('++1')              ''
            cmp ('1--')              ''
            cmp ('""++')             ''
            