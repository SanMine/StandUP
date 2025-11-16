import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function StripePaymentSuccessPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const { fetchMe } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const paymentIntentId = params.get('payment_intent') || params.get('payment_intent_client_secret') || null;
        if (!paymentIntentId) {
            setStatus('error');
            setMessage('Payment intent not found in URL.');
            return;
        }

        const confirmPayment = async () => {
            try {
                setStatus('loading');
                const res = await api.post('/users/payment/confirm-stripe-payment', { paymentIntentId });
                if (res.data?.success) {
                    setStatus('success');
                    setMessage(res.data.message || 'Payment confirmed. Your plan is now premium.');
                    toast.success('Payment successful — your plan has been upgraded!');
                    await fetchMe();
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 1500);
                } else {
                    setStatus('error');
                    setMessage(res.data?.error?.message || 'Failed to confirm payment');
                    toast.error(res.data?.error?.message || 'Failed to confirm payment');
                }
            } catch (err) {
                console.error('Error confirming payment:', err);
                setStatus('error');
                setMessage(err?.response?.data?.error?.message || 'Error confirming payment');
                toast.error(err?.response?.data?.error?.message || 'Error confirming payment');
            }
        };

        confirmPayment();
    }, [location.search, navigate]);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen p-6">
                <div className="text-center">
                    <div className="mb-4">Processing payment confirmation...</div>
                    <div className="w-8 h-8 mx-auto border-2 border-gray-400 rounded-full border-t-transparent animate-spin" />
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex items-center justify-center min-h-screen p-6">
                <div className="max-w-md text-center">
                    <h2 className="mb-2 text-xl font-bold">Payment confirmation failed</h2>
                    <p className="mb-4">{message}</p>
                    <div className="flex justify-center gap-3">
                        <Button onClick={() => navigate('/pricing')}>Retry Payment</Button>
                        <Button variant="ghost" onClick={() => navigate('/support')}>Contact Support</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-6">
            <div className="max-w-md text-center">
                <h2 className="mb-2 text-2xl font-bold">Payment successful 🎉</h2>
                <p className="mb-6">{message}</p>
                <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </div>
        </div>
    );
}