import { NextResponse } from 'next/server';
import { connectToDatabase, Enquiry } from '@/lib/mongodb';

// UPDATE a specific enquiry
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true } // Returns the updated document
    );

    if (!enquiry) {
      return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: enquiry });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE a specific enquiry
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const deletedEnquiry = await Enquiry.findByIdAndDelete(id);

    if (!deletedEnquiry) {
      return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
