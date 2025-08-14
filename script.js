// CÁCH NÀY LÀ KHÔNG AN TOÀN VÌ LÀM LỘ API KEY CỦA BẠN.
// Chỉ dùng để thử nghiệm.

// Thay thế "YOUR_API_KEY_HERE" bằng API key bạn vừa copy.
const GEMINI_API_KEY = "AizaSyBQF_QNBE4MVghEHLHhtfuzxWAPBSzRvLU";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// Biến toàn cục để lưu trữ dữ liệu
let currentPassageData = null;

// Hàm chính để tạo bài đọc và câu hỏi mới
async function generateNewContent() {
    // Hiển thị trạng thái đang tải
    document.getElementById('passage-container').innerHTML = '<p>Đang tạo bài đọc mới, vui lòng chờ...</p>';
    document.getElementById('question-text').innerHTML = '';
    document.getElementById('user-answer').value = '';
    document.getElementById('feedback-section').style.display = 'none';

    // Lời nhắc (prompt) cho Gemini
    const promptText = `
        Tạo một bài đọc IELTS Academic Reading Passage 9 đoạn văn về một chủ đề bất kỳ, kèm theo 1 câu hỏi dạng True/False/Not Given và đáp án. Đáp án phải chứa câu trong bài đọc có chứa thông tin đó. Trả lời dưới dạng JSON, ví dụ:
        {
          "title": "Tiêu đề của bài đọc",
          "passage": "Đoạn văn 1. Đoạn văn 2.",
          "question": "Câu hỏi T/F/NG",
          "answer": "Đáp án (True/False/Not Given)",
          "correctSentences": ["Câu chứa đáp án trong bài đọc"]
        }
    `;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: promptText,
                    }],
                }],
            }),
        });

        if (!response.ok) {
            throw new Error(`API response error: ${response.statusText}`);
        }

        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text;
        
        // Gemini có thể trả về một chuỗi JSON hoặc một đoạn văn bản.
        // Cố gắng phân tích chuỗi JSON.
        try {
            // Loại bỏ các ký tự thừa (nếu có) và dấu ```
            const jsonString = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
            currentPassageData = JSON.parse(jsonString);
            
            // Xử lý và hiển thị nội dung
            displayNewContent(currentPassageData);

        } catch (e) {
            console.error('Lỗi phân tích JSON:', e);
            document.getElementById('passage-container').innerHTML = `<p>Lỗi: Không thể phân tích dữ liệu từ Gemini. Vui lòng thử lại.</p><p>Dữ liệu nhận được: ${generatedText}</p>`;
        }

    } catch (error) {
        console.error('Lỗi khi gọi API Gemini:', error);
        document.getElementById('passage-container').innerHTML = `<p>Đã xảy ra lỗi khi tạo bài đọc: ${error.message}</p>`;
    }
}

// Hàm hiển thị bài đọc và câu hỏi lên trang
function displayNewContent(data) {
    // Chuyển đổi chuỗi bài đọc thành các đoạn văn HTML
    const passageHtml = data.passage.split('. ').map(p => `<p>${p}.</p>`).join('');

    document.getElementById('passage-container').innerHTML = `<h2>${data.title}</h2>${passageHtml}`;
    document.getElementById('question-text').textContent = data.question;
    
    document.getElementById('user-answer').value = '';
    document.getElementById('feedback-section').style.display = 'none';
}

// Xử lý khi người dùng nhấn nút "Nộp"
document.getElementById('submit-button').addEventListener('click', () => {
    const feedbackSection = document.getElementById('feedback-section');
    const correctSentencesElement = document.getElementById('correct-sentences');

    feedbackSection.style.display = 'block';
    
    // Gộp các câu trả lời đúng lại thành một chuỗi
    const correctAnswers = currentPassageData.correctSentences.join('<br><br>');
    
    correctSentencesElement.innerHTML = `<span class="correct-answer">${correctAnswers}</span>`;
});

// Tải nội dung lần đầu khi trang web được tải
document.addEventListener('DOMContentLoaded', generateNewContent);

// Tải bài đọc và câu hỏi mới khi nhấn nút "Bài Mới"
document.getElementById('next-button').addEventListener('click', generateNewContent);