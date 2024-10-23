const apiUrl = "http://localhost:3000/order/buy";

const requestBody = {
  userId: "user1",
  stockSymbol: "TESLA",
  stockType: "yes",
  price: 100,
  quantity: 1,
};

const sendPostRequest = async () => {
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
};

const callApiMultipleTimes = (totalRequests, requestsPerSecond) => {
  let requestsSent = 0;

  const interval = setInterval(() => {
    for (
      let i = 0;
      i < requestsPerSecond && requestsSent < totalRequests;
      i++
    ) {
      sendPostRequest();
      requestsSent++;
    }

    if (requestsSent >= totalRequests) {
      clearInterval(interval);
    }
  }, 1000); // 1000 milliseconds = 1 second
};

// Call the API 500 times at a rate of 10 requests per second
callApiMultipleTimes(5000, 100);
