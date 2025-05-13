const tabsBtns = document.querySelectorAll(".tabs-nav button");
const tabsItem = document.querySelectorAll(".tabs-item");
console.log(tabsItem);

function hideTabs() {
    tabsItem.forEach(item => item.classList.add("hide"));
    tabsBtns.forEach(item => item.classList.remove("active"));
}

function showTab(index) {
    tabsItem[index].classList.remove("hide");
    tabsBtns[index].classList.add("active");
}


hideTabs();
showTab(2);

tabsBtns.forEach((btn, index) => btn.addEventListener("click", () => {
    hideTabs();
    showTab(index);
}));