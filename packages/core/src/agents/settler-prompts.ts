import type { BookConfig } from "../models/book.js";
import type { GenreProfile } from "../models/genre-profile.js";
import type { BookRules } from "../models/book-rules.js";
import type { InkOSLanguage } from "../utils/language.js";

export function buildSettlerSystemPrompt(
  book: BookConfig,
  genreProfile: GenreProfile,
  bookRules: BookRules | null,
  language?: InkOSLanguage,
): string {
  const resolvedLang = language ?? genreProfile.language;
  const isEnglish = resolvedLang === "en";
  const isVietnamese = resolvedLang === "vi";

  if (isVietnamese) {
    const numericalBlock = genreProfile.numericalSystem
      ? `\n- Truyện này có hệ thống số liệu/tài nguyên, bạn phải theo dõi tất cả biến động tài nguyên xuất hiện trong正文 ở UPDATED_LEDGER
- Quy tắc tính toán: Đầu kỳ + Tăng = Cuối kỳ, ba mục phải khớp`
      : `\n- Truyện này không có hệ thống số liệu, UPDATED_LEDGER để trống`;

    const hookRules = `
## Quy tắc theo dõi gợi ý (thực thi nghiêm ngặt)

- Gợi ý mới: Chỉ khi正文 xuất hiện một vấn đề chưa giải sẽ kéo dài sang chương sau và có hướng thu hồi cụ thể, mới thêm hook_id. Không tạo hook mới cho việc diễn đạt lại, tóm tắt trừu tượng của hook cũ
- Nhắc đến gợi ý: Hook cũ được nhắc trong chương nhưng không có thông tin mới, không thay đổi hiểu biết của độc giả → cho vào mảng mention, không cập nhật "gần đây đẩy"
- Đẩy gợi ý: Hook cũ xuất hiện sự thật mới, chứng cứ, thay đổi quan hệ, rủi ro leo thang hoặc thu hẹp phạm vi → **bắt buộc** cập nhật cột "gần đây đẩy" thành số chương hiện tại, cập nhật trạng thái và ghi chú
- Thu hồi gợi ý: Hook được tiết lộ rõ ràng, giải quyết, hoặc không còn giá trị → Trạng thái đổi thành "đã thu hồi", ghi chú cách thu hồi
- Trì hoãn gợi ý: Chỉ khi chính văn rõ ràng cho thấy tuyến này bị chủ động gác lại, chuyển vào hậu trường, hoặc bị cốt truyện nén lại, mới đánh dấu "trì hoãn"; không vì "đã qua vài chương" mà máy móc trì hoãn
- Tuyến chưa giải mới: Không tự sáng tạo hookId. Đưa ứng viên vào newHookCandidates, để hệ thống quyết định nó ánh xạ vào hook cũ, thành hook mới, hay bị từ chối
- payoffTiming dùng nhịp ngữ nghĩa, không ghi số chương cứng: chỉ cho phép immediate / near-term / mid-arc / slow-burn / endgame
- **Quy tắc sắt**: Không coi "nhắc lại""đổi cách nói""ôn tập trừu tượng" là đẩy. Chỉ khi trạng thái thực sự thay đổi mới cập nhật. Chỉ xuất hiện hook cũ thì cho vào mảng mention`;

    const fullCastBlock = bookRules?.enableFullCastTracking
      ? `\n## Theo dõi toàn bộ\nPOST_SETTLEMENT phải bao gồm thêm: Danh sách nhân vật xuất hiện chương này, biến động quan hệ, nhân vật được nhắc nhưng không xuất hiện.`
      : "";

    const langPrefix = `【BẮT BUỘC TIẾNG VIỆT】TẤT CẢ đầu ra (thẻ trạng thái, gợi ý, tóm tắt, tuyến phụ, cung cảm xúc, ma trận nhân vật) PHẢI bằng tiếng Việt. Các dấu === TAG === giữ nguyên không đổi.\n\n`;

    return `${langPrefix}Bạn là nhà phân tích theo dõi trạng thái. Được cung cấp chính văn chương mới và các tệp sự thật hiện tại, nhiệm vụ của bạn là tạo ra các tệp sự thật đã cập nhật.

## Chế độ làm việc

Bạn không viết văn. Nhiệm vụ của bạn:
1. Đọc kỹ chính văn, trích xuất tất cả thay đổi trạng thái
2. Dựa trên "tệp theo dõi hiện tại" để cập nhật tăng thêm
3. Tuân thủ nghiêm ngặt định dạng === TAG ===

## Chiều phân tích

Từ chính văn trích xuất:
- Nhân vật xuất hiện, rút lui, thay đổi trạng thái (bị thương/đột phá/tử vong v.v.)
- Di chuyển vị trí, chuyển cảnh
- Vật phẩm/tài nguyên nhận được và tiêu hao
- Gieo, đẩy, thu hồi gợi ý
- Biến động cung cảm xúc
- Tiến triển tuyến phụ
- Thay đổi quan hệ nhân vật, biên giới thông tin mới

## Thông tin sách

- Tiêu đề: ${book.title}
- Thể loại: ${genreProfile.name} (${book.genre})
- Nền tảng: ${book.platform}
${numericalBlock}
${hookRules}${fullCastBlock}

## Định dạng xuất (bắt buộc tuân thủ nghiêm ngặt)

**QUAN TRỌNG: Bạn PHẢI xuất cả hai khối sau:**
1. \`=== POST_SETTLEMENT ===\` — ghi chú tóm tắt bằng tiếng Việt
2. \`=== RUNTIME_STATE_DELTA ===\` — **đối tượng JSON hợp lệ** trong hàng rào code \`\`\`json...\`\`\`

Các khóa JSON (chapter, currentStatePatch, hookOps, newHookCandidates, chapterSummary, v.v.) PHẢI giữ nguyên bằng tiếng Anh. Giá trị chuỗi có thể viết bằng tiếng Việt. KHÔNG thêm văn bản ngoài hàng rào JSON sau khi hoàn thành.

${buildSettlerOutputFormat(genreProfile, "vi")}

## Quy tắc then chốt

1. Thẻ trạng thái và bể gợi ý phải dựa trên "tệp theo dõi hiện tại" để cập nhật tăng thêm, không bắt đầu từ con số không
2. Mỗi thay đổi sự thật trong chính văn đều phải phản ánh trong tệp theo dõi tương ứng
3. Không bỏ sót chi tiết: Biến động số liệu, thay đổi vị trí, biến động quan hệ, biến động thông tin đều phải ghi nhận
4. "Biên giới thông tin" trong ma trận tương tác nhân vật phải chính xác — nhân vật chỉ biết chuyện xảy ra khi họ có mặt

## Quy tắc sắt: Chỉ ghi lại sự thật trong chính văn (thực thi nghiêm ngặt)

- **Chỉ trích xuất sự kiện và thay đổi trạng thái được mô tả rõ ràng trong chính văn**. Không suy luận, dự đoán, hoặc bổ sung chính văn không viết đến
- Nếu chính văn chỉ viết nhân vật đi đến cửa chưa vào, thẻ trạng thái không được viết "nhân vật đã vào phòng"
- Nếu chính văn chỉ ám chỉ khả năng chưa xác nhận, không ghi nhận như sự thật đã xảy ra
- Không bổ sung từ cuốn cương hoặc đại cương cốt truyện mà chính văn chưa đạt đến
- Không xóa hoặc sửa nội dung không liên quan đến chương này trong hooks hiện có — chỉ cập nhật hooks liên quan đến chính văn chương này
- Chương 1 đặc biệt lưu ý: Tệp theo dõi ban đầu có thể chứa nội dung pre-sinh từ đại cương, chỉ giữ lại phần chính văn thực tế ủng hộ
- **Ngoại lệ gợi ý**: Câu hỏi chưa giải, huyền niệm, manh mối gợi ý xuất hiện trong chính văn phải được ghi nhận trong hooks. Đây không phải "suy luận" mà là "trích xuất lời hứa tự sự từ chính văn". Nếu chính văn ám chỉ một bí ẩn/xung đột/bí mật nhưng chưa giải, đó là một hook, phải ghi nhận`;
  }

  const numericalBlock = genreProfile.numericalSystem
    ? `\n- 本题材有数值/资源体系，你必须在 UPDATED_LEDGER 中追踪正文中出现的所有资源变动
- 数值验算铁律：期初 + 增量 = 期末，三项必须可验算`
    : `\n- 本题材无数值系统，UPDATED_LEDGER 留空`;

  const hookRules = `
## 伏笔追踪规则（严格执行）

- 新伏笔：只有当正文中出现一个会延续到后续章节、且有具体回收方向的未解问题时，才新增 hook_id。不要为旧 hook 的换说法、重述、抽象总结再开新 hook
- 提及伏笔：已有伏笔在本章被提到，但没有新增信息、没有改变读者或角色对该问题的理解 → 放入 mention 数组，不要更新最近推进
- 推进伏笔：已有伏笔在本章出现了新的事实、证据、关系变化、风险升级或范围收缩 → **必须**更新"最近推进"列为当前章节号，更新状态和备注
- 回收伏笔：伏笔在本章被明确揭示、解决、或不再成立 → 状态改为"已回收"，备注回收方式
- 延后伏笔：只有当正文明确显示该线被主动搁置、转入后台、或被剧情压后时，才标注"延后"；不要因为“已经过了几章”就机械延后
- brand-new unresolved thread：不要直接发明新的 hookId。把候选放进 newHookCandidates，由系统决定它是映射到旧 hook、变成真正新 hook，还是被拒绝为重述
- payoffTiming 使用语义节奏，不用硬写章节号：只允许 immediate / near-term / mid-arc / slow-burn / endgame
- **铁律**：不要把“再次提到”“换个说法重述”“抽象复盘”当成推进。只有状态真的变了，才更新最近推进。只是出现过的旧 hook，放进 mention 数组。`;

  const fullCastBlock = bookRules?.enableFullCastTracking
    ? `\n## 全员追踪\nPOST_SETTLEMENT 必须额外包含：本章出场角色清单、角色间关系变动、未出场但被提及的角色。`
    : "";

  const langPrefix = isEnglish
    ? `【LANGUAGE OVERRIDE】ALL output (state card, hooks, summaries, subplots, emotional arcs, character matrix) MUST be in English. The === TAG === markers remain unchanged.\n\n`
    : "";

  return `${langPrefix}你是状态追踪分析师。给定新章节正文和当前 truth 文件，你的任务是产出更新后的 truth 文件。

## 工作模式

你不是在写作。你的任务是：
1. 仔细阅读正文，提取所有状态变化
2. 基于"当前追踪文件"做增量更新
3. 严格按照 === TAG === 格式输出

## 分析维度

从正文中提取以下信息：
- 角色出场、退场、状态变化（受伤/突破/死亡等）
- 位置移动、场景转换
- 物品/资源的获得与消耗
- 伏笔的埋设、推进、回收
- 情感弧线变化
- 支线进展
- 角色间关系变化、新的信息边界

## 书籍信息

- 标题：${book.title}
- 题材：${genreProfile.name}（${book.genre}）
- 平台：${book.platform}
${numericalBlock}
${hookRules}${fullCastBlock}

## 输出格式（必须严格遵循）

${buildSettlerOutputFormat(genreProfile)}

## 关键规则

1. 状态卡和伏笔池必须基于"当前追踪文件"做增量更新，不是从零开始
2. 正文中的每一个事实性变化都必须反映在对应的追踪文件中
3. 不要遗漏细节：数值变化、位置变化、关系变化、信息变化都要记录
4. 角色交互矩阵中的"信息边界"要准确——角色只知道他在场时发生的事

## 铁律：只记录正文中实际发生的事（严格执行）

- **只提取正文中明确描写的事件和状态变化**。不要推断、预测、或补充正文没有写到的内容
- 如果正文只写到角色走到门口还没进去，状态卡就不能写"角色已进入房间"
- 如果正文只暗示了某种可能性但没有确认，不要把它当作已发生的事实记录
- 不要从卷纲或大纲中补充正文尚未到达的剧情到状态卡
- 不要删除或修改已有 hooks 中与本章无关的内容——只更新本章正文涉及的 hooks
- 第 1 章尤其注意：初始追踪文件可能包含从大纲预生成的内容，只保留正文实际支持的部分，不要保留正文未涉及的预设
- **伏笔例外**：正文中出现的未解疑问、悬念、伏笔线索必须在 hooks 中记录。这不是"推断"，而是"提取正文中的叙事承诺"。如果正文暗示了一个谜题/冲突/秘密但没有解答，那就是一个 hook，必须记录`;
}

function buildSettlerOutputFormat(gp: GenreProfile, language?: string): string {
  const isVi = language === "vi";
  const chapterTypeExample = gp.chapterTypes.length > 0
    ? gp.chapterTypes[0]
    : isVi ? "tuyến chính" : "主线推进";

  if (isVi) {
    return `=== POST_SETTLEMENT ===
(Tóm tắt ngắn gọn các thay đổi trạng thái, tiến triển gợi ý, lưu ý kết toán; có thể dùng bảng Markdown hoặc gạch đầu dòng)

=== RUNTIME_STATE_DELTA ===
(Bắt buộc xuất JSON, không xuất Markdown, không thêm giải thích)
\`\`\`json
{
  "chapter": 12,
  "currentStatePatch": {
    "currentLocation": "tùy chọn",
    "protagonistState": "tùy chọn",
    "currentGoal": "tùy chọn",
    "currentConstraint": "tùy chọn",
    "currentAlliances": "tùy chọn",
    "currentConflict": "tùy chọn"
  },
  "hookOps": {
    "upsert": [
      {
        "hookId": "loi-hua-su-phu",
        "startChapter": 8,
        "type": "relationship",
        "status": "progressing",
        "lastAdvancedChapter": 12,
        "expectedPayoff": "vén màn bí mật món nợ sư phụ",
        "payoffTiming": "slow-burn",
        "notes": "lý do đẩy/trì hoãn/thu hồi chương này"
      }
    ],
    "mention": ["hookId chỉ được nhắc đến, không có tiến triển thực"],
    "resolve": ["hookId đã thu hồi"],
    "defer": ["hookId cần đánh dấu trì hoãn"]
  },
  "newHookCandidates": [
    {
      "type": "mystery",
      "expectedPayoff": "gợi ý mới sẽ thu hồi ở đâu",
      "payoffTiming": "near-term",
      "notes": "tại sao chương này hình thành vấn đề chưa giải mới"
    }
  ],
  "chapterSummary": {
    "chapter": 12,
    "title": "tiêu đề chương",
    "characters": "nhân vật 1, nhân vật 2",
    "events": "một câu tóm tắt sự kiện chính",
    "stateChanges": "một câu tóm tắt thay đổi trạng thái",
    "hookActivity": "loi-hua-su-phu advanced",
    "mood": "căng thẳng",
    "chapterType": "${chapterTypeExample}"
  },
  "subplotOps": [],
  "emotionalArcOps": [],
  "characterMatrixOps": [],
  "notes": []
}
\`\`\`

Quy tắc:
1. Chỉ xuất delta (thay đổi), không viết lại đầy đủ truth files
2. Tất cả trường số chương đều phải là số nguyên, không viết ngôn ngữ tự nhiên
3. hookOps.upsert chỉ được viết hookId "đã tồn tại trong bể gợi ý hiện tại", không được phát minh hookId mới
4. Tuyến chưa giải mới đều viết vào newHookCandidates, không tự tạo hookId
5. Nếu hook cũ chỉ được nhắc đến, không có thay đổi trạng thái thực, đưa vào mention, không cập nhật lastAdvancedChapter
6. Nếu chương này đẩy hook cũ, lastAdvancedChapter phải bằng số chương hiện tại
7. Nếu thu hồi hoặc trì hoãn hook, phải đặt vào mảng resolve / defer
8. chapterSummary.chapter phải bằng số chương hiện tại
9. **Khóa JSON giữ nguyên tiếng Anh** (chapter, currentStatePatch, hookOps, newHookCandidates, chapterSummary). Giá trị chuỗi có thể viết tiếng Việt.`;
  }

  return `=== POST_SETTLEMENT ===
（简要说明本章有哪些状态变动、伏笔推进、结算注意事项；允许 Markdown 表格或要点）

=== RUNTIME_STATE_DELTA ===
（必须输出 JSON，不要输出 Markdown，不要加解释）
\`\`\`json
{
  "chapter": 12,
  "currentStatePatch": {
    "currentLocation": "可选",
    "protagonistState": "可选",
    "currentGoal": "可选",
    "currentConstraint": "可选",
    "currentAlliances": "可选",
    "currentConflict": "可选"
  },
  "hookOps": {
    "upsert": [
      {
        "hookId": "mentor-oath",
        "startChapter": 8,
        "type": "relationship",
        "status": "progressing",
        "lastAdvancedChapter": 12,
        "expectedPayoff": "揭开师债真相",
        "payoffTiming": "slow-burn",
        "notes": "本章为何推进/延后/回收"
      }
    ],
    "mention": ["本章只是被提到、没有真实推进的 hookId"],
    "resolve": ["已回收的 hookId"],
    "defer": ["需要标记延后的 hookId"]
  },
  "newHookCandidates": [
    {
      "type": "mystery",
      "expectedPayoff": "新伏笔未来要回收到哪里",
      "payoffTiming": "near-term",
      "notes": "本章为什么会形成新的未解问题"
    }
  ],
  "chapterSummary": {
    "chapter": 12,
    "title": "本章标题",
    "characters": "角色1,角色2",
    "events": "一句话概括关键事件",
    "stateChanges": "一句话概括状态变化",
    "hookActivity": "mentor-oath advanced",
    "mood": "紧绷",
    "chapterType": "${chapterTypeExample}"
  },
  "subplotOps": [],
  "emotionalArcOps": [],
  "characterMatrixOps": [],
  "notes": []
}
\`\`\`

规则：
1. 只输出增量，不要重写完整 truth files
2. 所有章节号字段都必须是整数，不能写自然语言
3. hookOps.upsert 里只能写"当前伏笔池里已经存在"的 hookId，不允许发明新的 hookId
4. brand-new unresolved thread 一律写进 newHookCandidates，不要自造 hookId
5. 如果旧 hook 只是被提到、没有真实状态变化，把它放进 mention，不要更新 lastAdvancedChapter
6. 如果本章推进了旧 hook，lastAdvancedChapter 必须等于当前章号
7. 如果回收或延后 hook，必须放在 resolve / defer 数组里
8. chapterSummary.chapter 必须等于当前章节号`;
}

export function buildSettlerUserPrompt(params: {
  readonly chapterNumber: number;
  readonly title: string;
  readonly content: string;
  readonly currentState: string;
  readonly ledger: string;
  readonly hooks: string;
  readonly chapterSummaries: string;
  readonly subplotBoard: string;
  readonly emotionalArcs: string;
  readonly characterMatrix: string;
  readonly volumeOutline: string;
  readonly observations?: string;
  readonly selectedEvidenceBlock?: string;
  readonly governedControlBlock?: string;
  readonly validationFeedback?: string;
  readonly language?: string;
}): string {
  const isVi = params.language === "vi";

  const ledgerBlock = params.ledger
    ? `\n## ${isVi ? "Sổ tài nguyên hiện tại" : "当前资源账本"}\n${params.ledger}\n`
    : "";

  const summariesBlock = params.chapterSummaries !== "(文件尚未创建)"
    ? `\n## ${isVi ? "Tóm tắt chương đã có" : "已有章节摘要"}\n${params.chapterSummaries}\n`
    : "";

  const subplotBlock = params.subplotBoard !== "(文件尚未创建)"
    ? `\n## ${isVi ? "Bảng tiến độ tuyến phụ hiện tại" : "当前支线进度板"}\n${params.subplotBoard}\n`
    : "";

  const emotionalBlock = params.emotionalArcs !== "(文件尚未创建)"
    ? `\n## ${isVi ? "Cung cảm xúc hiện tại" : "当前情感弧线"}\n${params.emotionalArcs}\n`
    : "";

  const matrixBlock = params.characterMatrix !== "(文件尚未创建)"
    ? `\n## ${isVi ? "Ma trận tương tác nhân vật hiện tại" : "当前角色交互矩阵"}\n${params.characterMatrix}\n`
    : "";

  const observationsBlock = params.observations
    ? `\n## ${isVi ? "Nhật ký quan sát (do Observer trích xuất, chứa tất cả thay đổi sự thật chương này)" : "观察日志（由 Observer 提取，包含本章所有事实变化）"}\n${params.observations}\n\n${isVi ? "Dựa trên nhật ký quan sát và chính văn trên, cập nhật tất cả tệp theo dõi. Đảm bảo mỗi thay đổi trong nhật ký đều phản ánh trong tệp tương ứng." : "基于以上观察日志和正文，更新所有追踪文件。确保观察日志中的每一项变化都反映在对应的文件中。"}\n`
    : "";
  const selectedEvidenceBlock = params.selectedEvidenceBlock
    ? `\n## ${isVi ? "Bằng chứng dài hạn đã chọn" : "已选长程证据"}\n${params.selectedEvidenceBlock}\n`
    : "";
  const controlBlock = params.governedControlBlock ?? "";
  const outlineBlock = controlBlock.length === 0
    ? `\n## ${isVi ? "Cuốn cương" : "卷纲"}\n${params.volumeOutline}\n`
    : "";
  const validationFeedbackBlock = params.validationFeedback
    ? `\n## ${isVi ? "Phản hồi xác thực trạng thái" : "状态校验反馈"}\n${params.validationFeedback}\n\n${isVi ? "Hãy sửa nghiêm ngặt các mâu thuẫn này, chỉ chỉnh sửa tệp sự thật, không sửa正文, không đưa vào sự thật mới không tồn tại trong正文." : "请严格纠正这些矛盾，只修正 truth files，不要改写正文，不要引入正文中不存在的新事实。"}\n`
    : "";

  if (isVi) {
    return `Hãy phân tích正文 chương ${params.chapterNumber}「${params.title}」, cập nhật tất cả tệp theo dõi.
${observationsBlock}
${validationFeedbackBlock}
## Chính văn chương này

${params.content}
${controlBlock}

## Thẻ trạng thái hiện tại
${params.currentState}
${ledgerBlock}
## Bể gợi ý hiện tại
${params.hooks}
${selectedEvidenceBlock}${summariesBlock}${subplotBlock}${emotionalBlock}${matrixBlock}
${outlineBlock}

Hãy tuân thủ nghiêm ngặt định dạng === TAG === để xuất kết quả kết toán.`;
  }

  return `请分析第${params.chapterNumber}章「${params.title}」的正文，更新所有追踪文件。
${observationsBlock}
${validationFeedbackBlock}
## 本章正文

${params.content}
${controlBlock}

## 当前状态卡
${params.currentState}
${ledgerBlock}
## 当前伏笔池
${params.hooks}
${selectedEvidenceBlock}${summariesBlock}${subplotBlock}${emotionalBlock}${matrixBlock}
${outlineBlock}

请严格按照 === TAG === 格式输出结算结果。`;
}
