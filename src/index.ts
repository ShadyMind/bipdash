
const alphabet = {
    d: {
        1: '.----',
        2: '..---',
        3: '...--',
        4: '....-',
        5: '.....', 
        6: '-....',
        7: '--...',
        8: '---..',
        9: '----.',
        0: '-----', 
        '.----': 1,
        '..---': 2,
        '...--': 3,
        '....-': 4,
        '.....': 5,
        '-....': 6,
        '--...': 7,
        '---..': 8,
        '----.': 9,
        '-----': 0
    },
    en: {
        a: '.-',
        b: '-...',
        c: '-.-.',
        d: '-..',
        e: '.',
        f: '..-.',
        g: '--.',
        h: '....',
        i: '..',
        j: '.---',
        k: '-.-',
        l: '.-..',
        m: '--',
        n: '-.',
        o: '---',
        p: '.--.',
        q: '--.-',
        r: '.-.',
        s: '...',
        t: '-',
        u: '..-',
        v: '...-',
        w: '.--',
        x: '-..-',
        y: '-.--',
        z: '--..',
        '.-': 'a',
        '-...': 'b',
        '-.-.': 'c',
        '-..': 'd',
        '.': 'e',
        '..-.': 'f',
        '--.': 'g',
        '....': 'h',
        '..': 'i',
        '.---': 'j',
        '-.-': 'k',
        '.-..': 'l',
        '--': 'm',
        '-.': 'n',
        '---': 'o',
        '.--.': 'p',
        '--.-': 'q',
        '.-.': 'r',
        '...': 's',
        '-': 't',
        '..-': 'u',
        '...-': 'v',
        '.--': 'w',
        '-..-': 'x',
        '-.--': 'y',
        '--..': 'z',
    }
};

let raf: number;

function HSVtoRGB(h: number, s: number, v: number) {
    let r = 0;
    let g = 0;
    let b = 0;
    let i = 0;
    let f = 0;
    let p = 0;
    let q = 0;
    let t = 0;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

const run = async () => {
    const histogramCanvas = document.querySelector('canvas#histogram');

    
    if (!(histogramCanvas instanceof HTMLCanvasElement) || !navigator.mediaDevices) {
        console.log(histogramCanvas);
        return;
    }

    const histogramCtx = histogramCanvas.getContext('2d', {
        willReadFrequently: true
    });
    
    if (!histogramCtx) {
        return;
    }

    const microphoneStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
            echoCancellation: true
        }
    });
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(microphoneStream);
    const analyser = audioCtx.createAnalyser();
    source.connect(analyser);
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const animate = () => {
        raf = window.setInterval(() => {
            const offsetAreaX = histogramCtx.canvas.width - 1;
            const offsetAreaY = histogramCtx.canvas.height;

            const imageData = histogramCtx.getImageData(1, 0, offsetAreaX, offsetAreaY);
            histogramCtx.putImageData(imageData, 0, 0);
            histogramCtx.clearRect(offsetAreaX, 0, 1, offsetAreaY);
            analyser.getByteFrequencyData(dataArray);

            dataArray.reverse().forEach((value, y) => {
                histogramCtx.fillStyle = HSVtoRGB(y, 0, value / 128);
                histogramCtx.fillRect(offsetAreaX, y, 1, 1);
            });
        }, 60);
    };

    animate();
};

const main = () => {
    document.querySelector<HTMLCanvasElement>('canvas#histogram')!.width = document.body!.clientWidth;
    document.querySelector<HTMLCanvasElement>('canvas#histogram')!.height = document.body!.clientHeight / 10;
    document.querySelector('#play')!.addEventListener('click', () => {
        run();
    });
    document.querySelector('#pause')!.addEventListener('click', () => {
        window.clearInterval(raf);
    });
};

document.addEventListener('DOMContentLoaded', main);