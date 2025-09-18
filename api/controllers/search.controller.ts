import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const searchContent = async (req: Request, res: Response) => {
  const query = req.query.q as string;

  if (!query || query.trim() === '') {
    return res.json([]);
  }

  try {
    // This simplified query works across both SQLite and PostgreSQL.
    // Note: The search will be case-sensitive on your local SQLite database.
    const results = await prisma.contentItem.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query } },
              { description: { contains: query } },
              { content: { contains: query } },
            ],
          },
          { isPublished: true },
        ]
      },
      take: 10,
      include: {
        categories: {
          select: { name: true, slug: true },
        },
      },
    });
    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: 'Something went wrong during the search.' });
  }
};

