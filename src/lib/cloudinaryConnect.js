
export default async function handler(req, res) {
  const { folder } = req.query;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const timestamp = Math.floor(new Date().getTime() / 1000);
  const signature = require('crypto')
    .createHash('sha1')
    .update(`prefix=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image`;

  const response = await fetch(
    `${url}?prefix=${folder}&timestamp=${timestamp}&signature=${signature}&api_key=${apiKey}`,
    {
      method: 'GET',
    }
  );

  const data = await response.json();
  res.status(200).json(data.resources || []);
}
