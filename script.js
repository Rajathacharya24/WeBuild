const $ = (selector) => document.querySelector(selector);

const profile = {
  name: "Aarav Rao",
  role: "Product Designer & Founder",
  location: "Bengaluru, India",
  email: "aarav@webuild.io",
  phone: "+91 98765 43210",
  website: "aarav.design",
  bio: "Building clean, human-centred digital products. Currently exploring tools that help early-stage founders ship faster.",
};

const modal = $("#editModal");
const form = $("#editForm");
const toast = $("#toast");
let toastTimer;

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function renderProfile() {
  $("#displayName").textContent = profile.name;
  $("#displayRole").textContent = profile.role || "Member";
  $("#displayLocation").textContent = profile.location || "Not set";
  $("#displayEmail").textContent = profile.email;
  $("#displayPhone").textContent = profile.phone || "Not set";
  $("#displayWebsite").textContent = profile.website || "Not set";
  $("#displayBio").textContent = profile.bio || "";
  $("#avatar").textContent = initials(profile.name) || "WB";
  $("#mapPill").textContent = profile.location || "Location";
  document.querySelector(".map-card p").textContent = `${profile.location || "Location"} — open to remote work`;
}

function fillForm() {
  form.elements.name.value = profile.name;
  form.elements.role.value = profile.role;
  form.elements.location.value = profile.location;
  form.elements.email.value = profile.email;
  form.elements.phone.value = profile.phone;
  form.elements.website.value = profile.website;
  form.elements.bio.value = profile.bio;
}

function openModal() {
  fillForm();
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  form.elements.name.focus();
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

$("#editProfileBtn").addEventListener("click", openModal);
$("#headerEdit").addEventListener("click", openModal);

modal.querySelectorAll("[data-close]").forEach((el) => {
  el.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) closeModal();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  profile.name = data.get("name").trim();
  profile.role = data.get("role").trim();
  profile.location = data.get("location").trim();
  profile.email = data.get("email").trim();
  profile.phone = data.get("phone").trim();
  profile.website = data.get("website").trim();
  profile.bio = data.get("bio").trim();
  renderProfile();
  closeModal();
  showToast("Profile updated");
});

// Billing toggle
const billingOptions = document.querySelectorAll(".billing-option");
const prices = document.querySelectorAll(".price");

billingOptions.forEach((option) => {
  option.addEventListener("click", () => {
    billingOptions.forEach((btn) => btn.classList.remove("active"));
    option.classList.add("active");
    const period = option.dataset.period;
    prices.forEach((price) => {
      price.textContent = price.dataset[period];
    });
    document.querySelectorAll(".period").forEach((el) => {
      if (!el.closest(".plan-price")) return;
      el.textContent = period === "yearly" ? "/mo, billed yearly" : "/mo";
    });
  });
});

// Ask form
$("#askForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = $("#askEmail");
  if (!input.value.trim()) return;
  showToast("Thanks! We'll reach out shortly.");
  input.value = "";
});

// Plan buttons
document.querySelectorAll(".plan-card .btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const plan = btn.closest(".plan-card").querySelector("h3").textContent;
    showToast(`${plan} plan selected`);
  });
});

// Active nav on scroll
const sections = ["profile", "map", "plans"].map((id) => document.getElementById(id));
const navLinks = document.querySelectorAll(".nav-link");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);

sections.forEach((section) => observer.observe(section));

renderProfile();
