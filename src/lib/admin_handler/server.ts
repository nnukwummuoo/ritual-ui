export async function allrequestedmodel(accessToken: string) {
  const res = await fetch(
    `https://mmekoapi.onrender.com/request/all-requests`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Error fetching requests: ${res.status}`);
  }

  return res.json();
}

export async function handleApprove(userId: string, accessToken: string) {
  const res = await fetch(
    `https://mmekoapi.onrender.com/request/accept-model/${userId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Error fetching requests: ${res.status}`);
  }

  return res.json();
}

export async function handleReject(userId: string, accessToken: string) {
  const res = await fetch(
    `https://mmekoapi.onrender.com/request/reject-model/${userId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!res.ok) {
    throw new Error(`Error fetching requests: ${res.status}`);
  }

  return res.json();
}
