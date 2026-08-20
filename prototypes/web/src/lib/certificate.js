export function wrapText(ctx, text, maxWidth, _cx) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  words.forEach((word) => {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  });
  if (current) lines.push(current);
  return lines.length ? lines : [text];
}

export function drawCertificate(ctx, W, H, dpr, { userName, topic, bookAuthor, lessonCount, dateStr, isBadge }) {
  ctx.scale(dpr, dpr);
  const w = W, h = H;

  if (isBadge) {
    // Badge: dark background, square
    ctx.fillStyle = "#0D0D0D";
    ctx.fillRect(0, 0, w, h);
    // Vermilion left stripe
    ctx.fillStyle = "#C1121F";
    ctx.fillRect(0, 0, 8, h);
    // Topic (hero)
    ctx.textAlign = "center";
    ctx.fillStyle = "#FAFAFA";
    ctx.font = `300 ${topic.length > 12 ? 52 : 64}px Fraunces, Georgia, serif`;
    const topicLines = wrapText(ctx, topic, w * 0.78, w / 2);
    const topicY = h / 2 - (topicLines.length - 1) * 36;
    topicLines.forEach((line, i) => ctx.fillText(line, w / 2, topicY + i * 72));
    // "Path complete" label
    ctx.font = "400 13px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#AAAAAA";
    ctx.letterSpacing = "0.2em";
    ctx.fillText("PATH COMPLETE · CURI", w / 2, h - 60);
    ctx.fillStyle = "#C1121F";
    ctx.fillRect(w / 2 - 24, h - 76, 48, 3);
  } else {
    // Certificate: landscape, light background
    ctx.fillStyle = "#FAFAFA";
    ctx.fillRect(0, 0, w, h);
    // Vermilion top bar
    ctx.fillStyle = "#C1121F";
    ctx.fillRect(0, 0, w, 7);
    // Outer border
    ctx.strokeStyle = "#D0D0D0";
    ctx.lineWidth = 1;
    ctx.strokeRect(36, 36, w - 72, h - 72);
    // CURI wordmark top-left
    ctx.textAlign = "left";
    ctx.font = "300 26px Fraunces, Georgia, serif";
    ctx.fillStyle = "#0D0D0D";
    ctx.fillText("Curi", 72, 96);
    ctx.fillStyle = "#C1121F";
    ctx.fillRect(72, 104, 34, 3);
    // Date top-right
    ctx.textAlign = "right";
    ctx.font = "400 13px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#AAAAAA";
    ctx.fillText(dateStr, w - 72, 96);
    // Certificate of Completion
    ctx.textAlign = "center";
    ctx.font = "400 11px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#AAAAAA";
    ctx.fillText("CERTIFICATE OF COMPLETION", w / 2, 200);
    // Horizontal rule
    ctx.strokeStyle = "#D0D0D0";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w / 2 - 120, 218); ctx.lineTo(w / 2 + 120, 218); ctx.stroke();
    // "This certifies that"
    ctx.font = "300 17px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#5A5A5A";
    ctx.fillText("This certifies that", w / 2, 278);
    // User name
    ctx.font = `300 ${(userName || "").length > 20 ? 48 : 60}px Fraunces, Georgia, serif`;
    ctx.fillStyle = "#0D0D0D";
    ctx.fillText(userName || "You", w / 2, 360);
    // "has completed / has read"
    ctx.font = "300 17px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#5A5A5A";
    ctx.fillText(bookAuthor ? "has read" : "has completed the path", w / 2, 418);
    // Topic name (hero)
    const topicFontSize = topic.length > 20 ? 52 : topic.length > 14 ? 64 : 80;
    ctx.font = `400 italic ${topicFontSize}px Fraunces, Georgia, serif`;
    ctx.fillStyle = "#0D0D0D";
    const topicLines = wrapText(ctx, topic, w - 240, w / 2);
    const topicY = 520 - (topicLines.length - 1) * (topicFontSize * 0.6);
    topicLines.forEach((line, i) => ctx.fillText(line, w / 2, topicY + i * (topicFontSize * 1.15)));
    // Author (for book paths)
    let afterTopicY = topicY + topicLines.length * (topicFontSize * 1.15) + 20;
    if (bookAuthor) {
      ctx.font = "300 18px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillStyle = "#5A5A5A";
      ctx.fillText(`by ${bookAuthor}`, w / 2, afterTopicY);
      afterTopicY += 36;
    }
    // Lesson count + curi.app
    ctx.font = "400 13px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#AAAAAA";
    ctx.fillText(`${lessonCount} lessons · curi.app`, w / 2, Math.max(afterTopicY + 20, h - 80));
  }
}

export async function generateAndDownload(type, { userName, topic, bookAuthor, lessonCount }) {
  const isBadge = type === "badge";
  const W = isBadge ? 800 : 1400;
  const H = isBadge ? 800 : 900;
  const DPR = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  const ctx = canvas.getContext("2d");
  const dateStr = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  await document.fonts.ready;
  drawCertificate(ctx, W, H, DPR, { userName, topic, bookAuthor, lessonCount, dateStr, isBadge });
  const slug = topic.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const link = document.createElement("a");
  link.download = `curi-${slug}-${isBadge ? "badge" : "certificate"}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
