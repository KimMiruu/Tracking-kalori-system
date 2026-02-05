export async function POST(req) {
    try {
        const { message } = await req.json();

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                messages: [{
                        role: "system",
                        content: "Kamu adalah asisten nutrisi dan fitness. Jawab ramah dan beri saran makanan sehat.",
                    },
                    { role: "user", content: message },
                ],
            }),
        });

        const data = await res.json();

        return Response.json({
            reply: data.choices[0].message.content,
        });
    } catch (err) {
        console.error(err);
        return Response.json({ reply: "AI error" });
    }
}