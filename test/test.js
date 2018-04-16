const assert = require('assert');
const postcss = require('postcss');
const treeManager = require('../src/treeManager');

describe('Tests: Simplification, Nesting, Variables and Extension', function() {
    describe('Simplification', function() {
        /* 
            div {
                marginTop: 10px;
            }
        */
        let css = "div {marginTop: 10px;}";

        /*
            div
                marginTop: 10px
        */
        let sass = "div\n\tmarginTop: 10px\n";

        let parsedCSS = postcss.parse(css);
        let sassTree = treeManager.getSASSTree(parsedCSS, false);
        
        it('sassTre.toString equals sass', function() {
            assert.equal(sassTree.toString, sass);
        });
    });

    describe('Nesting', function() {
        /*
            nav ul {
                margin: 10px;
                list-style: none;
            }
            nav li {
                display: inline-block;
            }
        */
        let css = "nav ul {margin: 10px;list-style: none;}nav li {display: inline-block;}";

        /*
            nav
                ul
                    margin: 10px
                    list-style: none
                li
                    display: inline-block
        */
        let sass = "nav\n\tul\n\t\tmargin: 10px\n\t\tlist-style: none\n\tli\n\t\tdisplay: inline-block\n";

        let parsedCSS = postcss.parse(css);
        let sassTree = treeManager.getSASSTree(parsedCSS, false);
        
        it('sassTre.toString equals sass', function() {
            assert.equal(sassTree.toString, sass);
        });
    });

    describe('Variables', function() {
        /*
            div {
                marginTop: 10px;
                marginLeft: 10px;
            } 
        */
        let css = "div {marginTop: 10px;marginLeft: 10px;}";

        /*
            $var0: 10px
            div
                marginTop: $var0
                marginLeft: $var0
        */
        let sass = "$var0: 10px\ndiv\n\tmarginTop: $var0\n\tmarginLeft: $var0\n";

        let parsedCSS = postcss.parse(css);
        let sassTree = treeManager.getSASSTree(parsedCSS, false);

        it('sassTre.toString equals sass', function() {
            assert.equal(sassTree.toString, sass);
        });
    });

    describe('Extension', function() {
        /*
            .success, .error {
                border: 1px solid #cccccc;
                padding: 10px;
                color: green;
            }
            .error {
                border-color: red;
            }
        */
        let css = ".success, .error {border: 1px solid #cccccc;padding: 10px;color: green;}.error {border-color: red;}";

        /*
            %message-shared1
                border: 1px solid #cccccc
                padding: 10px
                color: green
            .error
                @extend %message-shared1
                border-color: red
            .success
                @extend %message-shared1 
        */
        let sass = "%message-shared1\n\tborder: 1px solid #cccccc\n\tpadding: 10px\n\tcolor: green\n.error\n\t@extend %message-shared1"
            + "\n\tborder-color: red\n.success\n\t@extend %message-shared1\n";

        let parsedCSS = postcss.parse(css);
        let sassTree = treeManager.getSASSTree(parsedCSS, false);

        it('sassTre.toString equals sass', function() {
            assert.equal(sassTree.toString, sass);
        });
    });

    describe('Simplification + Nesting + Variables + Extension', function() {
        /*
            .success, .error {
                border: 1px solid #cccccc;
                padding: 10px;
                color: green;
            }
            .error {
                border-color: red;
            }
            nav ul {
                margin: 10px;
                list-style: none;
            }
            nav li {
                display: inline-block;
            }
        */
        let css = ".success, .error {border: 1px solid #cccccc;padding: 10px;color: green;}.error {border-color: red;}"
            + "nav ul {margin: 10px;list-style: none;}nav li {display: inline-block;}";

        /*
            $var0: 10px
            %message-shared1
                border: 1px solid #cccccc
                padding: $var0
                color: green
            .error
                @extend %message-shared1
                border-color: red
            nav 
                ul
                    margin: $var0
                    list-style: none
                li 
                    display: inline-block
            .success
                @extend %message-shared1 
        */
        let sass = "$var0: 10px\n%message-shared1\n\tborder: 1px solid #cccccc\n\tpadding: $var0"
            + "\n\tcolor: green\n.error\n\t@extend %message-shared1\n\tborder-color: red\n"
            + "nav\n\tul\n\t\tmargin: $var0\n\t\tlist-style: none\n\tli\n\t\tdisplay: inline-block\n"
            + ".success\n\t@extend %message-shared1\n";

        let parsedCSS = postcss.parse(css);
        let sassTree = treeManager.getSASSTree(parsedCSS, false);

        it('sassTre.toString equals sass', function() {
            assert.equal(sassTree.toString, sass);
        });
    });

    describe('All variables', function() {
        /*
            .success, .error {
                border: 1px solid #cccccc;
                padding: 10px;
                color: green;
            }
            .error {
                border-color: red;
            }
            nav ul {
                margin: 10px;
                list-style: none;
            }
            nav li {
                display: inline-block;
            }
        */
       let css = ".success, .error {border: 1px solid #cccccc;padding: 10px;color: green;}.error {border-color: red;}"
       + "nav ul {margin: 10px;list-style: none;}nav li {display: inline-block;}";

        /*
            $var0: 1px solid #cccccc
            $var1: 10px
            $var2: green
            $var3: red
            $var4: none
            $var5: inline-block
            %message-shared1
                border: $var0
                padding: $var1
                color: $var2
            .error
                @extend %message-shared1
                border-color: $var3
            nav 
                ul
                    margin: $var1
                    list-style: $var4
                li 
                    display: $var5
            .success
                @extend %message-shared1 
        */
       let sass = "$var0: 1px solid #cccccc\n$var1: 10px\n$var2: green\n$var3: red\n$var4: none\n$var5: inline-block"
       + "\n%message-shared1\n\tborder: $var0\n\tpadding: $var1\n\tcolor: $var2\n.error\n\t@extend %message-shared1"
       + "\n\tborder-color: $var3\nnav\n\tul\n\t\tmargin: $var1\n\t\tlist-style: $var4\n\tli\n\t\tdisplay: $var5\n"
       + ".success\n\t@extend %message-shared1\n";

        let parsedCSS = postcss.parse(css);
        let sassTree = treeManager.getSASSTree(parsedCSS, true);

        it('sassTre.toString equals sass', function() {
            assert.equal(sassTree.toString, sass);
        });
    });
});
  

