import Image from 'next/image';
import type { ContentImage } from '@/lib/content/types';

type MediaProps = {
  media: ContentImage;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** How a video behaves: silent loop (covers/backgrounds), first frame only (thumbnails) or with controls (galleries). */
  videoMode?: 'loop' | 'still' | 'player';
};

// Cloudinary renders a video frame as an image when the extension is swapped for .jpg.
export function videoPoster(url: string) {
  return url.includes('res.cloudinary.com') && url.includes('/video/upload/') ? url.replace(/\.[a-z0-9]+$/i, '.jpg') : undefined;
}

/** Fills its (relatively positioned) parent with a photo or a video. */
export default function Media({ media, alt, sizes, className = 'object-cover', priority, videoMode = 'loop' }: MediaProps) {
  if (media.type !== 'video') {
    return <Image src={media.url} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
  }

  const common = {
    src: media.url,
    poster: videoPoster(media.url),
    playsInline: true,
    className: `absolute inset-0 h-full w-full ${className}`,
    'aria-label': alt,
  };

  if (videoMode === 'player') return <video {...common} controls autoPlay preload="metadata" />;
  // "#t=0.1" makes mobile browsers paint a frame instead of a black box when there is no poster.
  if (videoMode === 'still') return <video {...common} src={common.poster ? media.url : `${media.url}#t=0.1`} muted preload="metadata" />;
  return <video {...common} muted loop autoPlay preload="metadata" />;
}
