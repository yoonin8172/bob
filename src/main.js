const imagePath = (fileName) => `./public/images/${fileName}`;

const CONFIG = {
    maxDishSelection: 8,
    beforeText: "너무너무 배고파....",
    afterText: "배불러~ 행복해!!!",
    backgroundImage: "",
    tableImage: "table.png",
    backgroundColors: {
        top: "#f7e8f6",
        bottom: "#ffda92",
        splitY: 1450,
    },
    dishes: [
        { id: "rice", name: "쌀밥", fileName: "rice.png", color: "#f5f2e8" },
        { id: "porkBelly", name: "삼겹살", fileName: "pork-belly.png", color: "#d49261" },
        { id: "yoajung", name: "요아정", fileName: "yoajung.png", color: "#f4d86e" },
        { id: "yukhoe", name: "육회", fileName: "yukhoe.png", color: "#a8342f" },
        { id: "salmon", name: "연어", fileName: "salmon.png", color: "#e07751" },
        { id: "dakgalbi", name: "닭갈비", fileName: "dakgalbi.png", color: "#cf6425" },
        { id: "carrotCake", name: "당근케잌", fileName: "carrot-cake.png", color: "#8c5a36" },
        { id: "bossam", name: "보쌈", fileName: "bossam.png", color: "#d7b89c" },
        { id: "pizza", name: "피자", fileName: "pizza.png", color: "#d17a24" },
        { id: "sundaeGuk", name: "순댓국", fileName: "sundae-guk.png", color: "#d8d4c8" },
        { id: "eggTart", name: "에그타르트", fileName: "egg-tart.png", color: "#d58a20" },
        { id: "tteokbokki", name: "떡볶이", fileName: "tteokbokki.png", color: "#df4b21" },
        { id: "malatang", name: "마라탕", fileName: "malatang.png", color: "#d52f18" },
    ],
};

const STAGE = {
    width: 1080,
    height: 2360,
    photo: { x: 240, y: 590, width: 640, height: 850 },
    table: { x: 22, y: 1360, width: 1036, height: 800 },
    tableTop: { cx: 540, cy: 1534, rx: 474, ry: 168 },
};

const canvas = document.querySelector("#stageCanvas");
const ctx = canvas.getContext("2d");
const photoInput = document.querySelector("#photoInput");
const photoPickerLabel = document.querySelector("#photoPickerLabel");
const photoButtonText = document.querySelector("#photoButtonText");
const photoButtonSubtext = document.querySelector("#photoButtonSubtext");
const dishButton = document.querySelector("#dishButton");
const saveButton = document.querySelector("#saveButton");
const dishModal = document.querySelector("#dishModal");
const dishList = document.querySelector("#dishList");
const closeModalButton = document.querySelector("#closeModalButton");
const completeDishButton = document.querySelector("#completeDishButton");
const SAVE_FILE_NAME = "bab-sang.png";
const SAVE_BUTTON_TEXT = saveButton.textContent.trim();

const state = {
    userPhoto: null,
    selectedDishIds: new Set(),
    mealAdded: false,
};

const assets = {
    background: null,
    table: null,
    dishes: new Map(),
};

function loadImage(src) {
    if (!src) {
        return Promise.resolve(null);
    }

    return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => resolve(null);
        image.src = src;
    });
}

async function loadAssets() {
    const [background, table, dishes] = await Promise.all([
        loadImage(CONFIG.backgroundImage ? imagePath(CONFIG.backgroundImage) : ""),
        loadImage(CONFIG.tableImage ? imagePath(CONFIG.tableImage) : ""),
        Promise.all(
            CONFIG.dishes.map(async (dish) => ({
                id: dish.id,
                image: await loadImage(imagePath(dish.fileName)),
            })),
        ),
    ]);

    assets.background = background;
    assets.table = table;
    dishes.forEach(({ id, image }) => assets.dishes.set(id, image));
    render();
}

function drawCoverImage(image, x, y, width, height) {
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const sourceWidth = width / scale;
    const sourceHeight = height / scale;
    const sourceX = (image.naturalWidth - sourceWidth) / 2;
    const sourceY = (image.naturalHeight - sourceHeight) / 2;

    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function drawContainImage(image, x, y, width, height) {
    const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const drawX = x + (width - drawWidth) / 2;
    const drawY = y + (height - drawHeight) / 2;

    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawBackground() {
    if (assets.background) {
        drawCoverImage(assets.background, 0, 0, STAGE.width, STAGE.height);
    } else {
        ctx.fillStyle = CONFIG.backgroundColors.top;
        ctx.fillRect(0, 0, STAGE.width, CONFIG.backgroundColors.splitY);
        ctx.fillStyle = CONFIG.backgroundColors.bottom;
        ctx.fillRect(0, CONFIG.backgroundColors.splitY, STAGE.width, STAGE.height - CONFIG.backgroundColors.splitY);
    }

    if (state.mealAdded) {
        drawHeartWallpaper();
    }
}

function drawHeartWallpaper() {
    const wallHeight = CONFIG.backgroundColors.splitY;

    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.font = "52px Apple Color Emoji, Segoe UI Emoji, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let y = 74; y < wallHeight - 44; y += 142) {
        const isOddRow = Math.floor(y / 142) % 2 === 1;

        for (let x = isOddRow ? 32 : 96; x < STAGE.width + 80; x += 176) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(isOddRow ? -0.08 : 0.08);
            ctx.fillText("💗", 0, 0);
            ctx.restore();
        }
    }

    ctx.restore();
}

function drawPhoto() {
    const { x, y, width, height } = STAGE.photo;

    if (!state.userPhoto) {
        ctx.save();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
        ctx.setLineDash([18, 18]);
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(x, y, width, height);
        ctx.fillStyle = "#5a4c55";
        ctx.font = "52px KyoboHandwriting2019, Apple SD Gothic Neo, Malgun Gothic, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("최애 사진을 추가해주세요", x + width / 2, y + height / 2);
        ctx.restore();
        return;
    }

    drawCoverImage(state.userPhoto, x, y, width, height);
}

function drawBubble({ x, y, rx, ry, text }) {
    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#111";
    ctx.font = "58px KyoboHandwriting2019, Apple SD Gothic Neo, Malgun Gothic, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    wrapText(text, x, y, rx * 1.55, 58);
    ctx.restore();
}

function wrapText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    const lines = [];
    let line = "";

    words.forEach((word) => {
        const testLine = line ? `${line} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = testLine;
        }
    });

    lines.push(line);
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((item, index) => ctx.fillText(item, x, startY + index * lineHeight));
}

function drawFallbackTable() {
    const { cx, cy, rx, ry } = STAGE.tableTop;

    ctx.save();
    ctx.fillStyle = "#8e2f22";
    ctx.strokeStyle = "#531812";
    ctx.lineWidth = 10;

    const legs = [
        [150, 1660, 80, 360],
        [840, 1660, 80, 360],
        [492, 1710, 88, 410],
    ];

    legs.forEach(([x, y, width, height]) => {
        const gradient = ctx.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0, "#641a14");
        gradient.addColorStop(0.5, "#b94328");
        gradient.addColorStop(1, "#56160f");
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
    });

    const tableGradient = ctx.createRadialGradient(cx, cy - 45, 40, cx, cy, rx);
    tableGradient.addColorStop(0, "#c94d32");
    tableGradient.addColorStop(0.55, "#a43124");
    tableGradient.addColorStop(1, "#6c1c16");
    ctx.fillStyle = tableGradient;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 153, 112, 0.38)";
    ctx.lineWidth = 5;
    for (let index = 0; index < 6; index += 1) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx - 26 - index * 42, ry - 12 - index * 12, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();
}

function drawTable() {
    if (assets.table) {
        const { x, y, width, height } = STAGE.table;
        drawContainImage(assets.table, x, y, width, height);
        return;
    }

    drawFallbackTable();
}

function getDishPositions(count) {
    const layouts = {
        1: [[540, 1536]],
        2: [[382, 1540], [698, 1540]],
        3: [[540, 1460], [358, 1608], [722, 1608]],
        4: [[356, 1482], [724, 1482], [392, 1622], [688, 1622]],
        5: [[540, 1458], [318, 1538], [762, 1538], [408, 1642], [672, 1642]],
        6: [[332, 1482], [540, 1460], [748, 1482], [332, 1618], [540, 1642], [748, 1618]],
        7: [[540, 1452], [304, 1516], [460, 1530], [620, 1530], [776, 1516], [390, 1640], [690, 1640]],
        8: [[292, 1482], [456, 1466], [624, 1466], [788, 1482], [292, 1618], [456, 1640], [624, 1640], [788, 1618]],
    };

    if (layouts[count]) {
        return layouts[count];
    }

    return CONFIG.dishes.slice(0, count).map((_, index) => {
        const angle = (Math.PI * 2 * index) / count;
        const ring = index % 2 === 0 ? 1 : 0.55;
        return [
            STAGE.tableTop.cx + Math.cos(angle) * STAGE.tableTop.rx * 0.62 * ring,
            STAGE.tableTop.cy + Math.sin(angle) * STAGE.tableTop.ry * 0.62 * ring,
        ];
    });
}

function drawDishes() {
    const selectedDishes = CONFIG.dishes.filter((dish) => state.selectedDishIds.has(dish.id));

    if (!state.mealAdded || selectedDishes.length === 0) {
        return;
    }

    const positions = getDishPositions(selectedDishes.length);
    const dishSizes = {
        1: 390,
        2: 330,
        3: 286,
        4: 260,
        5: 238,
        6: 224,
        7: 212,
        8: 204,
    };
    const size = dishSizes[selectedDishes.length] || 204;

    selectedDishes.forEach((dish, index) => {
        const [cx, cy] = positions[index];
        const image = assets.dishes.get(dish.id);
        const x = cx - size / 2;
        const y = cy - size / 2;

        if (image) {
            drawContainImage(image, x, y, size, size);
        } else {
            drawFallbackDish(dish, cx, cy, size);
        }
    });
}

function drawFallbackDish(dish, cx, cy, size) {
    ctx.save();
    ctx.fillStyle = "#fff8ef";
    ctx.strokeStyle = "rgba(65, 33, 21, 0.22)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.5, size * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = dish.color;
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.34, size * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = dish.color === "#27372f" || dish.color === "#44312d" ? "#fff" : "#201515";
    ctx.font = "26px KyoboHandwriting2019, Apple SD Gothic Neo, Malgun Gothic, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(dish.name, cx, cy);
    ctx.restore();
}

function render() {
    ctx.clearRect(0, 0, STAGE.width, STAGE.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    drawBackground();
    drawPhoto();

    if (state.userPhoto && !state.mealAdded) {
        drawBubble({ x: 780, y: 395, rx: 250, ry: 132, text: CONFIG.beforeText });
    }

    if (state.userPhoto && state.mealAdded) {
        drawBubble({ x: 330, y: 395, rx: 240, ry: 130, text: CONFIG.afterText });
    }

    drawTable();
    drawDishes();
    syncControls();
}

function syncControls() {
    const hasPhoto = Boolean(state.userPhoto);
    photoPickerLabel.classList.toggle("has-photo", hasPhoto);
    photoPickerLabel.classList.toggle("is-reset-ready", state.mealAdded);
    photoButtonText.textContent = hasPhoto ? "사진 변경" : "+";
    photoButtonSubtext.hidden = !state.mealAdded;
    dishButton.hidden = !hasPhoto || state.mealAdded;
    saveButton.hidden = !hasPhoto || !state.mealAdded;
}

function openDishModal() {
    dishModal.classList.add("is-open");
    dishModal.inert = false;
    dishModal.setAttribute("aria-hidden", "false");
    completeDishButton.focus({ preventScroll: true });
}

function closeDishModal(focusTarget = dishButton) {
    if (dishModal.contains(document.activeElement)) {
        const target = focusTarget instanceof HTMLElement && !focusTarget.hidden ? focusTarget : photoPickerLabel;
        target.focus({ preventScroll: true });
    }

    dishModal.classList.remove("is-open");
    dishModal.setAttribute("aria-hidden", "true");
    dishModal.inert = true;
}

function createDishList() {
    dishList.innerHTML = "";

    CONFIG.dishes.forEach((dish) => {
        const label = document.createElement("label");
        label.className = "dish-option";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = dish.id;
        checkbox.checked = state.selectedDishIds.has(dish.id);

        const img = document.createElement("img");
        img.className = "dish-thumb";
        img.src = imagePath(dish.fileName);
        img.alt = "";
        img.onerror = () => {
            img.removeAttribute("src");
            img.classList.add("is-fallback");
        };

        const name = document.createElement("span");
        name.className = "dish-name";
        if (dish.id === "eggTart") {
            name.classList.add("dish-name-small");
        }
        name.textContent = dish.name;

        label.append(checkbox, img, name);
        dishList.append(label);
    });

    syncDishSelectionLimit();
}

function syncDishSelectionLimit() {
    const checkboxes = [...dishList.querySelectorAll("input[type='checkbox']")];
    const checkedCount = checkboxes.filter((checkbox) => checkbox.checked).length;
    const shouldDisableUnchecked = checkedCount >= CONFIG.maxDishSelection;

    checkboxes.forEach((checkbox) => {
        checkbox.disabled = shouldDisableUnchecked && !checkbox.checked;
    });
}

function completeDishSelection() {
    const checkedInputs = dishList.querySelectorAll("input:checked");
    state.selectedDishIds = new Set([...checkedInputs].map((input) => input.value));

    if (state.selectedDishIds.size === 0) {
        return;
    }

    state.mealAdded = true;
    render();
    closeDishModal(saveButton);
}

function dataUrlToBlob(dataUrl) {
    const [metadata, content] = dataUrl.split(",");
    const mime = metadata.match(/:(.*?);/)?.[1] || "image/png";
    const binary = atob(content);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }

    return new Blob([bytes], { type: mime });
}

function getCanvasBlob() {
    return dataUrlToBlob(canvas.toDataURL("image/png"));
}

function downloadBlob(blob) {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.download = SAVE_FILE_NAME;
    link.href = url;
    document.body.append(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function canShareFile(file) {
    if (!navigator.share || typeof navigator.canShare !== "function") {
        return false;
    }

    return navigator.canShare({ files: [file] });
}

function isShareCancelled(error) {
    return error.name === "AbortError";
}

async function saveCanvas() {
    saveButton.disabled = true;
    saveButton.textContent = "저장 중";

    try {
        const blob = getCanvasBlob();
        const file = new File([blob], SAVE_FILE_NAME, { type: blob.type });

        if (canShareFile(file)) {
            await navigator.share({
                files: [file],
                title: "밥 차려주기",
            });
        } else {
            downloadBlob(blob);
        }
    } catch (error) {
        if (isShareCancelled(error)) {
            return;
        }

        try {
            downloadBlob(getCanvasBlob());
        } catch {
            window.alert("이미지를 저장하지 못했습니다. Safari에서 다시 시도해 주세요.");
        }
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = SAVE_BUTTON_TEXT;
    }
}

photoInput.addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const image = new Image();
        image.onload = () => {
            state.userPhoto = image;
            state.mealAdded = false;
            state.selectedDishIds.clear();
            render();
        };
        image.src = reader.result;
    };
    reader.readAsDataURL(file);
});

dishButton.addEventListener("click", () => {
    createDishList();
    openDishModal();
});

closeModalButton.addEventListener("click", () => closeDishModal(dishButton));
completeDishButton.addEventListener("click", completeDishSelection);
saveButton.addEventListener("click", saveCanvas);
dishList.addEventListener("change", syncDishSelectionLimit);

dishModal.addEventListener("click", (event) => {
    if (event.target === dishModal) {
        closeDishModal();
    }
});

window.addEventListener("resize", render);

loadAssets();
render();

if (document.fonts) {
    document.fonts.ready.then(render);
}
