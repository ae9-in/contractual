const { z } = require('zod');
const paymentModel = require('../models/paymentModel');
const projectModel = require('../models/projectModel');
const notificationService = require('./notificationService');
const paymentGatewayService = require('./paymentGatewayService');
const ApiError = require('../utils/ApiError');

const addTipSchema = z.object({
  tipAmount: z.coerce.number().positive().max(10000000),
  note: z.string().trim().max(140).optional().default(''),
});
const createOrderSchema = z.object({
  purpose: z.enum(['escrow', 'tip']),
  tipAmount: z.coerce.number().positive().max(10000000).optional(),
  note: z.string().trim().max(140).optional().default(''),
});

async function getProjectPayment(projectId, user) {
  const project = await projectModel.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  const isOwner = Number(project.businessId) === Number(user.id);
  const isAssignedFreelancer = project.freelancerId && Number(project.freelancerId) === Number(user.id);
  if (!isOwner && !isAssignedFreelancer) {
    throw new ApiError(403, 'You are not allowed to view payment details');
  }

  const payment = await paymentModel.getByProjectId(projectId);
  const transactions = await paymentModel.listTransactionsByProject(projectId);
  return { payment, transactions, project };
}

async function fundProjectEscrow(projectId, businessId) {
  const project = await projectModel.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  try {
    await paymentModel.fundEscrowTx(projectId, businessId);
  } catch (error) {
    if (error.message === 'PROJECT_NOT_FOUND') throw new ApiError(404, 'Project not found');
    if (error.message === 'FORBIDDEN') throw new ApiError(403, 'Only project owner can fund escrow');
    if (error.message === 'PROJECT_NOT_ASSIGNABLE') throw new ApiError(400, 'Escrow can be funded after freelancer assignment');
    if (error.message === 'ALREADY_FUNDED') throw new ApiError(409, 'Escrow is already funded or released');
    throw error;
  }

  const payment = await paymentModel.getByProjectId(projectId);
  const transactions = await paymentModel.listTransactionsByProject(projectId);

  if (project.freelancerId) {
    await notificationService.createNotification({
      userId: project.freelancerId,
      projectId,
      type: 'payment_funded',
      title: 'Escrow Funded',
      messageText: `Escrow for "${project.title}" has been funded.`,
    });
  }

  return { payment, transactions };
}

async function releaseProjectEscrow(projectId, businessId) {
  const project = await projectModel.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  try {
    await paymentModel.releaseEscrowTx(projectId, businessId);
  } catch (error) {
    if (error.message === 'PROJECT_NOT_FOUND') throw new ApiError(404, 'Project not found');
    if (error.message === 'FORBIDDEN') throw new ApiError(403, 'Only project owner can release payment');
    if (error.message === 'PROJECT_NOT_SUBMITTED') throw new ApiError(400, 'Payment can be released after work is submitted');
    if (error.message === 'PAYMENT_NOT_FOUND') throw new ApiError(404, 'Escrow record not found');
    if (error.message === 'NOT_FUNDED') throw new ApiError(400, 'Escrow must be funded before release');
    throw error;
  }

  const payment = await paymentModel.getByProjectId(projectId);
  const transactions = await paymentModel.listTransactionsByProject(projectId);

  if (project.freelancerId) {
    await notificationService.createNotification({
      userId: project.freelancerId,
      projectId,
      type: 'payment_released',
      title: 'Payment Released',
      messageText: `Payment for "${project.title}" has been released.`,
    });
  }

  return { payment, transactions };
}

async function addProjectTip(projectId, businessId, data) {
  const project = await projectModel.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  const payload = addTipSchema.parse(data || {});

  try {
    await paymentModel.addTipTx(projectId, businessId, payload.tipAmount, payload.note);
  } catch (error) {
    if (error.message === 'PROJECT_NOT_FOUND') throw new ApiError(404, 'Project not found');
    if (error.message === 'FORBIDDEN') throw new ApiError(403, 'Only project owner can add tip');
    if (error.message === 'PROJECT_NOT_SUBMITTED') throw new ApiError(400, 'Tip can be added after work is submitted');
    if (error.message === 'PAYMENT_NOT_FOUND') throw new ApiError(404, 'Escrow record not found');
    if (error.message === 'NOT_RELEASED') throw new ApiError(400, 'Release payment before adding tip');
    throw error;
  }

  const payment = await paymentModel.getByProjectId(projectId);
  const transactions = await paymentModel.listTransactionsByProject(projectId);

  if (project.freelancerId) {
    await notificationService.createNotification({
      userId: project.freelancerId,
      projectId,
      type: 'payment_tipped',
      title: 'Tip Received',
      messageText: `You received an additional tip on "${project.title}".`,
    });
  }

  return { payment, transactions };
}

function getGatewayConfig() {
  return paymentGatewayService.getGatewayConfig();
}

async function createProjectGatewayOrder(projectId, businessId, data) {
  const project = await projectModel.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');
  if (Number(project.businessId) !== Number(businessId)) throw new ApiError(403, 'Only project owner can create payment order');

  const payment = await paymentModel.getByProjectId(projectId);
  if (!payment) throw new ApiError(404, 'Escrow record not found');
  const gatewayConfig = paymentGatewayService.getGatewayConfig();
  if (!gatewayConfig.enabled) throw new ApiError(503, `${gatewayConfig.provider} gateway is not configured`);

  const payload = createOrderSchema.parse(data || {});
  let amountPaise = 0;
  let purpose = 'Escrow';
  let note = null;

  if (payload.purpose === 'escrow') {
    if (!['Assigned', 'Submitted', 'Completed'].includes(project.status)) {
      throw new ApiError(400, 'Escrow can be funded after freelancer assignment');
    }
    if (payment.status !== 'Unfunded') {
      throw new ApiError(409, 'Escrow is already funded or released');
    }
    purpose = 'Escrow';
    amountPaise = Math.round(Number(payment.amount) * 100);
    note = 'Escrow funding';
  } else {
    if (!['Submitted', 'Completed'].includes(project.status)) {
      throw new ApiError(400, 'Tip can be added after work is submitted');
    }
    if (payment.status !== 'Released') {
      throw new ApiError(400, 'Release payment before adding tip');
    }
    purpose = 'Tip';
    amountPaise = Math.round(Number(payload.tipAmount || 0) * 100);
    if (!amountPaise) throw new ApiError(400, 'Tip amount is required');
    note = payload.note || 'Business tip';
  }

  const receipt = `proj_${projectId}_${purpose.toLowerCase()}_${Date.now()}`;
  const order = await paymentGatewayService.createOrder({
    amountPaise,
    currency: 'INR',
    receipt,
    notes: { projectId: String(projectId), purpose: purpose.toLowerCase() },
  });

  await paymentModel.createGatewayOrderRecord({
    projectId,
    paymentId: payment.id,
    businessId,
    purpose,
    amountPaise,
    providerOrderId: order.id,
    currency: order.currency || 'INR',
    provider: gatewayConfig.provider,
    note,
  });

  return {
    order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: gatewayConfig.keyId,
      provider: gatewayConfig.provider,
      purpose: purpose.toLowerCase(),
      projectId,
      businessName: project.businessName,
      projectTitle: project.title,
      description: purpose === 'Escrow' ? 'Escrow funding' : 'Freelancer tip',
    },
  };
}

async function verifyProjectGatewayPayment(projectId, businessId, data) {
  const orderId = String(data?.razorpay_order_id || data?.order_id || '').trim();
  const paymentId = String(data?.razorpay_payment_id || data?.payment_id || '').trim();
  const signature = String(data?.razorpay_signature || data?.signature || '').trim();
  if (!orderId || !paymentId) {
    throw new ApiError(400, 'Missing payment verification fields');
  }

  const project = await projectModel.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');
  if (Number(project.businessId) !== Number(businessId)) throw new ApiError(403, 'Only project owner can verify this payment');

  const orderRecord = await paymentModel.findOrderByProviderOrderId(orderId);
  if (!orderRecord) throw new ApiError(404, 'Payment order not found');

  const valid = paymentGatewayService.verifyCheckoutSignature({
    provider: orderRecord.provider,
    orderId,
    paymentId,
    signature,
  });
  if (!valid) throw new ApiError(400, 'Invalid payment signature');

  try {
    await paymentModel.verifyOrderPaymentTx({
      projectId,
      businessId,
      providerOrderId: orderId,
      providerPaymentId: paymentId,
      providerSignature: signature || null,
      source: 'checkout',
    });
  } catch (error) {
    if (error.message === 'ORDER_NOT_FOUND') throw new ApiError(404, 'Payment order not found');
    if (error.message === 'PROJECT_MISMATCH') throw new ApiError(400, 'Payment order mismatch');
    if (error.message === 'FORBIDDEN') throw new ApiError(403, 'Not allowed for this payment order');
    if (error.message === 'ALREADY_PAID') throw new ApiError(409, 'Payment already verified');
    if (error.message === 'ALREADY_FUNDED') throw new ApiError(409, 'Escrow already funded');
    if (error.message === 'NOT_RELEASED') throw new ApiError(400, 'Escrow must be released before tip');
    throw error;
  }

  const order = await paymentModel.findOrderByProviderOrderId(orderId);
  const payment = await paymentModel.getByProjectId(projectId);
  const transactions = await paymentModel.listTransactionsByProject(projectId);

  if (project.freelancerId) {
    if (order?.purpose === 'Escrow') {
      await notificationService.createNotification({
        userId: project.freelancerId,
        projectId,
        type: 'payment_funded',
        title: 'Escrow Funded',
        messageText: `Escrow for "${project.title}" has been funded.`,
      });
    } else if (order?.purpose === 'Tip') {
      await notificationService.createNotification({
        userId: project.freelancerId,
        projectId,
        type: 'payment_tipped',
        title: 'Tip Received',
        messageText: `You received an additional tip on "${project.title}".`,
      });
    }
  }

  return { payment, transactions, order };
}

async function handleGatewayWebhook(rawBodyBuffer, signature) {
  const valid = paymentGatewayService.verifyWebhookSignature(rawBodyBuffer, signature || '');
  if (!valid) throw new ApiError(400, 'Invalid webhook signature');

  let event;
  try {
    event = JSON.parse(rawBodyBuffer.toString('utf8'));
  } catch {
    throw new ApiError(400, 'Invalid webhook payload');
  }

  const eventType = event?.event;
  const orderId = event?.payload?.payment?.entity?.order_id;
  const paymentId = event?.payload?.payment?.entity?.id;
  if (!orderId || !paymentId) return { ok: true };
  if (!['payment.captured', 'payment.authorized'].includes(eventType)) return { ok: true };

  const order = await paymentModel.findOrderByProviderOrderId(orderId);
  if (!order || order.status === 'Paid') return { ok: true };

  try {
    await paymentModel.verifyOrderPaymentTx({
      projectId: order.projectId,
      businessId: null,
      providerOrderId: orderId,
      providerPaymentId: paymentId,
      providerSignature: signature || null,
      source: 'webhook',
    });
  } catch (error) {
    if (error.message === 'ALREADY_PAID') return { ok: true };
    if (error.message === 'ALREADY_FUNDED') return { ok: true };
    if (error.message === 'NOT_RELEASED' && order.purpose === 'Tip') return { ok: true };
    throw error;
  }

  const project = await projectModel.findById(order.projectId);
  if (project?.freelancerId) {
    if (order.purpose === 'Escrow') {
      await notificationService.createNotification({
        userId: project.freelancerId,
        projectId: project.id,
        type: 'payment_funded',
        title: 'Escrow Funded',
        messageText: `Escrow for "${project.title}" has been funded.`,
      });
    } else if (order.purpose === 'Tip') {
      await notificationService.createNotification({
        userId: project.freelancerId,
        projectId: project.id,
        type: 'payment_tipped',
        title: 'Tip Received',
        messageText: `You received an additional tip on "${project.title}".`,
      });
    }
  }

  return { ok: true };
}

module.exports = {
  getProjectPayment,
  fundProjectEscrow,
  releaseProjectEscrow,
  addProjectTip,
  getGatewayConfig,
  createProjectGatewayOrder,
  verifyProjectGatewayPayment,
  handleGatewayWebhook,
};
