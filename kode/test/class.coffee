###
 0000000  000       0000000    0000000   0000000
000       000      000   000  000       000
000       000      000000000  0000000   0000000
000       000      000   000       000       000
 0000000  0000000  000   000  0000000   0000000
###

{ cmp, evl } = require './utils'

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
                    this.a = this.a.bind(this)
                }

                a ()
                {}
            }

            """

        cmp """
            class E
                @f: ->
                @g: ->
            """ """
            class E
            {
                static f ()
                {}

                static g ()
                {}
            }

            """

        cmp """
            class F
                @f: ->
                @g: ->
                @h: ->
            """ """
            class F
            {
                static f ()
                {}

                static g ()
                {}

                static h ()
                {}
            }

            """

        cmp """
            class X
                @: ->
                    '@'

                m: -> 'm'
            """ """
            class X
            {
                constructor ()
                {
                    '@'
                }

                m ()
                {
                    return 'm'
                }
            }

            """

        cmp """
            class Y
                @: -> '@'

                m: ->
                    'm'
            """ """
            class Y
            {
                constructor ()
                {
                    '@'
                }

                m ()
                {
                    return 'm'
                }
            }

            """

    # 0000000    000  000   000  0000000    
    # 000   000  000  0000  000  000   000  
    # 0000000    000  000 0 000  000   000  
    # 000   000  000  000  0000  000   000  
    # 0000000    000  000   000  0000000    
    
    it 'bind' ->

        cmp """
            class A
                @: -> @f()
                b: => log 'hello'
                f: ->
                    g = => @b()
                    g()
            """ """
            class A
            {
                constructor ()
                {
                    this.b = this.b.bind(this)
                    this.f()
                }

                b ()
                {
                    console.log('hello')
                }

                f ()
                {
                    var g

                    g = (function ()
                    {
                        return this.b()
                    }).bind(this)
                    return g()
                }
            }

            """
            
    #  0000000   000      0000000           0000000   0000000  000   000   0000000    0000000   000      
    # 000   000  000      000   000        000       000       000   000  000   000  000   000  000      
    # 000   000  000      000   000        0000000   000       000000000  000   000  000   000  000      
    # 000   000  000      000   000             000  000       000   000  000   000  000   000  000      
    #  0000000   0000000  0000000          0000000    0000000  000   000   0000000    0000000   0000000  
    
    it 'old school' ->

        evl """
            function T1
                @: ->
                f: (a) -> 1 + a
            
            function T2 extends T1
                @: ->
                f: (a) -> super(a) + 30
                
            (new T2).f 1
            """ 32
        
        evl """
            function T3
                 
                f: (a) -> 1 + a
             
            function T4 extends T3
             
                f: (a) -> super(a) + 40
                 
            (new T4).f 1
            """ 42