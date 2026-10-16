console.log("[主要] DoorTech™ 已启动");
console.log("[主要] 你只是想开个门。");

const 语言按钮 = document.getElementById("语言按钮");
const 语言菜单 = document.getElementById("语言菜单");

语言按钮.addEventListener("click", (e) => {
    e.stopPropagation();
    语言菜单.classList.toggle("显示");
});

document.addEventListener("click", () => {
    语言菜单.classList.remove("显示");
});

语言菜单.addEventListener("click", (e) => {
    e.stopPropagation();
});