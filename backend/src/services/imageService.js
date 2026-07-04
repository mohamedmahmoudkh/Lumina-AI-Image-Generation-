import { config } from '../config.js';

/**
 * Generate images via configured provider chain:
 * 1. Replicate (if REPLICATE_API_TOKEN)
 * 2. Stability AI (if STABILITY_API_KEY)
 * 3. Pollinations.ai free API (no key — production fallback)
 */
export async function generateImages({ prompt, count = 1, style, ratio, resolution }) {
  const enhancedPrompt = buildPrompt(prompt, style);

  if (config.replicateToken?.length > 10) {
    return generateViaReplicate(enhancedPrompt, count, resolution);
  }
  if (config.stabilityKey?.length > 10) {
    return generateViaStability(enhancedPrompt, count, resolution);
  }
  return generateViaPollinations(enhancedPrompt, count, ratio, resolution);
}

function buildPrompt(prompt, style) {
  const styleMap = {
    anime: 'anime style, vibrant',
    cinematic: 'cinematic lighting, dramatic',
    realistic: 'photorealistic, 8k, detailed',
    fantasy: 'fantasy art, magical',
    cyberpunk: 'cyberpunk, neon',
    product: 'product photography, studio',
    oil: 'oil painting style',
    pixar: '3d pixar style',
    sketch: 'pencil sketch',
  };
  const suffix = styleMap[style] || styleMap.realistic;
  return `${prompt}, ${suffix}`;
}

function parseSize(resolution, ratio) {
  const base = parseInt(resolution, 10) || 1024;
  const [w, h] = (ratio || '1:1').split(':').map(Number);
  if (!h || !w) return { width: base, height: base };
  if (w >= h) return { width: base, height: Math.round(base * (h / w)) };
  return { width: Math.round(base * (w / h)), height: base };
}

async function generateViaPollinations(prompt, count, ratio, resolution) {
  const { width, height } = parseSize(resolution, ratio);
  const images = [];

  for (let i = 0; i < count; i++) {
    const seed = Date.now() + i;
    const encoded = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
    images.push({
      id: `img-${seed}`,
      url,
      prompt,
      provider: 'pollinations',
    });
  }

  return images;
}

async function generateViaReplicate(prompt, count, resolution) {
  const size = parseInt(resolution, 10) || 1024;
  const model = 'black-forest-labs/flux-schnell';
  const images = [];

  for (let i = 0; i < count; i++) {
    const res = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.replicateToken}`,
        'Content-Type': 'application/json',
        Prefer: 'wait',
      },
      body: JSON.stringify({
        version: 'flux-schnell',
        input: { prompt, num_outputs: 1, aspect_ratio: '1:1' },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Replicate error: ${err}`);
    }

    const data = await res.json();
    const output = data.output;
    const url = Array.isArray(output) ? output[0] : output;
    images.push({
      id: data.id || `rep-${Date.now()}-${i}`,
      url,
      prompt,
      provider: 'replicate',
    });
  }

  return images;
}

async function generateViaStability(prompt, count, resolution) {
  const size = parseInt(resolution, 10) || 1024;
  const images = [];

  for (let i = 0; i < count; i++) {
    const res = await fetch(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.stabilityKey}`,
          Accept: 'application/json',
        },
        body: (() => {
          const form = new FormData();
          form.append('prompt', prompt);
          form.append('output_format', 'png');
          form.append('aspect_ratio', '1:1');
          return form;
        })(),
      }
    );

    if (!res.ok) throw new Error('Stability API failed');
    const data = await res.json();
    const url = data.image ? `data:image/png;base64,${data.image}` : data.artifacts?.[0]?.base64;
    images.push({
      id: `stab-${Date.now()}-${i}`,
      url,
      prompt,
      provider: 'stability',
    });
  }

  return images;
}
