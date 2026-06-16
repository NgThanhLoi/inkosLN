import { useState } from "react";

type SupportedLang = "zh" | "en" | "vi";

export function LanguageSelector({ onSelect }: { onSelect: (lang: SupportedLang) => void }) {
  const [hovering, setHovering] = useState<SupportedLang | null>(null);
  const [selected, setSelected] = useState<SupportedLang | null>(null);

  const handleSelect = (lang: SupportedLang) => {
    setSelected(lang);
    // Brief pause for the selection animation before transitioning
    setTimeout(() => onSelect(lang), 400);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
      {/* Logo — cinematic scale */}
      <div className="mb-16 text-center">
        <div className="flex items-baseline justify-center gap-1.5 mb-4">
          <span className="font-serif text-6xl italic text-primary">Ink</span>
          <span className="text-5xl font-semibold tracking-tight text-foreground">OS</span>
        </div>
        <div className="text-base text-muted-foreground tracking-widest uppercase">Studio</div>
      </div>

      {/* Language cards — generous, distinct, immersive */}
      <div className="flex flex-wrap justify-center gap-8 mb-16">
        <button
          onClick={() => handleSelect("zh")}
          onMouseEnter={() => setHovering("zh")}
          onMouseLeave={() => setHovering(null)}
          className={`group w-72 border rounded-lg p-10 text-left transition-all duration-300 ${
            selected === "zh"
              ? "border-primary bg-primary/10 scale-[1.02]"
              : hovering === "zh"
                ? "border-primary/50 bg-card"
                : "border-border bg-card/50"
          }`}
        >
          <div className="font-serif text-3xl mb-4 text-foreground">中文创作</div>
          <div className="text-base text-foreground/70 leading-relaxed mb-6">
            玄幻 · 仙侠 · 都市 · 恐怖 · 通用
          </div>
          <div className="text-sm text-muted-foreground">
            番茄小说 · 起点中文网 · 飞卢
          </div>
        </button>

        <button
          onClick={() => handleSelect("en")}
          onMouseEnter={() => setHovering("en")}
          onMouseLeave={() => setHovering(null)}
          className={`group w-72 border rounded-lg p-10 text-left transition-all duration-300 ${
            selected === "en"
              ? "border-primary bg-primary/10 scale-[1.02]"
              : hovering === "en"
                ? "border-primary/50 bg-card"
                : "border-border bg-card/50"
          }`}
        >
          <div className="font-serif text-3xl italic mb-4 text-foreground">English Writing</div>
          <div className="text-base text-foreground/70 leading-relaxed mb-6">
            LitRPG · Progression · Romantasy · Sci-Fi · Isekai
          </div>
          <div className="text-sm text-muted-foreground">
            Royal Road · Kindle Unlimited · Scribble Hub
          </div>
        </button>

        <button
          onClick={() => handleSelect("vi")}
          onMouseEnter={() => setHovering("vi")}
          onMouseLeave={() => setHovering(null)}
          className={`group w-72 border rounded-lg p-10 text-left transition-all duration-300 ${
            selected === "vi"
              ? "border-primary bg-primary/10 scale-[1.02]"
              : hovering === "vi"
                ? "border-primary/50 bg-card"
                : "border-border bg-card/50"
          }`}
        >
          <div className="font-serif text-3xl mb-4 text-foreground">Tiếng Việt</div>
          <div className="text-base text-foreground/70 leading-relaxed mb-6">
            Tiên hiệp · Đô thị · Huyền huyễn · Ngôn tình · Tổng hợp
          </div>
          <div className="text-sm text-muted-foreground">
            Hako · Tangthuvien · Truyenfull
          </div>
        </button>
      </div>

      <div className="text-sm text-muted-foreground">
        可在设置中更改 · Can be changed in Settings · Có thể thay đổi trong Cài đặt
      </div>
    </div>
  );
}
