const site = window.location.href;
if (site.includes("https://www.roblox.com/my/avatar")) {
  window.addEventListener('DOMContentLoaded', () => {
    // إذا كانت الخلفية محفوظة في localStorage، قم بتعيينها عند تحميل الصفحة
    if (localStorage.getItem("background")) {
      const bgStyle = `
            <style id="bgimage" class="texture" type="text/css">
                .avatar-back {
                    background-image: url('${localStorage.getItem("background")}') !important;
                    background-size: cover !important;
                    background-position: center center !important;
                }
                .avatar-upsell .content {
                    background-image: url('${localStorage.getItem("background")}') !important;
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
    hideButton.textContent = "Show Avatar";
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
        const reader = new FileReader();
        reader.onload = (event) => {
          // حذف الخلفية القديمة
          if (localStorage.getItem("background")) {
            localStorage.removeItem("background");
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
          localStorage.setItem("background", base64Image);
          fileInput.value = '';
          label.textContent = "Choose File";
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please select an image file!");
      }
    });

    // عند النقر على زر إخفاء الصورة
    hideButton.addEventListener("click", () => {
      const avatarImg = document.querySelector(".avatar-upsell .part1 .avatar-thumbnail-upsell img");
      if (avatarImg) {
        if (avatarImg.style.display === "none") {
          avatarImg.style.display = "";
          hideButton.textContent = "Hide Avatar";
          localStorage.setItem("hideAvatar", "false");
        } else {
          avatarImg.style.display = "none";
          hideButton.textContent = "Show Avatar";
          localStorage.setItem("hideAvatar", "true");
        }
      }
    });

    // استعادة حالة الإخفاء من localStorage
    const hideAvatar = localStorage.getItem("hideAvatar");
    if (hideAvatar === "true") {
      const avatarImg = document.querySelector(".avatar-upsell .part1 .avatar-thumbnail-upsell img");
      if (avatarImg) {
        avatarImg.style.display = "none";
        hideButton.textContent = "Show Avatar";
      }
    }

    // عند النقر على زر "Delete Modifications"
    deleteButton.addEventListener("click", () => {
      // إزالة الأنماط المضافة للخلفية
      const bgStyleElement = document.getElementById("bgimage");
      if (bgStyleElement) bgStyleElement.remove();

      // حذف البيانات من localStorage
      localStorage.removeItem("background");
      localStorage.removeItem("hideAvatar");

      // إعادة العناصر المرئية إلى حالتها الأصلية
      const avatarImg = document.querySelector(".avatar-upsell .part1 .avatar-thumbnail-upsell img");
      if (avatarImg) {
        avatarImg.style.display = "";
      }

      // إعادة تعيين نص زر "Hide Avatar"
      hideButton.textContent = "Hide Avatar";
    });
  });
}