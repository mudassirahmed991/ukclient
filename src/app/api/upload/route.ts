import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get the file extension
    const filename = file.name;
    const extension = path.extname(filename);
    const uniqueFilename = `${uuidv4()}${extension}`;

    // Path where the image will be saved (public/uploads)
    // Next.js serves files from the 'public' directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Create the directory if it doesn't exist (optional, but good practice. We'll assume 'fs/promises' mkdir would be here, but simpler just to assume public/uploads exists or we create it beforehand. Let's do a simple write, if public/uploads doesn't exist it will throw, so we should make sure it exists.)
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, uniqueFilename);
    await writeFile(filepath, buffer);

    // Return the URL that can be used on the frontend
    const imageUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error saving image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
