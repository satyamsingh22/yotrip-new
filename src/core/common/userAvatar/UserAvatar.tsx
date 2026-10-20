/**
 * Avatar for the signed-in user. Falls back to their initials rather than a
 * stock photo of a stranger — a template placeholder like user-01.jpg reads as
 * "this is your picture" and is worse than showing nothing.
 */
type UserAvatarProps = {
  /** Fully-resolved image URL, or null/undefined when the user has none. */
  src?: string | null;
  /** Display name used to derive initials for the fallback. */
  name?: string | null;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
};

export const initialsOf = (name?: string | null): string => {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
};

const UserAvatar = ({ src, name, className = "", style, alt = "Profile" }: UserAvatarProps) => {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ objectFit: "cover", ...style }}
      />
    );
  }

  const initials = initialsOf(name);

  return (
    <span
      className={`d-inline-flex align-items-center justify-content-center bg-light text-gray-6 fw-medium ${className}`}
      style={style}
      role="img"
      aria-label={initials ? `${name} avatar` : "No profile picture"}
    >
      {initials || <i className="isax isax-user" aria-hidden="true" />}
    </span>
  );
};

export default UserAvatar;
