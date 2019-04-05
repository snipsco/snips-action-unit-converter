import { Dialog, NluSlot } from 'hermes-javascript'

type CustomSlot = NluSlot<typeof Dialog.enums.slotType.custom>

export function createUnitSlot(name: string): CustomSlot {
    return {
        slotName: 'unit_name',
        entity: 'unit_name',
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

export function createPokemonIdSlot(id: string) {
    return {
        slotName: 'pokemon_id',
        entity: 'pokemon_id',
        confidenceScore: 1,
        rawValue: id,
        value: {
            kind: 'Custom',
            value: id
        },
        range: {
            start: 0,
            end: 1
        }
    }
}