require('./helpers/setup').bootstrap()

import Session from './helpers/session'
import { createUnitFromSlot, createUnitToSlot, createAmountSlot } from './utils'

it.only('should query a conversion between a unit and an amount (45km)and another(mi)', async () => {
    console.log('test1')
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
        console.log('beforeEndSess')
        const endSessionMessage = await session.end()
        console.log('afterEndSess')
        //expect(endSessionMessage).toBe('test')
        const { key, options } = JSON.parse(endSessionMessage.text || '')
        expect(key).toBe('doConvert.conversion')
        expect(options.amount).toBe(45)   
        expect(options.unitFrom).toBe('km')
        expect(options.unitTo).toBe('mi')
        expect(options.amountResult).toBe(27.962)


    // In test mode, the i18n output is mocked as a JSON containing the i18n key and associated options.
    // (basically the arguments passed to i18n, in serialized string form)

})

/*
it('should make a conversion between a unit (l) and another (ml) without amount', async () => {
    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:UnitConvert',
        input: 'Convert liters to milliliters',
        slots: [
            createUnitFromSlot('l'),
            createUnitToSlot('ml')
        ]
    })
    // In test mode, the i18n output is mocked as a JSON containing the i18n key and associated options.
    // (basically the arguments passed to i18n, in serialized string form)
    const endSessionMessage = await session.end()
    const { key, options } = JSON.parse(endSessionMessage.text || '')
    expect(key).toBe('doConvert.conversion')
    expect(options.amount).toBe(1)
    expect(options.unitFrom).toBe('l')
    expect(options.unitTo).toBe('ml')
    expect(options.amountResult).toBe(1000)
})
*/
it('should return an error telling that a conversion between two different measure is impossible (digital in pressure)', async () => {
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
    // In test mode, the i18n output is mocked as a JSON containing the i18n key and associated options.
    // (basically the arguments passed to i18n, in serialized string form)
    const endSessionMessage = await session.end()
    const { key, options } = JSON.parse(endSessionMessage.text || '')
    expect(key).toBe('doConvert.conversion')
    expect(options.amount).toBe(1)
    expect(options.unitFrom).toBe('l')
    expect(options.unitTo).toBe('ml')
    expect(options.amountResult).toBe(1000)
})/*
*//*
it('should tell that the unit_to is not handle by the converter (you can\'t convert amperes into bananas)', async () => {
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
    // In test mode, the i18n output is mocked as a JSON containing the i18n key and associated options.
    // (basically the arguments passed to i18n, in serialized string form)
    const endSessionMessage = await session.end()
    const { key, options } = JSON.parse(endSessionMessage.text || '')
    expect(key).toBe('unit.info')
    expect(options.name).toBe('bulbasaur')
    expect(options.amount).toBe(27.962)
})*//*
*//*
it('should tell that the unit_from is not handle by the converter (you can\'t convert apples into meters)', async () => {
    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:UnitConvert',
        input: 'How many meters are in an apple?',
        slots: [
            createUnitFromSlot('apple'),
            createUnitToSlot('m'),
        ]
    })
    // In test mode, the i18n output is mocked as a JSON containing the i18n key and associated options.
    // (basically the arguments passed to i18n, in serialized string form)
    const endSessionMessage = await session.end()
    const { key, options } = JSON.parse(endSessionMessage.text || '')
    expect(key).toBe('unit.info')
    expect(options.name).toBe('bulbasaur')
    expect(options.amount).toBe(27.962)
})*/
/*
it('should ask again for unit_from (while keeping the other slots if provided)', async () => {
    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:UnitConvert',
        input: 'convert into days',
        slots: [
            createUnitToSlot('d')
        ]
    })
    // In test mode, the i18n output is mocked as a JSON containing the i18n key and associated options.
    // (basically the arguments passed to i18n, in serialized string form)
    const continueSessionMessage = await session.continue({
        intentName: 'snips-assistant:UnitConvert',
        input: 'From week',
        slots: [
            createUnitFromSlot('week')
        ]
    })
    const endSessionMessage = await session.end()
    const { key, options } = JSON.parse(endSessionMessage.text || '')
    expect(key).toBe('doConvert.missingUnitFrom')
    expect(options.amount).toBe(1)   
    expect(options.unitFrom).toBe('week')
    expect(options.unitTo).toBe('d')
    expect(options.amountResult).toBe(7)
})*/
/*
it('should say that the conversion between same units is useless (and don\'t do the conversion)', async () => {
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
    // In test mode, the i18n output is mocked as a JSON containing the i18n key and associated options.
    // (basically the arguments passed to i18n, in serialized string form)
    const endSessionMessage = await session.end()
    const { key, options } = JSON.parse(endSessionMessage.text || '')
    expect(key).toBe('unit.info')
    expect(options.name).toBe('bulbasaur')
    expect(options.amount).toBe(27.962)
})*/