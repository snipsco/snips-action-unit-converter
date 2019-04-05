import { getPokemon } from '../api'
import { i18nFactory, configFactory } from '../factories'
import { message, translation, slot } from '../utils'
import { logger, CustomSlot} from '../utils'
import { Handler } from './index'
import { Dialog, Hermes, NluSlot, slotType } from 'hermes-javascript'
import convert = require('convert-units')

export type KnownSlots = {
    depth: number,
    unit_from?: string,
    unit_to?: string,
    amount?: number,
    alreadyAskedBack?: boolean
}

export const doConvertHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 1 }) {
    
    const i18n = i18nFactory.get()

    logger.info('\tKnown slots ? ', knownSlots)

    
    let unitFrom, unitTo, amountToConvert
//    let unitFrom: string | undefined = '', unitTo: string | undefined, amountToConvert: number | undefined

    // We need this slot, so if the slot had a low confidence or was not mark as required,
    // we throw an error.
    /*if(!('repeat' in knownSlots)){
        knownSlots.repeat = false
    } else {
        flow.end()
        return translation.randomTranslation('doConvert.sameUnits', {})
    }*/

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

    /*
    if(!unitFromSlot && !unitToSlot) {
        throw new Error('intentNotRecognized')
    }*/

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
    
            return i18n('doConvert.missingUnitFrom')
        } else {
            flow.end()
            return i18n('doConvert.missingUnitFromTwice')
        }
        

    } else if (unitFrom === unitTo){
        flow.end()
        console.log("Unit_From: " + unitFrom)
        console.log("Unit_to :" + unitTo)
        return translation.randomTranslation('doConvert.sameUnits', {})  // ??????
    } else {
        flow.end()

        try{
            if(!unitTo){
                var result = Math.round(convert(amountToConvert).from(unitFrom).toBest().val * 100) / 100
                logger.info('\tConverting to best')
            } else {
                var result = Math.round(convert(amountToConvert).from(unitFrom).to(unitTo) * 100) / 100
                logger.info('\tConverting to : ', unitTo)
            }

            if((0<= result)&&(result<=1)){
                // => unitToResult : singular
            } else{
                // => unitToResult : plural
            }

            console.log(result)

            return translation.randomTranslation('doConvert.conversion', {
                unitFrom: unitFrom,
                unitTo: unitTo,
                amount: amountToConvert,
                amountResult: result
            }) 
        } catch(e){
            return translation.randomTranslation('doConvert.notSameMeasurement', {
                unitTypeFrom: convert().describe(unitFrom).measure,
                unitTypeTo:convert().describe(unitTo).measure
            })
        }
    }

    //const pokemonId = pokemonSlot.value.value
    //const pokemon = await getPokemon(pokemonId)
    
    /*
    // Return the TTS speech.
    return translation.randomTranslation('doConvert.info', {
        unitFrom: unitFrom,
        unitTo: unitTo
        //amount: amountToConvert
    })*/
}
