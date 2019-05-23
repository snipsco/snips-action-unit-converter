import { handler, ConfidenceThresholds } from 'snips-toolkit'
import { doConvertHandler } from './doConvert'
import { INTENT_PROBABILITY_THRESHOLD, ASR_UTTERANCE_CONFIDENCE_THRESHOLD } from '../constants'

const thresholds: ConfidenceThresholds = {
    intent: INTENT_PROBABILITY_THRESHOLD,
    asr: ASR_UTTERANCE_CONFIDENCE_THRESHOLD
}

// Add handlers here, and wrap them.
export default {
    doConvert: handler.wrap(doConvertHandler, thresholds)
}
