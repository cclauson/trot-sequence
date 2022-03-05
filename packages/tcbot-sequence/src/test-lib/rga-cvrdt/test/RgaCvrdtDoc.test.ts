import { expect } from 'chai';
import { charSequence } from '../../sequence-types/CharSequence';
import { EffectSequenceElement, RgaCvrdtDoc } from '../RgaCvrdtDoc';

function compareNumbers(n1: number, n2: number): number {
    return n1 - n2;
}

function charSequenceWithOrder(chars: string, order: number): EffectSequenceElement<string, number>[] {
    return chars.split('').map(c => { 
        return {
            sequenceElement: c,
            order
        };
     });
}

describe('RgaCvrdt doc', () => {
    it('read document with no deleted content', () => {
        const document = new RgaCvrdtDoc<string, string, number>(
            charSequenceWithOrder('abc', 0),
            new Set<string>(),
            charSequence,
            compareNumbers
        );
        const readResult = document.read();
        expect(readResult.join('')).equals('abc');
    });

    it('read document with all deleted content', () => {
        const document = new RgaCvrdtDoc<string, string, number>(
            charSequenceWithOrder('abc', 0),
            new Set<string>(['a', 'b', 'c']),
            charSequence,
            compareNumbers
        );
        const readResult = document.read();
        expect(readResult.join('')).equals('');
    });

    it('read document with some deleted content', () => {
        const document = new RgaCvrdtDoc<string, string, number>(
            charSequenceWithOrder('abc', 0),
            new Set<string>(['b']),
            charSequence,
            compareNumbers
        );
        const readResult = document.read();
        expect(readResult.join('')).equals('ac');
    });

    it('merge disjoint document states results as expected', () => {
        const document1 = new RgaCvrdtDoc<string, string, number>(
            charSequenceWithOrder('abc', 1),
            new Set<string>(['b']),
            charSequence,
            compareNumbers
        );
        const document2 = new RgaCvrdtDoc<string, string, number>(
            charSequenceWithOrder('xyz', 0),
            new Set<string>(['x', 'z']),
            charSequence,
            compareNumbers
        );
        const merged = document1.merge(document2, );
        expect(merged.getEffectSequence().map(seqel => seqel.sequenceElement).join('')).equals('abcxyz');
        expect(merged.getDeleted().has('b'));
        expect(merged.getDeleted().has('x'));
        expect(merged.getDeleted().has('z'));
    });

    it('merge identical document states is idempotent', () => {
        const document = new RgaCvrdtDoc<string, string, number>(
            charSequenceWithOrder('abc', 0),
            new Set<string>(['b']),
            charSequence,
            compareNumbers
        );
        const merged = document.merge(document);
        expect(merged.getEffectSequence().map(seqel => seqel.sequenceElement).join('')).equals('abc');
        expect(merged.getDeleted().has('b'));
    });

    it('merge false tie states is as expected', () => {
        const abcSequence = charSequenceWithOrder('abc', 0);
        const document1 = new RgaCvrdtDoc<string, string, number>(
            abcSequence,
            new Set<string>(['b']),
            charSequence,
            compareNumbers
        );
        const sequenceWithX = [...abcSequence];
        sequenceWithX.splice(1, 0, ...charSequenceWithOrder('x', 1));
        const document2 = new RgaCvrdtDoc<string, string, number>(
            sequenceWithX,
            new Set<string>(),
            charSequence,
            compareNumbers
        );
        const sequenceWithY = [...abcSequence];
        sequenceWithY.splice(2, 0, ...charSequenceWithOrder('y', 2));
        const document3 = new RgaCvrdtDoc<string, string, number>(
            sequenceWithY,
            new Set<string>(),
            charSequence,
            compareNumbers
        );
        const merged1 = document1.merge(document2);
        const merged = merged1.merge(document3);
        expect(merged.read().join('')).equals('axyc');
    });
});
