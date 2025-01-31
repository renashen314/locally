async function searchShops(itemName, userAddress, radius) {
  const response = await fetch("/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      itemName,
      userAddress,
      radius,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch shops");
  }

  return response.json();
}

// Example usage
searchShops("cable", "123 Main St, New York, NY", 5)
  .then((shops) => {
    console.log("Shops found:", shops);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

