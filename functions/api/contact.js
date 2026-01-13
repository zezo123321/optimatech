export async function onRequestPost({ request, env }) {
  const form = await request.formData();

  // Honeypot (لو اتعبّى غالبًا بوت)
  if ((form.get("company") || "").toString().trim() !== "") {
    return new Response("OK", { status: 200 });
  }

  const name = (form.get("name") || "").toString().trim();
  const email = (form.get("email") || "").toString().trim();
  const phone = (form.get("phone") || "").toString().trim();

  if (!name || !email || !phone) {
    return new Response("Missing fields", { status: 400 });
  }

  // Resend API
  const resendResp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.MAIL_FROM,        // مثال: "Website <[email protected]>"
      to: [env.MAIL_TO],          // الإيميل اللي هتستقبل عليه
      subject: `طلب تواصل جديد من ${name}`,
      reply_to: email,
      html: `
        <h2>طلب تواصل جديد</h2>
        <p><b>الاسم:</b> ${escapeHtml(name)}</p>
        <p><b>الإيميل:</b> ${escapeHtml(email)}</p>
        <p><b>الموبايل:</b> ${escapeHtml(phone)}</p>
      `,
    }),
  });

  if (!resendResp.ok) {
    const errText = await resendResp.text();
    return new Response(`Email failed: ${errText}`, { status: 500 });
  }

  // صفحة تأكيد بسيطة
  return new Response(
    `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تم الإرسال بنجاح</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      text-align: center;
      padding: 20px;
    }
    .container {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      max-width: 500px;
    }
    h2 {
      font-size: 32px;
      margin-bottom: 20px;
    }
    p {
      font-size: 18px;
      margin-bottom: 30px;
      opacity: 0.9;
    }
    a {
      display: inline-block;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      padding: 15px 40px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s;
    }
    a:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>✅ تم إرسال طلبك بنجاح</h2>
    <p>شكراً لتواصلك معنا! هنرد عليك في أقرب وقت.</p>
    <a href="/">العودة للصفحة الرئيسية</a>
  </div>
</body>
</html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

// حماية بسيطة ضد HTML injection
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#039;"
  }[c]));
}
