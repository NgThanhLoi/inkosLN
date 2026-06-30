import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { useChatStore } from "../../store/chat";
import { fetchJson } from "../../hooks/use-api";
import { SidebarCard } from "./SidebarCard";
import type { TFunction } from "../../hooks/use-i18n";

const FOUNDATION_FILES: ReadonlyArray<{ file: string; labelKey: string }> = [
  { file: "story_bible.md", labelKey: "foundation.storyBible" },
  { file: "volume_outline.md", labelKey: "foundation.volumeOutline" },
  { file: "book_rules.md", labelKey: "foundation.bookRules" },
  { file: "current_state.md", labelKey: "foundation.currentState" },
  { file: "pending_hooks.md", labelKey: "foundation.pendingHooks" },
  { file: "subplot_board.md", labelKey: "foundation.subplotBoard" },
  { file: "emotional_arcs.md", labelKey: "foundation.emotionalArcs" },
  { file: "character_matrix.md", labelKey: "foundation.characterMatrix" },
];

interface TruthFileInfo {
  name: string;
  size: number;
}

interface FoundationSectionProps {
  readonly bookId: string;
  readonly t: TFunction;
}

export function FoundationSection({ bookId, t }: FoundationSectionProps) {
  const [files, setFiles] = useState<ReadonlyArray<TruthFileInfo>>([]);
  const openArtifact = useChatStore((s) => s.openArtifact);
  const bookDataVersion = useChatStore((s) => s.bookDataVersion);

  useEffect(() => {
    fetchJson<{ files: TruthFileInfo[] }>(`/books/${bookId}/truth`)
      .then((data) => setFiles(data.files))
      .catch(() => setFiles([]));
  }, [bookId, bookDataVersion]);

  const available = FOUNDATION_FILES.filter((f) =>
    files.some((tf) => tf.name === f.file),
  );

  if (available.length === 0) return null;

  return (
    <SidebarCard title={t("foundation.title")}>
      <ul className="space-y-1">
        {available.map((item) => (
          <li key={item.file}>
            <button
              onClick={() => openArtifact(item.file)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors font-['SimSun','Songti_SC','STSong',serif]"
            >
              <FileText size={14} className="shrink-0 text-muted-foreground/60" />
              <span className="truncate">{t(item.labelKey)}</span>
            </button>
          </li>
        ))}
      </ul>
    </SidebarCard>
  );
}
