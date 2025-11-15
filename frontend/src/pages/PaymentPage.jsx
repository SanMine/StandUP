import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { CheckCircle2, CreditCard, ArrowLeft, Shield, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FaStripe, FaCcPaypal } from "react-icons/fa6";
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import api from '../services/api';
import { toast } from 'sonner';
import StripePayment from '@/components/StripePayment';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "AfhFIQjZoE-XLutk3Jc5APIHo8AYhm-mxlYnqiwNug6kq9QS5PuiAxoxVHeyTEc-SEUMlHizINa3nswJ";

const PrintLoadingState = () => {
    const [{ isPending }] = usePayPalScriptReducer();
    return isPending ? (
        <div className="flex items-center justify-center p-4">
            <div className="w-6 h-6 border-2 border-[#FF7000] rounded-full border-t-transparent animate-spin"></div>
            <span className="ml-2 text-sm text-[#4B5563]">Loading PayPal...</span>
        </div>
    ) : null;
};

const PaymentPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const planId = searchParams.get('plan');
    const { user, fetchMe } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const allPlans = {
        'student-premium': {
            id: 'student-premium',
            name: 'Premium',
            price: '50',
            type: 'student',
            planType: 'premium',
            description: 'Everything you need to succeed',
            features: [
                'AI-powered job matching',
                'Unlimited applications',
                'Mock interview practice',
                '2 mentor sessions/month',
                'Portfolio website hosting',
                'Resume optimization',
                'Priority job alerts',
                'Interview preparation',
                'Priority support'
            ]
        },
        'employer-professional': {
            id: 'employer-professional',
            name: 'Professional',
            price: '120',
            type: 'employer',
            planType: 'premium',
            description: 'For growing companies',
            features: [
                'Unlimited job postings',
                'AI-powered matching',
                'Advanced applicant tracking',
                'Team collaboration tools',
                'Advanced candidate filters',
                'Analytics & reporting',
                'Priority listing',
                'Priority support'
            ]
        }
    };

    const selectedPlan = allPlans[planId];

    useEffect(() => {
        if (!planId || !selectedPlan) {
            navigate('/pricing');
        }
    }, [planId, selectedPlan, navigate]);

    const handleCreatePaypalOrder = async () => {
        try {
            const response = await api.post('/users/payment/create-paypal-order', {
                planId: selectedPlan.id,
                amount: selectedPlan.price
            });

            if (response.data.success) {
                return response.data.orderId;
            } else {
                throw new Error('Failed to create PayPal order');
            }
        } catch (error) {
            console.error('Error creating PayPal order:', error);
            toast.error('Failed to create PayPal order');
            throw error;
        }
    };

    const handleApprovePaypalOrder = async ({ orderID }) => {
        try {
            setIsProcessing(true);
            const response = await api.post('/users/payment/approve-paypal-order', {
                orderID: orderID
            });

            if (response.data.success) {
                toast.success('Payment successful! Your plan has been upgraded to Premium!');
                await fetchMe();
                setTimeout(() => {
                    if (user?.role === 'employer') {
                        navigate('/employer-dashboard');
                    } else {
                        navigate('/dashboard');
                    }
                }, 2000);
            } else {
                throw new Error(response.data.error?.message || 'Payment approval failed');
            }
        } catch (error) {
            console.error('Error approving PayPal order:', error);
            toast.error(error.response?.data?.error?.message || 'Payment approval failed');
            setIsProcessing(false);
        }
    };

    if (!selectedPlan) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFFDFA] to-[#E8F0FF]">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
                <div className="flex items-center justify-between h-16 px-6 mx-auto max-w-7xl">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <img
                            src="https://customer-assets.emergentagent.com/job_9597193e-4ccf-48a0-a66a-1efa796a5b1d/artifacts/ufitgc6x_stand.png"
                            alt="Stand Up Logo"
                            className="w-auto h-10"
                        />
                    </div>
                    <Button
                        onClick={() => navigate('/pricing')}
                        variant="ghost"
                        className="text-gray-700"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Pricing
                    </Button>
                </div>
            </nav>

            {/* Content */}
            <div className="px-6 pt-24 pb-12">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-12 text-center">
                        <Badge className="bg-[#FFE4CC] text-[#FF7000] hover:bg-[#FFE4CC] px-4 py-1.5 text-sm font-medium mb-4">
                            Secure Checkout
                        </Badge>
                        <h1 className="text-4xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Complete Your Upgrade
                        </h1>
                        <p className="text-lg text-[#4B5563]">
                            You're one step away from unlocking premium features
                        </p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Plan Details */}
                        <Card className="shadow-xl border-2 border-[#FF7000]">
                            <CardHeader className="bg-gradient-to-r from-[#FF7000] to-[#FF9040] text-white">
                                <CardTitle className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {selectedPlan.name} Plan
                                </CardTitle>
                                <CardDescription className="text-white/90">
                                    {selectedPlan.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="mb-8">
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-5xl font-bold text-[#0F151D]">${selectedPlan.price}</span>
                                        <span className="text-xl text-[#4B5563]">/month</span>
                                    </div>
                                    <p className="text-sm text-[#4B5563]">Billed monthly • Cancel anytime</p>
                                </div>

                                <div className="mb-8 space-y-4">
                                    <h3 className="font-semibold text-[#0F151D] mb-4">What's included:</h3>
                                    {selectedPlan.features.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-[#FF7000] flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-[#0F151D]">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 bg-[#FFE4CC] rounded-lg">
                                    <div className="flex items-center gap-2 text-[#FF7000] mb-2">
                                        <Shield className="w-5 h-5" />
                                        <span className="text-sm font-semibold">30-Day Money-Back Guarantee</span>
                                    </div>
                                    <p className="text-xs text-[#FF7000]/80">
                                        Not satisfied? Get a full refund within 30 days, no questions asked.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Form */}
                        <Card className="shadow-xl">
                            <CardHeader className="px-8 pt-8 pb-0">
                                <CardTitle className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Payment Details
                                </CardTitle>
                                <CardDescription>
                                    Choose your preferred payment method
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="space-y-6">
                                    <div className="p-3 border rounded-md">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[#4B5563]">Subtotal</span>
                                            <span className="text-[#0F151D] font-medium">${selectedPlan.price}</span>
                                        </div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[#4B5563]">Tax</span>
                                            <span className="text-[#0F151D] font-medium">$0.00</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 text-xl font-bold border-t">
                                            <span className="text-[#0F151D]">Total</span>
                                            <span className="text-[#FF7000]">${selectedPlan.price}/month</span>
                                        </div>
                                    </div>

                                    {/* Payment Method Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#0F151D] mb-2">
                                            Payment Method
                                        </label>
                                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                            <SelectTrigger className="w-full h-12 border-2 border-gray-300 focus:border-[#FF7000]">
                                                <SelectValue placeholder="Select payment method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="paypal">
                                                    <div className="flex items-center gap-3">
                                                        <FaCcPaypal className='text-[#0070BA] size-6' />
                                                        <span>PayPal</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="stripe">
                                                    <div className="flex items-center gap-3">
                                                        <FaStripe className='text-[#635BFF] size-6' />
                                                        <span>Stripe (Credit/Debit Card)</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* PayPal Payment */}
                                    {paymentMethod === 'paypal' && (
                                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                            <div className="mb-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-10 h-10 bg-[#0070BA] rounded-full flex items-center justify-center">
                                                        <span className="font-bold text-white">PP</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-[#0F151D]">PayPal</p>
                                                        <p className="text-xs text-[#4B5563]">Fast and secure payment</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD" }}>
                                                <PrintLoadingState />
                                                <PayPalButtons
                                                    createOrder={handleCreatePaypalOrder}
                                                    onApprove={handleApprovePaypalOrder}
                                                    disabled={isProcessing}
                                                    style={{ layout: "vertical" }}
                                                />
                                            </PayPalScriptProvider>
                                        </div>
                                    )}

                                    {/* Stripe Payment */}
                                    {paymentMethod === 'stripe' && (
                                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-10 h-10 bg-[#635BFF] rounded-full flex items-center justify-center">
                                                    <CreditCard className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[#0F151D]">Stripe</p>
                                                    <p className="text-xs text-[#4B5563]">Credit or Debit Card</p>
                                                </div>
                                            </div>

                                            <StripePayment planId={selectedPlan.id} amount={selectedPlan.price} />
                                        </div>
                                    )}

                                    {/* Security Info */}
                                    <div className="flex items-center gap-2 text-[#4B5563] text-sm">
                                        <Lock className="w-4 h-4" />
                                        <span>Your payment information is encrypted and secure</span>
                                    </div>

                                    <p className="text-xs text-center text-[#4B5563]">
                                        By completing this purchase, you agree to our Terms of Service and Privacy Policy
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-12 text-center">
                        <p className="text-sm text-[#4B5563] mb-4">Trusted by 2,500+ students and professionals</p>
                        <div className="flex flex-wrap items-center justify-center gap-8">
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-[#FF7000]" />
                                <span className="text-sm text-[#4B5563]">SSL Encrypted</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-[#FF7000]" />
                                <span className="text-sm text-[#4B5563]">Secure Payment</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-[#FF7000]" />
                                <span className="text-sm text-[#4B5563]">Money-Back Guarantee</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;