import { NextResponse } from 'next/server';
import { connectToDatabase, Enquiry } from '@/lib/mongodb';

// GET all enquiries
export async function GET() {
  try {
    await connectToDatabase();
    // Fetch all enquiries sorted by newest first
    const enquiries = await Enquiry.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: enquiries });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// POST a new enquiry
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // Create new enquiry in database
    const enquiry = await Enquiry.create(body);
    
    return NextResponse.json({ success: true, data: enquiry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
