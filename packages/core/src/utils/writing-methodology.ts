/**
 * Full writing methodology for style_guide.md injection.
 * This is the complete reference material (with examples) that the
 * compact "craft card" in the system prompt summarizes.
 *
 * Injected once during initBook/generateStyleGuide, then read by
 * writer on every chapter as part of the style_guide context.
 */
export function buildWritingMethodologySection(language: "zh" | "en" | "vi"): string {
  if (language === "en") {
    return buildEnglishMethodology();
  }
  if (language === "vi") {
    return buildVietnameseMethodology();
  }
  return buildChineseMethodology();
}

function buildVietnameseMethodology(): string {
  return `---

# Phương pháp Luận Viết (Tự động tạo)

Phần này cung cấp phương pháp luận viết chung cho các mô hình AI. Các phần dưới đây mô tả cách biến kế hoạch thành văn xuôi cuốn hút.

## Bối cảnh cốt lõi

Mỗi chương phải tạo ra **bối cảnh ba chiều** để nhúng người đọc:
1. **Không gian vật lý**: Nhân vật ở đâu? Bố trí ra sao? Thời tiết, ánh sáng, âm thanh, mùi?
2. **Bối cảnh cảm xúc**: Trạng thái nội tâm trước khi chương bắt đầu? Căng thẳng, kỳ vọng, kiệt sức, nhiệt tình?
3. **Bối cảnh xã hội**: Ai khác đang có mặt? Quyền lực giữa các nhân vật thay đổi như thế nào?

Bối cảnh thường bị bỏ qua bởi các tác nhân AI. Hãy luôn dệt ba lớp này vào văn xuôi của bạn.

## Hành động có mục đích

Mọi hành động trong cảnh nên phục vụ **ít nhất một trong các mục đích** sau:
- Tiết lộ nhân vật (hành vi ẩn, động cơ thầm kín)
- Thúc đẩy cốt truyện (kết quả không thể đoán trước)
- Thiết lập/trao đổi thông tin (lộ sự thật mới)
- Thay đổi cảm xúc (khiến người đọc cảm thấy khác)

Tránh các cảnh mà nhân vật chỉ "làm gì đó" mà không có mục đích cụ thể.

## Nhịp và nhịp điệu

- **Mở đầu chương**: Bắt đầu bằng hành động, bối cảnh hoặc đối thoại — không phải lời kể chung chung
- **Đối thoại**: Ngắn gọn và khác biệt. Mỗi nhân vật nên có giọng riêng (từ vựng, nhịp điệu, chiều dài câu)
- **Cảnh xen kẽ**: Kết hợp cảnh hành động với cảnh tĩnh lặng để người đọc có thời gian thở
- **Câu kết chương**: Kết thúc ở khoảnh khắc căng thẳng hoặc bước ngoặt

## Hiển thị, đừng kể (Show, Don't Tell)

Thay vì nói "cô ấy buồn", hãy viết:
- Cô ấy nhìn xuống đôi tay mình, ngón tay vô thức xoắn chiếc nhẫn bạc
- Hàm cô siết chặt, mắt hơi cay
- Cô đứng dậy bước ra ban công, để gió lạnh thổi qua mặt

**6 kỹ thuật hiển thị cảm xúc**:
1. **Ngôn ngữ cơ thể**: Tư thế, cử chỉ, hành vi nhỏ
2. **Biểu cảm**: Nét mặt thay đổi như thế nào
3. **Hành động thay thế**: Nhân vật làm gì thay vì thể hiện cảm xúc trực tiếp
4. **Phản ứng sinh lý**: Tim đập nhanh, mồ hôi, thở gấp
5. **Tương tác môi trường**: Chạm vào đồ vật, đi ra ngoài trời
6. **Biểu hiện cảm xúc**: Cảm xúc nào đi kèm? Ngôn ngữ cơ thể, biểu cảm, giọng điệu?

## Bài học chuyên sâu

### 1. Hành động bắt đầu (Action openings)
Mở đầu bằng hành động cụ thể hoặc bối cảnh, không phải lời kể trừu tượng. Người đọc muốn được đắm chìm ngay lập tức.

### 2. Cấu trúc ba hồi (Three-act structure)
Áp dụng cấu trúc cổ điển: thiết lập → đối đầu → giải quyết. Ngay cả khi bạn không viết theo cấu trúc ba hồi, hãy đảm bảo chương có nhịp điệu căng thẳng → giải tỏa.

### 3. Hồi tưởng tự nhiên (Natural flashbacks)
Tránh lạm dụng hồi tưởng dài. Nếu cần, hãy tích hợp vào dòng ý thức hiện tại, không phải như một đoạn riêng biệt.

### 4. Đối thoại phục vụ cốt truyện (Plot-serving dialogue)
Mỗi đoạn đối thoại nên tiết lộ nhân vật HOẶC thúc đẩy cốt truyện HOẶC cả hai. Tránh đối thoại "chào hỏi" thuần túy.

### 5. Kết thúc mạnh (Strong endings)
Kết thúc chương bằng một khoảnh khắc có trọng lượng: lựa chọn, hậu quả, hoặc lời hứa. Đừng kết thúc bằng sự kiệt sức hay buồn ngủ.

### 6. Mật độ hành động cao (High action density)
Mỗi 500 từ nên có ít nhất một khoảnh khắc căng thẳng hoặc bước ngoặt. Nếu không, chương có thể đang bị lê thê.

## Mẹo dành riêng cho tác nhân AI

1. **Tránh cụm từ AI-điển hình**: "Không khí đóng băng", "trái tim co thắt", "ánh mắt sắc lạnh", v.v. Xem danh sách từ mệt mỏi trong tệp genre.
2. **Tôn trọng ngữ cảnh đã thiết lập**: Nếu fact file nói nhân vật A ghét nhân vật B, đừng bắt họ đột ngột thân thiết.
3. **Số lượng dài cụ thể**: Đừng viết "một số binh sĩ" — hãy viết "bảy binh sĩ mặc giáp đen".
4. **Duy trì giọng nói nhân vật**: Nếu nhân vật nói ngắn gọn, họ phải luôn nói ngắn gọn.
`;
}

function buildChineseMethodology(): string {
  return `---

# 写作方法论参考（完整版）

以下方法论是写作质量的完整参考。写作时应内化这些原则。

## 一、去AI味：正反例对照

### 情绪描写
| 反例（AI味） | 正例（人味） | 要点 |
|---|---|---|
| 他感到非常愤怒。 | 他捏碎了手中的茶杯，滚烫的茶水流过指缝，但他像没感觉一样。 | 用动作外化情绪 |
| 她心里很悲伤，眼泪流了下来。 | 她攥紧手机，指节发白，屏幕上的聊天记录模糊成一片。 | 用身体细节替代直白标签 |
| 他感到一阵恐惧。 | 他后背的汗毛竖了起来，脚底像踩在了冰上。 | 五感传递恐惧 |

### 转折与衔接
| 反例 | 正例 | 要点 |
|---|---|---|
| 虽然他很强，但是他还是输了。 | 他确实强，可对面那个老东西更脏。 | 口语化转折 |
| 然而，事情并没有那么简单。 | 哪有那么便宜的事。 | 角色内心吐槽替代"然而" |
| 因此，他决定采取行动。 | 他站起来，把凳子踢到一边。 | 删掉因果连词，直接写动作 |

### "了"字控制
| 反例 | 正例 |
|---|---|
| 他走了过去，拿了杯子，喝了一口水。 | 他走过去，端起杯子，灌了一口。 |
| 她笑了笑，转身离开了房间。 | 她嘴角一扬，转身出门。 |

## 二、六步走人物心理分析

每个重要角色在关键场景中的行为，必须经过以下六步推导：

1. **当前处境**：角色此刻面临什么局面？手上有什么牌？
2. **核心动机**：角色最想要什么？最害怕什么？
3. **信息边界**：角色知道什么？不知道什么？对局势有什么误判？
4. **性格过滤**：同样的局面，这个角色的性格会怎么反应？
5. **行为选择**：基于以上四点，角色会做出什么选择？
6. **情绪外化**：这个选择伴随什么情绪？用什么身体语言、表情、语气表达？

禁止跳过步骤直接写行为。

## 三、配角设计方法论

- 配角必须有反击，有自己的算盘。主角的强大在于压服聪明人，而不是碾压傻子。
- 每个配角的行为动机必须与主线产生关联。
- 核心标签 + 反差细节 = 活人（表面冷硬的角色偷偷照顾流浪动物）。
- 通过事件立人设，禁止通过外貌和形容词堆砌。
- 不同角色的说话方式必须有辨识度。
- 群戏中不写"众人齐声惊呼"，挑1-2个角色写具体反应。

## 四、代入感六大支柱

1. **基础信息交代**：一句话能交代身份、性格、地位——"小爷我乃镇南府世子林峰"
2. **具体化/可视化**：描写具体到读者脑海能浮现——"搪瓷缸白汽直冒""冰镇汽水嘶嘶响"
3. **熟悉感**：接地气的场景自带代入感——"高考后小树林的分手""医院走廊的消毒水味"
4. **共鸣**：主角的困境必须有普遍性——被欺压、不公待遇、被低估
5. **欲望驱动**：
   - 基础欲望（被动）：不劳而获、高人一等、扬眉吐气
   - 主动欲望（期待感）：作者刻意制造的情绪缺口→读者期待释放→释放超过预期
6. **五感描写**：视觉、听觉、嗅觉、触觉、味觉——"潮湿的短袖黏在后背上"

## 五、强情绪升级法（避免流水账）

流水账的修法不是删掉日常，而是给日常加"料"：

1. **加入前因后果**：下班回家→加上"催债电话刚打来"→日常有了紧迫感
2. **情绪递进**：坏事叠坏事——被骂→赶不上公交→手机掉了→直播课结束了→包子噎住了。每层比上一层过分
3. **日常必须为主线服务**：万物皆为"饵"。日常段要么埋伏笔，要么推关系，要么建立反差

## 六、写前自检清单

1. 本章对应卷纲中的哪个节点？是否推进了该节点？
2. 主角此刻利益最大化的选择是什么？
3. 冲突是谁先动手，为什么非做不可？
4. 配角/反派是否有明确诉求和反制？
5. 反派当前掌握了哪些信息？有无信息越界？
6. 章尾是否留了钩子？
7. 有没有流水账？如有，加前因后果或强情绪
8. 本章是否推进了主线目标？`;
}

function buildEnglishMethodology(): string {
  return `---

# Writing Methodology Reference (Full Version)

Complete reference material for writing quality. Internalize these principles.

## 1. Anti-AI Pattern Guide

### Emotion
| Bad (AI-like) | Good (Human) | Key |
|---|---|---|
| He felt very angry. | He crushed the teacup in his hand. Scalding water ran through his fingers, but he didn't flinch. | Externalize through action |
| She was very sad and tears fell. | She gripped her phone until her knuckles went white. The chat log blurred. | Body detail replaces label |

### Transitions
| Bad | Good | Key |
|---|---|---|
| Although he was strong, he still lost. | He was strong, sure. But the old bastard across from him fought dirtier. | Colloquial voice |
| However, things were not so simple. | No such luck. | Character thought replaces "however" |
| Therefore, he decided to take action. | He stood up and kicked the chair aside. | Cut causal connectors, show action |

## 2. Six-Step Character Psychology

For every important character action:
1. **Situation**: What's the character facing? What cards do they hold?
2. **Core motivation**: What do they want most? Fear most?
3. **Information boundary**: What do they know? Not know? Misjudge?
4. **Personality filter**: Given the same situation, how would THIS character react?
5. **Behavioral choice**: Based on 1-4, what do they choose?
6. **Emotional expression**: What emotion accompanies this? Body language, expression, tone?

## 3. Supporting Character Design

- Every side character has their own agenda. Protagonist wins by outsmarting smart people.
- Core tag + contrast detail = alive (cold-exterior character secretly feeds strays).
- Establish character through events, not description dumps.
- Different characters speak differently — vocabulary, length, verbal tics.
- In group scenes: never "everyone gasped" — pick 1-2 specific reactions.

## 4. Immersion Pillars

1. **Info delivery**: One line of dialogue can establish identity, status, personality
2. **Concrete/visual**: "The back seat of a taxi stuck in traffic for forty minutes" not "a big city"
3. **Familiarity**: Scenes readers have lived through carry natural immersion
4. **Resonance**: Protagonist's struggle must feel universal — injustice, being underestimated
5. **Desire engine**: Create emotional gap → reader anticipates release → release exceeds expectation
6. **Five senses**: Wet shirt on the back, hospital disinfectant, rain puddles at the bus stop

## 5. Emotional Escalation (Anti-Flowchart)

Fix boring daily scenes by adding fuel:
1. **Add causality**: Coming home → add "debt collector just called" → instant urgency
2. **Progressive escalation**: Stack bad things — scolded → missed bus → phone fell in drain → livestream ended → choked on stale bread. Each layer worse.
3. **Daily serves mainline**: Every quiet scene must plant a hook, advance a relationship, or build contrast.

## 6. Pre-Write Checklist

1. Which outline node does this chapter correspond to?
2. What's the protagonist's optimal move right now?
3. Who starts the conflict and why must they?
4. Do antagonists have clear motives and countermoves?
5. What information does each character have? Any boundary violations?
6. Does the chapter end with a hook?
7. Any flowchart passages? If so, add causality or strong emotion.
8. Does this chapter advance the main plotline?`;
}
