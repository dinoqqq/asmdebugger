describe("instruction cwd:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("basic", function() {
        it("should take value into ax and sign extend it into dx:ax with 0", function() {
            Test.code('mov ax, 0000111100001111b');
            Test.code('mov dx, 0000111100001111b');
            Test.code('cwd');
            Test.next(3);

            expect(Test.reg('eax.bin')).toEqual('00000000 00000000 00001111 00001111');
            expect(Test.reg('edx.bin')).toEqual('00000000 00000000 00000000 00000000');
        });

        xit("should take value into ax and sign extend it into dx:ax with 1", function() {
            Test.code('mov ax, 1000111100001111b');
            Test.code('mov dx, 1000111100001111b');
            Test.code('cwd');
            Test.next(3);

            expect(Test.reg('eax.bin')).toEqual('00000000 00000000  10001111 00001111');
            expect(Test.reg('edx.bin')).toEqual('00000000 00000000  11111111 11111111');
        });

        it("should not do anything with other registers", function() {
            Test.code('mov bx, 1111111100000000b');
            Test.code('mov cx, 1111111100000000b');
            Test.code('mov si, 1111111100000000b');
            Test.code('mov di, 1111111100000000b');
            Test.code('cwd');
            Test.next(5);

            expect(Test.reg('ebx.bin')).toEqual('00000000 00000000 11111111 00000000');
            expect(Test.reg('ecx.bin')).toEqual('00000000 00000000 11111111 00000000');
            expect(Test.reg('esi.bin')).toEqual('00000000 00000000 11111111 00000000');
            expect(Test.reg('edi.bin')).toEqual('00000000 00000000 11111111 00000000');
        });
    });
});

