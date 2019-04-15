require('./helpers/setup').bootstrap()

import Session from './helpers/session'
import { createUnitFromSlot, createUnitToSlot, createAmountSlot } from './utils'

it('Simple conversion: should query a conversion between a unit and an amount (45km)and another(mi)', async () => {
        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:UnitConvert',
            input: 'Convert 45 kilometers to miles',
            slots: [
                createUnitFromSlot('km'),
                createUnitToSlot('mi'),
                createAmountSlot(45),
            ]
        })
        const endSessionMessage = await session.end()
        const { key, options } = JSON.parse(endSessionMessage.text || '')
        expect(key).toBe('doConvert.conversion')
        expect(options.amount).toBe('45')   
        
        expect(JSON.parse(options.unitFrom).key ).toBe('units.km.plural')
        expect(JSON.parse(options.unitTo).key ).toBe('units.mi.plural')

        expect(options.amountResult).toBe('27.962')
})


it('Simple conversion (/wout amount): should make a conversion between a unit (l) and another (ml) without amount', async () => {
    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:UnitConvert',
        input: 'Convert liters to milliliters',
        slots: [
            createUnitFromSlot('l'),
            createUnitToSlot('ml')
        ]
    })
    const endSessionMessage = await session.end()
    const { key, options } = JSON.parse(endSessionMessage.text || '')
    expect(key).toBe('doConvert.conversion')
    expect(JSON.parse(options.amount).key).toBe('units.l.determiner')
    expect(JSON.parse(options.unitFrom).key ).toBe('units.l.singular')
    expect(JSON.parse(options.unitTo).key ).toBe('units.ml.plural')
    expect(options.amountResult).toBe('1000')
})

it('Different measurement types: should return an error telling that a conversion between two different measure is impossible (digital in pressure)', async () => {
    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:UnitConvert',
        input: 'Could you convert 8 bytes in hectopascals',
        slots: [
            createUnitFromSlot('B'),
            createUnitToSlot('hPa'),
            createAmountSlot(8)
        ]
    })
    const endSessionMessage = await session.end()
    const { key, options } = JSON.parse(endSessionMessage.text || '')
    expect(key).toBe('doConvert.notSameMeasurement')
    expect(JSON.parse(options.unitTypeFrom).key).toBe('measures.digital')
    expect(JSON.parse(options.unitTypeTo).key).toBe('measures.pressure') 
})

it('Not handled unit_to: should tell that the unit_to is not handle by the converter (you can\'t convert amperes into bananas)', async () => {
    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:UnitConvert',
        input: 'I want to convert 4 amperes into bananas',
        slots: [
            createUnitFromSlot('A'),
            createUnitToSlot('banana'),
            createAmountSlot(4)
        ]
    })
    const endSessionMessage = await session.end()
    const { key, options } = JSON.parse(endSessionMessage.text || '')
    expect(key).toBe('doConvert.unitToNotHandled')
})

it('Not handled unit_from: should tell that the unit_from is not handle by the converter (you can\'t convert apples into meters)', async () => {
    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:UnitConvert',
        input: 'How many meters are in an apple?',
        slots: [
            createUnitFromSlot('apple'),
            createUnitToSlot('m'),
        ]
    })
    const endSessionMessage = await session.end()
    const { key, options } = JSON.parse(endSessionMessage.text || '')
    expect(key).toBe('doConvert.unitFromNotHandled')
})

it('Missing unit_to: break conversation saying that this unit is missing', async () => {
    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:UnitConvert',
        input: 'I want to convert 4 amperes ',
        slots: [
            createUnitFromSlot('A'),
            createAmountSlot(4)
        ]
    })
    const endSessionMessage = await session.end()
    const { key, options } = JSON.parse(endSessionMessage.text || '')
    expect(key).toBe('doConvert.missingUnitTo')
})

it('Missing unit_from(once): should ask again for unit_from (while keeping the other slots if provided) and do the conversion', async () => {
    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:UnitConvert',
        input: 'convert into days',
        slots: [
            createUnitToSlot('d')
        ]
    })
    const continueSessionMessage = await session.continue({
        intentName: 'snips-assistant:UnitConvert',
        input: 'From week',
        slots: [
            createUnitFromSlot('week')
        ]
    })
    var { key, options } = JSON.parse(continueSessionMessage.text || '')
    expect(key).toBe('doConvert.missingUnitFrom')
    const endSessionMessage = await session.end()
    var { key, options } = JSON.parse(endSessionMessage.text || '')
    
    expect(JSON.parse(options.amount).key).toBe('units.week.determiner')   
    expect(JSON.parse(options.unitFrom).key ).toBe('units.week.singular')
    expect(JSON.parse(options.unitTo).key ).toBe('units.d.plural')
    expect(options.amountResult).toBe('7')
})

it('Missing unit_from(twice): should ask again for unit_from, and stop', async () => {
    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:UnitConvert',
        input: 'convert into days',
        slots: [
            createUnitToSlot('d')
        ]
    })
    const continueSessionMessage = await session.continue({
        intentName: 'snips-assistant:UnitConvert',
        input: 'convert into days',
        slots: [
            createUnitToSlot('d')
        ]
    })
    var { key, options } = JSON.parse(continueSessionMessage.text || '')
    expect(key).toBe('doConvert.missingUnitFrom')
    const endSessionMessage = await session.end()
    var { key, options } = JSON.parse(endSessionMessage.text || '')
    
    expect(key).toBe('doConvert.missingUnitFromTwice')

})

it('Same units: should say that the conversion between same units is useless (and don\'t do the conversion)', async () => {
    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:UnitConvert',
        input: 'can you convert kelvin into kelvin',
        slots: [
            createUnitFromSlot('K'),
            createUnitToSlot('K'),
            createAmountSlot(10)
        ]
    })
    const endSessionMessage = await session.end()
    const { key, options } = JSON.parse(endSessionMessage.text || '')
    expect(key).toBe('doConvert.sameUnits')
})