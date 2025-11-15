const { User } = require('../models');
const { paypal } = require('../config/paypal');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_51RXI3gQvW6ZMV09M6WIIdLUHfCb5zCHnOYaZC3bccWVESr09a6Q7UIWTbzr8pQJj8iwGqQrIFRSL29KSddaWZ0WC00aHTIWtQI");

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

module.exports = {
    createPayPalOrder,
    approvePayPalOrder,
    createStripePaymentIntent,
    confirmStripePayment
};