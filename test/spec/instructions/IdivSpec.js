describe("instruction idiv", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("basic", function() {
        it("should idiv reg32 and set eax", function() {
            Test.code('mov eax, 14');
            Test.code('mov ebx, 2');
            Test.code('idiv ebx');
            Test.next(3);

            expect(Test.reg('eax.dec')).toEqual('7');
        });

        it("should idiv reg32 and set edx", function() {
            Test.code('mov eax, 199');
            Test.code('mov ebx, 5');
            Test.code('idiv ebx');
            Test.next(3);

            expect(Test.reg('edx.dec')).toEqual('4');
        });

        it("should divide reg32 with a dividend < divisor", function() {
            Test.code('mov eax, 5');
            Test.code('mov ebx, 199');
            Test.code('idiv ebx');
            Test.next(3);

            expect(Test.reg('eax.dec')).toEqual('0');
            expect(Test.reg('edx.dec')).toEqual('5');
        });

        it("should idiv reg16 and set ax", function() {
            Test.code('mov ax, 0xffff');
            Test.code('mov bx, 4');
            Test.code('idiv bx');
            Test.next(3);

            expect(Test.reg('ax.hex')).toEqual('3fff');
        });

        it("should idiv reg16 and set dx", function() {
            Test.code('mov ax, 0xfffe');
            Test.code('mov bx, 5');
            Test.code('idiv bx');
            Test.next(3);

            expect(Test.reg('dx.dec')).toEqual('4');
        });

        it("should divide reg16 with a dividend < divisor", function() {
            Test.code('mov ax, 5');
            Test.code('mov bx, 199');
            Test.code('idiv bx');
            Test.next(3);

            expect(Test.reg('ax.dec')).toEqual('0');
            expect(Test.reg('dx.dec')).toEqual('5');
        });


        it("should idiv reg8l and set al", function() {
            Test.code('mov al, 16');
            Test.code('mov bl, 2');
            Test.code('idiv bl');
            Test.next(3);

            expect(Test.reg('al.dec')).toEqual('8');
        });

        it("should idiv reg8l and set ah", function() {
            Test.code('mov al, 0');
            Test.code('mov ah, 1');
            Test.code('mov bl, 5');
            Test.code('idiv bl');
            Test.next(3);

            expect(Test.reg('ah.dec')).toEqual('1');
        });

        it("should divide reg8 with a dividend < divisor", function() {
            // signed 199: -57
            Test.code('mov al, 5');
            Test.code('mov bl, 199'); 
            Test.code('idiv bl');
            Test.next(3);

            expect(Test.reg('al.dec')).toEqual('0');
            expect(Test.reg('ah.dec')).toEqual('5');
        });

        it("should use al register when idiv with a 8h register", function() {
            Test.code('mov al, 11111100b');
            Test.code('mov bh, 4');
            Test.code('idiv bh');
            Test.next(3);

            expect(Test.reg('al.bin')).toEqual('00111111');
            expect(Test.reg('ah.bin')).toEqual('00000000');
        });

        it("should idiv it's own register eax", function() {
            Test.code('mov eax, 199');
            Test.code('idiv eax');
            Test.next(2);

            expect(Test.reg('eax.sdec')).toEqual('1');
        });

        it("should have positive remainder when using positive dividend 8bit", function() {
            Test.code('mov al, 126');
            Test.code('mov bl, -60');
            Test.code('idiv bl');
            Test.next(3);

            expect(Test.reg('ah.sdec')).toEqual('6');
        });

        it("should have negative remainder when using negative dividend 8bit", function() {
            Test.code('mov al, -60');
            Test.code('mov ah, 0xff');
            Test.code('mov bl, 7');
            Test.code('idiv bl');
            Test.next(4);

            expect(Test.reg('ah.sdec')).toEqual('-4');
        });

        it("should have positive remainder when using positive dividend 16bit", function() {
            Test.code('mov ax, 1000');
            Test.code('mov dx, 0x0');
            Test.code('mov bx, 99');
            Test.code('idiv bx');
            Test.next(4);

            expect(Test.reg('dx.sdec')).toEqual('10');
        });

        it("should have negative remainder when using negative dividend 16bit", function() {
            Test.code('mov ax, -1000');
            Test.code('mov dx, 0xffff');
            Test.code('mov bx, 99');
            Test.code('idiv bx');
            Test.next(4);

            expect(Test.reg('dx.sdec')).toEqual('-10');
        });


        it("should have positive remainder when using positive dividend 32bit", function() {
            Test.code('mov eax, 700000');
            Test.code('mov edx, 0');
            Test.code('mov ebx, 699999');
            Test.code('idiv ebx');
            Test.next(4);

            expect(Test.reg('edx.sdec')).toEqual('1');
        });

        it("should have negative remainder when using negative dividend 32bit", function() {
            Test.code('mov eax, -700001');
            Test.code('mov edx, 0xffffffff');
            Test.code('mov ebx, 99999');
            Test.code('idiv ebx');
            Test.next(4);

            expect(Test.reg('edx.sdec')).toEqual('-8');
        });
    });

    describe("errors", function() {
        it("should give error when divide by zero", function() {
            Test.code('mov al, 11111100b');
            Test.code('mov bh, 0');
            Test.code('idiv bh');
            Test.next(3);

            expect(Test.getError()).toEqual('Cannot divide by 0');
        });

        it("should not change registers when divide by zero", function() {
            Test.code('mov al, 11111100b');
            Test.code('mov bh, 0');
            Test.code('idiv bh');
            Test.next(3);

            expect(Test.reg('al.bin')).toEqual('11111100');
            expect(Test.reg('bh.bin')).toEqual('00000000');
        });

       it("should give error when result doesn't fit in eax", function() {
            // signed: -9223372036854775807
            // unsigned: 9223372036854775809
            Test.code('mov eax, 0x00000001');
            Test.code('mov edx, 0x80000000');
            Test.code('mov ebx, 0xffffffff');
            Test.code('idiv ebx');
            Test.next(4);

            expect(Test.getError()).toEqual('Overflow error');
        });

        it("should not change registers when result doesn't fit in eax", function() {
            console.log('hahaha');
            Test.code('mov eax, 0xffffffff');
            Test.code('mov edx, 0x7fffffff');
            Test.code('mov ebx, 2');
            Test.code('idiv ebx');
            Test.next(4);

            expect(Test.reg('eax.hex')).toEqual('ffff ffff');
            expect(Test.reg('edx.hex')).toEqual('7fff ffff');
            expect(Test.reg('ebx.hex')).toEqual('0000 0002');
        });

        it("should give error when result doesn't fit in ax", function() {
            Test.code('mov ax, 0xffff');
            Test.code('mov dx, 0x7fff');
            Test.code('mov bx, 2');
            Test.code('idiv bx');
            Test.next(4);

            expect(Test.getError()).toEqual('Overflow error');
        });

        it("should not change registers when result doesn't fit in ax", function() {
            Test.code('mov ax, 0xffff');
            Test.code('mov dx, 0x7fff');
            Test.code('mov bx, 2');
            Test.code('idiv bx');
            Test.next(4);

            expect(Test.reg('ax.hex')).toEqual('ffff');
            expect(Test.reg('dx.hex')).toEqual('7fff');
            expect(Test.reg('bx.hex')).toEqual('0002');
        });

        it("should give error when result doesn't fit in al", function() {
            Test.code('mov al, 0xff');
            Test.code('mov ah, 0x7f');
            Test.code('mov bl, 2');
            Test.code('idiv bl');
            Test.next(4);

            expect(Test.getError()).toEqual('Overflow error');
        });

        it("should not change registers when result doesn't fit in al", function() {
            Test.code('mov al, 0xff');
            Test.code('mov ah, 0x7f');
            Test.code('mov cl, 2');
            Test.code('idiv cl');
            Test.next(4);

            expect(Test.reg('al.hex')).toEqual('ff');
            expect(Test.reg('ah.hex')).toEqual('7f');
            expect(Test.reg('cl.hex')).toEqual('02');
        });
    });

    describe("negative numbers", function() {
        it("should work with - / - numbers (reg32)", function() {
            // -1152921504606846975 / -2147483647
            Test.code('mov eax, 0x00000001');
            Test.code('mov edx, 0xf0000000');
            Test.code('mov ebx, 0x80000001');
            Test.code('idiv ebx');
            Test.next(4);

            expect(Test.reg('eax.hex')).toEqual('2000 0000');
            expect(Test.reg('edx.hex')).toEqual('e000 0001');
            expect(Test.reg('eax.sdec')).toEqual('536870912');
        });

        xit("should work with - / + numbers (reg32)", function() {
            // -1152921504606846975 / 268435457
            Test.code('mov eax, 0x00000001');
            Test.code('mov edx, 0xf0000000');
            Test.code('mov ebx, 0x10000001');
            Test.code('idiv ebx');
            Test.next(4);

            expect(Test.reg('eax.hex')).toEqual('ffff fff1');
            expect(Test.reg('edx.hex')).toEqual('0000 000f');
            expect(Test.reg('eax.sdec')).toEqual('-2147483647');
        });

        xit("should work with + / - numbers (reg32)", function() {
            // 1152921504606846977 / -268435455
            Test.code('mov eax, 0x00000001');
            Test.code('mov edx, 0x10000000');
            Test.code('mov ebx, 0xf0000001');
            Test.code('idiv ebx');
            Test.next(4);

            expect(Test.reg('eax.hex')).toEqual('ffff fffe');
            expect(Test.reg('edx.hex')).toEqual('e000 0001');
            expect(Test.reg('eax.sdec')).toEqual('-4294967312');
        });

        it("should work with + / + numbers (reg32)", function() {
            // 1152921504606846977 / 268435457
            Test.code('mov eax, 0x00000001');
            Test.code('mov edx, 0x10000000');
            Test.code('mov ebx, 0x10000001');
            Test.code('idiv ebx');
            Test.next(4);

            expect(Test.reg('eax.hex')).toEqual('ffff fff0');
            expect(Test.reg('edx.hex')).toEqual('0000 0011');
            expect(Test.reg('eax.dec')).toEqual('4294967280');
            expect(Test.reg('eax.sdec')).toEqual('-16');
        });

        it("should work with - / - numbers (reg16)", function() {
            Test.code('mov ax, 0x0001');
            Test.code('mov dx, 0xf000');
            Test.code('mov bx, 0x8001');
            Test.code('idiv bx');
            Test.next(4);

            expect(Test.reg('ax.hex')).toEqual('2000');
            expect(Test.reg('dx.hex')).toEqual('e001');
            expect(Test.reg('ax.sdec')).toEqual('8192');
        });

        xit("should work with - / + numbers (reg16)", function() {
            Test.code('mov ax, 0x0001');
            Test.code('mov dx, 0xf000');
            Test.code('mov bx, 0x1001');
            Test.code('idiv bx');
            Test.next(4);

            expect(Test.reg('ax.hex')).toEqual('fff1');
            expect(Test.reg('dx.hex')).toEqual('000f');
            expect(Test.reg('ax.sdec')).toEqual('-15');
        });

        xit("should work with + / - numbers (reg16)", function() {
            Test.code('mov ax, 0x0001');
            Test.code('mov dx, 0x1000');
            Test.code('mov bx, 0xf001');
            Test.code('idiv bx');
            Test.next(4);

            expect(Test.reg('ax.hex')).toEqual('fffe');
            expect(Test.reg('dx.hex')).toEqual('e001');
            expect(Test.reg('ax.sdec')).toEqual('-15');
        });

        it("should work with + / + numbers (reg16)", function() {
            Test.code('mov ax, 0x0001');
            Test.code('mov dx, 0x1000');
            Test.code('mov bx, 0x1001');
            Test.code('idiv bx');
            Test.next(4);

            expect(Test.reg('ax.hex')).toEqual('fff0');
            expect(Test.reg('dx.hex')).toEqual('0011');
            expect(Test.reg('ax.dec')).toEqual('65520');
            expect(Test.reg('ax.sdec')).toEqual('-16');
        });

        it("should work with - / - numbers (reg8)", function() {
            Test.code('mov al, 0x01');
            Test.code('mov ah, 0xf0');
            Test.code('mov bl, 0x81');
            Test.code('idiv bl');
            Test.next(4);

            expect(Test.reg('al.hex')).toEqual('20');
            expect(Test.reg('ah.hex')).toEqual('e1');
            expect(Test.reg('al.sdec')).toEqual('32');
        });

        xit("should work with - / + numbers (reg8)", function() {
            Test.code('mov al, 0x01');
            Test.code('mov ah, 0xf0');
            Test.code('mov bl, 0x11');
            Test.code('idiv bl');
            Test.next(4);

            expect(Test.reg('al.hex')).toEqual('f1');
            expect(Test.reg('ah.hex')).toEqual('0f');
            expect(Test.reg('al.sdec')).toEqual('-15');
        });

        xit("should work with + / - numbers (reg8)", function() {
            Test.code('mov al, 0x01');
            Test.code('mov ah, 0x10');
            Test.code('mov bl, 0xf1');
            Test.code('idiv bl');
            Test.next(4);

            expect(Test.reg('al.hex')).toEqual('fe');
            expect(Test.reg('ah.hex')).toEqual('e1');
            expect(Test.reg('al.sdec')).toEqual('-2');
        });

        it("should work with + / + numbers (reg8)", function() {
            Test.code('mov al, 0x01');
            Test.code('mov ah, 0x10');
            Test.code('mov bh, 0x11');
            Test.code('idiv bh');
            Test.next(4);

            expect(Test.reg('al.hex')).toEqual('f1');
            expect(Test.reg('ah.hex')).toEqual('00');
            expect(Test.reg('al.dec')).toEqual('241');
            expect(Test.reg('al.sdec')).toEqual('-15');
        });
    });

    describe("different bases", function() {
        xit("should idiv hex with bin", function() {
            // -63 / 4
            Test.code('mov al, 11000001b');
            Test.code('mov bl, 0x4');
            Test.code('idiv bl');
            Test.next(3);

            expect(Test.reg('al.bin')).toEqual('11110001');
            expect(Test.reg('ah.bin')).toEqual('00000011');
            expect(Test.reg('al.sdec')).toEqual('-15');
        });

        it("should idiv dec width bin", function() {
            // 126 / -60
            Test.code('mov al, 126');
            Test.code('mov bl, 11000100b');
            Test.code('idiv bl');
            Test.next(3);

            expect(Test.reg('al.bin')).toEqual('11111110');
            expect(Test.reg('ah.bin')).toEqual('00000110');
            expect(Test.reg('al.sdec')).toEqual('-2');
            expect(Test.reg('ah.sdec')).toEqual('6');
        });

        it("should idiv bin width hex", function() {
            // 40 / -1
            Test.code('mov al, 00101000b');
            Test.code('mov bl, 0ffh');
            Test.code('idiv bl');
            Test.next(3);

            expect(Test.reg('al.sdec')).toEqual('-40');
            expect(Test.reg('ah.sdec')).toEqual('0');
        });
    });

    describe("64 bit calculation", function() {
        it("should idiv 32bit with 32bit (0x0000000300000008 / 0x00000008)", function() {
            // 12884901896 / 8
            Test.code('mov eax, 8');
            Test.code('mov edx, 3');
            Test.code('mov ebx, 8');
            Test.code('idiv ebx');
            Test.next(4);

            expect(Test.reg('eax.bin')).toEqual('01100000 00000000 00000000 00000001');
            expect(Test.reg('edx.dec')).toEqual('0');
        });

        xit("should idiv 32bit with 32bit (0x2000000000000005 / 0x88888888)", function() {
            // 2305843009213694000 / -2004318072
            Test.code('mov eax, 0x00000005');
            Test.code('mov edx, 0x20000000');
            Test.code('mov ebx, 0x88888888');
            Test.code('idiv ebx');
            Test.next(4);

            expect(Test.reg('eax.hex')).toEqual('3c00 0000');
            expect(Test.reg('edx.hex')).toEqual('2000 0005');
        });

        it("should idiv 32bit with 32bit (0xfe1212fefe1212fe / 0xf01212ff)", function() {
            // -139027752101473538 / -267250945
            Test.code('mov eax, 0xfe1212fe');
            Test.code('mov edx, 0xfe1212fe');
            Test.code('mov ebx, 0xf01212ff');
            Test.code('idiv ebx');
            Test.next(4);

            expect(Test.reg('eax.hex')).toEqual('1f01 d6f2');
            expect(Test.reg('edx.hex')).toEqual('fd1b f3f0');
        });

        it("should idiv 32bit with 32bit (-2 / 0xffffffffffffffff)", function() {
            // -2 / -1
            Test.code('mov eax, 0xfffffffe');
            Test.code('mov edx, 0xffffffff');
            Test.code('mov ebx, -1');
            Test.code('idiv ebx');
            Test.next(4);

            expect(Test.reg('eax.dec')).toEqual('2');
            expect(Test.reg('edx.dec')).toEqual('0');
        });


        it("should idiv 32bit with 32bit (0xffffffffffffffff / -2)", function() {
            // -1 / -2
            Test.code('mov eax, 0xffffffff');
            Test.code('mov edx, 0xffffffff');
            Test.code('mov ebx, -2');
            Test.code('idiv ebx');
            Test.next(4);

            expect(Test.reg('eax.sdec')).toEqual('0');
            expect(Test.reg('edx.sdec')).toEqual('-1');
        });

        xit("should give overflow error with idiv 32bit with 32bit (0xfe1212fefe1212fe / 0xfe1212ff)", function() {
            // -139027752101473538 / -32369921
            Test.code('mov eax, 0xfe1212fe');
            Test.code('mov edx, 0xfe1212fe');
            Test.code('mov ebx, 0xfe1212ff');
            Test.code('idiv ebx');
            Test.next(4);

            expect(Test.reg('eax.hex')).toEqual('ffff ffff');
            expect(Test.reg('edx.hex')).toEqual('fc24 25fd');
        });
    });
});
