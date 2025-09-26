import { Prisma } from '@prisma/client';
import config from '../config/index.js';

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
 * Sends a Discord notification with the order details.
 * @param {OrderWithDetails} order - The complete order object.
 */
export const sendAdminNotification = async (order: OrderWithDetails) => {
  try {
    const webhookUrl = config.discordWebhookUrl;

    const itemsList = order.items.map(item => {
      return `• ${item.quantity}x ${item.product.name}`;
    }).join('\n');

    // Discord webhooks use a special JSON structure called an "embed" for rich formatting.
    const discordPayload = {
      username: "Siddhi Divine Orders",
      avatar_url: "https://i.imgur.com/4M34hi2.png", // A simple icon
      embeds: [
        {
          title: `🎉 New Order Received!`,
          color: 15105570, // A nice gold/orange color
          fields: [
            { name: "Order ID", value: `\`${order.id}\``, inline: true },
            { name: "Total Amount", value: `**₹${order.total.toFixed(2)}**`, inline: true },
            { name: "Customer Name", value: order.customerName, inline: false },
            { name: "Customer Phone", value: order.customerPhone, inline: false },
            { name: "Shipping Address", value: order.shippingAddress, inline: false },
            { name: "Items", value: itemsList, inline: false },
          ],
          footer: {
            text: `Siddhi Divine | ${new Date().toLocaleString('en-IN')}`
          }
        }
      ]
    };

    console.log('Sending Discord order notification...');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    if (response.ok) {
      console.log('Discord notification sent successfully!');
    } else {
      console.error('Failed to send Discord message:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Error sending Discord notification:', error);
  }
};

