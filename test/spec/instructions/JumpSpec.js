/**
 * This file holds all tests for jump instructions
 */
describe("jumps:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("jmp", function() {
        it("should jump to a label and select the label", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jmp two');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(3);
        });
    });

    describe("jz", function() {
        it("should jump to a label when flag zf = 1", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jz two');

            Test.next(4);
            Debugger.Helper.setFlag('zf', 1);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(3);
        });

        it("should not jump to a label when flag zf = 0", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jz two');
            Test.code('mov eax, 7');

            Test.next(4);
            Debugger.Helper.setFlag('zf', 0);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(6);
        });
    });

    describe("jnz", function() {
        it("should jump to a label when flag zf = 0", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jnz two');

            Test.next(4);
            Debugger.Helper.setFlag('zf', 0);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(3);
        });

        it("should not jump to a label when flag zf = 1", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jnz two');
            Test.code('mov eax, 7');

            Test.next(4);
            Debugger.Helper.setFlag('zf', 1);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(6);
        });
    });

    describe("js", function() {
        it("should jump to a label when flag sf = 1", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('js two');

            Test.next(4);
            Debugger.Helper.setFlag('sf', 1);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(3);
        });

        it("should not jump to a label when flag sf = 0", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('js two');
            Test.code('mov eax, 7');

            Test.next(4);
            Debugger.Helper.setFlag('sf', 0);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(6);
        });
    });

    describe("jns", function() {
        it("should jump to a label when flag sf = 0", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jns two');

            Test.next(4);
            Debugger.Helper.setFlag('sf', 0);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(3);
        });

        it("should not jump to a label when flag sf = 1", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jns two');
            Test.code('mov eax, 7');

            Test.next(4);
            Debugger.Helper.setFlag('sf', 1);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(6);
        });
    });


    describe("jo", function() {
        it("should jump to a label when flag of = 1", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jo two');

            Test.next(4);
            Debugger.Helper.setFlag('of', 1);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(3);
        });

        it("should not jump to a label when flag of = 0", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jo two');
            Test.code('mov eax, 7');

            Test.next(4);
            Debugger.Helper.setFlag('of', 0);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(6);
        });
    });

    describe("jno", function() {
        it("should jump to a label when flag of = 0", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jno two');

            Test.next(4);
            Debugger.Helper.setFlag('of', 0);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(3);
        });

        it("should not jump to a label when flag of = 1", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jno two');
            Test.code('mov eax, 7');

            Test.next(4);
            Debugger.Helper.setFlag('of', 1);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(6);
        });
    });

    describe("jc", function() {
        it("should jump to a label when flag cf = 1", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jc two');

            Test.next(4);
            Debugger.Helper.setFlag('cf', 1);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(3);
        });

        it("should not jump to a label when flag cf = 0", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jc two');
            Test.code('mov eax, 7');

            Test.next(4);
            Debugger.Helper.setFlag('cf', 0);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(6);
        });
    });

    describe("jnc", function() {
        it("should jump to a label when flag cf = 0", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jnc two');

            Test.next(4);
            Debugger.Helper.setFlag('cf', 0);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(3);
        });

        it("should not jump to a label when flag cf = 1", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jnc two');
            Test.code('mov eax, 7');

            Test.next(4);
            Debugger.Helper.setFlag('cf', 1);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(6);
        });
    });

    describe("jb", function() {
        it("should jump to a label when cmp 3, 5 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, 3');
            Test.code('mov ebx, 5');
            Test.code('cmp eax, ebx');
            Test.code('jb one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(1);
        });

        it("should not jump to a label when cmp 5, 3 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, 5');
            Test.code('mov ebx, 3');
            Test.code('cmp eax, ebx');
            Test.code('jb one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(6);
        });

        it("should jump to a label when cmp 5, -3 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, 5');
            Test.code('mov ebx, -3');
            Test.code('cmp eax, ebx');
            Test.code('jb one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(1);
        });

        it("should not jump to a label when cmp -3, 5 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, -3');
            Test.code('mov ebx, 5');
            Test.code('cmp eax, ebx');
            Test.code('jb one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(6);
        });

        it("should jump to a label when flag cf = 1", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jb two');

            Test.next(4);
            Debugger.Helper.setFlag('cf', 1);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(3);
        });

        it("should not jump to a label when flag cf = 0", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jb two');
            Test.code('mov eax, 7');

            Test.next(4);
            Debugger.Helper.setFlag('cf', 0);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(6);
        });
    });

    describe("jbe", function() {
        it("should jump to a label when cmp 3, 5 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, 3');
            Test.code('mov ebx, 5');
            Test.code('cmp eax, ebx');
            Test.code('jbe one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(1);
        });

        it("should jump to a label when cmp 3, 3 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, 3');
            Test.code('mov ebx, 3');
            Test.code('cmp eax, ebx');
            Test.code('jbe one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(1);
        });

        it("should not jump to a label when cmp 5, 3 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, 5');
            Test.code('mov ebx, 3');
            Test.code('cmp eax, ebx');
            Test.code('jbe one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(6);
        });

        it("should jump to a label when cmp 5, -3 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, 5');
            Test.code('mov ebx, -3');
            Test.code('cmp eax, ebx');
            Test.code('jbe one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(1);
        });

        it("should jump to a label when cmp 0xfffffffe, -2 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, 0xfffffffe');
            Test.code('mov ebx, -2');
            Test.code('cmp eax, ebx');
            Test.code('jbe one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(1);
        });

        it("should not jump to a label when cmp -3, 5 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, -3');
            Test.code('mov ebx, 5');
            Test.code('cmp eax, ebx');
            Test.code('jbe one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(6);
        });

        it("should jump to a label when flag cf = 1", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jbe two');

            Test.next(4);
            Debugger.Helper.setFlag('cf', 1);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(3);
        });

        it("should jump to a label when flag zf = 1", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jbe two');

            Test.next(4);
            Debugger.Helper.setFlag('zf', 1);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(3);
        });

        it("should not jump to a label when flag cf = 0", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jbe two');
            Test.code('mov eax, 7');

            Test.next(4);
            Debugger.Helper.setFlag('cf', 0);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(6);
        });

        it("should not jump to a label when flag zf = 0", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jbe two');
            Test.code('mov eax, 7');

            Test.next(4);
            Debugger.Helper.setFlag('zf', 0);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(6);
        });
    });

    describe("ja", function() {
        it("should jump to a label when cmp 5, 3 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, 5');
            Test.code('mov ebx, 3');
            Test.code('cmp eax, ebx');
            Test.code('ja one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(1);
        });

        it("should not jump to a label when cmp 3, 5 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, 3');
            Test.code('mov ebx, 5');
            Test.code('cmp eax, ebx');
            Test.code('ja one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(6);
        });

        it("should jump to a label when cmp -3, 5 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, -3');
            Test.code('mov ebx, 5');
            Test.code('cmp eax, ebx');
            Test.code('ja one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(1);
        });

        it("should not jump to a label when cmp 5, -3 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, 5');
            Test.code('mov ebx, -3');
            Test.code('cmp eax, ebx');
            Test.code('ja one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(6);
        });

        it("should jump to a label when flag cf = 0 && zf = 0", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('ja two');

            Test.next(4);
            Debugger.Helper.setFlag('cf', 0);
            Debugger.Helper.setFlag('zf', 0);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(3);
        });

        it("should not jump to a label when flag cf = 0", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jb two');
            Test.code('mov eax, 7');

            Test.next(4);
            Debugger.Helper.setFlag('cf', 0);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(6);
        });

        it("should not jump to a label when flag zf = 0", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jb two');
            Test.code('mov eax, 7');

            Test.next(4);
            Debugger.Helper.setFlag('zf', 0);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(6);
        });
    });

    describe("jae", function() {
        it("should jump to a label when cmp 5, 3 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, 5');
            Test.code('mov ebx, 3');
            Test.code('cmp eax, ebx');
            Test.code('jae one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(1);
        });

        it("should jump to a label when cmp 3, 3 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, 3');
            Test.code('mov ebx, 3');
            Test.code('cmp eax, ebx');
            Test.code('jae one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(1);
        });

        it("should not jump to a label when cmp 3, 5 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, 3');
            Test.code('mov ebx, 5');
            Test.code('cmp eax, ebx');
            Test.code('jae one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(6);
        });

        it("should jump to a label when cmp -3, 5 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, -3');
            Test.code('mov ebx, 5');
            Test.code('cmp eax, ebx');
            Test.code('jae one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(1);
        });

        it("should jump to a label when cmp 0xfffffffe, -2 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, 0xfffffffe');
            Test.code('mov ebx, -2');
            Test.code('cmp eax, ebx');
            Test.code('jae one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(1);
        });

        it("should not jump to a label when cmp 5, -3 (unsigned)", function() {
            Test.code('one:');
            Test.code('mov eax, 5');
            Test.code('mov ebx, -3');
            Test.code('cmp eax, ebx');
            Test.code('jae one');
            Test.code('two:');
            Test.next(6);

            expect(Test.selectedLineAddress()).toEqual(6);
        });

        it("should jump to a label when flag cf = 0", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jae two');

            Test.next(4);
            Debugger.Helper.setFlag('cf', 0);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(3);
        });

        it("should not jump to a label when flag cf = 1", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jae two');
            Test.code('mov eax, 7');

            Test.next(4);
            Debugger.Helper.setFlag('cf', 1);
            Test.next(2);

            expect(Test.selectedLineAddress()).toEqual(6);
        });
    });
});

