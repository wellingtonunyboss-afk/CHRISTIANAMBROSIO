"use client";

type AppearTextProps = {
  text?: string;
  className?: string;
};

export default function AppearText({ text = "TECNOLOGIA QUE VENDE", className }: AppearTextProps) {
  const rows = Array.from({ length: 5 }, (_, row) => row);
  const words = Array.from({ length: 5 }, (_, word) => word);

  return (
    <div className={className}>
      <div className="appear-text-grid" aria-label={text}>
        {rows.map((row) => (
          <div className="appear-text-row" key={row}>
            {words.map((word) => (
              <span className={row === 2 && word === 2 ? "is-main" : ""} key={word}>
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
