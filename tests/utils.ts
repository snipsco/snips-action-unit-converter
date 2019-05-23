import { Enums, NluSlot, slotType } from 'hermes-javascript/types'

type CustomSlot = NluSlot<typeof Enums.slotType.custom>

export function createUnitFromSlot(name: string): CustomSlot {
    return {
        slotName: 'unit_from',
        entity: 'unit_custom',
        confidenceScore: 1,
        rawValue: name,
        value: {
            kind: Enums.slotType.custom,
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
            kind: Enums.slotType.custom,
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
            kind: Enums.slotType.number,
            value: amount
        },
        range: {
            start: 0,
            end: 1
        }
    }
}
