import { Dialog, NluSlot, slotType } from 'hermes-javascript'

type CustomSlot = NluSlot<typeof Dialog.enums.slotType.custom>

export function createUnitFromSlot(name: string): CustomSlot {
    return {
        slotName: 'unit_from',
        entity: 'unit_custom',
        confidenceScore: 1,
        rawValue: name,
        value: {
            kind: Dialog.enums.slotType.custom,
            value: name
        },
        range: {
            end: 0,
            start: 1
        }
    }
}

export function createUnitToSlot(name: string): CustomSlot {
    return {
        slotName: 'unit_to',
        entity: 'unit_custom',
        confidenceScore: 1,
        rawValue: name,
        value: {
            kind: Dialog.enums.slotType.custom,
            value: name
        },
        range: {
            end: 0,
            start: 1
        }
    }
}

export function createAmountSlot(amount: number): NluSlot<slotType.number> {
    return {
        slotName: 'amount',
        entity: 'snips/number',
        confidenceScore: 1,
        rawValue: '' + amount,
        value: {
            kind: Dialog.enums.slotType.number,
            value: amount
        },
        range: {
            start: 0,
            end: 1
        }
    }
}