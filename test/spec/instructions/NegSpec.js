describe("instruction neg:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("basic", function() {
        it("should beg reg32", function() {
            Test.code('mov eax, 5');
            Test.code('neg eax');
            Test.next(2);

            expect(Test.reg('eax.sdec')).toEqual('-5');
        });

        it("should neg reg16", function() {
            Test.code('mov ax, 11');
            Test.code('neg ax');
            Test.next(2);

            expect(Test.reg('ax.sdec')).toEqual('-11');
        });

        it("should neg reg8h", function() {
            Test.code('mov ah, 6');
            Test.code('neg ah');
            Test.next(2);

            expect(Test.reg('ah.sdec')).toEqual('-6');
        });

        it("should not neg val", function() {
            Test.code('neg 9');
            Test.next();

            expect(Test.getError()).toEqual('No instruction found for: neg 9');
        });
    });

    describe("negative numbers", function() {
        it("should neg with a negative value", function() {
            Test.code('mov eax, -5');
            Test.code('neg eax');
            Test.next(2);

            expect(Test.reg('eax.sdec')).toEqual('5');
        });
    });

    describe("flags", function() {
        it("should set carry flag when neg with a positive value causes a sign change", function() {
            Test.code('mov eax, 5');
            Test.code('neg eax');
            Test.next(2);

            expect(Test.reg('cf')).toEqual('1');
        });

        it("should set carry flag when neg with a negative value causes a sign change", function() {
            Test.code('mov eax, -5');
            Test.code('neg eax');
            Test.next(2);

            expect(Test.reg('cf')).toEqual('1');
        });

        it("should not set carry flag when neg causes no sign change", function() {
            Test.code('mov eax, 0');
            Test.code('neg eax');
            Test.next(2);

            expect(Test.reg('cf')).toEqual('0');
        });
    });

});
