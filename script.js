const form = document.getElementById("card-form");
const completeCtn = document.getElementById("complete");
const continueBtn = document.getElementById("continue-btn");

const previewInputs = document.querySelectorAll("[data-preview]");
const defaults = {};
previewInputs.forEach((el) => {
  const targetEl = document.getElementById(el.dataset.preview);
  defaults[el.dataset.preview] = targetEl.textContent;
});

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

function validate(value, list) {
  for (const [test, message] of list) {
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

  // Format card number
  if (input.name === "number") {
    input.value = numberInputFormatter(input.value);
  }

  // Clear this field's error
  input.setAttribute("aria-invalid", "false");
  document.getElementById(input.getAttribute("aria-describedby")).hidden = true;

  // Sync card preview
  const previewEl = document.getElementById(input.dataset.preview);
  previewEl.textContent = input.value.trim() || defaults[input.dataset.preview];
});

continueBtn.addEventListener("click", () => {
  form.reset();
  for (const [id, text] of Object.entries(defaults)) {
    document.getElementById(id).textContent = text;
  }
  form.hidden = false;
  completeCtn.hidden = true;
  form.elements["name"].focus();
});
