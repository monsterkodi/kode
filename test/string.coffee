###
 0000000  000000000  00000000   000  000   000   0000000   
000          000     000   000  000  0000  000  000        
0000000      000     0000000    000  000 0 000  000  0000  
     000     000     000   000  000  000  0000  000   000  
0000000      000     000   000  000  000   000   0000000   
###

{ cmp, evl } = require './utils'

describe 'string' ->
    
    it 'triple' ->
        
        cmp """
            log \"\"\"
                hello
                \"\"\"
            """ """
            console.log(`hello`)
            """

        evl """
            a =\"\"\"
                hello
                \"\"\"
            """ 'hello'
            
        evl """
            a =\"\"\"
            hello
                \"\"\"
            """ 'hello'
            
        evl """
            a =\"\"\"hello\"\"\"
            """ 'hello'

        evl """
            a =\"\"\"   hello\"\"\"
            """ '   hello'
            
        evl """
            a =\"\"\"   hello   \"\"\"
            """ '   hello   '
            
        evl """
            a =\"\"\"
                hello
            world
                \"\"\"
            """ '    hello\nworld'
            
    # 000  000   000  000000000  00000000  00000000   00000000    0000000   000
    # 000  0000  000     000     000       000   000  000   000  000   000  000
    # 000  000 0 000     000     0000000   0000000    00000000   000   000  000
    # 000  000  0000     000     000       000   000  000        000   000  000
    # 000  000   000     000     00000000  000   000  000         0000000   0000000

    it 'interpolation' ->
        cmp "'#{}'"                                     "'#{}'"
        cmp '"#{}"'                                     "`${}`"
        cmp '"#{1}"'                                    "`${1}`"
        cmp '"#{a}"'                                    "`${a}`"
        cmp '"01234\#{}890"'                            "`01234${}890`"
        cmp '"01234#{}890"'                             "`01234${}890`"
        cmp 'log "#{a+1}", "#{a}"'                      'console.log(`${a + 1}`,`${a}`)'
        cmp '"#{b+2}" ; "#{b}"'                          '`${b + 2}`\n`${b}`'
        cmp 'log "- #{c+3} - #{c}"'                     'console.log(`- ${c + 3} - ${c}`)'
        cmp '"""tri#{triple}ple""" ; "dou#{double}ble"'  '`tri${triple}ple`\n`dou${double}ble`'
        cmp '"#{\'a\'}"'                                "`${'a'}`"
        cmp '"""#{"a"}"""'                              '`${"a"}`'
        cmp '"nullcheck in #{stripol ? 123}"'           "`nullcheck in ${(stripol != null ? stripol : 123)}`"
        cmp '"""{ok#} #{"well" + "1+\'2\' #{\'omg\'}" + is kinda fukked}"""'  "`{ok#} ${\"well\" + `1+'2' ${'omg'}` + is(kinda(fukked))}`"