describe("registers:", function() {

    describe("basic", function() {
        it("should work with 1 instruction", function() {
            Test.code('mov eax, 1');
            Test.next();

            expect($('.eax.dec').text()).toEqual('1');
        });
    });

    describe("display dec, sdec, hex and bin registers", function() {
        it("should mov a decimal number to the registers", function() {
            Test.code('mov eax, 1');
            Test.next();

            expect(Test.reg('eax.dec')).toEqual('1');
            expect(Test.reg('eax.sdec')).toEqual('1');
            expect(Test.reg('eax.hex')).toEqual('0000 0001');
            expect(Test.reg('eax.bin')).toEqual('00000000 00000000 00000000 00000001');
        });

        it("should mov a negative number to the registers", function() {
            Test.code('mov eax, -12');
            Test.next();

            expect(Test.reg('eax.dec')).toEqual('4294967284');
            expect(Test.reg('eax.sdec')).toEqual('-12');
            expect(Test.reg('eax.hex')).toEqual('ffff fff4');
            expect(Test.reg('eax.bin')).toEqual('11111111 11111111 11111111 11110100');
        });

        it("should mov a hex number to the registers", function() {
            Test.code('mov eax, 0xf');
            Test.next();

            expect(Test.reg('eax.dec')).toEqual('15');
            expect(Test.reg('eax.sdec')).toEqual('15');
            expect(Test.reg('eax.hex')).toEqual('0000 000f');
            expect(Test.reg('eax.bin')).toEqual('00000000 00000000 00000000 00001111');
        });

        it("should mov a bin number to the registers", function() {
            Test.code('mov eax, 101b');
            Test.next();

            expect(Test.reg('eax.dec')).toEqual('5');
            expect(Test.reg('eax.sdec')).toEqual('5');
            expect(Test.reg('eax.hex')).toEqual('0000 0005');
            expect(Test.reg('eax.bin')).toEqual('00000000 00000000 00000000 00000101');
        });

    });

    describe("input number prefix and suffixes", function() {
        it("should work with suffix d", function() {
            Test.code('mov eax, 1111d');
            Test.next();

            expect(Test.reg('eax.dec')).toEqual('1111');
            expect(Test.reg('eax.sdec')).toEqual('1111');
            expect(Test.reg('eax.hex')).toEqual('0000 0457');
            expect(Test.reg('eax.bin')).toEqual('00000000 00000000 00000100 01010111');
        });

        it("should work with prefix 0x", function() {
            Test.code('mov eax, 0x1111');
            Test.next();

            expect(Test.reg('eax.dec')).toEqual('4369');
            expect(Test.reg('eax.sdec')).toEqual('4369');
            expect(Test.reg('eax.hex')).toEqual('0000 1111');
            expect(Test.reg('eax.bin')).toEqual('00000000 00000000 00010001 00010001');
        });

        it("should work with suffix b", function() {
            Test.code('mov eax, 1111b');
            Test.next();

            expect(Test.reg('eax.dec')).toEqual('15');
            expect(Test.reg('eax.sdec')).toEqual('15');
            expect(Test.reg('eax.hex')).toEqual('0000 000f');
            expect(Test.reg('eax.bin')).toEqual('00000000 00000000 00000000 00001111');
        });

        it("should work with suffix h and prefix 0", function() {
            Test.code('mov eax, 01111h');
            Test.next();

            expect(Test.reg('eax.dec')).toEqual('4369');
            expect(Test.reg('eax.sdec')).toEqual('4369');
            expect(Test.reg('eax.hex')).toEqual('0000 1111');
            expect(Test.reg('eax.bin')).toEqual('00000000 00000000 00010001 00010001');
        });
    });

    describe("8bit registers", function() {
        it("should set the right value when mov ebx", function() {
            Test.code('mov ebx, 10001000000010000010010001010111b');
            Test.next();

            expect(Test.reg('bl.dec')).toEqual('87');
            expect(Test.reg('bl.sdec')).toEqual('87');
            expect(Test.reg('bl.hex')).toEqual('57');
            expect(Test.reg('bl.bin')).toEqual('01010111');
            expect(Test.reg('bh.dec')).toEqual('36');
            expect(Test.reg('bh.sdec')).toEqual('36');
            expect(Test.reg('bh.hex')).toEqual('24');
            expect(Test.reg('bh.bin')).toEqual('00100100');
        });

        it("should set the right value when mov bx", function() {
            Test.code('mov bx, 0010010001010111b');
            Test.next();

            expect(Test.reg('bl.dec')).toEqual('87');
            expect(Test.reg('bl.sdec')).toEqual('87');
            expect(Test.reg('bl.hex')).toEqual('57');
            expect(Test.reg('bl.bin')).toEqual('01010111');
            expect(Test.reg('bh.dec')).toEqual('36');
            expect(Test.reg('bh.sdec')).toEqual('36');
            expect(Test.reg('bh.hex')).toEqual('24');
            expect(Test.reg('bh.bin')).toEqual('00100100');
        });
    });

    describe("16bit registers", function() {
        it("should set the right value when mov ecx", function() {
            Test.code('mov ecx, 10001000000010000010010001010111b');
            Test.next();

            expect(Test.reg('cx.dec')).toEqual('9303');
            expect(Test.reg('cx.sdec')).toEqual('9303');
            expect(Test.reg('cx.hex')).toEqual('2457');
            expect(Test.reg('cx.bin')).toEqual('00100100 01010111');
        });

        it("should set the right value when mov cl", function() {
            Test.code('mov cl, 01010111b');
            Test.next();

            expect(Test.reg('cx.dec')).toEqual('87');
            expect(Test.reg('cx.sdec')).toEqual('87');
            expect(Test.reg('cx.hex')).toEqual('0057');
            expect(Test.reg('cx.bin')).toEqual('00000000 01010111');
        });

        it("should set the right value when mov ch", function() {
            Test.code('mov ch, 01010111b');
            Test.next();

            expect(Test.reg('cx.dec')).toEqual('22272');
            expect(Test.reg('cx.sdec')).toEqual('22272');
            expect(Test.reg('cx.hex')).toEqual('5700');
            expect(Test.reg('cx.bin')).toEqual('01010111 00000000');
        });
    });

    describe("32bit registers", function() {
        it("should set the right value when mov dx", function() {
            Test.code('mov dx, 0010010001010111b');
            Test.next();

            expect(Test.reg('edx.dec')).toEqual('9303');
            expect(Test.reg('edx.sdec')).toEqual('9303');
            expect(Test.reg('edx.hex')).toEqual('0000 2457');
            expect(Test.reg('edx.bin')).toEqual('00000000 00000000 00100100 01010111');
        });

        it("should set the right value when mov dl", function() {
            Test.code('mov dl, 01010111b');
            Test.next();

            expect(Test.reg('edx.dec')).toEqual('87');
            expect(Test.reg('edx.sdec')).toEqual('87');
            expect(Test.reg('edx.hex')).toEqual('0000 0057');
            expect(Test.reg('edx.bin')).toEqual('00000000 00000000 00000000 01010111');
        });

        it("should set the right value when mov dh", function() {
            Test.code('mov dh, 01010111b');
            Test.next();

            expect(Test.reg('edx.dec')).toEqual('22272');
            expect(Test.reg('edx.sdec')).toEqual('22272');
            expect(Test.reg('edx.hex')).toEqual('0000 5700');
            expect(Test.reg('edx.bin')).toEqual('00000000 00000000 01010111 00000000');
        });
    });

    describe("negative numbers", function() {
        it("should set sdec for decimal with negative sign", function() {
            Test.code('mov esi, -100');
            Test.next();

            expect(Test.reg('esi.sdec')).toEqual('-100');
        });

        it("should set sdec for hexadecimal with negative sign", function() {
            Test.code('mov esi, -0xfe');
            Test.next();

            expect(Test.reg('esi.sdec')).toEqual('-254');
        });

        it("should set sdec for binary with negative sign", function() {
            Test.code('mov esi, -100b');
            Test.next();

            expect(Test.reg('esi.sdec')).toEqual('-4');
        });

        it("should set the two's complement on hex and bin", function() {
            Test.code('mov esi, -1');
            Test.next();

            expect(Test.reg('esi.hex')).toEqual('ffff ffff');
            expect(Test.reg('esi.bin')).toEqual('11111111 11111111 11111111 11111111');
        });

        it("should set 4294967295 on dec when setting -1", function() {
            Test.code('mov esi, -1');
            Test.next();

            expect(Test.reg('esi.dec')).toEqual('4294967295');
        });
    });

    describe("max. and min.", function() {
        it("should set ff on ah when moving 0xff to ah", function() {
            Test.code('mov ah, 0xff');
            Test.next();

            expect(Test.reg('ah.hex')).toEqual('ff');
        });

        it("should set 0 on ah when moving 0x100 to ah", function() {
            Test.code('mov ah, 0x100');
            Test.next();

            expect(Test.reg('ah.hex')).toEqual('00');
        });

        it("should set 1 on ah when moving 0x101 to ah", function() {
            Test.code('mov ah, 0x101');
            Test.next();

            expect(Test.reg('ah.hex')).toEqual('01');
        });

        it("should set ffff on ax when moving 0xffff to ax", function() {
            Test.code('mov ax, 0xffff');
            Test.next();

            expect(Test.reg('ax.hex')).toEqual('ffff');
        });

        it("should set 0 on ax when moving 0x10000 to ax", function() {
            Test.code('mov ax, 0x10000');
            Test.next();

            expect(Test.reg('ax.hex')).toEqual('0000');
        });

        it("should set 1 on ax when moving 0x10001 to ax", function() {
            Test.code('mov ax, 0x10001');
            Test.next();

            expect(Test.reg('ax.hex')).toEqual('0001');
        });

        it("should set ffffffff on eax when moving 0xffffffff to eax", function() {
            Test.code('mov eax, 0xffffffff');
            Test.next();

            expect(Test.reg('eax.hex')).toEqual('ffff ffff');
        });

        it("should give an error when moving 0x100000000 to eax", function() {

            Test.code('mov eax, 0x100000000');
            Test.next();

            expect(Test.reg('eax.hex')).toEqual('0000 0000');
            expect(Test.getConsoleLog(2)).toEqual('Out of range error: value 4294967296 is too large');
            expect(Test.getConsoleLog(1)).toEqual('Could not validate instruction: mov eax 0x100000000');
        });

        it("should give an error when moving 0x100000001 to eax", function() {
            Test.code('mov eax, 0x100000001');
            Test.next();

            expect(Test.reg('eax.hex')).toEqual('0000 0000');
            expect(Test.getConsoleLog(2)).toEqual('Out of range error: value 4294967297 is too large');
            expect(Test.getConsoleLog(1)).toEqual('Could not validate instruction: mov eax 0x100000001');
        });
    });
});
