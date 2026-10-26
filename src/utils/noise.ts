// thank u https://surma.dev/things/ditherpunk/ i stole the src
export async function generateNoise() {
    const size = parseInt(
        getComputedStyle(document.body)
            .getPropertyValue("--noise-size")
    );
    const pixels = new Uint8ClampedArray(size * size * 4);

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const color = Math.random() > 0.5 ? 255 : 0;
            const index = (y * size + x) * 4;

            pixels[index] = color;     // R
            pixels[index + 1] = color; // G
            pixels[index + 2] = color; // B
            pixels[index + 3] = 255;   // Alpha
        }
    }

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    ctx.putImageData(new ImageData(pixels, size, size), 0, 0);

    const blob = await new Promise(resolve =>
        canvas.toBlob(resolve, "image/png")
    );

    const url = URL.createObjectURL(blob);

    const noise = document.createElement("div");
    noise.classList.add("noise");
    noise.style.backgroundImage = `url(${url})`;

    document.body.appendChild(noise);
}
