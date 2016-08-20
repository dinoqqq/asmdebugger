describe("instruction cmp:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("basic", function() {
        it("should cmp reg32 with reg32", function() {
            Test.code('cmp eax, ebx');
            Test.next();

            expect(Test.getError()).not.toEqual('No instruction found for: cmp eax ebx');
        });

        it("should cmp reg16 with reg16", function() {
            Test.code('cmp ax, bx');
            Test.next();

            expect(Test.getError()).not.toEqual('No instruction found for: cmp ax bx');
        });

        it("should cmp reg8h with reg8h", function() {
            Test.code('cmp ah, bh');
            Test.next();

            expect(Test.getError()).not.toEqual('No instruction found for: cmp ah bh');
        });

        it("should cmp reg8l with reg8l", function() {
            Test.code('cmp al, bl');
            Test.next();

            expect(Test.getError()).not.toEqual('No instruction found for: cmp al bl');
        });

        it("should cmp reg8l with reg8h", function() {
            Test.code('cmp al, ah');
            Test.next();

            expect(Test.getError()).not.toEqual('No instruction found for: cmp al ah');
        });

        it("should cmp reg8h with reg8l", function() {
            Test.code('cmp ah, al');
            Test.next();

            expect(Test.getError()).not.toEqual('No instruction found for: cmp ah al');
        });
    });

    describe("flags", function() {
        it("should set the carry flag when result is < 0 (6 - 7)", function() {
            Test.code('mov eax, 6');
            Test.code('mov ebx, 7');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('cf')).toEqual('1');
        });

        it("should set the carry flag when result is < 0 (0x80000000 - -3)", function() {
            Test.code('mov eax, 0x80000000');
            Test.code('mov ebx, -3');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('cf')).toEqual('1');
        });

        it("should not set the carry flag when result is > 0 (7 - 6)", function() {
            Test.code('mov eax, 7');
            Test.code('mov ebx, 6');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('cf')).toEqual('0');
        });

        it("should not set the carry flag when result is > 0 (-2 - -4)", function() {
            Test.code('mov eax, -2');
            Test.code('mov ebx, -4');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('cf')).toEqual('0');
        });

        it("should set the sign flag when result is negative (4 - 8)", function() {
            Test.code('mov eax, 4');
            Test.code('mov ebx, 8');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('sf')).toEqual('1');
        });

        it("should set the sign flag when result is negative (0x80000000 - -3)", function() {
            Test.code('mov eax, 0x80000000');
            Test.code('mov ebx, -3');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('sf')).toEqual('1');
        });

        it("should not set the sign flag when result is positive (8 - 4)", function() {
            Test.code('mov eax, 8');
            Test.code('mov ebx, 4');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('sf')).toEqual('0');
        });

        it("should not set the sign flag when result is positive (-3 - 0x80000000)", function() {
            Test.code('mov eax, -3');
            Test.code('mov ebx, 0x80000000');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('sf')).toEqual('0');
        });

        it("should set the zero flag when result is 0 (4 - 4)", function() {
            Test.code('mov eax, 4');
            Test.code('mov ebx, 4');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('zf')).toEqual('1');
        });

        it("should set the zero flag when result is 0 (-1 - 0xffffffff)", function() {
            Test.code('mov eax, -1');
            Test.code('mov ebx, 0xffffffff');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('zf')).toEqual('1');
        });

        it("should not set the zero flag when result is 1 (4 - 3)", function() {
            Test.code('mov eax, 4');
            Test.code('mov ebx, 3');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('zf')).toEqual('0');
        });

        it("should not set the zero flag when result is 1 (-1 - 0xfffffffe)", function() {
            Test.code('mov eax, -1');
            Test.code('mov ebx, 0xfffffffe');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('zf')).toEqual('0');
        });

        it("should set the overflow flag when - - + = + (0x80000000 - 6)", function() {
            Test.code('mov eax, 0x80000000');
            Test.code('mov ebx, 6');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('of')).toEqual('1');
        });

        it("should set the overflow flag when - - + = + (-3 - 0x7fffffff)", function() {
            Test.code('mov eax, -3');
            Test.code('mov ebx, 0x7fffffff');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('of')).toEqual('1');
        });

        xit("should set the overflow flag when + - - = - (6 - 0x80000000)", function() {
            Test.code('mov eax, 6');
            Test.code('mov ebx, 0x80000000');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('of')).toEqual('1');
        });

        xit("should set the overflow flag when + - - = - (0x7fffffff - -3)", function() {
            Test.code('mov eax, 0x7fffffff');
            Test.code('mov ebx, -3');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('of')).toEqual('1');
        });

        it("should not set the overflow flag when + - + = - (10 - 12)", function() {
            Test.code('mov eax, 10');
            Test.code('mov ebx, 12');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('of')).toEqual('0');
        });

        it("should not set the overflow flag when + - + = - (0x7fffffffe - 0x7fffffff)", function() {
            Test.code('mov eax, 0x7ffffffe');
            Test.code('mov ebx, 0x7fffffff');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('of')).toEqual('0');
        });

        it("should not set the overflow flag when + - + = + (10 - 8)", function() {
            Test.code('mov eax, 10');
            Test.code('mov ebx, 8');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('of')).toEqual('0');
        });

        it("should not set the overflow flag when + - + = + (0x7fffffff - 0x7ffffffe)", function() {
            Test.code('mov eax, x7fffffff');
            Test.code('mov ebx, x7ffffffe');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('of')).toEqual('0');
        });

        it("should not set the overflow flag when - - - = - (-3 - 0xffffffff)", function() {
            Test.code('mov eax, -3');
            Test.code('mov ebx, 0xffffffff');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('of')).toEqual('0');
        });

        it("should not set the overflow flag when - - - = - (0x80000000 - 0xffffffff)", function() {
            Test.code('mov eax, 0x80000000');
            Test.code('mov ebx, 0xffffffff');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('of')).toEqual('0');
        });

        it("should not set the overflow flag when - - - = + (0xffffffff - 0x80000000)", function() {
            Test.code('mov eax, 0xffffffff');
            Test.code('mov ebx, 0x80000000');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('of')).toEqual('0');
        });

        it("should not set the overflow flag when - - - = + (-3 - 0x80000000)", function() {
            Test.code('mov eax, -3');
            Test.code('mov ebx, 0x80000000');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('of')).toEqual('0');
        });

        it("should not set the overflow flag when - - + = - (0xffffffff - 10)", function() {
            Test.code('mov eax, 0xffffffff');
            Test.code('mov ebx, 10');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('of')).toEqual('0');
        });

        it("should not set the overflow flag when: - - + = - (-5 - 2)", function() {
            Test.code('mov eax, -5');
            Test.code('mov ebx, 2');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('of')).toEqual('0');
        });


        it("should not set the overflow flag when + - - = + (10 - 0xffffffff)", function() {
            Test.code('mov eax, 10');
            Test.code('mov ebx, 0xffffffff');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('of')).toEqual('0');
        });

        it("should not set the overflow flag when + - - = + (0x7ffffff0 - -6)", function() {
            Test.code('mov eax, 0x7ffffff0');
            Test.code('mov ebx, -6');
            Test.code('cmp eax, ebx');
            Test.next(3);

            expect(Test.reg('of')).toEqual('0');
        });
    });
});
