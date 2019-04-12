import { IntentMessage, slotType, NluSlot } from 'hermes-javascript'
import {
    message,
    logger,
    translation
} from '../utils'
import { UNITS } from '../constants'
import convert = require('convert-units')

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

export async function getAssistantKey(unit: string): Promise<string|undefined>{
    var arrResult = UNITS.filter(function(item){return item.apiKey === unit;})
    let assistantUnit: string|undefined
    if (arrResult.length != 0){
        // convert-units can handle this unit, it has been found in the correspondance assistantKey/apiKey mapping 
        assistantUnit = arrResult[0].assistantKey
    } 
    return assistantUnit
}

export async function generateTtsMeasures(possibleMeasures: string[]): Promise<string|undefined>{
    let possibleMeasuresTts : string[] = []

    for (let item in possibleMeasures){
        var i18nTtsPath = 'measures.' + possibleMeasures[item]
        var checkMeasure = translation.randomTranslation(i18nTtsPath, {})
        if(checkMeasure.indexOf('measures.') == -1){
            possibleMeasuresTts.push(translation.randomTranslation(checkMeasure, {}))
        }
    }

    let beautifulForm = possibleMeasuresTts.slice(0,-1).join(', ') + " and " + possibleMeasuresTts[possibleMeasuresTts.length-1]
    return beautifulForm
}

export async function generateTtsUnits(possibleUnits: string[]): Promise<string>{
    /**
     * Choose between singular or plural according to the amount of the unit for better tts quality.
     * 
     * @param unit unit symbol to put in singular or plural version
     * @return correct word to use
     */
    let possibleUnitsTts : string[] = []
    for (let item in possibleUnits){
        var possibleUnitApi = await getAssistantKey(possibleUnits[item])
        if(possibleUnitApi){
            var i18nTtsPath = 'units.' + possibleUnitApi + '.plural' 
            possibleUnitsTts.push(translation.randomTranslation(i18nTtsPath, {}))
        }
    }
    let beautifulForm = possibleUnitsTts.slice(0,-1).join(', ') + " and " + possibleUnitsTts[possibleUnitsTts.length-1]
    return beautifulForm
}

