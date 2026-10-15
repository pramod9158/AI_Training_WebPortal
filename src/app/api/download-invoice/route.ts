import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    // Check in public/ first, then workspace root
    let pdfPath = path.join(process.cwd(), 'public', 'Waynautic_Invoice_Performance_Testing.pdf');
    if (!fs.existsSync(pdfPath)) {
      pdfPath = path.join(process.cwd(), 'Waynautic_Invoice_Performance_Testing.pdf');
    }

    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json({ error: 'Invoice PDF not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(pdfPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Waynautic_Invoice_Performance_Testing.pdf"',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving invoice PDF:', error);
    return NextResponse.json({ error: 'Failed to download invoice' }, { status: 500 });
  }
}
