describe("instruction imul:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("basic", function() {
        it("should imul reg32 and set eax", function() {
            Test.code('mov eax, 5');
            Test.code('mov ebx, 2');
            Test.code('imul ebx');
            Test.next(3);

            expect(Test.reg('eax.dec')).toEqual('10');
        });

        it("should imul reg32 and set edx", function() {
            Test.code('mov eax, 0xffffffff');
            Test.code('mov ebx, 2');
            Test.code('imul ebx');
            Test.next(3);

            expect(Test.reg('edx.hex')).toEqual('ffff ffff');
        });

        it("should imul reg16 and set ax", function() {
            Test.code('mov ax, 5');
            Test.code('mov bx, 2');
            Test.code('imul bx');
            Test.next(3);

            expect(Test.reg('ax.dec')).toEqual('10');
        });

        it("should imul reg16 and set dx", function() {
            Test.code('mov ax, 0xffff');
            Test.code('mov bx, 2');
            Test.code('imul bx');
            Test.next(3);

            expect(Test.reg('dx.hex')).toEqual('ffff');
        });

        it("should imul reg8l and set al", function() {
            Test.code('mov al, 5');
            Test.code('mov bl, 2');
            Test.code('imul bl');
            Test.next(3);

            expect(Test.reg('al.dec')).toEqual('10');
        });

        it("should imul reg8l and set ah", function() {
            Test.code('mov al, 0xff');
            Test.code('mov bl, 2');
            Test.code('imul bl');
            Test.next(3);

            expect(Test.reg('ah.hex')).toEqual('ff');
        });

        it("should use al register when imul with a 8h register", function() {
            Test.code('mov al, 11111101b');
            Test.code('mov bh, 2');
            Test.code('imul bh');
            Test.next(3);

            expect(Test.reg('al.bin')).toEqual('11111010');
            expect(Test.reg('ah.bin')).toEqual('11111111');
        });

        it("should imul it's own register eax", function() {
            Test.code('mov eax, 0xfffffffe');
            Test.code('imul eax');
            Test.next(2);

            expect(Test.reg('eax.sdec')).toEqual('4');
        });

    });

    describe("negative numbers", function() {
        it("should work with - * + numbers (reg32)", function() {
            // signed: -2147483647
            // unsigned: 2147483649
            Test.code('mov eax, 10000000000000000000000000000001b');
            Test.code('mov ebx, 2');
            Test.code('imul ebx');
            Test.next(3);

            expect(Test.reg('eax.bin')).toEqual('00000000 00000000 00000000 00000010');
            expect(Test.reg('eax.sdec')).toEqual('2');
            expect(Test.reg('edx.bin')).toEqual('11111111 11111111 11111111 11111111');
            expect(Test.reg('edx.sdec')).toEqual('-1');
        });

        it("should work with - * - numbers (reg32)", function() {
            // signed: -2147483647
            // unsigned: 2147483649
            Test.code('mov eax, 10000000000000000000000000000001b');
            Test.code('imul eax');
            Test.next(2);

            expect(Test.reg('eax.bin')).toEqual('00000000 00000000 00000000 00000001');
            expect(Test.reg('edx.bin')).toEqual('00111111 11111111 11111111 11111111');
        });

        it("should work with + * + numbers (reg32)", function() {
            Test.code('mov eax, 01000000000000000000000000000001b');
            Test.code('imul eax');
            Test.next(2);

            expect(Test.reg('eax.bin')).toEqual('10000000 00000000 00000000 00000001');
            expect(Test.reg('edx.bin')).toEqual('00010000 00000000 00000000 00000000');
        });

        it("should work with - * + numbers (reg16)", function() {
            // signed: -32767
            // unsigned: 32769
            Test.code('mov ax, 1000000000000001b');
            Test.code('mov bx, 2');
            Test.code('imul bx');
            Test.next(3);

            expect(Test.reg('ax.bin')).toEqual('00000000 00000010');
            expect(Test.reg('ax.sdec')).toEqual('2');
            expect(Test.reg('dx.bin')).toEqual('11111111 11111111');
            expect(Test.reg('dx.sdec')).toEqual('-1');
        });

        xit("should work with - * - numbers (reg16)", function() {
            // signed: -32767
            // unsigned: 32769
            Test.code('mov ax, 1000000000000001b');
            Test.code('imul ax');
            Test.next(2);

            expect(Test.reg('ax.hex')).toEqual('0001');
            expect(Test.reg('dx.hex')).toEqual('3fff');
        });

        xit("should work with + * + numbers (reg16)", function() {
            Test.code('mov ax, 0100000000000001b');
            Test.code('imul ax');
            Test.next(2);

            expect(Test.reg('ax.bin')).toEqual('10000000 00000001');
            expect(Test.reg('dx.bin')).toEqual('00010000 00000000');
        });

        it("should work with - * + numbers (reg8)", function() {
            // signed: -127
            // unsigned: 129
            Test.code('mov al, 10000001b');
            Test.code('mov bl, 2');
            Test.code('imul bl');
            Test.next(3);

            expect(Test.reg('al.bin')).toEqual('00000010');
            expect(Test.reg('al.sdec')).toEqual('2');
            expect(Test.reg('ah.bin')).toEqual('11111111');
            expect(Test.reg('ah.sdec')).toEqual('-1');
            expect(Test.reg('ax.sdec')).toEqual('-254');
        });

        xit("should work with - * - numbers (reg8)", function() {
            // signed: -127
            // unsigned: 129
            Test.code('mov al, 10000001b');
            Test.code('imul al');
            Test.next(2);

            expect(Test.reg('al.bin')).toEqual('00000001');
            expect(Test.reg('ah.bin')).toEqual('00111111');
        });

        xit("should work with + * + numbers (reg8)", function() {
            Test.code('mov ah, 01000001b');
            Test.code('imul ah');
            Test.next(2);

            expect(Test.reg('al.bin')).toEqual('10000001');
            expect(Test.reg('ah.bin')).toEqual('00010000');
        });

    });

    describe("different bases", function() {
        it("should imul hex with bin", function() {
            // signed; -63
            Test.code('mov al, 11000001b');
            Test.code('mov bl, 0x4');
            Test.code('imul bl');
            Test.next(3);

            expect(Test.reg('al.bin')).toEqual('00000100');
            expect(Test.reg('ah.bin')).toEqual('11111111');
            expect(Test.reg('ax.sdec')).toEqual('-252');
        });

        xit("should imul dec width bin", function() {
            // signed: -120
            Test.code('mov al, 8');
            Test.code('mov bl, 10001000b');
            Test.code('imul bl');
            Test.next(3);

            expect(Test.reg('al.bin')).toEqual('01000000');
            expect(Test.reg('ah.bin')).toEqual('11111100');
            expect(Test.reg('ax.sdec')).toEqual('-960');
        });

        it("should imul bin width hex", function() {
            // signed: -120
            Test.code('mov al, 10001000b');
            Test.code('mov bl, 0ffh');
            Test.code('imul bl');
            Test.next(3);

            expect(Test.reg('al.bin')).toEqual('01111000');
            expect(Test.reg('ah.bin')).toEqual('00000000');
            expect(Test.reg('ax.sdec')).toEqual('120');
        });
    });

    describe("64 bit calculation", function() {
        it("should imul 32bit with 32bit (0xfe1212fe * 0xfe1212fe)", function() {
            // signed: -32369922
            Test.code('mov eax, 0xfe1212fe');
            Test.code('mov edx, 0xfe1212fe');
            Test.code('imul edx');
            Test.next(3);

            expect(Test.reg('eax.hex')).toEqual('b520 b404');
            expect(Test.reg('edx.hex')).toEqual('0003 b8fa');
        });

        it("should imul 32bit with 32bit (0x1e1212fe * 0xfe1212fe)", function() {
            // signed: 504500990
            // signed: -32369922
            Test.code('mov eax, 0x1e1212fe');
            Test.code('mov edx, 0xfe1212fe');
            Test.code('imul edx');
            Test.next(3);

            expect(Test.reg('eax.hex')).toEqual('7520 b404');
            expect(Test.reg('edx.hex')).toEqual('ffc5 fb5a');
        });

        it("should imul 32bit with 32bit (0xffffffff * 0xffffffff)", function() {
            Test.code('mov eax, 0xffffffff');
            Test.code('mov edx, 0xffffffff');
            Test.code('imul edx');
            Test.next(3);

            expect(Test.reg('eax.hex')).toEqual('0000 0001');
            expect(Test.reg('edx.hex')).toEqual('0000 0000');
        });

        it("should imul 32bit with 32bit (1 * -1)", function() {
            Test.code('mov eax, 1');
            Test.code('mov edx, -1');
            Test.code('imul edx');
            Test.next(3);

            expect(Test.reg('eax.hex')).toEqual('ffff ffff');
            expect(Test.reg('edx.hex')).toEqual('ffff ffff');
        });
    });
});
