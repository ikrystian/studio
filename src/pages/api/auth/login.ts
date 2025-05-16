
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  success: boolean;
  message?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    // Updated credentials to match form defaults
    if (email === 'test@example.com' && password === 'password') {
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
