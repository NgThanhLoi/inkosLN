import {
  Zap,
  Search,
  FileOutput,
  TrendingUp,
} from "lucide-react";
import type { TFunction } from "../../hooks/use-i18n";

export interface QuickActionsProps {
  readonly onAction: (command: string) => void;
  readonly disabled: boolean;
  readonly t: TFunction;
  readonly lang: "zh" | "en" | "vi";
}

interface ChipDef {
  readonly icon: React.ReactNode;
  readonly labelKey: string;
  readonly commandKey: string;
  // English fallback commands: the action text needs to be valid Chinese
  // when `lang === "zh"` and English-style when not. Commands map via
  // explicit language keys so we don't rely on the i18n templates (the
  // command strings are not user-facing labels but actionable input).
  readonly commandByLang: Readonly<Record<"zh" | "en" | "vi", string>>;
}

const CHIPS: ReadonlyArray<ChipDef> = [
  {
    icon: <Zap size={12} />,
    labelKey: "quickActions.writeNextLabel",
    commandKey: "quickActions.writeNextCommand",
    commandByLang: { zh: "写下一章", en: "write next", vi: "viết chương tiếp theo" },
  },
  {
    icon: <Search size={12} />,
    labelKey: "quickActions.auditLabel",
    commandKey: "quickActions.auditCommand",
    commandByLang: { zh: "审计", en: "audit", vi: "kiểm tra chương hiện tại" },
  },
  {
    icon: <FileOutput size={12} />,
    labelKey: "quickActions.exportLabel",
    commandKey: "quickActions.exportCommand",
    commandByLang: { zh: "导出全书", en: "export book", vi: "xuất bản thảo hiện tại" },
  },
  {
    icon: <TrendingUp size={12} />,
    labelKey: "quickActions.radarLabel",
    commandKey: "quickActions.radarCommand",
    commandByLang: { zh: "扫描市场趋势", en: "scan market trends", vi: "quét radar thị trường" },
  },
];

export function QuickActions({ onAction, disabled, t, lang }: QuickActionsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-1 py-1">
      {CHIPS.map((chip) => {
        const label = t(chip.labelKey);
        const command = chip.commandByLang[lang];
        return (
          <button
            key={label}
            onClick={() => onAction(command)}
            disabled={disabled}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/30 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all disabled:opacity-40 disabled:pointer-events-none group"
          >
            <span className="group-hover:scale-110 transition-transform">{chip.icon}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}