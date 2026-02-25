const crypto = require('crypto');
const Razorpay = require('razorpay');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

let razorpayClient;

function getProvider() {
  return env.paymentProvider || 'mock';
}

function isRazorpayConfigured() {
  return Boolean(env.razorpay.keyId && env.razorpay.keySecret);
}

function isGatewayConfigured() {
  const provider = getProvider();
  if (provider === 'mock') return true;
  if (provider === 'razorpay') return isRazorpayConfigured();
  return false;
}

function getGatewayConfig() {
  const provider = getProvider();
  return {
    provider,
    enabled: isGatewayConfigured(),
    keyId: provider === 'razorpay' ? (env.razorpay.keyId || '') : 'mock_key',
  };
}

function getRazorpayClient() {
  if (!isRazorpayConfigured()) {
    throw new ApiError(503, 'Razorpay is not configured');
  }
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: env.razorpay.keyId,
      key_secret: env.razorpay.keySecret,
    });
  }
  return razorpayClient;
}

async function createOrder({ amountPaise, currency = 'INR', receipt, notes = {} }) {
  const provider = getProvider();

  if (provider === 'mock') {
    return {
      id: `mock_order_${Date.now()}`,
      amount: amountPaise,
      currency,
      receipt,
      notes,
      provider: 'mock',
    };
  }

  if (provider === 'razorpay') {
    try {
      const client = getRazorpayClient();
      const order = await client.orders.create({
        amount: amountPaise,
        currency,
        receipt,
        notes,
        payment_capture: 1,
      });
      return { ...order, provider: 'razorpay' };
    } catch (error) {
      const providerMessage = error?.error?.description || error?.message || 'Unable to create payment order';
      if (error?.statusCode === 401) {
        throw new ApiError(502, 'Razorpay authentication failed. Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
      }
      throw new ApiError(502, `Payment gateway error: ${providerMessage}`);
    }
  }

  throw new ApiError(503, `Unsupported payment provider: ${provider}`);
}

function verifyCheckoutSignature({ provider, orderId, paymentId, signature }) {
  const activeProvider = provider || getProvider();
  if (activeProvider === 'mock') return true;

  if (activeProvider === 'razorpay') {
    if (!isRazorpayConfigured()) {
      throw new ApiError(503, 'Razorpay is not configured');
    }
    const payload = `${orderId}|${paymentId}`;
    const expected = crypto
      .createHmac('sha256', env.razorpay.keySecret)
      .update(payload)
      .digest('hex');
    return expected === signature;
  }

  throw new ApiError(503, `Unsupported payment provider: ${activeProvider}`);
}

function verifyWebhookSignature(rawBodyBuffer, signature) {
  if (getProvider() !== 'razorpay') return true;
  if (!env.razorpay.webhookSecret) {
    throw new ApiError(503, 'Payment webhook secret is not configured');
  }
  const expected = crypto
    .createHmac('sha256', env.razorpay.webhookSecret)
    .update(rawBodyBuffer)
    .digest('hex');
  return expected === signature;
}

module.exports = {
  getGatewayConfig,
  getProvider,
  isGatewayConfigured,
  createOrder,
  verifyCheckoutSignature,
  verifyWebhookSignature,
};
