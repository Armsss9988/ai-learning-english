export function StarDisplay({ rating = 0, pass = 3, totalStars = 5 }) {
  return (
    <div
      className={`flex gap-1 w-fit px-3 rounded-2xl ${
        pass <= rating ? "bg-green-400" : "bg-red-200"
      }`}
    >
      {Array.from({ length: totalStars }, (_, index) => (
        <span key={index} className={`text-2xl `}>
          {index < rating ? "⭐" : "☆"}
        </span>
      ))}
    </div>
  );
}
