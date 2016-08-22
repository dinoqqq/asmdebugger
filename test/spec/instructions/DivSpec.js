describe("instruction div:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("basic", function() {
        it("should div reg32 and set eax", function() {
            Test.code('mov eax, 14');
            Test.code('mov ebx, 2');
            Test.code('div ebx');
            Test.next(3);

            expect(Test.reg('eax.dec')).toEqual('7');
        });

        it("should div reg32 and set edx", function() {
            Test.code('mov eax, 199');
            Test.code('mov ebx, 5');
            Test.code('div ebx');
            Test.next(3);

            expect(Test.reg('edx.dec')).toEqual('4');
        });

        it("should divide reg32 with a dividend < divisor", function() {
            Test.code('mov eax, 5');
            Test.code('mov ebx, 199');
            Test.code('div ebx');
            Test.next(3);

            expect(Test.reg('eax.dec')).toEqual('0');
            expect(Test.reg('edx.dec')).toEqual('5');
        });

        it("should div reg16 and set ax", function() {
            Test.code('mov ax, 0xffff');
            Test.code('mov bx, 4');
            Test.code('div bx');
            Test.next(3);

            expect(Test.reg('ax.hex')).toEqual('3fff');
        });

        it("should div reg16 and set dx", function() {
            Test.code('mov ax, 0xfffe');
            Test.code('mov bx, 5');
            Test.code('div bx');
            Test.next(3);

            expect(Test.reg('dx.dec')).toEqual('4');
        });

        it("should divide reg16 with a dividend < divisor", function() {
            Test.code('mov ax, 5');
            Test.code('mov bx, 199');
            Test.code('div bx');
            Test.next(3);

            expect(Test.reg('ax.dec')).toEqual('0');
            expect(Test.reg('dx.dec')).toEqual('5');
        });


        it("should div reg8l and set al", function() {
            Test.code('mov al, 16');
            Test.code('mov bl, 2');
            Test.code('div bl');
            Test.next(3);

            expect(Test.reg('al.dec')).toEqual('8');
        });

        it("should div reg8l and set ah", function() {
            Test.code('mov al, 0');
            Test.code('mov ah, 1');
            Test.code('mov bl, 5');
            Test.code('div bl');
            Test.next(3);

            expect(Test.reg('ah.dec')).toEqual('1');
        });

        it("should divide reg8 with a dividend < divisor", function() {
            Test.code('mov al, 5');
            Test.code('mov bl, 199');
            Test.code('div bl');
            Test.next(3);

            expect(Test.reg('al.dec')).toEqual('0');
            expect(Test.reg('ah.dec')).toEqual('5');
        });

        it("should use al register when div with a 8h register", function() {
            Test.code('mov al, 11111100b');
            Test.code('mov bh, 4');
            Test.code('div bh');
            Test.next(3);

            expect(Test.reg('al.bin')).toEqual('00111111');
            expect(Test.reg('ah.bin')).toEqual('00000000');
        });

        it("should div it's own register eax", function() {
            Test.code('mov eax, 199');
            Test.code('div eax');
            Test.next(2);

            expect(Test.reg('eax.dec')).toEqual('1');
        });
    });

    describe("errors", function() {
        it("should give error when divide by zero", function() {
            Test.code('mov al, 11111100b');
            Test.code('mov bh, 0');
            Test.code('div bh');
            Test.next(3);

            expect(Test.getError()).toEqual('Cannot divide by 0');
        });

        it("should not change registers when divide by zero", function() {
            Test.code('mov al, 11111100b');
            Test.code('mov bh, 0');
            Test.code('div bh');
            Test.next(3);

            expect(Test.reg('al.bin')).toEqual('11111100');
            expect(Test.reg('bh.bin')).toEqual('00000000');
        });

        xit("should give error when result doesn't fit in eax", function() {
            Test.code('mov eax, 0xffffffff');
            Test.code('mov edx, 0xffffffff');
            Test.code('mov ebx, 2');
            Test.code('div ebx');
            Test.next(4);

            expect(Test.getError()).toEqual('Overflow error');
        });

        xit("should not change registers when result doesn't fit in eax", function() {
            Test.code('mov eax, 0xffffffff');
            Test.code('mov edx, 0xffffffff');
            Test.code('mov ebx, 2');
            Test.code('div ebx');
            Test.next(4);

            expect(Test.reg('eax.hex')).toEqual('ffff ffff');
            expect(Test.reg('edx.hex')).toEqual('ffff ffff');
            expect(Test.reg('ebx.hex')).toEqual('0000 0002');
        });

        xit("should give error when result doesn't fit in ax", function() {
            Test.code('mov ax, 0xffffffff');
            Test.code('mov dx, 0xffffffff');
            Test.code('mov bx, 2');
            Test.code('div bx');
            Test.next(4);

            expect(Test.getError()).toEqual('Overflow error');
        });

        xit("should not change registers when result doesn't fit in eax", function() {
            Test.code('mov eax, 0xffffffff');
            Test.code('mov edx, 0xffffffff');
            Test.code('mov ebx, 2');
            Test.code('div ebx');
            Test.next(4);

            expect(Test.reg('eax.hex')).toEqual('ffff ffff');
            expect(Test.reg('edx.hex')).toEqual('ffff ffff');
            expect(Test.reg('ebx.hex')).toEqual('0000 0002');
        });

        xit("should give error when result doesn't fit in al", function() {
            Test.code('mov al, 0xff');
            Test.code('mov ah, 0xff');
            Test.code('mov bl, 2');
            Test.code('div bl');
            Test.next(4);

            expect(Test.getError()).toEqual('Overflow error');
        });

        xit("should not change registers when result doesn't fit in al", function() {
            Test.code('mov al, 0xff');
            Test.code('mov ah, 0xff');
            Test.code('mov cl, 2');
            Test.code('div cl');
            Test.next(4);

            expect(Test.reg('al.hex')).toEqual('ff');
            expect(Test.reg('ah.hex')).toEqual('ff');
            expect(Test.reg('cl.hex')).toEqual('02');
        });
    });

    describe("negative numbers", function() {
        it("should treat all numbers as positive (reg32)", function() {
            // signed: -9223372036854775807
            // unsigned: 9223372036854775809
            Test.code('mov eax, 0x00000001');
            Test.code('mov edx, 0x80000000');
            Test.code('mov ebx, 0xffffffff');
            Test.code('div ebx');
            Test.next(4);

            expect(Test.reg('eax.hex')).toEqual('8000 0000');
            expect(Test.reg('edx.hex')).toEqual('8000 0001');
        });

        it("should treat all numbers as positive (reg32) with only eax", function() {
            // signed: -2147483647
            // unsigned: 2147483649
            Test.code('mov eax, 0x80000001');
            Test.code('mov ebx, 8');
            Test.code('div ebx');
            Test.next(3);

            expect(Test.reg('eax.hex')).toEqual('1000 0000');
            expect(Test.reg('edx.dec')).toEqual('1') 
        });

        it("should treat all numbers as positive (reg16)", function() {
            // signed: -2147483647
            // unsigned: 2147483649
            Test.code('mov ax, 0x0001');
            Test.code('mov dx, 0x8000');
            Test.code('mov bx, 0xffffffff');
            Test.code('div bx');
            Test.next(4);

            expect(Test.reg('ax.hex')).toEqual('8000');
            expect(Test.reg('dx.hex')).toEqual('8001');
        });

        it("should treat all numbers as positive (reg16) with only ax", function() {
            // signed: -32767
            // unsigned: 32769
            Test.code('mov ax, 0x8001');
            Test.code('mov bx, 8');
            Test.code('div bx');
            Test.next(3);

            expect(Test.reg('ax.hex')).toEqual('1000');
            expect(Test.reg('dx.dec')).toEqual('1') 
        });

        it("should treat all numbers as positive (reg8)", function() {
            // signed: -32767
            // unsigned: 32769
            Test.code('mov al, 0x01');
            Test.code('mov ah, 0x80');
            Test.code('mov bl, 0xff');
            Test.code('div bl');
            Test.next(4);

            expect(Test.reg('al.hex')).toEqual('80');
            expect(Test.reg('ah.hex')).toEqual('81');
        });

        it("should treat all numbers as positive (reg8) with only al", function() {
            // signed: -127
            // unsigned: 129
            Test.code('mov al, 0x81');
            Test.code('mov bl, 8');
            Test.code('div bl');
            Test.next(3);

            expect(Test.reg('al.hex')).toEqual('10');
            expect(Test.reg('ah.dec')).toEqual('1') 
        });
    });

    describe("different bases", function() {
        it("should div hex with bin", function() {
            Test.code('mov al, 11000001b');
            Test.code('mov bl, 0x4');
            Test.code('div bl');
            Test.next(3);

            expect(Test.reg('al.dec')).toEqual('48');
            expect(Test.reg('ah.dec')).toEqual('1');
        });

        it("should div dec width bin", function() {
            Test.code('mov al, 254');
            Test.code('mov bl, 10001000b');
            Test.code('div bl');
            Test.next(3);

            expect(Test.reg('al.dec')).toEqual('1');
            expect(Test.reg('ah.dec')).toEqual('118');
        });

        it("should div bin width hex", function() {
            Test.code('mov al, 0ffh');
            Test.code('mov bl, 00101000b');
            Test.code('div bl');
            Test.next(3);

            expect(Test.reg('al.dec')).toEqual('6');
            expect(Test.reg('ah.dec')).toEqual('15');
        });
    });

    describe("64 bit calculation", function() {
        it("should div 32bit with 32bit (0x0000000300000008 / 0x00000008)", function() {
            Test.code('mov eax, 8');
            Test.code('mov edx, 3');
            Test.code('mov ebx, 8');
            Test.code('div ebx');
            Test.next(4);

            expect(Test.reg('eax.bin')).toEqual('01100000 00000000 00000000 00000001');
            expect(Test.reg('edx.dec')).toEqual('0');
        });

        it("should div 32bit with 32bit (0x20000000 00000005 / 0x88888888)", function() {
            Test.code('mov eax, 0x00000005');
            Test.code('mov edx, 0x20000000');
            Test.code('mov ebx, 0x88888888');
            Test.code('div ebx');
            Test.next(4);

            expect(Test.reg('eax.hex')).toEqual('3c00 0000');
            expect(Test.reg('edx.hex')).toEqual('2000 0005');
        });

        it("should div 32bit with 32bit (0xfe1212fefe1212fe / 0xfe1212fe)", function() {
            Test.code('mov eax, 0xfe1212fe');
            Test.code('mov edx, 0xfe1212fe');
            Test.code('mov ebx, 0xfe1212ff');
            Test.code('div ebx');
            Test.next(4);

            expect(Test.reg('eax.hex')).toEqual('ffff ffff');
            expect(Test.reg('edx.hex')).toEqual('fc24 25fd');
        });

        it("should div 32bit with 32bit (0xffffffff / -2)", function() {
            Test.code('mov eax, 0xffffffff');
            Test.code('mov edx, -2');
            Test.code('div edx');
            Test.next(3);

            expect(Test.reg('eax.dec')).toEqual('1');
            expect(Test.reg('edx.dec')).toEqual('1');
        });
    });
});
