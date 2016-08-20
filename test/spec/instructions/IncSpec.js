describe("instruction inc:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("basic", function() {
        it("should increase reg32", function() {
            Test.code('mov eax, 8');
            Test.code('inc eax');
            Test.next(2);

            expect(Test.reg('eax.dec')).toEqual('9');
        });

        it("should increase reg16", function() {
            Test.code('mov cx, 11');
            Test.code('inc cx');
            Test.next(2);

            expect(Test.reg('ecx.dec')).toEqual('12');
        });

        it("should increase reg8h", function() {
            Test.code('mov dh, 8');
            Test.code('inc dh');
            Test.next(2);

            expect(Test.reg('dh.dec')).toEqual('9');
        });

        it("should increase reg8l", function() {
            Test.code('mov al, 2');
            Test.code('inc al');
            Test.next(2);

            expect(Test.reg('eax.dec')).toEqual('3');
        });

        it("should not increase a value", function() {
            Test.code('inc 8');
            Test.next(1);

            expect(Test.getError()).toEqual('No instruction found for: inc 8');
        });

        it("should only increase al, not eax", function() {
            Test.code('mov eax, 0x123456ff');
            Test.code('inc al');
            Test.next(2);

            expect(Test.reg('eax.hex')).toEqual('1234 5600');
        });

        it("should only increase ah, not eax", function() {
            Test.code('mov eax, 0x1234ff56');
            Test.code('inc ah');
            Test.next(2);

            expect(Test.reg('eax.hex')).toEqual('1234 0056');
        });

        it("should only increase ax, not eax", function() {
            Test.code('mov eax, 0x1234ffff');
            Test.code('inc ax');
            Test.next(2);

            expect(Test.reg('eax.hex')).toEqual('1234 0000');
        });

        it("should only increase eax, no other registers", function() {
            Test.code('mov ebx, 0x123456ff');
            Test.code('mov ecx, 0x123456ff');
            Test.code('mov edx, 0x123456ff');
            Test.code('mov esi, 0x123456ff');
            Test.code('mov edi, 0x123456ff');
            Test.code('inc eax');
            Test.next(7);

            expect(Test.reg('ebx.hex')).toEqual('1234 56ff');
            expect(Test.reg('ecx.hex')).toEqual('1234 56ff');
            expect(Test.reg('edx.hex')).toEqual('1234 56ff');
            expect(Test.reg('esi.hex')).toEqual('1234 56ff');
            expect(Test.reg('edi.hex')).toEqual('1234 56ff');
        });
    });

    describe("negative numbers", function() {
        it("should increase a negative number", function() {
            Test.code('mov edx, -9');
            Test.code('inc edx');
            Test.next(2);

            expect(Test.reg('edx.sdec')).toEqual('-8');
        });
    });
});

