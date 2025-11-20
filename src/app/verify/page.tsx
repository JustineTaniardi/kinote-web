'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify?token=${token}`,
          {
            method: 'GET',
          }
        );

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage(
          error instanceof Error ? error.message : 'An error occurred during verification'
        );
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>Email Verification</h1>

      {status === 'loading' && (
        <div>
          <p>Verifying your email...</p>
          <p>Please wait...</p>
        </div>
      )}

      {status === 'success' && (
        <div style={{ color: 'green' }}>
          <h2>✓ Success!</h2>
          <p>{message}</p>
          <p>Redirecting to login page...</p>
          <Link href="/login">
            <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
              Go to Login
            </button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div style={{ color: 'red' }}>
          <h2>✗ Verification Failed</h2>
          <p>{message}</p>
          <p>Please try registering again.</p>
          <Link href="/register">
            <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
              Back to Register
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
