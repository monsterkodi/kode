#  0000000  000       0000000    0000000   0000000
# 000       000      000   000  000       000
# 000       000      000000000  0000000   0000000
# 000       000      000   000       000       000
#  0000000  0000000  000   000  0000000   0000000

{cmp} = require './test_utils'

describe 'class' ->

    it 'class' ->

        cmp """
            class A
            """ """
            class A
            {}
            """

        cmp """
            class B
                @: ->
            """ """
            class B
            {
                constructor ()
                {}
            }
            """

        cmp """
            class C
                @a: ->
                b: ->
            """ """
            class C
            {
                static a ()
                {}
                b ()
                {}
            }
            """

        cmp """
            class D
                a: =>
            """ """
            class D
            {
                constructor ()
                {
                    this.a = this.a.bind(this);
                }
                a ()
                {}
            }
            """

