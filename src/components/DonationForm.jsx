import React, { useState } from 'react'
import { toast } from 'sonner'
import { useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { CreditCard, Phone, LoaderIcon, CheckCircle } from 'lucide-react'

export const DonationForm = () => {
  const [donationAmount, setDonationAmount] = useState(100)
  const [customAmount, setCustomAmount] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [loading, setLoading] = useState(false)
  const [transactionId, setTransactionId] = useState(null)
  const [transactionStatus, setTransactionStatus] = useState(null)

  // Convex actions
  const initiateSTKPush = useAction(api.mpesa.initiateSTKPush)
  const checkSTKStatus = useAction(api.mpesa.checkSTKStatus)

  const handleAmountSelect = (amount) => {
    setDonationAmount(amount)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (e) => {
    const value = e.target.value
    setCustomAmount(value)
    if (value) {
      setDonationAmount(parseFloat(value))
    } else {
      setDonationAmount(0)
    }
  }

  const processMpesaPayment = async () => {
    if (!phoneNumber) {
      toast.error('Please enter your phone number')
      return
    }

    if (!donationAmount || donationAmount < 10) {
      toast.error('Please enter a valid donation amount (minimum 10)')
      return
    }

    setLoading(true)

    try {
      // Initiate STK Push payment via Convex
      const response = await initiateSTKPush({
        phone: phoneNumber,
        amount: donationAmount,
        reference: `DON-${Date.now()}`,
        description: 'Donation to Imani Foundation'
      })

      if (response.CheckoutRequestID) {
        // Store the checkout request ID for status checking
        setTransactionId(response.CheckoutRequestID)
        toast.success('Please check your phone and enter M-Pesa PIN to complete donation')

        // Start polling for status
        startStatusPolling(response.CheckoutRequestID)
      } else {
        toast.error('Failed to initiate payment. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Poll for transaction status
  const startStatusPolling = async (checkoutRequestId) => {
    setTransactionStatus('pending')

    // Poll every 5 seconds up to 60 seconds (12 attempts)
    let attempts = 0
    const maxAttempts = 12

    const pollStatus = async () => {
      try {
        const response = await checkSTKStatus({
          checkoutRequestId: checkoutRequestId
        })

        // Check result code
        if (response.ResultCode === '0' || response.ResultCode === 0) {
          // Success
          setTransactionStatus('success')
          toast.success('Donation successful! Thank you for your support.')
          return
        } else if (response.ResultCode === '1032' || response.ResultCode === 1032) {
          // Transaction canceled by user
          setTransactionStatus('cancelled')
          toast.error('Transaction was cancelled or timed out')
          return
        } else if (response.ResultCode && response.ResultCode !== '0') {
          // Other error codes
          setTransactionStatus('cancelled')
          toast.error(response.ResultDesc || 'Transaction failed')
          return
        } else if (attempts >= maxAttempts) {
          // Timeout after max attempts
          setTransactionStatus('timeout')
          toast.error('Payment status check timed out. Please check your M-Pesa messages.')
          return
        }

        // Continue polling
        attempts++
        setTimeout(pollStatus, 5000)
      } catch (error) {
        console.error('Status check error:', error)

        if (attempts >= maxAttempts) {
          setTransactionStatus('error')
          toast.error('Failed to check payment status. Please check your M-Pesa messages.')
        } else {
          // Continue polling despite error
          attempts++
          setTimeout(pollStatus, 5000)
        }
      }
    }

    // Start the polling
    pollStatus()
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (paymentMethod === 'mpesa') {
      processMpesaPayment()
    } else {
      toast.info('Card payment is not implemented in this demo')
    }
  }

  // Render transaction status
  const renderTransactionStatus = () => {
    if (!transactionId) return null

    const statusMessages = {
      pending: "Processing your donation...",
      success: "Donation successful! Thank you for your support.",
      cancelled: "Transaction was cancelled or rejected.",
      timeout: "Payment status check timed out. Please check your M-Pesa messages.",
      error: "Error checking payment status. Please confirm on your phone."
    }

    return (
      <div className={`mt-4 p-4 rounded-md ${
        transactionStatus === 'success' ? 'bg-green-50 border border-green-200' :
        transactionStatus === 'pending' ? 'bg-blue-50 border border-blue-200' :
        'bg-orange-50 border border-orange-200'
      }`}>
        <div className="flex items-center">
          {transactionStatus === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <div className="animate-pulse mr-2">
              <div className="w-5 h-5 bg-blue-400 rounded-full"></div>
            </div>
          )}
          <span className={`${
            transactionStatus === 'success' ? 'text-green-800' :
            transactionStatus === 'pending' ? 'text-blue-800' :
            'text-orange-800'
          }`}>
            {statusMessages[transactionStatus] || "Checking payment status..."}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6 my-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Support Our Cause
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Donation Amount (KES)
          </label>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {[100, 500, 1000].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handleAmountSelect(amount)}
                className={`py-2 px-4 border rounded-md ${
                  donationAmount === amount && !customAmount
                    ? 'bg-orange-100 border-orange-500 text-orange-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {amount.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="mt-3">
            <label htmlFor="customAmount" className="sr-only">
              Custom Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">KES</span>
              </div>
              <input
                type="number"
                name="customAmount"
                id="customAmount"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Enter custom amount"
                className="pl-12 block w-full pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('mpesa')}
              className={`flex items-center justify-center py-2 px-4 border rounded-md ${
                paymentMethod === 'mpesa'
                  ? 'bg-orange-100 border-orange-500 text-orange-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Phone className="h-5 w-5 mr-2" />
              M-Pesa
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center justify-center py-2 px-4 border rounded-md ${
                paymentMethod === 'card'
                  ? 'bg-orange-100 border-orange-500 text-orange-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              disabled
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Card
            </button>
          </div>
        </div>

        {/* Phone Number Input for M-Pesa */}
        {paymentMethod === 'mpesa' && (
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              M-Pesa Phone Number
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="phoneNumber"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 0712345678"
                className="block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the phone number registered with M-Pesa
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !donationAmount || (paymentMethod === 'mpesa' && !phoneNumber)}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <LoaderIcon className="animate-spin h-5 w-5 mr-2" />
              Processing...
            </>
          ) : (
            <>
              Donate KES {donationAmount ? donationAmount.toLocaleString() : 0}
            </>
          )}
        </button>

        {/* Transaction Status */}
        {renderTransactionStatus()}
      </form>
    </div>
  )
}