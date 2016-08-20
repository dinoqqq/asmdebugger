describe("instruction cbw:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("basic", function() {
        it("should take value into al and sign extend it into ax with 0", function() {
            Test.code('mov al, 00001111b');
            Test.code('cbw');
            Test.next(2);

            expect(Test.reg('eax.bin')).toEqual('00000000 00000000 00000000 00001111');
        });

        xit("should take value into al and sign extend it into ax with 1", function() {
            Test.code('mov al, 10001111b');
            Test.code('cbw');
            Test.next(2);

            expect(Test.reg('eax.bin')).toEqual('00000000 00000000 11111111 10001111');
        });

        it("should not do anything with other registers", function() {
            Test.code('mov bl, 11111111b');
            Test.code('mov cl, 11111111b');
            Test.code('mov dl, 11111111b');
            Test.code('mov esi, 11111111b');
            Test.code('mov edi, 11111111b');
            Test.code('cbw');
            Test.next(6);

            expect(Test.reg('ebx.bin')).toEqual('00000000 00000000 00000000 11111111');
            expect(Test.reg('ecx.bin')).toEqual('00000000 00000000 00000000 11111111');
            expect(Test.reg('edx.bin')).toEqual('00000000 00000000 00000000 11111111');
            expect(Test.reg('esi.bin')).toEqual('00000000 00000000 00000000 11111111');
            expect(Test.reg('edi.bin')).toEqual('00000000 00000000 00000000 11111111');
        });
    });
});

