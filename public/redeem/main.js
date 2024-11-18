document
  .getElementById("redeemForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const code = document.getElementById("code").value;
    const resultMessage = document.getElementById("resultMessage");

    resultMessage.innerHTML = `
    <div class="spinner"></div>
    <span>Processing...</span>
  `;

    try {
      const response = await fetch("/api/redeem/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, code }),
      });

      if (response.ok) {
        const data = await response.json();
        resultMessage.innerHTML = `
      <span class="success">Coupon successfully redeemed!</span>
    `;
      } else {
        // 에러 처리
        const errorData = await response.json();
        resultMessage.innerHTML = `
      <span class="error">Error: ${errorData.error.message}</span>
    `;
      }
    } catch (error) {
      resultMessage.innerHTML = `
      <span class="error">An error occurred. Please try again.</span>
    `;
    }
  });
