import { getPokemon } from '../api'
import { i18nFactory, configFactory } from '../factories'
import { message, translation, slot } from '../utils'
import { logger, CustomSlot} from '../utils'
import { Handler } from './index'
import { Dialog, Hermes, NluSlot, slotType } from 'hermes-javascript'
import convert = require('convert-units')
import { UNITS } from '../constants'

export type KnownSlots = {
    depth: number,
    unit_from?: string,
    unit_to?: string,
    amount?: number,
    alreadyAskedBack?: boolean
}

export async function chooseBestTts(amountToCheck:number, unit: string): Promise<string>{
    /**
     * Choose between singular or plural according to the amount of the unit for better tts quality.
     * 
     * @param amountToCheck Value of the result
     * @param unit unit symbol to put in singular or plural version
     * @return correct word to use
     */
    if((0<= amountToCheck)&&(amountToCheck<=1)){
        // => singular
        var i18nTtsPath = 'units.' + unit + '.singular'
    } else{
        // => plural
        var i18nTtsPath = 'units.' + unit + '.plural' 
    }
    return translation.randomTranslation(i18nTtsPath, {})
}

export async function chooseBestRoundedValue(subresult:number): Promise<number>{
    /**
     * Choose to round up the result or not according to its value.
     * 
     * @param subresult Value of the result
     * @return Rounded value or not
     */
    if (subresult>=0.1){
        return subresult = Math.round(subresult * 1000) / 1000
    } else {
        let regexFilter: RegExp = /^[0-9]*\.0*[^0][0-9]{2,}$/;
        let strSubresult = subresult.toString()
        if(regexFilter.test(strSubresult)){
            const posZero = strSubresult.lastIndexOf('0')
            subresult = +strSubresult.slice(0, (+posZero + 4))
        }
        logger.info('\tSubresult :', subresult)
        return subresult 
    }
}

export async function chooseBestNotation(result:number): Promise<string>{
    let strResult
    if((result>1000000)||(result<=0.0001)){
        let regexExp: RegExp = /^[0-9]+\.+[0-9]*e(\-|\+){1}[0-9]*$/
        strResult = result.toExponential()
        logger.info('\tStrresult :', strResult)
        if(regexExp.test(strResult)){
            let regexTrunc: RegExp = /^[0-9]*\.[0-9]{2,}$/
            let beforeEResult = strResult.split("e")[0]
            let postEResult = strResult.split("e")[1]

            if(regexTrunc.test(beforeEResult)){
                const posPoint = beforeEResult.lastIndexOf('.')
                beforeEResult = +beforeEResult.slice(0, (+posPoint + 4))
            }
            strResult = beforeEResult + " time 10 to the " + postEResult
        }
    } else {
        strResult = result.toString()
    }
    return strResult
}

export async function isUnitHandled(unit:string): Promise<string|undefined>{
    /**
     * Check if the unit asked by the user is handled by the conversion api.
     * 
     * @param unit Understood unit by the assistant
     * @return apiKey unit symbol according to the mapping, undefined if not handled.
     */
    var arrResult = UNITS.filter(function(item){return item.assistantKey === unit;})
    let apiUnit: string|undefined
    if (arrResult.length != 0){
        // convert-units can handle this unit, it has been found in the correspondance assistantKey/apiKey mapping 
        apiUnit = arrResult[0].apiKey
    } 
    return apiUnit
}

export async function isOzMassOrVolume(unitElse:string|undefined): Promise<string>{
    if(convert().describe(unitElse).measure == 'volume'){
        return 'fl-oz'
    } else {
        return 'oz'
    }
}

export const doConvertHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 1 }) {
    
    const i18n = i18nFactory.get()

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
