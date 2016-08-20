describe("instruction mul:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("basic", function() {
        it("should mul reg32 and set eax", function() {
            Test.code('mov eax, 5');
            Test.code('mov ebx, 2');
            Test.code('mul ebx');
            Test.next(3);

            expect(Test.reg('eax.dec')).toEqual('10');
        });

        it("should mul reg32 and set edx", function() {
            Test.code('mov eax, 0xffffffff');
            Test.code('mov ebx, 4');
            Test.code('mul ebx');
            Test.next(3);

            expect(Test.reg('edx.dec')).toEqual('3');
        });

        it("should mul reg16 and set ax", function() {
            Test.code('mov ax, 5');
            Test.code('mov bx, 2');
            Test.code('mul bx');
            Test.next(3);

            expect(Test.reg('ax.dec')).toEqual('10');
        });

        it("should mul reg16 and set dx", function() {
            Test.code('mov ax, 0xffff');
            Test.code('mov bx, 4');
            Test.code('mul bx');
            Test.next(3);

            expect(Test.reg('dx.dec')).toEqual('3');
        });

        it("should mul reg8l and set al", function() {
            Test.code('mov al, 5');
            Test.code('mov bl, 2');
            Test.code('mul bl');
            Test.next(3);

            expect(Test.reg('al.dec')).toEqual('10');
        });

        it("should mul reg8l and set ah", function() {
            Test.code('mov al, 0xff');
            Test.code('mov bl, 4');
            Test.code('mul bl');
            Test.next(3);

            expect(Test.reg('ah.dec')).toEqual('3');
        });

        it("should use al register when mulitplying with a 8h register", function() {
            Test.code('mov al, 11111101b');
            Test.code('mov bh, 4');
            Test.code('mul bh');
            Test.next(3);

            expect(Test.reg('al.bin')).toEqual('11110100');
            expect(Test.reg('ah.bin')).toEqual('00000011');
        });

        it("should multiple it's own register eax", function() {
            Test.code('mov eax, 4');
            Test.code('mul eax');
            Test.next(2);

            expect(Test.reg('eax.dec')).toEqual('16');
        });

    });

    describe("negative numbers", function() {
        it("should treat all numbers as positive (reg32)", function() {
            // signed: -2147483647
            // unsigned: 2147483649
            Test.code('mov eax, 10000000000000000000000000000001b');
            Test.code('mov ebx, 2');
            Test.code('mul ebx');
            Test.next(3);

            expect(Test.reg('eax.dec')).toEqual('2');
            expect(Test.reg('edx.dec')).toEqual('1');
        });

        it("should treat all numbers as positive (reg32) with only eax", function() {
            // signed: -2147483647
            // unsigned: 2147483649
            Test.code('mov eax, 10000000000000000000000000000001b');
            Test.code('mul eax');
            Test.next(2);

            expect(Test.reg('eax.bin')).toEqual('00000000 00000000 00000000 00000001');
            expect(Test.reg('edx.bin')).toEqual('01000000 00000000 00000000 00000001') 
        });

        it("should treat all numbers as positive (reg16)", function() {
            // signed: -32767
            // unsigned: 32769
            Test.code('mov ax, 1000000000000001b');
            Test.code('mov bx, 2');
            Test.code('mul bx');
            Test.next(3);

            expect(Test.reg('ax.dec')).toEqual('2');
            expect(Test.reg('dx.dec')).toEqual('1');
        });

        it("should treat all numbers as positive (reg16) with only ax", function() {
            // signed: -32767
            // unsigned: 32769
            Test.code('mov ax, 1000000000000001b');
            Test.code('mul ax');
            Test.next(2);

            expect(Test.reg('ax.bin')).toEqual('00000000 00000001');
            expect(Test.reg('dx.bin')).toEqual('01000000 00000001') 
        });

        it("should treat all numbers as positive (reg8)", function() {
            // signed: -127
            // unsigned: 129
            Test.code('mov al, 10000001b');
            Test.code('mov bh, 2');
            Test.code('mul bh');
            Test.next(3);

            expect(Test.reg('al.dec')).toEqual('2');
            expect(Test.reg('ah.dec')).toEqual('1');
        });

        it("should treat all numbers as positive (reg8) with only ah", function() {
            // signed: -127
            // unsigned: 129
            Test.code('mov al, 10000001b');
            Test.code('mul al');
            Test.next(2);

            expect(Test.reg('al.bin')).toEqual('00000001');
            expect(Test.reg('ah.bin')).toEqual('01000001') 
        });
    });

    describe("different bases", function() {
        it("should mul hex with bin", function() {
            Test.code('mov al, 11000001b');
            Test.code('mov bl, 0x4');
            Test.code('mul bl');
            Test.next(3);

            expect(Test.reg('al.bin')).toEqual('00000100');
            expect(Test.reg('ah.bin')).toEqual('00000011');
        });

        it("should mul dec width bin", function() {
            Test.code('mov al, 8');
            Test.code('mov bl, 10001000b');
            Test.code('mul bl');
            Test.next(3);

            expect(Test.reg('al.bin')).toEqual('01000000');
            expect(Test.reg('ah.bin')).toEqual('00000100');
        });

        it("should mul bin width hex", function() {
            Test.code('mov al, 10001000b');
            Test.code('mov bl, 0ffh');
            Test.code('mul bl');
            Test.next(3);

            expect(Test.reg('al.bin')).toEqual('01111000');
            expect(Test.reg('ah.bin')).toEqual('10000111');
        });
    });

    describe("64 bit calculation", function() {
        it("should mul 32bit with 32bit (0xfe1212fe * 0xfe1212fe)", function() {
            Test.code('mov eax, 0xfe1212fe');
            Test.code('mov edx, 0xfe1212fe');
            Test.code('mul edx');
            Test.next(3);

            expect(Test.reg('eax.hex')).toEqual('b520 b404');
            expect(Test.reg('edx.hex')).toEqual('fc27 def6');
        });

        it("should mul 32bit with 32bit (-1 * -1)", function() {
            Test.code('mov eax, -1');
            Test.code('mov edx, -1');
            Test.code('mul edx');
            Test.next(3);

            expect(Test.reg('eax.hex')).toEqual('0000 0001');
            expect(Test.reg('edx.hex')).toEqual('ffff fffe');
        });
    });
});
