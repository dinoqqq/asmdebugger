describe("instruction add:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("basic", function() {
        it("should add reg32 with reg32", function() {
            Test.code('mov eax, 5');
            Test.code('mov ebx, 2');
            Test.code('add eax, ebx');
            Test.next(3);

            expect(Test.reg('eax.dec')).toEqual('7');
        });

        it("should add reg16 with reg16", function() {
            Test.code('mov ax, 11');
            Test.code('mov bx, 9');
            Test.code('add ax, bx');
            Test.next(3);

            expect(Test.reg('ax.dec')).toEqual('20');
        });

        it("should add reg8h with reg8h", function() {
            Test.code('mov ah, 6');
            Test.code('mov bh, 2');
            Test.code('add ah, bh');
            Test.next(3);

            expect(Test.reg('ah.dec')).toEqual('8');
        });

        it("should add reg8l with reg8l", function() {
            Test.code('mov al, 4');
            Test.code('mov bl, 2');
            Test.code('add al, bl');
            Test.next(3);

            expect(Test.reg('al.dec')).toEqual('6');
        });

        it("should add reg8h with reg8l", function() {
            Test.code('mov ah, 5');
            Test.code('mov bl, 2');
            Test.code('add ah, bl');
            Test.next(3);

            expect(Test.reg('ah.dec')).toEqual('7');
        });

        it("should add reg8l with reg8h", function() {
            Test.code('mov al, 6');
            Test.code('mov bh, 3');
            Test.code('add al, bh');
            Test.next(3);

            expect(Test.reg('al.dec')).toEqual('9');
        });

        it("should add value with reg32", function() {
            Test.code('mov eax, 6');
            Test.code('add eax, 2');
            Test.next(2);

            expect(Test.reg('eax.dec')).toEqual('8');
        });

        it("should add value with reg16", function() {
            Test.code('mov ax, 6');
            Test.code('add ax, 3');
            Test.next(2);

            expect(Test.reg('eax.dec')).toEqual('9');
        });

        it("should add value with reg8h", function() {
            Test.code('mov ah, 9');
            Test.code('add ah, 3');
            Test.next(2);

            expect(Test.reg('ah.dec')).toEqual('12');
        });

        it("should add value with reg8l", function() {
            Test.code('mov al, 10');
            Test.code('add al, 3');
            Test.next(2);

            expect(Test.reg('al.dec')).toEqual('13');
        });

        it("should not add reg16 with reg32", function() {
            Test.code('mov ax, 7');
            Test.code('mov eax, 7');
            Test.code('add ax, eax');
            Test.next(3);

            expect(Test.getError()).toEqual('No instruction found for: add ax eax');
        });

        it("should not add reg32 with reg16", function() {
            Test.code('mov ax, 6');
            Test.code('mov eax, 7');
            Test.code('add eax, ax');
            Test.next(3);

            expect(Test.getError()).toEqual('No instruction found for: add eax ax');
        });

        it("should not add reg32 with reg8h", function() {
            Test.code('mov ah, 6');
            Test.code('mov eax, 7');
            Test.code('add eax, ah');
            Test.next(3);

            expect(Test.getError()).toEqual('No instruction found for: add eax ah');
        });

        it("should not add val with val", function() {
            Test.code('add 9, 8');
            Test.next();

            expect(Test.getError()).toEqual('No instruction found for: add 9 8');
        });

        it("should add reg32 with reg32 and do nothing with the summand", function() {
            Test.code('mov eax, 5');
            Test.code('mov ebx, 2');
            Test.code('add eax, ebx');
            Test.next(3);

            expect(Test.reg('ebx.dec')).toEqual('2');
        });
    });

    describe("negative numbers", function() {
        it("should add with a negative summend: -5 + 4", function() {
            Test.code('mov eax, -5');
            Test.code('mov ebx, 4');
            Test.code('add eax, ebx');
            Test.next(3);

            expect(Test.reg('eax.sdec')).toEqual('-1');
        });

        it("should add with one negative summend: 5 + -6", function() {
            Test.code('mov eax, 5');
            Test.code('mov ebx, -6');
            Test.code('add eax, ebx');
            Test.next(3);

            expect(Test.reg('eax.sdec')).toEqual('-1');
        });

        it("should add with two negative summends: -5 + -4", function() {
            Test.code('mov eax, -5');
            Test.code('mov ebx, -4');
            Test.code('add eax, ebx');
            Test.next(3);

            expect(Test.reg('eax.sdec')).toEqual('-9');
        });

        it("should set dec register right, when difference is negative", function() {
            Test.code('mov eax, 5');
            Test.code('mov ebx, -6');
            Test.code('add eax, ebx');
            Test.next(3);

            expect(Test.reg('eax.dec')).toEqual('4294967295');
        });
    });

    describe("different bases", function() {
        it("should add hex with bin", function() {
            Test.code('mov eax, 00000100b');
            Test.code('mov ebx, 0x2');
            Test.code('add eax, ebx');
            Test.next(3);

            expect(Test.reg('eax.sdec')).toEqual('6');
        });

        it("should add dec with bin", function() {
            Test.code('mov eax, 5');
            Test.code('mov ebx, 00001000b');
            Test.code('add eax, ebx');
            Test.next(3);

            expect(Test.reg('eax.sdec')).toEqual('13');
        });

        it("should add bin with hex", function() {
            Test.code('mov eax, 11111110b');
            Test.code('mov ebx, 0ffh');
            Test.code('add eax, ebx');
            Test.next(3);

            expect(Test.reg('eax.sdec')).toEqual('509');
        });
    });
});
