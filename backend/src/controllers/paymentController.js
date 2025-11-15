const { User } = require('../models');
const { paypal } = require('../config/paypal');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createPayPalOrder = async (req, res, next) => {
    try {
        const { planId, amount } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: { code: 'USER_NOT_FOUND', message: 'User not found' }
            });
        }

        const paypalOrder = await paypal.createOrder(Number(amount));

        user.pending_payment = {
            orderId: paypalOrder.id,
            planId: planId,
            amount: amount,
            status: 'pending',
            createdAt: new Date()
        };
        await user.save();

        res.status(200).json({
            success: true,
            message: 'PayPal order created successfully',
            orderId: paypalOrder.id
        });
    } catch (error) {
        console.error('Create PayPal order error:', error);
        next(error);
    }
};

const approvePayPalOrder = async (req, res, next) => {
    try {
        const { orderID } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: { code: 'USER_NOT_FOUND', message: 'User not found' }
            });
        }

        if (!user.pending_payment || user.pending_payment.orderId !== orderID) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_ORDER', message: 'Invalid order ID' }
            });
        }

        const captureData = await paypal.capturePayment(orderID);

        if (!captureData || captureData.status !== 'COMPLETED') {
            return res.status(400).json({
                success: false,
                error: { code: 'PAYMENT_FAILED', message: 'Payment capture failed' }
            });
        }

        user.plan = 'premium';
        user.payment_history = user.payment_history || [];
        user.payment_history.push({
            orderId: captureData.id,
            planId: user.pending_payment.planId,
            amount: user.pending_payment.amount,
            status: 'completed',
            paymentMethod: 'paypal',
            paidAt: new Date(),
            paypalDetails: {
                email: captureData.payer?.email_address || '',
                payerId: captureData.payer?.payer_id || ''
            }
        });
        user.pending_payment = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Payment completed successfully. Your plan has been upgraded to Premium!',
            user: user.toSafeObject()
        });
    } catch (error) {
        console.error('Approve PayPal order error:', error);
        next(error);
    }
};

const createStripePaymentIntent = async (req, res, next) => {
    try {
        const { planId, amount } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: { code: 'USER_NOT_FOUND', message: 'User not found' }
            });
        }

        const amountInCents = Math.round(Number(amount) * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            metadata: { planId, userId }
        });

        user.pending_payment = {
            planId,
            amount,
            stripePaymentIntentId: paymentIntent.id,
            status: 'pending',
            createdAt: new Date()
        };
        await user.save();

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret
        });

    } catch (error) {
        console.error('Stripe Payment Intent error:', error);
        next(error);
    }
};

const confirmStripePayment = async (req, res, next) => {
    try {
        const { paymentIntentId } = req.body;
        const requesterUserId = req.user.userId;

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (!paymentIntent) {
            return res.status(404).json({ success: false, error: { message: 'PaymentIntent not found' } });
        }

        if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'processing') {
            return res.status(400).json({ success: false, error: { message: 'Payment not successful' } });
        }

        const metadataUserId = paymentIntent.metadata && paymentIntent.metadata.userId;
        let user = null;

        if (metadataUserId) {
            user = await User.findById(metadataUserId);
        }

        if (!user) {
            user = await User.findOne({ 'pending_payment.stripePaymentIntentId': paymentIntentId });
        }

        if (!user) {
            user = await User.findById(requesterUserId);
        }

        if (!user) {
            return res.status(404).json({ success: false, error: { message: 'Associated user not found' } });
        }

        if (metadataUserId && String(metadataUserId) !== String(requesterUserId)) {
            return res.status(403).json({ success: false, error: { message: 'Not authorized to confirm this payment' } });
        }

        if (user.plan === 'premium') {
            if (user.pending_payment && user.pending_payment.stripePaymentIntentId === paymentIntentId) {
                user.pending_payment = null;
                await user.save();
            }
            return res.json({ success: true, message: 'Already premium', user: user.toSafeObject() });
        }

        user.plan = 'premium';
        user.payment_history = user.payment_history || [];
        user.payment_history.push({
            orderId: paymentIntentId,
            planId: (user.pending_payment && user.pending_payment.planId) || paymentIntent.metadata?.planId || null,
            amount: (paymentIntent.amount ? paymentIntent.amount / 100 : (user.pending_payment && user.pending_payment.amount)) || null,
            status: 'completed',
            paymentMethod: 'stripe',
            paidAt: new Date(),
            stripeDetails: {
                paymentIntentId,
                chargeId: paymentIntent.latest_charge || null
            }
        });

        if (user.pending_payment && (user.pending_payment.stripePaymentIntentId === paymentIntentId || user.pending_payment.orderId === paymentIntentId)) {
            user.pending_payment = null;
        }

        await user.save();

        return res.json({ success: true, message: 'Payment confirmed and plan upgraded', user: user.toSafeObject() });
    } catch (err) {
        console.error('confirmStripePayment error:', err);
        next(err);
    }
};

const stripeWebhook = async (req, res, next) => {
    try {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('Stripe webhook secret not configured.');
            return res.status(500).send('Webhook secret not configured');
        }

        // req.rawBody must be Buffer — see mount note below
        const payload = req.rawBody || Buffer.from(req.body || '');

        let event;
        try {
            event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
        } catch (err) {
            console.error('⚠️  Webhook signature verification failed.', err?.message);
            return res.status(400).send(`Webhook Error: ${err?.message}`);
        }

        // handle events
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const pi = event.data.object;
                const paymentIntentId = pi.id;
                const metadata = pi.metadata || {};
                const planId = metadata.planId;
                const userId = metadata.userId;

                // Find the user by pending_payment.paymentIntentId or by metadata.userId
                let user = null;
                if (userId) {
                    user = await User.findById(userId);
                } else {
                    user = await User.findOne({ 'pending_payment.paymentIntentId': paymentIntentId });
                }

                if (user) {
                    // mark user plan active, add payment_history, clear pending_payment
                    user.plan = 'premium';
                    user.payment_history = user.payment_history || [];
                    user.payment_history.push({
                        orderId: paymentIntentId,
                        planId: planId || (user.pending_payment && user.pending_payment.planId) || null,
                        amount: (user.pending_payment && user.pending_payment.amount) || null,
                        status: 'completed',
                        paymentMethod: 'stripe',
                        paidAt: new Date(),
                        stripeDetails: {
                            paymentIntentId
                        }
                    });
                    user.pending_payment = null;
                    await user.save();
                    console.log(`User ${user._id} marked as premium from PI ${paymentIntentId}`);
                } else {
                    console.warn('User not found for payment_intent.succeeded', paymentIntentId);
                }
                break;
            }

            case 'payment_intent.payment_failed': {
                const pi = event.data.object;
                const paymentIntentId = pi.id;
                // Optionally update user.pending_payment status = 'failed'
                const user = await User.findOne({ 'pending_payment.paymentIntentId': paymentIntentId });
                if (user) {
                    user.pending_payment = {
                        ...user.pending_payment,
                        status: 'failed',
                        lastError: pi.last_payment_error?.message || null
                    };
                    await user.save();
                }
                break;
            }

            default:
                // Unexpected event type
                console.log(`Unhandled Stripe event type ${event.type}`);
        }

        return res.json({ received: true });
    } catch (err) {
        console.error('stripeWebhook handler error:', err);
        return res.status(500).send('Internal server error');
    }
};

module.exports = {
    createPayPalOrder,
    approvePayPalOrder,
    createStripePaymentIntent,
    confirmStripePayment,
    stripeWebhook
};