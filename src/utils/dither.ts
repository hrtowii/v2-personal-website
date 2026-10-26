function toRGB(color: string): [number, number, number] {
  // vv cursed maybe shldnt use canvas js for color conversion
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);

  const data = ctx.getImageData(0, 0, 1, 1).data;
  return [data[0], data[1], data[2]];
}

export function dither(img: HTMLImageElement): string | undefined {
  const canvas = document.createElement("canvas");

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;


  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(img, 0, 0);

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;

  // https://seleb.github.io/ordered-dither-maker/
  // if u wanna mess around
  const matrix = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ];

  const styles = getComputedStyle(document.documentElement);

  const fg = toRGB(styles.getPropertyValue("--fg").trim());
  const bg = toRGB(styles.getPropertyValue("--bg").trim());

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;

      const gray =
        0.2126 * data[i] +
        0.7152 * data[i + 1] +
        0.0722 * data[i + 2];

      const threshold = (matrix[y % 4][x % 4] + 0.5) * 255 / 16;
      const color = gray > threshold ? fg : bg;

      data[i] = color[0];
      data[i + 1] = color[1];
      data[i + 2] = color[2];
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}
