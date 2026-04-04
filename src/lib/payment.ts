import crypto from 'crypto';

const PAYHERE_MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || '';
const PAYHERE_MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || '';
const PAYHERE_SANDBOX = process.env.PAYHERE_SANDBOX === 'true';

const PAYHERE_BASE_URL = PAYHERE_SANDBOX
  ? 'https://sandbox.payhere.lk/pay/checkout'
  : 'https://www.payhere.lk/pay/checkout';

interface PayHereParams {
  orderId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

/** Generate PayHere checkout parameters with hash */
export function generatePayHereCheckout(params: PayHereParams): Record<string, string> {
  const { orderId, amount, currency, customerName, customerEmail, customerPhone, description, returnUrl, cancelUrl, notifyUrl } = params;

  const amountFormatted = amount.toFixed(2);

  // Generate hash: merchant_id + order_id + amount + currency + md5(merchant_secret)
  const secretHash = crypto.createHash('md5').update(PAYHERE_MERCHANT_SECRET).digest('hex').toUpperCase();
  const hashString = `${PAYHERE_MERCHANT_ID}${orderId}${amountFormatted}${currency}${secretHash}`;
  const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

  return {
    merchant_id: PAYHERE_MERCHANT_ID,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: notifyUrl,
    order_id: orderId,
    items: description,
    currency,
    amount: amountFormatted,
    first_name: customerName.split(' ')[0] || customerName,
    last_name: customerName.split(' ').slice(1).join(' ') || '',
    email: customerEmail,
    phone: customerPhone,
    address: '',
    city: '',
    country: 'Sri Lanka',
    hash,
  };
}

/** Verify PayHere payment callback hash */
export function verifyPayHereCallback(params: {
  merchant_id: string;
  order_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
}): boolean {
  const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = params;

  const secretHash = crypto.createHash('md5').update(PAYHERE_MERCHANT_SECRET).digest('hex').toUpperCase();
  const localSig = crypto
    .createHash('md5')
    .update(`${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${secretHash}`)
    .digest('hex')
    .toUpperCase();

  return localSig === md5sig;
}

/** Get PayHere checkout URL */
export function getPayHereCheckoutUrl(): string {
  return PAYHERE_BASE_URL;
}

/** Map PayHere status codes */
export function getPayHereStatus(statusCode: string): 'success' | 'pending' | 'failed' | 'charged_back' {
  switch (statusCode) {
    case '2':
      return 'success';
    case '0':
      return 'pending';
    case '-1':
      return 'failed';
    case '-3':
      return 'charged_back';
    default:
      return 'failed';
  }
}
