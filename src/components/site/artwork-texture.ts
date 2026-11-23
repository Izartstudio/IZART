export function loadCardMark() {
  const mark = new Image();
  mark.src = "/assets/home/services/card-mark.svg";
  return mark.decode().then(() => mark, () => null);
}

export function frameArtwork(image: HTMLImageElement, mark: HTMLImageElement | null, aspect: number, resolution = 512) {
  const card = document.createElement("canvas");
  card.width = resolution;
  card.height = Math.round(resolution / aspect);
  const width = 512;
  const height = card.height * width / resolution;
  const ctx = card.getContext("2d");
  if (!ctx) return null;
  ctx.scale(resolution / width, resolution / width);

  const header = Math.round(height * 0.1);
  const footer = Math.round(height * 0.05);
  const artworkHeight = height - header - footer;
  const scale = Math.max(width / image.width, artworkHeight / image.height);
  const cropWidth = width / scale;
  const cropHeight = artworkHeight / scale;

  ctx.fillStyle = "#0b0a08";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, (image.width - cropWidth) / 2, (image.height - cropHeight) / 2,
    cropWidth, cropHeight, 0, header, width, artworkHeight);

  ctx.fillStyle = "#35de12";
  ctx.textBaseline = "middle";
  ctx.font = "13px Arial, sans-serif";
  const center = header / 2;
  if (mark) {
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 3;
    ctx.drawImage(mark, 19, center - 6, 60, 12);
    ctx.shadowBlur = 0;
  }

  ctx.textAlign = "right";
  ctx.fillText("2026", width - 17, center);
  const yearStart = width - 17 - ctx.measureText("2026").width;
  ctx.beginPath();
  ctx.moveTo(yearStart - 23, center - 5);
  ctx.lineTo(yearStart - 9, center);
  ctx.lineTo(yearStart - 23, center + 5);
  ctx.closePath();
  ctx.fill();

  ctx.textAlign = "left";
  for (const [index, letter] of ["I", "Z", "R"].entries()) {
    ctx.fillText(letter, 10 + index * 61, height - footer / 2);
  }
  return card;
}

