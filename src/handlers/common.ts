import { configFactory } from '../factories'
import {
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
    
    if (subresult>=0.001){
        return subresult = Math.round(subresult * 1000) / 1000
        
    } else if (subresult>= 0.001){
        return subresult = Math.round(subresult * 10000) / 10000
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

export async function chooseBestNotation(result:number, unit:string): Promise<string>{
    /**
     * Return a beautiful string in order that the tts voice doesn't sound (too) weird
     * 
     * @param result the amount to make beautiful
     * @param unit its corresponding unit, for choosing the best determiner
     * @return beautiful handled amount for tts
     */
    const config = configFactory.get()
    
    let strResult
    if (result == 1){
        strResult = translation.randomTranslation('units.' + unit + '.determiner', {})
    } else {
        if((result>1000000)||(result<=0.0001)){
            let regexExp: RegExp = /^[0-9]+\.*[0-9]*e(\-|\+){1}[0-9]*$/
            strResult = result.toExponential()
            logger.info('\tStrresult :', strResult)

            if(regexExp.test(strResult)){
                let regexTrunc: RegExp = /^[0-9]*\.[0-9]{2,}$/
                let beforeEResult = strResult.split("e")[0]
                let postEResult = strResult.split("e")[1]
    
                if(regexTrunc.test(beforeEResult)){
                    var posPoint = beforeEResult.lastIndexOf('.')
                    beforeEResult = +beforeEResult.slice(0, (+posPoint + 4))
                }
                strResult = beforeEResult + translation.randomTranslation('power10' , {}) + postEResult
            }

        } else {
            var roundedVal = (result * 1000) / 1000
            strResult = roundedVal.toString()
        }

        let regexPoint: RegExp = /^[0-9]+\.{1}[0-9]+.*$/
        if((config.locale === "french")&&(regexPoint.test(strResult))){
            let re = /\./gi;
            strResult = strResult.replace(re, ",");
        }
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
    /**
     * Determine if the user meant a once as a volume or a mass according to the other unit provided
     * 
     * @param unitElse The other unit understood by the assistant
     * @return apiKey unit symbol 
     */
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