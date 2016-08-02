describe("code:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("instruction whitespace", function() {
        it("should work with whitespace before/after instruction", function() {
            Test.code('    mov eax, 3 ');
            Test.next();

            expect($('.eax.dec').text()).toEqual('3');
        });

        it("should work with whitespace before/after multiple instructions", function() {
            Test.code('    mov eax, 1  ');
            Test.code('  mov eax, 2  ');
            Test.next();
            Test.next();


            expect($('.eax.dec').text()).toEqual('2');
        });

        xit("should work when a label has whitespace", function() {
            Test.code('   start:   ');
            Test.code('mov eax, 1');
            Test.next();

            expect(Test.getConsoleLog(2)).not.toEqual('Could not validate instruction (obj): start: ');
        });
    });

    xdescribe("current line", function() {
        it("should be selected", function() {

        });

        it("should be selected on the last instruction", function() {

        });
    });
});

