import { createHash } from 'crypto'
import { RafikiContext, RafikiMiddleware } from '..'
import { Errors } from 'ilp-packet'

const { WrongConditionError } = Errors

export function createOutgoingValidateFulfillmentMiddleware(): RafikiMiddleware {
  return async (
    { services: { logger }, request: { prepare }, response }: RafikiContext,
    next: () => Promise<unknown>
  ): Promise<void> => {
    const { executionCondition } = prepare
    await next()
    if (response.fulfill) {
      const { fulfillment } = response.fulfill
      const calculatedCondition = createHash('sha256')
        .update(fulfillment)
        .digest()
      if (!calculatedCondition.equals(executionCondition)) {
        logger.warn({ response }, 'invalid fulfillment')
        throw new WrongConditionError(
          'fulfillment did not match expected value.'
        )
      }
    }
  }
}
