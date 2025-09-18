import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import logger from '../utils/logger.js';

const handleContactForm = catchAsync(async (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  // In a real application, you would send an email here.
  // For this example, we'll just log it.
  logger.info(
    `Contact form submission: Name: ${name}, Email: ${email}, Message: ${message}`,
  );
  res
    .status(httpStatus.OK)
    .send({ message: 'Your message has been received.' });
});

export const formController = {
  handleContactForm,
};