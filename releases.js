(async () => {
  const repository = "https://github.com/yingchuan-media/yingchuan-releases";
  const endpoint = "https://api.github.com/repos/yingchuan-media/yingchuan-releases/releases/latest";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(endpoint, {
      credentials: "omit", redirect: "error", cache: "no-cache",
      headers: { Accept: "application/vnd.github+json" }, signal: controller.signal,
    });
    if (!response.ok || response.redirected || response.url !== endpoint ||
        !response.headers.get("content-type")?.startsWith("application/json")) throw new Error("release response");
    const maximum = 262144;
    if (Number(response.headers.get("content-length")) > maximum) throw new Error("release capacity");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let total = 0, text = "";
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > maximum) throw new Error("release capacity");
        text += decoder.decode(value, { stream: true });
      }
      text += decoder.decode();
    } finally {
      await reader.cancel();
    }
    const release = JSON.parse(text);
    const match = /^app-v((?:0|[1-9]\d{0,4})\.(?:0|[1-9]\d{0,4})\.(?:0|[1-9]\d{0,4}))(?:-[a-z][a-z0-9-]*)?$/.exec(release.tag_name);
    if (!match || !Number.isSafeInteger(release.id) || release.id <= 0 ||
        release.draft !== false || release.prerelease !== false ||
        release.html_url !== `${repository}/releases/tag/${release.tag_name}`) throw new Error("release identity");
    const version = match[1];
    const names = [
      `yingchuan-${version}-windows-x64.exe`, `yingchuan-${version}-windows-x64.zip`,
      ...["arm64-v8a", "armeabi-v7a", "x86_64"].map((abi) => `yingchuan-${version}-${abi}.apk`),
      `yingchuan-${version}-macos-arm64.dmg`, `yingchuan-${version}-macos-arm64.zip`,
      `yingchuan-${version}-ios-unsigned.ipa`, `yingchuan-${version}-ios-unsigned-app.zip`,
      "SHA256SUMS.txt", "BUILD_METADATA.json",
    ];
    if (!Array.isArray(release.assets) || release.assets.length !== names.length) throw new Error("release packages");
    const assets = new Map(), ids = new Set();
    for (const asset of release.assets) {
      const expected = `${repository}/releases/download/${release.tag_name}/${asset.name}`;
      if (!names.includes(asset.name) || assets.has(asset.name) || !Number.isSafeInteger(asset.id) || asset.id <= 0 ||
          ids.has(asset.id) || !Number.isSafeInteger(asset.size) || asset.size <= 0 || asset.size > 10 * 1024 ** 3 ||
          asset.state !== "uploaded" || !/^sha256:[a-f0-9]{64}$/.test(asset.digest) ||
          asset.browser_download_url !== expected) throw new Error("release package identity");
      ids.add(asset.id);
      assets.set(asset.name, expected);
    }
    const updates = [];
    for (const link of document.querySelectorAll("[data-release-asset]")) {
      const name = new URL(link.getAttribute("href")).pathname.split("/").pop()
        .replace(/^yingchuan-\d+\.\d+\.\d+-/, `yingchuan-${version}-`);
      if (!assets.has(name)) throw new Error("download mapping");
      updates.push([link, assets.get(name)]);
    }
    for (const [link, href] of updates) link.href = href;
    for (const link of document.querySelectorAll("[data-release-page]")) link.href = release.html_url;
    for (const label of document.querySelectorAll("[data-release-version]")) label.textContent = version;
    for (const label of document.querySelectorAll("[data-release-status]")) label.textContent = "已读取发布仓库的最新正式版";
  } catch {
    for (const label of document.querySelectorAll("[data-release-status]")) label.textContent = "未能获取最新发布，继续使用已核验的下载信息";
  } finally {
    clearTimeout(timeout);
  }
})();
