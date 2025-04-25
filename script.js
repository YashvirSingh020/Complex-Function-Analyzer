function insert(text) {
    const input = document.getElementById("funcInput");
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const current = input.value;
    input.value = current.substring(0, start) + text + current.substring(end);
    input.focus();
    input.selectionStart = input.selectionEnd = start + text.length;
}

function clearInput() {
    const input = document.getElementById("funcInput");
    input.value = "";
    document.getElementById("result").textContent = "";
}

function checkAnalytic() {
    const input = document.getElementById("funcInput").value.trim();
    const a = document.getElementById("realInput").value;
    const b = document.getElementById("imagInput").value;

    // Input validation
    if (!input) {
        document.getElementById('result').textContent = "Please enter a function.";
        return;
    }

    if (a === '' || b === '') {
        document.getElementById('result').textContent = "Please enter both real and imaginary parts.";
        return;
    }

    try {
        const z = math.parse(input);
        const z_val = math.complex(parseFloat(a) || 0, parseFloat(b) || 0);
        const fz = z.compile();
        const h = 0.0001;

        const f_val = fz.evaluate({ z: z_val });
        const fz_hx = fz.evaluate({ z: math.complex(z_val.re + h, z_val.im) });
        const fz_hy = fz.evaluate({ z: math.complex(z_val.re, z_val.im + h) });

        const df_dx = (fz_hx.re - f_val.re) / h;
        const df_dy = (fz_hy.re - f_val.re) / h;
        const dg_dx = (fz_hx.im - f_val.im) / h;
        const dg_dy = (fz_hy.im - f_val.im) / h;

        const cr1 = Math.abs(df_dx - dg_dy) < 0.01;
        const cr2 = Math.abs(df_dy + dg_dx) < 0.01;

        const result = document.getElementById("result");
        if (cr1 && cr2) {
            result.textContent = `✅ The function is analytic at z = ${z_val.re} + ${z_val.im}i`;
        } else {
            result.textContent = `❌ The function is NOT analytic at z = ${z_val.re} + ${z_val.im}i`;
        }
    } catch (e) {
        document.getElementById("result").textContent = "Invalid function: " + e.message;
    }
}

let viewport = {
    xMin: -2,
    xMax: 2,
    yMin: -2,
    yMax: 2
};

let gridData = []; // Cache analytic results to use on hover

let hoverTimeout; // For debouncing the hover tooltip

function evaluateComplex(func, z) {
    try {
        const result = func.evaluate({ z });
        // Check for Infinity or NaN
        if (!isFinite(result.re) || !isFinite(result.im) ||
            isNaN(result.re) || isNaN(result.im)) {
            return null;
        }
        return result;
    } catch (e) {
        return null;
    }
}

function checkRegion() {
    const input = document.getElementById("funcInput").value;
    if (!input.trim()) {
        document.getElementById("result").textContent = "Please enter a function.";
        return;
    }

    try {
        const func = math.parse(input).compile();
        const canvas = document.getElementById("analyticMap");
        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;
        const size = 60; // Increased resolution
        const h = 0.0001;

        // Show loading indicator
        document.getElementById("loader").style.display = "block";

        ctx.clearRect(0, 0, width, height);
        gridData = []; // Reset

        // Run calculations and render the grid
        for (let i = 0; i < size; i++) {
            gridData[i] = [];
            for (let j = 0; j < size; j++) {
                const x = viewport.xMin + (i / size) * (viewport.xMax - viewport.xMin);
                const y = viewport.yMin + (j / size) * (viewport.yMax - viewport.yMin);
                const z = math.complex(x, y);

                let isAnalytic = false;
                const f_val = evaluateComplex(func, z);

                if (f_val) {
                    const fxh = evaluateComplex(func, math.complex(x + h, y));
                    const fyh = evaluateComplex(func, math.complex(x, y + h));

                    if (fxh && fyh) {
                        const df_dx = (fxh.re - f_val.re) / h;
                        const df_dy = (fyh.re - f_val.re) / h;
                        const dg_dx = (fxh.im - f_val.im) / h;
                        const dg_dy = (fyh.im - f_val.im) / h;

                        const cr1 = Math.abs(df_dx - dg_dy) < 0.01;
                        const cr2 = Math.abs(df_dy + dg_dx) < 0.01;
                        isAnalytic = cr1 && cr2;
                    }
                }

                gridData[i][j] = { x, y, isAnalytic };

                // Draw
                ctx.fillStyle = isAnalytic
                    ? "rgba(0,200,0,0.6)"
                    : "rgba(200,0,0,0.6)";
                const px = (i / size) * width;
                const py = height - (j / size) * height;
                ctx.fillRect(px, py, width / size, height / size);
            }
        }

        // Draw axes
        drawAxes(ctx, width, height);

    } catch (e) {
        document.getElementById("result").textContent = "Invalid function: " + e.message;
    } finally {
        // Hide loading indicator
        document.getElementById("loader").style.display = "none";
    }
}

function drawAxes(ctx, width, height) {
    const x0 = (-viewport.xMin / (viewport.xMax - viewport.xMin)) * width;
    const y0 = (1 - (-viewport.yMin / (viewport.yMax - viewport.yMin))) * height;

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0, height);
    ctx.moveTo(0, y0);
    ctx.lineTo(width, y0);
    ctx.stroke();
}

const canvas = document.getElementById("analyticMap");

canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const mx = e.offsetX / canvas.width;
    const my = 1 - e.offsetY / canvas.height;

    const zx = viewport.xMin + mx * (viewport.xMax - viewport.xMin);
    const zy = viewport.yMin + my * (viewport.yMax - viewport.yMin);

    if (e.deltaY < 0) {
        // Zoom in
        viewport.xMin = zx - (zx - viewport.xMin) / zoomFactor;
        viewport.xMax = zx + (viewport.xMax - zx) / zoomFactor;
        viewport.yMin = zy - (zy - viewport.yMin) / zoomFactor;
        viewport.yMax = zy + (viewport.yMax - zy) / zoomFactor;
    } else {
        // Zoom out
        viewport.xMin = zx - (zx - viewport.xMin) * zoomFactor;
        viewport.xMax = zx + (viewport.xMax - zx) * zoomFactor;
        viewport.yMin = zy - (zy - viewport.yMin) * zoomFactor;
        viewport.yMax = zy + (viewport.yMax - zy) * zoomFactor;
    }
    checkRegion();
});

let isDragging = false;
let lastX, lastY;

canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
});

canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
        const dx = e.offsetX - lastX;
        const dy = e.offsetY - lastY;
        lastX = e.offsetX;
        lastY = e.offsetY;

        const scaleX = (viewport.xMax - viewport.xMin) / canvas.width;
        const scaleY = (viewport.yMax - viewport.yMin) / canvas.height;

        viewport.xMin -= dx * scaleX;
        viewport.xMax -= dx * scaleX;
        viewport.yMin += dy * scaleY;
        viewport.yMax += dy * scaleY;

        checkRegion();
    }

    // Hover tooltip (debounced)
    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
        const xRatio = e.offsetX / canvas.width;
        const yRatio = 1 - e.offsetY / canvas.height;
        const zx = viewport.xMin + xRatio * (viewport.xMax - viewport.xMin);
        const zy = viewport.yMin + yRatio * (viewport.yMax - viewport.yMin);

        const result = document.getElementById("result");
        result.innerText = `z = ${zx.toFixed(3)} + ${zy.toFixed(3)}i → ${isPointAnalytic(zx, zy) ? "✅ Analytic" : "❌ Not Analytic"}`;
    }, 30);
});

function isPointAnalytic(x, y) {
    const cellWidth = (viewport.xMax - viewport.xMin) / gridData.length;
    const cellHeight = (viewport.yMax - viewport.yMin) / gridData[0].length;

    const i = Math.floor((x - viewport.xMin) / cellWidth);
    const j = Math.floor((y - viewport.yMin) / cellHeight);

    if (i >= 0 && i < gridData.length && j >= 0 && j < gridData[0].length) {
        return gridData[i][j].isAnalytic;
    }
    return false;
}

function clearCanvas() {
    const canvas = document.getElementById('analyticMap');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Add example functions
function loadExample(exampleNum) {
    const funcInput = document.getElementById("funcInput");
    const realInput = document.getElementById("realInput");
    const imagInput = document.getElementById("imagInput");

    switch (exampleNum) {
        case 1: // Simple polynomial (always analytic)
            funcInput.value = "z^2 + 2*z + 1";
            realInput.value = "1";
            imagInput.value = "1";
            break;
        case 2: // Complex exponential (always analytic)
            funcInput.value = "exp(z)";
            realInput.value = "0";
            imagInput.value = "pi";
            break;
        case 3: // Complex conjugate (non-analytic)
            funcInput.value = "conj(z)";
            realInput.value = "2";
            imagInput.value = "3";
            break;
        case 4: // Absolute value (non-analytic except at z=0)
            funcInput.value = "abs(z)";
            realInput.value = "1";
            imagInput.value = "1";
            break;
        case 5: // Half-plane analytic function
            funcInput.value = "z * (re(z) > 0 ? 1 : conj(z))";
            realInput.value = "0";
            imagInput.value = "0";
            break;
        case 6: // Circular domain analytic
            funcInput.value = "abs(z) <= 1 ? z^2 : conj(z)";
            realInput.value = "0.5";
            imagInput.value = "0.5";
            break;
        case 7: // Strip analytic
            funcInput.value = "im(z) >= -1 and im(z) <= 1 ? exp(z) : conj(z)";
            realInput.value = "0";
            imagInput.value = "0";
            break;
        case 8: // Wedge analytic
            funcInput.value = "arg(z) >= 0 and arg(z) <= pi/2 ? z^2 : abs(z)";
            realInput.value = "1";
            imagInput.value = "1";
            break;
    }

    // Trigger both checks
    checkAnalytic();
    checkRegion();
}

