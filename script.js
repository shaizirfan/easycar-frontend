document.addEventListener("DOMContentLoaded", () => {
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");

  if (!userName || !userEmail) {
    alert("Please sign up or sign in before booking.");
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      sessionStorage.removeItem("welcomeShown");
      alert("You have been logged out.");
      window.location.href = "signin.html";
    });
  }

  document.getElementById("browseBtn")?.addEventListener("click", () => {
    document.getElementById("fleet")?.scrollIntoView({ behavior: "smooth" });
  });

  const title = document.getElementById("animated-title");
  if (title) {
    const text = title.textContent;
    title.textContent = "";
    text.split("").forEach((letter, index) => {
      const span = document.createElement("span");
      span.textContent = letter;
      span.style.opacity = "0";
      span.style.transform = "translateY(20px)";
      span.style.transition = `all 0.5s ease ${index * 0.1}s`;
      title.appendChild(span);
    });

    const animateIn = () => title.querySelectorAll("span").forEach((span, i) => {
      setTimeout(() => {
        span.style.opacity = "1";
        span.style.transform = "translateY(0)";
      }, i * 100);
    });

    const animateOut = () => title.querySelectorAll("span").forEach((span, i) => {
      setTimeout(() => {
        span.style.opacity = "0";
        span.style.transform = "translateY(20px)";
      }, i * 100);
    });

    const loop = () => {
      animateIn();
      setTimeout(() => {
        animateOut();
        setTimeout(loop, 2000);
      }, 3000);
    };

    loop();
  }

  window.filterCars = function (category) {
    document.querySelectorAll(".car-card").forEach((card) => {
      card.style.display = category === "all" || card.classList.contains(category) ? "block" : "none";
    });
  };

  document.querySelectorAll(".book-now").forEach(btn => {
    btn.addEventListener("click", () => {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        alert("Please sign in before booking.");
        window.location.href = "signin.html";
        return;
      }

      const card = btn.closest(".car-card");
      const carName = card.querySelector("h3")?.innerText || "Unknown";
      document.getElementById("selectedCar").value = carName;
      document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
    });
  });

  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        alert("You must sign in to make a booking.");
        window.location.href = "signin.html";
        return;
      }

      const car = document.getElementById("selectedCar").value;
      const pickup = document.getElementById("pickupLocation").value;
      const drop = document.getElementById("dropLocation").value;
      const pickupTime = document.getElementById("pickupTime").value;
      const dropTime = document.getElementById("dropTime").value;
      const details = document.getElementById("details").value;

      const card = Array.from(document.querySelectorAll(".car-card")).find(c => c.querySelector("h3")?.innerText === car);
      let priceText = card?.querySelector("p:nth-of-type(2)")?.innerText || "₹3000";
      let pricePerDay = parseInt(priceText.replace(/[^\d]/g, ""));
      const days = calculateDays(pickupTime, dropTime);
      const totalPrice = days * pricePerDay;

      const bookingData = {
        car,
        price: `₹${totalPrice}`,
        userEmail,
        pickupLocation: pickup,
        dropLocation: drop,
        pickupTime,
        dropTime,
        details
      };

      try {
        const res = await fetch("https://easycar-backend-production.up.railway.app/api/confirm-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData)
        });

        const data = await res.json();
        if (data.success) {
          alert("Booking submitted successfully!");
          showBookingStatus(bookingData, days);
          bookingForm.reset();
        } else {
          alert("Something went wrong!");
        }
      } catch (err) {
        alert("Booking Failed.");
        console.error(err);
      }
    });
  }

  function calculateDays(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.abs(e - s);
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  function showBookingStatus(data, days) {
    const statusDiv = document.getElementById("statusDetails");
    if (!statusDiv) return;

    statusDiv.innerHTML = `
      <h3>${data.car}</h3>
      <p><strong>Pickup Location:</strong> ${data.pickupLocation}</p>
      <p><strong>Drop Location:</strong> ${data.dropLocation}</p>
      <p><strong>Pickup Time:</strong> ${new Date(data.pickupTime).toLocaleString()}</p>
      <p><strong>Drop Time:</strong> ${new Date(data.dropTime).toLocaleString()}</p>
      <p><strong>Duration:</strong> ${days} day(s)</p>
      <p><strong>Total Price:</strong> ${data.price}</p>
      <p><strong>Mode of Payment:</strong> Cash</p>
      <p><strong>Additional Details:</strong> ${data.details || "None"}</p>
    `;
    document.getElementById("status").scrollIntoView({ behavior: "smooth" });
  }

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      fetch(contactForm.action, {
        method: contactForm.method,
        body: new FormData(contactForm),
        headers: { Accept: "application/json" }
      })
        .then(response => {
          if (response.ok) {
            alert("Thanks for your message!");
            contactForm.reset();
          } else {
            alert("Something went wrong. Please try again.");
          }
        })
        .catch(error => {
          alert("Error sending message.");
          console.error(error);
        });
    });
  }

  document.getElementById("hamburger")?.addEventListener("click", () => {
    document.getElementById("navLinks")?.classList.toggle("show");
  });

  if (userName && userEmail && !sessionStorage.getItem("welcomeShown")) {
    alert(`${userName} has signed in`);
    sessionStorage.setItem("welcomeShown", "true");
  }

  if (userEmail) {
    setTimeout(() => {
      fetch(`https://easycar-backend-production.up.railway.app/api/bookings/${userEmail}`)
        .then(res => res.json())
        .then(data => {
          const statusDiv = document.getElementById("statusDetails");
          if (!statusDiv) return;

          if (data.success && data.bookings.length > 0) {
            const latest = data.bookings[0];
            statusDiv.innerHTML = `
              <h3>${latest.car}</h3>
              <p><strong>Pickup Location:</strong> ${latest.pickupLocation}</p>
              <p><strong>Drop Location:</strong> ${latest.dropLocation}</p>
              <p><strong>Pickup Time:</strong> ${new Date(latest.pickupTime).toLocaleString()}</p>
              <p><strong>Drop Time:</strong> ${new Date(latest.dropTime).toLocaleString()}</p>
              <p><strong>Duration:</strong> ${calculateDays(latest.pickupTime, latest.dropTime)} day(s)</p>
              <p><strong>Total Price:</strong> ${latest.price}</p>
              <p><strong>Mode of Payment:</strong> Cash</p>
              <p><strong>Additional Details:</strong> ${latest.details || "None"}</p>
            `;
          } else {
            statusDiv.innerHTML = `<p>No bookings found for ${userEmail}. Make your first booking now!</p>`;
          }
        })
        .catch(err => {
          console.error("Error fetching booking data:", err);
          document.getElementById("statusDetails").innerHTML = `<p>Error loading booking status.</p>`;
        });
    }, 500);
  }
});
