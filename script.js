
document.addEventListener("DOMContentLoaded", function() {
    const menuItems = document.querySelectorAll("#menu li");
    menuItems.forEach(item => {
        item.addEventListener("click", function() {
            const tabId = this.getAttribute("data-tab");
            showTab(tabId);
        });
    });
    renderLibrary();
    showTab('history');
});

function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
}

function saveMemory() {
    const files = document.getElementById("fileInput").files;
    const iconFile = document.getElementById("iconInput").files[0];
    const text = document.getElementById("textInput").value;
    const dateInput = document.getElementById("dateInput").value;
    if (!dateInput) {
        document.getElementById("status").innerText = "Wybierz datę odblokowania!";
        return;
    }
    const unlockDate = new Date(dateInput).getTime();
    const timestamp = Date.now();
    const id = 'memory_' + timestamp;
    const data = {
        id: id,
        text: text,
        files: [],
        icon: null,
        unlockDate: unlockDate,
        created: timestamp
    };
    let processedFiles = 0;
    if (iconFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            data.icon = e.target.result;
            processFiles();
        };
        reader.readAsDataURL(iconFile);
    } else {
        processFiles();
    }
    function processFiles() {
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    data.files.push({
                        name: files[i].name,
                        content: e.target.result
                    });
                    processedFiles++;
                    if (processedFiles === files.length) {
                        saveToLocalStorage(data);
                    }
                };
                reader.readAsDataURL(files[i]);
            }
        } else {
            saveToLocalStorage(data);
        }
    }
}

function saveToLocalStorage(memory) {
    let memories = JSON.parse(localStorage.getItem("kapsula_memories")) || [];
    memories.push(memory);
    localStorage.setItem("kapsula_memories", JSON.stringify(memories));
    document.getElementById("status").innerText = "Wspomnienie zapisane!";
    renderLibrary();
}

function renderLibrary() {
    const container = document.getElementById("memoryLibrary");
    container.innerHTML = "";
    const memories = JSON.parse(localStorage.getItem("kapsula_memories")) || [];
    memories.forEach(memory => {
        const now = Date.now();
        const isUnlocked = now >= memory.unlockDate;
        const timeLeft = Math.ceil((memory.unlockDate - now) / (1000 * 60 * 60 * 24));
        const div = document.createElement("div");
        div.className = "memoryItem";
        if (isUnlocked) {
            div.innerHTML = `${memory.icon ? `<img src="${memory.icon}" alt="Ikona">` : ''}` +
                            `<div><strong>${new Date(memory.created).toLocaleDateString()}</strong>: ` +
                            `<span style="color:#90ee90;">ODBLOCKOWANE</span><br>` +
                            `Treść: ${memory.text}<br>` +
                            `${memory.files.map(file => `<a href="${file.content}" download="${file.name}">${file.name}</a>`).join(', ')}</div>`;
        } else {
            div.innerHTML = `${memory.icon ? `<img src="${memory.icon}" alt="Ikona">` : ''}` +
                            `<div><strong>${new Date(memory.created).toLocaleDateString()}</strong>: ` +
                            `<span style="color:#f08080;">ZABLOKOWANE</span> (Odblokowanie za ${timeLeft} dni)<br>` +
                            `<em>Zawartość ukryta</em></div>`;
        }
        container.appendChild(div);
    });
}
