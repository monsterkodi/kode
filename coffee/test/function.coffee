###
00000000  000   000  000   000   0000000  000000000  000   0000000   000   000  
000       000   000  0000  000  000          000     000  000   000  0000  000  
000000    000   000  000 0 000  000          000     000  000   000  000 0 000  
000       000   000  000  0000  000          000     000  000   000  000  0000  
000        0000000   000   000   0000000     000     000   0000000   000   000  
###

{cmp} = require './utils'

describe 'function' ->

    it 'function' ->

        cmp """
            function A
            """ """

            A = (function ()
            {
                return A
            })()

            """

        # cmp """
            # class B
                # @: ->
            # """ """

            # class B
            # {
                # constructor ()
                # {}
            # }

            # """

        # cmp """
            # class C
                # @a: ->
                # b: ->
            # """ """

            # class C
            # {
                # static a ()
                # {}

                # b ()
                # {}
            # }

            # """

        # cmp """
            # class D
                # a: =>
            # """ """

            # class D
            # {
                # constructor ()
                # {
                    # this.a = this.a.bind(this)
                # }

                # a ()
                # {}
            # }

            # """

        # cmp """
            # class E
                # @f: ->
                # @g: ->
            # """ """

            # class E
            # {
                # static f ()
                # {}

                # static g ()
                # {}
            # }

            # """

        # cmp """
            # class F
                # @f: ->
                # @g: ->
                # @h: ->
            # """ """

            # class F
            # {
                # static f ()
                # {}

                # static g ()
                # {}

                # static h ()
                # {}
            # }

            # """

        # cmp """
            # class X
                # @: ->
                    # '@'

                # m: -> 'm'
            # """ """

            # class X
            # {
                # constructor ()
                # {
                    # '@'
                # }

                # m ()
                # {
                    # return 'm'
                # }
            # }

            # """

        # cmp """
            # class Y
                # @: -> '@'

                # m: ->
                    # 'm'
            # """ """

            # class Y
            # {
                # constructor ()
                # {
                    # '@'
                # }

                # m ()
                # {
                    # return 'm'
                # }
            # }

            # """

    # 0000000    000  000   000  0000000    
    # 000   000  000  0000  000  000   000  
    # 0000000    000  000 0 000  000   000  
    # 000   000  000  000  0000  000   000  
    # 0000000    000  000   000  0000000    
    
    # it 'bind' ->

        # cmp """
            # class A
                # @: -> @f()
                # b: => log 'hello'
                # f: ->
                    # g = => @b()
                    # g()
            # """ """

            # class A
            # {
                # constructor ()
                # {
                    # this.f()
                    # this.b = this.b.bind(this)
                # }

                # b ()
                # {
                    # console.log('hello')
                # }

                # f ()
                # {
                    # var g

                    # g = (function ()
                    # {
                        # return this.b()
                    # }).bind(this)
                    # return g()
                # }
            # }

            # """
