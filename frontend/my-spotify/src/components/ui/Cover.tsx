import Image from 'next/image';

interface CoverProps {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
}

export default function Cover({
  src,
  alt,
  size = 64,
  className = '',
}: CoverProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-neutral-700 border border-neutral-600 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-1/2 h-1/2 text-neutral-400"
        >
          <path d="M12 3v10.55A4 4 0 1 0 14 17V8.82l5-1.25V14.5A4 4 0 1 0 21 18V5l-9 2.25V3Z" />
        </svg>
      )}
    </div>
  );
}