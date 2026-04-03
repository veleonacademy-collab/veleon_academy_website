import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const isPrerendering = navigator.userAgent === 'ReactSnap';
const stripePromise = isPrerendering ? null : loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export const StripeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};
