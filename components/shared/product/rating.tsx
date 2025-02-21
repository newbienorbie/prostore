// rating.tsx - Enhanced with integrated numeric display
const Rating = ({
  value,
  caption,
  showNumeric = false,
}: {
  value: number;
  caption?: string;
  showNumeric?: boolean;
}) => {
  const Full = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="text-yellow-400 w-4 h-auto fill-current"
      viewBox="0 0 16 16"
    >
      <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
    </svg>
  );

  // Enhanced partial star that shows exact percentage filled
  const Partial = ({ percentage }: { percentage: number }) => (
    <div className="relative w-5">
      {/* Background empty star */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="text-yellow-500 w-4 h-auto fill-current absolute"
        viewBox="0 0 16 16"
      >
        <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" />
      </svg>

      {/* Foreground filled star with clip-path */}
      <div style={{ clipPath: `inset(0 ${100 - percentage * 100}% 0 0)` }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="text-yellow-400 w-4 h-auto fill-current"
          viewBox="0 0 16 16"
        >
          <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
        </svg>
      </div>
    </div>
  );

  const Empty = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="text-yellow-500 w-4 h-auto fill-current"
      viewBox="0 0 16 16"
    >
      <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" />
    </svg>
  );

  // Generate star components for the 5 positions
  const renderStars = () => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (value >= i) {
        // Full star
        stars.push(<Full key={i} />);
      } else if (value > i - 1) {
        // Partial star - calculate the exact percentage filled
        const percentage = value - (i - 1); // Will be between 0 and 1
        stars.push(<Partial key={i} percentage={percentage} />);
      } else {
        // Empty star
        stars.push(<Empty key={i} />);
      }
    }

    return stars;
  };

  return (
    <div className="flex items-center">
      <div className="flex gap-1">{renderStars()}</div>

      {showNumeric && (
        <span className="text-xs text-gray-500 ml-1 font-medium">
          {value.toFixed(2)}
        </span>
      )}

      {caption && <span className="text-sm ml-2">{caption}</span>}
    </div>
  );
};

export default Rating;
