import { SequenceElementType } from "./CoreTypes";

class CharSequenceI implements SequenceElementType<string, string> {
    public identityForSequenceElementFunc(sequenceElement: string): string {
        return sequenceElement;
    }
    public sequenceElementStringificationFunc(sequenceElement: string): string {
        return sequenceElement;
    }
}

export const charSequence: SequenceElementType<string, string> = new CharSequenceI();