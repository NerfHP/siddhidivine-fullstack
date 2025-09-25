import config from '../config/index.js';
// Import the main Prisma namespace from the client
import { Prisma } from '@prisma/client';

// This is the correct, safe way to define the type for an order that includes its items and products.
// Prisma automatically generates this type for you based on the 'include' query in your controller.
type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;


/**
 * Formats the order details into a readable WhatsApp message.
 * @param {OrderWithDetails} order - The complete order object from Prisma.
 * @returns {string} The formatted message string.
 */
const formatOrderMessage = (order: OrderWithDetails): string => {
  // Create a list of items in the order
  const itemsList = order.items
    .map(item => `- ${item.product.name} (Qty: ${item.quantity})`)
    .join('\n');

  // Construct the full message with clear formatting
  const message = `
*🎉 New Order Received!*

*Order ID:*
${order.id}

*Customer Details:*
- *Name:* ${order.customerName}
- *Phone:* ${order.customerPhone}

*Shipping Address:*
${order.shippingAddress}

*Order Summary:*
${itemsList}

*Total Amount:* ₹${order.total.toFixed(2)}
  `;

  return message.trim();
};

/**
 * Sends a WhatsApp notification with the order details.
 * @param {OrderWithDetails} order - The complete order object.
 */
export const sendWhatsAppOrderNotification = async (order: OrderWithDetails) => {
  // This will now work because we are updating the config file.
  const { phoneNumber, apiKey } = config.whatsapp;
  const message = formatOrderMessage(order);

  // URL-encode the message to handle special characters
  const encodedMessage = encodeURIComponent(message);
  
  const apiUrl = `https://api.callmebot.com/whatsapp.php?phone=${phoneNumber}&text=${encodedMessage}&apikey=${apiKey}`;

  try {
    console.log('Sending WhatsApp order notification...');
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send WhatsApp message:', response.status, errorText);
    } else {
      console.log('WhatsApp notification sent successfully!');
    }
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
  }
};

