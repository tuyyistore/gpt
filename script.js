document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("contactForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form).entries());
  console.log("CONTACT_DEMO:", data);

  msg.textContent = "Terkirim (demo). Kalau mau, aku bisa sambungin tombol ini ke WhatsApp / email.";
  form.reset();
});
