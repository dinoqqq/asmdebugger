describe("instruction mov:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("basic", function() {
        it("should mov reg32 to reg32", function() {
            Test.code('mov eax, 1');
            Test.code('mov ebx, eax');
            Test.next(2);

            expect(Test.reg('ebx.dec')).toEqual('1');
        });

        it("should mov reg16 to reg16", function() {
            Test.code('mov ax, 2');
            Test.code('mov bx, ax');
            Test.next(2);

            expect(Test.reg('bx.dec')).toEqual('2');
        });

        it("should mov reg8h to reg8h", function() {
            Test.code('mov ah, 3');
            Test.code('mov bh, ah');
            Test.next(2);

            expect(Test.reg('bh.dec')).toEqual('3');
        });

        it("should mov reg8l to reg8l", function() {
            Test.code('mov al, 4');
            Test.code('mov bl, al');
            Test.next(2);

            expect(Test.reg('bl.dec')).toEqual('4');
        });

        it("should mov reg8h to reg8l", function() {
            Test.code('mov ah, 5');
            Test.code('mov bl, ah');
            Test.next(2);

            expect(Test.reg('bl.dec')).toEqual('5');
        });

        it("should mov reg8l to reg8h", function() {
            Test.code('mov al, 6');
            Test.code('mov bh, al');
            Test.next(2);

            expect(Test.reg('bh.dec')).toEqual('6');
        });

        it("should mov value to reg32", function() {
            Test.code('mov edx, 7');
            Test.next();

            expect(Test.reg('edx.dec')).toEqual('7');
        });

        it("should mov value to reg16", function() {
            Test.code('mov dx, 8');
            Test.next();

            expect(Test.reg('dx.dec')).toEqual('8');
        });

        it("should mov value to reg8h", function() {
            Test.code('mov dh, 9');
            Test.next();

            expect(Test.reg('dh.dec')).toEqual('9');
        });

        it("should mov value to reg8l", function() {
            Test.code('mov dl, 10');
            Test.next();

            expect(Test.reg('dl.dec')).toEqual('10');
        });

        it("should not mov reg16 to reg32", function() {
            Test.code('mov cx, 7');
            Test.code('mov edx, cx');
            Test.next(2);

            expect(Test.getError()).toEqual('No instruction found for: mov edx cx');
        });

        it("should not mov reg8h to reg32", function() {
            Test.code('mov ch, 7');
            Test.code('mov edx, ch');
            Test.next(2);

            expect(Test.getError()).toEqual('No instruction found for: mov edx ch');
        });

        it("should not mov val to val", function() {
            Test.code('mov 7, 8');
            Test.next();

            expect(Test.getError()).toEqual('No instruction found for: mov 7 8');
        });
    });
});

