import api from './api'

export function initiateSTKPush(phoneNumber, amount) {
  return api.post('/mpesa/stk-push', {
    phone_number: phoneNumber,
    amount: amount,
  })
}
