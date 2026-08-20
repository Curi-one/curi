import React, { useId } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function Field({ label, value, onChange, placeholder = "", type = "text" }) {
  const id = useId();
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete="off" />
    </div>
  );
}

export default Field;
