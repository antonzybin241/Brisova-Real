function walkShadow(root, visit) {
  if (!root) return;
  root.querySelectorAll("*").forEach((node) => {
    visit(node);
    if (node.shadowRoot) walkShadow(node.shadowRoot, visit);
  });
}

function walletName(node) {
  return String(node.name || node.getAttribute("name") || "").trim().toLowerCase();
}

export function markInstalledWalletsInModal(wallets, onConnectInstalled) {
  const modal = document.querySelector("w3m-modal");
  if (!modal?.shadowRoot || !wallets.length) return;

  const names = new Set(wallets.map((wallet) => wallet.name.toLowerCase()));
  const seen = new Set();

  walkShadow(modal.shadowRoot, (node) => {
    if (node.tagName !== "WUI-LIST-WALLET") return;

    const normalized = walletName(node);
    const baseName = normalized.replace(/\s*·\s*installed$/, "").trim();

    if (normalized === "browser wallet") {
      node.style.display = "none";
      return;
    }

    if (!names.has(normalized) && !names.has(baseName)) return;

    if (seen.has(baseName)) {
      node.style.display = "none";
      return;
    }

    seen.add(baseName);
    node.style.display = "";
    node.name = wallets.find((wallet) => wallet.name.toLowerCase() === baseName)?.name || node.name;
    node.installed = true;
    node.tagLabel = "Installed";
    node.tagVariant = "success";

    if (node.dataset.brisovaBind === "1") return;
    node.dataset.brisovaBind = "1";
    node.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        const wallet = wallets.find((item) => item.name.toLowerCase() === baseName);
        if (wallet) onConnectInstalled(wallet);
      },
      true
    );
  });
}
