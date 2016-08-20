xdescribe("instruction movsx:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("basic", function() {
        it("should movsx reg16 to reg32 with sign 1", function() {
            Test.code('mov dx, 1111111100000000b');
            Test.code('movsx eax, dx');
            Test.next(2);

            expect(Test.reg('eax.bin')).toEqual('11111111 11111111 11111111 00000000');
        });

        it("should movsx reg16 to reg32 with sign 0", function() {
            Test.code('mov dx, 0111111100000000b');
            Test.code('movsx eax, dx');
            Test.next(2);

            expect(Test.reg('eax.bin')).toEqual('00000000 00000000 01111111 00000000');
        });

        it("should movsx reg8h to reg32 with sign 1", function() {
            Test.code('mov dh, 11111111b');
            Test.code('movsx eax, dh');
            Test.next(2);

            expect(Test.reg('eax.bin')).toEqual('11111111 11111111 11111111 00000000');
        });

        it("should movsx reg8h to reg32 with sign 0", function() {
            Test.code('mov dh, 01111111b');
            Test.code('movsx eax, dh');
            Test.next(2);

            expect(Test.reg('eax.bin')).toEqual('00000000 00000000 01111111 00000000');
        });

        it("should movsx reg8l to reg32 with sign 1", function() {
            Test.code('mov dl, 11111111b');
            Test.code('movsx eax, dl');
            Test.next(2);

            expect(Test.reg('eax.bin')).toEqual('11111111 11111111 11111111 11111111');
        });

        it("should movsx reg8l to reg32 with sign 0", function() {
            Test.code('mov dl, 01111111b');
            Test.code('movsx eax, dl');
            Test.next(2);

            expect(Test.reg('eax.bin')).toEqual('00000000 00000000 00000000 01111111');
        });

        it("should movsx reg8h to reg16 with sign 1", function() {
            Test.code('mov dh, 11111111b');
            Test.code('movsx ax, dh');
            Test.next(2);

            expect(Test.reg('ax.bin')).toEqual('111111111 11111111');
        });

        it("should movsx reg8h to reg16 with sign 0", function() {
            Test.code('mov dh, 01111111b');
            Test.code('movsx ax, dh');
            Test.next(2);

            expect(Test.reg('ax.bin')).toEqual('00000000 01111111');
        });

        it("should movsx reg8l to reg16 with sign 1", function() {
            Test.code('mov dl, 11111111b');
            Test.code('movsx ax, dl');
            Test.next(2);

            expect(Test.reg('ax.bin')).toEqual('00000000 11111111');
        });

        it("should movsx reg8l to reg16 with sign 0", function() {
            Test.code('mov dl, 01111111b');
            Test.code('movsx ax, dl');
            Test.next(2);

            expect(Test.reg('ax.bin')).toEqual('00000000 01111111');
        });

        it("should not movsx reg16 to reg16", function() {
            Test.code('mov dx, 11111111b');
            Test.code('movsx ax, dx');
            Test.next(2);

            expect(Test.getError()).toEqual('No instruction found for: movsx ax dx');
        });

        it("should not movsx reg32 to reg8l", function() {
            Test.code('mov eax, 11111111b');
            Test.code('movsx dl, eax');
            Test.next(2);

            expect(Test.getError()).toEqual('No instruction found for: movsx dl eax');
        });
    });
});
