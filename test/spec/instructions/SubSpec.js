describe("instruction sub:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("basic", function() {
        it("should sub reg32 from reg32", function() {
            Test.code('mov eax, 5');
            Test.code('mov ebx, 2');
            Test.code('sub eax, ebx');
            Test.next(3);

            expect(Test.reg('eax.dec')).toEqual('3');
        });

        it("should sub reg16 from reg16", function() {
            Test.code('mov ax, 11');
            Test.code('mov bx, 9');
            Test.code('sub ax, bx');
            Test.next(3);

            expect(Test.reg('ax.dec')).toEqual('2');
        });

        it("should sub reg8h from reg8h", function() {
            Test.code('mov ah, 6');
            Test.code('mov bh, 2');
            Test.code('sub ah, bh');
            Test.next(3);

            expect(Test.reg('ah.dec')).toEqual('4');
        });

        it("should sub reg8l from reg8l", function() {
            Test.code('mov al, 4');
            Test.code('mov bl, 2');
            Test.code('sub al, bl');
            Test.next(3);

            expect(Test.reg('al.dec')).toEqual('2');
        });

        it("should sub reg8h from reg8l", function() {
            Test.code('mov ah, 5');
            Test.code('mov bl, 2');
            Test.code('sub ah, bl');
            Test.next(3);

            expect(Test.reg('ah.dec')).toEqual('3');
        });

        it("should sub reg8l from reg8h", function() {
            Test.code('mov al, 6');
            Test.code('mov bh, 3');
            Test.code('sub al, bh');
            Test.next(3);

            expect(Test.reg('al.dec')).toEqual('3');
        });

        it("should sub value from reg32", function() {
            Test.code('mov eax, 6');
            Test.code('sub eax, 2');
            Test.next(2);

            expect(Test.reg('eax.dec')).toEqual('4');
        });

        it("should sub value from reg16", function() {
            Test.code('mov ax, 6');
            Test.code('sub ax, 3');
            Test.next(2);

            expect(Test.reg('eax.dec')).toEqual('3');
        });

        it("should sub value from reg8h", function() {
            Test.code('mov ah, 9');
            Test.code('sub ah, 3');
            Test.next(2);

            expect(Test.reg('ah.dec')).toEqual('6');
        });

        it("should sub value from reg8l", function() {
            Test.code('mov al, 10');
            Test.code('sub al, 3');
            Test.next(2);

            expect(Test.reg('al.dec')).toEqual('7');
        });

        it("should not sub reg16 from reg32", function() {
            Test.code('mov ax, 7');
            Test.code('mov eax, 7');
            Test.code('sub ax, eax');
            Test.next(3);

            expect(Test.getError()).toEqual('No instruction found for: sub ax eax');
        });

        it("should not sub reg32 from reg16", function() {
            Test.code('mov ax, 6');
            Test.code('mov eax, 7');
            Test.code('sub eax, ax');
            Test.next(3);

            expect(Test.getError()).toEqual('No instruction found for: sub eax ax');
        });

        it("should not sub reg32 from reg8h", function() {
            Test.code('mov ah, 6');
            Test.code('mov eax, 7');
            Test.code('sub eax, ah');
            Test.next(3);

            expect(Test.getError()).toEqual('No instruction found for: sub eax ah');
        });

        it("should not sub val from val", function() {
            Test.code('sub 9, 8');
            Test.next();

            expect(Test.getError()).toEqual('No instruction found for: sub 9 8');
        });

        it("should sub reg32 from reg32 and do nothing with the subtrahend", function() {
            Test.code('mov eax, 5');
            Test.code('mov ebx, 2');
            Test.code('sub eax, ebx');
            Test.next(3);

            expect(Test.reg('ebx.dec')).toEqual('2');
        });
    });

    describe("negative numbers", function() {
        it("should sub with a negative minuend: -5 - 4", function() {
            Test.code('mov eax, -5');
            Test.code('mov ebx, 4');
            Test.code('sub eax, ebx');
            Test.next(3);

            expect(Test.reg('eax.sdec')).toEqual('-9');
        });

        xit("should sub with a negative subtrahend: 5 - -4", function() {
            Test.code('mov eax, 5');
            Test.code('mov ebx, -4');
            Test.code('sub eax, ebx');
            Test.next(3);

            expect(Test.reg('eax.sdec')).toEqual('9');
        });

        it("should sub with a negative subtrahend and negative minuend: -5 - -4", function() {
            Test.code('mov eax, -5');
            Test.code('mov ebx, -4');
            Test.code('sub eax, ebx');
            Test.next(3);

            expect(Test.reg('eax.sdec')).toEqual('-1');
        });

        it("should set dec register right, when difference is negative", function() {
            Test.code('mov eax, 5');
            Test.code('mov ebx, 6');
            Test.code('sub eax, ebx');
            Test.next(3);

            expect(Test.reg('eax.dec')).toEqual('4294967295');
        });
    });

    describe("different bases", function() {
        it("should sub hex from bin", function() {
            Test.code('mov eax, 00000100b');
            Test.code('mov ebx, 0x2');
            Test.code('sub eax, ebx');
            Test.next(3);

            expect(Test.reg('eax.sdec')).toEqual('2');
        });

        it("should sub dec from bin", function() {
            Test.code('mov eax, 5');
            Test.code('mov ebx, 00001000b');
            Test.code('sub eax, ebx');
            Test.next(3);

            expect(Test.reg('eax.sdec')).toEqual('-3');
        });

        it("should sub bin from hex", function() {
            Test.code('mov eax, 11111110b');
            Test.code('mov ebx, 0ffh');
            Test.code('sub eax, ebx');
            Test.next(3);

            expect(Test.reg('eax.sdec')).toEqual('-1');
        });
    });
});
