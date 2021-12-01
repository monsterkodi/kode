###
 0000000  000   000  000  000000000   0000000  000   000
000       000 0 000  000     000     000       000   000
0000000   000000000  000     000     000       000000000
     000  000   000  000     000     000       000   000
0000000   00     00  000     000      0000000  000   000
###

{cmp} = require './test_utils'

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


