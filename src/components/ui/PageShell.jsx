import React from "react";
import { Helmet } from "react-helmet";
import Container from "react-bootstrap/Container";
import PageHeader from "./PageHeader";

export default function PageShell({
  title,
  subtitle,
  helmetTitle,
  children,
  containerClass = "",
  action,
  narrow = false,
  wide = false,
}) {
  const containerCls = [
    "py-5",
    narrow && "brisova-container--narrow",
    wide && "brisova-container--wide",
    containerClass,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="brisova-page">
      {helmetTitle && (
        <Helmet>
          <title>{helmetTitle}</title>
        </Helmet>
      )}
      <Container className={containerCls}>
        {(title || subtitle) && (
          <PageHeader title={title} subtitle={subtitle} action={action} />
        )}
        {children}
      </Container>
    </div>
  );
}
