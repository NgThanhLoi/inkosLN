import { useApi } from "./use-api";

type Lang = "zh" | "en" | "vi";

type I18nString = { zh: string; en: string; vi?: string };

const strings: Record<string, I18nString> = {
  // Header
  "nav.books": { zh: "书籍", en: "Books" , vi: "Sách" },
  "nav.newBook": { zh: "新建书籍", en: "New Book" , vi: "Sách mới" },
  "nav.config": { zh: "模型配置", en: "Model Config" , vi: "Cấu hình mô hình" },
  "nav.connected": { zh: "已连接", en: "Connected" , vi: "Đã kết nối" },
  "nav.disconnected": { zh: "未连接", en: "Disconnected" , vi: "Mất kết nối" },

  // Dashboard
  "dash.title": { zh: "书籍列表", en: "Books" , vi: "Danh sách sách" },
  "dash.noBooks": { zh: "还没有书", en: "No books yet" , vi: "Chưa có sách" },
  "dash.createFirst": { zh: "创建第一本书开始写作", en: "Create your first book to get started" , vi: "Tạo cuốn sách đầu tiên để bắt đầu" },
  "dash.writeNext": { zh: "写下一章", en: "Write Next" , vi: "Viết chương tiếp theo" },
  "dash.writing": { zh: "写作中...", en: "Writing..." , vi: "Đang viết..." },
  "dash.stats": { zh: "统计", en: "Stats" , vi: "Thống kê" },
  "dash.chapters": { zh: "章", en: "chapters" , vi: "chương" },
  "dash.recentEvents": { zh: "最近事件", en: "Recent Events" , vi: "Sự kiện gần đây" },
  "dash.writingProgress": { zh: "写作进度", en: "Writing Progress" , vi: "Tiến độ viết" },

  // Book Detail
  "book.writeNext": { zh: "写下一章", en: "Write Next" , vi: "Viết chương tiếp theo" },
  "book.draftOnly": { zh: "仅草稿", en: "Draft Only" , vi: "Chỉ bản thảo" },
  "book.approveAll": { zh: "全部通过", en: "Approve All" , vi: "Phê duyệt tất cả" },
  "book.analytics": { zh: "数据分析", en: "Analytics" , vi: "Phân tích dữ liệu" },
  "book.noChapters": { zh: "暂无章节，点击「写下一章」开始", en: 'No chapters yet. Click "Write Next" to start.' , vi: "Chưa có chương nào. Nhấp \"Viết tiếp\" để bắt đầu." },
  "book.approve": { zh: "通过", en: "Approve" , vi: "Phê duyệt" },
  "book.reject": { zh: "驳回", en: "Reject" , vi: "Từ chối" },
  "book.words": { zh: "字", en: "words" , vi: "từ" },

  // Chapter Reader
  "reader.backToList": { zh: "返回列表", en: "Back to List" , vi: "Quay lại danh sách" },
  "reader.approve": { zh: "通过", en: "Approve" , vi: "Phê duyệt" },
  "reader.reject": { zh: "驳回", en: "Reject" , vi: "Từ chối" },
  "reader.chapterList": { zh: "章节列表", en: "Chapter List" , vi: "Danh sách chương" },
  "reader.characters": { zh: "字符", en: "characters" , vi: "ký tự" },
  "reader.edit": { zh: "编辑", en: "Edit" , vi: "Sửa" },
  "reader.preview": { zh: "预览", en: "Preview" , vi: "Xem trước" },

  // Book Create
  "create.title": { zh: "创建书籍", en: "Create Book" , vi: "Tạo sách" },
  "create.bookTitle": { zh: "书名", en: "Title" , vi: "Tiêu đề" },
  "create.language": { zh: "语言", en: "Language" , vi: "Ngôn ngữ" },
  "create.genre": { zh: "题材", en: "Genre" , vi: "Thể loại" },
  "create.wordsPerChapter": { zh: "每章字数", en: "Words / Chapter" , vi: "Số từ / chương" },
  "create.targetChapters": { zh: "目标章数", en: "Target Chapters" , vi: "Số chương mục tiêu" },
  "create.creating": { zh: "创建中...", en: "Creating..." , vi: "Đang tạo..." },
  "create.submit": { zh: "创建书籍", en: "Create Book" , vi: "Tạo sách" },
  "create.titleRequired": { zh: "请输入书名", en: "Title is required" , vi: "Vui lòng nhập tiêu đề" },
  "create.genreRequired": { zh: "请选择题材", en: "Genre is required" , vi: "Vui lòng chọn thể loại" },
  "create.placeholder": { zh: "请输入书名...", en: "Book title..." , vi: "Tiêu đề sách..." },

  // Analytics
  "analytics.title": { zh: "数据分析", en: "Analytics" , vi: "Phân tích dữ liệu" },
  "analytics.totalChapters": { zh: "总章数", en: "Total Chapters" , vi: "Tổng số chương" },
  "analytics.totalWords": { zh: "总字数", en: "Total Words" , vi: "Tổng số từ" },
  "analytics.avgWords": { zh: "平均字数/章", en: "Avg Words/Chapter" , vi: "Số từ TB/chương" },
  "analytics.statusDist": { zh: "状态分布", en: "Status Distribution" , vi: "Phân bố trạng thái" },

  // Breadcrumb
  "bread.books": { zh: "书籍", en: "Books" , vi: "Sách" },
  "bread.newBook": { zh: "新建书籍", en: "New Book" , vi: "Sách mới" },
  "bread.config": { zh: "配置", en: "Config" , vi: "Cấu hình" },
  "bread.home": { zh: "首页", en: "Home" , vi: "Trang chủ" },
  "bread.chapter": { zh: "第{n}章", en: "Chapter {n}" },

  // Config
  "config.title": { zh: "项目配置", en: "Project Config" , vi: "Cấu hình dự án" },
  "config.project": { zh: "项目名", en: "Project" , vi: "Dự án" },
  "config.language": { zh: "语言", en: "Language" , vi: "Ngôn ngữ" },
  "config.provider": { zh: "提供方", en: "Provider" , vi: "Nhà cung cấp" },
  "config.model": { zh: "模型", en: "Model" , vi: "Mô hình" },
  "config.editHint": { zh: "通过 CLI 编辑配置：", en: "Edit via CLI:" , vi: "Chỉnh sửa qua CLI:" },

  // Sidebar
  "nav.system": { zh: "系统", en: "System" , vi: "Hệ thống" },
  "nav.daemon": { zh: "守护进程", en: "Daemon" , vi: "Trình nền" },
  "nav.logs": { zh: "日志", en: "Logs" , vi: "Nhật ký" },
  "nav.running": { zh: "运行中", en: "Running" , vi: "Đang chạy" },
  "nav.agentOnline": { zh: "代理在线", en: "Agent Online" , vi: "Tác nhân trực tuyến" },
  "nav.agentOffline": { zh: "代理离线", en: "Agent Offline" , vi: "Tác nhân ngoại tuyến" },
  "nav.tools": { zh: "工具", en: "Tools" , vi: "Công cụ" },
  "nav.chat": { zh: "普通聊天", en: "Chat" , vi: "Trò chuyện" },
  "nav.style": { zh: "文风", en: "Style" , vi: "Phong cách" },
  "nav.import": { zh: "导入", en: "Import" , vi: "Nhập" },
  "nav.radar": { zh: "市场雷达", en: "Radar" , vi: "Radar thị trường" },
  "nav.doctor": { zh: "环境诊断", en: "Doctor" , vi: "Chẩn đoán môi trường" },

  // Book Detail extras
  "book.deleteBook": { zh: "删除书籍", en: "Delete Book" , vi: "Xóa sách" },
  "book.confirmDelete": { zh: "确认删除此书及所有章节？", en: "Delete this book and all chapters?" , vi: "Xóa cuốn sách này và tất cả các chương?" },
  "book.settings": { zh: "书籍设置", en: "Book Settings" , vi: "Cài đặt sách" },
  "book.status": { zh: "状态", en: "Status" , vi: "Trạng thái" },
  "book.drafting": { zh: "草稿中...", en: "Drafting..." , vi: "Đang soạn thảo..." },
  "book.pipelineWriting": { zh: "后台正在写作，本页会在完成后自动刷新。", en: "Background writing is running. This page will refresh automatically when it finishes." , vi: "Đang viết ở chế độ nền. Trang này sẽ tự làm mới khi hoàn tất." },
  "book.pipelineDrafting": { zh: "后台正在生成草稿，本页会在完成后自动刷新。", en: "Background drafting is running. This page will refresh automatically when it finishes." , vi: "Đang tạo bản thảo ở chế độ nền. Trang này sẽ tự làm mới khi hoàn tất." },
  "book.pipelineFailed": { zh: "后台任务失败", en: "Background job failed" , vi: "Tác vụ nền thất bại" },
  "book.save": { zh: "保存", en: "Save" , vi: "Lưu" },
  "book.saving": { zh: "保存中...", en: "Saving..." , vi: "Đang lưu..." },
  "book.rewrite": { zh: "重写", en: "Rewrite" , vi: "Viết lại" },
  "book.audit": { zh: "审计", en: "Audit" , vi: "Kiểm tra" },
  "book.export": { zh: "导出", en: "Export" , vi: "Xuất" },
  "book.approvedOnly": { zh: "仅已通过", en: "Approved Only" , vi: "Chỉ đã phê duyệt" },
  "book.manuscriptTitle": { zh: "章节标题", en: "Manuscript Title" , vi: "Tiêu đề chương" },
  "book.curate": { zh: "操作", en: "Actions" , vi: "Thao tác" },
  "book.spotFix": { zh: "精修", en: "Spot Fix" , vi: "Sửa nhanh" },
  "book.polish": { zh: "打磨", en: "Polish" , vi: "Đánh bóng" },
  "book.rework": { zh: "重作", en: "Rework" , vi: "Làm lại" },
  "book.antiDetect": { zh: "反检测", en: "Anti-Detect" , vi: "Chống phát hiện" },
  "book.statusActive": { zh: "进行中", en: "Active" , vi: "Đang hoạt động" },
  "book.statusPaused": { zh: "已暂停", en: "Paused" , vi: "Đã tạm dừng" },
  "book.statusOutlining": { zh: "大纲中", en: "Outlining" , vi: "Đang phác thảo" },
  "book.statusCompleted": { zh: "已完成", en: "Completed" , vi: "Đã hoàn thành" },
  "book.statusDropped": { zh: "已放弃", en: "Dropped" , vi: "Đã bỏ" },
  "book.truthFiles": { zh: "真相文件", en: "Truth Files" , vi: "Tệp sự thật" },

  // Style
  "style.title": { zh: "文风分析", en: "Style Analyzer" , vi: "Phân tích phong cách" },
  "style.sourceName": { zh: "来源名称", en: "Source Name" , vi: "Tên nguồn" },
  "style.sourceExample": { zh: "如：参考小说", en: "e.g. Reference Novel" , vi: "vd: Tiểu thuyết tham khảo" },
  "style.textSample": { zh: "文本样本", en: "Text Sample" , vi: "Mẫu văn bản" },
  "style.pasteHint": { zh: "粘贴参考文本进行文风分析...", en: "Paste reference text for style analysis..." , vi: "Dán văn bản tham khảo để phân tích phong cách..." },
  "style.analyze": { zh: "分析", en: "Analyze" , vi: "Phân tích" },
  "style.analyzing": { zh: "分析中...", en: "Analyzing..." , vi: "Đang phân tích..." },
  "style.results": { zh: "分析结果", en: "Analysis Results" , vi: "Kết quả phân tích" },
  "style.avgSentence": { zh: "平均句长", en: "Avg Sentence Length" , vi: "Độ dài câu TB" },
  "style.vocabDiversity": { zh: "词汇多样性", en: "Vocabulary Diversity" , vi: "Đa dạng từ vựng" },
  "style.avgParagraph": { zh: "平均段落长度", en: "Avg Paragraph Length" , vi: "Độ dài đoạn TB" },
  "style.sentenceStdDev": { zh: "句长标准差", en: "Sentence StdDev" , vi: "Độ lệch chuẩn câu" },
  "style.topPatterns": { zh: "主要模式", en: "Top Patterns" , vi: "Mẫu chính" },
  "style.rhetoricalFeatures": { zh: "修辞特征", en: "Rhetorical Features" , vi: "Đặc điểm tu từ" },
  "style.importToBook": { zh: "导入到书籍", en: "Import to Book" , vi: "Nhập vào sách" },
  "style.selectBook": { zh: "选择书籍...", en: "Select book..." , vi: "Chọn sách..." },
  "style.importGuide": { zh: "导入文风指南", en: "Import Style Guide" , vi: "Nhập hướng dẫn phong cách" },
  "style.emptyHint": { zh: "粘贴文本并点击分析查看文风档案", en: "Paste text and click Analyze to see style profile" , vi: "Dán văn bản và nhấp phân tích để xem hồ sơ phong cách" },

  // Import
  "import.title": { zh: "导入工具", en: "Import Tools" , vi: "Công cụ nhập" },
  "import.chapters": { zh: "导入章节", en: "Import Chapters" , vi: "Nhập chương" },
  "import.canon": { zh: "导入母本", en: "Import Canon" , vi: "Nhập nguyên tác" },
  "import.fanfic": { zh: "同人创作", en: "Fanfic" , vi: "Đồng nhân" },
  "import.selectTarget": { zh: "选择目标书籍...", en: "Select target book..." , vi: "Chọn sách đích..." },
  "import.splitRegex": { zh: "分割正则（可选）", en: "Split regex (optional)" , vi: "Biểu thức tách (tùy chọn)" },
  "import.pasteChapters": { zh: "粘贴章节文本...", en: "Paste chapter text..." , vi: "Dán văn bản chương..." },
  "import.selectSource": { zh: "选择源（母本）...", en: "Select source (parent)..." , vi: "Chọn nguồn (nguyên tác)..." },
  "import.selectDerivative": { zh: "选择目标（衍生）...", en: "Select target (derivative)..." , vi: "Chọn đích (phái sinh)..." },
  "import.fanficTitle": { zh: "同人小说标题", en: "Fanfic title" , vi: "Tiêu đề đồng nhân" },
  "import.pasteMaterial": { zh: "粘贴原作文本/设定/角色资料...", en: "Paste source material..." , vi: "Dán văn bản/cài đặt/hồ sơ nhân vật gốc..." },
  "import.importing": { zh: "导入中...", en: "Importing..." , vi: "Đang nhập..." },
  "import.creating": { zh: "创建中...", en: "Creating..." , vi: "Đang tạo..." },

  // Radar
  "radar.title": { zh: "市场雷达", en: "Market Radar" , vi: "Radar thị trường" },
  "radar.scan": { zh: "扫描市场", en: "Scan Market" , vi: "Quét thị trường" },
  "radar.scanning": { zh: "扫描中...", en: "Scanning..." , vi: "Đang quét..." },
  "radar.summary": { zh: "市场概要", en: "Market Summary" , vi: "Tóm tắt thị trường" },
  "radar.emptyHint": { zh: "点击「扫描市场」分析当前趋势和机会", en: "Click \"Scan Market\" to analyze trends and opportunities" , vi: "Nhấp \"Quét thị trường\" để phân tích xu hướng và cơ hội" },
  "radar.history": { zh: "扫描历史", en: "Scan History" , vi: "Lịch sử quét" },

  // Doctor
  "doctor.title": { zh: "环境诊断", en: "Environment Check" , vi: "Kiểm tra môi trường" },
  "doctor.recheck": { zh: "重新检查", en: "Re-check" , vi: "Kiểm tra lại" },
  "doctor.inkosJson": { zh: "inkos.json 配置", en: "inkos.json configuration" , vi: "Cấu hình inkos.json" },
  "doctor.projectEnv": { zh: "项目 .env 文件", en: "Project .env file" , vi: "Tệp .env dự án" },
  "doctor.globalEnv": { zh: "全局 ~/.inkos/.env", en: "Global ~/.inkos/.env" , vi: "Toàn cục ~/.inkos/.env" },
  "doctor.booksDir": { zh: "书籍目录", en: "Books directory" , vi: "Thư mục sách" },
  "doctor.llmApi": { zh: "LLM API 连接", en: "LLM API connectivity" , vi: "Kết nối LLM API" },
  "doctor.connected": { zh: "已连接", en: "Connected" , vi: "Đã kết nối" },
  "doctor.failed": { zh: "失败", en: "Failed" , vi: "Thất bại" },
  "doctor.allPassed": { zh: "所有检查通过 — 环境健康", en: "All checks passed — environment is healthy" , vi: "Tất cả kiểm tra đã qua — môi trường khỏe mạnh" },
  "doctor.someFailed": { zh: "部分检查失败 — 请查看配置", en: "Some checks failed — review configuration" , vi: "Một số kiểm tra thất bại — xem lại cấu hình" },

  // Genre extras
  "genre.createNew": { zh: "创建新题材", en: "Create New Genre" , vi: "Tạo thể loại mới" },
  "genre.name": { zh: "名称", en: "Name" , vi: "Tên" },
  "genre.editGenre": { zh: "编辑", en: "Edit" , vi: "Sửa" },
  "genre.deleteGenre": { zh: "删除", en: "Delete" , vi: "Xóa thể loại" },
  "genre.confirmDelete": { zh: "确认删除此题材？", en: "Delete this genre?" , vi: "Xóa thể loại này?" },
  "genre.chapterTypes": { zh: "章节类型", en: "Chapter Types" , vi: "Loại chương" },
  "genre.fatigueWords": { zh: "疲劳词", en: "Fatigue Words" , vi: "Từ mệt mỏi" },
  "genre.numericalSystem": { zh: "数值系统", en: "Numerical System" , vi: "Hệ thống số" },
  "genre.powerScaling": { zh: "力量等级", en: "Power Scaling" , vi: "Cấp độ sức mạnh" },
  "genre.eraResearch": { zh: "时代研究", en: "Era Research" , vi: "Nghiên cứu thời đại" },
  "genre.pacingRule": { zh: "节奏规则", en: "Pacing Rule" , vi: "Quy tắc nhịp độ" },
  "genre.rules": { zh: "规则", en: "Rules" , vi: "Quy tắc" },
  "genre.saveChanges": { zh: "保存更改", en: "Save Changes" , vi: "Lưu thay đổi" },
  "genre.cancel": { zh: "取消", en: "Cancel" , vi: "Hủy" },
  "genre.copyToProject": { zh: "复制到项目", en: "Copy to Project" , vi: "Sao chép vào dự án" },
  "genre.selectHint": { zh: "选择题材查看详情", en: "Select a genre to view details" , vi: "Chọn thể loại để xem chi tiết" },
  "genre.commaSeparated": { zh: "逗号分隔", en: "comma-separated" , vi: "phân tách bằng dấu phẩy" },
  "genre.rulesMd": { zh: "规则（Markdown）", en: "Rules (Markdown)" , vi: "Quy tắc (Markdown)" },

  // Config extras
  "config.modelRouting": { zh: "模型路由", en: "Model Routing" , vi: "Định tuyến mô hình" },
  "config.agent": { zh: "代理", en: "Agent" , vi: "Tác nhân" },
  "config.baseUrl": { zh: "基础 URL", en: "Base URL" , vi: "URL cơ sở" },
  "config.default": { zh: "默认", en: "default" , vi: "mặc định" },
  "config.optional": { zh: "可选", en: "optional" , vi: "tùy chọn" },
  "config.saveOverrides": { zh: "保存路由", en: "Save Overrides" , vi: "Lưu định tuyến" },
  "config.save": { zh: "保存", en: "Save" , vi: "Lưu" },
  "config.saving": { zh: "保存中...", en: "Saving..." , vi: "Đang lưu..." },
  "config.cancel": { zh: "取消", en: "Cancel" , vi: "Hủy" },
  "config.edit": { zh: "编辑", en: "Edit" , vi: "Sửa" },
  "config.enabled": { zh: "启用", en: "Enabled" , vi: "Bật" },
  "config.disabled": { zh: "禁用", en: "Disabled" , vi: "Tắt" },

  // Truth Files extras
  "truth.title": { zh: "真相文件", en: "Truth Files" , vi: "Tệp sự thật" },
  "truth.edit": { zh: "编辑", en: "Edit" , vi: "Sửa" },
  "truth.chars": { zh: "字", en: "chars" , vi: "ký tự" },
  "truth.save": { zh: "保存", en: "Save" , vi: "Lưu" },
  "truth.saving": { zh: "保存中...", en: "Saving..." , vi: "Đang lưu..." },
  "truth.cancel": { zh: "取消", en: "Cancel" , vi: "Hủy" },
  "truth.empty": { zh: "暂无文件", en: "No truth files" , vi: "Chưa có tệp" },
  "truth.noFiles": { zh: "暂无文件", en: "No truth files" , vi: "Chưa có tệp" },
  "truth.notFound": { zh: "文件未找到", en: "File not found" , vi: "Không tìm thấy tệp" },
  "truth.selectFile": { zh: "选择文件查看内容", en: "Select a file to view" , vi: "Chọn tệp để xem" },
  "truth.selectHint": { zh: "选择文件查看内容", en: "Select a file to view" , vi: "Chọn tệp để xem" },

  // Dashboard
  "dash.subtitle": { zh: "管理你的文学宇宙和 AI 辅助草稿。", en: "Manage your literary universe and AI-assisted drafts." , vi: "Quản lý vũ trụ văn học và bản thảo được AI hỗ trợ." },

  // Chapter Reader extras
  "reader.openingManuscript": { zh: "打开书稿中...", en: "Opening manuscript..." , vi: "Đang mở bản thảo..." },
  "reader.manuscriptPage": { zh: "书稿页", en: "Manuscript Page" , vi: "Trang bản thảo" },
  "reader.minRead": { zh: "分钟阅读", en: "min read" , vi: "phút đọc" },
  "reader.endOfChapter": { zh: "本章完", en: "End of Chapter" , vi: "Hết chương" },

  // Daemon Control
  "daemon.title": { zh: "守护进程控制", en: "Daemon Control" , vi: "Điều khiển trình nền" },
  "daemon.running": { zh: "运行中", en: "Running" , vi: "Đang chạy" },
  "daemon.stopped": { zh: "已停止", en: "Stopped" , vi: "Đã dừng" },
  "daemon.start": { zh: "启动", en: "Start" , vi: "Khởi động" },
  "daemon.stop": { zh: "停止", en: "Stop" , vi: "Dừng" },
  "daemon.starting": { zh: "启动中...", en: "Starting..." , vi: "Đang khởi động..." },
  "daemon.stopping": { zh: "停止中...", en: "Stopping..." , vi: "Đang dừng..." },
  "daemon.waitingEvents": { zh: "等待事件...", en: "Waiting for events..." , vi: "Đang chờ sự kiện..." },
  "daemon.startHint": { zh: "启动守护进程查看事件", en: "Start the daemon to see events" , vi: "Khởi động trình nền để xem sự kiện" },
  "daemon.eventLog": { zh: "事件日志", en: "Event Log" , vi: "Nhật ký sự kiện" },

  // Config extras (labels)
  "config.temperature": { zh: "温度", en: "Temperature" , vi: "Nhiệt độ" },
  "config.maxTokens": { zh: "最大令牌数", en: "Max Tokens" , vi: "Số token tối đa" },
  "config.stream": { zh: "流式输出", en: "Stream" , vi: "Luồng" },
  "config.chinese": { zh: "中文", en: "Chinese" , vi: "Tiếng Trung" },
  "config.english": { zh: "英文", en: "English" , vi: "Tiếng Anh" },

  // BookCreate extras
  "create.platform": { zh: "平台", en: "Platform" , vi: "Nền tảng" },

  // Common
  "common.save": { zh: "保存", en: "Save" , vi: "Lưu" },
  "common.cancel": { zh: "取消", en: "Cancel" , vi: "Hủy" },
  "common.delete": { zh: "删除", en: "Delete" , vi: "Xóa" },
  "common.edit": { zh: "编辑", en: "Edit" , vi: "Sửa" },
  "common.error": { zh: "错误", en: "Error" , vi: "Lỗi" },
  "common.loading": { zh: "加载中...", en: "Loading..." , vi: "Đang tải..." },
  "common.refresh": { zh: "刷新", en: "Refresh" , vi: "Làm mới" },
  "common.enterCommand": { zh: "输入指令...", en: "Enter command..." , vi: "Nhập lệnh..." },
  "chapter.readyForReview": { zh: "待审核", en: "Ready for Review" , vi: "Sẵn sàng để xem xét" },
  "chapter.approved": { zh: "已通过", en: "Approved" , vi: "Đã phê duyệt" },
  "chapter.drafted": { zh: "草稿", en: "Drafted" , vi: "Đã thảo" },
  "chapter.needsRevision": { zh: "需修订", en: "Needs Revision" , vi: "Cần sửa lại" },
  "chapter.imported": { zh: "已导入", en: "Imported" , vi: "Đã nhập" },
  "chapter.auditFailed": { zh: "审计失败", en: "Audit Failed" , vi: "Kiểm tra thất bại" },
  "chapter.label": { zh: "第{n}章", en: "Chapter {n}" },
  "common.exportSuccess": { zh: "已导出到项目目录", en: "Exported to project directory" , vi: "Đã xuất vào thư mục dự án" },
  "common.exportFormat": { zh: "导出格式", en: "Export format" , vi: "Định dạng xuất" },
  "logs.title": { zh: "日志", en: "Logs" , vi: "Nhật ký" },
  "logs.empty": { zh: "暂无日志", en: "No log entries yet" , vi: "Chưa có mục nhật ký" },
  "logs.showingRecent": { zh: "当前展示最近日志记录。", en: "Showing recent log entries." , vi: "Đang hiển thị các mục nhật ký gần đây." },
} as const;

export type StringKey = keyof typeof strings;
export type TFunction = (key: StringKey) => string;

export function useI18n() {
  const { data } = useApi<{ language: string }>("/project");
  const lang: Lang = data?.language === "en" ? "en" : data?.language === "vi" ? "vi" : "zh";

  function t(key: StringKey): string {
    const entry = strings[key];
    if (lang === "vi" && entry.vi) return entry.vi;
    return entry[lang];
  }

  return { t, lang };
}
