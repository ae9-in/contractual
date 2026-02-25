import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { verifyProjectPaymentOrder } from '../services/projectService';
import { formatINR } from '../utils/currency';

function buildReceiptContent({ orderId, projectId, paymentId, receiptId, purpose, amountLabel }) {
  return [
    'Contractual - Mock Payment Receipt',
    `Receipt: ${receiptId}`,
    `Project ID: ${projectId}`,
    `Purpose: ${purpose === 'tip' ? 'Tip Payment' : 'Escrow Funding'}`,
    `Order ID: ${orderId}`,
    `Payment ID: ${paymentId}`,
    `Amount: ${amountLabel}`,
    `Date: ${new Date().toLocaleString('en-IN')}`,
  ].join('\n');
}

export default function MockCheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = Number(searchParams.get('projectId') || 0);
  const orderId = String(searchParams.get('orderId') || '');
  const purpose = String(searchParams.get('purpose') || 'escrow');
  const amountPaise = Number(searchParams.get('amount') || 0);
  const amountLabel = useMemo(() => formatINR((amountPaise || 0) / 100), [amountPaise]);

  const [step, setStep] = useState('details');
  const [method, setMethod] = useState('card');
  const [upiId, setUpiId] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successMeta, setSuccessMeta] = useState(null);

  const failAndReturn = (message) => {
    navigate(`/projects/${projectId}`, {
      state: { mockPaymentResult: 'failed', purpose, errorMessage: message },
      replace: true,
    });
  };

  const onPay = async () => {
    try {
      if (!projectId || !orderId) {
        failAndReturn('Invalid mock payment session');
        return;
      }
      if (otp.trim() !== '123456') {
        setStep('failed');
        setError('Invalid OTP. Use 123456 in test mode.');
        return;
      }

      setProcessing(true);
      const paymentId = `mock_payment_${Date.now()}`;
      await verifyProjectPaymentOrder(projectId, {
        order_id: orderId,
        payment_id: paymentId,
        signature: 'mock_signature',
      });
      const receiptId = `MRCPT-${String(Date.now()).slice(-8)}`;
      setSuccessMeta({ paymentId, receiptId });
      setStep('success');
    } catch (err) {
      setStep('failed');
      setError(err.response?.data?.error || err.message || 'Payment failed. Please retry.');
    } finally {
      setProcessing(false);
    }
  };

  const onDownloadReceipt = () => {
    if (!successMeta) return;
    const content = buildReceiptContent({
      orderId,
      projectId,
      paymentId: successMeta.paymentId,
      receiptId: successMeta.receiptId,
      purpose,
      amountLabel,
    });
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${successMeta.receiptId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const returnSuccess = () => {
    navigate(`/projects/${projectId}`, {
      state: { mockPaymentResult: 'success', purpose },
      replace: true,
    });
  };

  return (
    <section className="grid mock-page">
      <Card className="mock-checkout">
        <div className="mock-head">
          <div>
            <p className="mock-kicker">Hosted Checkout</p>
            <h2 className="section-title">MockPay Gateway</h2>
          </div>
          <span className="payment-pill payment-pill-funded">Test Mode</span>
        </div>

        {step === 'details' && (
          <>
            <div className="mock-amount">
              <p className="muted">{purpose === 'tip' ? 'Tip Amount' : 'Escrow Amount'}</p>
              <strong>{amountLabel || formatINR(0)}</strong>
            </div>
            <div className="mock-methods">
              <button type="button" className={`mock-method${method === 'card' ? ' mock-method-active' : ''}`} onClick={() => setMethod('card')}>Card</button>
              <button type="button" className={`mock-method${method === 'upi' ? ' mock-method-active' : ''}`} onClick={() => setMethod('upi')}>UPI</button>
              <button type="button" className={`mock-method${method === 'netbanking' ? ' mock-method-active' : ''}`} onClick={() => setMethod('netbanking')}>Netbanking</button>
            </div>
            {method === 'card' && (
              <div className="grid">
                <input className="input" value="4111 1111 1111 1111" readOnly />
                <div className="grid grid-2">
                  <input className="input" value="12/30" readOnly />
                  <input className="input" value="123" readOnly />
                </div>
                <input className="input" value="Test User" readOnly />
              </div>
            )}
            {method === 'upi' && (
              <div className="grid">
                <input
                  className="input"
                  placeholder="Enter UPI ID (eg: name@okaxis)"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
                <p className="muted">Test mode: any valid-looking UPI ID is accepted.</p>
              </div>
            )}
            {method === 'netbanking' && (
              <div className="grid">
                <select className="select" value={bankName} onChange={(e) => setBankName(e.target.value)}>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>State Bank of India</option>
                  <option>Axis Bank</option>
                </select>
                <p className="muted">You selected: {bankName}</p>
              </div>
            )}
            <div className="row">
              <Button variant="secondary" onClick={() => navigate(`/projects/${projectId}`)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => setStep('otp')}
                disabled={method === 'upi' && !upiId.trim()}
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {step === 'otp' && (
          <>
            <p className="muted">Enter OTP to authorize payment (test OTP: <strong>123456</strong>).</p>
            <input
              className="input"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={processing}
            />
            <div className="row">
              <Button variant="secondary" onClick={() => setStep('details')} disabled={processing}>Back</Button>
              <Button variant="primary" onClick={onPay} loading={processing} loadingText="Processing...">
                Pay {amountLabel || formatINR(0)}
              </Button>
            </div>
          </>
        )}

        {step === 'failed' && (
          <>
            <p className="field-error">{error}</p>
            <div className="row">
              <Button variant="secondary" onClick={() => setStep('otp')}>Retry</Button>
              <Button variant="secondary" onClick={() => failAndReturn(error || 'Payment failed')}>Back to Project</Button>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            <p className="alert alert-success">Payment successful</p>
            <div className="detail-meta-grid">
              <div className="detail-meta-item">
                <p className="detail-meta-label">Receipt</p>
                <p className="detail-meta-value">{successMeta?.receiptId}</p>
              </div>
              <div className="detail-meta-item">
                <p className="detail-meta-label">Payment ID</p>
                <p className="detail-meta-value">{successMeta?.paymentId}</p>
              </div>
            </div>
            <div className="row">
              <Button variant="secondary" onClick={onDownloadReceipt}>Download Receipt</Button>
              <Button variant="primary" onClick={returnSuccess}>Back to Project</Button>
            </div>
          </>
        )}
      </Card>
    </section>
  );
}
