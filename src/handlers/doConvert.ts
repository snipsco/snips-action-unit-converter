import { i18nFactory, configFactory } from '../factories'
import { message, translation, slot } from '../utils'
import { logger, CustomSlot} from '../utils'
import { Handler } from './index'
import { Dialog, Hermes, NluSlot, slotType } from 'hermes-javascript'
import convert = require('convert-units')
import { UNITS, SLOT_CONFIDENCE_THRESHOLD } from '../constants'
import { chooseBestTts, chooseBestRoundedValue, chooseBestNotation, isUnitHandled, isOzMassOrVolume } from './common'

export type KnownSlots = {
    depth: number,
    unit_from?: string,
    unit_to?: string,
    amount?: number,
    alreadyAskedBack?: boolean
}

export const doConvertHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 1 }) {

    let unitFrom, unitTo, amountToConvert

    logger.info('\tdoConvertHandle, SLOT_CONFIDENCE_THRESHOLD = ', SLOT_CONFIDENCE_THRESHOLD)

    if(!('amount' in knownSlots)){
        const amountSlot: NluSlot<slotType.number> | null = message.getSlotsByName(msg, 'amount', { onlyMostConfident:true, threshold: SLOT_CONFIDENCE_THRESHOLD})

        if(amountSlot){
            amountToConvert = amountSlot.value.value 
        } else {
            amountToConvert = 1
        }
    } else {
        // Not used for now
        logger.info('\tAmount from previous attempt :', knownSlots.amount)
        amountToConvert = knownSlots.amount
    }

    if(!('unit_from' in knownSlots)){
        const unitFromSlot : NluSlot<slotType.custom> | null = message.getSlotsByName(msg, 'unit_from', { onlyMostConfident:true, threshold: SLOT_CONFIDENCE_THRESHOLD })

        if(unitFromSlot){
            unitFrom = unitFromSlot.value.value
        }
    } else {
        // Not used for now
        logger.info('\tunit_from from previous attempt :', knownSlots.unit_from)
        unitFrom = knownSlots.unit_from
    }

    logger.info('\tUNIT_from:', unitFrom)
    if(!('unit_to' in knownSlots)){
        const unitToSlot : NluSlot<slotType.custom> | null = message.getSlotsByName(msg, 'unit_to', { onlyMostConfident:true, threshold: SLOT_CONFIDENCE_THRESHOLD })

        if(unitToSlot){
            unitTo = unitToSlot.value.value 
        }
    } else {
        // Not used for now
        logger.info('\tunit_to from previous attempt :', knownSlots.unit_to)
        unitTo = knownSlots.unit_to
    }

    logger.info('\tUNIT_to:', unitTo)

    if(!unitFrom){
        flow.end()
        return translation.randomTranslation('doConvert.missingUnitFrom', {})   
    } else if (!unitTo){
        flow.end()
        return translation.randomTranslation('doConvert.missingUnitTo', {})
    } else if (unitFrom === unitTo){
        flow.end()
        return translation.randomTranslation('doConvert.sameUnits', {})
    } else {

        flow.end()

        // If one of the unit is a ounce, we have to determine the user means a mass or a volume 
        if(unitFrom == 'oz'){
            unitFrom = await isOzMassOrVolume(unitTo)
        } else if(unitTo == 'oz'){
            unitTo = await isOzMassOrVolume(unitFrom)
        }

        try{
            let apiUnitFrom, apiUnitTo

            if(!(apiUnitFrom = await isUnitHandled(unitFrom))){
                return translation.randomTranslation('doConvert.unitFromNotHandled', {})
            } else if(!(apiUnitTo = await isUnitHandled(unitTo))&&(unitTo)){
                return translation.randomTranslation('doConvert.unitToNotHandled', {})
            }
            
            var subresult = convert(amountToConvert).from(apiUnitFrom).to(apiUnitTo)
            var result = await chooseBestRoundedValue(subresult)
            
            const unitFromTts = await chooseBestTts(amountToConvert, unitFrom)
            const unitToTts = await chooseBestTts(result, unitTo)
            const strAmount = await chooseBestNotation(amountToConvert, unitFrom)
            const strResult = await chooseBestNotation(result, unitTo)

            return translation.randomTranslation('doConvert.conversion', {
                unitFrom: unitFromTts,
                unitTo: unitToTts,
                amount: strAmount,
                amountResult: strResult
            }) 
        } catch(e){
            return translation.randomTranslation('doConvert.notSameMeasurement', {
                unitTypeFrom: translation.randomTranslation('measures.' + convert().describe(unitFrom).measure, {}),
                unitTypeTo: translation.randomTranslation('measures.' + convert().describe(unitTo).measure, {})
            })
        }
    }
}
