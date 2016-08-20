describe("instruction loop:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("basic", function() {
        it("should jump to a label and select the label when ecx = 1", function() {
            Test.code('mov ecx, 1');
            Test.code('one:');
            Test.code('inc ebx');
            Test.code('loop one');
            Test.code('two:');
            Test.next(5);

            expect(Test.selectedLineAddress()).toEqual(2);
        });

        it("should jump twice to a label and select the label when ecx = 2", function() {
            Test.code('mov ecx, 2');
            Test.code('one:');
            Test.code('inc ebx');
            Test.code('loop one');
            Test.code('two:');
            Test.next(8);

            expect(Test.selectedLineAddress()).toEqual(2);
        });

        it("should decrease ecx on a jump", function() {
            Test.code('mov ecx, 2');
            Test.code('one:');
            Test.code('inc ebx');
            Test.code('loop one');
            Test.code('two:');
            Test.next(5);

            expect(Test.reg('ecx.dec')).toEqual('1');
        });

        it("should do nothing when ecx = 0", function() {
            Test.code('one:');
            Test.code('inc ebx');
            Test.code('loop one');
            Test.code('two:');
            Test.next(4);

            expect(Test.selectedLineAddress()).toEqual(4);
        });

        it("should go along a while (infinite) when ecx = -1", function() {
            Test.code('mov ecx, -1');
            Test.code('one:');
            Test.code('inc ebx');
            Test.code('loop one');
            Test.code('two:');
            Test.next(14);

            expect(Test.selectedLineAddress()).toEqual(2);
        });
    });
});
