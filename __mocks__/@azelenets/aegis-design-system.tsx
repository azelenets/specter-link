import React from 'react';

export const Button = ({ children, onClick, disabled, ...rest }: any) => (
  <button type="button" onClick={onClick} disabled={disabled}>{children}</button>
);

export const Input = ({ label, error, ...rest }: any) => {
  const id = label
    ? `input-${String(label).toLowerCase().replace(/\s+/g, '-')}`
    : undefined;
  return (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} {...rest} />
      {error && <span role="alert">{error}</span>}
    </div>
  );
};

export const Spinner = () => <span data-testid="spinner" />;

export const Alert = ({ children, variant }: any) => (
  <div role="alert" data-variant={variant}>{children}</div>
);

export const Modal = ({ open, children }: any) =>
  open ? <div role="dialog">{children}</div> : null;

export const ModalHeader = ({ title, onClose }: any) => (
  <div>
    <h2>{title}</h2>
    <button type="button" onClick={onClose} aria-label="Close dialog" />
  </div>
);

export const ModalBody = ({ children }: any) => <div>{children}</div>;

export const ModalFooter = ({ children }: any) => <div>{children}</div>;
