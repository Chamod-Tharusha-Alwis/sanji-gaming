export default function VideoPlayer({ src }) {
  if (!src) return null;

  // Generate Cloudinary thumbnail if it's a Cloudinary URL
  let poster = undefined;
  if (src.includes('cloudinary.com')) {
    const baseUrl = src.replace(/\.[^/.]+$/, '.jpg');
    poster = baseUrl.replace('/upload/', '/upload/so_0,w_800,h_450,c_fill,f_jpg/');
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-gaming-border bg-black">
      <video
        src={src}
        poster={poster}
        controls
        preload="metadata"
        className="w-full aspect-video object-contain bg-black"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
