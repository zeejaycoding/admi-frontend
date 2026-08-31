import PropTypes from 'prop-types';
import { STATS_CARD_COLORS } from '../../constants/statuses';

function StatsCard({ title, value, icon: Icon, color = 'primary' }) {
  const classes = STATS_CARD_COLORS[color] ?? STATS_CARD_COLORS.primary;

  return (
    <div
      className={`
        ${classes.bg}
        w-full h-20 sm:h-32 md:h-40
        p-3 sm:p-4 md:p-5
        rounded-lg border border-opacity-20
        transition-all duration-300 ease-in-out
        hover:-translate-y-0.5 hover:shadow-lg
        flex items-center justify-between
        shadow-sm
      `}
    >
      <div className="flex-1">
        <div
          className={`
            ${classes.text}
            text-xl sm:text-3xl md:text-4xl
            font-bold leading-tight mb-0 sm:mb-1
          `}
        >
          {value ?? 0}
        </div>
        <div
          className={`
            ${classes.text}
            opacity-80 text-xs sm:text-sm md:text-base
            font-semibold leading-tight truncate
          `}
        >
          {title}
        </div>
      </div>
      {Icon && (
        <div
          className={`
            ${classes.icon}
            rounded-lg p-2 sm:p-3 md:p-4
            flex items-center justify-center
            flex-shrink-0 ml-2 sm:ml-3 md:ml-4
            w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16
          `}
        >
          <Icon className="text-white w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
        </div>
      )}
    </div>
  );
}

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.elementType,
  color: PropTypes.oneOf(['primary', 'success', 'warning', 'error', 'info']),
};

export default StatsCard;
