import { Resend } from 'resend';
import { Order, OrderItem, ContentItem } from '@prisma/client';

const resend = new Resend(process.env.RESEND_API_KEY);

type OrderWithDetails = Order & {
  items: (OrderItem & { product: ContentItem })[];
};

// --- EMAIL TEMPLATES ---

const generateCustomerInvoiceHTML = (order: OrderWithDetails) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.name} (x${item.quantity})</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
      <h1 style="color: #c0392b; text-align: center;">Thank You For Your Order!</h1>
      <p>Hi ${order.customerName}, your order has been received and is now being processed.</p>
      <h2 style="border-bottom: 2px solid #eee; padding-bottom: 10px;">Invoice #${order.id.slice(-6)}</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead><tr><th style="text-align: left; padding: 10px;">Item</th><th style="text-align: right; padding: 10px;">Price</th></tr></thead>
        <tbody>
          ${itemsHtml}
          <tr style="font-weight: bold; border-top: 2px solid #333;">
            <td style="padding: 10px; text-align: right;">Total</td>
            <td style="padding: 10px; text-align: right;">₹${order.total.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>
      <h3 style="margin-top: 30px;">Shipping To:</h3>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
        <p style="margin: 0;"><strong>${order.customerName}</strong></p>
        <p style="margin: 0;">${order.shippingAddress}</p>
        <p style="margin: 0;">${order.customerPhone}</p>
      </div>
    </div>
  `;
};

const generateAdminNotificationHTML = (order: OrderWithDetails, customerInvoiceHtml: string) => {
    const itemsHtml = order.items.map(item => `
    <li style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
      <strong>${item.product.name}</strong> (SKU: ${item.product.sku || 'N/A'})<br>
      Quantity: <strong>${item.quantity}</strong> | Price: ₹${item.price.toLocaleString('en-IN')}
    </li>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1 style="color: #27ae60;">🎉 New Order Received!</h1>
      <h3>Total Value: ₹${order.total.toLocaleString('en-IN')}</h3>
      <h2 style="border-bottom: 2px solid #eee; padding-bottom: 10px;">Shipping Details (For Parcel)</h2>
      <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
        <p style="margin: 0;"><strong>To: ${order.customerName}</strong></p>
        <p style="margin: 0;">${order.shippingAddress}</p>
        <p style="margin: 0;"><strong>Phone: ${order.customerPhone}</strong></p>
      </div>
      <h2 style="margin-top: 30px;">Packing Slip (Items to Dispatch)</h2>
      <ul style="list-style-type: none; padding: 0;">${itemsHtml}</ul>
      <hr style="margin-top: 40px;">
      <h2 style="margin-top: 40px;">Customer Invoice (For Printing)</h2>
      ${customerInvoiceHtml}
    </div>
  `;
};


// --- EMAIL SENDING FUNCTIONS ---

export const sendOrderEmails = async (order: OrderWithDetails, customerEmail: string) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
        console.error("CRITICAL: ADMIN_EMAIL is not set in .env. Cannot send order notifications.");
        return;
    }

    // 1. Generate the customer invoice HTML once
    const customerInvoiceHtml = generateCustomerInvoiceHTML(order);
    
    // 2. Send the invoice to the customer
    try {
        await resend.emails.send({
            from: 'Siddhi Divine <onboarding@resend.dev>',
            to: customerEmail,
            subject: `Your Siddhi Divine Order Confirmation #${order.id.slice(-6)}`,
            html: customerInvoiceHtml,
        });
        console.log(`Customer invoice sent to ${customerEmail}`);
    } catch (error) {
        console.error("Failed to send customer invoice:", error);
    }
    
    // 3. Generate the comprehensive admin notification
    const adminNotificationHtml = generateAdminNotificationHTML(order, customerInvoiceHtml);
    
    // 4. Send the notification to the admin
    try {
        await resend.emails.send({
            from: 'Siddhi Divine Orders <onboarding@resend.dev>',
            to: adminEmail,
            subject: `🎉 New Order! #${order.id.slice(-6)} from ${order.customerName}`,
            html: adminNotificationHtml,
        });
        console.log(`Admin notification sent to ${adminEmail}`);
    } catch (error) {
        console.error("Failed to send admin notification:", error);
    }
};

