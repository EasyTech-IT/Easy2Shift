/* ==========================================================================
   Easy2Shift Logistik – JavaScript
   Navigation, FAQ-Akkordeon, Form-Validierung, Consent, Lazy-Load, Back-to-top
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Geschützte E-Mail-Links ---------- */
  document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
    const mailto = link.getAttribute("href");
    const email = mailto.slice("mailto:".length).split("?")[0];
    let revealTimer;

    link.classList.add("protected-email");
    link.dataset.mailto = mailto;
    link.removeAttribute("href");
    link.setAttribute("role", "button");
    link.setAttribute("tabindex", "0");
    link.setAttribute("aria-label", "E-Mail-Adresse anzeigen");

    const reveal = (event) => {
      event.preventDefault();
      window.clearTimeout(revealTimer);
      link.classList.add("protected-email--revealed");
      link.setAttribute("href", `mailto:${email}`);
      link.setAttribute("aria-label", `${email} - E-Mail senden`);
      revealTimer = window.setTimeout(() => {
        link.classList.remove("protected-email--revealed");
        link.removeAttribute("href");
        link.setAttribute("aria-label", "E-Mail-Adresse anzeigen");
      }, 5000);
    };

    link.addEventListener("click", reveal);
    link.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") reveal(event);
    });
  });

  /* ---------- Flip Cards (mobile tap) ---------- */
  document.querySelectorAll(".flip-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (window.innerWidth < 1024) {
        document.querySelectorAll(".flip-card--flipped").forEach((c) => {
          if (c !== card) c.classList.remove("flip-card--flipped");
        });
        card.classList.toggle("flip-card--flipped");
      }
    });
  });

  /* ---------- Mobile Navigation ---------- */
  const toggle = document.querySelector(".nav__toggle");
  const nav = document.querySelector(".nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("nav--open");
    });

    // Sub-dropdown toggle on mobile
    document
      .querySelectorAll(".nav__item--has-dropdown > .nav__link")
      .forEach((link) => {
        link.addEventListener("click", (e) => {
          if (window.innerWidth < 1024) {
            e.preventDefault();
            link.parentElement.classList.toggle("nav__item--open");
          }
        });
      });
  }

  /* ---------- FAQ Akkordeon ---------- */
  document.querySelectorAll(".faq-item__question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      const answer = btn.nextElementSibling;
      answer.classList.toggle("faq-item__answer--open");
    });
  });

  /* ---------- Formular-Validierung ---------- */
  document.querySelectorAll(".form[data-validate]").forEach((form) => {
    form.setAttribute("novalidate", "");

    form.addEventListener("submit", (e) => {
      let valid = true;
      const mailtoRecipient = form.dataset.mailtoRecipient;

      // Reset errors
      form
        .querySelectorAll(".form__group--error")
        .forEach((g) => g.classList.remove("form__group--error"));

      // Required fields
      form.querySelectorAll("[required]").forEach((field) => {
        const group = field.closest(".form__group");
        if (!field.value.trim()) {
          valid = false;
          if (group) group.classList.add("form__group--error");
        }
      });

      // Email pattern
      form.querySelectorAll('input[type="email"]').forEach((email) => {
        const group = email.closest(".form__group");
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.value && !pattern.test(email.value)) {
          valid = false;
          if (group) group.classList.add("form__group--error");
        }
      });

      // Consent checkbox
      form
        .querySelectorAll('input[type="checkbox"][required]')
        .forEach((cb) => {
          const group = cb.closest(".form__group");
          if (!cb.checked) {
            valid = false;
            if (group) group.classList.add("form__group--error");
          }
        });

      if (!valid) {
        e.preventDefault();
        const firstError = form.querySelector(".form__group--error");
        if (firstError)
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      if (mailtoRecipient) {
        e.preventDefault();

        const formData = new FormData(form);
        const serviceLabel = getServiceLabel(form);
        const subject = serviceLabel
          ? `Neue Anfrage: ${serviceLabel}`
          : "Neue Anfrage ueber das Kontaktformular";
        const body = buildMailBody(formData, serviceLabel);

        window.location.href = `mailto:${encodeURIComponent(mailtoRecipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
    });

    // Live reset on input
    form.addEventListener("input", (e) => {
      const group = e.target.closest(".form__group");
      if (group) group.classList.remove("form__group--error");
    });
  });

  function getServiceLabel(form) {
    const serviceField = form.querySelector('[name="service"]');
    if (!serviceField || !serviceField.value) return "";

    const selectedOption = serviceField.options[serviceField.selectedIndex];
    return selectedOption ? selectedOption.text.trim() : "";
  }

  function buildMailBody(formData, serviceLabel) {
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const phone = (formData.get("phone") || "").toString().trim();
    const message = (formData.get("message") || "").toString().trim();

    return [
      "Hallo Easy2Shift,",
      "",
      "ich moechte eine Anfrage stellen.",
      "",
      `Name: ${name}`,
      `E-Mail: ${email}`,
      `Telefon: ${phone || "-"}`,
      `Gewuenschte Leistung: ${serviceLabel || "-"}`,
      "",
      "Nachricht:",
      message,
      "",
      "Viele Gruesse",
      name,
    ].join("\n");
  }

  /* ---------- Lazy Loading fallback ---------- */
  if ("IntersectionObserver" in window) {
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("loaded");
          imgObserver.unobserve(entry.target);
        }
      });
    });
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
      if (img.complete) {
        img.classList.add("loaded");
      } else {
        imgObserver.observe(img);
      }
    });
  } else {
    document
      .querySelectorAll('img[loading="lazy"]')
      .forEach((img) => img.classList.add("loaded"));
  }

  /* ---------- Back to Top ---------- */
  const btt = document.querySelector(".back-to-top");
  if (btt) {
    window.addEventListener(
      "scroll",
      () => {
        btt.classList.toggle("back-to-top--visible", window.scrollY > 400);
      },
      { passive: true },
    );
    btt.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" }),
    );
  }

  /* ---------- DSGVO Consent Banner ---------- */
  const banner = document.querySelector(".consent-banner");
  if (banner) {
    const accepted = localStorage.getItem("consent_accepted");
    if (!accepted) {
      banner.classList.add("consent-banner--visible");
    }
    const acceptBtn = banner.querySelector('[data-consent="accept"]');
    const declineBtn = banner.querySelector('[data-consent="decline"]');

    if (acceptBtn) {
      acceptBtn.addEventListener("click", () => {
        localStorage.setItem("consent_accepted", "all");
        banner.classList.remove("consent-banner--visible");
        loadAnalytics();
      });
    }
    if (declineBtn) {
      declineBtn.addEventListener("click", () => {
        localStorage.setItem("consent_accepted", "essential");
        banner.classList.remove("consent-banner--visible");
      });
    }

    if (accepted === "all") loadAnalytics();
  }

  function loadAnalytics() {
    if (document.querySelector('script[src*="googletagmanager"]')) return;
    // Replace G-XXXXXXXXXX with your actual GA4 Measurement ID
    const gtagId = "G-XXXXXXXXXX";
    const s = document.createElement("script");
    s.async = true;
    s.src =
      "https://www.googletagmanager.com/gtag/js?id=" +
      encodeURIComponent(gtagId);
    document.head.appendChild(s);
    s.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag("js", new Date());
      gtag("config", gtagId, { anonymize_ip: true });
    };
  }

  /* ---------- Smooth scroll for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* ---------- Process Timeline Animation ---------- */
  const processEl = document.getElementById("process-timeline");
  if (processEl && "IntersectionObserver" in window) {
    const processObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            processEl.classList.add("animate");
            processObs.unobserve(processEl);
          }
        });
      },
      { threshold: 0.3 },
    );
    processObs.observe(processEl);
  }

  /* ---------- Scroll Reveal Animation ---------- */
  if ("IntersectionObserver" in window) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal--visible");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));
  } else {
    document
      .querySelectorAll(".reveal")
      .forEach((el) => el.classList.add("reveal--visible"));
  }
});
