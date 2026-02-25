import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  acceptProjectApplication,
  applyForProject,
  completeProject,
  createProjectPaymentOrder,
  fundProjectEscrow,
  getProjectApplications,
  getProjectById,
  getProjectPayment,
  releaseProjectEscrow,
  verifyProjectPaymentOrder,
  submitProject,
} from '../services/projectService';
import { getProjectMessages, sendProjectMessage } from '../services/messageService';
import { getProjectRatings, submitProjectRating } from '../services/ratingService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import StatusBadge from '../components/ui/StatusBadge';
import Loader from '../components/ui/Loader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusTimeline from '../components/ui/StatusTimeline';
import RatingSummary from '../components/ui/RatingSummary';
import { formatINR } from '../utils/currency';
import { formatDateOnly } from '../utils/date';
import { getPaymentGatewayConfig } from '../services/paymentService';
import { loadRazorpayCheckoutScript } from '../utils/paymentGateway';
import { getApiErrorMessage, getApiFieldErrors } from '../utils/validation';
import {
  connectRealtime,
  joinProjectRoom,
  leaveProjectRoom,
  onRealtime,
  setProjectTyping,
} from '../services/realtimeService';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [project, setProject] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [chatText, setChatText] = useState('');
  const [messages, setMessages] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [applicationCoverLetter, setApplicationCoverLetter] = useState('');
  const [applications, setApplications] = useState([]);
  const [payment, setPayment] = useState(null);
  const [paymentTransactions, setPaymentTransactions] = useState([]);
  const [tipAmount, setTipAmount] = useState('');
  const [tipNote, setTipNote] = useState('');
  const [error, setError] = useState('');
  const [chatError, setChatError] = useState('');
  const [ratingError, setRatingError] = useState('');
  const [submissionFieldErrors, setSubmissionFieldErrors] = useState({});
  const [ratingFieldErrors, setRatingFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isRatingsLoading, setIsRatingsLoading] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isApplicationsLoading, setIsApplicationsLoading] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [isFundingEscrow, setIsFundingEscrow] = useState(false);
  const [isReleasingEscrow, setIsReleasingEscrow] = useState(false);
  const [isAddingTip, setIsAddingTip] = useState(false);
  const [gatewayConfig, setGatewayConfig] = useState({ provider: 'mock', enabled: false, keyId: '' });
  const [acceptingApplicationId, setAcceptingApplicationId] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeoutRef = useRef(null);
  const chatEndRef = useRef(null);
  const canUseMessaging = Boolean(
    project?.freelancerId && (project?.businessId === user?.id || project?.freelancerId === user?.id),
  );
  const canRate = Boolean(
    project?.status === 'Completed' &&
    project?.freelancerId &&
    (project?.businessId === user?.id || project?.freelancerId === user?.id),
  );
  const canSubmitRating = Boolean(
    project?.status === 'Completed' &&
    project?.businessId === user?.id &&
    project?.freelancerId,
  );
  const alreadyRated = ratings.some((item) => item.raterId === user?.id);
  const parseSkills = (value) => String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const canViewPayment = Boolean(
    project && (project.businessId === user?.id || (project.freelancerId && project.freelancerId === user?.id)),
  );
  const canCompleteProject = Boolean(
    user?.role === 'business' && project?.status === 'Submitted' && payment?.status === 'Released',
  );

  const loadProject = async () => {
    try {
      setIsLoading(true);
      const { data } = await getProjectById(id);
      setProject(data.project);
      setSubmissionText(data.project?.submissionText || '');
      setSubmissionLink(data.project?.submissionLink || '');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProject(); }, [id]);

  const loadApplications = async () => {
    if (!project?.id || user?.role !== 'business') return;
    try {
      setIsApplicationsLoading(true);
      const { data } = await getProjectApplications(project.id);
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load applications');
    } finally {
      setIsApplicationsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'business' && project?.status === 'Open') {
      loadApplications();
    }
  }, [project?.id, project?.status, user?.role]);

  const loadPayment = async () => {
    if (!project?.id || !canViewPayment) return;
    try {
      setIsPaymentLoading(true);
      const { data } = await getProjectPayment(project.id);
      setPayment(data.payment || null);
      setPaymentTransactions(data.transactions || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load payment details');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  useEffect(() => {
    loadPayment();
  }, [project?.id, project?.status, project?.freelancerId, canViewPayment]);

  useEffect(() => {
    if (!location.state?.mockPaymentResult) return;
    if (location.state.mockPaymentResult === 'success') {
      addToast(
        location.state.purpose === 'tip' ? 'Tip added (test mode)' : 'Escrow funded (test mode)',
        'success',
      );
      loadPayment();
    } else if (location.state.mockPaymentResult === 'failed') {
      setError(location.state.errorMessage || 'Mock payment failed');
    }
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, navigate]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getPaymentGatewayConfig();
        setGatewayConfig({ provider: data.provider || 'mock', enabled: Boolean(data.enabled), keyId: data.keyId || '' });
      } catch {
        setGatewayConfig({ provider: 'mock', enabled: false, keyId: '' });
      }
    })();
  }, []);

  const loadMessages = async () => {
    if (!project?.id || !project?.freelancerId) return;

    try {
      setIsMessagesLoading(true);
      setChatError('');
      const { data } = await getProjectMessages(project.id);
      setMessages(data.messages || []);
    } catch (err) {
      setChatError(err.response?.data?.error || 'Failed to load messages');
    } finally {
      setIsMessagesLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [project?.id, project?.freelancerId]);

  useEffect(() => {
    if (!canUseMessaging || !project?.id) return undefined;

    connectRealtime();
    joinProjectRoom(project.id);

    const offNewMessage = onRealtime('messages:new', (payload) => {
      if (Number(payload?.projectId) !== Number(project.id) || !payload?.message) return;
      setMessages((prev) => {
        if (prev.some((item) => item.id === payload.message.id)) return prev;
        return [...prev, payload.message];
      });
    });
    const offTyping = onRealtime('project:typing', (payload) => {
      if (Number(payload?.projectId) !== Number(project.id) || payload?.userId === user?.id) return;
      setTypingUsers((prev) => {
        if (!payload?.isTyping) {
          const clone = { ...prev };
          delete clone[payload.userId];
          return clone;
        }
        return { ...prev, [payload.userId]: payload.userName || 'Participant' };
      });
    });

    return () => {
      setProjectTyping(project.id, false);
      leaveProjectRoom(project.id);
      offNewMessage();
      offTyping();
    };
  }, [canUseMessaging, project?.id]);

  useEffect(() => {
    if (!chatEndRef.current) return;
    chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typingUsers]);

  useEffect(() => () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, []);

  const loadRatings = async () => {
    if (!project?.id || !project?.freelancerId) return;

    try {
      setIsRatingsLoading(true);
      setRatingError('');
      const { data } = await getProjectRatings(project.id);
      setRatings(data.ratings || []);
    } catch (err) {
      setRatingError(err.response?.data?.error || 'Failed to load ratings');
    } finally {
      setIsRatingsLoading(false);
    }
  };

  useEffect(() => {
    if (project?.status === 'Completed') {
      loadRatings();
    }
  }, [project?.id, project?.status, project?.freelancerId]);

  const onApply = async () => {
    try {
      setIsApplying(true);
      await applyForProject(id, { coverLetter: applicationCoverLetter });
      addToast('Application submitted', 'success');
      setApplicationCoverLetter('');
      loadProject();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to apply for project');
    } finally {
      setIsApplying(false);
    }
  };

  const onAcceptApplication = async (applicationId) => {
    try {
      setAcceptingApplicationId(applicationId);
      await acceptProjectApplication(project.id, applicationId);
      addToast('Freelancer assigned', 'success');
      loadProject();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept application');
    } finally {
      setAcceptingApplicationId(null);
    }
  };

  const onSubmit = async () => {
    try {
      setSubmissionFieldErrors({});
      setIsActing(true);
      await submitProject(id, { submissionText, submissionLink, files: submissionFiles });
      addToast('Submission successful', 'success');
      setSubmissionFiles([]);
      loadProject();
    } catch (err) {
      setSubmissionFieldErrors(getApiFieldErrors(err));
      setError(getApiErrorMessage(err, 'Failed to submit project'));
    } finally {
      setIsActing(false);
    }
  };

  const onComplete = async () => {
    try {
      setIsActing(true);
      await completeProject(id);
      addToast('Project completed', 'success');
      loadProject();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete project');
    } finally {
      setIsActing(false);
    }
  };

  const onFundEscrow = async () => {
    try {
      setIsFundingEscrow(true);
      if (!gatewayConfig.enabled) {
        await fundProjectEscrow(project.id);
        addToast('Escrow funded', 'success');
        loadPayment();
        return;
      }

      if (gatewayConfig.provider === 'mock') {
        const { data } = await createProjectPaymentOrder(project.id, { purpose: 'escrow' });
        navigate(`/checkout/mock?projectId=${project.id}&orderId=${data.order.id}&purpose=escrow&amount=${data.order.amount}`);
        return;
      }

      const scriptLoaded = await loadRazorpayCheckoutScript();
      if (!scriptLoaded) throw new Error('Unable to load payment gateway');

      const { data } = await createProjectPaymentOrder(project.id, { purpose: 'escrow' });
      const order = data.order;

      await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Contractual',
          description: `Escrow funding for ${order.projectTitle}`,
          order_id: order.id,
          handler: async (response) => {
            try {
              await verifyProjectPaymentOrder(project.id, response);
              addToast('Escrow funded successfully', 'success');
              loadPayment();
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
          theme: {
            color: '#4F46E5',
          },
        });
        checkout.open();
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fund escrow');
    } finally {
      setIsFundingEscrow(false);
    }
  };

  const onReleaseEscrow = async () => {
    try {
      setIsReleasingEscrow(true);
      await releaseProjectEscrow(project.id);
      addToast('Payment released', 'success');
      loadPayment();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to release payment');
    } finally {
      setIsReleasingEscrow(false);
    }
  };

  const onAddTip = async () => {
    try {
      setIsAddingTip(true);
      if (!Number(tipAmount)) throw new Error('Enter a valid tip amount');
      if (!gatewayConfig.enabled) {
        throw new Error('Payment gateway is not configured');
      }
      if (gatewayConfig.provider === 'mock') {
        const { data } = await createProjectPaymentOrder(project.id, {
          purpose: 'tip',
          tipAmount: Number(tipAmount),
          note: tipNote,
        });
        navigate(`/checkout/mock?projectId=${project.id}&orderId=${data.order.id}&purpose=tip&amount=${data.order.amount}`);
        return;
      }

      const scriptLoaded = await loadRazorpayCheckoutScript();
      if (!scriptLoaded) throw new Error('Unable to load payment gateway');

      const { data } = await createProjectPaymentOrder(project.id, {
        purpose: 'tip',
        tipAmount: Number(tipAmount),
        note: tipNote,
      });
      const order = data.order;
      await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Contractual',
          description: `Tip for ${order.projectTitle}`,
          order_id: order.id,
          handler: async (response) => {
            try {
              await verifyProjectPaymentOrder(project.id, response);
              addToast('Tip added successfully', 'success');
              loadPayment();
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Tip payment cancelled')),
          },
          theme: {
            color: '#16A34A',
          },
        });
        checkout.open();
      });
      setTipAmount('');
      setTipNote('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to add tip');
    } finally {
      setIsAddingTip(false);
    }
  };

  const onSendMessage = async () => {
    if (!chatText.trim() || !project?.id) return;

    try {
      setIsSendingMessage(true);
      setProjectTyping(project.id, false);
      await sendProjectMessage(project.id, { messageText: chatText.trim() });
      setChatText('');
      addToast('Message sent', 'success');
    } catch (err) {
      setChatError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const onChatChange = (value) => {
    setChatText(value);
    if (!project?.id) return;

    setProjectTyping(project.id, value.trim().length > 0);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setProjectTyping(project.id, false);
    }, 1200);
  };

  const onSubmitRating = async () => {
    try {
      setRatingFieldErrors({});
      setIsSubmittingRating(true);
      await submitProjectRating(project.id, { rating: Number(ratingValue), reviewText });
      addToast('Rating submitted', 'success');
      setReviewText('');
      setRatingValue(5);
      loadRatings();
    } catch (err) {
      setRatingFieldErrors(getApiFieldErrors(err));
      setRatingError(getApiErrorMessage(err, 'Failed to submit rating'));
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (isLoading) return <Loader label="Loading project details..." />;

  return (
    <section className="grid">
      <div className="breadcrumb">
        <Link to={user?.role === 'business' ? '/business/projects' : '/freelancer/work'}>
          {user?.role === 'business' ? 'My Projects' : 'My Work'}
        </Link>
        <span>/</span>
        <span>Project Detail</span>
      </div>

      {error && <p className="alert">{error}</p>}

      {project && (
        <>
          <Card className="project-card project-detail-card">
            <div className="project-head">
              <h2 className="section-title">{project.title}</h2>
              <StatusBadge status={project.status} />
            </div>
            <StatusTimeline status={project.status} />
            <div className="detail-meta-grid">
              <div className="detail-meta-item">
                <p className="detail-meta-label">Budget</p>
                <p className="detail-meta-value">{formatINR(project.budget)}</p>
              </div>
              <div className="detail-meta-item">
                <p className="detail-meta-label">Deadline</p>
                <p className="detail-meta-value">{formatDateOnly(project.deadline)}</p>
              </div>
              <div className="detail-meta-item">
                <p className="detail-meta-label">Business</p>
                <p className="detail-meta-value">{project.businessName || 'Business'}</p>
              </div>
              <div className="detail-meta-item">
                <p className="detail-meta-label">Assigned Freelancer</p>
                <p className="detail-meta-value">{project.freelancerName || 'Not assigned'}</p>
              </div>
            </div>
            <p className="muted"><strong>Skills Required:</strong> {project.skillsRequired}</p>
            <p className="muted"><strong>Description:</strong> {project.description}</p>
            {(project.referenceLink || (project.referenceFiles || []).length > 0) && (
              <div className="stack">
                <h3>Project References</h3>
                {project.referenceLink && (
                  <p className="muted">
                    URL:{' '}
                    <a href={project.referenceLink} target="_blank" rel="noreferrer">
                      {project.referenceLink}
                    </a>
                  </p>
                )}
                {(project.referenceFiles || []).length > 0 && (
                  <div className="stack">
                    <p className="muted">Files:</p>
                    {(project.referenceFiles || []).map((file) => (
                      <a key={file.url} href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${file.url}`} target="_blank" rel="noreferrer">
                        {file.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
            {(project.submissionText || project.submissionLink || (project.submissionFiles || []).length > 0) && (
              <div className="stack">
                <h3>Submitted Details</h3>
                {project.submissionText && <p className="muted">Notes: {project.submissionText}</p>}
                {project.submissionLink && (
                  <p className="muted">
                    Link:{' '}
                    <a href={project.submissionLink} target="_blank" rel="noreferrer">
                      {project.submissionLink}
                    </a>
                  </p>
                )}
                {(project.submissionFiles || []).length > 0 && (
                  <div className="stack">
                    <p className="muted">Files:</p>
                    {(project.submissionFiles || []).map((file) => (
                      <a key={file.url} href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${file.url}`} target="_blank" rel="noreferrer">
                        {file.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {user?.role === 'freelancer' && project.status === 'Open' && !project.hasApplied && (
              <div className="stack">
                <label className="label" htmlFor="application-cover">Why are you a good fit? (Optional)</label>
                <textarea
                  id="application-cover"
                  className="textarea"
                  value={applicationCoverLetter}
                  onChange={(e) => setApplicationCoverLetter(e.target.value)}
                  disabled={isApplying}
                />
                <Button onClick={onApply} disabled={isApplying} loading={isApplying} loadingText="Applying...">Apply for Project</Button>
              </div>
            )}
            {user?.role === 'freelancer' && project.status === 'Open' && project.hasApplied && (
              <p className="muted">Application Status: {project.applicationStatus || 'Pending'}</p>
            )}

            {user?.role === 'freelancer' && project.status === 'Assigned' && project.freelancerId === user.id && (
              <div className="stack">
                <label className="label" htmlFor="detail-submission">Submission Notes</label>
                <textarea id="detail-submission" className="textarea" value={submissionText} onChange={(e) => setSubmissionText(e.target.value)} disabled={isActing} />
                {submissionFieldErrors.submissionText && <p className="field-error">{submissionFieldErrors.submissionText}</p>}
                <label className="label" htmlFor="detail-submission-link">Submission URL</label>
                <input id="detail-submission-link" className="input" placeholder="https://example.com/deliverables" value={submissionLink} onChange={(e) => setSubmissionLink(e.target.value)} disabled={isActing} />
                {submissionFieldErrors.submissionLink && <p className="field-error">{submissionFieldErrors.submissionLink}</p>}
                <label className="label" htmlFor="detail-submission-files">Attach Files</label>
                <input id="detail-submission-files" className="input" type="file" multiple onChange={(e) => setSubmissionFiles(Array.from(e.target.files || []))} disabled={isActing} />
                <Button variant="secondary" onClick={onSubmit} disabled={isActing} loading={isActing} loadingText="Submitting...">Submit Work</Button>
              </div>
            )}

            {user?.role === 'business' && project.status === 'Submitted' && (
              <div className="stack">
                <Button variant="primary" onClick={onComplete} disabled={isActing || !canCompleteProject} loading={isActing} loadingText="Completing...">Mark as Completed</Button>
                {!canCompleteProject && <p className="muted">Release payment to freelancer before completing this project.</p>}
              </div>
            )}
          </Card>

          {canViewPayment && (
            <Card className="stack">
              <div className="project-head">
                <h3>Escrow & Payments</h3>
                <Button variant="secondary" onClick={loadPayment} disabled={isPaymentLoading} loading={isPaymentLoading} loadingText="Refreshing...">Refresh</Button>
              </div>

              {isPaymentLoading ? (
                <Loader label="Loading payment timeline..." />
              ) : payment ? (
                <>
                  <div className="payment-summary">
                    <div>
                      <p className="muted">Base Escrow</p>
                      <p className="payment-amount">{formatINR(payment.amount)}</p>
                    </div>
                    <span className={`payment-pill payment-pill-${String(payment.status || '').toLowerCase()}`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="detail-meta-grid">
                    <div className="detail-meta-item">
                      <p className="detail-meta-label">Tips Added</p>
                      <p className="detail-meta-value">{formatINR(payment.tipTotal || 0)}</p>
                    </div>
                    <div className="detail-meta-item">
                      <p className="detail-meta-label">Total Paid Out</p>
                      <p className="detail-meta-value">{formatINR((payment.amount || 0) + (payment.tipTotal || 0))}</p>
                    </div>
                  </div>
                  <div className="grid grid-2">
                    <p className="muted">Funded At: {payment.fundedAt ? new Date(payment.fundedAt).toLocaleString('en-IN') : 'Not funded'}</p>
                    <p className="muted">Released At: {payment.releasedAt ? new Date(payment.releasedAt).toLocaleString('en-IN') : 'Not released'}</p>
                  </div>

                  {user?.role === 'business' && (
                    <div className="row">
                      {payment.status === 'Unfunded' && ['Assigned', 'Submitted', 'Completed'].includes(project.status) && (
                        <Button onClick={onFundEscrow} disabled={isFundingEscrow} loading={isFundingEscrow} loadingText="Funding...">
                          {gatewayConfig.provider === 'mock' ? 'Fund Escrow (Test Mode)' : 'Fund Escrow Securely'}
                        </Button>
                      )}
                      {payment.status === 'Funded' && ['Submitted', 'Completed'].includes(project.status) && (
                        <Button variant="success" onClick={onReleaseEscrow} disabled={isReleasingEscrow} loading={isReleasingEscrow} loadingText="Releasing...">
                          Release Payment
                        </Button>
                      )}
                    </div>
                  )}

                  {user?.role === 'business' && payment.status === 'Released' && (
                    <div className="stack payout-tip-panel">
                      <h4 className="section-title">Add Tip</h4>
                      <p className="muted">
                        {gatewayConfig.provider === 'mock'
                          ? 'Test-mode payment flow without external gateway account.'
                          : 'Secure checkout with gateway to reward exceptional delivery.'}
                      </p>
                      <div className="grid grid-2">
                        <div className="stack">
                          <label className="label" htmlFor="tip-amount">Tip Amount (INR)</label>
                          <input
                            id="tip-amount"
                            className="input"
                            type="number"
                            min="1"
                            placeholder="Enter tip amount"
                            value={tipAmount}
                            onChange={(e) => setTipAmount(e.target.value)}
                            disabled={isAddingTip}
                          />
                        </div>
                        <div className="stack">
                          <label className="label" htmlFor="tip-note">Tip Note (Optional)</label>
                          <input
                            id="tip-note"
                            className="input"
                            placeholder="Great communication and quality"
                            value={tipNote}
                            onChange={(e) => setTipNote(e.target.value)}
                            disabled={isAddingTip}
                          />
                        </div>
                      </div>
                      <div className="row">
                        <Button
                          variant="success"
                          onClick={onAddTip}
                          disabled={isAddingTip || !Number(tipAmount) || !gatewayConfig.enabled}
                          loading={isAddingTip}
                          loadingText="Adding tip..."
                        >
                          {gatewayConfig.provider === 'mock' ? 'Pay Tip (Test Mode)' : 'Pay Tip Securely'}
                        </Button>
                      </div>
                      {!gatewayConfig.enabled && <p className="muted">Payment gateway is not configured by admin.</p>}
                    </div>
                  )}

                  <div className="stack">
                    <h4 className="section-title">Transaction Trail</h4>
                    {paymentTransactions.length ? paymentTransactions.map((tx) => (
                      <div key={tx.id} className="payment-transaction">
                        <div>
                          <p className="rating-meta"><span className={`tx-type tx-type-${String(tx.type || '').toLowerCase()}`}>{tx.type}</span></p>
                          <p className="muted">{tx.actorName || 'System'} | {new Date(tx.createdAt).toLocaleString('en-IN')}</p>
                          {tx.note && <p className="muted">{tx.note}</p>}
                        </div>
                        <strong>{formatINR(tx.amount)}</strong>
                      </div>
                    )) : <p className="muted">No payment transactions yet.</p>}
                  </div>
                </>
              ) : (
                <p className="muted">Escrow details are not available yet.</p>
              )}
            </Card>
          )}

          {user?.role === 'business' && project.status === 'Open' && (
            <Card className="stack">
              <div className="project-head">
                <h3>Freelancer Applications</h3>
                <Button variant="secondary" onClick={loadApplications} disabled={isApplicationsLoading} loading={isApplicationsLoading} loadingText="Refreshing...">Refresh</Button>
              </div>
              {isApplicationsLoading ? (
                <Loader label="Loading applications..." />
              ) : (
                <div className="grid">
                  {applications.length ? applications.map((application) => (
                    <div key={application.id} className="application-card">
                      <div className="project-head">
                        <div className="application-user">
                          <span className="application-avatar">{String(application.freelancerName || 'F').charAt(0).toUpperCase()}</span>
                          <div>
                            <p className="rating-meta">{application.freelancerName}</p>
                          </div>
                        </div>
                        <span className={`application-status application-status-${String(application.status || '').toLowerCase()}`}>
                          {application.status}
                        </span>
                      </div>
                      <div className="selected-skills">
                        {parseSkills(application.skills).length
                          ? parseSkills(application.skills).map((skill) => (
                            <span key={`${application.id}-${skill}`} className="skill-chip">{skill}</span>
                          ))
                          : <p className="muted">No skills provided</p>}
                      </div>
                      <div className="grid grid-2">
                        <Card className="metric-card">
                          <p>Experience</p>
                          <strong>{application.experienceYears ?? 0} yrs</strong>
                        </Card>
                        <RatingSummary
                          compact
                          summary={{
                            averageRating: Number(application.averageRating || 0),
                            totalRatings: Number(application.totalRatings || 0),
                            distribution: {
                              5: Number(application.rating5Count || 0),
                              4: Number(application.rating4Count || 0),
                              3: Number(application.rating3Count || 0),
                              2: Number(application.rating2Count || 0),
                              1: Number(application.rating1Count || 0),
                            },
                          }}
                        />
                      </div>
                      <p className="muted">{application.bio || 'No bio provided.'}</p>
                      {application.coverLetter && <p className="muted">Cover Note: {application.coverLetter}</p>}
                      <div className="row">
                        {application.portfolioLink && (
                          <a className="btn btn-secondary" href={application.portfolioLink} target="_blank" rel="noreferrer">
                            Portfolio
                          </a>
                        )}
                      <Button
                        onClick={() => onAcceptApplication(application.id)}
                        disabled={application.status !== 'Pending' || acceptingApplicationId === application.id}
                        loading={acceptingApplicationId === application.id}
                        loadingText="Assigning..."
                      >
                        Assign Freelancer
                      </Button>
                      </div>
                    </div>
                  )) : <p className="muted">No applications yet.</p>}
                </div>
              )}
            </Card>
          )}

          {canUseMessaging && (
            <Card className="stack">
              <div className="project-head">
                <h3>Project Messages</h3>
                <Button variant="secondary" onClick={loadMessages} disabled={isMessagesLoading} loading={isMessagesLoading} loadingText="Refreshing...">Refresh</Button>
              </div>

              {chatError && <p className="field-error">{chatError}</p>}

              {isMessagesLoading ? (
                <Loader label="Loading messages..." />
              ) : (
                <div className="chat-list">
                  {messages.length ? messages.map((message) => {
                    const mine = message.senderId === user?.id;
                    return (
                      <div key={message.id} className={`chat-item${mine ? ' chat-item-mine' : ''}`}>
                        <p className="chat-meta">{message.senderName} - {new Date(message.createdAt).toLocaleString('en-IN')}</p>
                        <p className="chat-text">{message.messageText}</p>
                      </div>
                    );
                  }) : <p className="muted">No messages yet. Start the conversation.</p>}
                  {Object.values(typingUsers).length > 0 && (
                    <p className="muted">{Object.values(typingUsers).join(', ')} typing...</p>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}

              <div className="stack">
                <label className="label" htmlFor="chat-text">Message</label>
                <textarea id="chat-text" className="textarea" value={chatText} onChange={(e) => onChatChange(e.target.value)} disabled={isSendingMessage} />
                <Button onClick={onSendMessage} disabled={isSendingMessage || !chatText.trim()} loading={isSendingMessage} loadingText="Sending...">Send Message</Button>
              </div>
            </Card>
          )}

          {canRate && (
            <Card className="stack">
              <h3>Ratings & Reviews</h3>
              {ratingError && <p className="field-error">{ratingError}</p>}

              {isRatingsLoading ? (
                <Loader label="Loading ratings..." />
              ) : (
                <div className="grid">
                  {ratings.length ? ratings.map((item) => (
                    <div key={item.id} className="rating-item">
                      <p className="rating-meta">{item.raterName} rated {item.rating}/5</p>
                      <p className="muted">{item.reviewText || 'No written review.'}</p>
                    </div>
                  )) : <p className="muted">No ratings yet.</p>}
                </div>
              )}

              {canSubmitRating && !alreadyRated && (
                <div className="stack">
                  <label className="label" htmlFor="rating-value">Your Rating</label>
                  <select id="rating-value" className="select" value={ratingValue} onChange={(e) => setRatingValue(Number(e.target.value))}>
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Average</option>
                    <option value={2}>2 - Poor</option>
                    <option value={1}>1 - Very Poor</option>
                  </select>
                  {ratingFieldErrors.rating && <p className="field-error">{ratingFieldErrors.rating}</p>}

                  <label className="label" htmlFor="rating-review">Review</label>
                  <textarea id="rating-review" className="textarea" value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
                  {ratingFieldErrors.reviewText && <p className="field-error">{ratingFieldErrors.reviewText}</p>}
                  <Button onClick={onSubmitRating} disabled={isSubmittingRating} loading={isSubmittingRating} loadingText="Submitting...">Submit Rating</Button>
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </section>
  );
}
