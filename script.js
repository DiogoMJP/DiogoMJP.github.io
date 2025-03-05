const DEFAULT = 0;
const GREYSCALE = 1;
const AVERAGE_DITHERING = 2;
const RANDOM_DITHERING = 3;
const BAYER_DITHERING = 4;
const FLOYD_STEINBERG_DITHERING = 5;
const JARVIS_JUDICE_NINKE_DITHERING = 6;
let filter_type = DEFAULT;

let darkColor = {r: 0, g: 0, b: 0};
let lightColor = {r: 255, g: 255, b: 255};
let averageDitheringThreshold = 128;
let orderedDitheringThresholdMapSize = 2;

let settingsDiv = document.getElementById('filter-settings-div');

let image = document.getElementById('sourceImage');
let processed_image = document.getElementById('processedImage');
let sourceCanvas = document.getElementById('sourceCanvas');
let sourceContext = sourceCanvas.getContext('2d', {willReadFrequently: true});
let previewCanvas = document.getElementById('previewCanvas');
let previewContext = previewCanvas.getContext('2d', {willReadFrequently: true});


function uploadImage(event) {
    image.src = URL.createObjectURL(event.target.files[0]);

    image.onload = function () {
        sourceCanvas.width = this.width;
        sourceCanvas.height = this.height;
        sourceCanvas.crossOrigin = "anonymous";
        sourceContext.drawImage(image, 0, 0);
        previewCanvas.width = this.width;
        previewCanvas.height = this.height;
        previewCanvas.crossOrigin = "anonymous";
        applyFilter();
    };
}

function downloadImage() {
    let link = document.createElement('a');
    link.href = previewCanvas.toDataURL();
    link.download = 'processedImage.png';
    link.click();
    link.remove();
}


function getCoord(imageData, index) {
    return {
        x: index % imageData.width,
        y: Math.floor(index / imageData.width)
    };
}

function getIndex(imageData, x, y) {
    return (y * imageData.width + x) * 4;
}

function getPixel(imageData, x, y) {
    let index = getIndex(imageData, x, y);
    return {
        r: imageData.data[index],
        g: imageData.data[index + 1],
        b: imageData.data[index + 2]
    }
}

function setPixel(imageData, x, y, color) {
    let index = getIndex(imageData, x, y);
    imageData.data[index] = color.r;
    imageData.data[index + 1] = color.g;
    imageData.data[index + 2] = color.b;
}


function selectFilter(filter) {
    filter_type = filter;
    applyFilter();
}

function applyFilter() {
    document.getElementById("average-dithering-threshold-div").style.display = "none";
    document.getElementById("ordered-dithering-map-size-settings-div").style.display = "none";
    if (filter_type == DEFAULT)
        displayDefault();
    else if (filter_type == GREYSCALE)
        displayGreyscale();
    else if (filter_type == AVERAGE_DITHERING)
        displayAverageDithering();
    else if (filter_type == RANDOM_DITHERING)
        displayRandomDithering();
    else if (filter_type == BAYER_DITHERING)
        displayOrderedDithering();
    else if (filter_type == FLOYD_STEINBERG_DITHERING)
        displayFloydSteinbergDithering();
    else if (filter_type == JARVIS_JUDICE_NINKE_DITHERING)
        displayJarvisJudiceNinkeDithering();
}


function displayDefault() {
    previewContext.drawImage(image, 0, 0);
}

function displayGreyscale() {
    var imageData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);

    previewContext.putImageData(imageData, 0, 0);   
    
    imageData = getGreyscale(imageData);

    previewContext.putImageData(imageData, 0, 0);
}

function displayAverageDithering() {
    var imageData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);

    document.getElementById("average-dithering-threshold-div").style.display = "block";

    previewContext.putImageData(imageData, 0, 0);

    imageData = getGreyscale(imageData);

    previewContext.putImageData(imageData, 0, 0);

    imageData = getAverageDithering(imageData);

    previewContext.putImageData(imageData, 0, 0);
}

function displayRandomDithering() {
    var imageData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    
    previewContext.putImageData(imageData, 0, 0);

    imageData = getGreyscale(imageData);

    previewContext.putImageData(imageData, 0, 0);

    imageData = getRandomDithering(imageData);

    previewContext.putImageData(imageData, 0, 0);
}

function displayOrderedDithering() {
    var imageData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    
    document.getElementById("ordered-dithering-map-size-settings-div").style.display = "block";

    previewContext.putImageData(imageData, 0, 0);

    imageData = getGreyscale(imageData);

    previewContext.putImageData(imageData, 0, 0);

    imageData = getOrderedDithering(imageData);

    previewContext.putImageData(imageData, 0, 0);
}

function displayFloydSteinbergDithering() {
    var imageData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);

    document.getElementById("average-dithering-threshold-div").style.display = "block";
    
    previewContext.putImageData(imageData, 0, 0);

    imageData = getGreyscale(imageData);

    previewContext.putImageData(imageData, 0, 0);

    imageData = getFloydSteinbergDithering(imageData);

    previewContext.putImageData(imageData, 0, 0);
}

function displayJarvisJudiceNinkeDithering() {
    var imageData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);

    document.getElementById("average-dithering-threshold-div").style.display = "block";
    
    previewContext.putImageData(imageData, 0, 0);

    imageData = getGreyscale(imageData);

    previewContext.putImageData(imageData, 0, 0);

    imageData = getJarvisJudiceNinkeDithering(imageData);

    previewContext.putImageData(imageData, 0, 0);
}


function getGreyscale(imageData) {
    for (var y = 0; y < imageData.height; y++)
        for (var x = 0; x < imageData.width; x++) {
            let color = getPixel(imageData, x, y);
            color = 0.2126*color.r + 0.7152*color.g + 0.0722*color.b;
            color = {r: color, g: color, b: color};
            setPixel(imageData, x, y, color);
        }

    return imageData;
}

function getAverageDithering(imageData) {
    for (var y = 0; y < imageData.height; y++)
        for (var x = 0; x < imageData.width; x++) {
            let color = getPixel(imageData, x, y);
            color = color.r > averageDitheringThreshold ? lightColor : darkColor;
            setPixel(imageData, x, y, color);
        }

    return imageData;
}

function getRandomDithering(imageData) {
    for (var y = 0; y < imageData.height; y++)
        for (var x = 0; x < imageData.width; x++) {
            let random = Math.floor(Math.random() * 256);
            let color = getPixel(imageData, x, y);
            color = color.r > random ? lightColor : darkColor;
            setPixel(imageData, x, y, color);
        }

    return imageData;
}

function createThresholdMap(n) {
    let dim = 1 << n;
    let thresholdMap = new Array(dim);
    for (var y = 0; y < dim; y++) {
        thresholdMap[y] = new Array(dim).fill(0);
        for (var x = 0; x < dim; x++) {
            v = 0; mask = n-1; xc = x^y; yc = y;
            for (var bit = 0; bit < 2*n; --mask) {
                v |= ((yc >>> mask)&1) << bit++;
                v |= ((xc >>> mask)&1) << bit++;
            }
            thresholdMap[y][x] = v;
        }
    }
    for (var y = 0; y < dim; y++) {
        for (var x = 0; x < dim; x++) {
            thresholdMap[y][x] = Math.floor(256*(thresholdMap[y][x] / Math.pow(dim, 2)));
        }
    }
    return thresholdMap;
}
function getOrderedDithering(imageData) {
    let thresholdMap = createThresholdMap(orderedDitheringThresholdMapSize);

    let dim = 1 << orderedDitheringThresholdMapSize;

    for (var y = 0; y < imageData.height; y++)
        for (var x = 0; x < imageData.width; x++) {
            let color = getPixel(imageData, x, y);
            color = color.r > thresholdMap[y % dim][x % dim] ? lightColor : darkColor;
            setPixel(imageData, x, y, color);
        }

    return imageData;
}

function getFloydSteinbergDithering(imageData) {
    let data = imageData.data;
    
    for (var i = 0; i < data.length; i += 4) {
        let oldpixel = data[i];
        let newpixel = oldpixel > averageDitheringThreshold ? 255 : 0;
        data[i] = newpixel; data[i+1] = newpixel; data[i+2] = newpixel;
        let quant_error = oldpixel - newpixel;
        if (i % (imageData.width * 4) < imageData.width - 4) {
            data[i + 4] += quant_error * 7 / 16;
            if (i < (imageData.width - 1) * 4)
                data[i + 4 + imageData.width * 4] += quant_error * 1 / 16;
        }
        if (i < (imageData.width - 1) * 4) {
            data[i + imageData.width * 4] += quant_error * 3 / 16;
            if (i % (imageData.width * 4) > 4)
                data[i + 2 * imageData.width * 4] += quant_error * 5 / 16;
        }
    }

    for (var i = 0; i < data.length; i += 4) {
        data[i] = data[i] > averageDitheringThreshold ? lightColor.r : darkColor.r;
        data[i+1] = data[i+1] > averageDitheringThreshold ? lightColor.g : darkColor.g;
        data[i+2] = data[i+2] > averageDitheringThreshold ? lightColor.b : darkColor.b;
    }

    return imageData;
}

function getJarvisJudiceNinkeDithering(imageData) {
    let data = imageData.data;
    
    for (var i = 0; i < data.length; i += 4) {
        let oldpixel = data[i];
        let newpixel = oldpixel > averageDitheringThreshold ? 255 : 0;
        data[i] = newpixel; data[i+1] = newpixel; data[i+2] = newpixel;
        let quant_error = oldpixel - newpixel;
        if (i % (imageData.width * 4) < imageData.width - 4) {
            data[i + 4] += quant_error * 7 / 16;
            if (i < (imageData.width - 1) * 4) {
                data[i + imageData.width * 4] += quant_error * 7 / 16;
                data[i + 4 + imageData.width * 4] += quant_error * 5 / 16;
                if (i < (imageData.width - 2) * 4)
                    data[i + 2 * imageData.width * 4] += quant_error * 5 / 16;
                    data[i + 4 + 2 * imageData.width * 4] += quant_error * 3 / 16;
            }
        }
        if (i % (imageData.width * 4) > 4) {
            if (i < (imageData.width - 1) * 4) {
                data[i - 4 + imageData.width * 4] += quant_error * 5 / 16;
                if (i < (imageData.width - 2) * 4)
                    data[i - 4 + 2 * imageData.width * 4] += quant_error * 3 / 16;
            }
            if (i % (imageData.width * 4) > 8) {
                if (i < (imageData.width - 1) * 4) {
                    data[i - 8 + imageData.width * 4] += quant_error * 3 / 16;
                    if (i < (imageData.width - 2) * 4)
                        data[i - 8 + 2 * imageData.width * 4] += quant_error * 1 / 16;
                }
            }
        }
        
    }

    for (var i = 0; i < data.length; i += 4) {
        data[i] = data[i] > averageDitheringThreshold ? lightColor.r : darkColor.r;
        data[i+1] = data[i+1] > averageDitheringThreshold ? lightColor.g : darkColor.g;
        data[i+2] = data[i+2] > averageDitheringThreshold ? lightColor.b : darkColor.b;
    }

    return imageData;
}


function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
function updateDarkColor() {
    darkColor = hexToRgb(document.getElementById('dark-color-input').value);
    applyFilter();
}
function updateLightColor() {
    lightColor = hexToRgb(document.getElementById('light-color-input').value);
    applyFilter();
}

function updateAverageDitheringThreshold() {
    averageDitheringThreshold = document.getElementById('average-dithering-threshold-input').value;
    applyFilter()
}

function updateOrderedDitheringMap() {
    orderedDitheringThresholdMapSize = document.getElementById('ordered-dithering-map-input').value;
    applyFilter()
}