/*import { i18nFactory, configFactory } from '../factories'
import { message, translation, slot } from '../utils'
import { logger, CustomSlot} from '../utils'
import { Handler } from './index'
import { Dialog, Hermes, NluSlot, slotType } from 'hermes-javascript'
import convert = require('convert-units')
import { UNITS } from '../constants'
import { isUnitHandled, isOzMassOrVolume, generateTtsMeasures, generateTtsUnits } from './common'

export const conversionPossibilitiesHandler: Handler = async function (msg, flow){

    let unit, unitCat, apiUnit
    const unitSlot: NluSlot<slotType.custom> | null = message.getSlotsByName(msg, 'unit', { onlyMostConfident:true })
    const unitCatSlot: NluSlot<slotType.custom> | null = message.getSlotsByName(msg, 'unit_category', { onlyMostConfident:true })

    flow.end()
    if(unitSlot){

        unit = unitSlot.value.value 

        if(unit=='oz'){

        }
        apiUnit = await isUnitHandled(unit)

        if(!(apiUnit = await isUnitHandled(unit))){
            return translation.randomTranslation('conversionPossibilities.unitUnknown', {})
        } 

        let possibleUnits = convert().from(apiUnit).possibilities()
        const strPossibilities = await generateTtsUnits(possibleUnits)

        return translation.randomTranslation('conversionPossibilities.unitPossibilities', {
            unit: translation.randomTranslation('units.' + unit + '.plural', {}),
            possibilities: strPossibilities
        })
    } else if(unitCatSlot){

        unitCat = unitCatSlot.value.value

        try{
            let possibleUnits = convert().possibilities(unitCat)
            logger.info('\tunit possibiliites  :', possibleUnits)
            const strPossibilities = await generateTtsUnits(possibleUnits)
            return translation.randomTranslation('conversionPossibilities.measurementPossibilities', {
                measurement: unitCat,
                possibilities: strPossibilities
            })
        } catch(e){
            return translation.randomTranslation('conversionPossibilities.measureUnknown', {})
        }

    } else {
        const possibleMeasures = convert().measures()
        const strPossibilities = await generateTtsMeasures(possibleMeasures)
        return translation.randomTranslation('conversionPossibilities.generalInfo', {
            possibilities: strPossibilities
        })
    }

}*/