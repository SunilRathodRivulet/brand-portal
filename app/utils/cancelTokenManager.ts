// Cancel token manager for handling request cancellation and throttling
const cancelControllers = new Set<AbortController>()
const throttleControllers = new Set<AbortController>()

export const addCancelController = (controller: AbortController): void => {
  cancelControllers.add(controller)
}

export const removeCancelController = (controller: AbortController): void => {
  cancelControllers.delete(controller)
}

export const addThrottleController = (controller: AbortController): void => {
  throttleControllers.add(controller)
}

export const removeThrottleController = (controller: AbortController): void => {
  throttleControllers.delete(controller)
}

export const cancelAllRequests = (): void => {
  cancelControllers.forEach(controller => {
    controller.abort()
  })
  cancelControllers.clear()

  throttleControllers.forEach(controller => {
    controller.abort()
  })
  throttleControllers.clear()
}
