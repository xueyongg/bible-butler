const sum = require('./sum');

describe("sum suite", () => {
    test('should add 2 positive numbers and return result', () => {
        expect(sum(1, 2)).toBe(3);
    });
    test('Should add 2 negative numbers together and return the result', function () {
        expect(sum(-1, -2)).toBe(-3);
    });

    test('Should add 1 positive and 1 negative numbers together and return the result', function () {
        expect(sum(-1, 2)).toBe(1);
    });

    test('Should add 1 positive and 0 together and return the result', function () {
        expect(sum(0, 2)).toBe(2);
    });

    test('Should add 1 negative and 0 together and return the result', function () {
        expect(sum(0, -2)).toBe(-2);
    });
})