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

        # cmp """
            # """ """
            # """

        cmp """
            switch a
                when 1 then 2; 3
            """ """
            switch (a)
            {
                case 1:
                    2
                    3
                    break
            }\n
            """

        cmp """
            switch a
                when 'a'   then i++ ; i = 1 if i == 0
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
            }\n
            """

        cmp """
            switch a
                when 'a'   then i++ ; i = 2 if i == 0
                when 'b'   then j++ ; j = 2 if j == 0
            """ """
            switch (a)
            {
                case 'a':
                    i++
                    if (i === 0)
                    {
                        i = 2
                    }
                    break
                case 'b':
                    j++
                    if (j === 0)
                    {
                        j = 2
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


