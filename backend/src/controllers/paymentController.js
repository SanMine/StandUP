const { User } = require('../models');
const { paypal } = require('../config/paypal');

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

module.exports = {
    createPayPalOrder,
    approvePayPalOrder,
};