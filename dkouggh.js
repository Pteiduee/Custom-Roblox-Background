const site = window.location.href;
if (site.includes("https://www.roblox.com/my/avatar")) {
  window.addEventListener('DOMContentLoaded', async () => {
    // helpers for storage and DOM
    const hasChromeStorage = typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;
    const storageGet = (key) => new Promise((resolve) => {
      if (!hasChromeStorage) {
        resolve(localStorage.getItem(key));
      } else {
        chrome.storage.local.get([key], (res) => resolve(res[key] ?? null));
      }
    });
    const storageSet = (key, value) => new Promise((resolve) => {
      if (!hasChromeStorage) {
        localStorage.setItem(key, value);
        resolve();
      } else {
        chrome.storage.local.set({ [key]: value }, () => resolve());
      }
    });
    const storageRemove = (key) => new Promise((resolve) => {
      if (!hasChromeStorage) {
        localStorage.removeItem(key);
        resolve();
      } else {
        chrome.storage.local.remove([key], () => resolve());
      }
    });
    const findAvatarImg = () => {
      const selectors = [
        ".avatar-upsell .part1 .avatar-thumbnail-upsell img",
        ".avatar-thumbnail-upsell img",
        ".avatar-upsell img",
        ".avatar-card img",
        "img[src*='avatar']"
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) return el;
      }
      return null;
    };

    // إذا كانت الخلفية محفوظة في storage، قم بتعيينها عند تحميل الصفحة
    const existingBackground = await storageGet("background");
    if (existingBackground) {
      const bgStyle = `
            <style id="bgimage" class="texture" type="text/css">
                .avatar-back {
                    background-image: url('${existingBackground}') !important;
                    background-size: cover !important;
                    background-position: center center !important;
                }
                .avatar-upsell .content {
                    background-image: url('${existingBackground}') !important;
                    background-size: 100% auto !important;
                    background-position: top !important;
                    background-repeat: no-repeat !important;
                }
            </style>`;
      document.head.insertAdjacentHTML("beforeend", bgStyle);
    }

    // CSS لتصميم الأزرار
    const customStyles = document.createElement('style');
    customStyles.textContent = `
            .custom-file-upload {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                gap: 10px;
                margin: 20px;
            }
            .custom-button {
                padding: 8px 16px;
                background-color: #007bff;
                color: #fff;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: bold;
                cursor: pointer;
                transition: background-color 0.3s ease, transform 0.2s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .custom-button:hover {
                background-color: #0056b3;
                transform: translateY(-1px);
            }
            .custom-button:active {
                background-color: #004085;
                transform: translateY(0);
            }
            .custom-file-label {
                padding: 6px 12px;
                background-color: #6c757d;
                color: #fff;
                border-radius: 6px;
                font-size: 12px;
                font-weight: bold;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }
            .custom-file-label:hover {
                background-color: #5a6268;
            }
            .custom-file-label:active {
                background-color: #495057;
            }
        `;
    document.head.appendChild(customStyles);

    // إنشاء الحاوية للأزرار
    const container = document.createElement("div");
    container.className = "custom-file-upload";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.id = "backgroundFile";
    fileInput.style.display = "none";

    const label = document.createElement("label");
    label.htmlFor = "backgroundFile";
    label.className = "custom-file-label";
    label.textContent = "Choose File";

    const saveButton = document.createElement("button");
    saveButton.id = "saveBackgroundButton";
    saveButton.textContent = "Save New Background";
    saveButton.className = "custom-button";

    const hideButton = document.createElement("button");
    hideButton.id = "hideAvatarButton";
    hideButton.textContent = "Hide Avatar";
    hideButton.className = "custom-button";

    // إضافة زر "Delete Modifications"
    const deleteButton = document.createElement("button");
    deleteButton.id = "deleteModificationsButton";
    deleteButton.textContent = "Delete Modifications";
    deleteButton.className = "custom-button";

    container.appendChild(label);
    container.appendChild(fileInput);
    container.appendChild(saveButton);
    container.appendChild(hideButton);
    container.appendChild(deleteButton); // إضافة الزر الجديد
    document.body.appendChild(container);

    // عند اختيار ملف، قم بتحديث اسم الملف المعروض
    fileInput.addEventListener('change', function() {
      label.textContent = this.files[0] ? this.files[0].name : "Choose File";
    });

    // عند النقر على زر الحفظ
    saveButton.addEventListener("click", () => {
      const file = fileInput.files[0];
      if (file) {
        // guard against very large files (10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert("Selected image is too large. Please choose a file under 10MB.");
          return;
        }
        const reader = new FileReader();
        reader.onload = async (event) => {
          // حذف الخلفية القديمة
          if (await storageGet("background")) {
            await storageRemove("background");
          }

          // إزالة النمط القديم
          const oldStyle = document.getElementById("bgimage");
          if (oldStyle) oldStyle.remove();

          const base64Image = event.target.result;
          const newStyle = document.createElement("style");
          newStyle.id = "bgimage";
          newStyle.textContent = `
                        .avatar-back {
                            background-image: url('${base64Image}') !important;
                            background-size: cover !important;
                            background-position: center center !important;
                        }
                        .avatar-upsell .content {
                            background-image: url('${base64Image}') !important;
                            background-size: 100% auto !important;
                            background-position: top !important;
                            background-repeat: no-repeat !important;
                        }`;
          document.head.appendChild(newStyle);
          await storageSet("background", base64Image);
          fileInput.value = '';
          label.textContent = "Choose File";
        };
        reader.readAsDataURL(file);
      } else {
        alert("need to select an image file or GIF!");
      }
    });

    // عند النقر على زر إخفاء الصورة
    hideButton.addEventListener("click", async () => {
      const avatarImg = findAvatarImg();
      if (avatarImg) {
        if (avatarImg.style.display === "none") {
          avatarImg.style.display = "";
          hideButton.textContent = "Hide Avatar";
          await storageSet("hideAvatar", "false");
        } else {
          avatarImg.style.display = "none";
          hideButton.textContent = "Show Avatar";
          await storageSet("hideAvatar", "true");
        }
      }
    });

    // استعادة حالة الإخفاء من storage + راقب حتى يظهر العنصر
    const applyHideState = async () => {
      const hideAvatar = await storageGet("hideAvatar");
      const avatarImg = findAvatarImg();
      if (avatarImg) {
        if (hideAvatar === "true") {
          avatarImg.style.display = "none";
          hideButton.textContent = "Show Avatar";
        } else {
          avatarImg.style.display = "";
          hideButton.textContent = "Hide Avatar";
        }
      }
    };
    await applyHideState();
    if (!findAvatarImg()) {
      const observer = new MutationObserver(() => {
        const img = findAvatarImg();
        if (img) {
          applyHideState();
          observer.disconnect();
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    // عند النقر على زر "Delete Modifications"
    deleteButton.addEventListener("click", async () => {
      // إزالة الأنماط المضافة للخلفية
      const bgStyleElement = document.getElementById("bgimage");
      if (bgStyleElement) bgStyleElement.remove();

      // حذف البيانات من storage
      await storageRemove("background");
      await storageRemove("hideAvatar");

      // إعادة العناصر المرئية إلى حالتها الأصلية
      const avatarImg = findAvatarImg();
      if (avatarImg) {
        avatarImg.style.display = "";
      }

      // إعادة تعيين نص زر "Hide Avatar"
      hideButton.textContent = "Hide Avatar";
    });
  });
}
