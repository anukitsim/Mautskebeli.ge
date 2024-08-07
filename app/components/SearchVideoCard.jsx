

const PlayButton = ({ onClick }) => (
  <img
    src="/images/card-play-button.svg"
    alt="playbutton"
    width={42}
    height={42}
    onClick={onClick}
    className="cursor-pointer transform hover:scale-110"
  />
);

const getThumbnailUrl = (videoId) => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

const SearchVideoCard = ({ videoId, caption, onSelect }) => {
  const thumbnailUrl = getThumbnailUrl(videoId);

  return (
    <div
      className="relative flex flex-col items-start gap-2 p-2.5 rounded-lg bg-[#AD88C6] cursor-pointer h-full"
      style={{ width: "280px", height: "200px" }}
      onClick={() => onSelect(videoId)}
    >
      <div
        className="relative w-full bg-cover bg-center rounded-lg"
        style={{ height: "70%" }}
      >
        <div
          style={{ backgroundImage: `url(${thumbnailUrl})`, height: "100%" }}
          className="w-full bg-cover bg-center rounded-lg"
        ></div>
        <div className="absolute inset-0 flex justify-center items-center">
          <PlayButton onClick={() => onSelect(videoId)} />
        </div>
      </div>
      <p className="text-white text-sm font-semibold">{caption}</p>
    </div>
  );
};

export default SearchVideoCard;
