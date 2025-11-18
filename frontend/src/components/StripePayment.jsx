import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import api from '../services/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function _InnerStripeForm({ orderOrPlanId, amount }) {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setSubmitting(true);
        setErr(null);

        try {
            const result = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/stripe-payment-success`
                },
                redirect: 'if_required'
            });

            if (result.error) {
                setErr(result.error.message || 'Payment failed');
                toast.error(result.error.message || 'Payment failed');
            } else if (result.paymentIntent) {
                if (result.paymentIntent.status === 'succeeded') {
                    navigate(`/stripe-payment-success?payment_intent=${result.paymentIntent.id}`);
                } else {
                    navigate(`/stripe-payment-success?payment_intent=${result.paymentIntent.id}`);
                }
            }
        } catch (error) {
            console.error('confirmPayment error', error);
            setErr(error?.message || 'Unexpected error');
            toast.error('Unexpected error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {err && <div className="text-sm text-red-600">{err}</div>}
            <PaymentElement />
            <Button type="submit" disabled={submitting || !stripe || !elements} className="w-full min-h-[44px] hover: bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white/85 transition duration-200">
                {submitting ? 'Processing...' : `Pay $${Number(amount).toFixed(2)}`}
            </Button>
        </form>
    );
}

export default function StripePayment({ planId, amount }) {
    const [clientSecret, setClientSecret] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchClientSecret = async () => {
            try {
                const res = await api.post('/users/payment/create-stripe-payment-intent', {
                    planId,
                    amount
                });
                const data = res.data;
                if (!mounted) return;
                if (data?.clientSecret) {
                    setClientSecret(data.clientSecret);
                } else {
                    console.error('No clientSecret returned', data);
                    toast.error('Unable to initialize Stripe payment.');
                }
            } catch (err) {
                console.error('error fetching clientSecret', err);
                toast.error('Unable to initialize Stripe payment.');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchClientSecret();
        return () => { mounted = false; };
    }, [planId, amount]);

    if (loading) return <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-[#FF7000] rounded-full border-t-transparent animate-spin"></div>
        <span className="ml-2 text-sm text-[#4B5563]">Loading Payment Form...</span>
    </div>;
    if (!clientSecret) return <div>Unable to initialize payment.</div>;

    const options = {
        clientSecret,
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            <_InnerStripeForm orderOrPlanId={planId} amount={amount} />
        </Elements>
    );
}