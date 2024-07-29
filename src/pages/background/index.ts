chrome.action.onClicked.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.captureVisibleTab(
      tabs[0].windowId,
      { format: "png" },
      async (dataUrl) => {
        // const BACKEND_URL = "http://localhost:3000";
        const BACKEND_URL = "https://wat-server.vercel.app";
        // const FRONTEND_URL = "http://localhost:5173";
        const FRONTEND_URL = "https://wat-client.vercel.app/";

        // Fetch IP address
        const response = await fetch("https://hutils.loxal.net/whois");
        const _data = await response.json();
        const ipAddress = _data.ip;
        const timestamp = new Date().getTime();
        const cacheKey = `${timestamp}_${ipAddress}.png`;
        const webpageUrl = tabs[0].url as string;

        // Convert base64 image to binary
        const base64Image = dataUrl.split(",")[1];
        const binaryString = atob(base64Image);
        const len = binaryString.length;
        const binaryArray = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          binaryArray[i] = binaryString.charCodeAt(i);
        }

        // Convert binary array to blob
        const blob = new Blob([binaryArray], { type: "image/png" });

        // Prepare data to send to backend
        const formData = new FormData();
        formData.append("image", blob, cacheKey);
        formData.append("webpageUrl", webpageUrl);
        formData.append("ipAddress", ipAddress);
        formData.append("timestamp", timestamp.toString());
        formData.append("cacheKey", cacheKey);

        // Send data to backend
        await fetch(`${BACKEND_URL}/archive-candidate`, {
          method: "POST",
          body: formData,
        });
        // const backendData = await backendResponse.json();

        // Open a new tab after sending data to backend
        chrome.tabs.create({ url: `${FRONTEND_URL}/${cacheKey}` });
        // console.log("Backend Response:", backendData);
      }
    );
  });
});
