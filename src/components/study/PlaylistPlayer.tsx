export function PlaylistPlayer({ playlistId, title }: { playlistId: string; title: string }) {
  return (
    <div className="aspect-video bg-navy">
      <iframe
        title={title}
        src={`https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}`}
        className="size-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
