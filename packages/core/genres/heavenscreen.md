---
name: Thiên Mạc Bàn Điểm
id: heavenscreen
language: vi
chapterTypes: ["Giới thiệu màn trời", "Chiếu video", "Phản ứng đa thế giới", "Bàn điểm xếp hạng", "Hậu quả sau video", "Cliffhanger giới thiệu"]
fatigueWords: ["màn trời xuất hiện", "không gian rạn nứt", "dòng chữ vàng kim", "hít sâu", "mọi người đều nhìn lên", "nàng nhìn về phía màn trời", "hắn cau mày", "bầu trời tối sầm", "tiếng xì xào vang lên", "ánh mắt trầm xuống", "không ai nói gì", "hắn khẽ cười", "nàng cảm thấy lạnh sống lưng", "một cảm giác khó tả", "dòng chữ hiện lên", "màn hình bỗng nhiên", "bỗng nhiên", "đột nhiên", "không thể nào", "thật đáng sợ", "mọi người chấn kinh"]
numericalSystem: false
powerScaling: true
eraResearch: false
pacingRule: "Mỗi chương phải có một phân đoạn màn trời rõ ràng và một cụm phản ứng có hệ quả. Với bàn điểm/xếp hạng, video hoặc hạng mục được chia đoạn rồi phản ứng từng lớp. Phản ứng nên chiếm khoảng 35-50% chương và phải tạo thay đổi nhận thức, quan hệ, kế hoạch hoặc dư luận. Nếu cần viết thiên mạc livestream tuyến truyện không ranking/quiz, dùng genre riêng heavenscreen-livestream."
satisfactionTypes: ["Bí mật quá khứ được hé lộ", "Khoảnh khắc cảm động gây nghẹn ngào", "Nhân vật nhận ra sự thật về chính mình", "Top đầu bàn điểm gây tranh cãi", "Kẻ thù bị phanh phui hành vi", "Mối quan hệ giữa các thế giới tiến triển", "Dự đoán tương lai được xác nhận hoặc bị nghi ngờ", "Nhân vật phụ bất ngờ tỏa sáng", "Hiểu lầm chéo thế giới gây hài", "Đồng vị thể/cùng tên/cùng giọng khiến nhân vật rối loạn", "Thế giới gốc học được công nghệ hoặc sức mạnh mới từ màn trời"]
auditDimensions: [1,2,3,4,6,7,9,10,11,12,13,14,15,16,18,19,21,22,23,24,25,26]
---

## Đặc trưng thể loại

Thiên Mạc Bàn Điểm (Heavenly Screen / Inventory / Watch Party) là thể loại trong đó một màn trời, phòng chiếu hoặc group chat chiếu nội dung kiểm kê, xếp hạng, phanh phui bí mật hoặc tổng hợp khoảnh khắc cho nhiều nhân vật hoặc nhiều thế giới cùng xem. Sức hấp dẫn không nằm ở một MC truyền thống, mà nằm ở **nội dung được chiếu**, **phản ứng đa thế giới**, **hiểu lầm theo hệ quy chiếu riêng**, và **hệ quả sau khi thông tin bị phơi bày**.

Các tag gần thể loại: `天幕`, `盘点`, `观影体`, `剧透`, `综漫观影`.

Phạm vi chính:

- **ranking_countdown / 盘点流**: màn trời xếp hạng, kiểm kê, top 10, top 5, phanh phui bí mật, tổng hợp khoảnh khắc.
- **watch_party / 观影体**: một nhóm hoặc nhiều thế giới xem video/cảnh/hồi tưởng đã được chọn theo chủ đề, rồi phản ứng và chịu hệ quả.

Nếu cần viết **livestream tuyến truyện / 万界直播** nơi màn trời chiếu một target work/world theo dòng canon tuyến tính, dùng genre riêng `heavenscreen-livestream` thay vì subtype trong file này.

## Subtype: ranking_countdown / 盘点流


Áp dụng khi chương xoay quanh một bảng xếp hạng hoặc chủ đề kiểm kê.

Core loop:

1. Màn trời công bố chủ đề/hạng mục.
2. Nhân vật dự đoán trước khi chiếu.
3. Video chiếu một phần bằng hình ảnh, lời thoại, hành động cụ thể.
4. Người liên quan trực tiếp phản ứng trước.
5. Các phe khác phân tích, phủ nhận, tranh cãi, lợi dụng thông tin.
6. Màn trời hé lộ thêm hạng mục hoặc chi tiết đảo chiều.
7. Cuối chương công bố hạng tiếp theo hoặc cắt đúng lúc bí mật vỡ ra.

Quy tắc:

- Mỗi video chỉ nên có 3-7 hạng mục nếu viết một arc ngắn.
- Không liệt kê toàn bộ bảng xếp hạng ngay từ đầu.
- Hạng mục phải có lý do rõ, không chỉ gắn nhãn “Hạng 3” rồi cho nhân vật sốc.
- Nếu video là fan-made, thần bình hoặc dự đoán tương lai, phải ghi rõ trong giọng màn trời hoặc phản ứng.

## Ghi chú về livestream tuyến truyện

Không dùng file `heavenscreen.md` cho truyện kiểu màn trời phát tuyến truyện/cutscene/canon của một target work/world theo dòng thời gian. Dùng `heavenscreen-livestream` để tránh lẫn bảng xếp hạng, quiz, player/system hoặc gameplay observation.

Mẫu nhịp chương watch-party/bàn điểm:

```md
# Chương X: [Một phản ứng/câu thoại gây hook]

## Mở màn
- Nhắc hệ quả chương trước hoặc trạng thái người xem.
- Màn trời tiếp tục video, hạng mục hoặc chủ đề đang bàn điểm.

## Screen Segment 1
- Chiếu cảnh cụ thể: nhân vật, địa điểm, lời thoại, chiến đấu, hồi tưởng hoặc bằng chứng.
- Không tóm tắt khô; phải có hình ảnh và chuyển động.

## Reaction Cluster 1
- Một thế giới hiểu cảnh theo hệ quy chiếu của mình.
- Một nhân vật quyền lực hoặc trí tuệ đưa ra suy luận.
- Một phản ứng hài/cá nhân hóa để giảm tải.

## Screen Segment 2
- Video/hạng mục tiếp tục mở thêm chi tiết: nhân vật mới, bí mật mới, bằng chứng mới, đảo chiều mới hoặc chủ đề kế tiếp.

## Reaction Cluster 2
- Cross-IP resonance: cùng mặt/cùng tên/cùng năng lực/cùng thần cách.
- Có người bị truyền cảm hứng, có người thấy nguy cơ, có người sinh hiểu lầm.

## Aftereffect
- Ít nhất một nhân vật/thế giới thay đổi kế hoạch, nhận thức hoặc quan hệ.

## Hook cuối
- Màn trời công bố hạng mục/cảnh kế tiếp, hoặc cắt đúng lúc bí mật gây sốc.
```

## Điều cấm kỵ của thể loại

- Video quá dài không có phản ứng.
- Phản ứng giống nhau giữa các nhân vật hoặc các thế giới.
- Dùng file này cho livestream tuyến truyện dài trong khi book cần `heavenscreen-livestream`.
- Chỉ viết reaction mà không cho màn trời/cốt truyện được chiếu tiến lên.
- Sa vào thao tác gameplay vụn vặt, player/streamer/chat thật, UI game hoặc hệ thống nhiệm vụ nếu book không yêu cầu.
- Truyện phải có một MC trung tâm được tôn vinh mọi lúc. Thiên Mạc mạnh khi nhiều góc nhìn cùng soi một sự kiện.
- Tiết lộ quá nhiều bí mật trong một chương khiến tuyến dài hết chất khai thác.
- Bỏ qua hệ quả cảm xúc/hành động sau video.
- Thiên mạc bị nhân vật khống chế, phá hủy hoặc tấn công quá dễ.
- Nhân vật thế giới A tự nhiên hiểu thuật ngữ, tổ chức, sức mạnh của thế giới B nếu chưa được giải thích.
- Dùng meme/tiếng lóng hiện đại cho nhân vật không thuộc bối cảnh hiện đại.
- Mọi nhân vật chỉ nói “không thể nào”, “thật mạnh”, “đáng sợ quá” mà không có chức năng phản ứng riêng.

## Quy tắc hệ thống màn trời

- Màn trời phải có nguyên tắc hoạt động nhất quán: chiếu video, livestream, chat, phần thưởng, bình luận hoặc subtitle theo cùng một logic.
- Thiên mạc không can thiệp trực tiếp vào thế giới trừ khi profile/arc đã thiết lập rõ cái giá.
- Nếu có chủ màn trời/người dẫn, không để người đó lộ diện quá sớm hoặc giải quyết mọi xung đột.
- Nếu cần player/streamer hoặc tuyến truyện livestream, chuyển sang genre `heavenscreen-livestream` và để book rules quyết định mức xuất hiện.
- Nội dung chiếu phải gắn với nguồn/canon/RIS. Không bịa hậu trường, lời tác giả, dev note hoặc quote như thật khi không có nguồn.
- Fan-made, commentary, speculative và canon phải được phân biệt trong giọng dẫn hoặc reaction.

## Quy tắc phản ứng đa thế giới

Mỗi reaction chính cần có chức năng rõ:

- **Phủ nhận**: không tin màn trời, cho rằng đó là ảo thuật, huyết quỷ thuật, đế cụ, chú thuật, ma pháp.
- **Quy chiếu thế giới mình**: so sánh công nghệ/sức mạnh với thần, ma pháp, võ học, quân đội, tôn giáo hoặc lịch sử của mình.
- **Phân tích**: suy luận cơ chế, điểm yếu, hậu quả chính trị/quân sự/khoa học.
- **Cảm xúc cá nhân**: đồng cảm, đau lòng, xấu hổ, ghen, rung động, ngưỡng mộ.
- **Sợ bị lộ**: nhân vật có bí mật lo rằng màn trời sẽ chiếu đến mình.
- **Muốn hành động**: học công nghệ, chuẩn bị phòng thủ, tìm người, thay đổi tương lai, chất vấn đồng minh.
- **Lợi dụng thông tin**: kẻ thù hoặc phe thứ ba dùng video để chia rẽ, đe dọa, thao túng dư luận.
- **Gag/hiểu lầm**: phản ứng hài dựa trên tính cách và bối cảnh, không biến tất cả thành trò hề.

Trong cùng một cụm phản ứng, không để hai nhân vật giữ cùng một chức năng nếu không có khác biệt rõ về giọng điệu hoặc lập trường.

## Phân tầng phản ứng

Khi một sự kiện/nhân vật được chiếu:

1. Người liên quan trực tiếp hoặc đồng vị thể/cùng tên/cùng mặt.
2. Người thân, đồng minh, kẻ thù, cấp trên hoặc phe có lợi ích liên quan.
3. Nhân vật trí tuệ/quyền lực có khả năng phân tích hậu quả lớn.
4. Đám đông hoặc nhân vật phụ tạo dư luận, không lấn át trọng tâm.
5. Màn trời/người dẫn chỉ chốt nhịp, chuyển cảnh hoặc tung hook.

Không để đám đông phản ứng dài trước khi người liên quan trực tiếp có cơ hội thể hiện.

## Hướng dẫn nhịp độ

- Mỗi chương phải có ít nhất một video, hạng mục hoặc phân đoạn bàn điểm rõ ràng.
- Video nên chia thành 2-4 segment; sau mỗi segment quan trọng cần có reaction cluster.
- Với ranking_countdown, tỷ lệ gợi ý: mở 10%, video 35%, reaction 40%, aftermath/hook 15%.
- Với livestream tuyến truyện, dùng genre `heavenscreen-livestream`.
- Cao trào cảm xúc cách nhau 3-5 video/segment lớn; không chương nào cũng phải bi kịch.
- Mỗi 5-8 chương nên có thay đổi đáng kể trong một tuyến dài: quan hệ, dư luận, nghi vấn về màn trời, tham vọng học công nghệ/sức mạnh, hoặc sợ hãi bị lộ.

## Quy tắc canon và nguồn

- Không bịa chi tiết canon cụ thể khi không chắc.
- Nếu không chắc lời thoại nguyên tác, viết theo tinh thần cảnh gốc, không đóng giả quote chính xác.
- Video fan-made/commentary/speculative không được trình bày như canon thật.
- Nếu muốn dùng hậu trường/lời tác giả/dev note, phải có nguồn trong RIS.
- Khi lược bớt nguyên tác, ưu tiên giữ đúng cảm xúc, quan hệ nhân vật và hậu quả sự kiện hơn là nhồi đủ thông tin.

## Checklist trước khi kết chương

- [ ] Đã xác định đây là bàn điểm/watch-party, không phải livestream tuyến truyện cần `heavenscreen-livestream` chưa?
- [ ] Có ít nhất 1-3 thế giới phản ứng theo hệ quy chiếu riêng không?
- [ ] Có cross-IP resonance hoặc hiểu lầm đáng nhớ không?
- [ ] Mỗi cụm reaction có chức năng khác nhau không?
- [ ] Người liên quan trực tiếp/đồng vị thể đã phản ứng trước đám đông chưa?
- [ ] Có hệ quả sau video: nhận thức, quan hệ, kế hoạch, dư luận hoặc tham vọng mới không?
- [ ] Có tránh bịa canon, hậu trường, quote hoặc nguồn chưa chắc không?
- [ ] Có cliffhanger kéo được chương sau không?
