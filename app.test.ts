// This file will include test modules for the Test module learning
import { capitalizeFirstLetter } from './server';

test('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3);
})

test('capitalize first letter of word', (done) => {
    expect(capitalizeFirstLetter('fish')).toBe("Fish");
    done();
})

