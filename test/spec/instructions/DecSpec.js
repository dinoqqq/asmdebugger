describe("instruction dec:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("basic", function() {
        it("should decrease reg32", function() {
            Test.code('mov eax, 8');
            Test.code('dec eax');
            Test.next(2);

            expect(Test.reg('eax.dec')).toEqual('7');
        });

        it("should decrease reg16", function() {
            Test.code('mov cx, 11');
            Test.code('dec cx');
            Test.next(2);

            expect(Test.reg('ecx.dec')).toEqual('10');
        });

        it("should decrease reg8h", function() {
            Test.code('mov dh, 8');
            Test.code('dec dh');
            Test.next(2);

            expect(Test.reg('dh.dec')).toEqual('7');
        });

        it("should decrease reg8l", function() {
            Test.code('mov al, 2');
            Test.code('dec al');
            Test.next(2);

            expect(Test.reg('eax.dec')).toEqual('1');
        });

        it("should not decrease a value", function() {
            Test.code('dec 8');
            Test.next(1);

            expect(Test.getError()).toEqual('No instruction found for: dec 8');
        });

        it("should only decrease al, not eax", function() {
            Test.code('mov eax, 0x12345600');
            Test.code('dec al');
            Test.next(2);

            expect(Test.reg('eax.hex')).toEqual('1234 56ff');
        });

        it("should only decrease ah, not eax", function() {
            Test.code('mov eax, 0x12340056');
            Test.code('dec ah');
            Test.next(2);

            expect(Test.reg('eax.hex')).toEqual('1234 ff56');
        });

        it("should only decrease ax, not eax", function() {
            Test.code('mov eax, 0x12340000');
            Test.code('dec ax');
            Test.next(2);

            expect(Test.reg('eax.hex')).toEqual('1234 ffff');
        });

        it("should only decrease eax, no other registers", function() {
            Test.code('mov ebx, 0x123456ff');
            Test.code('mov ecx, 0x123456ff');
            Test.code('mov edx, 0x123456ff');
            Test.code('mov esi, 0x123456ff');
            Test.code('mov edi, 0x123456ff');
            Test.code('dec eax');
            Test.next(7);

            expect(Test.reg('ebx.hex')).toEqual('1234 56ff');
            expect(Test.reg('ecx.hex')).toEqual('1234 56ff');
            expect(Test.reg('edx.hex')).toEqual('1234 56ff');
            expect(Test.reg('esi.hex')).toEqual('1234 56ff');
            expect(Test.reg('edi.hex')).toEqual('1234 56ff');
        });
    });

    describe("negative numbers", function() {
        it("should decrease a negative number", function() {
            Test.code('mov edx, -9');
            Test.code('dec edx');
            Test.next(2);

            expect(Test.reg('edx.sdec')).toEqual('-10');
        });
    });
});

