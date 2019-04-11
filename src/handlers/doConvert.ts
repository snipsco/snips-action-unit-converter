import { getPokemon } from '../api'
import { i18nFactory, configFactory } from '../factories'
import { message, translation, slot } from '../utils'
import { logger, CustomSlot} from '../utils'
import { Handler } from './index'
import { Dialog, Hermes, NluSlot, slotType } from 'hermes-javascript'
import convert = require('convert-units')
import { UNITS } from '../constants'
import { chooseBestTts, chooseBestRoundedValue, chooseBestNotation, isUnitHandled, isOzMassOrVolume } from './common'

export type KnownSlots = {
    depth: number,
    unit_from?: string,
    unit_to?: string,
    amount?: number,
    alreadyAskedBack?: boolean
}

export const doConvertHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 1 }) {
    console.log('blabla')
    logger.debug('blibli')
    //const i18n = i18nFactory.get()

    let unitFrom, unitTo, amountToConvert

    if(!('amount' in knownSlots)){
        const amountSlot: NluSlot<slotType.number> | null = message.getSlotsByName(msg, 'amount', { onlyMostConfident:true })

        if(amountSlot){
            amountToConvert = amountSlot.value.value 
        } else {
            amountToConvert = 1
        }
    } else {
        logger.info('\tamount from previous attempt :', knownSlots.amount)
        amountToConvert = knownSlots.amount
    }

    if(!('unit_from' in knownSlots)){
        const unitFromSlot : NluSlot<slotType.custom> | null = message.getSlotsByName(msg, 'unit_from', { onlyMostConfident:true })

        if(unitFromSlot){
            unitFrom = unitFromSlot.value.value
        }
    } else {
        logger.info('\tunit_from from previous attempt :', knownSlots.unit_from)
        unitFrom = knownSlots.unit_from
    }

    if(!('unit_to' in knownSlots)){
        const unitToSlot : NluSlot<slotType.custom> | null = message.getSlotsByName(msg, 'unit_to', { onlyMostConfident:true })

        if(unitToSlot){
            unitTo = unitToSlot.value.value 
        }
    } else {
        logger.info('\tunit_to from previous attempt :', knownSlots.unit_to)
        unitTo = knownSlots.unit_to
    }

    if(!unitFrom){

        if(!('alreadyAskedBack' in knownSlots)){
            knownSlots.alreadyAskedBack = true
            flow.continue('snips-assistant:UnitConvert', (msg, flow) => {

                const slotsToBeSent = ({
                    depth: knownSlots.depth + 1,
                    alreadyAskedBack: knownSlots.alreadyAskedBack
                } as any)
    
                if (!slot.missing(unitFrom)) {
                    logger.info('\tAdding unit from :', unitFrom)
                    slotsToBeSent.unit_from = unitFrom
                }
    
                if (!slot.missing(unitTo)) {
                    logger.info('\tAdding unit to :', unitTo)
                    slotsToBeSent.unit_to = unitTo
                }
                
                logger.info('\tSended slots : ', slotsToBeSent)
                return doConvertHandler(msg, flow, slotsToBeSent)
            })
    
            return translation.randomTranslation('doConvert.missingUnitFrom', {})
        } else {
            flow.end()
            return translation.randomTranslation('doConvert.missingUnitFromTwice', {})
        }
        

    } else if (unitFrom === unitTo){
        flow.end()
        return translation.randomTranslation('doConvert.sameUnits', {})
    } else {
        flow.end()

        if((unitFrom == 'oz')&&(unitTo)){
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
            
            if(!unitTo){
                // Converting to best unit
                var subresult = convert(amountToConvert).from(apiUnitFrom).toBest()
                unitTo = subresult.unit
                var result = await chooseBestRoundedValue(subresult.val)
            } else {
                var subresult = convert(amountToConvert).from(apiUnitFrom).to(apiUnitTo)
                logger.info('\tconvert:', subresult)
                var result = await chooseBestRoundedValue(subresult)
                logger.info('\tresult:', result)
            }

            const unitFromTts = await chooseBestTts(amountToConvert, unitFrom)
            const unitToTts = await chooseBestTts(result, unitTo)
            const strResult = await chooseBestNotation(result)

            return translation.randomTranslation('doConvert.conversion', {
                unitFrom: unitFromTts,
                unitTo: unitToTts,
                amount: amountToConvert,
                amountResult: strResult
            }) 
        } catch(e){
            return translation.randomTranslation('doConvert.notSameMeasurement', {
                unitTypeFrom: convert().describe(unitFrom).measure,
                unitTypeTo:convert().describe(unitTo).measure
            })
        }
    }
}
