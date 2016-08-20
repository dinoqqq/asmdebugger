describe("instruction movzx:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("basic", function() {
        it("should movzx reg16 to reg32", function() {
            Test.code('mov dx, 1111111100000000b');
            Test.code('movzx eax, dx');
            Test.next(2);

            expect(Test.reg('eax.bin')).toEqual('00000000 00000000 11111111 00000000');
        });

        it("should movzx reg8h to reg32", function() {
            Test.code('mov dh, 11111111b');
            Test.code('movzx eax, dh');
            Test.next(2);

            expect(Test.reg('eax.bin')).toEqual('00000000 00000000 00000000 11111111');
        });

        it("should movzx reg8l to reg32", function() {
            Test.code('mov dl, 11111111b');
            Test.code('movzx eax, dl');
            Test.next(2);

            expect(Test.reg('eax.bin')).toEqual('00000000 00000000 00000000 11111111');
        });

        it("should movzx reg8h to reg16", function() {
            Test.code('mov dh, 11111111b');
            Test.code('movzx ax, dh');
            Test.next(2);

            expect(Test.reg('ax.bin')).toEqual('00000000 11111111');
        });

        it("should movzx reg8l to reg16", function() {
            Test.code('mov dl, 11111111b');
            Test.code('movzx ax, dl');
            Test.next(2);

            expect(Test.reg('ax.bin')).toEqual('00000000 11111111');
        });

        it("should not movzx reg16 to reg16", function() {
            Test.code('mov dx, 11111111b');
            Test.code('movzx ax, dx');
            Test.next(2);

            expect(Test.getError()).toEqual('No instruction found for: movzx ax dx');
        });

        it("should not movzx reg32 to reg8l", function() {
            Test.code('mov eax, 11111111b');
            Test.code('movzx dl, eax');
            Test.next(2);

            expect(Test.getError()).toEqual('No instruction found for: movzx dl eax');
        });
    });
});
