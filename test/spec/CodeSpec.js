describe("code:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("instruction whitespace", function() {
        it("should work with whitespace before/after instruction", function() {
            Test.code('    mov eax, 3 ');
            Test.next();

            expect(Test.reg('eax.dec')).toEqual('3');
        });

        it("should work with whitespace before/after multiple instructions", function() {
            Test.code('    mov eax, 1  ');
            Test.code('  mov eax, 2  ');
            Test.next(2);

            expect(Test.reg('eax.dec')).toEqual('2');
        });

        xit("should work when a label has whitespace", function() {
            Test.code('   start:   ');
            Test.code('mov eax, 1');
            Test.next();

            expect(Test.getError()).not.toEqual('Could not validate instruction (obj): start: ');
        });
    });

    describe("capitals", function() {
        it("should work with capitalized instruction", function() {
            Test.code('MOV eax, 3');
            Test.next();

            expect(Test.reg('eax.dec')).toEqual('3');
        });

        it("should work with some capitalized instruction characters", function() {
            Test.code('MoV eax, 3');
            Test.next();

            expect(Test.reg('eax.dec')).toEqual('3');
        });

        it("should work with capitalized registers", function() {
            Test.code('mov EAX, 3');
            Test.next();

            expect(Test.reg('eax.dec')).toEqual('3');
        });

        it("should work with some capitalized register characters", function() {
            Test.code('mov EAx, 3');
            Test.next();

            expect(Test.reg('eax.dec')).toEqual('3');
        });
    });

    describe("current line", function() {
        it("should be selected", function() {
            Test.code('mov eax, 1');
            Test.next();

            expect(Test.selectedLineAddress()).toEqual(1);
        });

        it("should be selected on the last instruction", function() {
            Test.code('mov eax, 1');
            Test.code('mov eax, 2');
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(2);
        });

        xit("should be selected with whitespace behind the instruction", function() {
            Test.code('mov eax, 1   ');
            Test.next();

            expect(Test.selectedLineAddress()).toEqual(1);
        });
    });
});

