import { Client, Environment } from 'square';
import crypto from 'crypto';

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production'
    ? Environment.Production
    : Environment.Sandbox,
});

// Generate a unique gift certificate code
function generateGiftCode() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `GIFT-${timestamp}-${random}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { recipientName, recipientEmail, senderName, message, amount } = body;

    // Validate required fields
    if (!recipientName || !recipientEmail || !senderName || !amount) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount
    const amountInCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountInCents) || amountInCents < 2500 || amountInCents > 50000) {
      return Response.json(
        { error: 'Invalid amount. Must be between $25 and $500.' },
        { status: 400 }
      );
    }

    // Generate unique gift certificate code
    const giftCode = generateGiftCode();

    // Create idempotency key for Square
    const idempotencyKey = crypto.randomUUID();

    // Prepare the site URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Store gift certificate data in the checkout session
    // We'll encode the data in the reference_id field
    const giftData = {
      code: giftCode,
      recipientName,
      recipientEmail,
      senderName,
      message: message || '',
      amount
    };

    const encodedGiftData = Buffer.from(JSON.stringify(giftData)).toString('base64');

    // Create checkout session with Square
    const checkoutResponse = await squareClient.checkoutApi.createPaymentLink({
      idempotencyKey,
      order: {
        locationId: process.env.SQUARE_LOCATION_ID,
        lineItems: [
          {
            name: 'Gift Certificate',
            quantity: '1',
            basePriceMoney: {
              amount: BigInt(amountInCents),
              currency: 'USD',
            },
            note: `Gift Certificate for ${recipientName}`,
          },
        ],
        // Store gift certificate data in the reference_id
        referenceId: encodedGiftData.substring(0, 40), // Square has a 40 char limit
      },
      checkoutOptions: {
        redirectUrl: `${siteUrl}/gift-certificate/success?data=${encodeURIComponent(encodedGiftData)}`,
        askForShippingAddress: false,
      },
      prePopulatedData: {
        buyerEmail: recipientEmail,
      },
    });

    if (!checkoutResponse.result.paymentLink) {
      throw new Error('Failed to create checkout session');
    }

    return Response.json({
      checkoutUrl: checkoutResponse.result.paymentLink.url,
      giftCode,
    });

  } catch (error) {
    console.error('Error creating checkout:', error);

    // Handle Square API errors
    if (error.errors) {
      console.error('Square API errors:', error.errors);
      return Response.json(
        { error: 'Payment service error. Please try again.' },
        { status: 500 }
      );
    }

    return Response.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
