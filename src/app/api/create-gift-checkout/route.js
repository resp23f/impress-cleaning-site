import Stripe from 'stripe';
import crypto from 'crypto';
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize';

// Generate a unique gift certificate code
function generateGiftCode() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `GIFT-${timestamp}-${random}`;
}

export async function POST(request) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return Response.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const body = await request.json();

    // Sanitize inputs
    const recipientName = sanitizeText(body.recipientName)?.slice(0, 100);
    const recipientEmail = sanitizeEmail(body.recipientEmail);
    const senderName = sanitizeText(body.senderName)?.slice(0, 100);
    const buyerEmail = sanitizeEmail(body.buyerEmail);
    const message = sanitizeText(body.message)?.slice(0, 500) || '';
    const amount = body.amount;

    // Validate required fields
    if (!recipientName || !recipientEmail || !senderName || !buyerEmail || !amount) {
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

    // Prepare the site URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    console.log('Creating Stripe checkout session with:', {
      amount: amountInCents,
      recipientEmail,
      buyerEmail,
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Gift Certificate',
              description: `Gift Certificate for ${recipientName}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Pass session ID instead of gift data - verify payment on success page
      success_url: `${siteUrl}/gift-certificate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/gift-certificate?canceled=true`,
      customer_email: buyerEmail,
      metadata: {
        type: 'gift_certificate',
        giftCode,
        recipientName,
        recipientEmail,
        senderName,
        buyerEmail,
        message,
        amount: amount.toString(),
      },
    });

    console.log('Stripe checkout session created:', session.id);

    return Response.json({
      checkoutUrl: session.url,
      giftCode,
    });
  } catch (error) {
    console.error('Error creating checkout:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      type: error.type,
      statusCode: error.statusCode,
    });

    return Response.json(
      {
        error: error.message || 'Failed to create checkout session',
        details: process.env.NODE_ENV === 'development' ? error.stack : null
      },
      { status: 500 }
    );
  }
}