import { NextResponse } from "next/server";

// Đây là một ví dụ đơn giản - bạn có thể thay thế bằng OpenAI, Anthropic, hoặc AI service khác
export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    // TODO: Thay thế bằng AI API thực tế (OpenAI, Anthropic, etc.)
    // Ví dụ với OpenAI:
    /*
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          ...history.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();
    return NextResponse.json({ response: data.choices[0].message.content });
    */

    // Demo response (xóa khi đã tích hợp AI thực)
    const demoResponses = [
      "Tôi đã hiểu yêu cầu của bạn về BIM. Bạn muốn tôi phân tích file IFC phải không?",
      "Đây là một câu hỏi hay! Để làm việc với dữ liệu BIM, chúng ta cần...",
      "Tôi có thể giúp bạn xử lý dữ liệu workflow. Bạn cần tôi làm gì cụ thể?",
      "Dựa trên ngữ cảnh BIM, tôi khuyên bạn nên...",
    ];

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response =
      demoResponses[Math.floor(Math.random() * demoResponses.length)];

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Không thể xử lý tin nhắn" },
      { status: 500 }
    );
  }
}
