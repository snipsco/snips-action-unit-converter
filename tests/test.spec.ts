require('./helpers/setup').bootstrap()

import Session from './helpers/session'
import { createUnitSlot } from './utils'

it('should query a Pokemon by its id and output its name', async () => {
    const session = new Session()
    await session.start({
        intentName: 'unit',
        input: 'Convert from miles',
        slots: [
            createUnitSlot('miles')
        ]
    })
    // In test mode, the i18n output is mocked as a JSON containing the i18n key and associated options.
    // (basically the arguments passed to i18n, in serialized string form)
    const endSessionMessage = await session.end()
    const { key, options } = JSON.parse(endSessionMessage.text || '')
    expect(key).toBe('unit.info')
    expect(options.name).toBe('bulbasaur')
    expect(options.weight).toBe(69)
    expect(options.height).toBe(7)
})