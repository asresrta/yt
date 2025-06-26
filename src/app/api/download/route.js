import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');
  if (!videoId) {
    return new Response(JSON.stringify({ error: 'Missing videoId' }), { status: 400 });
  }
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const filename = `${videoId}.mp3`;
  const filepath = path.join('/tmp', filename);

  if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

  return new Promise((resolve) => {
    exec(
      `/usr/local/bin/yt-dlp -x --audio-format mp3 -o "${filepath}" "${url}"`,
      async (error) => {
        if (error) {
          resolve(new Response(JSON.stringify({ error: 'Download failed' }), { status: 500 }));
          return;
        }
        const stat = fs.statSync(filepath);
        const stream = fs.createReadStream(filepath);
        const headers = {
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': stat.size,
        };
        resolve(new Response(stream, { status: 200, headers }));
        stream.on('close', () => fs.unlinkSync(filepath));
      }
    );
  });
} 