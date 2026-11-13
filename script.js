/*
=====================================================================
  银行卡信息表单 · 需求 + 自测清单（写完 JS 后这段会删掉）
=====================================================================

【HTML 里已经有的东西】
  卡片预览：#card-number  #card-name  #card-month  #card-year  #card-cvc
            它们现在的文字就是默认值（0000 0000 0000 0000 / Jane Appleseed / 00 / 00 / 000）
  表单：    #card-form，5 个 input：name / number / month / year / cvc
            每个 input 有 data-preview="卡片上对应元素的 id"
            每个 input 有 aria-describedby="自己的错误元素 id"
            ⚠️ month 和 year 共用同一个错误元素 #exp-error
  完成状态：#complete（hidden，tabindex="-1"），里面的按钮 #continue-btn
  CSS 已写好：input[aria-invalid="true"] 会显示红框；[hidden] 会隐藏

【用户旅程】
  1. 打开页面
     → 卡片显示默认值，表单为空

  2. 在任意输入框里打字
     → 卡片上对应的位置实时同步
     → 把输入框清空时，卡片那一格恢复默认值

  3. 输入卡号
     → 每 4 个字符自动加一个空格（输入框和卡片都是这样显示）
     → 字母不要自动删掉（否则用户永远看不到 "Wrong format" 错误）

  4. 点 Confirm，按顺序检查，每个字段只显示第一条没通过的错误：
       name    空 → "Can't be blank"
       number  空 → "Can't be blank"
               去掉空格后不是纯数字 → "Wrong format, numbers only"
               去掉空格后不是 16 位 → "Card number must be 16 digits"
       month   空 → "Can't be blank"
               不是 2 位数字 → "Wrong format, numbers only"
               不在 01–12 之间 → "Invalid month"
       year    空 → "Can't be blank"
               不是 2 位数字 → "Wrong format, numbers only"
       cvc     空 → "Can't be blank"
               不是 3 位数字 → "Wrong format, numbers only"

  5. 有错误
     → 每个出错的输入框变红，下面显示错误文字
     → 光标跳到第一个出错的输入框
     → MM / YY 共用一个提示：两个都错时，显示 month 的错误

  6. 用户修改某个字段
     → 这个字段的红框消失
     → 它的错误文字消失（MM / YY：两个都不红了，共用的提示才消失）

  7. 全部正确，点 Confirm
     → 表单隐藏，完成状态显示，焦点移到完成状态
     → 卡片保持用户填的内容

  8. 点 Continue
     → 表单清空，卡片全部恢复默认值
     → 回到表单，光标在 Cardholder Name

【自测清单】
  [ ] 输入姓名，卡片上的名字同步；删光后变回 Jane Appleseed
  [ ] 输入 1234567812345678，输入框和卡片都显示 1234 5678 1234 5678
  [ ] 卡号里打一个字母，提交后显示 "Wrong format, numbers only"
  [ ] 全部留空提交：5 个框都红，4 条错误文字（MM/YY 共用一条），光标在姓名框
  [ ] MM 填 09、YY 留空提交：只有 YY 红，共用提示显示 "Can't be blank"
  [ ] MM 填 13：显示 "Invalid month"
  [ ] 在出错的 CVC 里输入：只有 CVC 的错误消失，其他不变
  [ ] 全部填对提交：页面不刷新，显示 Thank you，卡片保留内容
  [ ] 点 Continue：表单空，卡片全部是默认值，光标在姓名框
  [ ] 输入前后带空格的姓名，trim 之后能通过
=====================================================================
*/

const form = document.getElementById("card-form");
const completeCtn = document.getElementById("complete");

const rules = {
  name: [[(v) => v !== "", "Can't be blank"]],
  number: [
    [(v) => v !== "", "Can't be blank"],
    [(v) => /^\d+$/.test(v.replace(/\s/g, "")), "Wrong format, numbers only"],
    [
      (v) => /^\d{16}$/.test(v.replace(/\s/g, "")),
      "Card number must be 16 digits",
    ],
  ],
  month: [
    [(v) => v !== "", "Can't be blank"],
    [(v) => /^\d{2}$/.test(v), "Wrong format, numbers only"],
    [(v) => /^(0[1-9]|1[0-2])$/.test(v), "Invalid month"],
  ],
  year: [
    [(v) => v !== "", "Can't be blank"],
    [(v) => /^\d{2}$/.test(v), "Wrong format, numbers only"],
  ],
  cvc: [
    [(v) => v !== "", "Can't be blank"],
    [(v) => /^\d{3}$/.test(v), "Wrong format, numbers only"],
  ],
};

function numberInputFormatter(value) {
  const groups = value.replace(/\s/g, "").match(/.{1,4}/g) ?? [];
  return groups.join(" ");
}

function validate(value, rules) {
  for (const [test, message] of rules) {
    if (!test(value)) return message;
  }
  return "";
}

function validateField(input) {
  const error = validate(input.value.trim(), rules[input.name]);
  const errorMsg = document.getElementById(
    input.getAttribute("aria-describedby"),
  );
  errorMsg.textContent = error;
  errorMsg.hidden = !error;
  input.setAttribute("aria-invalid", String(Boolean(error)));
  return !error;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const fields = [...form.elements].filter((el) => el.name);
  const allOk = fields.map(validateField).every(Boolean);
  if (!allOk) {
    completeCtn.hidden = true;
    const firstInvalid = fields.find(
      (el) => el.getAttribute("aria-invalid") === "true",
    );
    firstInvalid.focus();
    return;
  }
  form.hidden = true;
  completeCtn.hidden = false;
  completeCtn.focus();
});

form.addEventListener("input", (e) => {
  const input = e.target;
  input.setAttribute("aria-invalid", "false");
  document.getElementById(input.getAttribute("aria-describedby")).hidden = true;
  completeCtn.hidden = true;
});

form.addEventListener("input", (e) => {
  const input = e.target;
  if (input.name === "number") {
    input.value = numberInputFormatter(input.value);
  }
});
