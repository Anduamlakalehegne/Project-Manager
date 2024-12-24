import { NextResponse } from 'next/server';
import { hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { action, ...data } = await req.json();

    switch (action) {
      case 'login': {
        const { email, password } = data;
        const user = await User.findOne({ email });
        
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isValid = await compare(password, user.password);
        if (!isValid) {
          return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        const token = sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
        return NextResponse.json({ token, user: { id: user._id, name: user.name, email: user.email } });
      }

      case 'signup': {
        const { name, email, password } = data;
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
          return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        const hashedPassword = await hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });
        const token = sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
        
        return NextResponse.json({ token, user: { id: user._id, name: user.name, email: user.email } });
      }

      case 'verify': {
        const { token } = data;
        const decoded = verify(token, JWT_SECRET) as { userId: string };
        const user = await User.findById(decoded.userId);
        
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user: { id: user._id, name: user.name, email: user.email } });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
