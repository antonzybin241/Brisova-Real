import React, { useState } from "react";
import "./Header.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import logo from "../../assets/brisova-logo.png";
import { FaWallet } from "react-icons/fa";
import { AiOutlineMenu } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { Link, useLocation } from "react-router-dom";
import { useWalletReady } from "../../hooks/useWalletReady";
import { useWalletSession } from "../providers/WalletSessionProvider";
import { SUPPORTED_CHAINS, CHAIN_META } from "../../config/chains";
import { APP_NAME } from "../../config/constants";

export default function Header() {
  const location = useLocation();
  const walletReady = useWalletReady();
  const isHomeGated = location.pathname === "/" && !walletReady;
  const [show, setShow] = useState(false);
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { address } = useAccount();
  const { open } = useWeb3Modal();
  const { clearSignedOut } = useWalletSession();

  const openConnect = () => {
    clearSignedOut();
    open();
  };

  const handleClose = () => setShow(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/marketplace", label: "Marketplace" },
    { to: "/list-property", label: "List Asset" },
    { to: "/favorites", label: "Watchlist" },
    { to: "/dashboard", label: "Portfolio" },
    { to: "/investments", label: "Holdings" },
    { to: "/profile", label: "Profile" },
    { to: "/admin", label: "Admin" },
  ];

  const isActivePath = (to) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  return (
    <div className="main_header_here">
      <Navbar collapseOnSelect expand="lg" className="main_headre">
        <Container>
          <Navbar.Brand className="main_logo">
            <Link to="/" className="brisova-brand-mark">
              <img src={logo} alt={APP_NAME} />
              <span>
                {APP_NAME}
                <small>Institutional Marketplace</small>
              </span>
            </Link>
          </Navbar.Brand>

          <div className="in_resonsive">
            <button type="button" onClick={address ? () => open() : openConnect} className="wallet_button2">
              <FaWallet style={{ fontSize: "1.2rem" }} />
            </button>
            <span className="d-block d-lg-none" onClick={() => setShow(!show)}>
              {show ? <RxCross2 className="header-menu-toggle" /> : <AiOutlineMenu className="header-menu-toggle" />}
            </span>
          </div>

          <Navbar.Collapse id="responsive-navbar-nav" className={show ? "show" : ""}>
            <Nav className="me-auto">
              {!isHomeGated &&
                navLinks.map(({ to, label }) => {
                  const active = isActivePath(to);
                  return (
                    <Nav.Link
                      key={to}
                      onClick={handleClose}
                      className={`header_links${active ? " header_links--active" : ""}`}
                    >
                      <Link
                        to={to}
                        className="text-decoration-none header_links"
                        aria-current={active ? "page" : undefined}
                      >
                        {label}
                      </Link>
                    </Nav.Link>
                  );
                })}
            </Nav>
            <Nav>
              {!isHomeGated && (
              <select
                className="brisova-chain-select me-2"
                value={chain?.id ?? ""}
                onChange={(e) => switchNetwork?.(Number(e.target.value))}
                aria-label="Select network"
              >
                {SUPPORTED_CHAINS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {CHAIN_META[c.id]?.name ?? c.name}
                  </option>
                ))}
              </select>
              )}
              <button type="button" onClick={address ? () => open() : openConnect} className="wallet_button">
                {address
                  ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
                  : "Connect Wallet"}
                {!address && <FaWallet />}
              </button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}
